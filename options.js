// options.js by Daniele Lolli (UncleDan) feat. Claude AI - Release 2.0.2 - 2026-10-05 17-53-23
"use strict";

const colorPicker = document.getElementById("colorPicker");
const hexInput = document.getElementById("hexInput");
const rgbInput = document.getElementById("rgbInput");
const schemeSelect = document.getElementById("schemeMode");
const contrastSelect = document.getElementById("contrastLevel");
const pvButton = document.getElementById("pvButton");
const resetBtn = document.getElementById("resetBtn");
const pvFrame = document.getElementById("pvFrame");
const pvToolbar = document.getElementById("pvToolbar");
const pvField = document.getElementById("pvField");
const pvSidebar = document.getElementById("pvSidebar");
const pvInfo = document.getElementById("pvInfo");

let currentHex = TC_DEFAULTS.savedColor;
let saveTimer = null;

function renderPreview(hex) {
    const theme = tcBuildTheme(hex, schemeSelect.value, contrastSelect.value);
    const t = theme.colors, m = theme.meta;
    pvFrame.style.backgroundColor = t.frame;
    pvFrame.style.color = t.tab_background_text;
    pvToolbar.style.backgroundColor = t.toolbar;
    pvToolbar.style.color = t.toolbar_text;
    pvField.style.backgroundColor = t.toolbar_field;
    pvField.style.color = t.toolbar_field_text;
    pvField.style.borderColor = t.toolbar_field_border;
    pvButton.style.backgroundColor = m.button;
    pvButton.style.color = t.toolbar_text;
    pvButton.style.borderColor = t.toolbar_field_border;
    pvSidebar.style.backgroundColor = t.sidebar;
    pvSidebar.style.color = t.sidebar_text;

    // Contrasto minimo fra tutte le coppie testo/sfondo del tema
    const fg = t.tab_background_text;
    const worst = Math.min(...[t.frame, t.toolbar, t.toolbar_field, t.toolbar_field_focus, t.popup,
        t.sidebar, t.sidebar_highlight, m.button, t.button_background_hover, t.button_background_active]
        .map(bg => tcContrastRatio(bg, fg)));
    const level = worst >= 7 ? "AAA" : worst >= 4.5 ? "AA" : worst >= 3 ? "AA solo testo grande" : "insufficiente";
    let info = `Schema ${m.dark ? "scuro" : "chiaro"} · contrasto minimo ${worst.toFixed(1)}:1 (${level})`;
    if (m.adjusted) info += ` · colore applicato ${m.applied} (scelto ${m.chosen}, adattato per il contrasto)`;
    pvInfo.textContent = info;
}

function updateAll(hex, source) {
    hex = tcNormalizeHex(hex);
    if (!hex) return;
    currentHex = hex;

    if (source !== "picker") colorPicker.value = hex;
    if (source !== "hex") hexInput.value = hex;
    if (source !== "rgb") rgbInput.value = tcHexToRgb(hex).join(", ");

    renderPreview(hex);

    // Il color picker emette molti eventi: salvataggio con piccolo ritardo
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        browser.storage.local.set({ savedColor: hex, schemeMode: schemeSelect.value, contrastLevel: contrastSelect.value });
    }, source === "picker" ? 120 : 0);
}

colorPicker.addEventListener("input", e => updateAll(e.target.value, "picker"));

hexInput.addEventListener("change", e => updateAll(e.target.value, "hex"));

rgbInput.addEventListener("change", e => {
    const parts = e.target.value.split(",").map(p => p.trim());
    if (parts.length === 3 && parts.every(p => /^\d{1,3}$/.test(p))) {
        updateAll(tcRgbToHex(parts), "rgb");
    }
});

schemeSelect.addEventListener("change", () => updateAll(currentHex, "scheme"));
contrastSelect.addEventListener("change", () => updateAll(currentHex, "contrast"));

resetBtn.addEventListener("click", async () => {
    clearTimeout(saveTimer);
    await browser.storage.local.remove(["savedColor", "schemeMode", "contrastLevel"]);
    await browser.theme.reset();
    schemeSelect.value = TC_DEFAULTS.schemeMode;
    contrastSelect.value = TC_DEFAULTS.contrastLevel;
    currentHex = TC_DEFAULTS.savedColor;
    colorPicker.value = currentHex;
    hexInput.value = "";
    rgbInput.value = "";
    renderPreview(currentHex);
    pvInfo.textContent = "Tema originale ripristinato.";
});

// Caricamento iniziale (non salva nulla finché l'utente non cambia qualcosa)
tcLoadSettings().then(s => {
    schemeSelect.value = s.schemeMode;
    contrastSelect.value = s.contrastLevel;
    currentHex = s.savedColor || TC_DEFAULTS.savedColor;
    colorPicker.value = currentHex;
    hexInput.value = s.savedColor || "";
    rgbInput.value = s.savedColor ? tcHexToRgb(currentHex).join(", ") : "";
    renderPreview(currentHex);
});
