import { ctx } from './store.js';
import * as All from './all.js';

export const STOCKS = {
  SIL: { name: 'SillyTavern Inc.', baseVolatility: 0.05, startPrice: 100, color: '#3b82f6' },
  FARM: { name: 'Nông Sản Farm', baseVolatility: 0.15, startPrice: 50, color: '#22c55e' },
  CRASH: { name: 'Đa Cấp Coin', baseVolatility: 0.35, startPrice: 10, color: '#ef4444' }
};

let selectedStock = 'SIL';

export function updateMarket() {
  if (!ctx.S.stock) return;
  const now = Date.now();
  const intervals = Math.floor((now - ctx.S.stock.lastUpdate) / 600000); // 10 minutes
  
  // Ensure data structures exist
  Object.keys(STOCKS).forEach(t => {
    if (!ctx.S.stock.history[t]) ctx.S.stock.history[t] = [STOCKS[t].startPrice];
    if (ctx.S.stock.trends[t] === undefined) ctx.S.stock.trends[t] = 0;
    if (ctx.S.stock.portfolio[t] === undefined) ctx.S.stock.portfolio[t] = 0;
  });
  
  if (intervals > 0) {
    ctx.S.stock.lastUpdate += intervals * 600000;

    for (let i = 0; i < intervals; i++) {
      Object.keys(STOCKS).forEach(t => {
        const hist = ctx.S.stock.history[t];
        let currentPrice = hist[hist.length - 1];
        let trend = ctx.S.stock.trends[t];
        
        // Random walk for trend (momentum)
        trend += (Math.random() - 0.5) * 0.5; // -0.25 to 0.25
        trend = Math.max(-1, Math.min(1, trend)); // clamp -1 to 1
        
        // Price fluctuation: Base Volatility * (Random + Trend)
        let changePercent = STOCKS[t].baseVolatility * ((Math.random() - 0.5) + (trend * 0.5));
        
        // Panic / FOMO
        if (changePercent < -0.15) trend = -1; // Panic
        if (changePercent > 0.15) trend = 1; // FOMO

        let newPrice = currentPrice * (1 + changePercent);
        newPrice = Math.max(1, newPrice); // minimum price is 1

        hist.push(newPrice);
        if (hist.length > 30) hist.shift(); // keep last 30
        
        ctx.S.stock.trends[t] = trend;
      });
      
      checkMarginCall(); // check margin every interval
    }
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
  ctx.S.stock.balance += amount * 0.9;
  return true;
}

export function withdrawBrokerage(amount) {
  if (amount <= 0 || ctx.S.stock.balance < amount) return false;
  ctx.S.stock.balance -= amount;
  ctx.S.coins += amount * 0.9;
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
  
  let html = `<div style="display: flex; align-items: flex-end; height: 150px; width: 100%; border-bottom: 2px solid #555; border-left: 2px solid #555; padding-left: 5px; gap: 4px;">`;
  
  for (let i = 0; i < history.length; i++) {
    const price = history[i];
    const prevPrice = i > 0 ? history[i-1] : price;
    const heightPct = ((price - minPrice) / range) * 100;
    const color = price >= prevPrice ? '#22c55e' : '#ef4444';
    
    html += `<div style="flex: 1; min-width: 5px; background: ${color}; height: ${Math.max(1, heightPct)}%; border-radius: 2px 2px 0 0;" title="${price.toFixed(2)}"></div>`;
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

  let bodyHTML = `
    <div style="padding: 10px; background: #1a1a2e; border-radius: 8px; color: #fff;">
      
      <!-- Top Bar: Portfolio Info -->
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 10px;">
        <div style="text-align: center;">
          <div style="font-size: 11px; color: #aaa;">Tổng Tài Sản (Equity)</div>
          <div style="font-weight: bold; color: #a855f7;">$${equity.toFixed(2)}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: #aaa;">Tiền Mặt (Balance)</div>
          <div style="font-weight: bold; color: #22c55e;">$${ctx.S.stock.balance.toFixed(2)}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: #aaa;">Nợ Margin</div>
          <div style="font-weight: bold; color: #ef4444;">$${(ctx.S.stock.debt || 0).toFixed(2)}</div>
        </div>
      </div>

      <!-- Deposit / Withdraw UI -->
      <div style="display: flex; gap: 5px; margin-bottom: 15px; align-items: center; border-bottom: 1px solid #333; padding-bottom: 10px;">
        <div style="flex: 1;">
          <div style="font-size: 11px; color: #aaa;">Ví Vàng (Coins): <span style="color:#eab308">${Math.floor(ctx.S.coins)} G</span></div>
          <input type="number" id="stk-transfer-amt" value="1000" style="width:100%; padding: 4px; background: #2a2a4e; color: #fff; border: 1px solid #444; border-radius: 4px; margin-top: 4px;" />
          <div style="font-size: 10px; color: #ef4444; margin-top: 2px;">*Phí chuyển 10%</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 15px;">
          <div class="buy" id="stk-deposit" style="font-size: 12px; padding: 4px 10px;">Nạp Tiền</div>
          <div class="buy" id="stk-withdraw" style="font-size: 12px; padding: 4px 10px;">Rút Tiền</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 15px;">
          <div class="buy" id="stk-borrow" style="font-size: 12px; padding: 4px 10px; background: #ef4444;">Vay Margin</div>
          <div class="buy" id="stk-repay" style="font-size: 12px; padding: 4px 10px; background: #22c55e;">Trả Margin</div>
        </div>
      </div>

      <!-- Tab Selector -->
      <div style="display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
        ${Object.keys(STOCKS).map(t => `
          <div class="buy" id="stk-tab-${t}" style="flex: 1; text-align: center; ${selectedStock === t ? 'background: #4a5568;' : ''}">
            <div style="font-weight: bold; color: ${STOCKS[t].color}">${t}</div>
            <div style="font-size: 11px;">$${ctx.S.stock.history[t][ctx.S.stock.history[t].length - 1].toFixed(2)}</div>
          </div>
        `).join('')}
      </div>

      <!-- Chart Panel -->
      <div style="margin-bottom: 15px; background: #0f0f1a; padding: 10px; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <div style="font-weight: bold; color: ${STOCKS[selectedStock].color};">${STOCKS[selectedStock].name}</div>
          <div style="font-size: 12px; color: #aaa;">Sở hữu: ${sharesOwned} cp ($${(sharesOwned * currentPrice).toFixed(2)})</div>
        </div>
        ${renderStockChart(selectedStock)}
      </div>

      <!-- Trading Interface -->
      <div style="display: flex; gap: 10px; align-items: center;">
        <div style="flex: 1;">
          <input type="number" id="stk-trade-amt" value="10" min="1" style="width:100%; padding: 8px; background: #2a2a4e; color: #fff; border: 1px solid #444; border-radius: 4px;" placeholder="Số lượng cổ phiếu" />
        </div>
        <div class="buy" id="stk-buy" style="background: #22c55e; padding: 8px 20px; font-weight: bold;">Mua</div>
        <div class="buy" id="stk-sell" style="background: #ef4444; padding: 8px 20px; font-weight: bold;">Bán</div>
      </div>

    </div>
  `;

  All.openModal('Sàn Chứng Khoán', bodyHTML);

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
      openStockModal();
    });
  });

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
