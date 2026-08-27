# Border（境界線ユーティリティ）

## 基本情報

Border は、指定した要素に境界線を追加、または消去するための imds ヘルパークラス群である。境界線の太さも調整できる。これらは imds のユーティリティクラスであり、任意のコンポーネント固有クラスと組み合わせて使う。単独のコンポーネントとして使うものではない。

- 抽出元: `uiux-share/helper/Border.md`
- 命名規則: `imds-border{-方向}-{太さ}`（方向省略時は全辺、`0` は境界線なし、`1`/`2` は太さの段階）

## CSS Classes Reference

| クラス名 | 付与先の辺 | 太さ |
|----------|-----------|------|
| `imds-border-0` | 全辺 | なし（0） |
| `imds-border-1` | 全辺 | 細（1段階目） |
| `imds-border-2` | 全辺 | 太（2段階目） |
| `imds-border-t-0` | 上辺 | なし（0） |
| `imds-border-t-1` | 上辺 | 細（1段階目） |
| `imds-border-t-2` | 上辺 | 太（2段階目） |
| `imds-border-r-0` | 右辺 | なし（0） |
| `imds-border-r-1` | 右辺 | 細（1段階目） |
| `imds-border-r-2` | 右辺 | 太（2段階目） |
| `imds-border-b-0` | 下辺 | なし（0） |
| `imds-border-b-1` | 下辺 | 細（1段階目） |
| `imds-border-b-2` | 下辺 | 太（2段階目） |
| `imds-border-l-0` | 左辺 | なし（0） |
| `imds-border-l-1` | 左辺 | 細（1段階目） |
| `imds-border-l-2` | 左辺 | 太（2段階目） |
| `imds-border-x-0` | 左右辺 | なし（0） |
| `imds-border-x-1` | 左右辺 | 細（1段階目） |
| `imds-border-x-2` | 左右辺 | 太（2段階目） |
| `imds-border-y-0` | 上下辺 | なし（0） |
| `imds-border-y-1` | 上下辺 | 細（1段階目） |
| `imds-border-y-2` | 上下辺 | 太（2段階目） |

## 使用例

### 全辺に境界線を付与

```html
<div class="sample-box-container imds-border-1"></div>
```

### 上辺のみ太い境界線を付与

```html
<div class="sample-box-container imds-border-t-2"></div>
```

### 左右のみ境界線を付与

```html
<div class="sample-box-container imds-border-x-1"></div>
```

## 実装上の注意

- 方向指定なし（`imds-border-*`）と個別方向指定（`imds-border-t-*` 等）を同時に使う場合、CSS の記述順や詳細度によって意図しない上書きが起こり得るため、どちらか一方を基本として使う。
- `imds-line-clamp-*` や `imds-scrollbar` と併用してコンテンツ領域の視認性を高める用途で使われることが多い（`imds-helper-line-clamp.md` / `imds-helper-scrollbar.md` を参照）。
