import { ctx } from './store.js';
import * as All from './all.js';

export const STOCKS = {
  // ─── BLUE CHIP ─── Safe, low swing, slight downward drift (inflation eats it slowly)
  SIL: {
    name: 'SillyTavern Inc.',
    startPrice: 100,
    color: '#3b82f6',
    // Per-candle volatility (random walk amplitude)
    vol: 0.035,
    // Intrinsic drift per candle — negative = house edge / inflation drag
    drift: -0.002,
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
    drift: -0.005,
    trendDecay: 0.78,
    trendNoise: 0.35,
    gravityZones: [ { above: 6, pull: -0.35 }, { above: 2.5, pull: -0.12 }, { below: 0.35, pull: 0.18 } ],
    swingCap: 0.18,
  },
  // ─── DEGEN ─── Meme/pump-dump, strong negative drift, rare huge spikes, usually bleeds
  CRASH: {
    name: 'Đa Cấp Coin',
    startPrice: 10,
    color: '#ef4444',
    vol: 0.22,
    drift: -0.015,
    trendDecay: 0.88,
    trendNoise: 0.55,
    gravityZones: [ { above: 15, pull: -0.55 }, { above: 5, pull: -0.20 }, { below: 0.2, pull: 0.10 } ],
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
  if (abs >= 1e18) res = (abs / 1e18).toFixed(2) + 'Q';
  else if (abs >= 1e15) res = (abs / 1e15).toFixed(2) + 'q';
  else if (abs >= 1e12) res = (abs / 1e12).toFixed(2) + 'T';
  else if (abs >= 1e9)  res = (abs / 1e9).toFixed(2)  + 'B';
  else if (abs >= 1e6)  res = (abs / 1e6).toFixed(2)  + 'M';
  else if (abs >= 1e3)  res = (abs / 1e3).toFixed(2)  + 'K';
  else res = abs.toFixed(2);
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

  // 5. Price change = drift (house edge) + vol * (random + trend bias)
  let change = S.drift + S.vol * ((Math.random() - 0.48) + trend * 0.5);
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

  if (!ctx.S.stock.nextIntervalMs) {
    ctx.S.stock.nextIntervalMs = Math.floor(Math.random() * 180000) + 60000;
  }
  
  while (now - ctx.S.stock.lastUpdate >= ctx.S.stock.nextIntervalMs) {
    ctx.S.stock.lastUpdate += ctx.S.stock.nextIntervalMs;
    Object.keys(STOCKS).forEach(t => stepPrice(t));
    checkMarginCall();
    ctx.S.stock.nextIntervalMs = Math.floor(Math.random() * 180000) + 60000;
  }
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
    ctx.S.stock.portfolio[ticker] += shares;
    return true;
  }
  return false;
}

export function sellStock(ticker, shares) {
  if (shares <= 0 || (ctx.S.stock.portfolio[ticker] || 0) < shares) return false;
  const price = ctx.S.stock.history[ticker][ctx.S.stock.history[ticker].length - 1];
  const revenue = price * shares;
  ctx.S.stock.portfolio[ticker] -= shares;
  ctx.S.stock.balance += revenue;
  return true;
}

export function borrowMargin(amount) {
  if (amount <= 0) return false;
  ctx.S.stock.debt = (ctx.S.stock.debt || 0) + amount;
  ctx.S.stock.balance += amount;
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
  
  const minPrice = Math.min(...history) * 0.9; // add 10% padding
  const maxPrice = Math.max(...history) * 1.1;
  const range = Math.max(0.1, maxPrice - minPrice);
  
  let html = `<div style="display: flex; align-items: flex-end; height: 180px; width: 100%; border-bottom: 2px solid #475569; padding-left: 5px; gap: 4px; position: relative;">`;
  
  // Background grid lines
  html += `
    <div style="position: absolute; top: 25%; left: 0; width: 100%; height: 1px; background: rgba(255,255,255,0.05); pointer-events: none;"></div>
    <div style="position: absolute; top: 50%; left: 0; width: 100%; height: 1px; background: rgba(255,255,255,0.05); pointer-events: none;"></div>
    <div style="position: absolute; top: 75%; left: 0; width: 100%; height: 1px; background: rgba(255,255,255,0.05); pointer-events: none;"></div>
  `;
  
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
          <span>⚡ Phiên Này</span>
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

      <!-- Main Layout: Sidebar & Content -->
      <div style="display: flex; flex-wrap: wrap; gap: 12px; flex: 1;">
        
        <!-- Left Panel: Banking & Margin -->
        <div style="flex: 1; min-width: 230px; background: #1e293b; padding: 12px; border-radius: 12px; border: 1px solid #334155; display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 13px; font-weight: bold; color: #cbd5e1; border-bottom: 1px solid #334155; padding-bottom: 6px;">Ngân Hàng & Khế Ước</div>
          
          <div style="background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #1e293b;">
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Ví Vàng: <span style="color:#eab308; font-weight: bold;">${fmtMoney(Math.floor(ctx.S.coins))} G</span></div>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; align-items: center;">
              <input type="number" id="stk-transfer-amt" value="1000" style="flex: 1; min-width: 80px; padding: 8px; background: #1e293b; color: #f8fafc; border: 1px solid #475569; border-radius: 6px; font-size: 15px; outline: none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#475569'" />
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
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Tỉ lệ nợ/vốn: <span style="color: ${debtRatioColor}; font-weight: bold;">${debtRatio.toFixed(1)}%</span> (call ở 80%)</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: auto;">
            <button id="stk-borrow" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 9px; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 2px 4px rgba(239,68,68,0.3);">Vay Margin</button>
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
                <div style="font-size: 9px; color: #475569; margin-top: 2px;">drift ${(STOCKS[t].drift * 100).toFixed(2)}%/phiên</div>
              </div>
            `}).join('')}
          </div>

          <!-- Chart Panel -->
          <div style="background: #0f172a; padding: 12px; border-radius: 12px; border: 1px solid #334155; flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; z-index: 1; flex-wrap: wrap; gap: 6px;">
              <div>
                <div style="font-weight: 800; font-size: 15px; color: ${STOCKS[selectedStock].color}; white-space: nowrap;">${STOCKS[selectedStock].name}</div>
                <div style="font-size: 11px; color: #94a3b8;">Giá: $${fmtMoney(currentPrice)} | Vol: ±${(STOCKS[selectedStock].vol * 100).toFixed(1)}%/phiên | Drift: ${(STOCKS[selectedStock].drift * 100).toFixed(2)}%</div>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">

                <div style="background: rgba(255,255,255,0.1); padding: 3px 10px; border-radius: 20px; font-size: 11px; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap;">
                  ${fmtMoney(sharesOwned)} cp ($${fmtMoney(sharesOwned * currentPrice)})
                </div>
              </div>
            </div>
            ${renderStockChart(selectedStock)}
          </div>

          <!-- Trading Interface -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; background: #1e293b; padding: 10px; border-radius: 12px; border: 1px solid #334155;">
            <div style="flex: 1; min-width: 100px; display: flex; flex-wrap: wrap; gap: 5px; align-items: center;">
              <input type="number" id="stk-trade-amt" value="10" min="1" style="flex: 1; min-width: 60px; padding: 9px; background: #0f172a; color: #fff; border: 1px solid #475569; border-radius: 6px; font-size: 15px; outline: none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#475569'" placeholder="Số cp" />
              <button id="stk-max-buy" style="background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.4); border-radius: 4px; padding: 6px 8px; font-size: 10px; font-weight: bold; cursor: pointer; white-space: nowrap;" title="Mua tối đa">MAX</button>
              <button id="stk-max-sell" style="background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); border-radius: 4px; padding: 6px 8px; font-size: 10px; font-weight: bold; cursor: pointer; white-space: nowrap;" title="Bán toàn bộ">ALL</button>
            </div>
            <button id="stk-buy" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 15px; cursor: pointer; box-shadow: 0 4px 6px rgba(16,185,129,0.3);">MUA</button>
            <button id="stk-sell" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 15px; cursor: pointer; box-shadow: 0 4px 6px rgba(239,68,68,0.3);">BÁN</button>
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
    const currentScrollHeight = isAlreadyOpen ? stockView.scrollHeight : 0;

    All.closeWin();
    stockWin.style.display = 'flex';
    if (All.placeStockWin) All.placeStockWin();
    
    if (!isAlreadyOpen) {
      stockWin.classList.remove('open-anim');
      void stockWin.offsetWidth;
      stockWin.classList.add('open-anim');
    }
    
    if (isAlreadyOpen) {
      bodyHTML = `<div id="stk-scroll-lock" style="min-height: ${currentScrollHeight}px">${bodyHTML}</div>`;
    }
    
    stockView.innerHTML = bodyHTML;
    
    if (isAlreadyOpen) {
      stockView.scrollTop = savedScroll;
      setTimeout(() => { 
        stockView.scrollTop = savedScroll; 
        const lock = All.$id('stk-scroll-lock');
        if (lock) lock.style.minHeight = '';
      }, 50);
    }
    
    All.$id('stock-close').onclick = () => {
      stockWin.style.display = 'none';
      if (All.renderStatus) All.renderStatus();
    };
  } else {
    // Fallback if ui hasn't been updated
    All.openModal('Sàn Chứng Khoán', bodyHTML);
  }

  const transferInp = All.$id('stk-transfer-amt');
  if (All.$id('stk-max-deposit')) {
    All.$id('stk-max-deposit').addEventListener('click', () => {
      transferInp.value = Math.floor(ctx.S.coins);
    });
  }
  if (All.$id('stk-max-withdraw')) {
    All.$id('stk-max-withdraw').addEventListener('click', () => {
      transferInp.value = Math.floor(ctx.S.stock.balance);
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
      All.toast("Không đủ Ví Vàng!");
    }
  });

  All.$id('stk-withdraw').addEventListener('click', () => {
    const amt = parseFloat(All.$id('stk-transfer-amt').value);
    if (amt > 0 && withdrawBrokerage(amt)) {
      All.save();
      openStockModal();
      if(All.renderStatus) All.renderStatus();
    } else {
      All.toast("Không đủ tiền trong Tài khoản chứng khoán!");
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
      All.toast("Không thể vay quá 200% Equity!");
    }
  });

  All.$id('stk-repay').addEventListener('click', () => {
    const amt = parseFloat(All.$id('stk-transfer-amt').value);
    if (amt > 0 && repayMargin(amt)) {
      All.save();
      openStockModal();
    } else {
      All.toast("Không đủ tiền mặt hoặc số tiền trả lớn hơn Nợ!");
    }
  });

  Object.keys(STOCKS).forEach(t => {
    All.$id(`stk-tab-${t}`).addEventListener('click', () => {
      selectedStock = t;
      setTimeout(() => openStockModal(), 10);
    });
  });

  const tradeInp = All.$id('stk-trade-amt');
  if (All.$id('stk-max-buy')) {
    All.$id('stk-max-buy').addEventListener('click', () => {
      const price = ctx.S.stock.history[selectedStock][ctx.S.stock.history[selectedStock].length - 1];
      tradeInp.value = Math.floor(ctx.S.stock.balance / price) || 0;
    });
  }
  if (All.$id('stk-max-sell')) {
    All.$id('stk-max-sell').addEventListener('click', () => {
      tradeInp.value = ctx.S.stock.portfolio[selectedStock] || 0;
    });
  }

  All.$id('stk-buy').addEventListener('click', () => {
    const shares = parseFloat(All.$id('stk-trade-amt').value);
    if (shares > 0 && buyStock(selectedStock, shares)) {
      All.save();
      openStockModal();
    } else {
      All.toast("Không đủ tiền mặt để mua!");
    }
  });

  All.$id('stk-sell').addEventListener('click', () => {
    const shares = parseFloat(All.$id('stk-trade-amt').value);
    if (shares > 0 && sellStock(selectedStock, shares)) {
      All.save();
      openStockModal();
    } else {
      All.toast("Không đủ cổ phiếu để bán!");
    }
  });


}

// Console command: window.FarmAll.resetStock()
export function resetStock() {
  ctx.S.stock = { balance: 0, debt: 0, portfolio: {}, history: {}, trends: {}, lastUpdate: Date.now(), totalDeposited: 0, totalWithdrawn: 0 };
  selectedStock = 'SIL';
  All.save();
  if (All.toast) All.toast('Đã reset Sàn Chứng Khoán về ban đầu!');
  console.log('[Stock] Reset complete.');
}
