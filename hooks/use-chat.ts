import { useState, useCallback } from "react";
import { useAliasStore } from "@/lib/alias-store";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { aliases } = useAliasStore();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return null;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMessage]);
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
        return botMessage;
      } catch (err) {
        console.error("Error generating response:", err);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Error generating response",
        };

        setMessages((prev) => [...prev, errorMessage]);
        return errorMessage;
      } finally {
        setIsLoading(false);
      }
    },
    [aliases, isLoading],
  );

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
