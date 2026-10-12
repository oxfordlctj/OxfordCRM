import data from "./timeline.json";

export const FPS = data.fps;
export const DURATION = data.duration;
export const SCENES = data.scenes;
export const VO = data.vo;
export const HITS = data.hits;

/** seconds -> frames */
export const sf = (s: number) => Math.round(s * FPS);

/** Local seconds inside a scene, for a given global time in seconds. */
export const CITY0 = SCENES.city[0];
export const MAP0 = SCENES.map[0];

export const SUBTITLES: { key: keyof typeof VO; text: string; dur: number }[] = [
  { key: "v01", text: "Семь филиалов.", dur: 1.3 },
  { key: "v02", text: "Тысячи студентов.", dur: 1.9 },
  { key: "v03", text: "Один город.", dur: 1.1 },
  { key: "v04", text: "Но Oxford не останавливается.", dur: 2.6 },
  { key: "v05", text: "Из сердца Таджикистана…", dur: 2.5 },
  { key: "v06", text: "…в сердце Душанбе.", dur: 2.1 },
  { key: "v08", text: "Семь филиалов по всему городу.", dur: 2.6 },
  { key: "v09", text: "А теперь…", dur: 1.0 },
  { key: "v10", text: "…филиал номер восемь.", dur: 1.5 },
  { key: "v11", text: "Домпечать. Рядом с Алфемо.", dur: 2.7 },
  { key: "v12", text: "Почему здесь?", dur: 0.9 },
  { key: "v13", text: "Это самый центр Душанбе.", dur: 2.6 },
  { key: "v14", text: "Здесь проходят все главные маршруты.", dur: 2.6 },
  { key: "v15", text: "До нас легко добраться из любого района.", dur: 2.7 },
  { key: "v16", text: "Oxford. Филиал номер восемь.", dur: 2.1 },
  { key: "v17", text: "Скоро открытие. Запишись первым.", dur: 2.7 },
];
