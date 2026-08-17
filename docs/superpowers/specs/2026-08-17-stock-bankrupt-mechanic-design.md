# Stock Bankrupt Mechanic Design

## Purpose
Currently, the stock market system allows players to hold shares of a depreciating stock infinitely without risk, provided they do not use margin. They can wait for the stock to recover to their take-profit limit, completely negating the risk of a deep crash. 
The goal of this feature is to introduce a realistic "Bankrupt" / "Delisting" mechanic, where stocks that drop too low and fail to recover are wiped out, destroying any value held by players.

## Mechanic Details

### 1. Alert Threshold
- A stock is considered in the "danger zone" when its current price drops below **10% of its base price** (`startPrice`).
- Example: For SIL with a base price of $100, the alert threshold is < $10.

### 2. Grace Period Countdown
- Once a stock enters the danger zone, a countdown of **5 candles (updates)** begins.
- If the stock price recovers to or above the 10% threshold within these 5 candles, the countdown is canceled and the stock is safe.

### 3. Bankruptcy Event (Sập sàn)
- If the stock remains below the 10% threshold for 5 consecutive candles, it goes bankrupt.
- **Consequences:**
  1. The player's portfolio for this specific ticker is completely wiped out (`portfolio[ticker] = 0`). The shares become worthless.
  2. The stock's price history and current price are instantly reset to the original `startPrice`, representing a "new cycle" or relisting.
  3. The system logs the loss (Ticker, Shares lost, and the total initial investment cost `portfolioCost` of those shares) into a `bankruptLogs` array stored in the user's state.

### 4. Player Notification
- A dedicated Bankruptcy Report Modal will be shown.
- **Trigger:** Whenever the stock UI modal is opened (or currently active), if there are unread logs in `bankruptLogs`.
- **UI Element:** A blocking or highly visible list-style modal overlay.
- **Content:** The modal will list all recent bankruptcies if multiple occurred. It will explicitly show:
  - Which stock crashed.
  - How many shares the player lost.
  - The total value (giá trị gốc lúc mua) of those shares that went down the drain.
- **Dismissal:** The modal will NOT auto-close. The player must click an "Acknowledge" (Xác nhận) button to close it. Upon closing, the `bankruptLogs` for those acknowledged events are cleared.

## Error Handling & Edge Cases
- **No shares owned:** If the stock goes bankrupt but the player holds 0 shares, the price still resets, but the notification can either be skipped or just show "0 shares lost". (Design choice: It should still notify the player that the stock crashed, but state $0 loss, so they know the market reset).
- **Auto orders:** Any pending auto-orders (take profit/stop loss) for a bankrupt stock must be canceled when the stock is reset, as the old price points are no longer valid.
