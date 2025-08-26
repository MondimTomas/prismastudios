import { Link } from "react-router-dom";
import { SERVICES } from "../ServiceData";

export default function ServicesMegaMenu({ open, onMouseEnter, onMouseLeave }) {
  // mapeia o objeto SERVICES -> colunas do menu
  const cols = [
    { title: "Fotografia", items: SERVICES.fotografia },
    { title: "Vídeo",      items: SERVICES.video },
    { title: "Marketing",  items: SERVICES.marketing },
  ];

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={[
        // full-bleed: ocupa a largura da viewport
        "absolute top-full left-1/2 -translate-x-1/2 w-screen z-50",
        "transition-all duration-200",
        open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-1",
      ].join(" ")}
      role="menu"
      aria-label="Serviços"
    >
      {/* fundo/painel */}
      <div className="rounded-b-2xl shadow-2xl overflow-hidden border-t border-white/10 bg-gradient-to-b from-black/75 via-black/70 to-black/60 backdrop-blur-xl">
        {/* container central (largura alinhada ao site) */}
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
                      <Link
                        to={item.href}
                      className="block text-white/85 hover:text-white transition-colors text-sm md:text-[0.95rem]"

                        role="menuitem"
                      >
                        {item.title}
                      </Link>
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
