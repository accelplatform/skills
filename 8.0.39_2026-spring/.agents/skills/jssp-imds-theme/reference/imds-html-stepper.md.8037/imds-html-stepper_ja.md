# Stepper

## 基本情報

Stepper は、ユーザが複数のステップで行うべき作業を、順番に実行するための部品です。
タスクの進行状況を可視化することで、完了までのタスクを明確にします。
複数段階で作業を行うウィザードなどの画面で使用します。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-stepper--documentation
- 基本クラス: imds-stepper

## 全体構造

```
imds-stepper                              # ステッパーコンテナ
└── ul                                    # ステップリスト
    └── li.imds-stepper-step              # 各ステップ
        │                                 #   状態クラス: is-completed（完了） / is-active（作業中） / なし（未到達）
        └── button                        # ステップ本体（任意で imds-icon + label）
```

ステップ間の接続線は CSS で自動描画されるため、HTML 側での記述は不要。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-stepper | div 要素 | ステッパーコンテナ | 必須 |
| imds-stepper-step | li 要素 | 各ステップ | 必須 |
| is-completed | imds-stepper-step | 完了済みステップ | オプション |
| is-active | imds-stepper-step | 作業中（現在の）ステップ | オプション |
| imds-line-clamp-1 | span 要素 | テキスト1行で省略 | オプション |
| imds-line-clamp-2 | span 要素 | テキスト2行で省略 | オプション |

## HTML スニペット

### 基本ステッパー

```html
<div class="imds-stepper">
  <ul>
    <li class="imds-stepper-step is-completed">
      <button><span>Step.1</span></button>
    </li>
    <li class="imds-stepper-step is-active">
      <button><span>Step.2</span></button>
    </li>
    <li class="imds-stepper-step">
      <button><span>Step.3</span></button>
    </li>
  </ul>
</div>
```

以降は基本ステッパーからの差分のみを示す。

## バリエーション

### ステップ状態（is-completed, is-active）

`li.imds-stepper-step` に状態クラスを付与する。
クラスなしは未到達を表す。

```html
<li class="imds-stepper-step is-completed">  <!-- 完了済み -->
<li class="imds-stepper-step is-active">      <!-- 作業中 -->
<li class="imds-stepper-step">                <!-- 未到達 -->
```

### disabled

各ステップの `button` に `disabled` 属性を付与する。

```html
<button disabled><span>Step.1</span></button>
```

### lineClamp（テキスト省略）

長いラベルを省略表示する。`span` に `imds-line-clamp-1`（1行）または `imds-line-clamp-2`（2行）を付与し、`button` に `title` で全文を設定する。

```html
<li class="imds-stepper-step">
  <button title="長いステップ名の全文をここに記載">
    <span class="imds-line-clamp-1">長いステップ名の全文をここに記載</span>
  </button>
</li>
```

## 組み合わせ例

### Icon との組み合わせ

`button` 内に `imds-icon` を追加する。
ラベルの前後どちらにも配置可能。

```html
<button>
  <span class="imds-icon is-small"><i class="fa-solid fa-user"></i></span>
  <span>Step.1</span>
</button>
```

## 実装上の注意

- ステップは `ul > li` のリスト構造で記述する
- `is-completed` は完了済みステップ、`is-active` は現在のステップに付与し、未到達ステップにはクラスを付与しない
- `is-active` は同時に1つのステップにのみ付与する
- ステップ間の接続線は CSS で自動描画される（HTML での記述は不要）
- ステップのクリック時の遷移処理は JavaScript で制御する
- `imds-line-clamp-*` 使用時は `button` の `title` 属性に全文を設定し、ホバーで確認できるようにする
- 実DOM例（インポート画面等）では、`imds-stepper` はヘッダ（`imds-header`）直下・後続コンテンツの直前にそのまま配置され、`imds-stepper` 自身に余白ユーティリティは付与されていない。余白は後続の `section` 側（`imds-py-6 imds-px-8` 等）で確保されている。ステッパー自体に特定の余白クラス（`imds-pb-4` 等）を付与する固定ルールは存在しないため、実装時は uiux-share の実例に倣い、余白はステッパーの外側（後続セクション等）で調整すること
