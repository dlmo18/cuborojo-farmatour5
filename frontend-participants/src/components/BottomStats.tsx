import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import CountdownTimer from './CountdownTimer';

interface BottomStatsProps {
  totalStars?: number;
  userId?: string;
  groupId?: string;
  token?: string;
}

export default function BottomStats({
  totalStars: propTotalStars,
  userId: propUserId,
  groupId: propGroupId,
  token: propToken,
}: BottomStatsProps) {
  const [groupRanking, setGroupRanking] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Obtener usuario del store
  const user = useAuthStore((state) => state.user);
  const storeToken = useAuthStore((state) => state.token);

  // Usar props si se proporcionan, si no usar del store
  const totalStars = propTotalStars ?? user?.totalStars ?? 0;
  const userId = propUserId ?? user?.id;
  const groupId = propGroupId ?? user?.group?.id;
  const token = propToken ?? storeToken ?? '';

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
    <div className="bottom-stats fixed bottom-0 left-0 right-0 z-50 pt-12">
      <div className="panel-block  max-w-md mx-auto flex justify-between items-center">
        {/* Contador regresivo (izquierda) */}
        <div className="flex-1">
          <CountdownTimer />
        </div>

        {/* Estrellas (centro) */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white px-6 py-3 bottom-stars flex items-start justify-center">
            <p className="text-5xl pt-10 font-blinker font-bold">{totalStars}</p>
          </div>
        </div>

        {/* Puesto en el grupo (derecha) */}
        <div className="flex-1 flex justify-end relative">
          <div className="pr-2 pl-8 py-3 font-blinker font-bold mt-20">
            <div className="text-3xl absolute top-16 -left-5 bottom-place text-center pt-6 ">
              {loading ? '...' : groupRanking ? `#${groupRanking}` : '1'}
            </div>
            <div className="text-md pl-10 leading-4 text-black mb-1 uppercase">Puesto en tu grupo</div>
          </div>
        </div>
      </div>
    </div>
  );
}
