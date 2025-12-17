// src/pages/ServicosFotosDesporto.jsx
import { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import BrandStrip from "../components/BrandStrip";
import { NAV_ITEMS } from "../navItems";

// 10 fotos: /public/desporto1.jpg ... /desporto10.jpg
const GALLERY = [
  "/desporto1.jpg","/desporto2.jpg","/desporto3.jpg","/desporto4.jpg","/desporto5.jpg",
  "/desporto6.jpg","/desporto7.jpg","/desporto8.jpg","/desporto9.jpg","/desporto10.jpg",
];

/* ---------- item do carrossel com detecção de orientação ---------- */
function CarouselItem({ src, idx }) {
  const [orient, setOrient] = useState("square"); // 'landscape' | 'portrait' | 'square'
  const handleLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    const r = w / h;
    if (r > 1.15) setOrient("landscape");
    else if (r < 0.87) setOrient("portrait");
    else setOrient("square");
  };

  const tilt = idx % 3 === 0 ? "-rotate-2" : idx % 3 === 1 ? "rotate-1" : "-rotate-1";

  const size =
    orient === "landscape"
      ? "w-[18rem] h-[12rem] sm:w-[22rem] sm:h-[14rem] md:w-[26rem] md:h-[16rem]"
      : orient === "portrait"
      ? "w-[12rem] h-[18rem] sm:w-[14rem] sm:h-[22rem] md:w-[16rem] md:h-[26rem]"
      : "w-[14rem] h-[14rem] sm:w-[16rem] sm:h-[16rem] md:w-[18rem] md:h-[18rem]";

  return (
    <li className="shrink-0">
      <div className={`relative ${size} rounded-xl border-4 border-white shadow-xl transform ${tilt}`}>
        <img
          src={src}
          alt=""
          draggable={false}
          onLoad={handleLoad}
          className="absolute inset-0 w-full h-full object-cover select-none rounded-[10px]"
        />
      </div>
    </li>
  );
}

/* ---------- carrossel com rotação contínua (marquee) ---------- */
function Carousel({ images, pxPerSec = 60 }) { // velocidade em px/seg
  const scrollerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let running = true;

    const loadAll = async () => {
      try {
        await Promise.all(
          images.map((src) => {
            const img = new Image();
            img.src = src;
            return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
          })
        );
      } catch {}
    };

    const start = () => {
      if (!running) return;
      const startTime = performance.now();

      const step = (now) => {
        if (!running) return;
        const half = el.scrollWidth / 2; // lista está duplicada
        if (half <= el.clientWidth) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }
        const elapsed = (now - startTime) / 1000;
        const dist = (elapsed * pxPerSec) % half;
        el.scrollLeft = dist;
        rafRef.current = requestAnimationFrame(step);
      };

      // sair do 0 evita “colar”
      el.scrollLeft = 1;
      rafRef.current = requestAnimationFrame(step);
    };

    (async () => {
      await loadAll();
      start();
      const onResize = () => { el.scrollLeft = Math.min(el.scrollLeft, el.scrollWidth / 4); };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    })();

    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [images, pxPerSec]);

  const loopImages = [...images, ...images];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#2D2C2A] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#2D2C2A] to-transparent z-10" />

      <div
        ref={scrollerRef}
        className="w-full overflow-x-auto overflow-y-hidden px-1 [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
      >
        <ul className="flex flex-nowrap gap-6 md:gap-8 items-center py-4">
          {loopImages.map((src, idx) => (
            <CarouselItem key={`${src}-${idx}`} src={src} idx={idx} />
          ))}
        </ul>
      </div>

      {/* legenda pequena por baixo do carrossel */}
      <div className="mt-2 flex flex-col items-center text-white/70 text-[11px] tracking-wider select-none">
        <span aria-hidden className="text-lg leading-none">↑</span>
        <span>Criações PRISMA</span>
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
        <Carousel images={GALLERY} pxPerSec={70} />

        {/* 2) Header + copy */}
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

        {/* Processo à direita */}
<div className="lg:col-span-5 lg:pt-10 mt-12 lg:mt-0">
  <h2 className="text-2xl md:text-3xl font-extrabold mb-6">O nosso processo</h2>

  <div className="space-y-8">
    <Step
      n="1"
      title="Brief & Planeamento"
      text="Objetivo do conteúdo (press, social, patrocínios), timings e logística."
    />
    <Step
      n="2"
      title="Cobertura"
      text="Registo focado em ação, técnica e emoção; segurança e fluxo rápido."
    />
    <Step
      n="3"
      title="Seleção & Entrega"
      text="Pré-vias para social em 24–48h. Galeria final editada em 3–7 dias úteis."
    />
  </div>
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
