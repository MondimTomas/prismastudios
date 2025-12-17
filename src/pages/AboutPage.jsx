import { useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // 👉 coloca as 3 fotos em /public com estes nomes ou muda os paths
// TEAM (em AboutPage.jsx ou AboutSection.jsx)
const TEAM = [
    { name: "Catarina Pinote",  photo: "/capa_catarina.png" },
    { name: "Tomas Mondim",     photo: "/capa_tomas.png" },
    { name: "Rodrigo Lopes",    photo: "/capa_rodrigo.jpeg" },
  ];
  

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white">
      {/* Header fixo */}
      <header className="sticky top-0 z-50 bg-[#2D2C2A]">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Equipa */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-center">A Nossa Equipa</h1>
        <div className="mt-12 flex justify-center">
  <div className="rounded-2xl overflow-hidden ring-1 ring-[#C7C2BC]/30 shadow-[0_20px_50px_rgba(0,0,0,.35)] max-w-md bg-white p-2">
    <img
      src="/PRISMA_team-1.JPG"
      alt="Equipa Prisma Studios"
      className="w-full h-auto object-cover rounded-xl"
      loading="lazy"
      decoding="async"
    />
  </div>
</div>


        {/* Sobre a Prisma */}
        <section className="mt-20 md:mt-24 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <p className="inline-block text-xs font-bold uppercase tracking-[.2em] text-[#7C806F] bg-[#7C806F]/10 rounded-full px-3 py-1">
              Sobre a Prisma
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold">
              Somos um estúdio de imagem — vídeo, fotografia e web/socials.
            </h2>
            <p className="mt-4 text-[#C7C2BC] leading-relaxed">
              Unimos direção criativa, produção e pós-produção para transformar ideias em peças
              bonitas, claras e eficazes. Trabalhamos próximos dos clientes, com estratégia primeiro
              e execução rigorosa, sempre focados em resultado.
            </p>
            <p className="mt-4 text-[#C7C2BC] leading-relaxed">
              Do guião ao upload final, entregamos formatos otimizados para alcance e conversão.
            </p>
          </div>

          {/* Cartão “O que nos guia” — substituir o bloco atual por este */}
<div className="rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-6 ring-1 ring-black/5 shadow-[0_12px_40px_rgba(0,0,0,.25)]">
  <h4 className="text-xl md:text-2xl font-extrabold mb-4">O que nos guia</h4>

  <ul className="space-y-6">
    {/* #1 */}
    <li className="grid grid-cols-[auto,1fr] gap-4 items-start">
      <span className="text-4xl md:text-5xl font-extrabold leading-none text-[#A78C79]">#1</span>
      <p className="text-[15px] md:text-base leading-relaxed">
        <span className="font-semibold text-[#7C806F]">Qualidade:</span> detalhe na captação, cor e som.
      </p>
    </li>

    {/* #2 */}
    <li className="grid grid-cols-[auto,1fr] gap-4 items-start">
      <span className="text-4xl md:text-5xl font-extrabold leading-none text-[#A78C79]">#2</span>
      <p className="text-[15px] md:text-base leading-relaxed">
        <span className="font-semibold text-[#7C806F]">Clareza:</span> mensagens simples que prendem atenção.
      </p>
    </li>

    {/* #3 */}
    <li className="grid grid-cols-[auto,1fr] gap-4 items-start">
      <span className="text-4xl md:text-5xl font-extrabold leading-none text-[#A78C79]">#3</span>
      <p className="text-[15px] md:text-base leading-relaxed">
        <span className="font-semibold text-[#7C806F]">Resultado:</span> formatos pensados para alcance e conversão.
      </p>
    </li>
  </ul>
</div>

        </section>

        {/* Estúdio */}
        <section className="mt-20 md:mt-24">
          <p className="inline-block text-xs font-bold uppercase tracking-[.2em] text-[#A78C79] bg-[#A78C79]/10 rounded-full px-3 py-1">
            Estúdio
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold">Temos espaço físico em Setúbal.</h2>

          <div className="mt-6 grid md:grid-cols-2 gap-8 items-stretch">
            <div className="rounded-2xl border border-[#C7C2BC]/30 bg-black/20 p-6">
              <p className="text-[#C7C2BC] leading-relaxed">
                O nosso estúdio está preparado para sessões de foto/vídeo, gravação de voz e
                pequenas montagens. Também é o nosso ponto de encontro para planeamento criativo.
              </p>
              <div className="mt-4">
                <div className="text-sm uppercase tracking-wider text-[#C7C2BC]">Morada</div>
                <address className="not-italic text-lg font-semibold text-[#EBEBEB]">
                  Rua dos Trabalhadores do Mar, Nº 16, 1M<br />Setúbal
                </address>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden ring-1 ring-[#C7C2BC]/30 shadow-[0_12px_40px_rgba(0,0,0,.35)]">
              <iframe
                title="Mapa do Estúdio PRISMA"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[320px] md:h-full"
                src={
                  "https://www.google.com/maps?q=" +
                  encodeURIComponent("Rua dos Trabalhadores do Mar 16 1M, Setúbal") +
                  "&output=embed"
                }
              />
            </div>
          </div>
        </section>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
