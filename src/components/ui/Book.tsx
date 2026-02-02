import React, { ReactNode } from 'react';

interface BookProps {
    children: ReactNode;
}

export function Book({ children }: BookProps) {
    return (
        <div
            className="relative z-10 w-full flex transition-all duration-500 perspective-1000"
            style={{
                maxWidth: '1200px',
                maxHeight: 'min(94vh, 1000px)',
                aspectRatio: '4 / 3',
                width: 'min(100%, calc(min(94vh, 1000px) * 4 / 3))',
                margin: '0 auto'
            }}
        >

            {/* Clasp (Left Side) - Decorative */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-12 h-20 z-30 flex items-center">
                <div className="w-full h-10 bg-[#6d4c41] rounded-l-lg shadow-md relative">
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#d4af37] rounded-md shadow-inner flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#fdfbf7] rounded-full shadow-sm" />
                    </div>
                </div>
            </div>

            {/* Main Cover (Background) */}
            <div className="absolute inset-0 bg-[#5d4037] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform">
                {/* Subtle Spine detail */}
                <div className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-[#4e342e] shadow-inner opacity-20" />
            </div>

            {/* Pages Container (Unified Page) */}
            <div className="relative z-20 w-full h-full p-4">
                <div className="w-full h-full bg-[#f7f3e8] rounded-[30px] shadow-md overflow-hidden relative border border-[#e5dec9]">
                    {children}

                    {/* Center fold shadow (Subtle) */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/5 to-transparent pointer-events-none z-50" />
                </div>
            </div>

            {/* Decoration: Pencil */}
            <div className="absolute -bottom-6 right-0 w-48 h-4 bg-yellow-400 rotate-[15deg] shadow-2xl rounded-full z-40 border-b-4 border-yellow-600">
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-pink-300 rounded-r-full border-l-2 border-gray-300" />
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#fdfbf7] rounded-l-full border-r-[10px] border-[#d4af37] clip-path-pencil" />
            </div>
        </div>
    );
}
