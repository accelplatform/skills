---
applyTo: "src/main/java/**/*.java, src/test/java/**/*.java"
---

# Notes for Implementing or Modifying Java Files

1. After editing a Java file, run the following command to apply code formatting.

```bash
mvn -q -s settings.xml java-format:apply -Dsettings=.accel/settings.json
```
