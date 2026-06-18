import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MessageSquare, CornerDownRight, Edit2, Trash2, Send, X, ShieldAlert } from 'lucide-react';
import { getImageUrl, handleImageError } from '../utils/imageHelper';

const CommentsSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comments/${postId}`);
      setComments(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading comments', 'error');
    }
  };

  const handleCreateComment = async (e, parentId = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/comments', {
        content,
        post: postId,
        parentComment: parentId,
      });

      // Show success toast
      showToast('Comment posted!', 'success');

      // Update state locally or refetch
      if (parentId) {
        setReplyContent('');
        setReplyToId(null);
      } else {
        setNewComment('');
      }
      fetchComments();
    } catch (err) {
      console.error(err);
      showToast('Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (e, id) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    try {
      await api.put(`/comments/${id}`, { content: editContent });
      showToast('Comment updated!', 'success');
      setEditingId(null);
      setEditContent('');
      fetchComments();
    } catch (err) {
      console.error(err);
      showToast('Failed to update comment', 'error');
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment? This will delete all its replies as well.')) return;

    try {
      // Endpoint is same for admin or user (controllers handle verification)
      await api.delete(`/comments/${id}`);
      showToast('Comment deleted', 'success');
      fetchComments();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete comment', 'error');
    }
  };

  // Convert flat comments list to a tree
  const buildTree = (list) => {
    const map = {};
    const roots = [];

    // First pass: map everything and attach empty children array
    list.forEach((item) => {
      map[item._id] = { ...item, children: [] };
    });

    // Second pass: nest comments under their parent
    list.forEach((item) => {
      const mapped = map[item._id];
      if (item.parentComment && map[item.parentComment]) {
        map[item.parentComment].children.push(mapped);
      } else if (!item.parentComment) {
        roots.push(mapped);
      }
    });

    return roots;
  };

  const commentTree = buildTree(comments);

  // Recursive Comment Node Component
  const CommentNode = ({ comment, depth = 0 }) => {
    const isAuthor = user && user._id === comment.author._id;
    const isAdmin = user && user.role === 'admin';
    const isReplying = replyToId === comment._id;
    const isEditing = editingId === comment._id;

    const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div className="space-y-4">
        <div
          className={`p-4 rounded-2xl glass-card transition-all ${
            depth > 0 ? 'ml-6 md:ml-10 border-l-2 border-brand-500/20' : ''
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <img
                src={getImageUrl(comment.author.avatar, 'avatar')}
                alt={comment.author.name}
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => handleImageError(e, 'avatar')}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    {comment.author.name}
                  </span>
                  {comment.author.role === 'admin' && (
                    <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/20 flex items-center gap-0.5">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400">{formattedDate}</span>
              </div>
            </div>

            {/* Actions (Edit / Delete) */}
            <div className="flex items-center gap-1">
              {user && (
                <button
                  onClick={() => {
                    setReplyToId(isReplying ? null : comment._id);
                    setReplyContent('');
                    setEditingId(null);
                  }}
                  className="text-xs font-semibold text-brand-500 hover:text-brand-600 px-2 py-1 rounded-lg hover:bg-brand-500/5 transition-colors"
                >
                  Reply
                </button>
              )}
              {isAuthor && !isEditing && (
                <button
                  onClick={() => {
                    setEditingId(comment._id);
                    setEditContent(comment.content);
                    setReplyToId(null);
                  }}
                  className="text-slate-400 hover:text-brand-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Edit comment"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {(isAuthor || isAdmin) && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Body content */}
          <div className="mt-2.5 pl-9">
            {isEditing ? (
              <form onSubmit={(e) => handleUpdateComment(e, comment._id)} className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
                  rows={2}
                  required
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                {comment.content}
              </p>
            )}
          </div>
        </div>

        {/* Inline Reply Form */}
        {isReplying && (
          <form
            onSubmit={(e) => handleCreateComment(e, comment._id)}
            className={`flex items-start gap-2 ${depth > 0 ? 'ml-16 md:ml-20' : 'ml-6 md:ml-10'}`}
          >
            <CornerDownRight className="w-5 h-5 text-slate-400 mt-2 flex-shrink-0" />
            <div className="flex-grow space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${comment.author.name}...`}
                className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
                rows={2}
                required
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3 h-3" /> Post Reply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyToId(null);
                    setReplyContent('');
                  }}
                  className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Recursive Children Replies */}
        {comment.children && comment.children.length > 0 && (
          <div className="space-y-4">
            {comment.children.map((child) => (
              <CommentNode key={child._id} comment={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <MessageSquare className="w-5 h-5 text-brand-500" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Main Comment Box */}
      {user ? (
        <form onSubmit={(e) => handleCreateComment(e, null)} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts on this article?"
            className="w-full text-sm p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
            rows={3}
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-brand-500/10 flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-4 h-4" /> Share Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl text-center">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Please{' '}
            <Link to="/login" className="text-brand-500 font-bold hover:underline">
              login
            </Link>{' '}
            or{' '}
            <Link to="/register" className="text-brand-500 font-bold hover:underline">
              register
            </Link>{' '}
            to participate in the discussion.
          </p>
        </div>
      )}

      {/* Comment Trees List */}
      <div className="space-y-6 pt-4">
        {commentTree.length > 0 ? (
          commentTree.map((rootComment) => (
            <CommentNode key={rootComment._id} comment={rootComment} />
          ))
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-6">
            No comments yet. Be the first to start the conversation!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
