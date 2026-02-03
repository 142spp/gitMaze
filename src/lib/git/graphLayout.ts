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
    const commitLanes = new Map<string, number>();
    const depthMap = new Map<string, number>();
    const usedLanesAtDepth = new Map<number, Set<number>>();

    // Helper: Calculate topological depth (distance from root)
    const getDepth = (id: string): number => {
        if (depthMap.has(id)) return depthMap.get(id)!;
        const commit = graph.commits.get(id);
        if (!commit || commit.parents.length === 0) {
            depthMap.set(id, 0);
            return 0;
        }
        const depth = Math.max(...commit.parents.map(p => getDepth(p))) + 1;
        depthMap.set(id, depth);
        return depth;
    };

    // 1. Sort commits by timestamp
    const sortedCommits = Array.from(graph.commits.values()).sort((a, b) => a.timestamp - b.timestamp);

    // Pre-calculate depths
    sortedCommits.forEach(c => getDepth(c.id));

    // 2. Assign lanes and depth-based positions
    sortedCommits.forEach((commit) => {
        const depth = depthMap.get(commit.id)!;
        let assignedLane = -1;

        // Try to stay in the same lane as the primary parent
        if (commit.parents.length > 0) {
            const primaryParentId = commit.parents[0];
            const parentLane = commitLanes.get(primaryParentId);

            if (parentLane !== undefined) {
                // Check if this lane is free at this specific depth
                const usedInDepth = usedLanesAtDepth.get(depth) || new Set();
                if (!usedInDepth.has(parentLane)) {
                    assignedLane = parentLane;
                }
            }
        }

        // If no parent lane or parent lane is occupied at this depth, find the first available lane
        if (assignedLane === -1) {
            let lane = 0;
            const usedInDepth = usedLanesAtDepth.get(depth) || new Set();
            while (usedInDepth.has(lane)) {
                lane++;
            }
            assignedLane = lane;
        }

        commitLanes.set(commit.id, assignedLane);

        // Mark lane as used for this depth
        if (!usedLanesAtDepth.has(depth)) {
            usedLanesAtDepth.set(depth, new Set());
        }
        usedLanesAtDepth.get(depth)!.add(assignedLane);
    });

    // 3. Create nodes with updated spacing and jitter
    sortedCommits.forEach((commit) => {
        const lane = commitLanes.get(commit.id) ?? 0;
        const depth = depthMap.get(commit.id) ?? 0;

        // Deterministic jitter based on commit ID
        const hash = commit.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const jitterX = ((hash % 10) - 5) * 0.6; // +- 7.5px jitter
        const jitterY = (((hash >> 2) % 10) - 5) * 0.8; // +- 7.5px jitter

        nodes.push({
            id: commit.id,
            x: (lane * 30) + jitterX,
            y: (depth * 40) + jitterY,
            lane: lane
        });
    });

    return nodes;
}
