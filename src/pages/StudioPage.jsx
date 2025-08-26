// src/pages/StudioPage.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";

export default function StudioPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white">
      {/* topo */}
      <header className="sticky top-0 z-50 bg-[#2D2C2A]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* HERO com foto do estúdio */}
        <section className="rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_12px_40px_rgba(0,0,0,.35)] relative">
          <img
            src="/studio1.jpeg"
            alt="Estúdio PRISMA – zona principal"
            className="w-full h-[42vh] md:h-[60vh] object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">O nosso Estúdio</h1>
            <p className="mt-2 text-white/90 max-w-xl">
              Um espaço pensado para criar — fotografia, vídeo e ideias a acontecer.
            </p>
          </div>
        </section>

        {/* História / Manifesto */}
        <section className="mt-12 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-7">
            <h2 className="text-2xl md:text-3xl font-extrabold">A história</h2>
            <p className="mt-4 text-white/90 leading-relaxed">
              Somos três criativos — <strong>Tomas Mondim</strong>, <strong>Catarina Pinote</strong> e <strong>Rodrigo Lopes</strong>.
              Ao longo de vários projetos percebemos que havia uma coisa que nunca falhava:
              a <em>química</em> de trabalho e a vontade de elevar cada peça de conteúdo. Daí nasceu
              a PRISMA — e o sonho de ter um estúdio físico em Setúbal, para servir marcas e pessoas
              da região (e além) com produção de imagem de alto nível.
            </p>
            <p className="mt-4 text-white/90 leading-relaxed">
              Aqui juntamos técnica, direção criativa e estratégia. Quer seja uma sessão de retrato,
              um vídeo de evento, ou um pack mensal de conteúdos, o objetivo é o mesmo: tirar a tua
              imagem do papel e pô-la a acontecer — com qualidade, consistência e identidade.
            </p>
          </div>

          {/* Destaques rápidos */}
          <div className="md:col-span-5">
            <div className="rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-6 ring-1 ring-black/10 shadow-[0_12px_30px_rgba(0,0,0,.25)]">
              <h3 className="text-xl font-extrabold">Porque o nosso espaço?</h3>
              <ul className="mt-4 space-y-3 text-[15px]">
                <li>• Layout flexível para foto e vídeo</li>
                <li>• Iluminação controlada e cenários rápidos</li>
                <li>• Equipa jovem, técnica e criativa</li>
                <li>• Localização central em Setúbal</li>
              </ul>
              <a
                href="/#contactos"
                className="inline-block mt-6 px-5 py-2.5 rounded-full bg-[#d4b996] text-black font-semibold hover:bg-[#c2a87f] transition"
              >
                Marca uma visita
              </a>
            </div>
          </div>
        </section>

        {/* Composição do estúdio */}
        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-extrabold">Composição do estúdio</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StudioCard
              emoji="🛎️"
              title="Zona de entrada"
              desc="Receção confortável para convidados e clientes, perfeita para briefings rápidos e acolhimento."
            />
            <StudioCard
              emoji="💄🪞"
              title="Camarins / WC"
              desc="Duas casas de banho preparadas para maquilhagem, cabelo e trocas de roupa com espelhos e luz adequada."
            />
            <StudioCard
              emoji="∞🎥"
              title="Infinity wall"
              desc="Parede infinita pronta para sessões de fotografia criativa e gravações com várias pessoas e cenários."
            />
            <StudioCard
              emoji="🍽️"
              title="Zona de refeições"
              desc="Área de pausa para refeições e coffee breaks, a manter a energia da equipa e dos clientes."
            />
            <StudioCard
              emoji="💻🧠"
              title="Escritório / Cowork"
              desc="Espaço para edição, coworking e conceção de ideias — planeamento, seleção e pós-produção."
            />
            <StudioCard
              emoji="🔌"
              title="Infraestrutura"
              desc="Tomadas, extensões e pontos de luz estrategicamente colocados para setups rápidos e seguros."
            />
          </div>
        </section>

        {/* Localização / mapa */}
        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-extrabold">Onde estamos</h2>
          <p className="mt-2 text-white/90">
            Rua dos Trabalhadores do Mar, nº 16 1M — Setúbal
          </p>
          <div className="mt-6 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_12px_40px_rgba(0,0,0,.35)]">
            <iframe
              title="Mapa — Estúdio PRISMA"
              src="https://www.google.com/maps?q=Rua%20dos%20Trabalhadores%20do%20Mar%2C%2016%201M%20Set%C3%BAbal&output=embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[340px] md:h-[460px] block"
            />
          </div>
        </section>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}

function StudioCard({ emoji, title, desc }) {
  return (
    <div className="rounded-xl bg-black/30 ring-1 ring-white/10 p-5 shadow-[0_12px_30px_rgba(0,0,0,.25)]">
      <div className="text-3xl">{emoji}</div>
      <h3 className="mt-2 text-lg font-extrabold">{title}</h3>
      <p className="mt-2 text-white/85">{desc}</p>
    </div>
  );
}
