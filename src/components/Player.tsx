import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../store/useGameStore'
import { Group, Vector3 } from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useMemo } from 'react'

export const Player: React.FC = () => {
    const { camera } = useThree()
    const groupRef = useRef<Group>(null)
    const currentMaze = useGameStore((state) => state.currentMaze)
    const playerPosition = currentMaze.playerPosition
    const isFalling = useGameStore((state) => state.isFalling)
    const resetPlayerPosition = useGameStore((state) => state.resetPlayerPosition)
    const fallVelocity = useRef(0)
    const currentY = useRef(0.05)
    const fallingStarted = useRef(false)

    // Load GLB and clone scene to prevent theft when double-mounted
    const { scene: originalScene, animations } = useGLTF('/player.glb')
    const scene = useMemo(() => SkeletonUtils.clone(originalScene), [originalScene])
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

            // Mark as dead after animation completes
            const deathTimer = setTimeout(() => {
                currentY.current = 0.05;
                fallVelocity.current = 0;
                fallingStarted.current = false;
                useGameStore.setState({ isDead: true, isFalling: false });
            }, 1400); // 200ms delay + 1200ms fall

            return () => {
                clearTimeout(startFallTimer);
                clearTimeout(deathTimer);
            };
        } else {
            currentY.current = 0.05;
            fallVelocity.current = 0;
            fallingStarted.current = false;
        }
    }, [isFalling, resetPlayerPosition]);

    // Keyboard Controls
    // Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block input during falling animation
            if (isFalling) return;

            // Prevent scrolling
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            } else {
                return; // Ignore other keys
            }

            // 1. Get Camera Direction (Projected to Flat XZ Plane)
            const forward = new Vector3(0, 0, -1);
            forward.applyQuaternion(camera.quaternion);
            forward.y = 0;
            forward.normalize();

            // 2. Snap to nearest Cardinal Axis (Grid Alignment)
            const absX = Math.abs(forward.x);
            const absZ = Math.abs(forward.z);

            const snappedForward = new Vector3();
            if (absX > absZ) {
                snappedForward.set(Math.sign(forward.x), 0, 0);
            } else {
                snappedForward.set(0, 0, Math.sign(forward.z));
            }

            const snappedRight = new Vector3(snappedForward.z, 0, -snappedForward.x); // Rotate -90 deg

            let moveVec = new Vector3(0, 0, 0);

            if (e.code === 'ArrowUp') {
                moveVec.copy(snappedForward);
            } else if (e.code === 'ArrowDown') {
                moveVec.copy(snappedForward).negate();
            } else if (e.code === 'ArrowLeft') {
                moveVec.copy(snappedRight); // Swapped: Now matches 'Right' vector which apparently points Left
            } else if (e.code === 'ArrowRight') {
                moveVec.copy(snappedRight).negate(); // Swapped
            }

            if (moveVec.lengthSq() > 0) {
                // Face the direction of movement
                targetRotationY.current = Math.atan2(moveVec.x, moveVec.z) - Math.PI / 2;
                movePlayer(Math.round(moveVec.x), Math.round(moveVec.z));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [movePlayer, isFalling, camera]);

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
            <pointLight position={[0, 3, 0]} intensity={15.0} distance={10} color="#ffffff" />
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
