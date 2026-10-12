# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i --loglevel=error
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

## Oxford — 8-й филиал (v3, 2D)

Вертикальный ролик 1080×1920, 60 секунд, композиция `OxfordBranch8`.
2D-моушн: кинетическая типографика, фото, карта Таджикистана и схема Душанбе,
объяснение выбора места (центр, маршруты, Алфемо). Русская озвучка (RHVoice, голос «Александр»),
субтитры, музыка и звуковые эффекты синтезированы под каждый кадр.

- Тайминг сцен, озвучки и звуков: `src/v3/timeline.json`
- Филиалы и схема города: `src/v3/cityMap.tsx`
- Эффекты (глитч, расшифровка текста, маркер, вспышки, конфетти): `src/v3/fx.tsx`
- Фото: `public/photos/` (стоковые, заменяются на свои с теми же именами)
- Озвучка: `audio-src/voiceover_ru.py`, музыка и сведение: `audio-src/soundtrack.py`
- Рендер: `REMOTION_CHROME=/path/to/chrome npx remotion render OxfordBranch8 out/oxford-branch8.mp4`
