import React, { useMemo } from 'react'
import { useGameStore } from '../store/useGameStore'

export const Minimap: React.FC = () => {
    const git = useGameStore((state) => state.git)
    const currentMaze = useGameStore((state) => state.currentMaze)
    const playerPosition = currentMaze.playerPosition

    const themeColor = '#2563eb'

    const gridCells = useMemo(() => {
        return Array(64).fill(0).map(() => Math.random() > 0.8)
    }, [])

    return (
        <div className="w-full h-full p-4 flex flex-col font-mono relative">
            {/* Sticky Note Appearance */}
            <div className="absolute inset-2 bg-yellow-100/80 shadow-md transform -rotate-1 border-b-2 border-yellow-200/50" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-[10px] font-black tracking-[0.2em] text-amber-900/40 uppercase">
                        SYSTEM_MAP
                    </span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black text-amber-900/30">SYNCED</span>
                    </div>
                </div>

                <div className="flex-1 bg-amber-900/5 border border-amber-900/10 relative overflow-hidden rounded-sm">
                    {/* Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '15px 15px' }}
                    />

                    <div
                        className="absolute w-3 h-3 rounded-full z-20 flex items-center justify-center transition-all duration-300"
                        style={{
                            backgroundColor: themeColor,
                            left: `${((playerPosition.x + 5) / 10) * 100}%`,
                            top: `${((playerPosition.y + 5) / 10) * 100}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <div className="w-full h-full bg-white rounded-full animate-ping opacity-20" />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] font-black text-amber-900/50 tracking-tighter px-1">
                    <div className="flex justify-between border-b border-amber-900/10 pb-0.5">
                        <span>X:</span>
                        <span className="text-amber-900">{playerPosition.x.toFixed(0).padStart(3, '0')}</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-900/10 pb-0.5">
                        <span>Y:</span>
                        <span className="text-amber-900">{playerPosition.y.toFixed(0).padStart(3, '0')}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
