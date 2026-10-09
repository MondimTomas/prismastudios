import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";
import { supabase } from "../../lib/supabase";

const views = [
  { id: "today", label: "Hoje" },
  { id: "week", label: "Esta semana" },
  { id: "overdue", label: "Atrasadas" },
  { id: "all", label: "Todas" },
];

export default function TasksPage() {
  const [view, setView] = useState("today");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("workspace_leads")
      .select("*")
      .order("next_action_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setLeads([]);
    } else {
      setLeads(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const tasks = useMemo(() => {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return leads
      .filter((lead) => !isClosedLead(lead))
      .filter((lead) => lead.next_action || lead.next_action_date)
      .filter((lead) => {
        if (view === "all") return true;
        if (!lead.next_action_date) return false;

        const date = parseDate(lead.next_action_date);
        if (view === "today") return date >= today && date < tomorrow;
        if (view === "week") return date >= today && date <= weekEnd;
        if (view === "overdue") return date < today;
        return true;
      });
  }, [leads, view]);

  return (
    <WorkspaceLayout title="Tarefas" eyebrow="Execução & follow-up">
      <div className="flex flex-wrap gap-2">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={`rounded-full px-4 py-2 text-sm border transition ${
              view === item.id
                ? "bg-white text-[#151515] border-white"
                : "border-white/10 text-white/40 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-white/30">A carregar...</div>
        ) : tasks.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-white/35">Sem tarefas para mostrar nesta vista.</p>
            <p className="text-xs text-white/20 mt-2">
              As próximas ações das leads aparecem aqui automaticamente.
            </p>
          </div>
        ) : (
          tasks.map((lead) => {
            const line = businessLines.find((item) => item.id === lead.business_line);
            const overdue =
              lead.next_action_date &&
              parseDate(lead.next_action_date) < startOfDay(new Date());

            return (
              <Link
                key={lead.id}
                to={"/tomasmondim/admin/ramo/" + lead.business_line + "/leads"}
                className="grid md:grid-cols-[1.2fr_1fr_150px] gap-3 md:gap-4 px-5 py-4 border-b border-white/[0.05] last:border-b-0 items-center hover:bg-white/[0.02] transition"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/75 truncate">
                    {line?.icon} {lead.name}
                  </p>
                  <p className="text-xs text-white/25 mt-1">{lead.stage}</p>
                </div>
                <p className="text-sm text-white/45 truncate">
                  {lead.next_action || "Follow-up"}
                </p>
                <p className={overdue ? "text-sm text-red-200/70 md:text-right" : "text-sm text-white/35 md:text-right"}>
                  {lead.next_action_date ? formatDate(lead.next_action_date) : "Sem data"}
                </p>
              </Link>
            );
          })
        )}
      </div>
    </WorkspaceLayout>
  );
}

function isClosedLead(lead) {
  const line = businessLines.find((item) => item.id === lead.business_line);
  return Boolean(line && lead.stage === line.pipeline[line.pipeline.length - 1]);
}

function startOfDay(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseDate(value) {
  return new Date(value + "T12:00:00");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parseDate(value));
}
