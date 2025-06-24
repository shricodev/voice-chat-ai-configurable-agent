import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return new NextResponse("Text is required", { status: 400 });

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "content-type": "audio/mpeg",
      },
    });
  } catch (err) {
    console.error("Error generating response audio:", err);
    return new NextResponse("Error generating response audio", { status: 500 });
  }
}
