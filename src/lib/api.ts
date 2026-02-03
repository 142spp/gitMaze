import { MazeState } from './git/types';

const API_BASE_URL = '/api'; // Vite proxy will handle this

export interface DimensionPushDto {
    userId: string;
    dimensions: Record<string, any>; // Serialization of GitGraph
}

export const api = {
    // 1. Generate New Maze
    getNewMaze: async (width: number = 6, height: number = 6): Promise<MazeState> => {
        const response = await fetch(`${API_BASE_URL}/maze/generate?width=${width}&height=${height}`);
        if (!response.ok) {
            throw new Error(`Failed to generate maze: ${response.statusText}`);
        }
        return response.json();
    },

    // 2. Push Dimension (Save Game State)
    pushDimensions: async (userId: string, gitGraph: string): Promise<void> => {
        const payload: DimensionPushDto = {
            userId,
            dimensions: JSON.parse(gitGraph), // Parse string back to object for wrapper
        };

        const response = await fetch(`${API_BASE_URL}/dimension/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Failed to push dimensions: ${response.statusText}`);
        }
    },

    // 3. Pull Dimensions (Load Game State)
    pullDimensions: async (userId: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/dimension/pull?userId=${userId}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Failed to pull dimensions: ${response.statusText}`);
        }
        return response.json();
    },

    // 4. End Game & Save Result
    endGame: async (userId: string, commandCount: number, playTime: number): Promise<void> => {
        const payload = {
            userId,
            commandCount,
            playTime
        };
        const response = await fetch(`${API_BASE_URL}/game/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Failed to save game result: ${response.statusText}`);
        }
    }
};
