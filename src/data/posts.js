// src/data/posts.js
export const BRAND_BG = "#2D2C2A";
export const TEXT_MAIN = "#EBEBEB";
export const TILE_GRADIENT = ["#C7C2BC", "#A78C79"];

// Opcional: exporta as categorias para usar no UI
export const POST_CATEGORIES = ["todos", "podcasts", "reflexoes", "anuncios"];

// Cada post agora tem "category": "podcasts" | "reflexoes" | "anuncios"
export const posts = [
  {
    id: "1",
    type: "article",
    category: "reflexoes",
    slug: "como-preparamos-um-set-de-retrato",
    title: "Como preparamos um set de retrato",
    excerpt: "Workflow, esquema de luz, testes e truques do dia.",
    date: "2025-08-20",
    author: "PRISMA Studios",
    cover: "/blog/retrato-setup.jpg",
    content: "<p>...</p>",
    tags: ["workflow", "retrato", "luz"],
    readingMinutes: 5,
  },
  {
    id: "2",
    type: "podcast",
    category: "podcasts",
    slug: "podcast-ep1-conversa-com-dop",
    title: "Podcast EP1 — Conversa com um DoP",
    excerpt: "Narrativas visuais e organização de set.",
    date: "2025-08-22",
    author: "PRISMA Studios",
    cover: "/blog/podcast-ep1.jpg",
    audioUrl: "/blog/audio/podcast-ep1.mp3",
    content: "<p>Notas do episódio...</p>",
    tags: ["podcast", "cinema"],
    readingMinutes: 1,
  },
  {
    id: "3",
    type: "note",
    category: "anuncios",
    slug: "estudio-aberto-sessao-teste-27-ago",
    title: "Anúncio — Estúdio aberto (27 Ago)",
    excerpt: "Sessão teste de luz gratuita para criadores locais.",
    date: "2025-08-27",
    author: "PRISMA Studios",
    cover: "/blog/anuncio-open-studio.jpg",
    content: "<p>Detalhes, horários e inscrição...</p>",
    tags: ["anuncio", "estudio"],
    readingMinutes: 1,
  },
];
