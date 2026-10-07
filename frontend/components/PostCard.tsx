'use client';

import React from 'react';
import Link from 'next/link';
import { Post } from '@/types/blog';
import { MessageSquare, Edit3, Trash2, ArrowUpRight, Calendar, User } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
}

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const commentCount = post.commentsCount ?? (post.comments?.length || 0);

  return (
    <article className="group editorial-card rounded-2xl overflow-hidden flex flex-col justify-between">
      <div>
        {/* Top Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#ECE2D2]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {/* Terracotta Badge floating on image */}
          <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-md bg-[#9A533C]/90 backdrop-blur-md text-[#FBF9F5] text-[10px] font-bold uppercase tracking-widest shadow-sm">
            {post.category || 'Architecture'}
          </div>

          {/* Quick Read Arrow button */}
          <Link
            href={`/posts/${post.id}`}
            aria-label={`Read story ${post.title}`}
            className="absolute bottom-3.5 right-3.5 w-9 h-9 rounded-xl bg-[#1F1B18]/80 hover:bg-[#9A533C] text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:scale-105"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-[#7C756C] mb-3">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-[#9A533C]" />
              {post.author}
            </span>
            <span>&middot;</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold tracking-tight text-[#1F1B18] group-hover:text-[#9A533C] transition-colors line-clamp-2 mb-2.5">
            <Link href={`/posts/${post.id}`}>{post.title}</Link>
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-[#5B554E] leading-relaxed line-clamp-3 font-normal">
            {post.content}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-[#F5F0E6]/50 border-t border-[#B59F7F]/15 flex items-center justify-between">
        {/* Comment Count Badge (Bonus 4) */}
        <Link
          href={`/posts/${post.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C756C] hover:text-[#9A533C] transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#9A533C]" />
          <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
        </Link>

        {/* Buttons Sửa & Xoá */}
        <div className="flex items-center space-x-2">
          {/* Edit Button (Bonus 1) */}
          <button
            onClick={() => onEdit(post)}
            className="p-1.5 rounded-lg text-[#7C756C] hover:text-[#1F1B18] hover:bg-[#ECE2D2] transition-colors"
            title="Edit story"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete Button (Tiết 4-5) */}
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
            title="Delete story"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
