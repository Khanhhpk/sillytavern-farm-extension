import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ─── Inline stock engine (mirrors stock.js) ────────────────────────────────

const STOCKS = {
  SIL: {
    name: 'SillyTavern Inc.',
    startPrice: 100,
    vol: 0.035,
    drift: -0.002,
    trendDecay: 0.70,
    trendNoise: 0.25,
    gravityZones: [ { above: 3, pull: -0.20 }, { above: 1.5, pull: -0.08 }, { below: 0.5, pull: 0.12 } ],
    swingCap: 0.08,
  },
  FARM: {
    name: 'Nông Sản Farm',
    startPrice: 50,
    vol: 0.10,
    drift: -0.005,
    trendDecay: 0.78,
    trendNoise: 0.35,
    gravityZones: [ { above: 6, pull: -0.35 }, { above: 2.5, pull: -0.12 }, { below: 0.35, pull: 0.18 } ],
    swingCap: 0.18,
  },
  CRASH: {
    name: 'Đa Cấp Coin',
    startPrice: 10,
    vol: 0.22,
    drift: -0.015,
    trendDecay: 0.88,
    trendNoise: 0.55,
    gravityZones: [ { above: 15, pull: -0.55 }, { above: 5, pull: -0.20 }, { below: 0.2, pull: 0.10 } ],
    swingCap: 0.30,
    pumpChance: 0.03,
    pumpStrength: 0.50,
  }
};

let randomFn = Math.random;
let S = {};

function stepPrice(t) {
  const stockConfig = STOCKS[t];
  const hist = S.stock.history[t];
  let price = hist[hist.length - 1];
  let trend = S.stock.trends[t];
  const priceRatio = price / stockConfig.startPrice;

  trend += (randomFn() - 0.5) * stockConfig.trendNoise;

  if (stockConfig.pumpChance && randomFn() < stockConfig.pumpChance) {
    trend += stockConfig.pumpStrength;
  }

  let gravity = 0;
  for (const zone of stockConfig.gravityZones) {
    if (zone.above !== undefined && priceRatio > zone.above) { gravity = zone.pull; break; }
    if (zone.below !== undefined && priceRatio < zone.below) { gravity = zone.pull; break; }
  }
  trend += gravity;

  trend *= stockConfig.trendDecay;
  trend = Math.max(-1, Math.min(1, trend));

  let currentDrift = (S.stock && S.stock.currentDrifts && S.stock.currentDrifts[t] !== undefined) ? S.stock.currentDrifts[t] : stockConfig.drift;
  let change = currentDrift + stockConfig.vol * ((randomFn() - 0.48) + trend * 0.5);
  change = Math.max(-stockConfig.swingCap, Math.min(stockConfig.swingCap, change));

  let newPrice = Math.max(1, price * (1 + change));
  hist.push(newPrice);
  if (hist.length > 30) hist.shift();
  S.stock.trends[t] = trend;
}

function updateMarket(now) {
  if (!S.stock) return;
  
  Object.keys(STOCKS).forEach(t => {
    if (!S.stock.history[t]) S.stock.history[t] = [STOCKS[t].startPrice];
    if (S.stock.trends[t] === undefined) S.stock.trends[t] = 0;
    if (S.stock.portfolio[t] === undefined) S.stock.portfolio[t] = 0;
  });
  
  if (!S.stock.nextIntervalMs) {
    S.stock.nextIntervalMs = Math.floor(randomFn() * 160000) + 20000;
  }
  
  let updated = false;
  while (now - S.stock.lastUpdate >= S.stock.nextIntervalMs) {
    S.stock.lastUpdate += S.stock.nextIntervalMs;
    
    S.stock.candleCount = (S.stock.candleCount || 0) + 1;
    if (!S.stock.currentDrifts) {
      S.stock.currentDrifts = {};
      Object.keys(STOCKS).forEach(t => S.stock.currentDrifts[t] = STOCKS[t].drift);
    }
    if (S.stock.candleCount % 100 === 0) {
      Object.keys(STOCKS).forEach(t => {
        S.stock.currentDrifts[t] = (randomFn() * 0.04) - 0.02;
      });
    }

    Object.keys(STOCKS).forEach(t => stepPrice(t));
    checkMarginCall();
    S.stock.nextIntervalMs = Math.floor(randomFn() * 160000) + 20000;
    updated = true;
  }
  return updated;
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
    S.stock.portfolio[ticker] = (S.stock.portfolio[ticker] || 0) + shares;
    if (!S.stock.portfolioCost) S.stock.portfolioCost = {};
    S.stock.portfolioCost[ticker] = (S.stock.portfolioCost[ticker] || 0) + cost;
    return true;
  }
  return false;
}

function sellStock(ticker, shares) {
  if (shares <= 0 || (S.stock.portfolio[ticker] || 0) < shares) return false;
  const price = S.stock.history[ticker][S.stock.history[ticker].length - 1];
  const revenue = price * shares;
  
  if (!S.stock.portfolioCost) S.stock.portfolioCost = {};
  const oldShares = S.stock.portfolio[ticker];
  const avgCostPerShare = oldShares > 0 ? (S.stock.portfolioCost[ticker] || 0) / oldShares : 0;

  S.stock.portfolio[ticker] -= shares;
  S.stock.balance += revenue;

  if (S.stock.portfolio[ticker] === 0) {
    S.stock.portfolioCost[ticker] = 0;
  } else {
    S.stock.portfolioCost[ticker] -= (avgCostPerShare * shares);
  }

  return true;
}

function borrowMargin(amount) {
  if (amount <= 0) return false;
  S.stock.debt = (S.stock.debt || 0) + amount;
  S.stock.balance += amount * 0.95; // 5% upfront fee
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
      // borrow 500, but there's a 5% upfront fee, so balance increases by 475 (500 * 0.95)
      assert.equal(borrowMargin(500), true);
      assert.equal(S.stock.debt, 500);
      assert.equal(S.stock.balance, 1475); // 1000 + 475

      assert.equal(repayMargin(200), true);
      assert.equal(S.stock.debt, 300);
      assert.equal(S.stock.balance, 1275); // 1475 - 200
    });

    it('should reject invalid repay amounts', () => {
      borrowMargin(500);
      S.stock.balance = 0;
      assert.equal(repayMargin(200), false);
      
      S.stock.balance = 2000;
      assert.equal(repayMargin(1000), false);
      
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

  describe('Market Engine Validation', () => {
    it('should update prices based on time intervals', () => {
      // Setup predictable random interval
      randomFn = () => 0; // nextIntervalMs will be 20000
      updateMarket(20000 * 2); // 2 intervals passed
      assert.equal(S.stock.lastUpdate, 40000);
      assert.equal(S.stock.history['SIL'].length, 3); // 1 initial + 2 new
    });

    it('should cap history at 30 items', () => {
      randomFn = () => 0; // 20s intervals
      updateMarket(20000 * 50); // 50 intervals
      assert.equal(S.stock.history['SIL'].length, 30);
    });

    it('should rotate dynamic drift every 100 ticks', () => {
      S.stock.candleCount = 99;
      S.stock.currentDrifts = { 'CRASH': -0.015 };
      S.stock.lastUpdate = 0;
      updateMarket(1000000); // Forces interval updates to trigger tick
      assert.ok(S.stock.candleCount >= 100);
      assert.ok(S.stock.currentDrifts['CRASH'] !== undefined);
      assert.ok(S.stock.currentDrifts['CRASH'] >= -0.02 && S.stock.currentDrifts['CRASH'] <= 0.02);
    });

    it('should enforce negative expected value (Gold Sink) over long term', () => {
      // Restore standard random for this specific simulation
      randomFn = Math.random;
      
      // Let's run 200 runs of 1000 candles for CRASH and check if the median is a huge loss (EV sink)
      // Since CRASH has high outliers, we check the median
      let endings = [];
      for(let r=0; r<200; r++) {
        S.stock.history['CRASH'] = [10];
        S.stock.trends['CRASH'] = 0;
        for(let i=0; i<1000; i++) {
            stepPrice('CRASH');
        }
        endings.push(S.stock.history['CRASH'][S.stock.history['CRASH'].length - 1]);
      }
      
      endings.sort((a,b) => a-b);
      let medianEnd = endings[Math.floor(endings.length/2)];
      
      // Since it's a gold sink with -1.5% drift, the median after 1000 candles should be effectively 1 (minimum price)
      // or at least less than the start price of 10.
      assert.ok(medianEnd < 10, 'CRASH median hold price over 1000 candles should be < start price (negative EV)');
    });
  });

  describe('Margin Call Liquidation', () => {
    it('should liquidate all assets if equity < 20% of debt', () => {
      borrowMargin(1000); // balance: 1000 + 950 = 1950, debt: 1000.
      
      S.stock.history['CRASH'].push(97.5); 
      buyStock('CRASH', 20); // spent 20 * 97.5 = 1950. balance: 0. 
      // Equity = 20 * 97.5 = 1950 - 1000 debt = 950. (950 > 200, safe)
      
      S.stock.history['CRASH'].push(1); 
      // Equity = 20 * 1 = 20 - 1000 debt = -980. (-980 < 200, margin call)
      
      checkMarginCall();
      
      assert.equal(S.stock.portfolio['CRASH'], 0); // Sold out
      assert.equal(S.stock.debt, 0); // Debt cleared
      assert.equal(S.stock.balance, -980); // Bankrupt!
    });

    it('should not liquidate if equity exactly 20% of debt', () => {
      borrowMargin(1000); // balance: 1950, debt: 1000.
      S.stock.history['CRASH'].push(9.75);
      buyStock('CRASH', 200); // 200 * 9.75 = 1950. balance: 0. Equity: 1950.
      
      // Price drops to 6. Equity = 1200 - 1000 = 200 (exactly 20% of 1000)
      S.stock.history['CRASH'].push(6);
      
      checkMarginCall();
      
      assert.equal(S.stock.portfolio['CRASH'], 200); // Not sold
      assert.equal(S.stock.debt, 1000); // Debt remains
    });
  });
});
