# Voice AI Agent

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991)](https://openai.com/)
[![Composio](https://img.shields.io/badge/Composio-Core-orange)](https://composio.dev/)

> Built with [Composio](https://composio.dev) 🚀

A modern voice-enabled AI agent built with Next.js that lets you have natural conversations with AI using speech recognition and text-to-speech capabilities.

## Features

- **Voice Interaction**: Speak to the AI and get audio responses
- **Real-time Speech Recognition**: Convert speech to text using browser APIs
- **Text-to-Speech**: AI responses are played back as audio
- **Tool Integration**: Powered by Composio for advanced AI capabilities
- **Modern UI**: Clean interface built with Tailwind CSS and Radix UI
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **AI**: OpenAI GPT models via LangChain
- **Tools**: Composio Core for AI agent capabilities
- **Speech**: Web Speech API for recognition and synthesis
- **State Management**: Zustand
- **Animations**: Framer Motion

## Project Structure

```
voice-ai-agent/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat endpoint
│   │   └── tts/           # Text-to-speech endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── chat-header.tsx   # Chat header component
│   ├── chat-input.tsx    # Message input component
│   ├── chat-interface.tsx # Main chat interface
│   ├── chat-messages.tsx # Messages display
│   └── settings-modal.tsx # Settings modal
├── hooks/                # Custom React hooks
│   ├── use-audio.ts      # Audio playback logic
│   ├── use-chat.ts       # Chat state management
│   ├── use-mounted.ts    # Mount detection
│   └── use-speech-recognition.ts # Speech recognition
├── lib/                  # Utility libraries
│   ├── validators/       # Input validation
│   ├── alias-store.ts    # State management
│   ├── constants.ts      # App constants
│   ├── error-handler.ts  # Error handling
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- Composio API key (optional)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd voice-ai-agent
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Add your API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
COMPOSIO_API_KEY=your_composio_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Text Chat**: Type messages in the input field and press Enter
2. **Voice Chat**: Click the microphone button to start voice input
3. **Audio Responses**: Toggle audio playback in the settings
4. **Settings**: Access configuration options via the settings modal

## Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Components

- **ChatInterface**: Main component orchestrating the chat experience
- **useChat**: Manages chat state and API communication
- **useAudio**: Handles text-to-speech functionality
- **useSpeechRecognition**: Manages voice input with debouncing
- **API Routes**: Handle chat processing and TTS generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the Apache License.
