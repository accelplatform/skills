
# JSSP / Low-code Asset Skill Set

## Overview

A repository of skill sets for creating source code and low-code assets for intra-mart Accel Platform using JSSP (script development model).

To reduce token consumption by coding agents, it is recommended to pick out only the necessary skill sets following the "Skill Reverse Lookup" below.

## Skill Reverse Lookup

### I want to build a screen

- I want to create a new business screen with JSSP (pro-code)
  - ⇒ `jssp-page-generator` + `jssp-imds-theme`
    - Generates function container (js), presentation page (html), and routing table (xml) at once
    - When database access is required, implements 2WaySQL (sql) and API calls
    - Adopts a design based on intra-mart Design System (imds)
- I want to display graphs / charts on a business screen
  - ⇒ `jssp-highcharts-usage`
    - Integrates the Highcharts library bundled with intra-mart and generates charts using it
- I want to embed an IM-CommonMaster search dialog into a business screen
  - ⇒ `jssp-im-master-usage`
    - Embeds search functions for users, companies, organizations, posts, public groups, private groups, and roles

### I want to build a REST-API for external systems

- I want to newly publish a REST-API with OAuth authentication
  - ⇒ `jssp-im-oauth-generator`
    - Bundle-generates scope definition (xml), resource URL configuration (xml), client detail configuration (xml), and JSSP resource implementation (js) using the im_oauth provider feature
    - No CSRF secure token verification; authenticate with OAuth access tokens
    - For regular REST-APIs called via the browser tenant login session, use the `jssp-page-generator` skill

### I want to build a job program

- I want to create a job scheduler batch process with JSSP (pro-code)
  - ⇒ `jssp-im-job-generator`
    - Generates a function container (js) for screen-less periodic or batch processing

### I want to build IM-Workflow assets

- I want to create a workflow master definition file
  - ⇒ `jssp-im-workflow-generator`
    - Generates import XML including contents, route, flow, matter properties, and branch rules
    - Supports straight / branch / sync / horizontal / vertical route patterns
    - Supports sample-installed users, companies, organizations, posts, and public groups (extensions planned via MCP)
    - Supports Japanese (ja) / English (en) / Simplified Chinese (zh_CN)
- I want to build various screens and processes that work with workflow
  - ⇒ `jssp-im-workflow-usage` (+ `jssp-page-generator`)
    - Generates apply / approve / detail / confirm / reference screens (html + js)
    - Generates action processes, arrival processes, matter start / end processes, branch condition decisions, and various listeners (js)

### I want to build IM-LogicDesigner assets

- I want to create a logic flow (low-code) definition file
  - ⇒ `jssp-im-logic-generator`
    - Generates import ZIP including logic flow (flow_definition.json) and routing (flow_route.json)
    - Supports standard tasks provided by tenant management (authorization, repository operations, mail sending, etc.; 125 types) (extensions planned via MCP)
    - Supports standard mapping functions (numeric operations, string operations, array operations, JSON, BASE64, etc.; 52 types) (extensions planned via MCP)
    - Supports user-defined tasks (JavaScript, REST, SQL, Database Fetch, template) (extensions planned via MCP)

### I want to localize

- I want to localize hard-coded strings in JSSP business screens
  - ⇒ `jssp-localize-support` (+ `jssp-page-generator`)
    - Creates message property files (properties)
    - Rewrites to `<imart type="message">` tags / MessageManager API
    - Supports Japanese (ja) / English (en) / Simplified Chinese (zh_CN)

### I want to test / check quality

- I want a coding agent to perform code review
  - ⇒ `jssp-code-review`
    - Comprehensive review from the viewpoint of general coding conventions, bind variable usage, naming rules, error handling, etc.
- I want to detect security vulnerabilities
  - ⇒ `jssp-security-check`
    - Detects risks and vulnerabilities such as SQL injection, XSS, use of eval, hard-coded credentials, etc.
- I want to create unit tests for function containers
  - ⇒ `jssp-jest-test`
    - Generates unit tests for function containers (js) using Jest on Rhino (work in progress)
- I want to create E2E tests for business screens
  - ⇒ `jssp-playwright-test`
    - Generates E2E tests for JSSP screens (html + js pairs) using Playwright (work in progress)

### I want to prepare for production deployment

- I want to create tenant environment setup assets
  - ⇒ `jssp-tenant-setup-generator`
    - Based on the deliverables, prepares the necessary roles, authorizations, menus, jobs, and the setup configuration files
    - Menu is "Sitemap (for PC)" only

## Limitations

- imui theme and V72-compatible screen generation are not supported. Only imds is supported.
- Routing table: reverse lookup instructions for authorization resources are not supported. Adjust appropriately from `welcome-all`.
- Job: generating import data for job definitions is not supported.
- A Node.js script is executed to verify the correctness of generated artifacts. `/tmp` is used temporarily.
- IM-Workflow: master definition JSSP API is out of scope. Only matter retrieval / operation APIs are supported.
- IM-Workflow: using IM-LogicDesigner plugins as applicants or process targets is out of scope.
- IM-Workflow: list display patterns, flow groups, media, and messages are out of scope.
- IM-LogicDesigner: calling IM-LogicDesigner from JSSP business screens is limited to via routing.
- IM-LogicDesigner: routing is not generated by default. If needed, specific instructions are required.
- IM-LogicDesigner: user-defined items that are not supported even by MCP are substituted with JavaScript user-defined items.
- IM-LogicDesigner: preview image generation for triggers / logic flows is out of scope.
- IM-BloomMaker / ViewCreator / Accel Studio: asset generation is out of scope.
