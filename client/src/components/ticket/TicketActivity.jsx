import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Trash2, Edit2, CornerDownRight, Activity } from 'lucide-react';
import api from '../../api/axios';
import { socket } from '../../api/socket';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

const TicketActivity = ({ ticketId }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'COMMENTS'
  const [fetchingReplies, setFetchingReplies] = useState({});

  useEffect(() => {
    let mounted = true;
    
    if (!socket.connected) {
      socket.connect();
    }

    const fetchComments = async () => {
      try {
        const res = await api.get(`/tickets/${ticketId}/comments`);
        if (mounted) {
          setComments(res.data.data.comments);
        }
      } catch (err) {
        if (mounted) toast.error('Failed to load comments');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchComments();
    socket.emit('join_ticket', ticketId);

    const handleReceiveComment = (newCommentData) => {
      setComments(prev => {
        if (prev.some(c => c._id === newCommentData._id)) return prev;
        
        if (!newCommentData.parentCommentId) {
          return [newCommentData, ...prev];
        }
        
        return prev.map(c => {
          if (c._id === newCommentData.parentCommentId) {
            return {
              ...c,
              replies: [newCommentData, ...(c.replies || [])],
              replyCount: (c.replyCount || 0) + 1
            };
          }
          return c;
        });
      });
    };

    const handleUpdateComment = (updatedData) => {
      setComments(prev => prev.map(c => {
        if (c._id === updatedData._id) {
          return { ...c, text: updatedData.text, isEdited: true };
        }
        return c;
      }));
    };

    const handleDeleteComment = (deletedData) => {
      setComments(prev => prev.filter(c => c._id !== deletedData._id));
    };

    socket.on('receive_comment', handleReceiveComment);
    socket.on('update_comment', handleUpdateComment);
    socket.on('delete_comment', handleDeleteComment);

    return () => {
      mounted = false;
      socket.emit('leave_ticket', ticketId);
      socket.off('receive_comment', handleReceiveComment);
      socket.off('update_comment', handleUpdateComment);
      socket.off('delete_comment', handleDeleteComment);
    };
  }, [ticketId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/tickets/${ticketId}/comments`, { text: newComment.trim() });
      setNewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleFetchReplies = async (commentId) => {
    setFetchingReplies(prev => ({ ...prev, [commentId]: true }));
    try {
      const res = await api.get(`/comments/${commentId}/replies`);
      const thread = res.data.data.thread;
      
      setComments(prev => prev.map(c => {
        if (c._id === commentId) {
          return {
            ...c,
            replies: thread.replies,
            isFullyExpanded: true
          };
        }
        return c;
      }));
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 mt-2 pt-8 border-t border-slate-200/60 w-full max-w-4xl animate-pulse">
        <h3 className="text-lg font-semibold text-slate-900">Activity Thread</h3>
        <div className="flex gap-3 relative">
          <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 mt-1"></div>
          <div className="flex-1 min-h-[100px] bg-slate-100 border border-slate-200 rounded-xl p-4"></div>
        </div>
        <div className="flex flex-col gap-8 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
              <div className="flex-1 flex flex-col gap-2 pt-1">
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

  const filteredComments = comments.filter(c => {
    if (filterMode === 'COMMENTS') return c.type !== 'system';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 mt-2 pt-8 border-t border-slate-200/60 w-full max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Activity Thread</h3>
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filterMode === 'ALL' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterMode('COMMENTS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filterMode === 'COMMENTS' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Comments Only
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 relative">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 mt-1 border border-slate-300/50">
          {user?.avatar ? (
            <img src={user.avatar} alt="You" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full min-h-[100px] bg-white border border-slate-300 rounded-xl p-4 text-[15px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none shadow-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 hidden sm:inline-block">Press Enter to send</span>
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-col gap-6 mt-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No activity yet</p>
            <p className="text-slate-400 text-sm mt-1">Be the first to share an update or leave a comment.</p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            if (comment.type === 'system') {
              return (
                <div key={comment._id} className="flex gap-3 items-center my-2 text-slate-500 ml-8 md:ml-14">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                    <Activity className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="text-[12px] md:text-[13px] font-medium leading-tight">{comment.text}</span>
                  <span className="text-[10px] md:text-[11px] text-slate-400 ml-1 shrink-0 whitespace-nowrap">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>
              );
            }

            return (
              <div key={comment._id} className="flex gap-3 md:gap-4 group">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm md:text-base shadow-sm shrink-0">
                  {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-[13px] md:text-sm truncate">{comment.author?.name || 'Unknown User'}</span>
                    <span className="text-[11px] md:text-xs text-slate-500 shrink-0">{formatTime(comment.createdAt)}</span>
                    {comment.isEdited && <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">(edited)</span>}
                    
                    {user?._id === comment.authorId && (
                      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDelete(comment._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-[14px] md:text-[15px] text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm">
                    {comment.text}
                  </div>

                  {comment.replyCount > 0 && (
                    <div className="mt-2 pl-2 md:pl-4 border-l-2 border-slate-100 flex flex-col gap-2 md:gap-3">
                      {comment.replies?.map(reply => (
                        <div key={reply._id} className="flex gap-2 md:gap-3">
                          <CornerDownRight className="hidden sm:block w-4 h-4 text-slate-300 mt-1 shrink-0" />
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300/50 mt-1 md:mt-0">
                            {reply.author?.avatar ? (
                               <img src={reply.author.avatar} className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] md:text-xs">
                                 {reply.author?.name ? reply.author.name.charAt(0).toUpperCase() : 'R'}
                               </div>
                            )}
                          </div>
                          <div className="flex-1 bg-slate-50 p-2 md:p-3 rounded-lg border border-slate-200/60 text-[13px] md:text-sm text-slate-700">
                            <p className="whitespace-pre-wrap">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                      {comment.replyCount > 2 && !comment.isFullyExpanded && (
                        <button 
                          onClick={() => handleFetchReplies(comment._id)}
                          disabled={fetchingReplies[comment._id]}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 self-start ml-2 md:ml-8 disabled:opacity-50 mt-1"
                        >
                          {fetchingReplies[comment._id] ? 'Loading...' : `View all ${comment.replyCount} replies`}
                        </button>
                      )}
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
