"use client";

import { useCallback } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { useChat } from "@/hooks/use-chat";
import { useAudio } from "@/hooks/use-audio";
import { useSpeechRecognitionWithDebounce } from "@/hooks/use-speech-recognition";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";

export function ChatInterface() {
  const hasMounted = useMounted();
  const { messages, isLoading, sendMessage } = useChat();
  const { playAudio, stopAudio, isPlaying } = useAudio();

  const handleProcessMessage = useCallback(
    async (text: string) => {
      const botMessage = await sendMessage(text);
      if (botMessage) {
        await playAudio(botMessage.content);
      }
    },
    [sendMessage, playAudio],
  );

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
  } = useSpeechRecognitionWithDebounce({
    onTranscriptComplete: handleProcessMessage,
  });

  const handleMicClick = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleInputSubmit = async (message: string) => {
    resetTranscript();
    await handleProcessMessage(message);
  };

  if (!hasMounted) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex flex-col h-dvh bg-white font-sans">
        <ChatHeader />
        <main className="flex-1 overflow-y-auto pt-20 pb-28">
          <div className="h-full flex items-center justify-center">
            <div className="max-w-md mx-4 text-center">
              <div className="p-8 flex flex-col items-center gap-4 text-zinc-500">
                <p className="text-red-500">
                  Sorry, your browser does not support speech recognition.
                </p>
              </div>
            </div>
          </div>
        </main>
        <ChatInput
          onSubmit={handleInputSubmit}
          transcript=""
          listening={false}
          isLoading={isLoading}
          browserSupportsSpeechRecognition={false}
          onMicClick={handleMicClick}
          isPlaying={isPlaying}
          onStopAudio={stopAudio}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-white font-sans">
      <ChatHeader />

      <main className="flex-1 overflow-y-auto pt-20 pb-28">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </main>

      <ChatInput
        onSubmit={handleInputSubmit}
        transcript={transcript}
        listening={listening}
        isLoading={isLoading}
        browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        onMicClick={handleMicClick}
        isPlaying={isPlaying}
        onStopAudio={stopAudio}
      />
    </div>
  );
}
