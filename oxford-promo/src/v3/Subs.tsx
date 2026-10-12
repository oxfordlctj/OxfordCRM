import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BODY, COLORS, ip } from "../theme";
import { VO } from "./timeline";
import durations from "./vo-durations.json";

const TEXT: Partial<Record<keyof typeof VO, string>> = {
  s01: "Семь филиалов.",
  s02: "Тысячи студентов.",
  s03: "Один большой Oxford.",
  s04: "И мы продолжаем расти.",
  s05: "Это Таджикистан.",
  s06: "Его сердце — Душанбе.",
  s07: "Здесь уже работают семь наших филиалов.",
  s08: "Но где откроется восьмой?",
  s09: "Мы искали место, куда легко добраться из любой точки города.",
  s10: "И нашли его.",
  s11: "Домпечать. Рядом с Алфемо.",
  s12: "Почему именно здесь?",
  s13: "Первое. Это самый центр Душанбе.",
  s14: "Второе. Здесь сходятся главные маршруты города.",
  s15: "Третье. Рядом Алфемо — место, куда каждый день приходят тысячи людей.",
  s16: "Oxford. Филиал номер восемь.",
  s17: "Скоро открытие. Запишись первым!",
};

/** Subtitles for viewers watching without sound. */
export const Subs: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const key = (Object.keys(TEXT) as (keyof typeof VO)[]).find((k) => t >= VO[k] - 0.1 && t <= VO[k] + (durations as Record<string, number>)[k] + 0.2);
  if (!key) return null;
  const s = VO[key];
  const d = (durations as Record<string, number>)[key];
  const o = ip(t, [s - 0.1, s + 0.08, s + d, s + d + 0.2], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", bottom: 110, maxWidth: 920, textAlign: "center", padding: "12px 26px", borderRadius: 16, background: "rgba(3,8,20,0.6)", fontFamily: BODY, fontWeight: 700, fontSize: 38, lineHeight: 1.25, color: COLORS.white, opacity: o }}>{TEXT[key]}</div>
    </AbsoluteFill>
  );
};
