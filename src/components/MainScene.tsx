import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei'
import { Player } from './Player'
import { MazeManager } from './MazeManager'
import { useGameStore } from '../store/useGameStore'

export const MainScene: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)
    const playerPosition = useGameStore((state) => state.playerPosition)
    const themeColor = branches[currentBranch]?.themeColor || '#2563eb'

    return (
        <div className="w-full h-full bg-[#f8fafc] relative">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[5, 12, 12]} fov={45} />
                <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

                <ambientLight intensity={0.6} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-10, 10, -10]} intensity={0.5} />

                <Suspense fallback={null}>
                    <Player />
                    <MazeManager />
                    <Grid
                        infiniteGrid
                        fadeDistance={60}
                        fadeStrength={2}
                        sectionColor="#cbd5e1"
                        cellColor="#f1f5f9"
                        sectionThickness={1.5}
                        cellSize={1}
                        sectionSize={5}
                    />
                </Suspense>

                <fog attach="fog" args={['#f8fafc', 10, 50]} />
            </Canvas>

            {/* Floating UI Elements: Top Left */}
            <div className="absolute top-6 left-6 pointer-events-none select-none z-10 font-mono">
                <div className="flex flex-col gap-1">
                    <span
                        className="text-[13px] font-black uppercase tracking-widest"
                        style={{ color: themeColor }}
                    >
                        POS: [{playerPosition[0].toFixed(0)}, {playerPosition[2].toFixed(0)}]
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest italic opacity-70">
                        Use arrow keys to move
                    </span>
                </div>
            </div>

            {/* Floating UI Elements: Bottom Left */}
            <div className="absolute bottom-6 left-6 pointer-events-none select-none z-10 font-mono">
                <div className="text-[9px] text-gray-400 flex flex-col gap-0.5 font-bold uppercase tracking-widest opacity-60">
                    <span>RENDER_ENGINE: react_three_fiber</span>
                    <span>FPS: 60</span>
                    <span>LATENCY: 12ms</span>
                </div>
            </div>
        </div>
    )
}
