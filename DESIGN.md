---
name: Fichero
description: Portfolio full-stack construido como un fichero de biblioteca que funciona.
colors:
  cabinet-green: "#1e4d3c"
  cabinet-deep: "#123226"
  cabinet-highlight: "#2b6550"
  on-cabinet: "#eef4ec"
  on-cabinet-muted: "#b8d2c2"
  brass: "#c9a24a"
  brass-low: "#876720"
  brass-high: "#f0dc9c"
  card-stock: "#fdfdfa"
  card-shade: "#eeefe8"
  typewriter-ink: "#23242c"
  ink-muted: "#545766"
  margin-red: "#d94a3d"
  stamp-violet: "#5b3db0"
  guide-salmon: "#f2957a"
  guide-mustard: "#e6b53d"
  guide-cobalt: "#3563d6"
  guide-lilac: "#b7a3ec"
  guide-sage: "#9fcf9a"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5.2vw, 3.9rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 122"
  card-title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 3.6vw, 2.7rem)"
    fontWeight: 800
    lineHeight: "56px"
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 118"
  typed:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: "28px"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.2
    fontVariation: "'wdth' 112"
rounded:
  card: "3px"
  tab: "5px 5px 0 0"
spacing:
  ruled-line: "28px"
  card-edge: "8px"
  gutter: "clamp(16px, 4vw, 56px)"
  section: "clamp(72px, 11vw, 140px)"
components:
  button-stamp:
    backgroundColor: "{colors.stamp-violet}"
    textColor: "{colors.card-stock}"
    rounded: "{rounded.card}"
    padding: "10px 16px"
    height: "42px"
  button-ink:
    backgroundColor: "{colors.typewriter-ink}"
    textColor: "{colors.card-stock}"
    rounded: "{rounded.card}"
    padding: "10px 16px"
  button-salmon:
    backgroundColor: "{colors.guide-salmon}"
    textColor: "{colors.typewriter-ink}"
    rounded: "{rounded.card}"
    padding: "10px 16px"
  index-card:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.typewriter-ink}"
    typography: "{typography.typed}"
    rounded: "{rounded.card}"
  label-holder:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.typewriter-ink}"
    padding: "4px"
---

# Design System: Fichero

## Overview

**Creative North Star: "El fichero que funciona"**

The whole site is one steel card cabinet in green enamel: you open a drawer, pull out an index card by its tab and stamp it. Every dynamic feature maps to a real catalogue object: projects are catalogue cards, applause is a date stamp, the guestbook is a circulation card, contact is a call slip, skills are subject headings on drawer fronts, the admin is the front desk ("Mostrador").

The density is a working catalogue's: typed entries on a strict 28px ruled grid, set against a saturated enamel field that owns the page. Colour is committed, not accented: the green is the ground, and the guide-card stock (salmon, mustard, cobalt, lilac, sage) carries whole surfaces such as the loan slip and the circulation card.

**Key Characteristics:**
- Committed cabinet-green field; white card stock with a red margin rule and pale blue lines.
- Typed text (Courier Prime) only where a catalogue would type it: entries, dates, call numbers, form blanks.
- An expanded heavy grotesque (Archivo, wdth 112–122) for section headings and labels.
- Violet rubber-stamp ink for dates and confirmations, roughened by one SVG ink filter.

## Colors

### Primary
- **Cabinet Green** (#1e4d3c): the page ground and the drawer fronts. Deep (#123226) for the interior of the cabinet; highlight (#2b6550) for the enamel sheen at the top of each drawer front.
- **Card Stock** (#fdfdfa): every surface you read closely: index cards, the register, call slips.

### Secondary
- **Stamp Violet** (#5b3db0): date stamps, the "Sellar" button, folio numbers. Use the deeper #3a2380 on salmon stock and #35207a on mustard stock, where the base violet fails contrast.
- **Brass** (#c9a24a, low #876720, high #f0dc9c): the label holders and drawer pulls only.

### Tertiary: guide-card stock
- **Salmon** (#f2957a), **Mustard** (#e6b53d), **Cobalt** (#3563d6), **Lilac** (#b7a3ec), **Sage** (#9fcf9a): tabs and their cards' top edges, assigned per project category in order of appearance. Salmon is also the primary call to action ("Solicitar", "Entregar papeleta").

### Neutral
- **Typewriter Ink** (#23242c) and **Ink Muted** (#545766) on card stock.
- **On Cabinet** (#eef4ec) and **On Cabinet Muted** (#b8d2c2) on the green field. Nav links use #d6e7dc to hold 4.5:1 against the enamel highlight.
- **Margin Red** (#d94a3d) for the card's header rule and register dividers.

### Named Rules
**The Real Object Rule.** A new feature becomes a catalogue object before it becomes a component. If no library object fits, it is plain typed text on card stock, never a generic card.

**The Ruled Grid Rule.** Inside an index card, every line box is a multiple of 28px, so typed text sits on the printed lines.

## Typography

**Display font:** Archivo (variable, width 62–125%), self-hosted.
**Typed font:** Courier Prime, self-hosted.

**Character:** A wide, heavy library-signage grotesque over typewritten entries. The monospace face stands for the typewriter that typed real catalogue cards; it is never used as a "technical" costume.

### Hierarchy
- **Display** (800, wdth 122, clamp 2–3.9rem, 0.98): section titles on the green field.
- **Card title** (800, wdth 118, clamp 1.7–2.7rem, 56px line): the title on each index card, two ruled lines tall.
- **Typed** (400/700, 1.02rem, 28px line): all card content, dates, tables, form blanks.
- **Body** (400, 1rem, 1.55): section intros on the green field.
- **Label** (700, wdth 112, 0.8rem): table headers, slip headers, form labels.

## Elevation

Cards and sheets are lifted from the enamel by one soft, offset shadow (`0 24px 40px -24px rgb(0 0 0 / .6)`). Cards stacked in the drawer move up by 8px per depth (`--edge`), so their coloured top edges show as a stack of slivers above the front card. Brass parts get a 1px inner highlight. There are no glows or hard offset shadows.

## Components

- **Index card**: white stock with a 4px top edge in its category colour, a red rule under the first typed line, blue lines every 28px, and a rod hole centred at the bottom. Layout: call number column on the left, hanging-indent entry on the right.
- **Tab**: a guide-card tab in its category colour, with the accession number typed above the title. The selected tab sits lowest and attaches to the front card.
- **Label holder**: a brass frame around a white typed label, used for the site name and the subject-heading drawers.
- **Stamp**: violet text inside a double-ruled box, rotated −9° to +9° (stable per date), with the `#ink` SVG filter and multiply blend.
- **Blank**: a form field drawn as a label plus a dashed underline (call slip) or a solid ink underline (circulation card).
- **Buttons**: stamp violet (stamp), ink (sign, sign in), salmon (submit a request). 3px radius, 42px tall.

## Do's and Don'ts

- Do keep the cabinet green as the page ground on every surface, the admin included.
- Do give any new animation the motion of a physical object: a card pulled up and dropped, a stamp coming down.
- Don't add gradients, glass or neon. The only gradients are the enamel sheen and the brass frame.
- Don't put the base stamp violet on salmon or mustard stock; use the deeper variants above.
