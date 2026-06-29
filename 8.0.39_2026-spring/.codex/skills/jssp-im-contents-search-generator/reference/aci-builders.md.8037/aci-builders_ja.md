# 権限（ACIBuilder）リファレンス

登録用コンテンツに指定可能な権限ビルダーの一覧と SSJS からの呼び出しパターン。
`StandardInputContent.addACIBuilder()` の引数として渡すことで、コンテンツの参照権限を制御する。

---

## ビルダー一覧

全クラスのパッケージは `jp.co.intra_mart.foundation.contentssearch.authority.builder.impl`。

| No. | 権限対象 | クラス名 |
|-----|---------|---------|
| 1 | 未認証ユーザ（ゲスト含む） | `AnonymousACIBuilder` |
| 2 | 認証ユーザ（ログイン済み全員） | `EveryoneACIBuilder` |
| 3 | 特定ユーザ | `StandardUserACIBuilder` |
| 4 | ロール | `StandardRoleACIBuilder` |
| 5 | パブリックグループ | `StandardPublicGroupACIBuilder` |
| 6 | パブリックグループ役割 | `StandardPublicGroupRoleACIBuilder` |
| 7 | 会社 | `StandardCompanyACIBuilder` |
| 8 | 組織 | `StandardDepartmentACIBuilder` |
| 9 | 役職 | `StandardPostACIBuilder` |

---

## 基本的な呼び出し方

`addACIBuilder` は varargs のため、JS 配列で渡す。複数の権限を OR 条件で組み合わせる場合は `addACIBuilder` を複数回呼び出す。

```javascript
// 単一ビルダー
content.addACIBuilder([new EveryoneACIBuilder()]);

// 複数ビルダーを OR 条件で設定（addACIBuilder を複数回呼ぶ）
content.addACIBuilder([new StandardRoleACIBuilder('approver')]);
content.addACIBuilder([new StandardUserACIBuilder('user001')]);
```

---

## 各ビルダーの詳細

### 1. AnonymousACIBuilder — 未認証ユーザ（ゲスト含む全ユーザ）

ログインしていないユーザも含む全ユーザが参照可能になる。

**コンストラクタ:**
```java
AnonymousACIBuilder()
```

**SSJS:**
```javascript
let AnonymousACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.AnonymousACIBuilder;

content.addACIBuilder([new AnonymousACIBuilder()]);
```

---

### 2. EveryoneACIBuilder — 認証ユーザ（ログイン済み全員）

ログイン済みの全ユーザが参照可能になる。

**コンストラクタ:**
```java
EveryoneACIBuilder()
```

**SSJS:**
```javascript
let EveryoneACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.EveryoneACIBuilder;

content.addACIBuilder([new EveryoneACIBuilder()]);
```

---

### 3. StandardUserACIBuilder — 特定ユーザ

指定したユーザコードのユーザのみが参照可能になる。

**コンストラクタ:**
```java
StandardUserACIBuilder(String... userCds)
StandardUserACIBuilder(Collection<String> userCds)
```

**SSJS:**
```javascript
let StandardUserACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardUserACIBuilder;

// 単一ユーザ
content.addACIBuilder([new StandardUserACIBuilder('user001')]);

// 複数ユーザ（JS 配列で varargs に渡す）
content.addACIBuilder([new StandardUserACIBuilder(['user001', 'user002'])]);
```

---

### 4. StandardRoleACIBuilder — ロール

指定したロール ID を持つユーザのみが参照可能になる。

**コンストラクタ:**
```java
StandardRoleACIBuilder()
StandardRoleACIBuilder(String... roleIds)
StandardRoleACIBuilder(Collection<String> roleIds)
```

**SSJS:**
```javascript
let StandardRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardRoleACIBuilder;

// 単一ロール
content.addACIBuilder([new StandardRoleACIBuilder('approver')]);

// 複数ロール（JS 配列で varargs に渡す）
content.addACIBuilder([new StandardRoleACIBuilder(['approver', 'manager'])]);
```

---

### 5. StandardPublicGroupACIBuilder — パブリックグループ

指定したパブリックグループに所属するユーザのみが参照可能になる。

**コンストラクタ:**
```java
StandardPublicGroupACIBuilder()
StandardPublicGroupACIBuilder(String publicGroupSetCd, String publicGroupCd)
```

**SSJS:**
```javascript
let StandardPublicGroupACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardPublicGroupACIBuilder;

// グループセットコード＋グループコードで指定
content.addACIBuilder([new StandardPublicGroupACIBuilder('group_set_cd', 'group_cd')]);
```

---

### 6. StandardPublicGroupRoleACIBuilder — パブリックグループ役割

指定したパブリックグループ内の特定役割を持つユーザのみが参照可能になる。

**コンストラクタ:**
```java
StandardPublicGroupRoleACIBuilder()
StandardPublicGroupRoleACIBuilder(String publicGroupSetCd, String publicGroupCd, String roleCd)
```

**SSJS:**
```javascript
let StandardPublicGroupRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardPublicGroupRoleACIBuilder;

// グループセットコード＋グループコード＋役割コードで指定
content.addACIBuilder([new StandardPublicGroupRoleACIBuilder('group_set_cd', 'group_cd', 'role_cd')]);
```

---

### 7. StandardCompanyACIBuilder — 会社

指定した会社コードに所属するユーザのみが参照可能になる。

**コンストラクタ:**
```java
StandardCompanyACIBuilder()
StandardCompanyACIBuilder(String... companyCds)
```

**SSJS:**
```javascript
let StandardCompanyACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardCompanyACIBuilder;

// 単一会社
content.addACIBuilder([new StandardCompanyACIBuilder('comp001')]);

// 複数会社（JS 配列で varargs に渡す）
content.addACIBuilder([new StandardCompanyACIBuilder(['comp001', 'comp002'])]);
```

---

### 8. StandardDepartmentACIBuilder — 組織

指定した組織に所属するユーザのみが参照可能になる。

**コンストラクタ:**
```java
StandardDepartmentACIBuilder()
StandardDepartmentACIBuilder(String companyCd, String departmentCd)
```

**SSJS:**
```javascript
let StandardDepartmentACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardDepartmentACIBuilder;

// 会社コード＋組織コードで指定
content.addACIBuilder([new StandardDepartmentACIBuilder('comp001', 'dept001')]);
```

---

### 9. StandardPostACIBuilder — 役職

指定した役職を持つユーザのみが参照可能になる。

**コンストラクタ:**
```java
StandardPostACIBuilder()
StandardPostACIBuilder(String companyCd, String departmentCd, String postCd)
```

**SSJS:**
```javascript
let StandardPostACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardPostACIBuilder;

// 会社コード＋組織コード＋役職コードで指定
content.addACIBuilder([new StandardPostACIBuilder('comp001', 'dept001', 'post001')]);
```
