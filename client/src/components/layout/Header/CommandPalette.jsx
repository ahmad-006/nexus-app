import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import useCommandStore from '../../../store/commandStore';
import useTeamStore from '../../../store/teamStore';
import { useTeamTickets } from '../../../hooks/useTickets';
import { useTeamDetails } from '../../../hooks/useTeams';

const NAVIGATION_ROUTES = [
  { path: '/dashboard', label: 'Kanban Board' },
  { path: '/my-tasks', label: 'My Tasks' },
  { path: '/team', label: 'Team Management' },
  { path: '/analytics', label: 'Telemetry & Analytics' },
  { path: '/settings', label: 'Settings' },
];

const CommandPalette = () => {
  const navigate = useNavigate();
  const { isOpen, closeCommandPalette, openCreateTicket } = useCommandStore();
  const { activeTeamId } = useTeamStore();

  const { data: tickets = [] } = useTeamTickets(activeTeamId);
  const { data: teamDetails } = useTeamDetails(activeTeamId);
  const members = useMemo(() => teamDetails?.members || [], [teamDetails?.members]);

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Reset palette query and selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Dialog-wide Escape key listener to close palette even if focus leaves input
  useEffect(() => {
    if (!isOpen) return;
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, closeCommandPalette]);

  // Compute flattened filter items across Actions, Navigation, Tickets, Members
  const flatItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = [];

    // 1. Actions (strictly available when workspace exists)
    if (activeTeamId && (!q || 'create new task'.includes(q) || 'new task'.includes(q) || 'ticket'.includes(q))) {
      items.push({
        id: 'action-create-task',
        category: 'Actions',
        label: 'Create New Task',
        meta: 'Action',
        onSelect: () => openCreateTicket(),
      });
    }

    // 2. Navigation Routes
    NAVIGATION_ROUTES.forEach((route) => {
      if (!q || route.label.toLowerCase().includes(q) || route.path.toLowerCase().includes(q)) {
        items.push({
          id: `nav-${route.path}`,
          category: 'Navigation',
          label: route.label,
          meta: route.path,
          onSelect: () => {
            navigate(route.path);
            closeCommandPalette();
          },
        });
      }
    });

    // 3. Tickets (search by title or guarded key, sliced to max 8)
    const matchedTickets = [];
    for (const ticket of tickets) {
      if (matchedTickets.length >= 8) break;
      const idStr = String(ticket?._id || '');
      const key = idStr.length >= 4 ? `NEX-${idStr.slice(-4).toUpperCase()}` : 'NEX-TASK';
      const title = ticket?.title || '';
      if (!q || title.toLowerCase().includes(q) || key.toLowerCase().includes(q)) {
        matchedTickets.push({
          id: `ticket-${ticket._id}`,
          category: 'Tickets',
          label: title,
          keyBadge: key,
          status: ticket.status,
          priority: ticket.priority,
          onSelect: () => {
            navigate(`/dashboard/ticket/${ticket._id}`);
            closeCommandPalette();
          },
        });
      }
    }
    items.push(...matchedTickets);

    // 4. Members (search by name or email, sliced to max 8)
    const matchedMembers = [];
    for (const m of members) {
      if (matchedMembers.length >= 8) break;
      const user = m.userId;
      const name = user?.name || 'Operative';
      const email = user?.email || '';
      if (!q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q)) {
        matchedMembers.push({
          id: `member-${user?._id || m._id || email}`,
          category: 'Members',
          label: name,
          meta: email || m.role,
          role: m.role,
          onSelect: () => {
            navigate('/team');
            closeCommandPalette();
          },
        });
      }
    }
    items.push(...matchedMembers);

    return items;
  }, [search, activeTeamId, tickets, members, navigate, openCreateTicket, closeCommandPalette]);

  // Group flat items while preserving global indices for keyboard traversal
  const groupedItems = useMemo(() => {
    const groups = {};
    flatItems.forEach((item, index) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push({ ...item, globalIndex: index });
    });
    return groups;
  }, [flatItems]);

  // Scroll active item into view strictly during keyboard navigation
  const scrollToItem = (index) => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        const itemEl = listRef.current.querySelector(`[data-index="${index}"]`);
        if (itemEl) {
          itemEl.scrollIntoView({ block: 'nearest' });
        }
      }
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setSelectedIndex(0);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = flatItems.length > 0 ? (selectedIndex + 1) % flatItems.length : 0;
      setSelectedIndex(nextIndex);
      scrollToItem(nextIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = flatItems.length > 0 ? (selectedIndex - 1 + flatItems.length) % flatItems.length : 0;
      setSelectedIndex(prevIndex);
      scrollToItem(prevIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        flatItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div key="command-palette-root" className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 sm:pt-28 px-4 pointer-events-none">
          {/* Neutral backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs pointer-events-auto"
            onClick={closeCommandPalette}
          />

          {/* Palette Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[480px] z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3 shrink-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={isOpen}
                aria-controls="command-palette-list"
                aria-activedescendant={flatItems[selectedIndex]?.id}
                value={search}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedIndex(0);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
                  ESC
                </kbd>
              )}
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              id="command-palette-list"
              role="listbox"
              aria-label="Commands and suggestions"
              className="overflow-y-auto flex-1 p-2 space-y-4"
            >
              {flatItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-mono">
                  No matching results for &ldquo;{search}&rdquo;
                </div>
              ) : (
                Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="space-y-1">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {category}
                    </div>
                    {items.map((item) => {
                      const isSelected = item.globalIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          id={item.id}
                          role="option"
                          aria-selected={isSelected}
                          type="button"
                          data-index={item.globalIndex}
                          onClick={() => item.onSelect()}
                          onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-slate-100 text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                            {item.keyBadge && (
                              <span className="font-mono text-[11px] font-semibold text-slate-500 shrink-0">
                                {item.keyBadge}
                              </span>
                            )}
                            <span className="truncate font-medium">{item.label}</span>
                          </div>

                          {item.status && (
                            <span className="font-mono text-[11px] text-slate-400 uppercase shrink-0 mr-2">
                              {item.status.replace('_', ' ')}
                            </span>
                          )}

                          {item.meta && (
                            <span className="font-mono text-[11px] text-slate-400 shrink-0">
                              {item.meta}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Tabular Navigation Hints Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
              <span>
                {flatItems.length} {flatItems.length === 1 ? 'item' : 'items'}
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded shadow-xs">
                    &uarr;&darr;
                  </kbd>{' '}
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded shadow-xs">
                    &crarr;
                  </kbd>{' '}
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded shadow-xs">
                    esc
                  </kbd>{' '}
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CommandPalette;
