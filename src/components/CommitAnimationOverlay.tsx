import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export const CommitAnimationOverlay: React.FC = () => {
    const { commitAnimation, finishCommitAnimation } = useGameStore(state => ({
        commitAnimation: state.commitAnimation,
        finishCommitAnimation: state.finishCommitAnimation
    }));

    const [coords, setCoords] = useState<{ start: { x: number, y: number, w: number, h: number }, end: { x: number, y: number } } | null>(null);

    useEffect(() => {
        if (commitAnimation.isAnimating && commitAnimation.targetId) {
            let retryCount = 0;
            const maxRetries = 20; // Wait up to ~0.3s for rendering

            const checkElements = () => {
                const polaroid = document.getElementById('polaroid-frame');
                const targetNode = document.getElementById(`commit-node-${commitAnimation.targetId}`);

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
                    console.warn('Animation elements not found after retries:', { polaroid: !!polaroid, target: !!targetNode });
                    finishCommitAnimation();
                }
            };

            checkElements();
        } else {
            setCoords(null);
        }
    }, [commitAnimation.isAnimating, commitAnimation.targetId, finishCommitAnimation]);

    if (!commitAnimation.isAnimating || !commitAnimation.captureUrl || !coords) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 pointer-events-none z-[9999]">
                {/* Flash Effect */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-white"
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
                        x: coords.end.x - 5, // Center slightly on node
                        y: coords.end.y - 5,
                        width: 10,
                        height: 10,
                        scale: 0.1,
                        opacity: 0.5,
                        rotate: 180,
                    }}
                    transition={{
                        duration: 5,
                        ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
                    }}
                    onAnimationComplete={() => finishCommitAnimation()}
                    className="absolute bg-white border border-gray-200 shadow-2xl rounded-sm overflow-hidden"
                    style={{
                        backgroundImage: `url(${commitAnimation.captureUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            </div>
        </AnimatePresence>
    );
};
