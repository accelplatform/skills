# 多个 config 运维

希望将 `import-<artifactId>-config-N.xml` 拆分为 2 个以上的情况大致分为 2 种模式。两者都遵循 **不动既有的 config-1.xml，而是追加新 config** 的原则，但 `spec.version` 的处理和输出路径不同。

| 模式 | `spec.version` | 输出位置 | 用途 |
|---|---|---|---|
| **(I) 版本升级** | 从 `1.0.0` 升至 `1.1.0` 等 | 新版本目录 `1.1.0/`（资料文件名无 suffix） | 发布后想追加投入到租户的功能追加·结构扩展等差分 |
| **(II) 同一版本内追加 config** | 保留（如仍为 `1.0.0`） | 同一 `1.0.0/` 下，文件名末尾带 `-<N>` 后缀（如 `equip-authz-policy-2.xml`） | LogicDesigner 路由生成的资源希望随后附加策略等，**同一版本的初版投入时** 希望控制执行顺序的场景 |

## 共通的设计原则

- **不动既有的 `import-<artifactId>-config-N.xml`**（修改它会需要对既存租户重新投入）
- 新增部分作为 **`import-<artifactId>-config-(N+1).xml`** 新增
- 设置按 `config-1.xml` → `config-2.xml` → ... 的顺序 **全部** 执行（intra-mart Importer 规范）
- 因此新 config 中只描述 **差分**（已投入的内容不再包含）

## 模式 (I)：版本升级运维

1. **创建差分 spec.json**（如 `equip-v110.spec.json`）
   - 指定 `"version": "1.1.0"`、`"configNumber": 2`
   - 仅描述追加·变更的要素（不包含既存角色或授权）
2. **执行 build 脚本**
   ```bash
   node .agents/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js equip-v110.spec.json
   ```
3. **既存文件保护**：若输出位置存在既有文件则会 **报错停止**
   - 如有意覆盖，请附加 `--force` 标志（通常不使用）
4. **生成结果**：
   - `src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-2.xml`（新建）
   - `src/main/storage/system/products/import/basic/<key>/1.1.0/...`（新建，仅差分。**文件名无 suffix**）
   - 既有的 `config-1.xml` 和 `1.0.0/` 不被触碰

## 模式 (II)：同一版本内追加 config

保留 `spec.version` 仅增加 `configNumber` 时，输出文件名的基础部分末尾会附加 `-<N>` 后缀（如 `equip-authz-policy-2.xml`）。这样多个 config 的资料可在同一 `<version>/` 下共存。

主要使用场景：希望在初版设置内 **控制 LogicDesigner 路由与针对其的授权策略的执行顺序** 时。详见 [logic-import.md](logic-import.md#路由用授权策略的投入顺序)。

## 差分 spec.json 示例

```jsonc
{
  "key": "equip",
  "version": "1.1.0",
  "configNumber": 2,                           // <- 指定 2 以不影响既有 config-1.xml
  "shortName": "eqp",
  "displayNames": { "ja": "...", "en": "...", "zh_CN": "..." },

  // 不触碰既有角色，仅追加
  "roles": [
    {
      "id": "equip_auditor",
      "name": "equip_auditor",
      "category": "equip",
      "displayNames": { "ja": "監査担当者", "en": "Auditor", "zh_CN": "审计员" }
    }
  ],

  // 不触碰既有资源，仅追加
  "authzResources": [
    {
      "id": "equip-audit-log",
      "uri": "service://equip/audit/log",
      "parentGroup": "equip-http-services",
      "displayNames": { "ja": "監査ログ", "en": "Audit Log", "zh_CN": "审计日志" }
    }
  ],

  // 仅针对新资源的授权策略
  "authzPolicies": [
    { "resource": "equip-audit-log", "type": "service", "action": "execute",
      "subject": "S(b_m_role:equip_auditor)", "effect": "PERMIT" }
  ]
}
```

## 模式 (I) 注意事项

- **DDL 的差分**：对既有表执行 ALTER TABLE 时，PostgreSQL/Oracle/SQL Server 的语法不同，需用 `1.1.0/equip-ddl_postgre.sql` 等 3 方言分别的文件应对
- **防止重复投入**：不要将 config-1.xml 中已投入的角色 ID 再次写入 config-2.xml（Importer 会报错或覆盖）
- **菜单组**：希望变更已投入的菜单项时，可保持 menu-id 而以差分形式书写 menu-items 结构，或考虑另作运维处理
