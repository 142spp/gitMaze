import React from 'react'
import { useGameStore } from '../store/useGameStore'
import { GitCommit, GitBranch, ChevronRight } from 'lucide-react'

export const CommitSidebar: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)

    const branchData = branches[currentBranch]
    const commits = branchData?.commits || []

    return (
        <div className="w-64 h-full bg-[#080808] border-r border-green-900/20 flex flex-col font-mono">
            <div className="p-4 border-b border-green-900/20 flex items-center gap-2">
                <GitBranch size={16} className="text-green-500" />
                <span className="text-sm font-bold text-green-500 uppercase tracking-widest truncate">
                    {currentBranch}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-[10px] text-green-900 uppercase tracking-[0.2em] mb-4">
                    Commit History
                </div>

                <div className="relative">
                    {/* Vertical line for the graph */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-green-900/50" />

                    {commits.slice().reverse().map((commit, index) => (
                        <div key={index} className="relative pl-8 pb-6 last:pb-0 group">
                            {/* node */}
                            <div className="absolute left-0 top-1.5 w-6 h-6 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-4 border-[#080808] z-10 
                              group-first:animate-pulse ring-2 ring-green-900/20" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="text-[11px] text-green-200 font-bold leading-tight line-clamp-2">
                                    {commit}
                                </div>
                                <div className="text-[9px] text-green-800 flex items-center gap-1">
                                    <GitCommit size={10} />
                                    <span>{Math.random().toString(16).substring(2, 8)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-green-950/10 border-t border-green-900/10">
                <div className="text-[9px] text-green-700 uppercase mb-1">Status</div>
                <div className="flex items-center gap-2 text-[10px] text-green-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>HEAD @ {currentBranch}</span>
                </div>
            </div>
        </div>
    )
}
