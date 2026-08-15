# Stock Market Indicators & Dynamic Drift Design

## 1. Overview
The goal of this design is to address missing information in the SillyTavern Farm Stock Market mini-game by adding dynamic indicators (Average Cost, P/L per stock, Purchasing Power), revamping the Help panel to be an accordion for better UI/UX, and introducing a new "Dynamic Drift" mechanic that changes the macroeconomic trend every 100 candles.

## 2. Dynamic Drift (Macroeconomic Cycles)
- **State Tracking:** Introduce `ctx.S.stock.totalTicks` to track the total number of market updates.
- **Cycle Duration:** A single macroeconomic cycle lasts 100 ticks (candles).
- **Drift Randomization:** When `totalTicks % 100 === 0`, each stock will be assigned a new randomized drift value.
  - The new drift will be bound between `-2.00%` and `+2.00%` (-0.02 to 0.02) or a similar reasonable threshold for each stock's base volatility.
  - The current drift values for each stock will be stored in `ctx.S.stock.currentDrifts`.
- **UI Update:** 
  - Add a progress indicator somewhere in the UI: `⏳ Chu kỳ mới: X/100 nến`.
  - Display the current drift in the stock detail card, labeled dynamically (e.g., Sóng Tăng, Sóng Giảm).

## 3. Dynamic Indicators
### 3.1 Average Cost (Giá vốn trung bình)
- **State Tracking:** Introduce `ctx.S.stock.portfolioCost` object. Keys are tickers, values are the total cost basis for the currently held shares.
- **Update Logic:**
  - On BUY: `portfolioCost[ticker] += (price * shares)`
  - On SELL: `portfolioCost[ticker] -= (portfolioCost[ticker] / oldShares) * shares_sold`
- **Calculation:** `avgCost = portfolioCost[ticker] / currentShares`.
- **UI Display:** Show `Giá vốn: $xxx` below the current price or within the holdings info.

### 3.2 Position P/L (Lãi/Lỗ từng mã)
- **Calculation:** `Position P/L = (Current Price - avgCost) * currentShares`.
- **UI Display:** Next to or below the holdings value, colored green (+) or red (-).

### 3.3 Purchasing Power (Sức mua)
- **Calculation:** Max Debt allowed is `Equity * 2`. Therefore, `Purchasing Power = Cash + (Equity * 2 - Debt)`.
- **UI Display:** Re-label the banking sidebar or add a specific row for `Sức mua` so players know exactly how much they can spend.

## 4. UI Revamp: Help Accordion
- Replace the static `stk-help-panel` with an Accordion-style layout.
- Divide the help text into 3 distinct sections:
  1. **Luật Cơ bản:** Trading hours, deposit fees, base price concept.
  2. **Giải mã Chỉ số:** Vol, Drift, Margin, and the new 100-Candle Cycle.
  3. **Mẹo chơi:** Survival tips, avoiding negative drift traps, margin management.

## 5. Backward Compatibility & Error Handling
- **State Migration:** If an existing save does not have `totalTicks`, `currentDrifts`, or `portfolioCost`, they will be initialized to `0`, the default hardcoded drifts from `STOCKS`, and the `currentPrice * shares` respectively upon opening the stock modal or on the next tick.
- **Zero Division:** Ensure `avgCost` calculation does not divide by zero when `shares === 0`. Clear `portfolioCost` when shares hit `0`.

## 6. Testing Strategy
- Unit test the `buyStock` and `sellStock` cost basis updates.
- Unit test the 100-tick drift randomization logic to ensure bounds are respected.
- Verify backward compatibility by loading a mocked old state without the new keys.
