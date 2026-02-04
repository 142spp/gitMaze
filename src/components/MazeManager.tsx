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
    // 전역 상태에서 현재 차원의 미로 데이터를 가져옵니다.
    const currentMaze = useGameStore((state) => state.currentMaze)
    const { width, height, walls, items } = currentMaze

    // InstancedMesh에 대한 참조 (직접 내부 행렬 변이를 위해 사용)
    const wallRef = useRef<InstancedMesh>(null)
    const floorRef = useRef<InstancedMesh>(null)
    const gemRef = useRef<InstancedMesh>(null)

    const themeColor = '#2563eb'

    // 바닥 타일의 위치를 계산 (메모이제이션으로 성능 확보)
    const floorTransforms = useMemo(() => {
        const t: { x: number, z: number }[] = []
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < height; z++) {
                t.push({ x, z })
            }
        }
        return t
    }, [width, height])

    /**
     * 지형 업데이트 로직: 미로 데이터가 변경될 때마다 인스턴스 행렬을 갱신합니다.
     */
    useEffect(() => {
        // 1. 바닥(Floor) 업데이트
        if (floorRef.current) {
            floorTransforms.forEach((pos, i) => {
                tempObject.position.set(pos.x + 0.5, -0.25, pos.z + 0.5)
                tempObject.rotation.set(0, 0, 0)
                tempObject.scale.set(1, 1, 1)
                tempObject.updateMatrix()
                floorRef.current!.setMatrixAt(i, tempObject.matrix)

                // 체크무늬 패턴 적용
                const isEven = (pos.x + pos.z) % 2 === 0
                tempColor.set(isEven ? '#f8fafc' : '#f1f5f9')
                floorRef.current!.setColorAt(i, tempColor)
            })
            floorRef.current.instanceMatrix.needsUpdate = true
            if (floorRef.current.instanceColor) floorRef.current.instanceColor.needsUpdate = true
        }

        // 2. 벽(Wall) 업데이트
        if (wallRef.current) {
            let activeWallIndex = 0;
            walls.forEach((wall) => {
                if (wall.opened) return;

                if (wall.type === 'VERTICAL' && (wall.startX === 0 || wall.startX === width)) return;
                if (wall.type === 'HORIZONTAL' && (wall.startZ === 0 || wall.startZ === height)) return;

                const cx = (wall.startX + wall.endX) / 2;
                const cz = (wall.startZ + wall.endZ) / 2;
                tempObject.position.set(cx, 0.5, cz);

                if (wall.type === 'HORIZONTAL') {
                    tempObject.rotation.set(0, Math.PI / 2, 0)
                } else {
                    tempObject.rotation.set(0, 0, 0)
                }

                tempObject.scale.set(0.15, 0.9, 1.05) // Optimized Thickness, Height, Length
                tempObject.updateMatrix()
                wallRef.current!.setMatrixAt(activeWallIndex, tempObject.matrix)

                tempColor.set(themeColor)
                wallRef.current!.setColorAt(activeWallIndex, tempColor)
                activeWallIndex++;
            })

            // 사용하지 않는 인스턴스 숨기기
            for (let j = activeWallIndex; j < walls.length; j++) {
                tempObject.position.set(0, -999, 0)
                tempObject.updateMatrix()
                wallRef.current!.setMatrixAt(j, tempObject.matrix)
            }

            wallRef.current.instanceMatrix.needsUpdate = true
            if (wallRef.current.instanceColor) wallRef.current.instanceColor.needsUpdate = true
        }

        // 3. 아이템(Gem) 업데이트
        if (gemRef.current) {
            items.forEach((item, i) => {
                tempObject.position.set(item.x + 0.5, 0.5, item.z + 0.5)
                tempObject.rotation.set(0, 0, 0)
                tempObject.scale.set(0.3, 0.3, 0.3) // Gems should be smaller
                tempObject.updateMatrix()
                gemRef.current!.setMatrixAt(i, tempObject.matrix)

                tempColor.set('#f59e0b')
                gemRef.current!.setColorAt(i, tempColor)
            })
            gemRef.current.instanceMatrix.needsUpdate = true
            if (gemRef.current.instanceColor) gemRef.current.instanceColor.needsUpdate = true
        }

    }, [width, height, walls, items, floorTransforms])

    /**
     * 프레임 루프(useFrame): 아이템에 애니메이션 부여
     */
    useFrame((state) => {
        if (gemRef.current) {
            items.forEach((item, i) => {
                const time = state.clock.elapsedTime
                const yOffset = Math.sin(time * 2 + i) * 0.1
                tempObject.position.set(item.x + 0.5, 0.5 + yOffset, item.z + 0.5)
                tempObject.rotation.y += 0.02
                tempObject.scale.set(0.3, 0.3, 0.3) // Keep scale consistent
                tempObject.updateMatrix()
                gemRef.current!.setMatrixAt(i, tempObject.matrix)
            })
            gemRef.current.instanceMatrix.needsUpdate = true
        }
    })

    return (
        <group>
            {/* 바닥 레이어 */}
            <instancedMesh ref={floorRef} args={[undefined, undefined, width * height]} receiveShadow>
                <boxGeometry args={[0.95, 0.5, 0.95]} />
                <meshStandardMaterial color="#f1f5f9" />
            </instancedMesh>

            {/* 벽 레이어 */}
            <instancedMesh ref={wallRef} args={[undefined, undefined, walls.length]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial transparent opacity={0.9} metalness={0.8} roughness={0.2} />
            </instancedMesh>

            {/* 아이템 레이어 */}
            <instancedMesh ref={gemRef} args={[undefined, undefined, items.length]} castShadow>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial emissive="#f59e0b" emissiveIntensity={1} color="#f59e0b" />
            </instancedMesh>
        </group>
    )
}

