// src/pages/MarketingDesenvolvimentoWeb.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";

/* ---------- helpers de animação ---------- */
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

function Badge({ children }) {
  return <span className="px-3 py-1 rounded-full text-sm bg-black/10 text-white/90 ring-1 ring-white/10">{children}</span>;
}

/* ---------- FAQ simples ---------- */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
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

export default function MarketingDesenvolvimentoWeb() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white overflow-hidden">
      {/* BG decorativo animado */}
      <motion.div
        className="pointer-events-none fixed -top-40 -right-40 w-[48rem] h-[48rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(212,185,150,0.14), transparent 70%)" }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="pointer-events-none fixed -bottom-48 -left-48 w-[42rem] h-[42rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(235,235,235,0.10), transparent 70%)" }}
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
            Marketing · Desenvolvimento Web
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-2 text-4xl md:text-6xl font-extrabold leading-tight">
            Websites e Apps com <span className="text-[#d4b996]">performance</span> e <span className="text-[#d4b996]">escala</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-white/90 max-w-2xl">
            Equipa PRISMA com profissionais formados em <strong>frontend</strong> e <strong>backend</strong>. Construímos
            desde <strong>sites estáticos</strong> super rápidos a soluções <strong>full-stack com base de dados</strong>, integrações e
            painéis de gestão — prontos para SEO, segurança e crescimento.
          </motion.p>

          {/* “Marquee” de stack */}
          <motion.div variants={fadeUp} className="mt-6 overflow-hidden rounded-full ring-1 ring-white/10 bg-white/5">
            <div className="whitespace-nowrap py-3 animate-[marquee_18s_linear_infinite]">
              React · Vite · Next.js · Node.js · Express · REST/GraphQL · PostgreSQL · MySQL · MongoDB · Prisma · Auth ·
              Tailwind · SEO técnico · Vercel · AWS
            </div>
          </motion.div>
          <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <a
              href="/contactos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-[#d4b996] text-black hover:bg-[#c9ad86] transition"
            >
              Falar com a PRISMA →
            </a>
            <a
              href="#solucoes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-white/25 hover:bg-white/10 transition"
            >
              Ver soluções
            </a>
          </motion.div>
        </motion.section>

        {/* SOLUÇÕES (cartões animados) */}
        <section id="solucoes" className="mt-14 grid lg:grid-cols-3 gap-6">
          {[
            {
              title: "Site Estático Rápido",
              bullet: [
                "Landing/one-pager otimizado para SEO",
                "Carregamento instantâneo (Vite/SSR/Static)",
                "Integração analytics e formulários",
              ],
              hint: "Ideal para lançamentos e marcas em validação.",
            },
            {
              title: "Website Dinâmico (CMS/DB)",
              bullet: [
                "Conteúdos editáveis e multi-lingua",
                "Autenticação e áreas privadas",
                "Base de dados (PostgreSQL/MySQL/Mongo)",
              ],
              hint: "Escala com segurança e governança de conteúdo.",
            },
            {
              title: "App Web Full-Stack",
              bullet: [
                "Dashboards, pagamentos e integrações",
                "APIs REST/GraphQL e jobs de background",
                "Deploy CI/CD, logs e observabilidade",
              ],
              hint: "Para produtos digitais e operações internas.",
            },
          ].map((c) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 shadow-[0_12px_30px_rgba(0,0,0,.25)] hover:shadow-[0_18px_44px_rgba(0,0,0,.35)] transition"
            >
              <div className="text-sm uppercase tracking-wide text-white/60">Solução</div>
              <h3 className="mt-1 text-2xl font-extrabold">{c.title}</h3>
              <ul className="mt-4 space-y-2 text-white/90">
                {c.bullet.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="text-[#d4b996]">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-white/70">{c.hint}</p>
            </motion.div>
          ))}
        </section>

        {/* COMPARAÇÃO RÁPIDA */}
        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Qual a melhor opção para ti?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
              <div className="text-sm uppercase tracking-wide text-white/60">Uso recomendado</div>
              <h3 className="mt-1 text-xl font-bold">Site Estático</h3>
              <ul className="mt-3 space-y-2">
                {[
                  "Páginas institucionais, campanhas, one-page",
                  "Alta velocidade, baixo custo de manutenção",
                  "Conteúdos que mudam pouco",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-[#d4b996]">•</span>
                    <span className="text-white/90">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
              <div className="text-sm uppercase tracking-wide text-white/60">Uso recomendado</div>
              <h3 className="mt-1 text-xl font-bold">Website Dinâmico (CMS/DB)</h3>
              <ul className="mt-3 space-y-2">
                {[
                  "Blog, catálogo, áreas privadas, multi-língua",
                  "Equipa a publicar conteúdos com frequência",
                  "Escalabilidade e integrações (pagamentos, CRM)",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-[#d4b996]">•</span>
                    <span className="text-white/90">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>Performance</Badge>
            <Badge>Acessibilidade</Badge>
            <Badge>SEO técnico</Badge>
            <Badge>Segurança</Badge>
            <Badge>Escalabilidade</Badge>
            <Badge>Documentação</Badge>
          </div>
        </section>

        {/* PROCESSO */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Do conceito ao deploy</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: "Descoberta", d: "Objetivos, público, conteúdos e integrações necessárias." },
              { t: "Arquitetura", d: "Mapeamento de páginas, modelos de dados e APIs." },
              { t: "Design & Frontend", d: "UI responsiva, acessível e com excelente performance." },
              { t: "Backend & DB", d: "Autenticação, CRUDs, pagamentos e integrações externas." },
              { t: "QA & Performance", d: "Testes, auditorias (Lighthouse) e hardening de segurança." },
              { t: "Deploy & Handover", d: "CI/CD, monitorização e documentação para a tua equipa." },
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

        {/* STACK / ENTREGAS */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Stack & Entregas</h2>
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
              <div className="text-sm uppercase tracking-wide text-white/60">Tecnologias</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>React</Badge>
                <Badge>Vite</Badge>
                <Badge>Next.js</Badge>
                <Badge>Node.js</Badge>
                <Badge>Express</Badge>
                <Badge>REST</Badge>
                <Badge>GraphQL</Badge>
                <Badge>PostgreSQL</Badge>
                <Badge>MySQL</Badge>
                <Badge>MongoDB</Badge>
                <Badge>Prisma</Badge>
                <Badge>Tailwind</Badge>
                <Badge>Auth</Badge>
                <Badge>Vercel</Badge>
                <Badge>AWS</Badge>
              </div>
            </div>
            <div className="lg:col-span-5 rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-6 ring-1 ring-black/5">
              <div className="text-sm uppercase tracking-wide text-[#2D2C2A]/70">Inclui</div>
              <ul className="mt-3 space-y-2 text-[15px]">
                <li>• Setup de domínio, SSL e e-mail transacional</li>
                <li>• SEO técnico (metas, sitemap, OG, schema)</li>
                <li>• Documentação e handover para a tua equipa</li>
                <li>• Suporte opcional e evolução por sprint</li>
              </ul>
              <a href="/contactos" className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold bg-[#2D2C2A] text-white hover:opacity-90">
                Pedir proposta →
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Perguntas frequentes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FAQItem q="Podem migrar o meu site atual para algo mais rápido?" a="Sim. Fazemos auditoria e migramos para uma stack moderna, preservando SEO e conteúdos." />
            <FAQItem q="Trabalham com CMS?" a="Sim. Usamos CMS headless (p.ex. Sanity/Strapi) ou implementamos um painel simples à medida." />
            <FAQItem q="Dão suporte contínuo?" a="Temos planos de manutenção e evolução por sprint, conforme a necessidade do projeto." />
            <FAQItem q="Aceitam integrações específicas?" a="Claro — pagamentos, CRM, automações, analytics avançado, etc." />
          </div>
        </section>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
