"use client";

import { SettingsModal } from "@/components/settings-modal";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useAliasStore } from "@/lib/alias-store";
import { MicIcon, SendIcon, BotIcon, UserIcon } from "lucide-react";
import { useEffect, useRef, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { aliases } = useAliasStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const playAudio = async (text: string) => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("Failed to generate audio");

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();

      const audioData = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(audioData);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      source.start(0);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handleProcessMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);

    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, aliases }),
      });
      if (!response.ok) throw new Error("Failed to generate response");

      const result = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.content,
      };

      setMessages((prev) => [...prev, botMessage]);
      await playAudio(result.content);
      // await playAudio("Hello, this is Shrijal Acharya, how can I help you?");
    } catch (err) {
      console.error("Error generating response:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error generating response",
      };
      setMessages((prev) => [...prev, errorMessage]);
      await playAudio(errorMessage.content);
      // await playAudio("Hello, this is Shrijal Acharya, how can I help you?");
    } finally {
      setIsLoading(false);
    }
  };

  const { isListening, transcript, startListening, stopListening } =
    useSpeechToText({
      onEnd: () => {
        // Auto-submit when speech recognition ends
        if (transcript.trim()) {
          handleProcessMessage(transcript);
        }
      },
      onError: (error) => {
        console.error("Speech recognition error:", error);
      },
    });

  useEffect(() => {
    if (transcript) setInputValue(transcript);
  }, [transcript]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleProcessMessage(inputValue);
  };

  return (
    <div className="flex flex-col h-dvh bg-white font-sans">
      <header className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center p-4 border-b bg-white/80 backdrop-blur-md">
        <h1 className="text-xl font-semibold text-zinc-900">shricodev.</h1>
        <SettingsModal />
      </header>

      <main className="flex-1 overflow-y-auto pt-20 pb-28">
        {messages.length > 0 ? (
          <div className="flex flex-col gap-2 w-full items-center">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className="flex flex-row gap-4 px-4 w-full md:max-w-[640px] py-4"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="size-[24px] flex flex-col justify-start items-center flex-shrink-0 text-zinc-500">
                  {message.role === "assistant" ? <BotIcon /> : <UserIcon />}
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="text-zinc-800 leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex flex-row gap-4 px-4 w-full md:max-w-[640px] py-4">
                <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
                  <BotIcon />
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-current rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <motion.div
              className="max-w-md mx-4 text-center"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="p-8 flex flex-col items-center gap-4 text-zinc-500">
                <BotIcon className="w-16 h-16" />
                <h2 className="text-2xl font-semibold text-zinc-800">
                  How can I help you today?
                </h2>
                <p>
                  Use the microphone to speak or type your command below. You
                  can configure shortcuts for IDs and URLs in the{" "}
                  <span className="font-semibold text-zinc-600">settings</span>{" "}
                  menu.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white">
        <div className="flex flex-col items-center pb-4">
          <form
            onSubmit={handleSubmit}
            className="flex items-center w-full md:max-w-[640px] max-w-[calc(100dvw-32px)] bg-zinc-100 rounded-full px-4 py-2 my-2 border"
          >
            <Input
              className="bg-transparent flex-grow outline-none text-zinc-800 placeholder-zinc-500 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder={isListening ? "Listening..." : "Send a message..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isListening}
            />

            <Button
              type="button"
              onClick={isListening ? stopListening : startListening}
              size="icon"
              variant="ghost"
              className={`ml-2 size-9 rounded-full transition-all duration-200 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg scale-105"
                  : "bg-zinc-200 hover:bg-zinc-300 text-zinc-700 hover:scale-105"
              }`}
              aria-label={isListening ? "Stop Listening" : "Start Listening"}
            >
              <MicIcon size={18} />
            </Button>

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
    </div>
  );
}
