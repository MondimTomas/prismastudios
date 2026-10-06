chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "RUN_ZEROZERO_IMPORT") return;

  runImport(message.requestId).catch((error) => {
    chrome.runtime.sendMessage({
      type: "ZEROZERO_SQUAD_ERROR",
      requestId: message.requestId,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível interpretar o plantel do ZeroZero.",
    });
  });
});

async function runImport(requestId) {
  await waitForSquad();

  const data = extractSquad();

  if (!data.players.length) {
    throw new Error(
      "A página abriu, mas a extensão não encontrou jogadores na secção Plantel."
    );
  }

  await chrome.runtime.sendMessage({
    type: "ZEROZERO_SQUAD_RESULT",
    requestId,
    data,
  });
}

async function waitForSquad() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 10000) {
    const anchors = document.querySelectorAll('a[href*="/jogador/"]');
    const pageText = document.body?.innerText || "";

    if (anchors.length >= 5 && /plantel/i.test(pageText)) {
      await sleep(350);
      return;
    }

    await sleep(300);
  }
}

function extractSquad() {
  const sourceUrl = location.href;
  const squadRoot = findSquadRoot();
  const anchors = Array.from(
    (squadRoot || document).querySelectorAll('a[href*="/jogador/"]')
  );

  const playersByUrl = new Map();

  for (const anchor of anchors) {
    const name = normalizeName(anchor.textContent || "");
    const href = canonicalPlayerUrl(anchor.href);

    if (!href || !isLikelyPlayerName(name)) continue;

    const metadata = inferMetadata(anchor, squadRoot);

    const current = playersByUrl.get(href);
    const player = {
      name,
      shirt_number: metadata.shirt_number,
      position: metadata.position,
      source_url: href,
    };

    if (!current) {
      playersByUrl.set(href, player);
      continue;
    }

    if (current.shirt_number == null && player.shirt_number != null) {
      current.shirt_number = player.shirt_number;
    }

    if (!current.position && player.position) {
      current.position = player.position;
    }
  }

  let players = Array.from(playersByUrl.values());

  if (players.length > 45 && squadRoot) {
    players = players.slice(0, 45);
  }

  return {
    source: "zerozero-local-extension",
    sourceUrl,
    teamName: extractTeamName(),
    season: extractSeason(),
    players,
    parserVersion: "extension-1",
  };
}

function findSquadRoot() {
  const textCandidates = Array.from(
    document.querySelectorAll("h1,h2,h3,h4,h5,strong,b,div,span,p")
  ).filter((element) => {
    const text = normalizeText(element.textContent || "");
    return (
      /^plantel(?:\b|\s|\()/i.test(text) ||
      /^(plantel|equipa)\s+\d{4}\/\d{2}$/i.test(text)
    );
  });

  const rootCandidates = [];

  for (const element of textCandidates) {
    let current = element;

    for (let depth = 0; current && depth < 7; depth += 1) {
      const count = uniquePlayerLinks(current).length;

      if (count >= 5 && count <= 45) {
        rootCandidates.push({
          element: current,
          count,
          area: approximateArea(current),
        });
      }

      current = current.parentElement;
    }
  }

  if (rootCandidates.length) {
    rootCandidates.sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return a.area - b.area;
    });

    return rootCandidates[0].element;
  }

  return findDensePlayerContainer();
}

function findDensePlayerContainer() {
  const playerAnchors = Array.from(
    document.querySelectorAll('a[href*="/jogador/"]')
  );

  const candidateMap = new Map();

  for (const anchor of playerAnchors) {
    let current = anchor.parentElement;

    for (let depth = 0; current && depth < 6; depth += 1) {
      const currentCount = candidateMap.get(current) || 0;
      candidateMap.set(current, currentCount + 1);
      current = current.parentElement;
    }
  }

  const candidates = Array.from(candidateMap.entries())
    .map(([element]) => ({
      element,
      count: uniquePlayerLinks(element).length,
      area: approximateArea(element),
    }))
    .filter((candidate) => candidate.count >= 5 && candidate.count <= 45)
    .sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return a.area - b.area;
    });

  return candidates[0]?.element || null;
}

function inferMetadata(anchor, squadRoot) {
  const container = findPlayerContainer(anchor);
  const text = normalizeText(container?.innerText || anchor.parentElement?.innerText || "");
  const position =
    extractPosition(text) ||
    findNearestPositionHeading(container || anchor, squadRoot);
  const shirtNumber = extractShirtNumber(text, anchor.textContent || "");

  return {
    shirt_number: shirtNumber,
    position,
  };
}

function findPlayerContainer(anchor) {
  const semantic = anchor.closest(
    "tr,li,article,[class*='player'],[class*='jogador'],[class*='squad'],[class*='plantel']"
  );

  if (semantic) return semantic;

  let current = anchor.parentElement;

  for (let depth = 0; current && depth < 5; depth += 1) {
    const text = normalizeText(current.innerText || "");

    if (text.length >= 3 && text.length <= 280) {
      return current;
    }

    current = current.parentElement;
  }

  return anchor.parentElement;
}

function findNearestPositionHeading(start, root) {
  let current = start;

  while (current && current !== root?.parentElement) {
    let sibling = current.previousElementSibling;

    for (let steps = 0; sibling && steps < 6; steps += 1) {
      const position = extractPosition(sibling.textContent || "");
      if (position) return position;
      sibling = sibling.previousElementSibling;
    }

    current = current.parentElement;
  }

  return null;
}

function extractPosition(text) {
  const normalized = normalizeText(text).toLocaleLowerCase("pt-PT");

  const positions = [
    ["guarda-redes", "Guarda-Redes"],
    ["guarda redes", "Guarda-Redes"],
    ["goalkeeper", "Guarda-Redes"],
    ["defesa", "Defesa"],
    ["defender", "Defesa"],
    ["médio", "Médio"],
    ["medio", "Médio"],
    ["midfielder", "Médio"],
    ["avançado", "Avançado"],
    ["avancado", "Avançado"],
    ["forward", "Avançado"],
    ["central", "Central"],
    ["lateral", "Lateral"],
    ["ala", "Ala"],
    ["pivot", "Pivot"],
    ["pivô", "Pivot"],
  ];

  for (const [needle, label] of positions) {
    if (normalized.includes(needle)) return label;
  }

  return null;
}

function extractShirtNumber(text, playerName) {
  const withoutName = normalizeText(text).replace(
    normalizeText(playerName),
    " "
  );

  const cleaned = withoutName
    .replace(/\b\d{1,2}\s*anos?\b/gi, " ")
    .replace(/\b\d{1,3}\s*(?:cm|kg)\b/gi, " ")
    .replace(/\b20\d{2}\b/g, " ")
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, " ");

  const hashMatch = cleaned.match(/#\s*(\d{1,2})\b/);
  if (hashMatch) return Number(hashMatch[1]);

  const lineMatch = cleaned
    .split(/\n|\||·/)
    .map((part) => normalizeText(part))
    .find((part) => /^\d{1,2}$/.test(part));

  if (lineMatch) return Number(lineMatch);

  const leadingMatch = cleaned.match(/^\s*(\d{1,2})\b/);
  if (leadingMatch) return Number(leadingMatch[1]);

  return null;
}

function extractTeamName() {
  const h1 = document.querySelector("h1");
  const text = normalizeText(h1?.textContent || "");

  if (text) return text.replace(/\s+-\s+.*$/, "").trim();

  return normalizeText(document.title)
    .replace(/\s+-\s+(Portugal|Jogos|Classificações|Plantel).*$/i, "")
    .trim();
}

function extractSeason() {
  const text = document.body?.innerText || "";
  const match = text.match(/\b(20\d{2}\/\d{2})\b/);
  return match ? match[1] : null;
}

function uniquePlayerLinks(root) {
  const hrefs = new Set();

  for (const anchor of root.querySelectorAll('a[href*="/jogador/"]')) {
    const href = canonicalPlayerUrl(anchor.href);
    if (href) hrefs.add(href);
  }

  return Array.from(hrefs);
}

function canonicalPlayerUrl(rawUrl) {
  try {
    const url = new URL(rawUrl, location.href);

    if (!["zerozero.pt", "www.zerozero.pt"].includes(url.hostname)) {
      return null;
    }

    if (!url.pathname.includes("/jogador/")) return null;

    url.hash = "";
    return url.origin + url.pathname + url.search;
  } catch {
    return null;
  }
}

function isLikelyPlayerName(value) {
  if (!value || value.length < 2 || value.length > 80) return false;
  if (!/[A-Za-zÀ-ÿ]/.test(value)) return false;
  if (
    /^(perfil|ver perfil|jogador|estatísticas|estatisticas|plantel|equipa)$/i.test(
      value
    )
  ) {
    return false;
  }
  return true;
}

function normalizeName(value) {
  return normalizeText(value)
    .replace(/^\d{1,2}\s+/, "")
    .replace(/\s+\d{1,2}$/, "")
    .trim();
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function approximateArea(element) {
  const rect = element.getBoundingClientRect();
  return Math.max(1, rect.width * rect.height);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
