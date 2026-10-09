import { useCallback, useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";
import { supabase } from "../../lib/supabase";

const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function CalendarPage() {
  const [jobs, setJobs] = useState([]);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("workspace_jobs")
      .select("*, football_teams(id,name,season), collaborator_assignments(id,status,role,collaborator_user_id)")
      .order("job_date", { ascending: true });

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

  const calendarDays = useMemo(() => buildCalendarDays(cursor), [cursor]);

  const jobsByDate = useMemo(() => {
    const map = new Map();

    jobs.forEach((job) => {
      if (!job.job_date) return;
      const current = map.get(job.job_date) || [];
      current.push(job);
      map.set(job.job_date, current);
    });

    return map;
  }, [jobs]);

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    const end = new Date(today);
    end.setDate(end.getDate() + 7);

    return jobs.filter((job) => {
      if (!job.job_date) return false;
      const date = parseDate(job.job_date);
      return date >= today && date <= end;
    });
  }, [jobs]);

  function moveMonth(offset) {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <WorkspaceLayout title="Calendário" eyebrow="Agenda operacional">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 mb-8">
        <div>
          <p className="text-white/45 max-w-2xl">
            Sessões de futebol, gravações, eventos, reuniões e entregas num único calendário.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/35">
            <LegendDot className="bg-emerald-400" label="Tu na produção" />
            <LegendDot className="bg-sky-400" label="Colaborador confirmado" />
            <LegendDot className="bg-red-400" label="Por confirmar" />
          </div>

          <div className="flex items-center gap-2 text-sm text-white/35">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="rounded-xl border border-white/10 px-3 py-2 hover:text-white transition"
          >
            ←
          </button>
          <span className="min-w-36 text-center text-white/70 capitalize">
            {new Intl.DateTimeFormat("pt-PT", {
              month: "long",
              year: "numeric",
            }).format(cursor)}
          </span>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="rounded-xl border border-white/10 px-3 py-2 hover:text-white transition"
          >
            →
          </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/[0.06]">
          {dayLabels.map((day) => (
            <div
              key={day}
              className="px-3 py-3 text-center text-[10px] uppercase tracking-[0.18em] text-white/30"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, inMonth }) => {
            const dateKey = toDateKey(date);
            const dayJobs = jobsByDate.get(dateKey) || [];

            return (
              <div
                key={dateKey}
                className="min-h-28 border-r border-b border-white/[0.05] p-2 overflow-hidden"
              >
                <span className={inMonth ? "text-xs text-white/40" : "text-xs text-white/10"}>
                  {date.getDate()}
                </span>

                <div className="mt-2 space-y-1">
                  {dayJobs.slice(0, 3).map((job) => {
                    const line = businessLines.find((item) => item.id === job.business_line);
                    const tone = calendarTone(job);

                    return (
                      <div
                        key={job.id}
                        title={
                          (job.football_teams?.name || job.client_name) +
                          " — " +
                          job.title +
                          " — " +
                          tone.label
                        }
                        className={
                          "rounded-md border px-2 py-1 text-[10px] truncate " +
                          tone.className
                        }
                      >
                        {line?.icon} {job.football_teams?.name || job.client_name}
                      </div>
                    );
                  })}
                  {dayJobs.length > 3 && (
                    <p className="text-[10px] text-white/25">+{dayJobs.length - 3}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
          Próximos 7 dias
        </p>

        {loading ? (
          <div className="mt-4 text-sm text-white/30 text-center py-10">A carregar...</div>
        ) : upcoming.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
            <p className="text-sm text-white/35">
              Sem trabalhos registados nos próximos 7 dias.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {upcoming.map((job) => {
              const tone = calendarTone(job);

              return (
                <div
                  key={job.id}
                  className={
                    "flex items-center justify-between gap-4 rounded-xl border px-4 py-3 " +
                    tone.className
                  }
                >
                  <div>
                    <p className="text-sm font-medium">
                      {job.football_teams?.name || job.client_name}
                    </p>
                    <p className="text-xs opacity-60 mt-1">
                      {job.title} · {tone.label}
                    </p>
                  </div>
                  <span className="text-xs opacity-70 shrink-0">
                    {formatDate(job.job_date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}

function calendarTone(job) {
  const assignments = (job.collaborator_assignments || []).filter(
    (assignment) => assignment.status !== "cancelled"
  );

  const hasPendingAssignment = assignments.some((assignment) =>
    ["assigned", "declined"].includes(assignment.status)
  );

  if (hasPendingAssignment) {
    return {
      label: "Por confirmar",
      className:
        "border-red-400/30 bg-red-400/[0.12] text-red-100",
    };
  }

  const hasConfirmedCollaborator = assignments.some((assignment) =>
    ["accepted", "completed"].includes(assignment.status)
  );

  if (hasConfirmedCollaborator) {
    return {
      label: "Produção por colaborador",
      className:
        "border-sky-400/30 bg-sky-400/[0.12] text-sky-100",
    };
  }

  return {
    label: "Tu na produção",
    className:
      "border-emerald-400/30 bg-emerald-400/[0.12] text-emerald-100",
  };
}

function LegendDot({ className, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={"h-2 w-2 rounded-full " + className} />
      {label}
    </span>
  );
}

function buildCalendarDays(cursor) {
  const first = startOfMonth(cursor);
  const weekday = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(start.getDate() - weekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date,
      inMonth: date.getMonth() === cursor.getMonth(),
    };
  });
}

function startOfMonth(value) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function startOfDay(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseDate(value) {
  return new Date(value + "T12:00:00");
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
  }).format(parseDate(value));
}
