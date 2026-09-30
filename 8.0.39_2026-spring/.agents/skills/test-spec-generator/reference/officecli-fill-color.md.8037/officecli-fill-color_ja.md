# officecli の fill 色に関する注意点（テーマ色 + tint の罠）

## 現象

既存の xlsx テンプレート（例: 試験項目書）のヘッダセルを `officecli get` で読むと、以下のように返る。

```json
{
  "fill": "dk2",
  "border.left": "thin", "border.right": "thin", "border.top": "thin", "border.bottom": "thin",
  "alignment.wrapText": true, "alignment.vertical": "center"
}
```

一見「テーマ色 dk2（濃紺）を背景に使っている」ように見える。しかし `officecli set` の `fill` プロパティは **6桁HEXしか受け付けず**、`"dk2"` のような名前を渡すとエラーになる。

```
Invalid color value: 'dk2'. Expected 6-digit hex RGB (e.g. FF0000), ...
```

ここで安易にテーマの生の色（例: dk2 の実体 `#44546A`、濃紺）を使うと、**元ファイルとは全く違う見た目**になる。

## 根本原因

Excel の `fill` は「テーマ色」に加えて **tint（明度調整、-1.0〜1.0）** を持てる。`officecli get` はテーマ色名だけを返し、**tint 値を出力しない**（read側の非可逆な単純化）。実際には多くのテンプレートで「テーマ色を薄く（または濃く）した色」がヘッダ配色に使われている。

`officecli set` 側も `"dk2"` のようなテーマ名を受け付けない（HEX必須）ため、tint を含む正確な色を再現するには、**raw XML から実際の値を計算する必要がある**。

## 診断手順

1. `officecli raw <file.xlsx> "/xl/styles.xml"` で styles.xml 全体を取得する。
2. 対象セルの `s="N"` 属性の値（スタイルインデックス）を、そのセルの raw XML（`officecli raw <file.xlsx> "/xl/worksheets/sheetN.xml"`）から特定する。
3. `<x:cellXfs>` の `N` 番目の `<x:xf fillId="F" fontId="T" .../>` から `fillId` と `fontId` を得る。
4. `<x:fills>` の `F` 番目の `<x:fill><x:patternFill patternType="solid"><x:fgColor theme="X" tint="Y" /></x:patternFill></x:fill>` から `theme`（テーマ色インデックス）と `tint` を得る。
5. `<x:fonts>` の `T` 番目の `<x:font>` に `<x:color .../>` が **無ければ既定色（黒・自動）**。`theme="N"` があればそのテーマ色。
6. テーマ色インデックスの対応表（OOXML標準）:

   | index | 意味 |
   |---|---|
   | 0 | 背景1 (lt1) |
   | 1 | 文字1 (dk1) |
   | 2 | 背景2 (lt2) |
   | 3 | 文字2 (dk2) |
   | 4 | アクセント1 |
   | 5 | アクセント2 |
   | 6 | アクセント3 |
   | 7 | アクセント4 |
   | 8 | アクセント5 |
   | 9 | アクセント6 |

   ワークブックのテーマカラー実値は `officecli get <file> "/" --json` の `format.theme.color.*`（`dk1`/`lt1`/`dk2`/`lt2`/`accent1`〜`accent6`）で取得できる。

7. テーマ色の実HEXに tint を適用して最終色を計算する（次節）。

## tint の計算式（ECMA-376 準拠）

Excel の tint は **HSL の明度(L)** に対して適用される（RGBの単純な線形補間ではない）。

```js
function rgbToHsl(r, g, b) { /* r,g,b は 0-255 → h,s,l は 0-1 に正規化 */ }
function hslToRgb(h, s, l) { /* 逆変換 */ }

function applyTint(hex, tint) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const [h, s, l] = rgbToHsl(r, g, b);
  // tint > 0: 明るくする / tint < 0: 暗くする
  const newL = tint >= 0 ? l * (1 - tint) + tint : l * (1 + tint);
  const [r2, g2, b2] = hslToRgb(h, s, newL);
  return [r2, g2, b2].map(x => x.toString(16).padStart(2, '0')).join('');
}
```

`rgbToHsl` / `hslToRgb` の標準実装は `scripts/theme-tint.js` に同梱している。単体で以下のように使える。

```
node .agents/skills/test-spec-generator/scripts/theme-tint.js 44546A 0.79998168889431442
# => d6dce5
```

## 実例（test-spec.xlsx のヘッダ）

- fillId が参照する `<x:fgColor theme="3" tint="0.79998168889431442" />` → テーマ色3 = dk2
- ワークブックの dk2 実値 = `#44546A`
- tint 適用後 = `#D6DCE5`（薄い青灰色）
- フォント側に `<x:color>` が無い → 既定の黒文字

つまり実際のヘッダは「濃紺背景に白文字」ではなく「薄い青灰色の背景に黒文字」だった。

## spec.json への反映方法

このスキルの `build-test-spec.js` は `spec.style.headerFill` / `spec.style.headerFontColor` を **計算済みの実HEX** で受け取る。テンプレートを分析したら、必ずこの手順で実HEXを計算してから spec.json に書くこと。テーマ名やtint値をそのまま書いても解釈されない。

## `set` は差分適用（マージ）である点にも注意

`officecli set` で渡した `props` は **既存のプロパティに対する差分適用**であり、指定しなかったプロパティは前の値のまま残る。誤って `font.color: "#FFFFFF"` を一度設定してしまうと、次の `set` 呼び出しで `fill` だけ直しても白文字のまま残る。色を修正する際は **変更したいプロパティを毎回明示的に指定し直す**こと（省略＝クリアではない）。
