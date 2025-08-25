// src/pages/ServicosFotosEventos.jsx
import { useRef, useCallback, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import BrandStrip from "../components/BrandStrip";
import { NAV_ITEMS } from "../navItems";

const GALLERY = [
  "/img1.jpg","/img2.jpg","/img3.jpg","/img4.jpg","/img5.jpg",
  "/img6.jpg","/img7.jpg","/img8.jpg","/img9.jpg","/img10.jpg",
];

/** ——— Carrossel topo (auto-play) ——— */
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
          {images.map((src, idx) => {
            const tilt = idx % 3 === 0 ? "-rotate-2" : idx % 3 === 1 ? "rotate-1" : "-rotate-1";
            return (
              <li key={src} className="snap-center shrink-0" style={{ scrollSnapStop: "always" }}>
                <img
                  src={src}
                  alt={`evento-${idx + 1}`}
                  draggable={false}
                  className={`select-none w-[12rem] h-[12rem] sm:w-[16rem] sm:h-[16rem] md:w-[18rem] md:h-[18rem]
                    object-cover rounded-xl border-4 border-white shadow-xl transform ${tilt}`}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** ——— UI pequenina ——— */
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
      <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[#d4b996] text-black flex items-center justify-center font-bold">
        {n}
      </div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-white/80">{text}</p>
    </div>
  );
}

/** ——— Página ——— */
export default function ServicosFotosEventos() {
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
        {/* 1) Carrossel topo (sem título) */}
        <Carousel images={GALLERY} />

        {/* 2) Hero textual com cartão lateral */}
        <section className="mt-10 grid lg:grid-cols-12 gap-8 items-start">
          {/* Texto principal */}
          <div className="lg:col-span-7">
            <p className="uppercase tracking-widest text-white/60 text-xs mb-2">Serviço</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Fotografia de <span className="text-[#d4b996]">Eventos</span>
            </h1>
            <p className="mt-4 text-lg text-white/90 max-w-2xl">
              Cobertura integral do teu evento com uma equipa ajustada à escala —
              de <strong>1 a vários fotógrafos</strong>. Abordagem discreta, foco em <em>storytelling</em> e
              equipamentos de topo para garantir um registo autêntico e com impacto.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Planeamento dos momentos-chave e logística em conjunto contigo.",
                "Cobertura multiângulo com lentes rápidas e iluminação quando necessário.",
                "Edição e cor consistentes, alinhadas à tua marca.",
                "Pré-vias para redes sociais em 24–48h. Galeria final em 3–7 dias úteis.",
                "Galeria privada em alta + versões otimizadas para web/socials.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="text-[#d4b996] mt-0.5"><Check /></span>
                  <span className="text-white/90">{t}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/contactos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold
                           bg-[#d4b996] text-black hover:bg-[#c9ad86] transition"
              >
                Contacte-nos <span aria-hidden>→</span>
              </a>
              <a
                href="/portfolio#eventos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold
                           border border-white/25 hover:bg-white/10 transition"
              >
                Ver trabalhos
              </a>
            </div>
          </div>

          {/* Cartão lateral com badges + stats */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-6 md:p-7 ring-1 ring-black/5 shadow-[0_12px_30px_rgba(0,0,0,.25)] overflow-hidden">
              {/* shape decorativa */}
              <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-[#d4b996]/30 blur-3xl pointer-events-none" />
              <h3 className="text-xl font-extrabold mb-3">Como trabalhamos</h3>

              <div className="flex flex-wrap gap-2 mb-5">
                {["1–3 fotógrafos", "Entrega 24–48h", "Galeria online", "Licenças à medida"].map((b) => (
                  <span key={b} className="px-3 py-1 rounded-full text-sm bg-black/5">
                    {b}
                  </span>
                ))}
              </div>

              <p className="leading-relaxed">
                Recebes um conjunto curado de imagens com pós-produção,
                em alta resolução e pronto para partilha. Opções de cobertura com
                2–3 fotógrafos, seleção assistida e entrega express disponíveis.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <Stat value="12+" label="anos" />
                <Stat value="200+" label="eventos" />
                <Stat value="24–48h" label="pré-vias" />
              </div>
            </div>
          </div>
        </section>

        {/* 3) Timeline do processo */}
        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">O nosso processo</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              n="1"
              title="Preparação"
              text="Call de alinhamento, guião de momentos, acessos e logística. Chegamos cedo para reconhecimento."
            />
            <Step
              n="2"
              title="Cobertura"
              text="Registo discreto e eficiente, com multiângulo e foco em storytelling e momentos-chave."
            />
            <Step
              n="3"
              title="Seleção & Entrega"
              text="Pré-vias em 24–48h para social. Galeria final curada e editada em 3–7 dias úteis."
            />
          </div>
        </section>

        {/* 4) Strip de marcas */}
        <div className="mt-16">
          <BrandStrip />
        </div>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
