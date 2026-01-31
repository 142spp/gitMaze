import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, MeshStandardMaterial } from 'three'
import { useGameStore } from '../store/useGameStore'
import { Edges } from '@react-three/drei'

const tempObject = new Object3D()
const tempColor = new Color()

export const MazeManager: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)

    const wallRef = useRef<InstancedMesh>(null)
    const floorRef = useRef<InstancedMesh>(null)
    const gemRef = useRef<InstancedMesh>(null)

    const branchData = branches[currentBranch]
    const nodes = branchData?.nodes || []
    const themeColor = branchData?.themeColor || '#2563eb'

    const { walls, floors, gems } = useMemo(() => {
        const w = nodes.filter(n => n.type === 'wall')
        const f = nodes.filter(n => n.type === 'floor')
        // Mocking some gems for visual interest
        const g = f.filter((_, i) => i % 15 === 0)
        return { walls: w, floors: f, gems: g }
    }, [nodes])

    useEffect(() => {
        // Update Floors
        if (floorRef.current) {
            floors.forEach((node, i) => {
                tempObject.position.set(node.position[0], 0, node.position[2])
                tempObject.scale.set(1, 1, 1)
                tempObject.updateMatrix()
                floorRef.current!.setMatrixAt(i, tempObject.matrix)

                tempColor.set('#ffffff')
                floorRef.current!.setColorAt(i, tempColor)
            })
            floorRef.current.instanceMatrix.needsUpdate = true
            if (floorRef.current.instanceColor) floorRef.current.instanceColor.needsUpdate = true
        }

        // Update Walls
        if (wallRef.current) {
            walls.forEach((node, i) => {
                tempObject.position.set(node.position[0], 0.7, node.position[2])
                tempObject.scale.set(0.9, 1.4, 0.9)
                tempObject.updateMatrix()
                wallRef.current!.setMatrixAt(i, tempObject.matrix)

                tempColor.set(themeColor).multiplyScalar(1.2)
                wallRef.current!.setColorAt(i, tempColor)
            })
            wallRef.current.instanceMatrix.needsUpdate = true
            if (wallRef.current.instanceColor) wallRef.current.instanceColor.needsUpdate = true
        }

        // Update Gems
        if (gemRef.current) {
            gems.forEach((node, i) => {
                tempObject.position.set(node.position[0], 0.5, node.position[2])
                tempObject.scale.set(0.2, 0.2, 0.2)
                tempObject.updateMatrix()
                gemRef.current!.setMatrixAt(i, tempObject.matrix)

                tempColor.set('#f59e0b') // Amber/Yellow
                gemRef.current!.setColorAt(i, tempColor)
            })
            gemRef.current.instanceMatrix.needsUpdate = true
            if (gemRef.current.instanceColor) gemRef.current.instanceColor.needsUpdate = true
        }
    }, [walls, floors, gems, themeColor])

    useFrame((state) => {
        if (gemRef.current) {
            gems.forEach((node, i) => {
                tempObject.position.set(node.position[0], 0.4 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.1, node.position[2])
                tempObject.rotation.y += 0.05
                tempObject.scale.set(0.2, 0.2, 0.2)
                tempObject.updateMatrix()
                gemRef.current!.setMatrixAt(i, tempObject.matrix)
            })
            gemRef.current.instanceMatrix.needsUpdate = true
        }
    })

    return (
        <group>
            {/* Floors: Subtle grid tiles */}
            <instancedMesh ref={floorRef} args={[undefined, undefined, floors.length]} receiveShadow>
                <boxGeometry args={[0.98, 0.05, 0.98]} />
                <meshStandardMaterial metalness={0.1} roughness={0.8} />
            </instancedMesh>

            {/* Walls: High-tech pillars */}
            <instancedMesh ref={wallRef} args={[undefined, undefined, walls.length]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial metalness={0.9} roughness={0.1} transparent opacity={0.8} />
            </instancedMesh>

            {/* Data Nodes (Gems) */}
            <instancedMesh ref={gemRef} args={[undefined, undefined, gems.length]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial emissive="#f59e0b" emissiveIntensity={2} color="#f59e0b" />
            </instancedMesh>
        </group>
    )
}
