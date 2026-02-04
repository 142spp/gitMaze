import React, { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { useGameStore } from '../store/useGameStore'
import { useTerminalStore } from '../store/useTerminalStore'

export const TerminalController: React.FC = () => {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<Terminal | null>(null)
    const sendCommand = useGameStore((state) => state.sendCommand)
    const terminalHistory = useTerminalStore((state) => state.terminalHistory)

    const PROMPT = '\x1b[1;38;2;139;94;60muser@git-maze\x1b[0m:\x1b[1;38;2;160;120;90m~\x1b[0m$ '

    useEffect(() => {
        if (!terminalRef.current) return

        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#fdf3e7', // parchment background
                foreground: '#4a3728', // dark brown text
                cursor: '#8b5e3c', // brown cursor
                selectionBackground: '#e6d5c3',
                black: '#2c1e14',
                red: '#a63d40',
                green: '#4c6444',
                yellow: '#b38b4d',
                blue: '#4a6fa5',
                magenta: '#8b5e3c',
                cyan: '#4d8b8b',
                white: '#fdf3e7',
            },
            fontFamily: "'mononoki Nerd Font', 'Noto Sans KR', sans-serif",
            fontSize: 14,
            allowProposedApi: true,
            lineHeight: 1.4,
            letterSpacing: -1,
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(terminalRef.current)

        // Use ResizeObserver for more reliable fitting than window.onresize
        const resizeObserver = new ResizeObserver(() => {
            if (terminalRef.current) {
                try {
                    fitAddon.fit()
                } catch (e) {
                    // Fit might fail if element is not visible
                }
            }
        })

        if (terminalRef.current) {
            resizeObserver.observe(terminalRef.current)
        }

        // Initial fit with a small delay to ensure container is ready
        const timer = setTimeout(() => {
            try {
                fitAddon.fit()
            } catch (e) { }
        }, 50)

        // Mock OS header like in reference
        term.writeln('GitMaze Diary-OS v1.0.4')
        term.writeln('gitMaze에 오신걸 환영합니다.')
        term.writeln('명령어를 입력해주세요. (도움말: help)')
        term.write(PROMPT)

        // Initial render of history is now handled by the other useEffect
        xtermRef.current = term

        let currentInput = ''
        let commandHistory: string[] = []
        let historyIndex = -1

        // Calculate the actual display length of the prompt (excluding ANSI codes)
        const PROMPT_DISPLAY_LENGTH = 17 // "user@git-maze:~$ "

        const clearCurrentLine = () => {
            // Move cursor to beginning and clear the line
            term.write('\r' + ' '.repeat(PROMPT_DISPLAY_LENGTH + currentInput.length + 10))
            term.write('\r')
            term.write(PROMPT)
        }

        const onKeyDisposable = term.onKey(({ key, domEvent }) => {
            if (domEvent.keyCode === 13) { // Enter
                term.write('\r\n')
                if (currentInput.trim()) {
                    // Add to history
                    commandHistory.push(currentInput)
                    historyIndex = commandHistory.length
                    sendCommand(currentInput)
                } else {
                    term.write(PROMPT)
                }
                currentInput = ''
            } else if (domEvent.keyCode === 8) { // Backspace
                if (currentInput.length > 0) {
                    currentInput = currentInput.slice(0, -1)
                    term.write('\b \b')
                }
            } else if (domEvent.keyCode === 38) { // Up arrow
                domEvent.preventDefault()
                if (commandHistory.length > 0 && historyIndex > 0) {
                    historyIndex--
                    clearCurrentLine()
                    currentInput = commandHistory[historyIndex]
                    term.write(currentInput)
                }
            } else if (domEvent.keyCode === 40) { // Down arrow
                domEvent.preventDefault()
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++
                    clearCurrentLine()
                    currentInput = commandHistory[historyIndex]
                    term.write(currentInput)
                } else if (historyIndex === commandHistory.length - 1) {
                    historyIndex = commandHistory.length
                    clearCurrentLine()
                    currentInput = ''
                }
            } else if (domEvent.keyCode === 37 || domEvent.keyCode === 39) { // Left/Right arrow
                // Block left/right arrow keys to prevent cursor movement
                domEvent.preventDefault()
            } else {
                currentInput += key
                term.write(key)
            }
        })

        return () => {
            onKeyDisposable.dispose()
            resizeObserver.disconnect()
            clearTimeout(timer)
            term.dispose()
        }
    }, [])

    const lastRenderedIndex = useRef(0)

    useEffect(() => {
        const term = xtermRef.current
        if (!term) return

        // Render any new lines in history
        const newLines = terminalHistory.slice(lastRenderedIndex.current)

        if (newLines.length > 0) {
            newLines.forEach((line, index) => {
                const normalizedLine = line.replace(/\n/g, '\r\n')
                const isLastLine = (lastRenderedIndex.current + index) === terminalHistory.length - 1

                if (line.startsWith('> ')) {
                    // This is a command input log. 
                    // To avoid duplicating the command the user just typed, 
                    // we only render it if we're replaying old history (i.e., not just added).
                    // Actually, if it's new but IS the last line, we usually want to skip the prompt/line
                    // because the user already typed it? 
                    // No, because term.writeln will move us to the next line.

                    // Simple logic: if it starts with '>', we rewrite the line to ensure prompt is there (for history replay)
                    term.write('\r') // Move to start of line
                    term.write(PROMPT)
                    term.writeln(normalizedLine.substring(2))
                } else {
                    term.writeln(normalizedLine)
                }
            })

            term.write(PROMPT)
            lastRenderedIndex.current = terminalHistory.length
        }
    }, [terminalHistory])

    return (
        <div className="w-full h-full bg-[#fdf3e7] rounded-2xl shadow-xl border-4 border-[#8b5e3c] overflow-hidden flex flex-col">
            {/* Terminal Header */}
            <div className="bg-[#8b5e3c] p-3 flex items-center justify-between shrink-0">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#a63d40] shadow-sm hover:brightness-110" />
                    <div className="w-3 h-3 rounded-full bg-[#b38b4d] shadow-sm hover:brightness-110" />
                    <div className="w-3 h-3 rounded-full bg-[#4c6444] shadow-sm hover:brightness-110" />
                </div>
                <div className="text-[10px] font-sans text-[#fdf3e7]/70 font-bold tracking-wider uppercase">git-maze — diary-bash — 80x24</div>
                <div className="w-8" />
            </div>

            {/* Terminal Content */}
            <div className="flex-1 p-2 overflow-hidden bg-[#fdf3e7] xterm-container">
                <div ref={terminalRef} className="w-full h-full" />
            </div>

            {/* Footer Decoration */}
            <div className="p-2 bg-[#8b5e3c]/10 flex justify-between items-center px-4 shrink-0">
                <div className="flex gap-2">
                    <div className="w-8 h-1.5 bg-[#8b5e3c]/30 rounded-full" />
                    <div className="w-4 h-1.5 bg-[#8b5e3c]/20 rounded-full" />
                </div>
            </div>
        </div>
    )
}
