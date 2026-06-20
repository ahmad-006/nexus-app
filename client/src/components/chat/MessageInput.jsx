import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ArrowUp } from 'lucide-react';
import { socket } from '../../api/socket';

export default function MessageInput({
  teamId,
  activeConversation,
  onSendMessage,
  placeholder = 'Write a message...',
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

    // Auto-adjust textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
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
    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-2 focus-within:border-slate-400 dark:focus-within:border-slate-600 transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={2000}
          className="flex-1 max-h-36 resize-none bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden leading-relaxed"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="shrink-0 p-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          title="Send (Enter)"
        >
          <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
      <div className="flex justify-between items-center px-1 mt-1.5 text-[10px] font-mono text-slate-400">
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
