'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Comment } from '@/types/blog';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
}

export default function CommentSection({ postId, comments }: CommentSectionProps) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  // Mutation to add comment
  const addCommentMutation = useMutation({
    mutationFn: async (payload: { author: string; content: string }) => {
      const response = await api.post(`/api/posts/${postId}/comments`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setAuthor('');
      setContent('');
    },
  });

  // Mutation to delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await api.delete(`/api/comments/${commentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) {
      toast.error('Please enter your name and comment message!');
      return;
    }

    toast.promise(
      addCommentMutation.mutateAsync({ author: author.trim(), content: content.trim() }),
      {
        loading: 'Posting comment...',
        success: 'Comment posted successfully!',
        error: 'Failed to post comment',
      }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    toast.promise(
      deleteCommentMutation.mutateAsync(commentId),
      {
        loading: 'Deleting comment...',
        success: 'Comment deleted',
        error: 'Failed to delete comment',
      }
    );
  };

  return (
    <section className="mt-12 pt-8 border-t border-[#B59F7F]/30">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-[#9A533C]" />
        <h3 className="text-xl font-bold tracking-tight text-[#1F1B18]">
          Discussions ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="editorial-card rounded-2xl p-5 mb-8 bg-[#FBF9F5] border border-[#B59F7F]/30">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="sm:col-span-1">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your Name *"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C]"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your perspective, architectural insights, or questions..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C]"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={addCommentMutation.isPending}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1F1B18] hover:bg-[#9A533C] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>{addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#7C756C] italic bg-[#F5F0E6]/30 rounded-2xl border border-dashed border-[#B59F7F]/30">
            No comments yet. Be the first to share your perspective!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-xl bg-[#FBF9F5] border border-[#B59F7F]/20 flex items-start justify-between gap-4 transition-all hover:border-[#B59F7F]/40"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ECE2D2] text-[#9A533C] flex items-center justify-center font-bold text-xs shrink-0">
                  {comment.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#1F1B18]">{comment.author}</span>
                    <span className="text-[11px] text-[#7C756C]">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-[#5B554E] leading-relaxed">{comment.content}</p>
                </div>
              </div>

              {/* Delete Comment Button */}
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="p-1 rounded-lg text-[#7C756C] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                title="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
