# OpenFinAL — Claude Session Reference

Open-source AI-enabled financial analytics and investing education platform built as an Electron desktop app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron 35.1.5 |
| UI | React 19.1.0 + React Router DOM 7.5.0 |
| Language | TypeScript 5.8.3 (with JSX for View) |
| Database | SQLite via `better-sqlite3` + `sqlite3` |
| Charts | Recharts 2.15.2 |
| Local ML | @xenova/transformers 2.17.2 |
| Credential storage | Keytar (OS keychain) |
| HTTP | Axios + Express proxy (port 3001) |
| Web scraping | Puppeteer 24.6.1 |

---

## Architecture

Clean Architecture layered stack:

```
View (React JSX)
  ↓ calls
Interactor (TypeScript — business logic)
  ↓ calls
Gateway (TypeScript — data access)
  ↓ uses
Entity (TypeScript — data models)
  ↓ reads/writes
SQLite DB / External APIs / OS Keychain
```

**Entry points:**
- `src/main.js` — Electron main process; IPC handlers; Express proxy; DB setup
- `src/preload.js` — Context bridge; exposes `window.*` APIs to renderer
- `src/renderer.js` — React DOM entry
- `src/View/App.jsx` — Root React component (auth state, initialization, dark mode)

---

## Directory Map

```
open-fin-al/src/
├── View/                    React components (see routes below)
│   ├── App.jsx              Root: auth, init, dark mode, accessibility body classes
│   ├── App/
│   │   ├── Loaded.jsx       ALL routes defined here; sidebar nav; hamburger menu
│   │   ├── LoadedLayout.jsx HeaderContext (useHeader hook); skip link; <main id="main-content">
│   │   ├── Configuring.jsx  Initial setup wizard screen
│   │   ├── Preparing.jsx    Loading/preparing screen
│   │   └── UserInfo.jsx     Profile chip + logout button in header toolset
│   ├── Auth/                PIN-based auth (AuthContainer, PinLogin, PinRegister, PinReset)
│   ├── Home.jsx             Dashboard
│   ├── Portfolio.jsx        Portfolio management
│   ├── Stock.jsx            Stock price / trade (TimeSeries)
│   ├── Stock/               TimeSeriesChart, TickerSearchBar, TickerSidePanel
│   ├── Analysis.jsx         Risk analysis
│   ├── StockAnalysis.jsx    Stock comparison
│   ├── News.jsx & News/     News browsing (Browser, Listing, Summary, SearchBar)
│   ├── Learn.jsx            Learning modules list
│   ├── LearningModule/      LearningModuleDetails, LearningModulePage, Slideshow/*
│   ├── Forecast.jsx         Forecasting
│   ├── ForecastFeature.jsx  Forecast features demo
│   ├── ForecastModel.jsx    Forecast model selection
│   ├── BuyReport.jsx        Investment recommendation report
│   ├── Settings.jsx         App configuration
│   ├── Settings/            Row, RowLabel, RowValue sub-components
│   ├── AccessibilitySettings.jsx  Accessibility toggles page
│   ├── Chatbot.jsx & Chatbot/     AI chatbot (ChatbotToggle, ChatbotMessage)
│   ├── Dashboard/           EconomicChart
│   ├── Shared/              SymbolSearchBar.js
│   └── [Chart components]   MovingAVGChart, RSIChart, ROCChart, InvestmentPool, RiskSurvey
│
├── Interactor/              Business logic (all implement IInputBoundary: post/get/put/delete)
│   ├── InitializationInteractor.ts   App init, config/tables creation, data seeding
│   ├── StockInteractor.ts            Stock quotes, history, company lookups
│   ├── PortfolioInteractor.ts        Portfolio CRUD
│   ├── PortfolioTransactionInteractor.ts
│   ├── UserInteractor.ts             User CRUD
│   ├── UserAuthInteractor.ts         PIN register/login/reset
│   ├── OrderInteractor.ts            Trading orders
│   ├── NewsInteractor.ts             News + summarization
│   ├── LearningModuleInteractor.ts   Educational content
│   ├── LanguageModelInteractor.ts    LLM calls (OpenAI / HuggingFace)
│   ├── SecInteractor.ts              SEC XBRL reports
│   ├── FinancialRatioInteractor.ts   Ratio calculations
│   ├── MarketStatusInteractor.ts     Market open/closed status
│   ├── EconomicIndicatorInteractor.ts
│   └── SettingsInteractor.ts         Settings retrieval/updates
│
├── Gateway/
│   ├── Data/
│   │   ├── StockGateway/    AlphaVantage, YFinance, FMP implementations
│   │   ├── NewsGateway/     AlphaVantageNewsGateway
│   │   ├── ReportGateway/   SecAPIGateway (XBRL)
│   │   ├── EconomicGateway/ AlphaVantageEconomicGateway
│   │   ├── RatioGateway/    AlphaVantageRatioGateway
│   │   ├── MarketGateway/   AlphaVantageMarketGateway
│   │   ├── SQLite/          8 gateways: Portfolio, Asset, User, Transaction, Order,
│   │   │                    TableCreation, CompanyLookup, LearningModule
│   │   └── *GatewayFactory.ts  Factory per domain (reads config to pick provider)
│   ├── AI/Model/            OpenAIModelGateway, HuggingFaceModelGateway, factories
│   ├── Request/             JSONRequest (wraps JSON string)
│   └── Response/            JSONResponse, XMLResponse
│
├── Entity/                  Data models (IEntity with fields Map, fillWithRequest, getId)
│   User, Portfolio, Asset, PortfolioTransaction, Order,
│   StockRequest, NewsRequest, SecRequest, LanguageModelRequest,
│   LearningModule, LearningPage, EconomicIndicator, MarketStatus,
│   APIEndpoint, Configuration (+ Section + Option), Field
│
├── Utility/
│   ├── ConfigManager.ts     load/save config; create default config; manage secrets
│   ├── CacheManager.js      Response caching with TTL
│   ├── PinEncryption.ts     PIN hashing for auth
│   ├── RatioCalculator.ts   Financial ratio formulas
│   ├── RequestSplitter.ts   Batch/split large API requests
│   └── XBRL/                XBRL.ts + Parser.ts (SEC report parsing)
│
├── Database/
│   ├── MigrationManager.js  Runs .sql files in /migrations; tracks executed migrations
│   └── migrations/          001_add_user_auth_fields.sql, 002_make_pinHash_not_null.sql
│
└── Asset/
    ├── DB/schema.sql         SQLite schema
    ├── Image/                Logos (logo.png, logo-dark.png, openfinal_logo_no_text.png, etc.)
    ├── Slideshows/           Learning module PPTX files
    └── LearningModulesVoiceovers/  Audio files
```

---

## All Routes (`Loaded.jsx`)

```
/                    Home (Dashboard)
/portfolio           Portfolio management
/price               Stock trading / TimeSeries
/analysis            Risk Analysis
/buy-report          Investment report
/news                News browsing
/learn               Learning module list
/learningModule      Module details
/learningModulePage  Module page / slide
/forecast            Forecasting
/forecast-features   Forecast features
/forecast-models     Forecast model selection
/StockAnalysis       Stock comparison
/settings            Configuration
/accessibility       Accessibility settings
```

All routes are children of `<AppLoadedLayout>` which provides the header and `HeaderContext`.

---

## Key Patterns

### Setting a page header
Every page uses `useHeader()` from `LoadedLayout.jsx`:
```jsx
import { useHeader } from "./App/LoadedLayout";

const { setHeader } = useHeader();
useEffect(() => {
  setHeader({ title: "My Page", icon: "material_icon_name" });
}, [setHeader]);
```

### Loading / saving config
```js
const config = await window.config.load();   // IPC → main.js → reads default.config.json
config.DarkMode = true;
await window.config.save(config);            // IPC → main.js → writes default.config.json
```

Default config shape (defined in `ConfigManager.ts → createConfigIfNotExists()`):
```js
{
  DarkMode: false,
  MarketStatusGateway, StockGateway, StockQuoteGateway,
  NewsGateway, ReportGateway, RatioGateway, EconomicIndicatorGateway,
  ChatbotModel, ChatbotModelSettings: { name, maxTokens, temperature, topP },
  NewsSummaryModel, NewsSummaryModelSettings: { ... },
  UserSettings: { FirstName, LastName },
  AccessibilitySettings: { HighContrast, ReduceMotion, LargeText, EnhancedFocus }
}
```

### Interactor → Gateway call pattern
```ts
// 1. Create entity, fill from request
const entity = new StockRequest();
entity.fillWithRequest(requestModel);

// 2. Create gateway (often via factory reading config)
const factory = new StockGatewayFactory();
const gateway = await factory.createGateway();  // Reads config.StockGateway

// 3. Execute
const results = await gateway.read(entity);

// 4. Return response
const response = new JSONResponse();
response.convertFromEntity(results, false);
return response.response;
```

### Making an IPC/SQLite call from a gateway
```ts
const data = await window.database.SQLiteQuery({ query: "SELECT...", parameters: [id] });
const row  = await window.database.SQLiteGet({ query: "SELECT...", parameters: [id] });
await window.database.SQLiteInsert({ query: "INSERT...", parameters: [...] });
await window.database.SQLiteUpdate({ query: "UPDATE...", parameters: [...] });
await window.database.SQLiteDelete({ query: "DELETE...", parameters: [...] });
```

---

## `window.*` APIs (exposed via preload.js)

| Object | Purpose |
|---|---|
| `window.config` | `load()`, `save(obj)`, `exists()` — config file |
| `window.vault` | `getSecret(key)`, `setSecret(key, val)` — OS keychain |
| `window.database` | `SQLiteQuery`, `SQLiteGet`, `SQLiteInsert`, `SQLiteUpdate`, `SQLiteDelete` |
| `window.yahooFinance` | `chart()`, `search()`, `historical()` |
| `window.exApi` | `get(url)`, `post(url, body)` — SSL-pinned proxy on port 3001 |
| `window.transformers` | `run(model, text)` — local Transformers.js inference |
| `window.file` | `read(path)`, `readBinary(path)` |
| `window.puppetApi` | `getPageText(url)` — Puppeteer web scraping |
| `window.urlWindow` | `open(url)`, `getBodyTextHidden(url)` |
| `window.electronApp` | Electron utility functions |

---

## Authentication

- PIN-based (8 digits), hashed and stored in `User.pinHash` in SQLite
- Session persisted in `localStorage` as key `openfinAL_user`
- `AuthContainer.jsx` → `PinLogin` / `PinRegister` / `PinReset`
- `UserAuthInteractor.ts` handles all auth logic

---

## Accessibility Features (implemented)

Body classes toggled by `App.jsx` on load and by `AccessibilitySettings.jsx` on toggle:

| Body class | Effect |
|---|---|
| `dark-mode` | Dark color scheme (controlled by `config.DarkMode`) |
| `high-contrast` | High-contrast CSS vars (light) or yellow-on-black (+ `dark-mode`) |
| `large-text` | `font-size: 120%` on body |
| `reduce-motion` | Disables all animations/transitions |
| `enhanced-focus` | Larger `outline` + glow on `:focus-visible` elements |

Skip link: `<a href="#main-content" class="skip-link">` in `LoadedLayout.jsx`.
Screen-reader utility: `.sr-only` class in `index.css`.
Toggle switch UI: `.toggle-switch` + `.toggle-slider` classes in `index.css` (used by `AccessibilitySettings.jsx`).

---

## Styling Conventions

- Single global stylesheet: `src/index.css`
- CSS custom properties on `:root` for colors; dark mode overrides on `body.dark-mode`
- Material Icons loaded via `<link>` inside `Loaded.jsx` render method (CDN)
- FontAwesome 4.7 also loaded via CDN link in `Loaded.jsx` (used for hamburger icon)
- Component-specific styles are added to `index.css` (no CSS modules)

Key CSS variables: `--primary-color`, `--accent-color`, `--background-color`,
`--background-color-highlight`, `--background-color-highlight-light`,
`--text-color-dark`, `--text-color-medium`, `--text-color-white`,
`--row-primary-color`, `--row-alternating-color`

---

## Build & Dev

```bash
cd open-fin-al
npm start          # Dev: starts Electron with webpack hot-reload
npm run make       # Production build (platform-specific installer)
npm test           # Jest tests
```

Build tools: Electron Forge 7 + webpack (main + renderer configs).
TypeScript path aliases: `@Entity/*`, `@Interactor/*`, `@Gateway/*` etc. (configured in `tsconfig.json` + `webpack.renderer.config.js`).

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Interactor | `<Domain>Interactor.ts` | `PortfolioInteractor.ts` |
| Gateway | `<Provider><Domain>Gateway.ts` | `AlphaVantageStockGateway.ts` |
| Gateway factory | `<Domain>GatewayFactory.ts` | `StockGatewayFactory.ts` |
| Entity | `<Domain>.ts` (PascalCase) | `Portfolio.ts`, `StockRequest.ts` |
| React pages | `<PageName>.jsx`, default export | `AccessibilitySettings.jsx` |
| React sub-components | Named export or default | `export const SettingsRow` |
