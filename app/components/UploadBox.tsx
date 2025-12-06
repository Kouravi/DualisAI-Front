"use client";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { usePrediction } from "../context/PredictionContext";
import { pushStored, setCurrent } from "../lib/localStorage";
import Toast from "./Toast";
import "../styles/globals.css";

type HistoryItem = {
    name?: string;
    data?: string | null;
    modelo?: string | null;
    resultado?: any;
    ts?: number;
};

const API = ((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "")) + "/api/predict";
const STORAGE_KEY = "uploaded_images";

export default function UploadBox({ onNewPrediction }: { onNewPrediction?: (it: HistoryItem) => void }) {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [modelo, setModelo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlValue, setUrlValue] = useState("");
    const [dragActive, setDragActive] = useState(false);

    const router = useRouter();
    const { addPrediction } = usePrediction();

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length !== 1) {
            setToast("Solo se debe cargar 1 archivo (.jpg, .png, .jpeg)");
            if (e.target) e.target.value = "";
            return;
        }
        const selected = files[0];
        if (!["image/jpeg", "image/png", "image/jpg"].includes(selected.type)) {
            setToast("Formato inválido. Solo .jpg .jpeg .png");
            e.target.value = "";
            return;
        }
        setFile(selected);
    };

    // helper: validate mime or url extension
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const isValidUrlOrType = (urlOrType: string) => {
        if (allowedTypes.includes(urlOrType)) return true;
        return /\.(jpe?g|png)(\?.*)?$/i.test(urlOrType);
    };

    // paste support
    useEffect(() => {
        const onPaste = (e: ClipboardEvent) => {
            try {
                const items = (e.clipboardData && e.clipboardData.items) || [];
                for (let i = 0; i < items.length; i++) {
                    const it = items[i];
                    if (it.kind === 'file' && it.type.startsWith('image')) {
                        const file = it.getAsFile();
                        if (file) {
                            setFile(file);
                            setToast('Imagen pegada desde portapapeles');
                            return;
                        }
                    }
                    if (it.kind === 'string' && it.type === 'text/plain') {
                        it.getAsString((str: string) => {
                            if (/^https?:\/\//i.test(str) && isValidUrlOrType(str)) {
                                // treat as URL
                                loadFromUrl(str);
                            }
                        });
                    }
                }
            } catch (e) {
                // ignore
            }
        };
        window.addEventListener('paste', onPaste as any);
        return () => window.removeEventListener('paste', onPaste as any);
    }, []);

    // drag & drop handlers
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };
    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    };
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const dt = e.dataTransfer;
        if (!dt) return;
        if (dt.files && dt.files.length > 0) {
            const f = Array.from(dt.files).find((x) => x.type.startsWith('image'));
            if (f) {
                setFile(f);
                setToast('Imagen cargada por arrastre');
                return;
            }
        }
        // fallback: check for URI list
        const url = dt.getData('text/uri-list') || dt.getData('text/plain');
        if (url && /^https?:\/\//i.test(url)) {
            loadFromUrl(url);
        }
    };

    // load image from URL
    const loadFromUrl = async (url: string) => {
        try {
            setToast('Cargando imagen desde URL...');
            const res = await fetch(url);
            if (!res.ok) throw new Error('No se pudo descargar la imagen');
            const blob = await res.blob();
            const type = blob.type || '';
            if (!isValidUrlOrType(type) && !isValidUrlOrType(url)) {
                setToast('Formato inválido. Solo .jpg .jpeg .png');
                return;
            }
            const name = url.split('/').pop()?.split('?')[0] || `image-${Date.now()}.jpg`;
            const fileFromUrl = new File([blob], name, { type: blob.type || 'image/jpeg' });
            setFile(fileFromUrl);
            setToast('Imagen cargada desde URL');
        } catch (err) {
            setToast('Error al cargar imagen desde URL');
        }
    };

    const resetInput = () => {
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";

    };

    const submit = async () => {
        if (!file || !modelo) return;

        setLoading(true);

        try {
            const form = new FormData();
            form.append("tipo_modelo", modelo);
            form.append("file", file);

            const res = await axios.post(API, form);

            if (res.data?.prediccion) {
                // add to context for UI
                addPrediction({
                    filename: file.name,
                    tipo_modelo: modelo,
                    resultado: res.data.prediccion,
                    timestamp: new Date().toISOString(),
                });

                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result as string | null;

                    // Build mensaje_completo depending on modelo: especie only for mascotas, edad_estimacion only for humanos
                    const pred = res.data.prediccion || {};
                    let mensaje_parts: string[] = [];
                    if (pred.genero) mensaje_parts.push(pred.genero);
                    if (modelo === "mascota" && pred.especie) mensaje_parts.push(pred.especie);
                    if (modelo === "humano" && (pred.edad_estimacion ?? pred.edad)) mensaje_parts.push(pred.edad_estimacion ?? pred.edad);
                    if (pred.mensaje) mensaje_parts.push(pred.mensaje);

                    const item = {
                        name: file.name,
                        data: base64,
                        modelo,
                        resultado: pred,
                        ts: Date.now(),
                        mensaje_completo: mensaje_parts.join("\n"),
                    };

                    // PUSH to uploaded_images (GalleryCompactPrediction)
                    pushStored(item);

                    // set as current so /Prediction shows the new image immediately (handles compression/fallback)
                    try {
                        setCurrent(item as HistoryItem);
                    } catch (e) {
                        // ignore storage errors here; the storage helper already tries to recover
                    }

                    // notify parent (e.g. Prediction page) so it can update UI without reload
                    if (onNewPrediction) onNewPrediction(item as HistoryItem);

                    // Reset input (DO NOT set current)
                    setFile(null);
                    if (fileRef.current) fileRef.current.value = "";

                    setModelo(null);

                    router.push("/Prediction");


                };
                reader.readAsDataURL(file);
            }
        } catch (err) {
            setToast("Error al predecir");
        } finally {
            setLoading(false);
        }
        // refresh page to update Prediction page components if needed
        router.refresh();
    };

    return (
        <>
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}

            {/* Blocking loader overlay shown while `loading` is true. Covers the viewport and prevents clicks. */}
            {loading && (
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
            )}

            {showUrlInput && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-300 rounded">
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            placeholder="Pega la URL de la imagen (https://... .jpg/.png)"
                            className="flex-1 p-2 border rounded"
                        />
                        <button
                            onClick={() => {
                                if (!urlValue) return setToast('Ingresa una URL');
                                if (!/^https?:\/\//i.test(urlValue) || !/\.(jpe?g|png)(\?.*)?$/i.test(urlValue)) {
                                    return setToast('URL inválida. Use .jpg/.jpeg/.png');
                                }
                                loadFromUrl(urlValue);
                                setShowUrlInput(false);
                                setUrlValue('');
                            }}
                            className="px-3 py-2 bg-indigo-600 text-white rounded"
                        >
                            Cargar
                        </button>
                        <button onClick={() => { setShowUrlInput(false); setUrlValue(''); }} className="px-3 py-2 bg-gray-100 rounded">Cancelar</button>
                    </div>
                </div>
            )}

            <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`bg-white p-6 rounded-2xl w-full h-full flex flex-col justify-center ${dragActive ? 'border-4 border-dashed border-indigo-300' : ''}`}
                style={{ boxShadow: '0 0 70px 0 rgba(89, 105, 88, 0.37)' }}
            >
                <input ref={fileRef} type="file" className="hidden" onChange={handleFile} accept=".jpg,.jpeg,.png" />

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full py-3 rounded-full text-lg transition b-grad-load"
                        // style={{ backgroundColor: '#FFA500' }}
                        aria-label="Cargar imagen"
                    >
                        Cargar imagen
                    </button>

                    <div className="text-sm text-justify text-slate-500">
                        <span>Seleccione un modelo de IA:</span>
                    </div>

                    <div className="flex gap-3 justify-center">

                        <label className={`px-3 py-2 rounded cursor-pointer ${modelo === "humano" ? "bg-[#18d9d9]/20 border-[#18d9d9] border" : "bg-gray-100"}`}
                        style={{color: 'rgba(9, 9, 9, 0.81)'}}>
                            <input type="radio" className="hidden" onChange={() => setModelo("humano")} checked={modelo === "humano"} />
                            Humano
                        </label>

                        <label className={`px-3 py-2 rounded cursor-pointer ${modelo === "mascota" ? "bg-[#18d9d9]/20 border-[#18d9d9] border" : "bg-gray-100"}`}
                        style={{color: 'rgba(9, 9, 9, 0.81)'}}>
                            <input type="radio" className="hidden" onChange={() => setModelo("mascota")} checked={modelo === "mascota"} />
                            Mascota
                        </label>
                    </div>

                    <div
                    onClick={submit}
                    className="text-sm text-center text-slate-500">
                        {!modelo && ( <span>No hay un modelo seleccionado</span>)}
                    </div>

                    <button
                        disabled={!file || !modelo || loading}
                        onClick={submit}
                        className={`w-full py-2 rounded-md text-white mt-2 ${!file || !modelo ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-95 b-grad-pred"}`}
                        // style={!file || !modelo ? undefined : { backgroundColor: '#1858D9' }}
                    >
                        {loading ? "Procesando..." : "Analizar imagen"}
                    </button>

                    <div className="text-sm text-center text-slate-500">
                        {file ? <span>Archivo seleccionado: {file.name}</span> : <span>No hay archivo seleccionado.</span>}
                    </div>

                    <div className="text-center text-sm text-slate-500 mt-2">
                        Arrastra una imagen, pega la imagen o usa una {' '}
                        <button type="button" onClick={() => setShowUrlInput(true)} className="text-indigo-600 hover:underline">URL</button>
                    </div>
                </div>
            </div>
        </>
    );
}