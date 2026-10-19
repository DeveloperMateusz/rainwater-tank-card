# Rainwater Tank Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories)
[![Validate](https://github.com/DeveloperMateusz/rainwater-tank-card/actions/workflows/validate.yml/badge.svg)](https://github.com/DeveloperMateusz/rainwater-tank-card/actions/workflows/validate.yml)

🇬🇧 [English version](README.md)

Animowana karta Lovelace dla zbiornika na deszczówkę. Pokazuje przekrój zbiornika z aktualnym poziomem wody, deszcz spływający z dachu, pracującą pompę, objętość w litrach lub galonach, wykres poziomu z zoomem i opcjonalne dane z czujnika. Wszystko jest widoczne od razu w jednej karcie, bez wyskakującego okna.

<p align="center"><img src="https://raw.githubusercontent.com/DeveloperMateusz/rainwater-tank-card/main/images/preview-pl.png" alt="Podgląd Rainwater Tank Card" width="420"></p>

<div align="center">
  <video src="https://github.com/user-attachments/assets/4461e417-1e81-4789-b8db-43d227baf53a" width="420" controls muted loop playsinline></video>
</div>

## Możliwości

- Animowana scena: poziom wody podąża za czujnikiem, deszcz pojawia się, gdy pogoda lub czujnik deszczu wskazują opady, a pompa animuje się podczas pracy.
- Przełącznik w rogu sceny wymusza wszystkie animacje. Ustawienie jest zapamiętywane na danym urządzeniu.
- Kafelek **Poziom** pokazuje %, wysokość wody, zmianę od północy i czas od ostatniej aktualizacji.
- Kafelek **W zbiorniku** pokazuje objętość, zmianę od północy i wolne miejsce, liczone z wpisanej pojemności.
- Dzienną zmianę karta liczy sama z historii, bez pomocników i automatyzacji. Oba kafelki podświetlają się, gdy poziom wzrośnie o co najmniej 3% (próg można zmienić).
- Wykres poziomu (domyślnie 7 dni):
  - szczypanie lub kółko myszy przybliża, przeciąganie przesuwa, a długie przytrzymanie pokazuje celownik
  - podwójne stuknięcie lub przycisk ↺ przywraca widok
  - karta korzysta ze statystyk długoterminowych, a gdy ich brak, z historii
- Opcjonalne pomiary: ostatni pomiar, wypompowanie, przewidywany pełny zbiornik, temperatura modułu, zasięg (z opisem jakości) i bateria modułu. Każdy z nich pojawia się tylko po wybraniu encji.
- Każdą nazwę można zmienić. Domyślnie wszystko jest po angielsku, a po polsku, gdy Home Assistant działa w języku polskim.
- Jednostki metryczne (L, m) lub imperialne (gal, ft): automatycznie z Home Assistant albo ustawione ręcznie.
- Pełny edytor wizualny, więc YAML nie jest wymagany.

## Instalacja

### HACS (zalecane)

1. Otwórz **HACS** w Home Assistant.
2. Otwórz menu (⋮) w prawym górnym rogu i wybierz **Niestandardowe repozytoria** (*Custom repositories*).
3. Wklej `https://github.com/DeveloperMateusz/rainwater-tank-card`, wybierz typ **Dashboard** i kliknij **Dodaj**.
4. Wyszukaj **Rainwater Tank Card**, otwórz i kliknij **Pobierz**.
5. Odśwież przeglądarkę (lub wyczyść pamięć podręczną aplikacji Companion), gdy HACS o to poprosi.

HACS sam doda zasób do dashboardów.

### Ręcznie

1. Pobierz `rainwater-tank-card.js` z [najnowszego wydania](https://github.com/DeveloperMateusz/rainwater-tank-card/releases) (albo z folderu `dist`).
2. Skopiuj plik do `<config>/www/rainwater-tank-card.js`.
3. Wejdź w **Ustawienia → Dashboardy → ⋮ → Zasoby → Dodaj zasób**, wpisz adres `/local/rainwater-tank-card.js` i wybierz **Moduł JavaScript**.
4. Odśwież przeglądarkę.

## Dodanie karty

Edytuj dashboard, kliknij **Dodaj kartę** i wyszukaj **Rainwater Tank Card**. Wybierz czujnik poziomu wody, wpisz pojemność zbiornika i gotowe. Reszta jest opcjonalna.

## Konfiguracja

### Minimalna

```yaml
type: custom:rainwater-tank-card
level_entity: sensor.deszczowka_poziom_procentowy
capacity: 8000
```

### Pełny przykład

```yaml
type: custom:rainwater-tank-card
title: Deszczówka
level_entity: sensor.deszczowka_poziom_procentowy   # poziom wody w %
capacity: 8000                                      # w litrach (lub galonach przy jednostkach imperialnych)
height_entity: sensor.deszczowka_poziom_cm          # wysokość wody; jednostka z encji (mm, cm, m, in, ft)
weather_entity: weather.dom                         # animacja deszczu, gdy pada
rain_entity: binary_sensor.deszcz                   # animacja deszczu, gdy czujnik ma stan "on"
pump_entity: switch.pompa_deszczowka                # animacja pompy, gdy pracuje (tylko podgląd, bez sterowania)
chart_hours: 168
highlight_threshold: 3
names:
  tank: Zbiornik na deszczówkę
  sensor: Czujnik
  level: Hydrostatyczny
  volume: W zbiorniku
  chart: Poziom (7 dni)
  measurements: Pomiary
measurements:
  last_measurement:
    entity: sensor.deszczowka_czas_ostatniego_pomiaru
  last_empty:
    entity: sensor.deszczowka_czas_ostatniego_pustego_stanu
  full_prediction:
    entity: sensor.deszczowka_przewidywany_czas_pelnego_zbiornika
  temperature:
    entity: sensor.deszczowka_temperatura
  signal:
    entity: sensor.deszczowka_sila_sygnalu_rssi
  battery:
    entity: sensor.deszczowka_poziom_baterii
```

### Opcje

| Opcja | Wymagana | Domyślnie | Opis |
|---|---|---|---|
| `level_entity` | **tak** | – | Poziom wody w procentach (0–100). |
| `capacity` | **tak** | – | Pojemność zbiornika w litrach albo w galonach przy jednostkach imperialnych. |
| `height_entity` | nie | – | Wysokość wody. Widoczna na znaczniku przy zbiorniku i w kafelku poziomu. |
| `unit_system` | nie | `auto` | `auto`, `metric` (L, m) lub `imperial` (gal, ft). |
| `title` | nie | `Deszczówka` / `Rainwater` | Tekst nagłówka. |
| `show_title` | nie | `true` | `false` ukrywa nagłówek. |
| `icon` | nie | `mdi:storage-tank-outline` | Ikona nagłówka. |
| `icon_color` | nie | `#7AEBDD` | Kolor ikony nagłówka. |
| `weather_entity` | nie | – | Animacja deszczu przy stanach `rainy`, `pouring`, `lightning-rainy`, `snowy-rainy`, `hail`. |
| `rain_entity` | nie | – | Animacja deszczu, gdy czujnik binarny ma stan `on`. |
| `pump_entity` | nie | – | Animacja pompy przy stanie `on`, `open` lub `running`. Tylko podgląd. |
| `show_chart` | nie | `true` | Pokazuje wykres poziomu. |
| `chart_hours` | nie | `168` | Domyślny zakres wykresu w godzinach (1–720). |
| `highlight_threshold` | nie | `3` | Dzienny przyrost (w %), od którego kafelki są podświetlone. |
| `names` | nie | – | Własne nazwy, patrz niżej. |
| `measurements` | nie | – | Opcjonalne kafelki pomiarów, patrz niżej. |

### Nazwy (`names`)

| Klucz | Domyślnie (EN / PL) |
|---|---|
| `tank` | Rainwater tank / Zbiornik na deszczówkę |
| `sensor` | Sensor / Czujnik |
| `level` | Level / Poziom |
| `volume` | In tank / W zbiorniku |
| `chart` | Level (7 days) / Poziom (7 dni) |
| `measurements` | Measurements / Pomiary |

### Pomiary (`measurements`)

Każdy wpis przyjmuje `entity` (wymagane, żeby kafelek się pojawił) oraz opcjonalnie `name` i `icon`. Wpisy bez encji są ukryte. Nie można dodawać innych rodzajów pomiarów.

| Klucz | Oczekiwana encja | Wyświetlanie |
|---|---|---|
| `last_measurement` | sensor z datą/czasem | czas temu, np. `9 min temu` |
| `last_empty` | sensor z datą/czasem | czas temu albo data, jeśli minęło ponad 24 h |
| `full_prediction` | sensor z datą/czasem | data i godzina |
| `temperature` | czujnik temperatury | wartość z jednostką |
| `signal` | czujnik RSSI (dBm) | wartość i ocena (Doskonały … Praktycznie brak) |
| `battery` | czujnik baterii (% lub `high`/`middle`/`low`) | wartość, ikona poziomu, czerwony poniżej 20% |

## Jak to działa

- **Dzienna zmiana.** Karta odczytuje z rejestratora poziom o północy (czasu lokalnego) i porównuje go z bieżącą wartością.
- **Wykres.** Wykres korzysta z 5-minutowych statystyk długoterminowych, gdy czujnik poziomu ma `state_class: measurement`, a w przeciwnym razie ze zwykłej historii. Dłuższy zakres (do 10 dni) pobiera się dopiero przy pierwszym przybliżeniu lub przesunięciu.
- **Wydajność.**
  - Animacje zatrzymują się, gdy karta jest poza ekranem lub karta przeglądarki działa w tle. Zatrzymują się też, gdy system prosi o ograniczenie ruchu, chyba że włączysz je przełącznikiem.
  - Karta przerysowuje się tylko przy zmianie jej własnych encji.
  - Statyczne elementy sceny są renderowane tylko raz.

## Rozwiązywanie problemów

- **„Custom element doesn't exist”.** Upewnij się, że zasób jest załadowany (HACS robi to automatycznie), i wyczyść pamięć podręczną przeglądarki.
- **Wykres pokazuje „Brak danych historii”.** Encja poziomu musi być zapisywana przez rejestrator (recorder).
- **Zła wysokość.** Sprawdź `unit_of_measurement` encji wysokości. Bez jednostki karta przyjmuje centymetry.

## Licencja

[MIT](LICENSE). Dołączona czcionka [Manrope](https://github.com/sharanda/manrope) jest na licencji [SIL Open Font License 1.1](licenses/Manrope-OFL.txt).
