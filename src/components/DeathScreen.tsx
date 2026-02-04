import React from 'react'
import { useGameStore } from '../store/useGameStore'

export const DeathScreen: React.FC = () => {
    const isDead = useGameStore((state) => state.isDead)

    if (!isDead) return null

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" />

            {/* Death message */}
            <div className="relative z-10 bg-gradient-to-br from-red-900/90 to-black/90 p-8 rounded-2xl border-2 border-red-500/50 shadow-2xl max-w-md animate-scaleIn pointer-events-auto">
                <div className="text-center">
                    {/* Skull icon */}
                    <div className="mb-6">
                        <svg
                            className="w-20 h-20 mx-auto text-red-500 animate-pulse"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                        </svg>
                    </div>

                    {/* Main message */}
                    <h2 className="text-3xl font-black text-red-100 mb-4 font-mono tracking-tight">
                        당신은 사망했습니다
                    </h2>

                    {/* Instruction */}
                    <div className="bg-black/40 p-4 rounded-lg border border-red-500/30 mb-4">
                        <p className="text-red-200 mb-2 text-sm font-semibold">
                            가장 최근 커밋으로 돌아가려면:
                        </p>
                        <code className="block text-green-400 font-mono text-lg font-bold bg-gray-900/50 py-2 px-4 rounded">
                            git reset HEAD
                        </code>
                    </div>

                    {/* Flavor text */}
                    <p className="text-red-300/70 text-xs font-mono italic">
                        Time travel is your only escape...
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.4s ease-out 0.2s both;
                }
            `}</style>
        </div>
    )
}
