// src/app/[username]/StatusDisplay.tsx
"use client";

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

type Props = {
  status: 'yes' | 'in progress' | 'no';
  laborStart?: string;
  born?: string;
};

export default function StatusDisplay({ status, laborStart, born }: Props) {
  const [timer, setTimer] = useState('');

  useEffect(() => {
    if (status === 'in progress' && laborStart) {
      const interval = setInterval(() => {
        setTimer(formatDistanceToNow(new Date(laborStart), { addSuffix: true }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, laborStart]);

  if (status === 'yes') {
    return <p className="text-6xl font-bold">Yes</p>;
  }

  if (status === 'in progress') {
    return <p className="text-6xl font-bold">{timer}</p>;
  }

  if (status === 'no' && born) {
    const bornDate = new Date(born);
    return <p className="text-6xl font-bold">{bornDate.toLocaleString()}</p>;
  }

  return null;
}
