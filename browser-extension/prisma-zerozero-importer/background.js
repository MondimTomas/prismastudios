const REQUEST_PREFIX = "prisma_zerozero_request_";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "OPEN_ZEROZERO_IMPORT") {
    openZeroZeroImport(message, sender)
      .then(() => sendResponse({ ok: true }))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "Não foi possível abrir o ZeroZero.",
        })
      );
    return true;
  }

  if (message?.type === "ZEROZERO_SQUAD_RESULT") {
    forwardResult(message).catch(() => {});
  }

  if (message?.type === "ZEROZERO_SQUAD_ERROR") {
    forwardError(message).catch(() => {});
  }

  return false;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== "complete") return;
  triggerImportForTab(tabId).catch(() => {});
});

chrome.tabs.onRemoved.addListener((tabId) => {
  cleanupClosedImportTab(tabId).catch(() => {});
});

async function openZeroZeroImport(message, sender) {
  const originTabId = sender.tab?.id;
  const requestId = String(message.requestId || "");
  const url = String(message.url || "");

  if (!originTabId || !requestId || !isAllowedZeroZeroUrl(url)) {
    throw new Error("Pedido de importação inválido.");
  }

  const tab = await chrome.tabs.create({
    url,
    active: false,
  });

  if (!tab.id) {
    throw new Error("Não foi possível abrir o separador do ZeroZero.");
  }

  await chrome.storage.session.set({
    [REQUEST_PREFIX + requestId]: {
      requestId,
      originTabId,
      zerozeroTabId: tab.id,
      url,
      createdAt: Date.now(),
    },
  });
}

async function triggerImportForTab(tabId) {
  const entries = await chrome.storage.session.get(null);
  const request = Object.values(entries).find(
    (value) => value?.zerozeroTabId === tabId
  );

  if (!request) return;

  const message = {
    type: "RUN_ZEROZERO_IMPORT",
    requestId: request.requestId,
  };

  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch {
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, message).catch(() => {
        forwardError({
          requestId: request.requestId,
          error:
            "A extensão abriu o ZeroZero, mas não conseguiu iniciar a leitura da página.",
        }).catch(() => {});
      });
    }, 700);
  }
}

async function forwardResult(message) {
  const key = REQUEST_PREFIX + message.requestId;
  const stored = await chrome.storage.session.get(key);
  const request = stored[key];

  if (!request) return;

  await chrome.tabs.sendMessage(request.originTabId, {
    type: "PRISMA_ZEROZERO_IMPORT_RESULT",
    requestId: message.requestId,
    data: message.data,
  });

  await finishRequest(key, request.zerozeroTabId);
}

async function forwardError(message) {
  const key = REQUEST_PREFIX + message.requestId;
  const stored = await chrome.storage.session.get(key);
  const request = stored[key];

  if (!request) return;

  await chrome.tabs.sendMessage(request.originTabId, {
    type: "PRISMA_ZEROZERO_IMPORT_ERROR",
    requestId: message.requestId,
    error: message.error || "Não foi possível ler o plantel.",
  });

  await finishRequest(key, request.zerozeroTabId);
}

async function finishRequest(key, tabId) {
  await chrome.storage.session.remove(key);

  if (tabId) {
    try {
      await chrome.tabs.remove(tabId);
    } catch {
      // The user may already have closed the tab.
    }
  }
}

async function cleanupClosedImportTab(tabId) {
  const entries = await chrome.storage.session.get(null);

  for (const [key, request] of Object.entries(entries)) {
    if (!key.startsWith(REQUEST_PREFIX) || request?.zerozeroTabId !== tabId) {
      continue;
    }

    try {
      await chrome.tabs.sendMessage(request.originTabId, {
        type: "PRISMA_ZEROZERO_IMPORT_ERROR",
        requestId: request.requestId,
        error: "O separador do ZeroZero foi fechado antes de terminar a importação.",
      });
    } catch {
      // Origin page may also be gone.
    }

    await chrome.storage.session.remove(key);
  }
}

function isAllowedZeroZeroUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return (
      url.protocol === "https:" &&
      ["zerozero.pt", "www.zerozero.pt"].includes(url.hostname) &&
      url.pathname.startsWith("/equipa/")
    );
  } catch {
    return false;
  }
}
