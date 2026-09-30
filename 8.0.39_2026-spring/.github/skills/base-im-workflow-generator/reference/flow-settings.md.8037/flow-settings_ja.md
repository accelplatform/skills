# フロー機能設定（flowSettings）

`spec.json` の `flowSettings` オブジェクトで IM-Workflow のフロー定義の機能設定を制御する。
省略時はデフォルト値が適用される。

```jsonc
{
  "flowSettings": {
    "lumpProcess": true,            // 一括処理機能（デフォルト: true）
    "attachFile": false,            // 添付ファイル（デフォルト: true）
    "confirmUserSetup": false,      // 確認者設定（デフォルト: false）
    "completedMatterConfirm": true, // 完了済み案件の確認（デフォルト: false）
    "autoProcess": false,           // 自動処理（デフォルト: false）
    "autoProcessLimitDay": null,    // 自動処理期限日数（autoProcess=true 時に設定）
    "autoProcessLimitType": null,   // 処理期限後処理種別 0=承認/1=否認/2=差戻し（autoProcess=true 時のデフォルト: 0）
    "autoPress": false,             // 自動催促（デフォルト: false）
    "autoPressLimitDay": null,      // 自動催促期限日数（autoPress=true 時に設定）
    "asyncProcess": false,          // 非同期処理（デフォルト: false）
    "sysDateTargetExpand": false,   // 対象者を展開する日: true=処理日/false=案件開始日（デフォルト: false）
    "calendarId": null              // カレンダーID（デフォルト: null=標準カレンダー）
  }
}
```

| フィールド | XML タグ | デフォルト | 説明 |
|---|---|---|---|
| `lumpProcess` | `lumpProcessFlag` | `true` | 一括処理機能の使用 |
| `attachFile` | `attachFileFlag` | `true` | 添付ファイルの使用 |
| `confirmUserSetup` | `confirmUserSetupFlag` | `false` | 確認者設定の使用 |
| `completedMatterConfirm` | `completeMatterConfirmFlag` | `false` | 完了済み案件の確認 |
| `autoProcess` | `autoProcessFlag` | `false` | 自動処理の使用 |
| `autoProcessLimitDay` | `autoProcessLimitDay` | `null` | 自動処理の期限日数 |
| `autoProcessLimitType` | `autoProcessLimitType` | `0`（autoProcess=true 時） | 期限後処理: 0=承認, 1=否認, 2=差戻し |
| `autoPress` | `autoPressFlag` | `false` | 自動催促の使用 |
| `autoPressLimitDay` | `autoPressLimitDay` | `null` | 自動催促の期限日数 |
| `asyncProcess` | `asyncProcessFlag` | `false` | 非同期処理の使用 |
| `sysDateTargetExpand` | `sysDateTargetExpandFlag` | `false` | 対象者展開日（false=案件開始日, true=処理日） |
| `calendarId` | `calendarId` | `null` | カレンダーID（null=標準カレンダー） |

**注意:** 以下の設定はインポート XML のスコープ外のため、管理画面で手動設定が必要:
- 申請者承認防止処理（`applyUserApprovePreventFlag`）
- 案件操作権限者（`handleUsers` は空配列で出力される）
- 標準組織（`defaultOrgzs` は空配列で出力される）
