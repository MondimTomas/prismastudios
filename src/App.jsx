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

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-16 md:h-24" />
          </div>

          {/* Ícone hamburger - Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Links - Desktop */}
          <ul className="hidden md:flex gap-8 text-sm uppercase">
            <li><a href="#portfolio" className="hover:text-gray-300">Portfólio</a></li>
            <li><a href="#sobre" className="hover:text-gray-300">Sobre</a></li>
            <li><a href="#servicos" className="hover:text-gray-300">Serviços</a></li>
            <li><a href="#contactos" className="hover:text-gray-300">Contactos</a></li>
          </ul>
        </nav>

        {/* Menu Mobile - Fullscreen */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col justify-center items-center gap-8 text-2xl">
            <button
              className="absolute top-6 right-6 text-white text-3xl"
              onClick={() => setMenuOpen(false)}
            >
              &times;
            </button>
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
      {/* Nova secção abaixo da seta */}
<section
  className="relative w-full py-24 px-6 bg-[#EBEBEB]"
  style={{
    backgroundImage: `
      radial-gradient(#D1D1D1 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
  }}
>
  <h2
    className="text-4xl md:text-6xl font-extrabold text-[#2D2C2A] text-center"
    style={{
      filter: 'url(#wobble)',
      fontFamily: '"Inter Display", sans-serif',
      letterSpacing: '0em',
      lineHeight: '1em',
    }}
  >
    Created Here.
  </h2>
  <section className="w-full py-16 px-4 flex justify-center gap-6 bg-[#EBEBEB]">
  {['/img1.jpg', '/img2.jpg', '/img3.jpg'].map((src, idx) => (
  <img
    key={src}
    src={src}
    alt={`exemplo-${idx + 1}`}
    className={`
      w-48 h-48 object-cover rounded-xl border-4 border-white shadow-xl
      ${idx === 0 ? 'float-1' : idx === 2 ? 'float-3' : 'float-2'}
    `}
  />
))}

</section>
</section>

<footer className="relative bg-[#2D2C2A] text-white px-8 pt-12">
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
    
    {/* Coluna 1 */}
    <div>
      <h3 className="text-xl font-semibold mb-2">PrismaStudios</h3>
      <p className="text-gray-400 mb-6">Agência criativa de conteúdo visual.</p>
      <button className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full shadow-inner hover:scale-105 transition transform duration-300">
        👋 Book a call
      </button>
    </div>

    {/* Coluna 2 */}
    <div>
      <h4 className="text-lg font-semibold mb-2">Navegação</h4>
      <ul className="text-gray-400 space-y-1">
        <li><a href="#" className="hover:text-white">Home</a></li>
        <li><a href="#" className="hover:text-white">Portfólio</a></li>
        <li><a href="#" className="hover:text-white">Como Funciona?</a></li>
        <li><a href="#" className="hover:text-white">Preços</a></li>
        <li><a href="#" className="hover:text-white">FAQs</a></li>
      </ul>
    </div>

    {/* Coluna 3 */}
    <div>
      <h4 className="text-lg font-semibold mb-2">Contactos</h4>
      <ul className="text-gray-400 space-y-1">
        <li><a href="https://www.instagram.com/prisma_studios.pt/" className="hover:text-white">Instagram</a></li>
        <li><a href="#" className="hover:text-white">hello@prismastudios.pt</a></li>
      </ul>
    </div>
  </div>

  {/* Texto decorativo no fundo */}
  <h1 className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[100px] md:text-[150px] font-extrabold text-[#2D2C2A] opacity-10 pointer-events-none select-none leading-none">
    PRISMASTUDIOS
  </h1>
  {/* Linha final do footer */}
<div className="bg-[#2D2C2A] border-t border-[#3a3a3a] px-6 flex justify-between items-center text-sm text-gray-400 mt-12">
  {/* Copyright */}
  <p className="text-left">
    © 2025 PrismaStudios. All rights reserved.
  </p>

 <img
  src="/PRISMA_BEGECLARO.png"
  alt="Logo Prisma"
  className="h-32 object-contain rounded-md"
/>


  <a href="https://www.instagram.com/prisma_studios.pt/" target="_blank" rel="noopener noreferrer">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="white"
    className="w-6 h-6 hover:scale-110 transition-transform"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 3h9A4.5 4.5 0 0121 7.5v9a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 16.5v-9A4.5 4.5 0 017.5 3z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 7.5h.008v.008H16.5V7.5zM12 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
    />
  </svg>
</a>

</div>

</footer>

    </div>
  );
}
