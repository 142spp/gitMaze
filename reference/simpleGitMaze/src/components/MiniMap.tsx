import React from 'react';

export function MiniMap() {
  // Simplified grid for minimap visual
  const miniGrid = Array(8).fill(Array(8).fill(0));

  return (
    <div className="w-full h-full bg-slate-900 border-l border-b border-slate-700 p-2 flex flex-col">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-mono text-emerald-500 uppercase">System Map</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] font-mono text-slate-500">LIVE</span>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-950 border border-slate-800 relative overflow-hidden">
        {/* Radar sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent w-full h-[20%] animate-[scan_3s_ease-in-out_infinite] top-0 pointer-events-none" />
        
        <div className="grid grid-cols-8 gap-0.5 p-1 h-full">
            {miniGrid.map((row, i) => (
                row.map((_, j) => (
                    <div 
                        key={`${i}-${j}`} 
                        className={`
                            ${Math.random() > 0.7 ? 'bg-slate-700' : 'bg-slate-900'} 
                            rounded-[1px]
                            ${i === 3 && j === 4 ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' : ''} 
                        `}
                    />
                ))
            ))}
        </div>
      </div>
      
      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
        <div>X: 142</div>
        <div>Y: 093</div>
        <div>SEC: 4B</div>
        <div className="text-emerald-500">CONN: OK</div>
      </div>
    </div>
  );
}
