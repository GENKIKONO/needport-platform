'use client';

import { useEffect, useState } from 'react';
import { formatTimeRemaining } from '@/lib/ui/format';

interface CountdownProps {
  deadline: string;
  className?: string;
}

export default function Countdown({ deadline, className = '' }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(deadline));
    }, 60000); // 1分ごとに更新

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <span className={`text-sm font-medium ${className}`}>
      {timeRemaining}
    </span>
  );
}
