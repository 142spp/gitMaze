import { GitEngine } from './GitEngine';
import { MazeState } from './types';

export interface CommandContext {
    git: GitEngine;
    currentMaze: MazeState;
    addLog: (log: string) => void;
    setMaze: (maze: MazeState) => void;
    syncToBackend: () => Promise<void>;
}

export class CommandHandler {
    static async execute(cmd: string, context: CommandContext): Promise<void> {
        const { git, addLog, currentMaze, setMaze, syncToBackend } = context;
        const parts = cmd.trim().split(/\s+/);

        addLog(`> ${cmd}`);

        try {
            let shouldSync = false;

            if (parts[0] === 'help') {
                addLog('Available: git checkout -b <name>, git checkout <name>, git commit -m "<msg>", git merge <branch>, git reset <target>');
            }
            else if (parts[0] === 'git' && parts[1] === 'branch') {
                const branchName = parts[2];
                if (branchName) {
                    git.createBranch(branchName);
                    addLog(`Branch '${branchName}' created.`);
                    shouldSync = true;
                } else {
                    const branches = git.getBranches();
                    const head = git.getGraph().HEAD;
                    const currentBranch = head.type === 'branch' ? head.ref : null;

                    branches.forEach(branch => {
                        if (branch === currentBranch) {
                            addLog(`* ${branch}`);
                        } else {
                            addLog(`  ${branch}`);
                        }
                    });
                }
            }
            else if (parts[0] === 'git' && parts[1] === 'checkout') {
                let target = parts[2];

                if (target === '-b') {
                    target = parts[3];
                    if (!target) throw new Error('Branch name required');
                    git.createBranch(target);
                    addLog(`Created branch '${target}'`);
                    shouldSync = true;
                }

                const newState = git.checkout(target);
                setMaze(newState);
                addLog(`Switched to '${target}'`);
                shouldSync = true;
            }
            else if (parts[0] === 'git' && parts[1] === 'commit') {
                const msgMatch = cmd.match(/"([^"]+)"/);
                const msg = msgMatch ? msgMatch[1] : (parts.slice(3).join(' ') || 'New commit');

                const commitId = git.commit(msg, currentMaze);
                addLog(`[${commitId.substring(0, 7)}] ${msg}`);
                shouldSync = true;
            }
            else if (parts[0] === 'git' && parts[1] === 'merge') {
                const target = parts[2];
                if (!target) throw new Error('Merge target branch required');
                const result = git.merge(target);
                addLog(result);
                shouldSync = true;
            }
            else if (parts[0] === 'git' && parts[1] === 'reset') {
                const mode = parts.includes('--hard') ? 'hard' : 'soft';
                const target = parts.find(p => !p.startsWith('--') && p !== 'git' && p !== 'reset') || 'HEAD';

                const newState = git.reset(target, mode, currentMaze);
                setMaze(newState);
                addLog(`Reset to ${target} (${mode})`);
                shouldSync = true;
            }
            else if (parts[0] === 'git' && parts[1] === 'push') {
                await syncToBackend();
                addLog('Saved to server.');
            }
            else if (parts[0] === 'git' && parts[1] === 'pull') {
                // Pulling requires a full re-initialization which is usually handled by the store
                // We'll throw an error or handle it specifically in the store
                throw new Error('Pull command should be handled by the game logic');
            }
            else {
                addLog(`Command not recognized: ${cmd}`);
            }

            if (shouldSync) {
                await syncToBackend();
            }

        } catch (error: any) {
            addLog(`Error: ${error.message}`);
        }
    }
}
