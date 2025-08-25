// src/pages/ServicosFotosRestauracao.jsx
import { useRef, useCallback, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import BrandStrip from "../components/BrandStrip";
import { NAV_ITEMS } from "../navItems";

const GALLERY = [
  "/rest1.jpg","/rest2.jpg","/rest3.jpg","/rest4.jpg","/rest5.jpg",
  "/rest6.jpg","/rest7.jpg","/rest8.jpg","/rest9.jpg","/rest10.jpg",
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
                  alt={`restauracao-${i + 1}`}
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

export default function ServicosFotosRestauracao() {
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
        <Carousel images={GALLERY} />

        {/* 2) Headline + copy */}
        <section className="mt-10 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <p className="uppercase tracking-widest text-white/60 text-xs mb-2">Serviço</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Fotografia de <span className="text-[#d4b996]">Restauração</span>
            </h1>

            <p className="mt-4 text-lg text-white/90 max-w-2xl">
              Criamos imagens que definem (ou elevam) a identidade visual do teu restaurante —
              desde <strong>pratos heróis</strong> a <strong>ambiente</strong>, equipa e detalhes.
              Ideal para novas casas que querem entrar fortes no mercado ou marcas consolidadas
              que procuram mais consistência e qualidade na presença digital.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Sessões em serviço ou produzidas (food styling / set) para pratos, drinks e sobremesas.",
                "Ambiente, interiores, equipa & chef, cozinha em ação — storytelling completo.",
                "Luz natural ou iluminação de estúdio portátil para um look consistente e apetite appeal.",
                "Entrega multi-formato: 1:1, 4:5 e 16:9 para Instagram, site, apps de entrega e anúncios.",
                "Opções de reels/clips curtos como add-on para social (se precisares video).",
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
                href="/portfolio#restauracao"
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
                {["Menu/Pratos Heróis", "Ambiente & Interiores", "Chef & Equipa", "Apps Delivery"].map((b) => (
                  <Badge key={b}>{b}</Badge>
                ))}
              </div>

              <p className="leading-relaxed">
                Prévias em 48–72h para seleção; edição final em 5–10 dias úteis. Galeria online com
                download em alta + versões otimizadas para web/social e capas UberEats/Glovo/Takeaway.
                Cores consistentes com branding e manual de uso opcional.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <Stat value="300+" label="pratos fotografados" />
                <Stat value="48–72h" label="prévias" />
                <Stat value="50+" label="marcas atendidas" />
              </div>
            </div>
          </div>
        </section>

        {/* 3) Processo */}
        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Como trabalhamos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step n="1" title="Briefing & Moodboard" text="Posicionamento da marca, cardápio prioritário, referências visuais e formatos necessários." />
            <Step n="2" title="Produção On-site" text="Set com luz controlada e food styling. Fotografia de pratos, ambiente e equipa." />
            <Step n="3" title="Pós-produção & Entrega" text="Curadoria, edição, export multi-formato e galeria online com licenças de uso." />
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
