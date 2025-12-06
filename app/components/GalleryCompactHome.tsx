// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { setCurrent, pushStored, getStored } from "../lib/localStorage";
// import { galleryCompactHome } from "./gallery/GalleryCompact";

// const sampleThumbs = galleryCompactHome;

// export default function GalleryCompactHome() {
//   const [items, setItems] = useState<typeof sampleThumbs>([]);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const API = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "") + "/api/predict";

//   useEffect(() => {
//     const shuffled = [...sampleThumbs].sort(() => 0.5 - Math.random()).slice(0, 5);
//     setItems(shuffled);
//   }, []);

//   // click: fetch asset, POST predict, set current and navigate to /Prediction
//   const onClickThumb = async (src: string, modelo: string) => {
//     if (loading) return;
//     setLoading(true);
//     try {
//       const resp = await fetch(src);
//       const blob = await resp.blob();
//       const filename = src.split("/").pop() || `thumb-${Date.now()}`;
//       const file = new File([blob], filename, { type: blob.type });

//       const form = new FormData();
//       form.append("tipo_modelo", modelo);
//       form.append("file", file);

//       const res = await axios.post(API, form);
//       const pred = res.data?.prediccion ?? res.data ?? null;

//       // create base64 to store as current (ImageVisualizer reads CURRENT_KEY)
//       const reader = new FileReader();
//       reader.onload = () => {
//         const base64 = reader.result as string | null;
//         let mensaje_parts: string[] = [];
//         if (pred.genero) mensaje_parts.push(pred.genero);
//         if (modelo === "mascota" && pred.especie) mensaje_parts.push(pred.especie);
//         if (modelo === "humano" && (pred.edad_estimacion ?? pred.edad)) mensaje_parts.push(pred.edad_estimacion ?? pred.edad);
//         if (pred.mensaje) mensaje_parts.push(pred.mensaje);
//         const item = {
//           name: filename,
//           data: base64,
//           modelo,
//           resultado: pred,
//           ts: Date.now(),
//           mensaje_completo: mensaje_parts.join("\n"),
//         };
//         try {
//           // persist into uploaded_images immediately so history is available
//           try { pushStored(item); } catch { }

//           // store pending item in sessionStorage in case the Prediction page still needs to process it
//           sessionStorage.setItem('pending_current_item', JSON.stringify(item));
//         } catch (e) {
//           // fallback: set current directly if sessionStorage fails
//           try { setCurrent(item); } catch { }
//         }
//         // navigate to Prediction where the page will load the pending item

//         router.push("/Prediction");

//         // window.location.reload();
//       };
//       reader.readAsDataURL(file);

//     } catch (err) {
//       console.error("Error predicting gallery thumb:", err);
//       alert("Error al predecir la miniatura seleccionada");
//     } finally {
//       // allow a small delay so navigation starts before clearing loader
//       setTimeout(() => setLoading(false), 200);
//     }
//   };

//   return (
//     <div className="w-full flex justify-center">
//       {loading && (
//         <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
//           <div className="bg-white/95 p-4 rounded shadow">
//             <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
//             </svg>
//           </div>
//         </div>
//       )}
//       <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 text-center">
//         {items.map((it, i) => (
//           <button
//             key={i}
//             onClick={() => onClickThumb(it.src, it.modelo)}
//             disabled={loading}
//             className={`w-[60px] h-[60px] rounded-lg overflow-hidden shadow-sm transform hover:scale-105 transition ${loading ? 'opacity-60' : ''}`}
//             title={`Usar miniatura ${i + 1}`}
//           >
//             <img src={it.src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { setCurrent, pushStored } from "../lib/localStorage";
import { galleryCompactHome } from "./gallery/GalleryCompact";

const sampleThumbs = galleryCompactHome;

type Props = {
  // opcional: si se pasa, se usa en /Prediction vacío para actualizar el estado sin navegar
  onSamplePrediction?: (item: any) => void;
};

export default function GalleryCompactHome({ onSamplePrediction }: Props) {
  const [items, setItems] = useState<typeof sampleThumbs>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const API =
    (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(
      /\/$/,
      ""
    ) + "/api/predict";

  useEffect(() => {
    const shuffled = [...sampleThumbs].sort(() => 0.5 - Math.random()).slice(0, 5);
    setItems(shuffled);
  }, []);

  const onClickThumb = async (src: string, modelo: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const resp = await fetch(src);
      const blob = await resp.blob();
      const filename = src.split("/").pop() || `thumb-${Date.now()}`;
      const file = new File([blob], filename, { type: blob.type });

      const form = new FormData();
      form.append("tipo_modelo", modelo);
      form.append("file", file);

      const res = await axios.post(API, form);
      const pred = res.data?.prediccion ?? res.data ?? null;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string | null;

        const mensaje_parts: string[] = [];
        if (pred?.genero) mensaje_parts.push(pred.genero);
        if (modelo === "mascota" && pred?.especie) mensaje_parts.push(pred.especie);
        if (modelo === "humano" && (pred?.edad_estimacion ?? pred?.edad)) {
          mensaje_parts.push(pred.edad_estimacion ?? pred.edad);
        }
        if (pred?.mensaje) mensaje_parts.push(pred.mensaje);

        const item = {
          name: filename,
          data: base64,
          modelo,
          resultado: pred,
          ts: Date.now(),
          mensaje_completo: mensaje_parts.join("\n"),
        };

        // Comportamiento depende de dónde estemos / si hay callback
        if (onSamplePrediction) {
          // Modo /Prediction vacío: actualizamos estado y storage, sin navegar
          try {
            pushStored(item);
          } catch { /* ignore */ }
          try {
            setCurrent(item);
          } catch { /* ignore */ }
          onSamplePrediction(item);
        } else {
          // Modo /Home (u otra ruta): dejamos item pendiente y navegamos a /Prediction
          try {
            pushStored(item);
          } catch { /* ignore */ }
          try {
            setCurrent(item);
          } catch { /* ignore */ }
          sessionStorage.setItem("pending_current_item", JSON.stringify(item));
          if (pathname !== "/Prediction") {
            router.push("/Prediction");
          } else {
            // ya estamos en /Prediction, forzamos un pequeño refresh suave si se da el caso
            router.refresh();
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error predicting gallery thumb:", err);
      alert("Error al predecir la miniatura seleccionada");
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  };

  return (
    <div className="w-full flex justify-center">
      {loading && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
          <div className="bg-white/95 p-4 rounded shadow">
            <svg
              className="animate-spin h-6 w-6 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => onClickThumb(it.src, it.modelo)}
            disabled={loading}
            className={`w-[60px] h-[60px] rounded-lg overflow-hidden shadow-sm transform hover:scale-105 transition ${
              loading ? "opacity-60" : ""
            }`}
            title={`Usar miniatura ${i + 1}`}
          >
            <img src={it.src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}