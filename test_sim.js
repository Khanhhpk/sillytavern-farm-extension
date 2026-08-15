const STOCKS = {
  SIL: {
    name: 'SillyTavern Inc.',
    startPrice: 100,
    vol: 0.025,
    drift: -0.001,
    trendDecay: 0.70,
    trendNoise: 0.25,
    gravityZones: [ { above: 3, pull: -0.20 }, { above: 1.5, pull: -0.08 }, { below: 0.5, pull: 0.12 } ],
    swingCap: 0.08,
  },
  FARM: {
    name: 'Nông Sản Farm',
    startPrice: 50,
    vol: 0.08,
    drift: -0.003,
    trendDecay: 0.78,
    trendNoise: 0.35,
    gravityZones: [ { above: 6, pull: -0.35 }, { above: 2.5, pull: -0.12 }, { below: 0.35, pull: 0.18 } ],
    swingCap: 0.18,
  },
  CRASH: {
    name: 'Đa Cấp Coin',
    startPrice: 10,
    vol: 0.18,
    drift: -0.01,
    trendDecay: 0.88,
    trendNoise: 0.55,
    gravityZones: [ { above: 15, pull: -0.55 }, { above: 5, pull: -0.20 }, { below: 0.2, pull: 0.10 } ],
    swingCap: 0.30,
    pumpChance: 0.02,
    pumpStrength: 0.45,
  }
};

function runSim(ticker, initialInvestment, numCandles, numRuns) {
    const S = STOCKS[ticker];
    
    let maxProfit = 0;
    let maxLoss = 0;
    
    let maxEnding = 0;
    let minEnding = Infinity;
    let totalEnding = 0;
    
    for (let r = 0; r < numRuns; r++) {
        let currentPrice = S.startPrice;
        let currentTrend = 0;
        let maxRunEquity = initialInvestment;
        let minRunEquity = initialInvestment;
        
        for (let i = 0; i < numCandles; i++) {
            currentTrend += (Math.random() - 0.5) * S.trendNoise;
            if (S.pumpChance && Math.random() < S.pumpChance) {
                currentTrend += S.pumpStrength;
            }
            
            let priceRatio = currentPrice / S.startPrice;
            let gravity = 0;
            for (const zone of S.gravityZones) {
                if (zone.above !== undefined && priceRatio > zone.above) { gravity = zone.pull; break; }
                if (zone.below !== undefined && priceRatio < zone.below) { gravity = zone.pull; break; }
            }
            currentTrend += gravity;
            currentTrend *= S.trendDecay;
            currentTrend = Math.max(-1, Math.min(1, currentTrend));
            
            let change = S.drift + S.vol * ((Math.random() - 0.48) + currentTrend * 0.5);
            change = Math.max(-S.swingCap, Math.min(S.swingCap, change));
            
            currentPrice = Math.max(1, currentPrice * (1 + change));
            
            let equity = (initialInvestment / S.startPrice) * currentPrice;
            if (equity > maxRunEquity) maxRunEquity = equity;
            if (equity < minRunEquity) minRunEquity = equity;
        }
        
        let endEquity = (initialInvestment / S.startPrice) * currentPrice;
        
        if (maxRunEquity - initialInvestment > maxProfit) maxProfit = maxRunEquity - initialInvestment;
        if (initialInvestment - minRunEquity > maxLoss) maxLoss = initialInvestment - minRunEquity;
        
        if (endEquity > maxEnding) maxEnding = endEquity;
        if (endEquity < minEnding) minEnding = endEquity;
        totalEnding += endEquity;
    }
    
    let avgEnding = totalEnding / numRuns;
    
    console.log(`--- SÀN ${ticker} ---`);
    console.log(`Vốn ban đầu: $${initialInvestment.toLocaleString()}`);
    console.log(`Số nến test: ${numCandles} (Tương đương ${((numCandles * 10) / 60 / 24).toFixed(1)} ngày trong game)`);
    console.log(`Số lần test lặp lại: ${numRuns}`);
    console.log(`Lãi Đỉnh (Trong tất cả các lần test): +$${maxProfit.toLocaleString('en-US', {maximumFractionDigits: 0})} (+${(maxProfit/initialInvestment*100).toFixed(1)}%)`);
    console.log(`Lỗ Đáy (Trong tất cả các lần test): -$${maxLoss.toLocaleString('en-US', {maximumFractionDigits: 0})} (-${(maxLoss/initialInvestment*100).toFixed(1)}%)`);
    console.log(`Trung bình còn lại cuối phiên: $${avgEnding.toLocaleString('en-US', {maximumFractionDigits: 0})} (${((avgEnding-initialInvestment)/initialInvestment*100).toFixed(1)}%)`);
    console.log(`Tình huống Hold tới cùng may nhất: $${maxEnding.toLocaleString('en-US', {maximumFractionDigits: 0})}`);
    console.log(`Tình huống Hold tới cùng xui nhất: $${minEnding.toLocaleString('en-US', {maximumFractionDigits: 0})}`);
    console.log();
}

console.log("=== KẾT QUẢ KIỂM ĐỊNH THỊ TRƯỜNG ===");
console.log();
runSim('SIL', 10000, 1000, 500);
runSim('FARM', 10000, 1000, 500);
runSim('CRASH', 10000, 1000, 500);
