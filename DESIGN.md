---
name: Portafolio WebGL · Ronald Gutiérrez Mamani
description: Galería WebGL curva con lente de vidrio, dispersión RGB y luces de borde, en una sola pantalla.
colors:
  base: "#0f0e14"
  txt: "#e7e4ee"
  mute: "rgba(231,228,238,.56)"
  label: "rgba(231,228,238,.62)"
  block: "#0b0b0f"
typography:
  display:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "4.5vw"
    fontWeight: 400
    letterSpacing: ".02em"
  ui:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "max(9px, .74vw)"
    fontWeight: 400
    letterSpacing: ".04em"
rounded:
  card: "4.8% of card width"
  media: ".6vw"
spacing:
  card-width: ".174 × viewport width"
  pitch: ".1786 × viewport width"
---

# Design System: Portafolio WebGL

## Overview

**Creative North Star: "Laboratorio bajo vidrio"**

One fixed full-screen canvas. The projects sit in a strip of poster cards bent into a "smile" (tallest at the centre, stepping shorter outward). The whole frame is seen through a rounded glass slab: the edges refract and split RGB, and three independent red, green and blue light patches drift around the rim and mix into pastel mint, cyan, blue, lavender and pink. Everything else is quiet monospace UI on a near-black field. Motion is scroll-driven only, with eased inertia. Only the edge lights and the 3D cross move on their own.

Built from the brief at motionsites.ai ("experiments-gallery"), translated to Spanish and to a UMSA informatics student's portfolio. The reference's image and video assets were replaced by:
- posters generated on a 2D canvas per project (glitch, metaball, dither, pixel sigil, wireframe planet, halftone);
- a three.js 3D cross.

## Colors

- **Base** #0f0e14 for the page. The WebGL background lerps `uBase` between the palette presets NEGRO, ROJO, VERDE (default), AMARILLO and AZUL.
- **Txt** #e7e4ee for all UI. **Mute** at 56% for secondary text; card labels at 62%.
- Colour otherwise lives only in the project posters and the rim light.

## Typography

JetBrains Mono 400/500 everywhere. UI text is uppercase at max(9px, .74vw), +.04em. The title is 4.5vw (10vw on mobile), `white-space: pre`.

## Motion

- `pos += (target - pos)·(1 - .88^(dt·30))`.
- Block reveal 5×7 over 750 ms when a card enters the view.
- The title scrambles every 3rd frame while moving.
- The grid morph uses `1 - .88^(dt·60)`.
- Overlays open with `clip-path: inset(50% 0)` → `inset(0)` over .7s `cubic-bezier(.77,0,.18,1)`.
- Link underlines scale over .45s `cubic-bezier(.16,1,.3,1)`.

## Components

- **Card:** rounded-SDF quad with 48 segments, block-reveal glitch, +8% brightness and 1.5% scale on hover.
- **Label:** tilted to the card's top edge.
- **Overlay:** two columns, one on mobile.
- **Toast:** centred, 1.8 s.
- **Palette list:** active item gets a "▪ " prefix.
