import { useState, useEffect } from 'react';

export const useSoundSettings = () => {
  const [backgroundSound, setBackgroundSound] = useState(true);
  const [effectSound, setEffectSound] = useState(true);

  // Cargar configuraciones del localStorage al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBg = localStorage.getItem('soundBg');
      const savedEffect = localStorage.getItem('soundEffect');
      
      if (savedBg !== null) setBackgroundSound(JSON.parse(savedBg));
      if (savedEffect !== null) setEffectSound(JSON.parse(savedEffect));
    }
  }, []);

  // Guardar en localStorage cuando cambian
  const toggleBackgroundSound = () => {
    const newValue = !backgroundSound;
    setBackgroundSound(newValue);
    localStorage.setItem('soundBg', JSON.stringify(newValue));
  };

  const toggleEffectSound = () => {
    const newValue = !effectSound;
    setEffectSound(newValue);
    localStorage.setItem('soundEffect', JSON.stringify(newValue));
  };

  return {
    backgroundSound,
    effectSound,
    toggleBackgroundSound,
    toggleEffectSound,
  };
};
