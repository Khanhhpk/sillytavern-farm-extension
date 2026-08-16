import { ctx } from './store.js';
import * as All from './all.js';

let stkToastTimer = null;
const stkToast = (msg) => {
  const win = All.$id('stock-win');
  if (!win) return;
  let t = All.$id('stk-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'stk-toast';
    t.style.cssText = `
      position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.85); color: white; padding: 8px 16px; border-radius: 20px;
      font-size: 13px; z-index: 9999; pointer-events: none; opacity: 0; transition: opacity 0.3s;
      white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.5); font-weight: bold;
    `;
    win.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.opacity = '1', 10);
  if (stkToastTimer) clearTimeout(stkToastTimer);
  stkToastTimer = setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => { if(t.style.opacity === '0') t.style.display = 'none'; }, 300);
  }, 2000);
};

export const STOCKS = {
  // ─── BLUE CHIP ─── Safe, low swing, slight downward drift (inflation eats it slowly)
  SIL: {
    name: 'SillyTavern Inc.',
    startPrice: 100,
    color: '#3b82f6',
    // Per-candle volatility (random walk amplitude)
    vol: 0.035,
    // Intrinsic drift per candle — negative = house edge / inflation drag
    drift: -0.0002,
    // How fast trend momentum decays (higher = faster reversion to calm)
    trendDecay: 0.70,
    // Trend noise amplitude
    trendNoise: 0.25,
    // Mean-reversion gravity: kicks in when price strays far from startPrice
    gravityZones: [ { above: 3, pull: -0.20 }, { above: 1.5, pull: -0.08 }, { below: 0.5, pull: 0.12 } ],
    // Hard cap on single candle % swing
    swingCap: 0.08,
  },
  // ─── MID RISK ─── Cyclical, medium swings, neutral drift but larger fees eat you
  FARM: {
    name: 'Nông Sản Farm',
    startPrice: 50,
    color: '#22c55e',
    vol: 0.10,
    drift: 0.001,
    trendDecay: 0.78,
    trendNoise: 0.35,
    gravityZones: [ { above: 6, pull: -0.35 }, { above: 2.5, pull: -0.12 }, { below: 0.35, pull: 0.18 } ],
    swingCap: 0.18,
  },
  // ─── DEGEN ─── Meme/pump-dump, strong negative drift, rare huge spikes, usually bleeds
  CRASH: {
    name: 'Đa Cấp Coin',
    color: '#ef4444',
    startPrice: 10,
    drift: -0.001, // Giảm nhẹ
    vol: 0.22, // 22% swing (crazy volatility)
    trendNoise: 0.5,
    trendDecay: 0.95, // Trends last longer
    gravityZones: [
      { above: 10.0, pull: -0.2 }, // >$100
      { below: 0.05, pull: 0.3 } // <$0.5
    ],
    swingCap: 0.30,
    // Occasional pump event: 3% chance per candle to ignite a strong uptrend
    pumpChance: 0.03,
    pumpStrength: 0.50,
  }
};

let selectedStock = 'SIL';

function fmtMoney(num) {
  if (num === 0) return '0.00';
  const abs = Math.abs(num);
  let res = '';
  if (abs >= 1000) {
    const units = ["", "k", "m", "b", "t", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const tier = Math.floor(Math.log10(abs) / 3);
    if (tier < units.length) {
      res = (abs / Math.pow(10, tier * 3)).toFixed(2) + units[tier];
    } else {
      res = abs.toExponential(2);
    }
  } else {
    res = abs.toFixed(2);
  }
  return (num < 0 ? '-' : '') + res;
}

function fmtPct(p) {
  if (p === 0) return '0.0%';
  const abs = Math.abs(p);
  let str = abs >= 1e6 ? '>' + (1e6).toFixed(0) + '%' : abs.toFixed(1) + '%';
  return (p > 0 ? '+' : '-') + str;
}

// Core per-candle price step — shared by both prefill and interval updates
function stepPrice(t) {
  const S = STOCKS[t];
  const hist = ctx.S.stock.history[t];
  let price = hist[hist.length - 1];
  let trend = ctx.S.stock.trends[t];
  const priceRatio = price / S.startPrice;

  // 1. Trend random walk with per-stock noise
  trend += (Math.random() - 0.5) * S.trendNoise;

  // 2. CRASH: rare pump event — sudden FOMO spike
  if (S.pumpChance && Math.random() < S.pumpChance) {
    trend += S.pumpStrength;
  }

  // 3. Mean-reversion gravity (per-stock zones)
  let gravity = 0;
  for (const zone of S.gravityZones) {
    if (zone.above !== undefined && priceRatio > zone.above) { gravity = zone.pull; break; }
    if (zone.below !== undefined && priceRatio < zone.below) { gravity = zone.pull; break; }
  }
  trend += gravity;

  // 4. Trend decay (momentum fades)
  trend *= S.trendDecay;
  trend = Math.max(-1, Math.min(1, trend));

  let currentDrift = (ctx.S.stock && ctx.S.stock.currentDrifts && ctx.S.stock.currentDrifts[t] !== undefined) ? ctx.S.stock.currentDrifts[t] : S.drift;
  let change = currentDrift + S.vol * ((Math.random() - 0.5) + trend * 0.5);
  //   Note: random range shifted slightly negative (0.48 vs 0.5) → house always has tiny edge
  change = Math.max(-S.swingCap, Math.min(S.swingCap, change));

  let newPrice = Math.max(1, price * (1 + change));
  hist.push(newPrice);
  if (hist.length > 30) hist.shift();
  ctx.S.stock.trends[t] = trend;
}

export function updateMarket(now = Date.now()) {
  if (!ctx.S.stock) return;
  
  if (ctx.S.stock.totalDeposited === undefined) {
    let initialEquity = ctx.S.stock.balance - (ctx.S.stock.debt || 0);
    Object.keys(STOCKS).forEach(t => {
      initialEquity += (ctx.S.stock.portfolio?.[t] || 0) * (ctx.S.stock.history?.[t]?.[0] || STOCKS[t].startPrice);
    });
    ctx.S.stock.totalDeposited = Math.max(0, initialEquity);
    ctx.S.stock.totalWithdrawn = 0;
  }

  Object.keys(STOCKS).forEach(t => {
    if (!ctx.S.stock.history[t]) ctx.S.stock.history[t] = [STOCKS[t].startPrice];
    if (ctx.S.stock.trends[t] === undefined) ctx.S.stock.trends[t] = 0;
    if (ctx.S.stock.portfolio[t] === undefined) ctx.S.stock.portfolio[t] = 0;
    // Prefill 29 candles of history on first open
    while (ctx.S.stock.history[t].length < 30) stepPrice(t);
  });

  if (!ctx.S.stock.currentDrifts) {
    ctx.S.stock.currentDrifts = {};
    // Roll random drift immediately on first setup
    Object.keys(STOCKS).forEach(t => {
      // Fluctuates between -2.0% to +2.0% around the base drift
      ctx.S.stock.currentDrifts[t] = STOCKS[t].drift + (Math.random() * 0.04) - 0.02;
    });
  }

  if (!ctx.S.stock.nextIntervalMs) {
    ctx.S.stock.nextIntervalMs = Math.floor(Math.random() * 160000) + 20000;
  }
  
  let updated = false;
  while (now - ctx.S.stock.lastUpdate >= ctx.S.stock.nextIntervalMs) {
    ctx.S.stock.lastUpdate += ctx.S.stock.nextIntervalMs;

    ctx.S.stock.candleCount = (ctx.S.stock.candleCount || 0) + 1;
    if (ctx.S.stock.candleCount % 100 === 0) {
      Object.keys(STOCKS).forEach(t => {
        // 10% cơ hội nổ "Mùa Cực Đoan" (Extreme Season) với biên độ ±2% thay vì ±1%
        const isExtreme = Math.random() < 0.1;
        const range = isExtreme ? 0.04 : 0.02;
        const offset = isExtreme ? -0.02 : -0.01;
        ctx.S.stock.currentDrifts[t] = STOCKS[t].drift + (Math.random() * range) + offset;
      });
      // Lãi suất vay Margin (1% mỗi mùa 100 nến)
      if (ctx.S.stock.debt && ctx.S.stock.debt > 0) {
        ctx.S.stock.debt *= 1.01;
      }
    }

    Object.keys(STOCKS).forEach(t => {
      stepPrice(t);
      checkAutoOrders(t, ctx.S.stock.history[t][ctx.S.stock.history[t].length - 1]);
    });
    checkMarginCall();
    ctx.S.stock.nextIntervalMs = Math.floor(Math.random() * 160000) + 20000;
    updated = true;
  }
  return updated;
}

export function checkMarginCall() {
  let equity = ctx.S.stock.balance;
  Object.keys(ctx.S.stock.portfolio).forEach(t => {
    const hist = ctx.S.stock.history[t];
    const currentPrice = hist ? hist[hist.length - 1] : 0;
    equity += (ctx.S.stock.portfolio[t] || 0) * currentPrice;
  });
  
  equity -= (ctx.S.stock.debt || 0);
  
  // Margin call if equity falls below 20% of debt
  if (ctx.S.stock.debt > 0 && equity < ctx.S.stock.debt * 0.2) {
    // Liquidate everything
    Object.keys(ctx.S.stock.portfolio).forEach(t => {
      const hist = ctx.S.stock.history[t];
      const currentPrice = hist ? hist[hist.length - 1] : 0;
      ctx.S.stock.balance += (ctx.S.stock.portfolio[t] || 0) * currentPrice;
      ctx.S.stock.portfolio[t] = 0;
    });
    
    // Repay debt
    ctx.S.stock.balance -= ctx.S.stock.debt;
    ctx.S.stock.debt = 0;
    
    if (All.toast) All.toast("⚠️ BỊ CALL MARGIN! Bán tháo toàn bộ tài sản!");
  }
}

export function depositBrokerage(amount) {
  if (amount <= 0 || ctx.S.coins < amount) return false;
  ctx.S.coins -= amount;
  const received = amount * 0.9;
  ctx.S.stock.balance += received;
  ctx.S.stock.totalDeposited = (ctx.S.stock.totalDeposited || 0) + received;
  // Reset session snapshot on new deposit
  ctx.S.stock.session = {
    startTime: Date.now(),
    startBalance: ctx.S.stock.balance,
    startPortfolio: Object.assign({}, ctx.S.stock.portfolio),
    startPrices: Object.keys(STOCKS).reduce((acc, t) => {
      const h = ctx.S.stock.history[t];
      acc[t] = h ? h[h.length - 1] : STOCKS[t].startPrice;
      return acc;
    }, {})
  };
  return true;
}

export function withdrawBrokerage(amount) {
  if (amount <= 0 || ctx.S.stock.balance < amount) return false;
  ctx.S.stock.balance -= amount;
  ctx.S.coins += amount * 0.9;
  ctx.S.stock.totalWithdrawn = (ctx.S.stock.totalWithdrawn || 0) + amount;
  ctx.S.stock.session = {
    startTime: Date.now(),
    startBalance: ctx.S.stock.balance,
    startPortfolio: Object.assign({}, ctx.S.stock.portfolio),
    startPrices: Object.keys(STOCKS).reduce((acc, t) => {
      const h = ctx.S.stock.history[t];
      acc[t] = h ? h[h.length - 1] : STOCKS[t].startPrice;
      return acc;
    }, {})
  };
  return true;
}

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
  const revenue = price * shares * 0.98; // Thuế phí 2%
  
  if (!ctx.S.stock.portfolioCost) ctx.S.stock.portfolioCost = {};
  const oldShares = ctx.S.stock.portfolio[ticker];
  const avgCostPerShare = oldShares > 0 ? (ctx.S.stock.portfolioCost[ticker] || 0) / oldShares : 0;
  
  ctx.S.stock.portfolio[ticker] -= shares;
  if (ctx.S.stock.portfolio[ticker] < 1e-6) ctx.S.stock.portfolio[ticker] = 0;
  ctx.S.stock.balance += revenue;
  
  if (ctx.S.stock.portfolio[ticker] === 0) {
    ctx.S.stock.portfolioCost[ticker] = 0;
  } else {
    ctx.S.stock.portfolioCost[ticker] -= (avgCostPerShare * shares);
  }
  
  return true;
}

export function placeAutoOrder(ticker, type, targetPrice, shares) {
  if (shares <= 0 || targetPrice <= 0 || (ctx.S.stock.portfolio[ticker] || 0) < shares) return false;
  if (!ctx.S.stock.autoOrders) ctx.S.stock.autoOrders = [];
  ctx.S.stock.autoOrders.push({
    id: Date.now().toString() + Math.random().toString(),
    ticker, type, targetPrice, shares, status: 'PENDING'
  });
  return true;
}

export function cancelAutoOrder(id) {
  if (!ctx.S.stock.autoOrders) return false;
  const order = ctx.S.stock.autoOrders.find(o => o.id === id);
  if (order) {
    order.status = 'CANCELED_USER';
    ctx.S.stock.autoOrders = ctx.S.stock.autoOrders.filter(o => o.id !== id);
    return true;
  }
  return false;
}

export function checkAutoOrders(ticker, currentPrice) {
  if (!ctx.S.stock.autoOrders) return;
  const orders = ctx.S.stock.autoOrders.filter(o => o.ticker === ticker && o.status === 'PENDING');
  orders.forEach(order => {
    let triggered = false;
    if (order.type === 'TP' && currentPrice >= order.targetPrice) triggered = true;
    if (order.type === 'SL' && currentPrice <= order.targetPrice) triggered = true;
    
    if (triggered) {
      let sharesToSell = order.shares;
      let portfolioShares = ctx.S.stock.portfolio[ticker] || 0;
      if (portfolioShares <= 0) {
        order.status = 'CANCELED_NO_SHARES';
      } else {
        if (sharesToSell > portfolioShares) sharesToSell = portfolioShares;
        if (sellStock(ticker, sharesToSell)) {
           order.status = 'EXECUTED';
           order.executionPrice = currentPrice;
           order.timestamp = Date.now();
        } else {
           order.status = 'FAILED';
        }
      }
      ctx.S.stock.autoOrders = ctx.S.stock.autoOrders.filter(o => o.id !== order.id);
      if (!ctx.S.stock.orderLogs) ctx.S.stock.orderLogs = [];
      ctx.S.stock.orderLogs.unshift({ ...order });
      if (ctx.S.stock.orderLogs.length > 20) ctx.S.stock.orderLogs.length = 20;
    }
  });
}

export function borrowMargin(amount) {
  if (amount <= 0) return false;
  ctx.S.stock.debt = (ctx.S.stock.debt || 0) + amount;
  ctx.S.stock.balance += amount * 0.98; // 2% upfront fee
  return true;
}

export function repayMargin(amount) {
  if (amount <= 0 || ctx.S.stock.balance < amount || (ctx.S.stock.debt || 0) < amount) return false;
  ctx.S.stock.balance -= amount;
  ctx.S.stock.debt -= amount;
  return true;
}

export function renderStockChart(ticker) {
  const history = ctx.S.stock.history[ticker] || [];
  if (history.length === 0) return '';
  
  const basePrice = STOCKS[ticker].startPrice;
  let minHist = Math.min(...history);
  let maxHist = Math.max(...history);
  
  let range = maxHist - minHist;
  if (range === 0) range = basePrice * 0.01;
  
  const minPrice = Math.max(0, minHist - range * 0.1);
  const maxPrice = maxHist + range * 0.1;
  range = maxPrice - minPrice;
  
  let html = `<div style="display: flex; align-items: flex-end; height: 180px; width: 100%; border-bottom: 2px solid #475569; padding-left: 5px; gap: 4px; position: relative;">`;
  
  // Background grid lines
  html += `
    <div style="position: absolute; top: 25%; left: 0; width: 100%; height: 1px; background: rgba(255,255,255,0.05); pointer-events: none;"></div>
    <div style="position: absolute; top: 50%; left: 0; width: 100%; height: 1px; background: rgba(255,255,255,0.05); pointer-events: none;"></div>
    <div style="position: absolute; top: 75%; left: 0; width: 100%; height: 1px; background: rgba(255,255,255,0.05); pointer-events: none;"></div>
  `;
  
  if (basePrice >= minPrice && basePrice <= maxPrice) {
    const basePct = ((basePrice - minPrice) / range) * 100;
    html += `<div style="position: absolute; bottom: ${basePct}%; left: 0; width: 100%; height: 1px; border-bottom: 1px dashed rgba(234, 179, 8, 0.5); z-index: 1;" title="Giá nền: $${fmtMoney(basePrice)}"></div>`;
  }


  
  for (let i = 0; i < history.length; i++) {
    const price = history[i];
    const prevPrice = i > 0 ? history[i-1] : price;
    const color = price >= prevPrice ? '#22c55e' : '#ef4444';
    
    const lowEnd = Math.min(price, prevPrice);
    const highEnd = Math.max(price, prevPrice);
    
    const bottomPct = ((lowEnd - minPrice) / range) * 100;
    const heightPct = Math.max(1, ((highEnd - lowEnd) / range) * 100);
    
    // Generate deterministic pseudo-wicks
    const seed = price * 10000;
    const wickExtend = (seed % 4) + 1; // 1 to 4 percent wick
    
    html += `
      <div style="flex: 1; min-width: 4px; position: relative; height: 100%;" title="$${fmtMoney(price)}">
        <!-- Wick -->
        <div style="position: absolute; width: 1px; background: ${color}; left: 50%; transform: translateX(-50%); 
                    bottom: ${Math.max(0, bottomPct - wickExtend)}%; height: ${heightPct + wickExtend * 2}%;"></div>
        <!-- Body -->
        <div style="width: 100%; background: ${color}; position: absolute; bottom: ${bottomPct}%; height: ${heightPct}%; border-radius: 1px; z-index: 2;"></div>
      </div>
    `;
  }
  
  html += `</div>`;
  return html;
}

export function openStockModal() {
  if (!ctx.S.stock) return;
  updateMarket();
  
  let currentTradeAmt = "10";
  let currentTransferAmt = "1000";
  const existingTrade = All.$id('stk-trade-amt');
  const existingTransfer = All.$id('stk-transfer-amt');
  if (existingTrade) currentTradeAmt = existingTrade.value;
  if (existingTransfer) currentTransferAmt = existingTransfer.value;
  const activeId = document.activeElement ? document.activeElement.id : null;

  let totalPortfolioValue = 0;
  Object.keys(STOCKS).forEach(t => {
    const price = ctx.S.stock.history[t][ctx.S.stock.history[t].length - 1];
totalPortfolioValue += (ctx.S.stock.portfolio[t] || 0) * price;
  });
  let equity = ctx.S.stock.balance + totalPortfolioValue - (ctx.S.stock.debt || 0);

  const currentPrice = ctx.S.stock.history[selectedStock][ctx.S.stock.history[selectedStock].length - 1];
  const sharesOwned = ctx.S.stock.portfolio[selectedStock] || 0;
  let netInvested = ctx.S.stock.totalDeposited - ctx.S.stock.totalWithdrawn;
  let pl = equity - netInvested;
  let plPercent = netInvested !== 0 ? (pl / Math.abs(netInvested)) * 100 : 0;
  let plColor = pl >= 0 ? '#22c55e' : '#ef4444';
  let debtRatio = equity > 0 ? (((ctx.S.stock.debt || 0) / equity) * 100) : 0;
  let debtRatioColor = debtRatio > 50 ? '#ef4444' : debtRatio > 25 ? '#eab308' : '#22c55e';

  // --- Session stats ---
  const sess = ctx.S.stock.session;
  let sessBlock = '';
  if (sess && sess.startTime) {
    // Current value of session-start portfolio at current prices
    let sessPortfolioNow = 0;
    let sessPortfolioStart = 0;
    Object.keys(STOCKS).forEach(t => {
      const sharesAtStart = sess.startPortfolio[t] || 0;
      const priceNow = ctx.S.stock.history[t][ctx.S.stock.history[t].length - 1];
      const priceStart = sess.startPrices[t] || priceNow;
      sessPortfolioNow  += sharesAtStart * priceNow;
      sessPortfolioStart += sharesAtStart * priceStart;
    });
    // Session equity start = startBalance + portfolio valued at start prices
    const sessEquityStart = sess.startBalance + sessPortfolioStart;
    // Session equity now = current balance + all current portfolio (incl. new buys)
    const sessEquityNow = equity;
    const sessPL = sessEquityNow - sessEquityStart;
    const sessPLPct = sessEquityStart !== 0 ? (sessPL / Math.abs(sessEquityStart)) * 100 : 0;
    const sessColor = sessPL >= 0 ? '#22c55e' : '#ef4444';
    const sessDuration = Date.now() - sess.startTime;
    const sessMins = Math.floor(sessDuration / 60000);
    const sessHours = Math.floor(sessMins / 60);
    const sessLabel = sessHours > 0 ? `${sessHours}h ${sessMins % 60}m` : `${sessMins}m`;
    sessBlock = `
      <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px; border: 1px solid #334155;">
        <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 4px; align-items: center;">
            <span>⚡ Phiên Này</span>
            <button id="stk-reset-sess" title="Ấn giữ 1s để đặt lại mốc lợi nhuận từ số TS hiện tại" style="background: none; border: 1px solid #475569; border-radius: 4px; color: #94a3b8; font-size: 9px; padding: 1px 4px; cursor: pointer; transition: all 0.3s;">🔄</button>
          </div>
          <span style="color: #a855f7; font-weight: bold; margin-right: 10px;">⏳ Mùa: ${(ctx.S.stock.candleCount || 0) % 100}/100 nến</span>
          <span style="color: #475569; font-size: 9px;">${sessLabel} trước</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 6px;">
            <div style="font-size: 9px; color: #64748b;">Vốn ban đầu</div>
            <div style="font-size: 11px; font-weight: bold; color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">$${fmtMoney(sessEquityStart)}</div>
          </div>
          <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 6px;">
            <div style="font-size: 9px; color: #64748b;">Hiện tại</div>
            <div style="font-size: 11px; font-weight: bold; color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">$${fmtMoney(sessEquityNow)}</div>
          </div>
          <div style="text-align: center; background: ${sessColor}18; border: 1px solid ${sessColor}40; padding: 5px; border-radius: 6px; grid-column: span 2;">
            <div style="font-size: 9px; color: #64748b;">Lãi/Lỗ phiên</div>
            <div style="font-size: 14px; font-weight: 800; color: ${sessColor};">${sessPL >= 0 ? '+' : ''}$${fmtMoney(sessPL)} <span style="font-size: 11px;">(${fmtPct(sessPLPct)})</span></div>
          </div>
        </div>
      </div>
    `;
  } else {
    sessBlock = `<div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px; border: 1px dashed #334155; text-align: center; font-size: 11px; color: #475569;">⚡ Nạp tiền lần đầu để theo dõi phiên</div>`;
  }

  let bodyHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; color: #e2e8f0;">
      
      <!-- Top Bar: Portfolio Info (responsive grid) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 6px; background: #1e293b; padding: 10px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 8px;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Tổng TS</div>
          <div style="font-weight: 800; font-size: 15px; color: #a855f7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">$${fmtMoney(equity)}</div>
        </div>
        <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 8px;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Tiền Mặt</div>
          <div style="font-weight: 800; font-size: 15px; color: #22c55e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">$${fmtMoney(ctx.S.stock.balance)}</div>
        </div>
        <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 8px;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Nợ Margin</div>
          <div style="font-weight: 800; font-size: 15px; color: #ef4444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">$${fmtMoney(ctx.S.stock.debt || 0)}</div>
          <div style="font-size: 10px; color: ${debtRatioColor};">${debtRatio.toFixed(1)}% vốn</div>
        </div>
        <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 8px;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Đầu Tư / Rút</div>
          <div style="font-size: 11px; color: #e2e8f0;">
            <span style="color:#eab308">+$${fmtMoney(ctx.S.stock.totalDeposited)}</span><br><span style="color:#06b6d4">-$${fmtMoney(ctx.S.stock.totalWithdrawn)}</span>
          </div>
        </div>
        <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 8px;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Lãi/Lỗ</div>
          <div style="font-weight: 800; font-size: 14px; color: ${plColor}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pl >= 0 ? '+' : ''}$${fmtMoney(pl)}</div>
          <div style="font-size: 10px; color: ${plColor};">${fmtPct(plPercent)}</div>
        </div>
      </div>

      <!-- Help Panel -->
      <div id="stk-help-panel" style="display: none; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 12px; border: 1px solid #475569; margin-bottom: 15px; color: #cbd5e1; font-size: 13px; line-height: 1.5; text-align: left;">
        <details style="margin-bottom: 5px; background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 8px;">
          <summary style="cursor:pointer; color:#e2e8f0; font-weight:bold; list-style: none;">🔰 1. Hướng Dẫn Chơi (Dành cho người mới)</summary>
          <div style="margin-top:8px;">
            <p style="margin-top:0;">Nếu bạn chưa từng chơi chứng khoán, đừng lo! Hãy làm theo 4 bước cơ bản sau:</p>
            <ol style="padding-left: 20px; margin-bottom: 4px;">
              <li style="margin-bottom: 4px;"><b>Nạp tiền:</b> Ở góc trái, nhập số Vàng bạn muốn chơi vào ô trống, rồi bấm <b>"Nạp Tiền"</b> để quy đổi ra Tiền Mặt ($). <i>(Lưu ý: Nạp/Rút sẽ mất 10% phí)</i>.</li>
              <li style="margin-bottom: 4px;"><b>Chọn mã:</b> Nhìn sang khu vực biểu đồ bên phải. Bấm vào các thẻ (VD: <b>SIL, FARM, CRASH</b>) để xem giá của từng loại. Mũi tên xanh/đỏ cho biết giá đang tăng hay giảm so với phiên trước.</li>
              <li style="margin-bottom: 4px;"><b>Mua vào (Bắt đáy):</b> Nhập số lượng cổ phiếu bạn muốn mua vào ô "Số cp", rồi bấm nút <b>MUA</b> màu xanh. Hãy mua khi Giá đang thấp hơn <b>Giá Nền</b> (đường đứt nét màu vàng).</li>
              <li style="margin-bottom: 4px;"><b>Bán ra (Chốt lời):</b> Đợi các nến trên biểu đồ chạy, khi giá tăng cao hơn mức <b>Giá Vốn</b> của bạn, bấm nút <b>BÁN</b> màu đỏ để thu Tiền Mặt ($) về. Sau đó bạn có thể Rút Tiền để đổi ngược ra Vàng!</li>
            </ol>
          </div>
        </details>
        <details style="margin-bottom: 5px; background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 8px;">
          <summary style="cursor:pointer; color:#e2e8f0; font-weight:bold; list-style: none;">🔍 2. Giải mã Các Chỉ Số (Nâng cao)</summary>
          <ul style="padding-left: 20px; margin-top: 8px; margin-bottom: 4px;">
            <li style="margin-bottom: 4px;"><b style="color:#eab308">Giá nền (Base):</b> Giá trị thực của cổ phiếu (Đường đứt nét). Giá càng vọt xa Giá nền, "lực hút" kéo về càng mạnh.</li>
            <li style="margin-bottom: 4px;"><b style="color:#3b82f6">Vol (Biến động):</b> Biên độ dao động tối đa của mỗi phiên (nến). Vol càng to, giá nhảy càng mạnh.</li>
            <li style="margin-bottom: 4px;"><b style="color:#ef4444">Drift (Độ trôi):</b> "Lực đẩy" ngầm định của thị trường. Drift âm nghĩa là về dài hạn cổ phiếu sẽ có xu hướng rớt giá liên tục. <b style="color:#22c55e">Cơ chế thú vị:</b> Drift sẽ xoay chiều ngẫu nhiên mỗi <b>100 nến (1 Mùa)</b>. Hãy nhìn thanh ⏳ Mùa ở góc trên!</li>
            <li style="margin-bottom: 4px;"><b style="color:#a855f7">Giá vốn:</b> Trung bình số tiền bạn đã bỏ ra cho mỗi cổ phiếu đang giữ.</li>
            <li><b style="color:#a855f7">Sức mua Margin:</b> Khi hết Tiền Mặt, bạn có thể vay nợ để tiếp tục đánh lớn (Bấm <b>Vay Margin</b>). Tổng số tiền bạn có thể vay tương đương x2 tổng tài sản hiện có. Sức mua thực tế bằng Tiền Mặt cộng Hạn mức vay còn lại.</li>
          </ul>
        </details>
        <details style="background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 8px;">
          <summary style="cursor:pointer; color:#e2e8f0; font-weight:bold; list-style: none;">💡 3. Cảnh Báo Cháy Tài Khoản (Margin Call)</summary>
          <p style="margin-top:8px; margin-bottom:4px; color:#fca5a5;">Sử dụng đòn bẩy (Margin) là con dao hai lưỡi!</p>
          <ul style="padding-left: 20px; margin-top: 4px; margin-bottom: 4px;">
            <li style="margin-bottom: 4px;">Khi bạn vay nợ, bạn sẽ phải trả lãi 5% mỗi lần bấm Vay.</li>
            <li style="margin-bottom: 4px;">Nếu thị trường lao dốc, Tổng tài sản của bạn sẽ giảm đi.</li>
            <li><b style="color:#ef4444">NẾU TỈ LỆ NỢ VƯỢT QUÁ 80% VỐN:</b> Sàn sẽ tiến hành <b>Call Margin</b>. Toàn bộ cổ phiếu của bạn sẽ bị ép bán tháo tự động ở giá rẻ mạt để siết nợ. Bạn sẽ mất trắng tay!</li>
          </ul>
        </details>
      </div>

      <!-- Main Layout: Sidebar & Content -->
      <div style="display: flex; flex-wrap: wrap; gap: 12px; flex: 1;">
        
        <!-- Left Panel: Banking & Margin -->
        <div style="flex: 1; min-width: 230px; background: #1e293b; padding: 12px; border-radius: 12px; border: 1px solid #334155; display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 13px; font-weight: bold; color: #cbd5e1; border-bottom: 1px solid #334155; padding-bottom: 6px;">Tài Khoản & Ký Quỹ</div>
          
          <div style="background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #1e293b;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <div style="font-size: 12px; color: #94a3b8;">Ví Vàng: <span style="color:#eab308; font-weight: bold;">${fmtMoney(Math.floor(ctx.S.coins))} G</span></div>
              <div style="font-size: 11px; color: #94a3b8;">Sức mua: <span style="color:#a855f7; font-weight: bold;">$${fmtMoney(ctx.S.stock.balance + Math.max(0, (equity * 2) - (ctx.S.stock.debt || 0)))}</span></div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; align-items: center;">
              <input type="number" id="stk-transfer-amt" value="${currentTransferAmt}" style="flex: 1; min-width: 80px; padding: 8px; background: #1e293b; color: #f8fafc; border: 1px solid #475569; border-radius: 6px; font-size: 15px; outline: none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#475569'" />
              <button id="stk-max-deposit" style="background: rgba(59,130,246,0.2); color: #3b82f6; border: 1px solid rgba(59,130,246,0.4); border-radius: 4px; padding: 6px 10px; font-size: 11px; font-weight: bold; cursor: pointer; white-space: nowrap;">ALL G</button>
              <button id="stk-max-withdraw" style="background: rgba(148,163,184,0.2); color: #cbd5e1; border: 1px solid rgba(148,163,184,0.4); border-radius: 4px; padding: 6px 10px; font-size: 11px; font-weight: bold; cursor: pointer; white-space: nowrap;">ALL $</button>
            </div>
            <div style="font-size: 10px; color: #f87171; margin-top: 4px; font-style: italic;">*Phí 10% mỗi lần chuyển đổi</div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button id="stk-deposit" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 9px; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 2px 4px rgba(37,99,235,0.3);">Nạp Tiền</button>
            <button id="stk-withdraw" style="background: #334155; color: white; border: 1px solid #475569; padding: 9px; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer;">Rút Tiền</button>
          </div>

          ${sessBlock}

          <!-- Margin Info -->
          <div style="background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #334155;">
            <div style="font-size: 12px; color: #94a3b8;">Nợ Margin: <span style="color: #ef4444; font-weight: bold;">$${fmtMoney(ctx.S.stock.debt || 0)}</span></div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px; margin-bottom: 8px;">Tỉ lệ nợ/vốn: <span style="color: ${debtRatioColor}; font-weight: bold;">${debtRatio.toFixed(1)}%</span> (call ở 80%)</div>
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
              <button id="stk-max-borrow" style="flex: 1; background: rgba(168,85,247,0.1); color: #a855f7; border: 1px solid rgba(168,85,247,0.3); border-radius: 4px; padding: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">ALL Vay</button>
              <button id="stk-max-repay" style="flex: 1; background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.3); border-radius: 4px; padding: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">ALL Trả</button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: auto;">
            <button id="stk-borrow" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 9px; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 2px 4px rgba(239,68,68,0.3);" title="Vay tiền (Phí 2%)">Vay Margin</button>
            <button id="stk-repay" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 9px; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 2px 4px rgba(16,185,129,0.3);">Trả Margin</button>
          </div>
        </div>

        <!-- Right Panel: Market & Chart -->
        <div style="flex: 2; min-width: 280px; display: flex; flex-direction: column; gap: 10px;">
          
          <!-- Tab Selector -->
          <div style="display: flex; gap: 6px;">
            ${Object.keys(STOCKS).map(t => {
              const isSelected = selectedStock === t;
              const hist = ctx.S.stock.history[t];
              const price = hist[hist.length - 1];
              const prevPrice = hist.length > 1 ? hist[hist.length - 2] : price;
              const chg = price - prevPrice;
              const chgPct = prevPrice !== 0 ? (chg / prevPrice) * 100 : 0;
              const chgColor = chg >= 0 ? '#22c55e' : '#ef4444';
              return `
              <div id="stk-tab-${t}" style="flex: 1; text-align: center; background: ${isSelected ? '#334155' : '#1e293b'}; border: 1px solid ${isSelected ? '#64748b' : '#334155'}; border-radius: 8px; padding: 8px 4px; cursor: pointer; transition: all 0.2s; box-shadow: ${isSelected ? '0 4px 6px rgba(0,0,0,0.2)' : 'none'};">
                <div style="font-weight: 800; color: ${STOCKS[t].color}; font-size: 14px;">${t}</div>
                <div style="font-size: 13px; color: #f8fafc; margin-top: 2px;">$${fmtMoney(price)}</div>
                <div style="font-size: 10px; color: ${chgColor}; margin-top: 1px;">${chg >= 0 ? '▲' : '▼'} ${fmtPct(chgPct)}</div>
                <div style="font-size: 9px; color: #475569; margin-top: 2px;">drift ${((ctx.S.stock.currentDrifts?.[t] ?? STOCKS[t].drift) * 100).toFixed(2)}%/phiên</div>
              </div>
            `}).join('')}
          </div>

          <!-- Chart Panel -->
          <div style="background: #0f172a; padding: 12px; border-radius: 12px; border: 1px solid #334155; flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; z-index: 1; flex-wrap: wrap; gap: 6px;">
              <div>
                <div style="font-weight: 800; font-size: 15px; color: ${STOCKS[selectedStock].color}; white-space: nowrap;">${STOCKS[selectedStock].name}</div>
                <div style="font-size: 11px; color: #94a3b8; display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                  <span>Giá: <strong style="color: #f8fafc;">$${fmtMoney(currentPrice)}</strong></span>
                  <span style="color: #475569;">|</span>
                  <span title="Giá trị thực">Nền: <strong style="color: #eab308;">$${fmtMoney(STOCKS[selectedStock].startPrice)}</strong></span>
                  <span style="color: #475569;">|</span>
                  <span>Vol: ±${(STOCKS[selectedStock].vol * 100).toFixed(1)}%/phiên</span>
                  <span style="color: #475569;">|</span>
                  <span>Drift: ${((ctx.S.stock.currentDrifts?.[selectedStock] ?? STOCKS[selectedStock].drift) * 100).toFixed(2)}%</span>
                </div>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">

                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                  <div style="background: rgba(255,255,255,0.1); padding: 3px 10px; border-radius: 20px; font-size: 11px; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap;">
                    ${fmtMoney(sharesOwned)} cp ($${fmtMoney(sharesOwned * currentPrice)})
                  </div>
                  <div style="font-size:10px; margin-top:3px; color:#cbd5e1; white-space: nowrap;">
                    Vốn: $${fmtMoney(sharesOwned > 0 ? (ctx.S.stock.portfolioCost?.[selectedStock] || 0) / sharesOwned : 0)} | 
                    Lãi: <span style="color:${(sharesOwned * currentPrice) - (ctx.S.stock.portfolioCost?.[selectedStock] || 0) >= 0 ? '#22c55e' : '#ef4444'}">
                      ${(sharesOwned * currentPrice) - (ctx.S.stock.portfolioCost?.[selectedStock] || 0) >= 0 ? '+' : ''}$${fmtMoney((sharesOwned * currentPrice) - (ctx.S.stock.portfolioCost?.[selectedStock] || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            ${renderStockChart(selectedStock)}
          </div>

          <!-- Trading Interface -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; background: #1e293b; padding: 10px; border-radius: 12px; border: 1px solid #334155;">
            <div style="flex: 1 1 140px; display: flex; gap: 5px; align-items: stretch;">
              <input type="number" id="stk-trade-amt" value="${currentTradeAmt}" min="1" style="flex: 1; width: 0; padding: 9px; background: #0f172a; color: #fff; border: 1px solid #475569; border-radius: 6px; font-size: 15px; outline: none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#475569'" placeholder="Số cp" />
              <button id="stk-max-buy" style="background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.4); border-radius: 4px; padding: 0 8px; font-size: 10px; font-weight: bold; cursor: pointer; white-space: nowrap;" title="Mua tối đa">MAX</button>
              <button id="stk-max-sell" style="background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); border-radius: 4px; padding: 0 8px; font-size: 10px; font-weight: bold; cursor: pointer; white-space: nowrap;" title="Bán toàn bộ">ALL</button>
            </div>
            <div style="display: flex; gap: 8px; flex: 2 1 240px;">
              <button id="stk-buy" style="flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 6px 5px; border-radius: 6px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 4px 6px rgba(16,185,129,0.3);">MUA<div style="font-size:10px;font-weight:normal;opacity:0.8;margin-top:2px">$0</div></button>
              <button id="stk-sell" style="flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 6px 5px; border-radius: 6px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 4px 6px rgba(239,68,68,0.3);">BÁN<div style="font-size:10px;font-weight:normal;opacity:0.8;margin-top:2px">$0</div></button>
            </div>
          </div>
          
          <!-- Auto Orders Interface -->
          <div style="background: #1e293b; padding: 10px; border-radius: 12px; border: 1px solid #334155; margin-top: 8px;">
            <div style="font-size: 12px; font-weight: bold; color: #94a3b8; margin-bottom: 6px;">LỆNH TỰ ĐỘNG BÁN (AUTO SELL)</div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch;">
              <div style="flex: 1; min-width: 60px; display: flex; flex-direction: column; gap: 4px;">
                <input type="number" id="stk-auto-amt" min="1" placeholder="Số cp" style="width: 100%; padding: 8px; background: #0f172a; color: #fff; border: 1px solid #475569; border-radius: 6px; font-size: 13px; outline: none; box-sizing: border-box;" />
                <div style="display: flex; gap: 4px;">
                  <button id="stk-auto-btn-14" style="flex: 1; background: #334155; color: #cbd5e1; border: none; border-radius: 4px; font-size: 9px; cursor: pointer; padding: 3px 0;">1/4</button>
                  <button id="stk-auto-btn-12" style="flex: 1; background: #334155; color: #cbd5e1; border: none; border-radius: 4px; font-size: 9px; cursor: pointer; padding: 3px 0;">1/2</button>
                  <button id="stk-auto-btn-all" style="flex: 1; background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); border-radius: 4px; font-size: 9px; font-weight: bold; cursor: pointer; padding: 3px 0;">ALL</button>
                </div>
              </div>
              <input type="number" id="stk-auto-price" min="0.1" step="0.1" placeholder="Giá mục tiêu $" style="flex: 1; min-width: 80px; padding: 8px; background: #0f172a; color: #fff; border: 1px solid #475569; border-radius: 6px; font-size: 13px; outline: none;" />
              <div style="display: flex; gap: 4px; flex: 2; min-width: 140px;">
                <button id="stk-auto-tp" style="flex: 1; background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.4); border-radius: 6px; padding: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">CHỐT LỜI</button>
                <button id="stk-auto-sl" style="flex: 1; background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); border-radius: 6px; padding: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">CẮT LỖ</button>
              </div>
            </div>

            <!-- Auto Orders List & Logs -->
            <div style="margin-top: 10px; border-top: 1px solid #334155; padding-top: 8px; max-height: 120px; overflow-y: auto;">
              <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Danh sách lệnh chờ:</div>
              ${(ctx.S.stock.autoOrders || []).map(o => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 4px; margin-bottom: 4px;">
                  <span style="color: ${o.type === 'TP' ? '#10b981' : '#ef4444'}; font-weight: bold;">${o.type}</span>
                  <span style="color: ${STOCKS[o.ticker].color}; font-weight: bold;">${o.ticker}</span>
                  <span>${fmtMoney(o.shares)} cp</span>
                  <span>@ $${fmtMoney(o.targetPrice)}</span>
                  <button class="stk-auto-cancel" data-id="${o.id}" style="background: none; border: 1px solid #ef4444; color: #ef4444; border-radius: 3px; cursor: pointer; font-size: 9px; padding: 2px 4px;">HỦY</button>
                </div>
              `).join('')}
              ${(ctx.S.stock.autoOrders?.length || 0) === 0 ? `<div style="font-size: 11px; color: #64748b; font-style: italic;">Chưa có lệnh nào.</div>` : ''}

              <div style="font-size: 11px; color: #94a3b8; margin-top: 8px; margin-bottom: 4px;">Lịch sử khớp lệnh:</div>
              ${(ctx.S.stock.orderLogs || []).slice(0, 10).map(l => {
                let statusColor = '#94a3b8';
                if (l.status === 'EXECUTED') statusColor = '#10b981';
                else if (l.status.startsWith('CANCELED')) statusColor = '#ef4444';
                return `
                <div style="display: flex; justify-content: space-between; font-size: 10px; color: #cbd5e1; padding: 2px 0;">
                  <span>${new Date(l.timestamp || Date.now()).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                  <span>${l.type} ${l.ticker} x${fmtMoney(l.shares)}</span>
                  <span style="color: ${statusColor}">${l.status === 'EXECUTED' ? `$${fmtMoney(l.executionPrice)}` : l.status}</span>
                </div>
              `}).join('')}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `;

  const stockWin = All.$id('stock-win');
  const stockView = All.$id('stock-view');
  
  if (stockWin && stockView) {
    const isAlreadyOpen = stockWin.style.display === 'flex';
    const savedScroll = isAlreadyOpen ? stockView.scrollTop : 0;

    All.closeWin();
    stockWin.style.display = 'flex';
    if (All.placeStockWin) All.placeStockWin();
    
    if (!isAlreadyOpen) {
      stockWin.classList.remove('open-anim');
      void stockWin.offsetWidth;
      stockWin.classList.add('open-anim');
    }
    
    stockView.innerHTML = bodyHTML;
    
    if (isAlreadyOpen) {
      stockView.scrollTop = savedScroll;
      if (activeId) {
        const el = All.$id(activeId);
        if (el && typeof el.focus === 'function') el.focus();
      }
    }
    
    All.$id('stock-close').onclick = () => {
      stockWin.style.display = 'none';
      if (All.renderStatus) All.renderStatus();
    };

    if (All.$id('stk-help-btn')) {
      All.$id('stk-help-btn').onclick = (e) => {
        e.stopPropagation();
        const p = All.$id('stk-help-panel');
        if (p) {
          const isHidden = p.style.display === 'none';
          p.style.display = isHidden ? 'block' : 'none';
          window['_stkHelpOpen'] = isHidden;
        }
      };
    }
  } else {
    // Fallback if ui hasn't been updated
    All.openModal('Sàn Chứng Khoán', bodyHTML);
  }
  // Restore help panel state if it was open
  if (All.$id('stk-help-panel') && window['_stkHelpOpen']) {
    All.$id('stk-help-panel').style.display = 'block';
  }

  // Bind Events
  const transferInp = All.$id('stk-transfer-amt');
  if (All.$id('stk-max-deposit')) {
    All.$id('stk-max-deposit').addEventListener('click', () => {
      transferInp.value = Math.floor(ctx.S.coins);
    });
    All.$id('stk-max-withdraw').addEventListener('click', () => {
      transferInp.value = Math.floor(ctx.S.stock.balance);
    });
    All.$id('stk-max-borrow').addEventListener('click', () => {
      let currentEquity = ctx.S.stock.balance + totalPortfolioValue - (ctx.S.stock.debt || 0);
      const maxB = Math.floor((currentEquity * 2) - (ctx.S.stock.debt || 0));
      transferInp.value = maxB > 0 ? maxB : 0;
    });
    All.$id('stk-max-repay').addEventListener('click', () => {
      const maxR = Math.floor(Math.min((ctx.S.stock.debt || 0), ctx.S.stock.balance));
      transferInp.value = maxR > 0 ? maxR : 0;
    });
  }

  // Bind Events
  All.$id('stk-deposit').addEventListener('click', () => {
    const amt = parseFloat(All.$id('stk-transfer-amt').value);
    if (amt > 0 && depositBrokerage(amt)) {
      All.save();
      openStockModal();
      if(All.renderStatus) All.renderStatus();
    } else {
      stkToast("Không đủ Ví Vàng!");
    }
  });

  All.$id('stk-withdraw').addEventListener('click', () => {
    const amt = parseFloat(All.$id('stk-transfer-amt').value);
    if (amt > 0 && withdrawBrokerage(amt)) {
      All.save();
      openStockModal();
      if(All.renderStatus) All.renderStatus();
    } else {
      stkToast("Không đủ tiền trong Tài khoản chứng khoán!");
    }
  });
  
  All.$id('stk-borrow').addEventListener('click', () => {
    const amt = parseFloat(All.$id('stk-transfer-amt').value);
    // Can't borrow more than 2x equity
    let currentEquity = ctx.S.stock.balance + totalPortfolioValue - (ctx.S.stock.debt || 0);
    if (amt > 0 && ((ctx.S.stock.debt || 0) + amt) <= currentEquity * 2) {
      borrowMargin(amt);
      All.save();
      openStockModal();
    } else {
      stkToast("Không thể vay quá 200% Equity!");
    }
  });

  All.$id('stk-repay').addEventListener('click', () => {
    const amt = parseFloat(All.$id('stk-transfer-amt').value);
    if (amt > 0 && repayMargin(amt)) {
      All.save();
      openStockModal();
    } else {
      stkToast("Không đủ tiền mặt hoặc số tiền trả lớn hơn Nợ!");
    }
  });

  const resetSessBtn = All.$id('stk-reset-sess');
  if (resetSessBtn) {
    let holdTimeout;
    const startHold = (e) => {
      if (e.cancelable) e.preventDefault(); // prevent text selection
      resetSessBtn.style.color = '#ef4444';
      resetSessBtn.style.borderColor = '#ef4444';
      holdTimeout = setTimeout(() => {
        resetSessBtn.style.color = '#22c55e';
        resetSessBtn.style.borderColor = '#22c55e';
        
        ctx.S.stock.session = {
          startTime: Date.now(),
          startBalance: ctx.S.stock.balance,
          startPortfolio: Object.assign({}, ctx.S.stock.portfolio),
          startPrices: Object.keys(STOCKS).reduce((acc, t) => {
            const h = ctx.S.stock.history[t];
            acc[t] = h ? h[h.length - 1] : STOCKS[t].startPrice;
            return acc;
          }, {})
        };
        All.save();
        openStockModal();
        stkToast("Đã đặt lại mốc theo dõi Lãi/Lỗ phiên!");
      }, 1000); // 1 second hold
    };
    const endHold = () => {
      clearTimeout(holdTimeout);
      if (All.$id('stk-reset-sess')) {
        All.$id('stk-reset-sess').style.color = '#94a3b8';
        All.$id('stk-reset-sess').style.borderColor = '#475569';
      }
    };
    resetSessBtn.addEventListener('mousedown', startHold);
    resetSessBtn.addEventListener('mouseup', endHold);
    resetSessBtn.addEventListener('mouseleave', endHold);
    resetSessBtn.addEventListener('touchstart', startHold);
    resetSessBtn.addEventListener('touchend', endHold);
  }

  Object.keys(STOCKS).forEach(t => {
    All.$id(`stk-tab-${t}`).addEventListener('click', () => {
      selectedStock = t;
      setTimeout(() => openStockModal(), 10);
    });
  });

  const tradeInp = All.$id('stk-trade-amt');
  
  const updateTradeEst = () => {
    const amt = parseFloat(tradeInp.value) || 0;
    const price = ctx.S.stock.history[selectedStock][ctx.S.stock.history[selectedStock].length - 1];
    const total = amt * price;
    const str = fmtMoney(total);
    
    const buyBtn = All.$id('stk-buy');
    const sellBtn = All.$id('stk-sell');
    if (buyBtn) buyBtn.innerHTML = `MUA<div style="font-size:10px;font-weight:normal;opacity:0.8;margin-top:2px">-$${str}</div>`;
    if (sellBtn) sellBtn.innerHTML = `BÁN<div style="font-size:10px;font-weight:normal;opacity:0.8;margin-top:2px">+$${str}</div>`;
  };

  if (All.$id('stk-max-buy')) {
    All.$id('stk-max-buy').addEventListener('click', () => {
      const price = ctx.S.stock.history[selectedStock][ctx.S.stock.history[selectedStock].length - 1];
      tradeInp.value = Math.floor(ctx.S.stock.balance / price) || 0;
      updateTradeEst();
    });
  }
  if (All.$id('stk-max-sell')) {
    All.$id('stk-max-sell').addEventListener('click', () => {
      tradeInp.value = ctx.S.stock.portfolio[selectedStock] || 0;
      updateTradeEst();
    });
  }
  
  tradeInp.addEventListener('input', updateTradeEst);
  updateTradeEst();

  All.$id('stk-buy').addEventListener('click', () => {
    const shares = parseFloat(All.$id('stk-trade-amt').value);
    if (shares > 0 && buyStock(selectedStock, shares)) {
      All.save();
      openStockModal();
    } else {
      stkToast("Không đủ tiền mặt để mua!");
    }
  });

  All.$id('stk-sell').addEventListener('click', () => {
    const shares = parseFloat(All.$id('stk-trade-amt').value);
    if (shares > 0 && sellStock(selectedStock, shares)) {
      All.save();
      openStockModal();
      stkToast("Đã bán (Khấu trừ 2% Phí)");
    } else {
      stkToast("Không đủ cổ phiếu để bán!");
    }
  });

  const autoAmtInp = All.$id('stk-auto-amt');
  if (All.$id('stk-auto-btn-14')) {
    All.$id('stk-auto-btn-14').addEventListener('click', () => {
      autoAmtInp.value = Math.floor((ctx.S.stock.portfolio[selectedStock] || 0) * 0.25) || 0;
    });
  }
  if (All.$id('stk-auto-btn-12')) {
    All.$id('stk-auto-btn-12').addEventListener('click', () => {
      autoAmtInp.value = Math.floor((ctx.S.stock.portfolio[selectedStock] || 0) * 0.5) || 0;
    });
  }
  if (All.$id('stk-auto-btn-all')) {
    All.$id('stk-auto-btn-all').addEventListener('click', () => {
      autoAmtInp.value = ctx.S.stock.portfolio[selectedStock] || 0;
    });
  }

  if (All.$id('stk-auto-tp')) {
    All.$id('stk-auto-tp').addEventListener('click', () => {
      const shares = parseFloat(All.$id('stk-auto-amt').value);
      const price = parseFloat(All.$id('stk-auto-price').value);
      if (shares > 0 && price > 0 && placeAutoOrder(selectedStock, 'TP', price, shares)) {
        All.save();
        openStockModal();
        stkToast(`Đã đặt lệnh Chốt Lời ${selectedStock}`);
      } else {
        stkToast("Số lượng hoặc Giá không hợp lệ (hoặc không đủ cổ phiếu)!");
      }
    });
  }

  if (All.$id('stk-auto-sl')) {
    All.$id('stk-auto-sl').addEventListener('click', () => {
      const shares = parseFloat(All.$id('stk-auto-amt').value);
      const price = parseFloat(All.$id('stk-auto-price').value);
      if (shares > 0 && price > 0 && placeAutoOrder(selectedStock, 'SL', price, shares)) {
        All.save();
        openStockModal();
        stkToast(`Đã đặt lệnh Cắt Lỗ ${selectedStock}`);
      } else {
        stkToast("Số lượng hoặc Giá không hợp lệ (hoặc không đủ cổ phiếu)!");
      }
    });
  }

  const cancelBtns = stockView.querySelectorAll('.stk-auto-cancel');
  cancelBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (cancelAutoOrder(id)) {
        All.save();
        openStockModal();
        stkToast("Đã hủy lệnh!");
      }
    });
  });


}

setInterval(() => {
  if (!ctx.S || !ctx.S.stock) return;
  if (updateMarket()) {
    All.save();
    const stockWin = All.$id('stock-win');
    if (stockWin && stockWin.style.display === 'flex') {
      openStockModal();
    }
  }
}, 5000);

// Console command: window.FarmAll.resetStock()
export function resetStock() {
  ctx.S.stock = { balance: 0, debt: 0, portfolio: {}, history: {}, trends: {}, lastUpdate: Date.now(), totalDeposited: 0, totalWithdrawn: 0 };
  selectedStock = 'SIL';
  All.save();
  if (stkToast) stkToast('Đã reset Sàn Chứng Khoán về ban đầu!');
  console.log('[Stock] Reset complete.');
}
