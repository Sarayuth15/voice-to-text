'use client';

import React from 'react';

/**
 * UnsupportedBrowser — Shown when Web Speech API is not available.
 */
export default function UnsupportedBrowser() {
  const browsers = [
    { name: 'Google Chrome', icon: '🔵', url: 'https://www.google.com/chrome/' },
    { name: 'Microsoft Edge', icon: '🟦', url: 'https://www.microsoft.com/en-us/edge' },
    { name: 'Brave', icon: '🦁', url: 'https://brave.com/' },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl p-8 text-center fade-in"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px var(--shadow)',
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-20 h-20 rounded-full mb-6"
        style={{ background: 'var(--bg-secondary)', border: '2px dashed var(--border)' }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--text-muted)' }}
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
          <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
        </svg>
      </div>

      <h2
        className="text-xl font-semibold mb-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        Browser Not Supported
      </h2>

      <p
        className="text-sm mb-6 max-w-sm leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        Your browser does not support voice recognition. Please use one of these
        supported browsers for the best experience:
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {browsers.map((b) => (
          <a
            key={b.name}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
          >
            <span>{b.icon}</span>
            {b.name}
          </a>
        ))}
      </div>
    </div>
  );
}
