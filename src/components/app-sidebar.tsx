"use client";

import React from "react";
import clsx from "clsx";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { type Message } from "@ai-sdk/react";

const MessageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export type ChatMessages = {
  chatId: string;
  messages: Message[];
}[];

interface AppSidebarProps {
  chats: ChatMessages;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  chatId: string | null;
  className?: string;
}

export function AppSidebar({
  chats,
  onSelectChat,
  chatId,
  className,
}: AppSidebarProps) {
  return (
    <Sidebar className={clsx("flex flex-col", className)}>
      {" "}
      <SidebarContent className="p-3 space-y-2 flex flex-col h-full">
        <SidebarHeader className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 pt-2 pb-1">
          History
        </SidebarHeader>
        <div className="flex-grow overflow-y-auto space-y-1 custom-scrollbar pr-0.5 -mr-0.5">
          {" "}
          {chats.length === 0 && (
            <p className="px-2 py-2 text-sm text-gray-400 dark:text-gray-500">
              No chat history yet.
            </p>
          )}
          {chats.map(({ chatId: itemChatId, messages }) => {
            let title =
              (messages.find(
                (msg) => msg.role === "user" && typeof msg.content === "string"
              )?.content as string) ||
              (messages.find((msg) => typeof msg.content === "string")
                ?.content as string) ||
              "Untitled Chat";
            title = title.length > 40 ? title.substring(0, 37) + "..." : title;

            const isSelected = itemChatId === chatId;

            return (
              <div
                key={itemChatId}
                className={clsx(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm cursor-pointer transition-colors duration-150 ease-in-out group", // Added group for potential future icon styling on hover
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-800", // Enhanced focus visibility
                  {
                    "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-medium":
                      isSelected,
                    "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60":
                      !isSelected,
                  }
                )}
                onClick={() => onSelectChat(itemChatId)}
                role="link"
                aria-current={isSelected ? "page" : undefined}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectChat(itemChatId);
                  }
                }}
              >
                <MessageIcon
                  className={clsx(
                    "w-4 h-4 flex-shrink-0",
                    isSelected
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                  )}
                />
                <span className="truncate flex-grow">{title}</span>
              </div>
            );
          })}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
