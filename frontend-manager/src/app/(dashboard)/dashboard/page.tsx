'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface DashboardData {
  top10Participants: any[];
  top10Groups: any[];
  worldCompletion: any[];
  activityByDay: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('manager_auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [top10P, top10G, worldC, activity] = await Promise.all([
        axios.get(`${API_URL}/reports/top10-participants`, { headers }),
        axios.get(`${API_URL}/reports/top10-groups`, { headers }),
        axios.get(`${API_URL}/reports/world-completion`, { headers }),
        axios.get(`${API_URL}/reports/activity?days=7`, { headers }),
      ]);

      setData({
        top10Participants: top10P.data,
        top10Groups: top10G.data,
        worldCompletion: worldC.data,
        activityByDay: activity.data,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">📊 Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 10 Participantes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Top 10 Participantes</h2>
          <div className="space-y-2">
            {data?.top10Participants?.map((p, idx) => (
              <div key={p.id} className="flex justify-between p-2 bg-gray-100 text-black rounded">
                <span className="font-semibold">#{idx + 1} {p.full_name}</span>
                <span className="text-yellow-500">⭐ {p.total_stars}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Grupos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏅 Top 10 Grupos</h2>
          <div className="space-y-2">
            {data?.top10Groups?.map((g, idx) => (
              <div key={g.group_id} className="flex justify-between p-2 bg-gray-100 text-black rounded">
                <span className="font-semibold">#{idx + 1} {g.group_name}</span>
                <span className="text-yellow-500">⭐ {g.total_group_stars}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Completitud de Mundos */}
        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🌍 Progreso de Mundos</h2>
          <div className="space-y-3">
            {data?.worldCompletion?.map((w) => (
              <div key={w.world_name} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between mb-2 text-black">
                  <span className="font-semibold">{w.world_name}</span>
                  <span className="text-blue-600">{w.completion_rate}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${w.completion_rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
