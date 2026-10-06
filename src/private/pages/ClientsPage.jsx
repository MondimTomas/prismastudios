import { useCallback, useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";
import { supabase } from "../../lib/supabase";

export default function ClientsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("workspace_jobs")
      .select("*, football_teams(id,name,season)")
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

  const clients = useMemo(() => {
    const map = new Map();

    jobs.forEach((job) => {
      const name = job.football_teams?.name || job.client_name;
      const key = name.trim().toLocaleLowerCase("pt-PT");
      const existing = map.get(key) || {
        name,
        lines: new Set(),
        value: 0,
        lastJobDate: null,
        jobs: 0,
      };

      existing.lines.add(job.business_line);
      existing.value += Number(job.revenue || 0);
      existing.jobs += 1;

      if (!existing.lastJobDate || job.job_date > existing.lastJobDate) {
        existing.lastJobDate = job.job_date;
      }

      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) =>
      (b.lastJobDate || "").localeCompare(a.lastJobDate || "")
    );
  }, [jobs]);

  return (
    <WorkspaceLayout title="Clientes" eyebrow="Gestão transversal">
      <div className="max-w-3xl">
        <p className="text-white/45">
          Os clientes são partilhados entre ramos. Os trabalhos registados alimentam esta lista automaticamente.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
        <div className="hidden md:grid grid-cols-5 gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-[0.18em] text-white/25">
          <span className="col-span-2">Cliente</span>
          <span>Ramos</span>
          <span>Valor total</span>
          <span>Último trabalho</span>
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-white/30">A carregar...</div>
        ) : clients.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-white/35">Ainda não existem clientes no workspace.</p>
            <p className="text-xs text-white/20 mt-2">
              Quando registares um trabalho, o cliente aparece aqui automaticamente.
            </p>
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.name.toLocaleLowerCase("pt-PT")}
              className="grid md:grid-cols-5 gap-3 md:gap-4 px-5 py-4 border-b border-white/[0.05] last:border-b-0 items-center"
            >
              <div className="md:col-span-2">
                <p className="text-sm font-medium">{client.name}</p>
                <p className="text-xs text-white/25 mt-1">
                  {client.jobs} {client.jobs === 1 ? "trabalho" : "trabalhos"}
                </p>
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
              <p className="text-sm text-white/65">{money(client.value)}</p>
              <p className="text-sm text-white/35">{formatDate(client.lastJobDate)}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid xl:grid-cols-2 gap-5 mt-5">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Relação
          </p>
          <h2 className="font-semibold mt-1">Histórico de atividade</h2>
          <p className="text-sm text-white/35 leading-relaxed mt-4">
            O valor e a última atividade são calculados diretamente a partir dos trabalhos registados.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Cross-selling
          </p>
          <h2 className="font-semibold mt-1">Mais do que um ramo</h2>
          <p className="text-sm text-white/35 leading-relaxed mt-4">
            Os ramos mostrados em cada cliente são inferidos automaticamente pelos trabalhos que já comprou.
          </p>
        </div>
      </div>
    </WorkspaceLayout>
  );
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
