const THEME_DOMAINS = [
  "Vực khí vật: Công cụ, đồ chứa, thiết bị, phương tiện, chìa khóa, nội thất, trang sức, máy móc, đồ chơi, nông cụ, nhạc cụ, rương tủ, đèn đuốc, con dấu.",
  "Vực sinh mệnh: Thú, côn trùng, thực vật, quần thể nấm, linh thể, khí linh, quyến thuộc, phân thân, loài sinh thái, trứng, loài sống nhờ.",
  "Vực nơi chốn: Căn phòng, cánh cửa, con đường, đình viện, giếng, tháp, chợ, mê cung, trạm dịch, nhà kho, sào huyệt, kịch trường, nhà bếp.",
  "Vực hành vi: Động tác, nghi thức, cử chỉ tay, trò chơi, giao dịch, nấu nướng, viết lách, trao đổi, gõ, đếm, chờ đợi, mời mọc, gửi đồ, xếp hàng.",
  "Vực quan hệ: Khế ước, thân phận, danh hiệu, quyền thông hành, nợ nần, lời mời, sự che chở, minh ước, bảo lãnh, ghế ngồi, ủy thác.",
  "Vực thông tin: Bản đồ, sổ sách, ngôn ngữ, mật mã, câu đố, ghi chép, mục lục tra cứu, cảnh báo, bản dịch, tọa độ, biên lai, tín tiêu.",
  "Vực tài nguyên: Hạt giống, khoáng sản, nhiên liệu, tiền tệ, thức ăn, nước suối, dược liệu, phân bón, hương liệu, khuôn đúc, công thức, tem thuế.",
  "Vực dị thường: Thời tiết, cái bóng, tiếng vang, khoảng trống, sự lặp lại, sự lệch vị trí, độ trễ, đảo ngược, thiếu trang, nhiễu hạt, nghịch lý tạm thời.",
  "Vực giác quan: Thị giác, thính giác, xúc giác, khứu giác, vị giác, trực giác, đồng cảm, mộng giác.",
  "Vực nhân quả: Xác suất, cái giá phải trả, kết quả, quay ngược, phân nhánh, chứng minh, điều kiện, công lý, quy tắc, tường thuật, vận mệnh.",
  "Vực kỹ nghệ: Thủ công, công pháp, lưu phái, bí quyết, phương pháp huấn luyện, sửa chữa, gia công, diễn tấu, nấu ăn, trồng trọt, thu thập, mở khóa.",
  "Vực xã hội: Tổ chức, chế độ, chức vụ, giấy phép, bảng xếp hạng, cửa hàng, trường học, bưu điện, ngân hàng, tòa án, phòng đấu giá.",
  "Vực sinh thái: Mùa màng, sào huyệt, chuỗi thức ăn, sinh sản, cộng sinh, thanh lọc ô nhiễm, tuần hoàn nước, đất đai, khí hậu, thủy triều, thảm nấm.",
  "Vực thân phận: Mặt nạ, danh thiếp, huy hiệu, giấy thông hành, ngụy trang, lý lịch, thế thân, vị trí vai diễn, thân phận tạm thời, tư cách người bàng quan.",
  "Vực quy tắc: Quy tắc cục bộ, điều kiện miễn trừ, quy tắc thi đấu, quy tắc vào cửa, phương thức phán định, bảng quy trình, phương pháp tính điểm.",
  "Vực công trình: Cơ quan, kết cấu, bánh răng, đường ống, cây cầu, ma trận, trạm bơm, van, đường ray, thang máy, giá đỡ, ổ khóa, cổng sửa chữa.",
  "Vực đời sống: Cư trú, dọn dẹp, lưu trữ đồ đạc, ăn uống, giấc ngủ, tắm rửa, chiếu sáng, sưởi ấm, làm mát, thay đồ, trang trí, lịch trình, nghỉ ngơi.",
  "Vực thương mại: Kệ hàng, đơn hàng, hợp đồng, báo giá, biên lai, hàng mẫu, tiền đặt cọc, búa đấu giá, tuyến đường thương mại, gian hàng, thương lượng giá.",
  "Vực hàng hải/hàng không: Thuyền, buồm, mỏ neo, la bàn, bến cảng, ngọn hải đăng, vật trôi dạt, vé tàu, khoang hàng, phao tiêu, tinh đồ hàng tiêu.",
  "Vực giải trí: Bàn cờ, thẻ bài, xúc xắc, sân khấu, kịch bản, đồ chơi, bản nhạc, máy nhịp, vé số, hộp bí ẩn, thiết bị khu vui chơi.",
  "Vực y tế: Hộp thuốc, băng gạc, bệnh án, phục hồi, vắc-xin, thảo dược, dụng cụ phẫu thuật, khoang an dưỡng, giảm đau, phục hồi chức năng.",
  "Vực khảo cổ: Di chỉ, bản dập, bia đá vỡ, mảnh gốm, chìa khóa cũ, hầm mộ, địa tầng, công cụ cổ đại, bản đồ tàn khuyết, số hiệu di vật."
];

const GAMEPLAY_DOMAINS = [
  "Thao tác chủ động: Khởi động, dừng lại, chuyển đổi, điều chỉnh, ném ra, đánh dấu, thu hồi.",
  "Cải tạo bối cảnh: Thay đổi địa hình, lối đi, đồ chứa, chiếu sáng, dòng tài nguyên, ranh giới, môi trường tạm thời.",
  "Xử lý thông tin: Phát hiện, chắt lọc, phiên dịch, đánh chỉ mục, cảnh báo, che giấu, ngụy trang, xác minh.",
  "Kinh doanh tài nguyên: Sản xuất, chuyển hóa, lưu trữ, sao chép, phân bổ, bồi dưỡng, giao dịch, định giá, tái chế.",
  "Tương tác quan hệ: Ủy quyền, mượn dùng, mời mọc, bảo lãnh, hiệp thương, chia sẻ, cách ly, trao đổi, kết minh.",
  "Phản kích áp chế: Tháo dỡ cơ chế kẻ địch, ngắt đoạn nghi thức, phản kích dò xét, đánh lừa khóa mục tiêu, chuyển dời hiệu ứng xấu.",
  "Ngụy trang đánh lừa: Tạo ra bề ngoài hợp lý hóa, thân phận giả, manh mối giả, nguồn gốc thay thế, phán đoán sai trong nhận thức.",
  "Khám phá giải đố: Mở lối đi ẩn, phát hiện dấu vết, chắp vá manh mối, nhận dạng dị thường, giải mã cấu trúc.",
  "Sản xuất xây dựng: Xây nhà, sửa chữa, chế tạo, luyện chế, nấu nướng, trồng trọt, khâu vá, lắp ráp, bảo trì.",
  "Di chuyển điều động: Dịch chuyển, vận chuyển, triệu hồi, quy hoạch đường đi, biến thành phương tiện, phân luồng.",
  "Quản lý trạng thái: Sắp xếp thương tích, độ mệt mỏi, tài nguyên, thời gian hồi chiêu, tồn kho, thân phận, trạng thái môi trường.",
  "Phối hợp bạn đồng hành: Ủy quyền sử dụng quyền hạn phụ, hình thành đòn hợp kích, hỗ trợ từ xa, bảo vệ.",
  "\"Tấu hài\" phi chiến đấu: Tiện lợi thường ngày, tương phản xã giao, tạo hiểu lầm, mini game, biểu diễn, sưu tầm, trang trí.",
  "Chơi lại dài hạn: Cập nhật bản đồ, duy trì mạng lưới, tích lũy ghi chép, mở rộng căn cứ.",
  "Giao dịch đánh cược: Báo giá, đặt cược, thương lượng giá, đổi hàng, đấu giá, mua chịu, đảo ngược giá cả.",
  "Kinh doanh căn cứ: Mở rộng phòng ốc, điều động kho bãi, sắp xếp ca sản xuất, tuần hoàn sinh thái.",
  "Công xưởng chế tạo: Tháo dỡ, sửa chữa, sao chép linh kiện, tổng hợp vật liệu, nâng cấp thiết bị.",
  "Quy hoạch tuyến đường: Mở lối đi tắt, thiết lập điểm trung chuyển, đánh dấu đường an toàn, thiết lập tuyến tiếp tế.",
  "Trò chơi quy tắc: Thiết lập quy tắc cục bộ, tính điểm thanh toán, phán định thắng thua, hạn chế hành động của đối thủ.",
  "Thao tác chuỗi bằng chứng: Thu thập vật chứng, khôi phục ghi chép, xác minh thật giả, tạo lời giải thích hợp lý, phản kích vu oan.",
  "Nuôi trồng sinh thái: Gieo hạt, thuần hóa, sinh sản, thanh lọc, thu hoạch, kiểm soát dịch bệnh, phục hồi môi trường.",
  "Kinh doanh xã giao: Tạo dựng danh tiếng, gửi thiệp mời, duy trì mối quan hệ, tạo lối thoát, trao gửi quà tặng.",
  "Cứu hộ khẩn cấp: Tị nạn tạm thời, sơ tán, ngăn chặn nguy hiểm, phong tỏa ô nhiễm, khôi phục trật tự.",
  "Sưu tầm trưng bày: Trưng bày, đánh số, lưu trữ, triển lãm, thưởng thức, trao đổi, bộ sưu tập."
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
2. Có lợi ích thú vị: Kỳ vật không nhất thiết phải quá bá đạo, nhưng phải mang lại một công dụng thú vị, hữu ích hoặc buồn cười. Hoàn toàn CÓ THỂ mang theo phản phệ, bóp dái người dùng, hoặc các tác dụng phụ oái ăm để tăng tính tấu hài và bất ngờ.
3. Bí mật: Kỳ vật thuộc quyền sở hữu của {{user}}. Thế giới bên ngoài sẽ tự động "hợp lý hóa" sự tồn tại của kỳ vật.
4. Cơ chế độc lạ: Kỳ vật phải có cách dùng cụ thể, có thể thao tác, có tính "tấu hài", hoặc có thể tương tác với bối cảnh phi chiến đấu.
5. Súc tích: Mô tả năng lực phải mạch lạc. Ưu tiên trả lời: "Có thể làm gì? Phát động ra sao? Nhận được ưu thế gì?".

### PHÂN LOẠI ĐỘ HIẾM (VỊ GIAI)
Hệ thống sẽ chỉ định độ hiếm. Vị giai chỉ ràng buộc thước đo ảnh hưởng, KHÔNG giới hạn đề tài.

<Hệ thống Độ hiếm & Tiêu chuẩn Vật phẩm>
Hệ thống Gacha này ưu tiên sự sáng tạo, giá trị sử dụng và tính giải trí. Mỗi độ hiếm sẽ quyết định giới hạn sức mạnh, tính đa dụng và độ phức tạp trong cơ chế của vật phẩm:

1. [Rác] (Vật phẩm): Những món đồ kỳ cục, hỏng hóc hoặc có công dụng cực kỳ vô thưởng vô phạt. Chúng tồn tại chủ yếu để gây cười, tạo tình huống trớ trêu trong tương tác đời thường.
2. [Thường] (Công cụ Cơ bản): Vật phẩm có ích hoặc là thường phẩm thú vị tuy công năng đơn giản, nhưng sở hữu cũng khá thú vị, giới hạn rõ ràng.
3. [Hiếm] (Cơ chế Đặc biệt): Vật phẩm bắt đầu có "cơ chế hoạt động" riêng biệt. Có thể có ích, tác dụng thú vị, mang lại lợi ích rõ rệt nhưng sẽ có vài giới hạn nhỏ.
4. [Sử thi] (Hảo phẩm): Đồ vật mang tính thay đổi lối chơi (Game-changer). Có sức mạnh lớn, đa dụng, hoặc tự động hóa một quy trình phức tạp. Tuy nhiên, để phát huy tối đa cần có sự tính toán của người chơi. Không quá lỗi game, nhưng có trong tay thì sẽ rất thích.
5. [Huyền thoại] (Đột phá Quy tắc): Vật phẩm độc nhất vô nhị, xứng danh phẩm chất của nó. Mang tới đủ thứ cho người dùng. Là một vật phẩm danh xứng với thực.
</Hệ thống Độ hiếm & Tiêu chuẩn Vật phẩm>

### HỆ TỌA ĐỘ LẤY MẪU BẮT BUỘC: VỰC ĐỀ TÀI VÀ VỰC LỐI CHƠI
Để đảm bảo tính ngẫu nhiên tuyệt đối và phá vỡ lối mòn sáng tạo, hệ thống đã chỉ định ngẫu nhiên 1 Vực đề tài và 1 Vực lối chơi cho bạn. 
BẠN BẮT BUỘC PHẢI THIẾT KẾ KỲ VẬT DỰA TRÊN SỰ KẾT HỢP CỦA HAI YẾU TỐ NÀY:

- [VỰC ĐỀ TÀI BẮT BUỘC]: ${randomTheme}
- [VỰC LỐI CHƠI BẮT BUỘC]: ${randomGameplay}

### QUY TẮC ĐẦU RA KẾT QUẢ
1. KHÔNG DÙNG THẺ ROLEPLAY: Xóa bỏ mọi quy tắc thẻ gập hay thanh trạng thái. Kết quả chỉ là một khối JSON duy nhất.
2. DÙNG <thinking> ĐỂ LÊN Ý TƯỞNG: Bắt buộc sử dụng thẻ <thinking> để lên ý tưởng kết hợp [Vực đề tài] và [Vực lối chơi] đã được cấp, và thiết kế Cơ chế dựa trên Độ hiếm được yêu cầu. Đảm bảo mô tả sẽ viết cực kỳ súc tích.
3. KẾT QUẢ JSON CÔ ĐỌNG: Khối JSON cuối cùng là tất cả những gì game nhận được. "name" phải gợi sự tò mò. "desc" DƯỚI 100 CHỮ, trình bày rõ cơ chế và công dụng thú vị. "price" định giá hợp lý với độ hiếm. "spriteMap" là hình ảnh pixel chuẩn xác.
</Vòng quay Rút thưởng Kỳ vật Dị giới - Lõi Hệ Thống Gacha>
`;
}
