import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';
import { useRef, useEffect } from 'react';
import { MeshDistortMaterial } from '@react-three/drei';

interface WorldEnvironmentProps {
    mazeWidth: number;
    mazeHeight: number;
}

export const WorldEnvironment: React.FC<WorldEnvironmentProps> = ({ mazeWidth, mazeHeight }) => {
    const seaRef = useRef<InstancedMesh>(null);
    const mountainRef = useRef<InstancedMesh>(null);
    const cloudRef = useRef<InstancedMesh>(null);

    // Configuration
    const SEA_SIZE = 100;
    const MOUNTAIN_COUNT = 80;
    const CLOUD_COUNT = 20;

    const tempObject = new Object3D();
    const tempColor = new Color();

    // Data generation
    const mountainData = useMemo(() => {
        const data = [];
        for (let i = 0; i < MOUNTAIN_COUNT; i++) {
            // Random position around the maze, but not inside
            let x, z;
            do {
                x = (Math.random() - 0.5) * SEA_SIZE;
                z = (Math.random() - 0.5) * SEA_SIZE;
            } while (x > -5 && x < mazeWidth + 5 && z > -5 && z < mazeHeight + 5);

            const scale = Math.random() * 2 + 1;
            const color = Math.random() > 0.5 ? '#a7f3d0' : '#fbcfe8'; // Soft Green or Pink
            data.push({ x, z, scale, color });
        }
        return data;
    }, [mazeWidth, mazeHeight]);

    const cloudData = useMemo(() => {
        return Array.from({ length: CLOUD_COUNT }).map(() => ({
            x: (Math.random() - 0.5) * SEA_SIZE,
            y: Math.random() * 5 + 5,
            z: (Math.random() - 0.5) * SEA_SIZE,
            scale: Math.random() * 2 + 1,
            speed: Math.random() * 0.02 + 0.005
        }));
    }, []);

    useFrame((state) => {
        // Animate Clouds
        if (cloudRef.current) {
            cloudData.forEach((cloud, i) => {
                cloud.x += cloud.speed;
                if (cloud.x > SEA_SIZE / 2) cloud.x = -SEA_SIZE / 2;

                tempObject.position.set(cloud.x, cloud.y, cloud.z);
                tempObject.rotation.set(0, 0, 0);
                tempObject.scale.set(cloud.scale, cloud.scale * 0.6, cloud.scale);
                tempObject.updateMatrix();
                cloudRef.current!.setMatrixAt(i, tempObject.matrix);
            });
            cloudRef.current.instanceMatrix.needsUpdate = true;
        }

        // Gentle Sea Float
        if (seaRef.current) {
            // Maybe simple shader or just static for now for performance
        }
    });

    useEffect(() => {
        // Place Mountains
        if (mountainRef.current) {
            mountainData.forEach((mountain, i) => {
                tempObject.position.set(mountain.x, 0, mountain.z);
                tempObject.rotation.set(0, Math.random() * Math.PI, 0);
                tempObject.scale.set(mountain.scale, mountain.scale * 1.5, mountain.scale);
                tempObject.updateMatrix();
                mountainRef.current!.setMatrixAt(i, tempObject.matrix);

                tempColor.set(mountain.color);
                mountainRef.current!.setColorAt(i, tempColor);
            });
            mountainRef.current.instanceMatrix.needsUpdate = true;
            if (mountainRef.current.instanceColor) mountainRef.current.instanceColor.needsUpdate = true;
        }
    }, [mountainData]);

    return (
        <group>
            {/* Sea Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mazeWidth / 2, -0.2, mazeHeight / 2]} receiveShadow>
                <planeGeometry args={[SEA_SIZE, SEA_SIZE, 64, 64]} />
                <MeshDistortMaterial
                    color="#60a5fa"
                    transparent
                    opacity={0.8}
                    speed={2}
                    distort={0.15}
                    radius={1}
                />
            </mesh>

            {/* Mountains (Cones) */}
            <instancedMesh ref={mountainRef} args={[undefined, undefined, MOUNTAIN_COUNT]}>
                <coneGeometry args={[1, 2, 4]} /> {/* Low poly cone */}
                <meshStandardMaterial flatShading />
            </instancedMesh>

            {/* Clouds (Spheres/Ellipsoids) */}
            <instancedMesh ref={cloudRef} args={[undefined, undefined, CLOUD_COUNT]}>
                <dodecahedronGeometry args={[1, 0]} /> {/* Low poly cloud chunk */}
                <meshStandardMaterial color="#3ba4dcff" flatShading transparent opacity={0.9} />
            </instancedMesh>
        </group>
    );
};
