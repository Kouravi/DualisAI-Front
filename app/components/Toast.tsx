"use client";

import React from "react";

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-md shadow-lg z-50">
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="bg-white text-red-600 font-bold px-2 py-1 rounded"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}