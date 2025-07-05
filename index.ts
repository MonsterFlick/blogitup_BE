
import { serve } from "bun";
import { GoogleGenAI,ApiError } from "@google/genai";
import wav from "wav";
import { Readable } from "stream";



let GEMINI_API_KEY =process.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY:", GEMINI_API_KEY);
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function pcmToWavStream(pcmBuffer: Buffer): Readable {
  const stream = new Readable({
    read() {
      this.push(pcmBuffer);
      this.push(null);
    },
  });

  const wavWriter = new wav.Writer({
    channels: 1,
    sampleRate: 24000,
    bitDepth: 16,
  });

  stream.pipe(wavWriter);
  return wavWriter;
}

serve({
  port: 4000,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/api/tts" && req.method === "POST") {
      console.log("Received /api/tts request");

      try {
        const body = (await req.json()) as { text?: string };
        const { text } = body;

        if (!text || typeof text !== "string" || text.trim().length === 0) {
          console.error("Missing or invalid 'text' in request body.");
          return new Response("Invalid input", {
            status: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        }


        const contentResponse = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "You are an AI that analyzes blog content and provides meaningful insights. " +
                    "Summarize the key takeaways, highlight interesting points, and provide thoughtful observations. " +
                    "Do not simply rephrase the content. Aim to help a curious reader understand the most important and interesting ideas.",
                },
                { text },
              ],
            },
          ],
         });
        const reply =
          contentResponse.candidates?.[0]?.content?.parts?.[0]?.text ??
          "No response.";
        console.log("Gemini reply:", reply);

        const ttsResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [
            {
              parts: [{ text: reply }],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Kore" },
              },
            },
          },
        });

        const base64 =
          ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64) {
          console.error(" No audio from Gemini TTS");
          return new Response("Audio generation failed", {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        }

        const pcmBuffer = Buffer.from(base64, "base64");
        const wavStream = pcmToWavStream(pcmBuffer);
        const chunks: Buffer[] = [];

        await new Promise<void>((resolve, reject) => {
          wavStream.on("data", (chunk) => chunks.push(chunk));
          wavStream.on("end", resolve);
          wavStream.on("error", reject);
        });

        const wavBuffer = Buffer.concat(chunks);
        const audioBase64 = wavBuffer.toString("base64");

        console.log("Responding with text + audio");

        return new Response(
          JSON.stringify({ text: reply, audioBase64 }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      } catch (err) {
        console.error("Error:", err);
      
        if (err instanceof ApiError && err.status === 429) {
          return new Response("You hit your daily Gemini TTS limit. Try again tomorrow or upgrade your plan.", {
            status: 429,
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        }
      
        return new Response("Internal Server Error", {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
      
    }

    console.log("Unknown route:", req.method, url.pathname);
    return new Response("Not Found", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
});

