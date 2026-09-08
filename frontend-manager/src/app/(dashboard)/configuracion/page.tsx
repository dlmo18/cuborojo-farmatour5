'use client';

import { useState, useEffect } from 'react';
import { configApi, SystemConfig } from '@/app/services/api';

export default function ConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await configApi.getAll();
      setConfigs(response.data);
      const initialValues: Record<string, string> = {};
      response.data.forEach(config => { initialValues[config.key] = config.value; });
      setEditValues(initialValues);
    } catch (err: any) {
      setError('Error al cargar configuración');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await configApi.update(key, editValues[key]);
      setSuccess(`Configuración "${key}" actualizada`);
      fetchConfigs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const configGroups = {
    'Regalos y Recompensas': ['countdown_datetime'],
    'Sistema': ['maintenance_mode', 'sound_enabled', 'effect_sound_enabled'],
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">⚙️ Configuración</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">⚙️ Configuración del Sistema</h1>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(configGroups).map(([groupName, keys]) => {
          const groupConfigs = configs.filter(c => keys.includes(c.key));
          if (groupConfigs.length === 0) return null;

          return (
            <div key={groupName} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{groupName}</h2>
              <div className="space-y-4">
                {groupConfigs.map(config => (
                  <div key={config.key} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        {config.description && (
                          <p className="text-sm text-gray-500 mb-2">{config.description}</p>
                        )}
                        {config.key === 'countdown_datetime' ? (
                          <input
                            type="datetime-local"
                            value={editValues[config.key] ? new Date(editValues[config.key]).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                              const date = new Date(e.target.value);
                              setEditValues({ ...editValues, [config.key]: date.toISOString() });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={editValues[config.key] || ''}
                            onChange={(e) => setEditValues({ ...editValues, [config.key]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => handleSave(config.key)}
                        disabled={saving || editValues[config.key] === config.value}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                      >
                        <span className="material-icons text-sm" style={{ fontSize: '18px' }}>save</span>
                        Guardar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Otras configuraciones */}
        {configs.filter(c => !Object.values(configGroups).flat().includes(c.key)).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Otras Configuraciones</h2>
            <div className="space-y-4">
              {configs.filter(c => !Object.values(configGroups).flat().includes(c.key)).map(config => (
                <div key={config.key} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      {config.description && (
                        <p className="text-sm text-gray-500 mb-2">{config.description}</p>
                      )}
                      <input
                        type="text"
                        value={editValues[config.key] || ''}
                        onChange={(e) => setEditValues({ ...editValues, [config.key]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      onClick={() => handleSave(config.key)}
                      disabled={saving || editValues[config.key] === config.value}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      <span className="material-icons text-sm" style={{ fontSize: '18px' }}>save</span>
                      Guardar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
