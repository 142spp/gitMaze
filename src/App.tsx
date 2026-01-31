import React from 'react'
import { MainScene } from './components/MainScene'
import { TerminalController } from './components/TerminalController'
import { CommitSidebar } from './components/CommitSidebar'
import { Minimap } from './components/Minimap'
import { useGameStore } from './store/useGameStore'
import { Zap, Wifi, Battery } from 'lucide-react'

const App: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)
    const themeColor = branches[currentBranch]?.themeColor || '#2563eb'

    return (
        <div className="w-full h-screen bg-white flex text-slate-800 font-mono select-none overflow-hidden">
            {/* Left Sidebar: Git Graph */}
            <aside className="w-[320px] h-full border-r border-slate-100 flex flex-col bg-slate-50/30 z-20 shadow-xl">
                <div className="h-12 border-b border-slate-100 flex items-center px-6 justify-between bg-white">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-black tracking-[0.2em] hud-text">COMMIT_LOG</span>
                </div>

                <div className="flex-1 overflow-hidden">
                    <CommitSidebar />
                </div>

                <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between bg-white/80">
                    <span className="hud-text">REPO: origin/{currentBranch}</span>
                    <span className="font-black hud-text" style={{ color: themeColor }}>SYNCED</span>
                </div>
            </aside>

            {/* Right Column */}
            <div className="flex-1 flex flex-col h-full relative">

                {/* Header / Status Bar */}
                <header className="h-12 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10 shadow-sm">
                    <div className="flex items-center gap-6">
                        <span className="font-black text-xs tracking-[0.4em] hud-text" style={{ color: themeColor }}>
                            GIT_CRAWLER_V1.0
                        </span>
                        <span className="bg-slate-100 px-2.5 py-1 rounded-sm text-[8px] font-black text-slate-500 tracking-widest hud-text">
                            SESSION_ID: RX-99
                        </span>
                    </div>

                    <div className="flex items-center gap-6 text-[10px] font-black tracking-widest text-slate-400 hud-text">
                        <div className="flex items-center gap-2">
                            <Wifi className="w-3 h-3" style={{ color: themeColor }} />
                            <span>ONLINE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Battery className="w-3 h-3 text-sky-500" />
                            <span>98%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span>POWER</span>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 relative bg-[#fcfdfe] overflow-hidden flex flex-col">
                    {/* Main 3D Viewport (70%) */}
                    <section className="flex-[7] relative overflow-hidden border-b border-slate-100 bg-white shadow-inner">
                        <MainScene />

                        {/* MiniMap Overlay - Top Right Anchor like in reference */}
                        <div className="absolute top-6 right-6 z-30 shadow-2xl">
                            <Minimap />
                        </div>
                    </section>

                    {/* Bottom Terminal (30%) */}
                    <footer className="flex-[3] relative bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
                        <TerminalController />

                        {/* Terminal Decoration */}
                        <div className="absolute top-0 right-10 h-8 flex items-center gap-3 bg-white px-5 border-x border-b border-slate-50 text-[8px] font-black uppercase tracking-[0.3em] z-10 rounded-b-sm shadow-sm hud-text">
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
                            <span className="text-slate-300">SYSTEM_ENV_STABLE</span>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    )
}

export default App
