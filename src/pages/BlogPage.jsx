// src/pages/BlogPage.jsx
import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";
import { posts, BRAND_BG, TEXT_MAIN, TILE_GRADIENT, POST_CATEGORIES } from "../data/posts";

function PostCard({ post }) {
  const isPodcast = post.category === "podcasts";
  return (
    <Link to={`/blog/${post.slug}`} className="group flex flex-col items-start select-none">
      <div
        className="relative aspect-square w-full max-w-[300px] max-h-[300px]
                   rounded-2xl overflow-hidden
                   shadow-[0_8px_18px_rgba(0,0,0,.35)]
                   transition-transform duration-150 group-hover:-translate-y-0.5"
        style={{ background: `linear-gradient(180deg, ${TILE_GRADIENT[0]} 0%, ${TILE_GRADIENT[1]} 100%)` }}
      >
        <span aria-hidden className="absolute inset-0" style={{
          background:"linear-gradient(180deg, rgba(255,255,255,.25) 0%, rgba(255,255,255,.08) 40%, rgba(0,0,0,.08) 41%, rgba(0,0,0,0) 100%)",
        }}/>
        {post.cover && <img src={post.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />}
        {isPodcast && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-semibold bg-black/55 text-white tracking-wide">
            PODCAST
          </span>
        )}
      </div>

      <div className="mt-3 max-w-[300px]">
        <h3 className="text-base md:text-lg font-semibold" style={{ color: TEXT_MAIN }}>{post.title}</h3>
        <p className="text-sm text-white/80 line-clamp-2">{post.excerpt}</p>
        <p className="text-xs text-white/60">
          {new Date(post.date).toLocaleDateString("pt-PT")} • {post.readingMinutes} min
        </p>
      </div>
    </Link>
  );
}

function FilterBar({ selected, setSelected, counts }) {
  const pills = [
    { key: "todos", label: `Todos (${counts.todos})` },
    { key: "podcasts", label: `Podcasts (${counts.podcasts})` },
    { key: "reflexoes", label: `Reflexões (${counts.reflexoes})` },
    { key: "anuncios", label: `Anúncios (${counts.anuncios})` },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {pills.map(({ key, label }) => {
        const active = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key)}
            aria-pressed={active}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition
                        ring-1 ring-white/15
                        ${active ? "bg-white/15 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function BlogPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = POST_CATEGORIES.includes(searchParams.get("cat") || "") ? searchParams.get("cat") : "todos";
  const [selected, setSelected] = useState(initial || "todos");

  // sincroniza com ?cat= na URL
  useEffect(() => {
    const cat = selected || "todos";
    setSearchParams(cat === "todos" ? {} : { cat });
  }, [selected, setSearchParams]);

  const counts = useMemo(() => {
    const c = { todos: posts.length, podcasts: 0, reflexoes: 0, anuncios: 0 };
    posts.forEach(p => { c[p.category] = (c[p.category] || 0) + 1; });
    return c;
  }, []);

  const filtered = useMemo(() => {
    if (selected === "todos") return posts;
    return posts.filter(p => p.category === selected);
  }, [selected]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_BG, color: TEXT_MAIN }}>
      <header className="sticky top-0 z-50" style={{ backgroundColor: BRAND_BG }}>
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <section className="mb-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Blog</h1>
          <p className="mt-3 text-white/85">
            Reflexões semanais, bastidores, notas técnicas e conversas com artistas.
          </p>

          {/* filtro por categoria */}
          <div className="mt-5">
            <FilterBar selected={selected} setSelected={setSelected} counts={counts} />
          </div>
        </section>

        {/* grid encostada à esquerda, cards até 300px */}
        <section>
          <div
            className="grid gap-5 justify-items-start"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 300px))" }}
          >
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
