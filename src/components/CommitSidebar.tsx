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
        <div className="h-full bg-[#fcfdfe] flex flex-col font-mono text-xs overflow-y-auto scrollbar-hide p-4">
            <div className="flex items-center gap-2 mb-6 text-gray-400">
                <GitBranch className="w-4 h-4" style={{ color: themeColor }} />
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Git Graph</span>
            </div>

            <div className="relative space-y-0 px-1">
                {/* Continuous Line for current Branch */}
                <div className="absolute left-[13px] top-2 bottom-2 w-[1.5px] bg-gray-100" />

                {commits.slice().reverse().map((commit, index) => {
                    const isMain = currentBranch === 'main'
                    const commitHash = Math.random().toString(16).substring(2, 8).toUpperCase()

                    return (
                        <div key={index} className="relative group flex items-start gap-4 py-4 hover:bg-gray-50/80 rounded px-2 transition-all cursor-pointer">

                            {/* Graph Node */}
                            <div className="relative z-10 pt-1.5 flex-shrink-0">
                                <div
                                    className={`w-3.5 h-3.5 rounded-full border-2 bg-white transition-all duration-300
                    ${index === 0 ? 'scale-110 shadow-[0_0_12px_rgba(0,0,0,0.1)]' : ''}
                  `}
                                    style={{
                                        borderColor: themeColor,
                                        boxShadow: index === 0 ? `0 0 10px ${themeColor}33` : 'none'
                                    }}
                                />
                            </div>

                            {/* Commit Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-black tracking-tighter" style={{ color: themeColor }}>
                                        {commitHash}
                                    </span>
                                    <span
                                        className="px-1.5 py-0.5 rounded-[3px] text-[8px] font-black uppercase tracking-widest text-white"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        {currentBranch}
                                    </span>
                                </div>
                                <p className="text-gray-800 font-bold leading-snug line-clamp-2 text-[11px] mb-1">
                                    {commit}
                                </p>
                                <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[9px]">
                                    <GitCommit size={10} />
                                    <span>{index === commits.length - 1 ? 'initial' : 'user'}@gitmaze</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
