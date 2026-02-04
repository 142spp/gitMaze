import { create } from 'zustand'
import { GitEngine } from '../lib/git/GitEngine'
import { MazeState } from '../lib/git/types'
import { api } from '../lib/api'
import { useTerminalStore } from './useTerminalStore'
import { CommandHandler } from '../lib/git/CommandHandler'

interface GameState {
    // Session
    userId: string;
    isLoading: boolean;
    error: string | null;

    // Core Engines
    git: GitEngine;
    currentMaze: MazeState;
    gitVersion: number;

    // Actions
    initialize: () => Promise<void>;
    sendCommand: (cmd: string) => Promise<void>;

    // Internal Actions
    syncToBackend: () => Promise<void>;
}

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
        isLoading: true,
        error: null,

        git,
        currentMaze: INITIAL_PLACEHOLDER,
        gitVersion: 0,

        /**
         * 시스템 초기화: 서버 또는 로컬 스토리지에서 이전 세션을 복구하거나 새로운 미로를 생성합니다.
         */
        initialize: async () => {
            const { userId } = get();
            const { addLog } = useTerminalStore.getState();
            set({ isLoading: true, error: null });

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

        /**
         * 사용자가 입력한 터미널 명령어를 해석하고 Git 엔진에 전달합니다.
         * @param cmd 입력된 명령어 문자열
         */
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
