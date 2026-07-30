# officecli command cheatsheet (scope used by this skill)

officecli is a tool for reading/writing xlsx/docx/pptx from the CLI. This skill mainly uses the following.

## Reading

```bash
# Dump sheet contents as text (with cell coordinates). Start here to get the big picture.
officecli view <file.xlsx> text

# Get detailed formatting for a cell/row/sheet (font, fill, borders, merges, etc.)
officecli get <file.xlsx> "/<sheet>/<cell>" --json
officecli get <file.xlsx> "/<sheet>" --json          # whole sheet (rows/cells recursively)
officecli get <file.xlsx> "/" --json                  # whole workbook (sheet list, theme colors)

# Raw XML (styles.xml, sheetN.xml, etc.). Used to recover info that `get` drops, e.g. fill theme+tint
officecli raw <file.xlsx> "/xl/styles.xml"
officecli raw <file.xlsx> "/xl/worksheets/sheetN.xml"
officecli raw <file.xlsx> "/xl/workbook.xml"           # mapping from sheet name to sheetN.xml
```

**Cell addressing**: use Excel notation like `/<sheet>/A1`. Subscript notation like `/<sheet>/row[2]/cell[1]` may not work (results in `Element not found`), so first check the actual path format used (e.g. `/Container/A2`) via `get --json` output before relying on it.

## Writing

```bash
# Create a new file (a background resident process starts, speeding up subsequent commands)
officecli create <file.xlsx> --json

# Add a sheet (ifExists: "use" reuses an existing sheet instead of erroring)
officecli add <file.xlsx> "/" --type sheet --prop name=<sheet name> --prop ifExists=use

# Bulk import CSV/TSV (much faster than setting cells one at a time)
officecli import <file.xlsx> "/<sheet>" --prop start-cell=A1 < data.csv

# Change cell formatting (fill requires a 6-digit hex, theme names are not accepted; see officecli-fill-color.md)
officecli set <file.xlsx> "/<sheet>/A1" --prop fill=#D6DCE5 --prop font.bold=true

# Batch multiple commands into a single process launch (the main way this skill uses officecli)
officecli batch <file.xlsx> --input <batch.json> --json

# Flush changes to disk (keeps the resident process running)
officecli save <file.xlsx> --json

# Terminate the resident process (call save or close before another process reads the file)
officecli close <file.xlsx> --json
```

## The `batch` command format

The JSON passed via `--input <file>` is an array shaped like this:

```json
[
  { "command": "add", "parent": "/", "type": "sheet", "props": { "name": "Prerequisites", "ifExists": "use" } },
  { "command": "import", "parent": "/Prerequisites", "props": { "start-cell": "A1" }, "text": "A1,B1\nA2,B2" },
  { "command": "set", "path": "/Prerequisites/A1", "props": { "font.bold": "true" } },
  { "command": "remove", "path": "/Sheet1" }
]
```

- `command` is one of `add` / `set` / `get` / `query` / `remove` / `move` / `swap` / `import`
- If one command fails, subsequent commands still run (tallied as `summary.failed` in the `--json` result). Diagnose and re-run after checking the cause
- **Idempotency**: `add ... ifExists:"use"` reuses an existing sheet, so re-running is safe. `import` overwrites content when re-imported at the same start cell. `set` merges diffs, so "clearing" a previously set value requires explicitly overwriting it with a new value (see [officecli-fill-color.md](officecli-fill-color.md))
- Removing `/Sheet1` errors with `Sheet not found` if it was already deleted, but this is harmless. This skill's `build-test-spec.js` swallows only this specific error on re-runs

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Invalid color value: 'dk2'` | Passed a theme color name to `set`'s `fill`/`font.color` | Convert to a 6-digit hex. See [officecli-fill-color.md](officecli-fill-color.md) |
| `Element not found: row[2]/cell[1]` | Wrong subscript notation for a cell path | Check the actual path (Excel-notation form `/sheet/A2`) via `get --json` before using it |
| Header color/font differs from the original file | A missed tint, or `font.name` was left unset and defaulted to Calibri | Compare the actual formatting of the generated file against the template cell by cell with `officecli get <file> "/<sheet>/<cell>" --json` |
| `Sheet not found: "Sheet1"` | Tried to remove an already-deleted `Sheet1` again | Harmless; ignore on re-runs |
| Generated content doesn't seem to be reflected | Read from another process before `save`/`close` | Always call `save` (keeps the resident alive) or `close` (terminates it) after `batch` |
