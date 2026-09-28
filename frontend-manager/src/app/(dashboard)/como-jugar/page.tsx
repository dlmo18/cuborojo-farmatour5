'use client';

import { useEffect, useState } from 'react';
import { howToPlayApi, HowToPlay } from '@/app/services/api';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function ComoJugarPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [howToPlayId, setHowToPlayId] = useState<string>('');

  // Load how to play content
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await howToPlayApi.get();
      const data = response.data as HowToPlay;
      setContent(data.content);
      setHowToPlayId(data.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando contenido';
      setError(errorMessage);
      console.error('Error loading content:', err);
      // Si no existe, inicializar vacío
      setContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      
      await howToPlayApi.update({ content });
      
      setSuccessMessage('Contenido guardado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardando contenido';
      setError(errorMessage);
      console.error('Error saving content:', err);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-secondary-900 border-r-transparent"></div>
          <p className="mt-4 text-surface-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-900 mb-2">
          🎮 Como Jugar
        </h1>
        <p className="text-surface-600">
          Edita las instrucciones del juego que serán mostradas a los participantes
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-accent-100 border border-accent-300 rounded-lg">
          <p className="text-accent-800 font-semibold">⚠️ Error</p>
          <p className="text-accent-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-primary-100 border border-primary-300 rounded-lg">
          <p className="text-primary-800 font-semibold">✅ Éxito</p>
          <p className="text-primary-700 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Editor */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <label className="block text-sm font-semibold text-secondary-900 mb-4">
          Contenido (WYSIWYG)
        </label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          height="500px"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={loadContent}
          disabled={isSaving}
          className="px-6 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300 disabled:opacity-50 transition font-semibold"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition font-semibold"
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
