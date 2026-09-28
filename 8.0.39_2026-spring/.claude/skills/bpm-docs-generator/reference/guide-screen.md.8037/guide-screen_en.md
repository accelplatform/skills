# Structure and Description of the Screen Definition

The generated screen definition must have the following structure.

1. List of Screens
  - Record the list of screens.
  - The list items include "Screen ID," "Screen Definition Name," "Corresponding Task," "URL Path," "Feature Summary," etc.

2. Screen Details
  - For each screen, record the following content.
    - Screen overview
    - Screen items
    - Screen layout mockup
    - Validation
    - Action processing such as buttons

## Reference Skills
- `.claude/skills/jssp-imds-theme/SKILL.md`: imds-compliant HTML code generation
- `.claude/skills/jssp-page-generator/SKILL.md`: JSSP code generation support

## Notes
- **As a general rule, do not create a list screen (a screen that searches business data and displays the results as a list) in the screen definition; create only registration, edit, and detail screens. (However, creating a list screen is permitted when there is an explicit instruction to do so.)**
* **Do not split screens with a similar design, such as a registration screen and an edit screen, into separate pages (presentation page + function container).**
  * Use branching within the presentation page to switch between the display area for registration and the display area for editing.
