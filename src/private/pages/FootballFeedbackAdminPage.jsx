import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { supabase } from "../../lib/supabase";

const PUBLIC_BASE_URL = "https://prismastudios.pt";

export default function FootballFeedbackAdminPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [form, setForm] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [jobResult, formResult, feedbackResult] = await Promise.all([
      supabase
        .from("workspace_jobs")
        .select("id,title,client_name,job_date,business_line,status,football_teams(name,season)")
        .eq("id", jobId)
        .maybeSingle(),
      supabase
        .from("workspace_football_feedback_forms")
        .select("job_id,token,is_active")
        .eq("job_id", jobId)
        .maybeSingle(),
      supabase
        .from("workspace_football_feedback")
        .select("id,score,liked,disliked,created_at")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false }),
    ]);

    const firstError =
      jobResult.error || formResult.error || feedbackResult.error;

    if (firstError) {
      setError(firstError.message);
    }

    setJob(jobResult.data || null);
    setForm(formResult.data || null);
    setFeedback(feedbackResult.data || []);
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    if (feedback.length === 0) {
      return { count: 0, average: null };
    }

    const total = feedback.reduce(
      (sum, item) => sum + Number(item.score || 0),
      0
    );

    return {
      count: feedback.length,
      average: total / feedback.length,
    };
  }, [feedback]);

  const publicUrl = form?.token
    ? PUBLIC_BASE_URL + "/avaliar/futebol/" + form.token
    : "";

  async function copyLink() {
    if (!publicUrl) return;

    const message = feedbackShareMessage(publicUrl);

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copia esta mensagem:", message);
    }
  }

  return (
    <WorkspaceLayout
      title="Avaliações"
      eyebrow="Futebol · Feedback anónimo"
      actions={
        <Link
          to="/tomasmondim/admin/trabalhos?ramo=futebol"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition"
        >
          ← Trabalhos
        </Link>
      }
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-white/30">
          A carregar avaliações...
        </div>
      ) : !job ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center text-sm text-white/35">
          Trabalho não encontrado.
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#B89A84]">
              {formatDate(job.job_date)}
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {job.football_teams?.name || job.client_name}
            </h2>
            <p className="mt-1 text-sm text-white/35">{job.title}</p>

            {publicUrl && (
              <div className="mt-5 flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3 text-xs text-white/35 break-all">
                  {publicUrl}
                </div>
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-xl bg-[#B89A84] px-4 py-3 text-sm font-semibold text-[#151515] hover:brightness-110 transition"
                >
                  {copied ? "Copiado ✓" : "Copiar link"}
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-white/55 hover:text-white transition"
                >
                  Abrir ↗
                </a>
              </div>
            )}
          </section>

          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <Metric
              label="Avaliações"
              value={String(stats.count)}
              hint="Cada resposta é anónima"
            />
            <Metric
              label="Nota média"
              value={stats.average === null ? "—" : stats.average.toFixed(1) + " / 10"}
              hint="Média de todas as respostas"
            />
          </div>

          <section className="mt-8">
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                Respostas
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Feedback dos jogadores
              </h2>
            </div>

            {feedback.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center">
                <p className="text-sm text-white/35">
                  Ainda não existem avaliações para este jogo.
                </p>
                <p className="mt-2 text-xs text-white/20">
                  Partilha o link com a equipa depois do trabalho.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedback.map((item, index) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-white/25">
                          Anónimo #{feedback.length - index} · {formatDateTime(item.created_at)}
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                          {item.score}
                          <span className="ml-1 text-base font-normal text-white/25">
                            / 10
                          </span>
                        </p>
                      </div>
                    </div>

                    {(item.liked || item.disliked) && (
                      <div className="mt-5 grid lg:grid-cols-2 gap-4">
                        <FeedbackText
                          label="O que gostou"
                          value={item.liked}
                          empty="Sem comentário."
                        />
                        <FeedbackText
                          label="O que podia melhorar"
                          value={item.disliked}
                          empty="Sem comentário."
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </WorkspaceLayout>
  );
}

function Metric({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <p className="text-sm text-white/35">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-white/20">{hint}</p>
    </div>
  );
}

function FeedbackText({ label, value, empty }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/50">
        {value || empty}
      </p>
    </div>
  );
}

function feedbackShareMessage(url) {
  return [
    "Para continuarmos a melhorar, deixo aqui um link para avaliarem o nosso trabalho 🙌",
    "",
    "Podem dar uma nota e, se quiserem, acrescentar o que mais gostaram e também alguns pontos que acham que podemos melhorar.",
    "",
    "O objetivo é perceber melhor o que valorizam para conseguirmos fazer fotos cada vez melhores para vocês ao longo da época.",
    "",
    "Partilha também o link com os teus colegas de equipa, por favor, para conseguirmos ter o feedback de mais jogadores.",
    "",
    url,
  ].join("\n");
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value + "T12:00:00"));
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
