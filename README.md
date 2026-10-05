# Titlebar Colorizer Multi - Firefox, LibreWolf and Thunderbird

Customize the titlebar color with automatic contrast calculation for Firefox, LibreWolf and Thunderbird.

## Changelog

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
- Versioning: beta `2.0bN` is published as `version` `1.99.N` (AMO only accepts numeric versions) with `version_name` `2.0bN`; the final release will be `2.0`.
- `make-zip.bat` replaced by `make-zip.cmd` (uses `version_name` for the file name).
