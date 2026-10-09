import { useCallback, useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";
import { supabase } from "../../lib/supabase";

const sortOptions = [
  { id: "revenue", label: "Receita" },
  { id: "jobs", label: "N.º trabalhos" },
  { id: "ticket", label: "Ticket médio" },
  { id: "mrr", label: "MRR" },
  { id: "recent", label: "Mais recentes" },
];

export default function ClientsPage() {
  const [jobs, setJobs] = useState([]);
  const [recurringRevenue, setRecurringRevenue] = useState([]);
  const [lineFilter, setLineFilter] = useState("all");
  const [sortBy, setSortBy] = useState("revenue");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [jobsResult, recurringResult] = await Promise.all([
      supabase
        .from("workspace_jobs")
        .select("*, football_teams(id,name,season)")
        .order("job_date", { ascending: false }),
      supabase
        .from("workspace_recurring_revenue")
        .select("*")
        .order("start_date", { ascending: false }),
    ]);

    const loadError = jobsResult.error || recurringResult.error;

    if (loadError) {
      setError(loadError.message);
    }

    setJobs(jobsResult.data || []);
    setRecurringRevenue(recurringResult.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const scopedJobs = useMemo(
    () =>
      lineFilter === "all"
        ? jobs
        : jobs.filter((job) => job.business_line === lineFilter),
    [jobs, lineFilter]
  );

  const scopedRecurring = useMemo(
    () =>
      lineFilter === "all"
        ? recurringRevenue
        : recurringRevenue.filter(
            (contract) => contract.business_line === lineFilter
          ),
    [recurringRevenue, lineFilter]
  );

  const clients = useMemo(() => {
    const map = new Map();

    scopedJobs.forEach((job) => {
      const name = job.football_teams?.name || job.client_name;
      const key = normalizeName(name);
      const existing = map.get(key) || makeClient(name);

      existing.lines.add(job.business_line);
      existing.revenue += Number(job.revenue || 0);
      existing.jobs += 1;

      if (!existing.firstJobDate || job.job_date < existing.firstJobDate) {
        existing.firstJobDate = job.job_date;
      }

      if (!existing.lastJobDate || job.job_date > existing.lastJobDate) {
        existing.lastJobDate = job.job_date;
      }

      map.set(key, existing);
    });

    scopedRecurring.forEach((contract) => {
      const key = normalizeName(contract.client_name);
      const existing = map.get(key) || makeClient(contract.client_name);

      existing.lines.add(contract.business_line);
      existing.recurringContracts.push(contract);

      if (contract.active) {
        existing.mrr += Number(contract.amount || 0);
        existing.activeRecurring += 1;
      } else {
        existing.inactiveRecurring += 1;
      }

      map.set(key, existing);
    });

    return Array.from(map.values()).map((client) => ({
      ...client,
      avgTicket: client.jobs ? client.revenue / client.jobs : 0,
      recurringStatus:
        client.activeRecurring > 0
          ? "active"
          : client.inactiveRecurring > 0
            ? "former"
            : "none",
    }));
  }, [scopedJobs, scopedRecurring]);

  const visibleClients = useMemo(() => {
    const term = normalizeName(search);

    const filtered = term
      ? clients.filter((client) => normalizeName(client.name).includes(term))
      : clients;

    return [...filtered].sort((a, b) => {
      if (sortBy === "jobs") return b.jobs - a.jobs || b.revenue - a.revenue;
      if (sortBy === "ticket") return b.avgTicket - a.avgTicket || b.revenue - a.revenue;
      if (sortBy === "mrr") return b.mrr - a.mrr || b.revenue - a.revenue;
      if (sortBy === "recent") {
        return (b.lastJobDate || "").localeCompare(a.lastJobDate || "");
      }
      return b.revenue - a.revenue || b.jobs - a.jobs;
    });
  }, [clients, search, sortBy]);

  const stats = useMemo(() => {
    const totalRevenue = clients.reduce(
      (total, client) => total + client.revenue,
      0
    );
    const activeRecurring = clients.filter(
      (client) => client.activeRecurring > 0
    );
    const mrr = activeRecurring.reduce(
      (total, client) => total + client.mrr,
      0
    );
    const repeatClients = clients.filter((client) => client.jobs > 1).length;
    const topClient = [...clients].sort(
      (a, b) => b.revenue - a.revenue
    )[0];

    return {
      count: clients.length,
      totalRevenue,
      revenuePerClient: clients.length ? totalRevenue / clients.length : 0,
      activeRecurring: activeRecurring.length,
      mrr,
      repeatRate: clients.length ? (repeatClients / clients.length) * 100 : 0,
      topClientShare:
        totalRevenue > 0 && topClient
          ? (topClient.revenue / totalRevenue) * 100
          : 0,
    };
  }, [clients]);

  const currentLine = businessLines.find((line) => line.id === lineFilter);

  return (
    <WorkspaceLayout title="Clientes" eyebrow="Gestão transversal">
      <div className="max-w-3xl">
        <p className="text-white/45">
          Vê os clientes por ramo, compara valor, frequência e recorrência e ordena o ranking pelas métricas mais importantes.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={lineFilter === "all"}
            onClick={() => setLineFilter("all")}
          >
            Todos
          </FilterButton>
          {businessLines.map((line) => (
            <FilterButton
              key={line.id}
              active={lineFilter === line.id}
              onClick={() => setLineFilter(line.id)}
            >
              {line.icon} {line.name}
            </FilterButton>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar cliente..."
            className="w-full sm:w-56 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#B89A84]/50"
          />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-sm text-white/70 outline-none focus:border-[#B89A84]/50"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                Ordenar: {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        <StatCard
          label="Clientes"
          value={loading ? "…" : String(stats.count)}
          hint={currentLine ? currentLine.name : "Todos os ramos"}
        />
        <StatCard
          label="Receita acumulada"
          value={loading ? "…" : money(stats.totalRevenue)}
          hint={
            loading
              ? ""
              : stats.count
                ? money(stats.revenuePerClient) + " por cliente"
                : "Sem receita registada"
          }
        />
        <StatCard
          label="Clientes recorrentes"
          value={loading ? "…" : String(stats.activeRecurring)}
          hint={loading ? "" : money(stats.mrr) + " MRR"}
        />
        <StatCard
          label="Taxa de repetição"
          value={loading ? "…" : percentage(stats.repeatRate)}
          hint={
            loading
              ? ""
              : stats.topClientShare > 0
                ? "Top cliente = " + percentage(stats.topClientShare) + " da receita"
                : "Clientes com 2+ trabalhos"
          }
        />
      </div>

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Ranking
            </p>
            <h2 className="font-semibold mt-1">
              {currentLine ? "Clientes · " + currentLine.name : "Todos os clientes"}
            </h2>
          </div>
          <p className="text-xs text-white/25">
            {loading ? "A carregar..." : visibleClients.length + " resultados"}
          </p>
        </div>

        <div className="hidden xl:grid grid-cols-[56px_1.7fr_1.1fr_110px_120px_120px_110px_130px] gap-3 px-5 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-[0.14em] text-white/25">
          <span>#</span>
          <span>Cliente</span>
          <span>Ramo</span>
          <span className="text-right">Trabalhos</span>
          <span className="text-right">Receita</span>
          <span className="text-right">Ticket médio</span>
          <span className="text-right">MRR</span>
          <span className="text-right">Último trabalho</span>
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-white/30">
            A carregar clientes...
          </div>
        ) : visibleClients.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-white/35">
              Nenhum cliente corresponde aos filtros selecionados.
            </p>
          </div>
        ) : (
          visibleClients.map((client, index) => (
            <div
              key={normalizeName(client.name)}
              className="grid xl:grid-cols-[56px_1.7fr_1.1fr_110px_120px_120px_110px_130px] gap-3 items-center px-5 py-4 border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.018] transition"
            >
              <div className="flex items-center gap-3">
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold",
                    index < 3
                      ? "border-[#B89A84]/30 bg-[#B89A84]/[0.08] text-[#D8C3B4]"
                      : "border-white/[0.06] text-white/25",
                  ].join(" ")}
                >
                  {index + 1}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">
                  {client.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <RecurringBadge status={client.recurringStatus} />
                  {client.jobs > 1 && (
                    <span className="text-[10px] text-white/25">
                      Cliente repetido
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {Array.from(client.lines).map((lineId) => {
                  const line = businessLines.find((item) => item.id === lineId);
                  return (
                    <span
                      key={lineId}
                      className="rounded-full border border-white/[0.08] px-2 py-1 text-[10px] text-white/45"
                    >
                      {line?.icon} {line?.name || lineId}
                    </span>
                  );
                })}
              </div>

              <MetricCell label="Trabalhos" value={String(client.jobs)} />
              <MetricCell label="Receita" value={money(client.revenue)} strong />
              <MetricCell label="Ticket médio" value={client.jobs ? money(client.avgTicket) : "—"} />
              <MetricCell label="MRR" value={client.mrr ? money(client.mrr) : "—"} />
              <MetricCell label="Último trabalho" value={formatDate(client.lastJobDate)} />
            </div>
          ))
        )}
      </div>

      <div className="grid xl:grid-cols-3 gap-5 mt-5">
        <InsightCard
          eyebrow="Ranking"
          title="Como é calculado"
          text="O ranking usa apenas os dados do ramo selecionado. Ao escolher Todos, junta o histórico de todos os ramos do mesmo cliente."
        />
        <InsightCard
          eyebrow="Recorrência"
          title="Avenças"
          text="Clientes com avença ativa mostram o MRR atual. Avenças terminadas ficam identificadas como antigas, sem entrarem no MRR."
        />
        <InsightCard
          eyebrow="Leitura"
          title="Ticket & repetição"
          text="O ticket médio é receita dividida pelo número de trabalhos. A taxa de repetição conta clientes com pelo menos dois trabalhos registados."
        />
      </div>
    </WorkspaceLayout>
  );
}

function makeClient(name) {
  return {
    name,
    lines: new Set(),
    revenue: 0,
    jobs: 0,
    firstJobDate: null,
    lastJobDate: null,
    recurringContracts: [],
    activeRecurring: 0,
    inactiveRecurring: 0,
    mrr: 0,
  };
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-white bg-white text-[#151515]"
          : "border-white/10 text-white/40 hover:text-white hover:border-white/20",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <p className="text-sm text-white/40">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-white/25">{hint}</p>
    </div>
  );
}

function MetricCell({ label, value, strong = false }) {
  return (
    <div className="flex xl:block items-center justify-between gap-4">
      <span className="xl:hidden text-[10px] uppercase tracking-[0.14em] text-white/20">
        {label}
      </span>
      <p
        className={[
          "text-sm xl:text-right",
          strong ? "font-medium text-white/75" : "text-white/45",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function RecurringBadge({ status }) {
  if (status === "active") {
    return (
      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-0.5 text-[10px] text-emerald-200/70">
        Avença ativa
      </span>
    );
  }

  if (status === "former") {
    return (
      <span className="rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/25">
        Ex-avença
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/25">
      Projeto
    </span>
  );
}

function InsightCard({ eyebrow, title, text }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
        {eyebrow}
      </p>
      <h2 className="font-semibold mt-1">{title}</h2>
      <p className="text-sm text-white/35 leading-relaxed mt-4">{text}</p>
    </div>
  );
}

function normalizeName(value) {
  return String(value || "").trim().toLocaleLowerCase("pt-PT");
}

function money(value) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function percentage(value) {
  return new Intl.NumberFormat("pt-PT", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(Number(value || 0) / 100);
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value + "T12:00:00"));
}
