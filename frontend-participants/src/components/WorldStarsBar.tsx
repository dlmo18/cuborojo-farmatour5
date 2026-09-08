'use client';

interface WorldStarsBarProps {
  worldStars: number;
}

export default function WorldStarsBar({ worldStars }: WorldStarsBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-2xl">
      <div className="max-w-2xl mx-auto flex justify-center">
        <div className="bg-white bg-opacity-20 rounded-lg px-8 py-4 backdrop-blur-sm">
          <p className="text-sm text-gray-100 mb-1">Estrellas en este Mundo</p>
          <p className="text-4xl font-bold">⭐ {worldStars}</p>
        </div>
      </div>
    </div>
  );
}
