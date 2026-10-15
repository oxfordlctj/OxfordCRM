# SmartSchool — Reels-трейлер курсов английского

Вертикальный ролик 1080×1920, 41,5 с, таджикская озвучка (ElevenLabs, голос Dilshod, дубль s2),
синтезированная трейлерная музыка 120 BPM.

Сцены: ночная Земля из космоса (рельеф SRTM/Terrarium, огни городов Natural Earth) с маршрутами из
Душанбе → счётчик носителей → «Ва шумо?» и ныряние в Душанбе → раскрытие бренда → тоннель английских
слов → 4 причины (01–04) → посадочный талон «DYU → WORLD» → финал с призывом «Ба директ нависед».

| Файл | Что внутри |
|---|---|
| `src/trailer.json` | тайминги голоса, ударов и секций музыки |
| `src/Reel.tsx` | монтаж: сцены, таджикские титры, удары камеры, вспышки, зерно |
| `src/Globe.tsx` | попиксельный рендер глобуса на canvas |
| `src/scenes/*` | Space, Brand (логотип-заглушка), Story (тоннель, причины, талон) |
| `tools/fetch_world.py`, `tools/bake_earth.py` | данные и текстуры Земли |
| `tools/trailer_score.py` | музыка + сведение голоса → `public/trailer_mix.wav` |

```bash
npm install
python3 tools/trailer_score.py      # после правок trailer.json
npx remotion render SmartReel out/smartschool-raw.mp4 --crf=17
```

Логотип в `src/scenes/Brand.tsx` — временный (пузырь с «S» + вордмарк). Замените на настоящий.
