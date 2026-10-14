# Oxford — Филиал №8 (рекламный ролик)

Кинематографичный ролик 1920×1080, 30 fps, 65 с: объёмная «7», полёт над реальным рельефом
Таджикистана, ночной Душанбе с 7 филиалами, поиск и раскрытие 8‑го филиала, причины выбора
локации и финальный логотип. Озвучка — ElevenLabs (голос Maxim, take2), музыка и звуковой
дизайн синтезированы скриптом `tools/score.py`.

## Что откуда
| Файл | Назначение |
|---|---|
| `src/branches.json` | филиалы: название, адрес, **координаты** (приблизительные — уточните) |
| `src/timeline.json` | тайминги озвучки, ударов, появления пинов и причин |
| `src/scenes/*.tsx` | сцены: Opening, Country, City, Logo |
| `tools/fetch_dem.py` | загрузка высот SRTM (Terrarium) |
| `tools/bake_maps.py` | рендер рельефа страны и ночного города в `public/` |
| `tools/trace_logo.py` | векторизация логотипа в `src/logo.json` |
| `tools/score.py` | музыка + звук + сведение с голосом → `public/soundtrack.wav` |

## Пересборка
```bash
npm install
# (опционально) обновить данные и карты
python3 tools/fetch_dem.py data   # нужны geojson Natural Earth в data/
python3 tools/bake_maps.py
python3 tools/score.py
# предпросмотр и рендер
npx remotion studio
npx remotion render Oxford8 out/oxford-filial-8.mp4 --crf=18
```

Если меняете координаты филиалов в `src/branches.json`, перезапустите `tools/bake_maps.py city`
— он пересчитает позиции пинов на карте.
