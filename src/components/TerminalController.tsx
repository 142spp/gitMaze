import React, { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { useGameStore } from '../store/useGameStore'

export const TerminalController: React.FC = () => {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<Terminal | null>(null)
    const sendCommand = useGameStore((state) => state.sendCommand)
    const history = useGameStore((state) => state.history)

    const PROMPT = '\x1b[1;36muser@git-maze\x1b[0m:\x1b[1;34m~/projects/core\x1b[0m$ '

    useEffect(() => {
        if (!terminalRef.current) return

        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#ffffff',
                foreground: '#1f2937',
                cursor: '#2563eb',
                selectionBackground: '#e5e7eb',
                black: '#1f2937',
                red: '#ef4444',
                green: '#10b981',
                yellow: '#f59e0b',
                blue: '#3b82f6',
                magenta: '#8b5cf6',
                cyan: '#06b6d4',
                white: '#f3f4f6',
            },
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontSize: 13,
            allowProposedApi: true,
            lineHeight: 1.2,
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(terminalRef.current)

        const timer = setTimeout(() => {
            try {
                fitAddon.fit()
            } catch (e) {
                console.warn('Terminal fit failed:', e)
            }
        }, 100)

        term.writeln('\x1b[1;36muser@git-maze\x1b[0m:\x1b[1;34m~/projects/core\x1b[0m$ system --version')
        term.writeln('Git Maze System [Version 0.1.0]')
        term.writeln('(c) 2026 Git Maze Corporation. All rights reserved.\r\n')

        history.forEach(line => {
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

        const handleResize = () => {
            try {
                fitAddon.fit()
            } catch (e) {
                // Ignore resize errors if terminal not ready
            }
        }
        window.addEventListener('resize', handleResize)

        return () => {
            clearTimeout(timer)
            term.dispose()
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        if (xtermRef.current && history.length > 0) {
            const lastLine = history[history.length - 1]
            if (!lastLine.startsWith('> ')) {
                xtermRef.current.writeln(lastLine)
                xtermRef.current.write(PROMPT)
            }
        }
    }, [history])

    return (
        <div className="w-full h-full bg-white border-t border-gray-100 overflow-hidden">
            <div ref={terminalRef} className="w-full h-full p-2" />
        </div>
    )
}
