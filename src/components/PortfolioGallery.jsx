// src/components/PortfolioGallery.jsx
import { PORTFOLIO } from "../portfolioData";

export default function PortfolioGallery({ category }) {
  const items = PORTFOLIO[category] ?? [];

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <a
          key={it.id}
          href={it.href || "#"}
          target={it.href ? "_blank" : undefined}
          rel={it.href ? "noopener noreferrer" : undefined}
          className="group block rounded-xl overflow-hidden bg-[#EBEBEB] ring-1 ring-black/5 shadow-[0_8px_30px_rgba(0,0,0,.15)]"
        >
          <div className="aspect-[16/10] bg-white overflow-hidden">
            <img
              src={it.thumb}
              alt={it.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
          <div className="px-4 py-3 text-[#2D2C2A] flex items-center justify-between">
            <h3 className="font-semibold">{it.title}</h3>
            <span className="text-[#A78C79] group-hover:translate-x-0.5 transition">→</span>
          </div>
        </a>
      ))}
    </div>
  );
}
