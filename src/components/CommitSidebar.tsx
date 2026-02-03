import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    ReactFlowProvider,
    BaseEdge,
    EdgeProps,
    getBezierPath,
    Edge,
    Node,
} from '@xyflow/react';
import { motion } from 'framer-motion';
import '@xyflow/react/dist/style.css';
import { useGameStore } from '../store/useGameStore';
import { useTerminalStore } from '../store/useTerminalStore';
import { CommitNode } from './CommitNode';
import { calculateLayout } from '../lib/git/graphLayout';

const nodeTypes = {
    commitNode: CommitNode,
};

// Vibrant color palette for branches
const BRANCH_COLORS = ["#f97316", "#eab308", "#22c55e", "#a855f7", "#ef4444", "#06b6d4"];

const getBranchColor = (branchName: string) => {
    if (!branchName) return '#2563eb';
    // Stable hash for branch name
    const hash = branchName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return BRANCH_COLORS[hash % BRANCH_COLORS.length];
};

const CommitEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data
}: EdgeProps) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const edgeColor = (data as any)?.color || '#e2e8f0';
    const isNew = (data as any)?.isNew;

    return (
        <g>
            <motion.path
                id={id}
                d={edgePath}
                fill="none"
                stroke={edgeColor}
                strokeWidth={1.5}
                opacity={0.6}
                initial={isNew ? { pathLength: 0, opacity: 0 } : false}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={style}
            />
            <BaseEdge
                path={edgePath}
                style={{ ...style, stroke: 'transparent', strokeWidth: 10 }} // Interaction layer
            />
        </g>
    );
};

const edgeTypes = {
    commitEdge: CommitEdge,
};

export const CommitSidebar: React.FC = () => {
    const gitVersion = useGameStore((state) => state.gitVersion);
    const git = useGameStore((state) => state.git);
    const setMaze = (newState: any) => useGameStore.setState({ currentMaze: newState });
    const addLog = useTerminalStore((state) => state.addLog);

    const graph = git.getGraph();
    const headCommitId = git.getCurrentCommitId();
    const seenIds = useRef<Set<string>>(new Set());

    const { nodes, edges } = useMemo(() => {
        const layout = calculateLayout(graph);
        const currentSeen = new Set<string>();

        const rfNodes: Node[] = layout.map(node => {
            const commit = graph.commits.get(node.id);
            const branchBadges = Array.from(graph.branches.entries())
                .filter(([_, cid]) => cid === node.id)
                .map(([name]) => ({ name, color: getBranchColor(name) }));

            const isNew = !seenIds.current.has(node.id);
            currentSeen.add(node.id);

            const commitBranch = (commit as any)?.branch || 'main';

            return {
                id: node.id,
                type: 'commitNode',
                position: { x: node.x, y: node.y },
                draggable: false,
                selectable: false,
                data: {
                    id: node.id,
                    message: commit?.message,
                    isHead: node.id === headCommitId,
                    branches: branchBadges,
                    themeColor: getBranchColor(commitBranch),
                    isNew,
                },
            };
        });

        const rfEdges: Edge[] = [];
        graph.commits.forEach(commit => {
            commit.parents.forEach(parentId => {
                const edgeId = `${parentId}-${commit.id}`;
                const isNew = !seenIds.current.has(edgeId);
                currentSeen.add(edgeId);

                const commitBranch = (commit as any).branch || 'main';

                rfEdges.push({
                    id: edgeId,
                    source: parentId,
                    target: commit.id,
                    type: 'commitEdge',
                    focusable: false,
                    data: {
                        color: getBranchColor(commitBranch),
                        isNew,
                    }
                });
            });
        });

        return { nodes: rfNodes, edges: rfEdges };
    }, [graph, headCommitId, Array.from(graph.branches.keys()).join(','), gitVersion]);

    useEffect(() => {
        nodes.forEach(n => seenIds.current.add(n.id));
        edges.forEach(e => seenIds.current.add(e.id));
    }, [nodes, edges]);

    const onNodeClick = useCallback((_: any, node: any) => {
        try {
            const newState = git.checkout(node.id);
            setMaze(newState);
            addLog(`Dimension Shift: ${node.id}`);
        } catch (error: any) {
            addLog(`Shift failed: ${error.message}`);
        }
    }, [git, setMaze, addLog]);

    return (
        <div className="h-full bg-transparent flex flex-col font-mono text-[11px]">
            <div className="flex-1 w-full ">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onNodeClick={onNodeClick}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        elementsSelectable={false}
                        panOnDrag={false}
                        zoomOnScroll={false}
                        zoomOnPinch={false}
                        zoomOnDoubleClick={false}
                        selectionOnDrag={false}
                        fitView={false}
                        defaultViewport={{ x: 50, y: 30, zoom: 2.2 }}
                        proOptions={{ hideAttribution: true }}
                    >
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
                            <defs>
                                <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                                </linearGradient>
                            </defs>
                        </svg>

                        <Background color="#e6d5c3" gap={20} size={0.5} />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>

            <div className="p-4 border-t border-[#8b5e3c]/10 text-[7px] text-[#8b5e3c]/40 font-bold uppercase tracking-[0.4em] text-center">
                LOCKED TIMELINE VIEW
            </div>
        </div>
    );
};
