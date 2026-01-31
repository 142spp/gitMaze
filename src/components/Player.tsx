import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/useGameStore'
import { Mesh, Group } from 'three'
import { Edges } from '@react-three/drei'

export const Player: React.FC = () => {
    const groupRef = useRef<Group>(null)
    const playerPosition = useGameStore((state) => state.playerPosition)
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)
    const themeColor = branches[currentBranch]?.themeColor || '#2563eb'

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Sync position with smoothing
            groupRef.current.position.lerp({
                x: playerPosition[0],
                y: 0.5 + Math.sin(state.clock.elapsedTime * 2.5) * 0.15, // Float
                z: playerPosition[2]
            }, 0.1)

            groupRef.current.rotation.y += delta * 1.5
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1
        }
    })

    return (
        <group ref={groupRef}>
            {/* Main Cube */}
            <mesh castShadow>
                <boxGeometry args={[0.7, 0.7, 0.7]} />
                <meshStandardMaterial
                    color={themeColor}
                    emissive={themeColor}
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.9}
                />
                <Edges scale={1.1} threshold={15} color="#fff" />
            </mesh>

            {/* Outer Glow / Shield */}
            <mesh scale={1.3}>
                <boxGeometry args={[0.7, 0.7, 0.7]} />
                <meshStandardMaterial
                    color={themeColor}
                    transparent
                    opacity={0.1}
                    wireframe
                />
            </mesh>
        </group>
    )
}
