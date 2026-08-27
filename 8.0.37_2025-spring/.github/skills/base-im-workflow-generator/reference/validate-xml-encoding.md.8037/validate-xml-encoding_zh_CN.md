# IM-Workflow XML 编码验证·修复

## 概述

IM-Workflow 导入用 XML 必须以 UTF-16（带 BOM）保存。
IM-Workflow 可读取 UTF-16 LE 或 BE 两种字节序，但缺失 BOM 或仍为 UTF-8 时将导致导入失败。
生成时可能出现以下损坏情况，因此保存后必须进行验证·修复。

## 常见损坏模式

| # | 症状 | 原因 | 检测方法 |
|---|------|------|---------|
| 1 | 无 BOM（LE） | iconv 未附加 BOM | 前 2 字节为 `3C 00` |
| 2 | 无 BOM（BE） | 同上 | 前 2 字节为 `00 3C` |
| 3 | 仍为 UTF-8 | iconv 转换失败 / 未执行 | 首字节为 `3C`（`<` 的 ASCII）或 `EF BB BF`（UTF-8 BOM） |
| 4 | 双重 BOM（LE） | BOM 附加执行了 2 次 | 前 4 字节为 `FF FE FF FE` |
| 5 | 双重 BOM（BE） | 同上 | 前 4 字节为 `FE FF FE FF` |
| 6 | XML 声明 encoding 不匹配 | 转换后 encoding 属性缺失 | 不含 `encoding="UTF-16"` |
| 7 | 末尾不是 `</data>` | 转换过程中文件被截断 | 末尾没有 `</data>` |

## 执行

验证·修复脚本已随技能集一同提供。XML 生成后，从项目根目录执行：

```bash
node .github/skills/base-im-workflow-generator/scripts/validate-xml-encoding.js <xml-path>
```

检测与修复行为：

| 输入 | 动作 | 修复后字节序 |
|------|------|------------|
| UTF-16LE + BOM | 直接 `OK` | LE |
| UTF-16BE + BOM | 直接 `OK` | BE |
| UTF-16LE（无 BOM） | 附加 LE BOM 并覆盖写入 | LE |
| UTF-16BE（无 BOM） | 附加 BE BOM 并覆盖写入 | BE |
| UTF-8（带 / 不带 BOM） | 转换为 UTF-16LE（带 LE BOM）并覆盖写入 | LE |
| 双重 BOM（LE） | 移除多余的 LE BOM 并覆盖写入 | LE |
| 双重 BOM（BE） | 移除多余的 BE BOM 并覆盖写入 | BE |
| 不含 `encoding="UTF-16"` 声明 | 输出 `WARN`（不修复） | — |
| 末尾不是 `</data>` | `ERROR`（无法修复，需重新生成文件） | — |

> UTF-16 输入在修复过程中保留原始字节序。UTF-8 输入转换为 UTF-16 时默认使用 LE。
> `build-workflow.js` 以 UTF-16BE 输出，因此其输出经过本脚本时通常会直接 `OK` 通过。

## 输出的解读

| 输出 | 含义 | 退出码 |
|------|------|--------|
| `OK: {path}` | 正常。无需修复 | 0 |
| `FIX: ... / FIXED: {path}` | 检测到损坏并已修复 | 0 |
| `WARN: ...` | 轻微问题（建议手动确认） | 0 |
| `ERROR: ...` | 严重问题（需要重新生成文件） | 1 |
