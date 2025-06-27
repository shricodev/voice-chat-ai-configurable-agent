import { useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { CONFIG } from "@/lib/constants";

interface UseSpeechRecognitionWithDebounceProps {
  onTranscriptComplete: (transcript: string) => void;
  debounceMs?: number;
}

export const useSpeechRecognitionWithDebounce = ({
  onTranscriptComplete,
  debounceMs = CONFIG.SPEECH_DEBOUNCE_MS,
}: UseSpeechRecognitionWithDebounceProps) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [debouncedTranscript] = useDebounce(transcript, debounceMs);
  const lastProcessedTranscript = useRef<string>("");

  useEffect(() => {
    if (
      debouncedTranscript &&
      debouncedTranscript !== lastProcessedTranscript.current &&
      listening
    ) {
      lastProcessedTranscript.current = debouncedTranscript;
      SpeechRecognition.stopListening();
      onTranscriptComplete(debouncedTranscript);
      resetTranscript();
    }
  }, [debouncedTranscript, listening, onTranscriptComplete, resetTranscript]);

  const startListening = () => {
    resetTranscript();
    lastProcessedTranscript.current = "";
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  return {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
  };
};

