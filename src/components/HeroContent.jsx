export default function HeroContent() {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
          PRISMA
        </h1>
  
        <p className="mt-4 text-xl md:text-2xl max-w-2xl text-[#EBEBEB]">
          Vem criar a tua imagem <br />
          com o nosso toque criativo
        </p>
  
        <div className="mt-8 flex gap-4">
          {/* Outline em SAGE */}
          <a
            href="#sobre"
            className="px-6 py-3 rounded-full border-2 border-[#7C806F] text-[#7C806F] font-semibold hover:bg-[#7C806F] hover:text-white transition"
          >
            Saber Mais
          </a>
  
          {/* Fill em BEGE */}
          <a
            href="#contactos"
            className="px-6 py-3 rounded-full bg-[#A78C79] text-[#2D2C2A] font-semibold hover:brightness-110 transition"
          >
            Contacto
          </a>
        </div>
      </div>
    );
  }
  