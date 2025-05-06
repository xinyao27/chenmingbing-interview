"use client";

import React, {
  useState,
  useEffect,
  FormEvent,
  useCallback,
  useMemo,
} from "react";
import { useChat } from "@ai-sdk/react";

import Chat from "@/components/chat";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, ChatMessages } from "@/components/app-sidebar";

export default function ChatPage() {
  const [chats, setChats] = useState<ChatMessages>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [fetchChatsError, setFetchChatsError] = useState<string | null>(null);

  // Effect hook to fetch all chat sessions on component mount
  useEffect(() => {
    async function fetchChats() {
      setIsLoadingChats(true);
      setFetchChatsError(null);
      try {
        const response = await fetch("/api/chats");
        if (!response.ok) {
          throw new Error(`Failed to fetch chats: ${response.statusText}`);
        }
        const data: ChatMessages = await response.json();
        setChats(data);

        setActiveChatId(crypto.randomUUID());
      } catch (error) {
        console.error("Error fetching chats:", error);
        setFetchChatsError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setIsLoadingChats(false);
      }
    }

    fetchChats();
  }, []);

  const currentChat = useMemo(() => {
    return chats.find((chat) => chat.chatId === activeChatId);
  }, [chats, activeChatId]);

  const initialMessages = useMemo(() => {
    return (currentChat?.messages ?? []).map((message, index) => ({
      ...message,
      id: `${activeChatId}-initial-${index}`,
    }));
  }, [currentChat, activeChatId]);

  const {
    messages,
    input,
    handleInputChange,
    isLoading: isAiLoading,
    error: aiError,
    setInput,
    stop,
    reload,
    append,
    setMessages,
  } = useChat({
    api: "/api/chat",
    id: activeChatId ?? undefined,
    initialMessages: initialMessages,
    streamProtocol: "text",

    onError: (err) => {
      console.error("Chat AI error:", err);
    },
    onFinish: (message) => {
      setInput("");
      console.log("AI finished generating:", message);
    },
  });

  // Effect to add a new chat to the `chats` state if a new `activeChatId` is created
  // and messages are being added to it.
  useEffect(() => {
    if (activeChatId) {
      setChats((prevChats) => {
        const chatExists = prevChats.some(
          (chat) => chat.chatId === activeChatId
        );
        if (!chatExists) {
          return [{ chatId: activeChatId, messages: [] }, ...prevChats];
        } else {
          return prevChats;
        }
      });
    }
  }, [messages, activeChatId]);

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input || isAiLoading || !activeChatId) return;
      append(
        { role: "user", content: input },
        { body: { chatId: activeChatId } }
      );
    },
    [input, isAiLoading, activeChatId, append]
  );

  const handleSelectChat = useCallback(
    (selectedChatId: string) => {
      if (selectedChatId !== activeChatId) {
        setActiveChatId(selectedChatId);
      }
    },
    [activeChatId]
  );

  const handleNewChat = useCallback(() => {
    const newChatId = crypto.randomUUID();
    setActiveChatId(newChatId);
    setMessages([]);
  }, [setMessages]);

  if (isLoadingChats) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading chats...
      </div>
    );
  }

  if (fetchChatsError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error loading chats: {fetchChatsError}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        chats={chats}
        onSelectChat={handleSelectChat}
        chatId={activeChatId}
      />

      <main className="w-full relative">
        <div className="absolute top-2 left-2 z-10">
          <SidebarTrigger />
        </div>
        <Button
          size={"sm"}
          className="absolute right-3 top-2 z-10"
          onClick={handleNewChat}
          disabled={isAiLoading}
        >
          New Chat
        </Button>

        {activeChatId ? (
          <Chat
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleFormSubmit={handleFormSubmit}
            isLoading={isAiLoading}
            error={aiError ? { message: aiError.message } : null}
            reload={reload}
            stop={stop}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            Select a chat or start a new one.
          </div>
        )}
      </main>
    </SidebarProvider>
  );
}
