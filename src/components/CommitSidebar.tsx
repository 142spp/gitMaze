import React from 'react'
import { useGameStore } from '../store/useGameStore'
import { GitCommit, GitBranch } from 'lucide-react'

export const CommitSidebar: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)

    const branchData = branches[currentBranch]
    const commits = branchData?.commits || []
    const themeColor = branchData?.themeColor || '#2563eb'

    return (
        <div className="h-full bg-white flex flex-col font-mono text-[11px] overflow-y-auto scrollbar-hide p-6">
            <div className="flex items-center gap-2 mb-8 text-slate-400 hud-text">
                <GitBranch className="w-4 h-4" style={{ color: themeColor }} />
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Git Graph</span>
            </div>

            <div className="relative space-y-0 px-1">
                {/* Continuous Line for current Branch */}
                <div className="absolute left-[13.5px] top-2 bottom-2 w-[1.5px] bg-slate-100" />

                {commits.slice().reverse().map((commit, index) => {
                    const commitHash = Math.random().toString(16).substring(2, 8).toUpperCase()
                    const isActive = index === 0

                    return (
                        <div key={index} className="relative group flex items-start gap-4 py-3 leading-relaxed transition-all cursor-pointer">

                            {/* Graph Node */}
                            <div className="relative z-10 pt-1.5 flex-shrink-0">
                                <div
                                    className={`w-3.5 h-3.5 rounded-full border-2 bg-white transition-all duration-300
                    ${isActive ? 'scale-110 shadow-[0_0_12px_rgba(0,0,0,0.05)]' : 'border-slate-300'}
                  `}
                                    style={{
                                        borderColor: isActive ? themeColor : undefined,
                                        backgroundColor: isActive ? 'white' : 'white',
                                        boxShadow: isActive ? `0 0 10px ${themeColor}22` : 'none'
                                    }}
                                >
                                    {isActive && <div className="absolute inset-0 m-auto w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: themeColor }} />}
                                </div>
                            </div>

                            {/* Commit Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold hud-text text-[10px]" style={{ color: isActive ? themeColor : '#94a3b8' }}>
                                        {commitHash}
                                    </span>
                                    <span
                                        className="px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-widest"
                                        style={{
                                            backgroundColor: isActive ? `${themeColor}15` : '#f1f5f9',
                                            color: isActive ? themeColor : '#64748b'
                                        }}
                                    >
                                        {currentBranch}
                                    </span>
                                </div>
                                <p className={`font-bold transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {commit}
                                </p>
                                <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[9px] mt-1 hud-text">
                                    <span>DEV@ANTIGRAVITY</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
