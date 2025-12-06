"use client";

import UploadBox from "../components/UploadBox";
import GalleryCompactHome from "../components/GalleryCompactHome";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-indigo-50 p-6">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-10">
                {/* Left content (visual + text) */}
                <div className="flex-1 flex flex-col items-center lg:items-start gap-6">
                    <img src="./samples/ImageH.png" />
                    <h1 className="font-sans font-bold text-typo m-0 text-4xl md:text-5xl lg:text-6xl text-center md:!text-left" style={{color: 'rgba(9, 9, 9, 0.81)'}}>
                        Descubre lo que ves</h1>
                    <p className="text-gray-600">Automatizado 100% con <span className="text-indigo-600 logo-gradient">IA</span> y <span className="text-indigo-600 logo-gradient">GRATIS</span></p>
                </div>

                {/* Right: Upload (center vertical) */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <UploadBox />
                    </div>
                </div>
            </div>

            {/* Gallery below upload */}
            <div className="max-w-2xl mx-auto mt-20 w-full flex justify-center">
                <h2 className="font-semibold mb-4" style={{color: 'rgba(9, 9, 9, 0.81)'}}>Si no tienes imágenes prueba con una de estas:</h2>
                <GalleryCompactHome />
            </div>
            <p className="justify-center text-center mt-10 text-sm text-gray-500">
                DUALIS puede cometer errores. Comprueba la información importante.
            </p>
        </div>
    );
}
