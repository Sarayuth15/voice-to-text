'use client';

import React from 'react';
import { RecognitionStatus } from '@/hooks/useSpeechRecognition';

interface StatusBadgeProps {
  status: RecognitionStatus;
  errorMessage: string | null;
}

/**
 * StatusBadge — Shows current recognition state with color-coded pill.
 */
export default function StatusBadge({ status, errorMessage }: StatusBadgeProps) {
  const config = {
    idle: {
      label: 'Ready',
      className: 'status-stopped',
      dot: 'bg-gray-400',
    },
    listening: {
      label: 'Listening...',
      className: 'status-listening',
      dot: 'bg-red-500',
      pulse: true,
    },
    stopped: {
      label: 'Stopped',
      className: 'status-stopped',
      dot: 'bg-gray-400',
    },
    error: {
      label: 'Error',
      className: 'status-error',
      dot: 'bg-orange-400',
    },
  };

  const current = config[status];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium ${current.className}`}
      >
        {/* Status dot */}
        <span className="relative flex h-2 w-2">
          {(current as any).pulse && (
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: 'var(--accent)' }}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`} />
        </span>
        {current.label}
      </div>

      {/* Error message */}
      {errorMessage && (
        <p
          className="text-xs text-center max-w-xs fade-in px-2"
          style={{ color: 'var(--accent-secondary)' }}
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
