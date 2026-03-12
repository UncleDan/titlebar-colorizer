// background.js — gestione persistenza e applicazione tema

// Carica e applica il tema salvato all'avvio
browser.runtime.onStartup.addListener(applyStoredTheme);
browser.runtime.onInstalled.addListener(applyStoredTheme);

async function applyStoredTheme() {
  const stored = await browser.storage.local.get("tbcTheme");
  if (stored.tbcTheme) {
    browser.theme.update(stored.tbcTheme);
  }
}

// Ascolta messaggi dal popup
browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "applyTheme") {
    browser.theme.update(msg.theme);
    browser.storage.local.set({ tbcTheme: msg.theme });
  } else if (msg.action === "resetTheme") {
    browser.theme.reset();
    browser.storage.local.remove("tbcTheme");
  }
});
