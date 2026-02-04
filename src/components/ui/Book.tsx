import React, { ReactNode, useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { IntroCover } from './Intro';
import html2canvas from 'html2canvas';

interface BookProps {
    leftContent: ReactNode;
    rightContent: ReactNode;
    isClosed?: boolean;
}

export function Book({ leftContent, rightContent, isClosed = false }: BookProps) {
    const visualEffect = useGameStore(state => state.visualEffect);
    const confirmTear = useGameStore(state => state.confirmTear);
    const gameStatus = useGameStore(state => state.gameStatus);
    const userId = useGameStore(state => state.userId);
    const commandCount = useGameStore(state => state.commandCount);
    const isSaving = useGameStore(state => state.isSaving);
    const saveError = useGameStore(state => state.saveError);
    const isTearing = visualEffect === 'tearing';
    const isCleared = gameStatus === 'cleared';
    const isTransitioning = visualEffect === 'moving-right' || visualEffect === 'flipping';

    const bookRef = useRef<HTMLDivElement>(null);
    const [captureImage, setCaptureImage] = useState<string | null>(null);

    // Handle Preparation (Screenshot) - Only for tearing effect
    useEffect(() => {
        if (visualEffect === 'preparing-tear' && bookRef.current) {
            const capture = async () => {
                try {
                    const canvas = await html2canvas(bookRef.current!, {
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: null,
                        logging: false,
                        scale: 1,
                        width: bookRef.current?.scrollWidth,
                        height: bookRef.current?.scrollHeight
                    });

                    setCaptureImage(canvas.toDataURL('image/png'));
                    confirmTear();

                } catch (e) {
                    console.error("Capture failed:", e);
                    confirmTear();
                }
            };
            setTimeout(capture, 50);
        }
    }, [visualEffect, confirmTear]);

    // Clear capture when not tearing
    useEffect(() => {
        if (visualEffect === 'none') {
            setCaptureImage(null);
        }
    }, [visualEffect]);

    return (
        <div
            ref={bookRef}
            className={`relative z-10 flex justify-center perspective-1000 transition-all duration-1000 ease-in-out 
                ${isTransitioning ? 'translate-x-1/2' : ''}
                ${isCleared ? 'translate-x-[25%]' : ''}`}
            style={{
                maxWidth: '1200px',
                height: 'min(94vh, 1000px)',
                width: (isClosed && !isTransitioning)
                    ? 'min(50%, calc(min(94vh, 1000px) * 2 / 3))' // Half width for closed
                    : 'min(100%, calc(min(94vh, 1000px) * 4 / 3))', // Full width for open
                margin: '0 auto'
            }}
        >
            {/* OVERLAYS (Only visible during tearing) */}
            {isTearing && captureImage && (
                <>
                    {/* Left Overlay - Fixed at 50% width for geometric center tear */}
                    <div
                        className="absolute top-0 left-0 h-full w-1/2 z-50 pointer-events-none animate-tear-left shadow-2xl origin-right"
                    >
                        <div className="w-full h-full" style={{
                            backgroundImage: `url(${captureImage})`,
                            backgroundSize: '200% 100%', // Zoom to cover full width relative to half container
                            backgroundPosition: 'left top'
                        }} />
                        <div
                            className="absolute right-0 top-0 bottom-0 w-3 z-50"
                            style={{
                                background: 'radial-gradient(circle at 100% 50%, transparent 4px, #fdfbf7 5px)',
                                backgroundSize: '10px 15px',
                                backgroundPosition: '5px 0',
                                opacity: 0.8
                            }}
                        />
                    </div>

                    {/* Right Overlay - Starts at 50% */}
                    <div
                        className="absolute top-0 right-0 h-full w-1/2 z-50 pointer-events-none animate-tear-right shadow-2xl"
                        style={{
                            left: '50%',
                            transformOrigin: '0% 0%',
                            perspective: '1500px'
                        }}
                    >
                        <div className="w-full h-full" style={{
                            backgroundImage: `url(${captureImage})`,
                            backgroundSize: '200% 100%',
                            backgroundPosition: 'right top',
                            boxShadow: 'inset 20px 0 50px rgba(0,0,0,0.3)'
                        }} />
                        <div
                            className="absolute left-0 top-0 bottom-0 w-3 z-50"
                            style={{
                                background: 'radial-gradient(circle at 0 50%, transparent 4px, #fdfbf7 5px)',
                                backgroundSize: '10px 15px',
                                backgroundPosition: '-5px 0',
                                opacity: 0.8
                            }}
                        />
                    </div>
                </>
            )}


            {/* LEFT HALF (Real Content or Transition Filler) */}
            <div
                className={`shrink-0 h-full relative transition-all duration-1000 ease-in-out ${isTearing ? 'opacity-0' : ''} ${isCleared ? 'w-1/2' : 'w-[280px]'}`}
                style={{
                    transformOrigin: 'right center',
                    width: (isClosed && !isTransitioning) ? '0px' : undefined,
                    opacity: (isClosed && !isTransitioning) ? 0 : (isTransitioning ? 0 : 1), // Hide left half during slide/flip
                    pointerEvents: (isClosed && !isTransitioning) ? 'none' : 'auto',
                    overflow: 'hidden'
                }}
            >
                {/* Left Page (Background & Content) */}
                <div className="absolute inset-0 bg-[#5d4037] rounded-l-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/40 to-transparent" />
                </div>
                <div className="relative z-20 w-full h-full p-4 pr-0">
                    <div className="w-full h-full bg-[#f7f3e8] rounded-l-[30px] border border-[#e5dec9] border-r-0 overflow-hidden relative">
                        {leftContent}
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* RIGHT HALF (Base Layer + Flip Overlay) */}
            <div
                className={`flex-1 min-w-0 h-full relative ${isCleared ? '' : 'transition-transform duration-700 ease-in-out'} ${isTearing ? 'opacity-0' : ''} ${isCleared ? 'animate-book-close' : ''}`}
                style={{
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                    zIndex: isCleared ? 100 : 20
                }}
            >
                {/* 1. BASE LAYER (Game UI - Sitting underneath) */}
                <div className="absolute inset-0 w-full h-full">
                    {/* Only show Game UI when playing */}
                    {gameStatus === 'playing' ? (
                        <>
                            <div className={`absolute inset-0 bg-[#5d4037] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden rounded-r-[40px]`}>
                                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/40 to-transparent" />
                            </div>
                            <div className="relative z-20 w-full h-full p-4 pl-0">
                                <div className="w-full h-full overflow-hidden relative bg-[#f7f3e8] rounded-r-[30px] border border-[#e5dec9] border-l-0">
                                    {rightContent}
                                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-50" />
                                </div>
                            </div>
                        </>
                    ) : (
                        // Intro Base: Just the cover (static)
                        <div className={`absolute inset-0 bg-[#5d4037] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden rounded-r-[40px]`}>
                            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/40 to-transparent" />
                            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/leather.png')` }} />
                            {rightContent}
                        </div>
                    )}
                </div>

                {/* 2. FLIP OVERLAY (The physical cover that turns) */}
                {isTransitioning && (
                    <div
                        className={`absolute inset-0 w-full h-full z-50 ${visualEffect === 'flipping' ? 'animate-page-flip' : ''}`}
                        style={{
                            transformOrigin: 'left center',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {/* FRONT FACE (Intro Cover) */}
                        <div className="absolute inset-0 w-full h-full backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                            <div className="absolute inset-0 bg-[#5d4037] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden rounded-r-[40px]">
                                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/40 to-transparent" />
                                <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/leather.png')` }} />
                            </div>
                            <div className="relative z-20 w-full h-full">
                                <IntroCover />
                            </div>
                        </div>

                        {/* BACK FACE (Paper Side) */}
                        <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden',
                                backgroundColor: '#f7f3e8',
                                backgroundImage: `url('https://www.transparenttextures.com/patterns/paper.png')`,
                                borderRadius: '40px 10px 10px 40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div className="absolute inset-0 w-full h-full border border-[#e5dec9] border-r-0 rounded-l-[30px]" />
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/5 to-transparent" />
                        </div>
                    </div>
                )}

                {/* 3. END GAME OVERLAY */}
                {isCleared && (
                    <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            transform: 'rotateY(180deg)',
                            backfaceVisibility: 'hidden',
                            backgroundColor: '#5d4037',
                            borderRadius: '40px 0 0 40px',
                            boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d4af37',
                            fontFamily: 'serif',
                            padding: '2rem',
                            zIndex: 100
                        }}
                    >
                        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/leather.png')` }} />
                        <div className="relative z-10 border-4 border-[#d4af37] p-8 rounded-lg flex flex-col items-center gap-6 bg-black/20 backdrop-blur-sm shadow-xl min-w-[300px]">
                            <h1 className="text-5xl font-bold tracking-widest uppercase mb-4 text-[#FFD700] drop-shadow-md">임무 완수!</h1>
                            <div className="flex flex-col gap-4 text-xl w-full">
                                <div className="flex justify-between border-b border-[#d4af37]/30 pb-2">
                                    <span className="opacity-80 text-[#e5dec9]">요원</span>
                                    <span className="font-mono text-[#fff8e1]">{userId}</span>
                                </div>
                                <div className="flex justify-between border-b border-[#d4af37]/30 pb-2">
                                    <span className="opacity-80 text-[#e5dec9]">소요 시간</span>
                                    <span className="font-mono text-[#fff8e1]">{useGameStore.getState().finalTime?.toFixed(2) || '0.00'}초</span>
                                </div>
                                <div className="flex justify-between border-b border-[#d4af37]/30 pb-2">
                                    <span className="opacity-80 text-[#e5dec9]">명령어 수</span>
                                    <span className="font-mono text-[#fff8e1]">{commandCount}회</span>
                                </div>
                            </div>
                            <div className="mt-8 text-sm opacity-60 text-center italic text-[#e5dec9]">"미로 탈출"</div>
                        </div>
                    </div>
                )}

                {/* Pencil */}
                {!isCleared && !isTransitioning && (
                    <div className="absolute -bottom-6 right-0 w-48 h-4 bg-yellow-400 rotate-[15deg] shadow-2xl rounded-full z-40 border-b-4 border-yellow-600">
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-pink-300 rounded-r-full border-l-2 border-gray-300" />
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#fdfbf7] rounded-l-full border-r-[10px] border-[#d4af37] clip-path-pencil" />
                    </div>
                )}
            </div>
        </div>
    );
}
