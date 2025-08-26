// src/components/MobileMenu.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // 👈 usar Link + pathname
import SocialIcons from "./SocialIcons";
import { SERVICES_COLS } from "../servicesData";

export default function MobileMenu({ open, onClose, navItems }) {
  const [openServices, setOpenServices] = useState(false);
  const { pathname } = useLocation();
  if (!open) return null;

  const isServices = (label) => label.toLowerCase() === "serviços";
  const isRoute = (href) => typeof href === "string" && href.startsWith("/");

  // Transforma "#id" → "/servicos#id" se estiveres fora de /servicos
  const normalizeServiceHref = (href) => {
    if (!href) return href;
    if (href.startsWith("#")) {
      return pathname === "/servicos" ? href : `/servicos${href}`;
    }
    return href;
  };

  // Click handler para itens de serviço (suporte a scroll suave quando já estás em /servicos)
  const onServiceClick = (e, href) => {
    const isHashHere = href.startsWith("#") && pathname === "/servicos";
    if (isHashHere) {
      e.preventDefault();
      onClose?.();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    onClose?.();
  };

  return (
    <div
      id="mobile-menu"
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      {/* Top bar */}
      <button
        className="self-end m-4 text-white text-3xl"
        onClick={onClose}
        aria-label="Fechar menu"
      >
        &times;
      </button>

      {/* Scrollable content */}
      <div className="flex-1 px-8 pb-8 overflow-y-auto">
        <ul className="flex flex-col gap-6 text-2xl">
          {navItems.map((item) => {
            if (!isServices(item.label)) {
              return (
                <li key={item.href}>
                  {isRoute(item.href) ? (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className="hover:text-gray-300"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={onClose}
                      className="hover:text-gray-300"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              );
            }

            // Serviços: texto navega para /servicos, seta abre/recolhe o painel
            return (
              <li key={item.href}>
                <div className="flex items-center justify-between">
                  {/* Tocar no texto navega para /servicos */}
                  <Link
                    to="/servicos"
                    onClick={onClose}
                    className="hover:text-gray-300"
                  >
                    {item.label}
                  </Link>

                  {/* Tocar na seta só expande/recolhe */}
                  <button
                    type="button"
                    className="p-2 -mr-2"
                    aria-expanded={openServices}
                    aria-controls="mobile-services-panel"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenServices((v) => !v);
                    }}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        openServices ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </button>
                </div>

                {/* painel */}
                <div
                  id="mobile-services-panel"
                  className={`mt-3 pl-3 border-l border-white/15 overflow-hidden transition-[max-height,opacity] duration-300 ${
                    openServices ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {SERVICES_COLS.map((col) => (
                    <div key={col.title} className="mb-5">
                      <h4 className="text-base font-semibold text-white/90 mb-2">
                        {col.title}
                      </h4>
                      <ul className="space-y-2">
                        {col.items.map((sub) => {
                          const resolved = normalizeServiceHref(sub.href);
                          const internal = isRoute(resolved) || resolved.startsWith("#");
                          return (
                            <li key={sub.href}>
                              {internal ? (
                                <Link
                                  to={resolved.startsWith("#") ? pathname + resolved : resolved}
                                  className="block text-white/80 text-base hover:text-white"
                                  onClick={(e) => onServiceClick(e, resolved.startsWith("#") ? resolved : (resolved.split("#")[1] ? `#${resolved.split("#")[1]}` : resolved))}
                                >
                                  {sub.label}
                                </Link>
                              ) : (
                                <a
                                  href={resolved}
                                  className="block text-white/80 text-base hover:text-white"
                                  onClick={onClose}
                                >
                                  {sub.label}
                                </a>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>

        {/* icons em baixo */}
        <div className="mt-8">
          <SocialIcons className="!flex md:!hidden gap-3" />
        </div>
      </div>
    </div>
  );
}
