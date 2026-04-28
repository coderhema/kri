# Kri

Wrap any website. Give it an AI brain. And keep it alive — even when you’re asleep.

Kri turns static, legacy, or simple websites into **autonomous agentic systems** — no rebuild, no framework, no code changes. Just install, configure, and let it run.

---

## 🤖 What It Does
Kri doesn’t just add a chatbot. It turns your website into a **self-sustaining agent**:

- **Listens** to users via chat or click
- **Thinks** using Claude, OpenAI, or local LLMs
- **Acts** — fills forms, clicks buttons, navigates pages
- **Remembers** — keeps context, history, user state
- **Watches** — monitors for downtime, broken UI, price changes
- **Fixes itself** — updates selectors, recovers from layout shifts
- **Runs forever** — as a background daemon, 24/7

Your site doesn’t just work. It *lives*.

---

## 🚀 How It Works
```bash
npm install kri # or pip install kri
```

Create `kri.config.js`:

```js
module.exports = {
  target: "https://your-website.com",
  agent: "claude-3-haiku",
  tools: ["web-scraper", "form-filler", "click-selector", "navigation-tracker"],
  memory: true,
  uiOverlay: true,
  daemon: true,
};
```

Start it:

```bash
kri start
```

Now your site has an AI layer.

---

## 🧭 Architecture
- Wrapper Engine: Playwright + overlay
- Agent Layer: Claude/OpenAI + tools
- Lifeforce: Daemon that watches & repairs
- Memory: SQLite per site
- Build: Plain TS → tsc → no bundlers

---

> Kri isn’t a plugin. It’s a resurrection.
> Your website wasn’t broken.
> It just didn’t know how to think.
> Now it does.