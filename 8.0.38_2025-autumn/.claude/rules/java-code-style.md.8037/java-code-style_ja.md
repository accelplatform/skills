---
paths:
  - "**/*.java"
---

# コーディング規約（Java）

> **適用範囲**: 🟢 **常時** — `.java` ファイルを生成・編集する際に適用。

## 変数宣言

### ローカル変数には `final` を積極的に使用する

良い例:
```java
final String userId = "user001";
final List<String> items = new ArrayList<>();
```

悪い例:
```java
String userId = "user001";   // 再代入しないなら final を付ける
```

**理由**:
- 再代入されないことが明示され、可読性・保守性が向上する
- 意図しない再代入によるバグを防げる

### `var`（ローカル変数型推論）は使用しない

良い例:
```java
final Map<String, Object> resultMap = new HashMap<>();
```

悪い例:
```java
var resultMap = new HashMap<String, Object>();   // 型が読み取りづらくなるため使用しない
```

**理由**:
- 右辺だけでは型が判別しにくいケースがあり、可読性が低下する
- レビュー時に型を確認する手間が増える

## 文字列リテラル

### 規則: 文字列は必ずダブルクォート（`"`）

Java の文字列リテラルはダブルクォート以外を認めないため、シングルクォートは `char` リテラル専用として扱う。

良い例:
```java
final String message = "処理が完了しました";
final char delimiter = ',';
```

悪い例:
```java
final char delimiter = ",";   // char には char リテラル（シングルクォート）を使う
```

## 演算子・構文

### オブジェクトの等価判定は `equals()` を使用する

良い例:
```java
if ("active".equals(status)) {
  // 処理
}
if (Objects.equals(userId, targetUserId)) {
  // null許容の比較
}
```

悪い例:
```java
if (status == "active") {    // 参照比較になり意図通りに動作しない
  // 処理
}
```

**理由**:
- `==` は `String` 等の参照型では参照比較になり、値の一致判定にならない
- `Objects.equals()` は null チェックを内包でき、`NullPointerException` を避けられる

### 拡張 for 文 / Stream API を優先する

良い例:
```java
for (String userId : userIds) {
  // 処理
}

final List<String> activeUserIds = users.stream()
    .filter(user -> "active".equals(user.getStatus()))
    .map(User::getUserId)
    .collect(Collectors.toList());
```

悪い例:
```java
for (int i = 0; i < userIds.size(); i++) {   // インデックス操作が不要な場合は拡張for文を使う
  String userId = userIds.get(i);
}
```

### raw type は使用しない

良い例:
```java
final List<String> items = new ArrayList<>();
```

悪い例:
```java
final List items = new ArrayList();   // 総称型パラメータの省略は禁止
```

## 定数の参照

- マジックナンバー・マジックストリングは直接コードに書かず、`public static final` 定数として定義すること
- intra-mart Accel Platform が提供する定数クラス（Java API）はそのまま `import` して参照してよい（JSSP の `d.ts` のような言語間の制約は Java には存在しない）
- 定数はクラス冒頭、または専用の `Constants` クラスにまとめて定義する

良い例:
```java
private static final int MAX_RETRY_COUNT = 3;
private static final String STATUS_ACTIVE = "1";
```

## インデント・フォーマット

### インデント

- スペース2つで統一（設計書や仕様書に指示がある場合は、そちらを優先する）
- ネストが深くなりすぎないよう注意（最大4段階を推奨）

### 1行の長さ

- 120文字以内を推奨
- 長くなる場合は適切な位置で改行

良い例:
```java
final List<User> result = userDao.findByCondition(
    departmentCd, status, orderBy
);
```

**注意: `&&` / `||` での改行は避ける**

条件式の途中で `&&` / `||` の直後に改行を入れると、条件のまとまりが視覚的に追いづらくなり、レビュー時の見落としにつながる。

長い条件式は **ローカル変数に切り出すか、1行にまとめる** こと。

```java
// NG: 行末 && での改行（条件の全体像が把握しづらい）
if (result.getData() != null && result.getData().size() > 0 &&
    result.getData().get(0).getCount() > 0) {
  // 処理
}

// OK: ローカル変数に切り出す
final boolean hasValidResult = result.getData() != null
    && result.getData().size() > 0
    && result.getData().get(0).getCount() > 0;
if (hasValidResult) {
  // 処理
}

// OK: 1行にまとめる
if (result.getData() != null && result.getData().size() > 0 && result.getData().get(0).getCount() > 0) {
  // 処理
}
```

### ブレース（中括弧）のスタイル

```java
// K&R スタイルを使用
public String processData(final String input) {
  if (input == null) {
    return null;
  }

  for (final String item : items) {
    // 処理
  }

  return result;
}
```

## コメント

クラス・メソッドの JavaDoc の書き方は `java-javadoc.md` を参照すること。ここではインラインコメントのみ扱う。

### インラインコメント

```java
// 複雑なロジックには理由を記述
final int threshold = 30;  // 30日以上経過したデータは削除対象

// TODO: #12345 暫定対応。次期リリースで修正予定
```
