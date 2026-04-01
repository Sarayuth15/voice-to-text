'use client';

import { useState, useEffect } from 'react';
import MicButton from '@/components/MicButton';
import LanguageSelector from '@/components/LanguageSelector';
import TranscriptBox from '@/components/TranscriptBox';
import StatusBadge from '@/components/StatusBadge';
import ThemeToggle from '@/components/ThemeToggle';
import UnsupportedBrowser from '@/components/UnsupportedBrowser';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import {
  getStoredLanguage,
  setStoredLanguage,
  getStoredTheme,
  setStoredTheme,
} from '@/utils/helpers';

/**
 * VoiceScript — Main application page.
 * Real-time speech-to-text for Khmer and English.
 */
export default function Home() {
  // ── Theme state ───────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = getStoredTheme();
    setIsDark(theme === 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    setStoredTheme(next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  // ── Language state ────────────────────────────────────────────────────────
  const [language, setLanguage] = useState('km-KH');

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setStoredLanguage(lang);
  };

  // ── Speech recognition ────────────────────────────────────────────────────
  const {
    transcript,
    interimTranscript,
    status,
    errorMessage,
    isSupported,
    wordCount,
    startListening,
    stopListening,
    clearTranscript,
    setTranscript,
  } = useSpeechRecognition({ language });

  // ── Keyboard shortcut: Space to toggle ────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Only trigger if not focused on textarea or input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (status === 'listening') {
          stopListening();
        } else {
          startListening();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, startListening, stopListening]);

  return (
    <main
      className="min-h-screen w-full flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-primary)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'var(--accent)' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            VoiceScript
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:block text-xs"
            style={{ color: 'var(--text-muted)' }}
            title="Press Space to toggle recording"
          >
            Space to toggle
          </span>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-8 sm:py-12 gap-8 max-w-2xl mx-auto w-full">

        {/* Title section */}
        <div className="text-center fade-in">
          <h1
            className="text-3xl sm:text-4xl mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            Voice to Text
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Speak in Khmer or English — transcribed in real-time
          </p>
        </div>

        {/* Language selector */}
        <div className="fade-in" style={{ animationDelay: '0.1s' }}>
          <LanguageSelector
            selectedLanguage={language}
            onLanguageChange={handleLanguageChange}
            disabled={status === 'listening'}
          />
        </div>

        {/* Mic button + status */}
        <div
          className="flex flex-col items-center gap-4 fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <MicButton
            status={status}
            isSupported={isSupported}
            onStart={startListening}
            onStop={stopListening}
          />
          <StatusBadge status={status} errorMessage={errorMessage} />
        </div>

        {/* Transcript or unsupported message */}
        <div
          className="w-full fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          {isSupported === false ? (
            <UnsupportedBrowser />
          ) : (
            <TranscriptBox
              transcript={transcript}
              interimTranscript={interimTranscript}
              wordCount={wordCount}
              onTranscriptChange={setTranscript}
              onClear={clearTranscript}
            />
          )}
        </div>

        {/* Language indicator pill */}
        <div
          className="flex items-center gap-2 text-xs fade-in"
          style={{ color: 'var(--text-muted)', animationDelay: '0.4s' }}
        >
          <span>{language === 'km-KH' ? '🇰🇭' : '🇺🇸'}</span>
          <span>Recognizing {language === 'km-KH' ? 'Khmer (ភាសាខ្មែរ)' : 'English (en-US)'}</span>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        className="py-6 text-center text-xs"
        style={{
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <p>
          Powered by Web Speech API · Works in Chrome, Brave & Edge
        </p>
      </footer>
    </main>
  );
}
