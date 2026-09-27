import * as XLSX from 'xlsx';
import {
  levelsApi,
  missionsApi,
  questionsApi,
  goldenLevelsApi,
  finalLevelsApi,
  Level,
  Mission,
  Question,
  AnswerOption,
  MissionItem,
  GoldenLevelItem,
  GoldenLevelQuestion,
  GoldenLevelAnswerOption,
  FinalLevelQuestion,
  FinalLevelAnswerOption,
} from './api';

export interface ExportProgress {
  stage: string;
  current: number;
  total: number;
  percentage: number;
}

interface ExportData {
  normalLevelsContent: any[];
  normalLevelsQuestions: any[];
  goldenContent: any[];
  goldenQuestions: any[];
  finalLevelQuestions: any[];
}

class ExportService {
  /**
   * Exporta todo el contenido de un mundo a un archivo Excel
   */
  async exportWorldContent(
    worldId: string,
    worldName: string,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      // Paso 1: Obtener todos los niveles del mundo
      this.reportProgress(onProgress, 'Obteniendo información del mundo...', 0, 100, 5);

      const levelsResponse = await levelsApi.getByWorld(worldId);
      const levels = levelsResponse.data;

      // Separar niveles por tipo
      const normalLevels = levels.filter(l => l.levelType === 'normal' && !l.isGolden);
      const goldenLevel = levels.find(l => l.isGolden);
      const finalLevel = levels.find(l => l.levelType === 'final');

      // Preparar datos de exportación
      const exportData: ExportData = {
        normalLevelsContent: [],
        normalLevelsQuestions: [],
        goldenContent: [],
        goldenQuestions: [],
        finalLevelQuestions: [],
      };

      // Paso 2: Procesar niveles normales
      const totalStages = (normalLevels.length > 0 ? 1 : 0) +
                         (goldenLevel ? 1 : 0) +
                         (finalLevel ? 1 : 0);
      let completedStages = 0;

      if (normalLevels.length > 0) {
        this.reportProgress(
          onProgress,
          `Procesando ${normalLevels.length} niveles normales...`,
          completedStages,
          totalStages,
          15 + (completedStages / totalStages) * 70
        );

        for (const level of normalLevels) {
          await this.processNormalLevel(level, worldName, exportData, onProgress);
        }
        completedStages++;
      }

      // Paso 3: Procesar nivel dorado
      if (goldenLevel) {
        this.reportProgress(
          onProgress,
          'Procesando nivel dorado...',
          completedStages,
          totalStages,
          15 + (completedStages / totalStages) * 70
        );

        await this.processGoldenLevel(goldenLevel, worldName, exportData, onProgress);
        completedStages++;
      }

      // Paso 4: Procesar nivel final
      if (finalLevel) {
        this.reportProgress(
          onProgress,
          'Procesando nivel final...',
          completedStages,
          totalStages,
          15 + (completedStages / totalStages) * 70
        );

        await this.processFinalLevel(finalLevel, worldName, exportData, onProgress);
        completedStages++;
      }

      // Paso 5: Crear workbook con todas las hojas (con encabezados aunque estén vacías)
      this.reportProgress(onProgress, 'Creando archivo Excel...', totalStages, totalStages, 90);

      const wb = XLSX.utils.book_new();

      // Hoja: Niveles Normales - Contenidos
      const normalContentData = exportData.normalLevelsContent.length > 0
        ? exportData.normalLevelsContent
        : [{
            Mundo: '',
            Nivel: '',
            Misión: '',
            'Familia de producto': '',
            '¿Producto agrupado?': '',
            'Variantes / presentaciones': '',
            Titular: '',
            'Imagen del item (URL)': '',
            Beneficios: '',
            'Contenido (separador por ;)': '',
            Detalle: '',
          }];
      const wsContent = XLSX.utils.json_to_sheet(normalContentData);
      XLSX.utils.book_append_sheet(wb, wsContent, 'Niveles Normales - Contenidos');

      // Hoja: Niveles Normales - Preguntas
      const normalQuestionsData = exportData.normalLevelsQuestions.length > 0
        ? exportData.normalLevelsQuestions
        : [{
            Mundo: '',
            Nivel: '',
            Misión: '',
            Pregunta: '',
            'Opción A - Texto': '',
            'Opción A - Imagen URL': '',
            'Opción B - Texto': '',
            'Opción B - Imagen URL': '',
            'Opción C - Texto': '',
            'Opción C - Imagen URL': '',
            'Opción D - Texto': '',
            'Opción D - Imagen URL': '',
            'Opción E - Texto': '',
            'Opción E - Imagen URL': '',
            'Respuesta correcta': '',
            'Beneficio clave': '',
          }];
      const wsQuestions = XLSX.utils.json_to_sheet(normalQuestionsData);
      XLSX.utils.book_append_sheet(wb, wsQuestions, 'Niveles Normales - Preguntas');

      // Hoja: Nivel Dorado - Contenidos
      const goldenContentData = exportData.goldenContent.length > 0
        ? exportData.goldenContent
        : [{
            Mundo: '',
            Titulo: '',
            Detalle: '',
          }];
      const wsGoldenContent = XLSX.utils.json_to_sheet(goldenContentData);
      XLSX.utils.book_append_sheet(wb, wsGoldenContent, 'Nivel Dorado - Contenidos');

      // Hoja: Nivel Dorado - Preguntas
      const goldenQuestionsData = exportData.goldenQuestions.length > 0
        ? exportData.goldenQuestions
        : [{
            Mundo: '',
            Pregunta: '',
            'Opción A': '',
            'Opción B': '',
            'Opción C': '',
            'Opción D': '',
            'Respuesta Correcta': '',
          }];
      const wsGoldenQuestions = XLSX.utils.json_to_sheet(goldenQuestionsData);
      XLSX.utils.book_append_sheet(wb, wsGoldenQuestions, 'Nivel Dorado - Preguntas');

      // Hoja: Nivel Final
      const finalLevelData = exportData.finalLevelQuestions.length > 0
        ? exportData.finalLevelQuestions
        : [{
            Mundo: '',
            Titulo: '',
            'Contenido de la Pregunta': '',
            'URL Video Inicio': '',
            'URL Video Fin': '',
            'Mensaje para Respuesta Correcta': '',
            'Mensaje para Respuesta Incorrecta': '',
            'Opción A': '',
            'Opción B': '',
            'Opción C': '',
            'Opción D': '',
            'Respuesta Correcta': '',
          }];
      const wsFinal = XLSX.utils.json_to_sheet(finalLevelData);
      XLSX.utils.book_append_sheet(wb, wsFinal, 'Nivel Final');

      // Paso 6: Descargar archivo
      this.reportProgress(onProgress, 'Descargando archivo...', totalStages, totalStages, 95);

      const fileName = `${worldName.replace(/[^a-zA-Z0-9]/g, '_')}_contenido_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      this.reportProgress(onProgress, '✅ Exportación completada exitosamente', totalStages, totalStages, 100);
    } catch (error) {
      console.error('Error exportando contenido del mundo:', error);
      throw new Error('Error al exportar contenido del mundo');
    }
  }

  /**
   * Reporta el progreso actual
   */
  private reportProgress(
    onProgress: ((progress: ExportProgress) => void) | undefined,
    stage: string,
    current: number,
    total: number,
    percentage: number
  ): void {
    if (onProgress) {
      onProgress({
        stage,
        current,
        total,
        percentage: Math.min(Math.round(percentage), 100),
      });
    }
  }

  /**
   * Procesa los niveles normales (contenidos y preguntas)
   */
  private async processNormalLevel(
    level: Level,
    worldName: string,
    exportData: ExportData,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      // Obtener misiones del nivel
      const missionsResponse = await missionsApi.getByLevel(level.id);
      const missions = missionsResponse.data;

      for (const mission of missions) {
        // Procesar contenidos
        const itemsResponse = await missionsApi.getItems(mission.id);
        const items = itemsResponse.data;

        for (const item of items) {
          exportData.normalLevelsContent.push({
            Mundo: worldName,
            Nivel: level.name,
            Misión: mission.name,
            'Familia de producto': item.family || '',
            '¿Producto agrupado?': item.isGrouped ? 'Sí' : 'No',
            'Variantes / presentaciones': item.variantBadges
              ? item.variantBadges.join('|')
              : '',
            Titular: item.title,
            'Imagen del item (URL)': '',
            Beneficios: item.benefits || '',
            'Contenido (separador por ;)': item.contentBadges
              ? item.contentBadges.join(';')
              : '',
            Detalle: item.detail || '',
          });
        }

        // Procesar preguntas
        const questionsResponse = await questionsApi.getByMissionAdmin(mission.id);
        const questions = questionsResponse.data;

        for (const question of questions) {
          const options = question.options || [];
          
          const rowData: any = {
            Mundo: worldName,
            Nivel: level.name,
            Misión: mission.name,
            Pregunta: question.content,
          };

          const optionLetters = ['A', 'B', 'C', 'D', 'E'];
          for (let i = 0; i < Math.max(options.length, 3); i++) {
            const letter = optionLetters[i] || String.fromCharCode(65 + i);
            const option = options[i];
            
            rowData[`Opción ${letter} - Texto`] = option?.text || '';
            rowData[`Opción ${letter} - Imagen URL`] = '';
          }

          const correctOptionIndex = options.findIndex(o => o.isCorrect);
          const correctLetter = correctOptionIndex >= 0 ? optionLetters[correctOptionIndex] : '';
          rowData['Respuesta correcta'] = correctLetter;
          rowData['Beneficio clave'] = question.benefit || '';

          exportData.normalLevelsQuestions.push(rowData);
        }
      }

      this.reportProgress(
        onProgress,
        `Nivel normal "${level.name}" procesado ✓`,
        0,
        1,
        0
      );
    } catch (error) {
      console.error(`Error procesando nivel normal ${level.name}:`, error);
    }
  }

  /**
   * Procesa el nivel dorado
   */
  private async processGoldenLevel(
    level: Level,
    worldName: string,
    exportData: ExportData,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      // Obtener items del nivel dorado
      const itemsResponse = await goldenLevelsApi.getItems(level.id);
      const items = itemsResponse.data;

      for (const item of items) {
        exportData.goldenContent.push({
          Mundo: worldName,
          Titulo: item.title,
          Detalle: item.detail || '',
        });
      }

      // Obtener preguntas del nivel dorado
      const questionsResponse = await goldenLevelsApi.getQuestions(level.id);
      const questions = questionsResponse.data;

      for (const question of questions) {
        // Obtener opciones de respuesta
        const answersResponse = await goldenLevelsApi.getAnswers(question.id);
        const answers = answersResponse.data;
        const correctAnswerIndex = answers.findIndex(a => a.isCorrect);
        const optionLetters = ['A', 'B', 'C', 'D'];
        const correctLetter = correctAnswerIndex >= 0 ? optionLetters[correctAnswerIndex] : '';

        exportData.goldenQuestions.push({
          Mundo: worldName,
          Pregunta: question.content,
          'Opción A': answers[0]?.text || '',
          'Opción B': answers[1]?.text || '',
          'Opción C': answers[2]?.text || '',
          'Opción D': answers[3]?.text || '',
          'Respuesta Correcta': correctLetter,
        });
      }

      this.reportProgress(
        onProgress,
        `Nivel dorado procesado ✓`,
        0,
        1,
        0
      );
    } catch (error) {
      console.error(`Error procesando nivel dorado ${level.name}:`, error);
    }
  }

  /**
   * Procesa el nivel final
   */
  private async processFinalLevel(
    level: Level,
    worldName: string,
    exportData: ExportData,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      // Obtener preguntas del nivel final
      const questionsResponse = await finalLevelsApi.getQuestions(level.id);
      const questions = questionsResponse.data;

      for (const question of questions) {
        // Obtener opciones de respuesta
        const answersResponse = await finalLevelsApi.getAnswers(question.id);
        const answers = answersResponse.data;
        const correctAnswerIndex = answers.findIndex(a => a.isCorrect);
        const optionLetters = ['A', 'B', 'C', 'D'];
        const correctLetter = correctAnswerIndex >= 0 ? optionLetters[correctAnswerIndex] : '';

        exportData.finalLevelQuestions.push({
          Mundo: worldName,
          Titulo: question.content,
          'Contenido de la Pregunta': question.content,
          'URL Video Inicio': question.startVideoUrl || '',
          'URL Video Fin': question.endVideoUrl || '',
          'Mensaje para Respuesta Correcta': question.correctMessage || '',
          'Mensaje para Respuesta Incorrecta': question.incorrectMessage || '',
          'Opción A': answers[0]?.text || '',
          'Opción B': answers[1]?.text || '',
          'Opción C': answers[2]?.text || '',
          'Opción D': answers[3]?.text || '',
          'Respuesta Correcta': correctLetter,
        });
      }

      this.reportProgress(
        onProgress,
        `Nivel final procesado ✓`,
        0,
        1,
        0
      );
    } catch (error) {
      console.error(`Error procesando nivel final ${level.name}:`, error);
    }
  }
}

export const exportService = new ExportService();
