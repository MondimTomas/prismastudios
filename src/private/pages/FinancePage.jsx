import { useCallback, useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";
import { supabase } from "../../lib/supabase";

export default function FinancePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("workspace_jobs")
      .select("*")
      .order("job_date", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setJobs([]);
    } else {
      setJobs(data || []);
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
    const costs = sum(monthJobs, "costs");
    const receivable = jobs
      .filter((job) => job.payment_status !== "paid")
      .reduce((total, job) => total + Number(job.revenue || 0), 0);

    const byLine = businessLines.map((line) => {
      const lineJobs = jobs.filter((job) => job.business_line === line.id);
      const lineRevenue = sum(lineJobs, "revenue");
      const lineCosts = sum(lineJobs, "costs");

      return {
        ...line,
        jobs: lineJobs.length,
        revenue: lineRevenue,
        costs: lineCosts,
        result: lineRevenue - lineCosts,
      };
    });

    return {
      revenue,
      costs,
      result: revenue - costs,
      receivable,
      byLine,
      pending: jobs.filter((job) => job.payment_status !== "paid"),
    };
  }, [jobs]);

  const metrics = [
    ["Receita este mês", money(stats.revenue)],
    ["Despesas", money(stats.costs)],
    ["Resultado", money(stats.result)],
    ["A receber", money(stats.receivable)],
  ];

  return (
    <WorkspaceLayout title="Financeiro" eyebrow="Visão de gestão">
      <p className="text-white/45 max-w-3xl">
        Esta área serve para perceber a rentabilidade do negócio e de cada ramo.
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
                    {loading ? "…" : line.jobs} trabalhos · custos {loading ? "…" : money(line.costs)}
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

function money(value) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}
