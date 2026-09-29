# フロー要素 API リファレンス

## 引数・戻り値に使用可能な型

- プリミティブ型
- `java.lang.String`
- `java.lang.Boolean` / `java.lang.Byte` / `java.lang.Character` / `java.lang.Short` / `java.lang.Integer` / `java.lang.Long` / `java.lang.Float` / `java.lang.Double`
- `java.math.BigDecimal` / `java.math.BigInteger`
- `java.util.Calendar` / `java.util.Date` / `java.util.Locale` / `java.util.TimeZone`
- `jp.co.intra_mart.foundation.i18n.datetime.DateTime` / `jp.co.intra_mart.foundation.i18n.datetime.Duration`
- `java.sql.Date` / `java.sql.Timestamp`
- `jp.co.intra_mart.foundation.logic.data.basic.Binary`
- `jp.co.intra_mart.foundation.service.client.file.Storage`
- `java.util.Map`
- `java.lang.Object`

上記の型を内包する `java.util.Collection` または `java.util.List` も使用可能。その場合、読み取り用メソッド（getter）に `jp.co.intra_mart.foundation.logic.annotation.TypeHint` アノテーションを付与し、内包する型を指定する。

```java
@TypeHint(Integer.class)
public Collection<Integer> getIntegerListParameter() {
    return integerListParameter;
}
```

引数・戻り値クラスは、フィールドに対する getter/setter を JavaBeans の規約に沿って実装した POJO として作成する。

## プロパティに使用可能な型

プロパティ（後述）に使用可能な型は引数・戻り値より少ない。

- プリミティブ型
- `java.lang.String`
- `java.lang.Boolean` / `java.lang.Character` / `java.lang.Short` / `java.lang.Integer` / `java.lang.Long` / `java.lang.Float` / `java.lang.Double`
- `java.math.BigDecimal` / `java.math.BigInteger`
- `java.util.Date`
- `java.sql.Date` / `java.sql.Timestamp`
- `java.lang.Enum`

## クラス・インタフェース・アノテーション一覧（FQCN）

| 名前 | FQCN | 種別 |
|------|------|------|
| `ElementCategory` | `jp.co.intra_mart.foundation.logic.element.category.ElementCategory` | インタフェース |
| `Task` | `jp.co.intra_mart.foundation.logic.element.Task` | 抽象クラス |
| `FlowElement` | `jp.co.intra_mart.foundation.logic.element.FlowElement` | 抽象クラス（`Task` の親） |
| `Executable` | `jp.co.intra_mart.foundation.logic.element.Executable` | インタフェース（`Task` が実装） |
| `ElementContext` | `jp.co.intra_mart.foundation.logic.element.ElementContext` | インタフェース |
| `FlowElementCloser` | `jp.co.intra_mart.foundation.logic.element.FlowElementCloser` | インタフェース |
| `FlowElementMetadata` | `jp.co.intra_mart.foundation.logic.element.metadata.FlowElementMetadata` | 抽象クラス |
| `ElementProperty` | `jp.co.intra_mart.foundation.logic.element.metadata.ElementProperty` | クラス |
| `LogicFlowElement` | `jp.co.intra_mart.foundation.logic.annotation.LogicFlowElement` | アノテーション |
| `TypeHint` | `jp.co.intra_mart.foundation.logic.annotation.TypeHint` | アノテーション |
| `FlowExecutionException` | `jp.co.intra_mart.foundation.logic.exception.FlowExecutionException` | 例外クラス |
| `ElementScanPackageFactory` | `jp.co.intra_mart.system.logic.factory.ElementScanPackageFactory` | インタフェース（`reference/registration-and-packaging.md` 参照） |

## ElementCategory インタフェース

```java
public interface ElementCategory {
    String getCategoryId();
    String getDisplayName();
    int getSortNumber();
}
```

- `getCategoryId()`: カテゴリ ID。**`im_` で始まる文字列は指定できない**
- `getDisplayName()`: パレット上に表示されるカテゴリ名。多言語化する場合は MessageManager API 等で利用者のロケールに応じた値を返却する
- `getSortNumber()`: パレット表示順。値が小さいほど先頭に表示される。標準機能は1以降の連番を使用

## LogicFlowElement アノテーション

```java
public @interface LogicFlowElement {
    String id();
    Class<? extends ElementCategory> category();
    int index();
    String pairId();
}
```

- `id`: フロー要素 ID。**`im_` で始まる文字列は指定できない**
- `category`: 所属カテゴリクラス
- `index`: パレット表示順（カテゴリ内でのソート番号）
- `pairId`: 対になるフロー要素の ID を指定する属性（ループ開始/終了タスクのような対構造を持つ要素向け）

`@LogicFlowElement` を付与したクラスは起動時に自動的に読み込まれる。

## Task クラス

```java
public abstract class Task<T extends Metadata, D, R>
        extends FlowElement<T> implements Executable<D, R> {

    protected Task(ElementContext context);

    // Executable<D, R> の実装（Task が空実装を提供、任意でオーバーライド可）
    public void preprocessing() throws FlowExecutionException;
    public R execute(D parameter) throws FlowExecutionException;  // abstract。必ず実装する
    public void postprocessing() throws FlowExecutionException;

    public void setContinueOnError(boolean continueOnError);
    public boolean isContinueOnError();
}
```

型パラメータは順に「メタデータクラス」「引数の型」「戻り値の型」。

- コンストラクタは `ElementContext` を受け取る。`super(context)` を呼び出すこと
- `execute` がフロー要素実行時に呼び出される本体処理。**必ずオーバーライドする**
- `preprocessing` / `postprocessing` は `Task` が空実装を提供するため、前処理・後処理が不要であればオーバーライド不要
- `FlowElement` から継承する `getAlias()` / `setAlias(String)` はデザイナ上でのフロー要素の別名を扱う

## ElementContext インタフェース

```java
public interface ElementContext {
    LogicFlowElementDefinition getElementDefinition();
    LogicSession getLogicSession();
    void addFlowElementCloser(FlowElementCloser closer);
}
```

`addFlowElementCloser` に自身（または他のインスタンス）を登録することで、フロー実行後に `FlowElementCloser#close()` が呼び出される（後述）。

## FlowElementMetadata クラス

```java
public abstract class FlowElementMetadata implements Metadata {

    protected FlowElementMetadata(Class<? extends FlowElement<? extends Metadata>> elementClass);

    public abstract String getElementName();  // 要オーバーライド

    protected ElementProperty decorateElementProperty(ElementProperty elementProperty);

    public ElementKey getKey();
    public int index();
    public ElementKey getPairElementKey();
    public String getIconId();
    public Collection<ElementProperty> getElementProperties();
    public DataDefinition getInputDataDefinition();
    public DataDefinition getOutputDataDefinition();
    public Class<? extends FlowElement<? extends Metadata>> getElementClass();
}
```

- コンストラクタにフロー要素クラス（`Task` を継承したクラス）を渡すことで、フロー要素の引数・戻り値のデータ型が自動解析され、メタ情報として取り込まれる
- `getElementName()`: パレット上に表示される要素名。**必ずオーバーライドする**。多言語化する場合は MessageManager API 等を利用する
- `decorateElementProperty(ElementProperty)`: プロパティ項目をカスタマイズする際にオーバーライドする（後述）
- `getIconId()`: パレット上のアイコンを指定する際にオーバーライドする

## プロパティの追加

フロー要素の引数・戻り値はロジックフローのマッピングで使用されるが、それとは別に、デザイナの設定画面で事前に値を設定しておく「プロパティ」機構がある。

プロパティを追加するには、フロー要素クラス自体にプロパティ用のフィールドと getter/setter を追加する。

```java
@LogicFlowElement(id = "my_task", category = MyCategory.class, index = 100)
public class MyTask extends Task<MyTaskMetadata, MyParameter, MyResult> {

    private String customProperty;

    public MyTask(ElementContext context) {
        super(context);
    }

    public String getCustomProperty() {
        return customProperty;
    }

    public void setCustomProperty(String customProperty) {
        this.customProperty = customProperty;
    }

    @Override
    public MyResult execute(MyParameter parameter) throws FlowExecutionException {
        MyResult result = new MyResult();
        result.setMessage("hello world.");
        return result;
    }
}
```

プロパティを追加しただけでも、デザイナの設定画面からそのまま値を設定できる（項目名はプロパティ名がそのまま表示される）。表示名やデフォルト値を変更するには、メタデータクラスで `decorateElementProperty` をオーバーライドする。

```java
public class MyTaskMetadata extends FlowElementMetadata {

    public MyTaskMetadata() {
        super(MyTask.class);
    }

    @Override
    public String getElementName() {
        return "サンプルタスク";
    }

    @Override
    protected ElementProperty decorateElementProperty(ElementProperty elementProperty) {
        if ("customProperty".equals(elementProperty.getPropertyName())) {
            elementProperty.setDefaultValue("hello world.");
            elementProperty.setLabelKey("MYTASK.CUSTOMPROPERTY.LABEL.KEY");
        }
        return elementProperty;
    }
}
```

- `setDefaultValue(Object)`: プロパティのデフォルト値を指定する
- `setLabelKey(String)`: プロパティの表示名にあたる多言語化リソースのキーを指定する
- `setType(String)`: プロパティの表示タイプを変更する。例えば `boolean` 型プロパティに `"flag"` を指定するとデザイナ上でチェックボックスとして扱われる

### ElementProperty クラスのメソッド一覧

`decorateElementProperty` に渡ってくる `ElementProperty` インスタンスが持つメソッドは以下の通り（実クラスの公開 API 全量）。`getPropertyName()` / `isEnable()` / `isRequired()` / `isArray()` / `getDefaultValue()` / `getType()` / `getTextKey()` / `getLabelKey()` / `getOptions()` にそれぞれ対応する setter が存在する。上記本文で解説した `setDefaultValue` / `setLabelKey` / `setType` 以外の setter（`setEnable` / `setRequired` / `setArray` / `setOptions` 等）については公式ガイドに説明が無いため、本スキルでは用途の断定を行わない。

```java
public class ElementProperty {
    public String getPropertyName();
    public boolean isEnable();
    public void setEnable(boolean enable);
    public boolean isRequired();
    public void setRequired(boolean required);
    public boolean isArray();
    public void setArray(boolean array);
    public Object getDefaultValue();
    public void setDefaultValue(Object defaultValue);
    public String getType();
    public void setType(String type);
    public String getTextKey();
    public void setTextKey(String textKey);
    public String getLabelKey();
    public void setLabelKey(String labelKey);
    public ElementProperty.Option[] getOptions();
    public void setOptions(ElementProperty.Option[] options);
}
```

`ElementProperty.Option` は `name` / `labelKey` / `value` の3フィールドと対応する getter/setter を持つ入れ子クラス。

## 後処理の追加（FlowElementCloser）

ロジックフロー実行後に任意の処理（フロー要素内で使用したリソースの開放等）を呼び出したい場合、`jp.co.intra_mart.foundation.logic.element.FlowElementCloser` インタフェースを実装し、コンストラクタで `ElementContext#addFlowElementCloser` に登録する。

```java
public class MyTask extends Task<MyTaskMetadata, MyParameter, MyResult>
        implements FlowElementCloser {

    private String customProperty;

    public MyTask(ElementContext context) {
        super(context);
        context.addFlowElementCloser(this);
    }

    @Override
    public MyResult execute(MyParameter parameter) throws FlowExecutionException {
        MyResult result = new MyResult();
        result.setMessage("hello world.");
        return result;
    }

    @Override
    public void close() {
        // リソース開放等の後処理
    }

    public String getCustomProperty() {
        return customProperty;
    }

    public void setCustomProperty(String customProperty) {
        this.customProperty = customProperty;
    }
}
```

`FlowElementCloser` はフロー要素クラス自身に実装する必要はなく、別クラスに実装したインスタンスを登録することも可能（`addFlowElementCloser` の引数型は `FlowElementCloser` インタフェース）。

## 完全な実装例（引数・戻り値クラス）

```java
package org.example.logicdesigner.element;

import java.util.Collection;

import jp.co.intra_mart.foundation.logic.annotation.TypeHint;

public class MyParameter {

    private String stringParameter;
    private boolean booleanParameter;
    private String[] stringArrayParameter;
    private Collection<Integer> integerListParameter;

    public String getStringParameter() {
        return stringParameter;
    }

    public void setStringParameter(String stringParameter) {
        this.stringParameter = stringParameter;
    }

    public boolean isBooleanParameter() {
        return booleanParameter;
    }

    public void setBooleanParameter(boolean booleanParameter) {
        this.booleanParameter = booleanParameter;
    }

    public String[] getStringArrayParameter() {
        return stringArrayParameter;
    }

    public void setStringArrayParameter(String[] stringArrayParameter) {
        this.stringArrayParameter = stringArrayParameter;
    }

    @TypeHint(Integer.class)
    public Collection<Integer> getIntegerListParameter() {
        return integerListParameter;
    }

    public void setIntegerListParameter(Collection<Integer> integerListParameter) {
        this.integerListParameter = integerListParameter;
    }
}
```

```java
package org.example.logicdesigner.element;

public class MyResult {

    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
```

## エラーハンドリング

`execute` / `preprocessing` / `postprocessing` はいずれも `FlowExecutionException`（`jp.co.intra_mart.foundation.logic.exception.LogicServiceException` のサブクラス）を `throws` 宣言済みであり、フロー要素内でのエラーはこの例外で表現する。

```java
public FlowExecutionException();
public FlowExecutionException(Throwable cause);
public FlowExecutionException(MessageCode messageCode);
public FlowExecutionException(MessageCode messageCode, Throwable cause);
public FlowExecutionException(MessageCode messageCode, String[] args);
// 他、MessageCode を組み合わせたコンストラクタが複数存在する
```

単純なメッセージ・原因例外のみを扱う場合は `new FlowExecutionException(cause)` で十分。`MessageCode` を使ったメッセージコード体系に載せたい場合はプラットフォーム標準のログ・メッセージ管理機構（`jp.co.intra_mart.foundation.log.MessageCode`）に従う。
