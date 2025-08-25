// src/pages/ServicosFotosPublicidade.jsx
import { useRef, useCallback, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import BrandStrip from "../components/BrandStrip";
import { NAV_ITEMS } from "../navItems";

/** Ajusta para os teus ficheiros em /public */
const GALLERY = [
  "/pub1.jpg","/pub2.jpg","/pub3.jpg","/pub4.jpg","/pub5.jpg",
  "/pub6.jpg","/pub7.jpg","/pub8.jpg","/pub9.jpg","/pub10.jpg",
];

/* ---------- Carrossel auto-play ---------- */
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
                  alt={`publicidade-${i + 1}`}
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

export default function ServicosFotosPublicidade() {
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
        {/* 1) Carrossel topo (auto) */}
        <Carousel images={GALLERY} />

        {/* 2) Headline + copy */}
        <section className="mt-10 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <p className="uppercase tracking-widest text-white/60 text-xs mb-2">Serviço</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Fotografia de <span className="text-[#d4b996]">Publicidade</span>
            </h1>

            <p className="mt-4 text-lg text-white/90 max-w-2xl">
              Transformamos a tua ideia em campanha. Cuidamos de <strong>conceito, direção criativa</strong>,
              produção e fotografia para peças impressas (outdoors, panfletos, catálogos, POS) e digital
              (anúncios, banners, landing pages). Trabalhamos com estúdio/locação, set design, styling,
              captação tethered e um pipeline de cor pensado para print e web.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Conceito & copy em conjunto com a tua equipa de marketing (ou do zero).",
                "Pré-produção completa: casting, styling, props, cenografia, locação, horários e logística.",
                "Iluminação de estúdio portátil ou fixa para um look premium e replicável.",
                "Captação tethered (ligada ao computador) para aprovação em tempo real no set.",
                "Pós-produção avançada: recortes, composição, limpeza, skin/product retouch, mockups.",
                "Entrega multi-formato com gestão de cor para web (sRGB) e print (CMYK).",
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
                Pedir Proposta <span aria-hidden>→</span>
              </a>
              <a
                href="/portfolio#publicidade"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-white/25 hover:bg-white/10 transition"
              >
                Ver campanhas
              </a>
            </div>
          </div>

          {/* Card lateral com specs/entregas */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-6 md:p-7 ring-1 ring-black/5 shadow-[0_12px_30px_rgba(0,0,0,.25)] overflow-hidden">
              <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-[#d4b996]/30 blur-3xl pointer-events-none" />
              <h3 className="text-xl font-extrabold mb-3">Entregas & Especificações</h3>

              <div className="flex flex-wrap gap-2 mb-5">
                {["Outdoor 300×100cm", "A4 300dpi", "POS/Montras", "Banners & Social"].map((b) => (
                  <Badge key={b}>{b}</Badge>
                ))}
              </div>

              <ul className="space-y-2 leading-relaxed text-[15px]">
                <li><strong>Print Ready:</strong> TIFF/PSD/ PDF/X-1a com bleed e margens; 300 dpi; CMYK (ISOcoated v2/FOGRA39) conforme pedido.</li>
                <li><strong>Web/Ads:</strong> JPG/PNG/WebP sRGB em múltiplos crops (1:1, 4:5, 16:9, 9:16) e tamanhos.</li>
                <li><strong>Cutouts/Transparências:</strong> PNG/TIFF com alfa para layouts.</li>
                <li><strong>Licenciamento:</strong> direito de uso definido por meio/canais e duração (ex.: ATL/BTL, OOH, digital).</li>
              </ul>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <Stat value="200+" label="peças impressas" />
                <Stat value="15+" label="sectores" />
                <Stat value="∞" label="formatos finais" />
              </div>
            </div>
          </div>
        </section>

        {/* 3) Processo */}
        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Processo de trabalho</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step n="1" title="Descoberta & Estratégia" text="Objetivos, público, canais e KPI’s. Moodboard, referências e mensagens-chave." />
            <Step n="2" title="Pré-produção & Produção" text="Roteiro, orçamento, casting/styling, set design. Produção em estúdio ou locação com captação tethered." />
            <Step n="3" title="Pós & Entrega" text="Curadoria, retoque, gestão de cor, artes finais e exports para print e digital." />
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
