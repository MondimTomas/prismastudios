import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";

// importa todas as imagens da pasta casamentos-batizados
const imageImports = import.meta.glob(
  "/public/lookbooks/casamentos-batizados/*.{jpg,jpeg,png}",
  { eager: true, as: "url" }
);

const images = Object.values(imageImports).sort();

export default function LookbookCasamentos() {
  return (
    <div className="min-h-screen bg-[#EBEBEB] text-[#2D2C2A]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#2D2C2A] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} />
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12">
          Casamentos & Batizados
        </h1>

        <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((src, idx) => (
            <div
              key={idx}
              className="break-inside-avoid bg-white rounded-lg overflow-hidden shadow-md"
            >
              <img
                src={src}
                alt={`Casamento ${idx + 1}`}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
