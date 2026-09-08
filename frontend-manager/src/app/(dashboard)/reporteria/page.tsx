'use client';

import { useState, useEffect } from 'react';
import { reportsApi } from '@/app/services/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [top10Participants, setTop10Participants] = useState<any[]>([]);
  const [top10Groups, setTop10Groups] = useState<any[]>([]);
  const [worldCompletion, setWorldCompletion] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [activityDays, setActivityDays] = useState(7);

  useEffect(() => { loadReports(); }, [activityDays]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [participants, groups, worlds, act] = await Promise.all([
        reportsApi.top10Participants(),
        reportsApi.top10Groups(),
        reportsApi.worldCompletion(),
        reportsApi.activity(activityDays),
      ]);
      setTop10Participants(participants.data);
      setTop10Groups(groups.data);
      setWorldCompletion(worlds.data);
      setActivity(act.data);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">📈 Reportería</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">📈 Reportería y KPIs</h1>
        <button onClick={loadReports} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
          <span className="material-icons" style={{ fontSize: '20px' }}>refresh</span>
          Actualizar
        </button>
      </div>

      {/* Top 10 Participantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Top 10 Participantes</h2>
          <div className="space-y-2">
            {top10Participants.length > 0 ? (
              top10Participants.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{idx + 1}. {p.fullName || p.name}</span>
                  <span className="text-yellow-600 font-bold">⭐ {p.totalStars || p.stars || 0}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Top 10 Grupos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📁 Top 10 Grupos</h2>
          <div className="space-y-2">
            {top10Groups.length > 0 ? (
              top10Groups.map((g, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{idx + 1}. {g.name}</span>
                  <span className="text-yellow-600 font-bold">⭐ {g.totalStars || g.stars || 0}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* Completación de Mundos */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🌍 Completación de Mundos</h2>
        {worldCompletion.length > 0 ? (
          <div className="space-y-3">
            {worldCompletion.map((w, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{w.worldName || w.name}</span>
                  <span className="text-gray-600">{w.completionPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${w.completionPercentage || 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay datos disponibles</p>
        )}
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">📅 Actividad Reciente</h2>
          <select value={activityDays} onChange={(e) => setActivityDays(parseInt(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-md">
            <option value="7">Últimos 7 días</option>
            <option value="14">Últimos 14 días</option>
            <option value="30">Últimos 30 días</option>
          </select>
        </div>
        {activity.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activity.map((a, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <span className="material-icons text-gray-400" style={{ fontSize: '20px' }}>{a.action === 'login' ? 'login' : 'check_circle'}</span>
                <div className="flex-1">
                  <p className="font-medium">{a.participantName || 'Participante'}</p>
                  <p className="text-sm text-gray-500">{a.action} - {new Date(a.createdAt).toLocaleString('es-ES')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay actividad registrada</p>
        )}
      </div>
    </div>
  );
}
