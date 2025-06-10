import React, { useState } from 'react';
import './index.css';
import logo from '/PRISMA_BEGECLARO.png';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* Background */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center brightness-75 z-0"
        style={{ backgroundImage: "url('/studio.jpg')" }}
      ></div>

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-16 md:h-24" />
          </div>

          {/* Ícone hamburguer em mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Links - desktop */}
          <ul className="hidden md:flex gap-8 text-sm uppercase">
            <li><a href="#portfolio" className="hover:text-gray-300">Portfólio</a></li>
            <li><a href="#sobre" className="hover:text-gray-300">Sobre Nós</a></li>
            <li><a href="#servicos" className="hover:text-gray-300">Serviços</a></li>
            <li><a href="#contactos" className="hover:text-gray-300">Contactos</a></li>
          </ul>
        </nav>

        {/* Links - mobile dropdown */}
       {/* Links - mobile fullscreen overlay */}
{menuOpen && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col justify-center items-center gap-8 text-2xl">

    {/* Botão fechar (X) */}
    <button
      className="absolute top-6 right-6 text-white text-3xl"
      onClick={() => setMenuOpen(false)}
    >
      &times;
    </button>

    {/* Links */}
    <a href="#portfolio" onClick={() => setMenuOpen(false)} className="hover:text-gray-300">Portfólio</a>
    <a href="#sobre" onClick={() => setMenuOpen(false)} className="hover:text-gray-300">Sobre Nós</a>
    <a href="#servicos" onClick={() => setMenuOpen(false)} className="hover:text-gray-300">Serviços</a>
    <a href="#contactos" onClick={() => setMenuOpen(false)} className="hover:text-gray-300">Contactos</a>
  </div>
)}



        {/* Seta para baixo */}
        <div className="flex justify-center mb-8 animate-bounce">
          <span className="text-3xl">↓</span>
        </div>
      </div>
    </div>
  );
}
