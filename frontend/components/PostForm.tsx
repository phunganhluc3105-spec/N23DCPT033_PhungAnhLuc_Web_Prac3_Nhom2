'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Send, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePostInput } from '@/types/blog';

interface PostFormProps {
  onClose?: () => void;
}

const PRESET_IMAGES = [
  { label: 'Nordic Villa', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Warm Interior', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Modern Estate', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Brutalist Curves', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' },
];

export default function PostForm({ onClose }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Architecture');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [content, setContent] = useState('');

  const queryClient = useQueryClient();

  // TanStack Query useMutation (Bonus 2)
  const createPostMutation = useMutation({
    mutationFn: async (payload: CreatePostInput) => {
      const response = await api.post('/api/posts', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setTitle('');
      setAuthor('');
      setContent('');
      if (onClose) onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !author.trim() || !content.trim()) {
      toast.error('Please provide a title, author, and content!');
      return;
    }

    const payload: CreatePostInput = {
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      imageUrl: imageUrl.trim() || PRESET_IMAGES[0].url,
      content: content.trim(),
    };

    toast.promise(
      createPostMutation.mutateAsync(payload),
      {
        loading: 'Publishing story to server...',
        success: 'Story published successfully!',
        error: (err) => err?.response?.data?.error || 'Failed to publish story!',
      }
    );
  };

  return (
    <div className="editorial-card rounded-2xl p-6 sm:p-8 bg-[#FBF9F5] border border-[#B59F7F]/30 relative">
      {/* Header Form */}
      <div className="flex items-center justify-between pb-5 border-b border-[#B59F7F]/20 mb-6">
        <div>
          <span className="editorial-badge px-2.5 py-1 rounded-md inline-block mb-1">
            Story Composer
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B18]">
            Publish New Story
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7C756C] hover:text-[#1F1B18] hover:bg-[#ECE2D2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5B554E] mb-2">
              Story Title <span className="text-[#9A533C]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Explore North: The Architectural Horizon"
              className="w-full px-4 py-3 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C] focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5B554E] mb-2">
              Author <span className="text-[#9A533C]">*</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Phung Anh Luc or your name"
              className="w-full px-4 py-3 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C] focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5B554E] mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C] focus:border-transparent transition-all"
            >
              <option value="Architecture">Architecture</option>
              <option value="Interior">Interior Design</option>
              <option value="Nordic Spaces">Nordic Spaces</option>
              <option value="Editorial Journal">Editorial Journal</option>
            </select>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5B554E] mb-2 flex items-center justify-between">
              <span>Cover Image URL</span>
              <span className="text-[11px] font-normal text-[#7C756C] lowercase">or choose a preset below</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C] focus:border-transparent transition-all"
              />
              <ImageIcon className="w-4 h-4 text-[#7C756C] absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        {/* Preset Photos */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-medium text-[#7C756C]">
            <Sparkles className="w-3.5 h-3.5 text-[#9A533C]" />
            <span>Curated architectural photography presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_IMAGES.map((img) => (
              <button
                type="button"
                key={img.label}
                onClick={() => setImageUrl(img.url)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  imageUrl === img.url
                    ? 'bg-[#9A533C] text-white border-[#9A533C]'
                    : 'bg-[#ECE2D2]/60 text-[#1F1B18] border-[#B59F7F]/30 hover:border-[#9A533C]'
                }`}
              >
                {img.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5B554E] mb-2">
            Story Content <span className="text-[#9A533C]">*</span>
          </label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts on design, material palettes, or spatial experiences..."
            className="w-full px-4 py-3 rounded-xl bg-[#F5F0E6]/60 border border-[#B59F7F]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9A533C] focus:border-transparent transition-all resize-y"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#B59F7F]/20">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#B59F7F]/40 text-xs font-bold uppercase tracking-wider text-[#5B554E] hover:bg-[#ECE2D2] transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={createPostMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1F1B18] hover:bg-[#9A533C] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{createPostMutation.isPending ? 'Publishing...' : 'Publish Story'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
