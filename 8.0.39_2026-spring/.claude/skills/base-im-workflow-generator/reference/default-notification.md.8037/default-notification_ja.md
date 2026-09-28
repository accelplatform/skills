# 通知・表示テンプレートリファレンス

## 概要

IM-Workflow のインポート XML には通知・表示に関する以下のセクションを含められる。
ただし、これらは**システムデフォルトのテンプレート**として intra-mart 環境にプリインストールされている。
カスタマイズが不要な場合は、インポート XML に含めなくてよい。

## セクション一覧

| セクション | 用途 | デフォルトで存在 |
|-----------|------|----------------|
| `<mail>` | メール通知テンプレート | YES |
| `<imBox>` | IMBox 通知テンプレート | YES |
| `<list_pattern>` | ワークフロー一覧の表示パターン | YES |
| `<message_template>` | 各種メッセージテンプレート | YES |

## mail（メール通知テンプレート）

### テンプレート種別（mailId）

| mailId | 用途 | mailType |
|--------|------|----------|
| act | 代理通知 | 4 |
| autopress | 自動催促 | 5 |
| confirm | 確認通知 | 8 |
| negotiation | 根回し通知 | 9 |
| processing | 処理通知 | 1 |
| reference | 参照通知 | 7 |
| result | 結果通知 | 2 |
| targetchange | 対象者変更通知 | 6 |
| transfer | 振替通知 | 3 |

### 構造

```xml
<mail id="{{mailId}}">
  <value type="array">
    <!-- ロケールごとに繰り返し（ja, en, zh_CN） -->
    <value type="object">
      <mailId type="string">{{mailId}}</mailId>
      <localeId type="string">{{localeId}}</localeId>
      <mailName type="string">{{mailName}}</mailName>
      <note type="string">{{note}}</note>
      <mailTemplatePath type="string">im_workflow/data/default/master/mail/{{mailId}}_{{localeId}}.xml</mailTemplatePath>
      <updateCount type="string">0</updateCount>
      <mailTempType type="array">
        <value type="object">
          <mailId type="string">{{mailId}}</mailId>
          <mailType type="string">{{mailType}}</mailType>
          <mailConfigType type="string">0</mailConfigType>
          <defaultFlag type="string">1</defaultFlag>
        </value>
      </mailTempType>
      <mailTempFileData type="object">
        <mailTemplateSubject type="string">{{subject}}</mailTemplateSubject>
        <mailTemplateFrom type="string">{{from}}</mailTemplateFrom>
        <mailTemplateTo type="array">
          <value type="string">{{to}}</value>
        </mailTemplateTo>
        <mailTemplateCc type="array"><value type="null" /></mailTemplateCc>
        <mailTemplateBcc type="array"><value type="null" /></mailTemplateBcc>
        <mailTemplateReplyTo type="array">
          <value type="string">{{replyTo}}</value>
        </mailTemplateReplyTo>
        <mailTemplateBody type="string">{{body}}</mailTemplateBody>
      </mailTempFileData>
    </value>
  </value>
</mail>
```

### メール本文で使用できる変数（置換文字列）

公式リファレンス（置換文字列ID）: https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html

メールの件名・本文では `{^変数名^}` の形式で置換文字列を使用できる。
使用可能な変数の完全な一覧は上記公式リファレンスの「置換文字列ID」を参照。

代表的な変数:

| 変数 | 説明 |
|------|------|
| `{^Date^}` | 現在日時 |
| `{^IM_URL^}` | システム URL |
| `{^Matter_Nm^}` | 案件名 |
| `{^Flow_Nm^}` | フロー名 |
| `{^Node_Nm^}` | ノード名 |
| `{^Apply_Nm^}` | 申請者名 |
| `{^Process_Nm^}` | 処理者名 |
| `{^Process_Cmt^}` | 処理コメント |
| `{^Process_Result^}` | 処理結果 |

---

## imBox（IMBox 通知テンプレート）

mail と同様の構造。`mailId` → `imBoxId`、`mailType` → `imBoxType` に置き換え。
メール固有項目（Subject, Cc, Bcc, ReplyTo）がなく、From/To/Body のみ。

---

## list_pattern（一覧表示パターン）

### パターン種別（listPageType）

| listPageType | 用途 | デフォルト patternId |
|-------------|------|---------------------|
| 0 | 申請一覧 | default_pattern_0 |
| 1 | 一時保存一覧 | default_pattern_1 |
| 2 | 未処理一覧 | default_pattern_2 |
| 25 | 処理済み一覧（確認） | default_pattern_25 |
| 3 | 処理済み一覧 | default_pattern_3 |
| 4 | 参照一覧 | default_pattern_4 |
| 5 | 確認一覧 | default_pattern_5 |
| 6 | 完了案件一覧 | default_pattern_6 |
| 7 | 過去案件一覧 | default_pattern_7 |
| 8 | 案件操作一覧 | default_pattern_8 |
| 9 | 案件操作一覧（管理者） | default_pattern_9 |

### 表示列（columnId）

| columnId | 表示内容 |
|----------|---------|
| listPageCol_Apply | 申請ボタン |
| listPageCol_FlowName | フロー名 |
| listPageCol_FlowVersionNote | バージョン備考 |
| listPageCol_Flow | フロー操作 |
| listPageCol_MatterName | 案件名 |
| listPageCol_ApplyDate | 申請日 |
| listPageCol_NodeName | ノード名 |
| listPageCol_Status | ステータス |

---

## message_template（メッセージテンプレート）

### テンプレート種別（prefix）

| prefix | 配信先 |
|--------|--------|
| appbox_ | アプリケーションボックス |
| desktop_ | デスクトップ通知 |
| history_ | 処理履歴 |
| mail_ | メール通知 |
| mobile_ | モバイル通知 |
| task_ | タスク通知 |

### イベント種別（suffix）

| suffix | イベント |
|--------|---------|
| ar | 自動催促（Auto Remind） |
| cr | 確認（Confirm） |
| dn | 否認（Deny） |
| n | 根回し（Negotiation） |
| pbk | 引戻し（Pull Back） |
| pr | 処理（Processing） |
| prn | 処理通知 |
| ptcn | 対象者変更（Participant Change） |
| rr | 結果（Result） |
| tn | 振替（Transfer） |

message_template の ID は `{prefix}{suffix}` の形式（例: `appbox_pr`, `mail_dn`）。

---

## 生成時の推奨

1. **通常は含めない**: mail / imBox / list_pattern / message_template はシステムデフォルトが使われるため、インポート XML に含める必要はない
2. **カスタマイズ時のみ含める**: 件名・本文の変更、表示列の追加等が必要な場合のみ含める
3. **既存環境からエクスポート**: カスタマイズする場合は、既存環境からエクスポートした XML をベースに修正するのが安全
