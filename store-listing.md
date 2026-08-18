# Chrome Web Store listing — Hello Puppy

Paste these into the Developer Dashboard. Do not zip this file or `store-assets/` into the extension package.

## Product details

**Name:** Hello Puppy

**Category:** Fun

**Language:** English

**Short description** (manifest, 72 characters):
```
A cute clip-art puppy that lives at the bottom of every webpage.
```

**Single purpose:**
```
Adds a cute animated clip-art puppy companion to the bottom of websites.
```

**Permission justification** (host access):
```
Hello Puppy injects a decorative puppy overlay onto http and https pages so the companion can appear while you browse. It does not read page content, accounts, or form data, and it does not send anything off the device.
```

**Permission justification** (`storage`):
```
Saves how many puppies you want on the page.
```

## Detailed description

```
Hello Puppy is a tiny clip-art companion that sits at the bottom of the websites you visit.

A friendly puppy wanders along the bottom of the page, blinks, twitches its ears, and looks toward your cursor. It stays away from the far edges so it does not cover corners or typical site chrome.

Play with it:
• Click to get a paw
• Double-click for a roll
• Shift-click to offer a biscuit

Use the toolbar icon to choose 1–5 puppies.

Hello Puppy runs entirely on your computer. It does not collect personal data, does not talk to remote servers, and does not change how websites work beyond drawing the companion on top of the page.

Note: the puppy appears on http and https pages. It will not show on Chrome settings pages (chrome://).
```

## Privacy practices

- Does this item collect user data? **No**
- Privacy policy URL: leave blank
- Certify Limited Use if asked: not applicable (no data collected)

## Graphic assets (upload from `store-assets/`)

| Asset | File | Size | Format |
|---|---|---|---|
| Hero / screenshot | `store-assets/hero-1280x800.png` | 1280×800 | 24-bit PNG (no alpha) |
| Small promo tile | `store-assets/promo-small-440x280.png` | 440×280 | 24-bit PNG (no alpha) |
| Marquee promo tile | `store-assets/promo-marquee-1400x560.png` | 1400×560 | 24-bit PNG (no alpha) |

Take 1–2 extra real screenshots in Chrome after loading the unpacked extension if the generated screenshot feels too illustrated.

## Extension package (zip these only)

- `manifest.json`
- `content.js`
- `doggo-dog.js`
- `doggo.css`
- `popup.html` `popup.js` `popup.css`
- `icons/`

Do **not** include `.git/`, `README.md`, `preview.html`, `store-listing.md`, or `store-assets/`.
