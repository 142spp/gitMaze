import React, { useMemo } from 'react'
import { useGameStore } from '../store/useGameStore'

export const Minimap: React.FC = () => {
    const git = useGameStore((state) => state.git)
    const currentMaze = useGameStore((state) => state.currentMaze)
    const playerPosition = currentMaze.playerPosition

    const themeColor = '#2563eb'

    const visitedCells = useGameStore((state) => state.visitedCells)
    const { width, height, grid } = currentMaze

    // Generate grid based on actual maze dimensions
    const gridCells = useMemo(() => {
        const cells = []
        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                cells.push({ x, z })
            }
        }
        return cells
    }, [width, height])

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

                <div className="flex-1 bg-amber-900/5 border border-amber-900/10 relative overflow-hidden rounded-sm flex items-center justify-center p-2">
                    {/* Grid Layout Container with 1.2x zoom-out */}
                    <div
                        className="relative"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${width}, 1fr)`,
                            gap: '1px',
                            width: '83.33%', // 100% / 1.2 for 1.2x zoom-out effect
                            aspectRatio: `${width}/${height}`
                        }}
                    >
                        {gridCells.map((cell) => {
                            const isVisited = visitedCells.has(`${cell.x},${cell.z}`)
                            const tileType = grid && grid[cell.z] ? grid[cell.z][cell.x] : 'void'

                            let bgColor = 'transparent'
                            if (isVisited) {
                                // 방문한 칸: 색칠
                                if (tileType === 'solid') bgColor = '#d4af37' // Gold/Brown for visited floor
                                else if (tileType === 'pit') bgColor = '#2c1810' // Dark for pit
                                else bgColor = 'transparent'
                            } else {
                                // 미방문 칸: void는 투명, 도달 가능한 칸은 반투명
                                if (tileType === 'void') {
                                    bgColor = 'transparent' // 도달할 수 없는 칸
                                } else if (tileType === 'solid' || tileType === 'pit') {
                                    bgColor = 'rgba(44, 24, 16, 0.05)' // 도달 가능하지만 미방문 (Fog)
                                } else {
                                    bgColor = 'transparent'
                                }
                            }

                            return (
                                <div
                                    key={`${cell.x}-${cell.z}`}
                                    className="w-full h-full rounded-[1px] transition-colors duration-500"
                                    style={{ backgroundColor: bgColor }}
                                />
                            )
                        })}

                        {/* Player Dot - Absolute positioned relative to grid container */}
                        <div
                            className="absolute w-2 h-2 rounded-full z-20 flex items-center justify-center transition-all duration-300 pointer-events-none"
                            style={{
                                backgroundColor: themeColor,
                                left: `${(playerPosition.x / width) * 100 + (100 / width / 2)}%`,
                                top: `${(playerPosition.z / height) * 100 + (100 / height / 2)}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <div className="w-full h-full bg-white rounded-full animate-ping opacity-20" />
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] font-black text-amber-900/50 tracking-tighter px-1">
                    <div className="flex justify-between border-b border-amber-900/10 pb-0.5">
                        <span>X:</span>
                        <span className="text-amber-900">{playerPosition.x.toFixed(0).padStart(3, '0')}</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-900/10 pb-0.5">
                        <span>Z:</span>
                        <span className="text-amber-900">{playerPosition.z.toFixed(0).padStart(3, '0')}</span>
                    </div>
                </div>
            </div>
        </div>
    )
    // End of Component Rendering
    /* Removing old random grid logic */
}
