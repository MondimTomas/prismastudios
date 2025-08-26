// src/pages/AluguerPage.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";

// Paleta PRISMA
const BRAND_BG = "#2D2C2A";  // fundo geral
const TEXT_MAIN = "#EBEBEB"; // texto

const TILE_GRADIENT = ["#C7C2BC", "#A78C79"]; // igual ao primeiro


// gradientes dos cards — podes trocar/rodar as combinações
const TILE_GRADIENTS = [
  ["#C7C2BC", "#A78C79"], // cameras
  ["#7C806F", "#C7C2BC"], // drones
  ["#A78C79", "#7C806F"], // audio
  ["#C7C2BC", "#FFFFFF"], // lentes
  ["#7C806F", "#2D2C2A"], // iluminacao
  ["#A78C79", "#C7C2BC"], // maquinaria
  ["#EBEBEB", "#7C806F"], // acessorios
];

const CATEGORIES = [
  { key: "cameras",     label: "Câmeras",     img: "/aluguer/cameras.png" },
  { key: "drones",      label: "Drones",      img: "/aluguer/drones.png" },
  { key: "audio",       label: "Áudio",       img: "/aluguer/audio.png" },
  { key: "lentes",      label: "Lentes",      img: "/aluguer/lentes.png" },
  { key: "iluminacao",  label: "Iluminação",  img: "/aluguer/iluminacao.png" },
  { key: "maquinaria",  label: "Maquinaria",  img: "/aluguer/maquinaria.png" },
  { key: "acessorios",  label: "Acessórios",  img: "/aluguer/acessorios.png" },
];

function MiniCategoryCard({ label, icon, href }) {
  return (
    <a href={href} className="group flex flex-col items-center select-none" aria-label={label}>
      <div
        className="relative aspect-square w-full
                   rounded-2xl overflow-hidden
                   transition-transform duration-150 group-hover:-translate-y-0.5
                   shadow-[0_8px_18px_rgba(0,0,0,.35)]"
        style={{
          background: `linear-gradient(180deg, ${TILE_GRADIENT[0]} 0%, ${TILE_GRADIENT[1]} 100%)`,
        }}
      >
        {/* brilho */}
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,.25) 0%, rgba(255,255,255,.08) 40%, rgba(0,0,0,.08) 41%, rgba(0,0,0,0) 100%)",
          }}
        />
        
        {/* ícone */}
        <img
          src={icon}
          alt=""
          className="absolute inset-0 m-auto object-contain w-[95%] h-[9≠=5%]"
          style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,.4))" }}
        />
      </div>

      <span
        className="mt-2 text-[12px] md:text-[13px] font-medium tracking-wide text-center"
        style={{ color: "#EBEBEB", textShadow: "0 1px 2px rgba(0,0,0,.6)" }}
      >
        {label}
      </span>
    </a>
  );
}




function CategoriesGrid() {
  return (
    <div className="mt-8">
      <div
        className="
          grid gap-4
          [grid-template-rows:repeat(2,auto)] /* no máximo 2 linhas */
          auto-rows-fr
        "
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        }}
      >
        {CATEGORIES.map((c, i) => (
          <MiniCategoryCard
            key={c.key}
            label={c.label}
            icon={c.img}
            href={`/aluguer/${c.key}`}
            gradient={TILE_GRADIENTS[i % TILE_GRADIENTS.length]}
          />
        ))}
      </div>
    </div>
  );
}




export default function AluguerPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_BG, color: TEXT_MAIN }}>
      <header className="sticky top-0 z-50" style={{ backgroundColor: BRAND_BG }}>
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <section className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Aluguer</h1>
          <p className="mt-4 text-lg/7 text-white/90">
            Dispomos de material de <strong>fotografia</strong>, <strong>vídeo</strong> e
            <strong> som</strong> para aluguer — pronto para produções em estúdio ou exterior.
            Equipamentos testados, kits completos e assistência na preparação do setup.
          </p>
          <ul className="mt-5 space-y-2 text-white/80">
            <li>• Retoma e entrega em Setúbal (estúdio PRISMA).</li>
            <li>• Possibilidade de kit com técnico/assistente.</li>
            <li>• Seguros, caução e condições de uso sob consulta.</li>
          </ul>
        </section>

        {/* grid responsiva de categorias */}
        <section aria-labelledby="categorias">
          <h2 id="categorias" className="sr-only">Categorias</h2>
          <CategoriesGrid />
        </section>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
