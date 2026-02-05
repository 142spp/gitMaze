import { CommitHash, CommitNode, GitGraph, MazeState } from './types';

/**
 * GitEngine: 미로의 시공간과 평행 우주를 제어하는 핵심 엔진입니다.
 * Git의 개념을 활용하여 게임의 상태(미로 구조, 아이템, 플레이어 위치)를 관리합니다.
 */
export class GitEngine {
    private graph: GitGraph;

    /**
     * @constructor
     * 우주의 시작점(Initial Commit)을 생성합니다.
     * @param initialState 초기 미로의 상태 (벽, 아이템, 시작 위치 등)
     */
    constructor(initialState: MazeState) {
        // 1. Calculate Start Position if missing
        let startPos = initialState.startPos;
        if (!startPos && initialState.grid) {
            // Find 'S' or '*' from grid
            for (let z = 0; z < initialState.height; z++) {
                const row = initialState.grid[z];
                // Check if row is string or array
                if (typeof row === 'string') {
                    const x = row.indexOf('S');
                    if (x !== -1) { startPos = { x, z }; break; }
                    const x2 = row.indexOf('*');
                    if (x2 !== -1) { startPos = { x: x2, z }; break; }
                } else if (Array.isArray(row)) {
                    // If grid is char[][]
                    const r = row as string[];
                    const x = r.indexOf('S');
                    if (x !== -1) { startPos = { x, z }; break; }
                    const x2 = r.indexOf('*');
                    if (x2 !== -1) { startPos = { x: x2, z }; break; }
                }
            }
        }
        if (!startPos) startPos = { x: 0, z: 0 };

        // 2. Normalize State
        const normalizedState = {
            ...initialState,
            startPos: initialState.startPos || startPos,
            playerPosition: initialState.playerPosition || startPos
        };

        const initialCommit: CommitNode = {
            id: this.generateHash(),
            message: 'Initial commit',
            parents: [],
            timestamp: Date.now(),
            branch: 'main',
            snapshot: this.cloneState(normalizedState),
        };

        this.graph = {
            commits: new Map([[initialCommit.id, initialCommit]]),
            branches: new Map([['main', initialCommit.id]]),
            branchColors: new Map([['main', '#f97316']]), // Orange for main
            HEAD: {
                type: 'branch',
                ref: 'main',
            },
        };
    }

    /**
     * 현재 미로 상태를 새로운 '커밋'으로 영구 저장합니다. (시간 박제)
     * @param message 저장할 상태에 대한 설명
     * @param state 현재 씬(Scene)에서 실시간으로 변화된 미로 데이터
     * @returns 생성된 커밋의 고유 해시값 (ID)
     */
    commit(message: string, state: MazeState): string {
        const parentId = this.getCurrentCommitId();
        const currentBranch = this.graph.HEAD.type === 'branch' ? this.graph.HEAD.ref : 'detached';
        const newCommit: CommitNode = {
            id: this.generateHash(),
            message,
            parents: parentId ? [parentId] : [],
            timestamp: Date.now(),
            branch: currentBranch,
            snapshot: this.cloneState(state),
        };

        this.graph.commits.set(newCommit.id, newCommit);

        // HEAD가 브랜치를 가리키고 있으면 해당 브랜치를 전진시킴
        if (this.graph.HEAD.type === 'branch') {
            this.graph.branches.set(this.graph.HEAD.ref, newCommit.id);
        } else {
            // Detached HEAD인 경우 직접 커밋을 가리킴
            this.graph.HEAD.ref = newCommit.id;
        }

        return newCommit.id;
    }

    /**
     * 새로운 평행 우주(브랜치)를 생성합니다.
     * @param name 브랜치 이름
     */
    createBranch(name: string): void {
        const currentCommitId = this.getCurrentCommitId();
        if (!currentCommitId) throw new Error('Cannot create branch from empty state');
        if (this.graph.branches.has(name)) throw new Error(`Branch already exists: ${name}`);

        this.graph.branches.set(name, currentCommitId);

        // Assign sequential color from palette
        const BRANCH_COLOR_PALETTE = ["#f97316", "#eab308", "#22c55e", "#a855f7", "#ef4444", "#06b6d4"];
        const nextColorIndex = this.graph.branchColors.size % BRANCH_COLOR_PALETTE.length;
        this.graph.branchColors.set(name, BRANCH_COLOR_PALETTE[nextColorIndex]);
    }

    /**
     * 존재하는 모든 차원(브랜치)의 이름을 반환합니다.
     */
    getBranches(): string[] {
        return Array.from(this.graph.branches.keys());
    }

    /**
     * 지정된 브랜치나 커밋 해시로 차원을 이동합니다. (차원 이동)
     * @param target 이동할 브랜치 명칭 또는 커밋 해시
     * @returns 이동한 차원의 미로 상태 데이터
     */
    checkout(target: string): MazeState {
        let commitId: string | undefined;

        if (this.graph.branches.has(target)) {
            commitId = this.graph.branches.get(target);
            this.graph.HEAD = { type: 'branch', ref: target };
        } else if (this.graph.commits.has(target)) {
            commitId = target;
            this.graph.HEAD = { type: 'detached', ref: target };
        } else {
            throw new Error(`Dimension rift failed: Target '${target}' not found.`);
        }

        if (!commitId) throw new Error('Invalid state: Target has no commit ID.');

        return this.cloneState(this.graph.commits.get(commitId)!.snapshot);
    }

    /**
     * 특정 커밋 시점으로 상태를 되돌립니다.
     * @param target 이동 목표 ('HEAD', 'HEAD~n', 또는 커밋 해시)
     * @param mode 'soft' (플레이어 위치 유지) | 'hard' (미로 및 위치 모두 되돌림)
     * @param currentWorldState 리셋 시 유지할 정보(플레이어 위치 등)를 위한 현재 상태
     */
    reset(target: string, mode: 'soft' | 'hard', currentWorldState: MazeState): MazeState {
        let targetCommitId: string | undefined;

        // 1. Resolve target to a concrete commit ID
        if (this.graph.commits.has(target)) {
            // Specific commit ID
            targetCommitId = target;
        } else if (target.toUpperCase() === 'HEAD') {
            targetCommitId = this.getCurrentCommitId() || undefined;
        } else if (target.toUpperCase().startsWith('HEAD~')) {
            // HEAD~n syntax
            const countStr = target.substring(5);
            const count = parseInt(countStr, 10);
            if (isNaN(count)) throw new Error(`Invalid reset target: ${target}`);

            targetCommitId = this.resolveRelativeCommit('HEAD', count);
        } else {
            throw new Error(`Reset failed: Target '${target}' is not a valid commit or reference.`);
        }

        if (!targetCommitId) {
            throw new Error(`Reset failed: Could not resolve target '${target}'.`);
        }

        const targetSnapshot = this.graph.commits.get(targetCommitId)!.snapshot;

        // HEAD 포인터 업데이트
        if (this.graph.HEAD.type === 'branch') {
            this.graph.branches.set(this.graph.HEAD.ref, targetCommitId);
        } else {
            this.graph.HEAD.ref = targetCommitId;
        }

        const newState = this.cloneState(targetSnapshot);

        if (mode === 'soft') {
            // Soft reset: 현재 플레이어의 위치는 유지하고 지형만 바꿈
            newState.playerPosition = { ...currentWorldState.playerPosition };
        } else if (mode === 'hard') {
            // Hard reset: Remove unreachable commits (garbage collection)
            this.collectGarbage();
        }

        return newState;
    }

    /**
     * 두 평행 우주(브랜치)를 하나로 융합합니다.
     * @param targetBranch 융합할 대상 브랜치
     * @returns 융합 결과 메시지
     */
    merge(targetBranch: string): string {
        if (!this.graph.branches.has(targetBranch)) {
            throw new Error(`Target branch '${targetBranch}' not found.`);
        }

        const targetCommitId = this.graph.branches.get(targetBranch)!;
        const sourceCommitId = this.getCurrentCommitId();

        if (!sourceCommitId) {
            throw new Error('Cannot merge from empty state');
        }

        if (targetCommitId === sourceCommitId) {
            return 'Already up to date.';
        }

        // Merge Commit 생성 (두 부모를 가짐)
        const currentBranch = this.graph.HEAD.type === 'branch' ? this.graph.HEAD.ref : 'detached';
        const newCommit: CommitNode = {
            id: this.generateHash(),
            message: `Merge branch '${targetBranch}' into ${currentBranch}`,
            parents: [sourceCommitId, targetCommitId],
            timestamp: Date.now(),
            branch: currentBranch,
            snapshot: this.cloneState(this.graph.commits.get(sourceCommitId)!.snapshot),
        };

        this.graph.commits.set(newCommit.id, newCommit);

        if (this.graph.HEAD.type === 'branch') {
            this.graph.branches.set(this.graph.HEAD.ref, newCommit.id);
        } else {
            this.graph.HEAD.ref = newCommit.id;
        }

        // 융합 후 대상 브랜치 삭제 (정리)
        this.graph.branches.delete(targetBranch);

        return `Merged '${targetBranch}' into ${currentBranch} and removed '${targetBranch}'.`;
    }

    /**
     * 전체 그래프 데이터를 JSON 문자열로 직렬화합니다. (PUSH 용)
     */
    exportGraph(): string {
        const data = {
            commits: Array.from(this.graph.commits.entries()),
            branches: Array.from(this.graph.branches.entries()),
            branchColors: Array.from(this.graph.branchColors.entries()),
            HEAD: this.graph.HEAD
        };
        return JSON.stringify(data);
    }

    /**
     * JSON 데이터를 읽어 전체 그래프를 복원합니다. (PULL 용)
     */
    importGraph(json: string): MazeState {
        const data = JSON.parse(json);
        this.graph = {
            commits: new Map(data.commits),
            branches: new Map(data.branches),
            branchColors: new Map(data.branchColors || [['main', '#f97316']]),
            HEAD: data.HEAD
        };
        return this.getCurrentState();
    }

    /**
     * 현재 활성화된 커밋의 ID를 가져옵니다.
     */
    getCurrentCommitId(): CommitHash | null {
        if (this.graph.HEAD.type === 'branch') {
            return this.graph.branches.get(this.graph.HEAD.ref) || null;
        }
        return this.graph.HEAD.ref;
    }

    /**
     * 현재 HEAD가 가리키는 시점의 미로 상태를 복제하여 반환합니다.
     */
    getCurrentState(): MazeState {
        const commitId = this.getCurrentCommitId();
        if (!commitId) throw new Error('No current commit');
        return this.cloneState(this.graph.commits.get(commitId)!.snapshot);
    }

    /**
     * 전체 Git 그래프 객체를 반환합니다.
     */
    getGraph(): GitGraph {
        return this.graph;
    }

    /**
     * 상태 객체를 깊은 복사하여 불변성을 유지합니다.
     */
    private cloneState(state: MazeState): MazeState {
        return JSON.parse(JSON.stringify(state));
    }

    /**
     * HEAD나 특정 커밋으로부터 n개 전의 부모 커밋 ID를 찾습니다.
     */
    private resolveRelativeCommit(startRef: string, count: number): string | undefined {
        let currentId: string | undefined;

        if (startRef === 'HEAD') {
            currentId = this.getCurrentCommitId() || undefined;
        } else if (this.graph.branches.has(startRef)) {
            currentId = this.graph.branches.get(startRef);
        } else {
            currentId = startRef;
        }

        for (let i = 0; i < count; i++) {
            if (!currentId) break;
            const commit = this.graph.commits.get(currentId);
            if (!commit || commit.parents.length === 0) {
                currentId = undefined;
                break;
            }
            // Always follow the first parent (standard git behavior for ~)
            currentId = commit.parents[0];
        }

        return currentId;
    }

    /**
     * 도달할 수 없는 커밋들을 그래프에서 제거합니다. (Garbage Collection)
     */
    private collectGarbage(): void {
        // Find all reachable commits from branches
        const reachable = new Set<string>();
        const toVisit: string[] = [];

        // Start from all branch heads
        this.graph.branches.forEach(commitId => {
            toVisit.push(commitId);
        });

        // BFS to mark all reachable commits
        while (toVisit.length > 0) {
            const commitId = toVisit.shift()!;
            if (reachable.has(commitId)) continue;

            reachable.add(commitId);
            const commit = this.graph.commits.get(commitId);
            if (commit) {
                commit.parents.forEach(parentId => toVisit.push(parentId));
            }
        }

        // Remove unreachable commits
        Array.from(this.graph.commits.keys()).forEach(commitId => {
            if (!reachable.has(commitId)) {
                this.graph.commits.delete(commitId);
            }
        });
    }

    /**
     * 커밋용 간단한 고유 해시값을 생성합니다.
     */
    private generateHash(): string {
        return Math.random().toString(16).substring(2, 4);
    }
}
