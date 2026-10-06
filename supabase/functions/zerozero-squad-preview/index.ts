import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const POSITION_ALIASES: Record<string, string> = {
  "guarda redes": "Guarda-Redes",
  "guarda-redes": "Guarda-Redes",
  "guarda redes ": "Guarda-Redes",
  "guarda-redes ": "Guarda-Redes",
  "defesa": "Defesa",
  "defesas": "Defesa",
  "médio": "Médio",
  "medio": "Médio",
  "médios": "Médio",
  "medios": "Médio",
  "avançado": "Avançado",
  "avancado": "Avançado",
  "avançados": "Avançado",
  "avancados": "Avançado",
  "central": "Central",
  "centrais": "Central",
  "lateral": "Lateral",
  "laterais": "Lateral",
  "fixo": "Fixo",
  "fixos": "Fixo",
  "ala": "Ala",
  "alas": "Ala",
  "pivot": "Pivot",
  "pivô": "Pivot",
  "universal": "Universal",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  try {
    requireAuthenticatedUser(req);

    const payload = await req.json().catch(() => ({}));
    const rawUrl = typeof payload?.url === "string" ? payload.url.trim() : "";

    if (!rawUrl) {
      return json({ error: "Indica o URL da equipa no ZeroZero." }, 400);
    }

    const url = validateZeroZeroUrl(rawUrl);
    const fetched = await fetchZeroZeroPage(url);
    const parsed = parseSquad(fetched.body, fetched.pageUrl || url.toString());

    console.log(
      JSON.stringify({
        event: "zerozero_preview",
        fetch_source: fetched.source,
        direct_status: fetched.directStatus,
        page_url: fetched.pageUrl,
        players: parsed.players.length,
        body_length: fetched.body.length,
        has_plantel_word: /plantel/i.test(fetched.body),
        player_link_mentions: (fetched.body.match(/\/jogador\//gi) || []).length,
      }),
    );

    if (parsed.players.length === 0) {
      return json(
        {
          error:
            "Não consegui identificar jogadores nessa página. Confirma que o URL é de uma página de equipa do ZeroZero com a secção Plantel.",
        },
        422,
      );
    }

    return json(parsed, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = message === "Não autenticado." ? 401 : 500;
    return json({ error: message }, status);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function requireAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) throw new Error("Não autenticado.");

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Não autenticado.");

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[1].length / 4) * 4, "=")),
          (char) => char.charCodeAt(0),
        ),
      ),
    );

    if (!payload?.sub || payload?.role !== "authenticated") {
      throw new Error("Não autenticado.");
    }
  } catch {
    throw new Error("Não autenticado.");
  }
}

function validateZeroZeroUrl(raw: string) {
  let url: URL;

  try {
    url = new URL(raw);
  } catch {
    throw new Error("URL do ZeroZero inválido.");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    url.protocol !== "https:" ||
    (hostname !== "zerozero.pt" && hostname !== "www.zerozero.pt")
  ) {
    throw new Error("Usa apenas URLs https://www.zerozero.pt/...");
  }

  if (!url.pathname.startsWith("/equipa/")) {
    throw new Error("O URL deve ser de uma página de equipa do ZeroZero.");
  }

  url.hash = "";
  return url;
}

async function fetchZeroZeroPage(initialUrl: URL) {
  const browserlessToken = Deno.env.get("BROWSERLESS_TOKEN")?.trim();

  if (browserlessToken) {
    const browserless = await fetchWithBrowserless(
      initialUrl,
      browserlessToken,
    );

    if (browserless.ok && looksUsefulZeroZeroBody(browserless.body)) {
      console.log(
        JSON.stringify({
          event: "zerozero_browserless_success",
          mode: browserless.mode,
          status: browserless.status,
          body_length: browserless.body.length,
        }),
      );

      return {
        body: browserless.body,
        source: "browserless:" + browserless.mode,
        directStatus: browserless.status,
        pageUrl: initialUrl.toString(),
      };
    }

    console.log(
      JSON.stringify({
        event: "zerozero_browserless_failed",
        mode: browserless.mode,
        status: browserless.status,
        body_length: browserless.body.length,
        error: browserless.error,
      }),
    );

    throw new Error(
      "O browser agent abriu a página, mas não conseguiu identificar um plantel válido. Consulta os logs do Browserless/Supabase para ver a etapa exata."
    );
  } else {
    console.log(
      JSON.stringify({
        event: "zerozero_browserless_missing_token",
      }),
    );
  }

  const candidates = buildCandidateUrls(initialUrl);
  const attempts: Array<{
    source: string;
    status: number;
    bodyLength: number;
    useful: boolean;
    url: string;
  }> = [];

  for (const candidate of candidates) {
    const direct = await fetchCandidate(candidate.url);
    const usefulDirect = looksUsefulZeroZeroBody(direct.body);

    attempts.push({
      source: candidate.label + ":direct",
      status: direct.status,
      bodyLength: direct.body.length,
      useful: usefulDirect,
      url: candidate.url.toString(),
    });

    if (direct.ok && usefulDirect) {
      console.log(JSON.stringify({ event: "zerozero_fetch_success", attempts }));
      return {
        body: direct.body,
        source: candidate.label + ":direct",
        directStatus: direct.status,
        pageUrl: candidate.url.toString(),
      };
    }
  }

  for (const candidate of candidates) {
    const reader = await fetchWithJinaReader(candidate.url);
    const usefulReader = looksUsefulZeroZeroBody(reader.body);

    attempts.push({
      source: candidate.label + ":reader",
      status: reader.status,
      bodyLength: reader.body.length,
      useful: usefulReader,
      url: candidate.url.toString(),
    });

    if (reader.ok && usefulReader) {
      console.log(JSON.stringify({ event: "zerozero_fetch_success", attempts }));
      return {
        body: reader.body,
        source: candidate.label + ":reader",
        directStatus:
          attempts.find((attempt) => attempt.source === candidate.label + ":direct")
            ?.status ?? 0,
        pageUrl: candidate.url.toString(),
      };
    }
  }

  console.log(
    JSON.stringify({
      event: "zerozero_fetch_failed",
      attempts,
    }),
  );

  if (!browserlessToken) {
    throw new Error(
      "O Browserless ainda não está configurado no Supabase. Confirma o secret BROWSERLESS_TOKEN."
    );
  }

  throw new Error(
    "O Browserless não conseguiu obter um plantel válido desta página. Verifica os créditos/limites da conta Browserless e tenta novamente."
  );
}

async function fetchWithBrowserless(
  targetUrl: URL,
  token: string,
) {
  const base = "https://production-lon.browserless.io";

  console.log(
    JSON.stringify({
      event: "zerozero_stage",
      stage: "browserless_unblock_start",
      target: targetUrl.toString(),
    }),
  );

  const unblockUrl =
    base +
    "/unblock?token=" +
    encodeURIComponent(token) +
    "&proxy=residential&proxyCountry=pt&proxySticky=true&timeout=25000";

  try {
    const startedAt = Date.now();
    const response = await fetch(unblockUrl, {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        url: targetUrl.toString(),
        content: true,
        cookies: false,
        screenshot: false,
        browserWSEndpoint: false,
      }),
    });

    const raw = await response.text();
    let payload: any = null;

    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }

    const html =
      typeof payload?.content === "string"
        ? payload.content
        : "";

    const useful = looksUsefulZeroZeroBody(html);

    console.log(
      JSON.stringify({
        event: "zerozero_stage",
        stage: "browserless_unblock_done",
        status: response.status,
        duration_ms: Date.now() - startedAt,
        body_length: html.length,
        useful,
        title: extractDebugTitle(html),
        has_plantel: /plantel/i.test(html),
        player_links: (html.match(/\/jogador\//gi) || []).length,
        error:
          typeof payload?.message === "string"
            ? payload.message
            : typeof payload?.error === "string"
              ? payload.error
              : "",
      }),
    );

    if (response.ok && html && useful) {
      return {
        ok: true,
        status: response.status,
        body: html,
        mode: "unblock-residential-london",
        error: "",
      };
    }

    console.log(
      JSON.stringify({
        event: "zerozero_stage",
        stage: "browserless_content_start",
      }),
    );

    const contentUrl =
      base +
      "/content?token=" +
      encodeURIComponent(token) +
      "&stealth=true&proxy=residential&proxyCountry=pt&proxySticky=true&timeout=20000";

    const contentStartedAt = Date.now();
    const contentResponse = await fetch(contentUrl, {
      method: "POST",
      signal: AbortSignal.timeout(25000),
      headers: {
        "Content-Type": "application/json",
        Accept: "text/html",
      },
      body: JSON.stringify({
        url: targetUrl.toString(),
      }),
    });

    const contentHtml = await contentResponse.text();
    const contentUseful = looksUsefulZeroZeroBody(contentHtml);

    console.log(
      JSON.stringify({
        event: "zerozero_stage",
        stage: "browserless_content_done",
        status: contentResponse.status,
        duration_ms: Date.now() - contentStartedAt,
        body_length: contentHtml.length,
        useful: contentUseful,
        title: extractDebugTitle(contentHtml),
        has_plantel: /plantel/i.test(contentHtml),
        player_links: (contentHtml.match(/\/jogador\//gi) || []).length,
      }),
    );

    return {
      ok: contentResponse.ok && Boolean(contentHtml),
      status: contentResponse.status,
      body: contentHtml,
      mode: "content-residential-london",
      error: contentResponse.ok
        ? ""
        : contentHtml.slice(0, 250),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Browserless request failed.";

    console.log(
      JSON.stringify({
        event: "zerozero_stage",
        stage: "browserless_exception",
        error: message,
      }),
    );

    return {
      ok: false,
      status: 0,
      body: "",
      mode: "browserless-london",
      error: message,
    };
  }
}

function extractDebugTitle(html: string) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return null;

  return normalizeWhitespace(
    decodeEntities(match[1].replace(/<[^>]+>/g, " ")),
  ).slice(0, 160);
}

function buildCandidateUrls(initialUrl: URL) {
  const candidates: Array<{ label: string; url: URL }> = [];
  const seen = new Set<string>();

  const add = (label: string, url: URL) => {
    const key = url.toString();
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ label, url });
  };

  add("team", new URL(initialUrl.toString()));

  const redirm = new URL(initialUrl.toString());
  redirm.searchParams.set("redirm", "1");
  add("team-redirm", redirm);

  const teamId = extractTeamId(initialUrl);
  const seasonId = initialUrl.searchParams.get("epoca_id");

  if (teamId) {
    const playersActive = new URL(
      "https://www.zerozero.pt/jogadores/futebol/activo"
    );
    playersActive.searchParams.set("current_team_id", teamId);
    if (seasonId) playersActive.searchParams.set("epoca_id", seasonId);
    add("players-active", playersActive);

    const playersAll = new URL("https://www.zerozero.pt/jogadores/futebol/");
    playersAll.searchParams.set("current_team_id", teamId);
    if (seasonId) playersAll.searchParams.set("epoca_id", seasonId);
    add("players", playersAll);

    const teamPlayers = new URL(initialUrl.toString());
    teamPlayers.pathname = teamPlayers.pathname.replace(/\/+$/, "") + "/jogadores";
    add("team-players", teamPlayers);
  }

  for (const baseCandidate of [...candidates]) {
    if (baseCandidate.url.hostname !== "www.zerozero.pt") continue;

    for (const mirrorHost of ["zerozero.football", "zerozero.africa"]) {
      const mirror = new URL(baseCandidate.url.toString());
      mirror.hostname = mirrorHost;
      add(baseCandidate.label + "-" + mirrorHost, mirror);
    }
  }

  return candidates;
}

function extractTeamId(url: URL) {
  const match = url.pathname.match(/\/equipa\/[^/]+\/(\d+)/i);
  return match ? match[1] : null;
}

async function fetchCandidate(targetUrl: URL) {
  let current = new URL(targetUrl.toString());

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.7",
          "Cache-Control": "no-cache",
        },
      });

      if (![301, 302, 303, 307, 308].includes(response.status)) {
        return {
          ok: response.ok,
          status: response.status,
          body: await response.text(),
        };
      }

      const location = response.headers.get("location");
      if (!location) {
        return { ok: false, status: response.status, body: "" };
      }

      const next = new URL(location, current);
      if (!isAllowedZeroZeroHost(next.hostname)) {
        return { ok: false, status: response.status, body: "" };
      }

      current = next;
    } catch {
      return { ok: false, status: 0, body: "" };
    }
  }

  return { ok: false, status: 0, body: "" };
}

async function fetchWithJinaReader(targetUrl: URL) {
  try {
    const readerUrl = "https://r.jina.ai/" + targetUrl.toString();
    const response = await fetch(readerUrl, {
      signal: AbortSignal.timeout(18000),
      headers: {
        Accept: "text/plain",
        "X-Engine": "browser",
        "X-Timeout": "15",
        "X-Locale": "pt-PT",
        "X-No-Cache": "true",
        DNT: "1",
      },
    });

    return {
      ok: response.ok,
      status: response.status,
      body: await response.text(),
    };
  } catch {
    return { ok: false, status: 0, body: "" };
  }
}

function looksUsefulZeroZeroBody(body: string) {
  if (!body || body.length < 1000) return false;

  const title = extractDebugTitle(body) || "";
  const playerLinks = (body.match(/\/jogador\//gi) || []).length;
  const hasPlantel = /plantel/i.test(body);

  // Strong positive signal: this is a real ZeroZero team page with a rendered squad.
  // Do this before generic anti-bot text checks because legitimate page source can
  // contain words such as "forbidden" or "access denied" inside scripts/styles.
  if (
    playerLinks >= 5 &&
    hasPlantel &&
    /zerozero|jogos|classifica[cç][oõ]es|estat[ií]sticas|vit[oó]ria|equipa/i.test(
      title + " " + body.slice(0, 30000),
    )
  ) {
    return true;
  }

  if (looksLikeBotProtection(body)) return false;

  return (
    hasPlantel ||
    playerLinks >= 3 ||
    /guarda[\s-]*redes/i.test(body) ||
    /\bdefesa\b/i.test(body) ||
    /\bm[eé]dio\b/i.test(body) ||
    /\bavan[cç]ado\b/i.test(body)
  );
}

function looksLikeBotProtection(body: string) {
  return /cf-chl|cloudflare|just a moment|enable javascript and cookies|attention required|access denied|forbidden/i.test(
    body.slice(0, 120000),
  );
}

function isAllowedZeroZeroHost(hostname: string) {
  const host = hostname.toLowerCase();
  return (
    host === "zerozero.pt" ||
    host === "www.zerozero.pt" ||
    host === "zerozero.football" ||
    host === "www.zerozero.football" ||
    host === "zerozero.africa" ||
    host === "www.zerozero.africa"
  );
}

function parseSquad(html: string, sourceUrl: string) {
  const teamName = extractTeamNameFromContent(html);
  const playerUrls = extractPlayerUrlsFromContent(html, sourceUrl);
  const lines = contentToLines(html);

  const plantelIndex = lines.findIndex((line) =>
    /^plantel(?:\b|\s*\()/i.test(line),
  );

  if (plantelIndex < 0) {
    const linkedPlayers = extractLinkedPlayersFromContent(
      html,
      sourceUrl,
      lines,
    );

    return {
      source: "zerozero",
      sourceUrl,
      teamName,
      season: extractSeason(lines),
      players: linkedPlayers,
      parserVersion: 2,
    };
  }

  const section = takePlantelSection(lines, plantelIndex + 1);
  const season = extractSeason(lines.slice(Math.max(0, plantelIndex - 6), plantelIndex + 12));

  const players: Array<{
    name: string;
    shirt_number: number | null;
    position: string | null;
    source_url: string | null;
  }> = [];

  let currentPosition: string | null = null;

  for (let i = 0; i < section.length; i += 1) {
    const line = normalizeWhitespace(section[i]);
    const position = normalizePosition(line);

    if (position) {
      currentPosition = position;
      continue;
    }

    if (!currentPosition || !isShirtNumber(line)) continue;

    const number = line === "-" ? null : Number(line);
    const name = findNextPlayerName(section, i + 1);

    if (!name) continue;

    const normalizedName = normalizeName(name);
    const key = normalizedName.toLocaleLowerCase("pt-PT");

    if (
      players.some(
        (player) =>
          player.name.toLocaleLowerCase("pt-PT") === key &&
          player.shirt_number === number,
      )
    ) {
      continue;
    }

    players.push({
      name: normalizedName,
      shirt_number: number,
      position: currentPosition,
      source_url: playerUrls.get(key) || null,
    });
  }

  const fallbackPlayers =
    players.length === 0
      ? extractLinkedPlayersFromContent(html, sourceUrl, lines)
      : [];

  return {
    source: "zerozero",
    sourceUrl,
    teamName,
    season,
    players: players.length > 0 ? players : fallbackPlayers,
    parserVersion: 2,
  };
}

function extractLinkedPlayersFromContent(
  content: string,
  sourceUrl: string,
  lines: string[],
) {
  const found = new Map<
    string,
    {
      name: string;
      shirt_number: number | null;
      position: string | null;
      source_url: string;
    }
  >();

  const add = (rawName: string, rawUrl: string) => {
    const name = normalizeCandidatePlayerName(rawName);
    if (!isLikelyPlayerName(name)) return;

    let absolute: URL;

    try {
      absolute = new URL(rawUrl, sourceUrl);
    } catch {
      return;
    }

    if (
      absolute.hostname !== "zerozero.pt" &&
      absolute.hostname !== "www.zerozero.pt"
    ) {
      return;
    }

    if (!absolute.pathname.startsWith("/jogador/")) return;

    const canonicalUrl =
      absolute.origin + absolute.pathname.replace(/\/+$/, "");
    const metadata = inferPlayerMetadata(lines, name);

    const existing = found.get(canonicalUrl);

    if (!existing) {
      found.set(canonicalUrl, {
        name,
        shirt_number: metadata.shirt_number,
        position: metadata.position,
        source_url: absolute.toString(),
      });
      return;
    }

    if (existing.shirt_number === null && metadata.shirt_number !== null) {
      existing.shirt_number = metadata.shirt_number;
    }

    if (!existing.position && metadata.position) {
      existing.position = metadata.position;
    }
  };

  const markdownRegex =
    /\[([^\]]{2,100})\]\((https?:\/\/(?:www\.)?zerozero\.pt\/jogador\/[^)\s]+)\)/gi;

  let markdownMatch: RegExpExecArray | null;
  while ((markdownMatch = markdownRegex.exec(content)) !== null) {
    add(markdownMatch[1], markdownMatch[2]);
  }

  const htmlRegex =
    /<a\b[^>]*href=["']([^"']*\/jogador\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let htmlMatch: RegExpExecArray | null;
  while ((htmlMatch = htmlRegex.exec(content)) !== null) {
    add(
      decodeEntities(htmlMatch[2].replace(/<[^>]+>/g, " ")),
      htmlMatch[1],
    );
  }

  return Array.from(found.values());
}

function inferPlayerMetadata(lines: string[], playerName: string) {
  const normalizedTarget = normalizeWhitespace(playerName).toLocaleLowerCase("pt-PT");

  for (let i = 0; i < lines.length; i += 1) {
    const line = normalizeWhitespace(lines[i]);
    const normalizedLine = line.toLocaleLowerCase("pt-PT");

    if (!normalizedLine.includes(normalizedTarget)) continue;

    const nearby = lines.slice(Math.max(0, i - 4), Math.min(lines.length, i + 5));
    const position = inferPositionFromLines(nearby);
    const shirtNumber = inferShirtNumberFromLines(nearby, i - Math.max(0, i - 4));

    return {
      shirt_number: shirtNumber,
      position,
    };
  }

  return {
    shirt_number: null,
    position: null,
  };
}

function inferPositionFromLines(lines: string[]) {
  for (const line of lines) {
    const normalized = normalizeWhitespace(line).toLocaleLowerCase("pt-PT");

    for (const [alias, canonical] of Object.entries(POSITION_ALIASES)) {
      const cleanAlias = alias.trim().toLocaleLowerCase("pt-PT");

      if (
        normalized === cleanAlias ||
        normalized.startsWith(cleanAlias + " ") ||
        normalized.endsWith(" " + cleanAlias) ||
        normalized.includes(" " + cleanAlias + " ")
      ) {
        return canonical;
      }
    }
  }

  return null;
}

function inferShirtNumberFromLines(lines: string[], playerOffset: number) {
  const candidates = [
    playerOffset - 1,
    playerOffset - 2,
    playerOffset,
    playerOffset + 1,
  ].filter((index) => index >= 0 && index < lines.length);

  for (const index of candidates) {
    const line = normalizeWhitespace(lines[index]);

    if (/^\d{1,2}$/.test(line)) {
      const number = Number(line);
      if (number >= 0 && number <= 99) return number;
    }

    const tableMatch = line.match(/(?:^|\s|\|)#?(\d{1,2})(?=\s|\||$)/);
    if (tableMatch) {
      const number = Number(tableMatch[1]);
      if (number >= 0 && number <= 99) return number;
    }
  }

  return null;
}

function normalizeCandidatePlayerName(value: string) {
  return normalizeWhitespace(
    decodeEntities(
      String(value || "")
        .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
        .replace(/<[^>]+>/g, " "),
    ),
  )
    .replace(/^\d{1,2}\s+/, "")
    .replace(/\s+\d{1,2}$/, "")
    .replace(/\s+-\s+.*$/, "")
    .trim();
}

function isLikelyPlayerName(value: string) {
  if (!value || value.length < 3 || value.length > 80) return false;
  if (!/[A-Za-zÀ-ÿ]/.test(value)) return false;
  if (/^(ver perfil|perfil|mais|estatísticas|estatisticas|jogador)$/i.test(value)) {
    return false;
  }
  if (/^\d+$/.test(value)) return false;

  return true;
}

function contentToLines(content: string) {
  if (/<(?:html|body|div|section|table|h1|h2)\b/i.test(content)) {
    return htmlToLines(content);
  }

  return markdownToLines(content);
}

function markdownToLines(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) =>
      normalizeWhitespace(
        line
          .replace(/^#{1,6}\s*/, "")
          .replace(/^[-*+]\s+/, "")
          .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
          .replace(/\[([^\]]+)\]\((?:https?:\/\/)?[^)]+\)/g, "$1")
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .replace(/\|/g, " ")
          .replace(/[*_>]/g, " "),
      ),
    )
    .filter(Boolean);
}

function htmlToLines(html: string) {
  const withoutNoise = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const withBreaks = withoutNoise
    .replace(/<(br|hr)\b[^>]*>/gi, "\n")
    .replace(/<\/(div|p|li|tr|td|th|section|article|header|footer|h1|h2|h3|h4|h5|h6|a|span)>/gi, "\n")
    .replace(/<(div|p|li|tr|td|th|section|article|header|footer|h1|h2|h3|h4|h5|h6)\b[^>]*>/gi, "\n");

  const text = decodeEntities(withBreaks.replace(/<[^>]+>/g, " "));

  return text
    .split(/\r?\n/)
    .map(normalizeWhitespace)
    .filter(Boolean);
}

function takePlantelSection(lines: string[], start: number) {
  const stopPatterns = [
    /^\+\s*estat/i,
    /^estatísticas$/i,
    /^estatisticas$/i,
    /^nacionalidades$/i,
    /^médias$/i,
    /^medias$/i,
    /^mais utilizados$/i,
    /^top jogos$/i,
    /^top golos$/i,
    /^classificações$/i,
    /^classificacoes$/i,
    /^todos os jogos$/i,
  ];

  const result: string[] = [];

  for (let i = start; i < lines.length && result.length < 500; i += 1) {
    if (stopPatterns.some((pattern) => pattern.test(lines[i])) && result.length > 2) {
      break;
    }
    result.push(lines[i]);
  }

  return result;
}

function findNextPlayerName(lines: string[], start: number) {
  for (let i = start; i < Math.min(lines.length, start + 5); i += 1) {
    const candidate = normalizeWhitespace(lines[i]);

    if (!candidate) continue;
    if (normalizePosition(candidate)) return null;
    if (isShirtNumber(candidate)) continue;
    if (/^\d{1,2}\s*anos?\b/i.test(candidate)) continue;
    if (/^(valor de mercado|jogadores|média|media)\b/i.test(candidate)) continue;
    if (/^\d+(?:[.,]\d+)?\s*(mil|M)?\s*€$/i.test(candidate)) continue;
    if (/^[A-Z]$/i.test(candidate)) continue;
    if (candidate.length < 3 || candidate.length > 90) continue;
    if (!/[A-Za-zÀ-ÿ]/.test(candidate)) continue;

    return candidate;
  }

  return null;
}

function isShirtNumber(value: string) {
  return value === "-" || /^\d{1,3}$/.test(value);
}

function normalizePosition(value: string) {
  const key = normalizeWhitespace(value)
    .toLocaleLowerCase("pt-PT")
    .replace(/:$/, "");

  return POSITION_ALIASES[key] || null;
}

function extractTeamNameFromContent(content: string) {
  const h1 = content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);

  if (h1) {
    const text = normalizeWhitespace(
      decodeEntities(h1[1].replace(/<[^>]+>/g, " "))
    );
    if (text) return text;
  }

  const markdownHeading = content.match(/^#\s+(.+)$/m);
  if (markdownHeading) {
    const text = normalizeWhitespace(markdownHeading[1]);
    if (text && !/^title:/i.test(text)) return text;
  }

  const titleLine = content.match(/^Title:\s*(.+)$/mi);
  if (titleLine) {
    return normalizeWhitespace(
      titleLine[1].replace(/\s+-\s+.*?(?:Plantel|Jogos|Classificaç).*$/i, "")
    );
  }

  return null;
}

function extractSeason(lines: string[]) {
  for (const line of lines) {
    const match = line.match(/\b(20\d{2}\/\d{2})\b/);
    if (match) return match[1];
  }
  return null;
}

function extractPlayerUrlsFromContent(content: string, sourceUrl: string) {
  const map = new Map<string, string>();

  const htmlAnchorRegex =
    /<a\b[^>]*href=["']([^"']*\/jogador\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let htmlMatch: RegExpExecArray | null;

  while ((htmlMatch = htmlAnchorRegex.exec(content)) !== null) {
    addPlayerUrl(
      map,
      decodeEntities(htmlMatch[2].replace(/<[^>]+>/g, " ")),
      htmlMatch[1],
      sourceUrl,
    );
  }

  const markdownAnchorRegex =
    /\[([^\]]+)\]\((https?:\/\/(?:www\.)?zerozero\.pt\/jogador\/[^)\s]+)\)/gi;

  let markdownMatch: RegExpExecArray | null;

  while ((markdownMatch = markdownAnchorRegex.exec(content)) !== null) {
    addPlayerUrl(map, markdownMatch[1], markdownMatch[2], sourceUrl);
  }

  return map;
}

function addPlayerUrl(
  map: Map<string, string>,
  rawName: string,
  rawUrl: string,
  sourceUrl: string,
) {
  const name = normalizeWhitespace(rawName);
  if (!name || name.length > 90) return;

  try {
    const absolute = new URL(rawUrl, sourceUrl);
    if (
      absolute.hostname === "zerozero.pt" ||
      absolute.hostname === "www.zerozero.pt"
    ) {
      map.set(name.toLocaleLowerCase("pt-PT"), absolute.toString());
    }
  } catch {
    // Ignore malformed player links.
  }
}

function normalizeName(value: string) {
  return normalizeWhitespace(value)
    .replace(/\s+-\s+\d+(?:[.,]\d+)?\s*(?:mil|M)?\s*€.*$/i, "")
    .trim();
}

function normalizeWhitespace(value: string) {
  return String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
    aacute: "á",
    Aacute: "Á",
    eacute: "é",
    Eacute: "É",
    iacute: "í",
    Iacute: "Í",
    oacute: "ó",
    Oacute: "Ó",
    uacute: "ú",
    Uacute: "Ú",
    atilde: "ã",
    Atilde: "Ã",
    otilde: "õ",
    Otilde: "Õ",
    ccedil: "ç",
    Ccedil: "Ç",
    ecirc: "ê",
    Ecirc: "Ê",
    acirc: "â",
    Acirc: "Â",
  };

  return value.replace(
    /&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi,
    (full, entity) => {
      if (entity[0] === "#") {
        const hex = entity[1]?.toLowerCase() === "x";
        const raw = entity.slice(hex ? 2 : 1);
        const code = Number.parseInt(raw, hex ? 16 : 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : full;
      }

      return named[entity] ?? named[entity.toLowerCase()] ?? full;
    },
  );
}
