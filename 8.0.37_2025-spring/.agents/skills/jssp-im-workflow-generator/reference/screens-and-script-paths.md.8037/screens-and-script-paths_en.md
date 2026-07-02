# `screens` Field and How to Specify Script Paths

`screens` in `spec.json` lets you control the output of each pageType in fine detail.

```jsonc
"screens": {
  "apply": "leave/workflow/apply/index",        // string → use this path
  "tempSave": false,                            // false → exclude from XML
  "confirm": false,                             // false → exclude from XML
  "applyTask": "leave/workflow/apply_task/index"  // string → add to output (applyTask is omitted by default, so specify a path to include it)
}
```

| Value | Meaning |
|---|---|
| **String** | Use that path as `scriptPath` in the XML |
| **`false`** | Completely exclude the contentDef of that pageType from the XML (declare it as explicitly unnecessary) |
| **`undefined` / `null` / omitted** | Default behavior (see the "pageType ↔ usage Convention Directory Mapping" table in SKILL.md) |

## Typical Patterns for Omission / Sharing

### Pattern A: Minimal configuration (only apply + approve)

A minimal configuration such as "only the application is implemented; temp-save and confirm are not needed." Sample: [examples/minimal.spec.json](../examples/minimal.spec.json).

```jsonc
"screens": {
  "tempSave": false,
  "confirm": false
}
```

→ Output pageTypes: `0` (apply), `3` (reapply, shared with apply), `4` (process), `6` (processDetail), `7` (referDetail, shared with processDetail)

### Pattern B: Standard configuration (use defaults)

If you omit `screens` itself, the defaults shown in the SKILL.md mapping table are applied. Sample: [examples/straight.spec.json](../examples/straight.spec.json).

→ Output pageTypes: `0, 1, 3, 4, 5, 6, 7` (only applyTask=2 is excluded)

### Pattern C: Issued-case operations included (use applyTask)

Workflows that auto-issue cases via a job, such as monthly reports or fiscal-year goal setting.

```jsonc
"screens": {
  "applyTask": "monthly_report/workflow/apply_task/index"
}
```

→ Adds pageType `2` to the output of pattern B

### Pattern D: Detail screen differs significantly from the process screen

When the process screen and the reference detail differ substantially in displayed items, implement them separately.

```jsonc
"screens": {
  "processDetail": "leave/workflow/process_detail/index",
  "referDetail": "leave/workflow/refer_detail/index"   // not shared; separate path
}
```

## Consistency Verification Flow

1. **After XML generation**: Run `jssp-im-workflow-usage/scripts/validate-workflow-code.js` on a directory containing both the XML and the JS files.
2. If a `WF-XML-001` warning ("the JS file referenced by the XML does not exist") appears, it means one of:
   - **Screen file not generated (bug)** → generate it with `jssp-im-workflow-usage`.
   - **Screen intentionally omitted** → exclude it in `spec.json` via `screens.xxx: false` and rebuild (recommended; this eliminates the warning noise at the source).
