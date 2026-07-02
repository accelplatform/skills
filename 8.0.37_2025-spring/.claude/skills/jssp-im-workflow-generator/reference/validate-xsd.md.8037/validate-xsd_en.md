# XSD Validation of Import XML

Procedure for validating the structure of generated IM-Workflow import XML against the descriptive schema `reference/im_workflow-import.xsd`.

This schema is not the official IM-Workflow normative schema; it expresses, in XSD 1.0 compatible form, only the sections supported by this skill set (`contents` / `route` / `flow` / `matter_property` / `rule`) — each section, the object structures beneath them, and their array structures.

## Prerequisites

- Node.js (v18 or later recommended; a version where `TextDecoder` and top-level `await` are usable)
- The generated XML is placed in `src/main/storage/public/im_workflow/im_workflow-{name}-import.xml` as UTF-16LE
- `xmllint-wasm` is resolvable in the project's `node_modules` (first time only: `npm install --no-save xmllint-wasm`)

## Execution

The validation script is bundled inside the skill. Run from the project root:

```bash
node .claude/skills/jssp-im-workflow-generator/scripts/validate-xsd.js \
     src/main/storage/public/im_workflow/im_workflow-{name}-import.xml
```

Behavior:

- Auto-detects UTF-16LE / UTF-16BE / UTF-8 from the BOM, normalizes to UTF-8, then validates against `reference/im_workflow-import.xsd` using `xmllint-wasm` (WASM build of libxml2).
- Spawns a child process to run an ESM `.mjs` that loads `xmllint-wasm`. The path is normalized to a `file://` URL via `pathToFileURL()`, so it works on Linux / macOS / Windows alike.

> **Constraint:** On Node.js v20+, importing `xmllint-wasm` directly as ESM in the same process can fail to initialize the WASM VFS in its internal Worker thread (ErrnoError F:44). This script avoids that by delegating to a child process.

## Expected Results

- Success: `OK: ... is valid against the schema` (exit code 0)
- Failure: `NG: ...` followed by an error list (top 30, exit code 1)

## Error Examples and Remedies

| Error | Cause | Remedy |
|-------|-------|--------|
| `Element 'XXX': This element is not expected.` | An undefined field name (per the XSD) was emitted | Check the correct placement of the tag in a sample XML (`assets/sample-complete-branch.md` or a real export `sample.xml`) and fix the XML side. If the field exists in real exports, add it to the XSD instead. |
| `Start tag expected, '<' not found` | UTF-16 string read as UTF-8 / encoding declaration mismatches actual bytes | Verify and repair encoding first with `scripts/validate-xml-encoding.js`. Check consistency between the XML's `encoding="UTF-16"` declaration and actual encoding (UTF-16LE/BE + BOM). |
| `complex type 'XXX': The content model is not deterministic` | XSD 1.0 UPA violation (e.g. mixing named elements with xs:any) | Make the offending complexType either a pure choice or a pure any. |

## Notes

- The XSD is written in XSD 1.0 compatible style, so it is validatable by `xmllint-wasm` (libxml2-based)
- Validation covers structure only (element names, parent-child relationships, required attributes); it does not catch ID reference integrity, ordering, or business rules
- For business rule checks, combine with the self-check in `reference/import-xml-checklist.md`
