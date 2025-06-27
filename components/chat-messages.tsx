import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BotIcon, UserIcon } from "lucide-react";
import { Message } from "@/hooks/use-chat";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  if (messages.length === 0) {
    return (
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
              Use the microphone to speak or type your command below. You can
              configure shortcuts for IDs and URLs in the{" "}
              <span className="font-semibold text-zinc-600">settings</span>{" "}
              menu.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
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
  );
}

