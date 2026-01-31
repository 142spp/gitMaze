import React from 'react';
import { GitGraph } from './components/GitGraph';
import { MazeView } from './components/MazeView';
import { MiniMap } from './components/MiniMap';
import { Terminal } from './components/Terminal';
import { Zap, Wifi, Battery } from 'lucide-react';

export default function App() {
  return (
    <div className="w-full h-screen bg-black text-slate-200 overflow-hidden flex font-mono select-none">
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* Left Sidebar: Git Graph */}
      <aside className="w-72 h-full border-r border-slate-800 bg-slate-950 flex flex-col z-20 shadow-2xl">
        <div className="h-12 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
          </div>
          <span className="text-xs text-slate-500 font-bold tracking-widest">COMMIT_LOG</span>
        </div>
        <GitGraph />
        
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
          <span>REPO: origin/master</span>
          <span className="text-emerald-500">SYNCED</span>
        </div>
      </aside>

      {/* Right Column */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Header / Status Bar */}
        <header className="h-10 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <span className="text-blue-400 font-bold text-sm tracking-widest">GIT_CRAWLER_V1.0</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400">SESSION_ID: 8X-99</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
             <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-500" />
                <span>ONLINE</span>
             </div>
             <div className="flex items-center gap-1">
                <Battery className="w-3 h-3 text-blue-500" />
                <span>98%</span>
             </div>
             <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span>POWER</span>
             </div>
          </div>
        </header>

        {/* Main Game Area */}
        <main className="flex-1 relative bg-slate-900 overflow-hidden">
          <MazeView />
          
          {/* MiniMap Overlay - Top Right */}
          <div className="absolute top-4 right-4 w-48 h-48 z-30 shadow-2xl border border-slate-700 bg-black/80 backdrop-blur-sm">
             <MiniMap />
          </div>

          {/* Floater UI elements (optional aesthetic) */}
          <div className="absolute bottom-4 left-4 pointer-events-none">
            <div className="text-[10px] text-slate-600 flex flex-col gap-0.5">
               <span>RENDER_ENGINE: REACT_DOM</span>
               <span>FPS: 60</span>
               <span>LATENCY: 12ms</span>
            </div>
          </div>
        </main>

        {/* Bottom Terminal */}
        <div className="h-48 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <Terminal />
        </div>

      </div>
    </div>
  );
}
