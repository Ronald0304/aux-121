---
name: Portfolio Anime
description: Portfolio full-stack con estética de plataforma de anime, llamativo y lleno de color.
colors:
  night: "#0e0a1f"
  night-2: "#17112f"
  panel: "#221a45"
  panel-2: "#2d2358"
  line: "#3b3070"
  text: "#f7f3ff"
  muted: "#b9addc"
  pink: "#ff3d8b"
  pink-2: "#ff6aa8"
  pink-deep: "#d6176a"
  sun: "#ffcc29"
  sky: "#23d5e6"
  violet: "#7a5cff"
  mint: "#3ee8b5"
typography:
  display:
    fontFamily: "Dela Gothic One, Zen Kaku, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 7vw, 5.6rem)"
    fontWeight: 400
    lineHeight: 0.98
  headline:
    fontFamily: "Dela Gothic One, Zen Kaku, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 4.4vw, 3.2rem)"
    fontWeight: 400
    lineHeight: 1.04
  body:
    fontFamily: "Zen Kaku, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "Zen Kaku, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 900
    letterSpacing: "0.06em"
rounded:
  badge: "6px"
  field: "12px"
  poster: "14px"
  panel: "24px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  section: "clamp(56px, 8vw, 96px)"
components:
  button-primary:
    backgroundColor: "{colors.pink-deep}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
    height: "46px"
  button-sun:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.night}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-ghost:
    backgroundColor: "rgb(255 255 255 / 0.12)"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
  chip-active:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.night}"
    rounded: "{rounded.pill}"
  field:
    backgroundColor: "{colors.night}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    height: "48px"
---

# Design System: Portfolio Anime

## Overview

**Creative North Star: "Estreno de temporada"**

The portfolio reads like an anime streaming catalogue: a hero carousel of featured "series" (projects) with full-bleed key art, a ranked "Top de la semana" row with giant outlined numbers, a filterable catalogue of 2:3 posters, a character sheet with stat bars, experience as numbered seasons, comments and an "¿Siguiente episodio?" contact banner. The look is its own, not a copy of any platform: no third-party logos, names or art.

All key art is procedural SVG (`public/js/art.js`): a gradient sky, a retro striped sun, speed lines, sparkles, a city / mountain / wave silhouette, halftone dots and a katakana watermark. Each project gets a stable palette and composition from its slug, so new projects get new art automatically.

**Key Characteristics:**
- Deep night-indigo ground; colour arrives in full-bleed key art, not as scattered accents.
- Hot pink + sun yellow as the two brand voices; sky, violet and mint for supporting roles.
- Dela Gothic One for every headline; Zen Kaku Gothic New for body and UI.
- Manga-panel accents: hard offset shadows on the brand mark, the contact form and the pitch box (intentional, part of the world).

## Colors

- **Night** (#0e0a1f): page ground. **Night-2** (#17112f) and **Panel** (#221a45 / #2d2358): raised surfaces, chips, bubbles.
- **Pink** (#ff3d8b): accents, outlines, rank numbers, focus of attention. **Pink-deep** (#d6176a): any fill that carries white text (buttons, badges), for 4.6:1 contrast.
- **Sun** (#ffcc29): secondary CTA ("Contrátame"), active filters, stat numbers, the contact section ground.
- **Sky** (#23d5e6), **Violet** (#7a5cff), **Mint** (#3ee8b5): organisation names, stat fills, the "Disponible" status.
- **Text** (#f7f3ff) and **Muted** (#b9addc) on night surfaces.

**The White-on-Pink Rule.** White text never sits on #ff3d8b; use pink-deep.

## Typography

- **Display** Dela Gothic One, 400, clamp(2.6rem, 7vw, 5.6rem), line-height 0.98: hero titles.
- **Headline** Dela Gothic One, clamp(1.9rem, 4.4vw, 3.2rem): section titles, underlined by a pink/sun bar.
- **Body** Zen Kaku Gothic New 500, 1rem/1.6. **Label** Zen Kaku 900, 0.8rem, uppercase, +0.06em.
- A kana subset of Dela Gothic One (`dela-gothic-one-kana.woff2`, U+3000–30FF) covers the decorative katakana and hiragana.

## Elevation & motion

- Posters lift 8px and tilt −1° on hover, with a pink ring and a dark drop shadow (no coloured glows).
- Hero slides change with a diagonal wipe (clip-path, 900ms, ease-out) while the art slowly zooms out; autoplay every 7s with a progress bar on the active thumbnail; it pauses on hover, on focus and when the tab is hidden.
- Stat bars fill on scroll. Liking a project pops the heart icon with a spring.
- `prefers-reduced-motion` disables all of it.

## Components

- **Poster** 2:3, radius 14px, key art + title + year/genre, likes badge top right, synopsis overlay on hover.
- **Badge** radius 6px, 900 weight: yellow, pink-deep, or outlined.
- **Buttons** pill, 46px: pink-deep (primary), sun (secondary), ghost (outline over art).
- **Field** night fill, 2px line border, radius 12px, pink focus ring.
- **Detail dialog** native `<dialog>` with a 16:7 key-art banner and a pink 3px frame.

## Do's and Don'ts

- Do give every new project a slug; that is what seeds its art.
- Don't use a real platform's logo, name or artwork, or any anime character art you do not own.
- Don't add coloured glow shadows; depth comes from dark shadows and the pink ring.
