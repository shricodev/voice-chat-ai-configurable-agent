import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { CONFIG } from "@/lib/constants";
import { handleApiError, logError } from "@/lib/error-handler";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return new NextResponse("Text is required", { status: 400 });

    const mp3 = await openai.audio.speech.create({
      model: CONFIG.TTS_MODEL,
      voice: CONFIG.TTS_VOICE,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "content-type": "audio/mpeg",
      },
    });
  } catch (error) {
    logError(error, "API /tts");
    const { statusCode } = handleApiError(error);
    return new NextResponse("Error generating response audio", {
      status: statusCode,
    });
  }
}
