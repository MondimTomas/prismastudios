import { useState } from "react";

import { NAV_ITEMS } from "../navItems";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import PortfolioSection from "../components/PortfolioSection";
import Footer from "../components/Footer";
import BackgroundVideo from "../components/BackgroundVideo";
import HeroContent from "../components/HeroContent";
import AboutSection from "../components/AboutSection";
import VideoServicesSection from "../components/VideoServicesSection";
import BrandStrip from "../components/BrandStrip";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative w-full min-h-[100svh] overflow-hidden text-white bg-black">
      
      {/* HERO */}
      <div className="relative w-full h-[100svh]">
        <BackgroundVideo />

        {/* Conteúdo central */}
        <HeroContent />

        {/* Navbar + seta (não bloqueiam o hero) */}
        <div className="absolute inset-0 z-30 flex flex-col justify-between ">
          <Navbar
            onOpenMenu={() => setMenuOpen(true)}
            navItems={NAV_ITEMS}
            className="pointer-events-auto"
          />

          <div className="flex justify-center mb-8 animate-bounce">
            <span className="text-3xl">↓</span>
          </div>
        </div>

        {/* Menu mobile */}
        <MobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          navItems={NAV_ITEMS}
        />
      </div>

      {/* RESTO DO SITE */}
      <AboutSection />
      <PortfolioSection />
      <BrandStrip />
      <VideoServicesSection />
      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
