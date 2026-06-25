import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SendHorizontal } from 'lucide-react';
import { socket } from '../../api/socket';

export default function MessageInput({
  teamId,
  activeConversation,
  onSendMessage,
  placeholder = 'Type a message...',
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleTypingEmission = useCallback(() => {
    if (!socket || !teamId || !activeConversation) return;

    const isDM = activeConversation.type === 'DM';
    socket.emit('typing_start', {
      teamId,
      conversationId: isDM ? activeConversation.id : 'team',
      isDM,
      receiverId: isDM ? activeConversation.id : null,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        teamId,
        conversationId: isDM ? activeConversation.id : 'team',
        isDM,
        receiverId: isDM ? activeConversation.id : null,
      });
    }, 1500);
  }, [teamId, activeConversation]);

  const handleChange = (e) => {
    setText(e.target.value);
    handleTypingEmission();

    // Auto-adjust textarea height up to 120px
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      const isDM = activeConversation.type === 'DM';
      socket.emit('typing_stop', {
        teamId,
        conversationId: isDM ? activeConversation.id : 'team',
        isDM,
        receiverId: isDM ? activeConversation.id : null,
      });
    }

    onSendMessage(text);
    setText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-3 pb-20 lg:pb-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
      <div className="flex items-end gap-2.5">
        {/* Rounded Input Pill */}
        <div className="flex-1 bg-slate-100/90 dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 px-4 py-2 flex items-center gap-2 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-slate-400 dark:focus-within:border-slate-600 transition-colors shadow-2xs">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={2000}
            className="flex-1 max-h-28 resize-none bg-transparent text-xs sm:text-[13px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden leading-relaxed py-0.5"
          />
        </div>

        {/* Circular Send Action Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-emerald-600 dark:text-white flex items-center justify-center shrink-0 hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          title="Send (Enter)"
        >
          <SendHorizontal className="w-4 h-4 ml-0.5 stroke-[2.2]" />
        </button>
      </div>

      <div className="flex justify-between items-center px-4 mt-1.5 text-[10px] font-mono text-slate-400">
        <span>return to send, shift+return for newline</span>
        {text.length > 1500 && (
          <span className="tabular-nums">{2000 - text.length} left</span>
        )}
      </div>
    </div>
  );
}

MessageInput.propTypes = {
  teamId: PropTypes.string.isRequired,
  activeConversation: PropTypes.object.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
