import { PORTFOLIO } from "../portfolioData";
import { Link } from "react-router-dom"; // se estiveres a usar React Router

export default function PortfolioGallery({ category }) {
  const items = PORTFOLIO[category] ?? [];

  // ⚠️ FOTO → mostra botões grandes em vez de galeria
  if (category === "foto") {
    const sections = [
      { id: "concertos", label: "Concertos & Artistas", href: "/lookbook/concertos" },
      { id: "casamentos", label: "Casamentos & Batizados", href: "/lookbook/casamentos" },
      { id: "festas", label: "Festas & Celebrações", href: "/lookbook/festas" },
      { id: "restauracao", label: "Restauração", href: "/lookbook/restauracao" },
      { id: "retratos", label: "Retratos", href: "/lookbook/retratos" },
        { id: "desporto", label: "Desporto", href: "/lookbook/desporto" },
    ];

    return (
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <a
            key={section.id}
            href={section.href}
            className="block bg-[#EBEBEB] text-[#2D2C2A] rounded-xl p-6 text-2xl font-bold text-center hover:bg-[#D6D6D6] transition"
          >
            {section.label}
          </a>
        ))}
      </div>
    );
  }

  // Agrupar vídeos por secção (para categoria "video")
  const grouped = items.reduce((acc, item) => {
    const section = item.section || "Outros";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <div className="mt-12 space-y-16">
      {Object.entries(grouped).map(([sectionTitle, videos]) => (
        <div key={sectionTitle}>
          {/* Título da secção */}
          <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-4 mb-6">
            {sectionTitle}
            <span className="flex-1 h-px bg-[#A78C79] opacity-50" />
          </h3>

          {/* Galeria da secção */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {videos.map((it) => (
              <div key={it.id} className="w-full">
                <video
                  src={it.src}
                  muted
                  playsInline
                  controls
                  poster={it.thumb}
                  preload="metadata"
                  className={`w-full h-auto object-cover mx-auto ${
                    it.aspect === "portrait"
                      ? "aspect-[9/16] max-w-[250px]"
                      : "aspect-video"
                  }`}
                />
                {it.title && (
                  <p className="mt-2 text-sm text-[#C7C2BC]">{it.title}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
