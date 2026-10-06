import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const [zerozeroUrl, setZerozeroUrl] = useState("");
  const [zerozeroPreview, setZerozeroPreview] = useState(null);
  const [selectedImportKeys, setSelectedImportKeys] = useState([]);
  const [previewingZerozero, setPreviewingZerozero] = useState(false);
  const [importingZerozero, setImportingZerozero] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [zerozeroError, setZerozeroError] = useState("");
  const [zerozeroExtensionAvailable, setZerozeroExtensionAvailable] = useState(false);
  const zerozeroRequestRef = useRef(null);
  const zerozeroTimeoutRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotFound(false);

    const teamResult = await supabase
      .from("football_teams")
      .select(
        "id,name,season,created_at,zerozero_url,zerozero_last_synced_at,zerozero_cached_preview,zerozero_preview_cached_at"
      )
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
        .select(
          "id,name,shirt_number,position,phone,email,instagram,notes,source,source_url"
        )
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
      setError(
        playersResult.error?.message ||
          jobsResult.error?.message ||
          "Erro ao carregar a equipa."
      );
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
    setZerozeroUrl(teamResult.data.zerozero_url || "");
    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    function handleExtensionMessage(event) {
      if (event.source !== window) return;
      const message = event.data;
      if (message?.source !== "prisma-zerozero-extension") return;

      if (message.type === "ZEROZERO_EXTENSION_READY") {
        setZerozeroExtensionAvailable(true);
        return;
      }

      const currentRequest = zerozeroRequestRef.current;
      if (!currentRequest || message.requestId !== currentRequest.requestId) return;

      if (zerozeroTimeoutRef.current) {
        window.clearTimeout(zerozeroTimeoutRef.current);
        zerozeroTimeoutRef.current = null;
      }

      zerozeroRequestRef.current = null;
      setPreviewingZerozero(false);

      if (message.type === "PRISMA_ZEROZERO_IMPORT_ERROR") {
        setZerozeroError(message.error || "Não foi possível ler o plantel.");
        return;
      }

      if (message.type === "PRISMA_ZEROZERO_IMPORT_RESULT") {
        applyZerozeroPreview(message.data, currentRequest.url).catch((previewError) => {
          setZerozeroError(
            previewError?.message ||
              "O plantel foi lido, mas não foi possível preparar a pré-visualização."
          );
        });
      }
    }

    window.addEventListener("message", handleExtensionMessage);
    window.postMessage(
      { source: "prisma-workspace", type: "PING_ZEROZERO_EXTENSION" },
      "*"
    );

    return () => {
      window.removeEventListener("message", handleExtensionMessage);
      if (zerozeroTimeoutRef.current) {
        window.clearTimeout(zerozeroTimeoutRef.current);
      }
    };
  }, [teamId]);

  const stats = useMemo(() => {
    const revenue = jobs.reduce(
      (total, job) => total + Number(job.revenue || 0),
      0
    );
    const costs = jobs.reduce(
      (total, job) => total + Number(job.costs || 0),
      0
    );
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

  const existingPlayerNames = useMemo(
    () =>
      new Set(
        players.map((player) =>
          normalizePlayerName(player.name).toLocaleLowerCase("pt-PT")
        )
      ),
    [players]
  );

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
          newPlayer.shirt_number === ""
            ? null
            : Number(newPlayer.shirt_number),
        position: clean(newPlayer.position),
        phone: clean(newPlayer.phone),
        email: clean(newPlayer.email),
        instagram: clean(newPlayer.instagram),
        notes: clean(newPlayer.notes),
        source: "manual",
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

  async function applyZerozeroPreview(data, url, { fromCache = false } = {}) {
    const rawPlayers = data?.players || [];

    if (rawPlayers.length === 0) {
      throw new Error(
        "A extensão abriu a página, mas não encontrou jogadores no plantel."
      );
    }

    const previewPlayers = rawPlayers.map((player, index) => ({
      ...player,
      importKey: buildImportKey(player, index),
    }));

    const preview = {
      ...data,
      sourceUrl: url,
      players: previewPlayers,
      fromCache,
    };

    setZerozeroPreview(preview);
    setSelectedImportKeys(previewPlayers.map((player) => player.importKey));

    if (fromCache) return;

    const cachePayload = {
      ...data,
      sourceUrl: url,
    };

    const cachedAt = new Date().toISOString();

    const { error: cacheError } = await supabase
      .from("football_teams")
      .update({
        zerozero_cached_preview: cachePayload,
        zerozero_preview_cached_at: cachedAt,
        updated_at: cachedAt,
      })
      .eq("id", teamId);

    if (!cacheError) {
      setTeam((current) =>
        current
          ? {
              ...current,
              zerozero_cached_preview: cachePayload,
              zerozero_preview_cached_at: cachedAt,
            }
          : current
      );
    }
  }

  async function previewZerozero({ force = false } = {}) {
    const url = zerozeroUrl.trim();

    if (!url) {
      setError("Cola primeiro o URL da equipa no ZeroZero.");
      return;
    }

    setError("");
    setZerozeroError("");
    setImportMessage("");
    setZerozeroPreview(null);
    setSelectedImportKeys([]);

    const cached = team?.zerozero_cached_preview;
    const cachedAt = team?.zerozero_preview_cached_at;
    const cacheUrl = cached?.sourceUrl || cached?.source_url || null;
    const cacheAgeMs = cachedAt
      ? Date.now() - new Date(cachedAt).getTime()
      : Number.POSITIVE_INFINITY;
    const cacheFresh = cacheAgeMs < 24 * 60 * 60 * 1000;

    if (!force && cached && cacheUrl === url && cacheFresh) {
      await applyZerozeroPreview(cached, url, { fromCache: true });
      return;
    }

    if (!zerozeroExtensionAvailable) {
      setZerozeroError(
        "A extensão Prisma ZeroZero não foi detetada neste browser. Instala-a uma vez e recarrega esta página."
      );
      return;
    }

    const requestId =
      typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now() + "-" + Math.random().toString(36).slice(2);

    zerozeroRequestRef.current = { requestId, url };
    setPreviewingZerozero(true);

    window.postMessage(
      {
        source: "prisma-workspace",
        type: "PRISMA_ZEROZERO_IMPORT_REQUEST",
        requestId,
        url,
      },
      "*"
    );

    zerozeroTimeoutRef.current = window.setTimeout(() => {
      if (zerozeroRequestRef.current?.requestId !== requestId) return;

      zerozeroRequestRef.current = null;
      setPreviewingZerozero(false);
      setZerozeroError(
        "A extensão demorou demasiado a ler o ZeroZero. Confirma se a página abriu corretamente e tenta novamente."
      );
    }, 18000);
  }

  function toggleImportPlayer(importKey) {
    setSelectedImportKeys((current) =>
      current.includes(importKey)
        ? current.filter((key) => key !== importKey)
        : [...current, importKey]
    );
  }

  function selectAllPreviewPlayers() {
    if (!zerozeroPreview) return;
    setSelectedImportKeys(
      zerozeroPreview.players.map((player) => player.importKey)
    );
  }

  function clearPreviewSelection() {
    setSelectedImportKeys([]);
  }

  async function importZerozeroPlayers() {
    if (!zerozeroPreview || selectedImportKeys.length === 0) return;

    setImportingZerozero(true);
    setError("");
    setImportMessage("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setImportingZerozero(false);
      setError("Não foi possível confirmar a tua sessão.");
      return;
    }

    const selected = zerozeroPreview.players.filter((player) =>
      selectedImportKeys.includes(player.importKey)
    );

    const existingByName = new Map(
      players.map((player) => [
        normalizePlayerName(player.name).toLocaleLowerCase("pt-PT"),
        player,
      ])
    );

    const toInsert = [];
    const toUpdate = [];

    selected.forEach((player) => {
      const key = normalizePlayerName(player.name).toLocaleLowerCase("pt-PT");
      const existing = existingByName.get(key);

      if (existing) {
        toUpdate.push({
          id: existing.id,
          shirt_number: player.shirt_number,
          position: player.position,
          source_url: player.source_url,
        });
        return;
      }

      toInsert.push({
        user_id: userData.user.id,
        team_id: teamId,
        name: normalizePlayerName(player.name),
        shirt_number: player.shirt_number,
        position: clean(player.position),
        phone: null,
        email: null,
        instagram: null,
        notes: null,
        source: "zerozero",
        source_url: clean(player.source_url),
      });
    });

    try {
      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("football_players")
          .insert(toInsert);

        if (insertError) throw insertError;
      }

      if (toUpdate.length > 0) {
        const updateResults = await Promise.all(
          toUpdate.map((player) =>
            supabase
              .from("football_players")
              .update({
                shirt_number: player.shirt_number,
                position: clean(player.position),
                source: "zerozero",
                source_url: clean(player.source_url),
                updated_at: new Date().toISOString(),
              })
              .eq("id", player.id)
          )
        );

        const updateError = updateResults.find((result) => result.error)?.error;
        if (updateError) throw updateError;
      }

      const { error: teamUpdateError } = await supabase
        .from("football_teams")
        .update({
          zerozero_url: zerozeroUrl.trim(),
          zerozero_last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", teamId);

      if (teamUpdateError) throw teamUpdateError;

      const { error: syncLogError } = await supabase
        .from("football_squad_syncs")
        .insert({
          user_id: userData.user.id,
          team_id: teamId,
          source: "zerozero",
          players_added: toInsert.length,
          players_updated: toUpdate.length,
        });

      if (syncLogError) {
        console.warn("Não foi possível registar a sincronização:", syncLogError);
      }

      setImportMessage(
        [
          toInsert.length > 0
            ? toInsert.length +
              (toInsert.length === 1
                ? " jogador adicionado"
                : " jogadores adicionados")
            : null,
          toUpdate.length > 0
            ? toUpdate.length +
              (toUpdate.length === 1
                ? " jogador atualizado"
                : " jogadores atualizados")
            : null,
        ]
          .filter(Boolean)
          .join(" · ") || "Plantel sincronizado."
      );

      setZerozeroPreview(null);
      setSelectedImportKeys([]);
      await loadData();
    } catch (importError) {
      setError(
        importError.message || "Não foi possível importar o plantel do ZeroZero."
      );
    } finally {
      setImportingZerozero(false);
    }
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

      {importMessage && (
        <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {importMessage}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-white/30">
          A carregar equipa...
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-7">
            <Metric label="Trabalhos" value={String(stats.jobs)} />
            <Metric label="Receita" value={money(stats.revenue)} />
            <Metric label="Margem" value={money(stats.margin)} />
            <Metric label="Jogadores" value={String(stats.players)} />
            <Metric
              label="Receita média / trabalho"
              value={money(stats.avgRevenue)}
            />
            <Metric label="Custos diretos" value={money(stats.costs)} />
            <Metric
              label="Presenças de jogadores"
              value={String(stats.appearances)}
            />
            <Metric label="Receita paga" value={money(stats.paidRevenue)} />
          </div>

          <section className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#B89A84]">
                  ZeroZero
                </p>
                <h2 className="font-semibold mt-1">Importar / atualizar plantel</h2>
                <p className="text-xs text-white/30 mt-1">
                  Importamos apenas nome, número e posição. Os teus contactos e notas são preservados.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={
                    zerozeroExtensionAvailable
                      ? "rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[10px] text-emerald-200/70"
                      : "rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-2.5 py-1 text-[10px] text-amber-200/70"
                  }
                >
                  {zerozeroExtensionAvailable
                    ? "Extensão ligada · 0 €/importação"
                    : "Extensão não detetada"}
                </span>

                {team?.zerozero_last_synced_at && (
                  <span className="text-xs text-white/25">
                    Última sincronização:{" "}
                    {formatDateTime(team.zerozero_last_synced_at)}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="grid lg:grid-cols-[1fr_auto] gap-3 items-end">
                <Field label="URL da equipa no ZeroZero">
                  <input
                    type="url"
                    value={zerozeroUrl}
                    onChange={(e) => {
                      setZerozeroUrl(e.target.value);
                      setZerozeroPreview(null);
                      setSelectedImportKeys([]);
                      setImportMessage("");
                      setZerozeroError("");
                    }}
                    placeholder="https://www.zerozero.pt/equipa/..."
                    className={inputClass}
                  />
                </Field>

                <button
                  type="button"
                  onClick={() =>
                    previewZerozero({
                      force:
                        Boolean(team?.zerozero_last_synced_at) &&
                        team?.zerozero_url === zerozeroUrl.trim(),
                    })
                  }
                  disabled={previewingZerozero || !zerozeroUrl.trim()}
                  className="h-[46px] rounded-xl border border-[#B89A84]/30 bg-[#B89A84]/10 px-5 text-sm font-medium text-[#D9C1AF] hover:bg-[#B89A84]/15 disabled:opacity-40 transition"
                >
                  {previewingZerozero
                    ? "A consultar..."
                    : team?.zerozero_last_synced_at &&
                        team?.zerozero_url === zerozeroUrl.trim()
                      ? "Atualizar do ZeroZero"
                      : "Pré-visualizar plantel"}
                </button>
              </div>

              {zerozeroError && (
                <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {zerozeroError}
                </div>
              )}

              {zerozeroPreview && (
                <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/10 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {zerozeroPreview.players.length} jogadores encontrados
                      </p>
                      <p className="text-xs text-white/25 mt-1">
                        {zerozeroPreview.teamName || "Equipa no ZeroZero"}
                        {zerozeroPreview.season
                          ? " · " + zerozeroPreview.season
                          : ""}
                        {zerozeroPreview.fromCache ? " · cache" : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={selectAllPreviewPlayers}
                        className="text-xs text-white/40 hover:text-white transition"
                      >
                        Selecionar todos
                      </button>
                      <button
                        type="button"
                        onClick={clearPreviewSelection}
                        className="text-xs text-white/40 hover:text-white transition"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {zerozeroPreview.players.map((player) => {
                      const alreadyExists = existingPlayerNames.has(
                        normalizePlayerName(player.name).toLocaleLowerCase(
                          "pt-PT"
                        )
                      );

                      return (
                        <label
                          key={player.importKey}
                          className="grid grid-cols-[24px_60px_1fr_150px_auto] gap-3 items-center px-4 py-3 border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.025] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedImportKeys.includes(
                              player.importKey
                            )}
                            onChange={() =>
                              toggleImportPlayer(player.importKey)
                            }
                            className="accent-[#B89A84]"
                          />
                          <span className="text-xs text-white/35">
                            {player.shirt_number ?? "—"}
                          </span>
                          <span className="text-sm text-white/70">
                            {player.name}
                          </span>
                          <span className="text-xs text-white/35">
                            {player.position || "—"}
                          </span>
                          <span
                            className={
                              alreadyExists
                                ? "rounded-full border border-blue-300/15 bg-blue-300/[0.05] px-2 py-1 text-[10px] text-blue-200/60"
                                : "rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-2 py-1 text-[10px] text-emerald-200/60"
                            }
                          >
                            {alreadyExists ? "Atualizar" : "Novo"}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="px-4 py-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs text-white/30">
                      {selectedImportKeys.length} selecionados. Jogadores já existentes mantêm telefone, email, Instagram e notas.
                    </p>
                    <button
                      type="button"
                      onClick={importZerozeroPlayers}
                      disabled={
                        importingZerozero || selectedImportKeys.length === 0
                      }
                      className="rounded-xl bg-[#B89A84] px-5 py-2.5 text-sm font-semibold text-[#151515] hover:brightness-110 disabled:opacity-40 transition"
                    >
                      {importingZerozero
                        ? "A importar..."
                        : "Importar " + selectedImportKeys.length}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-white/20 mt-3">
                A extensão usa o teu próprio Edge/Chrome para ler a página pública do ZeroZero. Não usa Browserless nem consome créditos.
              </p>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
                  Plantel
                </p>
                <h2 className="text-xl font-semibold mt-1">
                  Jogadores & contactos
                </h2>
              </div>
              <span className="text-xs text-white/25">
                {players.length}{" "}
                {players.length === 1 ? "jogador" : "jogadores"}
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
                        onChange={(e) =>
                          updateLocalPlayer(
                            player.id,
                            "shirt_number",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Nome">
                      <input
                        value={player.name}
                        onChange={(e) =>
                          updateLocalPlayer(player.id, "name", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Telemóvel">
                      <input
                        value={player.phone || ""}
                        onChange={(e) =>
                          updateLocalPlayer(player.id, "phone", e.target.value)
                        }
                        placeholder="+351..."
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        type="email"
                        value={player.email || ""}
                        onChange={(e) =>
                          updateLocalPlayer(player.id, "email", e.target.value)
                        }
                        placeholder="email@..."
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Instagram">
                      <input
                        value={player.instagram || ""}
                        onChange={(e) =>
                          updateLocalPlayer(
                            player.id,
                            "instagram",
                            e.target.value
                          )
                        }
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
                        onChange={(e) =>
                          updateLocalPlayer(
                            player.id,
                            "position",
                            e.target.value
                          )
                        }
                        placeholder="Ex.: Extremo"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Notas">
                      <input
                        value={player.notes || ""}
                        onChange={(e) =>
                          updateLocalPlayer(player.id, "notes", e.target.value)
                        }
                        placeholder="Informação útil sobre o jogador..."
                        className={inputClass}
                      />
                    </Field>
                    <div className="flex items-center justify-end gap-4 h-[46px]">
                      {player.source === "zerozero" && (
                        <span className="rounded-full border border-white/[0.08] px-2 py-1 text-[10px] text-white/30">
                          ZeroZero
                        </span>
                      )}
                      {player.source_url && (
                        <a
                          href={player.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#B89A84] hover:text-white transition"
                        >
                          Perfil ↗
                        </a>
                      )}
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
                  Ainda não existem jogadores nesta equipa. Podes importá-los do ZeroZero ou adicioná-los manualmente.
                </div>
              )}
            </div>

            <form
              onSubmit={addPlayer}
              className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-4"
            >
              <p className="text-sm font-medium mb-4">
                Adicionar jogador ao plantel
              </p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-[1.2fr_90px_140px_1fr_1fr_auto] gap-3 items-end">
                <Field label="Nome">
                  <input
                    value={newPlayer.name}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, name: e.target.value })
                    }
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
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        shirt_number: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Posição">
                  <input
                    value={newPlayer.position}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, position: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Telemóvel">
                  <input
                    value={newPlayer.phone}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, phone: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Instagram">
                  <input
                    value={newPlayer.instagram}
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        instagram: e.target.value,
                      })
                    }
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
              <h2 className="text-xl font-semibold mt-1">
                Trabalhos da equipa
              </h2>
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
                    <span className="text-xs text-white/35">
                      {formatDate(job.job_date)}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-white/25 mt-1">
                        {paymentLabel(job.payment_status)}
                      </p>
                    </div>
                    <span className="text-sm text-white/45">
                      custos {money(job.costs)}
                    </span>
                    <span className="text-sm font-medium">
                      {money(job.revenue)}
                    </span>
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

function buildImportKey(player, index) {
  return [
    normalizePlayerName(player.name).toLocaleLowerCase("pt-PT"),
    player.shirt_number ?? "x",
    index,
  ].join("::");
}

function normalizePlayerName(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
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

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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
