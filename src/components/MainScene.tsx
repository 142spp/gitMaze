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
        <div className="w-full h-full bg-[#fcfdfe] relative">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[6, 15, 15]} fov={40} />
                <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.0}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                />
                <pointLight position={[-10, 10, -10]} intensity={0.4} color={themeColor} />

                <Suspense fallback={null}>
                    <Player />
                    <MazeManager />
                    <Grid
                        infiniteGrid
                        fadeDistance={70}
                        fadeStrength={2.5}
                        sectionColor="#cbd5e1"
                        cellColor="#f1f5f9"
                        sectionThickness={1.2}
                        cellSize={1}
                        sectionSize={5}
                    />
                </Suspense>

                <fog attach="fog" args={['#fcfdfe', 15, 60]} />
            </Canvas>

            {/* HUD Info: Top Left (Matches Reference) */}
            <div className="absolute top-8 left-8 pointer-events-none select-none z-10 font-mono">
                <div className="flex flex-col gap-1.5 bg-white/40 backdrop-blur-[2px] p-2 rounded-sm border-l-2" style={{ borderColor: themeColor }}>
                    <span
                        className="text-[14px] font-black uppercase tracking-[0.2em] hud-text"
                        style={{ color: themeColor }}
                    >
                        POS: [{playerPosition[0].toFixed(0)}, {playerPosition[2].toFixed(0)}]
                    </span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] hud-text">
                        USE ARROW KEYS TO MOVE
                    </span>
                </div>
            </div>

            {/* HUD Info: Bottom Left (Matches Reference) */}
            <div className="absolute bottom-8 left-8 pointer-events-none select-none z-10 font-mono">
                <div className="text-[9px] text-slate-300 flex flex-col gap-1 font-black uppercase tracking-[0.2em] hud-text">
                    <span>RENDER_ENGINE: react_three_fiber</span>
                    <span>FPS: 60</span>
                    <span>LATENCY: 12ms</span>
                </div>
            </div>
        </div>
    )
}
