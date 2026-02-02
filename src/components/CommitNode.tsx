import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface CommitNodeProps {
    data: {
        id: string;
        isHead: boolean;
        branch?: string;
        themeColor?: string;
    };
}

export const CommitNode = memo(({ data }: CommitNodeProps) => {
    const color = data.themeColor || '#2563eb';
    const nodeColor = '#334155'; // Dark Slate/Gray for nodes

    return (
        <div className="relative flex flex-col items-center group pointer-events-none pb-2">
            {/* Target Handle at the top of the node */}
            <Handle type="target" position={Position.Top} className="!opacity-0 !pointer-events-none" />

            <div className="relative w-2 h-2 flex items-center justify-center">
                {/* The Central Circle */}
                <div
                    className={`w-2 h-2 rounded-full border-[1px] transition-all duration-300 z-10
                      ${data.isHead ? 'scale-125 shadow-md ring-2 ring-offset-1 ring-blue-400/30' : 'border-slate-800'}
                    `}
                    style={{
                        borderColor: data.isHead ? color : '#1e293b',
                        backgroundColor: data.isHead ? color : '#1e293b'
                    }}
                >
                    {data.isHead && (
                        <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-white animate-pulse" />
                    )}
                </div>

                {/* Branch Label - Floats to the Right */}
                {data.branch && (
                    <div className="absolute left-4 whitespace-nowrap pointer-events-auto cursor-pointer select-none z-20">
                        <span className="px-1 py-0.2 rounded-[1px] text-[6px] font-black uppercase text-white shadow-sm"
                            style={{ backgroundColor: color }}>
                            {data.branch}
                        </span>
                    </div>
                )}
            </div>

            {/* Commit Hash - Nudged slightly closer to circle, margin bottom for edge gap */}
            <div className="mt-1 flex justify-center whitespace-nowrap font-mono text-[6px] pointer-events-auto cursor-pointer select-none">
                <span className={`font-black tracking-tighter ${data.isHead ? 'text-slate-900' : 'text-slate-600'}`}>
                    {data.id.toUpperCase()}
                </span>
            </div>

            {/* Source Handle at the bottom of the node block (ensures gap from hash) */}
            <Handle type="source" position={Position.Bottom} className="!opacity-0 !pointer-events-none" />
        </div>
    );
});
