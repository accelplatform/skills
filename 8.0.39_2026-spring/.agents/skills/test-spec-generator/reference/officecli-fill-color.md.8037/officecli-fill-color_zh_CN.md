# officecli 的 fill 颜色陷阱（主题色 + tint）

## 现象

用 `officecli get` 读取既有 xlsx 模板（例如测试项目书）的表头单元格时，会返回如下内容。

```json
{
  "fill": "dk2",
  "border.left": "thin", "border.right": "thin", "border.top": "thin", "border.bottom": "thin",
  "alignment.wrapText": true, "alignment.vertical": "center"
}
```

乍一看似乎是"表头使用了主题色 dk2（深藏青色）作为背景"。但 `officecli set` 的 `fill` 属性**只接受6位十六进制值**，传入 `"dk2"` 会报错。

```
Invalid color value: 'dk2'. Expected 6-digit hex RGB (e.g. FF0000), ...
```

若因此简单地使用主题的原始颜色（例如 dk2 的实际值 `#44546A`，深藏青色），会得到**与原文件完全不同的外观**。

## 根本原因

Excel 的 `fill` 除了主题色之外还可以带有 **tint（明度调整，取值 -1.0〜1.0）**。`officecli get` 只返回主题色名称，**不输出 tint 值**（读取侧的一种有损简化）。实际上很多模板的表头配色都是"将主题色调亮或调暗后的颜色"。

由于 `officecli set` 同样不接受 `"dk2"` 这类主题名称（必须是十六进制），要还原精确的颜色，就必须**从 raw XML 中计算实际值**。

## 诊断步骤

1. 用 `officecli raw <file.xlsx> "/xl/styles.xml"` 获取完整的 styles.xml。
2. 从目标单元格的 raw XML（`officecli raw <file.xlsx> "/xl/worksheets/sheetN.xml"`）中确定该单元格的样式索引（`s="N"`）。
3. 从 `<x:cellXfs>` 中第 N 个 `<x:xf fillId="F" fontId="T" .../>` 获取 `fillId` 与 `fontId`。
4. 从 `<x:fills>` 中第 F 个条目 —— `<x:fill><x:patternFill patternType="solid"><x:fgColor theme="X" tint="Y" /></x:patternFill></x:fill>` —— 获取 `theme`（主题色索引）与 `tint`。
5. 在 `<x:fonts>` 的第 T 个条目中，若**没有** `<x:color .../>`，则字体使用**默认颜色（黑色・自动）**。若有 `theme="N"`，则使用该主题色。
6. 主题色索引对照表（OOXML 标准）：

   | 索引 | 含义 |
   |---|---|
   | 0 | 背景1 (lt1) |
   | 1 | 文字1 (dk1) |
   | 2 | 背景2 (lt2) |
   | 3 | 文字2 (dk2) |
   | 4 | 强调色1 |
   | 5 | 强调色2 |
   | 6 | 强调色3 |
   | 7 | 强调色4 |
   | 8 | 强调色5 |
   | 9 | 强调色6 |

   工作簿的实际主题颜色值可通过 `officecli get <file> "/" --json` 的 `format.theme.color.*`（`dk1`/`lt1`/`dk2`/`lt2`/`accent1`〜`accent6`）获取。

7. 将 tint 应用到主题色的原始十六进制值上，计算出最终颜色（见下节）。

## tint 的计算公式（遵循 ECMA-376）

Excel 的 tint 是应用于 **HSL 的明度(L)** 的（并非简单的 RGB 线性插值）。

```js
function rgbToHsl(r, g, b) { /* r,g,b 为 0-255 → h,s,l 归一化为 0-1 */ }
function hslToRgb(h, s, l) { /* 逆变换 */ }

function applyTint(hex, tint) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const [h, s, l] = rgbToHsl(r, g, b);
  // tint > 0: 变亮 / tint < 0: 变暗
  const newL = tint >= 0 ? l * (1 - tint) + tint : l * (1 + tint);
  const [r2, g2, b2] = hslToRgb(h, s, newL);
  return [r2, g2, b2].map(x => x.toString(16).padStart(2, '0')).join('');
}
```

标准的 `rgbToHsl` / `hslToRgb` 实现已包含在 `scripts/theme-tint.js` 中，可单独使用：

```
node .agents/skills/test-spec-generator/scripts/theme-tint.js 44546A 0.79998168889431442
# => d6dce5
```

## 实例（test-spec.xlsx 的表头）

- fillId 引用的 `<x:fgColor theme="3" tint="0.79998168889431442" />` → 主题色3 = dk2
- 工作簿的 dk2 实际值 = `#44546A`
- 应用 tint 后 = `#D6DCE5`（浅青灰色）
- 字体侧没有 `<x:color>` → 默认黑色文字

也就是说实际的表头并非"深藏青色背景配白色文字"，而是"浅青灰色背景配黑色文字"。

## 反映到 spec.json 中

本技能的 `build-test-spec.js` 通过 `spec.style.headerFill` / `spec.style.headerFontColor` 接收**已计算好的实际十六进制值**。分析模板后，务必按照本流程计算出实际的十六进制值，再写入 spec.json。直接写入主题名称或原始 tint 值是无法被识别的。

## 注意：`set` 是差量合并

传给 `officecli set` 的属性是**对现有属性的差量应用**，未指定的属性会保持原值不变。若曾误将 `font.color` 设为 `"#FFFFFF"`，之后只修正 `fill` 的 `set` 调用不会清除该白色文字设置。修正颜色时，务必**每次都显式指定想要更改的全部属性**（省略并不等于清除）。
