import { GitGraph } from './types';

export interface LayoutedNode {
    id: string;
    x: number;
    y: number;
    lane: number;
}

/**
 * calculateLayout: Assigns lanes (X) and vertical positions (Y) to commits.
 * Top-to-Bottom: Oldest at Y=0, Newest at Y=Increasing.
 */
export function calculateLayout(graph: GitGraph) {
    const nodes: LayoutedNode[] = [];
    const branchLanes = new Map<string, number>();
    const commitLanes = new Map<string, number>();

    // 1. Assign lanes to branches
    let nextLane = 0;
    branchLanes.set('main', 0);
    nextLane = 1;

    // Predictable order for branches
    const branches = Array.from(graph.branches.keys()).sort();
    branches.forEach(branch => {
        if (branch !== 'main') {
            branchLanes.set(branch, nextLane++);
        }
    });

    // 2. Map commits to lanes
    // Process branches in order of creation/priority
    const sortedBranches = Array.from(branchLanes.entries()).sort((a, b) => a[1] - b[1]);

    sortedBranches.forEach(([branchName, lane]) => {
        let current: string | null = graph.branches.get(branchName) || null;
        while (current && graph.commits.has(current)) {
            if (!commitLanes.has(current)) {
                commitLanes.set(current, lane);
            }
            const commit = graph.commits.get(current)!;
            current = commit.parents.length > 0 ? commit.parents[0] : null;
        }
    });

    // 3. Create nodes (Vertical flow: oldest at top Y=0)
    const sortedCommits = Array.from(graph.commits.values()).sort((a, b) => a.timestamp - b.timestamp);

    sortedCommits.forEach((commit, index) => {
        const lane = commitLanes.get(commit.id) ?? 0;
        nodes.push({
            id: commit.id,
            x: lane * 40,   // Compact horizontal spacing
            y: index * 40,  // Consistent vertical spacing
            lane: lane
        });
    });

    return nodes;
}
