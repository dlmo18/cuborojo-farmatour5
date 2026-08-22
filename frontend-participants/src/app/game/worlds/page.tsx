'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

interface World {
  id: string;
  name: string;
  description: string;
  orderNum: number;
  imageId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function WorldsPage() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const { user, token } = useAuthStore();

  useEffect(() => {
    fetchWorlds();
  }, []);

  const fetchWorlds = async () => {
    try {
      const res = await axios.get(`${API_URL}/worlds`);
      setWorlds(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching worlds:', err);
    }
  };

  const handleWorldClick = async (world: World) => {
    setSelectedWorld(world);
    try {
      const res = await axios.get(`${API_URL}/levels/world/${world.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLevels(res.data);
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-500 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">🎮 Farmatour 5</h1>
          <div className="text-white text-right">
            <p className="text-lg">⭐ {user?.totalStars || 0} Estrellas</p>
            <p className="text-sm">Hola, {user?.fullName}</p>
          </div>
        </div>

        {!selectedWorld ? (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Selecciona un Mundo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {worlds.map((world) => (
                <button
                  key={world.id}
                  onClick={() => handleWorldClick(world)}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105"
                >
                  <div className="text-4xl mb-3">🌍</div>
                  <h3 className="text-2xl font-bold text-purple-600 mb-2">{world.name}</h3>
                  <p className="text-gray-600">{world.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => { setSelectedWorld(null); setLevels([]); }}
              className="mb-6 bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100"
            >
              ← Volver
            </button>
            <h2 className="text-3xl font-bold text-white mb-8">{selectedWorld.name} - Niveles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {levels.map((level) => (
                <div key={level.id} className="bg-white rounded-lg shadow-lg p-6">
                  {level.isGolden && <div className="text-3xl mb-2">✨ NIVEL DORADO</div>}
                  <h3 className="text-xl font-bold text-purple-600 mb-2">{level.name}</h3>
                  <p className="text-gray-600 mb-4">{level.description}</p>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                    Jugar Nivel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
