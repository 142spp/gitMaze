import React, { useRef, useEffect } from 'react';

export function MazeViewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw cute maze
    // Background Grid
    ctx.fillStyle = '#f0ebe6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid lines
    ctx.strokeStyle = '#e5ddd5';
    ctx.lineWidth = 2;
    for(let i=0; i<canvas.width; i+=40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Walls (Rounded Rects)
    ctx.fillStyle = '#1e293b';
    const drawRoundedRect = (x:number, y:number, w:number, h:number, r:number) => {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
    };

    drawRoundedRect(120, 80, 80, 160, 20); // Wall 1
    drawRoundedRect(240, 160, 80, 120, 20); // Wall 2

    // Player (Cute Cube)
    ctx.fillStyle = '#94a3b8'; // Shadow
    ctx.beginPath(); ctx.roundRect(80, 180, 60, 60, 15); ctx.fill();
    
    ctx.fillStyle = '#cbd5e1'; // Body
    ctx.beginPath(); ctx.roundRect(80, 170, 60, 60, 15); ctx.fill();

    // Player Face
    ctx.fillStyle = '#475569';
    ctx.beginPath(); ctx.arc(100, 195, 4, 0, Math.PI*2); ctx.fill(); // Left Eye
    ctx.beginPath(); ctx.arc(120, 195, 4, 0, Math.PI*2); ctx.fill(); // Right Eye
    
  }, []);

  return (
    <div className="relative transform rotate-2 hover:rotate-0 transition-transform duration-300 w-full max-w-[400px]">
      {/* Polaroid Frame */}
      <div className="bg-white p-4 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-sm border border-gray-100 relative">
        
        {/* Blue Pins */}
        <div className="absolute -top-3 left-1/2 -translate-x-12 w-4 h-4 rounded-full bg-blue-500 shadow-sm border-2 border-white/50 z-20" />
        <div className="absolute -top-3 left-1/2 translate-x-12 w-4 h-4 rounded-full bg-blue-500 shadow-sm border-2 border-white/50 z-20" />

        {/* Inner Content */}
        <div className="w-full aspect-[4/3] bg-[#f0ebe6] rounded overflow-hidden relative border border-gray-200">
             <canvas ref={canvasRef} width={400} height={300} className="w-full h-full object-cover" />
             
             {/* Reflection highlight */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
