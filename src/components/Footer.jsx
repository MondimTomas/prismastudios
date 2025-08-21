export default function Footer({ navItems }) {
    return (
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
              {navItems.map(item => (
                <li key={`foot-${item.href}`}>
                  <a href={item.href} className="hover:text-white">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
  
          {/* Coluna 3 */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Contactos</h4>
            <ul className="text-gray-400 space-y-1">
              <li>
                <a href="https://www.instagram.com/prisma_studios.pt/" className="hover:text-white">Instagram</a>
              </li>
              <li><a href="mailto:hello@prismastudios.pt" className="hover:text-white">hello@prismastudios.pt</a></li>
            </ul>
          </div>
        </div>
  
        {/* Texto decorativo */}
        <h1 className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[100px] md:text-[150px] font-extrabold text-[#2D2C2A] opacity-10 pointer-events-none select-none leading-none">
          PRISMASTUDIOS
        </h1>
  
        {/* Linha final */}
        <div className="bg-[#2D2C2A] border-t border-[#3a3a3a] px-6 flex justify-between items-center text-sm text-gray-400 mt-12">
          <p className="text-left">© 2025 PrismaStudios. All rights reserved.</p>
  
          <img
            src="/PRISMA_BEGECLARO.png"
            alt="Logo Prisma"
            className="h-32 object-contain rounded-md"
          />
  
          <a href="https://www.instagram.com/prisma_studios.pt/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6 hover:scale-110 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3h9A4.5 4.5 0 0121 7.5v9a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 16.5v-9A4.5 4.5 0 017.5 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5h.008v.008H16.5V7.5zM12 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
            </svg>
          </a>
        </div>
      </footer>
    );
  }
  