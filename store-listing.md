# Chrome Web Store listing — Pawsome

Paste these into the Developer Dashboard. Do not zip this file or `store-assets/` into the extension package.

## Product details

**Name:** Pawsome

**Category:** Fun

**Language:** English

**Short description** (manifest, 72 characters):
```
A little dog companion that lives at the bottom of every webpage.
```

**Single purpose:**
```
Adds a cute animated dog companion to the bottom of websites.
```

**Permission justification** (host access):
```
Pawsome injects a decorative pet overlay onto http and https pages so the companion can appear while you browse. It does not read page content, accounts, or form data, and it does not send anything off the device.
```

**Permission justification** (storage):
```
Pawsome stores which companion you picked in Chrome sync storage so every tab can show the same dog. This value never leaves your browser profile and is not sent to any server.
```

## Detailed description

```
Pawsome is a little companion that sits at the bottom of the websites you visit.

Pick a companion in the toolbar popup and a friendly dog wanders along the bottom of the page, blinks, twitches its ears, and looks toward your cursor. The same companion appears on every tab. It stays away from the far edges so it does not cover corners or typical site chrome.

Play with it:
• Click for a paw five
• Double-click for a roll
• Shift-click to offer a treat

Pawsome runs entirely on your computer. It does not collect personal data, does not talk to remote servers, and does not change how websites work beyond drawing the companion on top of the page.

Note: the companion appears on http and https pages. It will not show on Chrome settings pages (chrome://).
```

## Privacy practices

- Does this item collect user data? **No**
- Privacy policy URL: leave blank
- Certify Limited Use if asked: not applicable (no data collected)

## Graphic assets (upload from `store-assets/`)

| Asset | File | Size | Format |
|---|---|---|---|
| Hero | `store-assets/hero-1280x800.png` | 1280×800 | 24-bit PNG (no alpha) |
| Screenshot | `store-assets/screenshot-1280x800.png` | 1280×800 | 24-bit PNG (no alpha) |
| Small promo tile | `store-assets/promo-small-440x280.png` | 440×280 | 24-bit PNG (no alpha) |
| Marquee promo tile | `store-assets/promo-marquee-1400x560.png` | 1400×560 | 24-bit PNG (no alpha) |
| Store icon | `store-assets/store-icon-128.png` | 128×128 | PNG |

Take 1–2 extra real screenshots in Chrome after loading the unpacked extension if you want a live page behind the pets.

## Extension package (zip these only)

- `manifest.json`
- `content.js`
- `pawsome-pets.js`
- `pawsome-engine.js`
- `pawsome.css`
- `popup.html`
- `popup.css`
- `popup.js`
- `icons/`
- `brand/mark.svg`
- `brand/fonts/Nunito-ExtraBold.ttf`
- `brand/fonts/Nunito-SemiBold.ttf`
- `brand/fonts/OFL.txt`

Do **not** include `.git/`, `.venv/`, `README.md`, `BRAND.md`, `preview.html`, `store-listing.md`, `store-assets/`, or the rest of `brand/`.
