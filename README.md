# Chat Application

A real-time chat application built with modern web technologies, supporting chat history, message streaming, and interaction with AI.

## Features

- **Real-time Chat**: Supports real-time conversations between users and AI.
- **Chat History**: Saves chat records and sorts them by time.
- **Streaming Responses**: AI replies are presented in a streaming manner.
- **Multi-Session Support**: Allows creating multiple chat sessions and switching between them.
- **Responsive Design**: Adapts to both desktop and mobile devices.

## Tech Stack

- **Frontend**:
  - [React](https://reactjs.org/) + [Next.js](https://nextjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/) for styling
- **Backend**:
  - [Hono](https://hono.dev/) as a lightweight web framework
  - [Drizzle ORM](https://orm.drizzle.team/) for database operations
- **AI**:
  - [OpenAI API](https://openai.com/) integration with GPT models
- **Database**:
  - Postgres

## File Structure

```
src/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   └── [[...route]]/
│   │       └── route.ts
├── components/
│   ├── app-sidebar.tsx
│   ├── chat.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   └── tooltip.tsx
├── db/
│   ├── index.ts
│   └── schema.ts
├── hooks/
│   └── use-mobile.ts
├── lib/
│   └── utils.ts
```

## Quick Start

### Prerequisites

- Node.js >= 18
- SQLite Database

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a .env.local file in the project root directory and add the following content:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/my_chat_db"
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
```

### Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## API Reference

### POST `/api/chat`

Send a message and receive an AI reply.

**Request Body:**：

```json
{
  "id": "chatId",
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ]
}
```

**Response (Streaming or complete, depending on implementation):**：

```json
{
  "chatId": "chatId",
  "messages": [
    {
      "role": "assistant",
      "content": "Hi! How can I help you?"
    }
  ]
}
```

### GET `/api/chats`

Get all chat records.

**Response:**：

```json
[
  {
    "chatId": "chatId1",
    "messages": [
      {
        "role": "user",
        "content": "Hello!",
        "createdAt": "2025-05-06T12:00:00Z"
      }
    ]
  }
]
```
