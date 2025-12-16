export default function HeroContent() {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
        PRISMA
      </h1>

 <p className="text-xl md:text-xl max-w-2xl text-[#EBEBEB] font-sans tracking-widest">
  criamos contigo e para ti
</p>


      {/* Botão precisa de pointer-events-auto */}
      <div className="mt-8 pointer-events-auto">
        <a
          href="/contactos"
          className="px-6 py-3 rounded-full bg-[#D6C6B6] text-[#2D2C2A] font-semibold hover:brightness-110 transition"
        >
          Contacto
        </a>
      </div>
    </div>
  );
}
