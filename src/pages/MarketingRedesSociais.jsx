// src/pages/MarketingRedesSociais.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";

/* ----------------- Helpers de animação ----------------- */
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

function Dot() {
  return <span className="mx-1 inline-block h-1.5 w-1.5 rounded-full bg-white/50 align-middle" />;
}

/* ----------------- Badges simples ----------------- */
function Badge({ children }) {
  return (
    <span className="px-3 py-1 rounded-full text-sm bg-black/10 text-white/90 ring-1 ring-white/10">
      {children}
    </span>
  );
}

/* ----------------- FAQ ----------------- */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5"
        aria-expanded={open}
      >
        <span className="font-semibold">{q}</span>
        <span className={`transition-transform ${open ? "rotate-45" : ""}`}>＋</span>
      </button>
      <div
        className={`px-5 pb-5 text-white/80 transition-[max-height,opacity] duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {a}
      </div>
    </div>
  );
}

/* ----------------- Calendário visual (mock) ----------------- */
function ContentCalendar() {
  const days = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
  // slots exemplo (posts/reels/stories)
  const slots = [
    { day: 1, type: "Post" },
    { day: 2, type: "Stories" },
    { day: 4, type: "Reel" },
    { day: 7, type: "Stories" },
    { day: 9, type: "Post" },
    { day: 12, type: "Reel" },
    { day: 15, type: "Post" },
    { day: 18, type: "Stories" },
    { day: 20, type: "Reel" },
    { day: 22, type: "Post" },
    { day: 25, type: "Stories" },
    { day: 27, type: "Post" },
  ];

  const chipStyle = (t) =>
    t === "Post"
      ? "bg-[#d4b996] text-black"
      : t === "Reel"
      ? "bg-white text-black"
      : "bg-black/40 text-white";

  return (
    <div className="rounded-2xl bg-[#1f1f1f] ring-1 ring-white/10 p-4 md:p-6 shadow-[0_12px_30px_rgba(0,0,0,.25)]">
      <div className="grid grid-cols-7 gap-2 text-xs text-white/60 mb-2">
        {days.map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 auto-rows-[64px]">
        {Array.from({ length: 30 }).map((_, i) => {
          const day = i + 1;
          const here = slots.filter((s) => s.day === day);
          return (
            <motion.div
              key={day}
              className="rounded-lg bg-white/5 ring-1 ring-white/10 p-1 relative overflow-hidden"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35 }}
            >
              <div className="text-[10px] text-white/60">{day}</div>
              <div className="absolute inset-x-1 bottom-1 flex flex-wrap gap-1">
                {here.map((s, idx) => (
                  <span key={idx} className={`px-2 py-0.5 rounded-full text-[10px] ${chipStyle(s.type)}`}>
                    {s.type}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <Badge>Planeamento mensal</Badge>
        <Badge>Calendário aprovado</Badge>
        <Badge>Slot extra para urgências</Badge>
      </div>
    </div>
  );
}

/* ----------------- Página ----------------- */
export default function MarketingRedesSociais() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white overflow-hidden">
      {/* BG decorativo animado */}
      <motion.div
        className="pointer-events-none fixed -top-32 -right-32 w-[48rem] h-[48rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(212,185,150,0.15), transparent 70%)" }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="pointer-events-none fixed -bottom-40 -left-40 w-[40rem] h-[40rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(235,235,235,0.12), transparent 70%)" }}
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      />

      {/* NAV */}
      <header className="sticky top-0 z-50 bg-[#2D2C2A]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* HERO */}
        <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
          <motion.p variants={fadeUp} className="uppercase tracking-[0.2em] text-white/60 text-xs">
            Marketing · Redes Sociais
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-2 text-4xl md:text-6xl font-extrabold leading-tight">
            Pack Mensal de <span className="text-[#d4b996]">Produção de Conteúdo</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-white/90 max-w-2xl">
            Instagram, TikTok e mais — <strong>organizado e gerido em equipa</strong>, do planeamento à
            publicação. Este é o pack que mais sentido faz na PRISMA: onde conseguimos acrescentar
            <strong> muito valor</strong> às empresas com consistência, criatividade e execução.
          </motion.p>

          {/* “Marquee” de tipos de conteúdo */}
          <motion.div
            variants={fadeUp}
            className="mt-6 overflow-hidden rounded-full ring-1 ring-white/10 bg-white/5"
          >
            <div className="whitespace-nowrap py-3 animate-[marquee_18s_linear_infinite]">
              Reels criativos <Dot /> Stories diários <Dot /> Sessões mensais <Dot /> UGC guiado{" "}
              <Dot /> Captação em loja <Dot /> Micro-ads <Dot /> Trends & hooks <Dot /> Copy + design
            </div>
          </motion.div>
          {/* keyframes marquee */}
          <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>

          {/* KPIs rápidos */}
          <motion.div variants={fadeUp} className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 text-center">
              <div className="text-3xl font-extrabold">8–12</div>
              <div className="text-sm text-white/70">posts/mês</div>
            </div>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 text-center">
              <div className="text-3xl font-extrabold">4–8</div>
              <div className="text-sm text-white/70">reels/mês</div>
            </div>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 text-center">
              <div className="text-3xl font-extrabold">8–15</div>
              <div className="text-sm text-white/70">stories/semana</div>
            </div>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 text-center">
              <div className="text-3xl font-extrabold">1–2</div>
              <div className="text-sm text-white/70">sessões produção</div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <a
              href="/contactos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-[#d4b996] text-black hover:bg-[#c9ad86] transition"
            >
              Pedir Proposta →
            </a>
            <a
              href="#pack"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-white/25 hover:bg-white/10 transition"
            >
              Ver o Pack
            </a>
          </motion.div>
        </motion.section>

        {/* PACK MENSAL (sem portfolio) */}
        <section id="pack" className="mt-14 grid lg:grid-cols-12 gap-8 items-start">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="lg:col-span-7">
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-extrabold">O Pack Mensal</motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-white/90">
              Um plano fechado, claro e previsível. Juntamos <strong>estratégia</strong>, <strong>produção</strong>,
              <strong> edição</strong> e <strong>gestão</strong> para saíres todas as semanas com conteúdo que
              fala a linguagem da tua marca e do teu público.
            </motion.p>

            <motion.ul variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="mt-6 space-y-3">
              {[
                "Planeamento editorial mensal + calendário aprovado.",
                "1–2 dias de produção: foto & vídeo (estúdio ou on-location).",
                "Reels/Shorts com hooks, legendas e capas.",
                "Design + copywriting alinhados ao tom da marca.",
                "Publicação agendada e community management básico.",
                "Relatório mensal com métricas e próximos passos.",
              ].map((t) => (
                <motion.li variants={fadeUp} key={t} className="flex gap-3">
                  <span className="text-[#d4b996]">✓</span>
                  <span className="text-white/90">{t}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
              <Badge>Instagram</Badge>
              <Badge>TikTok</Badge>
              <Badge>Facebook</Badge>
              <Badge>LinkedIn</Badge>
              <Badge>UGC</Badge>
            </motion.div>
          </motion.div>

          {/* Cartão com preço/estrutura & calendário animado ao lado */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-6 ring-1 ring-black/5 shadow-[0_12px_30px_rgba(0,0,0,.25)]">
              <div className="text-sm uppercase tracking-wide text-[#2D2C2A]/70">Plano recomendado</div>
              <div className="mt-1 text-3xl font-extrabold">Pack Mensal</div>
              <div className="mt-3 text-[15px]">
                Inclui estratégia, produção, edição, gestão e relatório. Add-ons para anúncios pagos, creators/UGC e influenciadores.
              </div>
              <ul className="mt-4 space-y-2 text-[15px]">
                <li>• 8–12 posts + 4–8 reels/mês</li>
                <li>• 1–2 sessões de captação</li>
                <li>• Publicação + reporting</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full bg-black/5 text-sm">Ads (opcional)</span>
                <span className="px-2.5 py-1 rounded-full bg-black/5 text-sm">Influenciadores</span>
                <span className="px-2.5 py-1 rounded-full bg-black/5 text-sm">UGC guiado</span>
              </div>
              <a href="/contactos" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold bg-[#2D2C2A] text-white hover:opacity-90">
                Falar com a PRISMA →
              </a>
            </div>

            <ContentCalendar />
          </motion.div>
        </section>

        {/* PROCESSO com animações */}
        <section className="mt-16">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-extrabold mb-6">
            Como trabalhamos todos os meses
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: "Descoberta & Objetivos", d: "Tom de voz, persona, concorrência e metas claras (awareness, engagement, leads…)." },
              { t: "Plano & Roteiros", d: "Calendário, guiões e referências visuais. Alinhamento e ajustes rápidos." },
              { t: "Produção", d: "Captação em estúdio ou on-location com equipa PRISMA (foto/vídeo/áudio)." },
              { t: "Edição & Design", d: "Cortes, legendagem, motion simples, color e artes finais." },
              { t: "Publicação & Gestão", d: "Agendamento, community básico e monitorização." },
              { t: "Relatório & Otimização", d: "Resultados, aprendizados e plano do mês seguinte." },
            ].map((s, i) => (
              <motion.div
                key={s.t}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-white/5 ring-1 ring-white/10 p-5"
              >
                <div className="text-sm text-white/60">#{i + 1}</div>
                <div className="mt-1 font-semibold">{s.t}</div>
                <div className="mt-1 text-white/80">{s.d}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Perguntas frequentes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FAQItem
              q="Podem trabalhar só com Instagram ou só TikTok?"
              a="Sim. Ajustamos o pack ao(s) canal(is) prioritário(s) e ao teu objetivo (crescimento, conversão, awareness)."
            />
            <FAQItem
              q="Quem aparece nos conteúdos?"
              a="Pode ser equipa/cliente, modelos/UGC ou criadores. Fazemos casting e guiamos em set para flows naturais."
            />
            <FAQItem
              q="Tratam de anúncios pagos?"
              a="Sim, como add-on. Fazemos criativos, set up e otimização leve — ou colaboramos com a tua equipa de performance."
            />
            <FAQItem
              q="Quanto tempo até o primeiro mês ir ao ar?"
              a="Normalmente 1–2 semanas para onboarding, plano e primeira produção."
            />
          </div>
        </section>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
