---
name: test-spec-generator
description: Generates an xlsx (via officecli) or HTML (no officecli needed) "test perspective list" and "test spec" from the specifications under spec/ (business requirements, acceptance criteria). Analyzes an existing test spec xlsx template's sheet layout, columns, and formatting (header color, borders, fonts) and reproduces it for a new feature's test materials. Output is saved under docs/test-specs/xlsx/ or docs/test-specs/html/ by default. Use when the user says things like "create a test spec", "create a test perspective list", "create xlsx test cases", "generate test materials with officecli", "build a test spec from this template", "create the test spec in HTML", or "create test materials for an environment without officecli".
allowed-tools: Bash, Read, Write, Glob
---

# Test Spec Generator Skill (test-spec-generator)

## Purpose

From the acceptance criteria (AC-\* etc.) in the specifications under `spec/`, generate:

1. **Test perspective list** — a single sheet enumerating all acceptance criteria across features, tagged with feature/screen/priority
2. **Test spec** — per-screen sheets with detailed operations/expected results (following the "container"-style layout of existing templates)

There are two output formats, and **both can be generated from the same spec.json**.

| Format | Generation script | Required tools | Use case |
|---|---|---|---|
| xlsx | `scripts/build-test-spec.js` | officecli | Open directly in Excel for distribution / filling in |
| HTML | `scripts/build-test-spec-html.js` | none (Node only) | For environments where officecli cannot be installed; viewed in a browser |

If an existing test spec xlsx is provided, it is analyzed as a template (sheet layout, formatting) and the new feature's materials are produced with the same look and feel (xlsx output only — HTML output does not use officecli, so it does not reproduce the template's exact borders/colors).

Output is saved by default under **`docs/test-specs/xlsx/`** / **`docs/test-specs/html/`** (per-format directories, filenames `<feature-id>-test.xlsx` / `<feature-id>-test.html`). See `outputFile` / `outputFileHtml` / `key` in [reference/spec-schema.md](reference/spec-schema.md) for details.

## Prerequisites

- xlsx output: officecli must be installed (`which officecli`). If missing, ask the user to install it, or switch to HTML output.
- HTML output: works with Node.js alone (no extra tools required).

## When to use

- "Create the test spec for feature X" / "Create a test perspective list"
- "Use this xlsx as a template and create test materials for Y" (when handed an existing template)
- "Create Excel test cases with officecli"
- "Create the test spec in HTML so it can be viewed even without officecli"

## Generation steps

### 1. Confirm the output format with the user (required if unspecified)

If the user's request already specifies xlsx or HTML (e.g. "in xlsx", "with officecli", "in HTML", "for an environment without officecli"), follow that and skip confirmation.

If not specified, **always** confirm with the user (e.g. via AskUserQuestion) before generating anything:

- **xlsx format** (uses officecli; open directly in Excel for distribution / filling in)
- **HTML format** (no officecli needed; viewed in a browser)
- Both

If officecli is not installed (`which officecli` finds nothing), it is fine to mention that and recommend HTML, but the final choice still belongs to the user — never default to one format without asking.

### 2. Analyze the template (if an existing test spec xlsx is provided)

```bash
officecli view <template.xlsx> text                      # dump contents (get the big picture first)
officecli get <template.xlsx> "/<sheet>/<cell>" --json    # per-cell formatting
```

**Important**: `get` simplifies a theme-color + tint fill down to a bare name like `"dk2"`, dropping the tint value. Feeding that straight into `set`'s `fill` (which requires a 6-digit hex) produces a color completely different from the original. When header colors etc. must be reproduced faithfully, always compute the real hex from `raw` per [reference/officecli-fill-color.md](reference/officecli-fill-color.md). **If told "this looks different from the original," suspect this first.**

For officecli commands in general, see [reference/officecli-cheatsheet.md](reference/officecli-cheatsheet.md).

If there is no template, generate from scratch using the default sheet layout/formatting described below.

### 3. Read the specifications under spec/

Read `spec/<feature-id>/` (the acceptance criteria table in `business-requirements.md`, the screen list and functional requirements in `system-requirements.md`, `detailed-design.md`). If there is no acceptance criteria table, check a `README.md` or similar for where the relevant documents live.

### 4. Confirm scope with the user (required)

If the spec covers many screens, generating a test spec at the same granularity for every screen produces a huge volume. **Always** confirm scope with the user (e.g. via AskUserQuestion) before generating.

- The test perspective list (covering all acceptance criteria) is relatively lightweight, so generating it in full is generally fine
- For the test spec (detailed per-screen operations), let the user choose between a representative-screens pilot or a full generation across all screens

Do not decide this unilaterally — neither generate all screens without permission, nor silently scope down to a few screens while reporting full coverage.

### 5. Assemble spec.json

Assemble a spec.json following [reference/spec-schema.md](reference/spec-schema.md). Note that a single acceptance criterion often decomposes into multiple test items, and the note field must always record the originating acceptance-criteria ID (to preserve traceability).

**`itemSheets[].items[].action` (the action) must always be written as concrete, executable steps a tester can follow as-is.** Don't settle for an abstract label like "search and select" or "click". Split into one operation per line, numbered "1. ", "2. ", ... and joined with `\n` (in both xlsx and HTML, `\n` is rendered as an in-cell line break as-is; see [reference/spec-schema.md](reference/spec-schema.md#how-to-build-a-per-screen-test-spec) for details and examples).

Example: [examples/equip-001.spec.json](examples/equip-001.spec.json) (an actual generated spec: 68 test-perspective rows plus test specs for 3 representative screens, for an internal equipment lending system — its `action` fields are a worked example of the numbered, multi-line format).

### 6. Run the generation script

xlsx (when officecli is available):

```bash
node .github/skills/test-spec-generator/scripts/build-test-spec.js <path to spec.json> [--out <output.xlsx>]
```

What this script does:

- Creates a new xlsx via `officecli create` (if the target file already exists, skips creation and runs batch against it directly)
- Adds the 前提条件 (prerequisites) / 集計 (summary) / 試験観点一覧 (test perspective list) / 試験項目書_\* (per-screen test spec) sheets
- Bulk CSV import (`officecli import`) plus bulk formatting of header/data cells (a batch of `officecli batch` `set` commands)
- Sets up a data validation dropdown (`officecli add ... --type validation`, `type: list`, choices "✓ / blank") on column A (confirmed) of each test spec_\* sheet. This substitutes for a native Excel checkbox (form control), which officecli cannot manipulate
- Saves via `officecli save` and closes the resident process via `officecli close`
- Output path: `spec.json`'s `outputFile` takes priority; if unset, defaults to `docs/test-specs/xlsx/<spec.key>-test.xlsx`

Any failed commands are printed to stderr and the script exits non-zero (except a failed removal of `/Sheet1`, which is harmless and ignored).

HTML (for environments without officecli):

```bash
node .github/skills/test-spec-generator/scripts/build-test-spec-html.js <path to spec.json> [--out <output.html>]
```

- Accepts the exact same spec.json as the xlsx version (input-compatible)
- Does not use officecli; generates a single self-contained HTML file using only Node's `fs`
- The prerequisites sheet is rendered as a nested `<ol>`/`<ul>` list rather than a `<table>` (the number of leading empty cells is treated as an indent level; if every consecutive item at the same level has a `1)`, `2)`, ... prefix, it becomes an `<ol>` with the prefix stripped, otherwise a `<ul>` with a leading `・` stripped — this avoids the list marker doubling up with the original text; see the conversion rules in [reference/spec-schema.md](reference/spec-schema.md)). The other sheets (summary, test perspective list, test spec_\*) remain `<table>`s, since a table is more readable there
- The test spec_\* sheets have a "confirmed" column as the very first column (column A), for testers to record confirmation status while reading through (same layout in both xlsx and HTML — this column used to be an xlsx-only spacer, and has been repurposed for confirmation instead). HTML places a `<select>` there with three choices — "-" (unconfirmed) / OK / NG (not a checkbox, since a checkbox can't distinguish "confirmed OK" from "confirmed NG"). **A row set to NG is highlighted with a red background** (a `change` listener toggles a `confirm-ng` class on the row's `<tr>`, since CSS `:has()` alone cannot react live to a `<select>`'s chosen value). **Choosing OK or NG auto-fills today's date (`YYYY-MM-DD`) into the "test date" column's cell** (the date is re-captured every time the value changes). The selection and test date are saved to the browser's `localStorage`, so they persist across page reloads (since no server or officecli is involved, it is stored only in that browser — it is not shared across devices or users; the date uses the browser's local clock, so it depends on the tester's device settings). Note that the old "Result" / "Reviewer" / "Review date" columns have been removed, since their role now overlaps with this "confirmed" column (OK/NG) and the auto-filled "test date" column. If a separate official confirmation record (who confirmed it) is needed, use a test management ledger. The summary and test perspective list sheets have no such confirmed column, so they are unaffected
- Outputs a single file with a table of contents, per-sheet headings, and light/dark-theme-aware CSS
- Output path: `spec.json`'s `outputFileHtml` takes priority; if unset, defaults to `docs/test-specs/html/<spec.key>-test.html`

To generate both, run both scripts against the same spec.json (specifying both `outputFile` and `outputFileHtml` avoids any path collision).

### 7. Verify

```bash
officecli view <output.xlsx> text   # for xlsx
```

For xlsx, check the content via the text view. To rigorously verify formatting (header color, fonts, etc.), compare the same cells against the template with `officecli get <output.xlsx> "/<sheet>/<cell>" --json`.

For HTML, open it directly in a browser, or check the generated `<table>` row counts / column headers via grep/Read.

## Output structure (sheet layout)

| Sheet | Content | Source |
|---|---|---|
| 前提条件 (Prerequisites) | Test overview, test environment, required master data, notes | Manually assembled from business requirements / common definitions in the spec |
| 集計 (Summary) | Item counts per sheet | Auto-aggregated by the generation script |
| 試験観点一覧 (Test perspective list) | Acceptance criteria (AC-\*) tagged with feature/screen/priority | Converted from the acceptance criteria table in business-requirements.md |
| 試験項目書_\<screen name\> (Test spec per screen) | Detailed per-screen operations/expected results (container-style: category/screen listed only on the first row of each block) | Screen list in system-requirements.md + acceptance criteria, broken down per screen |

For the full column layout and all spec.json fields, see [reference/spec-schema.md](reference/spec-schema.md).

## File layout

```
test-spec-generator/
├── SKILL.md                          # this file
├── scripts/
│   ├── lib/
│   │   └── spec-tables.js            # spec.json → table data conversion (shared by both outputs)
│   ├── build-test-spec.js            # spec.json → xlsx, all in one pass (uses officecli)
│   ├── build-test-spec-html.js       # spec.json → self-contained HTML, all in one pass (no officecli)
│   └── theme-tint.js                 # theme-color + tint → actual hex utility
├── reference/
│   ├── spec-schema.md                # all spec.json fields shared by both scripts
│   ├── officecli-cheatsheet.md       # officecli command reference / troubleshooting
│   └── officecli-fill-color.md       # the theme-color + tint pitfall and how to compute the real hex
└── examples/
    └── equip-001.spec.json           # a real spec used to generate materials (internal equipment lending system)
```

## Default output directory

Generated materials are saved by default under **`docs/test-specs/xlsx/`** / **`docs/test-specs/html/`** (per-format directories, relative to the project root). The filename is built from the top-level spec.json field `spec.key` (feature ID, e.g. `equip-001`) as `<spec.key>-test.<extension>`.

```
docs/test-specs/
├── xlsx/
│   └── <feature-id>-test.xlsx  # xlsx output (build-test-spec.js; spec.outputFile takes priority)
└── html/
    └── <feature-id>-test.html  # HTML output (build-test-spec-html.js; spec.outputFileHtml takes priority)
```

When both xlsx and HTML are generated for the same feature, they land in separate format directories — e.g. `docs/test-specs/xlsx/equip-001-test.xlsx` and `docs/test-specs/html/equip-001-test.html` (there is no per-feature folder).

This default can be overridden by specifying `outputFile` / `outputFileHtml` in spec.json (the `--out` argument takes priority over both). Earlier versions of this skill output to `test/`, then to `docs/test-specs/<feature-id>/<feature-id>.xxx`; the latter repeated the feature ID in the path redundantly, so it was changed to per-format directories with `<feature-id>-test.<extension>` filenames.

## Prohibited: do not publish to Artifacts (claude.ai's external hosting feature)

**Never output or publish the generated test perspective list / test spec to the Artifact tool (claude.ai's HTML/Markdown hosting feature) or any other external hosting service outside the repository.**

- A test spec contains business-system specifications and acceptance criteria — internal material that is not necessarily safe to expose externally. Project policy prohibits carelessly placing materials on external servers
- Artifacts are private by default (visible only to the creator), but the fact that **a copy of the deliverable is generated outside the repository** — shareable with third parties via the share menu, with a URL issued — is itself against this project's policy, regardless of the default visibility
- If you need to show the user the generated result, do not turn it into an Artifact, a screenshot, or upload it to an external service. Instead, **point them to the file path inside the repository** (e.g. `docs/test-specs/html/<feature-id>-test.html`) for them to open locally, or present the text content via `officecli view` / the Read tool
- If it is accidentally published as an Artifact, the Artifact tool has no delete/unpublish capability — the user must manually delete it from `claude.ai/code/artifacts` themselves (the AI cannot retract it). Always stop and reconsider before publishing.

## Notes

- **Overwriting existing materials**: if `outputFile`/`outputFileHtml` points at an existing file, both scripts overwrite it (`build-test-spec.js` skips `officecli create` and re-runs `batch` against the existing file; `build-test-spec-html.js` simply overwrites). This can clobber manual edits, so confirm with the user before targeting an existing file.
- **Re-running `build-test-spec.js` against an existing xlsx can fail with a duplicate data-validation error**: unlike `set`, the data-validation rule (`add ... --type validation`) added to the confirmed column (column A) of each test spec_\* sheet is not idempotent — re-running `add` against a cell range that already has a rule fails with `DataValidation sqref '...' overlaps existing validation`, which fails the whole batch. When regenerating after changing spec.json (e.g. the prerequisites row layout), **delete the target xlsx first**, or output to a different file name.
- **Exact column-width/formatting parity is not guaranteed**: officecli's read/write path is not a perfect round trip (notably fill tint, subtle border-color differences, etc.). When strict visual parity is required, always compare against the template cell by cell after generation. HTML output is not designed to reproduce xlsx's exact borders/formatting in the first place (only the table structure and header color are carried over; the prerequisites sheet is converted to a list instead of a table).
- **The prerequisites-to-list conversion is heuristic**: `prerequisiteRows` was originally authored for xlsx cell alignment, so the HTML conversion treats "number of leading empty cells" as the indent level to build `<ol>`/`<ul>`s. A run of same-level items becomes `<ol>` (with prefixes stripped) only if *every* item in it has a `1)`/`2)`/... prefix; otherwise it becomes `<ul>` (with a leading `・` stripped) — a block that mixes numbered and unnumbered items will fall back to `<ul>` and keep its numeric prefixes as plain text. When a row has more than one non-empty cell, they are joined as `label: value`, so rows meant to represent a table (e.g. a header row for a module list) can come out as awkward strings. Visually check the prerequisites section after generation and adjust the `prerequisiteRows` content itself if anything looks off.
- **spec.json is not multilingual**: the generated xlsx/HTML is Japanese-only. For multilingual test specs, prepare a separate spec.json per language and run the script once per language.

## Division of responsibility

| Skill | Purpose |
|---|---|
| **test-spec-generator** (this skill) | Generates the xlsx/HTML test perspective list / test spec |
| `jssp-playwright-test` | Generates E2E test code against a working JSSP screen (html + js) |
| `jssp-jest-test` | Generates unit tests for function containers (js) |

A test spec is "a manual procedure for humans to execute," distinct from the automated test code produced by `jssp-playwright-test` / `jssp-jest-test`. When both are needed, use them together (e.g., build the test perspective list first, then use it to check the coverage of the automated test cases).
