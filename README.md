# 🤖 SilentByte AI Mini — Web Pairing Edition

**SilentByte AI Mini** by Iconic Tech / SilentByte Platforms Inc  
An intelligent WhatsApp AI assistant — now with web-based pairing, just like Queen Ruva Mini.

---

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000` → enter your number → paste the code in WhatsApp.

---

## 🔗 How to Pair

1. Open `http://localhost:3000`
2. Enter your WhatsApp number with country code (e.g. `263716XXXXXX`)
3. Click **Generate Pairing Code**
4. Open WhatsApp → **Settings → Linked Devices → Link a Device → Link with Phone Number**
5. Enter the code → Done! SilentByte AI sends a welcome message ✅

---

## 🧠 AI Features

| Feature | How to use |
|---|---|
| AI Chat | Send any text message — SilentByte responds intelligently |
| Image Generation | Send `gen <prompt>` — e.g. `gen a dragon at sunset` |
| Image Vision | Send an image — SilentByte analyzes it |
| Voice Transcription | Send a voice note — gets transcribed + AI reply |
| Memory | Conversation history persists in `chatbot.json` |
| 4-Hour Reminders | Auto follow-up after 4 hours of inactivity |
| Auto Call Reject | Rejects calls + sends AI text reply |
| Auto Bio Update | Updates your WhatsApp status bio regularly |

---

## 📡 API Endpoints

| Endpoint | Description |
|---|---|
| `GET /` | Web pairing UI |
| `GET /code?number=263...` | Request pairing code |
| `GET /code/active` | List connected sessions |
| `GET /code/ping` | Health check |
| `GET /code/disconnect?number=263...` | Disconnect a session |

---

## 🛠️ Deploy on Render / Railway / Heroku

Set `PORT` env var in your hosting dashboard. The bot auto-reconnects saved sessions on restart.

---

> Built with [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) | MIT License  
> SilentByte AI Model Creator by Iconic Tech
