import { create } from 'zustand'
import { GitEngine } from '../lib/git/GitEngine'
import { MazeState } from '../lib/git/types'
import { api } from '../lib/api'
import { useTerminalStore } from './useTerminalStore'
import { CommandHandler } from '../lib/git/CommandHandler'

interface GameState {
    // Session
    userId: string;
    gameStatus: 'intro' | 'playing' | 'cleared';
    startTime: number;
    commandCount: number;
    isLoading: boolean;
    isSaving?: boolean;
    saveError?: string | null;
    error: string | null;
    finalTime: number | null;

    // Core Engines
    git: GitEngine;
    currentMaze: MazeState;
    gitVersion: number;
    currentStage: number;
    currentCategory: 'tutorial' | 'main';
    visitedCells: Set<string>; // "x,z" format

    // UI Effects
    visualEffect: 'none' | 'preparing-tear' | 'preparing-flip' | 'tearing' | 'flipping' | 'moving-right';
    pendingResetAction: (() => void) | null;
    terminalHistory: string[];
    isFalling: boolean;
    deathCount: number;
    isDead: boolean;

    // Actions
    startGame: () => void;
    initialize: () => Promise<void>;
    sendCommand: (cmd: string) => Promise<void>;
    completeGame: () => Promise<void>;
    movePlayer: (dx: number, dz: number) => void;
    resetPlayerPosition: () => void;
    addLog: (log: string) => void;
    loadTutorial: (level: number) => Promise<void>;
    loadStage: (category: string, level: number) => Promise<void>;
    nextStage: () => Promise<void>;


    // Tearing Flow (Reset)
    requestTear: (action: () => void) => void;
    confirmTear: () => void;
    finishTear: () => void;

    // Flipping Flow (Checkout)
    requestFlip: (action: () => void) => void;
    confirmFlip: () => void;
    finishFlip: () => void;


    // Internal Actions
    syncToBackend: () => Promise<void>;
}

// ... (getUserId and INITIAL_PLACEHOLDER remain same)



// Check localStorage for existing userId
const getUserId = () => {
    let id = localStorage.getItem('gitmaze_user_id');
    if (!id) {
        id = 'user_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('gitmaze_user_id', id);
    }
    return id;
};

// Initial Placeholder State
const INITIAL_PLACEHOLDER: MazeState = {
    width: 0,
    height: 0,
    grid: [],
    walls: [],
    items: [],
    startPos: { x: 0, z: 0 },
    playerPosition: { x: 0, z: 0 },
    inventory: [],
    flags: {}
};

export const useGameStore = create<GameState>((set, get) => {
    // 플레이어의 액션을 처리할 Git 엔진 인스턴스 초기화
    const git = new GitEngine(INITIAL_PLACEHOLDER);

    return {
        userId: getUserId(),
        gameStatus: 'intro',
        startTime: Date.now(),
        commandCount: 0,
        isLoading: true,
        error: null,

        git,
        currentMaze: INITIAL_PLACEHOLDER,
        visitedCells: new Set<string>(['0,0']), // Track visited cells for Fog of War
        gitVersion: 1,
        currentStage: 1,
        currentCategory: 'tutorial',
        terminalHistory: ['Welcome to gitMaze.', 'Initializing system...'],
        visualEffect: 'none',
        pendingResetAction: null,
        finalTime: null,
        isFalling: false,
        deathCount: 0,
        isDead: false,

        addLog: (log: string) => set((state) => ({ terminalHistory: [...state.terminalHistory, log] })),

        resetPlayerPosition: () => {
            const { currentMaze, deathCount } = get();
            set({
                currentMaze: {
                    ...currentMaze,
                    playerPosition: { x: currentMaze.startPos.x, z: currentMaze.startPos.z }
                },
                isFalling: false,
                deathCount: deathCount + 1,
                isDead: false  // Revive player
            });
        },

        requestTear: (action) => {
            set({ visualEffect: 'preparing-tear', pendingResetAction: action });
        },

        confirmTear: () => {
            // Only confirm if we are actually preparing for tear
            if (get().visualEffect !== 'preparing-tear') return;

            const { pendingResetAction } = get();
            if (pendingResetAction) {
                pendingResetAction();
                set({ visualEffect: 'tearing', pendingResetAction: null });

                // Cleanup after animation
                setTimeout(() => {
                    set({ visualEffect: 'none' });
                }, 1000);
            }
        },

        finishTear: () => set({ visualEffect: 'none' }),

        // Page Flip Logic - Sequenced (Slide right then flip)
        requestFlip: (action) => {
            // 1. Move the book to the right
            set({ visualEffect: 'moving-right' });

            // Trigger action (gameStatus: 'playing') IMMEDIATELY during the slide
            // so it starts rendering/initializing underneath the cover.
            setTimeout(() => {
                action();
            }, 10);

            // 2. After slide animation (600ms), start flipping
            setTimeout(() => {
                set({ visualEffect: 'flipping' });

                // 3. After flip animation (1500ms CSS + 100ms grace), finish
                setTimeout(() => {
                    set({ visualEffect: 'none' });
                }, 1600);
            }, 600);
        },

        confirmFlip: () => {
            // No longer needed, kept for compatibility
        },

        finishFlip: () => set({ visualEffect: 'none' }),

        startGame: () => {
            get().requestFlip(() => {
                set({ gameStatus: 'playing' });
                get().initialize();
            });
        },

        initialize: async () => {
            const { userId, addLog } = get();
            set({ isLoading: true, error: null, startTime: Date.now(), commandCount: 0, gameStatus: 'playing' });

            try {
                // 1. 이전 세션 복구 시도
                const savedGraph = await api.pullDimensions(userId);

                if (savedGraph) {
                    addLog('Restoring previous session...');
                    const restoredState = git.importGraph(JSON.stringify(savedGraph));

                    set({
                        currentMaze: restoredState,
                        isLoading: false,
                        gitVersion: get().gitVersion + 1
                    });
                    addLog('Session restored. Type "help" for commands.');
                } else {
                    // 2. 새로운 미로 생성 (스테이지 1)
                    addLog('Loading spacetime stage 1...');
                    const newMazeData = await api.getNewMaze(1);

                    const newGit = new GitEngine(newMazeData);

                    set({
                        git: newGit,
                        currentMaze: newGit.getCurrentState(),
                        isLoading: false,
                        gitVersion: get().gitVersion + 1,
                        currentStage: 1,
                        currentCategory: 'main'
                    });

                    addLog('Ready. Type "help" to start.');
                }

            } catch (err: any) {
                console.error("Initialization Failed:", err);
                set({
                    isLoading: false,
                    error: null
                });
            }
        },

        loadTutorial: async (level: number) => {
            return get().loadStage('tutorial', level);
        },

        loadStage: async (category: string, level: number) => {
            const { git, addLog } = get();
            set({ isLoading: true, error: null });

            try {
                addLog(`Loading ${category} stage ${level}...`);
                const mazeData = await api.getStage(category, level);

                const newGit = new GitEngine(mazeData);

                set({
                    git: newGit,
                    currentMaze: newGit.getCurrentState(),
                    isLoading: false,
                    gitVersion: get().gitVersion + 1,
                    gameStatus: 'playing',
                    startTime: Date.now(),
                    commandCount: 0,
                    currentStage: level,
                    currentCategory: category as 'tutorial' | 'main',
                    deathCount: 0,
                    visitedCells: new Set<string>([`${mazeData.startPos.x},${mazeData.startPos.z}`])
                });

                addLog(`Stage ${category} ${level} ready.`);
            } catch (err) {
                console.error("Stage load failed:", err);
                set({ isLoading: false, error: "Failed to load stage" });
            }
        },

        nextStage: async () => {
            const { currentStage, currentCategory, loadStage } = get();
            await loadStage(currentCategory, currentStage + 1);
        },

        syncToBackend: async () => {
            const { userId, git } = get();
            try {
                const graphJson = git.exportGraph();
                await api.pushDimensions(userId, graphJson);
            } catch (e) {
                console.error("Failed to sync state", e);
            }
        },
        movePlayer: (dx: number, dz: number) => {
            const { currentMaze, completeGame, isDead, isFalling } = get();

            // Block movement if dead or falling
            if (isDead || isFalling) return;

            const { playerPosition, walls, width, height, items, startPos, grid } = currentMaze;

            const targetX = playerPosition.x + dx;
            const targetZ = playerPosition.z + dz;

            // 1. Boundary Check for Player
            if (targetX < 0 || targetX >= width || targetZ < 0 || targetZ >= height) return;

            // 2. Floor Tile Check (must have floor to move)
            const targetFloorType = grid[targetZ][targetX];
            if (targetFloorType === 'void') return; // No floor tile = void, cannot move

            // 3. Wall Collision Check Function
            const isWallBlocking = (x: number, z: number, moveDirX: number, moveDirZ: number) => {
                return walls.some(wall => {
                    if (wall.opened) return false;
                    if (moveDirX > 0) return wall.type === 'VERTICAL' && wall.startX === x + 1 && wall.startZ === z;
                    if (moveDirX < 0) return wall.type === 'VERTICAL' && wall.startX === x && wall.startZ === z;
                    if (moveDirZ > 0) return wall.type === 'HORIZONTAL' && wall.startZ === z + 1 && wall.startX === x;
                    if (moveDirZ < 0) return wall.type === 'HORIZONTAL' && wall.startZ === z && wall.startX === x;
                    return false;
                });
            };

            // Player Wall Check
            if (isWallBlocking(playerPosition.x, playerPosition.z, dx, dz)) return;

            // 4. Block Pushing Check
            const blockIndex = items.findIndex(item => item.type.startsWith('block_') && item.x === targetX && item.z === targetZ);
            let updatedItems = [...items];

            if (blockIndex !== -1) {
                const block = items[blockIndex];
                const nextBlockX = block.x + dx;
                const nextBlockZ = block.z + dz;

                // Block Boundary Check
                if (nextBlockX < 0 || nextBlockX >= width || nextBlockZ < 0 || nextBlockZ >= height) return;

                // Block Floor Check (can only push blocks onto solid floor)
                const blockTargetFloorType = grid[nextBlockZ][nextBlockX];
                if (blockTargetFloorType !== 'solid') return; // Cannot push block to pit or void

                // Block Wall Check
                if (isWallBlocking(block.x, block.z, dx, dz)) return;

                // Block overlapping another block Check
                if (items.some(it => it.type.startsWith('block_') && it.x === nextBlockX && it.z === nextBlockZ)) return;

                // Move Block
                updatedItems[blockIndex] = { ...block, x: nextBlockX, z: nextBlockZ };
            }

            // 5. Pit Check (if player moved to pit, trigger falling animation)
            if (targetFloorType === 'pit') {
                set((state) => {
                    const newVisited = new Set(state.visitedCells);
                    newVisited.add(`${targetX},${targetZ}`);
                    return {
                        currentMaze: {
                            ...currentMaze,
                            playerPosition: { x: targetX, z: targetZ },
                            items: updatedItems
                        },
                        visitedCells: newVisited,
                        isFalling: true
                    };
                });
                return; // Exit early
            }

            // 6. Normal Move Update
            set((state) => {
                const newVisited = new Set(state.visitedCells);
                newVisited.add(`${targetX},${targetZ}`);
                return {
                    currentMaze: {
                        ...state.currentMaze,
                        playerPosition: { x: targetX, z: targetZ },
                        items: updatedItems
                    },
                    visitedCells: newVisited
                };
            });

            // 7. Check Win Condition
            const hasPlates = updatedItems.some(it => it.type.startsWith('plate_'));

            if (hasPlates) {
                // Puzzle Win: All plates must have matching blocks
                const plates = updatedItems.filter(it => it.type.startsWith('plate_'));
                const allSatisfied = plates.every(plate => {
                    const shape = plate.type.split('_')[1]; // cube, sphere, tetra
                    return updatedItems.some(it => it.type === `block_${shape}` && it.x === plate.x && it.z === plate.z);
                });

                if (allSatisfied) {
                    completeGame();
                }
            } else {
                // Classic Win: Collect all stars
                const remainingStars = updatedItems.filter(it => it.type === 'star');
                if (remainingStars.length === 0) {
                    completeGame();
                }
            }
        },

        completeGame: async () => {
            const { userId, startTime, commandCount } = get();
            const playTime = (Date.now() - startTime) / 1000; // seconds (precise)
            set({ gameStatus: 'cleared', isSaving: true, saveError: null, finalTime: playTime });

            try {
                await api.endGame(userId, commandCount, playTime);
                set({ isSaving: false });
            } catch (e) {
                console.error("Failed to save game result", e);
                set({ isSaving: false, saveError: "Failed to save result" });
            }
        },

        sendCommand: async (cmd: string) => {
            const { git, syncToBackend, initialize, requestFlip, requestTear } = get();
            const { addLog } = useTerminalStore.getState();

            // Special case for git pull as it needs store's initialize
            if (cmd.trim() === 'git pull') {
                addLog(`> ${cmd}`);
                await initialize();
                return;
            }

            await CommandHandler.execute(cmd, {
                git,
                currentMaze: get().currentMaze,
                addLog,
                setMaze: (maze) => set({ currentMaze: maze }),
                syncToBackend,
                requestFlip,
                requestTear,
                loadTutorial: get().loadTutorial,
                loadStage: get().loadStage,
                nextStage: get().nextStage,
                resetPlayerPosition: get().resetPlayerPosition,
                isDead: get().isDead
            });

            // Force re-render of components tracking the git engine
            set({ gitVersion: get().gitVersion + 1 });
        }
    }
})
