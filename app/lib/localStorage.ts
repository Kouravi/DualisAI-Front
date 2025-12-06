// app/lib/localStorage.ts
export const STORAGE_KEY = "uploaded_images";
export const CURRENT_KEY = "current_image";

export type StoredItem = {
  name?: string;
  data?: string | null; // base64
  modelo?: string | null;
  resultado?: any;
  ts?: number;
  mensaje_completo?: string;
};

// get all uploaded_images
export function getStored(): StoredItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setStored(arr: StoredItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

export function pushStored(item: StoredItem, limit = 200) {
  const arr = getStored();
  arr.unshift(item);
  setStored(arr.slice(0, limit));
}

export function removeStoredByIndex(index: number) {
  const arr = getStored();
  if (index < 0 || index >= arr.length) return;
  arr.splice(index, 1);
  setStored(arr);
}

export function removeStoredByName(name: string) {
  const arr = getStored().filter((i) => i.name !== name);
  setStored(arr);
}

// current image helpers (ImageVisualizer uses esto)
export function setCurrent(item: StoredItem | null) {
  if (!item) {
    try {
      localStorage.removeItem(CURRENT_KEY);
    } catch {
      // ignore
    }
    return;
  }

  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(item));
    return;
  } catch (err: any) {
    // quota exceeded or other storage error. Try to recover asynchronously:
    // 1) If item.data exists (data URL), try to compress it (draw to canvas) and retry storing.
    // 2) If compression still fails, push the full item into STORAGE_KEY and store a lightweight reference as current.

    const tryCompressAndStore = async () => {
      try {
        if (!item.data || typeof item.data !== 'string' || !item.data.startsWith('data:')) throw new Error('No inline image to compress');

        // create image from data URL
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            try {
              const maxDim = 1024;
              const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
              const w = Math.round(img.width * ratio);
              const h = Math.round(img.height * ratio);
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (!ctx) throw new Error('Canvas not supported');
              ctx.drawImage(img, 0, 0, w, h);
              // try multiple qualities
              const qualities = [0.8, 0.6, 0.4];
              let stored = false;
              for (const q of qualities) {
                try {
                  const compressed = canvas.toDataURL('image/jpeg', q);
                  const newItem: StoredItem = { ...item, data: compressed };
                  try {
                    localStorage.setItem(CURRENT_KEY, JSON.stringify(newItem));
                    stored = true;
                    break;
                  } catch (_e) {
                    // continue to next quality
                  }
                } catch (_e) {
                  // ignore and continue
                }
              }
              if (!stored) throw new Error('Unable to store compressed image');
              resolve();
            } catch (e) {
              reject(e);
            }
          };
          img.onerror = () => reject(new Error('Failed to load image for compression'));
          img.src = item.data as string;
        });
        return;
      } catch (e) {
        // compression failed or not possible; fall through to fallback
      }

      try {
        // fallback: push into uploaded_images and store lightweight ref as current
        const ref: StoredItem = { name: item.name, data: null, modelo: item.modelo, resultado: item.resultado, ts: item.ts };
        // push to STORAGE_KEY (keep limit enforcement in pushStored)
        const arr = getStored();
        arr.unshift({ ...item });
        setStored(arr.slice(0, 200));
        try {
          localStorage.setItem(CURRENT_KEY, JSON.stringify(ref));
        } catch (e2) {
          // if even reference can't be stored, remove current
          try {
            localStorage.removeItem(CURRENT_KEY);
          } catch {}
        }
      } catch (e3) {
        // give up silently
        try {
          localStorage.removeItem(CURRENT_KEY);
        } catch {}
      }
    };

    // fire and forget
    tryCompressAndStore();
  }
}

export function getCurrent(): StoredItem | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredItem;
    // if data missing, try to resolve from stored list by name/ts
    if ((!parsed.data || parsed.data === null) && parsed.name) {
      try {
        const arr = getStored();
        const found = arr.find((a) => a.name === parsed.name && a.ts === parsed.ts);
        if (found) return found;
      } catch {}
    }
    return parsed;
  } catch {
    return null;
  }
}
