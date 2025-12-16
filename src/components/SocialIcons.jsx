export default function SocialIcons({ className = "" }) {
  const ICONS = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/prisma_studios.pt/",
      svg: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61584783548844",
      svg: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M22 12.06C22 6.55 17.52 2.07 12 2.07S2 6.55 2 12.06c0 4.99 3.66 9.13 8.44 9.93v-7.02H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.19 2.24.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34v7.02C18.34 21.19 22 17.05 22 12.06z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@prismastudiospt?_r=1&_t=ZG-91yPGSHUTZI",
      svg: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M21 8.5a7.4 7.4 0 0 1-4.3-1.4v7.16a5.76 5.76 0 1 1-5.76-5.76c.2 0 .4.01.6.04V11a2.9 2.9 0 1 0 0 5.8A2.9 2.9 0 0 0 14.4 14V3h2.07a5.28 5.28 0 0 0 4.53 4.53V8.5z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@PrismaStudiosPT",
      svg: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M23 12s0-3.2-.41-4.6a3 3 0 0 0-2.1-2.1C18.99 5 12 5 12 5s-6.99 0-8.49.3a3 3 0 0 0-2.1 2.1C1 8.8 1 12 1 12s0 3.2.41 4.6a3 3 0 0 0 2.1 2.1C5.01 19 12 19 12 19s6.99 0 8.49-.3a3 3 0 0 0 2.1-2.1C23 15.2 23 12 23 12ZM10 15.5v-7l6 3.5-6 3.5Z" />
        </svg>
      ),
    },
  ];

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {ICONS.map(icon => (
        <li key={icon.name}>
          <a
            href={icon.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={icon.name}
            className="inline-flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            {icon.svg}
          </a>
        </li>
      ))}
    </ul>
  );
}
