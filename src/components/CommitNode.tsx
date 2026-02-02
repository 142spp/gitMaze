import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';

interface CommitNodeProps {
    data: {
        id: string;
        message?: string;
        isHead: boolean;
        branch?: string;
        themeColor?: string;
    };
}

export const CommitNode = memo(({ data }: CommitNodeProps) => {
    const color = data.themeColor || '#2563eb';

    return (
        <div className="relative flex flex-col items-center group pointer-events-none">
            {/* Target Handle at the top of the node */}
            <Handle type="target" position={Position.Top} className="!opacity-0 !pointer-events-none" />

            <div className="relative w-2 h-2 flex items-center justify-center">
                {/* The Central Circle */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className={`w-2 h-2 rounded-full border-[1px] transition-all duration-300 z-10 shadow-[0_0_8px_rgba(0,0,0,0.3)]
                      ${data.isHead ? 'scale-125 ring-2 ring-offset-1 ring-blue-400/30' : 'border-slate-800'}
                    `}
                    style={{
                        borderColor: data.isHead ? color : '#1e293b',
                        backgroundColor: data.isHead ? color : '#1e293b'
                    }}
                >
                    {data.isHead && (
                        <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-white animate-pulse" />
                    )}
                </motion.div>

                {/* Detailed Commit Info Card - Figma Inspired */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute left-6 top-[-10px] w-40 pointer-events-auto cursor-pointer select-none py-1"
                >
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[7px] font-black text-slate-500 font-mono tracking-tighter">#{data.id.substring(0, 6).toUpperCase()}</span>
                        {data.branch && (
                            <span className="px-1 py-0.2 rounded-[1px] text-[6px] font-black uppercase text-white shadow-sm"
                                style={{ backgroundColor: color }}>
                                {data.branch}
                            </span>
                        )}
                    </div>
                    {data.message && (
                        <div className="text-slate-700 text-[8px] leading-tight font-bold truncate max-w-full bg-white/50 backdrop-blur-[1px] rounded-[1px] px-1 -ml-1 border-l border-slate-300 group-hover:whitespace-normal group-hover:bg-white group-hover:shadow-sm transition-all duration-200">
                            {data.message}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Source Handle at the bottom of the node block */}
            <Handle type="source" position={Position.Bottom} className="!opacity-0 !pointer-events-none" />
        </div>
    );
});
