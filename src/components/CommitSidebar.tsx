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
    PanOnScrollMode,
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

const getBranchColor = (branchName: string, branchColorsMap: Map<string, string>) => {
    if (!branchName) return '#2563eb';
    // Lookup from the graph's branchColors map
    return branchColorsMap.get(branchName) || '#2563eb'; // Fallback color if not found
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

    const seenIds = useRef<Set<string>>(new Set());

    const { nodes, edges, height, width } = useMemo(() => {
        // Get fresh graph data on every gitVersion change
        const graph = git.getGraph();
        const headCommitId = git.getCurrentCommitId();
        const layout = calculateLayout(graph);
        const currentSeen = new Set<string>();
        let maxDepth = 0;
        let maxWidth = 0;

        const rfNodes: Node[] = layout.map(node => {
            const commit = graph.commits.get(node.id);
            const branchBadges = Array.from(graph.branches.entries())
                .filter(([_, cid]) => cid === node.id)
                .map(([name]) => ({ name, color: getBranchColor(name, graph.branchColors) }));

            const isNew = !seenIds.current.has(node.id);
            currentSeen.add(node.id);

            const commitBranch = (commit as any)?.branch || 'main';
            if (node.y > maxDepth) maxDepth = node.y;
            if (node.x > maxWidth) maxWidth = node.x;

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
                    themeColor: getBranchColor(commitBranch, graph.branchColors),
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
                        color: getBranchColor(commitBranch, graph.branchColors),
                        isNew,
                    }
                });
            });
        });

        return { nodes: rfNodes, edges: rfEdges, height: maxDepth + 100, width: maxWidth + 150 };
    }, [gitVersion]);

    // 동적으로 zoom 계산: 너비가 넓어지면 zoom을 줄여서 모든 노드가 보이도록
    const dynamicZoom = useMemo(() => {
        const baseZoom = 2.2;
        const containerWidth = 300; // CommitSidebar의 대략적인 너비 (px)
        const requiredWidth = width * baseZoom;

        if (requiredWidth > containerWidth) {
            return (containerWidth / width) * 0.9; // 약간의 여백을 위해 0.9 곱함
        }
        return baseZoom;
    }, [width]);

    useEffect(() => {
        nodes.forEach(n => seenIds.current.add(n.id));
        edges.forEach(e => seenIds.current.add(e.id));
    }, [nodes, edges]);

    return (
        <div className="h-full bg-transparent flex flex-col font-mono text-[11px]">
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
                <div style={{ height: `${height * dynamicZoom}px`, width: '100%' }}>
                    <ReactFlowProvider>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            panOnDrag={false}
                            panOnScroll={false}
                            zoomOnScroll={false}
                            zoomOnPinch={false}
                            zoomOnDoubleClick={false}
                            selectionOnDrag={false}
                            preventScrolling={false}
                            fitView={false}
                            minZoom={dynamicZoom}
                            maxZoom={dynamicZoom}
                            defaultViewport={{ x: 30, y: 10, zoom: dynamicZoom }}
                            proOptions={{ hideAttribution: true }}
                        >
                            <Background color="#e6d5c3" gap={20} size={0.5} />
                        </ReactFlow>
                    </ReactFlowProvider>
                </div>
            </div>

            <div className="p-4 border-t border-[#8b5e3c]/10 text-[7px] text-[#8b5e3c]/40 font-bold uppercase tracking-[0.4em] text-center">
                TIMELINE HISTORY
            </div>
        </div>
    );
};
