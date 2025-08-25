// src/pages/ServicosFotosDesporto.jsx
import { useRef, useCallback, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import BrandStrip from "../components/BrandStrip";
import { NAV_ITEMS } from "../navItems";

// coloca 8–12 imagens em /public (ex.: /sport1.jpg ... /sport10.jpg)
const GALLERY = [
  "/sport1.jpg","/sport2.jpg","/sport3.jpg","/sport4.jpg","/sport5.jpg",
  "/sport6.jpg","/sport7.jpg","/sport8.jpg","/sport9.jpg","/sport10.jpg",
];

/* ---------- Carrossel topo (auto-play) ---------- */
function Carousel({ images, auto = true, interval = 2600 }) {
  const scrollerRef = useRef(null);

  const scrollBy = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amt = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amt, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!auto) return;
    const el = scrollerRef.current;
    if (!el) return;
    const id = setInterval(() => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else scrollBy(1);
    }, interval);
    return () => clearInterval(id);
  }, [auto, interval, scrollBy]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#2D2C2A] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#2D2C2A] to-transparent z-10" />
      <div
        ref={scrollerRef}
        className="w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory px-1 scrollbar-hide [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
      >
        <ul className="flex gap-6 md:gap-8 items-stretch py-4">
          {images.map((src, i) => {
            const tilt = i % 3 === 0 ? "-rotate-2" : i % 3 === 1 ? "rotate-1" : "-rotate-1";
            return (
              <li key={src} className="snap-center shrink-0" style={{ scrollSnapStop: "always" }}>
                <img
                  src={src}
                  alt={`desporto-${i + 1}`}
                  draggable={false}
                  className={`select-none w-[12rem] h-[12rem] sm:w-[16rem] sm:h-[16rem] md:w-[18rem] md:h-[18rem] object-cover rounded-xl border-4 border-white shadow-xl transform ${tilt}`}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const Check = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}

function Step({ n, title, text }) {
  return (
    <div className="relative pl-10">
      <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[#d4b996] text-black flex items-center justify-center font-bold">{n}</div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-white/80">{text}</p>
    </div>
  );
}

export default function ServicosFotosDesporto() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white">
      <header className="sticky top-0 z-50 bg-[#2D2C2A]">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* 1) Carrossel topo */}
        <Carousel images={GALLERY} />

        {/* 2) Header+copy para desporto */}
        <section className="mt-10 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <p className="uppercase tracking-widest text-white/60 text-xs mb-2">Serviço</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Fotografia de <span className="text-[#d4b996]">Desporto</span>
            </h1>
            <p className="mt-4 text-lg text-white/90 max-w-2xl">
              Conteúdo de alta performance para <strong>atletas</strong>, <strong>equipas</strong>,
              <strong> estúdios/boxes</strong> e <strong>personal trainers</strong>. Congelamos a ação
              no pico do movimento, em interior/exterior, dia/noite, com setups rápidos e seguros.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Registo de jogo, treino, competição, provas e campanhas de atleta.",
                "Focus nos highlights: explosão, intensidade, técnica, emoção.",
                "Equipamento rápido para luz difícil: estádios, boxes, indoor.",
                "Entrega de pacotes sociais (Reels/Stories) + galeria em alta.",
                "Licenças flexíveis para marcas, patrocínios e media.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="text-[#d4b996] mt-0.5"><Check /></span>
                  <span className="text-white/90">{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/contactos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-[#d4b996] text-black hover:bg-[#c9ad86] transition"
              >
                Contacte-nos <span aria-hidden>→</span>
              </a>
              <a
                href="/portfolio#desporto"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-white/25 hover:bg-white/10 transition"
              >
                Ver trabalhos
              </a>
            </div>
          </div>

          {/* Card lateral */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-6 md:p-7 ring-1 ring-black/5 shadow-[0_12px_30px_rgba(0,0,0,.25)] overflow-hidden">
              <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-[#d4b996]/30 blur-3xl pointer-events-none" />
              <h3 className="text-xl font-extrabold mb-3">Pacotes & Entregas</h3>

              <div className="flex flex-wrap gap-2 mb-5">
                {["Atleta / Equipa / Box", "1–3 fotógrafos", "Packs sociais", "Galeria online"].map((b) => (
                  <span key={b} className="px-3 py-1 rounded-full text-sm bg-black/5">{b}</span>
                ))}
              </div>

              <p className="leading-relaxed">
                Conteúdo pensado para performance e promoção: retratos de atleta,
                ação em campo/box, bastidores e materiais para patrocinadores. Pré-vias
                em 24–48h para social; galeria completa em 3–7 dias úteis.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <Stat value="300+" label="sessões" />
                <Stat value="24–48h" label="pré-vias" />
                <Stat value="∞" label="locais" />
              </div>
            </div>
          </div>
        </section>

        {/* 3) Processo */}
        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">O nosso processo</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step n="1" title="Brief & Planeamento" text="Objetivo do conteúdo (press, social, patrocínios), timings e logística." />
            <Step n="2" title="Cobertura" text="Registo focado em ação, técnica e emoção; segurança e fluxo rápido." />
            <Step n="3" title="Seleção & Entrega" text="Pré-vias para social em 24–48h. Galeria final editada em 3–7 dias úteis." />
          </div>
        </section>

        {/* 4) Marcas */}
        <div className="mt-16">
          <BrandStrip />
        </div>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
