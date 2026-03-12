// popup.js

// ── PRESET PALETTE ──────────────────────────────────────────────
const PRESETS = [
  "#1e2a3a", "#0d1b2a", "#1a1a2e", "#16213e",
  "#2d1b33", "#1b1f2a", "#0a0a0a", "#2c2c2c",
  "#1e3a2f", "#0f2027", "#1a2a1a", "#2a3a1e",
  "#3a1e2a", "#2a1e3a", "#3a2a1e", "#1e3a3a",
  "#c0392b", "#e74c3c", "#e67e22", "#f39c12",
  "#27ae60", "#16a085", "#2980b9", "#8e44ad",
  "#2c3e50", "#7f8c8d", "#bdc3c7", "#ecf0f1",
  "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff"
];

// ── UTILS: COLORE ────────────────────────────────────────────────

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

// Luminanza relativa (WCAG 2.1)
function relativeLuminance(r, g, b) {
  const s = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(...hexToRgb(hex1));
  const l2 = relativeLuminance(...hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Sceglie bianco o nero per massimo contrasto
function bestTextColor(bgHex) {
  const cWhite = contrastRatio(bgHex, "#ffffff");
  const cBlack = contrastRatio(bgHex, "#000000");
  return cWhite >= cBlack ? "#ffffff" : "#000000";
}

// Genera testo leggermente sfumato per la toolbar (non puro bianco/nero)
function softTextColor(bgHex) {
  const base = bestTextColor(bgHex);
  const [br, bg, bb] = hexToRgb(bgHex);
  if (base === "#ffffff") {
    return rgbToHex(
      Math.min(255, br + 160),
      Math.min(255, bg + 160),
      Math.min(255, bb + 160)
    );
  } else {
    return rgbToHex(
      Math.max(0, br - 130),
      Math.max(0, bg - 130),
      Math.max(0, bb - 130)
    );
  }
}

// Colore per la tab attiva (leggermente più chiaro/scuro del frame)
function activeTabColor(bgHex) {
  const [r, g, b] = hexToRgb(bgHex);
  const lum = relativeLuminance(r, g, b);
  const factor = lum < 0.5 ? 1.4 : 0.7;
  return rgbToHex(
    Math.min(255, Math.max(0, Math.round(r * factor))),
    Math.min(255, Math.max(0, Math.round(g * factor))),
    Math.min(255, Math.max(0, Math.round(b * factor)))
  );
}

// Genera una scala di 8 tonalità dal colore scelto
function generateScale(bgHex) {
  const [r, g, b] = hexToRgb(bgHex);
  const steps = 8;
  const scale = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    // da molto scuro a molto chiaro passando per il colore base
    const nr = Math.round(r * (0.2 + t * 0.8) + (255 - r) * t * 0.4);
    const ng = Math.round(g * (0.2 + t * 0.8) + (255 - g) * t * 0.4);
    const nb = Math.round(b * (0.2 + t * 0.8) + (255 - b) * t * 0.4);
    scale.push(rgbToHex(
      Math.min(255, nr),
      Math.min(255, ng),
      Math.min(255, nb)
    ));
  }
  return scale;
}

// ── COSTRUISCI TEMA FIREFOX ──────────────────────────────────────

function buildTheme(bgHex) {
  const textColor = bestTextColor(bgHex);
  const softText = softTextColor(bgHex);
  const tabBg = activeTabColor(bgHex);
  const tabText = bestTextColor(tabBg);

  return {
    colors: {
      // Barra del titolo / frame
      frame: bgHex,
      frame_inactive: bgHex,

      // Toolbar (barra indirizzi)
      toolbar: tabBg,
      toolbar_text: softText,
      toolbar_field: bgHex,
      toolbar_field_text: textColor,
      toolbar_field_border: textColor + "44",
      toolbar_top_separator: textColor + "22",
      toolbar_bottom_separator: textColor + "22",
      toolbar_vertical_separator: textColor + "22",

      // Tab
      tab_text: textColor,
      tab_background_text: textColor + "99",
      tab_line: textColor,
      tab_loading: textColor,
      tab_selected: tabBg,

      // Finestra
      ntp_background: bgHex,
      ntp_text: textColor,

      // Pulsanti e popup
      button_background_hover: textColor + "22",
      button_background_active: textColor + "44",
      popup: tabBg,
      popup_text: textColor,
      popup_border: textColor + "33",
      popup_highlight: bgHex,
      popup_highlight_text: textColor,

      // Sidebar
      sidebar: tabBg,
      sidebar_text: textColor,
      sidebar_highlight: bgHex,
      sidebar_highlight_text: textColor,
      sidebar_border: textColor + "22",

      // Barra in basso
      icons: textColor,
      icons_attention: textColor,

      // Barra delle schede
      tab_background_separator: textColor + "22",
    }
  };
}

// ── UI ───────────────────────────────────────────────────────────

const colorPicker = document.getElementById("colorPicker");
const hexInput = document.getElementById("hexInput");
const previewBar = document.getElementById("previewBar");
const previewTitle = document.getElementById("previewTitle");
const previewTabBar = document.getElementById("previewTabBar");
const previewTab = document.getElementById("previewTab");
const previewToolbar = document.getElementById("previewToolbar");
const toolbarBar = document.getElementById("toolbarBar");
const contrastDot = document.getElementById("contrastDot");
const contrastRatioEl = document.getElementById("contrastRatio");
const textColorLabel = document.getElementById("textColorLabel");
const presetsGrid = document.getElementById("presetsGrid");
const scaleRow = document.getElementById("scaleRow");

let currentColor = "#1e2a3a";

function updatePreview(hex) {
  const text = bestTextColor(hex);
  const tabBg = activeTabColor(hex);
  const tabText = bestTextColor(tabBg);
  const ratio = contrastRatio(hex, text).toFixed(2);
  const isGood = parseFloat(ratio) >= 4.5;

  previewBar.style.background = hex;
  previewBar.style.color = text;
  previewTitle.style.color = text;

  previewTabBar.style.background = hex;
  previewTab.style.background = tabBg;
  previewTab.style.color = tabText;

  previewToolbar.style.background = tabBg;
  toolbarBar.style.background = tabText;

  textColorLabel.textContent = text;
  contrastRatioEl.textContent = ratio + ":1";
  contrastDot.style.background = isGood ? "#28c840" : ratio >= 3 ? "#febc2e" : "#ff5f57";

  buildScale(hex);
}

function buildScale(hex) {
  const scale = generateScale(hex);
  scaleRow.innerHTML = "";
  scale.forEach(color => {
    const sw = document.createElement("div");
    sw.className = "scale-swatch";
    sw.style.background = color;
    sw.title = color;
    sw.addEventListener("click", () => setColor(color));
    scaleRow.appendChild(sw);
  });
}

function buildPresets() {
  presetsGrid.innerHTML = "";
  PRESETS.forEach(color => {
    const el = document.createElement("div");
    el.className = "preset";
    el.style.background = color;
    el.title = color;
    el.addEventListener("click", () => setColor(color));
    presetsGrid.appendChild(el);
  });
}

function setColor(hex) {
  // Normalizza
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  currentColor = hex;
  colorPicker.value = hex;
  hexInput.value = hex;
  updatePreview(hex);

  // Aggiorna active preset
  document.querySelectorAll(".preset").forEach(el => {
    el.classList.toggle("active", el.style.background === hexToStyleBg(hex));
  });
}

function hexToStyleBg(hex) {
  // Il browser converte #rrggbb in rgb(...) per style.background
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

// ── EVENTI ──────────────────────────────────────────────────────

colorPicker.addEventListener("input", (e) => setColor(e.target.value));

hexInput.addEventListener("input", (e) => {
  let val = e.target.value.trim();
  if (!val.startsWith("#")) val = "#" + val;
  if (/^#[0-9a-fA-F]{6}$/.test(val)) setColor(val);
});

document.getElementById("btnApply").addEventListener("click", () => {
  const theme = buildTheme(currentColor);
  browser.runtime.sendMessage({ action: "applyTheme", theme });
});

document.getElementById("btnReset").addEventListener("click", () => {
  browser.runtime.sendMessage({ action: "resetTheme" });
});

// ── INIT ────────────────────────────────────────────────────────

buildPresets();

// Recupera colore attualmente salvato
browser.storage.local.get("tbcTheme").then(stored => {
  if (stored.tbcTheme) {
    const savedColor = stored.tbcTheme.colors && stored.tbcTheme.colors.frame;
    if (savedColor) setColor(savedColor);
    else setColor(currentColor);
  } else {
    setColor(currentColor);
  }
}).catch(() => setColor(currentColor));
