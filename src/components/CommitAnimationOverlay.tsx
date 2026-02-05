import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

interface SingleAnimationProps {
    animation: { id: string, captureUrl: string, targetId: string };
    onFinish: (id: string) => void;
}

const SingleCommitAnimation: React.FC<SingleAnimationProps> = ({ animation, onFinish }) => {
    const [coords, setCoords] = useState<{ start: { x: number, y: number, w: number, h: number }, end: { x: number, y: number } } | null>(null);

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 20;

        const checkElements = () => {
            const polaroid = document.getElementById('polaroid-frame');
            const targetNode = document.getElementById(`commit-node-${animation.targetId}`);

            if (polaroid && targetNode) {
                const pRect = polaroid.getBoundingClientRect();
                const tRect = targetNode.getBoundingClientRect();

                setCoords({
                    start: {
                        x: pRect.left,
                        y: pRect.top,
                        w: pRect.width,
                        h: pRect.height
                    },
                    end: {
                        x: tRect.left + tRect.width / 2,
                        y: tRect.top + tRect.height / 2
                    }
                });
            } else if (retryCount < maxRetries) {
                retryCount++;
                requestAnimationFrame(checkElements);
            } else {
                console.warn('Animation elements not found after retries for:', animation.id);
                onFinish(animation.id);
            }
        };

        checkElements();
    }, [animation.id, animation.targetId, onFinish]);

    if (!coords) return null;

    return (
        <>
            {/* Flash Effect (Unique for each commit) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-white"
                style={{ zIndex: 9998 }}
            />

            {/* Flying Capture */}
            <motion.div
                initial={{
                    x: coords.start.x,
                    y: coords.start.y,
                    width: coords.start.w,
                    height: coords.start.h,
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                }}
                animate={{
                    x: coords.end.x - 5,
                    y: coords.end.y - 5,
                    width: 10,
                    height: 10,
                    scale: 0.1,
                    opacity: 0.5,
                    rotate: 180,
                }}
                transition={{
                    duration: 5,
                    ease: [0.34, 1.56, 0.64, 1],
                }}
                onAnimationComplete={() => onFinish(animation.id)}
                className="absolute bg-white border border-gray-200 shadow-2xl rounded-sm overflow-hidden"
                style={{
                    backgroundImage: `url(${animation.captureUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 9999,
                }}
            />
        </>
    );
};

export const CommitAnimationOverlay: React.FC = () => {
    const activeAnimations = useGameStore(state => state.activeAnimations);
    const finishCommitAnimation = useGameStore(state => state.finishCommitAnimation);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            <AnimatePresence>
                {activeAnimations.map(anim => (
                    <SingleCommitAnimation
                        key={anim.id}
                        animation={anim}
                        onFinish={finishCommitAnimation}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
