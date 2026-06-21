import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Pencil, Trash2, Copy, Check, CheckCheck, Clock, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

export default function MessageItem({
  message,
  currentUserId,
  isGrouped,
  isTeam,
  onEdit,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const sender = message.senderId || {};
  const senderId = typeof sender === 'object' ? sender._id : sender;
  const isOwn = String(senderId) === String(currentUserId);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.message);
      toast.success('Message copied');
      setShowMenu(false);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editText.trim() || editText.trim() === message.message) {
      setIsEditing(false);
      return;
    }
    onEdit(message._id, editText.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(message.message);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div
      className={`group relative flex w-full px-3 sm:px-6 py-0.5 ${
        isOwn ? 'justify-end' : 'justify-start'
      } ${isGrouped ? 'mt-0.5' : 'mt-2.5'}`}
    >
      {/* Speech Bubble Container */}
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-3.5 pt-2 pb-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all ${
          isOwn
            ? 'bg-[#dcf8c6] dark:bg-emerald-950/80 text-slate-900 dark:text-slate-100 rounded-tr-xs border border-[#cbeabb]/70 dark:border-emerald-800/50'
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80'
        } ${message.isSending ? 'opacity-70' : ''}`}
      >
        {/* Sender Name in Group Chat for incoming messages */}
        {!isOwn && isTeam && !isGrouped && (
          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mb-1 leading-none select-none">
            {sender.name || 'Teammate'}
          </div>
        )}

        {/* Message Editing Input or Message Body */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="py-1 min-w-[200px]">
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-hidden text-slate-900 dark:text-slate-100"
            />
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
              <span>esc to cancel, enter to save</span>
              <button
                type="submit"
                className="px-2 py-0.5 text-[10px] font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-sm cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2 py-0.5 text-[10px] text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-100 break-words whitespace-pre-wrap select-text">
            <span>{message.message}</span>
            {/* Inline WhatsApp-style timestamp & read receipts trailer */}
            <span className="inline-flex items-center gap-1 ml-2.5 float-right mt-1 select-none text-[10px] font-mono leading-none">
              {message.isEdited && (
                <span className="text-[9px] text-slate-400 italic">edited</span>
              )}
              <span className="text-slate-500/80 dark:text-slate-400 tabular-nums">
                {formatTime(message.createdAt)}
              </span>
              {/* Status Receipts for Outgoing (Own) Messages */}
              {isOwn && (
                <span className="inline-flex items-center ml-0.5">
                  {message.isSending ? (
                    <Clock className="w-3 h-3 text-slate-400" />
                  ) : !isTeam ? (
                    message.isRead ? (
                      <CheckCheck
                        className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 stroke-[2.5]"
                        title="Read"
                      />
                    ) : (
                      <CheckCheck
                        className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 stroke-[2]"
                        title="Delivered"
                      />
                    )
                  ) : (
                    <Check
                      className="w-3 h-3 text-slate-400 dark:text-slate-500 stroke-[2]"
                      title="Sent"
                    />
                  )}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Hover Action Trigger (WhatsApp 3-dot dropdown) */}
        {!isEditing && (
          <div
            className={`absolute top-1 ${
              isOwn ? '-left-7' : '-right-7'
            } opacity-0 group-hover:opacity-100 transition-opacity z-20`}
            ref={menuRef}
          >
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="Message options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className={`absolute top-full mt-1 ${
                  isOwn ? 'left-0' : 'right-0'
                } z-30 w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100`}
              >
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>Copy</span>
                </button>
                {isOwn && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setIsEditing(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3 text-slate-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(message._id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

MessageItem.propTypes = {
  message: PropTypes.object.isRequired,
  currentUserId: PropTypes.string,
  isGrouped: PropTypes.bool,
  isTeam: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
