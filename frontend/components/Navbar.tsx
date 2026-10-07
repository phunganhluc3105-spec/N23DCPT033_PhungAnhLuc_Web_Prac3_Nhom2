'use client';

import React from 'react';
import Link from 'next/link';
import { PenSquare, Compass } from 'lucide-react';

interface NavbarProps {
  onOpenCreate?: () => void;
}

export default function Navbar({ onOpenCreate }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F3EDE2]/85 border-b border-[#B59F7F]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="group flex items-center space-x-3">
            <span className="w-10 h-10 rounded-full bg-[#1F1B18] text-[#FBF9F5] flex items-center justify-center font-bold text-lg group-hover:bg-[#9A533C] transition-colors">
              A
            </span>
            <div>
              <span className="block text-xl font-bold tracking-tight text-[#1F1B18] group-hover:text-[#9A533C] transition-colors">
                ATELIER <span className="font-light italic">Journal</span>
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-[#7C756C]">
                Architecture &middot; Spatial Form &middot; Essays
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Subtle Editorial Tagline */}
        <div className="hidden md:flex items-center space-x-6 text-xs uppercase tracking-widest text-[#7C756C]">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#9A533C]" />
            153&deg; North Latitude
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B59F7F]/40" />
          <span>Next.js 15 + Express Fullstack</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold tracking-wider uppercase text-[#1F1B18] hover:text-[#9A533C] transition-colors"
          >
            Stories
          </Link>

          {onOpenCreate && (
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F1B18] text-[#FBF9F5] hover:bg-[#9A533C] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              <PenSquare className="w-4 h-4" />
              <span>Write Story</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
