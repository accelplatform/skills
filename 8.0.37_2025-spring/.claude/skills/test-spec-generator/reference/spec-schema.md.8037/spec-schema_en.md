# spec.json schema (shared input for build-test-spec.js / build-test-spec-html.js)

`scripts/build-test-spec.js` (xlsx output) and `scripts/build-test-spec-html.js` (HTML output) accept the exact same spec.json. Everything is plain JSON (not TypeScript).
See [examples/equip-001.spec.json](../examples/equip-001.spec.json) for a worked example.

```jsonc
{
  // Feature ID. Used to derive the default output filename under
  // docs/test-specs/xlsx|html/ (<key>-test.xxx) when outputFile/outputFileHtml are omitted.
  "key": "equip-001",

  // Output xlsx path (relative to the project root, or overridden with --out).
  // Defaults to docs/test-specs/xlsx/<key>-test.xlsx if omitted.
  "outputFile": "docs/test-specs/xlsx/equip-001-test.xlsx",

  // Output HTML path (defaults to docs/test-specs/html/<key>-test.html if omitted)
  "outputFileHtml": "docs/test-specs/html/equip-001-test.html",

  // Styling for header cells (defaults are used if omitted; applies to both xlsx and HTML)
  "style": {
    "headerFill": "#D6DCE5",      // Header background color. When extracting this from an original
                                    // template that uses a theme color + tint, see
                                    // reference/officecli-fill-color.md
    "headerFontColor": "#000000",
    "fontName": "Yu Gothic",
    "fontSize": "9pt"
  },

  // ---- Prerequisites sheet ----
  // A 2D array, one row per array. Empty cells can be "" or omitted (shorter arrays are fine).
  // Strings containing commas can be written as-is (CSV-escaped internally).
  //
  // IMPORTANT: not just the title block (product name, version, scenario no., etc.), but
  // also "label: value" body rows (war setup count, OS, app server, etc.) must keep their
  // value in an adjacent column (e.g. the column right after the label, column C).
  // Spreading it across far-apart columns (e.g. A, I, G, N) leaves the unstyled columns
  // in between at Excel's default width, which looks stretched out and broken when opened
  // in Excel. Always use adjacent columns that fall within the range styled by
  // prerequisiteColWidths.
  "prerequisiteRows": [
    ["Test overview"],
    ["", "Product", "Ver", "Scenario No.", "Scenario name"],
    ["", "Equipment Lending System", "1.0", "EQUIP-001", "Lending request → return flow test spec"],
    [],
    [],
    ["1. Test overview (perspectives)"],
    []
    // ...
  ],
  // Style applied to A1 (the title cell). Defaults to bold 12pt if omitted.
  "prerequisiteTitleStyle": {
    "cells": ["A1"],
    "props": { "font.bold": "true", "font.size": "12pt", "font.name": "Yu Gothic", "border.left": "medium", "border.top": "medium" }
  },
  // The title block's info-box cells. The header row (labels) gets a fill + border,
  // the value row gets a border only (the fill matches style.headerFill, so it visually
  // matches the test-spec sheets' column headers).
  "prerequisiteInfoBoxHeaderCells": ["B2", "C2", "D2", "E2"],
  "prerequisiteInfoBoxValueCells": ["B3", "C3", "D3", "E3"],
  // Cells to bold-emphasize as section headings (e.g. "1. Test overview"). Since the
  // title block now occupies 5 rows (label row + header row + value row + 2 blank rows),
  // the first heading starts at row 6 (A6) — keep this in sync if you change the title
  // block's row count.
  "prerequisiteSectionHeaderCells": ["A6", "A12", "A23"],
  "prerequisiteColWidths": [22, 55, 12, 12, 10, 10, 10, 10, 20],

  // ---- Test perspective list sheet ----
  // Rows derived from the acceptance criteria table (AC-*) in spec/*.md, tagged with
  // feature/screen/priority. The "No." column is auto-numbered by the script and must
  // NOT be included in rows.
  "perspectives": {
    "columns": ["No.", "Feature ID", "Screen ID", "Screen name", "Perspective category", "Test perspective", "Related requirement ID", "Priority"],
    "colWidths": [5, 10, 10, 20, 12, 55, 16, 6],
    "note": "Covers all functional requirements",
    "rows": [
      // Values for each column excluding "No.", in order
      ["F-001-1", "SCR-004", "Lending Request", "Happy path", "When a user enters the required fields and confirms a lending request, the request is created and a notification email is sent to the equipment administrator", "AC-F001-01", "High"]
      // ...
    ]
  },

  // ---- Test spec sheets (one per screen, container-style layout) ----
  // Based on the original template's "Container" sheet, with a "confirmed" column for
  // the tester prepended, and the "Result" / "Reviewer" / "Review date" columns removed
  // since they now overlap with the confirmed column:
  //   Confirmed / Category / Screen / Region / Field / Action / Expected result / Note / Existing requirement / Tester / Test date
  // Column A (confirmed) does not appear in the data schema itself — build-test-spec.js /
  // build-test-spec-html.js add it automatically (xlsx: a data-validation dropdown with
  // "✓ / blank"; HTML: a "-" (unconfirmed) / OK / NG `<select>`, which also auto-fills
  // column K "Test date" when OK/NG is chosen. See "Output structure" in SKILL.md).
  // Category/screen name are only written on the first row of each sheet (following the
  // original template's convention; cells are not actually merged).
  "itemSheets": [
    {
      "sheetName": "TestSpec_LendingRequest",  // Sheet name (Excel limit: 31 chars, some symbols disallowed)
      "category": "Lending Request",            // Column B (first row only)
      "screenName": "Lending Request (SCR-004)", // Column C (first row only)
      "colWidths": [6, 14, 16, 16, 20, 18, 55, 30, 16, 10, 10], // first column is the narrow confirmed column
      "items": [
        {
          "region": "Search filter area",       // Column D: display region
          "field": "Equipment model",           // Column E: field
          "action": "Search and select",        // Column F: action
          "expected": "The list of available units for the selected model is shown", // Column G: expected result
          "note": "AC-F001-05"                  // Column H: note (related requirement ID etc.)
        }
        // ...
      ]
    }
  ],

  // ---- Summary sheet ----
  // Per-sheet item counts are auto-aggregated (test perspective list + each itemSheet's items).
  // Only specify this if you need extra rows.
  "summaryExtra": [
    ["Note", "", "Representative screens only; the full set has not been generated"]
  ],
  "summaryColWidths": [35, 12, 55]
}
```

## Guidelines for the prerequisites sheet content

Following the structure of the original template (a real test spec from an intra-mart JSSP project), it is recommended to include the following sections. Where the specification has no information for an item, state so explicitly ("TBD", "N/A", etc.).

1. Test overview (perspectives) — bullet points of what the test verifies. If there are non-functional requirements (response time, etc.), state them here
2. Test environment information — version, DB, app server, etc.
3. Test execution environment information — OS, browser
4. Required applications
5. Required modules
6. Required files — master data, test users, etc.
7. Setup/work required before testing — master data seeding steps, test data preparation
8. Notes — timezone, business-day definitions, etc.; carry over the spec's "common definitions" section if present
9. Existing requirements outside this test spec
10. Supplementary materials — list of referenced spec/*.md paths

## How to build the test perspective list

Mechanically convert the specification's acceptance criteria table (a table with IDs like `AC-F001-01`, typically found in business-requirements.md or similar) into one record per row.

- **Feature ID**: the corresponding functional requirement number from system-requirements.md (e.g. `F-001-1`)
- **Screen ID/name**: cross-reference the spec's "screen list" table to determine which screen's operation the acceptance criterion corresponds to. Mark screen-less batch/notification processes as `(Batch)` etc.
- **Perspective category**: if the acceptance criteria table has a "pattern" column (event-driven/state-driven/constraint/composite/universal/optional, etc.), reuse it; otherwise classify as "happy path/error path/constraint/composite" etc.
- **Priority**: judge by business criticality. Core business flows (e.g. request → approval → lending → return) or items involving monetary constraints should be "High"; peripheral features (report/notification details, etc.) can be "Low"

## How to build a per-screen test spec

Break down the target screen's acceptance criteria to the granularity of actual UI operations. A single acceptance criterion often yields multiple test items (put the happy path, boundary values, and error cases on separate rows).

- Infer the screen's UI structure (search filter area / list area / form / buttons, etc.) from the specification for the display region. If the detailed design includes a screen wireframe, prefer that
- One test perspective and one expected result per item, in principle. Avoid compound expected results ("X and Y"); split into separate rows if needed
- **Write the action (`action`) as concrete, executable steps a tester can follow as-is — not an abstract label** (e.g. not "search and select" or "click"). Spell out example input values (model name, number of days, price, etc.) and the specific UI element being operated (button name, radio button, checkbox, dropdown, etc.)
- **Split into one operation per line, numbered "1. ", "2. ", ... and joined with `\n`**. Strings containing `\n` are rendered as in-cell line breaks as-is in both xlsx and HTML (xlsx already sets `alignment.wrapText: true`, HTML already sets `white-space: pre-wrap` — no extra configuration is needed). Don't cram multiple operations (click, type, verify, etc.) into a single line
  - Good: `"1. Type \"Notebook PC\" into the search field\n2. Click the search button\n3. Select the target row from the search results"`
  - Bad: `"search and select"` (unclear what to search for or how to select) / `"type into the field and click"` (too many operations crammed into one line)
- Always record the originating acceptance-criteria ID (e.g. `AC-F001-05`) in the note field, to preserve traceability (test item → acceptance criterion lookup)
