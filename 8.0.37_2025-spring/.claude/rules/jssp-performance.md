---
paths:
  - "src/main/conf/**/*.xml"
---

# パフォーマンス規約

> **適用範囲**: 🟡 **文脈依存** — パフォーマンスチューニング時のみ適用。コンパイラ設定や session.js の調整等。

## JavaScript コンパイラ設定

### source-config.xml の設定

```xml
<!-- 開発環境：インタプリタモード -->
<source-config>
  <compiler>false</compiler>
</source-config>

<!-- 本番環境：コンパイルモード -->
<source-config>
  <compiler>true</compiler>
</source-config>
```

| 設定値 | 用途 | 特徴 |
|--------|------|------|
| `false` | 開発環境 | ソース変更が即時反映。リソース消費が多い |
| `true` | 本番環境 | コンパイル後キャッシュ。高速だが変更時は再起動必要 |

## session.js の注意点

- `session.js` を変更した場合、**サーバ再起動が必要**
- 再起動するまで変更は反映されない
- 本番環境での変更は計画的に実施
