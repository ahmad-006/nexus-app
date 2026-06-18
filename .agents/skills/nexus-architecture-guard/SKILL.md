---
name: nexus-architecture-guard
description: Enforces Nexus multi-tenant teamId isolation, RBAC role checks, TanStack Query key hierarchies, and controller boundaries. Use when adding or modifying backend routes, controllers, Mongoose queries, or client API hooks.
---

# Nexus Architecture & Multi-Tenant Guard

This skill enforces the core architectural invariants of the Nexus codebase.

## 1. Multi-Tenant Scoping (`teamId` Isolation)
- **Tenant Key:** Every ticket, comment, notification, activity, and message in Nexus MUST be strictly scoped to a `teamId`.
- **Query Scoping:** Never query by `_id` alone if the resource belongs to a team. Always include `{ _id: resourceId, teamId: req.params.teamId }` or verify that the fetched resource's `teamId` matches the authenticated user's workspace.
- **Authorization Check:** Before modifying or returning any team resource, verify that `req.user.id` is a verified member of `Team.members` or matches `Team.ownerId` using `role-check.js`.

## 2. RBAC Permissions Matrix
- **`owner`:** Can delete the workspace, transfer ownership, promote/demote members, modify billing, and update any ticket.
- **`admin`:** Can invite members, update team metadata, manage any ticket in the team, and delete comments.
- **`member`:** Can create tickets, edit tickets assigned to them or reported by them, and post comments. Cannot modify team settings or invite users.

## 3. TanStack Query Cache Conventions (`client/src/api/queryKeys.js`)
- All query keys must be defined in `client/src/api/queryKeys.js`. Never use inline string keys.
- **Invalidation Matrix:**
  - Ticket Creation: Invalidate `ticketKeys.list(teamId)` and `ticketKeys.stats(teamId)`.
  - Ticket Mutation (status, assignee, reorder): Invalidate `ticketKeys.list(teamId)`, `ticketKeys.stats(teamId)`, and update `ticketKeys.detail(ticketId)`.
  - Ticket Deletion: Invalidate `ticketKeys.list(teamId)`, `ticketKeys.stats(teamId)`, and remove `ticketKeys.detail(ticketId)`.

## 4. Backend Controller Boundaries
- **Error Handling:** All async route handlers must be wrapped in `catchAsync`. Errors must use `new AppError(message, statusCode)` forwarded via `next(err)`.
- **Separation of Concerns:** Controllers must delegate side-effects cleanly:
  - Database queries via Mongoose models.
  - Real-time broadcasts via `socketManager.getIO()`.
  - Activity tracking via `logActivity`.
  - Notifications via `createNotification`.
  - Emails via `sendEmail`.
- Avoid monolithic controller functions (> 150 lines). Decompose helper routines into dedicated utility modules.

## 5. Mongoose Relational Invariants
- **Positioning:** Tickets use fractional numeric ordering (`position: Number`, default step $\Delta = 1024$). Never re-index entire columns on insert.
- **Virtuals:** Tickets use virtual population for relational counts (`commentCount` referencing `Comment`). Ensure `toJSON: { virtuals: true }` is preserved.
