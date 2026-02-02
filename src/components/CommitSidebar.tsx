import React, { useMemo, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    ReactFlowProvider,
    BaseEdge,
    EdgeProps,
    getBezierPath,
    Edge,
    Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGameStore } from '../store/useGameStore';
import { GitBranch } from 'lucide-react';
import { CommitNode } from './CommitNode';
import { calculateLayout } from '../lib/git/graphLayout';

const nodeTypes = {
    commitNode: CommitNode,
};

// Vibrant color palette for branches
const BRANCH_COLORS = ["#f97316", "#eab308", "#22c55e", "#a855f7", "#ef4444", "#06b6d4"];

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

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            style={{ ...style, stroke: edgeColor, strokeWidth: 1.5, opacity: 0.8 }}
            markerEnd={markerEnd}
        />
    );
};

const edgeTypes = {
    commitEdge: CommitEdge,
};

export const CommitSidebar: React.FC = () => {
    const git = useGameStore((state) => state.git);
    const setMaze = useGameStore((state) => (newState: any) => useGameStore.setState({ currentMaze: newState }));
    const addLog = useGameStore((state) => state.addLog);

    const graph = git.getGraph();
    const headCommitId = git.getCurrentCommitId();

    const { nodes, edges } = useMemo(() => {
        const layout = calculateLayout(graph);
        const commitToLane = new Map(layout.map(l => [l.id, l.lane]));

        const rfNodes: Node[] = layout.map(node => {
            const branchName = Array.from(graph.branches.entries())
                .find(([_, cid]) => cid === node.id)?.[0];

            return {
                id: node.id,
                type: 'commitNode',
                position: { x: node.x, y: node.y },
                draggable: false,
                selectable: false,
                data: {
                    id: node.id,
                    isHead: node.id === headCommitId,
                    branch: branchName,
                    themeColor: BRANCH_COLORS[node.lane % BRANCH_COLORS.length]
                },
            };
        });

        const rfEdges: Edge[] = [];
        graph.commits.forEach(commit => {
            commit.parents.forEach(parentId => {
                const lane = commitToLane.get(commit.id) ?? 0;
                rfEdges.push({
                    id: `${parentId}-${commit.id}`,
                    source: parentId,
                    target: commit.id,
                    type: 'commitEdge',
                    focusable: false,
                    data: {
                        color: BRANCH_COLORS[lane % BRANCH_COLORS.length]
                    }
                });
            });
        });

        return { nodes: rfNodes, edges: rfEdges };
    }, [graph, headCommitId]);

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
                        defaultViewport={{ x: 100, y: 30, zoom: 2 }}
                        proOptions={{ hideAttribution: true }}
                    >

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
