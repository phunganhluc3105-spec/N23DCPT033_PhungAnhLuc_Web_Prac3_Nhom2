'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import PostForm from '@/components/PostForm';
import EditPostModal from '@/components/EditPostModal';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Post } from '@/types/blog';
import { Search, Plus, Compass, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const queryClient = useQueryClient();

  // 1. Fetch danh sách bài viết bằng TanStack Query (Nâng cao 2 - Bonus)
  const {
    data: posts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await api.get('/api/posts');
      return res.data;
    },
  });

  // 2. Xóa bài viết với Optimistic Update (Bắt buộc theo Tiết 4-5 trong tài liệu)
  const handleDeletePost = async (id: number) => {
    // Bước 1: Xác nhận người dùng theo yêu cầu PDF
    if (!confirm('Bạn chắc chắn muốn xoá bài viết này?')) return;

    // Snapshot dữ liệu cũ để Rollback nếu lỗi
    const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

    // Bước 3: Cập nhật state NGAY (Optimistic update)
    queryClient.setQueryData<Post[]>(['posts'], (old) =>
      old ? old.filter((p) => p.id !== id) : []
    );

    try {
      // Bước 2: Gọi API xóa
      await api.delete(`/api/posts/${id}`);
      // Bước 4: Hiển thị toast thành công với icon thùng rác
      toast.success('Đã xoá bài viết', { icon: '🗑️' });
    } catch (err) {
      console.error('Delete error:', err);
      // Rollback: phục hồi dữ liệu từ snapshot và báo lỗi
      queryClient.setQueryData(['posts'], previousPosts);
      toast.error('Xoá thất bại, thử lại!');
      refetch();
    }
  };

  // Lọc bài viết theo ô tìm kiếm và chuyên mục
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat =
        selectedCategory === 'All' || post.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [posts, searchTerm, selectedCategory]);

  const categories = ['All', 'Architecture', 'Interior', 'Nordic Spaces', 'Editorial Journal'];

  return (
    <div className="min-h-screen flex flex-col bg-[#F3EDE2]">
      {/* Thanh điều hướng */}
      <Navbar onOpenCreate={() => setIsFormOpen(!isFormOpen)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* --- Hero Section lấy cảm hứng từ prefs --- */}
        <section className="relative overflow-hidden rounded-3xl bg-[#DFD4C2] border border-[#B59F7F]/30 p-8 sm:p-12 mb-12 shadow-sm">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Cột trái: Tiêu đề lớn & Triết lý kiến trúc */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#9A533C]">
                <Compass className="w-4 h-4" />
                <span> The Journey &middot; Architectural Journal</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#1F1B18] leading-[1.08]">
                Explore <br />
                <span className="italic font-light">North &amp; Forms</span>
              </h1>

              {/* Chữ ký phong cách Cay trong ảnh prefs & Nút tạo bài */}
              <div className="pt-2">
                <button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1F1B18] hover:bg-[#9A533C] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isFormOpen ? 'Close' : 'New post'}</span>
                </button>
              </div>
            </div>


            {/* Cột phải: Khung ảnh kiến trúc cong nổi bật như file thiết kế Frame 1 */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#FBF9F5]/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
                  alt="Explore North Feature"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 right-6 px-4 py-2 rounded-lg bg-[#9A533C]/85 backdrop-blur-md text-[#FBF9F5] text-xs font-bold uppercase tracking-widest shadow-md">
                  THE PERFECT ROAD
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Form Tạo Bài Viết (Hiện / Ẩn linh hoạt) --- */}
        {isFormOpen && (
          <section className="mb-12 animate-fade-in">
            <PostForm onClose={() => setIsFormOpen(false)} />
          </section>
        )}

        {/* --- Thanh Công Cụ: Tìm Kiếm & Lọc Thể Loại --- */}
        <section className="mb-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-[#B59F7F]/30">
          {/* Chuyên mục tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === cat
                  ? 'bg-[#1F1B18] text-[#FBF9F5] shadow-sm'
                  : 'bg-[#ECE2D2]/60 text-[#5B554E] hover:bg-[#DFD0BB] hover:text-[#1F1B18]'
                  }`}
              >
                {cat === 'All' ? 'Tất Cả' : cat}
              </button>
            ))}
          </div>

          {/* Thanh tìm kiếm */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F5F0E6] border border-[#B59F7F]/40 text-xs text-[#1F1B18] placeholder-[#7C756C] focus:outline-none focus:ring-2 focus:ring-[#9A533C]"
            />
            <Search className="w-4 h-4 text-[#7C756C] absolute left-3.5 top-2.5" />
          </div>
        </section>

        {/* --- Danh Sách Bài Viết --- */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="editorial-card rounded-2xl p-6 h-96 animate-pulse bg-[#ECE2D2]/50 flex flex-col justify-between"
                >
                  <div className="h-44 bg-[#DFD0BB]/50 rounded-xl mb-4" />
                  <div className="h-4 bg-[#DFD0BB]/60 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#DFD0BB]/40 rounded w-full mb-2" />
                  <div className="h-3 bg-[#DFD0BB]/40 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="editorial-card rounded-2xl p-8 text-center bg-[#FBF9F5] border-rose-200">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#1F1B18] mb-1">
                Không thể kết nối với Backend Server
              </h3>
              <p className="text-xs text-[#7C756C] mb-4">
                Vui lòng kiểm tra xem server Express tại cổng 5000 đã chạy chưa.
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F1B18] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider hover:bg-[#9A533C]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Thử lại
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="editorial-card rounded-2xl p-12 text-center bg-[#FBF9F5] border border-dashed border-[#B59F7F]/40">
              <Sparkles className="w-8 h-8 text-[#9A533C] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#1F1B18] mb-1">
                Không tìm thấy bài viết nào
              </h3>
              <p className="text-xs text-[#7C756C] mb-4">
                Hãy thử đổi từ khóa tìm kiếm hoặc bấm vào nút dưới để tạo bài viết đầu tiên.
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F1B18] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider hover:bg-[#9A533C]"
              >
                <Plus className="w-4 h-4" />
                Đăng bài ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={(p) => setEditingPost(p)}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* --- Modal Sửa Bài Viết (Bonus 1) --- */}
      <EditPostModal
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
      />

      {/* Footer Editorial */}
      <footer className="mt-20 border-t border-[#B59F7F]/30 bg-[#ECE2D2]/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7C756C]">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#1F1B18]">ATELIER JOURNAL</span>
            <span>&middot; Lab 3 Fullstack Next.js &amp; Express</span>
          </div>
          <div>
            <span>Phùng Anh Lực N23DCPT033 &amp; D23CQPTUD01-N</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


