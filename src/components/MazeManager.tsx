import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3 } from 'three'
import { useGameStore } from '../store/useGameStore'
import { Wall, Item } from '../lib/git/types'

const tempObject = new Object3D()
const tempColor = new Color()

/**
 * MazeManager: 미로의 지형(바닥, 벽)과 아이템을 렌더링합니다.
 * 성능 최적화를 위해 InstancedMesh를 사용하여 수백 개의 오브젝트를 단일 Draw Call로 처리합니다.
 */
export const MazeManager: React.FC = () => {
    const currentMaze = useGameStore((state) => state.currentMaze)
    const { width, height, walls, items } = currentMaze

    const wallRef = useRef<InstancedMesh>(null)
    const floorRef = useRef<InstancedMesh>(null)
    const gemRef = useRef<InstancedMesh>(null)

    // New Puzzle Refs
    const cubeBlockRef = useRef<InstancedMesh>(null)
    const sphereBlockRef = useRef<InstancedMesh>(null)
    const tetraBlockRef = useRef<InstancedMesh>(null)
    const cubePlateRef = useRef<InstancedMesh>(null)
    const spherePlateRef = useRef<InstancedMesh>(null)
    const tetraPlateRef = useRef<InstancedMesh>(null)

    const themeColor = '#2563eb'

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
        // 1. Floor
        if (floorRef.current) {
            floorTransforms.forEach((pos, i) => {
                tempObject.position.set(pos.x + 0.5, -0.25, pos.z + 0.5)
                tempObject.rotation.set(0, 0, 0)
                tempObject.scale.set(1, 1, 1)
                tempObject.updateMatrix()
                floorRef.current!.setMatrixAt(i, tempObject.matrix)
                const isEven = (pos.x + pos.z) % 2 === 0
                tempColor.set(isEven ? '#f8fafc' : '#f1f5f9')
                floorRef.current!.setColorAt(i, tempColor)
            })
            floorRef.current.instanceMatrix.needsUpdate = true
            if (floorRef.current.instanceColor) floorRef.current.instanceColor.needsUpdate = true
        }

        // 2. Walls
        if (wallRef.current) {
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

        // 3. Items (Gems, Blocks, Plates)
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

        // Gem
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
        updateInstances(sphereBlockRef, it => it.type === 'block_sphere', blockSetup, '#10b981');
        updateInstances(tetraBlockRef, it => it.type === 'block_tetra', blockSetup, '#8b5cf6');

        // Plates
        const plateSetup = (obj: Object3D, it: any) => {
            obj.position.set(it.x + 0.5, -0.2, it.z + 0.5);
            obj.rotation.set(0, 0, 0);
            obj.scale.set(0.8, 0.1, 0.8);
        };
        updateInstances(cubePlateRef, it => it.type === 'plate_cube', plateSetup, '#fca5a5');
        updateInstances(spherePlateRef, it => it.type === 'plate_sphere', plateSetup, '#a7f3d0');
        updateInstances(tetraPlateRef, it => it.type === 'plate_tetra', plateSetup, '#ddd6fe');

    }, [width, height, walls, items, floorTransforms])

    useFrame((state) => {
        // Floating Gem animation
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
            {/* Floor */}
            <instancedMesh ref={floorRef} args={[undefined, undefined, width * height]} receiveShadow>
                <boxGeometry args={[0.95, 0.5, 0.95]} />
                <meshStandardMaterial color="#f1f5f9" />
            </instancedMesh>

            {/* Walls */}
            <instancedMesh ref={wallRef} args={[undefined, undefined, walls.length]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial transparent opacity={0.9} metalness={0.8} roughness={0.2} />
            </instancedMesh>

            {/* Puzzle Items */}
            <instancedMesh ref={gemRef} args={[undefined, undefined, items.length]} castShadow>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial emissive="#f59e0b" emissiveIntensity={1} color="#f59e0b" />
            </instancedMesh>

            {/* Blocks */}
            <instancedMesh ref={cubeBlockRef} args={[undefined, undefined, items.length]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="white" />
            </instancedMesh>
            <instancedMesh ref={sphereBlockRef} args={[undefined, undefined, items.length]} castShadow>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color="white" />
            </instancedMesh>
            <instancedMesh ref={tetraBlockRef} args={[undefined, undefined, items.length]} castShadow>
                <tetrahedronGeometry args={[0.6]} />
                <meshStandardMaterial color="white" />
            </instancedMesh>

            {/* Plates (Translucent markers on floor) */}
            <instancedMesh ref={cubePlateRef} args={[undefined, undefined, items.length]} receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial transparent opacity={0.5} color="white" />
            </instancedMesh>
            <instancedMesh ref={spherePlateRef} args={[undefined, undefined, items.length]} receiveShadow>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial transparent opacity={0.5} color="white" />
            </instancedMesh>
            <instancedMesh ref={tetraPlateRef} args={[undefined, undefined, items.length]} receiveShadow>
                <tetrahedronGeometry args={[0.6]} />
                <meshStandardMaterial transparent opacity={0.5} color="white" />
            </instancedMesh>
        </group>
    )
}

