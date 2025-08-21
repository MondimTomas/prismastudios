const INTRO = {
    video: {
      title: "Narrativa em Movimento",
      text:
        "Vídeo que prende atenção e conta histórias com ritmo, emoção e propósito. Do guião à captação e cor, criamos peças que elevam a tua marca.",
      img: "/video.jpeg",          // 👈 /public/video.jpeg
    },
    foto: {
      title: "Qualidade Superior",
      text:
        "Com lentes e técnica profissional, captamos detalhe, textura e cor que se perdem no dia-a-dia. Fotografia que valoriza produtos, espaços e pessoas.",
      img: "/fotografia.jpeg",     // 👈 /public/fotografia.jpeg
    },
    web: {
      title: "Web & Socials em Ação",
      text:
        "Formatos pensados para desempenho: landing pages, reels, stories e thumbnails. Conteúdo optimizado para alcance e conversão.",
      img: "/web.jpeg",            // 👈 /public/web.jpeg
    },
  };
  
  export default function PortfolioIntro({ category = "video" }) {
    const data = INTRO[category] ?? INTRO.video;
  
    return (
      <section className="mt-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold">{data.title}</h3>
            <p className="mt-4 text-base md:text-lg text-[#C7C2BC] leading-relaxed">
              {data.text}
            </p>
          </div>
          <div className="rounded-xl overflow-hidden bg-black/30 ring-1 ring-white/10">
            <img
              src={data.img}
              alt={data.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
  
        <h4 className="mt-12 md:mt-14 text-3xl md:text-5xl font-extrabold text-center">
          Portfólio
        </h4>
      </section>
    );
  }
  