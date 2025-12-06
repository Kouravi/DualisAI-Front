"use client";
import React, { useEffect, useRef, useState } from "react";
import { StoredItem, getStored, removeStoredByIndex, getCurrent, removeStoredByName, setCurrent } from "../lib/localStorage";

type Props = {
  onSelect: (item: StoredItem, index: number) => void;
  items?: StoredItem[];
  current?: any;
  onDeleted?: () => void;
};

export default function GalleryCompactPrediction({ onSelect, items: itemsProp, current: externalCurrent, onDeleted }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<StoredItem[]>([]);
  const [ctxMenuIndex, setCtxMenuIndex] = useState<number | null>(null);
  const [current, setC] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // initialize from prop if provided, otherwise read from storage
  useEffect(() => {
    if (itemsProp && Array.isArray(itemsProp)) {
      setItems(itemsProp);
    } else {
      setItems(getStored());
    }
  }, [itemsProp]);

  // When storage changes, update only if parent is not controlling via prop
  useEffect(() => {
    if (itemsProp) return;
    const onStorage = () => setItems(getStored());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [itemsProp]);

  // Prefer external `current` prop if provided; otherwise read from storage.
  useEffect(() => {
    setC(externalCurrent ?? getCurrent());
  }, [externalCurrent]);

  useEffect(() => {
    const onStorage = () => setC(externalCurrent ?? getCurrent());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [externalCurrent]);

  const scrollBy = (amt: number) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: amt, behavior: "smooth" });
  };
  
  const handleRightClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setCtxMenuIndex(index);
    // close after 4s if not used
    setTimeout(() => setCtxMenuIndex((v) => (v === index ? null : v)), 1000);
  };

  const handleDelete = (index: number) => {
    try {
      // Find the actual index in stored array by matching ts + name to avoid mismatches
      const stored = getStored();
      const target = items[index];
      const foundIndex = stored.findIndex((s) => s.ts === target.ts && s.name === target.name);
      if (foundIndex >= 0) removeStoredByIndex(foundIndex);
    } catch (e) {
      // fallback: try to remove by the provided index
      try { removeStoredByIndex(index); } catch { }
    }

    // Refresh local items list
    const after = getStored();
    setItems(after);
    if (ctxMenuIndex === index) setCtxMenuIndex(null);

    // If the deleted thumbnail matches the current image, clear current_image from storage
    try {
      const currentStored = getCurrent();
      const target = items[index];
      if (currentStored && target && currentStored.name === target.name && currentStored.ts === target.ts) {
        try { setCurrent(null); } catch { }
        setC(null);
      }
    } catch (e) {
      // ignore
    }

    // If storage is now empty, notify parent so it can show empty view immediately
    try {
      if (after.length === 0 && onDeleted) onDeleted();
    } catch (e) {
      // ignore
    }
  };

  const handleSelect = (item: StoredItem, index: number) => {
    // find real index in storage (in case parent provided items prop or items were deduped)
    try {
      const stored = getStored();
      const foundIndex = stored.findIndex((s) => s.ts === item.ts && s.name === item.name);
      onSelect(item, foundIndex >= 0 ? foundIndex : index);
    } catch (e) {
      onSelect(item, index);
    }
    // refresh local view from storage to ensure UI reflects latest state
    setItems(getStored());
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-center mb-3 gap-4">
        <button onClick={() => scrollBy(-260)} className="p-2 bg-white rounded-full shadow">◀</button>
        <div className="text-sm text-gray-600">Galería compacta</div>
        <button onClick={() => scrollBy(260)} className="p-2 bg-white rounded-full shadow">▶</button>
      </div>

      <div ref={trackRef} className="flex gap-3 overflow-x-auto py-2 px-1">
        {items.length === 0 && (
          <div className="w-full text-center text-sm text-gray-400">No hay imágenes todavía</div>
        )}

        {(() => {
          // Deduplicate items for display (prefer unique by data, fallback to name+ts)
          const seen = new Set<string>();
          const display = [] as StoredItem[];
          for (const it of items) {
            const key = it.data ? it.data : `${it.name ?? ''}-${it.ts ?? ''}`;
            if (seen.has(key)) continue;
            seen.add(key);
            display.push(it);
          }
          return display.map((it, i) => (
            <div key={`${it.ts ?? 'ts'}-${it.name ?? 'name'}-${i}`} className="relative w-[110px] h-[110px] flex-shrink-0 rounded-lg overflow-hidden shadow">
              <button
                onClick={() => handleSelect(it, i)}
                onContextMenu={(e) => handleRightClick(e, i)}
                className="w-full h-full p-0 m-0 bg-transparent border-0"
              >
                <img src={it.data ?? ""} alt={it.name} className="w-full h-full object-cover rounded-lg" />
              </button>

              {/* Contextual small delete button anchored to thumbnail */}
              {ctxMenuIndex === i && (
                <div className="absolute top-1 right-1">
                  <button
                    onClick={() => handleDelete(i)}
                    className="bg-white/90 text-red-600 px-2 py-1 rounded shadow-sm text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}