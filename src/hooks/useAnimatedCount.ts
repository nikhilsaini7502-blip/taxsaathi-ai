import { animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Smoothly animates toward a numeric target. Display only — does not affect tax math.
 */
export function useAnimatedCount(target: number, duration = 0.65): number {
  const [display, setDisplay] = useState(() => Math.round(target));
  const fromRef = useRef(Math.round(target));

  useEffect(() => {
    const from = fromRef.current;
    const to = Math.round(target);
    fromRef.current = to;
    const controls = animate(from, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, duration]);

  return display;
}
