import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, SpinnerIcon, MicrophoneIcon, StopIcon } from '../constants';

// Add type definitions for SpeechRecognition API to fix TypeScript errors.
// The Web Speech API is not yet part of the standard DOM typings.
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

// A simple hook for speech recognition
const useSpeechRecognition = (onTranscript: (transcript: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Can be changed, e.g., 'kn-IN' for Kannada

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript.trim()) {
              onTranscript(finalTranscript.trim());
            }
        };
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [onTranscript]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };
    
    return { isListening, toggleListening };
};


interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  initialPrompt?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, initialPrompt }) => {
  const [text, setText] = useState(initialPrompt || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, toggleListening } = useSpeechRecognition((transcript) => {
    setText(prev => prev.trim() ? prev + ' ' + transcript : transcript);
  });
  
  // Set initial prompt when it changes
  useEffect(() => {
    if(initialPrompt) {
        setText(initialPrompt);
        textareaRef.current?.focus();
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-end max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about market prices or government schemes..."
          rows={1}
          className="flex-1 bg-gray-100 text-gray-800 placeholder-gray-500 p-3 rounded-lg border-2 border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition duration-200 max-h-48 scrollbar-thin"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={toggleListening}
          className="ml-3 text-gray-500 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? <StopIcon className="w-6 h-6 text-red-500" /> : <MicrophoneIcon />}
        </button>
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="ml-2 bg-blue-600 text-white p-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors duration-200 flex items-center justify-center"
        >
          {isLoading ? <SpinnerIcon /> : <SendIcon />}
        </button>
      </form>
    </div>
  );
};