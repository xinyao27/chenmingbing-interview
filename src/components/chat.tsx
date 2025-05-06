"use client";

import React, { useEffect, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";
import { type Message } from "@ai-sdk/react";

const markdownComponents = {
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="m-0 leading-normal" {...props} />
  ),
};

interface ChatProps {
  messages: Message[];
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleFormSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: { message: string } | null;
  reload: () => void;
  stop: () => void;
}

export default function Chat({
  messages,
  input,
  handleInputChange,
  handleFormSubmit,
  isLoading,
  error,
  reload,
  stop,
}: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 pt-10 pb-2">
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto mb-4 border border-gray-300 dark:border-gray-700 p-4 rounded-lg bg-white dark:bg-gray-800 space-y-4"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No messages yet. Start chatting below!
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={clsx(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "whitespace-pre-wrap inline-block py-2 px-3 rounded-xl break-words max-w-[80%] bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              )}
            >
              {m.role === "user" ? (
                m.content
              ) : (
                <ReactMarkdown components={markdownComponents}>
                  {m.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div
          className="text-red-700 dark:text-red-300 mb-4 border border-red-500 p-3 rounded bg-red-50 dark:bg-red-900/30 flex justify-between items-center"
          role="alert"
        >
          <p>
            <strong>Error:</strong> {error.message}
          </p>
          <Button
            onClick={reload}
            disabled={isLoading}
            variant="destructive"
            size="sm"
          >
            Retry
          </Button>
        </div>
      )}

      <form
        onSubmit={handleFormSubmit}
        className="flex items-center gap-2"
        aria-busy={isLoading}
      >
        <Input
          className="flex-grow"
          value={input}
          onChange={handleInputChange}
          placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
          disabled={isLoading}
          aria-label="Chat input"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-disabled={isLoading || !input.trim()}
        >
          {isLoading ? <span className="px-2">...</span> : "Send"}
        </Button>
        {isLoading && (
          <Button
            type="button"
            onClick={stop}
            variant="outline"
            aria-label="Stop generating response"
          >
            Stop
          </Button>
        )}
      </form>
    </div>
  );
}
