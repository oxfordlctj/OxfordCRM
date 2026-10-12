// Positions are on the stylised Dushanbe map (1080x1920 frame), not GPS.
export type Branch = {
  id: number;
  name: string;
  address: string;
  x: number;
  y: number;
  side: "left" | "right";
};

export const BRANCHES: Branch[] = [
  { id: 1, name: "Садбарг", address: "ул. Айни 46", x: 650, y: 880, side: "right" },
  { id: 2, name: "Гулистон", address: "ул. Н. Карабаева 26", x: 300, y: 690, side: "left" },
  { id: 3, name: "Мардон", address: "ул. Борбад 101", x: 245, y: 1010, side: "left" },
  { id: 4, name: "Гипрозем", address: "ул. Сомон 100", x: 520, y: 540, side: "right" },
  { id: 5, name: "82 мкр", address: "ул. Б. Гафурова 26", x: 330, y: 1290, side: "left" },
  { id: 6, name: "Сельхоз институт", address: "ул. Карамова 6", x: 690, y: 650, side: "right" },
  { id: 7, name: "ОВИР", address: "ул. М. Курбонова 1А", x: 450, y: 860, side: "left" },
];

export const NEW_BRANCH = {
  id: 8,
  name: "Шохмансур",
  address: "мкр. Зарафшон",
  x: 790,
  y: 1230,
};

export const COVER_R = 150;

export const REASONS = [
  {
    from: 0,
    to: 35,
    prefix: "+",
    suffix: "%",
    title: "Самый быстрорастущий район",
    text: "Новые жилые комплексы и тысячи молодых семей",
  },
  {
    from: 0,
    to: 14,
    prefix: "",
    suffix: " школ",
    title: "в радиусе 2 км",
    text: "Тысячи учеников, которым нужен английский рядом с домом",
  },
  {
    from: 40,
    to: 7,
    prefix: "",
    suffix: " мин",
    title: "вместо 40 минут в пробках",
    text: "Теперь до Oxford можно дойти пешком",
  },
];
