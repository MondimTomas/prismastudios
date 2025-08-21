import { useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";
import PortfolioSwitch from "../components/PortfolioSwitch";
import PortfolioIntro from "../components/PortfolioIntro";     // 👈 novo
import PortfolioGallery from "../components/PortfolioGallery";

export default function PortfolioPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState("video"); // "video" | "foto" | "web"

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#2D2C2A]">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center">
          Portfólio Vídeo, Fotografia & Web/Socials
        </h1>
        <p className="mt-4 text-center text-lg md:text-xl text-[#C7C2BC]">
          Da estratégia à execução: peças que vivem no ecrã e fazem a tua marca crescer.
        </p>

        {/* Selector tipo “segmented control” */}
        <div className="mt-10">
          <PortfolioSwitch value={tab} onChange={setTab} />
        </div>

        {/* 👇 Intro dinâmica (título + descrição + imagem) */}
        <PortfolioIntro category={tab} />

        {/* 👇 Galeria só depois do heading “Portfólio” */}
        <PortfolioGallery category={tab} />
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
