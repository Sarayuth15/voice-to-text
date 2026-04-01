'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  copyToClipboard,
  downloadAsText,
  generateFilename,
  formatWordCount,
  formatCharCount,
} from '@/utils/helpers';

interface TranscriptBoxProps {
  transcript: string;
  interimTranscript: string;
  wordCount: number;
  onTranscriptChange: (text: string) => void;
  onClear: () => void;
}

/**
 * TranscriptBox — Live editable transcript area with utility actions.
 * Auto-scrolls as text grows, shows interim results in muted italic style.
 */
export default function TranscriptBox({
  transcript,
  interimTranscript,
  wordCount,
  onTranscriptChange,
  onClear,
}: TranscriptBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Auto-scroll textarea as content grows
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  const fullText = transcript + (interimTranscript ? ' ' + interimTranscript : '');
  const isEmpty = transcript.trim().length === 0 && interimTranscript.trim().length === 0;

  const handleCopy = async () => {
    if (!transcript) return;
    const success = await copyToClipboard(transcript);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    if (!transcript) return;
    downloadAsText(transcript, generateFilename('transcript'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="transcript-container rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 4px 24px var(--shadow)' }}
    >
      {/* Text area */}
      <div className="relative">
        {/* Placeholder */}
        {isEmpty && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-3 opacity-40"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <p className="text-sm text-center opacity-60 font-medium">
              Your transcript will appear here...
            </p>
            <p className="text-xs text-center mt-1 opacity-40">
              Press the microphone button to begin
            </p>
          </div>
        )}

        {/* Main textarea for final transcript */}
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          aria-label="Transcript"
          spellCheck
          className="w-full resize-none text-base leading-relaxed p-6 focus:outline-none"
          style={{
            minHeight: 240,
            maxHeight: 420,
            background: 'transparent',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            caretColor: 'var(--accent)',
            overflowY: 'auto',
          }}
          placeholder=""
        />

        {/* Interim transcript overlay — shown below final text */}
        {interimTranscript && (
          <p
            className="interim-text px-6 pb-4 text-base leading-relaxed"
            aria-live="polite"
            aria-label="Live transcript"
          >
            {interimTranscript}
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}
      >
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{formatWordCount(wordCount)}</span>
          <span className="opacity-40">·</span>
          <span>{formatCharCount(transcript)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Copy */}
          <ActionButton
            onClick={handleCopy}
            disabled={isEmpty || !transcript}
            title="Copy to clipboard"
            active={copied}
            activeLabel="Copied!"
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </ActionButton>

          {/* Save */}
          <ActionButton
            onClick={handleSave}
            disabled={isEmpty || !transcript}
            title="Save as .txt"
            active={saved}
            activeLabel="Saved!"
          >
            {saved ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
          </ActionButton>

          {/* Clear */}
          <ActionButton
            onClick={onClear}
            disabled={isEmpty}
            title="Clear transcript"
            danger
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Internal ActionButton ────────────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  active?: boolean;
  activeLabel?: string;
  danger?: boolean;
}

function ActionButton({
  onClick,
  disabled,
  title,
  children,
  active,
  activeLabel,
  danger,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-150
        focus:outline-none focus-visible:ring-2
        disabled:opacity-30 disabled:cursor-not-allowed
      `}
      style={{
        background: active
          ? 'rgba(99, 190, 123, 0.15)'
          : danger
          ? 'transparent'
          : 'transparent',
        color: active
          ? '#63BE7B'
          : danger
          ? 'var(--text-muted)'
          : 'var(--text-secondary)',
        border: '1px solid',
        borderColor: active
          ? 'rgba(99, 190, 123, 0.3)'
          : 'var(--border)',
      }}
    >
      {children}
      {active && activeLabel && (
        <span className="fade-in">{activeLabel}</span>
      )}
    </button>
  );
}
