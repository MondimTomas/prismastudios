export default function CTAButton({ href = "#contactos", children = "ORÇAMENTO" }) {
    return (
      <a
        href={href}
        className="
          relative inline-flex items-center justify-center
          px-4 py-2 text-sm uppercase tracking-wide font-semibold
          rounded-full
          text-white
          transition
          before:absolute before:inset-0 before:rounded-full before:p-[2px]
          before:bg-gradient-to-r before:from-pink-500/70 before:via-fuchsia-500/70 before:to-purple-500/70
          before:-z-10
          hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-pink-400/40
        "
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
          boxShadow:
            "0 6px 20px rgba(236,72,153,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <span className="rounded-full bg-black/40 backdrop-blur px-3 py-1">
          {children}
        </span>
      </a>
    );
  }
  