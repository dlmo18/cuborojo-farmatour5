'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { MdClose, MdCheckCircle, MdErrorOutline, MdWarning } from 'react-icons/md';
import { 
  questionsApi, 
  mediaApi, 
  missionsApi,
  levelsApi,
  CreateQuestionDto, 
  CreateAnswerOptionDto,
  Question,
  Mission,
  Level
} from '@/app/services/api';

interface ImportProgress {
  stage: string;
  current: number;
  total: number;
  percentage: number;
}

interface ImportResult {
  success: boolean;
  message: string;
  details?: {
    questionsCreated: number;
    questionsUpdated: number;
    optionsCreated: number;
    optionsUpdated: number;
    imagesUploaded: number;
    skipped: number;
    errors: string[];
  };
}

interface QuestionsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  levelId: string;
  onImportComplete?: () => void;
}

export default function QuestionsImportModal({ 
  isOpen, 
  onClose, 
  missionId: defaultMissionId, 
  levelId, 
  onImportComplete 
}: QuestionsImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [skipImages, setSkipImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
    } else {
      alert('Por favor selecciona un archivo .xlsx válido');
    }
  };

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Buscar la hoja "Niveles Normales - Preguntas"
          const sheetName = workbook.SheetNames.find(name =>
            name.toLowerCase().includes('preguntas')
          );

          if (!sheetName) {
            reject(new Error('No se encontró la hoja con "Preguntas"'));
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet);
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const getMimeType = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop() || '';
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    return mimeTypes[ext] || 'image/jpeg';
  };

  const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    
    if (trimmed === 'sin imagen' || trimmed === 'no' || trimmed === 'n/a' || trimmed === 'na' || trimmed === '-') return false;
    if (trimmed.includes('sin imagen') || trimmed === '') return false;
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const downloadImageAndUpload = async (imageUrl: string): Promise<string | null> => {
    try {
      if (!imageUrl || !isValidImageUrl(imageUrl)) return null;

      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const filename = imageUrl.split('/').pop() || 'image.jpg';
      
      const mimeType = blob.type || getMimeType(filename);
      const file = new File([blob], filename, { type: mimeType });

      const uploadRes = await mediaApi.upload(file);
      return uploadRes.data.id;
    } catch (error) {
      console.error('Error descargando/subiendo imagen:', error);
      return null;
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setImporting(true);
    setProgress({ stage: 'Inicializando...', current: 0, total: 0, percentage: 0 });
    setResult(null);

    try {
      // PASO 1: Parsear Excel
      setProgress({ stage: '📂 Leyendo archivo Excel...', current: 0, total: 100, percentage: 5 });
      const rows = await parseExcel(file);

      if (rows.length === 0) {
        throw new Error('El archivo no contiene datos');
      }

      setProgress({ stage: `✅ Se encontraron ${rows.length} preguntas\n📋 Inicializando caché...`, current: 0, total: rows.length, percentage: 10 });

      // PASO 2: Obtener el worldId desde el levelId
      const currentLevelRes = await levelsApi.getById(levelId);
      const currentLevel = currentLevelRes.data;
      const worldId = currentLevel.worldId;

      // PASO 3: Cargar todos los niveles disponibles del mundo
      const allLevels = await levelsApi.getByWorld(worldId);
      const levelMap = new Map((allLevels.data || []).map((l: Level) => [l.name.toLowerCase(), l]));

      // PASO 4: Crear caché de misiones
      const missionCache: { [key: string]: { [key: string]: string } } = {}; // levelName -> missionName -> missionId
      for (const level of allLevels.data || []) {
        const missionsRes = await missionsApi.getByLevel(level.id);
        missionCache[level.name.toLowerCase()] = {};
        for (const mission of missionsRes.data || []) {
          missionCache[level.name.toLowerCase()][mission.name.toLowerCase()] = mission.id;
        }
      }

      // PASO 5: Procesar cada fila
      let questionsCreated = 0;
      let questionsUpdated = 0;
      let optionsCreated = 0;
      let optionsUpdated = 0;
      let imagesUploaded = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 1;
        const progressPercentage = 15 + (i / rows.length) * 80;

        try {
          // Leer datos de la fila
          const nivelName = (row['Nivel'] || '').trim();
          const misionName = (row['Misión'] || '').trim();
          const preguntaContent = (row['Pregunta'] || '').trim();

          setProgress({
            stage: `Procesando pregunta ${rowNum}/${rows.length}`,
            current: i,
            total: rows.length,
            percentage: progressPercentage
          });

          // Validar que la pregunta tenga contenido
          if (!preguntaContent) {
            skipped++;
            errors.push(`Fila ${rowNum}: Pregunta vacía`);
            continue;
          }

          // VALIDAR NIVEL
          if (!nivelName) {
            skipped++;
            errors.push(`Fila ${rowNum}: Nombre de nivel vacío`);
            continue;
          }

          const level = Array.from(allLevels.data || []).find(l => 
            l.name.toLowerCase() === nivelName.toLowerCase()
          );

          if (!level) {
            skipped++;
            errors.push(`Fila ${rowNum}: Nivel "${nivelName}" no encontrado`);
            continue;
          }

          // VALIDAR MISIÓN
          if (!misionName) {
            skipped++;
            errors.push(`Fila ${rowNum}: Nombre de misión vacío`);
            continue;
          }

          const levelMissions = missionCache[level.name.toLowerCase()] || {};
          const missionId = levelMissions[misionName.toLowerCase()];

          if (!missionId) {
            skipped++;
            errors.push(`Fila ${rowNum}: Misión "${misionName}" no encontrada en nivel "${nivelName}"`);
            continue;
          }

          // Obtener benefit
          const benefit = row['Beneficio clave'] || '';

          // BUSCAR o CREAR PREGUNTA
          let question: Question | null = null;
          const existingQuestions = await questionsApi.getByMissionAdmin(missionId);
          question = (existingQuestions.data || []).find((q: Question) =>
            q.content.toLowerCase() === preguntaContent.toLowerCase()
          );

          if (!question) {
            // Crear nueva pregunta
            const createQuestionDto: CreateQuestionDto = {
              missionId,
              content: preguntaContent,
              orderNum: i + 1,
              starsValue: 10,
              benefit: benefit || undefined,
            };

            const res = await questionsApi.create(createQuestionDto);
            question = res.data;
            questionsCreated++;
          } else {
            // Actualizar pregunta existente (incluyendo benefit si cambió)
            if (question.benefit !== benefit) {
              await questionsApi.update(question.id, {
                benefit: benefit || undefined,
              });
              questionsUpdated++;
            }
          }

          // PROCESAR OPCIONES (A, B, C)
          const options = [
            { letter: 'A', textKey: 'Opción A - Texto', imageKey: 'Opción A - Imagen URL' },
            { letter: 'B', textKey: 'Opción B - Texto', imageKey: 'Opción B - Imagen URL' },
            { letter: 'C', textKey: 'Opción C - Texto', imageKey: 'Opción C - Imagen URL' },
          ];

          const correctAnswer = (row['Respuesta correcta'] || '').toUpperCase().trim();

          for (const opt of options) {
            const optionText = (row[opt.textKey] || '').trim();
            const imageUrl = row[opt.imageKey] || '';

            if (!optionText) continue;

            // Descargar imagen si existe y no se salta
            let imageId: string | undefined = undefined;
            if (!skipImages && imageUrl && isValidImageUrl(imageUrl)) {
              const uploadedId = await downloadImageAndUpload(imageUrl);
              if (uploadedId) {
                imageId = uploadedId;
                imagesUploaded++;
              }
            }

            const isCorrect = correctAnswer === opt.letter;

            // Buscar opción existente
            let existingOption = (question.options || []).find((qo: any) =>
              qo.text.toLowerCase() === optionText.toLowerCase()
            );

            if (!existingOption) {
              const createOptionDto: CreateAnswerOptionDto = {
                text: optionText,
                imageId,
                isCorrect,
                orderNum: options.indexOf(opt) + 1,
              };

              await questionsApi.createOption(question.id, createOptionDto);
              optionsCreated++;
            } else {
              await questionsApi.updateOption(existingOption.id, {
                text: optionText,
                imageId,
                isCorrect,
                orderNum: options.indexOf(opt) + 1,
              });
              optionsUpdated++;
            }
          }
        } catch (error: any) {
          errors.push(`Fila ${rowNum}: ${error.response?.data?.message || error.message}`);
        }
      }

      setProgress({
        stage: '✅ Importación completada',
        current: rows.length,
        total: rows.length,
        percentage: 100
      });

      setResult({
        success: true,
        message: 'Importación completada exitosamente',
        details: {
          questionsCreated,
          questionsUpdated,
          optionsCreated,
          optionsUpdated,
          imagesUploaded,
          skipped,
          errors,
        },
      });

      setTimeout(() => {
        onImportComplete?.();
      }, 2000);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Error durante la importación',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setProgress(null);
    setResult(null);
    setSkipImages(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!importing) {
      handleReset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-black font-bold">Importador de Preguntas</h2>
          <button
            onClick={handleClose}
            disabled={importing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* PANTALLA 1: Selección de archivo */}
        {!progress && !result && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Instrucciones de importación</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>El archivo debe tener una hoja con "Preguntas" en el nombre</li>
                <li>Las columnas esperadas son: Mundo, Nivel, Misión, Pregunta, Opción A/B/C - Texto, Opción A/B/C - Imagen URL, Respuesta correcta, Beneficio clave</li>
                <li>Se validarán Nivel y Misión contra los datos existentes</li>
                <li>Las imágenes se descargarán y subirán automáticamente (puede saltarse)</li>
                <li>Si una pregunta existe, se actualizará (incluyendo la misión asignada)</li>
              </ul>
            </div>

            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-gray-600">
                {file ? (
                  <div>
                    <p className="font-semibold text-green-600">✓ {file.name}</p>
                    <p className="text-sm mt-2">Clic para cambiar archivo</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold mb-2">Arrastra un archivo XLSX aquí</p>
                    <p className="text-sm">o haz clic para seleccionar</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipImages}
                  onChange={(e) => setSkipImages(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-yellow-900">
                  Saltar importación de imágenes
                  <span className="block text-xs text-yellow-800 font-normal mt-1">
                    Útil cuando solo hay cambios de información y las imágenes ya están cargadas
                  </span>
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!file}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA 2: Progreso */}
        {progress && !result && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-4">{progress.stage}</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                {progress.current} / {progress.total} ({Math.round(progress.percentage)}%)
              </p>
            </div>
          </div>
        )}

        {/* PANTALLA 3: Resultado */}
        {result && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 flex items-start gap-3 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex-shrink-0 mt-0.5">
                {result.success ? (
                  <div className="text-green-600">
                    <MdCheckCircle size={24} />
                  </div>
                ) : (
                  <div className="text-red-600">
                    <MdErrorOutline size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.message}
                </p>
                {result.details && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p><span className="font-medium">Preguntas creadas:</span> {result.details.questionsCreated}</p>
                    <p><span className="font-medium">Preguntas actualizadas:</span> {result.details.questionsUpdated}</p>
                    <p><span className="font-medium">Opciones creadas:</span> {result.details.optionsCreated}</p>
                    <p><span className="font-medium">Opciones actualizadas:</span> {result.details.optionsUpdated}</p>
                    <p><span className="font-medium">Imágenes subidas:</span> {result.details.imagesUploaded}</p>
                    <p><span className="font-medium">Filas omitidas:</span> {result.details.skipped}</p>

                    {result.details.errors.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="font-semibold flex items-center gap-2 text-yellow-700 mb-2">
                          <MdWarning size={18} />
                          Problemas detectados:
                        </p>
                        <div className="bg-white border border-yellow-200 rounded p-2 max-h-40 overflow-y-auto">
                          <ul className="space-y-1 text-xs text-gray-600">
                            {result.details.errors.map((error, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-yellow-600 flex-shrink-0">⚠️</span>
                                <span>{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Importar otro archivo
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
