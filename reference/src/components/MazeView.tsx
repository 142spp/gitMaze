import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// 0: Path, 1: Wall, 2: Start, 3: Goal, 4: Data Fragment
const INITIAL_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 4, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 4, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 4, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const TILE_SIZE = 50; // Size of each cube in pixels
const WALL_HEIGHT = 60; // Height of walls

export function MazeView() {
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [rotation, setRotation] = useState(0); // Camera rotation around Y axis

  // Handle keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
      if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
      if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
      if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;

      if (dx === 0 && dy === 0) return;

      const newX = playerPos.x + dx;
      const newY = playerPos.y + dy;

      // Check bounds and walls
      if (
        newY >= 0 &&
        newY < INITIAL_MAP.length &&
        newX >= 0 &&
        newX < INITIAL_MAP[0].length &&
        INITIAL_MAP[newY][newX] !== 1
      ) {
        setPlayerPos({ x: newX, y: newY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center perspective-container">
      <style>{`
        .perspective-container {
          perspective: 800px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .cube-face {
          position: absolute;
          backface-visibility: visible; 
          /* Sometimes hidden causes issues with transparent textures */
        }
      `}</style>

      {/* 3D Scene Container */}
      <div
        className="relative preserve-3d transition-transform duration-500 ease-out"
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          transform: `rotateX(60deg) rotateZ(${rotation}deg)`,
        }}
      >
        {/* World Container - Moves opposite to player to keep player centered */}
        <div
          className="absolute top-0 left-0 preserve-3d transition-all duration-300 ease-out"
          style={{
            transform: `translate3d(
              ${-playerPos.x * TILE_SIZE}px, 
              ${-playerPos.y * TILE_SIZE}px, 
              0px
            )`,
          }}
        >
          {/* Render Map */}
          {INITIAL_MAP.map((row, y) =>
            row.map((cell, x) => (
              <React.Fragment key={`${x}-${y}`}>
                {/* Floor Tile (Always Rendered) */}
                <FloorTile x={x} y={y} type={cell} />

                {/* Wall Cube (Rendered if cell is 1) */}
                {cell === 1 && <WallCube x={x} y={y} height={WALL_HEIGHT} />}

                {/* Data Fragment (Floating Item) */}
                {cell === 4 && <DataFragment x={x} y={y} />}
                
                {/* Goal */}
                {cell === 3 && <GoalMarker x={x} y={y} />}
              </React.Fragment>
            ))
          )}

          {/* Player Cube */}
          <PlayerCube x={playerPos.x} y={playerPos.y} />
        </div>
      </div>

      {/* Overlay Instructions */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono text-blue-400">POS: [{playerPos.x}, {playerPos.y}]</div>
          <div className="text-xs font-mono text-slate-500">USE ARROW KEYS TO MOVE</div>
        </div>
      </div>
    </div>
  );
}

function FloorTile({ x, y, type }: { x: number; y: number; type: number }) {
  return (
    <div
      className="absolute preserve-3d border border-slate-800/50"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        transform: `translate3d(${x * TILE_SIZE}px, ${y * TILE_SIZE}px, 0px)`,
        backgroundColor: type === 2 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.8)', // Green tint for start
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
      }}
    >
      {/* Grid lines inside the floor */}
      <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,transparent_25%,#fff_25%,#fff_50%,transparent_50%,transparent_75%,#fff_75%,#fff_100%)] bg-[length:10px_10px]" />
    </div>
  );
}

function WallCube({ x, y, height }: { x: number; y: number; height: number }) {
  const xPos = x * TILE_SIZE;
  const yPos = y * TILE_SIZE;
  
  const faceStyle = "cube-face absolute border border-blue-500/30 bg-slate-900/90 shadow-[0_0_15px_rgba(59,130,246,0.1)_inset]";

  return (
    <div
      className="absolute preserve-3d"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        transform: `translate3d(${xPos}px, ${yPos}px, 0px)`,
      }}
    >
      {/* Front Face */}
      <div
        className={faceStyle}
        style={{
          width: TILE_SIZE,
          height: height,
          transform: `rotateX(90deg) translateZ(${TILE_SIZE / 2}px) translateY(${-height / 2}px)`,
        }}
      />
      {/* Back Face */}
      <div
        className={faceStyle}
        style={{
          width: TILE_SIZE,
          height: height,
          transform: `rotateX(90deg) translateZ(${-TILE_SIZE / 2}px) translateY(${-height / 2}px) rotateY(180deg)`,
        }}
      />
      {/* Left Face */}
      <div
        className={faceStyle}
        style={{
          width: TILE_SIZE,
          height: height,
          transform: `rotateY(-90deg) translateZ(${TILE_SIZE / 2}px) translateY(${-height / 2}px)`,
        }}
      />
      {/* Right Face */}
      <div
        className={faceStyle}
        style={{
          width: TILE_SIZE,
          height: height,
          transform: `rotateY(90deg) translateZ(${TILE_SIZE / 2}px) translateY(${-height / 2}px)`,
        }}
      />
      {/* Top Face */}
      <div
        className={faceStyle + " bg-slate-800"}
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          transform: `translateZ(${height / 2}px)`,
          border: '1px solid rgba(59,130,246,0.5)'
        }}
      >
         <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500/20" />
         </div>
      </div>
    </div>
  );
}

function PlayerCube({ x, y }: { x: number; y: number }) {
  const size = TILE_SIZE * 0.6; // Smaller than tile
  const offset = (TILE_SIZE - size) / 2;
  const height = size;

  return (
    <div
      className="absolute preserve-3d transition-all duration-300 ease-out z-50"
      style={{
        width: size,
        height: size,
        transform: `translate3d(${x * TILE_SIZE + offset}px, ${y * TILE_SIZE + offset}px, ${height / 2}px)`,
      }}
    >
      <div className="preserve-3d w-full h-full animate-[spin_4s_linear_infinite]">
        {/* Neon Core */}
        <div className="absolute inset-0 bg-emerald-500/50 blur-md transform translate-z-2" />
        
        {/* Faces of the player cube */}
        {[0, 90, 180, 270].map((deg, i) => (
          <div
            key={i}
            className="absolute bg-emerald-500/80 border border-white/50 shadow-[0_0_10px_#10b981]"
            style={{
              width: size,
              height: height,
              transform: `rotateZ(${deg}deg) rotateX(90deg) translateZ(${size / 2}px)`,
              backfaceVisibility: 'visible'
            }}
          />
        ))}
        {/* Top */}
        <div
           className="absolute bg-emerald-400 border border-white/50"
           style={{
             width: size,
             height: size,
             transform: `translateZ(${height / 2}px)`,
           }}
        />
         {/* Bottom Shadow */}
         <div
           className="absolute bg-black/50 blur-md"
           style={{
             width: size,
             height: size,
             transform: `translateZ(${-height / 2}px)`,
           }}
        />
      </div>
    </div>
  );
}

function DataFragment({ x, y }: { x: number; y: number }) {
    return (
        <div 
            className="absolute preserve-3d flex items-center justify-center"
            style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                transform: `translate3d(${x * TILE_SIZE}px, ${y * TILE_SIZE}px, 0px)`,
            }}
        >
            <div 
                className="w-4 h-4 bg-yellow-400 rotate-45 animate-bounce shadow-[0_0_15px_#facc15]"
                style={{
                    transform: 'translateZ(20px)'
                }}
            />
        </div>
    )
}

function GoalMarker({ x, y }: { x: number; y: number }) {
    return (
        <div 
            className="absolute preserve-3d flex items-center justify-center"
            style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                transform: `translate3d(${x * TILE_SIZE}px, ${y * TILE_SIZE}px, 0px)`,
            }}
        >
             {/* Beacon beam */}
            <div 
                className="w-1 h-32 bg-gradient-to-t from-emerald-500 to-transparent absolute bottom-0 left-1/2 -translate-x-1/2 opacity-50"
                style={{ transform: 'translateZ(0px) rotateX(-90deg)', transformOrigin: 'bottom center' }}
            />
            
            <div 
                className="w-6 h-6 rounded-full border-4 border-emerald-500 shadow-[0_0_20px_#10b981]"
                style={{ transform: 'translateZ(5px)' }}
            />
        </div>
    )
}
