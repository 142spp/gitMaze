import React from 'react';

export function Terminal() {
  return (
    <div className="w-full h-full bg-[#1e293b] rounded-2xl shadow-xl border-4 border-[#2c3e50] overflow-hidden flex flex-col">
      {/* Terminal Header */}
      <div className="bg-[#0f172a] p-3 flex items-center justify-between shrink-0">
         <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm hover:brightness-110" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm hover:brightness-110" />
            <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm hover:brightness-110" />
         </div>
         <div className="text-[10px] font-mono text-slate-500 font-bold tracking-wider">git-maze — -zsh — 80x24</div>
         <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 font-mono text-xs text-slate-300 overflow-y-auto custom-scrollbar leading-relaxed">
         <div className="mb-2 text-slate-500">
             GitMaze Label-OS v1.0.4<br/>
             (c) Cnefty Corp. All rights reserved.
         </div>
         
         <div className="mb-2">
             Welcome to gitfaze.<br/>
             Type "help" for a list of commands.
         </div>

         <div className="group">
             <span className="text-blue-400 font-bold">user@git-maze</span>
             <span className="text-slate-500">:</span>
             <span className="text-yellow-200">~/projects/core</span>
             <span className="text-slate-500">$</span>
             <span className="ml-2">git status</span>
         </div>
         <div className="text-slate-400 pl-4 mb-2">
             On branch main. Changes not staged for commit.
         </div>

         <div className="group animate-pulse">
             <span className="text-blue-400 font-bold">user@git-maze</span>
             <span className="text-slate-500">:</span>
             <span className="text-yellow-200">~/projects/core</span>
             <span className="text-slate-500">$</span>
             <span className="ml-2 border-r-2 border-slate-400 pr-1">git commit_</span>
         </div>
      </div>

      {/* Footer / Input area decoration */}
      <div className="p-2 bg-[#0f172a]/50 flex justify-between items-center px-4">
         <div className="flex gap-2">
            <div className="w-8 h-1.5 bg-slate-700 rounded-full" />
            <div className="w-4 h-1.5 bg-slate-700/50 rounded-full" />
         </div>
         <button className="px-3 py-1 bg-[#334155] rounded-full text-[9px] font-bold text-white shadow hover:bg-[#475569] transition-colors">
            PRINT
         </button>
      </div>
    </div>
  );
}
