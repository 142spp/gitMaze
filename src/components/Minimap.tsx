import React from 'react'
import { useGameStore } from '../store/useGameStore'

export const Minimap: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)
    const playerPosition = useGameStore((state) => state.playerPosition)

    const branchData = branches[currentBranch]
    const themeColor = branchData?.themeColor || '#2563eb'

    // Fixed grid for minimap visual to match "System Map" look
    const miniGridSize = 10
    const cells = Array(miniGridSize * miniGridSize).fill(0)

    return (
        <div className="w-52 h-52 bg-white border border-gray-200 p-3 flex flex-col shadow-2xl rounded-sm font-mono overflow-hidden">
            <div className="flex justify-between items-center mb-2.5 px-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: themeColor }}>
                    System Map
                </span>
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[8px] font-black text-gray-300 tracking-widest">LIVE</span>
                </div>
            </div>

            <div className="flex-1 bg-gray-50 border border-gray-100 relative overflow-hidden rounded-sm group">
                {/* Radar sweep effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-200/50 to-transparent w-full h-[25%] animate-scanline pointer-events-none z-10" />

                {/* Decorative Grid */}
                <div className="grid grid-cols-10 gap-[1px] p-1 h-full opacity-60">
                    {cells.map((_, i) => (
                        <div
                            key={i}
                            className={`
                        bg-white border-[0.5px] border-gray-100 rounded-[1px]
                        ${Math.random() > 0.85 ? 'bg-gray-100' : ''}
                    `}
                        />
                    ))}
                </div>

                {/* Player marker (Simplified position) */}
                <div
                    className="absolute w-3 h-3 rounded-[2px] shadow-lg z-20 flex items-center justify-center transition-all duration-300"
                    style={{
                        backgroundColor: themeColor,
                        left: `${((playerPosition[0] + 5) / 10) * 100}%`,
                        top: `${((playerPosition[2] + 5) / 10) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 10px ${themeColor}66`
                    }}
                >
                    <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-black text-gray-400 tracking-tighter uppercase px-0.5">
                <div className="flex justify-between">
                    <span>X:</span>
                    <span className="text-gray-900">{playerPosition[0].toFixed(0).padStart(3, '0')}</span>
                </div>
                <div className="flex justify-between">
                    <span>Y:</span>
                    <span className="text-gray-900">{playerPosition[2].toFixed(0).padStart(3, '0')}</span>
                </div>
                <div className="flex justify-between">
                    <span>SEC:</span>
                    <span className="text-gray-900">4B-99</span>
                </div>
                <div className="flex justify-between">
                    <span>CONN:</span>
                    <span style={{ color: themeColor }}>STABLE</span>
                </div>
            </div>
        </div>
    )
}
