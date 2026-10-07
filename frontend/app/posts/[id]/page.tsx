'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CommentSection from '@/components/CommentSection';
import EditPostModal from '@/components/EditPostModal';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Post } from '@/types/blog';
import { ArrowLeft, Calendar, User, Edit3, Trash2 } from 'lucide-react';

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const postId = Number(resolvedParams.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch story details with comments (Bonus 4)
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery<Post>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const res = await api.get(`/api/posts/${postId}`);
      return res.data;
    },
    enabled: !isNaN(postId),
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      await api.delete(`/api/posts/${postId}`);
      toast.success('Story deleted successfully', { icon: '🗑️' });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      router.push('/');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete story');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3EDE2]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ECE2D2]/70 hover:bg-[#DFD0BB] text-xs font-bold uppercase tracking-wider text-[#1F1B18] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="editorial-card rounded-3xl p-8 bg-[#FBF9F5] animate-pulse space-y-6">
            <div className="h-72 bg-[#ECE2D2] rounded-2xl" />
            <div className="h-8 bg-[#ECE2D2] rounded w-3/4" />
            <div className="h-4 bg-[#ECE2D2] rounded w-1/3" />
            <div className="space-y-2">
              <div className="h-4 bg-[#ECE2D2] rounded w-full" />
              <div className="h-4 bg-[#ECE2D2] rounded w-5/6" />
              <div className="h-4 bg-[#ECE2D2] rounded w-4/6" />
            </div>
          </div>
        ) : isError || !post ? (
          <div className="editorial-card rounded-2xl p-12 text-center bg-[#FBF9F5]">
            <h2 className="text-xl font-bold text-[#1F1B18] mb-2">
              Story Not Found
            </h2>
            <p className="text-xs text-[#7C756C] mb-6">
              This story might have been removed or the link is invalid.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1F1B18] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider hover:bg-[#9A533C]"
            >
              Return to Home
            </Link>
          </div>
        ) : (
          <article className="editorial-card rounded-3xl overflow-hidden bg-[#FBF9F5] border border-[#B59F7F]/30 shadow-xl p-6 sm:p-10">
            {/* Story Cover Image */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-8 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  post.imageUrl ||
                  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
                }
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-lg bg-[#9A533C]/90 backdrop-blur-md text-[#FBF9F5] text-xs font-bold uppercase tracking-widest">
                {post.category || 'Architecture'}
              </div>
            </div>

            {/* Meta Information & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#B59F7F]/20 mb-6">
              <div className="flex items-center gap-4 text-xs text-[#7C756C]">
                <span className="inline-flex items-center gap-1.5 font-bold text-[#1F1B18]">
                  <User className="w-4 h-4 text-[#9A533C]" />
                  {post.author}
                </span>
                <span>&middot;</span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Edit & Delete Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#B59F7F]/40 text-xs font-bold text-[#1F1B18] hover:bg-[#ECE2D2] transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#9A533C]" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1F1B18] mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Content */}
            <div className="text-base sm:text-lg text-[#3E3832] leading-relaxed font-normal whitespace-pre-line">
              {post.content}
            </div>

            {/* Comment Section (Bonus 4) */}
            <CommentSection
              postId={post.id}
              comments={post.comments || []}
            />

            {/* Edit Modal */}
            <EditPostModal
              post={post}
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
            />
          </article>
        )}
      </main>
    </div>
  );
}
