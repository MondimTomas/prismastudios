import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import BusinessLineTabs from "../components/BusinessLineTabs";
import { getBusinessLine } from "../workspaceData";
import { supabase } from "../../lib/supabase";

export default function BusinessLinePage() {
  const { lineId, section } = useParams();
  const line = getBusinessLine(lineId);
  const [jobs, setJobs] = useState([]);
  const [footballTeams, setFootballTeams] = useState([]);
  const [browserlessUsage, setBrowserlessUsage] = useState(null);
  const [squadSyncsThisMonth, setSquadSyncsThisMonth] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState("");

  const loadLineData = useCallback(async () => {
    if (!line) return;

    setLoadingData(true);
    setDataError("");

    const jobsQuery = supabase
      .from("workspace_jobs")
      .select("*, football_teams(id,name,season), workspace_job_players(player_id)")
      .eq("business_line", line.id)
      .order("job_date", { ascending: false });

    const jobsResult = await jobsQuery;

    if (jobsResult.error) {
      setDataError(jobsResult.error.message);
      setJobs([]);
    } else {
      setJobs(jobsResult.data || []);
    }

    if (line.id === "futebol") {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [teamsResult, syncsResult, usageResult] = await Promise.all([
        supabase
          .from("football_teams")
          .select("id,name,season")
          .order("season", { ascending: false })
          .order("name", { ascending: true }),
        supabase
          .from("football_squad_syncs")
          .select("id", { count: "exact", head: true })
          .gte("created_at", monthStart.toISOString()),
        supabase.functions.invoke("zerozero-squad-preview", {
          body: { action: "usage" },
        }),
      ]);

      if (teamsResult.error) {
        setDataError((current) => current || teamsResult.error.message);
        setFootballTeams([]);
      } else {
        setFootballTeams(teamsResult.data || []);
      }

      if (syncsResult.error) {
        setDataError((current) => current || syncsResult.error.message);
        setSquadSyncsThisMonth(0);
      } else {
        setSquadSyncsThisMonth(syncsResult.count || 0);
      }

      if (usageResult.error) {
        setBrowserlessUsage(null);
      } else {
        setBrowserlessUsage(usageResult.data || null);
      }
    } else {
      setFootballTeams([]);
      setBrowserlessUsage(null);
      setSquadSyncsThisMonth(0);
    }

    setLoadingData(false);
  }, [line]);

  useEffect(() => {
    loadLineData();
  }, [loadLineData]);

  if (!line) {
    return <Navigate to="/tomasmondim" replace />;
  }

  const activeSection = section || "overview";
  const sectionExists = line.sections.some((item) => item.id === activeSection);

  if (!sectionExists) {
    return <Navigate to={`/tomasmondim/ramo/${line.id}`} replace />;
  }

  return (
    <WorkspaceLayout title={line.name} eyebrow={line.eyebrow}>
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-6">
        <div className="max-w-2xl">
          <p className="text-white/45">{line.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/45">
            Oferta: {line.offer}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/45">
            Preço: {line.pricing}
          </span>
        </div>
      </div>

      <BusinessLineTabs line={line} activeSection={activeSection} />

      {dataError && (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {dataError}
        </div>
      )}

      {activeSection === "overview" && (
        <Overview
          line={line}
          jobs={jobs}
          footballTeams={footballTeams}
          browserlessUsage={browserlessUsage}
          squadSyncsThisMonth={squadSyncsThisMonth}
          loading={loadingData}
        />
      )}
      {activeSection === "leads" && <Leads line={line} jobs={jobs} />}
      {activeSection === "work" && (
        <Work line={line} jobs={jobs} loading={loadingData} />
      )}
      {activeSection === "teams" && line.id === "futebol" && (
        <Teams teams={footballTeams} jobs={jobs} loading={loadingData} />
      )}
      {activeSection === "recurring" && <RecurringClients line={line} />}
      {activeSection === "active" && <ActiveClients line={line} />}
      {activeSection === "lost" && <LostClients />}
      {activeSection === "calendar" && <LineCalendar line={line} />}
      {activeSection === "sops" && <Sops line={line} />}
    </WorkspaceLayout>
  );
}

function Overview({
  line,
  jobs,
  footballTeams,
  browserlessUsage,
  squadSyncsThisMonth,
  loading,
}) {
  const stats = useMemo(
    () => buildLineStats(line, jobs, footballTeams),
    [line, jobs, footballTeams]
  );

  const metrics =
    line.id === "futebol"
      ? [
          { label: "Leads abertas", value: "0" },
          { label: "Sessões este mês", value: String(stats.thisMonthJobs.length) },
          { label: "Receita este mês", value: money(stats.thisMonthRevenue) },
          { label: "Equipas ativas", value: String(stats.activeTeams) },
        ]
      : line.metrics;

  return (
    <>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Metric
            key={metric.label}
            {...metric}
            value={loading && line.id === "futebol" ? "…" : metric.value}
          />
        ))}
      </div>

      {line.id === "futebol" && (
        <BrowserlessUsageCard
          usage={browserlessUsage}
          syncsThisMonth={squadSyncsThisMonth}
          loading={loading}
        />
      )}

      <section className="mt-10">
        <SectionTitle eyebrow="Pipeline" title="Processo comercial" />
        <Pipeline line={line} jobs={jobs} />
      </section>

      <section className="grid xl:grid-cols-3 gap-5 mt-10">
        <div className="xl:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <PanelHeader eyebrow="Atividade" title="Histórico recente" />
          {loading ? (
            <div className="p-5 text-sm text-white/30">A carregar atividade...</div>
          ) : jobs.length === 0 ? (
            <EmptyState>
              Quando começares a registar trabalhos neste ramo, eles aparecem aqui automaticamente.
            </EmptyState>
          ) : (
            <div>
              {jobs.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-white/[0.05] last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {job.football_teams?.name || job.client_name}
                    </p>
                    <p className="text-xs text-white/30 mt-1">
                      {formatDate(job.job_date)} · {job.title}
                      {job.football_teams?.season ? " · " + job.football_teams.season : ""}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <p className="text-sm font-medium">{money(job.revenue)}</p>
                    <p className="text-xs text-white/25 mt-1">
                      {paymentLabel(job.payment_status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <PanelHeader eyebrow="Próxima ação" title="Não deixar leads parar" />
          <div className="p-5">
            <p className="text-sm text-white/45 leading-relaxed">
              Cada lead ativa terá uma próxima ação obrigatória: ligar, enviar proposta,
              fazer follow-up ou marcar reunião.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function BrowserlessUsageCard({ usage, syncsThisMonth, loading }) {
  const used = Number.isFinite(usage?.used) ? usage.used : null;
  const limit = Number.isFinite(usage?.limit) ? usage.limit : null;
  const remaining = Number.isFinite(usage?.remaining)
    ? usage.remaining
    : used !== null && limit !== null
      ? Math.max(0, limit - used)
      : null;
  const percentage =
    used !== null && limit && limit > 0
      ? Math.min(100, Math.round((used / limit) * 100))
      : null;

  return (
    <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#B89A84]">
            Automação ZeroZero
          </p>
          <h3 className="font-semibold mt-1">Browserless · controlo de utilização</h3>
          <p className="text-xs text-white/30 mt-1">
            Só é usado quando pedes uma importação ou atualização do plantel.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-w-full lg:min-w-[430px]">
          <MiniValue
            label="Syncs este mês"
            value={loading ? "…" : String(syncsThisMonth)}
          />
          <MiniValue
            label="Units usadas"
            value={loading ? "…" : used !== null ? String(used) : "—"}
          />
          <MiniValue
            label="Units restantes"
            value={loading ? "…" : remaining !== null ? String(remaining) : "—"}
          />
        </div>
      </div>

      {percentage !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 text-[11px] text-white/30 mb-2">
            <span>{used} / {limit} units</span>
            <span>{percentage}% usado</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#B89A84]"
              style={{ width: percentage + "%" }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function Leads({ line, jobs }) {
  return (
    <>
      <SectionTitle eyebrow="Leads" title="Pipeline comercial" />
      <Pipeline line={line} jobs={jobs} />

      <section className="grid xl:grid-cols-3 gap-5 mt-8">
        <div className="xl:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <PanelHeader eyebrow="Oportunidades" title="Leads ativas" />
          <EmptyState>
            Ainda não existem leads em {line.name}. O botão “+ Novo” já assume este ramo como contexto.
          </EmptyState>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <PanelHeader eyebrow="Ficha" title="Campos deste ramo" />
          <div className="p-5 space-y-2">
            {line.fields.map((field) => (
              <div
                key={field}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/50"
              >
                {field}
              </div>
            ))}
            <div className="rounded-xl border border-[#B89A84]/20 bg-[#B89A84]/[0.06] px-4 py-3 text-sm text-[#C7AA95]">
              Próxima ação + data
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Work({ line, jobs, loading }) {
  const stats = useMemo(() => buildLineStats(line, jobs, []), [line, jobs]);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <PanelHeader eyebrow="Execução" title={line.workLabel} />
      <div className="p-5">
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          <MiniMetric
            label="Ativos"
            value={loading ? "…" : String(stats.activeJobs.length)}
          />
          <MiniMetric
            label="Este mês"
            value={loading ? "…" : String(stats.thisMonthJobs.length)}
          />
          <MiniMetric
            label="Receita"
            value={loading ? "…" : money(stats.totalRevenue)}
          />
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-white/30">
            A carregar...
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState compact>
            Os trabalhos que adicionares em “Trabalhos” aparecem aqui automaticamente.
          </EmptyState>
        ) : (
          <div className="rounded-xl border border-white/[0.06] overflow-hidden">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="grid sm:grid-cols-[110px_1fr_auto] gap-3 items-center px-4 py-3 border-b border-white/[0.05] last:border-b-0"
              >
                <span className="text-xs text-white/35">
                  {formatDate(job.job_date)}
                </span>
                <div className="min-w-0">
                  {job.team_id ? (
                    <Link
                      to={"/tomasmondim/futebol/equipas/" + job.team_id}
                      className="text-sm text-white/70 hover:text-[#B89A84] transition truncate block"
                    >
                      {job.football_teams?.name || job.client_name}
                    </Link>
                  ) : (
                    <p className="text-sm text-white/70 truncate">
                      {job.client_name}
                    </p>
                  )}
                  <p className="text-xs text-white/25 mt-1 truncate">
                    {job.title}
                    {job.football_teams?.season ? " · " + job.football_teams.season : ""}
                    {job.workspace_job_players?.length
                      ? " · " +
                        job.workspace_job_players.length +
                        (job.workspace_job_players.length === 1
                          ? " jogador"
                          : " jogadores")
                      : ""}
                  </p>
                </div>
                <span className="text-sm font-medium">{money(job.revenue)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-right">
          <Link
            to={"/tomasmondim/trabalhos?ramo=" + line.id}
            className="text-sm text-[#B89A84] hover:text-white transition"
          >
            Gerir todos os trabalhos →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Teams({ teams, jobs, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-16 text-center text-sm text-white/30">
        A carregar equipas...
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <PanelHeader eyebrow="Futebol" title="Equipas por época" />
        <EmptyState>
          Ainda não tens equipas registadas. A primeira equipa é criada quando adicionares um trabalho de Futebol.
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
            Futebol
          </p>
          <h2 className="text-xl font-semibold mt-1">Equipas por época</h2>
        </div>
        <span className="text-xs text-white/25">{teams.length} equipas</span>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams.map((team) => {
          const teamJobs = jobs.filter((job) => job.team_id === team.id);
          const revenue = teamJobs.reduce(
            (total, job) => total + Number(job.revenue || 0),
            0
          );
          const lastJob = teamJobs
            .map((job) => job.job_date)
            .filter(Boolean)
            .sort()
            .at(-1);

          return (
            <Link
              key={team.id}
              to={"/tomasmondim/futebol/equipas/" + team.id}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 hover:bg-white/[0.045] hover:border-white/[0.14] transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-[#B89A84]">Época {team.season}</p>
                  <h3 className="text-lg font-semibold mt-1">{team.name}</h3>
                </div>
                <span className="text-white/20 group-hover:text-white/55 transition">↗</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/[0.06]">
                <MiniValue label="Trabalhos" value={String(teamJobs.length)} />
                <MiniValue label="Receita" value={money(revenue)} />
                <MiniValue label="Último" value={lastJob ? formatShortDate(lastJob) : "—"} />
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function MiniValue({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/20">{label}</p>
      <p className="text-sm text-white/65 mt-1 truncate">{value}</p>
    </div>
  );
}

function RecurringClients() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <PanelHeader eyebrow="Recorrência" title="Clientes mensais" />
      <div className="p-5">
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          <MiniMetric label="Clientes ativos" value="0" />
          <MiniMetric label="MRR" value="0 €" />
          <MiniMetric label="Próximas renovações" value="0" />
        </div>
        <EmptyState compact>
          Aqui ficam as avenças de conteúdo, com entregas previstas, próxima captação e renovação.
        </EmptyState>
      </div>
    </section>
  );
}

function ActiveClients() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <PanelHeader eyebrow="Retenção" title="Clientes ativos" />
      <EmptyState>
        Atualmente não existem clientes ativos de gestão de redes sociais. Quando houver,
        esta área acompanha avença, entregas, renovação e último contacto.
      </EmptyState>
    </section>
  );
}

function LostClients() {
  const reasons = ["Preço", "Resultados", "Comunicação", "Deixou de precisar", "Concorrência", "Expectativas"];

  return (
    <section className="grid xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <PanelHeader eyebrow="Churn" title="Clientes perdidos" />
        <EmptyState>
          Tens 2 clientes recentes para documentar. Quando ligarmos os dados, vamos registar a razão,
          data de saída e aprendizagem de cada perda.
        </EmptyState>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <PanelHeader eyebrow="Análise" title="Motivos de saída" />
        <div className="p-5 flex flex-wrap gap-2">
          {reasons.map((reason) => (
            <span
              key={reason}
              className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-white/40"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function LineCalendar({ line }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <PanelHeader eyebrow="Disponibilidade" title={`Calendário de ${line.name}`} />
      <div className="p-5">
        <EmptyState compact>
          Aqui vais ver apenas compromissos deste ramo. O calendário global junta os quatro ramos
          para evitar conflitos de datas.
        </EmptyState>
        <div className="mt-4 text-right">
          <Link
            to="/tomasmondim/calendario"
            className="text-sm text-[#B89A84] hover:text-white transition"
          >
            Abrir calendário global →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Sops({ line }) {
  return (
    <>
      <SectionTitle eyebrow="Playbook" title={`SOPs de ${line.name}`} />
      <div className="grid md:grid-cols-3 gap-3">
        {line.nextActions.map((action) => (
          <div
            key={action}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-5"
          >
            <div className="h-5 w-5 rounded-md border border-white/15 mb-4" />
            <p className="text-sm text-white/55">{action}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
        <p className="text-sm text-white/40 leading-relaxed">
          O objetivo é que um trabalho novo possa aplicar um SOP e gerar automaticamente
          as tarefas certas para esse tipo de serviço.
        </p>
      </div>
    </>
  );
}

function Pipeline({ line, jobs = [] }) {
  function stageCount(stage) {
    if (line.id !== "futebol") return 0;
    if (stage === "Agendada") {
      return jobs.filter((job) => job.status === "scheduled").length;
    }
    if (stage === "Realizada") {
      return jobs.filter((job) => job.status === "completed").length;
    }
    return 0;
  }

  return (
    <div className="grid md:grid-cols-5 gap-3">
      {line.pipeline.map((stage, index) => (
        <div
          key={stage}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 min-h-[118px]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-white/30">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/35">
              {stageCount(stage)}
            </span>
          </div>
          <p className="font-medium mt-6">{stage}</p>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <p className="text-sm text-white/40">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-xs text-white/30">{label}</p>
      <p className="text-xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">{eyebrow}</p>
      <h2 className="text-xl font-semibold mt-1">{title}</h2>
    </div>
  );
}

function PanelHeader({ eyebrow, title }) {
  return (
    <div className="px-5 py-4 border-b border-white/[0.06]">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">{eyebrow}</p>
      <h2 className="font-semibold mt-1">{title}</h2>
    </div>
  );
}

function buildLineStats(line, jobs, footballTeams) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthJobs = jobs.filter((job) => {
    if (!job.job_date) return false;
    const date = new Date(job.job_date + "T12:00:00");
    return (
      date.getFullYear() === currentYear &&
      date.getMonth() === currentMonth
    );
  });

  const thisMonthRevenue = thisMonthJobs.reduce(
    (total, job) => total + Number(job.revenue || 0),
    0
  );

  const totalRevenue = jobs.reduce(
    (total, job) => total + Number(job.revenue || 0),
    0
  );

  const activeJobs = jobs.filter((job) =>
    ["scheduled", "in_progress"].includes(job.status)
  );

  const activeTeams =
    line.id === "futebol"
      ? footballTeams.filter(
          (team) => team.season === footballSeasonForDate(now)
        ).length
      : 0;

  return {
    thisMonthJobs,
    thisMonthRevenue,
    totalRevenue,
    activeJobs,
    activeTeams,
  };
}

function footballSeasonForDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 7) {
    return year + "/" + String(year + 1).slice(-2);
  }

  return year - 1 + "/" + String(year).slice(-2);
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
    year: "numeric",
  }).format(new Date(value + "T12:00:00"));
}

function formatShortDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value + "T12:00:00"));
}

function paymentLabel(value) {
  return (
    {
      paid: "Pago",
      partial: "Parcial",
      unpaid: "Por pagar",
    }[value] || value
  );
}

function EmptyState({ children, compact = false }) {
  return (
    <div className={compact ? "" : "p-5"}>
      <div
        className={[
          "rounded-xl border border-dashed border-white/10 px-5 text-center",
          compact ? "py-10" : "py-12",
        ].join(" ")}
      >
        <p className="text-sm text-white/35 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
