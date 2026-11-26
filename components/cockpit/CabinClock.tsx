'use client';

import { useEffect, useState } from 'react';
import { pad2 } from '@/lib/format';

/** 艙內時間：訪客自己的當地時間，伺服器端先顯示 --:--。 */
export function CabinClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!now) return <span>--:--</span>;

  return (
    <time dateTime={now.toISOString()}>
      {pad2(now.getHours())}
      <span className="blink">:</span>
      {pad2(now.getMinutes())}
    </time>
  );
}
