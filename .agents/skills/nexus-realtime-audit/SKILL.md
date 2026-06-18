---
name: nexus-realtime-audit
description: Audits Socket.io event emissions, room scoping, optimistic TanStack Query cache updates, and fractional Kanban drag-and-drop reordering. Use when editing real-time socket handlers, Kanban board components, or ticket status transitions.
---

# Nexus Real-Time & State Synchronization Guard

This skill prevents race conditions, cache desynchronization, and positioning bugs across Socket.io and TanStack Query.

## 1. Socket.io Room Scoping & Event Invariants
- **Room Key:** All real-time workspace traffic is strictly isolated by room: `team_${teamId.toString()}`.
- **Singleton Access:** Always use `socketManager.getIO()` to access the initialized instance.
- **Event Catalog:**
  - `ticket_created`: Payload `{ ticket }`
  - `ticket_updated`: Payload `{ ticketId, updates }`
  - `ticket_reordered`: Payload `{ ticketId, newStatus, newPosition }`
  - `ticket_deleted`: Payload `{ ticketId }`
- **Emission Rule:** Sockets must ONLY be emitted AFTER successful database persistence, never before.

## 2. Kanban Fractional Positioning Math
- Tickets within a column are ordered by `position` ascending.
- Default step increment when creating a ticket: `lastPosition + 1024` (or `1024` if first).
- Drag-and-Drop Drop calculation:
  - If dropped at start of column: `firstPosition / 2`.
  - If dropped at end of column: `lastPosition + 1024`.
  - If dropped between item $A$ and item $B$: `(posA + posB) / 2`.
- **Collision Protection:** If the delta between two adjacent positions drops below $0.001$, trigger a background column re-normalization routine (re-spacing all items in that column by multiples of 1024) to avoid floating-point exhaustion.

## 3. Client-Side Optimistic Synchronization
- **DnD State:** `@hello-pangea/dnd` maintains immediate local drag state in `Workspace.jsx`.
- **Race Condition Prevention:**
  1. User drops ticket $\rightarrow$ UI updates state immediately (optimistic).
  2. Frontend fires mutation `patchReorderTicket`.
  3. Server updates DB and broadcasts `ticket_reordered` to `team_${teamId}`.
  4. Client receiving the remote socket event must NOT overwrite active in-flight drag operations.
  5. TanStack Query cache invalidation `ticketKeys.list(teamId)` must occur in `onSettled` to reconcile canonical positions without snapping the UI.

## 4. Strict State Machine Transitions
- Nexus enforces strict lifecycle progression:
  - `TODO` $\rightarrow$ `['TODO', 'IN_PROGRESS']`
  - `IN_PROGRESS` $\rightarrow$ `['IN_PROGRESS', 'TODO', 'DONE']`
  - `DONE` $\rightarrow$ `['DONE', 'IN_PROGRESS']`
- Any mutation attempting to transition `TODO` directly to `DONE` must be rejected with HTTP 400.
