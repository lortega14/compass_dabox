"use client";

import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // duration in ms
  formatter?: (val: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 800,
  formatter,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const endValue = value;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Easing function: easeOutQuad
      const easedProgress = progress * (2 - progress);
      const currentCount = startValue + easedProgress * (endValue - startValue);

      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  const isInteger = Number.isInteger(value);
  const displayVal = isInteger ? Math.round(count) : count;

  const defaultFormatter = (val: number) =>
    isInteger ? String(Math.round(val)) : val.toFixed(2);

  const formatFn = formatter || defaultFormatter;

  return <span className="tabular-nums inline-block">{formatFn(displayVal)}</span>;
}
