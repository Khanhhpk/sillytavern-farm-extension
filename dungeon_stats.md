# Thông số chi tiết Hầm Ngục (Dungeon Mode)

Tài liệu này tổng hợp toàn bộ các chỉ số cơ bản của Thú cưng (Pets), Quái vật (Enemies), cũng như cơ chế tăng tiến sức mạnh (Scaling) đang được áp dụng trong game `dungeon.js`.

---

## 1. Chỉ số cơ bản của Pets (Thú cưng)
Các chỉ số dưới đây là **chỉ số gốc**, dùng làm mốc tính toán khi bạn mua nâng cấp trong Shop.

| Pet | HP | ATK | Tầm đánh | Tốc chạy | Cooldown | Kỹ năng |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Slime Xanh** | 130 | 12 | 40 | 40 | 1.0s | *Không có* |
| **Bạch Tuộc** | 100 | 18 | 60 | 50 | 0.8s | **Frenzy** (Đánh càng lâu tốc đánh càng cao) |
| **Slime Hồng** | 150 | 18 | 80 | 35 | 1.5s | **Heal** (Hồi máu đơn cho đồng minh yếu nhất) |
| **Soda Đào** | 110 | 22 | 100 | 45 | 1.2s | **Pierce** (Đánh xa xuyên thấu mọi kẻ địch) |
| **Bạch Tuộc Kem** | 180 | 15 | 60 | 45 | 1.5s | **Stun** (20% tỷ lệ choáng 1s) |
| **Sứa Xoăn** | 90 | 30 | 150 | 60 | 1.5s | **Sniper** (Bắn càng xa sát thương càng lớn) |
| **Bé Bí Ẩn** | 110 | 18 | 50 | 55 | 1.1s | **Lifesteal** (Hút máu 50% sát thương gây ra) |
| **Ma Trắng** | 80 | 45 | 40 | 100 | 1.2s | **Assassin** (Luôn nhảy ra sau kẻ địch xa nhất) |
| **Quỷ Nhỏ** | 70 | 50 | 40 | 60 | 1.0s | **Cleave** (Đánh lan AoE cận chiến) |
| **Thiên Thần** | 140 | 12 | 80 | 40 | 1.2s | **AoE Heal** (Hồi máu diện rộng) |
| **Chuông Sao** | 120 | 15 | 90 | 40 | 1.0s | **Buff ATK** (Tăng 20% sát thương đồng minh) |
| **Kẹo Dẻo Mây** | 250 | 10 | 40 | 30 | 2.0s | **Taunt** (Khiêu khích hút sát thương) |
| **Mầm Sương** | 130 | 18 | 50 | 45 | 1.2s | **Root** (25% tỷ lệ trói chân kẻ địch 2s) |
| **Lăng Kính** | 100 | 25 | 140 | 40 | 1.4s | **Multishot** (Bắn 3 tia sáng chia nửa sát thương) |
| **Cánh Cụt** | 150 | 20 | 45 | 50 | 1.0s | **Freeze** (Làm chậm tốc đánh và tốc chạy đối thủ) |
| **Naoya** | 100 | 35 | 45 | 65 | 0.6s | **Đầu Xạ Chú Pháp** (Lướt 24 hit đóng băng toàn map) |

---

## 2. Chỉ số cơ bản của Quái & Boss
Chỉ số này sẽ được nhân với hệ số khó của từng Wave (Xem mục 3).

| Quái Vật | HP | ATK | Tầm đánh | Tốc chạy | Cooldown | Vàng (Gốc) | AI / Đặc điểm |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mầm Non** | 50 | 12 | 40 | 45 | 0.8s | 2 🛠 | Bầy đàn |
| **Cà Chua Tròn** | 100 | 18 | 40 | 30 | 1.0s | 4 🛠 | Cận chiến |
| **Củ Cải Tốc Độ** | 60 | 12 | 30 | 70 | 0.5s | 3 🛠 | Cận chiến chạy nhanh |
| **Dâu Tây Gai** | 70 | 30 | 40 | 60 | 1.0s | 5 🛠 | Sát thủ tập kích |
| **Rau Thuần** | 150 | 15 | 40 | 25 | 1.2s | 6 🛠 | Đeo bám dai dẳng |
| **Củ Ấu Giáp** | 180 | 20 | 40 | 20 | 1.5s | 8 🛠 | Trâu bò cận chiến |
| **Bí Ngô Khổng Lồ** | 300 | 30 | 50 | 15 | 3.0s | 15 🛠 | Tanker chậm chạp |
| **Hoa Bá Vương** | 60 | 15 | 100 | 20 | 1.8s | 8 🛠 | Pháp sư bắn xa |
| **Bụi Sao** | 70 | 8 | 120 | 25 | 2.0s | 10 🛠 | Xạ thủ bắn 3 tia |
| **Dây Leo Opal** | 130 | 15 | 90 | 20 | 1.5s | 12 🛠 | Trói chân |
| **Củ Sen Khổng Lồ** | 200 | 18 | 100 | 15 | 2.5s | 20 🛠 | Ném bùn từ xa |
| **Boss: Long Tinh** | 700 | 60 | 60 | 20 | 2.0s | 100 🛠 | Đánh lan (Cleave) |
| **Boss: Vua Bí Ngô** | 1000 | 50 | 50 | 15 | 2.5s | 150 🛠 | Tank AoE Slam |
| **Boss: Phù Thủy Hoa**| 500 | 70 | 160 | 18 | 1.8s | 120 🛠 | Pháo đài 3 tia |

---

## 3. Cơ chế Scaling (Tăng tiến sức mạnh)

> [!IMPORTANT]
> Cơ chế tính toán máu và vàng đã được phân hóa làm 2 hệ thống độc lập để tránh lạm phát vĩnh viễn cho thị trường nông trại gốc của bạn.

### Đối với Quái vật
* **Chỉ số chung:** `HP` và `ATK` tăng theo cấp số nhân **1.10x (+10%)** mỗi Wave. *(Ví dụ: Wave 10 sẽ nhân hệ số $1.10^9$)*
* **Đặc quyền Wave Boss (Mỗi 10 ải):** Quái Boss được nhân thêm **x1.5 Máu** và **x1.2 ATK** ngoài hệ số cơ bản.
* **Số lượng quái:** Tối đa 40 con trên sân cùng lúc. Tổng số sinh ra mỗi ải là `4 + Wave * 1.2`.

### Đối với Tiền trong Hầm Ngục (Điểm Nâng Cấp 🛠)
Hệ thống tiền nâng cấp Scale theo hàm mũ để bắt kịp sức mạnh quái vật và giá đồ.
* **Vàng rớt từ quái** = `(Vàng Gốc x 2) * 1.10^(Wave-1)`
* **Vàng thưởng qua ải** = `500 * 1.10^(Wave-1)` *(Gấp 3 lần nếu là ải Boss)*

### Đối với Tiền mang về Farm (Coins G)
Hệ thống tiền thưởng chuyển về kho Nông Trại đã được chuyển sang **Tăng tuyến tính** để chống lạm phát:
* **Tiêu diệt 1 quái:** Thưởng `1 + Math.floor(Wave / 10)` vàng.
* **Qua 1 ải:** Thưởng `10 + (Wave x 2)` vàng *(Gấp 3 lần nếu là ải Boss)*.

### Đối với Pet & Shop Nâng cấp
* **Giá Nâng Cấp:** Tăng **1.12x (+12%)** mỗi cấp. Tốc độ tăng giá sẽ nhanh hơn một chút so với tốc độ rớt vàng (1.10x) để tạo độ khó ở giai đoạn cực khuya.
* **Hiệu quả Nâng Cấp (Cộng dồn nhân với Chỉ số Gốc):**
  * **HP & ATK:** Tăng **1.10x (+10%)** mỗi cấp.
  * **Tốc độ (Speed) & Tầm đánh (Range):** Tăng **1.05x (+5%)** mỗi cấp (Tầm đánh giới hạn ở 400, Tốc độ giới hạn ở 150).
  * **Hồi chiêu (ATK SPD):** Giảm thời gian chờ đi 10% mỗi cấp (Hệ số `0.9`), có giới hạn chặn dưới là `0.1s`.
  * **Tỷ lệ Chí mạng:** +5% mỗi cấp (Tối đa 60%).
  * **Sát thương Chí mạng:** +20% mỗi cấp (Không giới hạn).
  * **Né Tránh:** +5% mỗi cấp (Tối đa 40%).
