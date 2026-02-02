import React from 'react';

export function SystemMap() {
  return (
    <div className="relative group">
      {/* Yellow Sticky Note */}
      <div 
        className="w-48 h-40 bg-[#fff59d] shadow-md transform rotate-1 rounded-sm p-4 flex flex-col border border-yellow-300/50 transition-transform hover:-rotate-1"
        style={{
             backgroundImage: 'linear-gradient(#f9fbe7 1px, transparent 1px), linear-gradient(90deg, #f9fbe7 1px, transparent 1px)',
             backgroundSize: '15px 15px'
        }}
      >
        {/* Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 rotate-1 backdrop-blur-[1px] shadow-sm border-l border-r border-white/60" />

        <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] font-bold text-amber-900/60">* SYSTEM_MAP</span>
            <span className="text-[8px] font-bold text-red-400 uppercase">LIVE</span>
        </div>

        {/* Map Grid */}
        <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-1 p-1">
             {[...Array(12)].map((_, i) => (
                 <div key={i} className={`
                    border-2 rounded-[4px] 
                    ${i === 5 ? 'bg-blue-400 border-blue-500 shadow-sm' : 'border-amber-900/10'}
                 `} />
             ))}
        </div>
        
        <div className="flex justify-between items-end mt-1">
            <span className="text-[8px] text-amber-900/30 font-mono">x: 0010</span>
            <span className="text-[8px] text-amber-900/30 font-mono">y: 0055</span>
        </div>
      </div>
    </div>
  );
}
