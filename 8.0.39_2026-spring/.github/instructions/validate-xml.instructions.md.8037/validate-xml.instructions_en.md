---
applyTo: "src/**/*.xml"
---

# Notes on implementing and modifying xml files

1. Run the following command to validate the xml files.

```bash
mvn -q -s settings.xml xml-validator:validate -Dsettings=.accel/settings.json -Ddir=src/
```

2. If a validation error occurs, review the error message, fix the relevant section, and return to step 1.
3. If the same error occurs more than once, display the error message and let a human fix it.
