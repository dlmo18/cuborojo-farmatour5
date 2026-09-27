'use client';

import { MdCheckCircle, MdErrorOutline, MdWarning, MdClose } from 'react-icons/md';

export interface ProgressState {
  stage: string;
  current: number;
  total: number;
  percentage: number;
}

export interface ProgressResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

interface ProgressModalProps {
  isOpen: boolean;
  progress: ProgressState | null;
  result: ProgressResult | null;
  onClose: () => void;
  title?: string;
}

export default function ProgressModal({
  isOpen,
  progress,
  result,
  onClose,
  title = 'Procesando...',
}: ProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-xl">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-secondary-800">{title}</h2>
          {result && (
            <button
              onClick={onClose}
              className="text-surface-400 hover:text-surface-600"
            >
              <MdClose size={24} />
            </button>
          )}
        </div>

        {/* Contenido del progreso */}
        {progress && !result ? (
          <div className="space-y-4">
            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-surface-600">
                <span>{progress.current} / {progress.total}</span>
                <span>{Math.round(progress.percentage)}%</span>
              </div>
              <div className="w-full bg-surface-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            {/* Etapa actual */}
            <div className="bg-surface-50 rounded-lg p-4 min-h-20 flex items-center">
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-300 border-t-primary-600"></div>
                  </div>
                </div>
                <p className="text-sm text-secondary-700 whitespace-pre-wrap flex-1">
                  {progress.stage}
                </p>
              </div>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Resultado */}
            <div
              className={`rounded-lg p-4 flex items-start gap-3 ${
                result.success
                  ? 'bg-primary-50 border border-primary-200'
                  : 'bg-accent-50 border border-accent-200'
              }`}
            >
              <div className="flex-shrink-0 pt-0.5">
                {result.success ? (
                  <div className="text-primary-600">
                    <MdCheckCircle size={24} />
                  </div>
                ) : (
                  <div className="text-accent-600">
                    <MdErrorOutline size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    result.success ? 'text-primary-900' : 'text-accent-900'
                  }`}
                >
                  {result.message}
                </p>
              </div>
            </div>

            {/* Detalles */}
            {result.details && Object.keys(result.details).length > 0 && (
              <div className="bg-surface-50 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(result.details).map(([key, value]) => {
                  // No mostrar arrays de errores por ahora
                  if (Array.isArray(value) && value.length === 0) return null;
                  if (Array.isArray(value) && typeof value[0] === 'string') return null;

                  return (
                    <div
                      key={key}
                      className="flex justify-between text-sm text-surface-700"
                    >
                      <span className="font-medium text-surface-600">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-secondary-800">
                        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Errores si los hay */}
            {result.details?.errors && result.details.errors.length > 0 && (
              <div className="bg-accent-50 rounded-lg p-4 space-y-1 max-h-32 overflow-y-auto border border-accent-200">
                <p className="text-xs font-semibold text-accent-900 mb-2">
                  ⚠️ {result.details.errors.length} Errores:
                </p>
                {result.details.errors.slice(0, 5).map((error: string, idx: number) => (
                  <p key={idx} className="text-xs text-accent-800">
                    • {error}
                  </p>
                ))}
                {result.details.errors.length > 5 && (
                  <p className="text-xs text-accent-700 mt-2">
                    ... y {result.details.errors.length - 5} errores más
                  </p>
                )}
              </div>
            )}

            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
