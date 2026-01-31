import { create } from 'zustand'
import { Object3D, Vector3 } from 'three'

interface MazeNode {
    type: 'wall' | 'floor' | 'checkpoint'
    position: [number, number, number]
}

interface BranchData {
    nodes: MazeNode[]
    commits: string[]
    themeColor: string
}

interface GameState {
    history: string[]
    currentBranch: string
    branches: Record<string, BranchData>
    playerPosition: [number, number, number]
    sendCommand: (cmd: string) => void
    addLog: (log: string) => void
}

const INITIAL_NODES: MazeNode[] = [
    { type: 'floor', position: [0, -0.5, 0] },
    { type: 'floor', position: [1, -0.5, 0] },
    { type: 'floor', position: [0, -0.5, 1] },
    { type: 'wall', position: [2, 0.5, 0] },
    { type: 'wall', position: [2, 0.5, 1] },
    { type: 'wall', position: [2, 0.5, 2] },
]

export const useGameStore = create<GameState>((set, get) => ({
    history: ['Welcome to gitMaze.', 'Type "help" for a list of commands.'],
    currentBranch: 'main',
    branches: {
        'main': {
            nodes: INITIAL_NODES,
            commits: ['Initial commit'],
            themeColor: '#2563eb' // Blue for Main in Light Theme
        }
    },
    playerPosition: [0, 0, 0],

    sendCommand: (cmd: string) => {
        const parts = cmd.trim().toLowerCase().split(/\s+/)
        set((state) => ({
            history: [...state.history, `> ${cmd}`]
        }))

        if (parts[0] === 'help') {
            set((state) => ({
                history: [...state.history, 'Available: git checkout -b <name>, git checkout <name>, git commit -m "<msg>", help']
            }))
        }
        else if (parts[0] === 'git' && parts[1] === 'checkout') {
            if (parts[2] === '-b') {
                const newBranch = parts[3]
                if (!newBranch) {
                    get().addLog('Error: Branch name required')
                    return
                }
                set((state) => ({
                    branches: {
                        ...state.branches,
                        [newBranch]: {
                            ...state.branches[state.currentBranch],
                            commits: [...state.branches[state.currentBranch].commits],
                            themeColor: `hsl(${Math.random() * 360}, 65%, 45%)` // Slightly deeper colors for light mode
                        }
                    },
                    currentBranch: newBranch,
                    history: [...state.history, `Created and switched to branch '${newBranch}'`]
                }))
            } else {
                const targetBranch = parts[2]
                if (get().branches[targetBranch]) {
                    set((state) => ({
                        currentBranch: targetBranch,
                        history: [...state.history, `Switched to branch '${targetBranch}'`]
                    }))
                } else {
                    get().addLog(`Error: Branch '${targetBranch}' not found`)
                }
            }
        }
        else if (parts[0] === 'git' && parts[1] === 'commit') {
            const msg = cmd.match(/"([^"]+)"/)?.[1] || 'New commit'
            const current = get().currentBranch
            set((state) => ({
                branches: {
                    ...state.branches,
                    [current]: {
                        ...state.branches[current],
                        commits: [...state.branches[current].commits, msg]
                    }
                },
                history: [...state.history, `[${current} commit] ${msg}`]
            }))
        }
        else {
            get().addLog(`Command not recognized: ${cmd}`)
        }
    },

    addLog: (log: string) => set((state) => ({
        history: [...state.history, log]
    }))
}))
