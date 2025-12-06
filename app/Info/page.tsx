// app/Info/page.tsx
import React from "react";
import "../styles/globals.css";
import TechBubbles from "../components/TechBubbles";

export default function InfoPage() {
  return (
    <section className="min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-6">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold h-title mb-4" style={{ color: 'rgba(9, 9, 9, 0.81)' }}>
            Acerca de <span className="text-indigo-600 logo-gradient">DUALIS</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Combinamos tecnologías de frontend, backend e inteligencia
            artificial para detectar si ves una mascota o una persona y
            contarte algo especial sobre ella.
          </p>
        </header>

        <TechBubbles />

        <div className="mt-10 grid md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold mb-2">Experiencia de usuario (UX)</h2>
            <p>
              Interacciones pensadas para que la predicción se sienta rápida,
              clara y agradable, desde la carga de imágenes hasta el historial.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold mb-2">Interfaz (UI)</h2>
            <p>
              Inspiración en interfaces como Apple Watch y herramientas de
              edición de imágenes modernas: burbujas, sombras suaves, gradientes
              y animaciones sutiles.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold mb-2">Arquitectura técnica</h2>
            <p>
              Frontend con Next.js + TypeScript, API en FastAPI/Node, modelos
              de IA con TensorFlow y almacenamiento de predicciones en MongoDB.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}