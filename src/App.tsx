import React from 'react'
import { MainScene } from './components/MainScene'
import { TerminalController } from './components/TerminalController'
import { CommitSidebar } from './components/CommitSidebar'
import { Minimap } from './components/Minimap'
import { useGameStore } from './store/useGameStore'

const App: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)

    return (
        <div className="flex w-screen h-screen bg-black overflow-hidden font-mono text-green-500">
            {/* Sidebar (Commit Graph) */}
            <CommitSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                {/* 3D Scene Area (70%) */}
                <div className="h-[70%] relative overflow-hidden border-b border-green-900/20">
                    <MainScene />
                    <Minimap />
                </div>

                {/* Terminal Area (30%) */}
                <div className="h-[30%] relative">
                    <TerminalController />

                    {/* Status Bar */}
                    <div className="absolute top-0 right-4 h-8 flex items-center gap-4 bg-[#0a0a0a] px-3 border-l border-b border-green-900/40 text-[10px] uppercase tracking-widest z-10 select-none">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span>Branch: {currentBranch}</span>
                        </div>
                        <div className="text-green-900">|</div>
                        <div>Terminal Ready</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
