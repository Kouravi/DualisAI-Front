// "use client";
// import React, { useEffect, useState } from "react";
// import UploadBox from "../components/UploadBox";
// import ImageVisualizer from "../components/ImageVisualizer";
// import GalleryCompactPrediction from "../components/GalleryCompactPrediction";
// import {
//   getCurrent as getCurrentStored,
//   getStored,
//   setCurrent as setCurrentStored,
//   pushStored,
// } from "../lib/localStorage";
// import GalleryCompactHome from "../components/GalleryCompactHome";

// export default function Prediction() {
//   const [initialized, setInitialized] = useState(false);   // 🔹 Nuevo: evita el flash
//   const [storedList, setStoredList] = useState<any[]>([]);
//   const [current, setCurrent] = useState<any>(null);

//   // -----------------------------
//   // 1) Sincronizar con storage al montar
//   // -----------------------------
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const syncFromStorage = () => {
//       let list = getStored();
//       let curr = getCurrentStored();

//       // Procesar item pendiente desde GalleryCompactHome (sessionStorage)
//       try {
//         const pendingRaw = sessionStorage.getItem("pending_current_item");
//         if (pendingRaw) {
//           const pending = JSON.parse(pendingRaw);

//           // si no existe en la lista, lo añadimos
//           const exists = list.some(
//             (i: any) => i.ts === pending.ts && i.name === pending.name
//           );
//           if (!exists) {
//             try {
//               pushStored(pending);
//             } catch {
//               /* ignore quota/errores */
//             }
//             list = [pending, ...list];
//           }

//           // lo marcamos como current
//           try {
//             setCurrentStored(pending);
//           } catch { /* ignore */ }
//           curr = pending;

//           // limpiamos para que no reprocese
//           sessionStorage.removeItem("pending_current_item");
//         }
//       } catch {
//         // ignore parse errors
//       }

//       setStoredList(list);
//       setCurrent(curr);
//       setInitialized(true);
//     };

//     // primera sincronización
//     syncFromStorage();

//     // listener de cambios en localStorage (otras pestañas)
//     const onStorage = () => {
//       syncFromStorage();
//     };
//     window.addEventListener("storage", onStorage);

//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   // -----------------------------
//   // 2) Handlers
//   // -----------------------------

//   // cuando viene una predicción nueva desde UploadBox
//   const handleNewPrediction = (it: any) => {
//     setStoredList((s) => [it, ...s]);
//     try {
//       setCurrentStored(it);
//     } catch { /* ignore */ }
//     setCurrent(it);
//   };

//   // cuando eliges una imagen de la galería inferior
//   const handleSelectFromGallery = (item: any, index: number) => {
//     try {
//       setCurrentStored(item);
//     } catch { /* ignore */ }
//     setCurrent(item);
//   };

//   // cuando se borra desde ImageVisualizer
//   const handleDeletedVisualizer = () => {
//     // tras la animación, sincronizamos de nuevo
//     setTimeout(() => {
//       setStoredList(getStored());
//       setCurrent(getCurrentStored());
//     }, 800);
//   };

//   // cuando la galería queda vacía (borraste todo desde GalleryCompactPrediction)
//   const handleGalleryEmpty = () => {
//     setStoredList([]);
//     try {
//       setCurrentStored(null);
//     } catch { /* ignore */ }
//     setCurrent(null);
//   };

//   // -----------------------------
//   // 3) Derivado: ¿está vacío?
//   // -----------------------------
//   const isEmpty = initialized && storedList.length === 0 && !current;

//   // Mientras no está inicializado, evitamos mostrar layout "incorrecto"
//   if (!initialized) {
//     return (
//       <section className="py-6 min-h-screen flex items-center justify-center">
//         <div className="animate-pulse text-gray-500 text-sm">
//           Cargando tus imágenes...
//         </div>
//       </section>
//     );
//   }

//   // -----------------------------
//   // 4) Render
//   // -----------------------------
//   return (
//     <section className="py-6 min-h-screen">
//       <div className="max-w-7xl mx-auto px-6">
//         {isEmpty ? (
//           // ============================
//           // Vista VACÍA (sin imágenes)
//           // ============================
//           <div className="min-h-[50vh] flex items-center justify-center">
//             <div
//               className="w-full max-w-md"
//               style={{ height: "min(50vh, 340px)", color: "rgba(9, 9, 9, 0.81)" }}
//             >
//               <h1
//                 className="text-2xl font-semibold text-center mb-6"
//                 style={{ color: "rgba(9, 9, 9, 0.81)" }}
//               >
//                 Sube una imagen para observar lo que la IA detecta
//               </h1>

//               {/* Upload centrado */}
//               <UploadBox onNewPrediction={handleNewPrediction} />

//               {/* Miniaturas de ejemplo */}
//               <div className="mt-5">
//                 <h2
//                   className="font-semibold mb-4 text-center"
//                   style={{ color: "rgba(9, 9, 9, 0.81)" }}
//                 >
//                   Si no tienes imágenes prueba con una de estas:
//                 </h2>
//                 <GalleryCompactHome/>
//               </div>

//               <p className="justify-center text-center mt-5 text-sm text-gray-500">
//                 DUALIS puede cometer errores. Comprueba la información importante.
//               </p>
//             </div>
//           </div>
//         ) : (
//           // ============================
//           // Vista CON HISTORIAL
//           // ============================
//           <>
//             <h1
//               className="text-2xl font-semibold text-center mb-6 mt-2"
//               style={{ color: "rgba(9, 9, 9, 0.81)" }}
//             >
//               ¡Me encanta observar tus imágenes!, ¿Observamos otra?
//             </h1>

//             {/* Zona superior: Upload + Visualizador */}
//             <div
//               className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
//               style={{ minHeight: "calc(80vh - 220px)" }}
//             >
//               {/* Upload */}
//               <div className="flex items-center justify-center">
//                 <div
//                   className="w-full max-w-md"
//                   style={{ height: "min(50vh, 560px)" }}
//                 >
//                   <UploadBox onNewPrediction={handleNewPrediction} />
//                 </div>
//               </div>

//               {/* Visualizador */}
//               <div className="flex items-center justify-center">
//                 <div
//                   className="w-full max-w-md"
//                   style={{ height: "min(50vh, 560px)" }}
//                 >
//                   <ImageVisualizer
//                     current={current}
//                     onDeleted={handleDeletedVisualizer}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Galería compacta inferior */}
//             <div className="col-span-2 mt-6 flex justify-center">
//               <div className="w-full max-w-5xl">
//                 <GalleryCompactPrediction
//                   items={storedList}
//                   onSelect={handleSelectFromGallery}
//                   onDeleted={handleGalleryEmpty}
//                 />
//                 <p className="justify-center text-center text-sm text-gray-500">
//                   DUALIS puede cometer errores. Comprueba la información
//                   importante.
//                 </p>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// }

"use client";
import React, { useEffect, useState } from "react";
import UploadBox from "../components/UploadBox";
import ImageVisualizer from "../components/ImageVisualizer";
import GalleryCompactPrediction from "../components/GalleryCompactPrediction";
import {
  getCurrent as getCurrentStored,
  getStored,
  setCurrent as setCurrentStored,
  pushStored,
} from "../lib/localStorage";
import GalleryCompactHome from "../components/GalleryCompactHome";

export default function Prediction() {
  const [initialized, setInitialized] = useState(false);
  const [storedList, setStoredList] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);

  // -----------------------------
  // 1) Sincronizar con storage al montar
  // -----------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      let list = getStored();
      let curr = getCurrentStored();

      // Procesar item pendiente desde GalleryCompactHome (Home → Prediction)
      try {
        const pendingRaw = sessionStorage.getItem("pending_current_item");
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw);

          const exists = list.some(
            (i: any) => i.ts === pending.ts && i.name === pending.name
          );
          if (!exists) {
            try {
              pushStored(pending);
            } catch {
              /* ignore quota/errores */
            }
            list = [pending, ...list];
          }

          try {
            setCurrentStored(pending);
          } catch { /* ignore */ }
          curr = pending;

          sessionStorage.removeItem("pending_current_item");
        }
      } catch {
        // ignore parse errors
      }

      setStoredList(list);
      setCurrent(curr);
      setInitialized(true);
    };

    // primera sincronización
    syncFromStorage();

    const onStorage = () => {
      syncFromStorage();
    };
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // -----------------------------
  // 2) Handlers
  // -----------------------------

  // Cuando viene una predicción nueva desde UploadBox
  const handleNewPrediction = (it: any) => {
    setStoredList((s) => [it, ...s]);
    try {
      setCurrentStored(it);
    } catch { /* ignore */ }
    setCurrent(it);
  };

  // Cuando se elige una imagen desde la galería inferior
  const handleSelectFromGallery = (item: any, index: number) => {
    try {
      setCurrentStored(item);
    } catch { /* ignore */ }
    setCurrent(item);
  };

  // Cuando se borra desde ImageVisualizer
  const handleDeletedVisualizer = () => {
    setTimeout(() => {
      setStoredList(getStored());
      setCurrent(getCurrentStored());
    }, 800);
  };

  // Cuando la galería queda vacía
  const handleGalleryEmpty = () => {
    setStoredList([]);
    try {
      setCurrentStored(null);
    } catch { /* ignore */ }
    setCurrent(null);
  };

  // Cuando se hace predicción desde GalleryCompactHome en /Prediction vacío
  const handleSamplePrediction = (item: any) => {
    setStoredList((s) => [item, ...s]);
    try {
      setCurrentStored(item);
    } catch { /* ignore */ }
    setCurrent(item);
  };

  // -----------------------------
  // 3) Derivado: ¿está vacío?
  // -----------------------------
  const isEmpty = initialized && storedList.length === 0 && !current;

  // -----------------------------
  // 4) Skeleton loader mientras no inicializa
  // -----------------------------
  if (!initialized) {
    return (
      // <section className="py-6 min-h-screen flex items-center justify-center">
      //   <div className="max-w-4xl w-full px-6">
      //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      //       {/* Skeleton Upload */}
      //       <div className="h-[320px] rounded-2xl bg-white/70 shadow animate-pulse">
      //         <div className="h-full w-full p-6 space-y-4">
      //           <div className="h-5 w-2/3 bg-slate-200 rounded"></div>
      //           <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
      //           <div className="h-10 w-full bg-slate-200 rounded-full mt-6"></div>
      //           <div className="h-4 w-3/4 bg-slate-200 rounded mt-6"></div>
      //         </div>
      //       </div>

      //       {/* Skeleton Visualizer */}
      //       <div className="h-[320px] rounded-2xl bg-white/70 shadow animate-pulse">
      //         <div className="h-full w-full p-6 space-y-4">
      //           <div className="h-5 w-1/3 bg-slate-200 rounded"></div>
      //           <div className="h-48 w-full bg-slate-200 rounded-xl mt-4"></div>
      //         </div>
      //       </div>
      //     </div>
      //   </div>
      // </section>
      <div
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        role="status"
        aria-live="polite"
      >
        <div className="bg-white/90 p-6 rounded-lg flex flex-col items-center gap-3 shadow-lg">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // -----------------------------
  // 5) Render principal
  // -----------------------------
  return (
    <section className="py-6 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {isEmpty ? (
          // ============================
          // Vista VACÍA
          // ============================
          <div className="min-h-[50vh] flex items-center justify-center">
            <div
              className="w-full max-w-md"
              style={{ height: "min(50vh, 340px)", color: "rgba(9, 9, 9, 0.81)" }}
            >
              <h1
                className="text-2xl font-semibold text-center mb-6"
                style={{ color: "rgba(9, 9, 9, 0.81)" }}
              >
                Sube una imagen para observar lo que la IA detecta
              </h1>

              <UploadBox onNewPrediction={handleNewPrediction} />

              <div className="mt-5">
                <h2
                  className="font-semibold mb-4 text-center"
                  style={{ color: "rgba(9, 9, 9, 0.81)" }}
                >
                  Si no tienes imágenes prueba con una de estas:
                </h2>
                {/* Aquí pasamos el callback especial para Prediction vacío */}
                <GalleryCompactHome onSamplePrediction={handleSamplePrediction} />
              </div>

              <p className="justify-center text-center mt-5 text-sm text-gray-500">
                DUALIS puede cometer errores. Comprueba la información importante.
              </p>
            </div>
          </div>
        ) : (
          // ============================
          // Vista CON HISTORIAL
          // ============================
          <>
            <h1
              className="text-2xl font-semibold text-center mb-6 mt-2"
              style={{ color: "rgba(9, 9, 9, 0.81)" }}
            >
              ¡Me encanta observar tus imágenes!, ¿Observamos otra?
            </h1>

            {/* Top: Upload + Visualizador */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              style={{ minHeight: "calc(80vh - 220px)" }}
            >
              <div className="flex items-center justify-center">
                <div
                  className="w-full max-w-md"
                  style={{ height: "min(50vh, 560px)" }}
                >
                  <UploadBox onNewPrediction={handleNewPrediction} />
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div
                  className="w-full max-w-md"
                  style={{ height: "min(50vh, 560px)" }}
                >
                  <ImageVisualizer
                    current={current}
                    onDeleted={handleDeletedVisualizer}
                  />
                </div>
              </div>
            </div>

            {/* Galería compacta inferior */}
            <div className="col-span-2 mt-6 flex justify-center">
              <div className="w-full max-w-5xl">
                <GalleryCompactPrediction
                  items={storedList}
                  onSelect={handleSelectFromGallery}
                  onDeleted={handleGalleryEmpty}
                />
                <p className="justify-center text-center text-sm text-gray-500">
                  DUALIS puede cometer errores. Comprueba la información
                  importante.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}