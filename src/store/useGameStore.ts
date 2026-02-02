import { create } from 'zustand'
import { GitEngine } from '../lib/git/GitEngine'
import { MazeState } from '../lib/git/types'

interface GameState {
    git: GitEngine;
    currentMaze: MazeState;
    terminalHistory: string[];

    // Actions
    sendCommand: (cmd: string) => void;
    addLog: (log: string) => void;
}

// Initial Maze State (From User JSON)
const INITIAL_MAZE: MazeState = {
    width: 6,
    height: 6,
    walls: [
        {
            "id": "w_0_0_v",
            "startX": 0,
            "startZ": 0,
            "endX": 0,
            "endZ": 1,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_0_1_v",
            "startX": 0,
            "startZ": 1,
            "endX": 0,
            "endZ": 2,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_0_2_v",
            "startX": 0,
            "startZ": 2,
            "endX": 0,
            "endZ": 3,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_0_3_v",
            "startX": 0,
            "startZ": 3,
            "endX": 0,
            "endZ": 4,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_0_4_v",
            "startX": 0,
            "startZ": 4,
            "endX": 0,
            "endZ": 5,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_0_5_v",
            "startX": 0,
            "startZ": 5,
            "endX": 0,
            "endZ": 6,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_1_0_v",
            "startX": 1,
            "startZ": 0,
            "endX": 1,
            "endZ": 1,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_1_1_v",
            "startX": 1,
            "startZ": 1,
            "endX": 1,
            "endZ": 2,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_1_2_v",
            "startX": 1,
            "startZ": 2,
            "endX": 1,
            "endZ": 3,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_1_3_v",
            "startX": 1,
            "startZ": 3,
            "endX": 1,
            "endZ": 4,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_1_4_v",
            "startX": 1,
            "startZ": 4,
            "endX": 1,
            "endZ": 5,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_1_5_v",
            "startX": 1,
            "startZ": 5,
            "endX": 1,
            "endZ": 6,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_2_0_v",
            "startX": 2,
            "startZ": 0,
            "endX": 2,
            "endZ": 1,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_2_1_v",
            "startX": 2,
            "startZ": 1,
            "endX": 2,
            "endZ": 2,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_2_2_v",
            "startX": 2,
            "startZ": 2,
            "endX": 2,
            "endZ": 3,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_2_3_v",
            "startX": 2,
            "startZ": 3,
            "endX": 2,
            "endZ": 4,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_2_4_v",
            "startX": 2,
            "startZ": 4,
            "endX": 2,
            "endZ": 5,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_2_5_v",
            "startX": 2,
            "startZ": 5,
            "endX": 2,
            "endZ": 6,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_3_0_v",
            "startX": 3,
            "startZ": 0,
            "endX": 3,
            "endZ": 1,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_3_1_v",
            "startX": 3,
            "startZ": 1,
            "endX": 3,
            "endZ": 2,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_3_2_v",
            "startX": 3,
            "startZ": 2,
            "endX": 3,
            "endZ": 3,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_3_3_v",
            "startX": 3,
            "startZ": 3,
            "endX": 3,
            "endZ": 4,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_3_4_v",
            "startX": 3,
            "startZ": 4,
            "endX": 3,
            "endZ": 5,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_3_5_v",
            "startX": 3,
            "startZ": 5,
            "endX": 3,
            "endZ": 6,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_4_0_v",
            "startX": 4,
            "startZ": 0,
            "endX": 4,
            "endZ": 1,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_4_1_v",
            "startX": 4,
            "startZ": 1,
            "endX": 4,
            "endZ": 2,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_4_2_v",
            "startX": 4,
            "startZ": 2,
            "endX": 4,
            "endZ": 3,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_4_3_v",
            "startX": 4,
            "startZ": 3,
            "endX": 4,
            "endZ": 4,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_4_4_v",
            "startX": 4,
            "startZ": 4,
            "endX": 4,
            "endZ": 5,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_4_5_v",
            "startX": 4,
            "startZ": 5,
            "endX": 4,
            "endZ": 6,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_5_0_v",
            "startX": 5,
            "startZ": 0,
            "endX": 5,
            "endZ": 1,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_5_1_v",
            "startX": 5,
            "startZ": 1,
            "endX": 5,
            "endZ": 2,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_5_2_v",
            "startX": 5,
            "startZ": 2,
            "endX": 5,
            "endZ": 3,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_5_3_v",
            "startX": 5,
            "startZ": 3,
            "endX": 5,
            "endZ": 4,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_5_4_v",
            "startX": 5,
            "startZ": 4,
            "endX": 5,
            "endZ": 5,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_5_5_v",
            "startX": 5,
            "startZ": 5,
            "endX": 5,
            "endZ": 6,
            "type": "VERTICAL",
            "opened": true
        },
        {
            "id": "w_6_0_v",
            "startX": 6,
            "startZ": 0,
            "endX": 6,
            "endZ": 1,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_6_1_v",
            "startX": 6,
            "startZ": 1,
            "endX": 6,
            "endZ": 2,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_6_2_v",
            "startX": 6,
            "startZ": 2,
            "endX": 6,
            "endZ": 3,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_6_3_v",
            "startX": 6,
            "startZ": 3,
            "endX": 6,
            "endZ": 4,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_6_4_v",
            "startX": 6,
            "startZ": 4,
            "endX": 6,
            "endZ": 5,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_6_5_v",
            "startX": 6,
            "startZ": 5,
            "endX": 6,
            "endZ": 6,
            "type": "VERTICAL",
            "opened": false
        },
        {
            "id": "w_0_0_h",
            "startX": 0,
            "startZ": 0,
            "endX": 1,
            "endZ": 0,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_0_1_h",
            "startX": 0,
            "startZ": 1,
            "endX": 1,
            "endZ": 1,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_0_2_h",
            "startX": 0,
            "startZ": 2,
            "endX": 1,
            "endZ": 2,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_0_3_h",
            "startX": 0,
            "startZ": 3,
            "endX": 1,
            "endZ": 3,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_0_4_h",
            "startX": 0,
            "startZ": 4,
            "endX": 1,
            "endZ": 4,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_0_5_h",
            "startX": 0,
            "startZ": 5,
            "endX": 1,
            "endZ": 5,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_0_6_h",
            "startX": 0,
            "startZ": 6,
            "endX": 1,
            "endZ": 6,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_1_0_h",
            "startX": 1,
            "startZ": 0,
            "endX": 2,
            "endZ": 0,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_1_1_h",
            "startX": 1,
            "startZ": 1,
            "endX": 2,
            "endZ": 1,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_1_2_h",
            "startX": 1,
            "startZ": 2,
            "endX": 2,
            "endZ": 2,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_1_3_h",
            "startX": 1,
            "startZ": 3,
            "endX": 2,
            "endZ": 3,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_1_4_h",
            "startX": 1,
            "startZ": 4,
            "endX": 2,
            "endZ": 4,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_1_5_h",
            "startX": 1,
            "startZ": 5,
            "endX": 2,
            "endZ": 5,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_1_6_h",
            "startX": 1,
            "startZ": 6,
            "endX": 2,
            "endZ": 6,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_2_0_h",
            "startX": 2,
            "startZ": 0,
            "endX": 3,
            "endZ": 0,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_2_1_h",
            "startX": 2,
            "startZ": 1,
            "endX": 3,
            "endZ": 1,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_2_2_h",
            "startX": 2,
            "startZ": 2,
            "endX": 3,
            "endZ": 2,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_2_3_h",
            "startX": 2,
            "startZ": 3,
            "endX": 3,
            "endZ": 3,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_2_4_h",
            "startX": 2,
            "startZ": 4,
            "endX": 3,
            "endZ": 4,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_2_5_h",
            "startX": 2,
            "startZ": 5,
            "endX": 3,
            "endZ": 5,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_2_6_h",
            "startX": 2,
            "startZ": 6,
            "endX": 3,
            "endZ": 6,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_3_0_h",
            "startX": 3,
            "startZ": 0,
            "endX": 4,
            "endZ": 0,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_3_1_h",
            "startX": 3,
            "startZ": 1,
            "endX": 4,
            "endZ": 1,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_3_2_h",
            "startX": 3,
            "startZ": 2,
            "endX": 4,
            "endZ": 2,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_3_3_h",
            "startX": 3,
            "startZ": 3,
            "endX": 4,
            "endZ": 3,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_3_4_h",
            "startX": 3,
            "startZ": 4,
            "endX": 4,
            "endZ": 4,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_3_5_h",
            "startX": 3,
            "startZ": 5,
            "endX": 4,
            "endZ": 5,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_3_6_h",
            "startX": 3,
            "startZ": 6,
            "endX": 4,
            "endZ": 6,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_4_0_h",
            "startX": 4,
            "startZ": 0,
            "endX": 5,
            "endZ": 0,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_4_1_h",
            "startX": 4,
            "startZ": 1,
            "endX": 5,
            "endZ": 1,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_4_2_h",
            "startX": 4,
            "startZ": 2,
            "endX": 5,
            "endZ": 2,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_4_3_h",
            "startX": 4,
            "startZ": 3,
            "endX": 5,
            "endZ": 3,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_4_4_h",
            "startX": 4,
            "startZ": 4,
            "endX": 5,
            "endZ": 4,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_4_5_h",
            "startX": 4,
            "startZ": 5,
            "endX": 5,
            "endZ": 5,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_4_6_h",
            "startX": 4,
            "startZ": 6,
            "endX": 5,
            "endZ": 6,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_5_0_h",
            "startX": 5,
            "startZ": 0,
            "endX": 6,
            "endZ": 0,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_5_1_h",
            "startX": 5,
            "startZ": 1,
            "endX": 6,
            "endZ": 1,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_5_2_h",
            "startX": 5,
            "startZ": 2,
            "endX": 6,
            "endZ": 2,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_5_3_h",
            "startX": 5,
            "startZ": 3,
            "endX": 6,
            "endZ": 3,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_5_4_h",
            "startX": 5,
            "startZ": 4,
            "endX": 6,
            "endZ": 4,
            "type": "HORIZONTAL",
            "opened": false
        },
        {
            "id": "w_5_5_h",
            "startX": 5,
            "startZ": 5,
            "endX": 6,
            "endZ": 5,
            "type": "HORIZONTAL",
            "opened": true
        },
        {
            "id": "w_5_6_h",
            "startX": 5,
            "startZ": 6,
            "endX": 6,
            "endZ": 6,
            "type": "HORIZONTAL",
            "opened": false
        }
    ],
    "items": [
        {
            "id": "item_3_3",
            "x": 3,
            "z": 3,
            "type": "star"
        }
    ],
    "startPos": {
        "x": 0,
        "z": 0
    },
    playerPosition: { x: 0, z: 0 },
    inventory: [],
    flags: {}
};

export const useGameStore = create<GameState>((set, get) => {
    const git = new GitEngine(INITIAL_MAZE);

    return {
        git,
        currentMaze: git.getCurrentState(),
        terminalHistory: ['Welcome to gitMaze.', 'Type "help" for a list of commands.'],

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
                        set({ currentMaze: newState });
                    } else {
                        const target = parts[2];
                        const newState = git.checkout(target);
                        set({ currentMaze: newState });
                        get().addLog(`Switched to '${target}'`);
                    }
                }
                else if (parts[0] === 'git' && parts[1] === 'commit') {
                    const msg = cmd.match(/"([^"]+)"/)?.[1] || 'New commit';
                    git.commit(msg, get().currentMaze);
                    get().addLog(`[${git.getGraph().HEAD.ref} commit] ${msg}`);
                }
                else if (parts[0] === 'git' && parts[1] === 'merge') {
                    const target = parts[2];
                    if (!target) throw new Error('Merge target branch required');
                    const result = git.merge(target);
                    get().addLog(result);
                }
                else if (parts[0] === 'git' && parts[1] === 'reset') {
                    const mode = parts.includes('--hard') ? 'hard' : 'soft'; // Default to soft as per git usually or --soft
                    const target = parts.find(p => !p.startsWith('--') && p !== 'git' && p !== 'reset') || 'HEAD';

                    const newState = git.reset(target, mode, get().currentMaze);
                    set({ currentMaze: newState });
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
                    set({ currentMaze: newState });
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

