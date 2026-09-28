'use client';

interface WorldStarsBarProps {
  worldStars: number;
}

export default function WorldStarsBar({ worldStars }: WorldStarsBarProps) {
  // Formatea el número con 3 dígitos, agregando ceros a la izquierda si es necesario
  const formatStars = (stars: number): string => {
    return String(stars).padStart(3, '0');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 ">
      <div className="max-w-2xl mx-auto flex justify-center">
        <div className="level-score px-8 py-4">
          <p className="text-5xl text-gray-900 font-black font-blinker text-right">{formatStars(worldStars)}</p>
        </div>
      </div>
    </div>
  );
}
