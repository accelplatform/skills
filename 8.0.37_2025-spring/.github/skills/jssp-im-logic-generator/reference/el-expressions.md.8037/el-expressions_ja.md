# EL式リファレンス

IM-LogicDesigner では一部のフィールドに EL（Expression Language）式を埋め込める。

## 使える場所

- `im_sequence` の `properties.condition`
- `im_errorEnd` の `properties.errorMessage`
- その他、文字列型 properties で `${...}` を含むもの

## 構文

```
${ <式> }
```

`${}` の外側はリテラル文字列としてそのまま、内側は式として評価される。
式と文字列は混在可能。

## 式の中で使えるもの

| 参照 | 説明 |
|---|---|
| `$input.foo.bar` | 入力データ |
| `$output.data.xxx` | 出力データ |
| `$variable.xxx` | フロー変数 |
| `$const.NAME` | 定数 |
| `$session_properties.xxx` | セッション情報（詳細は後述）  |
| `$account_context.xxx` | アカウントコンテキスト（詳細は後述） |
| `$user_context.xxx` | ユーザコンテキスト（詳細は後述） |
| `$task_result.xxx` | 処理結果情報（詳細は後述） |
| `$external_user_context.xxx` | 外部ユーザコンテキスト（詳細は後述） |
| `<executeId>.<field>` | 直前タスクの出力 |

**注意:** EL式の中では `.` 区切り、`source.path` の中では `/` 区切り。混同しないこと。

### $account_context

アカウントコンテキスト。ログインユーザのセッション情報を参照できる。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| `applicationLicenses` | string[] | アプリケーションライセンス一覧 |
| `authenticated` | boolean | 認証済みかどうか |
| `calendarId` | string | カレンダーID |
| `dateTimeFormats` | object | 日時フォーマット設定 |
| `dateTimeFormats.dateInput` | string | 日付入力フォーマット |
| `dateTimeFormats.dateSimple` | string | 日付簡易フォーマット |
| `dateTimeFormats.dateStandard` | string | 日付標準フォーマット |
| `dateTimeFormats.timeInput` | string | 時刻入力フォーマット |
| `dateTimeFormats.timeStandard` | string | 時刻標準フォーマット |
| `dateTimeFormats.timeTimestamp` | string | タイムスタンプフォーマット |
| `encoding` | string | 文字エンコーディング |
| `firstDayOfWeek` | integer | 週の開始曜日（`0`: 日曜 〜 `6`: 土曜） |
| `homeUrl` | string | ホームURL |
| `locale` | locale | ロケール（"ja" / "en" / "zh_CN" 等） |
| `loginTime` | date | ログイン日時 |
| `roleIds` | string[] | 保有ロールID一覧 |
| `tenantId` | string | テナントID |
| `themeId` | string | テーマID |
| `timeZone` | timezone | タイムゾーン |
| `userCd` | string | ユーザコード |
| `userType` | string | ユーザ種別（`"user"`: 一般ユーザ, `"administrator"`: システム管理者） |

### $user_context

ユーザコンテキスト。ログインユーザの所属組織・プロフィール情報を参照できる。

#### currentDepartment（所属組織）

| プロパティ | 型 | 説明 |
|-----------|------|------|
| `currentDepartment.companyCd` | string | 会社コード |
| `currentDepartment.departmentCd` | string | 組織コード |
| `currentDepartment.departmentFullName` | string | 組織正式名称 |
| `currentDepartment.departmentName` | string | 組織名 |
| `currentDepartment.departmentSearchName` | string | 組織検索名 |
| `currentDepartment.departmentSetCd` | string | 組織セットコード |
| `currentDepartment.departmentShortName` | string | 組織略称 |

#### userProfile（ユーザプロフィール）

| プロパティ | 型 | 説明 |
|-----------|------|------|
| `userProfile.address1` | string | 住所1 |
| `userProfile.address2` | string | 住所2 |
| `userProfile.address3` | string | 住所3 |
| `userProfile.countryCd` | string | 国コード（自由入力。コード体系の規定なし） |
| `userProfile.emailAddress1` | string | メールアドレス1 |
| `userProfile.emailAddress2` | string | メールアドレス2 |
| `userProfile.extensionFaxNumber` | string | FAX内線番号 |
| `userProfile.extensionNumber` | string | 内線番号 |
| `userProfile.faxNumber` | string | FAX番号 |
| `userProfile.mobileEmailAddress` | string | 携帯メールアドレス |
| `userProfile.mobileNumber` | string | 携帯電話番号 |
| `userProfile.notes` | string | 備考 |
| `userProfile.sex` | string | 性別（`"0"`: 男性, `"1"`: 女性, `"9"`: その他） |
| `userProfile.telephoneNumber` | string | 電話番号 |
| `userProfile.url` | string | URL |
| `userProfile.userCd` | string | ユーザコード |
| `userProfile.userName` | string | ユーザ名 |
| `userProfile.userSearchName` | string | ユーザ検索名 |
| `userProfile.zipCode` | string | 郵便番号 |

### $session_properties

セッションプロパティ。フロー実行時のシステム情報を参照できる。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| `baseUrl` | string | ベースURL |
| `fileSeparator` | string | ファイルセパレータ |
| `flowId` | string | 実行中のフローID |
| `lineSeparator` | string | 改行コード |
| `startTime` | date | フロー開始日時 |
| `systemDate` | date | システム日付 |
| `version` | integer | フローバージョン |

### $task_result

処理結果情報。直前のタスク実行結果のエラー情報を参照できる。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| `error` | boolean | エラー発生有無 |
| `errorMessage` | string | エラーメッセージ |
| `errorReport` | string | エラーレポート |
| `executeId` | string | 実行タスクのexecuteId |
| `stackTrace` | string | スタックトレース |

### $external_user_context

外部ユーザコンテキスト。外部ユーザかどうかを判定できる。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| `externalUser` | boolean | 外部ユーザかどうか |

## 演算子・関数

### 演算子

- 三項演算子: `cond ? a : b`
- 比較: `==`, `!=`, `<`, `>`, `<=`, `>=`
- 論理: `&&`, `||`, `!`

### 関数

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `isEmpty(x)` | 配列 / Map / 文字列 / null / その他 | boolean | 空かどうかを判定。配列・Mapは要素数0でtrue、文字列はnullまたは長さ0でtrue、nullはtrue、その他はfalse |
| `sizeOf(x)` | 配列 / Map / 文字列 | integer | 要素数または文字数を返却 |
| `contains(collection, value)` | 第1引数: 配列またはMap、第2引数: 検索値 | boolean | 配列に要素が存在、またはMapにキーが存在する場合にtrue。その他はfalse |
| `indexOf(x, search)` | 第1引数: 配列または文字列、第2引数: 検索値 | integer | 最初に見つかったインデックスを返却。見つからない場合は-1 |
| `lastIndexOf(x, search)` | 第1引数: 配列または文字列、第2引数: 検索値 | integer | 最後に見つかったインデックスを返却。見つからない場合は-1 |

## サンプル

### gateway 条件分岐

```jsonc
{
  "from": "im_gateway1",
  "to": "im_repositoryEntityDataUpdate1",
  "condition": "${!isEmpty(im_repositorySearchEntityData1)}"
}
```

### errorMessage の多言語化

```jsonc
{
  "type": "im_errorEnd",
  "properties": {
    "errorMessage": "${$account_context.locale=='ja'?$const.ERROR_NO_ARTICLE_FOUND_JA:($account_context.locale=='zh_CN'?$const.ERROR_NO_ARTICLE_FOUND_ZH_CN:$const.ERROR_NO_ARTICLE_FOUND_EN)}"
  }
}
```
