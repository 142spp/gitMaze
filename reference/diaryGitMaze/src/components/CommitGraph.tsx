import React from 'react';

const COMMITS = [
  { id: 'e83a47', message: 'Initial commit', author: '@antigravity', active: false },
  { id: 'a36b8c', message: 'Add maze logic', author: '@antigravity', active: false },
  { id: 'b92d1f', message: 'Fix jump mechanic', author: '@chronos', active: true },
  { id: 'c41e5a', message: 'WIP: Paradox level', author: '@voidwalker', active: false },
];

export function CommitGraph() {
  return (
    <div className="relative pl-2 pb-4 pt-2">
      {/* Thread Line */}
      <div className="absolute left-[15px] top-4 bottom-0 w-0.5 bg-red-800/30 border-l border-dashed border-red-800/50" />

      {COMMITS.map((commit, index) => (
        <div key={commit.id} className="group relative pl-8 mb-6 last:mb-0">
          
          {/* Node / Button / Pin */}
          <div className={`
            absolute left-[9px] top-3 w-3.5 h-3.5 rounded-full border-2 z-10 shadow-sm
            ${commit.active 
                ? 'bg-amber-400 border-amber-600 scale-125' 
                : 'bg-[#8d6e63] border-[#5d4037]'}
          `}>
             {/* Thread stitch look */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-full bg-black/10 rotate-45" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-black/10 rotate-45" />
          </div>

          {/* Sticky Note Card */}
          <div className={`
             relative bg-white rounded-lg p-2.5 shadow-sm border-b-2 transition-transform hover:-translate-y-0.5
             ${commit.active ? 'border-amber-400 rotate-1' : 'border-gray-200 rotate-0'}
          `}>
             <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[9px] text-gray-400 bg-gray-100 px-1 rounded">{commit.id}</span>
                {commit.active && <span className="text-[8px] font-bold text-amber-500 uppercase">HEAD</span>}
             </div>
             <p className="font-bold text-gray-700 text-sm leading-tight mb-1">{commit.message}</p>
             <p className="text-[10px] text-gray-400 italic">{commit.author}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
