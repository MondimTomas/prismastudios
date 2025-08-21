import { useRef, useCallback, useMemo } from "react";

export default function PortfolioSection() {
  // 👉 mete aqui as tuas imagens (ficam em /public para servir direto)
  const IMAGES = useMemo(
    () => [
      "/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg", "/img5.jpg",
      "/img6.jpg", "/img7.jpg", "/img8.jpg", "/img9.jpg", "/img10.jpg",
    ],
    []
  );

  const scrollerRef = useRef(null);

  const scrollBy = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }, []);

  // Setas por teclado quando o utilizador foca o carrossel
  const onKeyDown = useCallback((e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); scrollBy(1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); scrollBy(-1); }
  }, [scrollBy]);

  return (
    <section
      id="portfolio"
      className="relative w-full py-24 px-6 bg-[#EBEBEB]"
      style={{
        backgroundImage: `radial-gradient(#D1D1D1 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
      aria-labelledby="portfolio-heading"
    >
      {/* filtro wobble (para o titulo) */}
      <svg width="0" height="0" className="absolute">
        <filter id="wobble">
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="1" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
        </filter>
      </svg>

      <h2
        id="portfolio-heading"
        className="text-4xl md:text-6xl font-extrabold text-[#2D2C2A] text-center"
        style={{
            filter: "url(#wobble)",
            fontFamily: '"Inter Display", sans-serif',
            letterSpacing: "0em",
            lineHeight: "1em",
        }}
      >
        Created Here.
      </h2>

      {/* Carrossel */}
      <div
        role="region"
        aria-label="Carrossel de projetos do portfólio"
        className="relative mt-12"
      >
        {/* fade nas margens */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#EBEBEB] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#EBEBEB] to-transparent z-10" />

        {/* Botões Prev/Next */}
        <div className="absolute inset-y-0 left-0 flex items-center z-20">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            className="mx-2 md:mx-3 rounded-full bg-white/80 hover:bg-white shadow-lg backdrop-blur px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#2D2C2A]"
          >
            ←
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center z-20">
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Seguinte"
            className="mx-2 md:mx-3 rounded-full bg-white/80 hover:bg-white shadow-lg backdrop-blur px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#2D2C2A]"
          >
            →
          </button>
        </div>

        {/* Pista do carrossel */}
        <div
  ref={scrollerRef}
  tabIndex={0}
  onKeyDown={onKeyDown}
  className="
    w-full overflow-x-auto overflow-y-hidden
    snap-x snap-mandatory
    px-1
    scrollbar-hide
  "
  aria-roledescription="carousel"
>
<ul className="flex gap-6 md:gap-8 items-center py-10 md:py-12 min-h-[22rem]">
            {IMAGES.map((src, idx) => (
              <li
                key={src}
                className="snap-center shrink-0"
                style={{ scrollSnapStop: "always" }}
              >
                <img
                  src={src}
                  alt={`exemplo-${idx + 1}`}
                  className={`
                    select-none
                    w-[12rem] h-[12rem] sm:w-[16rem] sm:h-[16rem] md:w-[18rem] md:h-[18rem]
                    object-cover rounded-xl border-4 border-white shadow-xl
                    ${idx % 3 === 0 ? "float-1" : idx % 3 === 1 ? "float-2" : "float-3"}
                  `}
                  draggable={false}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
