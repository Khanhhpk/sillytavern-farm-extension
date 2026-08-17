# Stock Bankrupt Mechanic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a bankrupt/delisting mechanic where a stock dropping below 10% of its base price for 5 consecutive candles is wiped out, deleting user shares and displaying a persistent report modal.

**Architecture:** We will modify `src/stock.js`. The price evaluation will happen during `stepPrice`, tracking consecutive candles in a new state variable. Bankruptcy triggers a portfolio reset and logs the event. The modal UI will intercept `openStockModal` to show the bankrupt report over the stock interface until acknowledged.

**Tech Stack:** Vanilla JavaScript (ES6+), DOM Manipulation, existing context `ctx.S.stock`.

## Global Constraints

- Never use `document.getElementById(...)`. Always use `All.$id(...)`.
- Bind events programmatically in JS (e.g., `All.$id('my-btn').onclick = ...`).
- Adhere to the existing design choices in `stock.js`.

---

### Task 1: State Initialization & Countdown Logic

**Files:**
- Modify: `src/stock.js:142-146` (Inside `stepPrice`)

**Interfaces:**
- Consumes: `ctx.S.stock`, `STOCKS[t].startPrice`, `newPrice`
- Produces: Updates `ctx.S.stock.bankruptCountdown[t]`

- [ ] **Step 1: Write minimal implementation**
Modify `stepPrice` in `src/stock.js`. At the end of the function where `newPrice` is calculated and pushed to history, add logic to track the 10% threshold.

```javascript
  let newPrice = Math.max(1, price * (1 + change));
  hist.push(newPrice);
  if (hist.length > 30) hist.shift();
  ctx.S.stock.trends[t] = trend;

  // BANKRUPT MECHANIC: 10% threshold
  if (!ctx.S.stock.bankruptCountdown) ctx.S.stock.bankruptCountdown = {};
  if (newPrice < S.startPrice * 0.1) {
    ctx.S.stock.bankruptCountdown[t] = (ctx.S.stock.bankruptCountdown[t] || 0) + 1;
  } else {
    ctx.S.stock.bankruptCountdown[t] = 0;
  }
```

- [ ] **Step 2: Commit**
```bash
git add src/stock.js
git commit -m "feat: add bankrupt countdown tracker to stepPrice"
```

---

### Task 2: Bankruptcy Execution Logic

**Files:**
- Modify: `src/stock.js` (inside `stepPrice` right after the countdown update)

**Interfaces:**
- Consumes: `ctx.S.stock.bankruptCountdown[t]`
- Produces: Resets portfolio, logs to `ctx.S.stock.bankruptLogs`, cancels auto orders, resets price.

- [ ] **Step 1: Write minimal implementation**
Right after the countdown update in `stepPrice`, trigger bankruptcy if countdown reaches 5.

```javascript
  if (ctx.S.stock.bankruptCountdown[t] >= 5) {
    // 1. Log the loss
    if (!ctx.S.stock.bankruptLogs) ctx.S.stock.bankruptLogs = [];
    const sharesLost = ctx.S.stock.portfolio[t] || 0;
    const costLost = (ctx.S.stock.portfolioCost && ctx.S.stock.portfolioCost[t]) ? ctx.S.stock.portfolioCost[t] : 0;
    
    ctx.S.stock.bankruptLogs.push({
      ticker: t,
      shares: sharesLost,
      cost: costLost,
      time: Date.now()
    });

    // 2. Wipe portfolio
    ctx.S.stock.portfolio[t] = 0;
    if (ctx.S.stock.portfolioCost) ctx.S.stock.portfolioCost[t] = 0;
    
    // 3. Cancel auto-orders
    if (ctx.S.stock.autoOrders) {
      ctx.S.stock.autoOrders = ctx.S.stock.autoOrders.filter(o => o.ticker !== t);
    }

    // 4. Reset price and history
    ctx.S.stock.history[t] = [];
    for (let i = 0; i < 30; i++) ctx.S.stock.history[t].push(S.startPrice);
    ctx.S.stock.bankruptCountdown[t] = 0;
    ctx.S.stock.trends[t] = 0;
  }
```

- [ ] **Step 2: Commit**
```bash
git add src/stock.js
git commit -m "feat: execute bankruptcy when countdown reaches 5"
```

---

### Task 3: Bankrupt Report Modal UI

**Files:**
- Modify: `src/stock.js` (inside `openStockModal` at the very end, before attaching listeners or as an overlay inside `stockView.innerHTML`)

**Interfaces:**
- Consumes: `ctx.S.stock.bankruptLogs`
- Produces: An overlay modal that lists bankruptcies and an Acknowledge button.

- [ ] **Step 1: Write minimal implementation**
In `openStockModal`, check if `bankruptLogs` has entries. If so, render a blocking overlay over the main stock UI. Append this string to `bodyHTML` or prepend it.

Find the end of `bodyHTML` string construction in `openStockModal` (around line 900+ where it says `bodyHTML += '</div>';`). 
Append the bankrupt overlay to `bodyHTML`:

```javascript
  if (ctx.S.stock.bankruptLogs && ctx.S.stock.bankruptLogs.length > 0) {
    let logsHtml = ctx.S.stock.bankruptLogs.map(log => {
      const stockName = STOCKS[log.ticker] ? STOCKS[log.ticker].name : log.ticker;
      return \`
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.4); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
          <div style="color: #ef4444; font-weight: bold; font-size: 15px;">\${stockName} (\${log.ticker})</div>
          <div style="color: #cbd5e1; font-size: 13px; margin-top: 4px;">
            Số cổ phiếu mất trắng: <strong style="color: #f8fafc;">\${fmtMoney(log.shares)} cp</strong><br/>
            Tổng thiệt hại (Gốc): <strong style="color: #ef4444;">$\${fmtMoney(log.cost)}</strong>
          </div>
        </div>
      \`;
    }).join('');

    bodyHTML += \`
      <div id="stk-bankrupt-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.95); z-index: 50; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; border-radius: 12px; backdrop-filter: blur(4px);">
        <div style="background: #1e293b; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.8); text-align: left;">
          <h2 style="color: #ef4444; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 24px;">🚨</span> THÔNG BÁO SẬP SÀN
          </h2>
          <div style="color: #94a3b8; font-size: 13px; margin-bottom: 15px;">
            Trong lúc bạn vắng mặt (hoặc vừa qua), các mã cổ phiếu sau đã giảm quá 90% giá trị và chính thức <b>phá sản</b>. Toàn bộ cổ phiếu bị hủy bỏ và giá trị về $0.
          </div>
          <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
            \${logsHtml}
          </div>
          <button id="stk-bankrupt-ack" style="width: 100%; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 15px; cursor: pointer; margin-top: 15px; box-shadow: 0 4px 6px rgba(239,68,68,0.3);">
            TÔI ĐÃ HIỂU (Xóa báo cáo)
          </button>
        </div>
      </div>
    \`;
  }
```

- [ ] **Step 2: Bind Event Listener**
Find where listeners are attached in `openStockModal` (e.g., `All.$id('stock-close').onclick = ...`).
Add the event listener for the Acknowledge button:

```javascript
    const ackBtn = All.$id('stk-bankrupt-ack');
    if (ackBtn) {
      ackBtn.onclick = () => {
        ctx.S.stock.bankruptLogs = [];
        openStockModal(); // Re-render without the overlay
      };
    }
```

- [ ] **Step 3: Commit**
```bash
git add src/stock.js
git commit -m "feat: add bankrupt report overlay modal"
```
