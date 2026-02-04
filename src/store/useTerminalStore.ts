import { create } from 'zustand'

interface TerminalState {
    terminalHistory: string[];
    addLog: (log: string) => void;
    clearHistory: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
    terminalHistory: [],

    /**
     * 터미널 로그에 메시지를 추가합니다.
     */
    addLog: (log: string) => set((state) => ({
        terminalHistory: [...state.terminalHistory, log]
    })),

    /**
     * 터미널 기록을 초기화합니다.
     */
    clearHistory: () => set({ terminalHistory: [] }),
}))
