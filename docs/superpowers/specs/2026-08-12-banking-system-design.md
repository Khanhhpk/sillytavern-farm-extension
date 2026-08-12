# Banking System Design

## 1. Overview
Hệ thống Ngân hàng (Bank) cho phép người chơi quản lý tài chính thông qua việc gửi tiết kiệm để lấy lãi thụ động và vay vốn. Đặc biệt, hệ thống xử lý các khoản nợ quá hạn với cơ chế đòi nợ và trợ cấp nợ rủi ro cao.

## 2. Core Mechanics

### 2.1. Chu kỳ thời gian (Time Cycle)
- 1 ngày trong game = 4 giờ ngoài đời thực.
- Các kỳ hạn tính lãi hoặc hạn chót trả nợ được quy đổi dựa trên chu kỳ 4 tiếng này.

### 2.2. Gửi tiết kiệm (Deposit)
- Gửi vàng (`coins`) vào ngân hàng để nhận lãi suất theo thời gian thực (dựa trên chu kỳ 4 tiếng).
- Tiền lãi tự động cộng dồn khi người chơi truy cập ngân hàng hoặc nhận theo định kỳ.

### 2.3. Vay nợ (Loan) & Quá hạn
- **Vay vốn**: Không yêu cầu điều kiện ban đầu, người chơi có thể vay tự do với một hạn mức nhất định.
- **Quá hạn**: Khi thời gian vay vượt quá kỳ hạn quy định mà chưa thanh toán:
  1. Tự động trừ nợ (gồm gốc + lãi quá hạn) từ **số dư trong ngân hàng (Deposit)** của người chơi.
  2. Nếu số dư ngân hàng hết, tự động trừ tiếp vào **tiền vàng hiện có (`coins`)** trong túi.
  3. Nếu tiền túi cũng hết (`coins` <= 0), Ngân hàng sẽ chốt sổ (khóa nợ): không cộng dồn lãi nữa nhưng ghi nhận số nợ cố định.
- **Thu nợ định kỳ**: Khi trạng thái nợ bị chốt, hệ thống sẽ tự động kiểm tra và thu nợ mỗi 1 giờ ngoài đời thực (để tránh việc trừ liên tiếp mỗi giây) mỗi khi người chơi có tiền mới.

### 2.4. Trợ cấp nợ rủi ro (Sub-prime / Emergency Loan)
- Kể cả khi đang trong tình trạng nợ nần hoặc bị chốt sổ, người chơi vẫn có thể vay thêm một khoản "trợ cấp nợ".
- Khoản trợ cấp này có **lãi suất cực cao**.

## 3. State Management (`ctx.S`)
- `bankDeposit`: Số dư đang gửi.
- `bankDepositTime`: Lần tương tác cuối (để tính lãi).
- `bankLoan`: Số tiền đang vay nợ (gốc).
- `bankLoanTime`: Thời điểm bắt đầu vay (để tính kỳ hạn).
- `bankLockedDebt`: Số tiền nợ đã bị chốt (do hết tiền trả).
- `bankLastCollectionTime`: Lần thu nợ tự động cuối cùng (để đếm chu kỳ 1 tiếng/lần).
- `bankEmergencyLoan`: Dư nợ của khoản vay trợ cấp rủi ro (lãi cao).

## 4. UI/UX
- Một tab/nút "Ngân Hàng" trong giao diện chính.
- Giao diện Modal hiển thị:
  - Khung **Gửi Tiết Kiệm**: Xem số dư, lãi suất, Rút/Gửi.
  - Khung **Khoản Vay**: Số nợ, hạn chót, Vay/Trả.
  - Khung **Trợ Cấp Khẩn Cấp**: Chỉ hiện khi đang mắc nợ, hiển thị cảnh báo lãi cao.
