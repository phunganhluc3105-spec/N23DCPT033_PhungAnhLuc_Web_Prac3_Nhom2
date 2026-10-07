'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Save, Edit } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Post, UpdatePostInput } from '@/types/blog';

interface EditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

function EditPostForm({ post, onClose }: { post: Post; onClose: () => void }) {
  const [title, setTitle] = useState(post.title || '');
  const [author, setAuthor] = useState(post.author || '');
  const [category, setCategory] = useState(post.category || 'Architecture');
  const [imageUrl, setImageUrl] = useState(post.imageUrl || '');
  const [content, setContent] = useState(post.content || '');

  const queryClient = useQueryClient();

  const updatePostMutation = useMutation({
    mutationFn: async (payload: UpdatePostInput) => {
      const response = await api.put(`/api/posts/${post.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !author.trim() || !content.trim()) {
      toast.error('Please fill in all required fields!');
      return;
    }

    const payload: UpdatePostInput = {
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      imageUrl: imageUrl.trim() || post.imageUrl,
      content: content.trim(),
    };

    toast.promise(
      updatePostMutation.mutateAsync(payload),
      {
        loading: 'Updating story...',
        success: 'Story updated successfully!',
        error: (err) => err?.response?.data?.error || 'Failed to update story!',
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="editorial-card w-full max-w-2xl rounded-2xl bg-[#FBF9F5] border border-[#B59F7F]/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#B59F7F]/20 bg-[#F5F0E6]/50">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-[#ECE2D2] text-[#9A533C]">
              <Edit className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1F1B18]">
                Edit Story
              </h2>
              <p className="text-xs text-[#7C756C]">Story ID #{post.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7C756C] hover:text-[#1F1B18] hover:bg-[#ECE2D2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5B554E] mb-1.5">
                Story Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5B554E] mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5B554E] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C]"
              >
                <option value="Architecture">Architecture</option>
                <option value="Interior">Interior Design</option>
                <option value="Nordic Spaces">Nordic Spaces</option>
                <option value="Editorial Journal">Editorial Journal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5B554E] mb-1.5">
                Cover Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5B554E] mb-1.5">
              Story Content
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C] resize-y"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#B59F7F]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#B59F7F]/40 text-xs font-bold uppercase tracking-wider text-[#5B554E] hover:bg-[#ECE2D2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatePostMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1F1B18] hover:bg-[#9A533C] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditPostModal({ post, isOpen, onClose }: EditPostModalProps) {
  if (!isOpen || !post) return null;
  return <EditPostForm key={post.id} post={post} onClose={onClose} />;
}
