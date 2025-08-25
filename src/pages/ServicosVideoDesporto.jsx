import { useRef, useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import BrandStrip from "../components/BrandStrip";
import { NAV_ITEMS } from "../navItems";

/** Troca pelos teus vídeos reais (YouTube/Vimeo ou .mp4 em /public/videos)
 *  e thumbs em /public/thumbs
 */
const VIDEOS = [
  { title: "Functional Training – Teaser", src: "/videos/funcional-teaser.mp4", thumb: "/thumbs/sport1.jpg", duration: "00:25", platform: "MP4" },
  { title: "Matchday Highlights – U19",   src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumb: "/thumbs/sport2.jpg", duration: "01:08", platform: "YouTube" },
  { title: "PT Session – Strength",       src: "/videos/pt-strength.mp4", thumb: "/thumbs/sport3.jpg", duration: "00:42", platform: "MP4" },
  { title: "Box Cross – Recap",           src: "https://youtu.be/9bZkp7q19f0", thumb: "/thumbs/sport4.jpg", duration: "00:58", platform: "YouTube" },
];

const isYouTube = (url) => /youtube\.com|youtu\.be/.test(url);
const isVimeo   = (url) => /vimeo\.com/.test(url);

function toYouTubeEmbed(url) {
  try {
    const u = new URL(url, window.location.origin);
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
  } catch { return url; }
}
function toVimeoEmbed(url) {
  try {
    const u = new URL(url, window.location.origin);
    const id = u.pathname.split("/").filter(Boolean).pop();
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0` : url;
  } catch { return url; }
}

/* ---------- Modal de vídeo ---------- */
function VideoModal({ open, onClose, video }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !video) return null;

  const embedSrc = isYouTube(video.src)
    ? toYouTubeEmbed(video.src)
    : isVimeo(video.src)
    ? toVimeoEmbed(video.src)
    : null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/90 hover:text-white text-2xl" aria-label="Fechar">✕</button>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_12px_40px_rgba(0,0,0,.5)] bg-black">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={video.title}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={video.src} poster={video.thumb} className="w-full h-full object-contain bg-black" controls autoPlay />
          )}
        </div>
        <div className="mt-3 text-white/90">{video.title}</div>
      </div>
    </div>
  );
}

/* ---------- Card + Carrossel ---------- */
function VideoCard({ v, onPlay }) {
  return (
    <div className="w-[16rem] md:w-[20rem] shrink-0">
      <div className="relative aspect-video rounded-xl overflow-hidden ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,.35)] group">
        <img src={v.thumb} alt={v.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <button
          onClick={() => onPlay(v)}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
          aria-label={`Reproduzir ${v.title}`}
        >
          ▶
        </button>
        <div className="absolute top-2 left-2 flex gap-2">
          <span className="px-2 py-0.5 rounded-full text-xs bg-black/60 text-white/90">{v.platform}</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-black/60 text-white/90">{v.duration}</span>
        </div>
      </div>
      <div className="mt-3">
        <button onClick={() => onPlay(v)} className="text-left text-base md:text-lg font-semibold hover:underline" title="Ver vídeo">
          {v.title}
        </button>
        <div className="text-sm text-white/70">Clica para assistir em tamanho grande</div>
      </div>
    </div>
  );
}

function VideoCarousel({ videos, onPlay, auto = true, interval = 2800 }) {
  const ref = useRef(null);
  const scrollBy = useCallback((dir) => {
    const el = ref.current;
    if (!el) return;
    const amt = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amt, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!auto) return;
    const el = ref.current;
    if (!el) return;
    let paused = false;
    const enter = () => (paused = true);
    const leave = () => (paused = false);
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    const id = setInterval(() => {
      if (paused) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else scrollBy(1);
    }, interval);
    return () => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); clearInterval(id); };
  }, [auto, interval, scrollBy]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#2D2C2A] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#2D2C2A] to-transparent z-10" />
      <div className="absolute inset-y-0 left-0 flex items-center z-20">
        <button type="button" onClick={() => scrollBy(-1)} className="mx-2 md:mx-3 rounded-full bg-white/85 hover:bg-white shadow-lg backdrop-blur px-3 py-3 text-black" aria-label="Anterior">←</button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center z-20">
        <button type="button" onClick={() => scrollBy(1)} className="mx-2 md:mx-3 rounded-full bg-white/85 hover:bg-white shadow-lg backdrop-blur px-3 py-3 text-black" aria-label="Seguinte">→</button>
      </div>
      <div ref={ref} className="w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory px-1 scrollbar-hide [&::-webkit-scrollbar]:hidden" aria-roledescription="carousel">
        <ul className="flex gap-6 md:gap-8 items-stretch py-4">
          {videos.map((v) => (
            <li key={v.title} className="snap-start" style={{ scrollSnapStop: "always" }}>
              <VideoCard v={v} onPlay={onPlay} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Página ---------- */
export default function ServicosVideoDesporto() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(null);

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-[#2D2C2A]">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* 1) Carrossel topo */}
        <VideoCarousel videos={VIDEOS} onPlay={setActive} />

        {/* 2) Texto do serviço */}
        <section className="mt-12 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <p className="uppercase tracking-widest text-white/60 text-xs mb-2">Serviço</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Vídeo de <span className="text-[#d4b996]">Desporto</span>
            </h1>

            <p className="mt-4 text-lg text-white/90 max-w-2xl">
              Conteúdo de performance para <strong>atletas</strong>, <strong>equipas</strong>, <strong>estúdios/boxes</strong> e
              <strong> personal trainers</strong>: desde treinos dirigidos e sessões em estúdio/fitness a
              <strong> match highlights</strong> e recaps de competição. Captação ágil, áudio limpo e
              color grading consistente para web e redes.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Captação multi-câmara (gimbal/tele/slow-motion 60–120fps) em indoor/outdoor.",
                "PT/Studio: exercícios, cues técnicos e demonstrações com micro de lapela/boom.",
                "Game Day: highlights, replays e emoção de bancada, com ângulos de campo.",
                "Packs sociais: versões 9:16 / 1:1 / 16:9, legendagem e títulos opcionais.",
                "Drone (add-on) para establishing shots e vistas de recinto/box.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="text-[#d4b996]">✓</span>
                  <span className="text-white/90">{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/contactos" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-[#d4b996] text-black hover:bg-[#c9ad86] transition">
                Pedir proposta <span aria-hidden>→</span>
              </a>
              <a href="/portfolio#video-desporto" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-white/25 hover:bg-white/10 transition">
                Ver mais vídeos
              </a>
            </div>
          </div>

          {/* Card lateral */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-6 md:p-7 ring-1 ring-black/5 shadow-[0_12px_30px_rgba(0,0,0,.25)]">
              <h3 className="text-xl font-extrabold mb-3">Formatos & Entregas</h3>
              <ul className="space-y-2 leading-relaxed text-[15px]">
                <li><strong>Highlights:</strong> 45–90s (16:9) + vertical.</li>
                <li><strong>PT/Studio:</strong> 30–90s por tema (9:16) com títulos/contagem.</li>
                <li><strong>Recap/Teaser:</strong> 15–30s para TikTok/Reels.</li>
                <li><strong>Entrega:</strong> MP4 H.264/H.265 (sRGB) + thumbnails; áudio WAV/MP3 opcional.</li>
              </ul>
              <div className="mt-4 text-sm text-black/70">
                SLAs: prévias em 48–72h; versão final em 5–10 dias úteis (ajustável à prova/evento).
              </div>
            </div>
          </div>
        </section>

        {/* 3) Marcas */}
        <div className="mt-16">
          <BrandStrip />
        </div>
      </main>

      <Footer navItems={NAV_ITEMS} />

      {/* Modal */}
      <VideoModal open={!!active} onClose={() => setActive(null)} video={active} />
    </div>
  );
}
