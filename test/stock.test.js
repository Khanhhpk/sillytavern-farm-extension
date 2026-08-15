import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ─── Inline stock engine (mirrors stock.js) ────────────────────────────────

const STOCKS = {
  SIL: { name: 'SillyTavern Inc.', baseVolatility: 0.05, startPrice: 100 },
  FARM: { name: 'Nông Sản Farm', baseVolatility: 0.15, startPrice: 50 },
  CRASH: { name: 'Đa Cấp Coin', baseVolatility: 0.35, startPrice: 10 }
};

// We will mock Math.random later, so we expose it via a wrapper.
let randomFn = Math.random;

// Fake state mimicking ctx.S
let S = {};

function updateMarket(now) {
  if (!S.stock) return;
  const intervals = Math.floor((now - S.stock.lastUpdate) / 600000); // 10 minutes
  
  Object.keys(STOCKS).forEach(t => {
    if (!S.stock.history[t]) S.stock.history[t] = [STOCKS[t].startPrice];
    if (S.stock.trends[t] === undefined) S.stock.trends[t] = 0;
    if (S.stock.portfolio[t] === undefined) S.stock.portfolio[t] = 0;
  });
  
  if (intervals > 0) {
    S.stock.lastUpdate += intervals * 600000;
    for (let i = 0; i < intervals; i++) {
      Object.keys(STOCKS).forEach(t => {
        const hist = S.stock.history[t];
        let currentPrice = hist[hist.length - 1];
        let trend = S.stock.trends[t];
        
        trend += (randomFn() - 0.5) * 0.5;
        trend = Math.max(-1, Math.min(1, trend)); 
        
        let changePercent = STOCKS[t].baseVolatility * ((randomFn() - 0.5) + (trend * 0.5));
        
        if (changePercent < -0.15) trend = -1; 
        if (changePercent > 0.15) trend = 1; 

        let newPrice = currentPrice * (1 + changePercent);
        newPrice = Math.max(1, newPrice);

        hist.push(newPrice);
        if (hist.length > 30) hist.shift(); 
        
        S.stock.trends[t] = trend;
      });
      checkMarginCall();
    }
  }
}

function checkMarginCall() {
  let equity = S.stock.balance;
  Object.keys(S.stock.portfolio).forEach(t => {
    const hist = S.stock.history[t];
    const currentPrice = hist ? hist[hist.length - 1] : 0;
    equity += (S.stock.portfolio[t] || 0) * currentPrice;
  });
  
  equity -= (S.stock.debt || 0);
  
  if (S.stock.debt > 0 && equity < S.stock.debt * 0.2) {
    Object.keys(S.stock.portfolio).forEach(t => {
      const hist = S.stock.history[t];
      const currentPrice = hist ? hist[hist.length - 1] : 0;
      S.stock.balance += (S.stock.portfolio[t] || 0) * currentPrice;
      S.stock.portfolio[t] = 0;
    });
    
    S.stock.balance -= S.stock.debt;
    S.stock.debt = 0;
  }
}

function depositBrokerage(amount) {
  if (amount <= 0 || S.coins < amount) return false;
  S.coins -= amount;
  S.stock.balance += amount * 0.9;
  return true;
}

function withdrawBrokerage(amount) {
  if (amount <= 0 || S.stock.balance < amount) return false;
  S.stock.balance -= amount;
  S.coins += amount * 0.9;
  return true;
}

function buyStock(ticker, shares) {
  if (shares <= 0) return false;
  const price = S.stock.history[ticker][S.stock.history[ticker].length - 1];
  const cost = price * shares;
  if (S.stock.balance >= cost) {
    S.stock.balance -= cost;
    S.stock.portfolio[ticker] += shares;
    return true;
  }
  return false;
}

function sellStock(ticker, shares) {
  if (shares <= 0 || (S.stock.portfolio[ticker] || 0) < shares) return false;
  const price = S.stock.history[ticker][S.stock.history[ticker].length - 1];
  const revenue = price * shares;
  S.stock.portfolio[ticker] -= shares;
  S.stock.balance += revenue;
  return true;
}

function borrowMargin(amount) {
  if (amount <= 0) return false;
  S.stock.debt = (S.stock.debt || 0) + amount;
  S.stock.balance += amount;
  return true;
}

function repayMargin(amount) {
  if (amount <= 0 || S.stock.balance < amount || (S.stock.debt || 0) < amount) return false;
  S.stock.balance -= amount;
  S.stock.debt -= amount;
  return true;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Stock Market Module', () => {

  beforeEach(() => {
    S = {
      coins: 10000,
      stock: {
        balance: 1000,
        debt: 0,
        portfolio: { SIL: 0, FARM: 0, CRASH: 0 },
        history: { SIL: [100], FARM: [50], CRASH: [10] },
        trends: { SIL: 0, FARM: 0, CRASH: 0 },
        lastUpdate: 0
      }
    };
    randomFn = Math.random;
  });

  describe('Banking & Margin', () => {
    it('should deduct 10% fee on deposit', () => {
      const success = depositBrokerage(1000);
      assert.equal(success, true);
      assert.equal(S.coins, 9000);
      assert.equal(S.stock.balance, 1900); // 1000 + (1000 * 0.9)
    });

    it('should deduct 10% fee on withdraw', () => {
      const success = withdrawBrokerage(1000);
      assert.equal(success, true);
      assert.equal(S.stock.balance, 0);
      assert.equal(S.coins, 10900); // 10000 + (1000 * 0.9)
    });

    it('should reject negative amounts in banking', () => {
      assert.equal(depositBrokerage(-100), false);
      assert.equal(withdrawBrokerage(-100), false);
      assert.equal(S.coins, 10000);
      assert.equal(S.stock.balance, 1000);
    });

    it('should handle borrow and repay margin', () => {
      assert.equal(borrowMargin(500), true);
      assert.equal(S.stock.debt, 500);
      assert.equal(S.stock.balance, 1500);

      assert.equal(repayMargin(200), true);
      assert.equal(S.stock.debt, 300);
      assert.equal(S.stock.balance, 1300);
    });

    it('should reject invalid repay amounts', () => {
      borrowMargin(500);
      // Not enough balance (if balance is drained)
      S.stock.balance = 0;
      assert.equal(repayMargin(200), false);
      
      // Too much (more than debt)
      S.stock.balance = 2000;
      assert.equal(repayMargin(1000), false);
      
      // Negative
      assert.equal(repayMargin(-100), false);
    });
  });

  describe('Trading', () => {
    it('should buy stock correctly', () => {
      const success = buyStock('SIL', 5); // cost: 500
      assert.equal(success, true);
      assert.equal(S.stock.balance, 500);
      assert.equal(S.stock.portfolio['SIL'], 5);
    });

    it('should reject buying with insufficient funds', () => {
      const success = buyStock('SIL', 20); // cost: 2000
      assert.equal(success, false);
      assert.equal(S.stock.balance, 1000);
      assert.equal(S.stock.portfolio['SIL'], 0);
    });

    it('should sell stock correctly', () => {
      S.stock.portfolio['FARM'] = 10;
      const success = sellStock('FARM', 4); // revenue: 200
      assert.equal(success, true);
      assert.equal(S.stock.balance, 1200);
      assert.equal(S.stock.portfolio['FARM'], 6);
    });

    it('should reject selling more than owned or negative', () => {
      S.stock.portfolio['FARM'] = 10;
      assert.equal(sellStock('FARM', 11), false);
      assert.equal(sellStock('FARM', -5), false);
      assert.equal(buyStock('FARM', -5), false);
    });
  });

  describe('Market Engine', () => {
    it('should update prices based on time intervals', () => {
      updateMarket(600000 * 2); // 20 minutes passed
      assert.equal(S.stock.lastUpdate, 1200000);
      assert.equal(S.stock.history['SIL'].length, 3); // 1 initial + 2 new
    });

    it('should cap history at 30 items', () => {
      updateMarket(600000 * 50); // 50 intervals
      assert.equal(S.stock.history['SIL'].length, 30);
    });

    it('should trigger FOMO on huge spikes', () => {
      // Force RNG to return 1.0 (huge spike)
      randomFn = () => 1.0;
      updateMarket(600000); // 1 interval
      
      // CRASH base volatility is 0.35
      // changePercent = 0.35 * (0.5 + trend*0.5). If trend=0, change = 0.175
      // 0.175 > 0.15, so FOMO should trigger, forcing trend to 1.
      assert.equal(S.stock.trends['CRASH'], 1);
    });

    it('should trigger Panic on huge drops', () => {
      // Force RNG to return 0.0 (huge drop)
      randomFn = () => 0.0;
      updateMarket(600000); // 1 interval
      
      // changePercent = 0.35 * (-0.5 + trend*0.5). If trend=0, change = -0.175
      // -0.175 < -0.15, so Panic should trigger, forcing trend to -1.
      assert.equal(S.stock.trends['CRASH'], -1);
    });
  });

  describe('Margin Call Liquidation', () => {
    it('should liquidate all assets if equity < 20% of debt', () => {
      borrowMargin(1000); // balance: 2000, debt: 1000. Equity: 2000.
      
      // Buy heavily into CRASH
      S.stock.history['CRASH'].push(100); 
      buyStock('CRASH', 20); // spent 2000. balance: 0. 
      // Equity = 20 * 100 = 2000 - 1000 debt = 1000. (1000 > 200, safe)
      
      // Simulate market crash
      S.stock.history['CRASH'].push(1); 
      // Equity = 20 * 1 = 20 - 1000 debt = -980. (-980 < 200, margin call)
      
      checkMarginCall();
      
      assert.equal(S.stock.portfolio['CRASH'], 0); // Sold out
      assert.equal(S.stock.debt, 0); // Debt cleared
      assert.equal(S.stock.balance, -980); // Bankrupt!
    });

    it('should not liquidate if equity exactly 20% of debt', () => {
      borrowMargin(1000); // balance: 2000, debt: 1000.
      S.stock.history['CRASH'].push(10);
      buyStock('CRASH', 200); // balance: 0. Equity: 2000.
      
      // Price drops to 6. Equity = 1200 - 1000 = 200 (exactly 20% of 1000)
      S.stock.history['CRASH'].push(6);
      
      checkMarginCall();
      
      assert.equal(S.stock.portfolio['CRASH'], 200); // Not sold
      assert.equal(S.stock.debt, 1000); // Debt remains
    });
  });
});
