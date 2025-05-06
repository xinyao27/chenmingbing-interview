import { Hono } from "hono";
import { handle } from "hono/vercel";
import { streamText, CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/db";
import { messagesTable, Message } from "@/db/schema";
import { HTTPException } from "hono/http-exception";
import { sql, desc, asc, inArray } from "drizzle-orm";

export const runtime = "nodejs";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const ROLE_USER = "user";
const ROLE_ASSISTANT = "assistant";

interface ChatPostRequest {
  messages: CoreMessage[];
  id: string;
}

interface ChatMessage {
  chatId: string;
  role: typeof ROLE_USER | typeof ROLE_ASSISTANT;
  content: string;
  createdAt: Date;
}

interface ChatResponseItem {
  chatId: string;
  messages: ChatMessage[];
}

type ChatsGetResponse = ChatResponseItem[];

// Initialize Hono app with a base path
const app = new Hono().basePath("/api");

/**
 * Inserts a single message into the database.
 * Handles potential database errors, throwing HTTPException for user message failures.
 * @param message - The message object to insert (excluding id and createdAt).
 */
async function insertMessage(message: Omit<Message, "createdAt" | "id">) {
  try {
    await db.insert(messagesTable).values(message);
  } catch (dbError) {
    console.error(
      `Database insert error for role ${message.role} in chat ${message.chatId}:`,
      dbError
    );
    if (message.role === ROLE_USER) {
      throw new HTTPException(500, {
        message: `Failed to save ${message.role} message`,
      });
    }
  }
}

// POST endpoint to handle chat interactions
app.post("/chat", async (c) => {
  try {
    const { messages, id: chatId } = await c.req.json<ChatPostRequest>();

    if (!chatId) {
      throw new HTTPException(400, { message: "chatId is required" });
    }
    if (!messages || messages.length === 0) {
      throw new HTTPException(400, {
        message: "messages array is required and cannot be empty",
      });
    }

    const lastUserMessage = messages[messages.length - 1];
    if (
      !lastUserMessage ||
      lastUserMessage.role !== ROLE_USER ||
      !lastUserMessage.content ||
      (typeof lastUserMessage.content === "string" &&
        lastUserMessage.content.trim() === "")
    ) {
      throw new HTTPException(400, {
        message: `Last message must be from ${ROLE_USER} and have non-empty content`,
      });
    }

    // Save the user's message to the database before sending to AI
    await insertMessage({
      chatId: chatId,
      role: ROLE_USER,
      content:
        typeof lastUserMessage.content === "string"
          ? lastUserMessage.content
          : JSON.stringify(lastUserMessage.content),
    });

    const result = await streamText({
      model: openai(OPENAI_MODEL),
      messages,
      onFinish: async ({ text }) => {
        const trimmedText = text.trim();
        if (trimmedText.length > 0) {
          await insertMessage({
            chatId: chatId,
            role: ROLE_ASSISTANT,
            content: trimmedText,
          });
        } else {
          console.log(
            `Assistant response for chat ${chatId} was empty after trimming.`
          );
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error(
      `Chat API error (${
        error instanceof HTTPException ? "HTTPException" : "Unexpected"
      }):`,
      error
    );
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    return c.json({ error: "An internal server error occurred" }, 500);
  }
});

// GET endpoint to retrieve all chat histories
app.get("/chats", async (c) => {
  try {
    // Subquery to find the timestamp of the first message for each chat
    // This is used to order the chats themselves (most recent chat first)
    const chatOrderSubquery = db
      .select({
        chatId: messagesTable.chatId,
        firstCreatedAt: sql<Date>`MIN(${messagesTable.createdAt})`.as(
          "firstCreatedAt"
        ),
      })
      .from(messagesTable)
      .groupBy(messagesTable.chatId)
      .as("chatOrderSubquery");

    // Query to get chatIds ordered by their first message's timestamp (descending)
    const orderedChats = await db
      .select({ chatId: chatOrderSubquery.chatId })
      .from(chatOrderSubquery)
      .orderBy(desc(chatOrderSubquery.firstCreatedAt));

    if (orderedChats.length === 0) {
      return c.json([]);
    }

    const orderedChatIds = orderedChats.map((chat) => chat.chatId);

    // Fetch all messages for the retrieved chat IDs, ordered by creation time within each chat
    const messages = await db
      .select({
        chatId: messagesTable.chatId,
        role: messagesTable.role,
        content: messagesTable.content,
        createdAt: messagesTable.createdAt,
      })
      .from(messagesTable)
      .where(inArray(messagesTable.chatId, orderedChatIds))
      .orderBy(asc(messagesTable.createdAt));

    const groupedMessages = messages.reduce((acc, message) => {
      const chatMessages = acc.get(message.chatId);
      const formattedMessage: ChatMessage = {
        chatId: message.chatId,
        role: message.role as typeof ROLE_USER | typeof ROLE_ASSISTANT,
        content: message.content,
        createdAt: message.createdAt,
      };
      if (chatMessages) {
        chatMessages.push(formattedMessage);
      } else {
        acc.set(message.chatId, [formattedMessage]);
      }
      return acc;
    }, new Map<string, ChatMessage[]>());

    const response: ChatsGetResponse = orderedChatIds.map((chatId) => ({
      chatId,
      messages: groupedMessages.get(chatId) || [],
    }));

    return c.json(response);
  } catch (error) {
    console.error("Chats API error (Unexpected):", error);
    return c.json({ error: "An internal server error occurred" }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
