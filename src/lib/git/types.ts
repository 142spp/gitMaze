/**
 * Maze tile types
 */
export type TileType = 'empty' | 'wall' | 'player' | 'key' | 'door' | 'glitch';

/**
 * Memento: Snapshot of the maze state at a specific point in time (commit)
 */
export interface MazeState {
    // 1. Maze physical structure (Grid)
    grid: TileType[][];
    // 2. Player state
    playerPosition: { x: number, y: number };
    inventory: string[];
    // 3. Puzzle state (e.g., flags for doors, switches, etc.)
    flags: Record<string, boolean>;
}

export type CommitHash = string;

/**
 * Node in the Git Directed Acyclic Graph (DAG)
 */
export interface CommitNode {
    id: CommitHash;
    message: string;
    parents: CommitHash[]; // Multiple parents for merge commits
    timestamp: number;

    // Snapshot of the world at this commit
    snapshot: MazeState;
}

/**
 * Reference tracking (HEAD and branches)
 */
export interface GitReference {
    type: 'branch' | 'detached';
    ref: string; // Branch name or Commit ID
}

/**
 * The entire Git Graph structure
 */
export interface GitGraph {
    commits: Map<CommitHash, CommitNode>;
    branches: Map<string, CommitHash>;
    HEAD: GitReference;
}
