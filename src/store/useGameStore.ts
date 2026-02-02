import { create } from 'zustand'
import { GitEngine } from '../lib/git/GitEngine'
import { MazeState, TileType } from '../lib/git/types'

interface GameState {
    git: GitEngine;
    currentMaze: MazeState;
    terminalHistory: string[];
    gitVersion: number;

    // Actions
    sendCommand: (cmd: string) => void;
    addLog: (log: string) => void;
}

// Initial Maze State
const INITIAL_MAZE: MazeState = {
    grid: [
        ['floor', 'floor', 'floor', 'wall'],
        ['floor', 'wall', 'floor', 'wall'],
        ['floor', 'floor', 'wall', 'floor'],
    ] as TileType[][],
    playerPosition: { x: 0, y: 0 },
    inventory: [],
    flags: {}
};

export const useGameStore = create<GameState>((set, get) => {
    const git = new GitEngine(INITIAL_MAZE);

    return {
        git,
        currentMaze: git.getCurrentState(),
        terminalHistory: ['Welcome to gitMaze.', 'Type "help" for a list of commands.'],
        gitVersion: 0, // Initial version

        sendCommand: (cmd: string) => {
            const parts = cmd.trim().toLowerCase().split(/\s+/);
            set((state) => ({
                terminalHistory: [...state.terminalHistory, `> ${cmd}`]
            }));

            try {
                if (parts[0] === 'help') {
                    get().addLog('Available: git checkout -b <name>, git checkout <name>, git commit -m "<msg>", help');
                }
                else if (parts[0] === 'git' && parts[1] === 'branch') {
                    const branchName = parts[2];
                    if (branchName) {
                        git.createBranch(branchName);
                        // Increment version to trigger UI update
                        set((state) => ({ gitVersion: state.gitVersion + 1 }));
                        get().addLog(`Branch '${branchName}' created.`);
                    } else {
                        const branches = git.getBranches();
                        const head = git.getGraph().HEAD;
                        const currentBranch = head.type === 'branch' ? head.ref : null;

                        branches.forEach(branch => {
                            if (branch === currentBranch) {
                                get().addLog(`* \x1b[1;32m${branch}\x1b[0m`);
                            } else {
                                get().addLog(`  ${branch}`);
                            }
                        });
                    }
                }
                else if (parts[0] === 'git' && parts[1] === 'checkout') {
                    if (parts[2] === '-b') {
                        const newBranch = parts[3];
                        if (!newBranch) throw new Error('Branch name required');
                        git.createBranch(newBranch);
                        get().addLog(`Created and switched to branch '${newBranch}'`);
                        // Auto-checkout for convenience
                        const newState = git.checkout(newBranch);
                        // Update maze and increment version
                        set((state) => ({
                            currentMaze: newState,
                            gitVersion: state.gitVersion + 1
                        }));
                    } else {
                        const target = parts[2];
                        const newState = git.checkout(target);
                        set((state) => ({
                            currentMaze: newState,
                            gitVersion: state.gitVersion + 1
                        }));
                        get().addLog(`Switched to '${target}'`);
                    }
                }
                else if (parts[0] === 'git' && parts[1] === 'commit') {
                    const msg = cmd.match(/"([^"]+)"/)?.[1] || 'New commit';
                    git.commit(msg, get().currentMaze);
                    set((state) => ({ gitVersion: state.gitVersion + 1 }));
                    get().addLog(`[${git.getGraph().HEAD.ref} commit] ${msg}`);
                }
                else if (parts[0] === 'git' && parts[1] === 'merge') {
                    const target = parts[2];
                    if (!target) throw new Error('Merge target branch required');
                    const result = git.merge(target);
                    // Merge changes graph structure potentially, so update version
                    set((state) => ({ gitVersion: state.gitVersion + 1 }));
                    get().addLog(result);
                }
                else if (parts[0] === 'git' && parts[1] === 'reset') {
                    const mode = parts.includes('--hard') ? 'hard' : 'soft'; // Default to soft as per git usually or --soft
                    const target = parts.find(p => !p.startsWith('--') && p !== 'git' && p !== 'reset') || 'HEAD';

                    const newState = git.reset(target, mode, get().currentMaze);
                    set((state) => ({
                        currentMaze: newState,
                        gitVersion: state.gitVersion + 1
                    }));
                    get().addLog(`Reset to ${target} (${mode})`);
                }
                else if (parts[0] === 'git' && parts[1] === 'push') {
                    const data = git.exportGraph();
                    localStorage.setItem('git_maze_save', data);
                    get().addLog('Dimension data synchronized to server (Cloud Save)');
                }
                else if (parts[0] === 'git' && parts[1] === 'pull') {
                    const data = localStorage.getItem('git_maze_save');
                    if (!data) throw new Error('No dimension data found on server');
                    const newState = git.importGraph(data);
                    set((state) => ({
                        currentMaze: newState,
                        gitVersion: state.gitVersion + 1
                    }));
                    get().addLog('Dimension data restored from server (Cloud Load)');
                }
                else {
                    get().addLog(`Command not recognized: ${cmd}`);
                }
            } catch (error: any) {
                get().addLog(`Error: ${error.message}`);
            }
        },

        addLog: (log: string) => set((state) => ({
            terminalHistory: [...state.terminalHistory, log]
        }))
    };
});

