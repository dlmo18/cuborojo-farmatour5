'use client';

interface Mission {
  id: string;
  name: string;
  description: string;
  maxStars: number;
}

interface MissionCardProps {
  mission: Mission;
  isCompleted: boolean;
  starsEarned: number;
  isUnlocked: boolean;
  onMissionClick: () => void;
}

export default function MissionCard({
  mission,
  isCompleted,
  starsEarned,
  isUnlocked,
  onMissionClick,
}: MissionCardProps) {
  const stars = Array.from({ length: mission.maxStars }, (_, i) => i < starsEarned);

  return (
    <button
      onClick={onMissionClick}
      disabled={!isUnlocked}
      className={`w-full rounded-lg shadow-lg p-6 transition transform ${
        isUnlocked
          ? 'bg-white hover:shadow-2xl hover:scale-105 cursor-pointer'
          : 'bg-gray-300 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-left flex-1">
          <h3 className="text-xl font-bold text-purple-600 mb-2">{mission.name}</h3>
          {mission.description && (
            <p className="text-gray-600 text-sm mb-3">{mission.description}</p>
          )}
          {/* Estrellas */}
          <div className="flex gap-2 rounded bg-black max-w-xs">
            {stars.map((earned, idx) => (
              <span key={idx} className={`text-2xl ${earned ? '⭐' : '⭐'}`}>
                {earned ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        </div>

        {/* Estado de la misión */}
        <div className="text-right ml-4">
          {isCompleted && (
            <div className="text-green-600 font-bold text-sm mb-2">✓ Completada</div>
          )}
          {!isUnlocked && (
            <div className="text-gray-600 font-bold text-sm">🔒 Bloqueada</div>
          )}
          {isUnlocked && !isCompleted && (
            <div className="text-purple-600 font-bold text-sm">▶ Jugar</div>
          )}
        </div>
      </div>
    </button>
  );
}
