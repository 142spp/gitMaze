import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Stars, PerspectiveCamera } from '@react-three/drei'
import { Player } from './Player'
import { MazeManager } from './MazeManager'
import { useGameStore } from '../store/useGameStore'

export const MainScene: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)

    return (
        <div className="w-full h-full bg-[#050505]">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[5, 10, 10]} fov={50} />
                <OrbitControls makeDefault />

                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ff00" />
                <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />

                <Suspense fallback={null}>
                    <Player />
                    <MazeManager />
                    <Grid
                        infiniteGrid
                        fadeDistance={50}
                        fadeStrength={3}
                        sectionColor="#111"
                        cellColor="#050505"
                    />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                </Suspense>
            </Canvas>

            {/* HUD Info */}
            <div className="absolute top-4 left-4 pointer-events-none select-none">
                <h1 className="text-3xl font-black text-green-500 tracking-tighter uppercase italic drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                    Git Maze
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-green-950 text-green-400 px-1.5 py-0.5 border border-green-800 font-bold uppercase">
                        Dimension
                    </span>
                    <p className="text-sm text-green-300 font-mono font-bold tracking-widest">{currentBranch.toUpperCase()}</p>
                </div>
            </div>
        </div>
    )
}
