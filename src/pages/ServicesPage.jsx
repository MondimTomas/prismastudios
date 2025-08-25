import { useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";
import { SERVICES } from "../ServiceData"; // <- se renomeares para servicesData.js, muda o import

function ServiceCard({ label, title, img, href }) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      href={href || "#"}
      className="group block rounded-xl overflow-hidden bg-black/30 ring-1 ring-white/10 shadow-[0_12px_40px_rgba(0,0,0,.35)]"
    >
      <div className="relative aspect-[16/9] w-full">
        <img
          src={img || "/fotografia.jpeg"}     // fallback se faltar imagem
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <div className="text-xs md:text-sm uppercase tracking-wide text-white/80">{label}</div>
          <div className="mt-1 text-2xl md:text-3xl font-extrabold leading-tight">{title}</div>
        </div>
      </div>
    </Wrapper>
  );
}

function CategoryColumn({ title, label, items }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xl md:text-2xl font-extrabold">{title}</h3>
        <div className="h-px flex-1 bg-white/15" />
      </div>
      <div className="grid gap-6">
        {items.map((it) => (
          <ServiceCard
            key={title + it.title}
            label={label}
            title={it.title}
            img={it.img}
            href={it.href}
          />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white">
      <header className="sticky top-0 z-50 bg-[#2D2C2A]">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center">Serviços</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-3 items-start">
          <CategoryColumn title="Fotografia" label="Fotos"   items={SERVICES.fotografia} />
          <CategoryColumn title="Vídeo"      label="Vídeos"  items={SERVICES.video} />
          <CategoryColumn title="Marketing"  label="Marketing" items={SERVICES.marketing} />
        </div>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
