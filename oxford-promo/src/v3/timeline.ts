import data from "./timeline.json";

export const FPS = data.fps;
export const DURATION = data.duration;
export const SCENES = data.scenes;
export const VO = data.vo;

export type VoKey = keyof typeof VO;

/** Russian on-screen captions mirroring the voice-over. */
export const CAPTIONS: { key: VoKey; text: string; dur: number }[] = [
  { key: "s07", text: "Здесь уже работают семь наших филиалов", dur: 3.0 },
  { key: "s09", text: "Мы искали место, куда легко добраться из любой точки города", dur: 5.0 },
  { key: "s15", text: "Рядом Алфемо — сюда каждый день приходят тысячи людей", dur: 6.2 },
];
