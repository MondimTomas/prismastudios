// src/pages/MarketingLeads.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";

/* --------- animações --------- */
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

function Badge({ children }) {
  return <span className="px-3 py-1 rounded-full text-sm bg-black/10 text-white/90 ring-1 ring-white/10">{children}</span>;
}

/* --------- Card KPI --------- */
function Kpi({ value, label }) {
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-5 text-center">
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="text-sm text-white/70">{label}</div>
    </div>
  );
}

/* --------- Step do funil --------- */
function FunnelStep({ n, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      className="relative rounded-2xl bg-white/5 ring-1 ring-white/10 p-5"
    >
      <div className="text-sm text-white/60">#{n}</div>
      <div className="mt-1 font-semibold">{title}</div>
      <div className="mt-1 text-white/80">{desc}</div>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block text-white/30">→</div>
    </motion.div>
  );
}

/* --------- Página --------- */
export default function MarketingLeads() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#2D2C2A] text-white overflow-hidden">
      {/* BG decorativo */}
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
            Marketing · Geração de Leads
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-2 text-4xl md:text-6xl font-extrabold leading-tight">
            Sistema e Estratégia para <span className="text-[#d4b996]">Leads Reais</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-white/90 max-w-2xl">
            Para <strong>empresas</strong> e <strong>imobiliárias</strong>: construímos um motor de aquisição
            que combina <strong>criativos certos</strong>, <strong>landing pages rápidas</strong>, <strong>captação qualificada</strong> e
            <strong> follow-up</strong> automático. Do tráfego ao contacto marcado — com métricas claras.
          </motion.p>

          {/* KPIs */}
          <motion.div variants={fadeUp} className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi value="↑ 2–5x" label="Melhor aproveitamento de tráfego" />
            <Kpi value="≤ 1h" label="Tempo médio de follow-up" />
            <Kpi value="20–40%" label="CVR em páginas de alta intenção" />
            <Kpi value="CPL ↓" label="Custo por lead otimizado" />
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <a
              href="/contactos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-[#d4b996] text-black hover:bg-[#c9ad86] transition"
            >
              Falar com a PRISMA →
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-white/25 hover:bg-white/10 transition"
            >
              Ver como funciona
            </a>
          </motion.div>
        </motion.section>

        {/* FUNIL (passo a passo) */}
        <section id="como-funciona" className="mt-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">O nosso funil — ponta a ponta</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FunnelStep
              n={1}
              title="Tráfego & Criativos"
              desc="Pesquisa e personas. Anúncios/meta, conteúdos orgânicos e parcerias. Criativos alinhados a intenção (frio, morno, quente)."
            />
            <FunnelStep
              n={2}
              title="Landing & Captação"
              desc="Landing pages rápidas e mobile-first (formulário, WhatsApp click-to-chat, call). Teste A/B e SEO mínimo para captura."
            />
            <FunnelStep
              n={3}
              title="Qualificação & Follow-up"
              desc="Automação com e-mail/SMS/WhatsApp, scoring e handoff para comercial. Integração CRM (p.ex. HubSpot, Pipedrive)."
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>Leads imobiliárias</Badge>
            <Badge>B2B/B2C</Badge>
            <Badge>Calendly/Agendamentos</Badge>
            <Badge>UTM & tracking</Badge>
          </div>
        </section>

        {/* PLANOS */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Planos que escalam contigo</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                points: [
                  "1 landing + formulário + WhatsApp",
                  "Setup de pixel/UTM e analytics",
                  "Automação básica de resposta",
                ],
                note: "Arranque rápido para validar o canal.",
              },
              {
                name: "Growth",
                highlight: true,
                points: [
                  "2–3 landings + A/B test",
                  "Sequências e scoring de leads",
                  "Integração CRM (HubSpot/Pipedrive)",
                ],
                note: "Equilíbrio entre escala e controlo.",
              },
              {
                name: "Performance",
                points: [
                  "Múltiplas páginas por campanha",
                  "Roteiros criativos + UGC guiado",
                  "Relatórios semanais + optimizações",
                ],
                note: "Para equipas comerciais agressivas.",
              },
            ].map((p) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className={`rounded-2xl p-6 shadow-[0_12px_30px_rgba(0,0,0,.25)] ring-1 ${
                  p.highlight ? "bg-[#EBEBEB] text-[#2D2C2A] ring-black/5" : "bg-white/5 ring-white/10"
                }`}
              >
                <div className="text-sm uppercase tracking-wide opacity-70">Plano</div>
                <h3 className="mt-1 text-2xl font-extrabold">{p.name}</h3>
                <ul className="mt-4 space-y-2">
                  {p.points.map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className={p.highlight ? "text-[#2D2C2A]" : "text-[#d4b996]"}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <p className={`mt-4 text-sm ${p.highlight ? "text-black/70" : "text-white/70"}`}>{p.note}</p>
                <a
                  href="/contactos"
                  className={`mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold ${
                    p.highlight ? "bg-[#2D2C2A] text-white hover:opacity-90" : "bg-[#d4b996] text-black hover:bg-[#c9ad86]"
                  }`}
                >
                  Pedir proposta →
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* INTEGRAÇÕES / STACK */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Integrações e stack</h2>
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
              <div className="text-sm uppercase tracking-wide text-white/60">Ferramentas</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>Meta / Google Ads</Badge>
                <Badge>Tag Manager</Badge>
                <Badge>GA4</Badge>
                <Badge>Hotjar</Badge>
                <Badge>HubSpot</Badge>
                <Badge>Pipedrive</Badge>
                <Badge>Zapier/Make</Badge>
                <Badge>Calendly</Badge>
                <Badge>WhatsApp API</Badge>
                <Badge>Mail/SMS</Badge>
              </div>
            </div>
            <div className="lg:col-span-5 rounded-2xl bg-[#EBEBEB] text-[#2D2C2A] p-6 ring-1 ring-black/5">
              <div className="text-sm uppercase tracking-wide text-[#2D2C2A]/70">Inclui</div>
              <ul className="mt-3 space-y-2 text-[15px]">
                <li>• Mapeamento de jornada e oferta</li>
                <li>• Implementação técnica e QA</li>
                <li>• Dashboard de métricas essenciais</li>
                <li>• Reuniões de otimização</li>
              </ul>
              <a href="/contactos" className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold bg-[#2D2C2A] text-white hover:opacity-90">
                Vamos gerar leads →
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Perguntas frequentes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-5">
              <div className="font-semibold">Funciona para imobiliárias?</div>
              <div className="mt-1 text-white/80">
                Sim — páginas por tipologia, bairro ou campanha; qualificação (orçamento, timing, financiamento) e envio direto ao consultor.
              </div>
            </div>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-5">
              <div className="font-semibold">Trabalham só com orgânico?</div>
              <div className="mt-1 text-white/80">
                Fazemos orgânico + pago. O ganho real vem do sistema inteiro: criativo certo, landing rápida e follow-up consistente.
              </div>
            </div>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-5">
              <div className="font-semibold">Integram com o meu CRM?</div>
              <div className="mt-1 text-white/80">Sim, HubSpot/Pipedrive e outros via API/Zapier/Make.</div>
            </div>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-5">
              <div className="font-semibold">Quanto tempo para ir ao ar?</div>
              <div className="mt-1 text-white/80">Normalmente 1–2 semanas para o primeiro ciclo com tracking e automações.</div>
            </div>
          </div>
        </section>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
