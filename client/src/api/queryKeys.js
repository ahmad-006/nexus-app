/**
 * Centralized Query Key Factory
 * 
 * Enforces hierarchical key scoping for TanStack Query v5.
 * Prevents string typographical errors and enables selective, hierarchical cache invalidation:
 * - ticketKeys.all: Targets every ticket-related cache
 * - ticketKeys.lists(): Targets all ticket lists across all teams
 * - ticketKeys.list(teamId): Targets ticket list for a specific team
 * - ticketKeys.details(): Targets all single ticket views
 * - ticketKeys.detail(id): Targets a specific ticket
 * - ticketKeys.comments(id): Targets the activity thread of a specific ticket
 */

export const teamKeys = {
  all: ['teams'],
  lists: () => [...teamKeys.all, 'list'],
  detail: (teamId) => [...teamKeys.all, 'detail', teamId],
  members: (teamId) => [...teamKeys.detail(teamId), 'members'],
  invites: () => [...teamKeys.all, 'invites'],
  activities: (teamId) => [...teamKeys.detail(teamId), 'activities'],
};

export const userKeys = {
  all: ['users'],
  list: () => [...userKeys.all, 'list'],
  profile: () => [...userKeys.all, 'profile'],
  teams: () => [...userKeys.all, 'teams'],
};

export const ticketKeys = {
  all: ['tickets'],
  lists: () => [...ticketKeys.all, 'list'],
  list: (teamId) => [...ticketKeys.lists(), teamId],
  details: () => [...ticketKeys.all, 'detail'],
  detail: (ticketId) => [...ticketKeys.details(), ticketId],
  comments: (ticketId) => [...ticketKeys.detail(ticketId), 'comments'],
  myTickets: () => [...ticketKeys.all, 'me'],
};

export const notificationKeys = {
  all: ['notifications'],
  list: () => [...notificationKeys.all, 'list'],
};
