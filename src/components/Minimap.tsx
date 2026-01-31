import React from 'react'
import { useGameStore } from '../store/useGameStore'

export const Minimap: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)
    const playerPosition = useGameStore((state) => state.playerPosition)

    const branchData = branches[currentBranch]
    const nodes = branchData?.nodes || []
    const themeColor = branchData?.themeColor || '#00ff00'

    // Map limits for calculations
    const size = 100 // Minimap pixel size
    const scale = 5 // Zoom level

    return (
        <div className="absolute top-4 right-4 w-[120px] h-[120px] bg-black/80 border border-green-900/40 backdrop-blur-md p-2 rounded-lg pointer-events-none select-none overflow-hidden">
            <div className="w-full h-full relative border border-green-900/10">
                {/* Render nodes */}
                {nodes.map((node, i) => (
                    <div
                        key={i}
                        className="absolute"
                        style={{
                            width: `${scale}px`,
                            height: `${scale}px`,
                            backgroundColor: node.type === 'wall' ? themeColor : 'transparent',
                            border: node.type === 'floor' ? '1px solid rgba(0, 255, 0, 0.1)' : 'none',
                            left: `${size / 2 + node.position[0] * scale}px`,
                            top: `${size / 2 + node.position[2] * scale}px`,
                            opacity: node.type === 'wall' ? 1 : 0.3,
                        }}
                    />
                ))}

                {/* Player marker */}
                <div
                    className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] z-20"
                    style={{
                        left: `${size / 2 + playerPosition[0] * scale - 1}px`,
                        top: `${size / 2 + playerPosition[2] * scale - 1}px`,
                    }}
                />

                {/* Scan line effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent h-4 w-full animate-scanline pointer-events-none" />
            </div>

            <div className="mt-1 text-[8px] text-green-700 font-bold uppercase tracking-tighter flex justify-between">
                <span>Map: {currentBranch}</span>
                <span>X: {playerPosition[0].toFixed(1)} Z: {playerPosition[2].toFixed(1)}</span>
            </div>
        </div>
    )
}
