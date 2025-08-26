// src/pages/BlogPostPage.jsx
import { useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";
import { posts, BRAND_BG, TEXT_MAIN, TILE_GRADIENT } from "../data/posts";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const post = useMemo(() => posts.find((p) => p.slug === slug), [slug]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BRAND_BG, color: TEXT_MAIN }}>
        <div className="text-center">
          <p className="text-xl mb-4">Publicação não encontrada.</p>
          <Link className="underline text-white/90" to="/blog">Voltar ao Blog</Link>
        </div>
      </div>
    );
  }

  const isPodcast = post.type === "podcast";

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_BG, color: TEXT_MAIN }}>
      <header className="sticky top-0 z-50" style={{ backgroundColor: BRAND_BG }}>
        <div className="max-w-3xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* cover / header */}
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-[0_10px_22px_rgba(0,0,0,.35)]"
          style={{ background: `linear-gradient(180deg, ${TILE_GRADIENT[0]} 0%, ${TILE_GRADIENT[1]} 100%)` }}
        >
          {post.cover && (
            <img src={post.cover} alt="" className="w-full h-64 object-cover opacity-90" />
          )}
          {isPodcast && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white">PODCAST</span>
          )}
        </div>

        <h1 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight">{post.title}</h1>
        <p className="mt-2 text-white/70 text-sm">
          {new Date(post.date).toLocaleDateString("pt-PT")} • {post.author} • {post.readingMinutes} min
        </p>

        {isPodcast && post.audioUrl && (
          <div className="mt-6">
            <audio controls preload="metadata" className="w-full">
              <source src={post.audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}

        <article
          className="prose prose-invert max-w-none mt-6 prose-headings:font-semibold prose-a:text-white prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className="mt-10">
          <Link to="/blog" className="underline text-white/85">← Voltar ao Blog</Link>
        </div>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
