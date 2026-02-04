import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { BookMarked } from 'lucide-react';

export const IntroCover: React.FC = () => {
    const startGame = useGameStore(state => state.startGame);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-12 relative text-[#d4af37]">
            {/* Border Ornament */}
            <div className="absolute inset-8 border-4 border-[#d4af37]/40 rounded-lg pointer-events-none flex items-center justify-center">
                <div className="absolute inset-1 border border-[#d4af37]/20 rounded-sm" />
            </div>

            {/* Corner Ornaments */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-[#d4af37] rounded-tl-lg" />
            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-[#d4af37] rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-[#d4af37] rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-[#d4af37] rounded-br-lg" />

            <div className="z-10 flex flex-col items-center gap-8">
                <div className="bg-[#2c1810]/50 p-6 rounded-full border-2 border-[#d4af37] shadow-xl backdrop-blur-sm">
                    <BookMarked className="w-16 h-16 text-[#FFD700]" />
                </div>

                <div className="text-center space-y-4">
                    <h1 className="text-7xl font-black tracking-widest uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] font-serif text-[#FFD700]">
                        Git Maze
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-[#e5dec9] opacity-80 font-mono tracking-[0.2em] text-sm">
                        <span>EST. 2026</span>
                        <span>•</span>
                        <span>CHRONICLES</span>
                    </div>
                </div>

                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent my-4" />

                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button
                        onClick={startGame}
                        className="group relative w-full py-4 bg-[#d4af37] text-[#2c1810] font-bold text-lg rounded shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-[#FFD700] hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            GAME START
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </span>
                    </button>

                    <button
                        onClick={() => alert("준비 중입니다!")}
                        className="group relative w-full py-4 bg-transparent border-2 border-[#d4af37] text-[#d4af37] font-bold text-lg rounded hover:bg-[#d4af37]/10 hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            TUTORIAL
                        </span>
                    </button>
                </div>

                <p className="mt-8 text-xs text-[#d4af37]/40 font-mono">
                    "The journey of a thousand commits begins with a single init."
                </p>
            </div>
        </div>
    );
};
