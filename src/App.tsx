import React, { useEffect } from 'react'
import { MainScene } from './components/MainScene'
import { TerminalController } from './components/TerminalController'
import { CommitSidebar } from './components/CommitSidebar'
import { Minimap } from './components/Minimap'
import { Book } from './components/ui/Book'
import { IntroCover } from './components/ui/Intro'
import { DeathScreen } from './components/DeathScreen'
import { GitBranch } from 'lucide-react';
import { useGameStore } from './store/useGameStore'
import { CommitAnimationOverlay } from './components/CommitAnimationOverlay'


const App: React.FC = () => {
    const gameStatus = useGameStore(state => state.gameStatus);
    const initialize = useGameStore(state => state.initialize);
    const loadStage = useGameStore(state => state.loadStage);
    const nextStage = useGameStore(state => state.nextStage);
    const { currentCategory, currentStage } = useGameStore(state => ({
        currentCategory: state.currentCategory,
        currentStage: state.currentStage
    }));

    // Initial setup if jumping straight to playing (for debug or persistence check)
    useEffect(() => {
        // If we want to auto-init on load, we can do it here,
        // but for now we wait for 'startGame' to call initialize.
        // However, if we refresh and want to persist state, we might need logic here.
        // For this task, we assume fresh start from Intro.
    }, []);

    const isIntro = gameStatus === 'intro';

    // Game Content (Left)
    const GameLeft = (
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
    );

    // Game Content (Right)
    const GameRight = (
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
                {/* Death Screen Overlay (Canvas only) */}
                <DeathScreen />
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
    );

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
                isClosed={isIntro}
                leftContent={isIntro ? null : GameLeft}
                rightContent={isIntro ? <IntroCover /> : GameRight}
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

            {/* Tutorial & Stage Test Buttons (Temporary) */}
            <div className="absolute top-10 right-10 flex flex-col gap-2 z-50">
                <div className="text-[10px] font-bold text-amber-900/40 mb-1 ml-2">TUTORIALS</div>
                <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map(lv => (
                        <button
                            key={lv}
                            onClick={() => loadStage('tutorial', lv)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-lg transition-colors text-xs font-bold ${currentCategory === 'tutorial' && currentStage === lv
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-900/60 text-white hover:bg-amber-800'
                                }`}
                        >
                            {lv}
                        </button>
                    ))}
                </div>

                <div className="text-[10px] font-bold text-amber-900/40 mb-1 ml-2">MAIN STAGES</div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(lv => (
                        <button
                            key={lv}
                            onClick={() => loadStage('main', lv)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-lg transition-colors text-xs font-bold ${currentCategory === 'main' && currentStage === lv
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-900/60 text-white hover:bg-amber-800'
                                }`}
                        >
                            {lv}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => nextStage()}
                    className="mt-4 px-4 py-2 bg-green-800/80 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors text-xs font-bold uppercase tracking-widest"
                >
                    Next Stage →
                </button>
            </div>
            {/* Decorative Floating UI Buttons (Themed) - Only show in Game? Or always? Let's keep them always for now or hide in intro if they distract. 
                The user didn't ask to remove them, but they might look weird on Intro. Let's hide them on Intro.
            */}
            {!isIntro && (
                <div className="absolute bottom-10 left-10 flex gap-4 z-50">
                    <button className="w-12 h-12 bg-[#fdfbf7] rounded-full shadow-xl flex items-center justify-center text-amber-700 hover:scale-110 active:scale-95 transition-all border border-amber-100/50">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>
                    </button>
                    <button className="w-12 h-12 bg-[#fdfbf7] rounded-full shadow-xl flex items-center justify-center text-amber-700/60 hover:scale-110 active:scale-95 transition-all border border-amber-100/50">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                    </button>
                </div>
            )}

            <CommitAnimationOverlay />
        </div >
    )
}

export default App
