export default function VideoServicesSection() {
  return (
    <section className="w-full bg-[#2D2C2A] text-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Título */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-center leading-tight">
          Conteúdo que Prende <br className="hidden md:block" />
          e Que Faz Resultados
        </h2>
        <p className="mt-4 text-center text-lg md:text-xl text-[#C7C2BC]">
          Unimos imagem, design e estratégia para transformar ideias em crescimento real.
        </p>

        {/* Cartões */}
        <div className="mt-12 grid gap-6 md:gap-8 md:grid-cols-3">
          {/* Card 1 – claro */}
          <div className="rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-7 shadow-[0_10px_30px_rgba(0,0,0,.25)]">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-7 h-auto text-[#2D2C2A]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c.265 0 .52.105.707.293l3 3a1 1 0 01-1.414 1.414L13 11.414V16a1 1 0 11-2 0v-4.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3A1 1 0 0112 8z"
                />
              </svg>
              Direção Criativa
            </div>
            <p className="mt-4 text-base leading-relaxed text-[#2D2C2A]">
              Descobrimos o que te torna único. Definimos rumo, mensagem e guião para
              uma narrativa clara, memorável e fiel à tua marca.
            </p>
          </div>

          {/* Card 2 – cor principal (sage) */}
          <div className="rounded-2xl bg-[#7C806F] text-white p-7 shadow-[0_10px_30px_rgba(0,0,0,.3)]">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-7 h-auto text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 7h11a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z"
                />
              </svg>
              Produção & Edição
            </div>
            <p className="mt-4 text-base leading-relaxed text-white/90">
              Filmamos, fotografamos e montamos com estética e ritmo. Entregamos formatos
              para social, site e campanhas — prontos a performar.
            </p>
          </div>

          {/* Card 3 – escuro */}
          <div className="rounded-2xl bg-[#2D2C2A] text-white p-7 ring-1 ring-[#C7C2BC]/40 shadow-[0_10px_30px_rgba(0,0,0,.35)]">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-7 h-auto text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Promoção Inteligente
            </div>
            <p className="mt-4 text-base leading-relaxed text-[#C7C2BC]">
              Ativamos nos canais certos, com segmentação e otimização contínua para
              alcance, cliques e conversões com ROI.
            </p>
          </div>
        </div>

        {/* CTA */}
       {/* CTA */}
<div className="mt-10 flex justify-center">
  <a
    href="/portfolio"
    className="px-6 py-3 rounded-full border-2 border-[#A78C79] text-[#A78C79] font-semibold
               hover:bg-[#A78C79] hover:text-black transition"
  >
    Ver Portfólio
  </a>
</div>

      </div>
    </section>
  );
}
