import { useState, useEffect, useRef, useCallback } from "react";

// extend global type to add speechrecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface UseSpeechToTextOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface UseSpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  isSupported: boolean;
  interimTranscript: string;
  confidence: number | null;
}

export const useSpeechToText = (
  options: UseSpeechToTextOptions = {},
): UseSpeechToTextReturn => {
  const {
    continuous = true,
    interimResults = true,
    language = "en-US",
    maxAlternatives = 1,
    onError,
    onStart,
    onEnd,
  } = options;

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = useRef<boolean>(false);

  // Check for browser support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      isSupported.current = !!SpeechRecognition;

      if (isSupported.current && !recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();

        recognitionRef.current.continuous = continuous;
        recognitionRef.current.interimResults = interimResults;
        recognitionRef.current.lang = language;
        recognitionRef.current.maxAlternatives = maxAlternatives;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setError(null);
          onStart?.();
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          let interimText = "";
          let lastConfidence: number | null = null;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcriptPart = result[0].transcript;

            if (result.isFinal) {
              finalTranscript += transcriptPart;
              lastConfidence = result[0].confidence;
            } else {
              interimText += transcriptPart;
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => prev + finalTranscript);
            setConfidence(lastConfidence);
          }

          setInterimTranscript(interimText);
        };

        recognitionRef.current.onerror = (
          event: SpeechRecognitionErrorEvent,
        ) => {
          setError(event.error);
          setIsListening(false);
          onError?.(event.error);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
          onEnd?.();
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [
    continuous,
    interimResults,
    language,
    maxAlternatives,
    onError,
    onStart,
    onEnd,
  ]);

  const startListening = useCallback(() => {
    if (!isSupported.current) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    if (recognitionRef.current && !isListening) {
      // setTranscript("");
      setError(null);
      setInterimTranscript("");

      try {
        recognitionRef.current.start();
      } catch (err) {
        setError("Failed to start speech recognition");
        console.error("Speech recognition error:", err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    isSupported: isSupported.current,
    interimTranscript,
    confidence,
  };
};

export default useSpeechToText;
