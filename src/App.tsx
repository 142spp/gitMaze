import React from 'react'
import { MainScene } from './components/MainScene'
import { TerminalController } from './components/TerminalController'
import { CommitSidebar } from './components/CommitSidebar'
import { Minimap } from './components/Minimap'
import { useGameStore } from './store/useGameStore'

const App: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)
    const themeColor = branches[currentBranch]?.themeColor || '#2563eb'

    return (
        <div className="w-screen h-screen bg-slate-100 flex items-center justify-center p-6 overflow-hidden">
            {/* 4:3 Container with overall border */}
            <div className="relative w-full max-w-[1280px] h-full max-h-[960px] aspect-[4/3] bg-white flex text-slate-800 font-mono select-none overflow-hidden shadow-2xl rounded-lg border-2 border-slate-300">

                {/* Left Sidebar: Git Graph (Node Graph) */}
                <aside className="w-[300px] h-full border-r-2 border-slate-200 flex flex-col bg-slate-50/10 z-20 overflow-hidden">
                    <div className="h-10 border-b border-slate-100 flex items-center px-5 justify-between bg-white">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-black tracking-[0.2em] hud-text">GIT_GRAPH</span>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <CommitSidebar />
                    </div>

                    <div className="p-3 border-t border-slate-200 text-[9px] text-slate-400 flex justify-between bg-white">
                        <span className="hud-text">origin/{currentBranch}</span>
                        <span className="font-black hud-text" style={{ color: themeColor }}>SYNCED</span>
                    </div>
                </aside>

                {/* Right Column */}
                <div className="flex-1 flex flex-col h-full relative">
                    {/* Main Content Area */}
                    <main className="flex-1 relative bg-[#fcfdfe] overflow-hidden flex flex-col">
                        {/* Main 3D Viewport - Takes flex-7 area */}
                        <div className="flex-[7] min-h-0 relative overflow-hidden bg-white shadow-inner">
                            <MainScene />
                        </div>

                        {/* Bottom Info Panel (Minimap + Terminal) - Takes flex-3 area */}
                        <div className="flex-[3] min-h-0 flex bg-white border-t-2 border-slate-200 overflow-hidden">
                            {/* Bottom Left: Minimap (1/4 of bottom) */}
                            <div className="flex-[1] border-r-2 border-slate-200 bg-slate-50/10">
                                <Minimap />
                            </div>

                            {/* Bottom Right: Terminal (3/4 of bottom) */}
                            <div className="flex-[3] relative overflow-hidden">
                                <TerminalController />

                                {/* Terminal Label */}
                                <div className="absolute top-0 right-8 h-6 flex items-center gap-2 bg-white px-4 border-x border-b border-slate-200 text-[8px] font-black uppercase tracking-[0.2em] z-10 rounded-b-sm shadow-sm hud-text">
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
                                    <span className="text-slate-300">SYSTEM_READY</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default App
