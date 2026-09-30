# 性能规约

> **适用范围**: 🟡 **上下文依赖** — 仅在性能调优时适用，例如编译器设置或 session.js 的调整等。

## JavaScript 编译器设置

### source-config.xml 的设置

```xml
<!-- 开发环境：解释器模式 -->
<source-config>
  <compiler>false</compiler>
</source-config>

<!-- 生产环境：编译模式 -->
<source-config>
  <compiler>true</compiler>
</source-config>
```

| 设置值 | 用途 | 特点 |
|--------|------|------|
| `false` | 开发环境 | 源代码修改后立即生效，资源消耗较多 |
| `true` | 生产环境 | 编译后缓存，速度快，但修改时需要重启 |

## session.js 的注意事项

- 修改 `session.js` 后，**需要重启服务器**
- 在服务器重启之前，修改不会生效
- 生产环境的修改需要有计划地实施
