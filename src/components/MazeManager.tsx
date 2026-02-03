import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3 } from 'three'
import { useGameStore } from '../store/useGameStore'
import { Wall, Item } from '../lib/git/types'

const tempObject = new Object3D()
const tempColor = new Color()

export const MazeManager: React.FC = () => {
    const currentMaze = useGameStore((state) => state.currentMaze)
    const { width, height, walls, items } = currentMaze

    const wallRef = useRef<InstancedMesh>(null)
    const floorRef = useRef<InstancedMesh>(null)
    const gemRef = useRef<InstancedMesh>(null)

    const themeColor = '#2563eb'

    // Compute Floor Transforms
    // We create a floor for every 1x1 cell in the width x height grid
    const floorTransforms = useMemo(() => {
        const t: { x: number, z: number }[] = []
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < height; z++) {
                t.push({ x, z })
            }
        }
        return t
    }, [width, height])

    useEffect(() => {
        // Update Floor Internals
        if (floorRef.current) {
            floorTransforms.forEach((pos, i) => {
                // Offset by 0.5 to center tiles between integer grid lines (walls)
                tempObject.position.set(pos.x + 0.5, -0.25, pos.z + 0.5)
                tempObject.rotation.set(0, 0, 0)
                tempObject.scale.set(1, 1, 1)
                tempObject.updateMatrix()
                floorRef.current!.setMatrixAt(i, tempObject.matrix)

                // Checkerboard pattern or simple color
                const isEven = (pos.x + pos.z) % 2 === 0
                tempColor.set(isEven ? '#f8fafc' : '#f1f5f9')
                floorRef.current!.setColorAt(i, tempColor)
            })
            floorRef.current.instanceMatrix.needsUpdate = true
            if (floorRef.current.instanceColor) floorRef.current.instanceColor.needsUpdate = true
        }

        // Update Walls
        if (wallRef.current) {
            let activeWallIndex = 0;
            walls.forEach((wall) => {
                if (wall.opened) return; // Skip opened walls (doors)

                // Skip Outer Walls (Boundary)
                // Vertical walls at x=0 or x=width
                if (wall.type === 'VERTICAL' && (wall.startX === 0 || wall.startX === width)) return;
                // Horizontal walls at z=0 or z=height
                if (wall.type === 'HORIZONTAL' && (wall.startZ === 0 || wall.startZ === height)) return;

                // Calculate center position
                // Logic: (startX + endX) / 2, (startZ + endZ) / 2
                const cx = (wall.startX + wall.endX) / 2;
                const cz = (wall.startZ + wall.endZ) / 2;

                tempObject.position.set(cx, 0.5, cz);

                // Calculate Rotation & Scale
                // If Type is VERTICAL (extends along Z), rotated 0 (or 180).
                // If Type is HORIZONTAL (extends along X), rotated 90 degrees.
                if (wall.type === 'HORIZONTAL') {
                    tempObject.rotation.set(0, Math.PI / 2, 0)
                    // Length adjustment if ends are far apart, but assuming 1 unit length for now based on JSON
                } else {
                    tempObject.rotation.set(0, 0, 0)
                }

                tempObject.scale.set(0.2, 0.9, 1.1) // Thickness, Height, Length
                tempObject.updateMatrix()

                wallRef.current!.setMatrixAt(activeWallIndex, tempObject.matrix)

                // Active/Inactive color
                tempColor.set(themeColor)
                wallRef.current!.setColorAt(activeWallIndex, tempColor)

                activeWallIndex++;
            })

            // Should set count to actual number of visible walls ?
            // For now, we allocated max size (walls.length) but some are invisible.
            // InstancedMesh doesn't easily support variable count without strict management.
            // Strategy: Move unused instances to infinity.
            for (let j = activeWallIndex; j < walls.length; j++) {
                tempObject.position.set(0, -999, 0)
                tempObject.updateMatrix()
                wallRef.current!.setMatrixAt(j, tempObject.matrix)
            }

            wallRef.current.instanceMatrix.needsUpdate = true
            if (wallRef.current.instanceColor) wallRef.current.instanceColor.needsUpdate = true
        }

        // Update Items (Gems)
        if (gemRef.current) {
            items.forEach((item, i) => {
                // Offset by 0.5 to center items in cells
                tempObject.position.set(item.x + 0.5, 0.5, item.z + 0.5)
                tempObject.rotation.set(0, 0, 0)
                tempObject.scale.set(0.3, 0.3, 0.3)
                tempObject.updateMatrix()
                gemRef.current!.setMatrixAt(i, tempObject.matrix)

                tempColor.set('#f59e0b')
                gemRef.current!.setColorAt(i, tempColor)
            })
            gemRef.current.instanceMatrix.needsUpdate = true
            if (gemRef.current.instanceColor) gemRef.current.instanceColor.needsUpdate = true
        }

    }, [width, height, walls, items, floorTransforms])

    useFrame((state) => {
        // Animate Items
        if (gemRef.current) {
            items.forEach((item, i) => {
                const time = state.clock.elapsedTime
                const yOffset = Math.sin(time * 2 + i) * 0.1
                tempObject.position.set(item.x + 0.5, 0.5 + yOffset, item.z + 0.5)
                tempObject.rotation.y += 0.02
                tempObject.rotation.z = Math.sin(time) * 0.1
                tempObject.scale.set(0.3, 0.3, 0.3)

                tempObject.updateMatrix()
                gemRef.current!.setMatrixAt(i, tempObject.matrix)
            })
            gemRef.current.instanceMatrix.needsUpdate = true
        }
    })

    return (
        <group>
            {/* Floors */}
            <instancedMesh ref={floorRef} args={[undefined, undefined, width * height]} receiveShadow>
                <boxGeometry args={[0.95, 0.5, 0.95]} />
                <meshStandardMaterial color="#f1f5f9" />
            </instancedMesh>

            {/* Walls */}
            <instancedMesh ref={wallRef} args={[undefined, undefined, walls.length]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial transparent opacity={0.9} metalness={0.8} roughness={0.2} />
            </instancedMesh>

            {/* Items */}
            <instancedMesh ref={gemRef} args={[undefined, undefined, items.length]} castShadow>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial emissive="#f59e0b" emissiveIntensity={1} color="#f59e0b" />
            </instancedMesh>
        </group>
    )
}

