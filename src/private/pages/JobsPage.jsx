import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines, getBusinessLine } from "../workspaceData";
import { supabase } from "../../lib/supabase";

const emptyForm = {
  business_line: "futebol",
  client_name: "",
  title: "",
  service_type: "",
  job_date: "",
  revenue: "",
  costs: "",
  payment_status: "paid",
  source: "",
  notes: "",
};

const emptyPlayerDraft = {
  name: "",
  shirt_number: "",
  position: "",
};

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lineFilter, setLineFilter] = useState(searchParams.get("ramo") || "all");
  const [form, setForm] = useState({
    ...emptyForm,
    business_line: searchParams.get("ramo") || "futebol",
  });

  const [teamChoice, setTeamChoice] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamSeason, setNewTeamSeason] = useState("");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [draftPlayers, setDraftPlayers] = useState([]);
  const [playerDraft, setPlayerDraft] = useState(emptyPlayerDraft);

  const showForm = searchParams.get("novo") === "1";

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    let query = supabase
      .from("workspace_jobs")
      .select("*, football_teams(id,name,season), workspace_job_players(player_id)")
      .gte("job_date", "2026-01-01")
      .lte("job_date", "2026-12-31")
      .order("job_date", { ascending: false });

    if (lineFilter !== "all") query = query.eq("business_line", lineFilter);

    const { data, error: loadError } = await query;

    if (loadError) {
      setError(loadError.message);
      setJobs([]);
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  }, [lineFilter]);

  const loadTeams = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("football_teams")
      .select("id,name,season")
      .order("season", { ascending: false })
      .order("name", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setTeams([]);
      return;
    }

    setTeams(data || []);
  }, []);

  const loadPlayers = useCallback(async (teamId) => {
    if (!teamId || teamId === "__new__") {
      setPlayers([]);
      return;
    }

    setPlayersLoading(true);

    const { data, error: loadError } = await supabase
      .from("football_players")
      .select("id,name,shirt_number,position")
      .eq("team_id", teamId)
      .order("shirt_number", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setPlayers([]);
    } else {
      setPlayers(data || []);
    }

    setPlayersLoading(false);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    if (form.business_line !== "futebol" || !showForm) return;
    loadPlayers(teamChoice);
  }, [form.business_line, loadPlayers, showForm, teamChoice]);

  const totals = useMemo(
    () =>
      jobs.reduce(
        (acc, job) => {
          acc.revenue += Number(job.revenue || 0);
          acc.costs += Number(job.costs || 0);
          return acc;
        },
        { revenue: 0, costs: 0 }
      ),
    [jobs]
  );

  const footballStats = useMemo(() => {
    const footballJobs = jobs.filter((job) => job.business_line === "futebol");
    const teamIds = new Set(
      footballJobs.map((job) => job.team_id).filter(Boolean)
    );
    const playerAppearances = footballJobs.reduce(
      (total, job) => total + (job.workspace_job_players?.length || 0),
      0
    );

    return {
      teams: teamIds.size,
      playerAppearances,
    };
  }, [jobs]);

  function openForm() {
    const next = new URLSearchParams(searchParams);
    next.set("novo", "1");
    setSearchParams(next);
  }

  function resetFootballFields() {
    setTeamChoice("");
    setNewTeamName("");
    setNewTeamSeason("");
    setPlayers([]);
    setSelectedPlayerIds([]);
    setDraftPlayers([]);
    setPlayerDraft(emptyPlayerDraft);
  }

  function closeForm() {
    const next = new URLSearchParams(searchParams);
    next.delete("novo");
    setSearchParams(next);
    setError("");
    setForm({
      ...emptyForm,
      business_line: lineFilter !== "all" ? lineFilter : "futebol",
    });
    resetFootballFields();
  }

  function handleBusinessLineChange(value) {
    setForm({ ...form, business_line: value });
    if (value !== "futebol") resetFootballFields();
  }

  function handleJobDateChange(value) {
    setForm({ ...form, job_date: value });

    if (form.business_line === "futebol" && teamChoice === "__new__") {
      setNewTeamSeason(value ? footballSeason(value) : "");
    }
  }

  function handleTeamChoiceChange(value) {
    setTeamChoice(value);
    setSelectedPlayerIds([]);
    setDraftPlayers([]);
    setPlayerDraft(emptyPlayerDraft);

    if (value === "__new__") {
      setPlayers([]);
      setNewTeamSeason(form.job_date ? footballSeason(form.job_date) : "");
    } else {
      setNewTeamName("");
      setNewTeamSeason("");
    }
  }

  function togglePlayer(playerId) {
    setSelectedPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  }

  function addDraftPlayer() {
    const name = playerDraft.name.trim();
    if (!name) return;

    setDraftPlayers((current) => [
      ...current,
      {
        tempId: Date.now() + "-" + Math.random(),
        name,
        shirt_number:
          playerDraft.shirt_number === ""
            ? null
            : Number(playerDraft.shirt_number),
        position: playerDraft.position.trim() || null,
      },
    ]);
    setPlayerDraft(emptyPlayerDraft);
  }

  function removeDraftPlayer(tempId) {
    setDraftPlayers((current) =>
      current.filter((player) => player.tempId !== tempId)
    );
  }

  async function resolveFootballTeam(userId) {
    if (!teamChoice) {
      throw new Error("Escolhe uma equipa ou cria uma nova.");
    }

    if (teamChoice !== "__new__") {
      const existingTeam = teams.find((team) => team.id === teamChoice);
      if (!existingTeam) throw new Error("A equipa selecionada já não existe.");
      return existingTeam;
    }

    const name = newTeamName.trim();
    const season = newTeamSeason.trim();

    if (!name) throw new Error("Escreve o nome da nova equipa.");
    if (!/^[0-9]{4}\/[0-9]{2}$/.test(season)) {
      throw new Error("A época deve ter o formato 2026/27.");
    }

    const { data, error: insertError } = await supabase
      .from("football_teams")
      .insert({
        user_id: userId,
        name,
        season,
      })
      .select("id,name,season")
      .single();

    if (!insertError) return data;

    if (insertError.code === "23505") {
      const { data: existing, error: existingError } = await supabase
        .from("football_teams")
        .select("id,name,season")
        .eq("season", season)
        .ilike("name", name)
        .single();

      if (!existingError && existing) return existing;
    }

    throw insertError;
  }

  async function createDraftPlayers(userId, teamId) {
    if (draftPlayers.length === 0) return [];

    const rows = draftPlayers.map((player) => ({
      user_id: userId,
      team_id: teamId,
      name: player.name,
      shirt_number: player.shirt_number,
      position: player.position,
    }));

    const { data, error: insertError } = await supabase
      .from("football_players")
      .insert(rows)
      .select("id");

    if (insertError) throw insertError;
    return (data || []).map((player) => player.id);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setSaving(false);
      setError("Não foi possível confirmar a tua sessão.");
      return;
    }

    try {
      let resolvedTeam = null;
      let createdPlayerIds = [];

      if (form.business_line === "futebol") {
        resolvedTeam = await resolveFootballTeam(userData.user.id);
        createdPlayerIds = await createDraftPlayers(
          userData.user.id,
          resolvedTeam.id
        );
      }

      const clientName =
        form.business_line === "futebol"
          ? resolvedTeam.name
          : form.client_name.trim();

      if (!clientName) {
        throw new Error("Indica o cliente.");
      }

      const payload = {
        user_id: userData.user.id,
        business_line: form.business_line,
        client_name: clientName,
        team_id:
          form.business_line === "futebol" ? resolvedTeam.id : null,
        title: form.title.trim(),
        service_type: form.service_type.trim() || null,
        job_date: form.job_date,
        status: "completed",
        revenue: Number(form.revenue || 0),
        costs: Number(form.costs || 0),
        payment_status: form.payment_status,
        source: form.source.trim() || null,
        notes: form.notes.trim() || null,
      };

      const { data: insertedJob, error: insertError } = await supabase
        .from("workspace_jobs")
        .insert(payload)
        .select("id")
        .single();

      if (insertError) throw insertError;

      if (form.business_line === "futebol") {
        const playerIds = Array.from(
          new Set([...selectedPlayerIds, ...createdPlayerIds])
        );

        if (playerIds.length > 0) {
          const links = playerIds.map((playerId) => ({
            job_id: insertedJob.id,
            player_id: playerId,
            user_id: userData.user.id,
          }));

          const { error: linkError } = await supabase
            .from("workspace_job_players")
            .insert(links);

          if (linkError) {
            await supabase
              .from("workspace_jobs")
              .delete()
              .eq("id", insertedJob.id);
            throw linkError;
          }
        }
      }

      await loadTeams();
      closeForm();
      await loadJobs();
    } catch (submitError) {
      setError(submitError.message || "Não foi possível guardar o trabalho.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteJob(id) {
    if (!window.confirm("Eliminar este trabalho?")) return;

    const { error: deleteError } = await supabase
      .from("workspace_jobs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadJobs();
  }

  return (
    <WorkspaceLayout
      title="Trabalhos"
      eyebrow="Histórico 2026"
      actions={
        <button
          type="button"
          onClick={openForm}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition"
        >
          + Adicionar trabalho
        </button>
      }
    >
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <p className="text-white/45 max-w-2xl">
          Começamos por 2026. Regista os trabalhos reais deste ano e só os dados que consegues recuperar sem esforço.
        </p>
        <div className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/55">
          Ano: <span className="text-white font-medium">2026</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-7">
        <FilterButton active={lineFilter === "all"} onClick={() => setLineFilter("all")}>
          Todos
        </FilterButton>
        {businessLines.map((line) => (
          <FilterButton
            key={line.id}
            active={lineFilter === line.id}
            onClick={() => setLineFilter(line.id)}
          >
            {line.icon} {line.name}
          </FilterButton>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-7">
        <Metric label="Trabalhos" value={String(jobs.length)} />
        <Metric label="Receita" value={money(totals.revenue)} />
        <Metric label="Custos diretos" value={money(totals.costs)} />
        <Metric label="Margem registada" value={money(totals.revenue - totals.costs)} />
        {lineFilter === "futebol" && (
          <>
            <Metric label="Equipas trabalhadas" value={String(footballStats.teams)} />
            <Metric
              label="Presenças de jogadores"
              value={String(footballStats.playerAppearances)}
            />
          </>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-[0.16em] text-white/25">
          <span className="col-span-2">Data</span>
          <span className="col-span-3">Cliente / Trabalho</span>
          <span className="col-span-2">Ramo</span>
          <span className="col-span-2 text-right">Receita</span>
          <span className="col-span-2">Pagamento</span>
          <span />
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-white/30">A carregar...</div>
        ) : jobs.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-white/35">Ainda não tens trabalhos de 2026 registados.</p>
            <button
              type="button"
              onClick={openForm}
              className="mt-4 text-sm text-[#B89A84] hover:text-white transition"
            >
              Adicionar o primeiro trabalho →
            </button>
          </div>
        ) : (
          jobs.map((job) => {
            const line = getBusinessLine(job.business_line);
            const team = job.football_teams;
            const playerCount = job.workspace_job_players?.length || 0;

            return (
              <div
                key={job.id}
                className="grid md:grid-cols-12 gap-3 md:gap-4 px-5 py-4 border-b border-white/[0.05] last:border-b-0 items-center"
              >
                <div className="md:col-span-2 text-sm text-white/45">
                  {formatDate(job.job_date)}
                </div>
                <div className="md:col-span-3">
                  <p className="text-sm font-medium">{team?.name || job.client_name}</p>
                  <p className="text-xs text-white/30 mt-1">{job.title}</p>
                </div>
                <div className="md:col-span-2 text-sm text-white/45">
                  <p>{line ? line.icon + " " + line.name : job.business_line}</p>
                  {job.business_line === "futebol" && (
                    <p className="text-xs text-white/25 mt-1">
                      Época {team?.season || footballSeason(job.job_date)}
                      {playerCount > 0
                        ? " · " + playerCount + (playerCount === 1 ? " jogador" : " jogadores")
                        : ""}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 md:text-right text-sm font-medium">
                  {money(job.revenue)}
                </div>
                <div className="md:col-span-2">
                  <PaymentBadge value={job.payment_status} />
                </div>
                <div className="md:col-span-1 md:text-right">
                  <button
                    type="button"
                    onClick={() => deleteJob(job.id)}
                    className="text-xs text-white/20 hover:text-red-300 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#1A1A1A] shadow-2xl">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.07]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#B89A84]">
                  Histórico 2026
                </p>
                <h2 className="text-xl font-semibold mt-1">Adicionar trabalho</h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="text-white/35 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Ramo">
                  <select
                    value={form.business_line}
                    onChange={(e) => handleBusinessLineChange(e.target.value)}
                    className={inputClass}
                  >
                    {businessLines.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Data">
                  <input
                    type="date"
                    min="2026-01-01"
                    max="2026-12-31"
                    value={form.job_date}
                    onChange={(e) => handleJobDateChange(e.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>
              </div>

              {form.business_line === "futebol" ? (
                <FootballFields
                  teams={teams}
                  teamChoice={teamChoice}
                  onTeamChoiceChange={handleTeamChoiceChange}
                  newTeamName={newTeamName}
                  setNewTeamName={setNewTeamName}
                  newTeamSeason={newTeamSeason}
                  setNewTeamSeason={setNewTeamSeason}
                  players={players}
                  playersLoading={playersLoading}
                  selectedPlayerIds={selectedPlayerIds}
                  togglePlayer={togglePlayer}
                  draftPlayers={draftPlayers}
                  removeDraftPlayer={removeDraftPlayer}
                  playerDraft={playerDraft}
                  setPlayerDraft={setPlayerDraft}
                  addDraftPlayer={addDraftPlayer}
                />
              ) : (
                <Field label="Cliente">
                  <input
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    placeholder="Nome do cliente"
                    required
                    className={inputClass}
                  />
                </Field>
              )}

              <Field label="Nome do trabalho">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={
                    form.business_line === "futebol"
                      ? "Ex.: Jogo vs. Amora FC"
                      : "Ex.: Captação mensal de conteúdo"
                  }
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Tipo de serviço">
                <input
                  value={form.service_type}
                  onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                  placeholder="Fotografia, vídeo, produção + edição..."
                  className={inputClass}
                />
              </Field>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Valor cobrado (€)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.revenue}
                    onChange={(e) => setForm({ ...form, revenue: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Custos diretos (€)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costs}
                    onChange={(e) => setForm({ ...form, costs: e.target.value })}
                    placeholder="Combustível..."
                    className={inputClass}
                  />
                </Field>
                <Field label="Pagamento">
                  <select
                    value={form.payment_status}
                    onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                    className={inputClass}
                  >
                    <option value="paid">Pago</option>
                    <option value="partial">Parcial</option>
                    <option value="unpaid">Por pagar</option>
                  </select>
                </Field>
              </div>

              <Field label="Origem do cliente">
                <input
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="Instagram, recomendação, contacto direto..."
                  className={inputClass}
                />
              </Field>

              <Field label="Notas">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={4}
                  placeholder="Só o que for útil recordar."
                  className={inputClass}
                />
              </Field>

              {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/55 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#B89A84] px-5 py-2.5 text-sm font-semibold text-[#151515] hover:brightness-110 disabled:opacity-50 transition"
                >
                  {saving ? "A guardar..." : "Guardar trabalho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}

function FootballFields({
  teams,
  teamChoice,
  onTeamChoiceChange,
  newTeamName,
  setNewTeamName,
  newTeamSeason,
  setNewTeamSeason,
  players,
  playersLoading,
  selectedPlayerIds,
  togglePlayer,
  draftPlayers,
  removeDraftPlayer,
  playerDraft,
  setPlayerDraft,
  addDraftPlayer,
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-[#B89A84]/20 bg-[#B89A84]/[0.04] p-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B89A84]">
          Futebol
        </p>
        <p className="text-sm text-white/45 mt-1">
          Cada equipa corresponde a uma equipa numa época específica.
        </p>
      </div>

      <Field label="Equipa">
        <select
          value={teamChoice}
          onChange={(e) => onTeamChoiceChange(e.target.value)}
          required
          className={inputClass}
        >
          <option value="">Escolher equipa...</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} — {team.season}
            </option>
          ))}
          <option value="__new__">+ Criar nova equipa</option>
        </select>
      </Field>

      {teamChoice === "__new__" && (
        <div className="grid sm:grid-cols-[1fr_150px] gap-4">
          <Field label="Nome da nova equipa">
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Ex.: Vitória FC Sénior"
              required
              className={inputClass}
            />
          </Field>
          <Field label="Época">
            <input
              value={newTeamSeason}
              onChange={(e) => setNewTeamSeason(e.target.value)}
              placeholder="2026/27"
              pattern="[0-9]{4}/[0-9]{2}"
              required
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {teamChoice && (
        <div className="border-t border-white/[0.07] pt-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-medium text-white/70">Jogadores neste trabalho</p>
              <p className="text-xs text-white/30 mt-1">
                Seleciona jogadores já existentes ou adiciona novos ao plantel.
              </p>
            </div>
            {teamChoice !== "__new__" && players.length > 0 && (
              <span className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                Plantel: {players.length}
              </span>
            )}
          </div>

          {teamChoice !== "__new__" && (
            <div className="mb-4">
              {playersLoading ? (
                <p className="text-xs text-white/30 py-3">A carregar plantel...</p>
              ) : players.length === 0 ? (
                <p className="text-xs text-white/30 py-3">
                  Esta equipa ainda não tem jogadores registados.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {players.map((player) => (
                    <label
                      key={player.id}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 px-3 py-2.5 cursor-pointer hover:border-white/15 transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlayerIds.includes(player.id)}
                        onChange={() => togglePlayer(player.id)}
                        className="accent-[#B89A84]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm text-white/70 truncate">
                          {player.name}
                          {player.shirt_number !== null
                            ? " #" + player.shirt_number
                            : ""}
                        </span>
                        {player.position && (
                          <span className="block text-[11px] text-white/25 mt-0.5">
                            {player.position}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {draftPlayers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {draftPlayers.map((player) => (
                <span
                  key={player.tempId}
                  className="inline-flex items-center gap-2 rounded-full border border-[#B89A84]/25 bg-[#B89A84]/10 px-3 py-1.5 text-xs text-[#D8C3B4]"
                >
                  {player.name}
                  {player.shirt_number !== null ? " #" + player.shirt_number : ""}
                  <button
                    type="button"
                    onClick={() => removeDraftPlayer(player.tempId)}
                    className="text-white/35 hover:text-white"
                    aria-label={"Remover " + player.name}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-[1fr_90px_130px_auto] gap-2 items-end">
            <Field label="Novo jogador">
              <input
                value={playerDraft.name}
                onChange={(e) =>
                  setPlayerDraft({ ...playerDraft, name: e.target.value })
                }
                placeholder="Nome"
                className={inputClass}
              />
            </Field>
            <Field label="N.º">
              <input
                type="number"
                min="0"
                max="99"
                value={playerDraft.shirt_number}
                onChange={(e) =>
                  setPlayerDraft({
                    ...playerDraft,
                    shirt_number: e.target.value,
                  })
                }
                placeholder="#"
                className={inputClass}
              />
            </Field>
            <Field label="Posição">
              <input
                value={playerDraft.position}
                onChange={(e) =>
                  setPlayerDraft({ ...playerDraft, position: e.target.value })
                }
                placeholder="Extremo"
                className={inputClass}
              />
            </Field>
            <button
              type="button"
              onClick={addDraftPlayer}
              disabled={!playerDraft.name.trim()}
              className="h-[46px] rounded-xl border border-white/10 px-3 text-sm text-white/55 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition"
            >
              + Jogador
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#B89A84]/60";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/45 mb-2">{label}</span>
      {children}
    </label>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full px-4 py-2 text-sm border bg-white text-[#151515] border-white"
          : "rounded-full px-4 py-2 text-sm border border-white/10 text-white/40 hover:text-white transition"
      }
    >
      {children}
    </button>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <p className="text-sm text-white/40">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function PaymentBadge({ value }) {
  const labels = { paid: "Pago", partial: "Parcial", unpaid: "Por pagar" };
  return (
    <span className="inline-flex rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/50">
      {labels[value] || value}
    </span>
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

function footballSeason(value) {
  if (!value) return "—";

  const [yearString, monthString] = value.split("-");
  const year = Number(yearString);
  const month = Number(monthString);

  if (month >= 7) {
    return year + "/" + String(year + 1).slice(-2);
  }

  return year - 1 + "/" + String(year).slice(-2);
}
