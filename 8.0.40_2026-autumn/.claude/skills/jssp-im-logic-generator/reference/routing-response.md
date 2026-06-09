# ルーティング レスポンス設定

ロジックフロールーティングの `responseType` に応じて、フローの `outputDataDefinition` に定義すべきプロパティが異なる。

参照: https://document.intra-mart.jp/library/iap/public/im_logic/im_logic_specification/texts/function_specification/routing/index.html#routing-response

## responseType 一覧と出力データ要件

### imJsonResponse（JSONに変換して返却）

フローの出力データ全体を JSON 形式に変換して返却する。
`body` プロパティは不要。出力定義に含まれるすべてのプロパティがそのまま JSON 化される。

```
output <object>
  └ (任意のプロパティ)
```

### imTextResponse（テキストとして返却）

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `body` | `string` または `storage` | 必須 | レスポンスボディ |

```
output <object>
  └ body <string>
```

### imHtmlResponse（HTML として返却）

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `body` | `string` または `storage` | 必須 | HTML コンテンツ |

```
output <object>
  └ body <string>
```

### imXmlResponse（XML として返却）

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `body` | `string` または `storage` | 必須 | XML コンテンツ |

```
output <object>
  └ body <string>
```

### imJsonStringResponse（JSON として返却）

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `body` | `string` または `storage` | 必須 | JSON 文字列 |

`imJsonResponse` との違い: `imJsonResponse` は出力データ全体を自動で JSON 化するが、`imJsonStringResponse` は `body` に格納された JSON 文字列をそのまま返却する。

```
output <object>
  └ body <string>
```

### imAnyContentTypeResponse（任意の Content-Type で返却）

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `body` | `string` または `storage` | 必須 | レスポンスボディ |
| `Content-Type` | `string` | 任意 | MIME タイプ。出力データまたはルーティングの responseHeader で指定。どちらにもない場合は `application/octet-stream` |

```
output <object>
  ├ body <string> or <storage>
  └ Content-Type <string>
```

### imFileDownload（ファイルダウンロード）

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `body` | `storage` | 必須 | ダウンロードするファイル |
| `Content-Type` | `string` | 任意 | MIME タイプ。未指定時はファイル拡張子から自動判別 |

```
output <object>
  ├ body <storage>
  └ Content-Type <string>
```

### imInlineFile（ファイルをインラインで返却）

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `body` | `storage` | 必須 | インライン表示するファイル |
| `Content-Type` | `string` | 任意 | MIME タイプ。未指定時はファイル拡張子から自動判別 |

```
output <object>
  ├ body <storage>
  └ Content-Type <string>
```

### imFileBinary（ファイルをバイナリで返却）

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `body` | `storage` | 必須 | バイナリデータ |
| `Content-Type` | `string` | 任意 | MIME タイプ。未指定時はファイル拡張子から自動判別 |

```
output <object>
  ├ body <storage>
  └ Content-Type <string>
```

## まとめ

| responseType | body の型 | Content-Type | 備考 |
|---|---|---|---|
| `imJsonResponse` | 不要 | - | 出力全体が JSON 化される |
| `imTextResponse` | `string` / `storage` | - | |
| `imHtmlResponse` | `string` / `storage` | - | |
| `imXmlResponse` | `string` / `storage` | - | |
| `imJsonStringResponse` | `string` / `storage` | - | body の JSON 文字列をそのまま返却 |
| `imAnyContentTypeResponse` | `string` / `storage` | 任意 | 未指定時は `application/octet-stream` |
| `imFileDownload` | `storage` | 任意 | 未指定時はファイル拡張子から自動判別 |
| `imInlineFile` | `storage` | 任意 | 未指定時はファイル拡張子から自動判別 |
| `imFileBinary` | `storage` | 任意 | 未指定時はファイル拡張子から自動判別 |
