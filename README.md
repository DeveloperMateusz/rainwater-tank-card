# Rainwater Tank Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories)
[![Validate](https://github.com/DeveloperMateusz/rainwater-tank-card/actions/workflows/validate.yml/badge.svg)](https://github.com/DeveloperMateusz/rainwater-tank-card/actions/workflows/validate.yml)

🇵🇱 [Polska wersja opisu](README.pl.md)

An animated Lovelace card for a rainwater tank. It shows an underground tank scene with live water level, rain running off the roof, a working pump, the volume in litres or gallons, a zoomable level chart and optional sensor details. Everything is visible at once in a single card, with no pop-up.

<p align="center"><img src="https://raw.githubusercontent.com/DeveloperMateusz/rainwater-tank-card/main/images/preview-en.png" alt="Rainwater Tank Card preview" width="420"></p>

<div align="center">
  <video src="https://github.com/user-attachments/assets/4461e417-1e81-4789-b8db-43d227baf53a" width="420" controls muted loop playsinline></video>
</div>

## Features

- Animated scene: the water level follows your sensor, rain animates when the weather or a rain sensor says it is raining, and the pump animates while it runs.
- A toggle in the corner of the scene forces all animations on. It is remembered per device.
- **Level** tile showing %, water height, the change since midnight and the time since the last update.
- **In tank** tile showing the volume, the change since midnight and the free space, calculated from the capacity you enter.
- The daily change is calculated by the card from history, so no helpers or automations are needed. Both tiles light up when the level rises by at least 3% (configurable).
- Level chart (7 days by default):
  - pinch or mouse wheel zooms, dragging pans, and a long press shows a crosshair
  - a double tap or the ↺ button resets the view
  - long-term statistics are used when available, with a fallback to history
- Optional measurements: last reading, last emptied, full tank forecast, module temperature, signal strength (with a quality description) and module battery. Each one is shown only when you select an entity for it.
- Every label can be renamed. Defaults are in English, and Polish is used automatically when Home Assistant is set to Polish.
- Metric (L, m) or imperial (gal, ft) units, picked automatically from Home Assistant or set manually.
- Full visual editor, so YAML is optional.

## Installation

### HACS (recommended)

1. Open **HACS** in Home Assistant.
2. Open the menu (⋮) in the top right corner and choose **Custom repositories**.
3. Paste `https://github.com/DeveloperMateusz/rainwater-tank-card`, choose the type **Dashboard** and click **Add**.
4. Search for **Rainwater Tank Card**, open it and click **Download**.
5. Reload the browser (or clear the Companion app cache) when HACS asks you to.

HACS registers the resource for you.

### Manual

1. Download `rainwater-tank-card.js` from the [latest release](https://github.com/DeveloperMateusz/rainwater-tank-card/releases) (or from the `dist` folder).
2. Copy it to `<config>/www/rainwater-tank-card.js`.
3. Go to **Settings → Dashboards → ⋮ → Resources → Add resource**, enter the URL `/local/rainwater-tank-card.js` and choose **JavaScript module**.
4. Reload the browser.

## Adding the card

Edit a dashboard, click **Add card** and search for **Rainwater Tank Card**. Select your water level sensor, enter the tank capacity and you are done. Everything else is optional.

## Configuration

### Minimal

```yaml
type: custom:rainwater-tank-card
level_entity: sensor.rainwater_level
capacity: 8000
```

### Full example

```yaml
type: custom:rainwater-tank-card
title: Rainwater
level_entity: sensor.rainwater_level        # water level in %
capacity: 8000                              # in litres (or gallons with imperial units)
height_entity: sensor.rainwater_height      # water height; unit read from the entity (mm, cm, m, in, ft)
weather_entity: weather.home                # rain animation when it rains
rain_entity: binary_sensor.rain             # rain animation when this sensor is "on"
pump_entity: switch.rainwater_pump          # pump animation while it is on (display only, no control)
chart_hours: 168
highlight_threshold: 3
names:
  tank: Rainwater tank
  sensor: Sensor
  level: Hydrostatic
  volume: In tank
  chart: Level (7 days)
  measurements: Measurements
measurements:
  last_measurement:
    entity: sensor.rainwater_last_reading
  last_empty:
    entity: sensor.rainwater_last_emptied
  full_prediction:
    entity: sensor.rainwater_full_eta
  temperature:
    entity: sensor.rainwater_module_temperature
  signal:
    entity: sensor.rainwater_rssi
  battery:
    entity: sensor.rainwater_battery
    name: Probe battery
```

### Options

| Option | Required | Default | Description |
|---|---|---|---|
| `level_entity` | **yes** | – | Water level in percent (0–100). |
| `capacity` | **yes** | – | Tank capacity in litres, or in gallons when imperial units are active. |
| `height_entity` | no | – | Water height. Shown on the tank marker and in the level tile. |
| `unit_system` | no | `auto` | `auto`, `metric` (L, m) or `imperial` (gal, ft). |
| `title` | no | `Rainwater` | Header text. |
| `show_title` | no | `true` | Set to `false` to hide the header. |
| `icon` | no | `mdi:storage-tank-outline` | Header icon. |
| `icon_color` | no | `#7AEBDD` | Header icon colour. |
| `weather_entity` | no | – | Rain animation when the state is `rainy`, `pouring`, `lightning-rainy`, `snowy-rainy` or `hail`. |
| `rain_entity` | no | – | Rain animation when this binary sensor is `on`. |
| `pump_entity` | no | – | Pump animation when the state is `on`, `open` or `running`. Display only. |
| `show_chart` | no | `true` | Show the level chart. |
| `chart_hours` | no | `168` | Default chart range in hours (1–720). |
| `highlight_threshold` | no | `3` | Daily rise (in %) from which the tiles are highlighted. |
| `names` | no | – | Your own labels, see below. |
| `measurements` | no | – | Optional detail tiles, see below. |

### Labels (`names`)

| Key | Default (EN / PL) |
|---|---|
| `tank` | Rainwater tank / Zbiornik na deszczówkę |
| `sensor` | Sensor / Czujnik |
| `level` | Level / Poziom |
| `volume` | In tank / W zbiorniku |
| `chart` | Level (7 days) / Poziom (7 dni) |
| `measurements` | Measurements / Pomiary |

### Measurements (`measurements`)

Each entry takes `entity` (required to show it), plus optional `name` and `icon`. Entries without an entity are hidden. No other measurement types can be added.

| Key | Expected entity | Shown as |
|---|---|---|
| `last_measurement` | timestamp sensor | time ago, e.g. `9 min ago` |
| `last_empty` | timestamp sensor | time ago, or the date if older than 24 h |
| `full_prediction` | timestamp sensor | date and time |
| `temperature` | temperature sensor | value with unit |
| `signal` | RSSI sensor (dBm) | value and quality (Excellent … No signal) |
| `battery` | battery sensor (% or `high`/`middle`/`low`) | value, level icon, red below 20% |

## How it works

- **Daily change.** The card reads the level at local midnight from the recorder and compares it with the current value.
- **Chart.** The chart uses 5-minute long-term statistics when the level sensor has `state_class: measurement`, and plain history otherwise. A longer range (up to 10 days) is loaded only after you first zoom or pan.
- **Performance.**
  - Animations pause when the card is off-screen or the browser tab is in the background. They also pause when the system asks for reduced motion, unless you switch them on with the toggle.
  - The card redraws only when one of its own entities changes.
  - Static parts of the scene are pre-rendered once.

## Troubleshooting

- **"Custom element doesn't exist".** Make sure the resource is loaded (HACS does this automatically), then refresh the browser cache.
- **Chart shows "No history data".** The level entity must be recorded by the recorder.
- **Wrong height.** Check the `unit_of_measurement` of the height entity. Without a unit, centimetres are assumed.

## License

[MIT](LICENSE). The bundled [Manrope](https://github.com/sharanda/manrope) font is licensed under the [SIL Open Font License 1.1](licenses/Manrope-OFL.txt).
