// app/components/TechBubbles.tsx
"use client";

import React from "react";
import {
  FaReact,
  FaNodeJs,
  FaPython,
  FaGitAlt,
  FaFigma,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiTailwindcss,
  SiMongodb,
  SiFastapi,
  SiTensorflow,
  SiTypescript,
} from "react-icons/si";

type TechBubble = {
  name: string;
  icon: React.ReactNode;
  group: "frontend" | "backend" | "ml" | "uxui" | "tools";
  sizeClass: string;
};

const techs: TechBubble[] = [
  {
    name: "Next.js",
    icon: <SiNextdotjs />,
    group: "frontend",
    sizeClass: "w-20 h-20 sm:w-24 sm:h-24",
  },
  {
    name: "React",
    icon: <FaReact />,
    group: "frontend",
    sizeClass: "w-16 h-16 sm:w-20 sm:h-20",
  },
  {
    name: "TypeScript",
    icon: <SiTypescript />,
    group: "frontend",
    sizeClass: "w-16 h-16 sm:w-20 sm:h-20",
  },
  {
    name: "Tailwind CSS",
    icon: <SiTailwindcss />,
    group: "frontend",
    sizeClass: "w-18 h-18 sm:w-22 sm:h-22",
  },
  {
    name: "FastAPI",
    icon: <SiFastapi />,
    group: "backend",
    sizeClass: "w-18 h-18 sm:w-22 sm:h-22",
  },
  {
    name: "Node.js",
    icon: <FaNodeJs />,
    group: "backend",
    sizeClass: "w-16 h-16 sm:w-20 sm:h-20",
  },
  {
    name: "MongoDB",
    icon: <SiMongodb />,
    group: "backend",
    sizeClass: "w-16 h-16 sm:w-20 sm:h-20",
  },
  {
    name: "TensorFlow",
    icon: <SiTensorflow />,
    group: "ml",
    sizeClass: "w-18 h-18 sm:w-22 sm:h-22",
  },
  {
    name: "Python",
    icon: <FaPython />,
    group: "ml",
    sizeClass: "w-16 h-16 sm:w-20 sm:h-20",
  },
  {
    name: "UX / UI",
    icon: <FaFigma />,
    group: "uxui",
    sizeClass: "w-18 h-18 sm:w-22 sm:h-22",
  },
  {
    name: "Git",
    icon: <FaGitAlt />,
    group: "tools",
    sizeClass: "w-14 h-14 sm:w-18 sm:h-18",
  },
];

const groupGradient: Record<TechBubble["group"], string> = {
  frontend: "from-sky-400 via-indigo-500 to-blue-600",
  backend: "from-emerald-400 via-emerald-500 to-teal-600",
  ml: "from-amber-400 via-orange-500 to-red-500",
  uxui: "from-pink-400 via-rose-500 to-fuchsia-500",
  tools: "from-slate-400 via-slate-500 to-slate-700",
};

export default function TechBubbles() {
  return (
    <div className="w-full flex flex-col items-center gap-8">
      <p className="text-sm text-gray-500 uppercase tracking-[0.2em]">
        Tecnologías que hacen magia
      </p>

      {/* “Nube” de burbujas */}
      <div className="relative w-full max-w-3xl mx-auto h-[260px] sm:h-[320px]">
        <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          {techs.map((tech, index) => (
            <div
              key={tech.name}
              className={[
                "group rounded-full flex items-center justify-center text-white shadow-xl",
                "backdrop-blur-sm cursor-default",
                "transition-transform transition-shadow duration-300",
                "hover:scale-110 hover:shadow-2xl",
                tech.sizeClass,
                "bg-gradient-to-br",
                groupGradient[tech.group],
                // ligera “disposición” tipo globo
                index % 4 === 0
                  ? "translate-y-3"
                  : index % 4 === 1
                  ? "-translate-y-2"
                  : index % 4 === 2
                  ? "translate-y-1"
                  : "-translate-y-3",
              ].join(" ")}
            >
              <span className="text-2xl sm:text-3xl drop-shadow-md">
                {tech.icon}
              </span>
              {/* tooltip simple */}
              <span className="pointer-events-none absolute top-full mt-2 px-2 py-1 rounded-full text-[11px] sm:text-xs bg-black/70 text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* leyenda / categorías */}
      <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-gray-600">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-blue-600" />
          Frontend
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600" />
          Backend / API
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500" />
          IA / ML
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-500" />
          UX · UI
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700" />
          Herramientas
        </span>
      </div>
    </div>
  );
}