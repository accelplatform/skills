---
paths:
  - "src/main/jssp/**/*.html"
---

# Scrollbar（スクロールバーユーティリティ）

## 基本情報

Scrollbar は、スクロールバーの主張を抑え、コンテンツ領域の見やすさを保つための imds ヘルパークラスである。これは imds のユーティリティクラスであり、`overflow: auto` / `overflow: scroll` 等が指定されたブロック要素（Flexbox や Grid のオーバーフロー領域等）と組み合わせて使う。単独のコンポーネントとして使うものではない。

- 抽出元: `uiux-share/helper/Scrollbar.md`

## CSS Classes Reference

| クラス名 | 用途 | 値（Property: Value） |
|----------|------|----------------------|
| `imds-scrollbar` | スクロールバーを細く視認性の高いデザインにする | `scrollbar-color: hsl(0deg, 0%, 69%) hsl(0deg, 0%, 100%); scrollbar-width: thin;` |

## 使用例

### テキストを含むスクロール領域

適用前（標準のスクロールバー）

```html
<div class="sample-box">
  <div
    class="sample-box-container imds-border-1"
    style="overflow: scroll">
    <p>
      The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs.
    </p>
  </div>
</div>
```

適用後（`imds-scrollbar` を追加）

```html
<div class="sample-box">
  <div
    class="sample-box-container imds-border-1 imds-scrollbar"
    style="overflow: scroll">
    <p>
      The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs.
    </p>
  </div>
</div>
```

## 実装上の注意

- `imds-scrollbar` を適用する際は、スクロールバーを表示させるために対象コンテナに `overflow: auto` や `overflow: scroll` 等のオーバーフロー指定が必要である。必要に応じてインライン `style` やレイアウト側のスタイルで指定する。
- `imds-scrollbar` 自体はスクロールバーの見た目のみを変更するものであり、オーバーフローの挙動そのものは制御しない。
