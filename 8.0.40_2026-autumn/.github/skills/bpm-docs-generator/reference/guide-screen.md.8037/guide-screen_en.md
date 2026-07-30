# Structure and Explanation of Screen Definitions

The generated screen definitions must have the following structure.

1. Screen list
  - Describe the list of screens.
  - The items in the list are "screen ID", "screen definition name", "corresponding task", "URL path", "feature overview", and so on.

2. Screen details
  - For each screen, describe the following contents
    - Screen overview
    - Screen items
    - Mockup of the screen layout
    - Validation
    - Action processing for buttons, etc.

## Reference Skills
- `jssp-imds-theme`: imds-compliant HTML code generation
- `jssp-page-generator`: JSSP code generation support

## Notes
- **As a rule, do not create list screens (screens that search business data and display the results in a list) in the screen definitions; create only registration, edit, and detail screens. (However, if there is an explicit instruction, creating list screens is also permitted.)**
* **Do not split screens with similar designs, such as the registration screen and the edit screen, into separate pages (presentation page + function container).**
  * Switch between the registration display area and the edit display area using branching within the presentation page.
