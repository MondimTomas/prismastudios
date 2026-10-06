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
    const response = await fetchZeroZero(url);

    if (!response.ok) {
      return json(
        {
          error:
            response.status === 403
              ? "O ZeroZero bloqueou temporariamente o pedido automático. Tenta novamente mais tarde."
              : "Não foi possível carregar a página do ZeroZero.",
          status: response.status,
        },
        response.status === 403 ? 502 : 400,
      );
    }

    const html = await response.text();

    if (
      /cf-chl|cloudflare|just a moment|enable javascript and cookies/i.test(
        html.slice(0, 100000),
      )
    ) {
      return json(
        {
          error:
            "O ZeroZero devolveu uma página de proteção anti-bot em vez do plantel. Tenta novamente mais tarde.",
        },
        502,
      );
    }

    const parsed = parseSquad(html, url.toString());

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

async function fetchZeroZero(initialUrl: URL) {
  let current = initialUrl;

  for (let attempt = 0; attempt < 3; attempt += 1) {
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
      const length = Number(response.headers.get("content-length") || 0);
      if (length > 3_000_000) {
        throw new Error("A página devolvida pelo ZeroZero é demasiado grande.");
      }
      return response;
    }

    const location = response.headers.get("location");
    if (!location) return response;

    const next = new URL(location, current);
    validateZeroZeroUrl(next.toString());
    current = next;
  }

  throw new Error("O ZeroZero redirecionou o pedido demasiadas vezes.");
}

function parseSquad(html: string, sourceUrl: string) {
  const teamName = extractTeamName(html);
  const playerUrls = extractPlayerUrls(html, sourceUrl);
  const lines = htmlToLines(html);

  const plantelIndex = lines.findIndex((line) =>
    /^plantel(?:\b|\s*\()/i.test(line),
  );

  if (plantelIndex < 0) {
    return {
      source: "zerozero",
      sourceUrl,
      teamName,
      season: null,
      players: [],
      parserVersion: 1,
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

  return {
    source: "zerozero",
    sourceUrl,
    teamName,
    season,
    players,
    parserVersion: 1,
  };
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

function extractTeamName(html: string) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1) return null;

  const text = normalizeWhitespace(decodeEntities(h1[1].replace(/<[^>]+>/g, " ")));
  return text || null;
}

function extractSeason(lines: string[]) {
  for (const line of lines) {
    const match = line.match(/\b(20\d{2}\/\d{2})\b/);
    if (match) return match[1];
  }
  return null;
}

function extractPlayerUrls(html: string, sourceUrl: string) {
  const map = new Map<string, string>();
  const anchorRegex =
    /<a\b[^>]*href=["']([^"']*\/jogador\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const name = normalizeWhitespace(
      decodeEntities(match[2].replace(/<[^>]+>/g, " ")),
    );

    if (!name || name.length > 90) continue;

    try {
      const absolute = new URL(match[1], sourceUrl);
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

  return map;
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
