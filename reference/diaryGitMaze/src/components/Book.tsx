import React from 'react';
import { LeftPage } from './LeftPage';
import { RightPage } from './RightPage';

export function Book() {
  return (
    <div className="relative z-10 w-full max-w-6xl aspect-[3/2] md:aspect-[1.55/1] flex transition-all duration-500 perspective-1000">
      
      {/* Clasp (Left Side) */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-6 w-16 h-24 z-30 flex items-center">
        {/* Leather strap */}
        <div className="w-full h-12 bg-[#6d4c41] rounded-l-lg shadow-md relative">
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#d4af37] rounded-md shadow-inner flex items-center justify-center">
                <div className="w-3 h-3 bg-[#fdfbf7] rounded-full shadow-sm" />
            </div>
        </div>
      </div>

      {/* Main Cover (Background) */}
      <div className="absolute inset-0 bg-[#5d4037] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform scale-[1.03]">
        {/* Spine detail */}
        <div className="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2 bg-[#4e342e] shadow-inner" />
      </div>

      {/* Pages Container */}
      <div className="relative z-20 flex w-full h-full p-3 gap-0">
        
        {/* Left Page Block */}
        <div className="flex-1 bg-[#f7f3e8] rounded-l-[30px] rounded-r-sm shadow-md overflow-hidden relative z-10">
           <LeftPage />
           {/* Page curve shadow */}
           <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none mix-blend-multiply" />
        </div>

        {/* Right Page Block */}
        <div className="flex-1 bg-[#f7f3e8] rounded-r-[30px] rounded-l-sm shadow-md overflow-hidden relative z-10">
           <RightPage />
           {/* Page curve shadow */}
           <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none mix-blend-multiply" />
        </div>

      </div>

      {/* Decoration: Pencil */}
      <div className="absolute -bottom-8 -right-12 w-48 h-4 bg-yellow-400 rotate-[30deg] shadow-xl rounded-full z-40 border-b-4 border-yellow-600">
         <div className="absolute right-0 top-0 bottom-0 w-8 bg-pink-300 rounded-r-full border-l-4 border-gray-300" />
         <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#fdfbf7] rounded-l-full border-r-[12px] border-[#d4af37] clip-path-pencil" />
      </div>
    </div>
  );
}
