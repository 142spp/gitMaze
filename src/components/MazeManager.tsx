import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color } from 'three'
import { useGameStore } from '../store/useGameStore'

const tempObject = new Object3D()
const tempColor = new Color()

export const MazeManager: React.FC = () => {
    const currentBranch = useGameStore((state) => state.currentBranch)
    const branches = useGameStore((state) => state.branches)

    const wallRef = useRef<InstancedMesh>(null)
    const floorRef = useRef<InstancedMesh>(null)

    const branchData = branches[currentBranch]
    const nodes = branchData?.nodes || []
    const themeColor = branchData?.themeColor || '#00ff00'

    const { walls, floors } = useMemo(() => {
        const w = nodes.filter(n => n.type === 'wall')
        const f = nodes.filter(n => n.type === 'floor')
        return { walls: w, floors: f }
    }, [nodes])

    useEffect(() => {
        // Update Floors
        if (floorRef.current) {
            floors.forEach((node, i) => {
                tempObject.position.set(...node.position)
                tempObject.updateMatrix()
                floorRef.current!.setMatrixAt(i, tempObject.matrix)

                // Add subtle variety to floor colors
                tempColor.set(themeColor).multiplyScalar(0.8 + Math.random() * 0.2)
                floorRef.current!.setColorAt(i, tempColor)
            })
            floorRef.current.instanceMatrix.needsUpdate = true
            if (floorRef.current.instanceColor) floorRef.current.instanceColor.needsUpdate = true
        }

        // Update Walls
        if (wallRef.current) {
            walls.forEach((node, i) => {
                tempObject.position.set(...node.position)
                tempObject.updateMatrix()
                wallRef.current!.setMatrixAt(i, tempObject.matrix)

                tempColor.set(themeColor)
                wallRef.current!.setColorAt(i, tempColor)
            })
            wallRef.current.instanceMatrix.needsUpdate = true
            if (wallRef.current.instanceColor) wallRef.current.instanceColor.needsUpdate = true
        }
    }, [walls, floors, themeColor])

    useFrame((state) => {
        // Dimonsion shifting VFX could be applied here
        // e.g., pulsing colors or slight position offsets
    })

    return (
        <group>
            {/* Floors */}
            <instancedMesh ref={floorRef} args={[undefined, undefined, floors.length]}>
                <boxGeometry args={[1, 0.1, 1]} />
                <meshStandardMaterial metalness={0.8} roughness={0.2} transparent opacity={0.8} />
            </instancedMesh>

            {/* Walls */}
            <instancedMesh ref={wallRef} args={[undefined, undefined, walls.length]}>
                <boxGeometry args={[1, 2, 1]} />
                <meshStandardMaterial metalness={0.9} roughness={0.1} />
            </instancedMesh>
        </group>
    )
}
