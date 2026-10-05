# Titlebar Colorizer Multi - Firefox, LibreWolf and Thunderbird

Customize the titlebar color with automatic contrast calculation for Firefox, LibreWolf and Thunderbird.

## Build

Single source tree, two packages produced by `make-zip.cmd`:

| Package | Manifest | Store |
|---|---|---|
| `…-firefox.xpi` | `manifest.json` as is — "Titlebar Colorizer Multi" | addons.mozilla.org |
| `…-thunderbird.xpi` | `manifest.json` + overlay `manifest.thunderbird.json` — "Titlebar Colorizer Multi - Thunderbird" | addons.thunderbird.net |

Keys in `manifest.thunderbird.json` (except those starting with `_`) replace or add the same keys of `manifest.json` only at build time.

## Changelog

### 2.0.2
- Store banners in `store/` (1400×560 marquee and 440×280 small tile, PNG + SVG source); the folder is excluded from the packages.

### 2.0.1
- Icons in PNG 16/32/48/64/96/128/256/512 (64 px required by the store listing).

### 2.0
- First stable release of the 2.0 series (includes all changes of 2.0b1–2.0b4 below).
- Two separate listings: "Titlebar Colorizer Multi" (Firefox/LibreWolf, addons.mozilla.org) and "Titlebar Colorizer Multi - Thunderbird" (addons.thunderbird.net), built from the same source.

### 2.0b4
- The Thunderbird package is published separately as "Titlebar Colorizer Multi - Thunderbird" (name and description set by the build overlay; source unchanged).

### 2.0b3
- Thunderbird: buttons (quick filter bar, pin, folder pane "…" menu, etc.) are now colored too instead of staying gray (`--button-*` variables mapped via `theme_experiment`). Toolbar button hover/pressed colors use the standard `button_background_hover`/`button_background_active` keys.
- WCAG contrast: new option *Minimum contrast* — AAA 7:1 (default), AA 4.5:1, none. Every text/background pair of the theme reaches the chosen ratio; when needed the base color is darkened or lightened just enough (the options page shows the applied color and the worst contrast ratio).
- In automatic mode white or black text is chosen according to which needs the smallest change to the chosen color.

### 2.0b2
- Fix Thunderbird 157+: the unified toolbar (top) and the status bar stayed with the system color (e.g. Windows blue accent) instead of the chosen color. Thunderbird 157 reads the CSS variable `--lwt-frame`, which the Gecko theme engine does not set (it still sets `--lwt-accent-color`). The Thunderbird build maps the color onto `--lwt-frame` through a `theme_experiment`; the spaces toolbar (left) is colored too.
- Two packages: `-firefox.xpi` (Firefox/LibreWolf, unchanged manifest) and `-thunderbird.xpi` (manifest merged with `manifest.thunderbird.json`). They must stay separate: on Firefox release a `theme_experiment` blocks `theme.update` entirely.
- New icon (window with colored titlebar and color drop), SVG source in `icons/icon.svg`, PNG 16/32/48/96/128.

### 2.0b1
- Fix: with a dark base color the UI no longer stays light/unreadable. The extension now builds a full theme (toolbar, fields, popups, sidebar/folder pane) and sets `color_scheme` explicitly to `dark` or `light`.
- Contrast now uses WCAG relative luminance (picks black or white text by actual contrast ratio).
- New option: light/dark scheme *Automatic* / *Force light* / *Force dark*.
- New button: restore original theme.
- Migrated to Manifest V3 (event page with `runtime.onStartup`/`onInstalled` listeners, `action` instead of `browser_action`) for current Thunderbird (157+) and Firefox/LibreWolf. Minimum version: 140 (ESR).
- Clicking the toolbar icon opens the options page.
- Versioning: betas `2.0bN` were published as `version` `1.99.N` (AMO only accepts numeric versions) with `version_name` `2.0bN`; the final release is `2.0`.
- `make-zip.bat` replaced by `make-zip.cmd` (uses `version_name` for the file name).
