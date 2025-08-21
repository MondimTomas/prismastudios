// src/components/ServicesMegaMenu.jsx
export default function ServicesMegaMenu({ open, onMouseEnter, onMouseLeave }) {
    const cols = [
      {
        title: "Fotografia",
        items: [
          { label: "Eventos", href: "#srv-foto-eventos" },
          { label: "Desporto", href: "#srv-foto-desporto" },
          { label: "Retratos", href: "#srv-foto-retratos" },
          { label: "Restauração", href: "#srv-foto-restauracao" },
          { label: "Publicidade", href: "#srv-foto-publicidade" },
          { label: "Drone", href: "#srv-foto-drone" },
          { label: "Imobiliárias", href: "#srv-foto-imobiliarias" },
        ],
      },
      {
        title: "Vídeo",
        items: [
          { label: "Eventos", href: "#srv-video-eventos" },
          { label: "Imobiliária", href: "#srv-video-imobiliaria" },
          { label: "DJ Sets", href: "#srv-video-djsets" },
          { label: "Desporto", href: "#srv-video-desporto" },
          { label: "YouTube", href: "#srv-video-youtube" },
        ],
      },
      {
        title: "Marketing",
        items: [
          { label: "Redes Sociais", href: "#srv-mkt-redes" },
          { label: "Desenvolvimento Web", href: "#srv-mkt-web" },
          { label: "Geração de Leads", href: "#srv-mkt-leads" },
        ],
      },
    ];
  
    return (
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={[
          "absolute left-0 right-0 top-full z-50",
          "transition-all duration-200",
          open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-1",
        ].join(" ")}
        role="menu"
        aria-label="Serviços"
      >
        {/* Painel visual full-width */}
        <div className="rounded-b-2xl shadow-2xl overflow-hidden border-t border-white/10 bg-gradient-to-b from-black/75 via-black/70 to-black/60 backdrop-blur-xl">
          {/* Container centralizado (ajusta max-w se quiseres mais largo) */}
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {cols.map((col) => (
                <div key={col.title}>
                  <h4 className="text-white font-semibold mb-3 flex items-center justify-between tracking-wide">
                    {col.title}
                    <span className="h-px flex-1 ml-3 bg-white/15" />
                  </h4>
                  <ul className="space-y-2">
                    {col.items.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className="block text-white/85 hover:text-white transition-colors text-sm md:text-[0.95rem] uppercase tracking-wide"
                          role="menuitem"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  