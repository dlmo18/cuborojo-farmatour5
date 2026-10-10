'use client';

import { useState, useEffect } from 'react';
import { MdArrowBack, MdStar, MdCheckCircle, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import styles from './ParticipantProgressModal.module.css';
import { reportsApi } from '@/app/services/api';

interface QuestionResult {
  questionId: string;
  questionText: string;
  selectedAnswer: string | null | undefined;
  correctAnswer: string;
  isCorrect: boolean | null;
  answerOptions?: string[];
}

interface MissionProgress {
  missionId: string;
  missionName: string;
  starsEarned: number;
  maxStars: number;
  isCompleted: boolean;
  questions?: QuestionResult[];
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
  isDniParam?: boolean;
}

// Helper functions to calculate maxStars from actual data
const calculateMissionMaxStars = (mission: MissionProgress): number => {
  return mission.maxStars || 0;
};

const calculateLevelMaxStars = (level: LevelProgress): number => {
  if (level.missions.length === 0) return 0;
  return level.missions.reduce((sum, mission) => sum + calculateMissionMaxStars(mission), 0);
};

const calculateWorldMaxStars = (world: WorldProgress): number => {
  if (world.levels.length === 0) return 0;
  return world.levels.reduce((sum, level) => sum + calculateLevelMaxStars(level), 0);
};

const calculateTotalMaxStars = (worlds: WorldProgress[]): number => {
  return worlds.reduce((sum, world) => sum + calculateWorldMaxStars(world), 0);
};

export default function ParticipantProgressModal({
  participantId,
  participantName,
  onClose,
  isDniParam = false,
}: ParticipantProgressModalProps) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedWorld, setExpandedWorld] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedAnswers, setEditedAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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
    // Removed - no longer needed for page view
  };

  const handleEditAnswer = (questionId: string, currentAnswer: string) => {
    setEditingQuestionId(questionId);
    setEditedAnswers({ ...editedAnswers, [questionId]: currentAnswer });
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setSaveError('');
  };

  const handleSaveAnswer = async (question: QuestionResult, questionIndex: number) => {
    try {
      setSaving(true);
      setSaveError('');
      const newAnswer = editedAnswers[question.questionId] || question.selectedAnswer;
      
      // Llamar al backend para guardar
      await reportsApi.updateQuestionAnswer(participantId, question.questionId, newAnswer);
      
      // Refrescar todos los datos para obtener estrellas recalculadas en cascada
      await fetchProgressData();
      
      // Limpiar estado de edición
      setEditingQuestionId(null);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || 'Error guardando respuesta');
      console.error('Error saving answer:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <button onClick={onClose} className={styles.backBtn}>
            <MdArrowBack size={24} />
            Atrás
          </button>
          <h2>Cargando progreso...</h2>
          <div style={{ width: '80px' }}></div>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <button onClick={onClose} className={styles.backBtn}>
            <MdArrowBack size={24} />
            Atrás
          </button>
          <h2>Error</h2>
          <div style={{ width: '80px' }}></div>
        </div>
        <div className={styles.errorMessage}>
          {error || 'Error desconocido al cargar el progreso'}
        </div>
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.closeAction}>
            Atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <button onClick={onClose} className={styles.backBtn}>
          <MdArrowBack size={24} />
          Atrás
        </button>
        <div>
          <h2>{participantName}</h2>
          <p className={styles.subtitle}>DNI: {data.participant.dni}</p>
        </div>
        <div style={{ width: '80px' }}></div>
      </div>

      <div className={styles.totalStats}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Total de Estrellas</div>
          <div className={styles.statValue}>
            {data.totalStars} / {calculateTotalMaxStars(data.worlds)}
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
                    {world.totalStars} / {calculateWorldMaxStars(world)}
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
                            {level.starsEarned} / {calculateLevelMaxStars(level)}
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
                              <div
                                className={styles.missionHeader}
                                onClick={() =>
                                  setExpandedMission(
                                    expandedMission === mission.missionId
                                      ? null
                                      : mission.missionId
                                  )
                                }
                              >
                                <span className={styles.missionName}>
                                  {mission.missionName}
                                  {mission.isCompleted && (
                                    <MdCheckCircle
                                      className={styles.missionCompletedIcon}
                                    />
                                  )}
                                </span>
                                <div className={styles.missionDetails}>
                                  <span className={styles.missionStars}>
                                    {mission.starsEarned} / {mission.maxStars}
                                  </span>
                                  {mission.questions && mission.questions.length > 0 && (
                                    <span className={styles.arrow}>
                                      {expandedMission === mission.missionId ? '▼' : '▶'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {expandedMission === mission.missionId && mission.questions && mission.questions.length > 0 && (
                                <div className={styles.questionsList}>
                                  {mission.questions.map((question, idx) => (
                                    <div
                                      key={question.questionId}
                                      className={styles.questionItem}
                                    >
                                      <div
                                        className={styles.questionHeader}
                                        onClick={() =>
                                          setExpandedQuestion(
                                            expandedQuestion === question.questionId
                                              ? null
                                              : question.questionId
                                          )
                                        }
                                      >
                                        <div className={styles.questionInfo}>
                                          <span className={styles.questionNumber}>
                                            P{idx + 1}
                                          </span>
                                          <span className={styles.questionText}>
                                            {question.questionText}
                                          </span>
                                          <span
                                            className={`${styles.questionResult} ${
                                              question.selectedAnswer === null || question.selectedAnswer === undefined
                                                ? styles.unansweredQuestion
                                                : question.isCorrect
                                                ? styles.correctAnswer
                                                : styles.incorrectAnswer
                                            }`}
                                          >
                                            {question.selectedAnswer === null || question.selectedAnswer === undefined
                                              ? '? Sin responder'
                                              : question.isCorrect
                                              ? '✓ Correcta'
                                              : '✗ Incorrecta'}
                                          </span>
                                        </div>
                                        <span className={styles.arrow}>
                                          {expandedQuestion === question.questionId
                                            ? '▼'
                                            : '▶'}
                                        </span>
                                      </div>

                                      {expandedQuestion === question.questionId && (
                                        <div className={styles.questionDetails}>
                                          {editingQuestionId === question.questionId ? (
                                            <>
                                              <div className={styles.editMode}>
                                                <span className={styles.answerLabel}>
                                                  Cambiar respuesta:
                                                </span>
                                                {question.answerOptions && question.answerOptions.length > 0 ? (
                                                  <select
                                                    className={styles.answerSelect}
                                                    value={editedAnswers[question.questionId] || question.selectedAnswer || ''}
                                                    onChange={(e) =>
                                                      setEditedAnswers({
                                                        ...editedAnswers,
                                                        [question.questionId]: e.target.value,
                                                      })
                                                    }
                                                  >
                                                    <option value="">Selecciona una respuesta</option>
                                                    {question.answerOptions.map((option) => (
                                                      <option key={option} value={option}>
                                                        {option}
                                                      </option>
                                                    ))}
                                                  </select>
                                                ) : (
                                                  <input
                                                    type="text"
                                                    className={styles.answerInput}
                                                    value={editedAnswers[question.questionId] || question.selectedAnswer || ''}
                                                    onChange={(e) =>
                                                      setEditedAnswers({
                                                        ...editedAnswers,
                                                        [question.questionId]: e.target.value,
                                                      })
                                                    }
                                                    placeholder="Ingresa la respuesta"
                                                  />
                                                )}
                                                {saveError && (
                                                  <div className={styles.errorText}>
                                                    {saveError}
                                                  </div>
                                                )}
                                                <div className={styles.editActions}>
                                                  <button
                                                    className={styles.saveBtn}
                                                    onClick={() => handleSaveAnswer(question, idx)}
                                                    disabled={saving}
                                                  >
                                                    <MdSave size={16} />
                                                    {saving ? 'Guardando...' : 'Guardar'}
                                                  </button>
                                                  <button
                                                    className={styles.cancelBtn}
                                                    onClick={handleCancelEdit}
                                                    disabled={saving}
                                                  >
                                                    <MdCancel size={16} />
                                                    Cancelar
                                                  </button>
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <div className={styles.answerOption}>
                                                <span className={styles.answerLabel}>
                                                  Tu respuesta:
                                                </span>
                                                <div className={styles.answerWithEdit}>
                                                  <span className={`${styles.answerText} ${
                                                    (question.selectedAnswer === null || question.selectedAnswer === undefined)
                                                      ? styles.unansweredText
                                                      : ''
                                                  }`}>
                                                    {question.selectedAnswer || 'Sin responder'}
                                                  </span>
                                                  <button
                                                    className={styles.editIconBtn}
                                                    onClick={() =>
                                                      handleEditAnswer(
                                                        question.questionId,
                                                        question.selectedAnswer || ''
                                                      )
                                                    }
                                                    title="Editar respuesta"
                                                  >
                                                    <MdEdit size={16} />
                                                  </button>
                                                </div>
                                              </div>
                                              {question.selectedAnswer && !question.isCorrect && (
                                                <div className={styles.answerOption}>
                                                  <span className={styles.answerLabel}>
                                                    Respuesta correcta:
                                                  </span>
                                                  <span className={styles.answerText}>
                                                    {question.correctAnswer}
                                                  </span>
                                                </div>
                                              )}
                                              {question.selectedAnswer === null || question.selectedAnswer === undefined ? (
                                                <div className={styles.answerOption}>
                                                  <span className={styles.answerLabel}>
                                                    Respuesta correcta:
                                                  </span>
                                                  <span className={styles.answerText}>
                                                    {question.correctAnswer}
                                                  </span>
                                                </div>
                                              ) : null}
                                            </>
                                          )}
                                        </div>
                                      )}
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
              )}
            </div>
          ))}
      </div>

      <div className={styles.actions}>
        <button onClick={onClose} className={styles.closeAction}>
          Atrás
        </button>
      </div>
    </div>
  );
}