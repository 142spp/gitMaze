import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, DoubleSide } from 'three'
import { Edges } from '@react-three/drei'
import { useGameStore } from '../store/useGameStore'
import { WorldEnvironment } from './WorldEnvironment'

const tempObject = new Object3D()
const tempColor = new Color()

/**
 * MazeManager: 타일 기반 퍼즐 지형과 아이템을 렌더링합니다.
 * 성능 최적화를 위해 InstancedMesh를 사용합니다.
 */
export const MazeManager: React.FC = () => {
    const currentMaze = useGameStore((state) => state.currentMaze)
    const deathCount = useGameStore((state) => state.deathCount)
    const { width, height, walls, items } = currentMaze
    const rawGrid = currentMaze.grid

    // Process grid: reveal hidden tiles after death
    const grid = useMemo(() => {
        if (deathCount === 0) return rawGrid;

        return rawGrid.map(row =>
            row.map(cell => cell === 'hidden' ? 'solid' : cell)
        );
    }, [rawGrid, deathCount]);

    const wallRef = useRef<InstancedMesh>(null)
    const floorRef = useRef<InstancedMesh>(null)
    // pitRef removed
    // highlightRef removed
    const gemRef = useRef<InstancedMesh>(null)

    const cubeBlockRef = useRef<InstancedMesh>(null)
    const sphereBlockRef = useRef<InstancedMesh>(null)
    const tetraBlockRef = useRef<InstancedMesh>(null)
    const cylinderBlockRef = useRef<InstancedMesh>(null)

    const themeColor = '#2563eb'

    // Calculate floor positions from grid
    const floorTiles = useMemo(() => {
        const solid: { x: number, z: number, type: string }[] = [];
        const pits: { x: number, z: number }[] = [];

        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                const tile = grid[z][x];
                if (tile === 'solid') solid.push({ x, z, type: 'solid' });
                else if (tile.startsWith('filled_')) solid.push({ x, z, type: tile });
                else if (tile === 'pit') pits.push({ x, z });
            }
        }
        return { solid, pits };
    }, [width, height, grid]);

    // Calculate Highlight Data (Pits adjacent to blocks AND Plates/Hints)
    const highlightData = useMemo(() => {
        const data: { x: number, z: number, color: string, type: 'pit' | 'plate' }[] = [];

        // 1. Pits Logic (Deep Hole with Hint if block adjacent)
        const blocks = items.filter(it => it.type.startsWith('block_'));

        floorTiles.pits.forEach(pit => {
            // Check neighbors for blocks
            const neighbors = [
                { x: pit.x + 1, z: pit.z },
                { x: pit.x - 1, z: pit.z },
                { x: pit.x, z: pit.z + 1 },
                { x: pit.x, z: pit.z - 1 },
            ];

            const adjacentBlock = blocks.find(b =>
                neighbors.some(n => n.x === b.x && n.z === b.z)
            );

            if (adjacentBlock) {
                let color = '#ffffff';
                if (adjacentBlock.type === 'block_cube') color = '#ef4444';
                else if (adjacentBlock.type === 'block_sphere') color = '#f97316';
                else if (adjacentBlock.type === 'block_tetra') color = '#8b5cf6';
                else if (adjacentBlock.type === 'block_cylinder') color = '#1e3a8a';

                data.push({ x: pit.x, z: pit.z, color, type: 'pit' });
            }
        });

        // 2. Plates Logic (Surface Hints)
        items.forEach(it => {
            if (it.type.startsWith('plate_')) {
                let color = '#ffffff';
                if (it.type === 'plate_cube') color = '#ef4444'; // Match Block Color (Red)
                else if (it.type === 'plate_sphere') color = '#f97316'; // Match Block Color (Orange)
                else if (it.type === 'plate_tetra') color = '#8b5cf6'; // Match Block Color (Purple)
                else if (it.type === 'plate_cylinder') color = '#1e3a8a'; // Match Block Color (Navy)

                // Add as 'plate' type highlight
                data.push({ x: it.x, z: it.z, color, type: 'plate' });
            }
        });

        return data;
    }, [items, floorTiles.pits]);

    useEffect(() => {
        // Solid Floors
        if (floorRef.current) {
            floorTiles.solid.forEach((tile, i) => {
                tempObject.position.set(tile.x + 0.5, -1.0, tile.z + 0.5);
                tempObject.rotation.set(0, 0, 0);
                tempObject.scale.set(1, 1, 1);
                tempObject.updateMatrix();
                floorRef.current!.setMatrixAt(i, tempObject.matrix);

                // Determine Color
                let color = '#fde68a'; // Default Sand

                if (tile.type === 'filled_block_cube') color = '#ef4444'; // Red
                else if (tile.type === 'filled_block_sphere') color = '#f97316'; // Orange
                else if (tile.type === 'filled_block_tetra') color = '#8b5cf6'; // Purple
                else if (tile.type === 'filled_block_cylinder') color = '#1e3a8a'; // Navy
                else {
                    // Normal Solid Logic
                    const isStartPos = tile.x === currentMaze.startPos.x && tile.z === currentMaze.startPos.z;
                    color = isStartPos ? '#a7f3d0' : '#fde68a'; // Mint Green if Start, else Sand
                }

                tempColor.set(color);
                floorRef.current!.setColorAt(i, tempColor);
            });
            for (let j = floorTiles.solid.length; j < width * height; j++) {
                tempObject.position.set(0, -999, 0);
                tempObject.updateMatrix();
                floorRef.current!.setMatrixAt(j, tempObject.matrix);
            }
            floorRef.current.instanceMatrix.needsUpdate = true;
            if (floorRef.current.instanceColor) floorRef.current.instanceColor.needsUpdate = true;
        }

        // Pits (Visual removed to show Sea)


        // Highlights
        // Highlights (Using Edges component directly in Render)


        // Walls (legacy)
        if (wallRef.current && walls.length > 0) {
            let activeWallIndex = 0;
            walls.forEach((wall) => {
                if (wall.opened) return;
                if (wall.type === 'VERTICAL' && (wall.startX === 0 || wall.startX === width)) return;
                if (wall.type === 'HORIZONTAL' && (wall.startZ === 0 || wall.startZ === height)) return;

                const cx = (wall.startX + wall.endX) / 2;
                const cz = (wall.startZ + wall.endZ) / 2;
                tempObject.position.set(cx, 0.5, cz);
                if (wall.type === 'HORIZONTAL') tempObject.rotation.set(0, Math.PI / 2, 0)
                else tempObject.rotation.set(0, 0, 0)

                tempObject.scale.set(0.15, 0.9, 1.05)
                tempObject.updateMatrix()
                wallRef.current!.setMatrixAt(activeWallIndex, tempObject.matrix)
                tempColor.set(themeColor)
                wallRef.current!.setColorAt(activeWallIndex, tempColor)
                activeWallIndex++;
            })
            for (let j = activeWallIndex; j < walls.length; j++) {
                tempObject.position.set(0, -999, 0)
                tempObject.updateMatrix()
                wallRef.current!.setMatrixAt(j, tempObject.matrix)
            }
            wallRef.current.instanceMatrix.needsUpdate = true
            if (wallRef.current.instanceColor) wallRef.current.instanceColor.needsUpdate = true
        }

        // Helper function for item rendering
        const updateInstances = (ref: React.RefObject<InstancedMesh>, filter: (it: any) => boolean,
            setup: (obj: Object3D, item: any) => void, colorStr: string) => {
            if (!ref.current) return;
            let idx = 0;
            items.forEach((item) => {
                if (filter(item)) {
                    setup(tempObject, item);
                    tempObject.updateMatrix();
                    ref.current!.setMatrixAt(idx, tempObject.matrix);
                    tempColor.set(colorStr);
                    ref.current!.setColorAt(idx, tempColor);
                    idx++;
                }
            });
            for (let j = idx; j < items.length; j++) {
                tempObject.position.set(0, -999, 0);
                tempObject.updateMatrix();
                ref.current!.setMatrixAt(j, tempObject.matrix);
            }
            ref.current.instanceMatrix.needsUpdate = true;
            if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
        };

        // Gems
        updateInstances(gemRef, it => it.type === 'star', (obj, it) => {
            obj.position.set(it.x + 0.5, 0.5, it.z + 0.5);
            obj.rotation.set(0, 0, 0);
            obj.scale.set(0.3, 0.3, 0.3);
        }, '#f59e0b');

        // Blocks
        const blockSetup = (obj: Object3D, it: any) => {
            obj.position.set(it.x + 0.5, 0.45, it.z + 0.5);
            obj.rotation.set(0, 0, 0);
            obj.scale.set(0.7, 0.7, 0.7);
        };
        updateInstances(cubeBlockRef, it => it.type === 'block_cube', blockSetup, '#ef4444');
        updateInstances(sphereBlockRef, it => it.type === 'block_sphere', blockSetup, '#f97316'); // Orange
        updateInstances(tetraBlockRef, it => it.type === 'block_tetra', blockSetup, '#8b5cf6');
        updateInstances(cylinderBlockRef, it => it.type === 'block_cylinder', (obj, it) => {
            blockSetup(obj, it);
        }, '#1e3a8a'); // Navy

        // Plates setup removed (handled by Highlights now)

    }, [width, height, walls, items, grid, floorTiles])

    useFrame((state) => {
        // Floating animation for gems
        // Floating animation for gems
        // (Removed as per user request)
        if (gemRef.current) {
            let idx = 0;
            items.forEach((item) => {
                if (item.type === 'star') {
                    const time = state.clock.elapsedTime
                    const yOffset = Math.sin(time * 2 + idx) * 0.1
                    tempObject.position.set(item.x + 0.5, 0.5 + yOffset, item.z + 0.5)
                    tempObject.rotation.y += 0.02
                    tempObject.scale.set(0.3, 0.3, 0.3)
                    tempObject.updateMatrix()
                    gemRef.current!.setMatrixAt(idx, tempObject.matrix)
                    idx++;
                }
            })
            gemRef.current.instanceMatrix.needsUpdate = true
        }
    })

    return (
        <group>
            {/* World Environment */}
            <WorldEnvironment mazeWidth={width} mazeHeight={height} />

            {/* Solid Floors - Tall pillars to look like islands rising from sea */}
            <instancedMesh ref={floorRef} args={[undefined, undefined, width * height]} receiveShadow>
                <boxGeometry args={[0.95, 2.0, 0.95]} />
                <meshStandardMaterial />
            </instancedMesh>

            {/* Pits (Removed visual mesh) */}


            {/* Highlights */}
            {/* Highlights (Pits and Plates) */}
            {highlightData.map((h, i) => {
                const isPit = h.type === 'pit';
                // Pits: Deep (-0.45). Plates: Surface (0.00)
                const yPos = isPit ? -0.45 : 0.00;

                return (
                    <group key={i} position={[h.x + 0.5, yPos, h.z + 0.5]}>
                        <group>
                            {/* 1. Pit Box (Only for Pits) */}
                            {isPit && (
                                <mesh>
                                    <boxGeometry args={[1.0, 0.6, 1.0]} />
                                    <meshBasicMaterial attach="material-0" transparent opacity={0.0} />
                                    <meshBasicMaterial attach="material-1" transparent opacity={0.0} />
                                    <meshBasicMaterial attach="material-2" transparent opacity={0.0} />
                                    <meshBasicMaterial attach="material-3" color="white" />{/* Bottom White Face */}
                                    <meshBasicMaterial attach="material-4" transparent opacity={0.0} />
                                    <meshBasicMaterial attach="material-5" transparent opacity={0.0} />
                                </mesh>
                            )}

                            {/* 2. Top Frame (Borders) */}
                            {/* For Pits: sits at +0.3 relative to -0.45 -> -0.15 (just below surface?) */}
                            {/* For Plates: sits at 0.0 relative to 0.0 -> Surface. */}
                            <group position={[0, isPit ? 0.3 : 0.025, 0]}>
                                {/* Top Strip */}
                                <mesh position={[0, 0, -0.425]}>
                                    <boxGeometry args={[1, 0.05, 0.15]} />
                                    <meshBasicMaterial color={h.color} />
                                </mesh>
                                {/* Bottom Strip */}
                                <mesh position={[0, 0, 0.425]}>
                                    <boxGeometry args={[1, 0.05, 0.15]} />
                                    <meshBasicMaterial color={h.color} />
                                </mesh>
                                {/* Left Strip */}
                                <mesh position={[-0.425, 0, 0]}>
                                    <boxGeometry args={[0.15, 0.05, 0.7]} />
                                    <meshBasicMaterial color={h.color} />
                                </mesh>
                                {/* Right Strip */}
                                <mesh position={[0.425, 0, 0]}>
                                    <boxGeometry args={[0.15, 0.05, 0.7]} />
                                    <meshBasicMaterial color={h.color} />
                                </mesh>
                            </group>
                        </group>
                    </group>
                )
            })}

            {/* Walls (legacy) */}
            <instancedMesh ref={wallRef} args={[undefined, undefined, walls.length]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial transparent opacity={0.9} metalness={0.8} roughness={0.2} />
            </instancedMesh>

            {/* Gems */}
            <instancedMesh ref={gemRef} args={[undefined, undefined, items.length]} castShadow>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial emissive="#f59e0b" emissiveIntensity={1} color="#f59e0b" />
            </instancedMesh>

            {/* Blocks */}
            <instancedMesh ref={cubeBlockRef} args={[undefined, undefined, items.length]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial />
            </instancedMesh>
            <instancedMesh ref={sphereBlockRef} args={[undefined, undefined, items.length]} castShadow receiveShadow>
                <sphereGeometry args={[0.6, 32, 32]} />
                <meshStandardMaterial />
            </instancedMesh>
            <instancedMesh ref={tetraBlockRef} args={[undefined, undefined, items.length]} castShadow receiveShadow>
                <tetrahedronGeometry args={[0.7]} />
                <meshStandardMaterial />
            </instancedMesh>
            <instancedMesh ref={cylinderBlockRef} args={[undefined, undefined, items.length]} castShadow receiveShadow>
                {/* Cylinder geometry */}
                <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
                <meshStandardMaterial />
            </instancedMesh>

            {/* Plates */}

        </group>
    )
}

