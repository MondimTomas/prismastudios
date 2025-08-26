// src/pages/ServicosVideoYouTube.jsx
import { useRef, useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import BrandStrip from "../components/BrandStrip";
import { NAV_ITEMS } from "../navItems";

/** Lista base (só URLs). Título/duração/thumb serão melhorados por oEmbed */
const RAW_VIDEOS = [
  { src: "https://youtu.be/FrNzpOBzINk?si=2YzcYQfUx7gsrvl6", platform: "YouTube" },
  { src: "https://youtu.be/bk198vZmsuU?si=2DID4Vtz0W_J5p6q", platform: "YouTube" },
  { src: "https://youtu.be/yndyn3OvZtk?si=_K-gjpWJEeZIRmX6", platform: "YouTube" },
  { src: "https://youtu.be/u8eTULNcOiA?si=h7LBJOuQJAOElXby", platform: "YouTube" },
  { src: "https://youtu.be/PL3q2IdFSFE?si=3lhGem9fY051kvnb", platform: "YouTube" },
];

/* ---------- helpers de providers ---------- */
const isYouTube = (url) => /youtube\.com|youtu\.be/.test(url);
const isVimeo   = (url) => /vimeo\.com/.test(url);
const isTikTok  = (url) => /tiktok\.com/.test(url);

function getYouTubeId(url) {
  try {
    const u = new URL(url, window.location.origin);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}
function toYouTubeEmbed(url) {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
}
function toVimeoEmbed(url) {
  try {
    const u = new URL(url, window.location.origin);
    const id = u.pathname.split("/").filter(Boolean).pop();
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0` : url;
  } catch { return url; }
}
function toTikTokEmbed(url) {
  const m = url.match(/video\/(\d+)/);
  const id = m && m[1];
  return id ? `https://www.tiktok.com/embed/v2/video/${id}` : url;
}

/* ---------- Hook: melhora títulos + thumbs via oEmbed ---------- */
function useEnhancedVideos(list) {
  const [videos, setVideos] = useState(() =>
    list.map((v) => {
      // default thumb imediata p/ YouTube (evita buraco enquanto oEmbed carrega)
      const id = isYouTube(v.src) ? getYouTubeId(v.src) : null;
      const ytThumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
      return {
        title: "Carregar…",
        duration: "—",
        thumb: ytThumb || "/thumbs/placeholder.jpg",
        ...v,
      };
    })
  );

  useEffect(() => {
    let alive = true;

    async function enhanceOne(v, idx) {
      try {
        if (isYouTube(v.src)) {
          // oEmbed YouTube — título
          const o = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(v.src)}&format=json`)
            .then((r) => r.ok ? r.json() : null)
            .catch(() => null);

          const id = getYouTubeId(v.src);
          const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

          if (alive) setVideos((arr) => {
            const copy = [...arr];
            copy[idx] = { ...copy[idx], title: o?.title || copy[idx].title, thumb };
            return copy;
          });
        } else if (isTikTok(v.src)) {
          // oEmbed TikTok — título + thumbnail_url
          const o = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(v.src)}`)
            .then((r) => r.ok ? r.json() : null)
            .catch(() => null);

          if (alive && o) {
            setVideos((arr) => {
              const copy = [...arr];
              copy[idx] = { ...copy[idx], title: o.title || copy[idx].title, thumb: o.thumbnail_url || copy[idx].thumb, aspect: "portrait" };
              return copy;
            });
          }
        }
      } catch {/* ignora erros */}
    }

    videos.forEach((v, i) => { enhanceOne(v, i); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return videos;
}

/* ---------- Modal (suporta vertical + TikTok) ---------- */
function VideoModal({ open, onClose, video }) {
  const [isPortrait, setIsPortrait] = useState(video?.aspect === "portrait");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    setIsPortrait(video?.aspect === "portrait");
  }, [video]);

  if (!open || !video) return null;

  const embedSrc = isYouTube(video.src)
    ? toYouTubeEmbed(video.src)
    : isVimeo(video.src)
    ? toVimeoEmbed(video.src)
    : isTikTok(video.src)
    ? toTikTokEmbed(video.src)
    : null;

  const portrait = isTikTok(video.src) || isPortrait;
  const frameClass = portrait
    ? "aspect-[9/16] h-[85vh] max-h-[85vh] max-w-[90vw] mx-auto"
    : "aspect-video w-full";

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/90 hover:text-white text-2xl" aria-label="Fechar">✕</button>

        <div className={`rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_12px_40px_rgba(0,0,0,.5)] bg-black ${frameClass}`}>
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={video.title}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={video.src}
              poster={video.thumb}
              className="w-full h-full object-contain bg-black"
              controls
              playsInline
              autoPlay
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth && v.videoHeight) setIsPortrait(v.videoHeight / v.videoWidth > 1.12);
              }}
            />
          )}
        </div>

        <div className="mt-3 text-white/90">{video.title}</div>
      </div>
    </div>
  );
}

/* ---------- Card + Carrossel ---------- */
function VideoCard({ v, onPlay }) {
  const [loaded, setLoaded] = useState(false);
  const portrait = v.aspect === "portrait" || isTikTok(v.src);
  const aspectClass = portrait ? "aspect-[9/16]" : "aspect-video";

  return (
    <div className="w-[14rem] md:w-[18rem] shrink-0">
      <div className={`relative ${aspectClass} rounded-xl overflow-hidden ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,.35)] group bg-black/20`}>
        
        {/* skeleton */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-700/40" />
        )}

        {/* thumb */}
        <img
          src={v.thumb}
          alt={v.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${loaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />

        {/* gradiente topo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* play */}
        <button
          onClick={() => onPlay(v)}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
          aria-label={`Reproduzir ${v.title}`}
        >
          ▶
        </button>

        {/* chips */}
        <div className="absolute top-2 left-2 flex gap-2">
          {v.platform && <span className="px-2 py-0.5 rounded-full text-xs bg-black/60 text-white/90">{v.platform}</span>}
          {v.duration && <span className="px-2 py-0.5 rounded-full text-xs bg-black/60 text-white/90">{v.duration}</span>}
        </div>
      </div>

      {/* título */}
      <div className="mt-3">
        <button
          onClick={() => onPlay(v)}
          className="text-left text-base md:text-lg font-semibold hover:underline line-clamp-2"
          title={v.title}
        >
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

  // autoplay com pausa no hover
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
      {/* fades laterais */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#2D2C2A] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#2D2C2A] to-transparent z-10" />

      {/* setas */}
      <div className="absolute inset-y-0 left-0 flex items-center z-20">
        <button type="button" onClick={() => scrollBy(-1)} className="mx-2 md:mx-3 rounded-full bg-white/85 hover:bg-white shadow-lg backdrop-blur px-3 py-3 text-black" aria-label="Anterior">←</button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center z-20">
        <button type="button" onClick={() => scrollBy(1)} className="mx-2 md:mx-3 rounded-full bg-white/85 hover:bg-white shadow-lg backdrop-blur px-3 py-3 text-black" aria-label="Seguinte">→</button>
      </div>

      {/* pista */}
      <div
        ref={ref}
        className="w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory px-1 scrollbar-hide [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
      >
        <ul className="flex gap-5 md:gap-7 items-stretch py-3">
          {videos.map((v, i) => (
            <li key={v.src + i} className="snap-start" style={{ scrollSnapStop: "always" }}>
              <VideoCard v={v} onPlay={onPlay} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Página ---------- */
export default function ServicosVideoYouTube() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(null);
  const VIDEOS = useEnhancedVideos(RAW_VIDEOS);

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white">
      <header className="sticky top-0 z-50 bg-[#2D2C2A]">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <VideoCarousel videos={VIDEOS} onPlay={setActive} />

        <section className="mt-10 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <p className="uppercase tracking-widest text-white/60 text-xs mb-2">Serviço</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Vídeos para <span className="text-[#d4b996]">YouTube</span>
            </h1>

            <p className="mt-4 text-lg text-white/90 max-w-2xl">
              Produção completa para o teu canal — <strong>em estúdio</strong> (podcast, reviews, tutoriais)
              ou <strong>fora de estúdio</strong> (vlogs, criativos, docu-style). Cuidamos de conceito, roteiro,
              captação, som, edição, motion e thumbnails, com foco em retenção e consistência visual.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Roteiro com hooks, capítulos e CTAs orientados à retenção.",
                "Estúdio com luz/som controlados (teleprompter opcional).",
                "Outdoor estabilizado; B-roll cinematográfico.",
                "Edição + motion/titling, color e som limpo.",
                "Pacotes de thumbnails e versões curtas (Shorts/Reels).",
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
              <a href="/portfolio#youtube" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-white/25 hover:bg-white/10 transition">
                Ver mais vídeos
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-6 md:p-7 ring-1 ring-black/5 shadow-[0_12px_30px_rgba(0,0,0,.25)]">
              <h3 className="text-xl font-extrabold mb-3">Formatos & Entregas</h3>
              <ul className="space-y-2 leading-relaxed text-[15px]">
                <li><strong>Episódio longo:</strong> 6–20 min (16:9) + capítulos.</li>
                <li><strong>Podcast/Vídeo-cast:</strong> 20–90 min multi-câmara.</li>
                <li><strong>Shorts/Reels:</strong> 15–60 s (9:16) derivados do longo.</li>
                <li><strong>Entrega:</strong> MP4 H.264/H.265 (sRGB) + 2–3 thumbnails e .txt com título/descrição/hashtags.</li>
              </ul>
              <div className="mt-4 text-sm text-black/70">
                SLAs: prévias em 48–72h; versão final em 5–10 dias úteis.
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer navItems={NAV_ITEMS} />

      <VideoModal open={!!active} onClose={() => setActive(null)} video={active} />
    </div>
  );
}
