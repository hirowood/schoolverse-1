"use client";
import { useEffect, useState } from 'react';

type Keys = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export default function useKeyboard(): Keys {
  const [keys, setKeys] = useState<Keys>({ up: false, down: false, left: false, right: false });

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') setKeys((k) => ({ ...k, up: true }));
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') setKeys((k) => ({ ...k, down: true }));
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') setKeys((k) => ({ ...k, left: true }));
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') setKeys((k) => ({ ...k, right: true }));
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') setKeys((k) => ({ ...k, up: false }));
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') setKeys((k) => ({ ...k, down: false }));
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') setKeys((k) => ({ ...k, left: false }));
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') setKeys((k) => ({ ...k, right: false }));
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return keys;
}
