---
applyTo: "src/main/java/**/*.java, src/test/java/**/*.java"
---

# Java ファイルの実装・修正を行う際の注意点

1. Java ファイルの編集後、次のコマンドを実行し、コードフォーマットを適用すること。

```bash
mvn -q -s settings.xml java-format:apply -Dsettings=.accel/settings.json
```
