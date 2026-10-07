import { useCallback, useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";
import { supabase } from "../../lib/supabase";

export default function FinancePage() {
  const [jobs, setJobs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    const [jobsResult, assignmentsResult, recurringExpensesResult] = await Promise.all([
      supabase
        .from("workspace_jobs")
        .select("*")
        .order("job_date", { ascending: false }),
      supabase
        .from("collaborator_assignments")
        .select("job_id,fee_amount,travel_reimbursement,status"),
      supabase
        .from("workspace_recurring_expenses")
        .select("*")
        .eq("active", true)
        .order("start_date", { ascending: true }),
    ]);

    const loadError =
      jobsResult.error ||
      assignmentsResult.error ||
      recurringExpensesResult.error;

    if (loadError) {
      setError(loadError.message);
      setJobs([]);
      setAssignments([]);
      setRecurringExpenses([]);
    } else {
      setJobs(jobsResult.data || []);
      setAssignments(assignmentsResult.data || []);
      setRecurringExpenses(recurringExpensesResult.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthJobs = jobs.filter((job) => sameMonth(job.job_date, now));
    const revenue = sum(monthJobs, "revenue");
    const directCosts = sum(monthJobs, "costs");
    const collaboratorCosts = collaboratorCostForJobs(monthJobs, assignments);
    const fixedCosts = recurringCostForMonth(now, recurringExpenses);
    const costs = directCosts + collaboratorCosts + fixedCosts;
    const receivable = jobs
      .filter((job) => job.payment_status !== "paid")
      .reduce((total, job) => total + Number(job.revenue || 0), 0);

    const byLine = businessLines.map((line) => {
      const lineJobs = jobs.filter((job) => job.business_line === line.id);
      const lineRevenue = sum(lineJobs, "revenue");
      const lineDirectCosts = sum(lineJobs, "costs");
      const lineCollaboratorCosts = collaboratorCostForJobs(lineJobs, assignments);
      const lineCosts = lineDirectCosts + lineCollaboratorCosts;

      return {
        ...line,
        jobs: lineJobs.length,
        revenue: lineRevenue,
        directCosts: lineDirectCosts,
        collaboratorCosts: lineCollaboratorCosts,
        costs: lineCosts,
        result: lineRevenue - lineCosts,
      };
    });

    return {
      revenue,
      directCosts,
      collaboratorCosts,
      fixedCosts,
      costs,
      result: revenue - costs,
      receivable,
      byLine,
      pending: jobs.filter((job) => job.payment_status !== "paid"),
    };
  }, [jobs, assignments, recurringExpenses]);

  const metrics = [
    ["Receita este mês", money(stats.revenue)],
    ["Despesas totais", money(stats.costs)],
    ["Resultado", money(stats.result)],
    ["A receber", money(stats.receivable)],
  ];

  return (
    <WorkspaceLayout title="Financeiro" eyebrow="Visão de gestão">
      <p className="text-white/45 max-w-3xl">
        Esta área serve para perceber a rentabilidade do negócio e de cada ramo.
        As fees e deslocações dos colaboradores e os custos fixos recorrentes entram automaticamente como despesa.
        Não substitui faturação nem contabilidade.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        {metrics.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
          >
            <p className="text-sm text-white/40">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{loading ? "…" : value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Estrutura
            </p>
            <h2 className="font-semibold mt-1">Custos fixos recorrentes</h2>
          </div>
          <p className="text-sm text-white/40">
            Este mês: {loading ? "…" : money(stats.fixedCosts)}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          {loading ? (
            <div className="text-sm text-white/30 py-5">A carregar...</div>
          ) : recurringExpenses.length === 0 ? (
            <div className="text-sm text-white/30 py-5">
              Sem custos fixos registados.
            </div>
          ) : (
            recurringExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white/65">{expense.name}</p>
                  <p className="text-xs text-white/25 mt-1">
                    Mensal · desde {formatMonthYear(expense.start_date)}
                    {expense.end_date
                      ? " · até " + formatMonthYear(expense.end_date)
                      : " · sem data de fim"}
                  </p>
                </div>
                <p className="text-sm font-medium shrink-0">
                  {money(expense.amount)}/mês
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid xl:grid-cols-2 gap-5 mt-8">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Rentabilidade
          </p>
          <h2 className="font-semibold mt-1">Por ramo</h2>

          <div className="mt-6 space-y-2">
            {stats.byLine.map((line) => (
              <div
                key={line.id}
                className="grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white/65">
                    {line.icon} {line.name}
                  </p>
                  <p className="text-xs text-white/25 mt-1">
                    {loading ? "…" : line.jobs} trabalhos · custos diretos {loading ? "…" : money(line.directCosts)}
                    {" · "}equipa {loading ? "…" : money(line.collaboratorCosts)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{loading ? "…" : money(line.revenue)}</p>
                  <p className="text-xs text-white/30 mt-1">
                    resultado {loading ? "…" : money(line.result)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Cobranças
          </p>
          <h2 className="font-semibold mt-1">A receber</h2>

          {loading ? (
            <div className="mt-8 text-sm text-white/30 text-center py-12">
              A carregar...
            </div>
          ) : stats.pending.length === 0 ? (
            <div className="mt-8 text-sm text-white/30 text-center py-12">
              Sem pagamentos pendentes.
            </div>
          ) : (
            <div className="mt-6 space-y-2">
              {stats.pending.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white/65 truncate">{job.client_name}</p>
                    <p className="text-xs text-white/25 mt-1 truncate">{job.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{money(job.revenue)}</p>
                    <p className="text-xs text-white/25 mt-1">
                      {job.payment_status === "partial" ? "Parcial" : "Por pagar"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}

function recurringCostForMonth(referenceDate, expenses) {
  const monthStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1
  );
  const monthEnd = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0
  );

  return expenses
    .filter((expense) => {
      if (!expense.active) return false;

      const start = new Date(expense.start_date + "T12:00:00");
      const end = expense.end_date
        ? new Date(expense.end_date + "T12:00:00")
        : null;

      return start <= monthEnd && (!end || end >= monthStart);
    })
    .reduce((total, expense) => total + Number(expense.amount || 0), 0);
}

function collaboratorCostForJobs(jobs, assignments) {
  const jobIds = new Set(jobs.map((job) => job.id));

  return assignments
    .filter(
      (assignment) =>
        jobIds.has(assignment.job_id) &&
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

function sum(items, field) {
  return items.reduce((total, item) => total + Number(item[field] || 0), 0);
}

function sameMonth(value, referenceDate) {
  if (!value) return false;
  const date = new Date(value + "T12:00:00");
  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth()
  );
}

function formatMonthYear(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    month: "short",
    year: "numeric",
  }).format(new Date(value + "T12:00:00"));
}

function money(value) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}
