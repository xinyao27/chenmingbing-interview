"use client";

import React, { useEffect, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";
import { type Message } from "@ai-sdk/react";
import { Spinner } from "@/components/ui/spinner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  className?: string;
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
  className,
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
    <div
      className={clsx(
        "flex flex-col flex-grow h-full bg-gray-50 dark:bg-gray-900", // Changed background
        className
      )}
    >
      <div className="flex-grow overflow-hidden flex flex-col max-w-3xl w-full mx-auto p-4 sm:p-6">
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto   p-4 rounded-lg custom-scrollbar" // Added custom-scrollbar class if you want to style it
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full  text-gray-400 dark:text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-4 opacity-50"
              >
                <path d="M12 20.5v-10" />
                <path d="M12 6.5V4" />
                <path d="m7 10.5-1.804 1.804a5.503 5.503 0 1 0 7.782 7.782L15 18.5" />
                <path d="M17 10.5c3.038 0 5.5 2.462 5.5 5.5S20.038 21.5 17 21.5s-5.5-2.462-5.5-5.5c0-1.29.446-2.477 1.196-3.404L15 10.5h2Z" />
              </svg>
              <p className="text-lg">No messages yet.</p>
              <p className="text-sm">Start chatting below!</p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={clsx(
                "flex items-end gap-2 animate-fadeIn mb-4",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {m.role !== "user" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                  <Avatar>
                    <AvatarImage
                      src="https://avatars.githubusercontent.com/u/124599"
                      alt="@shadcn"
                    />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div
                className={clsx(
                  "whitespace-pre-wrap py-2.5 px-4 rounded-2xl shadow-sm break-words max-w-[75%] sm:max-w-[70%]", // Increased rounding, padding, shadow
                  m.role === "user"
                    ? "bg-blue-500 dark:bg-blue-600 text-white rounded-br-none" // User bubble style
                    : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600" // AI bubble style
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
              {m.role === "user" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                  <Avatar>
                    <AvatarImage
                      src="https://avatars.githubusercontent.com/u/124598"
                      alt="@shadcn"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div
            className="text-red-700 dark:text-red-300 mb-4 border border-red-400 dark:border-red-600 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 flex justify-between items-center shadow-sm animate-fadeIn"
            role="alert"
          >
            <p className="text-sm">
              {" "}
              <strong>Error:</strong> {error.message}
            </p>
            <Button
              onClick={reload}
              disabled={isLoading}
              variant="destructive"
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        )}

        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700" // Added top border
          aria-busy={isLoading}
        >
          <Input
            className="flex-grow h-12 px-4 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-transparent dark:focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100" // Enhanced input styles
            value={input}
            onChange={handleInputChange}
            placeholder={
              isLoading ? "AI is thinking..." : "Type your message..."
            }
            disabled={isLoading}
            aria-label="Chat input"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-disabled={isLoading || !input.trim()}
            className="h-12 px-5 sm:px-6 rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-base font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 flex items-center justify-center" // Enhanced button styles
          >
            {isLoading ? (
              <Spinner className="w-5 h-5" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </Button>
          {isLoading && (
            <Button
              type="button"
              onClick={stop}
              variant="outline"
              aria-label="Stop generating response"
              className="h-12 px-5 sm:px-6 rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-base" // Enhanced button styles
            >
              Stop
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
