// options.js by Daniele Lolli (UncleDan) feat. Claude AI - Release 2.0b2 - 2026-10-05 17-14-34
"use strict";

const colorPicker = document.getElementById("colorPicker");
const hexInput = document.getElementById("hexInput");
const rgbInput = document.getElementById("rgbInput");
const schemeSelect = document.getElementById("schemeMode");
const resetBtn = document.getElementById("resetBtn");
const pvFrame = document.getElementById("pvFrame");
const pvToolbar = document.getElementById("pvToolbar");
const pvField = document.getElementById("pvField");
const pvSidebar = document.getElementById("pvSidebar");
const pvInfo = document.getElementById("pvInfo");

let currentHex = TC_DEFAULTS.savedColor;
let saveTimer = null;

function renderPreview(hex, mode) {
    const t = tcBuildTheme(hex, mode).colors;
    pvFrame.style.backgroundColor = t.frame;
    pvFrame.style.color = t.tab_background_text;
    pvToolbar.style.backgroundColor = t.toolbar;
    pvToolbar.style.color = t.toolbar_text;
    pvField.style.backgroundColor = t.toolbar_field;
    pvField.style.color = t.toolbar_field_text;
    pvField.style.borderColor = t.toolbar_field_border;
    pvSidebar.style.backgroundColor = t.sidebar;
    pvSidebar.style.color = t.sidebar_text;
    const ratio = tcContrastRatio(t.frame, t.tab_background_text).toFixed(1);
    const dark = tcBuildTheme(hex, mode).properties.color_scheme === "dark";
    pvInfo.textContent = `Schema: ${dark ? "scuro" : "chiaro"} · contrasto testo/barra ${ratio}:1`;
}

function updateAll(hex, source) {
    hex = tcNormalizeHex(hex);
    if (!hex) return;
    currentHex = hex;

    if (source !== "picker") colorPicker.value = hex;
    if (source !== "hex") hexInput.value = hex;
    if (source !== "rgb") rgbInput.value = tcHexToRgb(hex).join(", ");

    renderPreview(hex, schemeSelect.value);

    // Il color picker emette molti eventi: salvataggio con piccolo ritardo
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        browser.storage.local.set({ savedColor: hex, schemeMode: schemeSelect.value });
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

resetBtn.addEventListener("click", async () => {
    clearTimeout(saveTimer);
    await browser.storage.local.remove(["savedColor", "schemeMode"]);
    await browser.theme.reset();
    schemeSelect.value = TC_DEFAULTS.schemeMode;
    currentHex = TC_DEFAULTS.savedColor;
    colorPicker.value = currentHex;
    hexInput.value = "";
    rgbInput.value = "";
    renderPreview(currentHex, schemeSelect.value);
    pvInfo.textContent = "Tema originale ripristinato.";
});

// Caricamento iniziale (non salva nulla finché l'utente non cambia qualcosa)
tcLoadSettings().then(s => {
    schemeSelect.value = s.schemeMode;
    currentHex = s.savedColor || TC_DEFAULTS.savedColor;
    colorPicker.value = currentHex;
    hexInput.value = s.savedColor || "";
    rgbInput.value = s.savedColor ? tcHexToRgb(currentHex).join(", ") : "";
    renderPreview(currentHex, s.schemeMode);
});
