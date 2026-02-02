import React from 'react';
import { CommitGraph } from './CommitGraph';
import { SystemMap } from './SystemMap';

export function LeftPage() {
  return (
    <div className="w-full h-full flex">
      {/* Sidebar Area (Darker textured paper/corkboard) */}
      <div className="w-[35%] h-full bg-[#cbb89d] relative border-r border-[#bba485] shadow-[inset_-5px_0_10px_rgba(0,0,0,0.05)]">
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#8B5E3C 1px, transparent 1px)', backgroundSize: '12px 12px' }} 
        />

        <div className="relative z-10 p-4 h-full flex flex-col">
            <div className="bg-[#fdfbf7] rounded-full py-2 px-4 shadow-sm border border-amber-900/10 mb-6 w-fit mx-auto">
                <span className="text-xs font-black text-amber-800 tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    GIT GRAPH
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                <CommitGraph />
            </div>

            <div className="mt-4 pt-3 border-t border-amber-900/10">
                <div className="flex justify-between items-center text-[10px] font-bold text-amber-900/50">
                    <span>ORIGIN/MAIN</span>
                    <span className="flex items-center gap-1 text-green-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        SYNCED
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Left Page Content (Light paper) */}
      <div className="flex-1 relative p-6">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />

        {/* Floating Bubble */}
        <div className="absolute top-12 left-8 bg-white/90 rounded-2xl p-3 shadow-md border-2 border-gray-100 transform -rotate-2">
            <p className="text-[10px] font-bold text-gray-400 mb-1">POS (0,0)</p>
            <p className="text-xs font-bold text-gray-600">USE ARROW KEYS TO MOVE</p>
        </div>
        
        {/* System Map (Sticky Note style at bottom) */}
        <div className="absolute bottom-8 right-6 z-10">
            <SystemMap />
        </div>

        {/* Background decorative doodles */}
        <div className="absolute top-1/3 right-12 opacity-10 rotate-12">
            <svg width="60" height="60" viewBox="0 0 100 100">
                <path d="M10,50 Q25,25 50,50 T90,50" stroke="currentColor" fill="none" strokeWidth="4" />
                <path d="M10,60 Q25,35 50,60 T90,60" stroke="currentColor" fill="none" strokeWidth="4" />
            </svg>
        </div>
      </div>
    </div>
  );
}
