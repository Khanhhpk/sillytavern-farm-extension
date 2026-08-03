export const MIN = 60 * 1000;
export const DAY_MS = 4 * 60 * 60 * 1000;
export const REGROW_MAX = 3;
export const POKE_CD = 10 * MIN;
export const PETS_OUT_MAX = 8;
export const SNAP_EDGE = 48;

  export const CROPS = {
    /* Số liệu chính thức v1.0 (chốt theo "Bảng số liệu chính thức - chờ duyệt.md"): grow/regrowM tính bằng phút thực */
    douya:     { name: 'Giá đỗ',        grow: 5,   seed: 5,    sell: 12,   sp: 'sprout' },
    radish:    { name: 'Củ cải cherry', grow: 10,  seed: 25,   sell: 45,   sp: 'radish' },
    tomato:    { name: 'Cà chua',       grow: 20,  regrowM: 15, seed: 100, sell: 90,   sp: 'tomato', regrow: true },
    moonberry: { name: 'Dâu tây',       grow: 90,  seed: 350,  sell: 800,  sp: 'mysbG' },
    pumpkin:   { name: 'Bí ngô',        grow: 120, seed: 500,  sell: 1300, sp: 'pumpkin' },
    /* —— Vùng nước (trang 2) —— */
    chuncai:   { name: 'Rau thuần',     grow: 10,  seed: 40,   sell: 60,   sp: 'chuncai',  zone: 2 },
    biqi:      { name: 'Củ năng',       grow: 30,  seed: 120,  sell: 220,  sp: 'biqi',     zone: 2 },
    lingjiao:  { name: 'Củ ấu',         grow: 60,  seed: 220,  sell: 520,  sp: 'lingjiao', zone: 2 },
    jiaobai:   { name: 'Củ niễng',      grow: 60,  seed: 450,  sell: 1150, sp: 'jiaobai',  zone: 2 },
    lianou:    { name: 'Củ sen',        grow: 180, seed: 900,  sell: 3200, sp: 'lianou',   zone: 2 },
    /* —— Khu mỏ (trang 3) —— */
    wujing:    { name: 'Cỏ ô tinh',     grow: 30,  seed: 150,  sell: 340,  sp: 'wujing',   zone: 3 },
    starbush:  { name: 'Bụi sao',       grow: 60,  seed: 400,  sell: 1150, sp: 'starbush', zone: 3 },
    gemflower: { name: 'Hoa bảo thạch', grow: 120, seed: 700,  sell: 2300, sp: 'gemflower', zone: 3 },
    opalvine:  { name: 'Dây leo opal',  grow: 180, regrowM: 120, seed: 1200, sell: 2300, sp: 'opalvine', zone: 3, regrow: true },
    dragoncry: { name: 'Quả long tinh', grow: 360, seed: 2500, sell: 8000, sp: 'dragoncry', zone: 3 },
    /* —— Họ bí ẩn (#29/#34/#49): hạt giống duy nhất, hộp mù hai lớp; không bán; đồng loạt 30 phút —— */
    mystery:   { name: 'Hạt giống bí ẩn', grow: 30, seed: 0, sell: 0,    sp: 'seedLight', hidden: true, zone: 0, seedOnly: true },
    dreamG:    { name: 'Kén mộng',      grow: 30, seed: 0, sell: 300,  sp: 'dreamG', hidden: true, zone: 1 },
    dreamW:    { name: 'Kén trầm mộng', grow: 30, seed: 0, sell: 600,  sp: 'dreamW', hidden: true, zone: 2 },
    dreamM:    { name: 'Kén thạch mộng', grow: 30, seed: 0, sell: 900,  sp: 'dreamM', hidden: true, zone: 3 },
    keyG:      { name: 'Cỏ chìa đồng',  grow: 30, seed: 0, sell: 350,  sp: 'keyG', hidden: true, zone: 1 },
    keyW:      { name: 'Cỏ chìa gỉ',    grow: 30, seed: 0, sell: 700,  sp: 'keyW', hidden: true, zone: 2 },
    keyM:      { name: 'Cỏ chìa bí ẩn', grow: 30, seed: 0, sell: 1050, sp: 'keyM', hidden: true, zone: 3 },
    fangG:     { name: 'Cây bắt ruồi',  grow: 30, seed: 0, sell: 400,  sp: 'fangG', hidden: true, zone: 1 },
    fangW:     { name: 'Hoa bá vương',  grow: 30, seed: 0, sell: 800,  sp: 'fangW', hidden: true, zone: 2 },
    fangM:     { name: 'Hoa nanh rồng', grow: 30, seed: 0, sell: 1200, sp: 'fangM', hidden: true, zone: 3 },
  };

  export const ZONE_NAME = { 1: 'Đồng cỏ', 2: 'Vùng nước', 3: 'Khu mỏ' };
  const FERTS = {
    compost: { name: 'Phân ủ',       price: 50,  desc: 'Thời gian còn lại của vụ này ×0.75' },
    shiny:   { name: 'Phân lấp lánh', price: 100, desc: 'Khi thu hoạch vụ này rơi thêm số vàng bằng 25% giá bán' },
  };

  export const BLOCK_PRICE_PG = {   // v1.0: giá khai hoang riêng cho từng trang (chốt theo bảng B)
    1: [0, 0, 800, 3000, 12000, 30000],
    2: [0, 2000, 6000, 18000, 45000, 90000],
    3: [0, 5000, 15000, 40000, 90000, 180000],
  };

export const WEATHERS = ['Nắng', 'Nắng', 'Nắng', 'Nhiều mây', 'Mưa nhỏ'];

  export const PETS = {
    /* —— Trang 1 —— */
    slime:      { name: 'Slime xanh',    page: 1, price: 0,    starter: true, cry: ['Bụp bụp~', 'Bựppp!', 'Grù grù…', 'Bụp?', 'Nhảy nhảy!'], desc: 'Loại tìm kho báu · bé tròn tổ tiên, bạn đồng hành từ đầu' },
    octo:       { name: 'Bạch tuộc tím', page: 1, price: 500,  cry: ['Ục bốp?', 'Ục ực!', 'Chíu mi!', 'Bóp bóp…', 'Ục bốp bốp!'], desc: 'Loại tìm kho báu · thích chồng lên đầu người khác' },
    slimePink:  { name: 'Slime hồng',    page: 1, price: 600,  cry: ['Bụp hì~', 'Bụp bụp!', 'Hì hì…', 'Bụp chíu~'], desc: 'Loại tìm kho báu · vị dâu (nhưng không ăn được)' },
    octoCream:  { name: 'Bạch tuộc kem', page: 1, price: 700,  cry: ['Bốp…', 'Ục…', '(chậm rì rì) bóp~'], desc: 'Loại tìm kho báu · bậc thầy nguỵ trang, trùng màu với bảng điều khiển' },
    dewSprout:  { job: 'plant', name: 'Bé mầm sương', page: 1, price: 1200, cry: ['Tí tách~', 'Mầm!', '(đội lá lên)'], desc: 'Loại làm việc · chọc một cái là gieo khắp ruộng, hạt xuống đất là nảy mầm' },
    cloudMallow:{ job: 'water', name: 'Bé bông mây',  page: 1, price: 1500,  cry: ['Bông bông~', 'Vù——', '(bay lơ lửng)'], desc: 'Loại làm việc · ra sân là mây mưa nhỏ tự động tưới' },
    /* —— Trang 2 (vé vùng nước) —— */
    ghostBlob:  { name: 'Bé ma nhỏ',     page: 2, price: 1500, cry: ['Uuu~', 'Bay bay…', '(xuyên qua tay bạn)'], desc: 'Loại tìm kho báu · bay được vào những chỗ người khác không vào nổi' },
    batBlob:    { job: 'fert', name: 'Bé bí ẩn',      page: 2, price: 1800, cry: ['……?', '(nghiêng đầu)', '?!'], desc: 'Loại làm việc · chọc một cái là bón phân hàng loạt · phân của nó bón ra cái gì thì không ai đoán nổi' },
    bunny:      { job: 'harvest', name: 'Bé sứa xoăn', page: 2, price: 2200, cry: ['Ục grù~', '(cuộn cuộn xúc tu)', 'Bốp ục!'], desc: 'Loại làm việc · chọc một cái là xúc tu nhẹ nhàng cuộn rau chín vào balo' },   // #43: giữ id bunny để không hỏng save
    impBlob:    { name: 'Bé quỷ nhỏ',    page: 2, price: 3000, cry: ['Hì hì.', 'Hư!', '(giấu cái gì đó đi)'], desc: 'Loại tìm kho báu · khi tìm kho báu sẽ tha về hạt giống bí ẩn đen sì' },
    angelBlob:  { name: 'Bé thiên thần', page: 2, price: 3000, cry: ['Ting~', '(phát sáng dịu dàng)', 'Chúc phúc cho bạn.'], desc: 'Loại tìm kho báu · khi tìm kho báu sẽ ngậm về hạt giống bí ẩn ánh lấp lánh' },
    /* —— Trang 3 (vé khu mỏ) —— */
    prismBlob:  { name: 'Bé lăng quang', page: 3, price: 8000, cry: ['Keng~', '(khúc xạ ra một dải cầu vồng)', 'Kengg!'], desc: 'Loại sản xuất · tìm kho báu mang về mảnh lăng quang (đổi được một đơn ở trang đơn hàng phù thuỷ)' },
    starBell:   { name: 'Bé chuông sao', page: 3, price: 8000, cry: ['Leng keng~', '☆!', '(lắc lắc nhẹ)'], desc: 'Loại sản xuất · tìm kho báu rung rơi mảnh ngôi sao (triệu hồi được phù thuỷ tròn)' },
    /* —— Át chủ bài (#43: giữ id slimeNight để không hỏng save; page 1 = không cần vé, đủ tiền là mang về được, thuần tuý thuế dễ thương) —— */
    slimeNight: { name: 'Bé soda đào',   page: 1, price: 9999, cry: ['Bốp——!', '(nổi một bong bóng nhỏ)', 'Xì~', '(vị ngòn ngọt)'], desc: 'Loại tìm kho báu · tinh linh soda vị đào · dễ thương quá mức nên đắt nhất' },
  };

  export const FLOATY = { cloudMallow: 1, ghostBlob: 1, bunny: 1 };   // Danh sách bay: không nhảy, trượt đều (#43: bé sứa xoăn nhập hội, thành bộ ba bay lơ lửng)
  const GAITS = {                                          // Dáng đi: len = độ dài một bước nhảy, dur = chu kỳ một cú nhảy (ms), hy = độ cao nhảy
    octo:      { len: 8,  dur: 260, hy: -4 },              // Bạch tuộc: bước lắt nhắt bò sát đất
    octoCream: { len: 8,  dur: 290, hy: -4 },              // Bạch tuộc kem: bò còn chậm rì hơn nữa
    _:         { len: 14, dur: 330, hy: -9 },              // Mặc định: kiểu nảy chuẩn của dòng slime
  };

