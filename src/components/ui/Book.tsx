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
    const [isRising, setIsRising] = useState(false);
    const prevEffect = useRef(visualEffect);

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

        // Detect transition from tearing to none to trigger slide-up
        if (prevEffect.current === 'tearing' && visualEffect === 'none') {
            setIsRising(true);
            const timer = setTimeout(() => setIsRising(false), 800);
            return () => clearTimeout(timer);
        }
        prevEffect.current = visualEffect;
    }, [visualEffect, confirmTear]);

    // Clear capture when not tearing
    useEffect(() => {
        if (visualEffect === 'none') {
            setCaptureImage(null);
        }
    }, [visualEffect]);

    const isActuallyOpen = (gameStatus === 'playing' || gameStatus === 'cleared');
    const isOpening = visualEffect === 'moving-right' || visualEffect === 'flipping';

    const translationStyle = (isClosed && !isOpening)
        ? 'translateX(-25%)'
        : 'translateX(0)';

    // During tearing, hide the REAL book content so only the tearing fragments are visible.
    // BUT during preparing-tear, we MUST show everything for the screenshot.
    const showContent = visualEffect !== 'tearing';

    return (
        <div
            ref={bookRef}
            className={`relative z-10 flex justify-center perspective-1000 transition-transform duration-700 ease-in-out ${isRising ? 'animate-page-slide-up' : ''}`}
            style={{
                maxWidth: '1200px',
                height: 'min(94vh, 1000px)',
                width: 'min(100%, calc(min(94vh, 1000px) * 4 / 3))',
                margin: '0 auto',
                transform: translationStyle,
                opacity: showContent ? 1 : 0,
                pointerEvents: showContent ? 'auto' : 'none'
            }}
        >
            {/* OVERLAYS (Visible during tearing) */}
            {isTearing && captureImage && (
                <div className="absolute inset-0 z-[100] pointer-events-none">
                    <div className="absolute top-0 left-0 h-full w-1/2 animate-tear-left shadow-2xl origin-right">
                        <div className="w-full h-full" style={{
                            backgroundImage: `url(${captureImage})`,
                            backgroundSize: '200% 100%',
                            backgroundPosition: 'left top'
                        }} />
                        <div
                            className="absolute right-0 top-0 bottom-0 w-3"
                            style={{
                                background: 'radial-gradient(circle at 100% 50%, transparent 4px, #fdfbf7 5px)',
                                backgroundSize: '10px 15px',
                                backgroundPosition: '5px 0',
                                opacity: 0.8
                            }}
                        />
                    </div>
                    <div className="absolute top-0 right-0 h-full w-1/2 animate-tear-right shadow-2xl" style={{ left: '50%', transformOrigin: '0% 0%', perspective: '1500px' }}>
                        <div className="w-full h-full" style={{
                            backgroundImage: `url(${captureImage})`,
                            backgroundSize: '200% 100%',
                            backgroundPosition: 'right top',
                            boxShadow: 'inset 20px 0 50px rgba(0,0,0,0.3)'
                        }} />
                        <div
                            className="absolute left-0 top-0 bottom-0 w-3"
                            style={{
                                background: 'radial-gradient(circle at 0 50%, transparent 4px, #fdfbf7 5px)',
                                backgroundSize: '10px 15px',
                                backgroundPosition: '-5px 0',
                                opacity: 0.8
                            }}
                        />
                    </div>
                </div>
            )}

            {/* REAL BOOK CONTENT */}
            <div
                className="w-full h-full flex transition-opacity duration-300"
                style={{
                    opacity: showContent ? 1 : 0,
                    pointerEvents: showContent ? 'auto' : 'none'
                }}
            >
                {/* LEFT HALF (Animate width from 50% to 280px after opening) */}
                <div
                    className="h-full relative transition-[width,opacity] duration-700 ease-in-out"
                    style={{
                        width: (isActuallyOpen && !isOpening) ? '280px' : '50%',
                        opacity: (isActuallyOpen && !isOpening) ? 1 : 0,
                        pointerEvents: (isActuallyOpen && !isOpening) ? 'auto' : 'none',
                        zIndex: 10,
                        flexShrink: 0
                    }}
                >
                    <div className="absolute inset-0 bg-[#5d4037] rounded-l-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/40 to-transparent" />
                    </div>
                    <div className="relative z-20 w-full h-full p-4 pr-0">
                        <div className="w-full h-full bg-[#f7f3e8] rounded-l-[30px] border border-[#5d4037] border-r-0 overflow-hidden relative">
                            {leftContent}
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* RIGHT HALF */}
                <div
                    className="flex-1 h-full relative transition-[flex-basis,opacity] duration-700 ease-in-out"
                    style={{
                        transformStyle: 'preserve-3d',
                        zIndex: 20
                    }}
                >
                    {/* BASE LAYER */}
                    <div className="absolute inset-0 w-full h-full">
                        <div className="absolute inset-0 bg-[#5d4037] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden rounded-r-[40px]">
                            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/40 to-transparent" />
                            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/leather.png')` }} />
                        </div>
                        <div className="relative z-20 w-full h-full p-4 pl-0">
                            <div className="w-full h-full overflow-hidden relative bg-[#f7f3e8] rounded-r-[30px] border border-[#5d4037] border-l-0">
                                {rightContent}
                                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-50" />
                            </div>
                        </div>
                    </div>

                    {/* FLIP OVERLAY */}
                    {isOpening && (
                        <div
                            className={`absolute inset-0 w-full h-full z-50 ${visualEffect === 'flipping' ? 'animate-page-flip' : ''}`}
                            style={{
                                transformOrigin: 'left center',
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            {/* FRONT (Intro Cover) */}
                            <div className="absolute inset-0 w-full h-full backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                                <div className="absolute inset-0 bg-[#5d4037] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden rounded-r-[40px]">
                                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/40 to-transparent" />
                                    <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/leather.png')` }} />
                                </div>
                                <div className="relative z-20 w-full h-full">
                                    <IntroCover />
                                </div>
                            </div>

                            {/* BACK (Inner Cover - Brown Leather Frame) */}
                            <div
                                className="absolute inset-0 w-full h-full"
                                style={{
                                    transform: 'rotateY(180deg)',
                                    backfaceVisibility: 'hidden',
                                    backgroundColor: '#5d4037',
                                    borderRadius: '40px 10px 10px 40px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/leather.png')` }} />
                                <div className="relative z-20 w-full h-full p-4 pr-0">
                                    <div className="w-full h-full bg-[#f7f3e8] rounded-l-[30px] border border-[#5d4037] border-r-0 overflow-hidden relative">
                                        <div className="absolute inset-0 opacity-50 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/paper.png')` }} />
                                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/5 to-transparent shadow-inner z-30" />
                                        <div className="relative z-20 w-full h-full overflow-hidden">
                                            {leftContent}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* END GAME / STATS */}
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
                                padding: '2rem',
                                zIndex: 100
                            }}
                        >
                            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/leather.png')` }} />
                            <div className="relative z-10 border-4 border-[#d4af37] p-8 rounded-lg flex flex-col items-center gap-6 bg-black/20 backdrop-blur-sm shadow-xl min-w-[300px]">
                                <h1 className="text-5xl font-bold tracking-widest mb-4 text-[#FFD700] drop-shadow-md uppercase">임무 완수!</h1>
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
                                <div className="mt-8 text-sm opacity-60 italic text-[#e5dec9]">"미로 탈출"</div>
                            </div>
                        </div>
                    )}

                    {/* Accessories */}
                    {!isCleared && !isOpening && (
                        <div className="absolute -bottom-6 right-0 w-48 h-4 bg-yellow-400 rotate-[15deg] shadow-2xl rounded-full z-40 border-b-4 border-yellow-600">
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-pink-300 rounded-r-full border-l-2 border-gray-300" />
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#fdfbf7] rounded-l-full border-r-[10px] border-[#d4af37] clip-path-pencil" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
