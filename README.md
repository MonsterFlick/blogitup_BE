📦 BlogitUp Backend

This is the backend for the BlogitUp project. It extracts content from a URL or direct text input, summarizes it using Google Gemini API, and returns both text insights and optionally base64-encoded audio (now replaced with browser-native TTS).
🚀 Features

    ✅ URL scraping using JSDOM + Readability

    ✅ Blog text cleaning via html-to-text

    ✅ Gemini API integration for generating insights

    ✅ CORS support for frontend on Vercel + local dev

    ✅ Graceful error handling with proper HTTP responses

    ⚠️ No longer using AI-based audio (TTS now handled in browser)

🧠 How it works

    /api/fetch-url (GET)
    Takes a blog/article URL → scrapes + extracts clean readable text (up to 10,000 chars).

    /api/tts (POST)
    Accepts blog content → sends to Gemini → gets summarized insight text → returns it to frontend.

🔐 Requirements

    Bun runtime

    Google Gemini API key
    You can get it from https://makersuite.google.com/app/apikey

🛠️ Environment Setup

Create a .env file:

GEMINI_API_KEY=your_api_key_here

⚙️ Scripts

bun install       # Install dependencies
bun run index.ts  # Start server on http://localhost:4000

🌐 CORS Allowed Origins

The backend allows requests from:

    http://localhost:3000

    https://blogitup-fe.vercel.app

Feel free to update this in the allowedOrigins array.
## ✅ Tested With

The app has been tested with the following blog URLs:

- [Zen Browser: A New Era of Browsing](https://gitfool.vercel.app/blog/zen-browser-a-new-era-of-browsing)
- [Atlas OS: A Lightweight Open Source Windows Mod](https://gitfool.vercel.app/blog/atlas-os-a-lightweight-open-source-windows-mod)
- [Worker Threads in Node.js](https://nodesource.com/blog/worker-threads-nodejs-multithreading-in-javascript)
- [The Advantages of Bun – When to Choose it Over Node.js](https://dev.to/kwamedev/the-advantages-of-bun-when-to-choose-it-over-nodejs-m4m)
- [How The Guardian Uses Deno for Accessibility Audits](https://medium.com/@denoland/how-the-guardian-uses-deno-to-audit-accessibility-and-performance-across-their-2-7-million-articles-97bff7edc22f)

📁 Repo Structure

blogitup_BE/
├── index.ts           # Bun server with Gemini + CORS
├── .env               # Your API key
├── package.json
└── README.md          # You are here

⚠️ Notes

    If you're hitting API quota (429 Too Many Requests), let the developer know – we’ll rotate the Gemini API key.

    Browser now handles the TTS. No Gemini audio base64 used anymore.


### 🔗 Deployment URLs

* 🌐 **Backend (Render)**:
  [`https://blogitup-be.onrender.com`](https://blogitup-be.onrender.com)

* 💻 **Frontend (Vercel)**:
  [`https://blogitup-fe.vercel.app`](https://blogitup-fe.vercel.app)

* 🧠 **Gemini API Model**:
  `gemini-1.5-flash` (for insights only; TTS removed in favor of browser TTS)

* 🧾 **GitHub - Backend**:
  [`https://github.com/MonsterFlick/blogitup_BE`](https://github.com/MonsterFlick/blogitup_BE)

* 🧾 **GitHub - Frontend**:
  [`https://github.com/MonsterFlick/Blogitup_FE`](https://github.com/MonsterFlick/Blogitup_FE)


