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

    useEffect(() => {
        if (!terminalRef.current) return

        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#0a0a0a',
                foreground: '#00ff00',
                cursor: '#00ff00',
                selectionBackground: '#1d4f1d',
            },
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontSize: 14,
            allowProposedApi: true,
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(terminalRef.current)

        // Use a small delay to ensure DOM and dimensions are settled before fitting
        const timer = setTimeout(() => {
            try {
                fitAddon.fit()
            } catch (e) {
                console.warn('Terminal fit failed:', e)
            }
        }, 100)

        term.writeln('\x1b[1;32m--- GIT MAZE TERMINAL v0.1 ---\x1b[0m')
        history.forEach(line => term.writeln(line))

        let currentInput = ''
        term.onKey(({ key, domEvent }) => {
            const char = key
            if (domEvent.keyCode === 13) { // Enter
                term.write('\r\n')
                if (currentInput.trim()) {
                    sendCommand(currentInput)
                }
                currentInput = ''
            } else if (domEvent.keyCode === 8) { // Backspace
                if (currentInput.length > 0) {
                    currentInput = currentInput.slice(0, -1)
                    term.write('\b \b')
                }
            } else {
                currentInput += char
                term.write(char)
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
    }, []) // Initialize only once

    // Listen to history changes from outside
    useEffect(() => {
        if (xtermRef.current && history.length > 0) {
            const lastLine = history[history.length - 1]
            // Only write if it's not the user's just-typed command (which is already written)
            if (!lastLine.startsWith('> ')) {
                xtermRef.current.writeln(lastLine)
            }
        }
    }, [history])

    return (
        <div className="w-full h-full bg-[#0a0a0a] border-t border-green-900/30 overflow-hidden">
            <div ref={terminalRef} className="w-full h-full p-2" />
        </div>
    )
}
