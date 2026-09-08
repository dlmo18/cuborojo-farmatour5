import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import CountdownTimer from './CountdownTimer';

interface BottomStatsProps {
  totalStars: number;
  userId: string;
  groupId?: string;
  token?: string;
}

export default function BottomStats({
  totalStars,
  userId,
  groupId,
  token,
}: BottomStatsProps) {
  const [groupRanking, setGroupRanking] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Obtener el ranking del usuario en su grupo
  useEffect(() => {
    if (!groupId || !userId || !token) {
      setLoading(false);
      return;
    }

    const fetchRanking = async () => {
      try {
        const res = await axios.get(`${API_URL}/groups/${groupId}/ranking`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const participants = res.data?.data || res.data || [];
        const ranking = participants.findIndex((p: any) => p.id === userId) + 1;
        
        setGroupRanking(ranking || null);
      } catch (err) {
        console.error('Error fetching group ranking:', err);
        setGroupRanking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [groupId, userId, token]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-2xl">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {/* Contador regresivo (izquierda) */}
        <div className="flex-1">
          <CountdownTimer />
        </div>

        {/* Estrellas (centro) */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3 backdrop-blur-sm">
            <p className="text-sm text-gray-100 mb-1">Estrellas</p>
            <p className="text-3xl font-bold">⭐ {totalStars}</p>
          </div>
        </div>

        {/* Puesto en el grupo (derecha) */}
        <div className="flex-1 flex justify-end">
          <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3 backdrop-blur-sm">
            <p className="text-sm text-gray-100 mb-1">Puesto</p>
            <p className="text-3xl font-bold">
              {loading ? '...' : groupRanking ? `#${groupRanking}` : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
