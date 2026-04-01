'use client';

import React from 'react';

interface Language {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  {
    code: 'km-KH',
    label: 'Khmer',
    nativeLabel: 'ភាសាខ្មែរ',
    flag: '🇰🇭',
  },
  {
    code: 'en-US',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇺🇸',
  },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  disabled?: boolean;
}

/**
 * LanguageSelector — Toggle between Khmer and English.
 * Styled as a pill-shaped toggle for a clean, modern look.
 */
export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div
      className="relative flex rounded-full p-1"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
      }}
      role="group"
      aria-label="Language selector"
    >
      {LANGUAGES.map((lang) => {
        const isSelected = selectedLanguage === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => !disabled && onLanguageChange(lang.code)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-label={`Switch to ${lang.label}`}
            className={`
              relative z-10 flex items-center gap-2 px-4 py-2 rounded-full
              text-sm font-medium transition-all duration-200
              focus:outline-none focus-visible:ring-2
              disabled:cursor-not-allowed
            `}
            style={{
              background: isSelected ? 'var(--bg-card)' : 'transparent',
              color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: isSelected ? '0 2px 8px var(--shadow)' : 'none',
              transform: isSelected ? 'none' : 'none',
            }}
          >
            <span role="img" aria-hidden="true" className="text-base">
              {lang.flag}
            </span>
            <span className="hidden sm:inline">{lang.nativeLabel}</span>
            <span className="sm:hidden">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}
