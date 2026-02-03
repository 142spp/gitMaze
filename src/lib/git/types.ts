/**
 * Wall Type - from User JSON
 */
export interface Wall {
    id: string;
    startX: number;
    startZ: number;
    endX: number;
    endZ: number;
    type: 'VERTICAL' | 'HORIZONTAL';
    opened: boolean;
}

/**
 * Item Type - from User JSON
 */
export interface Item {
    id: string;
    x: number;
    z: number;
    type: string;
}

/**
 * Memento: Snapshot of the maze state at a specific point in time (commit)
 */
export interface MazeState {
    width: number;
    height: number;
    walls: Wall[];
    items: Item[];
    startPos: { x: number; y: number } | { x: number; z: number }; // User JSON has startPos.x/z but we use x/y historically, let's normalize to x/z in future or adapt. User JSON said "startPos": { "x": 0, "z": 0 }
    
    // Player state (Session state, might not be in JSON but needed for runtime)
    playerPosition: { x: number, z: number }; 
    inventory: string[];
    // Puzzle state
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
