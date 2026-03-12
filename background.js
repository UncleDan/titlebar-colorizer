function getContrastColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return (luminance > 0.5) ? "#000000" : "#ffffff";
}

function applyStoredTheme() {
    browser.storage.local.get("savedColor").then((res) => {
        if (res.savedColor) {
            const color = res.savedColor;
            const textColor = getContrastColor(color);
            browser.theme.update({
                colors: {
                    frame: color,
                    tab_background_text: textColor,
                    toolbar_field_text: textColor,
                    icons: textColor
                }
            });
        }
    });
}

// Applica al caricamento dell'estensione
applyStoredTheme();