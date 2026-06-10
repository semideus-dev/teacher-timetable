"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function VisitorCounter() {
  const [daily, setDaily] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;

    async function incrementAndFetch() {
      await fetch("/api/visitor-count", { method: "POST" }).catch(() => {});

      try {
        const res = await fetch("/api/visitor-count");
        const data = await res.json();
        setDaily(data.daily);
        setTotal(data.total);
      } catch {
        // silently fail
      }
    }

    incrementAndFetch();
  }, []);

  if (daily === null || total === null) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-slate-500">
      <span className="flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        <span>{daily.toLocaleString()}</span>
        <span className="hidden sm:inline">Today</span>
      </span>
      <span className="text-slate-300">|</span>
      <span className="flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        <span>{total.toLocaleString()}</span>
        <span className="hidden sm:inline">Total</span>
      </span>
    </div>
  );
}
