import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { supabase } from "../../lib/supabase";

const emptyPlayer = {
  name: "",
  shirt_number: "",
  position: "",
  phone: "",
  email: "",
  instagram: "",
  notes: "",
};

export default function FootballTeamPage() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [adding, setAdding] = useState(false);
  const [newPlayer, setNewPlayer] = useState(emptyPlayer);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotFound(false);

    const teamResult = await supabase
      .from("football_teams")
      .select("id,name,season,created_at")
      .eq("id", teamId)
      .maybeSingle();

    if (teamResult.error) {
      setError(teamResult.error.message);
      setLoading(false);
      return;
    }

    if (!teamResult.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const [playersResult, jobsResult] = await Promise.all([
      supabase
        .from("football_players")
        .select("id,name,shirt_number,position,phone,email,instagram,notes")
        .eq("team_id", teamId)
        .order("shirt_number", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true }),
      supabase
        .from("workspace_jobs")
        .select("id,title,job_date,revenue,costs,payment_status,status")
        .eq("team_id", teamId)
        .order("job_date", { ascending: false }),
    ]);

    if (playersResult.error || jobsResult.error) {
      setError(playersResult.error?.message || jobsResult.error?.message || "Erro ao carregar a equipa.");
      setLoading(false);
      return;
    }

    const playerRows = playersResult.data || [];
    const playerIds = playerRows.map((player) => player.id);

    let linkRows = [];
    if (playerIds.length > 0) {
      const linksResult = await supabase
        .from("workspace_job_players")
        .select("job_id,player_id")
        .in("player_id", playerIds);

      if (linksResult.error) {
        setError(linksResult.error.message);
      } else {
        linkRows = linksResult.data || [];
      }
    }

    setTeam(teamResult.data);
    setPlayers(playerRows);
    setJobs(jobsResult.data || []);
    setLinks(linkRows);
    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const revenue = jobs.reduce((total, job) => total + Number(job.revenue || 0), 0);
    const costs = jobs.reduce((total, job) => total + Number(job.costs || 0), 0);
    const paidRevenue = jobs
      .filter((job) => job.payment_status === "paid")
      .reduce((total, job) => total + Number(job.revenue || 0), 0);

    return {
      jobs: jobs.length,
      players: players.length,
      revenue,
      costs,
      margin: revenue - costs,
      avgRevenue: jobs.length ? revenue / jobs.length : 0,
      appearances: links.length,
      paidRevenue,
    };
  }, [jobs, players, links]);

  const appearancesByPlayer = useMemo(() => {
    const counts = new Map();
    links.forEach((link) => {
      counts.set(link.player_id, (counts.get(link.player_id) || 0) + 1);
    });
    return counts;
  }, [links]);

  function updateLocalPlayer(id, field, value) {
    setPlayers((current) =>
      current.map((player) =>
        player.id === id ? { ...player, [field]: value } : player
      )
    );
  }

  async function savePlayer(player) {
    setSavingId(player.id);
    setError("");

    const { error: updateError } = await supabase
      .from("football_players")
      .update({
        name: player.name.trim(),
        shirt_number:
          player.shirt_number === "" || player.shirt_number === null
            ? null
            : Number(player.shirt_number),
        position: clean(player.position),
        phone: clean(player.phone),
        email: clean(player.email),
        instagram: clean(player.instagram),
        notes: clean(player.notes),
        updated_at: new Date().toISOString(),
      })
      .eq("id", player.id);

    setSavingId("");

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadData();
  }

  async function addPlayer(event) {
    event.preventDefault();
    if (!newPlayer.name.trim()) return;

    setAdding(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setAdding(false);
      setError("Não foi possível confirmar a tua sessão.");
      return;
    }

    const { error: insertError } = await supabase
      .from("football_players")
      .insert({
        user_id: userData.user.id,
        team_id: teamId,
        name: newPlayer.name.trim(),
        shirt_number:
          newPlayer.shirt_number === "" ? null : Number(newPlayer.shirt_number),
        position: clean(newPlayer.position),
        phone: clean(newPlayer.phone),
        email: clean(newPlayer.email),
        instagram: clean(newPlayer.instagram),
        notes: clean(newPlayer.notes),
      });

    setAdding(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setNewPlayer(emptyPlayer);
    await loadData();
  }

  async function deletePlayer(player) {
    if (!window.confirm("Eliminar " + player.name + " deste plantel?")) return;

    const { error: deleteError } = await supabase
      .from("football_players")
      .delete()
      .eq("id", player.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadData();
  }

  if (notFound) {
    return <Navigate to="/tomasmondim/ramo/futebol/equipas" replace />;
  }

  return (
    <WorkspaceLayout
      title={team ? team.name : "Equipa"}
      eyebrow={team ? "Futebol · Época " + team.season : "Futebol"}
      actions={
        <Link
          to="/tomasmondim/trabalhos?ramo=futebol&novo=1"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition"
        >
          + Trabalho
        </Link>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/tomasmondim/ramo/futebol/equipas"
          className="text-sm text-white/35 hover:text-white transition"
        >
          ← Voltar às equipas
        </Link>
        {team && (
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/45">
            {team.name} · {team.season}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-white/30">A carregar equipa...</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-7">
            <Metric label="Trabalhos" value={String(stats.jobs)} />
            <Metric label="Receita" value={money(stats.revenue)} />
            <Metric label="Margem" value={money(stats.margin)} />
            <Metric label="Jogadores" value={String(stats.players)} />
            <Metric label="Receita média / trabalho" value={money(stats.avgRevenue)} />
            <Metric label="Custos diretos" value={money(stats.costs)} />
            <Metric label="Presenças de jogadores" value={String(stats.appearances)} />
            <Metric label="Receita paga" value={money(stats.paidRevenue)} />
          </div>

          <section className="mt-10">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
                  Plantel
                </p>
                <h2 className="text-xl font-semibold mt-1">Jogadores & contactos</h2>
              </div>
              <span className="text-xs text-white/25">
                {players.length} {players.length === 1 ? "jogador" : "jogadores"}
              </span>
            </div>

            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
                >
                  <div className="grid lg:grid-cols-[90px_1.2fr_1fr_1fr_1fr_auto] gap-3 items-end">
                    <Field label="N.º">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={player.shirt_number ?? ""}
                        onChange={(e) => updateLocalPlayer(player.id, "shirt_number", e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Nome">
                      <input
                        value={player.name}
                        onChange={(e) => updateLocalPlayer(player.id, "name", e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Telemóvel">
                      <input
                        value={player.phone || ""}
                        onChange={(e) => updateLocalPlayer(player.id, "phone", e.target.value)}
                        placeholder="+351..."
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        type="email"
                        value={player.email || ""}
                        onChange={(e) => updateLocalPlayer(player.id, "email", e.target.value)}
                        placeholder="email@..."
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Instagram">
                      <input
                        value={player.instagram || ""}
                        onChange={(e) => updateLocalPlayer(player.id, "instagram", e.target.value)}
                        placeholder="@..."
                        className={inputClass}
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => savePlayer(player)}
                      disabled={savingId === player.id}
                      className="h-[46px] rounded-xl bg-[#B89A84] px-4 text-sm font-semibold text-[#151515] disabled:opacity-50"
                    >
                      {savingId === player.id ? "A guardar..." : "Guardar"}
                    </button>
                  </div>

                  <div className="grid md:grid-cols-[180px_1fr_auto] gap-3 items-end mt-3">
                    <Field label="Posição">
                      <input
                        value={player.position || ""}
                        onChange={(e) => updateLocalPlayer(player.id, "position", e.target.value)}
                        placeholder="Ex.: Extremo"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Notas">
                      <input
                        value={player.notes || ""}
                        onChange={(e) => updateLocalPlayer(player.id, "notes", e.target.value)}
                        placeholder="Informação útil sobre o jogador..."
                        className={inputClass}
                      />
                    </Field>
                    <div className="flex items-center justify-end gap-4 h-[46px]">
                      <span className="text-xs text-white/30">
                        {appearancesByPlayer.get(player.id) || 0}{" "}
                        {(appearancesByPlayer.get(player.id) || 0) === 1
                          ? "trabalho"
                          : "trabalhos"}
                      </span>
                      <button
                        type="button"
                        onClick={() => deletePlayer(player)}
                        className="text-xs text-white/25 hover:text-red-300 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {players.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-white/35">
                  Ainda não existem jogadores nesta equipa.
                </div>
              )}
            </div>

            <form
              onSubmit={addPlayer}
              className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-4"
            >
              <p className="text-sm font-medium mb-4">Adicionar jogador ao plantel</p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-[1.2fr_90px_140px_1fr_1fr_auto] gap-3 items-end">
                <Field label="Nome">
                  <input
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="N.º">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={newPlayer.shirt_number}
                    onChange={(e) => setNewPlayer({ ...newPlayer, shirt_number: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Posição">
                  <input
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Telemóvel">
                  <input
                    value={newPlayer.phone}
                    onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Instagram">
                  <input
                    value={newPlayer.instagram}
                    onChange={(e) => setNewPlayer({ ...newPlayer, instagram: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <button
                  type="submit"
                  disabled={adding}
                  className="h-[46px] rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:text-white disabled:opacity-50 transition"
                >
                  {adding ? "A adicionar..." : "+ Jogador"}
                </button>
              </div>
            </form>
          </section>

          <section className="mt-10">
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
                Histórico
              </p>
              <h2 className="text-xl font-semibold mt-1">Trabalhos da equipa</h2>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
              {jobs.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-white/35">
                  Ainda não existem trabalhos associados a esta equipa.
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="grid sm:grid-cols-[120px_1fr_auto_auto] gap-4 items-center px-5 py-4 border-b border-white/[0.05] last:border-b-0"
                  >
                    <span className="text-xs text-white/35">{formatDate(job.job_date)}</span>
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-white/25 mt-1">
                        {paymentLabel(job.payment_status)}
                      </p>
                    </div>
                    <span className="text-sm text-white/45">
                      custos {money(job.costs)}
                    </span>
                    <span className="text-sm font-medium">{money(job.revenue)}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </WorkspaceLayout>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#B89A84]/60";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/40 mb-2">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <p className="text-sm text-white/40">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function clean(value) {
  const trimmed = String(value || "").trim();
  return trimmed || null;
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

function paymentLabel(value) {
  return (
    {
      paid: "Pago",
      partial: "Parcial",
      unpaid: "Por pagar",
    }[value] || value
  );
}
