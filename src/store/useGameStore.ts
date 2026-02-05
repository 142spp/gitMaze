import { create } from 'zustand'
import { GitEngine } from '../lib/git/GitEngine'
import { MazeState } from '../lib/git/types'
import { api } from '../lib/api'
import { useTerminalStore } from './useTerminalStore'
import { CommandHandler } from '../lib/git/CommandHandler'
import html2canvas from 'html2canvas'

interface GameState {
    // Session
    userId: string;
    gameStatus: 'intro' | 'playing' | 'cleared';
    startTime: number;
    commandCount: number;
    isLoading: boolean;
    isSaving?: boolean;
    saveError?: string | null;
    error: string | null;
    finalTime: number | null;

    // Commit Animation State
    activeAnimations: Array<{
        id: string;
        captureUrl: string;
        targetId: string;
    }>;

    // Core Engines
    git: GitEngine;
    currentMaze: MazeState;
    gitVersion: number;
    currentStage: number;
    currentCategory: 'tutorial' | 'main';
    visitedCells: Set<string>; // "x,z" format

    // UI Effects
    visualEffect: 'none' | 'preparing-tear' | 'preparing-flip' | 'tearing' | 'flipping' | 'moving-right' | 'preparing-turn' | 'page-turning';
    pendingResetAction: (() => void) | null;
    terminalHistory: string[];
    isFalling: boolean;
    deathCount: number;
    isDead: boolean;
    isInitialized: boolean;

    // Actions
    startGame: () => void;
    initialize: () => Promise<void>;
    sendCommand: (cmd: string) => Promise<void>;
    completeGame: () => Promise<void>;
    movePlayer: (dx: number, dz: number) => void;
    resetPlayerPosition: () => void;
    addLog: (log: string) => void;
    loadTutorial: (level: number) => Promise<void>;
    loadStage: (category: string, level: number) => Promise<void>;
    nextStage: () => Promise<void>;


    // Tearing Flow (Reset)
    requestTear: (action: () => void) => void;
    confirmTear: () => void;
    finishTear: () => void;

    // Win Logic
    checkWinCondition: () => void;

    // Flipping Flow (Checkout)
    requestFlip: (action: () => void) => void;
    confirmFlip: () => void;
    finishFlip: () => void;

    // Page Turn Flow (Checkout)
    requestPageTurn: (action: () => void) => void;
    confirmPageTurn: () => void;

    // Commit Flow
    requestCommit: (msg: string) => Promise<void>;
    finishCommitAnimation: (id: string) => void;


    // Internal Actions
    syncToBackend: () => Promise<void>;
    pullFromBackend: () => Promise<void>;
}

// ... (getUserId and INITIAL_PLACEHOLDER remain same)



// Check localStorage for existing userId
const getUserId = () => {
    let id = localStorage.getItem('gitmaze_user_id');
    if (!id) {
        id = 'user_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('gitmaze_user_id', id);
    }
    return id;
};

// Initial Placeholder State
const INITIAL_PLACEHOLDER: MazeState = {
    width: 0,
    height: 0,
    grid: [],
    walls: [],
    items: [],
    startPos: { x: 0, z: 0 },
    playerPosition: { x: 0, z: 0 },
    inventory: [],
    flags: {}
};

export const useGameStore = create<GameState>((set, get) => {
    // 플레이어의 액션을 처리할 Git 엔진 인스턴스 초기화
    const git = new GitEngine(INITIAL_PLACEHOLDER);

    return {
        userId: getUserId(),
        gameStatus: 'intro',
        startTime: Date.now(),
        commandCount: 0,
        isLoading: true,
        error: null,

        git,
        currentMaze: INITIAL_PLACEHOLDER,
        visitedCells: new Set<string>(['0,0']), // Track visited cells for Fog of War
        isInitialized: false,
        gitVersion: 1,
        currentStage: 1,
        currentCategory: 'tutorial',
        visualEffect: 'none',
        pendingResetAction: null,
        finalTime: null,
        isFalling: false,
        deathCount: 0,
        isDead: false,
        activeAnimations: [],
        terminalHistory: [],
        addLog: (log: string) => {
            // Forward to TerminalStore for legacy compatibility if needed
            useTerminalStore.getState().addLog(log);
        },

        resetPlayerPosition: () => {
            const { currentMaze, deathCount } = get();
            set({
                currentMaze: {
                    ...currentMaze,
                    playerPosition: { x: currentMaze.startPos.x, z: currentMaze.startPos.z }
                },
                isFalling: false,
                deathCount: deathCount + 1,
                isDead: false  // Revive player
            });
        },

        requestTear: (action) => {
            set({ visualEffect: 'preparing-tear', pendingResetAction: action });
        },

        confirmTear: () => {
            // Only confirm if we are actually preparing for tear
            if (get().visualEffect !== 'preparing-tear') return;

            const { pendingResetAction } = get();
            if (pendingResetAction) {
                // Start tearing animation
                set({ visualEffect: 'tearing', pendingResetAction: null });

                // Execute the actual reset action (and graph update) AFTER 1s animation
                setTimeout(() => {
                    pendingResetAction();
                    set({ visualEffect: 'none' });
                }, 1000);
            }
        },

        finishTear: () => set({ visualEffect: 'none' }),

        checkWinCondition: () => {
            const { git, currentMaze, completeGame } = get();

            // 1. Must be on 'main' branch
            const currentBranch = git.getCurrentBranch();
            if (currentBranch !== 'main') return;

            // Strict Rule for Stage 4: Must have merged (Only 1 branch left)
            const { currentCategory, currentStage } = get();
            if (currentCategory === 'main' && currentStage === 4) {
                // Check if 'resources' branch is gone (merged)
                if (git.getBranches().length > 1) return;
            }

            // 2. Win Condition: No pits OR No blocks left
            // "Colored holes" are those relevant to blocks. If no blocks, no colored holes remain.
            const hasPits = currentMaze.grid.some(row =>
                Array.isArray(row) ? row.includes('pit') : row.includes('pit')
            );

            const hasBlocks = currentMaze.items.some(it => it.type.startsWith('block_'));

            if (!hasPits || !hasBlocks) {
                completeGame();
            }
        },

        // Page Flip Logic - Sequenced (Slide right then flip)
        requestFlip: (action) => {
            // 1. Move the book to the right
            set({ visualEffect: 'moving-right' });

            // Trigger action (gameStatus: 'playing') IMMEDIATELY during the slide
            // so it starts rendering/initializing underneath the cover.
            setTimeout(() => {
                action();
            }, 10);

            // 2. After slide animation (600ms), start flipping
            setTimeout(() => {
                set({ visualEffect: 'flipping' });

                // 3. After flip animation (1500ms CSS + 100ms grace), finish
                setTimeout(() => {
                    set({ visualEffect: 'none' });
                }, 1600);
            }, 600);
        },

        confirmFlip: () => {
            // No longer needed, kept for compatibility
        },

        finishFlip: () => set({ visualEffect: 'none' }),

        requestPageTurn: (action) => {
            // Phase 0: Start capture phase
            set({ visualEffect: 'preparing-turn', pendingResetAction: action });
        },

        confirmPageTurn: () => {
            if (get().visualEffect !== 'preparing-turn') return;

            const { pendingResetAction } = get();
            if (pendingResetAction) {
                // Phase 1: Expand sidebar to 50%
                set({ visualEffect: 'page-turning', pendingResetAction: null });

                // Execute state change in middle of flip
                setTimeout(() => {
                    pendingResetAction();
                }, 400);

                // Finish animation
                setTimeout(() => {
                    set({ visualEffect: 'none' });
                }, 900);
            }
        },

        requestCommit: async (msg: string) => {
            const { git, currentMaze } = get();
            const { addLog } = useTerminalStore.getState();

            let captureUrl = null;
            try {
                const element = document.getElementById('polaroid-frame');
                if (element) {
                    // We keep dynamic import for local scoping if needed, but ensure it's awaited and handled
                    const h2c = (await import('html2canvas')).default;

                    const capturePromise = h2c(element, {
                        backgroundColor: null,
                        scale: 0.5,
                        logging: false,
                        useCORS: true,
                        allowTaint: true,
                    });

                    // 2s timeout
                    const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
                        setTimeout(() => resolve({ timeout: true }), 2000)
                    );

                    const result = await Promise.race([capturePromise, timeoutPromise]);

                    if (result && !('timeout' in result)) {
                        captureUrl = (result as HTMLCanvasElement).toDataURL('image/webp', 0.8);
                    } else {
                        console.warn('Commit capture timed out');
                    }
                }
            } catch (err) {
                console.warn('Commit capture failed:', err);
            }

            // Execute commit (CRITICAL: Always commit even if capture fails)
            const commitId = git.commit(msg, currentMaze);
            addLog(`[${commitId.substring(0, 7)}] ${msg}`);

            // Trigger animation and update graph
            if (captureUrl) {
                const animationId = Math.random().toString(36).substring(7);
                set({
                    activeAnimations: [
                        ...get().activeAnimations,
                        { id: animationId, captureUrl, targetId: commitId }
                    ],
                    gitVersion: get().gitVersion + 1
                });
            } else {
                set({ gitVersion: get().gitVersion + 1 });
            }
        },

        finishCommitAnimation: (id: string) => {
            set({
                activeAnimations: get().activeAnimations.filter(a => a.id !== id)
            });
        },

        startGame: () => {
            get().requestFlip(() => {
                set({ gameStatus: 'playing' });
                get().initialize();
            });
        },

        initialize: async () => {
            // Prevent double initialization (React Strict Mode calls useEffect twice in dev)
            if (get().isInitialized) {
                return;
            }

            const { userId } = get();
            const { addLog } = useTerminalStore.getState();
            set({ isLoading: true, error: null, startTime: Date.now(), commandCount: 0, gameStatus: 'playing', isInitialized: true });

            try {
                // Create new maze - session restore only via explicit "git pull"
                addLog('Loading spacetime stage 1...');
                const newMazeData = await api.getNewMaze(1);

                console.error('[CRITICAL] Creating new GitEngine in initialize()');
                const newGit = new GitEngine(newMazeData);

                set({
                    git: newGit,
                    currentMaze: newGit.getCurrentState(),
                    isLoading: false,
                    gitVersion: get().gitVersion + 1,
                    currentStage: 1,
                });

            } catch (err: any) {
                console.error("Initialization Failed:", err);
                set({
                    isLoading: false,
                    error: null
                });
            }
        },

        loadTutorial: async (level: number) => {
            return get().loadStage('tutorial', level);
        },

        loadStage: async (category: string, level: number) => {
            const { git } = get();
            const { addLog } = useTerminalStore.getState();
            set({ isLoading: true, error: null });

            try {
                addLog(`Loading ${category} stage ${level}...`);
                const mazeData = await api.getStage(category, level);

                const newGit = new GitEngine(mazeData);

                set({
                    git: newGit,
                    currentMaze: newGit.getCurrentState(),
                    isLoading: false,
                    gitVersion: get().gitVersion + 1,
                    gameStatus: 'playing',
                    startTime: Date.now(),
                    commandCount: 0,
                    currentStage: level,
                    currentCategory: category as 'tutorial' | 'main',
                    deathCount: 0,
                    visitedCells: new Set<string>([`${mazeData.startPos.x},${mazeData.startPos.z}`])
                });

                addLog(`Stage ${category} ${level} ready.`);

                // Stage 4 Special Setup: Pre-created Branches
                if (category === 'main' && level === 4) {
                    addLog('[SYSTEM] Initializing Branching Puzzle...');

                    const originalState = newGit.getCurrentState();

                    // 1. Setup 'resources' branch (Remove the Orange Block)
                    newGit.branch('resources');
                    newGit.checkout('resources');

                    const resItems = originalState.items.filter(it => !(it.x === 2 && it.z === 4));
                    const resState = { ...originalState, items: resItems };
                    newGit.commit('Resources: Blocks (No Orange)', resState);

                    // 2. Setup 'main' branch (Only Orange Block + Pits)
                    newGit.checkout('main');

                    // Remove Blocks EXCEPT the middle orange one (x=2, z=4)
                    const mainItems = originalState.items.filter(it =>
                        !it.type.startsWith('block_') || (it.x === 2 && it.z === 4)
                    );

                    // Modify Grid: Plate Location -> Pit
                    const mainGrid = originalState.grid.map(row =>
                        typeof row === 'string' ? row.split('') : [...row]
                    );

                    originalState.items.forEach(it => {
                        if (it.type.startsWith('plate_')) {
                            if (mainGrid[it.z] && mainGrid[it.z][it.x]) {
                                mainGrid[it.z][it.x] = 'pit';
                            }
                        }
                    });

                    const mainState = {
                        ...originalState,
                        items: mainItems,
                        grid: mainGrid
                    };

                    // Commit to Main
                    newGit.commit('Main Branch: Pits + Orange Block', mainState);

                    // Update Store
                    set({
                        currentMaze: newGit.getCurrentState(),
                        gitVersion: get().gitVersion + 1
                    });

                    addLog('Scenario Loaded: You are on "main" with Pits.');
                    addLog('Hint: A "resources" branch exists with supplies.');
                }
            } catch (err) {
                console.error("Stage load failed:", err);
                set({ isLoading: false, error: "Failed to load stage" });
            }
        },

        nextStage: async () => {
            const { currentStage, currentCategory, loadStage } = get();
            await loadStage(currentCategory, currentStage + 1);
        },

        syncToBackend: async () => {
            const { userId, git } = get();
            try {
                const graphJson = git.exportGraph();
                await api.pushDimensions(userId, graphJson);
            } catch (e) {
                console.error("Failed to sync state", e);
            }
        },

        pullFromBackend: async () => {
            const { userId, git, addLog } = get();
            set({ isLoading: true, error: null });
            try {
                addLog('Pulling dimensions from server...');
                const data = await api.pullDimensions(userId);
                if (data) {
                    const newState = git.importGraph(JSON.stringify(data));
                    set({
                        currentMaze: newState,
                        gitVersion: get().gitVersion + 1,
                        isLoading: false
                    });
                    addLog('Successfully pulled and restored spacetime dimensions.');
                } else {
                    addLog('No saved dimensions found on server.');
                    set({ isLoading: false });
                }
            } catch (e) {
                console.error("Failed to pull state", e);
                addLog('Error: Failed to pull dimensions from server.');
                set({ isLoading: false });
            }
        },
        movePlayer: (dx: number, dz: number) => {
            const { currentMaze, completeGame, isDead, isFalling } = get();

            // Block movement if dead or falling
            if (isDead || isFalling) return;

            const { playerPosition, walls, width, height, items, startPos, grid } = currentMaze;

            const targetX = playerPosition.x + dx;
            const targetZ = playerPosition.z + dz;

            // 1. Boundary Check for Player
            if (targetX < 0 || targetX >= width || targetZ < 0 || targetZ >= height) return;

            // 2. Floor Tile Check (must have floor to move)
            const targetFloorType = grid[targetZ][targetX];
            if (targetFloorType === 'void') return; // No floor tile = void, cannot move

            // 3. Wall Collision Check Function
            const isWallBlocking = (x: number, z: number, moveDirX: number, moveDirZ: number) => {
                return walls.some(wall => {
                    if (wall.opened) return false;
                    if (moveDirX > 0) return wall.type === 'VERTICAL' && wall.startX === x + 1 && wall.startZ === z;
                    if (moveDirX < 0) return wall.type === 'VERTICAL' && wall.startX === x && wall.startZ === z;
                    if (moveDirZ > 0) return wall.type === 'HORIZONTAL' && wall.startZ === z + 1 && wall.startX === x;
                    if (moveDirZ < 0) return wall.type === 'HORIZONTAL' && wall.startZ === z && wall.startX === x;
                    return false;
                });
            };

            // Player Wall Check
            if (isWallBlocking(playerPosition.x, playerPosition.z, dx, dz)) return;

            // 4. Block Pushing Check
            const blockIndex = items.findIndex(item => item.type.startsWith('block_') && item.x === targetX && item.z === targetZ);
            let updatedItems = [...items];
            let updatedGrid = grid;

            if (blockIndex !== -1) {
                const block = items[blockIndex];
                const nextBlockX = block.x + dx;
                const nextBlockZ = block.z + dz;

                // Block Boundary Check
                if (nextBlockX < 0 || nextBlockX >= width || nextBlockZ < 0 || nextBlockZ >= height) return;

                const blockTargetFloorType = grid[nextBlockZ][nextBlockX];

                // Case 1: Fill Pit
                if (blockTargetFloorType === 'pit') {
                    // Deep copy & Normalize grid to modify (ensure string[][] for cell modification)
                    const newGrid: string[][] = grid.map(row => typeof row === 'string' ? row.split('') : [...row]);
                    // Set to specific filled type to track color (e.g. 'filled_block_cube')
                    newGrid[nextBlockZ][nextBlockX] = 'filled_' + block.type;
                    updatedGrid = newGrid;

                    // Remove Block (falls into pit)
                    updatedItems.splice(blockIndex, 1);
                }
                // Case 2: Normal Push (Solid)
                else if (blockTargetFloorType === 'solid') {
                    // Block Wall Check
                    if (isWallBlocking(block.x, block.z, dx, dz)) return;

                    // Block overlapping another block Check
                    if (items.some(it => it.type.startsWith('block_') && it.x === nextBlockX && it.z === nextBlockZ)) return;

                    // Move Block
                    updatedItems[blockIndex] = { ...block, x: nextBlockX, z: nextBlockZ };
                }
                // Case 3: Void or invalid
                else {
                    return;
                }
            }

            // 5. Pit Check (if player moved to pit, trigger falling animation)
            // Note: If player pushed block into pit, the pit is now solid (in updatedGrid), so player won't fall.
            // We must check existing grid or updatedGrid? 
            // Player is moving to `targetX`, `targetZ`.
            // Ideally player checks `updatedGrid`. 
            const floorAtTarget = updatedGrid[targetZ][targetX];

            if (floorAtTarget === 'pit') {
                set((state) => {
                    const newVisited = new Set(state.visitedCells);
                    newVisited.add(`${targetX},${targetZ}`);
                    return {
                        currentMaze: {
                            ...currentMaze,
                            playerPosition: { x: targetX, z: targetZ },
                            items: updatedItems,
                            grid: updatedGrid
                        },
                        visitedCells: newVisited,
                        isFalling: true
                    };
                });
                return; // Exit early
            }

            // 6. Normal Move Update
            set((state) => {
                const newVisited = new Set(state.visitedCells);
                newVisited.add(`${targetX},${targetZ}`);
                return {
                    currentMaze: {
                        ...state.currentMaze,
                        playerPosition: { x: targetX, z: targetZ },
                        items: updatedItems,
                        grid: updatedGrid
                    },
                    visitedCells: newVisited
                };
            });

            // 7. Check Win Condition
            const hasPlates = updatedItems.some(it => it.type.startsWith('plate_'));

            if (hasPlates) {
                // Puzzle Win: All plates must have matching blocks
                const plates = updatedItems.filter(it => it.type.startsWith('plate_'));
                const allSatisfied = plates.every(plate => {
                    const shape = plate.type.split('_')[1]; // cube, sphere, tetra
                    return updatedItems.some(it => it.type === `block_${shape}` && it.x === plate.x && it.z === plate.z);
                });

                if (allSatisfied) {
                    completeGame();
                }
            } else {
                // Classic Win: Collect all stars
                const remainingStars = updatedItems.filter(it => it.type === 'star');
                if (remainingStars.length === 0) {
                    completeGame();
                }
            }
        },

        completeGame: async () => {
            const { userId, startTime, commandCount } = get();
            const playTime = Math.floor((Date.now() - startTime) / 1000); // seconds (integer)
            set({ gameStatus: 'cleared', isSaving: true, saveError: null, finalTime: playTime });

            try {
                await api.endGame(userId, commandCount, playTime);
                set({ isSaving: false });
            } catch (e) {
                console.error("Failed to save game result", e);
                set({ isSaving: false, saveError: "Failed to save result" });
            }
        },

        sendCommand: async (cmd: string) => {
            set((state) => ({ commandCount: state.commandCount + 1 }));
            const { git, syncToBackend, initialize, requestFlip, requestTear } = get();
            const { addLog } = useTerminalStore.getState();

            // Special case for git pull
            if (cmd.trim() === 'git pull') {
                addLog(`> ${cmd}`);
                await get().pullFromBackend();
                return;
            }

            await CommandHandler.execute(cmd, {
                git,
                currentMaze: get().currentMaze,
                addLog,
                setMaze: (maze) => set({ currentMaze: maze, gitVersion: get().gitVersion + 1 }),
                syncToBackend,
                requestFlip,
                requestPageTurn: get().requestPageTurn,
                requestTear,
                checkWinCondition: get().checkWinCondition,
                loadTutorial: get().loadTutorial,
                loadStage: get().loadStage,
                nextStage: get().nextStage,
                resetPlayerPosition: get().resetPlayerPosition,
                isDead: get().isDead,
                requestCommit: get().requestCommit
            });

            // Force re-render of components tracking the git engine
            set({ gitVersion: get().gitVersion + 1 });
        }
    }
})
