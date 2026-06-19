# Nexus Agent System & Default Orchestration

This document defines the agent roles and the default orchestration layer for Nexus.

---

## Default Orchestration Behavior (`nexus-workflow`)

When a user provides a task describing WHAT to do, the main agent must automatically:

1. **Identify the Task Mode**:
   - **IMPLEMENTATION**: Building new features, pages, components, endpoints, or extending existing capabilities. Follows standard implementation pipeline.
   - **BUG**: Fixing broken behavior, runtime exceptions, or functional regressions. Activates `systematic-debugging` first to prove root cause before touching code.
   - **AUDIT / REVIEW**: Inspecting, auditing, or evaluating existing code, architecture, UI, or security.
     - **Rule**: Do **NOT** automatically enter an implementation/remediation cycle.
     - Explorer, Reviewer, and Verifier inspect the target surface and produce a structured findings report first.
     - Only invoke `nexus-developer` if remediation is explicitly requested.

2. **Classify the Task Risk Tier (Based Strictly on Risk, NOT Complexity or File Count)**:
   - **SMALL (Low Risk)**: Localized cosmetic CSS, typos, text updates, single-file styling, isolated prop tweaks with zero side effects.
   - **NORMAL (Moderate Risk)**: Standard features, multi-file UI components, full frontend pages/views (regardless of visual complexity or component depth), non-auth CRUD endpoints, standard bugs.
     - *Important*: Normal frontend complexity does **NOT** make a task HIGH-RISK.
   - **HIGH-RISK (Severe Risk)**:
     - Authentication, authorization, session tokens, cookie handling
     - Multi-tenant isolation (`teamId` scoping, tenant leakage)
     - Security-sensitive backend changes (RBAC `role-check.js`, IDOR, input sanitization)
     - Database schema mutations or data-integrity changes
     - Socket.io / realtime synchronization & room targeting
     - Optimistic concurrency, race conditions, fractional positioning math
     - Destructive or high-impact architectural refactors

3. **Execute the Assigned Pipeline Automatically**:

```text
SMALL:
  nexus-developer ➔ relevant review ➔ nexus-verifier

NORMAL (Frontend / Standard Feature):
  nexus-explorer ➔ nexus-developer (with UI/React skills) ➔ nexus-reviewer ➔ nexus-verifier
  (Specialists nexus-security-reviewer and nexus-realtime-reviewer remain dormant)

HIGH-RISK:
  nexus-explorer ➔ nexus-developer ➔ [parallel: nexus-reviewer + active specialist(s)] ➔ nexus-developer fixes ➔ nexus-verifier

AUDIT / REVIEW (Any Tier):
  nexus-explorer / nexus-reviewer / nexus-verifier (Playwright if visual) ➔ Report Findings
  (nexus-developer is invoked ONLY if user or task requests remediation)
```

4. **Trigger Domain Skills & Verification Dynamically**:
   - **Communication & Prose**: `unslop` (automatically active across all agent chat responses, explanations, commit messages, and technical documentation).
   - **Frontend / UI**: `anti-ai-slop` (pre-flight directive & rubric), `web-design-guidelines` (a11y/semantics), `vercel-react-best-practices` (performance/waterfalls).
   - **Browser Verification**: Use Playwright MCP automatically when actual interactive or visual behavior needs testing (routes, forms, modals, charts, navigation, responsive layouts). Avoid excessive browser overhead for static styling or non-visual changes.
   - **Backend / Multi-Tenancy**: `nexus-architecture-guard` (only for backend/auth/database tasks).
   - **Realtime / Kanban**: `nexus-realtime-audit` (only for Socket.io/drag-and-drop tasks).
   - **Specialist Dormancy**: `nexus-security-reviewer` and `nexus-realtime-reviewer` remain completely dormant unless their specific high-risk triggers are active.

5. **Token-Budgeting & Context Conservation Protocol**:
   - **Session Lifecycle**: Recommend a fresh session after completing and committing a major feature to reset context window token accumulation.
   - **SMALL Task Conservation (< 30 lines, single file)**: Single-agent execution. Subagents `nexus-explorer` and `nexus-reviewer` remain completely dormant to save multi-agent serialization tokens. Verification uses local terminal checks only.
   - **Surgical Browser Checks**: Prohibit full-page `browser_snapshot` calls that dump 20KB+ accessibility trees into the context. Use targeted `browser_evaluate` queries for specific element attributes or capture a single viewport screenshot.
   - **Quiet Terminal Execution**: Run linters and builds with output redirection or quiet flags (`bun run build > /dev/null 2>&1 || bun run build`). Only display stdout/stderr when the exit code is non-zero. Never dump hundreds of warning lines into prompt context on successful builds.

---

## Agent Independence Protocols

1. **Reviewers (`nexus-reviewer`, `nexus-security-reviewer`, `nexus-realtime-reviewer`)**:
   - **Must inspect the actual repository and `git diff` directly.**
   - **Must never trust the developer's summary as proof.**
   - **Must never modify application code.**
   - **Structured Findings Format**:
     - `File & Location`: Specific file and line range.
     - `Problem`: Direct statement of the bug, vulnerability, or invariant breach.
     - `Technical Reasoning`: Why this violates system architecture or security.
     - `Reproduction / Evidence`: Concrete steps or proof where possible.
2. **Developer (`nexus-developer`)**:
   - Addresses confirmed findings reported by reviewers before passing to verification.
   - In AUDIT tasks, Developer remains un-invoked until findings are reviewed.
3. **Verifier (`nexus-verifier`)**:
   - **Final gatekeeper.** Never relies on previous agents saying "passed".
   - Executes fresh terminal validation commands (`bun run build`, tests, linters).
   - Executes automated browser verification via global Playwright MCP when visual/interactive verification is required.
   - **Strictly prohibited from modifying application source code.** Enforces **The Iron Law**: no completion claims without fresh observable evidence.

---

## Specialized Agent Specifications

### 1. `nexus-explorer`
- **Type:** Read-Only Researcher
- **Tools:** Read files, codebase search, grep, terminal inspection (no write tools).
- **Objective:** Map existing code paths, trace dependencies, and evaluate architectural risks without modifying files.
- **When to Use:** Phase 1 of NORMAL and HIGH-RISK tasks requiring understanding of unfamiliar code, multi-file interactions, or dependency tracing.

### 2. `nexus-developer`
- **Type:** Software Engineer
- **Tools:** Read, write, terminal commands.
- **Objective:** Implement approved changes while strictly adhering to Nexus conventions and GEMINI.md Anti-AI design standards.
- **When to Use:** Implementation phase of approved tasks.

### 3. `nexus-reviewer`
- **Type:** Code & Quality Reviewer
- **Tools:** Read files, git diff inspection (no write tools).
- **Objective:** Conduct adversarial review of the developer's git diff for logic bugs, regressions, error handling, and Anti-AI UI compliance.
- **When to Use:** Post-implementation review gate for all tasks.

### 4. `nexus-security-reviewer`
- **Type:** Security & Multi-Tenancy Auditor
- **Tools:** Read files, git diff inspection (no write tools).
- **Objective:** Audit endpoints, controllers, and queries for tenant isolation (`teamId`), RBAC permissions (`role-check.js`), IDOR, and NoSQL/XSS sanitization.
- **When to Use:** High-risk tasks touching authentication, authorization, routes, or database queries.

### 5. `nexus-realtime-reviewer`
- **Type:** Synchronization Specialist
- **Tools:** Read files, git diff inspection (no write tools).
- **Objective:** Audit Socket.io room broadcasts, TanStack Query cache invalidations, optimistic Kanban drag-and-drop updates, and fractional positioning math.
- **When to Use:** High-risk tasks touching real-time sockets, Kanban drag-and-drop, or collaborative updates.

### 6. `nexus-verifier`
- **Type:** Final Gatekeeper
- **Tools:** Terminal execution, Playwright MCP tools (`browser_*`).
- **Objective:** Execute fresh, independent verification commands (`bun run build`, syntax verification, diff inspection) and automated browser verification via Playwright MCP. Strictly prohibited from modifying application source code.
- **When to Use:** Final gate before claiming completion or committing changes.
