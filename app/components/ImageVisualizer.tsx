"use client";
import React, { useEffect, useState } from "react";
import {
  getCurrent,
  setCurrent,
  removeStoredByName,
  getStored,
} from "../lib/localStorage";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
    subsets: ["latin"],
    weight: "400",
  });

type Props = {
  current?: any;
  onDeleted?: () => void;
};

export default function ImageVisualizer({ current: externalCurrent, onDeleted }: Props) {
  const [current, setC] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Preferimos la prop externa; si no, leemos del storage
  useEffect(() => {
    setC(externalCurrent ?? getCurrent());
  }, [externalCurrent]);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const onStorage = () => setC(externalCurrent ?? getCurrent());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [externalCurrent]);

  const handleDelete = () => {
    if (!current?.name) return;

    setDeleting(true);

    setTimeout(() => {
      const stored = getStored();
      const found = stored.find((s) => s.name === current.name);
      if (found) removeStoredByName(current.name);

      setCurrent(null);

      if (onDeleted) onDeleted();

      // recarga suave después de la animación (~1s)
      window.location.reload();
    }, 1000);
  };

  // Estado vacío
  if (!current) {
    return (
      <div
        className="w-full h-full bg-white/80 rounded-3xl flex items-center justify-center p-6
                   shadow-[0_0_70px_0_rgba(89,105,88,0.37)]"
      >
        <div className="text-gray-400 text-center">
          <p className="text-lg font-semibold">Aún no hemos empezado</p>
          <p className="text-sm mt-2">Sube o selecciona una imagen para comenzar</p>
        </div>
      </div>
    );
  }

  

  // Construimos las líneas de texto (género, edad, mensaje…)
  const genero = current.resultado?.genero ?? "";
  const especie = current.resultado?.especie ?? "";
  const edad =
    current.resultado?.edad_estimacion ??
    current.resultado?.edad ??
    "";
  const mensaje = current.resultado?.mensaje ?? "";

  const lines: string[] = current.mensaje_completo
    ? String(current.mensaje_completo)
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean)
    : [genero || especie, edad, mensaje].filter(Boolean);

  return (
    <div
      className={`relative w-full h-full bg-white rounded-3xl overflow-hidden
                  shadow-[0_0_70px_0_rgba(89,105,88,0.37)]
                  transition-all duration-700 ease-out
                  ${deleting ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
    >
      {/* Imagen de fondo */}
      <img
        src={current.data}
        alt={current.name}
        className="w-full h-full object-cover"
      />

      {/* Burbuja translúcida centrada con el texto */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white/25 dark:bg-[#a6a6a6]/20 backdrop-blur-md  
           px-8 py-6 rounded-[40px] max-w-[80%] text-center
           text-[rgba(9, 9, 9, 0.81)] dark:text-[#090909]/81
           shadow-none transition-all duration-1000"
        >
          {lines.map((line, idx) => (
            <p
              key={idx}
              className={
                idx === 0
                  ? "text-xl md:text-2xl font-semibold mb-1"
                  : idx === 1 && lines.length > 2
                    ? "text-lg md:text-xl mb-1"
                    : `mt-2 text-2xl md:text-4xl font-normal tracking-wide 
                      leading-snug ${greatVibes.className}`
              }
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Botón papelera arriba a la derecha */}
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90
                   hover:bg-red-600 hover:text-white text-gray-700
                   dark:text-gray-100 p-2 rounded-full shadow
                   transition-colors duration-200 z-10"
        title="Eliminar imagen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M9 4h6m-8 3h10m-8 3v7m4-7v7M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
        </svg>
      </button>
    </div>
  );
}