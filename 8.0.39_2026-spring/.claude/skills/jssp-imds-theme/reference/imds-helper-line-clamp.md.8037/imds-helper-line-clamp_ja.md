---
paths:
  - "src/main/jssp/**/*.html"
---

# LineClamp（行数省略ユーティリティ）

## 基本情報

LineClamp は、指定した行数で文字列を省略表記（三点リーダー）するための imds ヘルパークラス群である。これらは imds のユーティリティクラスであり、`p` 要素等のテキストを含む任意の要素と組み合わせて使う。単独のコンポーネントとして使うものではない。

- 抽出元: `uiux-share/helper/LineClamp.md`
- 命名規則: `imds-line-clamp-{行数}`（1〜5 が定義されている）

## CSS Classes Reference

| クラス名 | 用途 | 値 |
|----------|------|----|
| `imds-line-clamp-1` | 1行で省略表示する | 表示行数: 1 |
| `imds-line-clamp-2` | 2行で省略表示する | 表示行数: 2 |
| `imds-line-clamp-3` | 3行で省略表示する | 表示行数: 3 |
| `imds-line-clamp-4` | 4行で省略表示する | 表示行数: 4 |
| `imds-line-clamp-5` | 5行で省略表示する | 表示行数: 5 |

## 使用例

### 2行で省略表示する長文

```html
<div class="sample-box-container imds-border-1">
  <p class="imds-line-clamp-2">
    The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs.
  </p>
</div>
```

## 実装上の注意

- 一覧画面のセル内テキストや要約表示等、限られた領域で長文を省略表示したい場合に使う。
- 省略された全文をユーザが確認できるよう、`title` 属性やツールチップ、詳細表示への導線を併せて用意することが望ましい。
- `imds-scrollbar`（`imds-helper-scrollbar.md`）とは用途が異なる。LineClamp は行数で切り詰めて省略記号を表示するのに対し、Scrollbar はスクロール可能な領域の見た目を整えるものである。
