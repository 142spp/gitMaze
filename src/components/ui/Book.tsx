import React, { ReactNode, useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import html2canvas from 'html2canvas';

interface BookProps {
    leftContent: ReactNode;
    rightContent: ReactNode;
}

export function Book({ leftContent, rightContent }: BookProps) {
    const visualEffect = useGameStore(state => state.visualEffect);
    const confirmTear = useGameStore(state => state.confirmTear);
    const confirmFlip = useGameStore(state => state.confirmFlip);
    const isTearing = visualEffect === 'tearing';

    const bookRef = useRef<HTMLDivElement>(null);
    const [captureImage, setCaptureImage] = useState<string | null>(null);

    // Handle Preparation (Screenshot)
    useEffect(() => {
        if ((visualEffect === 'preparing-tear' || visualEffect === 'preparing-flip') && bookRef.current) {
            // Generate random jagged path ONLY if tearing
            if (visualEffect === 'preparing-tear') {
                let path = 'polygon(100% 0, 100% 100%';
                const steps = 40;
                for (let i = steps; i >= 0; i--) {
                    const percentage = i / steps;
                    const y = percentage * 100;
                    const x = Math.random() * 3;
                    path += `, ${x}% ${y}%`;
                }
                path += ')';
                setTearPath(path);
            }

            const capture = async () => {
                try {
                    const canvas = await html2canvas(bookRef.current!, {
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: null,
                        logging: false,
                        scale: 1
                    });

                    setCaptureImage(canvas.toDataURL('image/png'));

                    // Route to correct confirmation
                    if (visualEffect === 'preparing-tear') confirmTear();
                    if (visualEffect === 'preparing-flip') confirmFlip();

                } catch (e) {
                    console.error("Capture failed:", e);
                    // Force proceed if capture fails
                    if (visualEffect === 'preparing-tear') confirmTear();
                    if (visualEffect === 'preparing-flip') confirmFlip();
                }
            };
            setTimeout(capture, 50);
        }
    }, [visualEffect, confirmTear, confirmFlip]);

    // Clear capture when not tearing
    useEffect(() => {
        if (visualEffect === 'none') {
            setCaptureImage(null);
        }
    }, [visualEffect]);

    return (
        <div
            ref={bookRef}
            className="relative z-10 w-full flex justify-center perspective-1000"
            style={{
                maxWidth: '1200px',
                height: 'min(94vh, 1000px)',
                width: 'min(100%, calc(min(94vh, 1000px) * 4 / 3))',
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
                        {/* Torn edge visual on the right side of left overlay */}
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
                        {/* Torn edge visual on the left side of right overlay */}
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

            {/* OVERLAYS (Only visible during flipping) */}
            {visualEffect === 'flipping' && captureImage && (
                <>
                    {/* 1. Static Old Left Page (Maintains context until covered) */}
                    <div
                        className="absolute top-0 left-0 h-full w-1/2 z-40 pointer-events-none"
                    >
                        <div className="w-full h-full" style={{
                            backgroundImage: `url(${captureImage})`,
                            backgroundSize: '200% 100%',
                            backgroundPosition: 'left top'
                        }} />
                        {/* Static Shadow on Left Page */}
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/10 to-transparent" />
                    </div>

                    {/* 2. Flipping Page (Old Right Page -> Turns Left) */}
                    <div
                        className="absolute top-0 right-0 h-full w-1/2 z-50 pointer-events-none animate-page-flip shadow-2xl"
                        style={{
                            left: '50%',
                            transformOrigin: 'left center',
                            perspective: '2000px'
                        }}
                    >
                        {/* Front Face (Old Right Content) */}
                        <div className="absolute inset-0 w-full h-full backface-hidden" style={{
                            backgroundImage: `url(${captureImage})`,
                            backgroundSize: '200% 100%',
                            backgroundPosition: 'right top',
                            backfaceVisibility: 'hidden',
                            backgroundColor: '#f7f3e8' // Paper color fallback
                        }} >
                            {/* Inner shadow for curvature - LIGHTER */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent" />
                        </div>

                        {/* Back Face (The side seen after flipping) 
                            Ideally this should be the New Left Page, but we don't have it captured.
                            We'll make it a generic paper texture for now. 
                        */}
                        <div className="absolute inset-0 w-full h-full" style={{
                            transform: 'rotateY(180deg)',
                            backfaceVisibility: 'hidden',
                            backgroundColor: '#fdfbf7',
                            backgroundImage: `url('https://www.transparenttextures.com/patterns/paper.png')`, // Optional texture
                        }}>
                            {/* Reverse shadow - LIGHTER */}
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/5 to-transparent" />
                        </div>
                    </div>
                </>
            )}

            {/* LEFT HALF (Real Content) */}
            <div
                className={`w-[280px] shrink-0 h-full relative transition-transform duration-700 ease-in-out ${isTearing ? 'opacity-0' : ''}`}
                style={{ transformOrigin: 'right center' }}
            >
                {/* Clasp (Left Side) */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-12 h-20 z-30 flex items-center">
                    <div className="w-full h-10 bg-[#6d4c41] rounded-l-lg shadow-md relative">
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#d4af37] rounded-md shadow-inner flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#fdfbf7] rounded-full shadow-sm" />
                        </div>
                    </div>
                </div>

                {/* Left Cover (Background) */}
                <div className="absolute inset-0 bg-[#5d4037] rounded-l-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                    {/* Spine Shadow on right edge */}
                    <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/40 to-transparent" />
                </div>

                {/* Left Page Container */}
                <div className="relative z-20 w-full h-full p-4 pr-0">
                    <div className="w-full h-full bg-[#f7f3e8] rounded-l-[30px] border border-[#e5dec9] border-r-0 overflow-hidden relative">
                        {/* Uneven paper edge on right */}


                        {leftContent}

                        {/* Inner Shadow */}
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* RIGHT HALF (Real Content) */}
            <div
                className={`flex-1 min-w-0 h-full relative transition-transform duration-700 ease-in-out ${isTearing ? 'opacity-0' : ''}`}
                style={{ transformOrigin: 'left center' }}
            >
                {/* Right Cover (Background) */}
                <div className="absolute inset-0 bg-[#5d4037] rounded-r-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                    {/* Spine Shadow on left edge */}
                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/40 to-transparent" />
                </div>

                {/* Right Page Container */}
                <div className="relative z-20 w-full h-full p-4 pl-0">
                    <div className="w-full h-full bg-[#f7f3e8] rounded-r-[30px] border border-[#e5dec9] border-l-0 overflow-hidden relative">
                        {/* Uneven paper edge on left */}
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500/0 z-50 element-tear-edge-right"></div>

                        {rightContent}

                        {/* Center fold shadow */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-50" />
                    </div>
                </div>

                {/* Pencil */}
                <div className="absolute -bottom-6 right-0 w-48 h-4 bg-yellow-400 rotate-[15deg] shadow-2xl rounded-full z-40 border-b-4 border-yellow-600">
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-pink-300 rounded-r-full border-l-2 border-gray-300" />
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#fdfbf7] rounded-l-full border-r-[10px] border-[#d4af37] clip-path-pencil" />
                </div>
            </div>

        </div>
    );
}
