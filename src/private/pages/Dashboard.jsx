import { Link } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";

const summaryCards = [
  { label: "Receita este mês", value: "0 €", hint: "Todos os ramos" },
  { label: "Pipeline aberto", value: "0 €", hint: "Oportunidades ativas" },
  { label: "A receber", value: "0 €", hint: "Pagamentos pendentes" },
  { label: "Trabalhos este mês", value: "0", hint: "Sessões, projetos e eventos" },
];

export default function Dashboard() {
  return (
    <WorkspaceLayout title="Visão Geral" eyebrow="Negócio">
      <section>
        <div className="mb-7">
          <p className="text-white/45 max-w-2xl">
            O teu cockpit diário: dinheiro, próximos compromissos, follow-ups e o estado de cada ramo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
            >
              <p className="text-sm text-white/40">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-2 text-xs text-white/25">{card.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid xl:grid-cols-2 gap-5 mt-8">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                Agenda
              </p>
              <h2 className="font-semibold mt-1">Próximos 7 dias</h2>
            </div>
            <Link
              to="/tomasmondim/calendario"
              className="text-xs text-[#B89A84] hover:text-white transition"
            >
              Ver calendário
            </Link>
          </div>

          <div className="p-5">
            <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
              <p className="text-sm text-white/35">
                Sem sessões, gravações, eventos, reuniões ou entregas agendadas.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Prioridade
            </p>
            <h2 className="font-semibold mt-1">Precisa da tua atenção</h2>
          </div>

          <div className="p-5 space-y-3">
            <AttentionRow label="Follow-ups atrasados" value="0" />
            <AttentionRow label="Propostas sem resposta" value="0" />
            <AttentionRow label="Pagamentos em atraso" value="0" />
          </div>
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

              <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/20">
                    Pipeline
                  </p>
                  <p className="text-sm text-white/70 mt-1">0 €</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/20">
                    Trabalhos
                  </p>
                  <p className="text-sm text-white/70 mt-1">0</p>
                </div>
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
                Execução
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
                Ainda não existem tarefas. Follow-ups, entregas, cobranças e ações de projeto vão aparecer aqui.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Regra comercial
            </p>
            <h2 className="font-semibold mt-1">Próxima ação</h2>
          </div>

          <div className="p-5">
            <p className="text-sm text-white/45 leading-relaxed">
              Nenhuma lead ativa deve ficar sem uma próxima ação e uma data definida.
              É isto que vai impedir oportunidades de desaparecerem por falta de follow-up.
            </p>
          </div>
        </div>
      </section>
    </WorkspaceLayout>
  );
}

function AttentionRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
      <span className="text-sm text-white/50">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
