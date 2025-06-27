import { FormEvent, useEffect, useState } from "react";
import { MicIcon, SendIcon, Square } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  transcript: string;
  listening: boolean;
  isLoading: boolean;
  browserSupportsSpeechRecognition: boolean;
  onMicClick: () => void;
  isPlaying: boolean;
  onStopAudio: () => void;
}

export function ChatInput({
  onSubmit,
  transcript,
  listening,
  isLoading,
  browserSupportsSpeechRecognition,
  onMicClick,
  isPlaying,
  onStopAudio,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    setInputValue(transcript);
  }, [transcript]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue("");
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white">
      <div className="flex flex-col items-center pb-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center w-full md:max-w-[640px] max-w-[calc(100dvw-32px)] bg-zinc-100 rounded-full px-4 py-2 my-2 border"
        >
          <Input
            className="bg-transparent flex-grow outline-none text-zinc-800 placeholder-zinc-500 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder={listening ? "Listening..." : "Send a message..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={listening}
          />
          <Button
            type="button"
            onClick={onMicClick}
            size="icon"
            variant="ghost"
            className={`ml-2 size-9 rounded-full transition-all duration-200 ${
              listening
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg scale-105"
                : "bg-zinc-200 hover:bg-zinc-300 text-zinc-700 hover:scale-105"
            }`}
            aria-label={listening ? "Stop Listening" : "Start Listening"}
            disabled={!browserSupportsSpeechRecognition}
          >
            <MicIcon size={18} />
          </Button>
          {isPlaying && (
            <Button
              type="button"
              onClick={onStopAudio}
              size="icon"
              variant="ghost"
              className="ml-2 size-9 rounded-full transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:scale-105"
              aria-label="Stop Audio"
            >
              <Square size={18} />
            </Button>
          )}
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className={`ml-2 size-9 rounded-full transition-all duration-200 ${
              inputValue.trim() && !isLoading
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:scale-105"
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
            }`}
            disabled={isLoading || !inputValue.trim()}
          >
            <SendIcon size={18} />
          </Button>
        </form>
        <p className="text-xs text-zinc-400">
          Made with 🤍 by Shrijal Acharya @shricodev
        </p>
      </div>
    </footer>
  );
}

