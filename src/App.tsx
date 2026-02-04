import React from 'react'
import { MainScene } from './components/MainScene'
import { TerminalController } from './components/TerminalController'
import { CommitSidebar } from './components/CommitSidebar'
import { Minimap } from './components/Minimap'
import { Book } from './components/ui/Book'
import { GitBranch } from 'lucide-react';
import { useGameStore } from './store/useGameStore';


const App: React.FC = () => {
    const loadTutorial = useGameStore(state => state.loadTutorial);

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-2 md:p-4 overflow-hidden relative"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=2070&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Blur overlay for the background to make it look soft/dreamy */}
            <div className="absolute inset-0 backdrop-blur-[2px] bg-amber-100/20" />

            <Book
                leftContent={
                    <div className="w-full h-full relative z-20 flex flex-col pt-10 px-5 bg-[#ecdab9] border-r border-[#8b5e3c]/20">
                        {/* Sidebar logic */}
                        <div className="bg-[#8b5e3c]/10 rounded-full py-2 px-4 shadow-inner border border-[#8b5e3c]/5 mb-8 w-fit mx-auto">
                            <span className="text-[10px] font-black text-[#8b5e3c]/60 tracking-[0.2em] flex items-center gap-2">
                                <GitBranch className="w-4 h-4 text-[#8b5e3c]" />
                                GIT_GRAPH
                            </span>
                        </div>
                        <div className="flex-1 overflow-hidden opacity-90 transition-opacity">
                            <CommitSidebar />
                        </div>
                    </div>
                }
                rightContent={
                    <div className="w-full h-full relative p-6 flex flex-col min-w-0 bg-[#fdf3e7]">
                        {/* Background Decorative Doodles */}
                        <div className="absolute top-1/4 right-1/4 opacity-10 rotate-12 pointer-events-none">
                            <svg width="100" height="100" viewBox="0 0 100 100" className="text-amber-900">
                                <path d="M10,50 Q25,25 50,50 T90,50" stroke="currentColor" fill="none" strokeWidth="2" />
                                <path d="M10,60 Q25,35 50,60 T90,60" stroke="currentColor" fill="none" strokeWidth="2" />
                            </svg>
                        </div>

                        {/* Top: 3D Scene Viewport */}
                        <div className="flex-1 relative min-h-0 mb-6 group flex items-center justify-center">
                            <MainScene />
                        </div>

                        {/* Bottom: Minimap + Terminal (Side-by-side for 4:3) */}
                        <div className="h-[240px] flex gap-4 relative z-40">
                            <div className="w-[220px] shrink-0">
                                <Minimap />
                            </div>
                            <div className="flex-1">
                                <TerminalController />
                            </div>
                        </div>
                    </div>
                }
            />

            {/* Decorative Floating UI Buttons (Themed) */}
            <div className="absolute bottom-10 left-10 flex gap-4 z-50">
                <button className="w-12 h-12 bg-[#fdfbf7] rounded-full shadow-xl flex items-center justify-center text-amber-700 hover:scale-110 active:scale-95 transition-all border border-amber-100/50">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>
                </button>
                <button className="w-12 h-12 bg-[#fdfbf7] rounded-full shadow-xl flex items-center justify-center text-amber-700/60 hover:scale-110 active:scale-95 transition-all border border-amber-100/50">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                </button>
            </div>

            {/* Tutorial Test Buttons (Temporary) */}
            <div className="absolute top-10 right-10 flex flex-col gap-2 z-50">
                {[1, 2, 3, 4].map(lv => (
                    <button
                        key={lv}
                        onClick={() => loadTutorial(lv)}
                        className="px-4 py-2 bg-amber-900/80 text-white rounded-lg shadow-lg hover:bg-amber-800 transition-colors text-xs font-bold"
                    >
                        TUTORIAL {lv}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default App
