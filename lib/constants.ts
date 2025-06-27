export const CONFIG = {
  SPEECH_DEBOUNCE_MS: 1500,
  MAX_TOOL_ITERATIONS: 10,
  OPENAI_MODEL: "gpt-4o-mini",
  TTS_MODEL: "tts-1",
  TTS_VOICE: "echo" as const,
} as const;

export const SYSTEM_MESSAGES = {
  INTENT_CLASSIFICATION: `You are an intent classification expert. Your job is to
determine if a user's request requires executing an action with a tool (like
sending an email, fetching data, creating a task) or if it's a general
conversational question (like 'hello', 'what is the capital of France?').
    
    - If it's an action, classify as 'TOOL_USE'.
    - If it's a general question or greeting, classify as 'GENERAL_CHAT'.`,

  APP_IDENTIFICATION: (availableApps: string[]) =>
    `You are an expert at identifying which software
applications a user wants to interact with. Given a list of available
applications, determine which ones are relevant to the user's request.

        Available applications: ${availableApps.join(", ")}`,

  ALIAS_MATCHING: (aliasNames: string[]) =>
    `You are a smart assistant that identifies relevant
parameters. Based on the user's message, identify which of the available
aliases are being referred to. Only return the names of the aliases that are
relevant.

Available alias names: ${aliasNames.join(", ")}`,

  TOOL_EXECUTION: `You are a powerful and helpful AI assistant. Your goal is to use the
provided tools to fulfill the user's request completely. You can use multiple
tools in sequence if needed. Once you have finished, provide a clear, concise
summary of what you accomplished.`,

  SUMMARY_GENERATION: `You are a helpful assistant. Your task is to create a brief, friendly,
and conversational summary of the actions that were just completed for the
user. Focus on what was accomplished. Start with a friendly confirmation like
'All set!', 'Done!', or 'Okay!'.`,
} as const;
