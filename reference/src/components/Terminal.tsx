import React from 'react';

export function Terminal() {
  return (
    <div className="w-full h-full bg-slate-950 border-t border-slate-700 font-mono text-xs p-3 overflow-hidden flex flex-col">
      <div className="flex-1 space-y-1 overflow-y-auto mb-2 text-slate-300">
        <div className="opacity-50">Microsoft Windows [Version 10.0.19045.3693]</div>
        <div className="opacity-50">(c) Microsoft Corporation. All rights reserved.</div>
        <br />
        <div>
          <span className="text-emerald-500">user@git-maze</span>
          <span className="text-slate-500">:</span>
          <span className="text-blue-500">~/projects/core</span>
          <span className="text-slate-500">$</span> git status
        </div>
        <div>On branch main</div>
        <div>Your branch is up to date with 'origin/main'.</div>
        <br />
        <div>nothing to commit, working tree clean</div>
        <br />
        <div>
          <span className="text-emerald-500">user@git-maze</span>
          <span className="text-slate-500">:</span>
          <span className="text-blue-500">~/projects/core</span>
          <span className="text-slate-500">$</span> ./run_diagnostics.sh
        </div>
        <div className="text-yellow-400">WARN: Memory leak detected in sector 7G</div>
        <div className="text-blue-400">INFO: Optimization protocol initiated...</div>
        <div>Done.</div>
        <br />
      </div>
      
      {/* Input Line */}
      <div className="flex items-center gap-2 text-slate-100">
        <span className="text-emerald-500">user@git-maze</span>
        <span className="text-slate-500">:</span>
        <span className="text-blue-500">~/projects/core</span>
        <span className="text-slate-500">$</span>
        <div className="flex-1 relative">
            <span className="absolute inset-0 border-r-2 border-slate-100 w-[1ch] animate-pulse bg-slate-100"></span>
            <span className="opacity-0">git commit</span>
        </div>
      </div>
    </div>
  );
}
