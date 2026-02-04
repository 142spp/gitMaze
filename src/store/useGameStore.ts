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

    // Core Engines
    git: GitEngine;
    currentMaze: MazeState;
    gitVersion: number;

    // UI Effects
    visualEffect: 'none' | 'preparing-tear' | 'preparing-flip' | 'tearing' | 'flipping';
    pendingResetAction: (() => void) | null;
    terminalHistory: string[];

    // Actions
    startGame: () => void;
    initialize: () => Promise<void>;
    sendCommand: (cmd: string) => Promise<void>;
    completeGame: () => Promise<void>;
    movePlayer: (dx: number, dz: number) => void;
    addLog: (log: string) => void;


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
    width: 6,
    height: 6,
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
        gitVersion: 0,
        terminalHistory: ['Welcome to gitMaze.', 'Initializing system...'],
        visualEffect: 'none',
        pendingResetAction: null,

        addLog: (log: string) => set((state) => ({ terminalHistory: [...state.terminalHistory, log] })),

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

        // Page Flip Logic
        requestFlip: (action) => {
            set({ visualEffect: 'preparing-flip', pendingResetAction: action });
        },

        confirmFlip: () => {
            // Only confirm if we are actually preparing for flip
            if (get().visualEffect !== 'preparing-flip') return;

            const { pendingResetAction } = get();
            if (pendingResetAction) {
                pendingResetAction();
                set({ visualEffect: 'flipping', pendingResetAction: null });

                // Cleanup
                setTimeout(() => {
                    set({ visualEffect: 'none' });
                }, 1600); // Flip duration (1.5s + buffer)
            }
        },

        finishFlip: () => set({ visualEffect: 'none' }),

        startGame: () => {
            get().requestFlip(() => {
                set({ gameStatus: 'playing' });
                // Also trigger initialization if needed, but it might be better to do it separately or here
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
                    // 2. 새로운 미로 생성 (서버 장애 시 로컬 fallback 작동)
                    addLog('Generating spacetime maze...');
                    const newMazeData = await api.getNewMaze(6, 6);

                    const newGit = new GitEngine(newMazeData);

                    set({
                        git: newGit,
                        currentMaze: newGit.getCurrentState(),
                        isLoading: false,
                        gitVersion: get().gitVersion + 1
                    });

                    addLog('Ready. Type "help" to start.');
                }

            } catch (err: any) {
                console.error("Initialization Failed:", err);
                set({
                    isLoading: false,
                    error: null
                });
                //addLog('Notice: Operating in Offline Mode (Local Storage).');
            }
        },

        /**
         * 현재 Git 엔진의 상태를 백엔드(또는 로컬 스토리지)와 동기화합니다.
         */
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
            const { currentMaze } = get();
            const { playerPosition, walls, width, height } = currentMaze;
            const newX = playerPosition.x + dx;
            const newZ = playerPosition.z + dz;

            // 1. Boundary Check
            if (newX < 0 || newX >= width || newZ < 0 || newZ >= height) return;

            // 2. Wall Collision Check
            // Check if there is a wall between (currentX, currentZ) and (newX, newZ)
            // If dx != 0, we are moving horizontally. Check vertical walls at newX (if moving right) or currentX (if moving left)
            // If dz != 0, we are moving vertically. Check horizontal walls at newZ (if moving down) or currentZ (if moving up)

            const blocked = walls.some(wall => {
                if (wall.opened) return false;

                // Movement Logic:
                // Moving Right (dx > 0): Checking Vertical wall at x = newX, z = currentZ
                // Moving Left  (dx < 0): Checking Vertical wall at x = currentX, z = currentZ
                // Moving Down  (dz > 0): Checking Horizontal wall at z = newZ, x = currentX
                // Moving Up    (dz < 0): Checking Horizontal wall at z = currentZ, x = currentX

                if (dx > 0) { // Moving Right -> Check Vertical Wall at newX
                    return wall.type === 'VERTICAL' && wall.startX === newX && wall.startZ === newZ;
                }
                if (dx < 0) { // Moving Left -> Check Vertical Wall at currentX
                    return wall.type === 'VERTICAL' && wall.startX === playerPosition.x && wall.startZ === playerPosition.z;
                }
                if (dz > 0) { // Moving Down -> Check Horizontal Wall at newZ
                    return wall.type === 'HORIZONTAL' && wall.startZ === newZ && wall.startX === newX;
                }
                if (dz < 0) { // Moving Up -> Check Horizontal Wall at currentZ
                    return wall.type === 'HORIZONTAL' && wall.startZ === playerPosition.z && wall.startX === playerPosition.x;
                }
                return false;
            });

            if (!blocked) {
                set((state) => ({
                    currentMaze: {
                        ...state.currentMaze,
                        playerPosition: { x: newX, z: newZ }
                    }
                }));

                // Check Win Condition (Reach Bottom-Right)
                console.log(`Checking Win: Pos(${newX}, ${newZ}) vs Goal(${width - 1}, ${height - 1})`);
                if (newX === width - 1 && newZ === height - 1) {
                    console.log("Game Cleared Triggered!");
                    get().completeGame();
                }
            }
        },

        completeGame: async () => {
            const { userId, startTime, commandCount } = get();
            const playTime = Math.floor((Date.now() - startTime) / 1000); // seconds

            set({ gameStatus: 'cleared', isSaving: true, saveError: null });

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
                requestTear
            });

            // Force re-render of components tracking the git engine
            set({ gitVersion: get().gitVersion + 1 });
        }
    }
})
