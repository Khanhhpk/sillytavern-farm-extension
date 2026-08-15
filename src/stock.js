import { ctx } from './store.js';
import * as All from './all.js';

export const STOCKS = {
  SIL: { name: 'SillyTavern Inc.', baseVolatility: 0.05, startPrice: 100, color: '#3b82f6' },
  FARM: { name: 'Nông Sản Farm', baseVolatility: 0.15, startPrice: 50, color: '#22c55e' },
  CRASH: { name: 'Đa Cấp Coin', baseVolatility: 0.35, startPrice: 10, color: '#ef4444' }
};

let selectedStock = 'SIL';

export function updateMarket(now = Date.now()) {
  if (!ctx.S.stock) return;
  
  Object.keys(STOCKS).forEach(t => {
    if (!ctx.S.stock.history[t]) ctx.S.stock.history[t] = [STOCKS[t].startPrice];
    if (ctx.S.stock.trends[t] === undefined) ctx.S.stock.trends[t] = 0;
    if (ctx.S.stock.portfolio[t] === undefined) ctx.S.stock.portfolio[t] = 0;
    
    if (ctx.S.stock.history[t].length === 1) {
      for (let i = 0; i < 29; i++) {
        let currentPrice = ctx.S.stock.history[t][ctx.S.stock.history[t].length - 1];
        let trend = ctx.S.stock.trends[t] + (Math.random() - 0.5) * 0.5;
        trend = Math.max(-1, Math.min(1, trend)); 
        let changePercent = STOCKS[t].baseVolatility * ((Math.random() - 0.5) + (trend * 0.5));
        if (changePercent < -0.15) trend = -1; 
        if (changePercent > 0.15) trend = 1; 
        let newPrice = Math.max(1, currentPrice * (1 + changePercent));
        ctx.S.stock.history[t].push(newPrice);
        ctx.S.stock.trends[t] = trend;
      }
    }
  });

  const intervals = Math.floor((now - ctx.S.stock.lastUpdate) / 600000); 
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
      <div style="flex: 1; min-width: 4px; position: relative; height: 100%;" title="Giá: $${price.toFixed(2)}">
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

  let bodyHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; gap: 15px; color: #e2e8f0;">
      
      <!-- Top Bar: Portfolio Info -->
      <div style="display: flex; justify-content: space-around; background: #1e293b; padding: 15px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Tổng Tài Sản</div>
          <div style="font-weight: 800; font-size: 20px; color: #a855f7; text-shadow: 0 2px 4px rgba(168,85,247,0.3);">$${equity.toFixed(2)}</div>
        </div>
        <div style="width: 1px; background: #334155;"></div>
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Tiền Mặt</div>
          <div style="font-weight: 800; font-size: 20px; color: #22c55e; text-shadow: 0 2px 4px rgba(34,197,94,0.3);">$${ctx.S.stock.balance.toFixed(2)}</div>
        </div>
        <div style="width: 1px; background: #334155;"></div>
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Nợ Margin</div>
          <div style="font-weight: 800; font-size: 20px; color: #ef4444; text-shadow: 0 2px 4px rgba(239,68,68,0.3);">$${(ctx.S.stock.debt || 0).toFixed(2)}</div>
        </div>
      </div>

      <!-- Main Layout: Sidebar & Content -->
      <div style="display: flex; flex-wrap: wrap; gap: 15px; flex: 1;">
        
        <!-- Left Panel: Banking & Margin -->
        <div style="flex: 1; min-width: 250px; background: #1e293b; padding: 15px; border-radius: 12px; border: 1px solid #334155; display: flex; flex-direction: column; gap: 15px;">
          <div style="font-size: 14px; font-weight: bold; color: #cbd5e1; border-bottom: 1px solid #334155; padding-bottom: 8px;">Ngân Hàng & Khế Ước</div>
          
          <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
            <div style="font-size: 13px; color: #94a3b8; margin-bottom: 5px;">Số dư Ví Vàng: <span style="color:#eab308; font-weight: bold;">${Math.floor(ctx.S.coins)} G</span></div>
            <input type="number" id="stk-transfer-amt" value="1000" style="width:100%; padding: 10px; background: #1e293b; color: #f8fafc; border: 1px solid #475569; border-radius: 6px; font-size: 16px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#475569'" />
            <div style="font-size: 11px; color: #f87171; margin-top: 5px; font-style: italic;">*Phí chuyển đổi liên ngân hàng 10%</div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button id="stk-deposit" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 2px 4px rgba(37,99,235,0.3);">Nạp Tiền</button>
            <button id="stk-withdraw" style="background: #334155; color: white; border: 1px solid #475569; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s;">Rút Tiền</button>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: auto;">
            <button id="stk-borrow" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(239,68,68,0.3);">Vay Margin</button>
            <button id="stk-repay" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(16,185,129,0.3);">Trả Margin</button>
          </div>
        </div>

        <!-- Right Panel: Market & Chart -->
        <div style="flex: 2; min-width: 300px; display: flex; flex-direction: column; gap: 15px;">
          
          <!-- Tab Selector -->
          <div style="display: flex; gap: 8px;">
            ${Object.keys(STOCKS).map(t => {
              const isSelected = selectedStock === t;
              return `
              <div id="stk-tab-${t}" style="flex: 1; text-align: center; background: ${isSelected ? '#334155' : '#1e293b'}; border: 1px solid ${isSelected ? '#64748b' : '#334155'}; border-radius: 8px; padding: 10px; cursor: pointer; transition: all 0.2s; box-shadow: ${isSelected ? '0 4px 6px rgba(0,0,0,0.2)' : 'none'};">
                <div style="font-weight: 800; color: ${STOCKS[t].color}; font-size: 16px;">${t}</div>
                <div style="font-size: 13px; color: #f8fafc; margin-top: 2px;">$${ctx.S.stock.history[t][ctx.S.stock.history[t].length - 1].toFixed(2)}</div>
              </div>
            `}).join('')}
          </div>

          <!-- Chart Panel -->
          <div style="background: #0f172a; padding: 20px; border-radius: 12px; border: 1px solid #334155; flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; z-index: 1;">
              <div style="font-weight: 800; font-size: 18px; color: ${STOCKS[selectedStock].color};">${STOCKS[selectedStock].name}</div>
              <div style="display: flex; gap: 10px;">
                <button id="stk-forward" style="background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.4); padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(168,85,247,0.3)'" onmouseout="this.style.background='rgba(168,85,247,0.2)'" title="Tua nhanh 100 phút (10 phiên)">Tua Nhanh (x10)</button>
                <div style="background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-size: 13px; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2);">
                  Sở hữu: <span style="font-weight: bold; color: #fff;">${sharesOwned}</span> cp ($${(sharesOwned * currentPrice).toFixed(2)})
                </div>
              </div>
            </div>
            ${renderStockChart(selectedStock)}
          </div>

          <!-- Trading Interface -->
          <div style="display: flex; gap: 10px; align-items: center; background: #1e293b; padding: 15px; border-radius: 12px; border: 1px solid #334155;">
            <div style="flex: 1;">
              <input type="number" id="stk-trade-amt" value="10" min="1" style="width:100%; padding: 12px; background: #0f172a; color: #fff; border: 1px solid #475569; border-radius: 6px; font-size: 16px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#475569'" placeholder="Số lượng mua/bán" />
            </div>
            <button id="stk-buy" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 4px 6px rgba(16,185,129,0.3); transition: transform 0.1s;">MUA</button>
            <button id="stk-sell" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 4px 6px rgba(239,68,68,0.3); transition: transform 0.1s;">BÁN</button>
          </div>

          <!-- Time Control -->
          <div style="display: flex; justify-content: flex-end; margin-top: 5px;">
             <button id="stk-forward" style="background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer; transition: background 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">⏩ Tua nhanh 10 phiên (100 phút)</button>
          </div>
          
          
        </div>
      </div>
    </div>
  `;

  const stockWin = All.$id('stock-win');
  const stockView = All.$id('stock-view');
  
  if (stockWin && stockView) {
    All.closeWin();
    stockWin.style.display = 'flex';
    if (All.placeStockWin) All.placeStockWin();
    stockWin.classList.remove('open-anim');
    void stockWin.offsetWidth;
    stockWin.classList.add('open-anim');
    stockView.innerHTML = bodyHTML;
    
    All.$id('stock-close').onclick = () => {
      stockWin.style.display = 'none';
      if (All.renderStatus) All.renderStatus();
    };
  } else {
    // Fallback if ui hasn't been updated
    All.openModal('Sàn Chứng Khoán', bodyHTML);
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

  All.$id('stk-forward').addEventListener('click', () => {
    if (!ctx.S.stock) return;
    // Tua nhanh 100 phút
    ctx.S.stock.lastUpdate -= 600000 * 10;
    updateMarket();
    All.save();
    openStockModal();
    All.toast("Đã tua nhanh 10 phiên giao dịch!");
  });
}
