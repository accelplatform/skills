# IM-Workflow XML Encoding Verification / Repair

## Overview

IM-Workflow import XML must be saved as UTF-16 (with BOM).
IM-Workflow can read either UTF-16 LE or BE, but missing BOM or files still in UTF-8 will fail to import.
The following corruption patterns may occur during generation, so always verify and repair after saving.

## Common Corruption Patterns

| # | Symptom | Cause | Detection Method |
|---|---------|-------|-----------------|
| 1 | No BOM (LE) | iconv does not attach BOM | First 2 bytes are `3C 00` |
| 2 | No BOM (BE) | Same as above | First 2 bytes are `00 3C` |
| 3 | Still in UTF-8 | iconv conversion failed / not executed | First byte is `3C` (ASCII `<`) or `EF BB BF` (UTF-8 BOM) |
| 4 | Double BOM (LE) | BOM attachment executed twice | First 4 bytes are `FF FE FF FE` |
| 5 | Double BOM (BE) | Same as above | First 4 bytes are `FE FF FE FF` |
| 6 | XML declaration encoding mismatch | encoding attribute is missing after conversion | `encoding="UTF-16"` is not included |
| 7 | Does not end with `</data>` | File was truncated during conversion | End of file does not have `</data>` |

## Execution

The verification / repair script is bundled inside the skill. After generating XML, run from the project root:

```bash
node {{AGENT_ROOT}}/skills/jssp-im-workflow-generator/scripts/validate-xml-encoding.js <xml-path>
```

Detection and repair behavior:

| Input | Action | Endian After Repair |
|-------|--------|---------------------|
| UTF-16LE + BOM | Pass-through `OK` | LE |
| UTF-16BE + BOM | Pass-through `OK` | BE |
| UTF-16LE (no BOM) | Add LE BOM and overwrite | LE |
| UTF-16BE (no BOM) | Add BE BOM and overwrite | BE |
| UTF-8 (with / without BOM) | Convert to UTF-16LE (with LE BOM) and overwrite | LE |
| Double BOM (LE) | Remove the extra LE BOM and overwrite | LE |
| Double BOM (BE) | Remove the extra BE BOM and overwrite | BE |
| Missing `encoding="UTF-16"` declaration | Emit `WARN` (no repair) | — |
| Does not end with `</data>` | `ERROR` (cannot repair; regeneration required) | — |

> UTF-16 inputs keep their original endianness through repair. UTF-8 inputs are converted to UTF-16 using LE as the default.
> `build-workflow.js` outputs UTF-16BE, so piping its output through this script normally results in a pass-through `OK`.

## Reading the Output

| Output | Meaning | Exit Code |
|--------|---------|-----------|
| `OK: {path}` | Normal. No repair needed. | 0 |
| `FIX: ... / FIXED: {path}` | Corruption detected and repaired. | 0 |
| `WARN: ...` | Minor issue (manual review recommended). | 0 |
| `ERROR: ...` | Critical issue (file regeneration required). | 1 |
