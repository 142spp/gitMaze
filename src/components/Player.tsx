import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/useGameStore'
import { Group } from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'

export const Player: React.FC = () => {
    const groupRef = useRef<Group>(null)
    const currentMaze = useGameStore((state) => state.currentMaze)
    const playerPosition = currentMaze.playerPosition

    // Load GLB
    const { scene, animations } = useGLTF('/player.glb')
    const { actions } = useAnimations(animations, groupRef)

    // Movement Actions
    const movePlayer = useGameStore((state) => state.movePlayer);

    // Rotation State
    const targetRotationY = useRef(0);

    // Play default animation if exists
    useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            const firstAnim = Object.keys(actions)[0];
            actions[firstAnim]?.play();
        }
    }, [actions]);

    // Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent scrolling
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }

            let dx = 0;
            let dz = 0;

            if (e.code === 'ArrowUp') {
                dz = -1;
                targetRotationY.current = Math.PI; // Back (facing camera usually vs world) - actually world Z- is "up" in grid?
                // In 3D: Z decrease is often "forward/up" on screen depending on camera.
                // Let's assume standard top-down:
                // Up (Z-) -> Rotate to PI (180) or 0? 
                // Let's test: 0 is usually facing +Z. PI is -Z. 
                targetRotationY.current = Math.PI; // Face North
            } else if (e.code === 'ArrowDown') {
                dz = 1;
                targetRotationY.current = 0; // Face South
            } else if (e.code === 'ArrowLeft') {
                dx = -1;
                targetRotationY.current = -Math.PI / 2; // Face West
            } else if (e.code === 'ArrowRight') {
                dx = 1;
                targetRotationY.current = Math.PI / 2; // Face East
            }

            if (dx !== 0 || dz !== 0) {
                movePlayer(dx, dz);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [movePlayer]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Sync position with smoothing
            groupRef.current.position.lerp({
                x: playerPosition.x + 0.5,
                y: 0.05,
                z: playerPosition.z + 0.5
            }, 0.2) // Faster lerp for responsive movement

            // Smooth Rotation
            // Shortest path rotation logic
            let rotationDiff = targetRotationY.current - groupRef.current.rotation.y;
            // Normalize to -PI ~ PI
            while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
            while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;

            groupRef.current.rotation.y += rotationDiff * delta * 10; // Fast rotation

            // Bobbing only when idle? No, maybe always slight or walk cycle?
            // If moving, we rely on GLB animation (if we had walk cycle).
            // For now just constant idle bob
            if (!animations.length) {
                groupRef.current.position.y = 0.05 + Math.sin(state.clock.elapsedTime * 5) * 0.05
            }
        }
    })

    return (
        <group ref={groupRef}>
            <primitive
                object={scene}
                scale={1.3}
                castShadow
                receiveShadow
            />
        </group>
    )
}

useGLTF.preload('/player.glb')
