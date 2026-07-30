# Extended Import (doImport) Specification

A JSSP script referenced by `<extends-import-class>`. **It is invoked sequentially in the order of the `<extends-import>` sections** within `import-<artifactId>-config-N.xml`. Use it to implement application-specific initialization that the Importer's standard processing cannot perform.

## Execution Order

The intra-mart Importer executes config-1.xml → config-2.xml → ... **in numerical order**. Within each config, processing proceeds in the order `<database>` → `<tenant-master>` (authz / menu / job, etc.) → `<extends-import>`.

Example: execution order when `config-1.xml` and `config-2.xml` are both present:

```
config-1.xml: database → tenant-master(authz/menu/job) → extends-import(doImport)
config-2.xml: database → tenant-master(authz/menu/job) → extends-import(doImport)
```

In other words, the `doImport` of `config-1.xml` is invoked **immediately after the tenant masters of that config have been loaded**. It is not at the end of the entire tenant environment setup.

### Implications for Version Upgrades

- The `doImport` of `config-1.xml` operates on the assumption that **the masters loaded in that version (config-1)** are present
- Masters that will be added in `config-2.xml` do not yet exist when the `doImport` of `config-1.xml` runs
- Each version's `doImport` should be implemented to depend only on **the scope loaded in its own config number**

## Placement Path

```
src/main/jssp/src/<key>/initialize/<version>/<key>_import.js
```

The `<extends-import-class>` within `import-<artifactId>-config-1.xml` is written as a path relative to `src/main/jssp/src`.

```xml
<extends-import>
  <extends-import-class>any_app/initialize/1.0.0/any_app_import.js</extends-import-class>
</extends-import>
```

**The `.js` extension must be included** (this differs from IM-Workflow).

When `spec.configNumber >= 2`, a `-<N>` suffix is appended to the end of the JS file name (e.g. `<key>_import-2.js`). See [import-config.md](import-config.md#configNumber--1-のファイル名サフィックス) for details.
Resolution priority for `<version>`: `"version"` in spec.json → `<version>` in the project root's `module.xml` or `pom.xml` → `1.0.0`. On a version upgrade, generate a new JS file under the new version directory and switch to it.

## Entry Point

```javascript
function doImport(tenantId) {
  // Write initialization processing that is invoked after the tenant masters of this config have been loaded
}
```

| Argument | Type | Content |
|------|-----|------|
| `tenantId` | string | The tenant ID targeted by the setup |

No return value is required. Throwing an exception causes the entire Importer to be treated as failed.

## Common Use Cases

| Use Case | Implementation Example |
|------|--------|
| Loading initial data (what DML alone cannot do) | INSERT via `TenantDatabase.execute(...)` |
| Placing initial configuration files | `PublicStorage.write(...)` |
| Synchronization with existing systems | External API calls |
| Master consistency checks | Record count checks after loading |

## Implementation Constraints

- Write in **Rhino JavaScript (ES5 compatible)**. `let` / `const` / arrow functions / `import` / `export` are not available
- **The same APIs as function containers** are available (`TenantDatabase`, `SystemStorage`, `PublicStorage`, `Logger`, etc.)
- Functions defined globally in the script can be called from within `doImport`
- **For table operations (INSERT/UPDATE/DELETE), control transactions with `Transaction.begin(callback)`**. This preserves consistency across multiple tables and allows rollback on failure midway
- The return value of `Transaction.begin` (`DatabaseResult`) must be received, and success/failure must be determined with `isSuccess()` (discarding the return value causes failures to be ignored and the whole setup to be treated as a "success")
- For exception handling, **always wrap with try/catch, record via Logger, and then re-throw** (with the standard log alone, the cause cannot be traced at operation time)

## Sample Implementation

```javascript
function doImport(tenantId) {
  var logger = Logger.getLogger("any_app.initialize");
  logger.info("[any_app] doImport start. tenantId=" + tenantId);

  var businessError = null;
  var txResult = Transaction.begin(function() {
    try {
      var db = new TenantDatabase();
      // Example: load app-specific initial masters
      var result = db.execute(
        "INSERT INTO any_app_config (tenant_id, config_key, config_value) VALUES (?, ?, ?)",
        [
          DbParameter.string(tenantId),
          DbParameter.string("default_locale"),
          DbParameter.string("ja")
        ]
      );
      if (result.error) {
        throw new Error("Failed to insert any_app_config: " + result.errorMessage);
      }
    } catch (e) {
      businessError = e;
      throw e;   // Re-throw for rollback
    }
  });

  if (businessError) {
    logger.error("[any_app] doImport failed.", businessError);
    throw businessError;
  }
  if (!txResult.isSuccess()) {
    var msg = "[any_app] doImport transaction failed: " + (txResult.errorMessage || "");
    logger.error(msg);
    throw new Error(msg);
  }

  logger.info("[any_app] doImport completed.");
}
```

### Transaction Control Patterns

| Pattern | Use |
|---|---|
| Wrap with `Transaction.begin(callback)` | Table INSERT/UPDATE/DELETE (required) |
| Check the return value `txResult.isSuccess()` | Determine transaction success/failure (required) |
| Carry business exceptions out via a variable | Because `throw` inside the callback does not propagate outward |

For details, also see `.agents/requirements/jssp-error-handling/AGENTS.md` and `jssp-page-generator/reference/post-generation-verification.md` (step 3-7: checking the return value of Transaction.begin).

## Specification in spec.json

```json
"extendsImport": true
```

When set to `true`, the build script generates a skeleton JS that contains an empty `doImport(tenantId)` and adds an `<extends-import-class>` line to `import-<artifactId>-config-1.xml`.
When set to `false` or omitted, nothing is generated.

The implementation is added by the user after generation.
