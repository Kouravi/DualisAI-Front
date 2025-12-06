import "./styles/globals.css";
import { PredictionProvider } from "./context/PredictionContext";
import Navbar from "./components/navbar/Navbar";
import { Inter, Poppins } from "next/font/google";
import ActivityCleaner from "./components/ActivityCleaner";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    weight: ["400", "600"]
});
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["600", "700"],
    variable: "--font-poppins"
});

export const metadata = {
    title: "AI HumanPets",
    description: "Descubre mascotas y personas con IA"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" className={`${inter.variable} ${poppins.variable}` }>
            <body className="bg-gradient-to-tr from-gray-50 to-indigo-50">
                <PredictionProvider>
                    <Navbar />
                    <main>{children}</main>
                    <ActivityCleaner />
                </PredictionProvider>
            </body>
        </html >
    );
}