# Stock Market Indicators & Dynamic Drift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dynamic drift cycles (100 candles), dynamic indicators (Average Cost, P/L per stock, Purchasing Power), and an Accordion-style Help panel to the Stock Market mini-game.

**Architecture:** We will modify `src/stock.js` to manage the new state keys (`totalTicks`, `currentDrifts`, `portfolioCost`). We will update the HTML layout in `src/ui.js` and the dynamic rendering in `stock.js` to show the new data and the accordion panel.

**Tech Stack:** JavaScript, HTML, CSS.

## Global Constraints

- Preserve all existing comments and docstrings.
- Use `All.$id` for DOM queries, no `document.getElementById` due to Shadow DOM.
- Event binding must be programmatic or use `this.getRootNode().getElementById` if inline.

---

### Task 1: Add Dynamic Drift State & Engine Logic

**Files:**
- Modify: `src/stock.js`
- Test: `test/stock.test.js`

**Interfaces:**
- Consumes: Existing `ctx.S.stock` state, `STOCKS` constant.
- Produces: `ctx.S.stock.totalTicks`, `ctx.S.stock.currentDrifts`.

- [ ] **Step 1: Write the failing test**

```javascript
// Add to test/stock.test.js under 'Market Engine Validation'
it('should randomize drift every 100 ticks', () => {
  S.stock.totalTicks = 99;
  S.stock.currentDrifts = { 'CRASH': -0.015 };
  stepPrice('CRASH'); // This makes totalTicks = 100 and triggers drift randomization
  assert.ok(S.stock.totalTicks === 100);
  assert.ok(S.stock.currentDrifts['CRASH'] !== undefined);
  assert.ok(S.stock.currentDrifts['CRASH'] >= -0.02 && S.stock.currentDrifts['CRASH'] <= 0.02);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL on the new drift test.

- [ ] **Step 3: Write minimal implementation**

Modify `src/stock.js` inside `stepPrice(ticker)` function:
```javascript
  ctx.S.stock.totalTicks = (ctx.S.stock.totalTicks || 0) + 1;
  if (!ctx.S.stock.currentDrifts) {
    ctx.S.stock.currentDrifts = {};
    Object.keys(STOCKS).forEach(t => ctx.S.stock.currentDrifts[t] = STOCKS[t].drift);
  }

  // If a full cycle (100 ticks per stock * number of stocks = total ticks, wait! totalTicks increments per stepPrice, which is per ticker. So 100 candles = 100 ticks * 4 tickers = 400 ticks. Or better: track ticks PER ticker, or just use history length? Since history length caps at 30, use totalTicks. Wait, `updateStock` calls `stepPrice` for all tickers. So `totalTicks` across all is `cycles * num_tickers`. Let's just track `ctx.S.stock.candleCount` and increment it once per `updateStock` call!
```
Wait, `updateStock` is called every tick.
Let's modify `updateStock` instead to increment `candleCount`.
```javascript
export function updateStock() {
  ctx.S.stock.candleCount = (ctx.S.stock.candleCount || 0) + 1;
  if (!ctx.S.stock.currentDrifts) {
    ctx.S.stock.currentDrifts = {};
    Object.keys(STOCKS).forEach(t => ctx.S.stock.currentDrifts[t] = STOCKS[t].drift);
  }

  if (ctx.S.stock.candleCount % 100 === 0) {
    Object.keys(STOCKS).forEach(t => {
      // Random drift between -2% and +2% (-0.02 to 0.02)
      ctx.S.stock.currentDrifts[t] = (Math.random() * 0.04) - 0.02;
    });
  }

  Object.keys(STOCKS).forEach(t => {
    stepPrice(t);
  });
  // ...
}
```
Update `stepPrice` to use `ctx.S.stock.currentDrifts[ticker]` instead of `STOCKS[ticker].drift`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/stock.js test/stock.test.js
git commit -m "feat: add dynamic drift cycle every 100 candles"
```

---

### Task 2: Add Dynamic Indicators State & Calculation

**Files:**
- Modify: `src/stock.js`
- Test: `test/stock.test.js`

**Interfaces:**
- Consumes: `buyStock`, `sellStock`.
- Produces: `ctx.S.stock.portfolioCost`.

- [ ] **Step 1: Write the failing test**

```javascript
// Add to test/stock.test.js under 'Trading'
it('should track average cost correctly', () => {
  S.stock.history['CRASH'] = [10];
  buyStock('CRASH', 5); // cost: 50
  assert.equal(S.stock.portfolioCost['CRASH'], 50);
  
  S.stock.history['CRASH'].push(20);
  buyStock('CRASH', 5); // cost: 100. Total cost = 150.
  assert.equal(S.stock.portfolioCost['CRASH'], 150);
  
  sellStock('CRASH', 5); // sold 5. Old shares 10, sold half. Cost becomes 75.
  assert.equal(S.stock.portfolioCost['CRASH'], 75);
  
  sellStock('CRASH', 5); // sold remaining. Cost 0.
  assert.equal(S.stock.portfolioCost['CRASH'], 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL on the new tracking test.

- [ ] **Step 3: Write minimal implementation**

Modify `buyStock` and `sellStock` in `src/stock.js`:
```javascript
export function buyStock(ticker, shares) {
  if (shares <= 0) return false;
  const price = ctx.S.stock.history[ticker][ctx.S.stock.history[ticker].length - 1];
  const cost = price * shares;
  if (ctx.S.stock.balance >= cost) {
    ctx.S.stock.balance -= cost;
    ctx.S.stock.portfolio[ticker] = (ctx.S.stock.portfolio[ticker] || 0) + shares;
    
    if (!ctx.S.stock.portfolioCost) ctx.S.stock.portfolioCost = {};
    ctx.S.stock.portfolioCost[ticker] = (ctx.S.stock.portfolioCost[ticker] || 0) + cost;
    
    return true;
  }
  return false;
}

export function sellStock(ticker, shares) {
  if (shares <= 0 || (ctx.S.stock.portfolio[ticker] || 0) < shares) return false;
  const price = ctx.S.stock.history[ticker][ctx.S.stock.history[ticker].length - 1];
  const revenue = price * shares;
  
  if (!ctx.S.stock.portfolioCost) ctx.S.stock.portfolioCost = {};
  const oldShares = ctx.S.stock.portfolio[ticker];
  const avgCostPerShare = oldShares > 0 ? (ctx.S.stock.portfolioCost[ticker] || 0) / oldShares : 0;
  
  ctx.S.stock.portfolio[ticker] -= shares;
  ctx.S.stock.balance += revenue;
  
  if (ctx.S.stock.portfolio[ticker] === 0) {
    ctx.S.stock.portfolioCost[ticker] = 0;
  } else {
    ctx.S.stock.portfolioCost[ticker] -= (avgCostPerShare * shares);
  }
  
  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/stock.js test/stock.test.js
git commit -m "feat: add portfolio average cost tracking"
```

---

### Task 3: Update stock.js UI with Accordion & New Indicators

**Files:**
- Modify: `src/stock.js`

**Interfaces:**
- Consumes: The UI generation logic in `openStockModal` and `renderStockView`.

- [ ] **Step 1: Write minimal implementation**

Modify `src/stock.js` `updateTradeEst` and HTML templates:
1. Under the stock info area (where "Đang giữ" is), add:
```html
<div style="font-size:11px; margin-top:2px;">Giá vốn: $xxx | Lãi: <span style="color:#22c55e">+$50</span></div>
```
2. In the Sidebar (Tài Khoản & Ký Quỹ), add Purchasing Power:
```html
<div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Sức mua Margin: <span style="color:#a855f7; font-weight: bold;">$xxx</span></div>
```
3. Update the Help Panel HTML to be an Accordion and include the dynamic cycle text:
```html
<div id="stk-help-panel" style="display: none; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 12px; border: 1px solid #475569; margin-bottom: 15px; color: #cbd5e1; font-size: 13px;">
  <!-- Accordion items inside -->
  <details style="margin-bottom: 5px;"><summary style="cursor:pointer; color:#e2e8f0; font-weight:bold;">1. Cơ bản & Luật chơi</summary><p style="margin-top:5px;">...</p></details>
  <details style="margin-bottom: 5px;"><summary style="cursor:pointer; color:#e2e8f0; font-weight:bold;">2. Giải mã Chỉ số</summary><p style="margin-top:5px;">...</p></details>
  <details><summary style="cursor:pointer; color:#e2e8f0; font-weight:bold;">3. Mẹo & Chiến thuật</summary><p style="margin-top:5px;">...</p></details>
</div>
```
4. Add the Cycle Progress indicator to the top bar (next to Tổng TS). `⏳ Mùa: ${ctx.S.stock.candleCount % 100}/100`

- [ ] **Step 2: Run test to verify it passes**

Run: `npm run build`
Manually test the UI to verify data populates without errors.

- [ ] **Step 3: Commit**

```bash
git add src/stock.js
git commit -m "feat: render dynamic indicators and help accordion"
```
