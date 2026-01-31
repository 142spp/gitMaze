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
        <div className="flex w-screen h-screen bg-gray-100 overflow-hidden font-mono text-gray-900 select-none">
            {/* Left Sidebar: Git Graph */}
            <aside className="w-72 h-full border-r border-gray-200 bg-white flex flex-col z-20 shadow-2xl overflow-hidden">
                <div className="h-12 border-b border-gray-100 flex items-center px-4 justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/20 border border-red-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/20 border border-yellow-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/20 border border-green-400"></div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-black tracking-[0.2em]">COMMIT_LOG</span>
                </div>

                <div className="flex-1 overflow-hidden">
                    <CommitSidebar />
                </div>

                <div className="p-4 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between bg-white">
                    <span>REPO: origin/{currentBranch}</span>
                    <span className="font-bold" style={{ color: themeColor }}>SYNCED</span>
                </div>
            </aside>

            {/* Right Column */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">

                {/* Header / Status Bar */}
                <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-10 shadow-sm">
                    <div className="flex items-center gap-5">
                        <span className="font-black text-sm tracking-[0.3em] uppercase" style={{ color: themeColor }}>
                            Git_Crawler_v1.0
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500 tracking-wider">
                            SESSION_ID: RX-99
                        </span>
                    </div>

                    <div className="flex items-center gap-6 text-[10px] font-black tracking-widest text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <Wifi className="w-3 h-3" style={{ color: themeColor }} />
                            <span>ONLINE</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Battery className="w-3 h-3 text-blue-500" />
                            <span>98%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span>POWER</span>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 relative bg-[#f8fafc] overflow-hidden flex flex-col">
                    {/* Viewport (70%) */}
                    <div className="flex-[7] relative overflow-hidden border-b border-gray-100">
                        <MainScene />

                        {/* MiniMap Overlay - Top Right */}
                        <div className="absolute top-4 right-4 z-30 shadow-2xl">
                            <Minimap />
                        </div>
                    </div>

                    {/* Bottom Terminal (30%) */}
                    <div className="flex-[3] relative bg-white shadow-[0_-5px_25px_rgba(0,0,0,0.03)] border-l border-gray-100">
                        <TerminalController />

                        {/* Terminal Tab/Label */}
                        <div className="absolute top-0 right-8 h-8 flex items-center gap-3 bg-white px-4 border-x border-b border-gray-100 text-[9px] font-black uppercase tracking-[0.2em] z-10 rounded-b-md shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                            <span className="text-gray-400">Terminal_Host</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default App
