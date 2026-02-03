import React, { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei'
import { Player } from './Player'
import { MazeManager } from './MazeManager'
import { useGameStore } from '../store/useGameStore'

export const MainScene: React.FC = () => {
    const { currentMaze, initialize, isLoading, error } = useGameStore((state) => ({
        currentMaze: state.currentMaze,
        initialize: state.initialize,
        isLoading: state.isLoading,
        error: state.error
    }))

    useEffect(() => {
        initialize();
    }, [initialize]);

    const playerPosition = currentMaze.playerPosition
    const themeColor = '#2563eb'

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-500 font-mono animate-pulse">Initializing Interface...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-red-500 font-mono text-center">
                    <p className="font-bold">CONNECTION FAILED</p>
                    <p className="text-sm mt-2">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Retry</button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            <div className="relative transform rotate-1 hover:rotate-0 transition-transform duration-300 w-full max-w-[680px]">
                {/* Polaroid Frame */}
                <div className="bg-white p-4 pb-16 shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-sm border border-gray-100 relative">

                    {/* Blue Pins (Decorative) */}
                    <div className="absolute -top-3 left-1/2 -translate-x-12 w-4 h-4 rounded-full bg-blue-500 shadow-sm border-2 border-white/50 z-20" />
                    <div className="absolute -top-3 left-1/2 translate-x-12 w-4 h-4 rounded-full bg-blue-500 shadow-sm border-2 border-white/50 z-20" />

                    {/* Inner 3D Content (Flipped aspect ratio to be shorter) */}
                    <div className="w-full aspect-[3/2] bg-[#f0ebe6] rounded overflow-hidden relative border border-gray-200">
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

                            <fog attach="fog" args={['#f0ebe6', 15, 60]} />
                        </Canvas>

                        {/* Reflection highlight */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                    </div>

                    {/* Polaroid Footer Text */}
                    <span className="font-mono text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] opacity-40">
                        captured_state: {playerPosition.x.toFixed(0)},{playerPosition.z.toFixed(0)}
                    </span>
                </div>
            </div>

            {/* HUD Overlay (Matches Reference) */}
            <div className="absolute -top-4 -left-4 pointer-events-none select-none z-30 font-mono">
                <div className="bg-white/90 backdrop-blur-[2px] p-2.5 rounded-lg shadow-sm border border-gray-100 rotate-[-4deg]">
                    <p className="text-[10px] font-black text-gray-400 mb-0.5">POS ({playerPosition.x.toFixed(0)},{playerPosition.z.toFixed(0)})</p>
                    <p className="text-[11px] font-black text-gray-600">ARROW KEYS TO MOVE</p>
                </div>
            </div>
        </div>
    )
}
