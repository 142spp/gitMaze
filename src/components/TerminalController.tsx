import React, { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { useGameStore } from '../store/useGameStore'

export const TerminalController: React.FC = () => {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<Terminal | null>(null)
    const sendCommand = useGameStore((state) => state.sendCommand)
    const terminalHistory = useGameStore((state) => state.terminalHistory)

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
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            fontSize: 12,
            allowProposedApi: true,
            lineHeight: 1.4,
            letterSpacing: 0.5,
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
        term.writeln('(c) PaperInk Corp. All rights reserved.\r\n')

        terminalHistory.forEach(line => {
            if (line.startsWith('> ')) {
                term.write(PROMPT)
                term.writeln(line.substring(2))
            } else {
                term.writeln(line)
            }
        })

        term.write(PROMPT)

        let currentInput = ''
        term.onKey(({ key, domEvent }) => {
            if (domEvent.keyCode === 13) { // Enter
                term.write('\r\n')
                if (currentInput.trim()) {
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
            } else {
                currentInput += key
                term.write(key)
            }
        })

        xtermRef.current = term

        return () => {
            resizeObserver.disconnect()
            clearTimeout(timer)
            term.dispose()
        }
    }, [])

    useEffect(() => {
        if (xtermRef.current && terminalHistory.length > 0) {
            const lastLine = terminalHistory[terminalHistory.length - 1]
            if (!lastLine.startsWith('> ')) {
                xtermRef.current.writeln(lastLine)
                xtermRef.current.write(PROMPT)
            }
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
                <div className="text-[10px] font-mono text-[#fdf3e7]/70 font-bold tracking-wider uppercase">git-maze — diary-bash — 80x24</div>
                <div className="w-8" />
            </div>

            {/* Terminal Content */}
            <div className="flex-1 p-2 overflow-hidden bg-[#fdf3e7]">
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
