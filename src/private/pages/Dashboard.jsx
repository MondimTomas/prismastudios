import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    const [jobsResult, leadsResult] = await Promise.all([
      supabase
        .from("workspace_jobs")
        .select("*, football_teams(id,name,season)")
        .order("job_date", { ascending: false }),
      supabase
        .from("workspace_leads")
        .select("*")
        .order("next_action_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false }),
    ]);

    const loadError = jobsResult.error || leadsResult.error;

    if (loadError) {
      setError(loadError.message);
      setJobs(jobsResult.data || []);
      setLeads(leadsResult.data || []);
    } else {
      setJobs(jobsResult.data || []);
      setLeads(leadsResult.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthJobs = jobs.filter((job) => sameMonth(job.job_date, now));
    const revenueThisMonth = sum(monthJobs, "revenue");
    const openLeads = leads.filter((lead) => !isClosedLead(lead));
    const pipelineValue = openLeads.reduce(
      (total, lead) => total + Number(lead.estimated_value || 0),
      0
    );
    const receivable = jobs
      .filter((job) => job.payment_status !== "paid")
      .reduce((total, job) => total + Number(job.revenue || 0), 0);

    const byLine = Object.fromEntries(
      businessLines.map((line) => {
        const lineJobs = jobs.filter((job) => job.business_line === line.id);
        return [
          line.id,
          {
            jobs: lineJobs.length,
            revenue: sum(lineJobs, "revenue"),
          },
        ];
      })
    );

    const today = startOfDay(now);
    const inSevenDays = new Date(today);
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    const upcoming = jobs
      .filter((job) => {
        if (!job.job_date) return false;
        const date = parseDate(job.job_date);
        return date >= today && date <= inSevenDays;
      })
      .sort((a, b) => a.job_date.localeCompare(b.job_date));

    const overdueFollowups = openLeads.filter(
      (lead) =>
        lead.next_action_date &&
        parseDate(lead.next_action_date) < today
    );

    const proposalsWaiting = openLeads.filter((lead) =>
      ["Proposta", "Orçamento"].includes(lead.stage)
    );

    const leadActions = openLeads
      .filter((lead) => lead.next_action || lead.next_action_date)
      .sort((a, b) =>
        (a.next_action_date || "9999-12-31").localeCompare(
          b.next_action_date || "9999-12-31"
        )
      );

    return {
      revenueThisMonth,
      pipelineValue,
      receivable,
      monthJobs: monthJobs.length,
      byLine,
      upcoming,
      overduePayments: jobs.filter(
        (job) =>
          job.payment_status !== "paid" &&
          job.job_date &&
          parseDate(job.job_date) < today
      ).length,
      overdueFollowups,
      proposalsWaiting,
      leadActions,
    };
  }, [jobs, leads]);

  const summaryCards = [
    {
      label: "Receita este mês",
      value: money(stats.revenueThisMonth),
      hint: "Todos os ramos",
    },
    {
      label: "Pipeline aberto",
      value: money(stats.pipelineValue),
      hint: leads.filter((lead) => !isClosedLead(lead)).length + " leads abertas",
    },
    {
      label: "A receber",
      value: money(stats.receivable),
      hint: "Trabalhos não marcados como pagos",
    },
    {
      label: "Trabalhos este mês",
      value: String(stats.monthJobs),
      hint: "Sessões, projetos e eventos",
    },
  ];

  return (
    <WorkspaceLayout title="Visão Geral" eyebrow="Negócio">
      <section>
        <div className="mb-7">
          <p className="text-white/45 max-w-2xl">
            O teu cockpit diário: dinheiro, próximos compromissos, follow-ups e o estado de cada ramo.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
            >
              <p className="text-sm text-white/40">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {loading ? "…" : card.value}
              </p>
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
            {loading ? (
              <p className="text-sm text-white/30 text-center py-10">A carregar...</p>
            ) : stats.upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
                <p className="text-sm text-white/35">
                  Sem trabalhos registados nos próximos 7 dias.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.upcoming.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white/70 truncate">
                        {job.football_teams?.name || job.client_name}
                      </p>
                      <p className="text-xs text-white/25 mt-1 truncate">
                        {formatDate(job.job_date)} · {job.title}
                      </p>
                    </div>
                    <span className="text-xs text-white/30 shrink-0">
                      {businessLines.find((line) => line.id === job.business_line)?.icon}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
            <AttentionRow
              label="Follow-ups atrasados"
              value={loading ? "…" : String(stats.overdueFollowups.length)}
            />
            <AttentionRow
              label="Propostas sem resposta"
              value={loading ? "…" : String(stats.proposalsWaiting.length)}
            />
            <AttentionRow
              label="Pagamentos em atraso"
              value={loading ? "…" : String(stats.overduePayments)}
            />
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
          {businessLines.map((line) => {
            const lineStats = stats.byLine[line.id] || { jobs: 0, revenue: 0 };

            return (
              <Link
                key={line.id}
                to={"/tomasmondim/ramo/" + line.id}
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
                      Receita
                    </p>
                    <p className="text-sm text-white/70 mt-1">
                      {loading ? "…" : money(lineStats.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/20">
                      Trabalhos
                    </p>
                    <p className="text-sm text-white/70 mt-1">
                      {loading ? "…" : String(lineStats.jobs)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
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
            {loading ? (
              <p className="text-sm text-white/30 text-center py-10">A carregar...</p>
            ) : stats.leadActions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
                <p className="text-sm text-white/35">
                  Sem follow-ups de leads registados.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.leadActions.slice(0, 6).map((lead) => {
                  const line = businessLines.find((item) => item.id === lead.business_line);
                  const overdue =
                    lead.next_action_date &&
                    parseDate(lead.next_action_date) < startOfDay(new Date());

                  return (
                    <Link
                      key={lead.id}
                      to={"/tomasmondim/admin/ramo/" + lead.business_line + "/leads"}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-white/65 truncate">
                          {line?.icon} {lead.name}
                        </p>
                        <p className="text-xs text-white/25 mt-1 truncate">
                          {lead.next_action || "Follow-up"} · {lead.stage}
                        </p>
                      </div>
                      <span className={overdue ? "text-xs text-red-200/70 shrink-0" : "text-xs text-white/30 shrink-0"}>
                        {lead.next_action_date ? formatDate(lead.next_action_date) : "Sem data"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
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

function isClosedLead(lead) {
  const line = businessLines.find((item) => item.id === lead.business_line);
  return Boolean(line && lead.stage === line.pipeline[line.pipeline.length - 1]);
}

function sum(items, field) {
  return items.reduce((total, item) => total + Number(item[field] || 0), 0);
}

function sameMonth(value, referenceDate) {
  if (!value) return false;
  const date = parseDate(value);
  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth()
  );
}

function parseDate(value) {
  return new Date(value + "T12:00:00");
}

function startOfDay(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function money(value) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
  }).format(parseDate(value));
}
