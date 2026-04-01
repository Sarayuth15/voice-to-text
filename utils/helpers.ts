/**
 * Utility helpers for VoiceScript application.
 */

/**
 * Copy text to clipboard using modern API with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for non-secure contexts
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Download text content as a .txt file.
 */
export function downloadAsText(text: string, filename = 'transcript.txt'): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a timestamped filename for downloads.
 */
export function generateFilename(prefix = 'transcript'): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  return `${prefix}-${date}-${time}.txt`;
}

/**
 * Get stored language preference from localStorage.
 */
export function getStoredLanguage(): string {
  if (typeof window === 'undefined') return 'km-KH';
  return localStorage.getItem('voicescript-language') || 'km-KH';
}

/**
 * Persist language preference to localStorage.
 */
export function setStoredLanguage(lang: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('voicescript-language', lang);
  }
}

/**
 * Get stored theme preference from localStorage.
 */
export function getStoredTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('voicescript-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  // System preference fallback
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Persist theme preference to localStorage.
 */
export function setStoredTheme(theme: 'dark' | 'light'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('voicescript-theme', theme);
  }
}

/**
 * Format a word count with label.
 */
export function formatWordCount(count: number): string {
  return count === 1 ? '1 word' : `${count} words`;
}

/**
 * Format character count.
 */
export function formatCharCount(text: string): string {
  const count = text.length;
  return count === 1 ? '1 char' : `${count} chars`;
}
