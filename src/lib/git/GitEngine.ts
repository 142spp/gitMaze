import { CommitHash, CommitNode, GitGraph, MazeState } from './types';

/**
 * GitEngine: The core logic for managing "Parallel Universes" and "Time Freezes".
 */
export class GitEngine {
    private graph: GitGraph;

    /**
     * init(): 우주의 시작
     */
    constructor(initialState: MazeState) {
        const initialCommit: CommitNode = {
            id: this.generateHash(),
            message: 'Initial commit',
            parents: [],
            timestamp: Date.now(),
            snapshot: this.cloneState(initialState),
        };

        this.graph = {
            commits: new Map([[initialCommit.id, initialCommit]]),
            branches: new Map([['main', initialCommit.id]]),
            HEAD: {
                type: 'branch',
                ref: 'main',
            },
        };
    }

    /**
     * commit(message): 시간의 박제 (Time Freeze)
     */
    commit(message: string, state: MazeState): string {
        const parentId = this.getCurrentCommitId();
        const newCommit: CommitNode = {
            id: this.generateHash(),
            message,
            parents: parentId ? [parentId] : [],
            timestamp: Date.now(),
            snapshot: this.cloneState(state),
        };

        this.graph.commits.set(newCommit.id, newCommit);

        if (this.graph.HEAD.type === 'branch') {
            this.graph.branches.set(this.graph.HEAD.ref, newCommit.id);
        } else {
            this.graph.HEAD.ref = newCommit.id;
        }

        return newCommit.id;
    }

    /**
     * branch(name): 평행우주 생성
     */
    createBranch(name: string): void {
        const currentCommitId = this.getCurrentCommitId();
        if (!currentCommitId) throw new Error('Cannot create branch from empty state');
        if (this.graph.branches.has(name)) throw new Error(`Branch already exists: ${name}`);

        this.graph.branches.set(name, currentCommitId);
    }

    /**
     * getBranches(): 모든 브랜치 목록 반환
     */
    getBranches(): string[] {
        return Array.from(this.graph.branches.keys());
    }

    private generateHash(): string {
        return Math.random().toString(16).substring(2, 9);
    }

    /**
     * Helper to find a commit ID by prefix or full match.
     */
    private resolveCommitId(target: string): string | undefined {
        if (this.graph.commits.has(target)) return target;
        // Search for prefix match
        const lowerTarget = target.toLowerCase();
        const matches = Array.from(this.graph.commits.keys()).filter(id => id.toLowerCase().startsWith(lowerTarget));

        if (matches.length === 1) return matches[0];
        if (matches.length > 1) {
            return matches[0];
        }
        return undefined;
    }

    /**
     * checkout(target): 차원 이동
     */
    checkout(target: string): MazeState {
        let commitId: string | undefined;

        if (this.graph.branches.has(target)) {
            commitId = this.graph.branches.get(target);
            this.graph.HEAD = { type: 'branch', ref: target };
        } else {
            commitId = this.resolveCommitId(target);
            if (commitId) {
                this.graph.HEAD = { type: 'detached', ref: commitId };
            }
        }

        if (!commitId) {
            throw new Error(`Dimension rift failed: Target '${target}' not found.`);
        }

        return this.cloneState(this.graph.commits.get(commitId)!.snapshot);
    }

    /**
     * reset(target, type, currentWorldState): 그 시점으로 돌아가기
     */
    reset(target: string, mode: 'soft' | 'hard', currentWorldState: MazeState): MazeState {
        let targetCommitId: string | undefined;

        if (target.toUpperCase() === 'HEAD') {
            targetCommitId = this.getCurrentCommitId() || undefined;
        } else {
            targetCommitId = this.resolveCommitId(target);
        }

        if (!targetCommitId) {
            throw new Error(`Reset failed: Target '${target}' is not a valid commit.`);
        }

        const targetSnapshot = this.graph.commits.get(targetCommitId)!.snapshot;

        // Update current branch/HEAD pointer to point to this commit
        if (this.graph.HEAD.type === 'branch') {
            this.graph.branches.set(this.graph.HEAD.ref, targetCommitId);
        } else {
            this.graph.HEAD.ref = targetCommitId;
        }

        // Prepare the new hydrated state
        const newState = this.cloneState(targetSnapshot);

        if (mode === 'soft') {
            // Soft reset: Keep player position but reset the maze structure/flags
            newState.playerPosition = { ...currentWorldState.playerPosition };
        }
        // Hard reset
        return newState;
    }

    /**
     * merge(targetBranch)
     */
    merge(targetBranch: string): string {
        if (!this.graph.branches.has(targetBranch)) {
            throw new Error(`Target branch '${targetBranch}' not found.`);
        }
        return `Merging ${targetBranch} into ${this.graph.HEAD.ref}. Dimension fusion is currently unstable.`;
    }

    /**
     * Serialization for PUSH/PULL
     */
    exportGraph(): string {
        const data = {
            commits: Array.from(this.graph.commits.entries()),
            branches: Array.from(this.graph.branches.entries()),
            HEAD: this.graph.HEAD
        };
        return JSON.stringify(data);
    }

    /**
     * Deserialization for PULL
     */
    importGraph(json: string): MazeState {
        const data = JSON.parse(json);
        this.graph = {
            commits: new Map(data.commits),
            branches: new Map(data.branches),
            HEAD: data.HEAD
        };
        return this.getCurrentState();
    }

    getCurrentCommitId(): CommitHash | null {
        if (this.graph.HEAD.type === 'branch') {
            return this.graph.branches.get(this.graph.HEAD.ref) || null;
        }
        return this.graph.HEAD.ref;
    }

    getCurrentState(): MazeState {
        const commitId = this.getCurrentCommitId();
        if (!commitId) throw new Error('No current commit');
        return this.cloneState(this.graph.commits.get(commitId)!.snapshot);
    }

    getGraph(): GitGraph {
        return this.graph;
    }

    private cloneState(state: MazeState): MazeState {
        return JSON.parse(JSON.stringify(state));
    }
}
