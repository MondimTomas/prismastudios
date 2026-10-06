const PAGE_SOURCE = "prisma-workspace";
const EXTENSION_SOURCE = "prisma-zerozero-extension";

announceReady();

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const message = event.data;

  if (message?.source !== PAGE_SOURCE) return;

  if (message.type === "PING_ZEROZERO_EXTENSION") {
    announceReady();
    return;
  }

  if (message.type !== "PRISMA_ZEROZERO_IMPORT_REQUEST") return;

  chrome.runtime.sendMessage(
    {
      type: "OPEN_ZEROZERO_IMPORT",
      requestId: message.requestId,
      url: message.url,
    },
    (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        window.postMessage(
          {
            source: EXTENSION_SOURCE,
            type: "PRISMA_ZEROZERO_IMPORT_ERROR",
            requestId: message.requestId,
            error:
              response?.error ||
              chrome.runtime.lastError?.message ||
              "Não foi possível comunicar com a extensão.",
          },
          "*"
        );
      }
    }
  );
});

chrome.runtime.onMessage.addListener((message) => {
  if (
    message?.type !== "PRISMA_ZEROZERO_IMPORT_RESULT" &&
    message?.type !== "PRISMA_ZEROZERO_IMPORT_ERROR"
  ) {
    return;
  }

  window.postMessage(
    {
      source: EXTENSION_SOURCE,
      ...message,
    },
    "*"
  );
});

function announceReady() {
  window.postMessage(
    {
      source: EXTENSION_SOURCE,
      type: "ZEROZERO_EXTENSION_READY",
      version: chrome.runtime.getManifest().version,
    },
    "*"
  );
}
