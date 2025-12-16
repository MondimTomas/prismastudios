// src/components/PortfolioGallery.jsx
import { PORTFOLIO } from "../portfolioData";

export default function PortfolioGallery({ category }) {
  const items = PORTFOLIO[category] ?? [];

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const Wrapper = it.href ? "a" : "div";
        const wrapperProps = it.href
          ? {
              href: it.href,
              target: "_blank",
              rel: "noopener noreferrer",
            }
          : {};

        return (
          <Wrapper
            key={it.id}
            {...wrapperProps}
            className="group block rounded-xl overflow-hidden bg-[#EBEBEB] ring-1 ring-black/5 shadow-[0_8px_30px_rgba(0,0,0,.15)]"
          >
            <div className="aspect-[16/10] bg-white overflow-hidden">
              {it.src ? (
                <video
                  src={it.src}
                  muted
                  playsInline
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={it.thumb}
                  alt={it.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              )}
            </div>
            <div className="px-4 py-3 text-[#2D2C2A] flex items-center justify-between">
              <h3 className="font-semibold">{it.title}</h3>
              <span className="text-[#A78C79] group-hover:translate-x-0.5 transition">→</span>
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}
