// src/pages/ServicosFotosRetratos.jsx
import { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import BrandStrip from "../components/BrandStrip";
import { NAV_ITEMS } from "../navItems";

// Galeria (já no teu /public)
const GALLERY = [
  "/retratos1.jpg","/retratos2.jpg","/retratos3.jpg","/retratos4.jpg","/retratos5.jpg",
  "/retratos6.jpg","/retratos7.jpg","/retratos8.jpg","/retratos9.jpg","/retratos10.jpg",
];

/* ------------ Item do carrossel com orientação automática ------------ */
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

/* ------------ Carrossel com rotação contínua (marquee) ------------ */
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

        const half = el.scrollWidth / 2; // lista duplicada
        if (half <= el.clientWidth) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }

        const elapsed = (now - startTime) / 1000; // s
        const dist = (elapsed * pxPerSec) % half; // 0..half

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
        {/* uma única fila, sem quebras */}
        <ul className="flex flex-nowrap gap-6 md:gap-8 items-center py-4">
          {loopImages.map((src, idx) => (
            <CarouselItem key={`${src}-${idx}`} src={src} idx={idx} />
          ))}
        </ul>
      </div>

      {/* legenda */}
      <div className="mt-2 flex flex-col items-center text-white/70 text-[11px] tracking-wider select-none">
        <span aria-hidden className="text-lg leading-none">↑</span>
        <span>Criações PRISMA</span>
      </div>
    </div>
  );
}

/* ------------ UI auxiliar ------------ */
const Check = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Badge({ children }) {
  return <span className="px-3 py-1 rounded-full text-sm bg-black/5">{children}</span>;
}

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

export default function ServicosFotosRetratos() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-[#2D2C2A]">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* 1) Carrossel topo */}
        <Carousel images={GALLERY} pxPerSec={60} />

        {/* 2) Headline + copy */}
        <section className="mt-10 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <p className="uppercase tracking-widest text-white/60 text-xs mb-2">Serviço</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Fotografia de <span className="text-[#d4b996]">Retratos</span>
            </h1>

            <p className="mt-4 text-lg text-white/90 max-w-2xl">
              Retratos para <strong>modelos</strong>, <strong>criadores</strong> e marcas pessoais que
              querem elevar a sua presença online e editorial. Fotografamos <strong>ao ar livre</strong>
              (locais icónicos/urbanos/natureza) ou em <strong>estúdio</strong> com luz 100% controlada —
              sempre com direção, styling e um workflow pensado para te deixar à vontade e brilhar em frente à câmara.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Sessões personalizadas: lifestyle, fashion, beauty, editorial e corporate.",
                "Pré-produção com moodboard, guarda-roupa e referências.",
                "Direção de pose e expressão para quem é ou não é modelo profissional.",
                "Opção de maquilhagem/cabelo (MUAH) e styling mediante pedido.",
                "Galeria online com seleção assistida + export otimizada para social e alta resolução.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="text-[#d4b996] mt-0.5"><Check /></span>
                  <span className="text-white/90">{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/contactos" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-[#d4b996] text-black hover:bg-[#c9ad86] transition">
                Contacte-nos <span aria-hidden>→</span>
              </a>
              <a href="/portfolio#retratos" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-white/25 hover:bg-white/10 transition">
                Ver trabalhos
              </a>
            </div>
          </div>

          {/* Card lateral */}
        {/* Processo à direita */}
<div className="lg:col-span-5 lg:pt-10 mt-12 lg:mt-0">
  <h2 className="text-2xl md:text-3xl font-extrabold mb-6">O nosso processo</h2>

  <div className="space-y-8">
    <Step
      n="1"
      title="Descoberta & Moodboard"
      text="Objetivo do retrato, estilo, referências e guarda-roupa."
    />
    <Step
      n="2"
      title="Sessão Dirigida"
      text="Exterior ou estúdio com direção de pose; foco em expressividade."
    />
    <Step
      n="3"
      title="Seleção & Edição"
      text="Galeria privada para escolher; edição fina de cor/pele conforme o estilo."
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
