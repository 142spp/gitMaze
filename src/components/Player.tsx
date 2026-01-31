import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/useGameStore'
import { Mesh } from 'three'

export const Player: React.FC = () => {
    const meshRef = useRef<Mesh>(null)
    const playerPosition = useGameStore((state) => state.playerPosition)

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Sync position with Zustand state (smoothing could be added here later)
            meshRef.current.position.set(playerPosition[0], playerPosition[1], playerPosition[2])

            // Subtle float animation
            meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.1
            meshRef.current.rotation.y += delta
        }
    })

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
        </mesh>
    )
}
