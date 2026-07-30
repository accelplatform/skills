---
name: bpm-xml-reflector
description: Reflects the contents of specifications and generated scripts into BPMN-XML.
---

# BPMN-XML Specification / Script Reflection Skill

## Purpose
A skill set for reflecting the items required for operation on IM-BPM into BPMN-XML.
Reflects into BPMN-XML the contents of the specifications created with `bpm-docs-generator`.
Reflects into BPMN-XML the contents of the scripts generated with `bpm-scripts-generator`.

## File Structure

```
bpm-xml-reflector/
├── SKILL.md                            # This file
├── scripts/
│   ├── bpmn-scripts-reflector.js       # Functions for reflecting generated script contents into BPMN
│   ├── bpmn-specs-reflector.js         # Functions for reflecting specification contents into BPMN
│   ├── check-process-id-replaced.js    # Function that checks whether the BPMN ID has been replaced
│   └── verify-process-id-reflection.js # Function for verifying ID replacement
└── reference/
    ├── bpmn-scripts-reflector.md       # Specification for reflecting generated script contents into BPMN XML
    └── bpmn-specs-reflector.md         # Specification for reflecting specification contents into BPMN XML
```
