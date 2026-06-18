---
name: nexus-workflow
description: Automatic orchestration protocol for all tasks in Nexus. Automatically classifies tasks into SMALL, NORMAL, or HIGH-RISK, routes to specialized agents (nexus-explorer, nexus-developer, nexus-reviewer, nexus-security-reviewer, nexus-realtime-reviewer, nexus-verifier), and executes domain-specific skills (unslop, anti-ai-slop, web-design-guidelines, vercel-react-best-practices, nexus-architecture-guard, nexus-realtime-audit, systematic-debugging, requesting-code-review, verification-before-completion) with automated Playwright MCP browser verification for frontend tasks.
---

# Nexus Automatic Orchestration Protocol

This skill governs end-to-end task execution in Nexus. When the user provides a prompt describing WHAT needs to be done, this protocol classifies the task, selects the appropriate agent pipeline, and triggers the required domain skills automatically.

---

## 1. Task Classification Engine

Every incoming task must be classified along two distinct axes: **Task Mode** and **Risk Tier**.

### Axis 1: Task Mode (Intent)

| Mode | Objective | Workflow Protocol |
| :--- | :--- | :--- |
| **IMPLEMENTATION** | Building new features, pages, components, endpoints, or extending existing functionality. | Standard pipeline: Explorer (if Normal/High) → Developer → Reviewer(s) → Verifier. |
| **BUG** | Fixing a broken behavior, runtime crash, or functional regression. | Activates `systematic-debugging` first (find & prove root cause before touching code) → Developer fix → Reviewer(s) → Verifier. |
| **AUDIT / REVIEW** | Inspecting, evaluating, or auditing existing code, UI, or architecture. | **Do NOT automatically enter an implementation/remediation cycle.**<br>Explorer / Reviewer / Verifier inspect the target and **report findings first**.<br>Developer is invoked **ONLY** if the user or task explicitly requests remediation. |

---

### Axis 2: Risk Tier (Blast Radius & System Invariants)

Classification is strictly based on **RISK**, not visual complexity, number of components, or file count. Normal frontend complexity does **NOT** make a task HIGH-RISK.

| Tier | Characteristics | Trigger Conditions & Boundaries | Routing Pipeline |
| :--- | :--- | :--- | :--- |
| **SMALL** | Low Risk | • Single file or localized cosmetic change<br>• CSS styling, spacing, typography, typo, minor text update<br>• Isolated prop change with zero side effects | **Developer** → **Relevant Review** → **Verifier**<br>*(Bypasses Explorer phase)* |
| **NORMAL** | Moderate Risk | • Standard frontend features, components, and full pages (regardless of visual complexity or component depth)<br>• Client hooks, TanStack queries, forms, local state<br>• Non-auth, non-tenant backend CRUD endpoints<br>• Standard bug fixes | **Explorer** → **Developer** *(with UI/React skills)* → **Reviewer** → **Verifier**<br>*(Specialists remain dormant)* |
| **HIGH-RISK** | Severe Risk | • Authentication, authorization, tokens, session cookies<br>• Multi-tenant isolation (`teamId` scoping, tenant leakage risks)<br>• Security-sensitive backend changes (RBAC `role-check.js`, IDOR, input sanitization)<br>• Database schema mutations or data-integrity changes<br>• Socket.io / realtime synchronization & room targeting<br>• Optimistic concurrency, race conditions, fractional positioning math<br>• Destructive or high-impact architectural refactors | **Explorer** → **Developer** → **Parallel Reviewers** *(Reviewer + active specialist)* → **Developer Fixes** → **Verifier** |

---

## 2. Agent Execution & Roles

### 1. `nexus-explorer` (Read-Only)
- **Scope:** Runs in Phase 1 for **NORMAL** and **HIGH-RISK** tasks, and during **AUDIT** tasks.
- **Action:** Traces dependencies, reads relevant controller/service/component files, maps potential failure modes and invariants.
- **Rule:** Never modifies any files.

### 2. `nexus-developer` (Implementation)
- **Scope:** Executes approved changes in **IMPLEMENTATION** and **BUG** tasks.
- **Action:** Implements surgical, minimal diffs. Respects existing codebase conventions, avoids unnecessary refactors or dependency additions.
- **Audit Rule:** In **AUDIT / REVIEW** tasks, Developer remains **dormant** unless the user explicitly requests remediation of discovered findings.

### 3. Reviewers (Adversarial & Independent Gatekeepers)
Reviewers **never trust the developer's summary**—they inspect the actual repository and `git diff` directly. Reviewers **never modify code**.
Findings must strictly report:
- `File` and line range
- `Problem` (concrete bug, regression, or violation)
- `Technical Reasoning` (why it fails or breaches invariant)
- `Reproduction / Evidence`

- **`nexus-reviewer`**: Active for all code changes. Reviews code quality, edge cases, error handling, regressions, accessibility, and Anti-AI UI compliance.
- **`nexus-security-reviewer`**: **Dormant by default.** Activates ONLY when tasks touch authentication, authorization, multi-tenant `teamId` scoping, RBAC, or backend security.
- **`nexus-realtime-reviewer`**: **Dormant by default.** Activates ONLY when tasks touch Socket.io room targeting, TanStack Query realtime cache invalidations, optimistic Kanban drag-and-drop state, or fractional positioning math.

### 4. `nexus-verifier` (Final Independent Gatekeeper)
- **Scope:** Mandatory final gate for all tasks before claiming completion.
- **Action:**
  - Runs fresh verification commands in the terminal (`bun run build`, typecheck, lint, test).
  - For frontend UI tasks requiring actual interactive or visual behavior validation (routes, forms, modals, responsive layouts, client state transitions): autonomously executes browser verification using global Playwright MCP tools (`browser_navigate`, `browser_screenshot`, `browser_click`, `browser_console_messages`, DOM inspection).
  - Avoids excessive browser overhead for simple static styling or non-visual changes.
- **Rule:** Strictly prohibited from modifying application source code. Enforces **The Iron Law**: evidence before assertions always.

---

## 3. Domain-Specific Skill Routing Matrix

Skills must be loaded contextually based on task mode and domain. Do not run skills outside their domain.

```text
Incoming Task
  │
  ├── All Agent Communication & Prose
  │     └── ALWAYS (Automatic) ➔ Activate: unslop (cut AI vocabulary, em dashes, chatbot filler)
  │
  ├── What is the Task Mode?
  │     ├── AUDIT / REVIEW ➔ Run Explorer / Reviewer / Verifier ➔ Output Findings Report
  │     │                   (Do NOT invoke Developer unless remediation requested)
  │     ├── BUG ➔ Activate: systematic-debugging (find root cause before code changes)
  │     └── IMPLEMENTATION ➔ Standard implementation pipeline
  │
  ├── Does it touch Frontend / UI / Tailwind / React?
  │     ├── YES ➔ Activate: anti-ai-slop (pre-flight aesthetic directive + review)
  │     ├── YES ➔ Activate: web-design-guidelines (a11y, focus rings, semantics, keyboard)
  │     ├── YES ➔ Activate: vercel-react-best-practices (waterfalls, re-renders, bundle size)
  │     └── Does it require interactive or visual behavior validation?
  │           └── YES ➔ nexus-verifier executes Playwright MCP browser validation
  │
  ├── Does it touch Backend / Database / Multi-Tenancy / API Routes?
  │     └── YES (High-Risk) ➔ Activate: nexus-architecture-guard + nexus-security-reviewer
  │
  ├── Does it touch Socket.io / Kanban DnD / Realtime Sync?
  │     └── YES (High-Risk) ➔ Activate: nexus-realtime-audit + nexus-realtime-reviewer
  │
  ├── Did developer complete a code diff?
  │     └── YES ➔ Activate: requesting-code-review (structured handover to reviewers)
  │
  └── Prior to claiming completion or committing?
        └── MANDATORY ➔ Activate: verification-before-completion (Iron Law verification)
```

---

## 4. End-to-End Execution Workflows

### Workflow A: SMALL Task (Cosmetic / Localized)
1. **Developer**: Reads target file and applies surgical edit.
   - If frontend: applies `anti-ai-slop` constraints.
2. **Review**: Lightweight `nexus-reviewer` checks `git diff` against requirements.
3. **Verifier**: Runs syntax/build check (`bun run build` or targeted lint).

### Workflow B: NORMAL Task (Standard Feature / Frontend Page)
1. **Explorer**: Inspects affected files and dependencies, outlines component boundaries.
2. **Developer**:
   - Applies frontend skills (`anti-ai-slop`, `web-design-guidelines`, `vercel-react-best-practices`).
   - Implements clean, minimal solution.
   - Prepares diff via `requesting-code-review`.
3. **Reviewer**: `nexus-reviewer` inspects `git diff` independently.
   - Specialists (`nexus-security-reviewer`, `nexus-realtime-reviewer`) remain dormant.
   - If issues found: Developer fixes → Reviewer re-checks.
4. **Verifier**: Executes build and static checks. If interactive or visual behavior was touched, runs Playwright MCP verification to confirm routes, state transitions, and console health.

### Workflow C: HIGH-RISK Task (Auth, Tenancy, DB, Realtime Sync)
1. **Explorer**: Deep-traces full data flow across backend/realtime layers.
2. **Developer**:
   - Loads domain-specific guards (`nexus-architecture-guard` and/or `nexus-realtime-audit`).
   - Implements fix/feature.
   - Invokes `requesting-code-review`.
3. **Parallel Reviews**:
   - `nexus-reviewer`: Audits logic, edge cases, error handling.
   - `nexus-security-reviewer` (if auth/data/tenancy touched): Audits `teamId` scoping, RBAC, IDOR.
   - `nexus-realtime-reviewer` (if sockets/Kanban touched): Audits socket rooms, optimistic rollback, fractional precision.
4. **Developer Remediation**: Fixes any confirmed findings raised by specialist reviewers.
5. **Verifier**: Executes complete verification suite (`bun run build`, tests, server endpoint checks, Playwright MCP if UI/realtime touched).

### Workflow D: AUDIT / REVIEW Task (Inspection Mode)
1. **Explorer**: Maps target page, components, data flow, and architecture.
2. **Specialized Review**:
   - If frontend page: `nexus-reviewer` evaluates against `anti-ai-slop`, `web-design-guidelines`, and `vercel-react-best-practices`.
   - If security/backend: `nexus-security-reviewer` audits endpoints and tenancy.
   - If realtime: `nexus-realtime-reviewer` audits socket lifecycle and synchronization.
3. **Visual / Runtime Inspection (if applicable)**:
   - `nexus-verifier` uses Playwright MCP to inspect live rendering, verify accessibility, check console logs, and capture screenshots.
4. **Report Findings**: Output clear, structured audit findings (What works, Defects, Opportunities).
5. **Remediation Gate**: **Developer is NOT invoked automatically.** Only proceed to fix if the user or task explicitly requests remediation.
