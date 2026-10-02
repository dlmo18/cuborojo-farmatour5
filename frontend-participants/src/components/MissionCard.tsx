'use client';
import Image from 'next/image';

interface Mission {
  id: string;
  orderNum: number;
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

  let starCounter=0;
  stars.forEach(star => {
    if (star) starCounter++;
  });
  console.log('isUnlocked', isUnlocked, 'isCompleted', isCompleted, 'stars', stars, 'starCounter', starCounter);
  return (
    <button
      onClick={onMissionClick}
      disabled={!isUnlocked}
      className={`mission-item block mx-auto px-10 transition transform ${
        isUnlocked
          ? 'cursor-pointer'
          : 'is-locked cursor-not-allowed'
      }`}
    >
      <div className="flex items-center justify-center h-[100px] mb-2 w-full ">
        <h3 className="text-xl font-bold text-white uppercase leading-none" style={{ fontFamily: "'Blinker', sans-serif" }}>
          <span className='block'>Misión {mission.orderNum}:</span>
          {mission.name}
        </h3>
      </div>
      {/* Estrellas */}
      <div className="m-auto">
        {
          isCompleted ? (
            <Image
              src={`/images/level-mision-star-${starCounter}.png`}
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
