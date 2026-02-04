import { MazeState } from './git/types';
import initialMaze from '../../initialMaze.json';

const API_BASE_URL = '/api'; // Vite proxy will handle this
const LOCAL_STORAGE_KEY = 'gitmaze_local_graph';

export interface DimensionPushDto {
    userId: string;
    dimensions: Record<string, any>; // Serialization of GitGraph
}

// Helper to check if we should use fallback
const isOfflineError = (err: any) => {
    return err instanceof TypeError || err.message.includes('ECONNREFUSED') || err.message.includes('Failed to fetch');
};

/**
 * API 모듈: 백엔드 서버와의 모든 통신을 담당하며, 서버 연결 실패 시 로컬 스토리지를 활용한 Fallback 로직을 제공합니다.
 */
export const api = {
    /**
     * 새로운 미로 데이터를 생성하거나 가져옵니다.
     * @param width 미로 가로 크기
     * @param height 미로 세로 크기
     * @returns 생성된 미로 상태 데이터
     */
    getNewMaze: async (level: number = 1): Promise<MazeState> => {
        try {
            const response = await fetch(`${API_BASE_URL}/maze/generate?level=${level}`);
            if (!response.ok) {
                throw new Error(`Failed to generate maze stage: ${level}`);
            }
            return response.json();
        } catch (err) {
            if (isOfflineError(err)) {
                console.warn("Backend offline. Using initialMaze.json fallback.");
                return initialMaze as MazeState;
            }
            throw err;
        }
    },

    /**
     * 특정 스테이지의 미로 데이터를 가져옵니다.
     * @param category 'tutorial' 또는 'main'
     * @param level 스테이지 레벨
     */
    getStage: async (category: string, level: number): Promise<MazeState> => {
        try {
            const response = await fetch(`${API_BASE_URL}/maze/stage/${category}/${level}`);
            if (!response.ok) {
                // If stage not found, try to fallback or throw
                if (response.status === 404) {
                    return api.getNewMaze(1); // Default to Stage 1
                }
                throw new Error(`Failed to fetch stage: ${category} ${level}`);
            }
            return response.json();
        } catch (err) {
            console.error("Failed to fetch stage:", err);
            return initialMaze as MazeState;
        }
    },

    /**
     * 특정 튜토리얼 레벨의 미로 데이터를 가져옵니다.
     * @param level 튜토리얼 레벨 (1-4)
     */
    getTutorialMaze: async (level: number): Promise<MazeState> => {
        return api.getStage('tutorial', level);
    },

    /**
     * 현재의 Git 그래프(게임 진행 상황)를 서버 또는 로컬 스토리지에 저장합니다.
     * @param userId 사용자 고유 ID
     * @param gitGraph 직렬화된 Git 그래프 JSON 문자열
     */
    pushDimensions: async (userId: string, gitGraph: string): Promise<void> => {
        // 안전을 위해 항상 로컬 스토리지에 먼저 백업
        localStorage.setItem(LOCAL_STORAGE_KEY, gitGraph);

        try {
            const payload: DimensionPushDto = {
                userId,
                dimensions: JSON.parse(gitGraph),
            };

            const response = await fetch(`${API_BASE_URL}/dimension/push`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Failed to push dimensions: ${response.statusText}`);
            }
        } catch (err) {
            if (isOfflineError(err)) {
                console.warn("Backend offline. Saved state to localStorage.");
                return;
            }
            throw err;
        }
    },

    /**
     * 저장된 Git 그래프 데이터를 불러옵니다.
     * @param userId 사용자 고유 ID
     * @returns 복원된 그래프 데이터 (없는 경우 null)
     */
    pullDimensions: async (userId: string): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/dimension/pull?userId=${userId}`);
            if (response.ok) {
                return response.json();
            }
            if (response.status === 404) return null;
            throw new Error(`Failed to pull dimensions: ${response.statusText}`);
        } catch (err) {
            // 서버 연결 실패 시 로컬 스토리지에서 마지막 저장 본을 확인
            if (isOfflineError(err)) {
                console.warn("Backend offline. Loading state from localStorage.");
                const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
                return localData ? JSON.parse(localData) : null;
            }
            throw err;
        }
    },

    /**
     * 게임 종료 시 플레이 통계(명령어 횟수, 시간 등)를 기록합니다.
     */
    endGame: async (userId: string, commandCount: number, playTime: number): Promise<void> => {
        const payload = {
            userId,
            commandCount,
            playTime
        };
        try {
            const response = await fetch(`${API_BASE_URL}/game/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Failed to save game result: ${response.statusText}`);
            }
        } catch (err) {
            if (isOfflineError(err)) {
                console.warn("Backend offline. Game end log (Local Only):", payload);
                return;
            }
            throw err;
        }
    }
};
