import React from 'react'
import './index.css'

export default function App() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* Background Image */}
     <div
  className="absolute inset-0 w-full h-full bg-cover bg-center brightness-75 z-0"
  style={{ backgroundImage: "url('/studio.jpg')" }}
></div>


      {/* Conteúdo acima da imagem */}
      <div className="relative z-10 flex flex-col justify-between h-screen">
        {/* Navbar */}
       <nav className="flex items-center justify-between px-10">
  {/* Logo à esquerda */}
 <img src="/PRISMA_BEGECLARO.png" alt="PrismaStudios Logo" className="h-32" />


  {/* Menu à direita */}
  <ul className="flex gap-8 text-sm uppercase ml-auto">
    <li><a href="#portfolio" className="hover:text-gray-300">Portfólio</a></li>
    <li><a href="#sobre" className="hover:text-gray-300">Sobre Nós</a></li>
    <li><a href="#servicos" className="hover:text-gray-300">Serviços</a></li>
    <li><a href="#contactos" className="hover:text-gray-300">Contactos</a></li>
  </ul>
</nav>


        {/* Seta para baixo */}
        <div className="flex justify-center mb-8 animate-bounce">
          <span className="text-3xl">↓</span>
        </div>
      </div>
    </div>
  )
}
