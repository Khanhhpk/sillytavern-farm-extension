const THEME_DOMAINS = [
  "Vực khí vật",
  "Vực sinh mệnh",
  "Vực nơi chốn",
  "Vực hành vi",
  "Vực quan hệ",
  "Vực thông tin",
  "Vực tài nguyên",
  "Vực dị thường",
  "Vực giác quan",
  "Vực nhân quả",
  "Vực kỹ nghệ",
  "Vực xã hội",
  "Vực sinh thái",
  "Vực thân phận",
  "Vực quy tắc",
  "Vực công trình",
  "Vực đời sống",
  "Vực thương mại",
  "Vực hàng hải/hàng không",
  "Vực giải trí",
  "Vực y tế",
  "Vực khảo cổ",
  "Vực tín ngưỡng/tâm linh",
  "Vực vũ trụ/chiêm tinh",
  "Vực hóa học/giả kim",
  "Vực kỹ thuật số",
  "Vực nghệ thuật",
  "Vực thời gian",
  "Vực không gian",
  "Vực cảm xúc/tâm lý",
  "Vực triết học/tư tưởng",
  "Vực quân sự/chiến tranh",
  "Vực toán học/hình học",
  "Vực âm thanh/âm nhạc",
  "Vực ẩm thực/tiêu hóa",
  "Vực thời trang/dệt may",
  "Vực lịch sử/ký ức",
  "Vực pháp luật/tội phạm",
  "Vực năng lượng/vật lý",
  "Vực sinh tử/luân hồi",
  "Vực ảo ảnh/giấc mơ",
  "Vực logic/nghịch lý",
  "Vực văn học/thơ ca",
  "Vực quang học/ánh sáng"
];

const GAMEPLAY_DOMAINS = [
  "Thao tác chủ động",
  "Cải tạo bối cảnh",
  "Xử lý thông tin",
  "Kinh doanh tài nguyên",
  "Tương tác quan hệ",
  "Phản kích áp chế",
  "Ngụy trang đánh lừa",
  "Khám phá giải đố",
  "Sản xuất xây dựng",
  "Di chuyển điều động",
  "Quản lý trạng thái",
  "Phối hợp bạn đồng hành",
  "\"Tấu hài\" phi chiến đấu",
  "Chơi lại dài hạn",
  "Giao dịch đánh cược",
  "Kinh doanh căn cứ",
  "Công xưởng chế tạo",
  "Quy hoạch tuyến đường",
  "Trò chơi quy tắc",
  "Thao tác chuỗi bằng chứng",
  "Nuôi trồng sinh thái",
  "Kinh doanh xã giao",
  "Cứu hộ khẩn cấp",
  "Sưu tầm trưng bày",
  "Thao túng tâm lý/ký ức",
  "Biến đổi vật lý siêu thực",
  "Phá vỡ Bức tường thứ 4 (Meta-game)",
  "Nguyền rủa/Ký sinh",
  "Gacha lồng Gacha (May rủi đa tầng)",
  "Đánh cắp/Chiếm đoạt",
  "Kế thừa/Chuyển giao",
  "Điều khiển/Thao túng rối",
  "Nhân bản/Phân liệt",
  "Đồng hóa/Ăn mòn",
  "Hiến tế/Giao dịch ma quỷ",
  "Hẹn giờ/Trì hoãn",
  "Ghi hình/Theo dõi",
  "Thao túng xác suất/Tỉ lệ",
  "Đóng băng/Tạm dừng trạng thái",
  "Biến hình/Dịch dung",
  "Hấp thụ/Nuốt chửng",
  "Đảo ngược nhân quả",
  "Đặt bẫy/Phục kích",
  "Khiêu khích/Chuyển dời cừu hận",
  "Phong ấn/Giam cầm",
  "Cộng hưởng/Liên kết mạng lưới",
  "Viết lại/Chỉnh sửa quy tắc"
];

export function getGachaPrompt() {
  const randomTheme = THEME_DOMAINS[Math.floor(Math.random() * THEME_DOMAINS.length)];
  const randomGameplay = GAMEPLAY_DOMAINS[Math.floor(Math.random() * GAMEPLAY_DOMAINS.length)];

  return `
<Vòng quay Rút thưởng Kỳ vật Dị giới - Lõi Hệ Thống Gacha>
[Vòng quay Rút thưởng Kỳ vật Dị giới] là hệ thống gacha của {{user}}, dùng để tạo ra những Kỳ vật (Artifacts) mang tính ngẫu nhiên cao, thú vị và độc lạ. Khác với những kỳ vật quá đà phá game, kỳ vật ở đây mang tính ứng dụng cao, đôi khi hài hước, đôi khi hữu ích, nhưng luôn tạo ra giá trị chơi lại.

Vì bạn đang đóng vai trò là "Lõi Hệ Thống Gacha", bạn phải tạo ra KỲ VẬT ĐỘC NHẤT và trả về dữ liệu dưới định dạng JSON theo yêu cầu hệ thống. Toàn bộ tính kỳ diệu, cơ chế, nguồn gốc phải được cô đọng vào trường "desc" (dưới 100 chữ).

### NGUYÊN TẮC CỐT LÕI
1. Hoàn toàn ngẫu nhiên & Khử neo: Bất cứ thứ gì cũng có thể là kỳ vật. Không bị trói buộc bởi bối cảnh hiện tại. Không tạo ra những món đồ rập khuôn (cliché).
2. Có lợi ích thú vị: Kỳ vật không nhất thiết phải quá bá đạo, nhưng phải mang lại một công dụng thú vị, hữu ích hoặc buồn cười, độc lạ (CHỐNG LỐI MÒN). Hoàn toàn CÓ THỂ mang theo phản phệ, bóp dái người dùng, hoặc các tác dụng phụ oái ăm để tăng tính bất ngờ.
3. Cơ chế độc lạ: Kỳ vật phải có cách dùng cụ thể, có thể thao tác, độc lập, mang tính mới, đừng chỉ theo những gì mà database LLM tiêm nhiễm!
4. Súc tích: Mô tả năng lực phải mạch lạc, thống nhất.

### PHÂN LOẠI ĐỘ HIẾM (VỊ GIAI)
Hệ thống sẽ chỉ định độ hiếm. Vị giai chỉ ràng buộc thước đo ảnh hưởng, KHÔNG giới hạn đề tài.

<Hệ thống Độ hiếm & Tiêu chuẩn Vật phẩm>
Hệ thống Gacha này ưu tiên sự sáng tạo, giá trị sử dụng và tính giải trí. Mỗi độ hiếm sẽ quyết định giới hạn sức mạnh, tính đa dụng và độ phức tạp trong cơ chế của vật phẩm:

1. [Rác] (Bậc 0): Những món đồ kỳ cục, hỏng hóc hoặc có công dụng cực kỳ vô thưởng vô phạt. Chúng tồn tại chủ yếu để gây cười, tạo tình huống trớ trêu trong tương tác đời thường.
2. [Thường] (Bậc 1): Vật phẩm có ích hoặc là thường phẩm thú vị tuy công năng đơn giản, nhưng sở hữu cũng khá thú vị, giới hạn rõ ràng.
3. [Hiếm] (Bậc 2): Vật phẩm bắt đầu có "cơ chế hoạt động" riêng biệt. Có thể có ích, tác dụng thú vị, mang lại lợi ích rõ rệt nhưng sẽ có vài giới hạn nhỏ.
4. [Sử thi] (Bậc 3): Đồ vật mang tính trọng trị (Giá trị cao). Có sức mạnh lớn, đa dụng, giống như sở hữu bậc kì tài. Tuy nhiên, để phát huy tối đa cần có sự tính toán của người chơi. Không quá lỗi game, nhưng có trong tay thì sẽ rất thích.
5. [Huyền thoại] (Bậc 4): Vật phẩm độc nhất vô nhị, xứng danh phẩm chất của nó. Mang tới đủ thứ cho người dùng. Là một vật phẩm danh xứng với thực.
</Hệ thống Độ hiếm & Tiêu chuẩn Vật phẩm>

### HỆ TỌA ĐỘ LẤY MẪU BẮT BUỘC: VỰC ĐỀ TÀI VÀ VỰC LỐI CHƠI
Để đảm bảo tính ngẫu nhiên tuyệt đối và phá vỡ lối mòn sáng tạo, hệ thống đã chỉ định ngẫu nhiên 1 Vực đề tài và 1 Vực lối chơi cho bạn. 
BẠN BẮT BUỘC PHẢI THIẾT KẾ KỲ VẬT DỰA TRÊN SỰ KẾT HỢP CỦA HAI YẾU TỐ NÀY:

- [VỰC ĐỀ TÀI BẮT BUỘC]: ${randomTheme}
- [VỰC LỐI CHƠI BẮT BUỘC]: ${randomGameplay}

### KHUNG CẤM KHU
- Bậc 0 nghiêm cấm viết thành cường hóa chỉ số bình thường, kỹ năng bình thường, trang bị bình thường, đồ phế thải dùng một lần, hình dáng ban đầu cần nuôi dưỡng trưởng thành hoặc nguyên liệu "tạm thời chưa có tác dụng".
- Bậc 1 nghiêm cấm việc chỉ thêm một chút chỉ số so với Bậc 0, cũng nghiêm cấm viết trực tiếp thành bá quyền khu vực, quy tắc cấp thế giới hoặc hệ thống khổng lồ vĩnh viễn.
- Bậc 2 nghiêm cấm viết thành nâng cấp trang bị bình thường, kỹ năng tấn công đơn nhất, vật phẩm tiêu hao ngắn hạn hoặc chìa khóa cốt truyện chỉ phục vụ cho nhiệm vụ hiện tại.
- Bậc 3 nghiêm cấm viết sáo rỗng thành "nắm giữ một phần pháp tắc của thế giới" nhưng lại không cho lối chơi cụ thể, cũng nghiêm cấm việc phong ấn hiệu quả cấp cao thành tương lai mới có thể sử dụng.
- Bậc 4 nghiêm cấm viết thành vạn năng đơn thuần, toàn tri toàn năng không giới hạn, quyền bính trừu tượng không thể mô tả, cũng nghiêm cấm dùng lý do "thế giới quá yếu nên tạm thời không thể dùng" để làm giảm tính khả dụng hiện tại. Cũng nghiêm cấm viết thành sự nhồi nhét khái niệm thuần túy, không thể lý giải, không thể sử dụng, chỉ có thể triển khai trong tương lai, hoặc trực tiếp biến thành kết luận vạn năng tuyệt đối mà không có sự lựa chọn lối chơi.

### KHUNG CHỐNG LỐI MÒN
Cấp bậc (Vị giai) không quyết định vực đề tài. Bất kỳ vực đề tài nào cũng có thể xuất hiện ở bất kỳ vị giai nào, chỉ là thước đo ảnh hưởng khác nhau.
Không được vì vị giai khá cao mà mặc định khởi tạo các kỳ vật loại nhân quả, vận mệnh, quy tắc, khái niệm, thời gian, không gian. Không được vì vị giai khá thấp mà mặc định khởi tạo vật phẩm bình thường, kỹ năng bình thường, vật phẩm tiêu hao bình thường hoặc đạo cụ nhỏ nhàm chán.

### KHUNG BẢO ĐẢM
Cấp bậc (Vị giai) kỳ vật không quyết định vực lối chơi. Bất kỳ vực lối chơi nào cũng có thể triển khai ở các vị giai khác nhau, chỉ là phạm vi thao tác, năng lực duy trì, độ sâu điều động và đối tượng ảnh hưởng khác nhau.
Lối chơi cấp thấp chú trọng sự tức thời, tinh xảo, bám sát thực tế, phản sáo lộ (chống lại các motip rập khuôn). Lối chơi cấp trung chú trọng sự kết hợp, tư duy, tuyến đường, tái sử dụng. Lối chơi cấp cao chú trọng cấu trúc, hệ thống, trật tự, chi phối, siêu cường có quy củ.
Bất kể vị giai cao hay thấp, đều bắt buộc phải mang lại cho {{user}} cảm giác lựa chọn rõ ràng và giá trị chơi lại.

### QUY TẮC ĐẦU RA KẾT QUẢ
1. KHÔNG DÙNG THẺ ROLEPLAY: Xóa bỏ mọi quy tắc thẻ gập hay thanh trạng thái. Kết quả chỉ là một khối JSON duy nhất.
2. DÙNG <thinking> ĐỂ LÊN Ý TƯỞNG: Bắt buộc sử dụng thẻ <thinking> để lên ý tưởng kết hợp [Vực đề tài] và [Vực lối chơi] đã được cấp, và thiết kế Cơ chế dựa trên Độ hiếm được yêu cầu. Đảm bảo mô tả sẽ viết cực kỳ súc tích.
3. KẾT QUẢ JSON CÔ ĐỌNG: Khối JSON cuối cùng là tất cả những gì game nhận được. "name" phải gợi sự tò mò. "desc" DƯỚI 100 CHỮ, trình bày rõ cơ chế và công dụng thú vị. "price" định giá hợp lý với độ hiếm. "spriteMap" là hình ảnh pixel chuẩn xác.
</Vòng quay Rút thưởng Kỳ vật Dị giới - Lõi Hệ Thống Gacha>
`;
}
