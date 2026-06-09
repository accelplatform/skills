---
applyTo: "src/main/java/**/*.java, src/test/java/**/*.java"
---

# 实现或修改 Java 文件时的注意事项

1. 编辑 Java 文件后，执行以下命令以应用代码格式化。

```bash
mvn -q -s settings.xml java-format:apply -Dsettings=.accel/settings.json
```
