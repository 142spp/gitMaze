import React from 'react';
import { Gitgraph, templateExtend, TemplateName, Orientation } from '@gitgraph/react';
import { useGameStore } from '../store/useGameStore';

// Define the "Diary" theme for Gitgraph
const diaryTheme = templateExtend(TemplateName.Metro, {
    colors: ["#8b5e3c", "#af8260", "#634832", "#d4a373", "#a67c52"],
    branch: {
        lineWidth: 3,
        spacing: 35,
        label: {
            font: "900 8px 'JetBrains Mono', monospace",
            borderRadius: 2,
        },
    },
    commit: {
        spacing: 40,
        dot: {
            size: 10,
            strokeWidth: 2,
        },
        message: {
            display: true, // We use hash and branch instead
            font: "700 8px 'JetBrains Mono', monospace",
        }
    },
});

export const CommitSidebar: React.FC = () => {
    const git = useGameStore((state) => state.git);
    const gitVersion = useGameStore((state) => state.gitVersion);
    const setMaze = useGameStore((state) => (newState: any) => useGameStore.setState({ currentMaze: newState }));
    const addLog = useGameStore((state) => state.addLog);

    const graph = git.getGraph();
    const headCommitId = git.getCurrentCommitId();

    return (
        <div className="h-full bg-transparent flex flex-col font-mono text-[11px] overflow-hidden">
            <div className="flex-1 w-full overflow-y-auto custom-scrollbar p-4">
                <div className="min-h-full">
                    <Gitgraph options={{ template: diaryTheme, orientation: Orientation.VerticalReverse }}>
                        {(gitgraph) => {
                            // Map of branch names to Gitgraph branch instances
                            const branchesMap = new Map<string, any>();

                            // Reconstruct the graph based on commit history
                            // 1. Sort commits by timestamp
                            const sortedCommits = Array.from(graph.commits.values())
                                .sort((a, b) => a.timestamp - b.timestamp);

                            // 2. Initial branch
                            const main = gitgraph.branch("main");
                            branchesMap.set("main", main);

                            // 3. Track which branch each commit belongs to
                            // In this simple model, we check if a commit has a branch label
                            // or if it continues the parent's branch.
                            const commitToBranch = new Map<string, string>();

                            sortedCommits.forEach((commit) => {
                                // Find which branch this commit is on
                                let branchName = "main";
                                const branchEntry = Array.from(graph.branches.entries())
                                    .find(([name, cid]) => cid === commit.id);

                                if (branchEntry) {
                                    branchName = branchEntry[0];
                                }

                                // If the branch doesn't exist yet, create it from the parent
                                if (!branchesMap.has(branchName)) {
                                    const parentId = commit.parents[0];
                                    const parentBranchName = parentId ? (commitToBranch.get(parentId) || "main") : "main";
                                    const parentBranch = branchesMap.get(parentBranchName);
                                    if (parentBranch) {
                                        branchesMap.set(branchName, parentBranch.branch(branchName));
                                    } else {
                                        // Fallback to main if parent branch instance is missing
                                        branchesMap.set(branchName, main.branch(branchName));
                                    }
                                }

                                const targetBranch = branchesMap.get(branchName) || main;

                                // Tag for short hash display
                                const shortHash = commit.id.substring(0, 2).toUpperCase();

                                // Commit to the branch
                                targetBranch.commit({
                                    hash: commit.id, // Full internal ID for uniqueness
                                    subject: shortHash, // Display short hash as subject
                                    stats: undefined,
                                    onClick: () => {
                                        try {
                                            const newState = git.checkout(commit.id);
                                            setMaze(newState);
                                            addLog(`Dimension Shift: ${commit.id.substring(0, 7).toUpperCase()} `);
                                        } catch (error: any) {
                                            addLog(`Shift failed: ${error.message} `);
                                        }
                                    },
                                    style: {
                                        dot: {
                                            color: commit.id === headCommitId ? "#f97316" : "#334155",
                                            strokeColor: commit.id === headCommitId ? "#fde68a" : "#1e293b",
                                        }
                                    }
                                });

                                commitToBranch.set(commit.id, branchName);
                            });
                        }}
                    </Gitgraph>
                </div>
            </div>

            <div className="p-4 border-t border-[#8b5e3c]/10 text-[7px] text-[#8b5e3c]/40 font-bold uppercase tracking-[0.4em] text-center bg-[#8b5e3c]/5">
                LOCKED TIMELINE VIEW
            </div>
        </div>
    );
};
