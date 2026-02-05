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
    grid: string[] | string[][]; // Floor types can be rows of strings or array of chars
    minCommands?: number;
    walls: Wall[];
    items: Item[];
    startPos: { x: number; z: number };

    // Player state
    playerPosition: { x: number, z: number };
    inventory: string[];
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
    branch: string; // The branch this commit was created on

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
    branchColors: Map<string, string>; // Maps branch name to hex color
    HEAD: GitReference;
}
