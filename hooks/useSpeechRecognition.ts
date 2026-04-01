'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type RecognitionStatus = 'idle' | 'listening' | 'stopped' | 'error';

export interface SpeechRecognitionState {
  transcript: string;
  interimTranscript: string;
  status: RecognitionStatus;
  errorMessage: string | null;
  isSupported: boolean;
  wordCount: number;
}

export interface SpeechRecognitionControls {
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  setTranscript: (text: string) => void;
}

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

/**
 * Custom hook that wraps the Web Speech API for real-time speech recognition.
 * Supports Chrome, Brave, and Edge browsers.
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): SpeechRecognitionState & SpeechRecognitionControls {
  const { language = 'km-KH', continuous = true, interimResults = true } = options;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const languageRef = useRef(language);

  // Check browser support on mount
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
    setIsSupported(supported);
  }, []);

  // Update language ref when it changes
  useEffect(() => {
    languageRef.current = language;
    // If currently listening, restart with new language
    if (isListeningRef.current && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [language]);

  /**
   * Creates and configures a new SpeechRecognition instance.
   */
  const createRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = languageRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setStatus('listening');
      setErrorMessage(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((prev) => {
          const separator = prev.length > 0 ? ' ' : '';
          return prev + separator + finalText;
        });
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      isListeningRef.current = false;
      setStatus('error');
      setInterimTranscript('');

      switch (event.error) {
        case 'not-allowed':
          setErrorMessage(
            'Microphone access denied. Please allow microphone permission in your browser settings.'
          );
          break;
        case 'no-speech':
          setErrorMessage('No speech detected. Please speak clearly and try again.');
          setStatus('stopped');
          break;
        case 'network':
          setErrorMessage('Network error. Please check your internet connection.');
          break;
        case 'audio-capture':
          setErrorMessage('No microphone found. Please connect a microphone and try again.');
          break;
        case 'aborted':
          setStatus('stopped');
          setErrorMessage(null);
          break;
        default:
          setErrorMessage(`Recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setInterimTranscript('');
      // Auto-restart if we're supposed to be listening (handles Chrome's timeout)
      if (isListeningRef.current) {
        try {
          recognition.lang = languageRef.current;
          recognition.start();
        } catch {
          isListeningRef.current = false;
          setStatus('stopped');
        }
      } else {
        setStatus('stopped');
      }
    };

    return recognition;
  }, [continuous, interimResults]);

  /**
   * Start recording / listening.
   */
  const startListening = useCallback(() => {
    if (!isSupported) return;

    // Clean up existing instance
    if (recognitionRef.current) {
      isListeningRef.current = false;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    isListeningRef.current = true;

    try {
      recognition.start();
    } catch (err) {
      setErrorMessage('Failed to start voice recognition. Please try again.');
      setStatus('error');
      isListeningRef.current = false;
    }
  }, [isSupported, createRecognition]);

  /**
   * Stop recording.
   */
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setInterimTranscript('');
    setStatus('stopped');
  }, []);

  /**
   * Clear the transcript.
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    if (status === 'stopped' || status === 'error') {
      setStatus('idle');
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Calculate word count
  const fullText = transcript + (interimTranscript ? ' ' + interimTranscript : '');
  const wordCount =
    fullText.trim().length === 0
      ? 0
      : fullText.trim().split(/\s+/).filter(Boolean).length;

  return {
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
  };
}
