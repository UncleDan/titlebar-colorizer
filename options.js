const colorPicker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');
const rgbInput = document.getElementById('rgbInput');
const preview = document.getElementById('preview');

// Helper: converte RGB in HEX
function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

// Helper: converte HEX in RGB
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

function getContrastColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return (luminance > 0.5) ? "#000000" : "#ffffff";
}

function updateAll(hex, source) {
    const textColor = getContrastColor(hex);
    
    // Aggiorna gli altri input se non sono la sorgente
    if (source !== 'picker') colorPicker.value = hex;
    if (source !== 'hex') hexInput.value = hex;
    if (source !== 'rgb') rgbInput.value = hexToRgb(hex);

    // Anteprima
    preview.style.backgroundColor = hex;
    preview.style.color = textColor;

    // Applica e Salva
    browser.theme.update({
        colors: {
            frame: hex,
            tab_background_text: textColor,
            toolbar_field_text: textColor,
            icons: textColor
        }
    });
    browser.storage.local.set({ savedColor: hex });
}

// Event Listeners
colorPicker.addEventListener('input', (e) => updateAll(e.target.value, 'picker'));

hexInput.addEventListener('change', (e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) updateAll(val, 'hex');
});

rgbInput.addEventListener('change', (e) => {
    const parts = e.target.value.split(',').map(p => p.trim());
    if (parts.length === 3) {
        const hex = rgbToHex(parts[0], parts[1], parts[2]);
        updateAll(hex, 'rgb');
    }
});

// Caricamento iniziale
browser.storage.local.get("savedColor").then((res) => {
    const startColor = res.savedColor || "#ffffff";
    updateAll(startColor);
});