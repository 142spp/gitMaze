import { create } from 'zustand'
import { GitEngine } from '../lib/git/GitEngine'
import { MazeState } from '../lib/git/types'
import { api } from '../lib/api'

interface GameState {
    // Session
    userId: string;
    isLoading: boolean;
    error: string | null;

    // Core Engines
    git: GitEngine;
    currentMaze: MazeState;
    terminalHistory: string[];

    // Actions
    initialize: () => Promise<void>;
    sendCommand: (cmd: string) => Promise<void>;
    addLog: (log: string) => void;

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
        terminalHistory: ['Welcome to gitMaze.', 'Initializing system...'],

        /**
         * 터미널 로그에 메시지를 추가합니다.
         */
        addLog: (log: string) => set((state) => ({ terminalHistory: [...state.terminalHistory, log] })),

        /**
         * 시스템 초기화: 서버 또는 로컬 스토리지에서 이전 세션을 복구하거나 새로운 미로를 생성합니다.
         */
        initialize: async () => {
            const { userId, addLog } = get();
            set({ isLoading: true, error: null });

            try {
                // 1. 이전 세션 복구 시도
                const savedGraph = await api.pullDimensions(userId);

                if (savedGraph) {
                    addLog('Restoring previous session...');
                    const restoredState = git.importGraph(JSON.stringify(savedGraph));

                    set({
                        currentMaze: restoredState,
                        isLoading: false
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
                        isLoading: false
                    });

                    await get().syncToBackend();
                    addLog('Ready. Type "help" to start.');
                }

            } catch (err: any) {
                console.error("Initialization Failed:", err);
                set({
                    isLoading: false,
                    error: null
                });
                addLog('Notice: Operating in Offline Mode (Local Storage).');
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
            const { git, addLog, syncToBackend } = get();
            const parts = cmd.trim().split(/\s+/);

            addLog(`> ${cmd}`);

            try {
                let shouldSync = false;

                // 명령어 라우팅 로직
                if (parts[0] === 'help') {
                    addLog('Available: git checkout -b <name>, git checkout <name>, git commit -m "<msg>", git merge <branch>, git reset <target>');
                }
                else if (parts[0] === 'git' && parts[1] === 'branch') {
                    const branchName = parts[2];
                    if (branchName) {
                        git.createBranch(branchName);
                        addLog(`Branch '${branchName}' created.`);
                        shouldSync = true;
                    } else {
                        // 브랜치 목록 출력
                        const branches = git.getBranches();
                        const head = git.getGraph().HEAD;
                        const currentBranch = head.type === 'branch' ? head.ref : null;

                        branches.forEach(branch => {
                            if (branch === currentBranch) {
                                addLog(`* ${branch}`);
                            } else {
                                addLog(`  ${branch}`);
                            }
                        });
                    }
                }
                else if (parts[0] === 'git' && parts[1] === 'checkout') {
                    let target = parts[2];

                    if (target === '-b') {
                        target = parts[3];
                        if (!target) throw new Error('Branch name required');
                        git.createBranch(target);
                        addLog(`Created branch '${target}'`);
                        shouldSync = true;
                    }

                    const newState = git.checkout(target);
                    // 차원 이동 시 미로 상태 업데이트
                    set({ currentMaze: newState });
                    addLog(`Switched to '${target}'`);
                    shouldSync = true;
                }
                else if (parts[0] === 'git' && parts[1] === 'commit') {
                    const msgMatch = cmd.match(/"([^"]+)"/);
                    const msg = msgMatch ? msgMatch[1] : (parts.slice(3).join(' ') || 'New commit');

                    // 현재 미로 상태를 스냅샷으로 저장
                    const commitId = git.commit(msg, get().currentMaze);
                    addLog(`[${commitId.substring(0, 7)}] ${msg}`);
                    shouldSync = true;
                }
                else if (parts[0] === 'git' && parts[1] === 'merge') {
                    const target = parts[2];
                    if (!target) throw new Error('Merge target branch required');
                    const result = git.merge(target);
                    addLog(result);
                    shouldSync = true;
                }
                else if (parts[0] === 'git' && parts[1] === 'reset') {
                    const mode = parts.includes('--hard') ? 'hard' : 'soft';
                    const target = parts.find(p => !p.startsWith('--') && p !== 'git' && p !== 'reset') || 'HEAD';

                    const newState = git.reset(target, mode, get().currentMaze);
                    set({ currentMaze: newState });
                    addLog(`Reset to ${target} (${mode})`);
                    shouldSync = true;
                }
                else if (parts[0] === 'git' && parts[1] === 'push') {
                    await syncToBackend();
                    addLog('Saved to server.');
                }
                else if (parts[0] === 'git' && parts[1] === 'pull') {
                    await get().initialize();
                }
                else {
                    addLog(`Command not recognized: ${cmd}`);
                }

                // 상태 변화가 있는 경우 동기화 수행
                if (shouldSync) {
                    await syncToBackend();
                }

            } catch (error: any) {
                addLog(`Error: ${error.message}`);
            }
        }
    }
})
