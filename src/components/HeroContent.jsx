export default function HeroContent() {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          PRISMA
        </h1>
  
        <p className="mt-4 text-xl md:text-2xl max-w-2xl">
          Vem criar a tua imagem <br />
          com o nosso toque criativo
        </p>
  
        <div className="mt-8 flex gap-4">
          <a
            href="#sobre"
            className="px-6 py-3 rounded-full border-2 border-[#d4b996] text-[#d4b996] font-semibold hover:bg-[#d4b996] hover:text-black transition"
          >
            Saber Mais
          </a>
          <a
            href="#contactos"
            className="px-6 py-3 rounded-full bg-[#d4b996] text-black font-semibold hover:bg-[#c2a87f] transition"
          >
            Contacto
          </a>
        </div>
      </div>
    );
  }
  