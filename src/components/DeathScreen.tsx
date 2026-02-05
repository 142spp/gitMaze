import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export const DeathScreen: React.FC = () => {
    const isDead = useGameStore((state) => state.isDead);

    return (
        <AnimatePresence>
            {isDead && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto"
                    style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                    >
                        <h2 className="text-2xl md:text-3xl font-light text-white/90 mb-4 tracking-tight">
                            바다에 빠졌습니다
                        </h2>
                        <p
                            className="text-sm md:text-base text-white/30 tracking-[0.1em]"
                            style={{ fontFamily: "'mononoki Nerd Font', 'Noto Sans KR'      " }}
                        >
                            git reset HEAD를 입력하세요
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
