import { GitEngine } from './GitEngine';
import { MazeState } from './types';

export interface CommandContext {
    git: GitEngine;
    currentMaze: MazeState;
    addLog: (log: string) => void;
    setMaze: (maze: MazeState) => void;
    syncToBackend: () => Promise<void>;
    requestFlip?: (action: () => void) => void;
    requestTear?: (action: () => void) => void;
    loadTutorial?: (level: number) => Promise<void>;
}

export class CommandHandler {
    static async execute(cmd: string, context: CommandContext): Promise<void> {
        const { git, addLog, currentMaze, setMaze, syncToBackend, requestFlip, requestTear } = context;
        const parts = cmd.trim().split(/\s+/);

        try {
            if (parts[0] === 'help' || (parts[0] === 'git' && parts[1] === 'help')) {
                const helpText = [
                    '사용법: git <command> [<args>] (대괄호는 생략가능)',
                    '사용 가능한 명령어(command):',
                    '  commit [-m] [<msg>]   \t커밋을 생성합니다.',
                    '  branch [<target>]     \t브랜치 목록을 보거나 브랜치를 생성합니다.',
                    '  checkout [-b] <target>\t커밋 또는 브랜치로 이동합니다.',
                    '  merge <branch>        \t브랜치를 병합합니다.',
                    '  reset [--soft] [<target>]\t해당 커밋으로 되돌아갑니다.',
                    '  push                  \t커밋을 서버에 저장합니다.',
                    '  pull                  \t서버의 커밋을 가져옵니다.',
                    '  tutorial <level>      \t튜토리얼 스테이지(1~4)를 불러옵니다.'
                ].join('\r\n');
                addLog(helpText);
            }
            else if (parts[0] === 'git' && parts[1] === 'branch') {
                const branchName = parts[2];
                if (branchName) {
                    git.createBranch(branchName);
                    addLog(`Branch '${branchName}' created.`);
                } else {
                    // List branches
                    const branches = git.getBranches();
                    const head = git.getGraph().HEAD;
                    const currentBranch = head.type === 'branch' ? head.ref : null;

                    branches.forEach(branch => {
                        if (branch === currentBranch) {
                            // Green color for current branch (using simplified markup or just text)
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
                }

                // Use Page Flip Effect if available
                if (requestFlip) {
                    requestFlip(() => {
                        const newState = git.checkout(target);
                        setMaze(newState);
                        addLog(`Switched to '${target}'`);
                    });
                } else {
                    // Fallback to direct execution
                    const newState = git.checkout(target);
                    setMaze(newState);
                    addLog(`Switched to '${target}'`);
                }
            }
            else if (parts[0] === 'git' && parts[1] === 'commit') {
                const msgMatch = cmd.match(/"([^"]+)"/);
                const msg = msgMatch ? msgMatch[1] : (parts.slice(3).join(' ') || 'New commit');

                // Commit current state
                const commitId = git.commit(msg, currentMaze);
                addLog(`[${commitId.substring(0, 7)}] ${msg}`);
            }
            else if (parts[0] === 'git' && parts[1] === 'merge') {
                const target = parts[2];
                if (!target) throw new Error('Merge target branch required');
                else if (!git.getBranches().includes(target)) throw new Error('Target branch not found');
                const result = git.merge(target);
                addLog(result);
            }
            else if (parts[0] === 'git' && parts[1] === 'reset') {
                const mode = parts.includes('--hard') ? 'hard' : 'soft';
                const target = parts.find(p => !p.startsWith('--') && p !== 'git' && p !== 'reset') || 'HEAD~1';

                // Use Tear Effect if available
                if (requestTear) {
                    requestTear(() => {
                        const newState = git.reset(target, mode, currentMaze);
                        setMaze(newState);
                        addLog(`Reset to ${target} (${mode})`);
                    });
                } else {
                    // Fallback to direct execution
                    const newState = git.reset(target, mode, currentMaze);
                    setMaze(newState);
                    addLog(`Reset to ${target} (${mode})`);
                }
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
            else if (parts[0] === 'git' && parts[1] === 'tutorial') {
                const level = parseInt(parts[2]);
                if (isNaN(level) || level < 1 || level > 4) {
                    throw new Error('Tutorial level must be between 1 and 4. (e.g. git tutorial 1)');
                }
                if (context.loadTutorial) {
                    await context.loadTutorial(level);
                } else {
                    throw new Error('Tutorial loading not available in this context');
                }
            }
            else {
                addLog(`다음 명령어는 지원되지 않습니다 : ${cmd}. 'help'를 입력해보세요.`);
            }

        } catch (error: any) {
            addLog(`Error: ${error.message}`);
        }
    }
}
