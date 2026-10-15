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

## A+ Kids — школа тайёрӣ (Instagram Reel)

- Готовое видео: `final/APlus-Kids-Reel.mp4` (1080×1920, 30 fps, 55.5 s)
- Озвучка (таджикский, ElevenLabs v3): `public/vo2.mp3`
- Музыка/SFX синтезированы скриптом `scripts/make_music.py`, затем приглушены под голос (sidechain) → `public/music_duck.wav`
- Тайминги всех надписей синхронизированы с голосом в `src/theme.ts` (объект `VO` — начала слов из транскрипции ElevenLabs Scribe)

Рендер: `npx remotion render APlusReel out/APlus-Kids-Reel.mp4`
