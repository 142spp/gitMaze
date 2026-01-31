import React, { useMemo } from 'react'
import { useGameStore } from '../store/useGameStore'

export const Minimap: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)
    const playerPosition = useGameStore((state) => state.playerPosition)

    const branchData = branches[currentBranch]
    const themeColor = branchData?.themeColor || '#2563eb'

    const gridCells = useMemo(() => {
        return Array(64).fill(0).map(() => Math.random() > 0.8)
    }, [])

    return (
        <div className="w-full h-full bg-white p-4 flex flex-col font-mono">
            <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-[10px] font-black tracking-[0.2em] hud-text" style={{ color: themeColor }}>
                    SYSTEM_MAP
                </span>
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-300 hud-text">LIVE</span>
                </div>
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-100 relative overflow-hidden rounded-sm group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-200/40 to-transparent w-full h-[30%] animate-scanline pointer-events-none z-10" />

                <div className="grid grid-cols-8 gap-[1px] p-2 h-full opacity-40">
                    {gridCells.map((active, i) => (
                        <div
                            key={i}
                            className={`
                        border-[0.5px] border-slate-100/30 rounded-[1px]
                        ${active ? 'bg-slate-200' : 'bg-white'}
                    `}
                        />
                    ))}
                </div>

                <div
                    className="absolute w-4 h-4 rounded-[1px] z-20 flex items-center justify-center transition-all duration-300"
                    style={{
                        backgroundColor: themeColor,
                        left: `${((playerPosition[0] + 5) / 10) * 100}%`,
                        top: `${((playerPosition[2] + 5) / 10) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 10px ${themeColor}44`
                    }}
                >
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] font-black text-slate-400 tracking-tighter hud-text px-1">
                <div className="flex justify-between border-b border-slate-50 pb-0.5">
                    <span>X:</span>
                    <span className="text-slate-900">{playerPosition[0].toFixed(0).padStart(3, '0')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-0.5">
                    <span>Y:</span>
                    <span className="text-slate-900">{playerPosition[2].toFixed(0).padStart(3, '0')}</span>
                </div>
            </div>
        </div>
    )
}
