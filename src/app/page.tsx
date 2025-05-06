"use client";

import React, {
  useState,
  useEffect,
  FormEvent,
  useCallback,
  useMemo,
} from "react";
import { useChat } from "@ai-sdk/react";

import ChatComponent from "@/components/chat";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarTrigger as UiSidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar, ChatMessages } from "@/components/app-sidebar";
import clsx from "clsx";
import { Spinner } from "@/components/ui/spinner";

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function ChatPage() {
  const [chats, setChats] = useState<ChatMessages>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  // const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [fetchChatsError, setFetchChatsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChats() {
      // setIsLoadingChats(true);
      setFetchChatsError(null);
      try {
        const response = await fetch("/api/chats");
        if (!response.ok) {
          throw new Error(`Failed to fetch chats: ${response.statusText}`);
        }
        const data: ChatMessages = await response.json();
        setChats(data);

        // setActiveChatId(data[0]?.chatId || crypto.randomUUID());
      } catch (error) {
        console.error("Error fetching chats:", error);
        setFetchChatsError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        // setIsLoadingChats(false);
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
    onFinish: () => {
      setInput("");
    },
  });

  // Effect to add a new chat to the `chats` state when a new `activeChatId` is created
  // and it doesn't exist yet.
  useEffect(() => {
    if (activeChatId) {
      setChats((prevChats) => {
        const chatExists = prevChats.some(
          (chat) => chat.chatId === activeChatId
        );
        if (!chatExists) {
          return [{ chatId: activeChatId, messages: [] }, ...prevChats];
        }
        return prevChats;
      });
    }
  }, [activeChatId]);

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isAiLoading || !activeChatId) return;
      append(
        { role: "user", content: input },
        { body: { chatId: activeChatId } } // Pass chatId in the body if your API expects it
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
    setInput("");
  }, [setMessages, setInput]);

  const pageContent = () => {
    // if (isLoadingChats) {
    //   return (
    //     <div className="flex flex-col justify-center items-center h-full text-gray-500 dark:text-gray-400 ">
    //       <Spinner className="w-8 h-8 " />
    //       <p className="text-lg mt-4">Loading chats...</p>
    //     </div>
    //   );
    // }

    if (fetchChatsError) {
      return (
        <div className="flex flex-col justify-center items-center h-full p-6 text-center">
          <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-3">
              Error Loading Chats
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {fetchChatsError}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="destructive"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    if (!activeChatId) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-gray-400 dark:text-gray-500 p-6 text-center">
          <MessageSquareIcon className="w-16 h-16 mb-6 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2 text-gray-600 dark:text-gray-300">
            Welcome!
          </h2>
          <p className="mb-6 max-w-sm">
            Select an existing chat from the sidebar or start a new
            conversation.
          </p>
          <Button
            onClick={handleNewChat}
            disabled={isAiLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 px-6 py-3 rounded-lg text-base font-medium"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Start New Chat
          </Button>
        </div>
      );
    }

    return (
      <ChatComponent
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        isLoading={isAiLoading}
        error={aiError ? { message: aiError.message } : null}
        reload={reload}
        stop={stop}
      />
    );
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white dark:bg-gray-950 w-full">
        {" "}
        <AppSidebar
          chats={chats}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          chatId={activeChatId}
          className="hidden md:flex flex-col w-64 lg:w-72 xl:w-80 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900" // Example styling for AppSidebar
        />
        <main className="flex-1 flex flex-col overflow-hidden h-full">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
            <UiSidebarTrigger
              className={clsx(
                "p-2 rounded-md md:hidden text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              )}
            >
              <MenuIcon className="w-5 h-5" />
            </UiSidebarTrigger>

            <div className="flex-1"></div>

            <Button
              variant="ghost"
              size="icon"
              className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-950"
              onClick={handleNewChat}
              disabled={isAiLoading}
              aria-label="New Chat"
            >
              <PlusIcon className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto flex items-center justify-center">
            {pageContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
