import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import TeamLayout from "./TeamLayout";
import { supabase } from "../lib/supabase";

const tabs = [
  { id: "upcoming", label: "Próximos" },
  { id: "history", label: "Histórico" },
  { id: "ratings", label: "Avaliações" },
  { id: "sops", label: "SOPs" },
];

export default function TeamDashboard() {
  const { workspaceSlug } = useParams();
  const location = useLocation();
  const previewMode = new URLSearchParams(location.search).get("preview") === "1";
  const [member, setMember] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [sops, setSops] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setLoading(false);
      return;
    }

    let memberResult;
    let targetUserId = user.id;

    if (previewMode) {
      memberResult = await supabase
        .from("workspace_members")
        .select("user_id,role,status,workspace_slug")
        .eq("workspace_slug", workspaceSlug)
        .eq("role", "collaborator")
        .maybeSingle();

      if (memberResult.error || !memberResult.data) {
        setError(memberResult.error?.message || "Colaborador não encontrado.");
        setLoading(false);
        return;
      }

      targetUserId = memberResult.data.user_id;
    } else {
      memberResult = await supabase
        .from("workspace_members")
        .select("user_id,role,status,workspace_slug")
        .eq("user_id", user.id)
        .maybeSingle();
    }

    const [profileResult, assignmentResult, sopResult] = await Promise.all([
      supabase
        .from("collaborator_profiles")
        .select(
          "user_id,full_name,email,phone,city,skills,transport_mode,travel_radius_km,equipment"
        )
        .eq("user_id", targetUserId)
        .maybeSingle(),
      supabase
        .from("collaborator_assignments")
        .select(
          "id,job_id,role,fee_amount,travel_reimbursement,notes,status,created_at,updated_at, workspace_jobs(id,business_line,client_name,title,service_type,job_date,status,notes,football_teams(name,season,zerozero_url))"
        )
        .eq("collaborator_user_id", targetUserId)
        .order("created_at", { ascending: false }),
      supabase
        .from("workspace_sops")
        .select("id,business_line,title,summary,content,sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
    ]);

    const firstError =
      memberResult.error ||
      profileResult.error ||
      assignmentResult.error ||
      sopResult.error;

    if (firstError) {
      setError(firstError.message);
    }

    const assignmentRows = assignmentResult.data || [];
    const eligibleJobIds = Array.from(
      new Set(
        assignmentRows
          .filter(
            (item) =>
              !["cancelled", "declined"].includes(item.status) &&
              item.workspace_jobs?.status !== "cancelled"
          )
          .map((item) => item.job_id)
          .filter(Boolean)
      )
    );

    let feedbackRows = [];

    if (eligibleJobIds.length > 0) {
      const feedbackResult = await supabase
        .from("workspace_football_feedback")
        .select("id,job_id,score,liked,disliked,created_at")
        .in("job_id", eligibleJobIds)
        .order("created_at", { ascending: false });

      if (feedbackResult.error) {
        setError((current) =>
          current
            ? current + " · " + feedbackResult.error.message
            : feedbackResult.error.message
        );
      } else {
        feedbackRows = (feedbackResult.data || []).filter((item) =>
          eligibleJobIds.includes(item.job_id)
        );
      }
    }

    setMember(memberResult.data || null);
    setProfile(profileResult.data || null);
    setAssignments(assignmentRows);
    setFeedback(feedbackRows);
    setSops(sopResult.data || []);
    setLoading(false);
  }, [previewMode, workspaceSlug]);

  useEffect(() => {
    load();
  }, [load]);

  async function setAssignmentStatus(id, status) {
    if (previewMode) return;

    const previous = assignments;

    setAssignments((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );

    const { error: updateError } = await supabase
      .from("collaborator_assignments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      setAssignments(previous);
      setError(updateError.message);
    }
  }

  const today = dateKey(new Date());

  const validAssignments = useMemo(
    () =>
      assignments.filter(
        (item) => !["cancelled", "declined"].includes(item.status)
      ),
    [assignments]
  );

  const upcoming = useMemo(
    () =>
      validAssignments
        .filter(
          (item) =>
            item.workspace_jobs?.job_date >= today &&
            item.status !== "completed" &&
            item.workspace_jobs?.status !== "cancelled"
        )
        .sort((a, b) =>
          (a.workspace_jobs?.job_date || "").localeCompare(
            b.workspace_jobs?.job_date || ""
          )
        ),
    [today, validAssignments]
  );

  const history = useMemo(
    () =>
      validAssignments
        .filter(
          (item) =>
            item.status === "completed" ||
            item.workspace_jobs?.job_date < today
        )
        .sort((a, b) =>
          (b.workspace_jobs?.job_date || "").localeCompare(
            a.workspace_jobs?.job_date || ""
          )
        ),
    [today, validAssignments]
  );

  const feedbackByJob = useMemo(() => {
    const map = new Map();

    feedback.forEach((item) => {
      const current = map.get(item.job_id) || [];
      current.push(item);
      map.set(item.job_id, current);
    });

    return map;
  }, [feedback]);

  const ratedAssignments = useMemo(
    () =>
      validAssignments
        .filter((item) => (feedbackByJob.get(item.job_id) || []).length > 0)
        .sort((a, b) =>
          (b.workspace_jobs?.job_date || "").localeCompare(
            a.workspace_jobs?.job_date || ""
          )
        ),
    [feedbackByJob, validAssignments]
  );

  const overall = useMemo(() => {
    if (feedback.length === 0) {
      return { average: null, responses: 0, jobs: 0 };
    }

    const total = feedback.reduce(
      (sum, item) => sum + Number(item.score || 0),
      0
    );

    return {
      average: total / feedback.length,
      responses: feedback.length,
      jobs: new Set(feedback.map((item) => item.job_id)).size,
    };
  }, [feedback]);

  const expected = upcoming.reduce(
    (total, item) =>
      total +
      Number(item.fee_amount || 0) +
      Number(item.travel_reimbursement || 0),
    0
  );

  return (
    <TeamLayout
      title={
        profile?.full_name
          ? "Olá, " + profile.full_name.split(" ")[0]
          : "Os meus trabalhos"
      }
      previewMode={previewMode}
    >
      {error && <Notice>{error}</Notice>}

      {loading ? (
        <div className="py-20 text-center text-sm text-white/30">
          A carregar...
        </div>
      ) : member?.status !== "active" ? (
        <div className="max-w-2xl rounded-3xl border border-[#B89A84]/20 bg-[#B89A84]/[0.05] p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-[#B89A84]">
            Registo recebido
          </p>
          <h2 className="text-2xl font-semibold mt-2">Aguardamos aprovação</h2>
          <p className="text-white/45 mt-3 leading-relaxed">
            O teu perfil já está guardado. Assim que for aprovado, esta área
            mostra os jogos atribuídos, valores e SOPs da Prisma.
          </p>
          <Link
            to={
              "/tomasmondim/" +
              workspaceSlug +
              "/perfil" +
              (previewMode ? "?preview=1" : "")
            }
            className="inline-flex mt-5 text-sm text-[#B89A84] hover:text-white"
          >
            Rever o meu perfil →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Metric label="Próximos trabalhos" value={String(upcoming.length)} />
            <Metric label="Trabalhos realizados" value={String(history.length)} />
            <Metric label="A receber" value={money(expected)} />
            <Metric
              label="Avaliação overall"
              value={
                overall.average === null
                  ? "—"
                  : overall.average.toFixed(1) + " / 10"
              }
              hint={
                overall.responses > 0
                  ? overall.responses +
                    (overall.responses === 1
                      ? " avaliação"
                      : " avaliações")
                  : "Ainda sem avaliações"
              }
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const count =
                tab.id === "upcoming"
                  ? upcoming.length
                  : tab.id === "history"
                    ? history.length
                    : tab.id === "ratings"
                      ? overall.responses
                      : sops.length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? "rounded-full border border-white bg-white px-4 py-2 text-sm font-medium text-[#151515]"
                      : "rounded-full border border-white/10 px-4 py-2 text-sm text-white/40 hover:text-white hover:border-white/20 transition"
                  }
                >
                  {tab.label}
                  <span className="ml-2 opacity-50">{count}</span>
                </button>
              );
            })}
          </div>

          {activeTab === "upcoming" && (
            <section className="mt-7">
              <SectionTitle eyebrow="Agenda" title="Próximos trabalhos" />

              {upcoming.length === 0 ? (
                <Empty>
                  Neste momento não tens trabalhos futuros atribuídos.
                </Empty>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((assignment) => (
                    <UpcomingCard
                      key={assignment.id}
                      assignment={assignment}
                      previewMode={previewMode}
                      onStatusChange={setAssignmentStatus}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "history" && (
            <section className="mt-7">
              <SectionTitle
                eyebrow="Histórico"
                title="Trabalhos que já fizeste"
              />

              {history.length === 0 ? (
                <Empty>
                  Quando terminares trabalhos, vão aparecer aqui no teu
                  histórico.
                </Empty>
              ) : (
                <div className="space-y-3">
                  {history.map((assignment) => {
                    const responses =
                      feedbackByJob.get(assignment.job_id) || [];
                    const rating = summarizeFeedback(responses);

                    return (
                      <HistoryCard
                        key={assignment.id}
                        assignment={assignment}
                        rating={rating}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === "ratings" && (
            <section className="mt-7">
              <SectionTitle
                eyebrow="Feedback dos clientes"
                title="As tuas avaliações"
              />

              <div className="rounded-3xl border border-[#B89A84]/20 bg-[#B89A84]/[0.05] p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#B89A84]">
                      Overall
                    </p>
                    <p className="mt-2 text-4xl font-semibold">
                      {overall.average === null
                        ? "—"
                        : overall.average.toFixed(1)}
                      {overall.average !== null && (
                        <span className="ml-1 text-xl font-normal text-white/30">
                          / 10
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-sm text-white/35 sm:text-right">
                    <p>
                      {overall.responses}{" "}
                      {overall.responses === 1 ? "avaliação" : "avaliações"}
                    </p>
                    <p className="mt-1">
                      em {overall.jobs}{" "}
                      {overall.jobs === 1 ? "jogo" : "jogos"}
                    </p>
                  </div>
                </div>
              </div>

              {ratedAssignments.length === 0 ? (
                <div className="mt-4">
                  <Empty>
                    Ainda não recebeste avaliações dos clientes nos teus jogos.
                  </Empty>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {ratedAssignments.map((assignment) => {
                    const responses =
                      feedbackByJob.get(assignment.job_id) || [];
                    const rating = summarizeFeedback(responses);
                    const job = assignment.workspace_jobs;

                    return (
                      <article
                        key={assignment.id}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <p className="text-xs text-[#B89A84]">
                              {formatDate(job?.job_date)} · {assignment.role}
                            </p>
                            <h3 className="mt-1 text-lg font-semibold">
                              {job?.client_name}
                            </h3>
                            <p className="mt-1 text-sm text-white/35">
                              {job?.title}
                            </p>
                          </div>
                          <RatingBadge rating={rating} />
                        </div>

                        <div className="mt-5 space-y-3">
                          {responses.map((item, index) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-xs text-white/25">
                                  Avaliação anónima #{responses.length - index}
                                </p>
                                <p className="text-sm font-semibold">
                                  {item.score}/10
                                </p>
                              </div>

                              {(item.liked || item.disliked) && (
                                <div className="mt-4 grid lg:grid-cols-2 gap-3">
                                  <FeedbackBlock
                                    label="O que gostaram"
                                    value={item.liked}
                                  />
                                  <FeedbackBlock
                                    label="O que podes melhorar"
                                    value={item.disliked}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === "sops" && (
            <section className="mt-7">
              <SectionTitle eyebrow="Playbook" title="SOPs" />

              {sops.length === 0 ? (
                <Empty>Ainda não existem SOPs publicados para a equipa.</Empty>
              ) : (
                <div className="grid lg:grid-cols-2 gap-4">
                  {sops.map((sop) => (
                    <article
                      key={sop.id}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                    >
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#B89A84]">
                        {sop.business_line || "Geral"}
                      </p>
                      <h3 className="font-semibold text-lg mt-2">
                        {sop.title}
                      </h3>
                      {sop.summary && (
                        <p className="text-sm text-white/40 mt-2">
                          {sop.summary}
                        </p>
                      )}
                      <div className="whitespace-pre-wrap text-sm leading-6 text-white/55 mt-4">
                        {sop.content}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </TeamLayout>
  );
}

function UpcomingCard({
  assignment,
  previewMode,
  onStatusChange,
}) {
  const job = assignment.workspace_jobs;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs text-[#B89A84]">
            {formatDate(job?.job_date)} · {assignment.role}
          </p>
          <h3 className="text-lg font-semibold mt-1">{job?.client_name}</h3>
          <p className="text-sm text-white/40 mt-1">{job?.title}</p>

          <JobDetails job={job} />

          {assignment.notes && (
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">
                Informação para ti
              </p>
              <p className="text-sm text-white/45 mt-2 whitespace-pre-wrap">
                {assignment.notes}
              </p>
            </div>
          )}
        </div>

        <Payment assignment={assignment} />
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2">
        <Status value={assignment.status} />

        {!previewMode && assignment.status === "assigned" && (
          <>
            <button
              onClick={() => onStatusChange(assignment.id, "accepted")}
              className="rounded-lg bg-[#B89A84] px-3 py-2 text-xs font-semibold text-[#151515]"
            >
              Aceitar
            </button>
            <button
              onClick={() => onStatusChange(assignment.id, "declined")}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/45 hover:text-white"
            >
              Não consigo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ assignment, rating }) {
  const job = assignment.workspace_jobs;

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="min-w-0">
          <p className="text-xs text-[#B89A84]">
            {formatDate(job?.job_date)} · {assignment.role}
          </p>
          <h3 className="mt-1 text-lg font-semibold">{job?.client_name}</h3>
          <p className="mt-1 text-sm text-white/35">{job?.title}</p>

          <JobDetails job={job} />

          <div className="mt-4 flex flex-wrap gap-2">
            <Status value={assignment.status} />
            {job?.business_line === "futebol" &&
              (rating.count > 0 ? (
                <span className="rounded-full border border-[#B89A84]/25 bg-[#B89A84]/10 px-3 py-2 text-xs text-[#D8C3B4]">
                  {rating.average.toFixed(1)}/10 · {rating.count}{" "}
                  {rating.count === 1 ? "avaliação" : "avaliações"}
                </span>
              ) : (
                <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/25">
                  Sem avaliações
                </span>
              ))}
          </div>
        </div>

        <Payment assignment={assignment} compact />
      </div>
    </article>
  );
}

function JobDetails({ job }) {
  if (!job) return null;
  const notes = (job.notes || "").replaceAll(String.fromCharCode(92) + "n", " ").split(". ").filter((part) => !/margem|lucro|faturação|receita|custo prisma|fee:|deslocação:/i.test(part)).join(". ").trim();
  const location = notes.match(/(?:Localização|Local|Campo|Morada):\s*([^\n]+)/i)?.[1]?.trim();
  const time = notes.match(/(?:Hora|Início|Inicio):\s*([0-2]?\d[:h][0-5]\d)/i)?.[1];
  const zerozero = job.football_teams?.zerozero_url;
  const validZerozero = zerozero && zerozero.startsWith("https://www.zerozero.pt/");
  if (!notes && !validZerozero && !job.football_teams) return null;
  return (
    <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2 text-sm">
      {job.football_teams?.name && <p><span className="text-white/40">Equipa:</span> {job.football_teams.name}{job.football_teams.season ? " · " + job.football_teams.season : ""}</p>}
      {time && <p><span className="text-white/40">Hora:</span> {time.replace("h", ":")}</p>}
      {location && <p><span className="text-white/40">Localização:</span> {location} · <a className="text-[#D8C3B4] underline" href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(location)} target="_blank" rel="noopener noreferrer">Abrir no Maps ↗</a></p>}
      {validZerozero && <p><a className="text-[#D8C3B4] underline" href={zerozero} target="_blank" rel="noopener noreferrer">Ver equipa no Zerozero ↗</a></p>}
      {notes && <p className="whitespace-pre-wrap text-white/45">{notes}</p>}
    </div>
  );
}

function Payment({ assignment, compact = false }) {
  const total =
    Number(assignment.fee_amount || 0) +
    Number(assignment.travel_reimbursement || 0);

  return (
    <div className="lg:text-right shrink-0">
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">
        Pagamento
      </p>
      <p className={compact ? "text-xl font-semibold mt-1" : "text-2xl font-semibold mt-1"}>
        {money(total)}
      </p>
      <p className="text-xs text-white/30 mt-1">
        {money(assignment.fee_amount)} fee
        {Number(assignment.travel_reimbursement || 0) > 0
          ? " + " +
            money(assignment.travel_reimbursement) +
            " deslocação"
          : ""}
      </p>
    </div>
  );
}

function RatingBadge({ rating }) {
  return (
    <div className="shrink-0 rounded-2xl border border-[#B89A84]/20 bg-[#B89A84]/[0.06] px-5 py-4 sm:text-right">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#B89A84]">
        Nota do jogo
      </p>
      <p className="mt-1 text-2xl font-semibold">
        {rating.average.toFixed(1)}
        <span className="ml-1 text-sm font-normal text-white/30">/ 10</span>
      </p>
      <p className="mt-1 text-xs text-white/25">
        {rating.count} {rating.count === 1 ? "avaliação" : "avaliações"}
      </p>
    </div>
  );
}

function FeedbackBlock({ label, value }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/20">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-white/50 whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">
        {eyebrow}
      </p>
      <h2 className="text-xl font-semibold mt-1">{title}</h2>
    </div>
  );
}

function Metric({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <p className="text-sm text-white/35">{label}</p>
      <p className="text-3xl font-semibold mt-3">{value}</p>
      {hint && <p className="mt-2 text-xs text-white/20">{hint}</p>}
    </div>
  );
}

function Empty({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center text-sm text-white/35">
      {children}
    </div>
  );
}

function Notice({ children }) {
  return (
    <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
      {children}
    </div>
  );
}

function Status({ value }) {
  const labels = {
    assigned: "Por confirmar",
    accepted: "Aceite",
    declined: "Recusado",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return (
    <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/50">
      {labels[value] || value}
    </span>
  );
}

function summarizeFeedback(rows) {
  if (!rows.length) return { count: 0, average: null };

  return {
    count: rows.length,
    average:
      rows.reduce((sum, item) => sum + Number(item.score || 0), 0) /
      rows.length,
  };
}

function money(value) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(value + "T12:00:00"));
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
