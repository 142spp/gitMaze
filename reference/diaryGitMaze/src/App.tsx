import React from 'react';
import { Book } from './components/Book';

export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        
        body {
          font-family: 'Nunito', sans-serif;
        }

        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 94, 60, 0.3); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 94, 60, 0.5); 
        }

        .clip-path-pencil {
          clip-path: polygon(0 50%, 100% 0, 100% 100%);
        }
      `}</style>
      <div 
        className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden relative bg-[#e6d5c3]"
        style={{
          // Soft blurred wood-like background using gradients/patterns or a soft image
          backgroundImage: `url('https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
         {/* Blur overlay for the background to make it look soft/dreamy */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-amber-100/20" />
        
        <Book />

        {/* Floating UI controls (bottom left) */}
        <div className="absolute bottom-8 left-8 flex gap-3 z-50">
            <button className="w-12 h-12 bg-[#fdfbf7] rounded-full shadow-lg flex items-center justify-center text-amber-700 hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
            </button>
            <button className="w-12 h-12 bg-[#fdfbf7] rounded-full shadow-lg flex items-center justify-center text-amber-700/60 hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
        </div>
      </div>
    </>
  );
}
