// src/components/BrandStrip.jsx
export default function BrandStrip() {
  const LOGOS = [
    "/logo_bacorinho.png",
    "/logo_frangovaidoso.png",
    "/logo_moments.png",
    "/logo_ppv.png",
      "/logo_ips.png",
    // adiciona mais aqui…
  ];

  return (
    <section
      className="
        relative
        w-screen
        left-1/2 right-1/2
        -ml-[51vw] -mr-[50vw]   /* quebra o max-width do pai */
      "
    >
      {/* fundo escuro */}
      <div className="absolute inset-0 bg-[#1f1f1f]" />

      {/* conteúdo centrado dentro do full-bleed */}
      <div className="relative skew-y-[0.8deg] text-white py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-center text-sm md:text-base tracking-wider uppercase text-white/70">
            Marcas que confiaram em nós
          </h3>

          {/* mobile: scroll; desktop: grelha */}
          <div className="mt-6 md:mt-8">
            {/* mobile */}
            <div className="md:hidden overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="inline-flex items-center gap-10 pr-6">
                {LOGOS.map((src) => (
                  <img key={src} src={src} alt="" className="h-10 object-contain invert brightness-0 opacity-90" />
                ))}
              </div>
            </div>

            {/* desktop */}
            <div className="hidden md:grid grid-cols-6 gap-10 items-center justify-items-center">
              {LOGOS.map((src) => (
                <img key={src} src={src} alt="" className="h-12 object-contain invert brightness-0 opacity-90" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* linhas claras subtis em cima e em baixo */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#EBEBEB]/90" />
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#EBEBEB]/90" />
    </section>
  );
}
