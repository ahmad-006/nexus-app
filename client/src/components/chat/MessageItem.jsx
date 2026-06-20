import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Pencil, Trash2, Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function MessageItem({
  message,
  currentUserId,
  isGrouped,
  onEdit,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);
  const [isCopied, setIsCopied] = useState(false);
  const inputRef = useRef(null);

  const sender = message.senderId || {};
  const senderId = typeof sender === 'object' ? sender._id : sender;
  const isOwn = senderId === currentUserId;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.message);
      setIsCopied(true);
      toast.success('Message copied');
      setTimeout(() => setIsCopied(false), 2000);
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

  const initials = sender.name
    ? sender.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div
      className={`group relative flex gap-3 px-4 py-1.5 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
        isGrouped ? 'mt-0.5' : 'mt-3'
      } ${message.isSending ? 'opacity-60' : ''}`}
    >
      {/* Avatar or Timestamp Spacer */}
      <div className="w-8 shrink-0 flex items-start justify-center">
        {!isGrouped ? (
          sender.image ? (
            <img
              src={sender.image}
              alt={sender.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-medium text-slate-700 dark:text-slate-300">
              {initials}
            </div>
          )
        ) : (
          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-slate-400 mt-1">
            {formatTime(message.createdAt)}
          </span>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {!isGrouped && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {sender.name || 'Unknown'}
            </span>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {formatTime(message.createdAt)}
            </span>
            {message.isSending && (
              <span className="text-[10px] font-mono text-slate-400 italic">Sending...</span>
            )}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="mt-1">
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-hidden focus:border-slate-500 text-slate-900 dark:text-slate-100"
            />
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
              <span>esc to cancel, enter to save</span>
              <button
                type="submit"
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2 py-0.5 text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-400"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 break-words whitespace-pre-wrap select-text">
            {message.message}
            {message.isEdited && (
              <span className="ml-1.5 text-[10px] font-mono text-slate-400 select-none">
                (edited)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Action Strip */}
      {!isEditing && !message.isSending && (
        <div className="absolute right-3 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-xs px-1 py-0.5">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-sm"
            title="Copy"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
          {isOwn && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-sm"
                title="Edit"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(message._id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-sm"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

MessageItem.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    senderId: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    isEdited: PropTypes.bool,
    isSending: PropTypes.bool,
  }).isRequired,
  currentUserId: PropTypes.string,
  isGrouped: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
