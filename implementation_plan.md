# Smart Dealer AI (Nhà Cái Khôn Lỏi)

## Goal
Nâng cấp AI của Nhà Cái (Dealer) trong Blackjack để không còn mù quáng rút bài theo luật sòng bạc truyền thống (luôn rút nếu dưới 17, dừng nếu 17 trở lên). Thay vào đó, AI sẽ tự động phân tích điểm số của người chơi trên bàn và đưa ra quyết định tối đa hóa lợi nhuận (Expected Value - EV).

## User Review Required
> [!IMPORTANT]
> - Luật sòng bạc truyền thống luôn ép Dealer phải tuân thủ mốc 17 điểm. Nếu áp dụng Smart AI, Dealer sẽ trở thành một "người chơi" nhìn thấy hết bài của mọi người và đánh cực kỳ thực dụng.
> - Ví dụ: Bạn 15 điểm, Dealer 16 điểm -> Dealer sẽ úp bài luôn để ăn tiền bạn thay vì rút tiếp để có nguy cơ quắc.
> - Điều này làm giảm tỷ lệ thắng của người chơi một cách đáng kể, phù hợp với phong cách "bào tiền" của sòng bạc Đa Cấp. Bạn có đồng ý với thiết kế này không?

## Proposed Changes

### [MODIFICATION] `src/blackjack.js`
- Thêm hàm `calcSmartProfit(dealerTotal, activeHands)`: Tính toán tổng lợi nhuận kỳ vọng của Dealer dựa trên điểm số hiện tại của Dealer so với tất cả người chơi còn sống.
- Thêm hàm `shouldSmartDealerHit(dealerHand, activeHands)`: 
  - Tính `standProfit` = `calcSmartProfit(handTotal(dealerHand), activeHands)`.
  - Giả lập rút thêm 1 lá bài (thử 10 trường hợp từ A đến K với tỷ lệ tương ứng). Tính trung bình cộng lợi nhuận -> `hitEV`.
  - Nếu `hitEV > standProfit`, Dealer quyết định HIT.
  - Nếu `hitEV < standProfit`, Dealer quyết định STAND.
  - Nếu bằng nhau, Dealer dùng luật 17 điểm truyền thống.
- Cập nhật hàm `soloRunDealer` để gọi `shouldSmartDealerHit` thay cho kiểm tra `< 17`.
- Cập nhật hàm `bjHostRunDealer` để gọi `shouldSmartDealerHit` thay cho kiểm tra `< 17`.

## Verification Plan
- Chạy thử một vài ván ở Solo Mode:
  - Ép tay bài người chơi là 19, Dealer là 18. Xem Dealer có rút tiếp không.
  - Ép tay bài người chơi là 15, Dealer là 16. Xem Dealer có dừng không.
