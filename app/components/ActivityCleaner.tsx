// app/components/ActivityCleaner.tsx
"use client";
import { useEffect, useRef } from "react";
import { getStored, setStored } from "../lib/localStorage";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos

export default function ActivityCleaner() {
  const lastActivityRef = useRef<number>(Date.now());
  useEffect(() => {
    const resetTimer = () => (lastActivityRef.current = Date.now());
    const events = ["mousemove", "keydown", "touchstart", "click"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > TIMEOUT_MS) {
        // clear storage
        try {
          localStorage.removeItem("uploaded_images");
        } catch {}
      }
    }, 30 * 1000);
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      clearInterval(interval);
    };
  }, []);
  return null;
}
