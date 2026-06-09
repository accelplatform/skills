---
applyTo: "src/**/*.xml"
---

# xml ファイルの実装・修正を行う際の注意点

1. xml ファイルの編集後、次のコマンドを実行し、バリデーションチェックを行うこと。

```bash
mvn -q -s settings.xml xml-validator:validate -Dsettings=.accel/settings.json -Ddir=src/
```

2. バリデーションエラーが発生した場合は、エラーメッセージを確認し、該当箇所を修正して 1 に戻ること。
3. 2回以上同じエラーが発生する場合はエラーメッセージを表示し、人間に修正させること。