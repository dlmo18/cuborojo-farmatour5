'use client';

import { useState, useEffect } from 'react';
import { MdClose, MdStar, MdCheckCircle } from 'react-icons/md';
import styles from './ParticipantProgressModal.module.css';
import { reportsApi } from '@/app/services/api';

interface MissionProgress {
  missionId: string;
  missionName: string;
  starsEarned: number;
  maxStars: number;
  isCompleted: boolean;
}

interface LevelProgress {
  levelId: string;
  levelName: string;
  levelType: 'normal' | 'golden' | 'final';
  starsEarned: number;
  maxStars: number;
  isCompleted: boolean;
  missions: MissionProgress[];
}

interface WorldProgress {
  worldId: string;
  worldName: string;
  totalStars: number;
  maxStars: number;
  completedLevels: number;
  totalLevels: number;
  levels: LevelProgress[];
}

interface ProgressData {
  participant: {
    id: string;
    fullName: string;
    dni: string;
  };
  worlds: WorldProgress[];
  totalStars: number;
  totalMaxStars: number;
}

interface ParticipantProgressModalProps {
  participantId: string;
  participantName: string;
  onClose: () => void;
}

export default function ParticipantProgressModal({
  participantId,
  participantName,
  onClose,
}: ParticipantProgressModalProps) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedWorld, setExpandedWorld] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, [participantId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await reportsApi.participantProgress(participantId);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error cargando progreso');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2>Cargando progreso...</h2>
            <button onClick={onClose} className={styles.closeBtn}>
              <MdClose size={24} />
            </button>
          </div>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2>Error</h2>
            <button onClick={onClose} className={styles.closeBtn}>
              <MdClose size={24} />
            </button>
          </div>
          <div className={styles.errorMessage}>
            {error || 'Error desconocido al cargar el progreso'}
          </div>
          <div className={styles.actions}>
            <button onClick={onClose} className={styles.closeAction}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2>{participantName}</h2>
            <p className={styles.subtitle}>DNI: {data.participant.dni}</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.totalStats}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Total de Estrellas</div>
            <div className={styles.statValue}>
              {data.totalStars} / {data.totalMaxStars}
              <MdStar className={styles.starIcon} />
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Mundos Completados</div>
            <div className={styles.statValue}>
              {data.worlds.filter((w) => w.completedLevels === w.totalLevels).length} / {data.worlds.length}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {data.worlds.map((world) => (
            <div key={world.worldId} className={styles.worldSection}>
              <div
                className={styles.worldHeader}
                onClick={() =>
                  setExpandedWorld(
                    expandedWorld === world.worldId ? null : world.worldId
                  )
                }
              >
                <div className={styles.worldTitle}>
                  <h3>{world.worldName}</h3>
                  <span className={styles.worldStats}>
                    {world.totalStars} / {world.maxStars}
                    <MdStar className={styles.smallStar} />
                  </span>
                </div>
                <div className={styles.worldProgress}>
                  <span>Niveles: {world.completedLevels} / {world.totalLevels}</span>
                  <span className={styles.arrow}>
                    {expandedWorld === world.worldId ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {expandedWorld === world.worldId && (
                <div className={styles.levelsList}>
                  {world.levels.map((level) => (
                    <div key={level.levelId} className={styles.levelItem}>
                      <div
                        className={styles.levelHeader}
                        onClick={() =>
                          setExpandedLevel(
                            expandedLevel === level.levelId
                              ? null
                              : level.levelId
                          )
                        }
                      >
                        <div className={styles.levelInfo}>
                          <span className={styles.levelName}>
                            {level.levelName}
                          </span>
                          <span className={styles.levelType}>
                            {level.levelType === 'golden' && '⭐ Dorado'}
                            {level.levelType === 'final' && '🏆 Final'}
                            {level.levelType === 'normal' && '📚 Normal'}
                          </span>
                          {level.isCompleted && (
                            <MdCheckCircle className={styles.completedIcon} />
                          )}
                        </div>
                        <div className={styles.levelStats}>
                          <span className={styles.stars}>
                            {level.starsEarned} / {level.maxStars}
                            <MdStar className={styles.smallStar} />
                          </span>
                          <span className={styles.arrow}>
                            {expandedLevel === level.levelId ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>

                      {expandedLevel === level.levelId && level.missions.length > 0 && (
                        <div className={styles.missionsList}>
                          {level.missions.map((mission) => (
                            <div
                              key={mission.missionId}
                              className={styles.missionItem}
                            >
                              <span className={styles.missionName}>
                                {mission.missionName}
                                {mission.isCompleted && (
                                  <MdCheckCircle
                                    className={styles.missionCompletedIcon}
                                  />
                                )}
                              </span>
                              <span className={styles.missionStars}>
                                {mission.starsEarned} / {mission.maxStars}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.closeAction}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
