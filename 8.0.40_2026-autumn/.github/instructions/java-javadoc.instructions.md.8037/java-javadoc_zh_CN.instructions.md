---
applyTo: "**/*.java"
description: "JavaDoc 記述規約（public クラス・メソッドへの記述必須範囲）"
---

# JavaDoc 编写规约

> **适用范围**: 🟢 **始终** — 生成・编辑所有 Java 类时适用。

## 适用对象

- **必须**：为所有 public 类・接口编写类 JavaDoc
- **必须**：为所有 public 方法编写方法 JavaDoc
- **推荐**：为 protected 方法也编写方法 JavaDoc
- **不适用**：private 方法、测试类无需 JavaDoc（但推荐为测试方法添加表明目的的注释）
- **不适用**：对于仅为 getter/setter 且含义自明的方法，可省略 JavaDoc

## 类・接口的 JavaDoc

记述功能概述、作者、版本等信息。
version、author 应遵循项目设置。
`@version` 必须始终与项目信息中的当前版本（`{version}`）一致，不得设置为当前版本以外的值。
在修改现有类时，若 `@version` 的值与当前项目版本不同，且不存在 `@since` 标签，则：

1. 将 `@since` 设置为修改前的 `@version` 值（记录类最初创建时的版本）
2. 将 `@version` 更新为当前项目版本（`{version}`）

- `{author}`：项目信息中的作者名
- `{version}`：当前项目版本
- `{initial_version}`：该类最初创建时的版本（新建时与 `{version}` 相同）

```java
/**
 * 执行 RAG（检索增强生成）处理管道的作业类。<br>
 * 负责文档的读取、切分、向量化、以及保存到存储中。
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
```

## 字段注释

添加能够明确其作用的注释。

## 方法的 JavaDoc

详细记述参数、返回值、是否可能返回 null、以及可能抛出的异常。

## 异常消息与日志消息的规则

- **异常消息**：使用日语，需具备说明性，并包含排查问题所需的变量
- **日志消息**：使用英语，明确说明上下文
- **必须**：使用 `e.getMessage()`
- **必须**：不得修改原有逻辑

## 复杂处理的注释

对代码中复杂的处理，添加能够说明其概要的日语注释。

## 外部参数的说明

如果存在外部参数或系统属性的读取，应在 JavaDoc 中记述相关说明。
