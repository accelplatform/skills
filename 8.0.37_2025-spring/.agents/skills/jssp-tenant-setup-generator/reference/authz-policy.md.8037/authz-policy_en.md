# Authorization Policy XML Specification

Defines "who can perform which action on what resource". **Has no multilingual variant**.

## Namespace

```xml
<root xmlns="http://www.intra-mart.jp/authz/imex/policy">
  ...
</root>
```

## Structure

```xml
<authz-policy resource="any-app-content-maintenance"
              type="service"
              action="execute"
              subject="S(b_m_role:tenant_manager)">PERMIT</authz-policy>
```

| Attribute | Required | Description |
|-----------|----------|-------------|
| `resource` | YES | Resource ID (the `id` attribute defined in `authz-resource`), or a hash value of the resource |
| `type` | YES | Resource type. See the table below |
| `action` | YES | Action name. See the table below |
| `subject` | YES | Expression for the target subject (see next section) |
| Element body | YES | `PERMIT` (allow) or `DENY` (deny) |

### Mapping of type and action

The types used in this project are as follows.

| type | Purpose | Typical action |
|------|---------|----------------|
| `service` | HTTP / internal services such as screens, APIs, and jobs (URIs defined in authz-resource as `service://...`) | `execute` |
| `im-menu-group` | Menu group (the resource takes the hash value of the menu group ID) | `read` |
| `im-logic-rest` | IM-LogicDesigner routing (REST API endpoint). Authorization against `authzUri` in `flow_route.json` (e.g. `im-logic-rest://<flowId>`). The resource takes the **SHA-256 hash of the authzUri string (hex lowercase)**. See [logic-import.md](logic-import.md#order-of-loading-routing-authorization-policies) for details | `execute` |

## subject expression syntax

Basic form:

```
S(<provider>:<value>)
```

Logical operators can be combined (function-call style syntax):

```
AND(S(...), S(...), ...)   logical AND
OR(S(...), S(...), ...)    logical OR
NOT(S(...))                negation
```

Can be nested. Example: `AND(S(b_m_role:account_manager), NOT(S(imm_user:aoyagi)))`

### provider list

| provider | Value format (argument count) | Example |
|----------|-------------------------------|---------|
| `im_authz_meta_subject` | Meta identifier (1) | `S(im_authz_meta_subject:authenticated)` (authenticated user)<br>`S(im_authz_meta_subject:anonymous)` (guest user) |
| `b_m_role` | Role ID (1) | `S(b_m_role:tenant_manager)` |
| `imm_user` | IM Common Master user code (1) | `S(imm_user:aoyagi)` |
| `imm_department` | IM Common Master organization (4)<br>`<company> <organization set> <organization> <category>` | `S(imm_department:comp_sample_01 comp_sample_01 dept_other_11 le)` |
| `imm_company_post` | IM Common Master company post (4)<br>`<company> <organization set> <post> <category>` | `S(imm_company_post:comp_sample_01 comp_sample_01 ps001 eq)` |
| `imm_public_grp` | IM Common Master public group (3)<br>`<public group set> <public group> <category>` | `S(imm_public_grp:sample_public public_group_a eq)` |
| `imm_public_grp_role` | Role within a public group (3)<br>`<public group set> <role ID> <category>` | `S(imm_public_grp_role:sample_public 8hys58zblgeo1qh eq)` |

### Category values (comparison operator in the last argument)

The last argument of `imm_department` / `imm_company_post` / `imm_public_grp` / `imm_public_grp_role` is the comparison operator against the organization hierarchy:

| Value | Meaning |
|-------|---------|
| `eq` | equal (only matches the specified organization) |
| `lt` | less than (ancestor organizations, excluding self) |
| `le` | less than or equal (ancestor organizations + self) |
| `gt` | greater than (descendant organizations, excluding self) |
| `ge` | greater than or equal (descendant organizations + self) |

Example: to target everyone under department `dept_other_11`, use `ge`; for self only, use `eq`; for descendants only (excluding self), use `gt`.

### Subject specification by "company" unit

In the intra-mart organization model, "company" is treated as the top level of the organization tree. A subject expression that targets an entire company does not use a dedicated provider but is expressed via `imm_department`:

```
S(imm_department:<company code> <company code> <company code> le)
```

Set the company code as the 2nd argument (organization set code) and the 3rd argument (organization code), and use category `le` to mean "specified organization + ancestors" (since the company is at the top, this effectively targets all organizations under the company).

Concrete examples:

```
S(imm_department:comp_sample_01 comp_sample_01 comp_sample_01 le)   # Sample company
S(imm_department:comp_other_01 comp_other_01 comp_other_01 le)      # Other company
```

### Examples of compound expressions

```
# Holders of the account_manager role, excluding user aoyagi
AND(S(b_m_role:account_manager), NOT(S(imm_user:aoyagi)))

# Either ueda or aoyagi
OR(S(imm_user:ueda), S(imm_user:aoyagi))

# Compound condition over the organization hierarchy (ancestors and descendants combined with AND)
AND(
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 lt),
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 le),
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 gt),
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 ge)
)
```

### Roles pre-registered as intra-mart standard (`b_m_role`)

Roles that exist by default at tenant setup and can be used in subject expressions without additional definitions.

| Role ID | Purpose |
|---------|---------|
| `tenant_manager` | Tenant administrator (full privileges) |
| `authz_manager` | Authorization administrator |
| `menu_manager` / `menu_operator` | Menu administrator / operations administrator |
| `account_manager` | Account administrator |
| `role_manager` | Role administrator |
| `calendar_manager` | Calendar administrator |
| `job_sche_manager` | Job scheduler administrator |
| `im_master_manager` / `im_master_operator` | IM Common Master administrator / operations administrator |
| `portal_manager` / `imprtl_manager` / `imprtl_prlt_manager` | Portal-related administrators |
| `im_workflow_manager` / `im_workflow_operator` / `im_workflow_auditor` / `im_workflow_user` | IM-Workflow related |
| `imld_manager` | IM-LogicDesigner administrator |
| `imbm_manager` | IM-BloomMaker administrator |
| `imr_manager` / `imr_log_manager` | IM-Repository related |
| `viewcreator_manager` / `tablemainte_manager` / `file_exc_manager` | Utility related |
| `accel_studio_manager` | Accel Studio administrator |
| Others: `ticket_manager`, `im_knowledge_manager`, `im_knowledge_user`, `forma_app_manager`, `forma_app_creator`, `bis_manager`, `bis_business_manager`, `bis_auditor`, `bis_user`, `bis_ws_imw_user`, `forma_ws_imw_user` | Product-specific roles |

These can be used directly in subject expressions without being defined in `<key>-role.xml`. New roles (e.g. `equip_admin`) require a definition in `<key>-role.xml`.

## Notation in spec.json

```json
"authzPolicies": [
  {
    "resource": "any-app-content-maintenance",
    "type": "service",
    "action": "execute",
    "subject": "S(b_m_role:tenant_manager)",
    "effect": "PERMIT"
  },
  {
    "resource": "any-app-search-master",
    "type": "service",
    "action": "execute",
    "subject": "S(im_authz_meta_subject:authenticated)",
    "effect": "PERMIT"
  }
]
```

When `effect` is omitted, it is treated as `PERMIT`.

## Default Policy (Automatic Grant for the Tenant Administrator)

**The tenant administrator (`tenant_manager`) is, as an implicit default, always granted PERMIT on every service resource and every menu group.**

`build-setup-import.js` **automatically adds** the following (emitted at the end of the generated XML under a `<!-- 既定ポリシー: ... -->` comment):

| Target | Auto-added policy |
|--------|-------------------|
| Each service resource in `spec.authzResources` | `type="service" action="execute" subject="S(b_m_role:tenant_manager)"` PERMIT |
| Each menu group in `spec.menuGroups` | `type="im-menu-group" action="read" subject="S(b_m_role:tenant_manager)"` PERMIT (`resource` is the hash of the menu group ID) |

- Therefore there is **no need to write `tenant_manager` explicitly** in `authzPolicies` (for either service resources or menu groups). Even if you do, the same `(resource, type, tenant_manager)` is not emitted twice.
- Roles/users other than `tenant_manager` are granted only when **explicitly specified in the design document or prompt**, by listing them in `authzPolicies`.
- This is a convention to guarantee that the tenant administrator can always intervene in case of trouble.

## Authorization for menu groups

When `type="im-menu-group"`, the `resource` must be set to the **hash value of the menu group ID**. The intra-mart authorization resource ID is computed by the following logic:

```
SHA-256("im-menu-group://menugroups/" + <id of menu-group-data>)
```

Example: for `equip_sm-pc` -> SHA-256(`"im-menu-group://menugroups/equip_sm-pc"`) = `df629efcf7244ec8901dfff950f670e73eaae5726a3a944542ad3d4da092fe6c`

```xml
<authz-policy resource="df629efcf7244ec8901dfff950f670e73eaae5726a3a944542ad3d4da092fe6c"
              type="im-menu-group" action="read"
              subject="S(b_m_role:equip_admin)">PERMIT</authz-policy>
```

### Automation in spec.json

The build script recognizes the following placeholders and expands them to hash values automatically:

| Placeholder | Behavior |
|-------------|----------|
| `REPLACE_WITH_MENU_GROUP_HASH` | Auto-computed from `spec.menuGroups[0].id` |
| `REPLACE_WITH_MENU_GROUP_HASH:<menuGroupId>` | Computed from the explicitly specified id (supports multiple menu groups) |

```jsonc
"authzPolicies": [
  { "resource": "REPLACE_WITH_MENU_GROUP_HASH", "type": "im-menu-group", "action": "read",
    "subject": "S(b_m_role:equip_admin)", "effect": "PERMIT" }
]
```

## Authorization for IM-LogicDesigner routing

When `type="im-logic-rest"`, the `resource` must be set to the **SHA-256 hash (hex lowercase) of the routing `authzUri` string**.

```
SHA-256(<authzUri in flow_route.json>)
```

Example: if `flow_route.json` has `"authzUri": "im-logic-rest://sample_simple"` -> SHA-256(`"im-logic-rest://sample_simple"`) = `d01beab0f047ab86a94e9358a800a5f1119a5465486a94d011d9ca1243ee7f62`

```xml
<authz-policy resource="d01beab0f047ab86a94e9358a800a5f1119a5465486a94d011d9ca1243ee7f62"
              type="im-logic-rest" action="execute"
              subject="S(im_authz_meta_subject:authenticated)">PERMIT</authz-policy>
```

If `type` is set to `service`, the resource is registered in the `im-logic-rest` namespace and the policy is not bound to the actual resource, so it is **silently ignored when Importer runs** (no error is reported, but authorization does not take effect). Be careful.

Furthermore, this resource is only registered once the `logicImport` extension import JS runs, so **referencing it from the `<authz-policy-file>` of the same config-N.xml will load the policy while the resource is still unregistered, which invalidates it**. Routing-related policies must be separated into a different `configNumber`. See [logic-import.md](logic-import.md#order-of-loading-routing-authorization-policies) for the operational procedure.

## Best practices

- For simple cases (permitting a specific role), enumerate one row per resource. Use `AND` / `OR` / `NOT` **only for complex conditions (excluding specific users, filtering by organization hierarchy, etc.)**
- `tenant_manager` is automatically granted on every service resource and every menu group (see "Default Policy" above). There is no need to write it in `authzPolicies`; **list only the other target roles/users**
- Permitting `authenticated` (all authenticated users) should be limited to lightweight services such as search and selection
- When narrowing the target to the organization hierarchy, `ge` (self + descendants) is the most common. Be aware of boundary conditions (inclusive/exclusive) of the hierarchy and choose between `eq` / `lt` / `le` / `gt` / `ge` accordingly

## Limitations

The following are known limitations of the intra-mart authorization subject DSL:

- **Cannot reference subject groups**: Groups defined in `authz-subject-group.xml` cannot themselves be referenced in subject expressions. Even when you want to use the same condition in multiple authorization policies, you must **write the `S(...)` expression directly each time** in each `authz-policy`'s `subject` (a DRY violation, but it is the specification)
- **IM Common Master providers are fixed**: There is **no way** to specify IM Common Master entities in subject expressions other than the provider list (`imm_user` / `imm_department` / `imm_company_post` / `imm_public_grp` / `imm_public_grp_role`). For example, "directly specifying a specific post code" or "using concurrent assignment relationships as conditions" is not possible
- **No dedicated provider for "company" unit**: To target an entire company, use the `<company code> <company code> <company code> le` form in `imm_department` (see the earlier section "Subject specification by 'company' unit"). There is no dedicated provider such as `imm_company`
