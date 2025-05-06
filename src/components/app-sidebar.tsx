"use client";

import React from "react";
import clsx from "clsx";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { type Message } from "@ai-sdk/react";

export type ChatMessages = {
  chatId: string;
  messages: Message[];
}[];

interface AppSidebarProps {
  chats: ChatMessages;
  onSelectChat: (chatId: string) => void;
  chatId: string | null;
}

export function AppSidebar({ chats, onSelectChat, chatId }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent className="p-4">
        <SidebarHeader className="font-bold mb-2">History</SidebarHeader>
        {chats.map(({ chatId: itemChatId, messages }) => {
          const title = messages[0]?.content;

          if (!title) {
            return null;
          }

          const isSelected = itemChatId === chatId;

          return (
            <SidebarGroup
              key={itemChatId}
              className={clsx(
                "cursor-pointer",
                "font-light",
                "max-w-[200px]",
                "overflow-hidden",
                "text-ellipsis",
                "whitespace-nowrap",
                "py-1",
                {
                  "text-blue-500 font-medium": isSelected,
                  "hover:bg-gray-100 dark:hover:bg-gray-700 rounded":
                    !isSelected,
                }
              )}
              onClick={() => onSelectChat(itemChatId)}
              role="button"
              aria-current={isSelected ? "page" : undefined}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectChat(itemChatId);
                }
              }}
            >
              {title}
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
