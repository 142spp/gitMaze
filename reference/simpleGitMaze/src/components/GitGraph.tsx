import React from 'react';
import { GitCommit, GitBranch, GitMerge } from 'lucide-react';

interface Commit {
  id: string;
  message: string;
  author: string;
  type: 'commit' | 'merge' | 'branch';
  branch: 'main' | 'feature' | 'hotfix';
}

const mockCommits: Commit[] = [
  { id: '8a2b1c', message: 'fix: resolve maze collision', author: 'dev_one', type: 'commit', branch: 'main' },
  { id: '7d3e4f', message: 'merge: feature/pathfinding', author: 'dev_one', type: 'merge', branch: 'main' },
  { id: '9c5a2b', message: 'feat: add A* algorithm', author: 'dev_two', type: 'commit', branch: 'feature' },
  { id: '6b1d3e', message: 'chore: init maze structure', author: 'dev_one', type: 'branch', branch: 'main' },
  { id: '5f0a1c', message: 'init: project start', author: 'root', type: 'commit', branch: 'main' },
];

export function GitGraph() {
  return (
    <div className="h-full bg-slate-900/90 border-r border-slate-700 p-4 font-mono text-xs overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-2 mb-6 text-slate-400">
        <GitBranch className="w-4 h-4 text-emerald-400" />
        <span className="font-bold uppercase tracking-widest">Git Graph</span>
      </div>

      <div className="relative space-y-0">
        {/* Continuous Line for Main Branch */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-700/50 -z-10" />

        {mockCommits.map((commit, index) => (
          <div key={commit.id} className="relative group flex items-start gap-4 py-3 hover:bg-slate-800/50 rounded px-2 transition-colors cursor-pointer">
            
            {/* Graph Node */}
            <div className="relative z-10 pt-1">
              <div className={`w-3 h-3 rounded-full border-2 
                ${commit.branch === 'main' ? 'border-blue-500 bg-blue-900' : 
                  commit.branch === 'feature' ? 'border-purple-500 bg-purple-900' : 
                  'border-emerald-500 bg-emerald-900'}
                ${commit.type === 'merge' ? 'w-4 h-4 -ml-0.5' : ''}
                shadow-[0_0_8px_rgba(59,130,246,0.5)]
              `}></div>
              
              {/* Branch connector line (simplified) */}
              {commit.branch !== 'main' && (
                <div className="absolute top-4 left-1.5 w-0.5 h-6 bg-purple-500/30 origin-top -rotate-45" />
              )}
            </div>

            {/* Commit Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold">{commit.id}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase
                  ${commit.branch === 'main' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}
                `}>{commit.branch}</span>
              </div>
              <p className="text-slate-300 truncate group-hover:text-white transition-colors">
                {commit.message}
              </p>
              <div className="flex items-center gap-1 text-slate-500 mt-1">
                <span className="text-[10px]">{commit.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
