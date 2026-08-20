# Pawsome brand

Pawsome is a Chrome extension that puts a little animated pet — a dog or a cat — at the bottom of every webpage. This file is the source of truth for color, type, logo, and voice. Machine-readable tokens live in [`brand/tokens.json`](brand/tokens.json). Do not invent hex values or copy that is not listed here.

Tagline: **A little pet for every tab.**

## Palette

| Token | Hex | Use |
|---|---|---|
| `violet` | `#6C4CE0` | Primary brand, paw mark, links |
| `violetDeep` | `#43299B` | Wordmark, dark surfaces, hover |
| `mango` | `#FFB13D` | Accent, energy, treats |
| `blush` | `#FF7A9C` | Paw pads, tongues, hearts |
| `cream` | `#FFF6EC` | Light background |
| `ink` | `#241C3B` | Text, eyes, outlines |
| `muted` | `#7A7396` | Secondary text |

Do not use the old salmon/cream Hello Puppy palette (`#FF8A8A`, tan `#E0A86A`, brown `#C68642`).

## Mascot coats

Warm dog and cool cat, so the two species read as siblings rather than clones. Shared ink for eyes and noses.

| Token | Hex | Use |
|---|---|---|
| `dogCoat` | `#F9931D` | Classic Shiba Inu body, head, tail |
| `dogShadow` | `#F5871D` | Classic Shiba far legs, tail underside |
| `dogMuzzle` | `#FDE393` | Classic Shiba mask, chest, inner ears |
| `dogPaw` | `#FBE495` | Classic Shiba paws |
| `dogInk` | `#3D1200` | Classic Shiba eyes, nose, mouth, collar |
| `dogBlush` | `#EE2721` | Classic Shiba cheeks and tongue |
| `goldenCoat` | `#F4BC40` | Golden retriever body, ears, tail |
| `goldenShadow` | `#E8A81C` | Golden retriever neck, legs, tail underside |
| `goldenLight` | `#F8D056` | Golden retriever head |
| `goldenDeep` | `#D49414` | Golden retriever inner ears |
| `goldenCream` | `#F6E39A` | Golden retriever chest bib |
| `goldenMuzzle` | `#F8EBB0` | Golden retriever snout |
| `goldenPaw` | `#F4BC40` | Golden retriever paws |
| `goldenBrow` | `#F8D056` | Golden retriever brow highlights |
| `huskyCoat` | `#4E4E56` | Siberian husky back, cap, ears |
| `huskyLight` | `#C4C2C0` | Siberian husky tail, far legs |
| `huskyWhite` | `#EDECEA` | Siberian husky mask, chest, near legs |
| `huskyIris` | `#8EC9D6` | Siberian husky eyes |
| `huskyToe` | `#B0AEAC` | Siberian husky toe marks |
| `huskyInk` | `#11151F` | Siberian husky pupils, nose, mouth |
| `catCoat` | `#9AA6C4` | Cat body and head |
| `catShadow` | `#7382A6` | Cat ears, legs, tail |
| `catMuzzle` | `#E6ECF7` | Cat snout |
| `eyeWhite` | `#FFF9F2` | Eye whites (both) |
| `pupil` | `#241C3B` | Pupils, noses, mouth stroke |

## Typography

Nunito (SIL Open Font License). ExtraBold 800 for the wordmark, SemiBold 600 for taglines, Regular 400 for body.

Fallback stack: `Nunito, system-ui, -apple-system, sans-serif`.

The shipped extension draws no text. Nunito is for store assets, the preview page, and this documentation.

## Logo

A species-neutral paw with a heart cut out of the main pad. Violet on cream. Round toes, no claws, no species cues.

Sources:

- [`brand/mark.svg`](brand/mark.svg) — paw only, for toolbar icons
- [`brand/wordmark.svg`](brand/wordmark.svg) — the word Pawsome
- [`brand/lockup.svg`](brand/lockup.svg) — mark + wordmark

Clear space: at least the width of one toe around the mark. Do not recolor the heart; it is a cutout that shows the background.

## Tone

Warm, playful, brief, privacy-confident.

- Never baby-talk. The pet never speaks.
- At most one exclamation mark per paragraph.
- "Puppy" as a generic becomes "pet", "companion", or "little friend".
- "Dog" and "cat" only when the sentence is actually about that species.
- "Give paw" becomes "paw five".
- "Biscuit treat" becomes "treat".

## Vocabulary

| Avoid | Use |
|---|---|
| Hello Puppy | Pawsome |
| puppy (generic) | pet, companion, little friend |
| doggo | pawsome (code), pet (copy) |
| give paw | paw five |
| biscuit | treat |
| A tiny companion for every tab | A little pet for every tab |
