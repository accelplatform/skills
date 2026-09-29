# 完成品サンプル: ルーティング呼び出し（GETルート）

swagger spec から取得した以下のルート定義を例に、JSSP プレゼンテーションページから呼び出す完成品サンプルを示す。

```jsonc
// node scripts/fetch-logic-swagger.js --route sample/accounts の抽出結果（抜粋）
{
  "/logic/api/sample/accounts": {
    "get": {
      "summary": "List of Accounts",
      "parameters": [
        { "name": "body", "in": "body", "schema": { "properties": { "user_cd": { "type": "string" } } } }
      ],
      "responses": {
        "default": {
          "schema": {
            "properties": {
              "records": {
                "type": "array",
                "items": {
                  "properties": {
                    "user_cd": { "type": "string" },
                    "create_date": { "type": "string" },
                    "locale_id": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      },
      "tags": ["sample"]
    }
  }
}
```

GET ルートかつ入力パラメータを持つため、`reference/swagger-routing-call.md` の「GETメソッドでの body パラメータ」に従い、クエリパラメータ方式で実装する。

## head 部（`<imart type="head">` 内）

```html
<imart type="head">
  <script type="text/javascript">
    async function searchAccounts() {
      const userCd = document.getElementById(':searchUserCd:').value;

      const params = new URLSearchParams();
      if (userCd) {
        params.set('user_cd', userCd);
      }

      const response = await fetch('logic/api/sample/accounts?' + params.toString(), {
        method: 'GET'
      });

      if (!response.ok) {
        imuiShowErrorMessage('アカウント検索に失敗しました。(HTTP ' + response.status + ')');
        return;
      }

      const result = await response.json();
      renderAccountList(result.records || []);
    }

    function renderAccountList(records) {
      const tbody = document.getElementById('account-list-body');
      tbody.innerHTML = '';
      records.forEach((record) => {
        const tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + escapeHtml(record.user_cd) + '</td>' +
          '<td>' + escapeHtml(record.locale_id) + '</td>' +
          '<td>' + escapeHtml(record.create_date) + '</td>';
        tbody.appendChild(tr);
      });
    }

    // XSS対策: レスポンス値は必ずエスケープしてから DOM に挿入する
    function escapeHtml(value) {
      if (value === null || value === undefined) return '';
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    window.searchAccounts = searchAccounts;
  </script>
</imart>
```

## body 部

```html
<div class="imds-form-group">
  <label for=":searchUserCd:" class="imds-label">ユーザコード</label>
  <input type="text" id=":searchUserCd:" class="imds-textbox" placeholder="ユーザコードで検索（未入力時は全件）">
  <button type="button" class="imds-button is-primary" onclick="searchAccounts()">検索</button>
</div>

<table class="imds-table">
  <thead>
    <tr>
      <th>ユーザコード</th>
      <th>ロケール</th>
      <th>作成日時</th>
    </tr>
  </thead>
  <tbody id="account-list-body"></tbody>
</table>
```

## 実装上のポイント

- クエリパラメータへの変換は `URLSearchParams` を使用し、未入力項目は送信しない
- レスポンスの `records` 配列を DOM に挿入する際は、`escapeHtml()` で必ずエスケープする（`jssp-security.md` の XSS対策方針に準拠）
- エラー判定は `response.ok` のみで行い、JSSP独自の `{error, errorMessage}` 形式は想定しない
- `id` 属性は要素種別に応じた命名規約に従う（入力要素は `:searchUserCd:` のようにコロンで囲み、構造要素は `account-list-body` のようにハイフン区切りとする。`jssp-presentation-page.md` の id 命名規約に準拠）
