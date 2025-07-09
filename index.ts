import { serve } from "bun";
import { GoogleGenAI, ApiError } from "@google/genai";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { htmlToText } from "html-to-text";

// Load Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Allow only your FE & localhost
const allowedOrigins = [
  "http://localhost:3000",
  "https://blogitup-fe.vercel.app",
];

// Basic URL validator
function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// Get proper CORS headers
function getCORSHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin || "")
      ? origin!
      : "null",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

serve({
  port: 4000,
  async fetch(req) {
    const origin = req.headers.get("origin");
    const url = new URL(req.url);

    // Handle preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCORSHeaders(origin),
      });
    }

    // -------- /api/fetch-url --------
    if (url.pathname === "/api/fetch-url" && req.method === "GET") {
      const blogUrl = url.searchParams.get("url");

      if (!blogUrl || !isValidHttpUrl(blogUrl)) {
        return new Response(
          JSON.stringify({ error: "Invalid or missing URL" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...getCORSHeaders(origin),
            },
          }
        );
      }

      try {
        const res = await fetch(blogUrl);
        const html = await res.text();
        const dom = new JSDOM(html, { url: blogUrl });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article?.content)
          throw new Error("Unable to parse article");

        const plainText = htmlToText(article.content, {
          wordwrap: false,
          selectors: [
            { selector: "a", options: { ignoreHref: true } },
            { selector: "img", format: "skip" },
            { selector: "h1", options: { uppercase: false } },
          ],
        });

        const cleanedText = plainText
          .replace(new RegExp(`^${article.title}\\s*`, "i"), "")
          .trim()
          .slice(0, 3000);

        return new Response(
          JSON.stringify({ title: article.title, textContent: cleanedText }),
          {
            headers: {
              "Content-Type": "application/json",
              ...getCORSHeaders(origin),
            },
          }
        );
      } catch (err) {
        console.error("Error in /api/fetch-url:", err);
        return new Response(
          JSON.stringify({ error: "Failed to extract blog content" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...getCORSHeaders(origin),
            },
          }
        );
      }
    }

    // -------- /api/tts --------
    if (url.pathname === "/api/tts" && req.method === "POST") {
      try {
        const { text } = (await req.json()) as { text?: string };

        if (!text || typeof text !== "string" || text.trim().length === 0) {
          return new Response("Invalid input", {
            status: 400,
            headers: getCORSHeaders(origin),
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

        return new Response(JSON.stringify({ text: reply }), {
          headers: {
            "Content-Type": "application/json",
            ...getCORSHeaders(origin),
          },
        }
      );
      } catch (err) {
        console.error("TTS Error:", err);

        if (err instanceof ApiError && err.status === 429) {
          return new Response("You hit your daily Gemini TTS limit.", {
            status: 429,
            headers: getCORSHeaders(origin),
          });
        }

        return new Response("Internal Server Error", {
          status: 500,
          headers: getCORSHeaders(origin),
        });
      }
    }

      if (url.pathname === "/api/ping" && req.method === "GET") {
        return new Response("pong ", {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
          },
        });
      }
     return new Response("Not Found", {
      status: 404,
      headers: getCORSHeaders(origin),
    });

    return new Response("Not Found", {
      status: 404,
      headers: getCORSHeaders(origin),
    });
  },
});

console.log("server running at http://localhost:4000");
