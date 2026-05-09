# Kri

**Wrap any website. Give it an AI brain. And keep it alive — even when you're asleep.**

Kri turns static, legacy, or simple websites into **autonomous agentic systems** — no rebuild, no framework, no code changes. Just install, configure, and let it run.

## 🤖 What It Does
Kri doesn't just add a chatbot. It turns your website into a **self-sustaining agent**:

- **Listens** to users via chat or click
- **Thinks** using OpenAI, Claude, or local LLMs
- **Acts** — fills forms, clicks buttons, navigates pages
- **Remembers** — keeps context, history, user state
- **Watches** — monitors for downtime, broken UI, price changes
- **Fixes itself** — updates selectors, recovers from layout shifts
- **Runs forever** — as a background daemon, 24/7

Your site doesn't just work. It *lives*.

## 🚀 How It Works

### Installation
```bash
npm install -g kri
# or
npm install kri
```

### Configuration
Create `kri.config.js` or use CLI:
```bash
kri add https://your-website.com
```

### Start the Dashboard
```bash
kri start
# or
npm start
```

Now your site has an AI layer. Access the dashboard at http://localhost:3000.

## 🧭 Architecture
- **Wrapper Engine**: Playwright + overlay injection
- **Agent Layer**: OpenAI/Claude + tool execution
- **Lifeforce**: Daemon that watches & repairs
- **Memory**: SQLite/LevelDB per site
- **Build**: Plain TS → ts-node → no bundlers

## 🔧 Development

### Prerequisites
- Node.js 18+
- Valid OpenAI API key (set in `.env` file)
- Optional: Playwright for browser automation (works in mock mode without)

### Setup
1. Clone the repository
2. Run `npm install`
3. Create `.env` file with:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. Start development server: `npm run dev`

### TypeScript
The codebase is written in TypeScript with strict typing. Run type checking:
```bash
npm run typecheck
```

## 📦 Project Structure
```
├── agent/           # Core agent logic
│   ├── browser.ts   # Browser management (Playwright/mock)
│   ├── executor.ts  # Action execution
│   ├── llm.ts       # LLM integration
│   ├── memory.ts    # Memory/storage
│   └── operator.ts  # Task orchestration
├── daemon/          # Monitoring daemon
├── server/          # Express API server
├── overlay/         # Chat UI overlay
├── injector/        # Platform detection & injection
├── modes/           # Retrofit/scaffold modes
├── bin/             # CLI entry point
└── core/            # Core utilities
```

## 🛠️ How It Works
1. **Add a site**: `kri add https://example.com`
2. **Start dashboard**: `kri start`
3. **Inject overlay**: The overlay chat widget appears on the target site
4. **Execute tasks**: Natural language commands → browser actions
5. **Self-healing**: Daemon monitors DOM changes and repairs selectors

## 🎯 Supported Platforms
- WordPress
- Shopify
- Custom HTML sites

## 🔒 Security
- API keys stored in `.env` files
- Site isolation with separate memory stores
- Mock mode for testing without real browsers

> Kri isn't a plugin. It's a resurrection.
> Your website wasn't broken.
> It just didn't know how to think.
> Now it does.