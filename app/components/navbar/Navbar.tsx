"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { nav } from "./NavigationItems";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Cerrar al hacer clic fuera del menú
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="backdrop-blur-lg bg-white/5 border-b border-white/10 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Left side */}
          <div className="flex items-center gap-6">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="sm:hidden p-2 rounded-md focus:outline-none transition"
            >
              {open ? (
                <XMarkIcon className="h-7 w-7 text-slate-900" />
              ) : (
                <Bars3Icon className="h-7 w-7 text-slate-900" />
              )}
            </button>

            {/* Brand */}
            <Link
              href="/Home"
              className="inline-flex items-center gap-2 text-xl font-bold tracking-tight logo-gradient"
              onClick={closeMenu}
            >
              <img src="/samples/logo_r.png" alt="DUALIS" className="h-9 w-9 object-cover" />
              DUALIS
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex sm:gap-3">
              {nav.slice(1).map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                    pathname === item.href
                      ? "bg-slate-700/20 text-black"
                      : "hover:bg-slate-500/10 text-gray-800"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-3">
            <a href="https://github.com/Kouravi" target="_blank">
              <img src="/samples/github.png" className="h-8 w-8 hover:opacity-80" />
            </a>
            <a href="https://linkedin.com/in/jdlod" target="_blank">
              <img src="/samples/linkedin.png" className="h-8 w-8 hover:opacity-80" />
            </a>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          ref={menuRef}
          className={`sm:hidden transition-all duration-300 overflow-hidden ${
            open ? "max-h-60 opacity-100 mt-2 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-1">
            {nav.map(item => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-amber-400 to-cyan-500 text-white"
                    : "text-gray-700 hover:bg-gray-100/60"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
