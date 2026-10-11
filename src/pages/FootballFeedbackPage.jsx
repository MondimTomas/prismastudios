import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function FootballFeedbackPage() {
  const { token } = useParams();
  const [job, setJob] = useState(null);
  const [score, setScore] = useState(null);
  const [liked, setLiked] = useState("");
  const [disliked, setDisliked] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const deviceId = getDeviceId();
        const data = await invokeFeedback({
          action: "get",
          token,
          device_id: deviceId,
        });

        if (active) {
          setJob(data.job);
          setAlreadySubmitted(Boolean(data.already_submitted));
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Este link de avaliação não está disponível.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (score === null) {
      setError("Escolhe uma nota entre 0 e 10.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await invokeFeedback({
        action: "submit",
        token,
        device_id: getDeviceId(),
        score,
        liked,
        disliked,
      });
      setSubmitted(true);
      setAlreadySubmitted(true);
    } catch (submitError) {
      setError(submitError.message || "Não foi possível enviar a avaliação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#111111] text-white px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-9">
          <p className="text-xs uppercase tracking-[0.26em] text-[#B89A84]">
            PrismaStudios
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            Avaliação das fotografias
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base leading-7 text-white/45">
            A resposta é totalmente anónima. Não pedimos nome, email ou qualquer
            identificação. A única resposta obrigatória é a nota.
          </p>
        </div>

        {loading ? (
          <Card>
            <p className="text-sm text-white/40">A carregar avaliação...</p>
          </Card>
        ) : error && !job ? (
          <Card>
            <p className="text-sm text-red-200">{error}</p>
          </Card>
        ) : submitted ? (
          <Card>
            <p className="text-xs uppercase tracking-[0.2em] text-[#B89A84]">
              Obrigado
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Avaliação enviada.</h2>
            <p className="mt-3 text-white/45 leading-7">
              Obrigado pelo teu feedback. Vamos fazer o máximo para melhorar ao
              longo da época e esperamos voltar a trabalhar juntos em breve.
            </p>
          </Card>
        ) : alreadySubmitted ? (
          <Card>
            <p className="text-xs uppercase tracking-[0.2em] text-[#B89A84]">
              Obrigado
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Já enviaste a tua avaliação.
            </h2>
            <p className="mt-3 text-white/45 leading-7">
              Obrigado pelo teu feedback. Vamos fazer o máximo para melhorar ao
              longo da época e esperamos voltar a trabalhar juntos em breve.
            </p>
          </Card>
        ) : (
          <>
            <Card>
              <p className="text-xs uppercase tracking-[0.18em] text-white/30">
                {formatDate(job?.job_date)}
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {job?.team_name || job?.client_name}
              </h2>
              <p className="mt-1 text-sm text-white/40">{job?.title}</p>
            </Card>

            {!job?.can_submit ? (
              <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5 text-sm text-amber-100/70">
                A avaliação fica disponível depois do jogo.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <Card>
                  <fieldset>
                    <legend className="text-lg font-medium">
                      Que nota dás ao trabalho?
                      <span className="ml-2 text-xs font-normal text-[#B89A84]">
                        obrigatório
                      </span>
                    </legend>
                    <p className="mt-1 text-sm text-white/35">
                      0 = muito fraco · 10 = excelente
                    </p>

                    <div className="mt-5 grid grid-cols-6 sm:grid-cols-11 gap-2">
                      {Array.from({ length: 11 }, (_, value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setScore(value)}
                          aria-pressed={score === value}
                          className={
                            score === value
                              ? "h-11 rounded-xl bg-[#B89A84] text-[#151515] font-semibold"
                              : "h-11 rounded-xl border border-white/10 bg-white/[0.025] text-white/60 hover:border-white/25 hover:text-white transition"
                          }
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </Card>

                <Card>
                  <label className="block">
                    <span className="text-base font-medium">
                      O que gostaste mais?
                    </span>
                    <span className="ml-2 text-xs text-white/25">opcional</span>
                    <textarea
                      value={liked}
                      onChange={(event) => setLiked(event.target.value)}
                      maxLength={1500}
                      rows={4}
                      placeholder="Ex.: variedade de fotografias, momentos apanhados, qualidade..."
                      className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#B89A84]/60"
                    />
                  </label>
                </Card>

                <Card>
                  <label className="block">
                    <span className="text-base font-medium">
                      O que podia ter sido melhor?
                    </span>
                    <span className="ml-2 text-xs text-white/25">opcional</span>
                    <textarea
                      value={disliked}
                      onChange={(event) => setDisliked(event.target.value)}
                      maxLength={1500}
                      rows={4}
                      placeholder="Se houver alguma coisa que gostasses que fizéssemos diferente, diz-nos."
                      className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#B89A84]/60"
                    />
                  </label>
                </Card>

                {error && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving || score === null}
                  className="w-full rounded-xl bg-[#B89A84] px-5 py-3.5 text-sm font-semibold text-[#151515] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "A enviar..." : "Enviar avaliação"}
                </button>

                <p className="text-center text-xs leading-5 text-white/20">
                  Pode existir uma avaliação por browser/dispositivo para este
                  jogo. A resposta continua anónima.
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Card({ children }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
      {children}
    </section>
  );
}

async function invokeFeedback(body) {
  const { data, error } = await supabase.functions.invoke("football-feedback", {
    body,
  });

  if (!error) return data;

  let message = data?.error;

  try {
    const payload = await error.context?.json();
    if (payload?.error) message = payload.error;
  } catch {
    // Keep the generic message below.
  }

  throw new Error(message || "Não foi possível comunicar com o formulário.");
}

function getDeviceId() {
  const storageKey = "prisma_football_feedback_device_id";

  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;

    const created =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "device-" +
          Date.now().toString(36) +
          "-" +
          Math.random().toString(36).slice(2);

    window.localStorage.setItem(storageKey, created);
    return created;
  } catch {
    return (
      "session-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2)
    );
  }
}

function formatDate(value) {
  if (!value) return "Jogo de futebol";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value + "T12:00:00"));
}
