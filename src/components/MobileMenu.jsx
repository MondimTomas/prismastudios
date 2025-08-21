import { useState } from "react";
import SocialIcons from "./SocialIcons";
import { SERVICES_COLS } from "../servicesData";

export default function MobileMenu({ open, onClose, navItems }) {
  const [openServices, setOpenServices] = useState(false);
  if (!open) return null;

  const isServices = (label) => label.toLowerCase() === "serviços";

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
                  <a
                    href={item.href}
                    onClick={onClose}
                    className="hover:text-gray-300"
                  >
                    {item.label}
                  </a>
                </li>
              );
            }

            // Serviços como acordeão
            return (
              <li key={item.href}>
                <button
                  className="w-full flex items-center justify-between hover:text-gray-300"
                  onClick={() => setOpenServices((v) => !v)}
                  aria-expanded={openServices}
                  aria-controls="mobile-services-panel"
                >
                  <span>{item.label}</span>
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
                        {col.items.map((sub) => (
                          <li key={sub.href}>
                            <a
                              href={sub.href}
                              onClick={onClose}
                              className="block text-white/80 text-base hover:text-white"
                            >
                              {sub.label}
                            </a>
                          </li>
                        ))}
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
