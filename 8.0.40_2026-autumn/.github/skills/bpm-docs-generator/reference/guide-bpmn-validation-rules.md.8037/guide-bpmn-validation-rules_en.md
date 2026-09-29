# Input Rule Definition Specification (rules.json)

This document defines the specification for the input rule definition file (`rules.json`) used in BPMN validation.
The main purposes are to "ensure consistency in rule descriptions" and to "clarify interpretation rules, including implementation-dependent behavior."

## 1. Scope

- Target: Input rule definitions loaded in the form `--rules <rules.json>`
- Format: JSON array (a list of rule entries)
- Unit: 1 entry = 1 selection condition + 1 validation target value + 1 constraint set

## 2. Rule Entry Specification

### 2.1 Structure

```jsonc
{
  "id": "process.id",                 // Required. Violation identifier
  "selector": "bpmn:Process",         // Required. BPMN type to validate
  "path": "id",                       // Required. Path to obtain the value from the element matched by selector
  "label": "process id",              // Optional. Display name (defaults to path if omitted)
  "when": { "activiti:type": "mail" }, // Optional. Attribute filter for elements matched by selector
  "forEach": { "extensionType": "activiti:in" }, // Optional. Iterate over child elements
  "rule": { "required": true, "maxLength": 255 } // Required. Constraint definition
}
```

### 2.2 Required Items

- `id`
- `selector`
- `path`
- `rule`

In the implementation, an entry missing `selector` or `path` is ignored. If `rule` is omitted, it is treated as an empty object, and if `id` is omitted, `label` (or `path`) is substituted in the context of the error message.
This document treats `id` as a required item in the specification (the implementation's fallback behavior exists for backward compatibility; new rule definitions must always assign an `id`).

### 2.3 Interpretation Rules

- `selector` recursively traverses the BPMN tree and applies to all matching elements.
- When there are multiple matches for the same `selector`, each element is judged independently.
- Multiple keys can be defined within `rule` when imposing multiple constraints on the same target.
- Split into separate entries when `path` or `when` differs.

## 3. Error Message Specification

Output example:

```
ERROR: [input(mailTask.to.required)] mail task field[to] (ServiceTask#mail-task_1) is required
```

- `[input(...)]` uses the rule entry's `id` (a required item).
- `label (...)` contains information identifying the violating instance.
- For backward compatibility, in rules where `id` is omitted, `label` (or `path` if unspecified) is substituted for `...` in `[input(...)]`.
- If the BPMN element that is the violation point itself has no `id` attribute, the nearest ancestor element that has an `id` attribute is used as the identifier (this `id` is distinct from the rule entry's `id` and refers to the `id` attribute on the BPMN element side).

## 4. Path Notation Specification

`path` is evaluated as `.`-delimited segments.

| Segment | Meaning |
|---|---|
| `id` / `name` / `isExecutable` | Ordinary property |
| `activiti:type` / `activiti:class` | Namespace attribute (with `$attrs` fallback) |
| `errorRef` / `messageRef` / `signalRef` | Reference attribute (IDREF) |
| `field(<name>)` | Selects `activiti:field[name=<name>]` |
| `value` | Value of a child element (`activiti:string`/`activiti:expression`) |
| `text` | Body text of a FormalExpression-type element |

Using `field(<name>).value` lets you express field existence, child element existence, and value entry in a single rule.

- When multiple `activiti:field` elements with the same name exist within the same `extensionElements`, `field(<name>)` selects only the first one (in XML document order); subsequent occurrences are ignored.
- Duplicate `activiti:field` names within the same `extensionElements` are, on the premise that `activiti:field` names should be unique within the same element, always detected and treated as an error as a structural check of the BPMN model itself (`[model]` context), separate from the input rules (`path`/`rule`).

```jsonc
{
  "id": "mailTask.to.required",
  "selector": "bpmn:ServiceTask",
  "when": { "activiti:type": "mail" },
  "path": "field(to).value",
  "label": "mail task field[to]",
  "rule": { "required": true }
}
```

## 5. Handling of Reference Attributes (IDREF)

- `errorRef` / `messageRef` / `signalRef` produce a model warning when reference resolution fails.
- Such a model warning is suppressed as consumed only when the corresponding input rule's `path` is actually evaluated and successfully obtains the raw unresolved value (the original string that moddle could not resolve) (this is a deterministic mechanism judged by an exact match of the same element × the same property name; there is no fuzzy heuristic).
- If the input rule itself is undefined, or if `path` matches but fails to obtain the raw value, the failure of that reference attribute is not consumed and is ultimately output as a model warning.
- `itemSubjectRef` is an item unique to the IM-BPM extension, referenced to identify the type (data type) of a `dataObject`. It is treated as outside the scope of standard BPMN reference integrity validation, so reference resolution failures for it are always suppressed.

## 6. `when` Specification (Filter for Elements Matched by Selector)

```jsonc
"when": { "activiti:type": "mail" }
```

```jsonc
"when": { "activiti:type": ["applyworkflow", "draftworkflow"] }
```

- Single value: exact match
- Array value: OR match
- Multiple keys: AND match

`when` is evaluated against the element selected by `selector` itself (no parent element search is performed).

When a single type like `bpmn:ServiceTask` is used for multiple purposes, classification via `when` is mandatory (this is a mandatory operational convention, not something mechanically enforced by the implementation).

## 7. `forEach` Specification (Child Element Iteration)

Used for validating multiple child elements that are difficult to express with `path` alone.

| Description | Target |
|---|---|
| `{ "extensionType": "activiti:in" }` | Elements of the specified type under `extensionElements` |
| `{ "extensionFieldPrefix": "inputData_" }` | `activiti:field` elements whose `name` matches the given prefix |

When `forEach` is specified, `path` becomes a relative specification from the iterated child element.

`when` is evaluated on the parent side (the element matched by `selector`) before iteration. When both `extensionFieldPrefix` and `extensionType` are specified in `forEach`, `extensionFieldPrefix` takes precedence.
If the number of iteration targets for `forEach` is 0, that entry alone does not generate a violation (if a minimum count is required, define `required` etc. in a separate entry).

```jsonc
{
  "id": "callActivity.in.target.maxLength",
  "selector": "bpmn:CallActivity",
  "forEach": { "extensionType": "activiti:in" },
  "path": "target",
  "label": "callActivity in target",
  "rule": { "maxLength": 255 }
}
```

`when` and `forEach` can be used together.

## 8. `rule` Constraint Specification

| Key | Specification |
|---|---|
| `required: true` | Prohibits empty values (unset / empty string) |
| `requiredIfPresent: true` | Prohibits an empty string only when the attribute is explicitly present in the XML (omitting the attribute itself is not an error) |
| `requiredIf: { "path": "...", "equals": value }` | Required only when the condition holds |
| `requiredGroup: ["a", "b", ...]` | Requires at least one of the listed paths |
| `invalidValues: ["ticket:"]` | Prohibits an exact match with an enumerated value |
| `format: "regex"` | Requires a regular expression match (if `^...$` is not added, it may become a partial match) |
| `maxLength: number` | Maximum character length |
| `requiredPrefix: ["${", "#{"]` | Requires one of the specified prefixes |
| `invalidPrefix: ["urn:"]` | Prohibits the specified prefix |
| `requiredWithoutPrefix: true` | Prohibits an empty value after removing everything up to and including the leading `:` |
| `requiredWithoutPrefixIf: { "path": "...", "equals": value }` | Conditional version of the above |

`requiredIfPresent` should be used with a single-segment `path` (e.g., `activiti:version`, `field(to)`). It is not recommended for a compound `path` (e.g., `field(to).value`), because the granularity of "attribute explicitly present" judgment does not match the intended semantics.

Evaluation is performed in the fixed order shown in this table (`required` → `requiredIfPresent` → `requiredIf` → `invalidValues` → `requiredGroup` → `format` → `maxLength` → `requiredPrefix` → `invalidPrefix` → `requiredWithoutPrefix`), and evaluation stops at the first constraint that is violated (at most 1 violation per entry per element). The order in which keys are written within the `rule` object in JSON does not affect the evaluation order.
`requiredWithoutPrefixIf` is evaluated as a precondition that determines whether `requiredWithoutPrefix` applies (it is not an independent phase).
This order is hardcoded in `validateInputRuleOnElement()` (validate-bpmn.js). When adding or changing a constraint key, update both this table and the implementation order in `validateInputRuleOnElement()` to keep them consistent.
Split entries when you want to validate multiple aspects independently.

## 9. Operational Guidelines

- To customize rules, duplicate an entry from `scripts/rules-validate-default.json` and adjust it.
- Validations that are difficult to express with `path` + `rule` (cross-reference integrity, DSL interpretation, etc.) should be handled by custom validation on the implementation side rather than in rule definitions.
- When adding rules, be sure to explicitly separate variations of the target type (especially `ServiceTask`) using `when`.
