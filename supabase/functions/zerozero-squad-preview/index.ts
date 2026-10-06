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
    const parsed = parseSquad(fetched.body, url.toString());

    console.log(
      JSON.stringify({
        event: "zerozero_preview",
        fetch_source: fetched.source,
        direct_status: fetched.directStatus,
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
  const direct = await fetchDirectZeroZero(initialUrl);

  if (direct.ok && direct.body && !looksLikeBotProtection(direct.body)) {
    return {
      body: direct.body,
      source: "zerozero-direct",
      directStatus: direct.status,
    };
  }

  const reader = await fetchWithJinaReader(initialUrl);

  if (!reader.ok || !reader.body) {
    throw new Error(
      "O ZeroZero bloqueou o acesso automático e o método alternativo também não conseguiu ler a página."
    );
  }

  return {
    body: reader.body,
    source: "jina-reader",
    directStatus: direct.status,
  };
}

async function fetchDirectZeroZero(initialUrl: URL) {
  let current = initialUrl;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(12000),
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
      validateZeroZeroUrl(next.toString());
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
      signal: AbortSignal.timeout(25000),
      headers: {
        Accept: "text/plain",
        "X-Engine": "browser",
        "X-Timeout": "20",
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

function looksLikeBotProtection(body: string) {
  return /cf-chl|cloudflare|just a moment|enable javascript and cookies|attention required/i.test(
    body.slice(0, 120000),
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
