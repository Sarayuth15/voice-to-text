'use client';

import React from 'react';
import { RecognitionStatus } from '@/hooks/useSpeechRecognition';

interface MicButtonProps {
  status: RecognitionStatus;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
}

/**
 * MicButton — The central interaction element.
 * Shows a pulsing animation while listening, with a sound wave visualizer.
 */
export default function MicButton({
  status,
  isSupported,
  onStart,
  onStop,
}: MicButtonProps) {
  const isListening = status === 'listening';

  const handleClick = () => {
    if (!isSupported) return;
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mic button with ripple rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer ripple rings — only visible while listening */}
        {isListening && (
          <>
            <span
              className="absolute rounded-full border-2 opacity-0"
              style={{
                width: 140,
                height: 140,
                borderColor: 'var(--accent)',
                animation: 'ripple 1.8s ease-out infinite',
              }}
            />
            <span
              className="absolute rounded-full border-2 opacity-0"
              style={{
                width: 140,
                height: 140,
                borderColor: 'var(--accent)',
                animation: 'ripple 1.8s ease-out infinite',
                animationDelay: '0.6s',
              }}
            />
            <span
              className="absolute rounded-full border-2 opacity-0"
              style={{
                width: 140,
                height: 140,
                borderColor: 'var(--accent)',
                animation: 'ripple 1.8s ease-out infinite',
                animationDelay: '1.2s',
              }}
            />
          </>
        )}

        {/* Main button */}
        <button
          onClick={handleClick}
          disabled={!isSupported}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
          className={`
            relative z-10 flex items-center justify-center rounded-full
            transition-all duration-300 ease-out
            focus:outline-none focus-visible:ring-4
            disabled:opacity-40 disabled:cursor-not-allowed
            ${isListening
              ? 'scale-110'
              : 'hover:scale-105 active:scale-95'
            }
          `}
          style={{
            width: 96,
            height: 96,
            background: isListening
              ? 'var(--accent)'
              : 'var(--bg-card)',
            border: isListening
              ? '3px solid var(--accent)'
              : '3px solid var(--border)',
            boxShadow: isListening
              ? '0 0 40px var(--accent-glow), 0 8px 32px var(--shadow)'
              : '0 4px 24px var(--shadow)',
          }}
        >
          {isListening ? (
            /* Stop icon */
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="white"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            /* Microphone icon */
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--accent)' }}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>
      </div>

      {/* Sound wave visualizer — only visible while listening */}
      <div
        className="transition-all duration-300"
        style={{
          opacity: isListening ? 1 : 0,
          transform: isListening ? 'translateY(0)' : 'translateY(4px)',
          height: 32,
        }}
      >
        <div className="sound-wave" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>

      {/* Action label */}
      <p
        className="text-sm font-medium tracking-wide uppercase"
        style={{
          color: isListening ? 'var(--accent)' : 'var(--text-muted)',
          letterSpacing: '0.1em',
          marginTop: isListening ? 0 : 8,
          transition: 'color 0.3s ease',
        }}
      >
        {isSupported
          ? isListening
            ? 'Tap to stop'
            : 'Tap to speak'
          : 'Not supported'}
      </p>
    </div>
  );
}
