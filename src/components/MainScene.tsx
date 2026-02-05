import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei'
import { Player } from './Player'
import { MazeManager } from './MazeManager'
import { useGameStore } from '../store/useGameStore'
import * as THREE from 'three'

const CameraFollower: React.FC = () => {
    const currentMaze = useGameStore((state) => state.currentMaze)
    const playerPos = currentMaze.playerPosition
    const { camera, gl } = useThree()
    const controlsRef = useRef<any>(null)

    useFrame((state, delta) => {
        if (controlsRef.current) {
            const targetX = playerPos.x + 0.5
            const targetZ = playerPos.z + 0.5
            const targetVec = new THREE.Vector3(targetX, 0, targetZ)

            // 1. Get current target and offset
            const prevTarget = controlsRef.current.target.clone()

            // 2. Lerp target to player position
            controlsRef.current.target.lerp(targetVec, 0.1)

            // 3. Move camera by the same amount the target moved
            // This ensures we maintain the same viewing angle/distance (no rotation/zoom effect)
            const targetDelta = controlsRef.current.target.clone().sub(prevTarget)
            camera.position.add(targetDelta)

            controlsRef.current.update()
        }
    })

    return (
        <OrbitControls
            ref={controlsRef}
            args={[camera, gl.domElement]}
            makeDefault
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2 - 0.1}
        />
    )
}

export const MainScene: React.FC = () => {
    // 렌더링에 필요한 전역 상태 구독
    const { currentMaze, initialize, isLoading, error } = useGameStore((state) => ({
        currentMaze: state.currentMaze,
        initialize: state.initialize,
        isLoading: state.isLoading,
        error: state.error
    }))

    // 컴포넌트 마운트 시 초기화 로직 실행 (세션 복구 또는 새 미로 생성)
    useEffect(() => {
        initialize();
    }, []); // Only run once on mount

    const playerPosition = currentMaze.playerPosition
    const themeColor = '#2563eb'

    // 로딩 상태 표시
    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-500 font-mono animate-pulse">Initializing Interface...</div>
            </div>
        )
    }

    // 에러 발생 시 재시도 UI 표시
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
                {/* 폴라로이드 스타일 프레임 UI */}
                <div
                    id="polaroid-frame"
                    className="bg-white p-4 pb-16 shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-sm border border-gray-100 relative"
                >

                    {/* 상단 장식용 핀 */}
                    <div className="absolute -top-3 left-1/2 -translate-x-12 w-4 h-4 rounded-full bg-blue-500 shadow-sm border-2 border-white/50 z-20" />
                    <div className="absolute -top-3 left-1/2 translate-x-12 w-4 h-4 rounded-full bg-blue-500 shadow-sm border-2 border-white/50 z-20" />

                    {/* 메인 3D 캔버스 영역 */}
                    <div className="w-full aspect-[3/2] bg-[#f0ebe6] rounded overflow-hidden relative border border-gray-200">
                        <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
                            <PerspectiveCamera makeDefault position={[6, 15, 15]} fov={40} />
                            <CameraFollower />
                            <ambientLight intensity={0.7} />
                            <directionalLight
                                position={[10, 20, 10]}
                                intensity={1.0}
                                castShadow
                                shadow-mapSize={[2048, 2048]}
                            />
                            <pointLight position={[-10, 10, -10]} intensity={0.4} color={themeColor} />

                            <Suspense fallback={null}>
                                {/* 플레이어 아바타 */}
                                <Player />
                                {/* 미로 지형 관리자 */}
                                <MazeManager />
                                {/* 보조 그리드 가이드 */}
                                {/* 보조 그리드 가이드 (Removed for cleaner look) */}
                                {/* <Grid
                                    infiniteGrid
                                    fadeDistance={70}
                                    fadeStrength={2.5}
                                    sectionColor="#cbd5e1"
                                    cellColor="#f1f5f9"
                                    sectionThickness={1.2}
                                    cellSize={1}
                                    sectionSize={5}
                                /> */}
                            </Suspense>

                            {/* 대기 효과 (Fog) */}
                            <fog attach="fog" args={['#f0ebe6', 15, 60]} />
                        </Canvas>

                        {/* 렌즈 하이라이트 효과 */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                    </div>

                    {/* 폴라로이드 하단 텍스트 (현재 위치 등 표시) */}
                    <span className="font-mono text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] opacity-40">
                        captured_state: {playerPosition.x.toFixed(0)},{playerPosition.z.toFixed(0)}
                    </span>
                </div>
            </div>

            {/* 화면 좌상단 HUD: 현재 정보 및 조작법 */}
            <div className="absolute -top-4 -left-4 pointer-events-none select-none z-30 font-mono">
                <div className="bg-white/90 backdrop-blur-[2px] p-2.5 rounded-lg shadow-sm border border-gray-100 rotate-[-4deg]">
                    <p className="text-[10px] font-black text-gray-400 mb-0.5">POS ({playerPosition.x.toFixed(0)},{playerPosition.z.toFixed(0)})</p>
                    <p className="text-[11px] font-black text-gray-600">ARROW KEYS TO MOVE</p>
                </div>
            </div>
        </div>
    )
}
