---
name: Songscription
description: A piano teacher's exercise book — a slow olive board under every readable thing, and every readable thing a paper page lying on it.
colors:
  board: "#39432f"
  board-deep: "#2b3324"
  board-soft: "#4b573c"
  paper: "#fefae0"
  paper-warm: "#faedcd"
  sheet: "#e9edc9"
  rule: "#ccd5ae"
  kraft: "#d4a373"
  kraft-deep: "#b4623a"
  graphite: "#2a3123"
  graphite-soft: "#4a5540"
  sage: "#a3b07c"
  sharp: "#5f6a53"
  sharp-used: "#7c8770"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(1.9rem, 4.4vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 2.1rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.011em"
  section:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  control:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  key:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.16em"
  meta:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  fine:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.1em"
rounded:
  paper: "3px"
  dialog: "4px"
  control: "5px"
  mark: "1.5px"
  blank: "2px"
spacing:
  hair: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  gutter: "24px"
  section: "36px"
  strata: "56px"
  lattice: "24px"
components:
  play-key:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.graphite}"
    typography: "{typography.key}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "52px"
  play-transport:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.graphite}"
    typography: "{typography.key}"
    rounded: "{rounded.control}"
    padding: "0 28px"
    height: "68px"
  frame-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.key}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "52px"
  frame-board:
    backgroundColor: "{colors.board}"
    textColor: "{colors.paper}"
    typography: "{typography.key}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "52px"
  button-reveal:
    backgroundColor: "{colors.board}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "40px"
  button-reveal-hover:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.graphite}"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-paper-hover:
    backgroundColor: "{colors.paper-warm}"
  button-board:
    backgroundColor: "{colors.board}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-board-hover:
    backgroundColor: "{colors.board-soft}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-soft}"
    typography: "{typography.meta}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "32px"
  bookmark-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-soft}"
    rounded: "{rounded.control}"
    size: "36px"
  bookmark-toggle-on:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.kraft-deep}"
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "40px"
  select-trigger:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "40px"
  card-page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.paper}"
    padding: "16px"
  header-label:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.paper}"
    padding: "12px 16px"
  shelf-band:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.paper}"
    padding: "10px 16px"
  blank:
    backgroundColor: "{colors.rule}"
    rounded: "{rounded.blank}"
  dialog-page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.dialog}"
    width: "min(1480px, calc(100vw - 1.5rem))"
---

# Design System: Songscription

## Overview

**Creative North Star: "The Piano Teacher's Exercise Book"**

The ground is board: the matte deep-olive cover of a working exercise book. It is painted by a WebGL
shader behind the whole page — the same olive, lifted where the light falls across it, warmed by a
held-back clay, drifting slowly enough to be a surface rather than a screensaver. Over it the
`.board` layer adds only the cover's fibre grain. Nothing readable is painted onto that ground.
Everything a learner reads is a *paper object lying on it* — squared manuscript stock, a quieter
second sheet, a kraft label glued across the top — separated from the board by a real shadow with
offset and blur. Paper has no outline, so no page is ever drawn with a stroke around it.

The system's density is high but unhurried: long serif lines for the things a learner reads, a tight
sans for every label, control and measured number. Controls are one family — a clay key inside four
printer's registration marks — so the primary act carries the world's own ornament rather than a
borrowed UI shape. State is a mark someone made, never a chip the system issued: a bookmark ribbon
marks the pages that are yours, ruled squares count rank, and the keyboard itself lights the notes
as they sound. Structure comes from flat planes and one light direction; soft shadow never stands in
for hierarchy.

Confirmed rejections, load-bearing: the page ground may **never** be a flat beige or cream field —
cream is paper here, never the room. Previously rejected and not to be revived: the industrial
stockroom, the white index card, the two-ink risograph, the cassette shell. No handwriting typeface.
The drawn ring that once circled the piece in progress was removed at the user's instruction and is
not part of this system.

**Key Characteristics:**
- A slow olive shader ground, full bleed, with `body` carrying no fill of its own
- Cream only ever as a bounded object on the board, lifted by offset-plus-blur shadow
- One control family: registration marks around a key, in two PLAY sizes (52px and 68px)
- A true 24px ruled lattice that content conforms to
- Two faces with two jobs: Literata reads, Archivo labels and measures
- One saturated colour on the page, spent on the PLAY key
- Loading is the page unwritten at its real measurements, never a spinner

## Colors

Five pinned paper tints over one olive board, with clay as the only saturated voice.

### Primary
- **Clay** (`{colors.kraft}`): the one fully saturated thing on the page. Reserved for the PLAY key,
  the kraft label and the kraft shelf band, the numbered step markers in the sheet, the face that
  turns over under a reveal control, and the fill of a saved bookmark.
- **Deep Clay** (`{colors.kraft-deep}`): the hand that carries the tune in both drawings and on the
  lit keyboard, focus outlines, the caret, the progress sweep, the meter, and the inline "Learning"
  mark in the long list.

### Secondary
- **Board Olive** (`{colors.board}`): the cover. It is the `<html>` fill (the canvas colour and the
  fallback when WebGL is unavailable), the centre of the shader's own colour range, the top and
  bottom scrim over the shader, the fill of the dark button and reveal control, and the last step of
  the difficulty ramp.
- **Board Deep** (`{colors.board-deep}`): the deep of the cover where it folds away — the shader's
  darkest stop, the preview strip, the scrollbar track, and the hairline under board-filled controls.
- **Board Soft** (`{colors.board-soft}`): board hover state and the scrollbar thumb.

### Neutral
- **Manuscript Paper** (`{colors.paper}`): every page. The card, the row, the dialog, the input and
  the select all sit on it. It is always an object with a shadow, never the field behind one.
- **Warm Paper** (`{colors.paper-warm}`): the second column of the open sheet and the hover state of
  paper-filled controls — a page turned slightly toward the light.
- **Quiet Sheet** (`{colors.sheet}`): the sheet's footer bar; the softest step of the difficulty ramp.
- **Ruling** (`{colors.rule}`): the 24px squares on manuscript stock, every hairline division inside
  a page, control borders, body copy set on the board, and the body of an unwritten blank.
- **Graphite** (`{colors.graphite}`): ink. All primary text on paper, the left hand in both drawings,
  and the middle-C bar in the keyboard's margin.
- **Soft Graphite** (`{colors.graphite-soft}`): secondary text, captions, field labels, icons at rest.

### Tertiary (drawing-only)
- **Sage** (`{colors.sage}`): step two of the difficulty ramp; used nowhere else.
- **Sharp** (`{colors.sharp}`): a black key nobody plays — still dark, deliberately not graphite, so
  the left hand's own colour never reads as "unplayed".
- **Sharp Touched** (`{colors.sharp-used}`): a black key the piece touches, in the resting survey.

### Named Rules
**The Paper-Is-Never-The-Room Rule.** The ground is board olive. Every cream, warm-paper or
quiet-sheet region must be a bounded object lying on that board, lifted by a shadow. *Audit test:*
screenshot the first viewport and colour-count it — the board must be the single largest region on
the screen, and every cream region must have a visible edge and a shadow. A cream tint that has
become the field the page is painted on has failed the world's one hard constraint. **This test is
currently failing on the shipped shelf; no cream proportion is permitted by this system.**

**The Ground-Carries-No-Fill Rule.** The shader ground is a `-z-10` child of `body`, and a
negative-z-index child paints *under* its parent's own background. `body` therefore carries
`background: transparent`, and the olive fallback lives on `<html>`. Any fill added to `body` — a
colour, a gradient, a texture — buries the ground. New surfaces inherit this: paint the ground in a
negative-z layer, never on the element that contains it.

**The One Saturated Thing Rule.** Full-strength clay is the page's only saturated colour and it is
spent on the act the page exists for — hearing the piece. Nothing decorative may take it.

**The Difficulty Ramp Law.** Rank is always the same five colours in the same order — ruling, sage,
clay, deep clay, board — running lightest paper to the cover itself. Unreached steps are drawn as
empty ruling, never switched off, and the word for the level always sits beside the marks. Colour
never carries rank alone.

**The Two Hands Rule.** Clay is the right hand and graphite is the left, in every picture of the
music — the pencilled drawing and the lit keyboard both. A key the piece never touches is neither:
white keys stay paper, black keys stay sharp olive, so both hands keep a colour of their own.

## Typography

**Display / Reading Font:** Literata (with Georgia, serif) — `--font-book`
**Label / Control Font:** Archivo (with ui-sans-serif, system-ui, sans-serif) — `--font-label`

**Character:** Literata is a screen-reading serif; it sets titles and every sentence a learner is
meant to absorb. Archivo is unambiguous at 12px rather than pleasant at 18, so it carries every
label, control and measured value. Numerals run tabular app-wide, so readings align down a column.

### Hierarchy
- **Display** (Literata 500, `clamp(1.9rem, 4.4vw, 3rem)`, 1.06, -0.022em): the title of the piece
  in progress, and the empty-book statement.
- **Headline** (Literata 500, `clamp(1.5rem, 3vw, 2.1rem)`, 1.1, -0.018em): the title of an opened
  sheet.
- **Title** (Literata 500, 19px, 1.2, -0.011em): card titles, the "Nothing matches" line, and the
  wordmark (at 600, -0.01em). A long-list row title steps down to 16px; the drop-zone prompt is one
  step above at 21px.
- **Section** (Literata 500, 17px): section heads on the kraft bands ("Your songs · 12", "Add a
  song"), the value of a fact in the sheet, and the empty-state lede (400, 1.65).
- **Body** (Literata 400, 15px, 1.6): prose a learner reads — approach steps, explanations, upload
  copy. Capped at 56–62ch.
- **Control** (Archivo 600, 14px): ordinary buttons, inputs, select triggers, filenames.
- **Key** (Archivo 600, uppercase, 0.16em): the framed control family. 13px in the 52px size, 15px
  in the 68px transport.
- **Meta** (Archivo 400, 13px; 13.5px for a card's composer line): summary lines, last-played
  readings, factor rows.
- **Fine** (Archivo 400, 12.5px): figure captions, the preview notice, the inline "Learning" mark
  (600, 0.08em), and the uppercase section heads inside the sheet (600, 0.11em).
- **Label** (Archivo 600, 11.5px, 0.1em, uppercase): the term of a fact ("KEY", "SPEED", "COUNT") —
  a name printed inside a fixed frame directly above the value it names.

### Named Rules
**The Fixed Ramp Rule.** The shipped ramp is exactly: 11.5, 12.5, 13, 13.5, 14, 15, 16, 17, 19,
21px, plus the two display clamps. A new surface picks from this list. Adding a size means amending
this section first.

**The Two Jobs Rule.** If a learner reads it as a sentence or a name, it is Literata. If it labels,
controls or measures, it is Archivo. Nothing is set in both.

**The Named Label Rule.** Uppercase tracked Archivo is only ever a label sitting *inside* its own
frame naming the value directly under it, a section head over its own block, or the face of a framed
control. It is never a kicker or eyebrow floating above a title.

## Layout

One centred column, `max-width: 1320px`, gutters 16px rising to 40px at md and 56px at lg, with 20px
of head room and 96px of tail. Vertical strata are real gaps, not dividers: 36px under the kraft
header, 56px under the piece in progress, 64px above the add-a-song block.

The hero page — the piece in progress — is inset to `max-width: 1080px` inside that column, so the
board reads as a field the page sits in rather than a margin around it.

The library is a card grid at `gap: 24px`, one column, two at sm (640px), three at xl (1280px) — a
three-up shelf, so a card stays wide enough for its drawing to be a shape rather than texture. Past
14 pieces the same data switches to a long list of full-width rows at 10px spacing, shedding the
drawing and the last-played column at the narrow end rather than shrinking them.

Kraft comes in two deliberate ranks, and they never read the same: the masthead label is **sized to
its content** (`w-auto`, self-start from sm up), the shelf band runs **full width**. A kraft strip
that spans the column is a section band; a kraft strip that hugs its words is a label glued on.

Manuscript stock carries a true 24px lattice (`background-size: 24px 24px`) drawn in ruling over
paper. Drawings sit *on* the ruling, and padding inside a squared region is chosen so the content
lands on the squares rather than across them; the lattice does not flex to fit content.

## Elevation & Depth

Hybrid, with a single rule behind it: paper lies on board, so depth is a cast shadow plus one light
direction — never a stroke around a surface, never a hard block offset. Every page uses the same
two-part shadow (a tight contact shadow plus a wide soft one), so the whole library reads as sheets
at one height. The ground beneath them moves: the shader runs at `timeScale: 0.11` with `drift:
0.035`, roughly an eighth of the speed of the portfolio it was ported from, with `vignette: 0.44`
and `grain: 0.14`, under a vertical scrim of board at 20% falling to board at 40%.

Framed controls carry a fuller edge than a plain surface: an inset light top edge and an inset
darker bottom edge, so the key reads as label stock glued down rather than a rectangle floating.

### Shadow Vocabulary
- **Lift 1** (`var(--lift-1)` = `0 1px 1px rgba(24,30,18,0.2), 0 6px 14px -6px rgba(24,30,18,0.38)`):
  the resting height of every page, row, control and label strip.
- **Lift 2** (`var(--lift-2)` = `0 2px 3px rgba(24,30,18,0.22), 0 18px 34px -12px rgba(24,30,18,0.5)`):
  the piece in progress at rest, a card on hover, and open popovers.
- **Held to the light** (`0 4px 8px rgba(24,30,18,0.3), 0 40px 80px -24px rgba(24,30,18,0.65)`):
  the opened sheet only, over a `rgba(24,30,18,0.66)` board scrim.
- **Glued edges** (`inset 0 1px 0 rgba(255,253,244,0.5), inset 0 -1px 0 rgba(24,30,18,0.16)`): the
  framed control family — light on the top edge, glue-shadow on the bottom.
- **Light edge** (`inset 0 1px 0 rgba(255,253,244,0.45)`, 0.7 white on paper, 0.18 ruling on board):
  the top edge of a plain printed control.
- **Pressed** (`inset 0 1px 3px rgba(24,30,18,0.26)`): active state; replaces the lift and the
  control moves 1px into the board.
- **Sounding** (`drop-shadow(0 0 7px <hand colour>aa)`): the only glow in the system, and it is not
  chrome — it is a key being struck. Nothing else may use it.

### Named Rules
**The No-Outline Rule.** Paper is never outlined. A border in ruling is permitted only *inside* a
page, as a ruled division between its parts (head, drawing, foot) — never around its perimeter.

**The One Light Rule.** Light falls from the top. Highlights sit on top edges, shadows fall down and
out. No glow, no ring, no shadow used to imply rank instead of height — the sounding-key glow is the
single exception, and it exists because a struck key emits.

## Shapes

Radii are small and paper-like: a page is 3px, the opened sheet 4px, every control 5px, a difficulty
mark 1.5px, an unwritten blank 2px, focus outlines round at 3px. Only the numbered step markers and
the upload progress bar are fully round, because both are counters rather than surfaces.

Surfaces are flat planes with texture, not gradients used as decoration: the `.board` layer carries a
fine fractal-noise grain at 0.1 opacity over the shader, and kraft carries its own at 0.12. The
recurring silhouette is the **crop mark**: four fine corner rules at 1.25 stroke, offset 6–7px
outside a control, pulling a further 4px outward on hover. They are printer's registration marks —
the marks on a sheet that say where the page is — and they are the system's one ornament, used only
to frame a control, never as decoration on a surface.

Icons are lucide outline strokes at `strokeWidth` 1.75 (2 for chevrons inside controls, 1.25 for
registration marks), 16–22px; the play and stop glyphs and a saved bookmark are the only filled marks.

## Components

### Buttons
There is one control family and one fallback family. The family is the **framed control**: kraft
label stock with its own grain, an inset light top edge, a darker glued bottom edge, four
registration marks at the corners, uppercase tracked Archivo, a pressed-in inset on `:active`, and a
focus outline at 6px offset so the marks stay clear of it. It comes in clay, paper, board and
outline skins.

- **Shape:** near-square with a softened corner (5px), a hairline border in its own colour darkened.
- **Primary — the clay key:** clay fill, graphite text. Two sizes are the signature: `key` at 52px
  tall / 20px side padding on a card, `transport` at 68px / 28px beside the piece in progress. Hover
  brightens the stock 5%; active swaps to the press inset and moves 1px down.
- **Reveal (secondary act):** 40px, board fill, paper text. The face turns over on hover — the
  visible label is what the control *is*, the label that wipes up in clay beneath is what it *will
  do*. It is only worth its animation where those are two different sentences; a reveal that says
  the same thing twice is decoration with a transition on it.
- **Paper:** paper fill, ruling border, warm-paper hover — the quiet affirmative inside a page.
- **Board:** board fill, paper text, board-soft hover — the heavier of two choices on a page.
- **Quiet / Quiet-on-board:** no fill, no border, soft graphite (or ruling on board); hover washes in
  ruling at 45% and darkens the text. Does not move on press.
- **Link:** deep clay, underlined in clay at 5px offset, underline darkens on hover.
- **Focus:** 2px deep-clay outline at 2px offset (6px on framed controls). Never a ring or glow.
- **Sizes:** 32 / 40 / 48px, plus the two PLAY sizes; icons scale 15 → 22px with the size.

### Cards / Containers
- **Corner style:** 3px, the corner of a cut page.
- **Background:** paper, with the top region on squared manuscript stock divided from the caption by
  a ruling hairline.
- **Shadow strategy:** Lift 1 at rest; hover raises 3px into Lift 2 over 200ms. Cards lay down on
  first paint with a 35ms stagger, capped at the 12th card.
- **Border:** none around the page. Ruling hairlines inside it only.
- **Internal padding:** 16px, with 16px of squared region above the drawing and 12–16px below.

### Inputs / Fields
- **Style:** 40px tall, paper fill, ruling border, 5px corner, 14px Archivo, with an inset top shadow
  so the field reads as pressed into the page rather than floating on it.
- **Focus:** 2px deep-clay outline at 2px offset; the caret is deep clay.
- **Search:** leading 16px search stroke at 12px inset; a trailing `Ctrl F` key cap in 11.5px inside
  a ruling hairline, which swaps to a clear button once the field has content.
- **Select:** same shell as the input plus Lift 1 and a warm-paper hover; the menu is paper at Lift 2
  with a 5px corner.
- **Disabled:** 50% opacity, no cursor. Buttons disable at 45%.

### Navigation
There is no nav bar. The only persistent chrome is the **kraft masthead label**: a kraft-textured 3px
strip at Lift 1, 12/16px padding, sized to its own content and set to the left, carrying the wordmark
at 19px Literata 600 and the search field (320px from sm up).

### The PLAY key
The signature component. Hearing the piece is the only way a beginner can judge it, so the control is
sized as the primary act of the page and is the only fully saturated thing on it. It states "PLAY IT"
with a filled triangle, and swaps to "STOP" with a filled square while sounding — the same key, never
a second control. Its registration marks are what make it belong to this world rather than to a UI kit.

### The bookmark
The ribbon you leave in a book: hollow when the page is ordinary, filled in clay inside a clay-tinted
36px frame when it is one of yours. It appears on the card, the long-list row, the opened sheet and
the hero, backed by `is_favourite`, and the shelf band carries a **Saved** filter that shows only
those pages. **The bookmark glyph means favourite and nothing else.** It is deliberately not the
brand mark; a bookmark used as a logo would make every saved page read as branding.

### The keyboard that plays
A full 88-key piano, in two states. At rest it is a **survey**: every white key the piece touches is
inked at 50% in its hand's colour, every black key it touches lifts to sharp-touched, so you can see
how much of the instrument you are being asked to cover. The moment it plays the survey clears and
the keyboard becomes the **performance**: only the notes actually sounding are lit at full strength
with the sounding glow — clay for the right hand, graphite for the left. Unplayed black keys stay
sharp olive, never graphite. Middle C is a graphite bar pencilled in the margin *below* the keys, so
nothing is ever drawn on top of it. White keys carry a ruling hairline; fill-opacity crossfades over
140ms while a sounding key switches instantly.

### The drawing
Notes barred left to right on manuscript stock — graphite at 0.88 opacity below middle C, deep clay
above, bar height derived from the piece's own range. At card size only the opening is drawn and then
stretched back over the full width, so the drawing keeps its scale instead of being squeezed.
Captioned in 12.5px beneath.

### The difficulty marks and the meter
Five 11px squares at 1.5px radius, filled along the ramp law with an inset graphite hairline;
unreached squares are empty ruling outlines. The sheet's factor readings use the identical device at
10 squares of 9px in deep clay — one chart language for the whole system, so no second chart
vocabulary is ever needed.

### Blanks (loading)
A loading state is the page it stands in for, unwritten, at its real measurements: the real sheet,
the real squared region, the real kraft band, with every written line replaced by a ruling blank at
45% and a 2px corner. A slow 1.8s paper-coloured wash crosses it. On kraft the blank is graphite at
15%; on board it is paper at 25%.

### The moving ground
A WebGL shader fixed behind the page at `-z-10`, ported from the author's portfolio and re-pigmented
to the board's own range: board deep, board, board lifted, and one held-back clay. Slow by
construction (`timeScale: 0.11`, `drift: 0.035`). A vertical board scrim (20% → 40%) steadies the
contrast under the paper, and the `.board` fibre grain sits over it. Board olive on `<html>` is the
fallback wherever WebGL is unavailable, so the world degrades to a flat cover rather than to white.

## Do's and Don'ts

### Do:
- **Do** paint the ground as a negative-z layer and leave `body` transparent; the olive fallback
  lives on `<html>`.
- **Do** give every readable region a page to lie on: paper fill, 3px corner, Lift 1, no outline.
- **Do** build controls as the framed family — registration marks, glued edges, uppercase tracked
  Archivo — and spend full-strength clay only on the act the surface exists for.
- **Do** run difficulty and every other rank through the five-colour ramp law, with the word beside it.
- **Do** set sentences in Literata and every label, control and number in Archivo, from the fixed ramp.
- **Do** land drawings and squared regions on the 24px lattice rather than resizing the lattice.
- **Do** keep clay for the right hand and graphite for the left in every picture of the music.
- **Do** make a loading state the real page unwritten at its real measurements.
- **Do** put a 2px deep-clay focus outline on every interactive element (6px offset on framed controls).

### Don't:
- **Don't** let cream, warm paper or quiet sheet become the field a surface is painted on. If a cream
  region has no edge and no shadow, it has become the room and must be reworked.
- **Don't** give `body` a background of any kind; it buries the ground.
- **Don't** outline a page. Ruling hairlines belong inside a sheet, dividing its parts.
- **Don't** use a hard block offset shadow, a glow, or a focus ring; depth is offset-plus-blur with
  light from above, and the only glow is a key that is sounding.
- **Don't** add a third typeface, a handwriting face, or a system display face.
- **Don't** introduce a font size outside the fixed ramp without amending Typography first.
- **Don't** issue state as a system badge or pill where a mark can carry it.
- **Don't** invent a second chart language; ruled squares out of five or ten already measure rank.
- **Don't** put a small uppercase label above a title as a kicker or eyebrow; a label names the value
  directly under it, inside its own frame, or is the face of a control.
- **Don't** use glyph or emoji icons; icons are lucide outline strokes at 1.75 weight.
- **Don't** reuse the bookmark as a brand mark, or spend it on anything but "saved".
- **Don't** ship a spinner as a page-level loading state.
- **Don't** let a stock control shape sit inside a kraft band without the frame family's treatment.
