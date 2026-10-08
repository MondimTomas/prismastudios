import { useCallback, useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";
import { supabase } from "../../lib/supabase";

const today = dateKey(new Date());

export default function PerformancePage() {
  const [scope, setScope] = useState("all");
  const [period, setPeriod] = useState("ytd");
  const [jobs, setJobs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [recurringRevenue, setRecurringRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAcquisitionForm, setShowAcquisitionForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [acquisitionForm, setAcquisitionForm] = useState({
    business_line: "futebol",
    amount: "",
    expense_date: today,
    name: "",
    notes: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [jobsResult, expensesResult, fixedResult, recurringResult] =
      await Promise.all([
        supabase
          .from("workspace_jobs")
          .select("*, collaborator_assignments(fee_amount,travel_reimbursement,status)")
          .order("job_date", { ascending: true }),
        supabase
          .from("workspace_expenses")
          .select("*")
          .order("expense_date", { ascending: false }),
        supabase
          .from("workspace_recurring_expenses")
          .select("*")
          .order("start_date", { ascending: true }),
        supabase
          .from("workspace_recurring_revenue")
          .select("*")
          .order("start_date", { ascending: true }),
      ]);

    const loadError =
      jobsResult.error ||
      expensesResult.error ||
      fixedResult.error ||
      recurringResult.error;

    if (loadError) {
      setError(loadError.message);
      setJobs([]);
      setExpenses([]);
      setFixedExpenses([]);
      setRecurringRevenue([]);
    } else {
      setJobs(jobsResult.data || []);
      setExpenses(expensesResult.data || []);
      setFixedExpenses(fixedResult.data || []);
      setRecurringRevenue(recurringResult.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function registerAcquisitionSpend(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const amount = Number(acquisitionForm.amount || 0);
    if (amount <= 0 || !acquisitionForm.business_line || !acquisitionForm.expense_date) {
      setSaving(false);
      setError("Indica o ramo, valor e data do investimento.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const line = businessLines.find(
      (item) => item.id === acquisitionForm.business_line
    );

    const { error: insertError } = await supabase
      .from("workspace_expenses")
      .insert({
        name:
          acquisitionForm.name.trim() ||
          "Aquisição — " + (line?.name || acquisitionForm.business_line),
        amount,
        expense_date: acquisitionForm.expense_date,
        category: "Aquisição",
        business_line: acquisitionForm.business_line,
        is_acquisition: true,
        notes: acquisitionForm.notes.trim() || null,
        created_by: userData.user?.id || null,
      });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAcquisitionForm((current) => ({
      ...current,
      amount: "",
      name: "",
      notes: "",
      expense_date: today,
    }));
    setShowAcquisitionForm(false);
    await loadData();
  }

  async function deleteAcquisitionSpend(id) {
    if (!window.confirm("Apagar este investimento de aquisição?")) return;

    const { error: deleteError } = await supabase
      .from("workspace_expenses")
      .delete()
      .eq("id", id)
      .eq("is_acquisition", true);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadData();
  }

  const range = useMemo(() => periodRange(period), [period]);

  const globalStats = useMemo(
    () =>
      buildStats({
        lineId: null,
        jobs,
        expenses,
        fixedExpenses,
        recurringRevenue,
        range,
        includeGeneralCosts: true,
      }),
    [jobs, expenses, fixedExpenses, recurringRevenue, range]
  );

  const lineStats = useMemo(
    () =>
      Object.fromEntries(
        businessLines.map((line) => [
          line.id,
          buildStats({
            lineId: line.id,
            jobs,
            expenses,
            fixedExpenses,
            recurringRevenue,
            range,
            includeGeneralCosts: false,
          }),
        ])
      ),
    [jobs, expenses, fixedExpenses, recurringRevenue, range]
  );

  const stats = scope === "all" ? globalStats : lineStats[scope];
  const currentLine = businessLines.find((line) => line.id === scope);
  const acquisitionRows = expenses.filter(
    (expense) =>
      expense.is_acquisition &&
      (scope === "all" || expense.business_line === scope)
  );

  const kpis = [
    {
      label: "Receita",
      value: money(stats.revenue),
      hint: range.label,
    },
    {
      label: scope === "all" ? "Resultado" : "Margem contributiva",
      value: money(stats.result),
      hint:
        scope === "all"
          ? "Depois de todos os custos registados"
          : "Sem repartir custos gerais do estúdio",
    },
    {
      label: "Margem",
      value: percentage(stats.marginPct),
      hint: "Resultado ÷ receita",
    },
    {
      label: "Ticket médio",
      value: stats.jobsCount ? money(stats.avgTicket) : "—",
      hint: stats.jobsCount + " trabalhos no período",
    },
    {
      label: "MRR atual",
      value: money(stats.mrr),
      hint: stats.activeRecurringClients + " clientes mensais ativos",
    },
    {
      label: "CAC monetário",
      value: stats.cac == null ? "—" : money(stats.cac),
      hint:
        stats.cac == null
          ? "Regista investimento de aquisição"
          : stats.newClients + " novos clientes no período",
    },
    {
      label: "LTV realizado",
      value: stats.ltv == null ? "—" : money(stats.ltv),
      hint: "Margem histórica média por cliente",
    },
    {
      label: "LTV : CAC",
      value: stats.ltvCac == null ? "—" : stats.ltvCac.toFixed(1) + "×",
      hint: "Quanto o cliente vale por cada € de aquisição",
    },
  ];

  return (
    <WorkspaceLayout
      title="Performance"
      eyebrow="KPIs do negócio"
      actions={
        <button
          type="button"
          onClick={() => setShowAcquisitionForm((value) => !value)}
          className="rounded-xl bg-[#B89A84] px-4 py-2.5 text-sm font-semibold text-[#151515] hover:brightness-110 transition"
        >
          {showAcquisitionForm ? "Fechar" : "+ Investimento aquisição"}
        </button>
      }
    >
      <div className="max-w-3xl">
        <p className="text-white/45">
          KPIs calculados automaticamente a partir dos trabalhos, custos,
          colaboradores, despesas e avenças. O CAC só fica disponível quando
          registares investimento de aquisição por ramo.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {showAcquisitionForm && (
        <form
          onSubmit={registerAcquisitionSpend}
          className="mt-7 rounded-2xl border border-[#B89A84]/20 bg-[#B89A84]/[0.04] p-5"
        >
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#B89A84]">
              CAC
            </p>
            <h2 className="font-semibold mt-1">
              Registar investimento de aquisição
            </h2>
            <p className="text-xs text-white/30 mt-2">
              Este valor também entra automaticamente como despesa no Financeiro.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Field label="Ramo">
              <select
                value={acquisitionForm.business_line}
                onChange={(event) =>
                  setAcquisitionForm({
                    ...acquisitionForm,
                    business_line: event.target.value,
                  })
                }
                className={inputClass}
              >
                {businessLines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Valor (€)">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={acquisitionForm.amount}
                onChange={(event) =>
                  setAcquisitionForm({
                    ...acquisitionForm,
                    amount: event.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Data">
              <input
                required
                type="date"
                value={acquisitionForm.expense_date}
                onChange={(event) =>
                  setAcquisitionForm({
                    ...acquisitionForm,
                    expense_date: event.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Canal / descrição">
              <input
                value={acquisitionForm.name}
                onChange={(event) =>
                  setAcquisitionForm({
                    ...acquisitionForm,
                    name: event.target.value,
                  })
                }
                placeholder="Ex.: Meta Ads"
                className={inputClass}
              />
            </Field>

            <div className="sm:col-span-2 xl:col-span-4">
              <Field label="Notas">
                <input
                  value={acquisitionForm.notes}
                  onChange={(event) =>
                    setAcquisitionForm({
                      ...acquisitionForm,
                      notes: event.target.value,
                    })
                  }
                  placeholder="Opcional"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              disabled={saving}
              className="rounded-xl bg-[#B89A84] px-5 py-3 text-sm font-semibold text-[#151515] disabled:opacity-50"
            >
              {saving ? "A guardar..." : "Guardar investimento"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterButton active={scope === "all"} onClick={() => setScope("all")}>
            Prisma
          </FilterButton>
          {businessLines.map((line) => (
            <FilterButton
              key={line.id}
              active={scope === line.id}
              onClick={() => setScope(line.id)}
            >
              {line.icon} {line.name}
            </FilterButton>
          ))}
        </div>

        <div className="flex gap-2">
          <FilterButton active={period === "month"} onClick={() => setPeriod("month")}>
            Este mês
          </FilterButton>
          <FilterButton active={period === "ytd"} onClick={() => setPeriod("ytd")}>
            2026 YTD
          </FilterButton>
          <FilterButton active={period === "all"} onClick={() => setPeriod("all")}>
            Histórico
          </FilterButton>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            A analisar
          </p>
          <h2 className="text-lg font-semibold mt-1">
            {currentLine
              ? currentLine.icon + " " + currentLine.name
              : "Prisma Studios"}
          </h2>
        </div>
        <p className="text-xs text-white/30">{range.label}</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} loading={loading} {...kpi} />
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-5">
        <MiniCard
          label="Clientes no período"
          value={loading ? "…" : String(stats.clients)}
          detail={stats.newClients + " novos"}
        />
        <MiniCard
          label="Repetição histórica"
          value={loading ? "…" : percentage(stats.repeatRate)}
          detail="clientes com mais de um trabalho"
        />
        <MiniCard
          label="Investimento aquisição"
          value={loading ? "…" : money(stats.acquisitionSpend)}
          detail={stats.acquisitionEntries + " registos no período"}
        />
      </div>

      {scope === "all" && (
        <section className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Comparação
            </p>
            <h2 className="font-semibold mt-1">Performance por ramo</h2>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[1.3fr_repeat(6,1fr)] gap-3 px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white/25 border-b border-white/[0.05]">
                <span>Ramo</span>
                <span className="text-right">Receita</span>
                <span className="text-right">Margem</span>
                <span className="text-right">Ticket</span>
                <span className="text-right">MRR</span>
                <span className="text-right">CAC</span>
                <span className="text-right">LTV</span>
              </div>

              {businessLines.map((line) => {
                const row = lineStats[line.id];
                return (
                  <button
                    type="button"
                    key={line.id}
                    onClick={() => setScope(line.id)}
                    className="w-full grid grid-cols-[1.3fr_repeat(6,1fr)] gap-3 items-center px-5 py-4 border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.025] transition text-left"
                  >
                    <span className="text-sm text-white/70">
                      {line.icon} {line.name}
                    </span>
                    <span className="text-sm text-right">{money(row.revenue)}</span>
                    <span className="text-sm text-right">
                      {percentage(row.marginPct)}
                    </span>
                    <span className="text-sm text-right">
                      {row.jobsCount ? money(row.avgTicket) : "—"}
                    </span>
                    <span className="text-sm text-right">{money(row.mrr)}</span>
                    <span className="text-sm text-right">
                      {row.cac == null ? "—" : money(row.cac)}
                    </span>
                    <span className="text-sm text-right">
                      {row.ltv == null ? "—" : money(row.ltv)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="mt-10 grid xl:grid-cols-[1.3fr_1fr] gap-5">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Leitura
          </p>
          <h2 className="font-semibold mt-1">Como estes KPIs são calculados</h2>
          <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm text-white/40">
            <Formula
              title="CAC monetário"
              text="Investimento de aquisição ÷ novos clientes no período."
            />
            <Formula
              title="LTV realizado"
              text="Margem histórica dos trabalhos ÷ clientes únicos. Não é uma previsão."
            />
            <Formula
              title="Margem"
              text="Resultado ÷ receita. No ramo não repartimos custos gerais do estúdio."
            />
            <Formula
              title="LTV : CAC"
              text="LTV realizado ÷ CAC. Só aparece quando existe investimento de aquisição registado."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Aquisição
          </p>
          <h2 className="font-semibold mt-1">Últimos investimentos</h2>

          <div className="mt-5 space-y-2">
            {loading ? (
              <p className="text-sm text-white/30 py-6">A carregar...</p>
            ) : acquisitionRows.length === 0 ? (
              <p className="text-sm text-white/30 py-6">
                Ainda não tens investimento de aquisição registado
                {scope === "all" ? "." : " neste ramo."}
              </p>
            ) : (
              acquisitionRows.slice(0, 8).map((expense) => {
                const line = businessLines.find(
                  (item) => item.id === expense.business_line
                );
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white/65 truncate">
                        {expense.name}
                      </p>
                      <p className="text-xs text-white/25 mt-1">
                        {formatDate(expense.expense_date)}
                        {line ? " · " + line.name : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium">
                        {money(expense.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteAcquisitionSpend(expense.id)}
                        className="text-xs text-white/20 hover:text-red-300"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </WorkspaceLayout>
  );
}

function buildStats({
  lineId,
  jobs,
  expenses,
  fixedExpenses,
  recurringRevenue,
  range,
  includeGeneralCosts,
}) {
  const historicalJobs = jobs.filter(
    (job) =>
      job.status !== "cancelled" &&
      job.job_date &&
      job.job_date <= today &&
      (!lineId || job.business_line === lineId)
  );

  const periodJobs = historicalJobs.filter((job) =>
    inRange(job.job_date, range.start, range.end)
  );

  const revenue = sum(periodJobs, (job) => Number(job.revenue || 0));
  const directCosts = sum(periodJobs, (job) => Number(job.costs || 0));
  const collaboratorCosts = sum(periodJobs, collaboratorCostForJob);

  const periodExpenses = expenses.filter(
    (expense) =>
      inRange(expense.expense_date, range.start, range.end) &&
      (lineId
        ? expense.business_line === lineId
        : true)
  );

  const manualCosts = sum(periodExpenses, (expense) =>
    Number(expense.amount || 0)
  );

  const fixedCosts = includeGeneralCosts
    ? recurringCostForRange(fixedExpenses, range.start, range.end)
    : 0;

  const totalCosts =
    directCosts + collaboratorCosts + manualCosts + fixedCosts;
  const result = revenue - totalCosts;
  const marginPct = revenue > 0 ? (result / revenue) * 100 : 0;

  const periodClientKeys = new Set(
    periodJobs.map((job) => clientKey(job.client_name)).filter(Boolean)
  );

  const firstDates = new Map();
  historicalJobs.forEach((job) => {
    const key = clientKey(job.client_name);
    if (!key) return;
    if (!firstDates.has(key) || job.job_date < firstDates.get(key)) {
      firstDates.set(key, job.job_date);
    }
  });

  const newClients = Array.from(firstDates.values()).filter((date) =>
    inRange(date, range.start, range.end)
  ).length;

  const clientHistory = new Map();
  historicalJobs.forEach((job) => {
    const key = clientKey(job.client_name);
    if (!key) return;

    const current = clientHistory.get(key) || {
      jobs: 0,
      margin: 0,
    };

    current.jobs += 1;
    current.margin +=
      Number(job.revenue || 0) -
      Number(job.costs || 0) -
      collaboratorCostForJob(job);

    clientHistory.set(key, current);
  });

  const clientValues = Array.from(clientHistory.values());
  const ltv =
    clientValues.length > 0
      ? sum(clientValues, (client) => client.margin) / clientValues.length
      : null;

  const repeatRate =
    clientValues.length > 0
      ? (clientValues.filter((client) => client.jobs > 1).length /
          clientValues.length) *
        100
      : 0;

  const acquisitionRows = periodExpenses.filter(
    (expense) => expense.is_acquisition
  );
  const acquisitionSpend = sum(acquisitionRows, (expense) =>
    Number(expense.amount || 0)
  );

  const cac =
    acquisitionRows.length > 0 && newClients > 0
      ? acquisitionSpend / newClients
      : null;

  const ltvCac = ltv != null && cac != null && cac > 0 ? ltv / cac : null;

  const currentRecurring = recurringRevenue.filter(
    (contract) =>
      contract.active &&
      (!contract.end_date || contract.end_date >= today) &&
      (!lineId || contract.business_line === lineId)
  );

  const mrr = sum(currentRecurring, (contract) =>
    Number(contract.amount || 0)
  );

  return {
    revenue,
    directCosts,
    collaboratorCosts,
    manualCosts,
    fixedCosts,
    totalCosts,
    result,
    marginPct,
    jobsCount: periodJobs.length,
    avgTicket: periodJobs.length ? revenue / periodJobs.length : 0,
    clients: periodClientKeys.size,
    newClients,
    repeatRate,
    acquisitionSpend,
    acquisitionEntries: acquisitionRows.length,
    cac,
    ltv,
    ltvCac,
    mrr,
    activeRecurringClients: new Set(
      currentRecurring.map((contract) => clientKey(contract.client_name))
    ).size,
  };
}

function collaboratorCostForJob(job) {
  return (job.collaborator_assignments || [])
    .filter(
      (assignment) =>
        !["declined", "cancelled"].includes(assignment.status)
    )
    .reduce(
      (total, assignment) =>
        total +
        Number(assignment.fee_amount || 0) +
        Number(assignment.travel_reimbursement || 0),
      0
    );
}

function recurringCostForRange(expenses, start, end) {
  if (!expenses.length) return 0;

  const effectiveStart =
    start ||
    expenses
      .map((expense) => expense.start_date)
      .filter(Boolean)
      .sort()[0];

  if (!effectiveStart) return 0;

  const endDate = parseDate(end || today);
  const cursor = parseDate(effectiveStart);
  cursor.setDate(1);

  let total = 0;

  while (cursor <= endDate) {
    const monthStart = dateKey(
      new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    );
    const monthEnd = dateKey(
      new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
    );

    expenses.forEach((expense) => {
      if (!expense.active && !expense.end_date) return;
      if (expense.start_date > monthEnd) return;
      if (expense.end_date && expense.end_date < monthStart) return;
      total += Number(expense.amount || 0);
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return total;
}

function periodRange(period) {
  const now = new Date();
  if (period === "month") {
    return {
      start: dateKey(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: today,
      label: new Intl.DateTimeFormat("pt-PT", {
        month: "long",
        year: "numeric",
      }).format(now),
    };
  }

  if (period === "all") {
    return {
      start: null,
      end: today,
      label: "Todo o histórico até hoje",
    };
  }

  return {
    start: now.getFullYear() + "-01-01",
    end: today,
    label: now.getFullYear() + " até hoje",
  };
}

function inRange(value, start, end) {
  if (!value) return false;
  if (start && value < start) return false;
  if (end && value > end) return false;
  return true;
}

function clientKey(value) {
  return String(value || "").trim().toLocaleLowerCase("pt-PT");
}

function sum(items, getter) {
  return items.reduce((total, item) => total + Number(getter(item) || 0), 0);
}

function dateKey(date) {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

function parseDate(value) {
  return new Date(value + "T12:00:00");
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parseDate(value));
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
    maximumFractionDigits: 1,
  }).format(Number(value || 0)) + "%";
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#151515]"
          : "rounded-xl border border-white/10 px-3.5 py-2 text-xs text-white/45 hover:text-white hover:bg-white/[0.04] transition"
      }
    >
      {children}
    </button>
  );
}

function KpiCard({ label, value, hint, loading }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <p className="text-sm text-white/40">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">
        {loading ? "…" : value}
      </p>
      <p className="mt-2 text-xs text-white/25">{hint}</p>
    </div>
  );
}

function MiniCard({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-4">
      <p className="text-xs text-white/30">{label}</p>
      <p className="text-xl font-semibold mt-2">{value}</p>
      <p className="text-[11px] text-white/20 mt-1">{detail}</p>
    </div>
  );
}

function Formula({ title, text }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-sm font-medium text-white/65">{title}</p>
      <p className="text-xs text-white/30 mt-2 leading-relaxed">{text}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/40 mb-2">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-3.5 py-3 text-sm text-white outline-none focus:border-[#B89A84]/60";
