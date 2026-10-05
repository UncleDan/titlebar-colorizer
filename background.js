// background.js by Daniele Lolli (UncleDan) feat. Claude AI - Release 2.0.2 - 2026-10-05 17-53-23
"use strict";

// Listener registrati a livello top: con la background "event page" (non persistente)
// servono perché Thunderbird/Firefox riavviino lo script all'avvio e all'aggiornamento.
browser.runtime.onStartup.addListener(() => { tcApplyStoredTheme(); });
browser.runtime.onInstalled.addListener(() => { tcApplyStoredTheme(); });

// La pagina opzioni salva soltanto: il tema lo applica sempre il background
browser.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if ("savedColor" in changes || "schemeMode" in changes || "contrastLevel" in changes) {
        if ("savedColor" in changes && !changes.savedColor.newValue) {
            browser.theme.reset();
        } else {
            tcApplyStoredTheme();
        }
    }
});

// Clic sull'icona in barra: apre le opzioni
browser.action.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

// Applica anche al semplice caricamento dello script
tcApplyStoredTheme();
