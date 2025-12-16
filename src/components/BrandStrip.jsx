// src/components/BrandStrip.jsx
import { useRef, useEffect } from "react";

export default function BrandStrip({ speed = 60 }) { // px/seg
  const LOGOS = [
    "/logo_bacorinho.png",
    "/logo_frangovaidoso.png",
    "/logo_moments.png",
    "/logo_ppv.png",
    "/logo_ips.png",
    "/logo_dmevents.png",
    "/logo_tecnico.png",
     "/logosetmotors.svg",
     "/michael-page.png"
    // adiciona mais aqui…
  ];

  const loop = [...LOGOS, ...LOGOS]; // duplica p/ loop perfeito
  const scrollerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let running = true;
    const start = performance.now();

    const tick = (now) => {
      if (!running) return;
      const half = el.scrollWidth / 2;
      const elapsed = (now - start) / 1000;
      const dist = (elapsed * speed) % half; // posição baseada no tempo
      el.scrollLeft = dist;
      rafRef.current = requestAnimationFrame(tick);
    };

    el.scrollLeft = 1;
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [speed, LOGOS.length]);

  return (
    <section
      className="
        relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
        bg-[#1f1f1f]
      "
    >
      {/* linhas claras subtis em cima e em baixo */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#EBEBEB]/90" />
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#EBEBEB]/90" />

      {/* conteúdo */}
      <div className="relative text-white py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-center text-sm md:text-base tracking-wider uppercase text-white/70">
            Marcas que confiaram em nós
          </h3>
        </div>

        {/* UMA SÓ LINHA, sempre */}
        <div
          ref={scrollerRef}
          className="mt-6 overflow-hidden"
          aria-label="Logótipos de clientes (marquee contínuo)"
        >
          <ul className="flex flex-nowrap items-center gap-12 md:gap-16 px-6">
            {loop.map((src, i) => (
              <li key={`${src}-${i}`} className="shrink-0">
                <img
                  src={src}
                  alt=""
                  className="h-10 md:h-12 object-contain invert brightness-0 opacity-90"
                  loading="lazy"
                  decoding="async"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
