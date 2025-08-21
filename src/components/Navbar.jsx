import { useState } from 'react';
import logo from '/PRISMA_BEGECLARO.png';
import SocialIcons from './SocialIcons';
import ServicesMegaMenu from './ServicesMegaMenu';

export default function Navbar({ onOpenMenu, navItems }) {
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 py-4 relative">
      {/* Logo */}
      <a href="#" className="flex items-center" aria-label="Ir para o topo">
        <img src={logo} alt="PRISMA Studios" className="h-16 md:h-24" />
      </a>

      {/* Links - Desktop */}
      <ul className="hidden md:flex gap-8 text-sm uppercase">
        {navItems.map((item) => {
          const isServices = item.label.toLowerCase() === 'serviços';
          if (isServices) {
            return (
              <li
                key={item.href}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                // fechar se sair do item e também do painel (controlado pelo próprio painel)
                onMouseLeave={() => setServicesOpen(false)}
              >
                <a
                  href={item.href}
                  className="hover:text-gray-300 transition-colors duration-200 flex items-center gap-1"
                  aria-haspopup="true"
                  aria-expanded={servicesOpen}
                >
                  {item.label}
                  <svg className="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5H7z" />
                  </svg>
                </a>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <a href={item.href} className="hover:text-gray-300 transition-colors duration-200">
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Direita: ícones sociais */}
      <div className="hidden md:flex items-center">
        <SocialIcons />
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden">
        <button
          onClick={onOpenMenu}
          className="text-white focus:outline-none"
          aria-label="Abrir menu"
          aria-expanded="false"
          aria-controls="mobile-menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mega-menu fora do <li>, mas dentro do <nav> (full width) */}
      <ServicesMegaMenu
        open={servicesOpen}
        onMouseEnter={() => setServicesOpen(true)}
        onMouseLeave={() => setServicesOpen(false)}
      />
    </nav>
  );
}
