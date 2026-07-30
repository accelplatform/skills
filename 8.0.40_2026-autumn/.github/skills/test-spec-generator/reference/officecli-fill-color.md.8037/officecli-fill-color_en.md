# officecli fill color pitfall (theme color + tint)

## Symptom

Reading a header cell of an existing xlsx template (e.g. a test spec) with `officecli get` returns something like:

```json
{
  "fill": "dk2",
  "border.left": "thin", "border.right": "thin", "border.top": "thin", "border.bottom": "thin",
  "alignment.wrapText": true, "alignment.vertical": "center"
}
```

At first glance this looks like "the header uses theme color dk2 (dark navy)". But `officecli set`'s `fill` property **only accepts 6-digit hex**, so passing `"dk2"` errors out:

```
Invalid color value: 'dk2'. Expected 6-digit hex RGB (e.g. FF0000), ...
```

If you then naively use the theme's raw color (e.g. dk2's raw value `#44546A`, a dark navy), you get **a look completely different from the original file**.

## Root cause

Excel's `fill` can carry a **tint** (brightness adjustment, -1.0 to 1.0) on top of a theme color. `officecli get` returns only the theme color name and **does not output the tint value** (a lossy simplification on the read side). In practice many templates use "a theme color lightened or darkened by a tint" for header shading.

Since `officecli set` also rejects theme names like `"dk2"` (hex required), reproducing the exact color requires **computing the actual value from the raw XML**.

## Diagnostic steps

1. Get the full styles.xml with `officecli raw <file.xlsx> "/xl/styles.xml"`.
2. Find the style index (`s="N"`) of the target cell from that cell's raw XML (`officecli raw <file.xlsx> "/xl/worksheets/sheetN.xml"`).
3. From the Nth `<x:xf fillId="F" fontId="T" .../>` in `<x:cellXfs>`, get `fillId` and `fontId`.
4. From the Fth entry in `<x:fills>` — `<x:fill><x:patternFill patternType="solid"><x:fgColor theme="X" tint="Y" /></x:patternFill></x:fill>` — get `theme` (the theme color index) and `tint`.
5. In the Tth entry of `<x:fonts>`, if there is **no** `<x:color .../>`, the font uses the **default color (black/automatic)**. If there is a `theme="N"`, it uses that theme color.
6. Theme color index mapping (OOXML standard):

   | index | meaning |
   |---|---|
   | 0 | Background 1 (lt1) |
   | 1 | Text 1 (dk1) |
   | 2 | Background 2 (lt2) |
   | 3 | Text 2 (dk2) |
   | 4 | Accent 1 |
   | 5 | Accent 2 |
   | 6 | Accent 3 |
   | 7 | Accent 4 |
   | 8 | Accent 5 |
   | 9 | Accent 6 |

   The workbook's actual theme color values can be obtained via `officecli get <file> "/" --json`'s `format.theme.color.*` (`dk1`/`lt1`/`dk2`/`lt2`/`accent1`...`accent6`).

7. Apply the tint to the theme color's raw hex to compute the final color (next section).

## Tint formula (per ECMA-376)

Excel's tint is applied to **HSL lightness (L)** (not a simple linear RGB interpolation).

```js
function rgbToHsl(r, g, b) { /* r,g,b in 0-255 -> h,s,l normalized to 0-1 */ }
function hslToRgb(h, s, l) { /* inverse */ }

function applyTint(hex, tint) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const [h, s, l] = rgbToHsl(r, g, b);
  // tint > 0: lighten / tint < 0: darken
  const newL = tint >= 0 ? l * (1 - tint) + tint : l * (1 + tint);
  const [r2, g2, b2] = hslToRgb(h, s, newL);
  return [r2, g2, b2].map(x => x.toString(16).padStart(2, '0')).join('');
}
```

The standard `rgbToHsl` / `hslToRgb` implementation ships in `scripts/theme-tint.js`. It can be used standalone:

```
node .github/skills/test-spec-generator/scripts/theme-tint.js 44546A 0.79998168889431442
# => d6dce5
```

## Worked example (test-spec.xlsx header)

- The referenced fillId has `<x:fgColor theme="3" tint="0.79998168889431442" />` → theme color 3 = dk2
- The workbook's actual dk2 value = `#44546A`
- After applying tint = `#D6DCE5` (a light blue-gray)
- No `<x:color>` on the font side → default black text

So the actual header was not "dark navy with white text" but rather "light blue-gray background with black text".

## Reflecting this in spec.json

This skill's `build-test-spec.js` accepts `spec.style.headerFill` / `spec.style.headerFontColor` as **already-computed real hex values**. After analyzing a template, always compute the real hex following this procedure before writing it into spec.json. Writing a theme name or a raw tint value directly will not be interpreted.

## Note: `set` merges diffs

Properties passed to `officecli set` are **applied as a diff against the existing properties** — anything not specified is left unchanged. If you accidentally set `font.color: "#FFFFFF"` once, a later `set` call that only fixes `fill` will leave the text white. When fixing a color, always **re-specify every property you want to change** every time (omitting a property does not clear it).
