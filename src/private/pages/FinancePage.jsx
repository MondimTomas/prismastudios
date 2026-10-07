import { useCallback, useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";
import { supabase } from "../../lib/supabase";

const initialExpenseForm = {
  type: "one_off",
  name: "",
  amount: "",
  date: dateKey(new Date()),
  category: "Operacional",
  notes: "",
};

export default function FinancePage() {
  const [jobs, setJobs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [
      jobsResult,
      assignmentsResult,
      expensesResult,
      recurringExpensesResult,
    ] = await Promise.all([
      supabase
        .from("workspace_jobs")
        .select("*")
        .order("job_date", { ascending: false }),
      supabase
        .from("collaborator_assignments")
        .select("job_id,fee_amount,travel_reimbursement,status"),
      supabase
        .from("workspace_expenses")
        .select("*")
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("workspace_recurring_expenses")
        .select("*")
        .eq("active", true)
        .order("start_date", { ascending: true }),
    ]);

    const loadError =
      jobsResult.error ||
      assignmentsResult.error ||
      expensesResult.error ||
      recurringExpensesResult.error;

    if (loadError) {
      setError(loadError.message);
      setJobs([]);
      setAssignments([]);
      setExpenses([]);
      setRecurringExpenses([]);
    } else {
      setJobs(jobsResult.data || []);
      setAssignments(assignmentsResult.data || []);
      setExpenses(expensesResult.data || []);
      setRecurringExpenses(recurringExpensesResult.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function createExpense(event) {
    event.preventDefault();
    setSavingExpense(true);
    setError("");

    const amount = Number(expenseForm.amount || 0);

    if (!expenseForm.name.trim() || amount <= 0 || !expenseForm.date) {
      setSavingExpense(false);
      setError("Preenche o nome, valor e data da despesa.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const createdBy = userData.user?.id || null;

    let insertError;

    if (expenseForm.type === "recurring") {
      const result = await supabase
        .from("workspace_recurring_expenses")
        .insert({
          name: expenseForm.name.trim(),
          amount,
          cadence: "monthly",
          start_date: expenseForm.date,
          category: expenseForm.category.trim() || null,
          notes: expenseForm.notes.trim() || null,
          active: true,
          created_by: createdBy,
        });

      insertError = result.error;
    } else {
      const result = await supabase
        .from("workspace_expenses")
        .insert({
          name: expenseForm.name.trim(),
          amount,
          expense_date: expenseForm.date,
          category: expenseForm.category.trim() || null,
          notes: expenseForm.notes.trim() || null,
          created_by: createdBy,
        });

      insertError = result.error;
    }

    setSavingExpense(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setExpenseForm({
      ...initialExpenseForm,
      date: dateKey(new Date()),
    });
    setShowExpenseForm(false);
    await loadData();
  }

  async function deleteExpense(id) {
    if (!window.confirm("Apagar esta despesa?")) return;

    const { error: deleteError } = await supabase
      .from("workspace_expenses")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadData();
  }

  async function stopRecurringExpense(id) {
    if (!window.confirm("Parar esta despesa recorrente a partir de agora?")) return;

    const { error: updateError } = await supabase
      .from("workspace_recurring_expenses")
      .update({
        active: false,
        end_date: dateKey(new Date()),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadData();
  }

  const stats = useMemo(() => {
    const now = new Date();
    const monthJobs = jobs.filter((job) => sameMonth(job.job_date, now));
    const monthExpenses = expenses.filter((expense) =>
      sameMonth(expense.expense_date, now)
    );

    const revenue = sum(monthJobs, "revenue");
    const directCosts = sum(monthJobs, "costs");
    const collaboratorCosts = collaboratorCostForJobs(monthJobs, assignments);
    const manualCosts = sum(monthExpenses, "amount");
    const fixedCosts = recurringCostForMonth(now, recurringExpenses);
    const costs =
      directCosts + collaboratorCosts + manualCosts + fixedCosts;

    const receivable = jobs
      .filter((job) => job.payment_status !== "paid")
      .reduce((total, job) => total + Number(job.revenue || 0), 0);

    const byLine = businessLines.map((line) => {
      const lineJobs = jobs.filter((job) => job.business_line === line.id);
      const lineRevenue = sum(lineJobs, "revenue");
      const lineDirectCosts = sum(lineJobs, "costs");
      const lineCollaboratorCosts = collaboratorCostForJobs(
        lineJobs,
        assignments
      );
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
      manualCosts,
      fixedCosts,
      costs,
      result: revenue - costs,
      receivable,
      byLine,
      pending: jobs.filter((job) => job.payment_status !== "paid"),
    };
  }, [jobs, assignments, expenses, recurringExpenses]);

  const metrics = [
    ["Receita este mês", money(stats.revenue)],
    ["Despesas totais", money(stats.costs)],
    ["Resultado", money(stats.result)],
    ["A receber", money(stats.receivable)],
  ];

  return (
    <WorkspaceLayout
      title="Financeiro"
      eyebrow="Visão de gestão"
      actions={
        <button
          type="button"
          onClick={() => setShowExpenseForm((current) => !current)}
          className="rounded-xl bg-[#B89A84] px-4 py-2.5 text-sm font-semibold text-[#151515] hover:brightness-110 transition"
        >
          {showExpenseForm ? "Fechar" : "+ Registar despesa"}
        </button>
      }
    >
      <p className="text-white/45 max-w-3xl">
        Esta área serve para perceber a rentabilidade do negócio e de cada ramo.
        As fees e deslocações dos colaboradores, despesas pontuais e custos fixos
        recorrentes entram automaticamente no resultado.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {showExpenseForm && (
        <form
          onSubmit={createExpense}
          className="mt-7 rounded-2xl border border-[#B89A84]/20 bg-[#B89A84]/[0.04] p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#B89A84]">
                Nova despesa
              </p>
              <h2 className="font-semibold mt-1">Registar custo</h2>
            </div>

            <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-[#151515] p-1">
              <button
                type="button"
                onClick={() =>
                  setExpenseForm({ ...expenseForm, type: "one_off" })
                }
                className={
                  expenseForm.type === "one_off"
                    ? "rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#151515]"
                    : "rounded-lg px-3 py-2 text-xs text-white/40"
                }
              >
                Pontual
              </button>
              <button
                type="button"
                onClick={() =>
                  setExpenseForm({ ...expenseForm, type: "recurring" })
                }
                className={
                  expenseForm.type === "recurring"
                    ? "rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#151515]"
                    : "rounded-lg px-3 py-2 text-xs text-white/40"
                }
              >
                Mensal
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Descrição">
              <input
                required
                value={expenseForm.name}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, name: e.target.value })
                }
                placeholder="Ex.: Combustível"
                className={inputClass}
              />
            </Field>

            <Field label="Valor (€)">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: e.target.value })
                }
                placeholder="0,00"
                className={inputClass}
              />
            </Field>

            <Field
              label={
                expenseForm.type === "recurring"
                  ? "Começa em"
                  : "Data da despesa"
              }
            >
              <input
                required
                type="date"
                value={expenseForm.date}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, date: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Categoria">
              <select
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    category: e.target.value,
                  })
                }
                className={inputClass}
              >
                <option value="Operacional">Operacional</option>
                <option value="Estúdio">Estúdio</option>
                <option value="Deslocação">Deslocação</option>
                <option value="Equipamento">Equipamento</option>
                <option value="Software">Software</option>
                <option value="Marketing">Marketing</option>
                <option value="Contabilidade">Contabilidade</option>
                <option value="Outros">Outros</option>
              </select>
            </Field>

            <div className="sm:col-span-2 lg:col-span-4">
              <Field label="Notas">
                <textarea
                  rows={2}
                  value={expenseForm.notes}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, notes: e.target.value })
                  }
                  placeholder="Opcional"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {expenseForm.type === "recurring" && (
            <p className="mt-4 text-xs text-white/30">
              Esta despesa será contabilizada todos os meses a partir da data
              escolhida até a parares.
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              disabled={savingExpense}
              className="rounded-xl bg-[#B89A84] px-5 py-3 text-sm font-semibold text-[#151515] disabled:opacity-50"
            >
              {savingExpense ? "A guardar..." : "Guardar despesa"}
            </button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        {metrics.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
          >
            <p className="text-sm text-white/40">{label}</p>
            <p className="mt-3 text-3xl font-semibold">
              {loading ? "…" : value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-5 mt-8">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                Despesas
              </p>
              <h2 className="font-semibold mt-1">Pontuais</h2>
            </div>
            <p className="text-sm text-white/40">
              Este mês: {loading ? "…" : money(stats.manualCosts)}
            </p>
          </div>

          <div className="mt-5 space-y-2">
            {loading ? (
              <div className="text-sm text-white/30 py-5">A carregar...</div>
            ) : expenses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/30">
                Ainda não existem despesas pontuais.
              </div>
            ) : (
              expenses.slice(0, 12).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white/65 truncate">
                      {expense.name}
                    </p>
                    <p className="text-xs text-white/25 mt-1">
                      {formatDate(expense.expense_date)}
                      {expense.category ? " · " + expense.category : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-medium">
                      {money(expense.amount)}
                    </p>
                    <button
                      type="button"
                      onClick={() => deleteExpense(expense.id)}
                      className="text-xs text-white/20 hover:text-red-300 transition"
                    >
                      Apagar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <div className="flex items-end justify-between gap-3">
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
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/30">
                Sem custos fixos registados.
              </div>
            ) : (
              recurringExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white/65 truncate">
                      {expense.name}
                    </p>
                    <p className="text-xs text-white/25 mt-1">
                      Mensal · desde {formatMonthYear(expense.start_date)}
                      {expense.category ? " · " + expense.category : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-medium">
                      {money(expense.amount)}/mês
                    </p>
                    <button
                      type="button"
                      onClick={() => stopRecurringExpense(expense.id)}
                      className="text-xs text-white/20 hover:text-red-300 transition"
                    >
                      Parar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

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
                    {loading ? "…" : line.jobs} trabalhos · custos diretos{" "}
                    {loading ? "…" : money(line.directCosts)}
                    {" · "}equipa{" "}
                    {loading ? "…" : money(line.collaboratorCosts)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {loading ? "…" : money(line.revenue)}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    resultado {loading ? "…" : money(line.result)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-white/25">
            Custos gerais e fixos são descontados no resultado global, sem
            serem atribuídos artificialmente a um ramo específico.
          </p>
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
                    <p className="text-sm text-white/65 truncate">
                      {job.client_name}
                    </p>
                    <p className="text-xs text-white/25 mt-1 truncate">
                      {job.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">
                      {money(job.revenue)}
                    </p>
                    <p className="text-xs text-white/25 mt-1">
                      {job.payment_status === "partial"
                        ? "Parcial"
                        : "Por pagar"}
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

function dateKey(date) {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value + "T12:00:00"));
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

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-3.5 py-3 text-sm text-white outline-none focus:border-[#B89A84]/60";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/40 mb-2">{label}</span>
      {children}
    </label>
  );
}
