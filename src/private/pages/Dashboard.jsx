import { Link } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";

const summaryCards = [
  { label: "Receita este mês", value: "0 €", hint: "Todos os ramos" },
  { label: "Pipeline aberto", value: "0 €", hint: "Oportunidades ativas" },
  { label: "A receber", value: "0 €", hint: "Pagamentos pendentes" },
  { label: "Tarefas atrasadas", value: "0", hint: "Ações que exigem atenção" },
];

export default function Dashboard() {
  return (
    <WorkspaceLayout
      title="Visão Geral"
      eyebrow="Negócio"
      actions={
        <button
          type="button"
          className="rounded-xl bg-[#B89A84] px-4 py-2 text-sm font-semibold text-[#151515] opacity-60 cursor-not-allowed"
          title="Vamos ativar esta ação quando ligarmos a base de dados"
        >
          + Novo
        </button>
      }
    >
      <section>
        <div className="mb-7">
          <p className="text-white/45 max-w-2xl">
            Uma visão única do teu negócio, com cada ramo separado operacionalmente
            mas ligado por clientes, tarefas e financeiro.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
            >
              <p className="text-sm text-white/40">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {card.value}
              </p>
              <p className="mt-2 text-xs text-white/25">{card.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
              Ramos
            </p>
            <h2 className="text-xl font-semibold mt-1">O teu negócio</h2>
          </div>
          <p className="text-xs text-white/30">4 áreas operacionais</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {businessLines.map((line) => (
            <Link
              key={line.id}
              to={`/tomasmondim/ramo/${line.id}`}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 hover:bg-white/[0.045] hover:border-white/[0.14] transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-2xl">{line.icon}</div>
                <span className="text-white/20 group-hover:text-white/50 transition">
                  ↗
                </span>
              </div>

              <h3 className="mt-5 font-semibold text-lg">{line.name}</h3>
              <p className="mt-2 text-sm text-white/40 min-h-[40px]">
                {line.description}
              </p>

              <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-white/30">Modelo atual</span>
                <span className="text-xs text-white/65">{line.pricing}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid xl:grid-cols-3 gap-5 mt-10">
        <div className="xl:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                Foco
              </p>
              <h2 className="font-semibold mt-1">Ações prioritárias</h2>
            </div>
            <Link
              to="/tomasmondim/tarefas"
              className="text-xs text-[#B89A84] hover:text-white transition"
            >
              Ver tarefas
            </Link>
          </div>

          <div className="p-5">
            <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
              <p className="text-sm text-white/35">
                Ainda não existem tarefas. Quando ligarmos o Supabase, os follow-ups,
                entregas e cobranças aparecem aqui automaticamente.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Comercial
            </p>
            <h2 className="font-semibold mt-1">Follow-ups</h2>
          </div>

          <div className="p-5">
            <div className="rounded-xl bg-white/[0.025] px-4 py-5">
              <p className="text-3xl font-semibold">0</p>
              <p className="text-sm text-white/35 mt-1">follow-ups em atraso</p>
            </div>
            <p className="text-xs text-white/25 mt-4 leading-relaxed">
              A regra do sistema será simples: nenhuma lead ativa fica sem próxima
              ação definida.
            </p>
          </div>
        </div>
      </section>
    </WorkspaceLayout>
  );
}
