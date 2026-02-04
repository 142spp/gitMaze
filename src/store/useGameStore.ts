import { create } from 'zustand'
import { GitEngine } from '../lib/git/GitEngine'
import { MazeState } from '../lib/git/types'
import { api } from '../lib/api'
import { useTerminalStore } from './useTerminalStore'
import { CommandHandler } from '../lib/git/CommandHandler'

interface GameState {
    // Session
    userId: string;
    gameStatus: 'playing' | 'cleared';
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

    // Actions
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
        gameStatus: 'playing',
        startTime: Date.now(),
        commandCount: 0,
        isLoading: true,
        error: null,

        git,
        currentMaze: INITIAL_PLACEHOLDER,
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

        sendCommand: async (cmd: string) => {
            const { git, syncToBackend, initialize } = get();
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
                syncToBackend
            });

            // Force re-render of components tracking the git engine
            set({ gitVersion: get().gitVersion + 1 });
        }
    }
})
