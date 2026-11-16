import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      setDisplayValue(Math.round(latest * 100));
    });
  }, [scrollYProgress]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-slate-200/50 backdrop-blur-xs pointer-events-none"
      role="progressbar"
      aria-label="Reading scroll progress"
      aria-valuenow={displayValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xs shadow-blue-500/40 origin-left"
        style={{ scaleX }}
      />
    </div>
  );
};
