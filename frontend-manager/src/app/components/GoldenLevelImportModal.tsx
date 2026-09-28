'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { MdClose, MdCheckCircle, MdErrorOutline } from 'react-icons/md';
import { 
  goldenLevelsApi,
  CreateGoldenLevelItemDto,
  CreateGoldenLevelQuestionDto,
  CreateGoldenLevelAnswerOptionDto
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
    itemsCreated: number;
    questionsCreated: number;
    answersCreated: number;
    errors: string[];
  };
}

interface GoldenLevelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelId: string;
  onSuccess: () => void;
}

export default function GoldenLevelImportModal({ isOpen, onClose, levelId, onSuccess }: GoldenLevelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
    } else {
      alert('Por favor selecciona un archivo .xlsx válido');
    }
  };

  const parseExcel = (file: File, sheetName: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook.SheetNames.includes(sheetName)) {
            reject(new Error(`No se encontró la hoja "${sheetName}"`));
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

  const handleImport = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setImporting(true);
    setProgress({ stage: 'Inicializando...', current: 0, total: 0, percentage: 0 });
    setResult(null);

    try {
      let itemsCreated = 0;
      let questionsCreated = 0;
      let answersCreated = 0;
      const errors: string[] = [];

      // ============================================================
      // IMPORTAR CONTENIDOS
      // ============================================================
      try {
        setProgress({ stage: '📂 Leyendo hoja de Contenidos...', current: 0, total: 100, percentage: 10 });
        const contentRows = await parseExcel(file, 'Nivel Dorado - Contenidos');

        setProgress({ stage: `✅ Se encontraron ${contentRows.length} contenidos\n📋 Importando...`, current: 0, total: contentRows.length, percentage: 20 });

        for (let i = 0; i < contentRows.length; i++) {
          const row = contentRows[i];
          const rowNum = i + 1;
          const progressPercentage = 20 + (i / (contentRows.length + 1) * 30);

          try {
            const titulo = (row['Titulo'] || '').trim();
            const detalle = (row['Detalle'] || '').trim();

            setProgress({
              stage: `Importando contenido ${rowNum}/${contentRows.length}`,
              current: i,
              total: contentRows.length,
              percentage: progressPercentage
            });

            if (!titulo) {
              errors.push(`Contenido Fila ${rowNum}: Título vacío`);
              continue;
            }

            const createItemDto: CreateGoldenLevelItemDto = {
              levelId,
              title: titulo,
              detail: detalle || undefined,
              orderNum: itemsCreated + 1,
            };

            await goldenLevelsApi.createItem(createItemDto);
            itemsCreated++;
          } catch (err: any) {
            errors.push(`Contenido Fila ${rowNum}: ${err.message}`);
          }
        }
      } catch (err: any) {
        errors.push(`No se pudo leer la hoja de Contenidos: ${err.message}`);
      }

      // ============================================================
      // IMPORTAR PREGUNTAS
      // ============================================================
      try {
        setProgress({ stage: '📂 Leyendo hoja de Preguntas...', current: 0, total: 100, percentage: 55 });
        const questionRows = await parseExcel(file, 'Nivel Dorado - Preguntas');

        setProgress({ stage: `✅ Se encontraron ${questionRows.length} preguntas\n📋 Importando...`, current: 0, total: questionRows.length, percentage: 60 });

        for (let i = 0; i < questionRows.length; i++) {
          const row = questionRows[i];
          const rowNum = i + 1;
          const progressPercentage = 60 + (i / (questionRows.length + 1) * 35);

          try {
            const pregunta = (row['Pregunta'] || '').trim();
            const opcionA = (row['Opción A'] || '').trim();
            const opcionB = (row['Opción B'] || '').trim();
            const opcionC = (row['Opción C'] || '').trim();
            const opcionD = (row['Opción D'] || '').trim();
            const respuestaCorrecta = (row['Respuesta Correcta'] || '').trim().toUpperCase();

            setProgress({
              stage: `Importando pregunta ${rowNum}/${questionRows.length}`,
              current: i,
              total: questionRows.length,
              percentage: progressPercentage
            });

            if (!pregunta) {
              errors.push(`Pregunta Fila ${rowNum}: Pregunta vacía`);
              continue;
            }

            const opciones = [
              { letra: 'A', texto: opcionA },
              { letra: 'B', texto: opcionB },
              { letra: 'C', texto: opcionC },
              { letra: 'D', texto: opcionD },
            ];

            const opcionesValidas = opciones.filter(o => o.texto);

            if (opcionesValidas.length < 2) {
              errors.push(`Pregunta Fila ${rowNum}: Se requieren al menos 2 opciones`);
              continue;
            }

            if (!['A', 'B', 'C', 'D'].includes(respuestaCorrecta)) {
              errors.push(`Pregunta Fila ${rowNum}: Respuesta correcta debe ser A, B, C o D`);
              continue;
            }

            // Crear pregunta
            const createQuestionDto: CreateGoldenLevelQuestionDto = {
              levelId,
              content: pregunta,
              orderNum: questionsCreated + 1,
            };

            const questionRes = await goldenLevelsApi.createQuestion(createQuestionDto);
            questionsCreated++;

            // Crear opciones de respuesta
            for (let j = 0; j < opcionesValidas.length; j++) {
              const opcion = opcionesValidas[j];
              const isCorrect = opcion.letra === respuestaCorrecta;

              const createAnswerDto: CreateGoldenLevelAnswerOptionDto = {
                questionId: questionRes.data.id,
                text: opcion.texto,
                isCorrect,
                orderNum: j + 1,
              };

              await goldenLevelsApi.createAnswer(createAnswerDto);
              answersCreated++;
            }
          } catch (err: any) {
            errors.push(`Pregunta Fila ${rowNum}: ${err.message}`);
          }
        }
      } catch (err: any) {
        errors.push(`No se pudo leer la hoja de Preguntas: ${err.message}`);
      }

      // ============================================================
      // RESULTADO FINAL
      // ============================================================
      setProgress({ stage: '✅ Importación completada', current: 100, total: 100, percentage: 100 });
      
      const success = errors.length === 0;
      setResult({
        success,
        message: success ? '✅ Importación exitosa' : '⚠️ Importación completada con errores',
        details: {
          itemsCreated,
          questionsCreated,
          answersCreated,
          errors,
        },
      });

      if (success) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error importing:', err);
      setResult({
        success: false,
        message: '❌ Error durante la importación',
        details: {
          itemsCreated: 0,
          questionsCreated: 0,
          answersCreated: 0,
          errors: [err.message],
        },
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setProgress(null);
    setResult(null);
    setImporting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-6 border-b border-surface-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Importar Nivel Dorado</h2>
          <button
            onClick={handleClose}
            className="text-surface-600 hover:text-surface-900"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="p-6">
          {!importing && !result && (
            <>
              <p className="text-sm text-surface-600 mb-4">
                Selecciona un archivo Excel (.xlsx) con dos pestañas:
              </p>
              <ul className="text-sm text-surface-600 mb-4 list-disc list-inside space-y-1">
                <li><strong>Nivel Dorado - Contenidos:</strong> Titulo, Detalle</li>
                <li><strong>Nivel Dorado - Preguntas:</strong> Pregunta, Opción A-D, Respuesta Correcta</li>
              </ul>

              <div className="border-2 border-dashed border-surface-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {file ? file.name : 'Selecciona un archivo'}
                </button>
              </div>

              <button
                onClick={handleImport}
                disabled={!file}
                className={`w-full mt-6 py-2 rounded-lg font-semibold transition-colors ${
                  file
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-surface-200 text-surface-500 cursor-not-allowed'
                }`}
              >
                Importar
              </button>
            </>
          )}

          {importing && progress && (
            <div>
              <div className="mb-4">
                <div className="text-sm font-semibold text-surface-700 mb-2 whitespace-pre-wrap">
                  {progress.stage}
                </div>
                <div className="w-full bg-surface-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary-600 h-full transition-all duration-300"
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-surface-600 mt-2">
                  {progress.current} de {progress.total}
                </div>
              </div>
            </div>
          )}

          {result && (
            <div>
              <div className={`mb-4 flex items-center gap-2 ${result.success ? 'bg-green-100 p-2 rounded-lg' : 'bg-red-100 p-2 rounded-lg'}`}>
                {result.success ? (
                  <MdCheckCircle size={24} />
                ) : (
                  <MdErrorOutline size={24} />
                )}
                <span className={`font-semibold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.message}
                </span>
              </div>

              {result.details && (
                <div className="space-y-2 text-sm text-surface-600 mb-4">
                  <p>✅ Contenidos creados: <span className="font-semibold">{result.details.itemsCreated}</span></p>
                  <p>✅ Preguntas creadas: <span className="font-semibold">{result.details.questionsCreated}</span></p>
                  <p>✅ Opciones creadas: <span className="font-semibold">{result.details.answersCreated}</span></p>

                  {result.details.errors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-surface-200">
                      <p className="font-semibold text-accent-700 mb-2">Errores:</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {result.details.errors.map((error, idx) => (
                          <div key={idx} className="text-xs text-accent-600 bg-accent-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full mt-4 py-2 bg-surface-200 hover:bg-surface-300 text-surface-800 rounded-lg font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
