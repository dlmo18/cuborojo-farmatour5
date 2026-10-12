'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MissionCard from '@/components/MissionCard';

interface Mission {
  id: string;
  name: string;
  description: string;
  orderNum: number;
  order_number?: number;
  maxStars: number;
  isActive: boolean;
}

interface Level {
  id: string;
  name: string;
  description: string;
  world: {
    id: string;
    name: string;
  };
}

interface MissionProgress {
  missionId: string;
  starsEarned: number;
  isCompleted: boolean;
}

interface MissionsFlowProps {
  level: Level;
  missions: Mission[];
  missionProgress: Record<string, MissionProgress>;
}

export default function MissionsFlow({ level, missions, missionProgress }: MissionsFlowProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen mission-page">
      <div className="max-w-sm mx-auto">
        <div className="fixed top-0 left-0 z-10 w-full pb-10 bg-gradient-to-b from-black/80 to-black/0">
          <div className="mission-header max-w-sm mx-auto flex px-4 justify-between items-center">
            <button onClick={() => router.push(`/game/worlds/${level?.world.id}`)}>
              <Image
                src="/images/btn-back.png"
                alt="Atrás"
                width={50}
                height={50}
                className="h-auto"
                priority
              />
            </button>
            <h1 className="text-3xl font-bold text-white text-center flex-1 leading-none" style={{ fontFamily: "'Blinker', sans-serif" }}>
              <span className="block text-lg">NIVEL</span>
              <div className="level-title uppercase font-black text-2xl leading-none">{level?.name}</div>
            </h1>
            <button onClick={() => router.push('/game/setting')} className="btn-menu text-2xl">
              <Image
                src="/images/btn-menu.png"
                alt="Menú"
                width={50}
                height={50}
                className="h-auto"
                priority
              />
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-36">
          {missions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <p className="text-gray-600">No hay misiones en este nivel</p>
            </div>
          ) : (
            [...missions].reverse().map((mission) => {
              const progress = missionProgress[mission.id];
              const isCompleted = progress?.isCompleted || false;
              const starsEarned = progress?.starsEarned || 0;
              
              const isFirstMission = mission.orderNum === 1;
              const prevMission = missions.find(m => m.orderNum === mission.orderNum - 1);
              const prevMissionProgress = prevMission ? missionProgress[prevMission.id] : null;
              const prevHasProgress = prevMissionProgress && (prevMissionProgress.isCompleted || prevMissionProgress.starsEarned > 0);
              const isUnlocked: boolean = isFirstMission || !!prevHasProgress;

              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  isCompleted={isCompleted}
                  starsEarned={starsEarned}
                  isUnlocked={isUnlocked}
                  onMissionClick={() => router.push(`/game/missions/${mission.id}`)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
