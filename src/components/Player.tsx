import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/useGameStore'
import { Group } from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'

export const Player: React.FC = () => {
    const groupRef = useRef<Group>(null)
    const currentMaze = useGameStore((state) => state.currentMaze)
    const playerPosition = currentMaze.playerPosition
    const isFalling = useGameStore((state) => state.isFalling)
    const resetPlayerPosition = useGameStore((state) => state.resetPlayerPosition)
    const fallVelocity = useRef(0)
    const currentY = useRef(0.05)
    const fallingStarted = useRef(false)

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

    // Pit Falling Animation
    useEffect(() => {
        if (isFalling) {
            // Reset velocity and flag
            fallVelocity.current = 0;
            fallingStarted.current = false;
            currentY.current = 0.05; // Start at normal height

            // Start falling after 200ms delay
            const startFallTimer = setTimeout(() => {
                fallingStarted.current = true;
            }, 200);

            // Reset after animation completes
            const resetTimer = setTimeout(() => {
                currentY.current = 0.05;
                fallVelocity.current = 0;
                fallingStarted.current = false;
                resetPlayerPosition();
            }, 1400); // 200ms delay + 1200ms fall

            return () => {
                clearTimeout(startFallTimer);
                clearTimeout(resetTimer);
            };
        } else {
            currentY.current = 0.05;
            fallVelocity.current = 0;
            fallingStarted.current = false;
        }
    }, [isFalling, resetPlayerPosition]);

    // Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block input during falling animation
            if (isFalling) return;

            // Prevent scrolling
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }

            let dx = 0;
            let dz = 0;

            if (e.code === 'ArrowUp') {
                dz = -1;
                targetRotationY.current = Math.PI;
            } else if (e.code === 'ArrowDown') {
                dz = 1;
                targetRotationY.current = 0;
            } else if (e.code === 'ArrowLeft') {
                dx = -1;
                targetRotationY.current = -Math.PI / 2;
            } else if (e.code === 'ArrowRight') {
                dx = 1;
                targetRotationY.current = Math.PI / 2;
            }

            if (dx !== 0 || dz !== 0) {
                movePlayer(dx, dz);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [movePlayer, isFalling]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            const targetX = playerPosition.x + 0.5;
            const targetZ = playerPosition.z + 0.5;

            // Position handling
            if (isFalling && fallingStarted.current) {
                // Apply gravity acceleration (falling has started)
                fallVelocity.current += 9.8 * delta * 0.5;
                currentY.current -= fallVelocity.current * delta;
                groupRef.current.position.set(targetX, currentY.current, targetZ);
            } else {
                // Normal lerp movement (including moving to pit before falling)
                groupRef.current.position.lerp({
                    x: targetX,
                    y: isFalling && !fallingStarted.current ? 0.05 : 0.05,
                    z: targetZ
                }, 0.2);
            }

            // Smooth Rotation
            let rotationDiff = targetRotationY.current - groupRef.current.rotation.y;
            while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
            while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;

            groupRef.current.rotation.y += rotationDiff * delta * 10;

            // Bobbing only when not falling
            if (!isFalling && !animations.length) {
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
