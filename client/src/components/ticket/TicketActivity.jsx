import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, MessageSquare, Trash2, Edit2, Activity, CornerDownRight, MessageCircle, Smile } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { socket } from '../../api/socket';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';
import { useTicketComments, useTicketActivities, useAddComment, useDeleteComment, useUpdateComment } from '../../hooks/useTickets';
import { ticketKeys } from '../../api/queryKeys';

const TicketActivity = ({ ticketId, teamId }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading: isCommentsLoading } = useTicketComments(ticketId);
  const { data: activities = [], isLoading: isActivitiesLoading } = useTicketActivities(ticketId);
  const isLoading = isCommentsLoading && isActivitiesLoading;
  const addCommentMutation = useAddComment(ticketId, teamId);
  const deleteCommentMutation = useDeleteComment(ticketId, teamId);
  const updateCommentMutation = useUpdateComment(ticketId);

  const [newComment, setNewComment] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const commentInputRef = useRef(null);
  
  // Reply State
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const replyInputRef = useRef(null);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef(null);

  const isSubmitting = addCommentMutation.isPending && !replyingTo;
  const isSubmittingReply = addCommentMutation.isPending && !!replyingTo;

  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'COMMENTS'
  const [fetchingReplies, setFetchingReplies] = useState({});

  // Auto-focus reply input when opened
  useEffect(() => {
    if (replyingTo && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyingTo]);

  // Auto-focus edit input when opened and move cursor to the end
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      const length = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(length, length);
    }
  }, [editingId]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_ticket', ticketId);

    const handleReceiveComment = (newCommentData) => {
      queryClient.setQueryData(ticketKeys.comments(ticketId), (prev = []) => {
        if (prev.some(c => c._id === newCommentData._id)) return prev;
        
        if (!newCommentData.parentCommentId) {
          return [newCommentData, ...prev]; // Prepend to top since input is at the top (newest first)
        }
        
        return prev.map(c => {
          if (c._id === newCommentData.parentCommentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newCommentData],
              replyCount: (c.replyCount || 0) + 1
            };
          }
          return c;
        });
      });
    };

    const handleUpdateComment = (updatedData) => {
      queryClient.setQueryData(ticketKeys.comments(ticketId), (prev = []) =>
        prev.map(c => {
          if (c._id === updatedData._id) {
            return { ...c, text: updatedData.text, isEdited: true };
          }
          if (c.replies && c.replies.some(r => r._id === updatedData._id)) {
            return {
              ...c,
              replies: c.replies.map(r =>
                r._id === updatedData._id ? { ...r, text: updatedData.text, isEdited: true } : r
              ),
            };
          }
          return c;
        })
      );
    };

    const handleDeleteComment = (deletedData) => {
      queryClient.setQueryData(ticketKeys.comments(ticketId), (prev = []) => {
        const filtered = prev.filter(c => c._id !== deletedData._id);
        return filtered.map(c => {
          if (c.replies && c.replies.some(r => r._id === deletedData._id)) {
            return {
              ...c,
              replies: c.replies.filter(r => r._id !== deletedData._id),
              replyCount: Math.max(0, (c.replyCount || 1) - 1),
            };
          }
          return c;
        });
      });
    };

    const handleReceiveActivity = (newActivity) => {
      queryClient.setQueryData(ticketKeys.activities(ticketId), (prev = []) => {
        if (prev.some(a => a._id === newActivity._id)) return prev;
        return [newActivity, ...prev];
      });
    };

    socket.on('receive_comment', handleReceiveComment);
    socket.on('update_comment', handleUpdateComment);
    socket.on('delete_comment', handleDeleteComment);
    socket.on('receive_activity', handleReceiveActivity);

    return () => {
      socket.emit('leave_ticket', ticketId);
      socket.off('receive_comment', handleReceiveComment);
      socket.off('update_comment', handleUpdateComment);
      socket.off('delete_comment', handleDeleteComment);
      socket.off('receive_activity', handleReceiveActivity);
    };
  }, [ticketId, queryClient]);

  const formatActivityEvent = (act) => {
    const details = act.details || {};

    switch (act.action) {
      case 'TICKET_CREATED':
        return 'created this task';
      case 'TICKET_STATUS_UPDATED': {
        const from = (details.from || 'TODO').replace(/_/g, ' ');
        const to = (details.to || 'IN_PROGRESS').replace(/_/g, ' ');
        return `changed status from ${from} to ${to}`;
      }
      case 'TICKET_ASSIGNED': {
        if (!details.assignedTo || details.assignedTo === 'Unassigned') {
          return 'unassigned this task';
        }
        return `assigned this task to ${details.assignedTo}`;
      }
      case 'TICKET_UPDATED': {
        if (details.dueDate !== undefined) {
          if (details.dueDate) {
            const dateStr = new Date(details.dueDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            return `set due date to ${dateStr}`;
          }
          return 'cleared the due date';
        }
        if (details.priority) {
          return `changed priority to ${details.priority}`;
        }
        if (details.title) {
          return `renamed task to "${details.title}"`;
        }
        return 'updated task details';
      }
      case 'TICKET_ATTACHMENTS_ADDED': {
        const count = details.count || 1;
        return `attached ${count} file${count > 1 ? 's' : ''}`;
      }
      case 'TICKET_ATTACHMENT_DELETED': {
        const name = details.attachmentName ? `"${details.attachmentName}"` : 'an attachment';
        return `removed attachment ${name}`;
      }
      default:
        return act.action.toLowerCase().replace(/_/g, ' ');
    }
  };
  const getActivityCategory = (act) => {
    const action = act.action;
    const details = act.details || {};
    if (
      action === 'TICKET_STATUS_UPDATED' ||
      (action === 'TICKET_UPDATED' && (details.priority !== undefined || details.status !== undefined))
    ) {
      return 'STATUS';
    }
    if (action === 'TICKET_ASSIGNED') {
      return 'ASSIGNMENTS';
    }
    if (action === 'TICKET_ATTACHMENTS_ADDED' || action === 'TICKET_ATTACHMENT_DELETED') {
      return 'ATTACHMENTS';
    }
    return 'OTHER';
  };

  const FILTER_OPTIONS = [
    { id: 'ALL', label: 'All' },
    { id: 'COMMENTS', label: 'Comments' },
    { id: 'STATUS', label: 'Status & Priority' },
    { id: 'ASSIGNMENTS', label: 'Assignments' },
    { id: 'ATTACHMENTS', label: 'Attachments' },
  ];

  const combinedTimeline = useMemo(() => {
    const commentItems = comments.map((c) => ({
      ...c,
      isComment: true,
      category: 'COMMENTS',
      createdAtDate: new Date(c.createdAt),
    }));

    const activityItems = activities.map((a) => ({
      _id: a._id,
      isComment: false,
      category: getActivityCategory(a),
      type: 'system',
      actor: a.userId,
      text: formatActivityEvent(a),
      createdAt: a.createdAt,
      createdAtDate: new Date(a.createdAt),
    }));

    return [...commentItems, ...activityItems].sort(
      (a, b) => b.createdAtDate - a.createdAtDate
    );
  }, [comments, activities]);

  const filterCounts = useMemo(() => {
    const counts = {
      ALL: combinedTimeline.length,
      COMMENTS: 0,
      STATUS: 0,
      ASSIGNMENTS: 0,
      ATTACHMENTS: 0,
    };
    for (const item of combinedTimeline) {
      if (item.isComment && item.type !== 'system') {
        counts.COMMENTS += 1;
      } else if (item.category && counts[item.category] !== undefined) {
        counts[item.category] += 1;
      }
    }
    return counts;
  }, [combinedTimeline]);

  const displayedTimeline = useMemo(() => {
    if (filterMode === 'ALL') return combinedTimeline;
    if (filterMode === 'COMMENTS') {
      return combinedTimeline.filter((item) => item.isComment && item.type !== 'system');
    }
    return combinedTimeline.filter((item) => item.category === filterMode);
  }, [combinedTimeline, filterMode]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      await addCommentMutation.mutateAsync({ text: newComment.trim() });
      setNewComment('');
      setIsInputFocused(false);
    } catch (err) {
      // Error handled in mutation
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim() || isSubmittingReply) return;
    
    try {
      await addCommentMutation.mutateAsync({ text: replyText.trim(), parentId });
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      // Error handled in mutation
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch (err) {
      // Error handled in mutation
    }
  };

  const startEditing = (item) => {
    setEditingId(item._id);
    setEditText(item.text);
    setReplyingTo(null);
    setReplyText('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleEditSubmit = async (commentId) => {
    if (!editText.trim() || updateCommentMutation.isPending) return;

    try {
      await updateCommentMutation.mutateAsync({ commentId, text: editText.trim() });
      setEditingId(null);
      setEditText('');
    } catch (err) {
      // Error handled in mutation
    }
  };

  const handleFetchReplies = async (commentId) => {
    setFetchingReplies(prev => ({ ...prev, [commentId]: true }));
    try {
      const res = await api.get(`/comments/${commentId}/replies`);
      const thread = res.data.data.thread;
      
      queryClient.setQueryData(ticketKeys.comments(ticketId), (prev = []) =>
        prev.map(c => {
          if (c._id === commentId) {
            return {
              ...c,
              replies: thread.replies,
              isFullyExpanded: true
            };
          }
          return c;
        })
      );
    } catch (err) {
      toast.error('Failed to load full reply thread');
    } finally {
      setFetchingReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(@[A-Za-z0-9._-]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@') && part.length > 1) {
        return (
          <span
            key={index}
            className="font-semibold text-slate-900 bg-slate-100/90 px-1.5 py-0.5 rounded text-[13px] border border-slate-200/80"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (isLoading && comments.length === 0) {
    return (
      <div className="flex flex-col gap-6 mt-2 pt-8 border-t border-slate-200/60 w-full max-w-4xl animate-pulse">
        <h3 className="text-lg font-semibold text-slate-900">Activity Thread</h3>
        <div className="flex flex-col gap-8 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                {i === 1 && <div className="w-0.5 h-full bg-slate-100 my-1"></div>}
              </div>
              <div className="flex-1 flex flex-col gap-2 pt-1 pb-4">
                <div className="flex gap-2">
                  <div className="w-24 h-4 bg-slate-200 rounded"></div>
                  <div className="w-16 h-4 bg-slate-100 rounded"></div>
                </div>
                <div className="w-full h-16 bg-slate-100 rounded-xl border border-slate-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-2 pt-8 border-t border-slate-200/60 w-full max-w-4xl pb-safe relative">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <h3 className="text-lg font-semibold text-slate-900">Activity Thread</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-mono tabular-nums">
            {displayedTimeline.length}
          </span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
          {FILTER_OPTIONS.map((opt) => {
            const count = filterCounts[opt.id] ?? 0;
            const isActive = filterMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilterMode(opt.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{opt.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums ${
                      isActive
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-slate-200/60 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* YouTube-Style Comment Input Box (At Top) */}
      <div className="flex gap-3 md:gap-4 mb-8">
        {/* User Avatar */}
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 mt-0.5 border border-slate-300/50 shadow-sm">
          {user?.image || user?.avatar ? (
            <img src={user.image || user.avatar} alt="You" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Input Field & YouTube-style Underline */}
        <div className="flex-1 flex flex-col">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                ref={commentInputRef}
                value={newComment}
                onFocus={() => setIsInputFocused(true)}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={isInputFocused || newComment.length > 0 ? 2 : 1}
                className={`w-full bg-transparent text-[14px] md:text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none resize-none transition-all py-1 ${
                  isInputFocused || newComment.length > 0
                    ? 'border-b-2 border-slate-900 min-h-[56px]'
                    : 'border-b border-slate-300 min-h-[36px]'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            {/* Action Row (Appears when focused or has text, exactly like YouTube) */}
            {(isInputFocused || newComment.length > 0) && (
              <div className="flex items-center justify-between mt-2 pt-1 animate-in fade-in duration-150">
                <div className="flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  <Smile className="w-5 h-5 cursor-pointer" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewComment('');
                      setIsInputFocused(false);
                    }}
                    disabled={isSubmitting}
                    className="px-3.5 py-1.5 text-xs md:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-full font-medium text-xs md:text-sm hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {isSubmitting ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Chronological Thread (Top to Bottom) */}
      <div className="flex flex-col mb-8">
        {displayedTimeline.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {filterMode === 'COMMENTS' && 'No comments yet'}
              {filterMode === 'STATUS' && 'No status or priority changes recorded'}
              {filterMode === 'ASSIGNMENTS' && 'No assignment changes recorded'}
              {filterMode === 'ATTACHMENTS' && 'No attachment activity recorded'}
              {filterMode === 'ALL' && 'No activity yet'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {filterMode === 'COMMENTS'
                ? 'Be the first to share an update or leave a comment above.'
                : 'Activities matching this filter will appear here.'}
            </p>
          </div>
        ) : (
          displayedTimeline.map((item, index) => {
            // SYSTEM AUDIT EVENT
            if (item.type === 'system' || !item.isComment) {
              return (
                <div key={item._id} className="flex gap-3 md:gap-4 items-center group py-2 relative">
                  {/* Timeline Axis (Subtle Dot + Vertical Line) */}
                  <div className="w-8 md:w-10 flex flex-col items-center shrink-0 self-stretch relative">
                    <div className="w-2 h-2 rounded-full bg-slate-300 ring-4 ring-[#F8F9FA] mt-1.5 z-10"></div>
                    {index !== displayedTimeline.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200/60 absolute top-2"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex items-center justify-between min-w-0 pb-1 pt-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap text-[13px] text-slate-600">
                      <span className="font-semibold text-slate-800">{item.actor?.name || 'A teammate'}</span>
                      <span className="text-slate-500">{item.text}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0 ml-3">
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              );
            }

            // USER COMMENT
            const comment = item;
            const hasReplies = comment.replyCount > 0;
            const isReplying = replyingTo === comment._id;
            const hasConnectorLine = hasReplies || isReplying || index !== displayedTimeline.length - 1;

            return (
              <div key={comment._id} className="flex gap-3 md:gap-4 items-start group">
                
                {/* Timeline Axis (Avatar + Vertical Line) */}
                <div className="w-8 md:w-10 flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm md:text-base shadow-sm shrink-0">
                    {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  {/* Vertical structural line for nested replies or timeline flow */}
                  {hasConnectorLine && <div className="w-0.5 h-full bg-slate-200/60 mt-2 rounded-full"></div>}
                </div>

                {/* Content Block */}
                <div className="flex-1 min-w-0 pb-6 pt-0.5">
                  
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-slate-900 text-[14px] md:text-[15px] truncate">{comment.author?.name || 'Unknown User'}</span>
                    <span className="text-[11px] md:text-xs text-slate-500 shrink-0">{formatTime(comment.createdAt)}</span>
                    {comment.isEdited && (
                      <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                        (edited)
                      </span>
                    )}
                    
                    {(user?._id === comment.authorId || user?._id === comment.author?._id) && (
                      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(comment)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Comment"
                        >
                          <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Main Comment Text or Edit Form */}
                  {editingId === comment._id ? (
                    <div className="mt-2 flex flex-col gap-2 animate-in fade-in duration-150">
                      <textarea
                        ref={editInputRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full min-h-[75px] bg-white border border-slate-300 rounded-lg p-3 text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/50 focus:border-slate-900 transition-all resize-none shadow-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleEditSubmit(comment._id);
                          } else if (e.key === 'Escape') {
                            cancelEditing();
                          }
                        }}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditSubmit(comment._id)}
                          disabled={updateCommentMutation.isPending || !editText.trim()}
                          className="px-3.5 py-1 bg-slate-900 text-white rounded-md font-medium text-xs flex items-center gap-1.5 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[14px] md:text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {renderFormattedText(comment.text)}
                    </div>
                  )}

                  {/* Actions (Reply Button) */}
                  {editingId !== comment._id && (
                    <div className="mt-2 flex items-center gap-4">
                      <button 
                        onClick={() => {
                          setReplyingTo(isReplying ? null : comment._id);
                          setReplyText('');
                          if (editingId) cancelEditing();
                        }}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${isReplying ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Reply
                      </button>
                    </div>
                  )}

                  {/* Nested Replies (Linear Style) */}
                  {hasReplies && (
                    <div className="mt-4 flex flex-col gap-4">
                      {comment.replies?.map(reply => (
                        <div key={reply._id} className="flex gap-2.5 items-start group/reply">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-200 overflow-hidden shrink-0 mt-0.5 shadow-sm">
                            {reply.author?.avatar ? (
                               <img src={reply.author.avatar} className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[9px] md:text-[10px]">
                                 {reply.author?.name ? reply.author.name.charAt(0).toUpperCase() : 'R'}
                               </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-slate-900 text-[13px]">{reply.author?.name || 'Unknown User'}</span>
                              <span className="text-[10px] text-slate-500">{formatTime(reply.createdAt)}</span>
                              {reply.isEdited && (
                                <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                  (edited)
                                </span>
                              )}
                              
                              {(user?._id === reply.authorId || user?._id === reply.author?._id) && (
                                <div className="ml-auto opacity-0 group-hover/reply:opacity-100 flex items-center gap-1 transition-opacity">
                                  <button
                                    onClick={() => startEditing(reply)}
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                    title="Edit Reply"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(reply._id)}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete Reply"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                            {editingId === reply._id ? (
                              <div className="mt-1.5 flex flex-col gap-2 animate-in fade-in duration-150">
                                <textarea
                                  ref={editInputRef}
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full min-h-[60px] bg-white border border-slate-300 rounded-lg p-2.5 text-[13.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/50 focus:border-slate-900 transition-all resize-none shadow-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleEditSubmit(reply._id);
                                    } else if (e.key === 'Escape') {
                                      cancelEditing();
                                    }
                                  }}
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="px-2.5 py-0.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEditSubmit(reply._id)}
                                    disabled={updateCommentMutation.isPending || !editText.trim()}
                                    className="px-3 py-0.5 bg-slate-900 text-white rounded font-medium text-xs flex items-center gap-1 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                                  >
                                    {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-[13.5px] md:text-[14px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {renderFormattedText(reply.text)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {comment.replyCount > 2 && !comment.isFullyExpanded && (
                        <button 
                          onClick={() => handleFetchReplies(comment._id)}
                          disabled={fetchingReplies[comment._id]}
                          className="text-[13px] font-medium text-slate-900 hover:text-slate-800 self-start disabled:opacity-50 mt-1"
                        >
                          {fetchingReplies[comment._id] ? 'Loading...' : `View all ${comment.replyCount} replies`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Inline Reply Input Box */}
                  {isReplying && (
                    <div className="mt-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-200 overflow-hidden shrink-0 mt-1 shadow-sm">
                        {user?.image || user?.avatar ? (
                          <img src={user.image || user.avatar} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-800 font-bold text-[10px]">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <textarea
                          ref={replyInputRef}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.author?.name?.split(' ')[0] || 'comment'}...`}
                          className="w-full min-h-[80px] bg-white border border-slate-300 rounded-lg p-3 text-[14px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/50 focus:border-slate-900 transition-all resize-none shadow-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleReplySubmit(comment._id);
                            }
                          }}
                        />
                        <div className="absolute bottom-2 right-2 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReplySubmit(comment._id)}
                            disabled={isSubmittingReply || !replyText.trim()}
                            className="px-3 py-1 bg-slate-900 text-white rounded-md font-medium text-xs flex items-center gap-1.5 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            {isSubmittingReply ? 'Replying...' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  );
};

export default TicketActivity;
