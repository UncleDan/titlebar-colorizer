// theme-core.js by Daniele Lolli (UncleDan) feat. Claude AI - Release 2.0b1 - 2026-10-05 17-03-03
// Logica condivisa (background + pagina opzioni): calcolo contrasto e palette completa del tema.
"use strict";

const TC_DEFAULTS = {
    savedColor: "#ffffff",
    schemeMode: "auto" // "auto" | "light" | "dark"
};

function tcNormalizeHex(value) {
    if (typeof value !== "string") return null;
    let v = value.trim();
    if (!v.startsWith("#")) v = "#" + v;
    if (/^#[0-9a-f]{3}$/i.test(v)) {
        v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    }
    return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : null;
}

function tcHexToRgb(hex) {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16)
    ];
}

function tcRgbToHex(rgb) {
    return "#" + rgb.map(x => {
        const n = Math.max(0, Math.min(255, Math.round(Number(x) || 0)));
        return n.toString(16).padStart(2, "0");
    }).join("");
}

// Luminanza relativa WCAG 2.x
function tcLuminance(hex) {
    const [r, g, b] = tcHexToRgb(hex).map(c => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function tcContrastRatio(a, b) {
    const la = tcLuminance(a), lb = tcLuminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// true se sul colore di base rende meglio il testo bianco (base scura)
function tcIsDark(hex) {
    return tcContrastRatio(hex, "#ffffff") >= tcContrastRatio(hex, "#000000");
}

// Compatibilità con le versioni precedenti: restituisce solo il colore del testo
function getContrastColor(hex) {
    return tcIsDark(hex) ? "#ffffff" : "#000000";
}

// Miscela a -> b con peso t (0 = a, 1 = b)
function tcMix(a, b, t) {
    const ca = tcHexToRgb(a), cb = tcHexToRgb(b);
    return tcRgbToHex(ca.map((v, i) => v + (cb[i] - v) * t));
}

/**
 * Costruisce un tema completo a partire dal colore di base.
 * Impostare TUTTE le superfici (toolbar, campi, popup, sidebar) e dichiarare
 * esplicitamente color_scheme evita che Thunderbird/Firefox mescolino la barra
 * scura con le superfici chiare di default (testo bianco su bianco).
 */
function tcBuildTheme(baseHex, schemeMode) {
    const base = tcNormalizeHex(baseHex) || TC_DEFAULTS.savedColor;
    let dark;
    if (schemeMode === "dark") dark = true;
    else if (schemeMode === "light") dark = false;
    else dark = tcIsDark(base);

    const fg = dark ? "#ffffff" : "#000000";
    const ink = dark ? "#000000" : "#ffffff"; // direzione "profondità"

    // Superfici: in modalità scura si scurisce verso il nero, in chiara si schiarisce verso il bianco
    const toolbar = tcMix(base, ink, 0.10);
    const field = dark ? tcMix(base, "#000000", 0.30) : tcMix(base, "#ffffff", 0.75);
    const fieldFocus = dark ? tcMix(base, "#000000", 0.45) : "#ffffff";
    const popup = dark ? tcMix(base, "#000000", 0.40) : tcMix(base, "#ffffff", 0.88);
    const sidebar = dark ? tcMix(base, "#000000", 0.30) : tcMix(base, "#ffffff", 0.85);
    const highlight = tcMix(dark ? tcMix(base, "#000000", 0.30) : tcMix(base, "#ffffff", 0.85), fg, 0.18);
    const border = tcMix(base, fg, 0.25);
    const separator = tcMix(base, fg, 0.18);
    const accent = tcMix(fg, base, 0.25);

    return {
        colors: {
            frame: base,
            frame_inactive: tcMix(base, ink, 0.06),
            tab_background_text: fg,
            tab_selected: toolbar,
            tab_text: fg,
            tab_line: accent,
            tab_loading: accent,

            toolbar: toolbar,
            toolbar_text: fg,
            bookmark_text: fg,
            icons: fg,
            icons_attention: accent,
            toolbar_top_separator: separator,
            toolbar_bottom_separator: separator,
            toolbar_vertical_separator: separator,

            toolbar_field: field,
            toolbar_field_text: fg,
            toolbar_field_border: border,
            toolbar_field_focus: fieldFocus,
            toolbar_field_text_focus: fg,
            toolbar_field_border_focus: accent,
            toolbar_field_highlight: highlight,
            toolbar_field_highlight_text: fg,

            popup: popup,
            popup_text: fg,
            popup_border: border,
            popup_highlight: highlight,
            popup_highlight_text: fg,

            sidebar: sidebar,
            sidebar_text: fg,
            sidebar_border: border,
            sidebar_highlight: highlight,
            sidebar_highlight_text: fg
        },
        properties: {
            // Dice esplicitamente a Thunderbird/Firefox se l'interfaccia è chiara o scura
            color_scheme: dark ? "dark" : "light",
            // Il contenuto (messaggi, pagine) segue il sistema operativo
            content_color_scheme: "system"
        }
    };
}

async function tcLoadSettings() {
    const res = await browser.storage.local.get(["savedColor", "schemeMode"]);
    return {
        savedColor: tcNormalizeHex(res.savedColor) || null,
        schemeMode: ["auto", "light", "dark"].includes(res.schemeMode) ? res.schemeMode : TC_DEFAULTS.schemeMode
    };
}

async function tcApplyStoredTheme() {
    const s = await tcLoadSettings();
    if (!s.savedColor) {
        // Nessun colore salvato: lascia il tema dell'utente
        return;
    }
    try {
        await browser.theme.update(tcBuildTheme(s.savedColor, s.schemeMode));
    } catch (e) {
        console.error("Titlebar Colorizer: theme.update fallito", e);
    }
}
