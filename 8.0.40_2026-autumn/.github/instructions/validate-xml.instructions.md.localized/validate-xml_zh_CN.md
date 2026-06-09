---
applyTo: "src/**/*.xml"
---

# 实现和修改 xml 文件时的注意事项

1. 执行以下命令，对 xml 文件进行验证检查。

```bash
mvn -q -s settings.xml xml-validator:validate -Dsettings=.accel/settings.json -Ddir=src/
```

2. 如果发生验证错误，请确认错误消息，修正相关部分后返回步骤 1。
3. 如果同一错误出现两次以上，请显示错误消息并交由人工修正。