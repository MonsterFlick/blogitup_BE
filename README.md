
# 🧠 Blogitup Backend (Bun + Gemini AI)

This is the backend service for the **Blogitup** app, built using **Bun** runtime. It powers:

- Blog content extraction via URL
- Insight generation using Google Gemini AI
- Browser-based TTS compatibility (fallback after removing Gemini TTS due to quota)

---

## 🚀 Deployment

- **Live Backend API**: https://blogitup-be.onrender.com  
- **GitHub Repo**: https://github.com/MonsterFlick/blogitup_BE

---

## 📦 Tech Stack

- ⚡️ [Bun](https://bun.sh) — Superfast JavaScript runtime
- 🤖 [Google Gemini API](https://ai.google.dev/)
- 📄 [JSDOM](https://github.com/jsdom/jsdom) + [Mozilla Readability](https://github.com/mozilla/readability)
- 🔊 Browser SpeechSynthesis — for frontend TTS

---

## 🌐 API Endpoints

### `GET /api/fetch-url?url=YOUR_BLOG_URL`

Extracts meaningful text content from any valid blog/webpage.

**Query Params:**
- `url` — A valid HTTP/HTTPS blog/article URL.

**Returns:**
```json
{
  "title": "Blog Title",
  "textContent": "Cleaned plain text content"
}
````

---

### `POST /api/tts`

Sends blog content to Gemini to generate insights.

**Request Body:**

```json
{
  "text": "Blog or article content"
}
```

**Returns:**

```json
{
  "text": "AI-generated insights"
}
```

> ❗️Note: Gemini TTS was removed due to quota limits. Browser TTS is now used on the frontend.

---

## 🔐 CORS Config

Only these origins are allowed:

* `http://localhost:3000`
* `https://blogitup-fe.vercel.app`

Dynamic CORS headers are set based on `req.headers.get("origin")`.

---

## ⚠️ Error Handling

The backend gracefully handles:

* Invalid URLs
* Blog content not found
* Google Gemini quota issues (429 errors)
* Parsing failures
* General exceptions

---

## ✅ Tested With

The app has been tested with the following blog URLs:

- [Zen Browser: A New Era of Browsing](https://gitfool.vercel.app/blog/zen-browser-a-new-era-of-browsing)
- [Atlas OS: A Lightweight Open Source Windows Mod](https://gitfool.vercel.app/blog/atlas-os-a-lightweight-open-source-windows-mod)
- [Worker Threads in Node.js](https://nodesource.com/blog/worker-threads-nodejs-multithreading-in-javascript)
- [The Advantages of Bun – When to Choose it Over Node.js](https://dev.to/kwamedev/the-advantages-of-bun-when-to-choose-it-over-nodejs-m4m)
- [How The Guardian Uses Deno for Accessibility Audits](https://medium.com/@denoland/how-the-guardian-uses-deno-to-audit-accessibility-and-performance-across-their-2-7-million-articles-97bff7edc22f)

---

## 🛠️ Local Development

### 1. Clone the repo

```bash
git clone https://github.com/MonsterFlick/blogitup_BE
cd blogitup_BE
bun install
```

### 2. Add `.env` file

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

> Get your Gemini API key from: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### 3. Run the server

```bash
bun run index.ts
```

Server will run at `http://localhost:4000`

---

## 📌 Notes

* If you hit Gemini API quota or receive any 429/403 errors not handled, please inform me. I can rotate the API key temporarily.
* Backend uses `wav`, `jsdom`, `html-to-text`, and Gemini's Flash model for summarization.

---

## ✨ Author

**Om Bajirao Thakur**
GitHub: [https://github.com/MonsterFlick](https://github.com/MonsterFlick)

