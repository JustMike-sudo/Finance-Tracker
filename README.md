# The Fusion Ledger

**Live demo:** https://justmike-sudo.github.io/Finance-Tracker/

**The Fusion Ledger** is a local-first, offline-capable web application designed to manage a 100% hard-cash economy based on the traditional Japanese **Kakeibo** budgeting method. It features a minimalist, dark-mode Japanese aesthetic and guarantees absolute data privacy by keeping all information securely stored on your local device.

---

## 🌟 Key Features

### 1. Kakeibo Budgeting Method
Manage your monthly finances using four distinct pillars:
- **Survival (🍜):** Essential living expenses (e.g., groceries, transport).
- **Optional (🎁):** Non-essential spending (e.g., eating out, shopping).
- **Culture (🎭):** Enrichment and entertainment (e.g., books, movies).
- **Extra (💎):** Unforeseen or miscellaneous expenses.

### 2. Frictionless 3-Tap Logging
A custom-built, ultra-fast numerical keypad interface allows you to input transaction amounts, assign them to a pillar, and confirm the log in under 3 seconds. 

### 3. Wallet Sync (Reconciliation)
A built-in accountability tool. Count your physical cash and input the amount. If the physical amount is lower than your virtual ledger, the app automatically logs the discrepancy as a "Wallet Mismatch" under your Extra pillar, enforcing financial honesty.

### 4. Run-Rate Projections
Live daily insight engine that calculates your average spend-per-day, projects your end-of-month totals based on current habits, and provides a visual gauge ensuring you stay under your calculated weekly limits.

### 5. End-of-Month Retrospective (The Vault)
A reflection module to review your monthly performance. Compares "Budgeted vs. Actuals" via custom SVG bar charts, and allows you to jot down personal reflections on what went well and what to improve next month before locking the month securely in your archives.

---

### 6. Works Offline & Installs Like an App
A service worker caches the whole app (and its fonts after the first visit), so it opens with no connection. Use "Install" / "Add to Home Screen" in your browser to run it full-screen like a native app.

### 7. Backup, Restore & CSV Export
Because everything lives in your browser, the Vault has a **Backup & Export** panel: download a JSON backup, restore it on another device (files are validated and you confirm before anything is replaced), or export all transactions as CSV for a spreadsheet.

---

## 🛠️ Technical Stack

A small, modular stack with no UI or charting libraries.
- **Framework:** React 19 + Vite 8
- **Routing:** React Router v7 (hash routing, so deep links survive a refresh on static hosting)
- **State Management:** Zustand (with `persist` middleware)
- **Data Storage:** Browser `localStorage` (no backend, no account)
- **Offline:** `vite-plugin-pwa` (Workbox service worker + web app manifest)
- **Testing:** Vitest
- **Styling:** Vanilla CSS with CSS Custom Properties (No bulky CSS frameworks)
- **Charts:** Pure SVG rendering (No charting libraries)
- **Typography:** Google Fonts (Noto Sans JP, JetBrains Mono)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Installation

1. **Clone or Navigate to the Directory:**
   ```bash
   cd fusion-ledger
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173` to start using The Fusion Ledger.

### Test & Lint
```bash
npm test        # run the unit tests once
npm run lint
```

### Build for Production
To generate a highly optimized production build:
```bash
npm run build
```
The compiled files will be located in the `dist/` directory, ready to be served by any static file hosting service.

---

## 📂 Architecture Overview

The codebase is organized modularly to maintain separation of concerns:

```text
src/
├── components/          # Reusable UI components (NumPad, PillarCard, BarChart, BackupPanel)
├── pages/               # Main application views (Home, Budget, Insight, Vault)
├── store/               # Global state management via Zustand (useLedgerStore.js)
├── utils/               # Pure, tested functions
│   ├── calculations.js  #   all budget maths (single source of truth)
│   ├── amountInput.js   #   keypad input and amount formatting
│   ├── backup.js        #   backup validation and CSV export
│   └── dateUtils.js     #   month and week helpers
├── App.jsx              # React Router configuration
├── main.jsx             # React application entry point
└── index.css            # Complete vanilla CSS design system and tokens
```

---

## 🔒 Privacy & Security

**The Fusion Ledger** operates entirely in your browser.
- **No Cloud:** There is no backend and no account. Your financial data is never sent anywhere. (The only network request is loading the Google Fonts typefaces, which are then cached for offline use.)
- **Local Persistence:** All setup configurations, transactions, and reflections are securely stringified and saved directly into your browser's `localStorage`.
- **Data Ownership:** You maintain 100% ownership and control over your financial data at all times.

---

*Designed and developed to bring clarity, mindfulness, and discipline to personal cash management.*
