// theme-core.js by Daniele Lolli (UncleDan) feat. Claude AI - Release 2.0b3 - 2026-10-05 17-26-08
// Logica condivisa (background + pagina opzioni): calcolo contrasto e palette completa del tema.
"use strict";

const TC_DEFAULTS = {
    savedColor: "#ffffff",
    schemeMode: "auto",   // "auto" | "light" | "dark"
    contrastLevel: "aaa"  // "aaa" (7:1) | "aa" (4,5:1) | "off"
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

// Livelli di contrasto WCAG 2.x per il testo normale
const TC_CONTRAST_LEVELS = { aaa: 7, aa: 4.5, off: 0 };

/**
 * Restituisce bg (eventualmente modificato) in modo che il contrasto con fg sia >= min.
 * Il colore di sfondo viene spinto gradualmente lontano dal testo
 * (verso il nero se il testo è bianco, verso il bianco se il testo è nero).
 */
function tcEnsureContrast(bg, fg, min) {
    if (!min || tcContrastRatio(bg, fg) >= min) return bg;
    const away = tcLuminance(fg) > 0.5 ? "#000000" : "#ffffff";
    for (let t = 0.02; t <= 1.0001; t += 0.02) {
        const c = tcMix(bg, away, t);
        if (tcContrastRatio(c, fg) >= min) return c;
    }
    return away;
}

/**
 * Costruisce un tema completo a partire dal colore di base.
 * Impostare TUTTE le superfici (toolbar, campi, popup, sidebar, pulsanti) e dichiarare
 * esplicitamente color_scheme evita che Thunderbird/Firefox mescolino la barra
 * scura con le superfici chiare di default (testo bianco su bianco).
 * Con contrastLevel "aaa" (predefinito) ogni coppia testo/sfondo raggiunge 7:1 (WCAG AAA),
 * con "aa" 4,5:1; se serve, il colore di base viene scurito o schiarito quanto basta.
 */
function tcBuildTheme(baseHex, schemeMode, contrastLevel) {
    const chosen = tcNormalizeHex(baseHex) || TC_DEFAULTS.savedColor;
    const min = TC_CONTRAST_LEVELS[contrastLevel] ?? TC_CONTRAST_LEVELS[TC_DEFAULTS.contrastLevel];
    let dark;
    if (schemeMode === "dark") dark = true;
    else if (schemeMode === "light") dark = false;
    else if (min) {
        // Automatico con contrasto minimo: sceglie testo bianco o nero in base a quale
        // richiede la modifica più piccola del colore scelto
        const dist = (a, b) => { const x = tcHexToRgb(a), y = tcHexToRgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
        const dDark = dist(chosen, tcEnsureContrast(chosen, "#ffffff", min));
        const dLight = dist(chosen, tcEnsureContrast(chosen, "#000000", min));
        dark = dDark === dLight ? tcIsDark(chosen) : dDark < dLight;
    }
    else dark = tcIsDark(chosen);

    const fg = dark ? "#ffffff" : "#000000";
    const ink = dark ? "#000000" : "#ffffff"; // direzione "profondità"
    const ok = bg => tcEnsureContrast(bg, fg, min);

    const base = ok(chosen);

    // Superfici: in modalità scura si scurisce verso il nero, in chiara si schiarisce verso il bianco
    const toolbar = ok(tcMix(base, ink, 0.10));
    const field = ok(dark ? tcMix(base, "#000000", 0.30) : tcMix(base, "#ffffff", 0.75));
    const fieldFocus = ok(dark ? tcMix(base, "#000000", 0.45) : "#ffffff");
    const popup = ok(dark ? tcMix(base, "#000000", 0.40) : tcMix(base, "#ffffff", 0.88));
    const sidebar = ok(dark ? tcMix(base, "#000000", 0.30) : tcMix(base, "#ffffff", 0.85));
    const highlight = ok(tcMix(sidebar, fg, 0.18));
    const button = ok(tcMix(base, fg, 0.12));
    const buttonHover = ok(tcMix(base, fg, 0.20));
    const buttonActive = ok(tcMix(base, fg, 0.28));
    const border = tcMix(base, fg, 0.35);
    const separator = tcMix(base, fg, 0.22);
    const accent = tcMix(fg, base, 0.25);

    const theme = {
        colors: {
            frame: base,
            frame_inactive: ok(tcMix(base, ink, 0.06)),
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
            button_background_hover: buttonHover,
            button_background_active: buttonActive,
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

    // Solo build Thunderbird (manifest con "theme_experiment"):
    // - da Thunderbird 157 la barra unificata e la barra di stato leggono la variabile
    //   CSS --lwt-frame, che il motore dei temi non imposta più (resta --lwt-accent-color);
    //   senza questo mapping lì compare il colore di sistema (es. accento blu di Windows);
    // - i pulsanti (filtro veloce, menu "…", ecc.) usano --button-* che nessuna chiave
    //   standard dei temi raggiunge e resterebbero grigi.
    if (tcHasThemeExperiment()) {
        Object.assign(theme.colors, {
            tc_frame: base,
            tc_spaces_bg: base,
            tc_spaces_text: fg,
            tc_button_bg: button,
            tc_button_text: fg,
            tc_button_border: border,
            tc_button_hover_bg: buttonHover,
            tc_button_active_bg: buttonActive
        });
    }

    // Dati per l'anteprima (non sono chiavi di tema: vengono rimossi prima di theme.update)
    theme.meta = { chosen, applied: base, adjusted: base !== chosen, dark, min, button };
    return theme;
}

function tcHasThemeExperiment() {
    try {
        const exp = browser.runtime.getManifest().theme_experiment;
        return !!(exp && exp.colors && exp.colors.tc_frame);
    } catch (e) {
        return false;
    }
}

async function tcLoadSettings() {
    const res = await browser.storage.local.get(["savedColor", "schemeMode", "contrastLevel"]);
    return {
        savedColor: tcNormalizeHex(res.savedColor) || null,
        schemeMode: ["auto", "light", "dark"].includes(res.schemeMode) ? res.schemeMode : TC_DEFAULTS.schemeMode,
        contrastLevel: res.contrastLevel in TC_CONTRAST_LEVELS ? res.contrastLevel : TC_DEFAULTS.contrastLevel
    };
}

async function tcApplyStoredTheme() {
    const s = await tcLoadSettings();
    if (!s.savedColor) {
        // Nessun colore salvato: lascia il tema dell'utente
        return;
    }
    try {
        const theme = tcBuildTheme(s.savedColor, s.schemeMode, s.contrastLevel);
        delete theme.meta;
        await browser.theme.update(theme);
    } catch (e) {
        console.error("Titlebar Colorizer: theme.update fallito", e);
    }
}
