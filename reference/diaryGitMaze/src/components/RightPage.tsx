import React from 'react';
import { Terminal } from './Terminal';
import { MazeViewport } from './MazeViewport';

export function RightPage() {
  return (
    <div className="w-full h-full flex flex-col p-6 relative">
      {/* Background Texture: Subtle wrinkled paper or just clean */}
      <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply" 
           style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }} 
      />

      {/* Top: Polaroid / Maze */}
      <div className="flex-1 relative flex items-center justify-center p-2 mb-4">
        <MazeViewport />
        
        {/* Coffee Stain Decoration */}
        <div className="absolute -top-2 -right-2 w-24 h-24 opacity-10 pointer-events-none rotate-45">
            <svg viewBox="0 0 100 100" fill="none" stroke="#5d4037" strokeWidth="12">
                <circle cx="50" cy="50" r="40" strokeDasharray="60 40" />
            </svg>
        </div>
      </div>

      {/* Bottom: Terminal */}
      <div className="h-[220px] relative z-20">
        <Terminal />
      </div>
      
    </div>
  );
}
