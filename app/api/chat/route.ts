import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OpenAIToolSet } from "composio-core";
import { Alias } from "@/lib/alias-store";
import {
  SystemMessage,
  HumanMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { messageSchema } from "@/lib/validators/message";
import { ChatCompletionMessageToolCall } from "openai/resources/chat/completions.mjs";
import { v4 as uuidv4 } from "uuid";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
});
const toolset = new OpenAIToolSet({ apiKey: process.env.COMPOSIO_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.message,
        },
        { status: 400 },
      );
    }

    const { message, aliases } = parsed.data;
    const isToolUseNeeded = await checkToolUseIntent(message);

    if (!isToolUseNeeded) {
      console.log("handling as a general chat");
      const chatResponse = await llm.invoke([new HumanMessage(message)]);
      return NextResponse.json({
        content: chatResponse.text,
      });
    }

    console.log("Handling as a tool-use request.");
    const availableApps = Object.keys(aliases);
    if (availableApps.length === 0) {
      return NextResponse.json({
        content: `I can't perform any actions yet. Please add some integration
parameters in the settings first.`,
      });
    }

    const targetApps = await identifyTargetApps(message, availableApps);
    if (targetApps.length === 0) {
      return NextResponse.json({
        content: `I can't perform any actions yet. Please add some integration
parameters in the settings first.`,
      });
    }

    console.log("Identified target apps:", targetApps);

    for (const app of targetApps) {
      if (!aliases[app] || aliases[app].length === 0) {
        console.warn(
          `User mentioned app '${app}' but no aliases are configured.`,
        );
        return NextResponse.json({
          content: `To work with ${app}, you first need to add its required
parameters (like a channel ID or URL) in the settings.`,
        });
      }
    }

    const aliasesForTargetApps = targetApps.flatMap(
      (app) => aliases[app] || [],
    );
    const relevantAliases = await findRelevantAliases(
      message,
      aliasesForTargetApps,
    );

    let contextualizedMessage = message;
    if (relevantAliases.length > 0) {
      const contextBlock = relevantAliases
        .map((alias) => `${alias.name} = ${alias.value}`)
        .join("\n");
      contextualizedMessage += `\n\n--- Relevant Parameters ---\n${contextBlock}`;
      console.log("Contextualized message:", contextualizedMessage);
    }

    const finalResponse = await executeToolCallingLogic(
      contextualizedMessage,
      targetApps,
    );
    return NextResponse.json({ content: finalResponse });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { content: `Sorry, I encountered an error: ${errorMessage}` },
      { status: 500 },
    );
  }
}

async function checkToolUseIntent(message: string): Promise<boolean> {
  const intentSchema = z.object({
    intent: z
      .enum(["TOOL_USE", "GENERAL_CHAT"])
      .describe("Classify the user's intent."),
  });

  const structuredLlm = llm.withStructuredOutput(intentSchema);

  const result = await structuredLlm.invoke([
    new SystemMessage(`You are an intent classification expert. Your job is to
determine if a user's request requires executing an action with a tool (like
sending an email, fetching data, creating a task) or if it's a general
conversational question (like 'hello', 'what is the capital of France?').
    
    - If it's an action, classify as 'TOOL_USE'.
    - If it's a general question or greeting, classify as 'GENERAL_CHAT'.`),
    new HumanMessage(message),
  ]);

  return result.intent === "TOOL_USE";
}

async function identifyTargetApps(
  message: string,
  availableApps: string[],
): Promise<string[]> {
  const structuredLlm = llm.withStructuredOutput(
    z.object({
      apps: z.array(z.string()).describe(
        `A list of application names mentioned or implied in the user's
message, from the available apps list.`,
      ),
    }),
  );

  const result = await structuredLlm.invoke([
    new SystemMessage(`You are an expert at identifying which software
applications a user wants to interact with. Given a list of available
applications, determine which ones are relevant to the user's request.

        Available applications: ${availableApps.join(", ")}`),
    new HumanMessage(message),
  ]);

  return result.apps.filter((app) => availableApps.includes(app.toUpperCase()));
}

async function findRelevantAliases(
  message: string,
  aliasesToSearch: Alias[],
): Promise<Alias[]> {
  if (aliasesToSearch.length === 0) return [];

  const aliasNames = aliasesToSearch.map((alias) => alias.name);

  const structuredLlm = llm.withStructuredOutput(
    z.object({
      relevantAliasNames: z.array(z.string()).describe(
        `An array of alias names that are directly mentioned or semantically
related to the user's message.`,
      ),
    }),
  );

  try {
    const result = await structuredLlm.invoke([
      new SystemMessage(`You are a smart assistant that identifies relevant
parameters. Based on the user's message, identify which of the available
aliases are being referred to. Only return the names of the aliases that are
relevant.

Available alias names: ${aliasNames.join(", ")}`),
      new HumanMessage(message),
    ]);

    return aliasesToSearch.filter((alias) =>
      result.relevantAliasNames.includes(alias.name),
    );
  } catch (error) {
    console.error("could not determine relevant aliases:", error);
    return [];
  }
}

async function executeToolCallingLogic(
  contextualizedMessage: string,
  targetApps: string[],
): Promise<string> {
  const composioAppNames = targetApps.map((app) => app.toUpperCase());
  console.log(
    `Fetching Composio tools for apps: ${composioAppNames.join(", ")}...`,
  );

  const tools = await toolset.getTools({ apps: [...composioAppNames] });
  if (tools.length === 0) {
    console.warn("No tools found from Composio for the specified apps.");
    return `I couldn't find any actions for ${targetApps.join(" and ")}. Please
check your Composio connections.`;
  }

  console.log(`Fetched ${tools.length} tools from Composio.`);

  const conversationHistory: BaseMessage[] = [
    new SystemMessage(
      `You are a powerful and helpful AI assistant. Your goal is to use the
provided tools to fulfill the user's request completely. You can use multiple
tools in sequence if needed. Once you have finished, provide a clear, concise
summary of what you accomplished.`,
    ),
    new HumanMessage(contextualizedMessage),
  ];

  // let totalToolsUsed = 0;
  const maxIterations = 10;

  for (let i = 0; i < maxIterations; i++) {
    console.log(`Iteration ${i + 1}: Calling LLM with ${tools.length} tools.`);

    const llmResponse = await llm.invoke(conversationHistory, { tools });
    conversationHistory.push(llmResponse);

    const toolCalls = llmResponse.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      console.log("No tool calls found in LLM response.");
      return llmResponse.text;
    }

    // totalToolsUsed += toolCalls.length;
    const toolOutputs: ToolMessage[] = [];

    for (const toolCall of toolCalls) {
      const composioToolCall: ChatCompletionMessageToolCall = {
        id: toolCall.id || uuidv4(),
        type: "function",
        function: {
          name: toolCall.name,
          arguments: JSON.stringify(toolCall.args),
        },
      };

      try {
        const executionResult = await toolset.executeToolCall(composioToolCall);
        toolOutputs.push(
          new ToolMessage({
            content: executionResult,
            tool_call_id: toolCall.id!,
          }),
        );
      } catch (error) {
        toolOutputs.push(
          new ToolMessage({
            content: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
            tool_call_id: toolCall.id!,
          }),
        );
      }
    }
    conversationHistory.push(...toolOutputs);
  }

  console.log("Generating final summary...");
  const summaryResponse = await llm.invoke([
    new SystemMessage(
      `You are a helpful assistant. Your task is to create a brief, friendly,
and conversational summary of the actions that were just completed for the
user. Focus on what was accomplished. Start with a friendly confirmation like
'All set!', 'Done!', or 'Okay!'.`,
    ),
    new HumanMessage(
      `Based on this conversation history, provide a summary of what was done.
The user's original request is in the first HumanMessage.\n\nConversation
History:\n${JSON.stringify(conversationHistory.slice(0, 4), null, 2)}...`,
    ),
  ]);

  return summaryResponse.text;
}
