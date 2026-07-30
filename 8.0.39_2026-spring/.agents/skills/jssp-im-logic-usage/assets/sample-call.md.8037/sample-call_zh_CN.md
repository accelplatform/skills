# 完整示例：路由调用（GET 路由）

以下以从 swagger spec 获取的该路由定义为例，展示从 JSSP 展示页面调用的完整实现示例。

```jsonc
// node scripts/fetch-logic-swagger.js --route sample/accounts 的提取结果（节选）
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

由于是带有输入参数的 GET 路由，遵循 `reference/swagger-routing-call.md` 中「GET 方法下的 body 参数」章节，采用查询参数方式实现。

## head 部分（位于 `<imart type="head">` 内）

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
        imuiShowErrorMessage('账户检索失败。(HTTP ' + response.status + ')');
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

    // XSS 对策：将响应值插入 DOM 前必须进行转义
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

## body 部分

```html
<div class="imds-form-group">
  <label for=":searchUserCd:" class="imds-label">用户代码</label>
  <input type="text" id=":searchUserCd:" class="imds-textbox" placeholder="按用户代码检索（留空则检索全部）">
  <button type="button" class="imds-button is-primary" onclick="searchAccounts()">检索</button>
</div>

<table class="imds-table">
  <thead>
    <tr>
      <th>用户代码</th>
      <th>区域设置</th>
      <th>创建时间</th>
    </tr>
  </thead>
  <tbody id="account-list-body"></tbody>
</table>
```

## 实现要点

- 使用 `URLSearchParams` 转换为查询参数，未填写项不发送
- 将 `records` 数组插入 DOM 前，必须使用 `escapeHtml()` 进行转义（遵循 `jssp-security.md` 的 XSS 对策方针）
- 错误判定仅使用 `response.ok`，不假定 JSSP 特有的 `{error, errorMessage}` 格式
- `id` 属性遵循与元素种类对应的命名规约（输入元素如 `:searchUserCd:` 用冒号包裹，结构元素如 `account-list-body` 用连字符分隔，遵循 `jssp-presentation-page.md`）
