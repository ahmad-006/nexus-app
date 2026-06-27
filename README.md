# NEXUS — Real-Time Ticket Management & Engineering Workspace

NEXUS is a real-time collaborative engineering workspace and ticket management platform architected on React, Express 5, MongoDB Atlas, and Socket.io, powered by the Bun runtime.

### Key Capabilities
- **Kanban Board with Fractional Indexing**: $O(1)$ database reordering and optimistic drag-and-drop transitions.
- **Asymmetrical 70/30 Ticket Workspace**: Live narrative view interleaved with chronological activity streams and headless sidebar controls.
- **Unified Audit Trail & Threaded Discussions**: System audit logs (status changes, priority escalations, reassignments, attachment lifecycles) interleaved with nested comment threads.
- **Real-Time WebSocket Sync**: Persistent room-scoped event broadcasting across connected team members.
- **Single-Origin Architecture**: Serves static Vite React SPA directly from Express, ensuring first-party cookie compliance across mobile Safari, iOS, and modern desktop browsers.
