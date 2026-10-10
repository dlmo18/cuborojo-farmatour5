'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ParticipantProgressModal from '@/app/components/ParticipantProgressModal';
import { participantsApi, reportsApi } from '@/app/services/api';

export default function ParticipantProgressPage() {
  const router = useRouter();
  const params = useParams();
  const dni = params.dni as string;
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParticipantId = async () => {
      try {
        if (!dni) {
          setError('DNI no válido');
          return;
        }

        // Buscar el participante por DNI
        const response = await participantsApi.getAll({ search: dni, limit: 1 });
        const participant = response.data.data[0];

        if (!participant) {
          setError(`No se encontró participante con DNI: ${dni}`);
          return;
        }

        setParticipantId(participant.id);
        setParticipantName(participant.fullName);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error buscando participante');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipantId();
  }, [dni]);

  if (loading) {
    return <div style={{ padding: '24px' }}>Cargando...</div>;
  }

  if (error || !participantId) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => router.back()}>Volver</button>
      </div>
    );
  }

  return (
    <ParticipantProgressModal
      participantId={participantId}
      participantName={participantName}
      onClose={() => router.back()}
      isDniParam={true}
    />
  );
}
