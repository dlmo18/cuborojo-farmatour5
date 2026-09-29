'use client';
import Image from 'next/image';

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
      className={`mission-item block m-auto mb-2 px-10 py-3 transition transform ${
        isUnlocked
          ? 'bg-white hover:shadow-2xl hover:scale-105 cursor-pointer'
          : 'bg-secondary-200 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center justify-between h-5 mb-5">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Blinker', sans-serif" }}>{mission.name}</h3>
        </div>
      </div>
      {/* Estrellas */}
      <div className="m-auto">
        {
          isUnlocked && stars ? (
            <Image
              src={`/images/level-mision-star-${stars.length}.png`}
              alt="Estrella"
              width={50}
              height={24}
              className="h-auto block m-auto"
              priority
            />
          ): (
            <Image
              src="/images/level-mision-star-disable.png"
              alt="Estrella"
              width={50}
              height={24}
              className="h-auto block m-auto"
              priority
            />
          )
        }
      </div>
    </button>
  );
}
