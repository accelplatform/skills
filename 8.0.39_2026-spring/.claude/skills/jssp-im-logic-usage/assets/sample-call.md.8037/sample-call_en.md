# Complete Example: Routing Call (GET Route)

The following shows a complete example calling from a JSSP presentation page, based on this route definition retrieved from the swagger spec.

```jsonc
// Excerpt from: node scripts/fetch-logic-swagger.js --route sample/accounts
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

Since this is a GET route with input parameters, it is implemented using the query-parameter approach described in "Body parameter on GET" in `reference/swagger-routing-call.md`.

## head section (inside `<imart type="head">`)

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
        imuiShowErrorMessage('Account search failed. (HTTP ' + response.status + ')');
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

    // XSS protection: always escape response values before inserting into the DOM
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

## body section

```html
<div class="imds-form-group">
  <label for=":searchUserCd:" class="imds-label">User Code</label>
  <input type="text" id=":searchUserCd:" class="imds-textbox" placeholder="Search by user code (leave empty for all)">
  <button type="button" class="imds-button is-primary" onclick="searchAccounts()">Search</button>
</div>

<table class="imds-table">
  <thead>
    <tr>
      <th>User Code</th>
      <th>Locale</th>
      <th>Created At</th>
    </tr>
  </thead>
  <tbody id="account-list-body"></tbody>
</table>
```

## Implementation notes

- Convert to query parameters using `URLSearchParams`, and omit unfilled fields
- Always escape values from the `records` array with `escapeHtml()` before inserting into the DOM (per the XSS protection policy in `jssp-security.md`)
- Judge errors solely by `response.ok`; do not assume the JSSP-specific `{error, errorMessage}` shape
- `id` attributes follow the naming convention appropriate to the element type (colon-wrapped for input elements like `:searchUserCd:`, hyphenated for structural elements like `account-list-body`, per `jssp-presentation-page.md`)
