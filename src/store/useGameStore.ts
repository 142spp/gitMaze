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
    movePlayer: (dx: number, dz: number) => void;
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
    // Initialize engine with placeholder, will be replaced in initialize()
    const git = new GitEngine(INITIAL_PLACEHOLDER);

    return {
        userId: getUserId(),
        isLoading: true,
        error: null,

        git,
        currentMaze: INITIAL_PLACEHOLDER,
        terminalHistory: ['Welcome to gitMaze.', 'Initializing system...'],

        addLog: (log: string) => set((state) => ({ terminalHistory: [...state.terminalHistory, log] })),

        initialize: async () => {
            const { userId, addLog } = get();
            set({ isLoading: true, error: null });

            try {
                // Try to restore session first
                const savedGraph = await api.pullDimensions(userId);

                if (savedGraph) {
                    addLog('Restoring previous session...');
                    // Import Graph into GitEngine
                    const restoredState = git.importGraph(JSON.stringify(savedGraph));

                    set({
                        currentMaze: restoredState,
                        isLoading: false
                    });
                    addLog('Session restored. Type "help" for commands.');
                } else {
                    addLog('Generating new spacetime maze...');
                    const newMazeData = await api.getNewMaze(6, 6);

                    // Re-initialize GitEngine with new maze state
                    const newGit = new GitEngine(newMazeData);

                    set({
                        git: newGit,
                        currentMaze: newGit.getCurrentState(),
                        isLoading: false
                    });

                    // Sync initial state to backend
                    await get().syncToBackend();
                    addLog('Maze generated. Type "help" to start.');
                }

            } catch (err: any) {
                console.error("Initialization Failed:", err);
                set({
                    isLoading: false,
                    error: err.message || 'Failed to connect to server.'
                });
                addLog(`Error: ${err.message}`);
                addLog('Make sure the Backend (gitmaze) is running.');
            }
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
            }
        },

        sendCommand: async (cmd: string) => {
            const { git, addLog, syncToBackend } = get();
            const parts = cmd.trim().split(/\s+/);

            addLog(`> ${cmd}`);

            try {
                let shouldSync = false;

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
                        // list branches
                        const branches = git.getBranches();
                        const head = git.getGraph().HEAD;
                        const currentBranch = head.type === 'branch' ? head.ref : null;

                        branches.forEach(branch => {
                            if (branch === currentBranch) {
                                // Green color for current branch (using simplified markup or just text)
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
                    set({ currentMaze: newState });
                    addLog(`Switched to '${target}'`);
                    // Note: Checkout changes HEAD, so we should sync
                    shouldSync = true;
                }
                else if (parts[0] === 'git' && parts[1] === 'commit') {
                    const msgMatch = cmd.match(/"([^"]+)"/);
                    const msg = msgMatch ? msgMatch[1] : (parts.slice(3).join(' ') || 'New commit');

                    // Commit current state
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
                    // Manual pull? Maybe reload page or just call initialize logic
                    await get().initialize();
                }
                else {
                    addLog(`Command not recognized: ${cmd}`);
                }

                if (shouldSync) {
                    await syncToBackend();
                }

            } catch (error: any) {
                addLog(`Error: ${error.message}`);
            }
        }
    }
})
