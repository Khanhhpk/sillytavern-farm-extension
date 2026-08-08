export const TEST_MODE = false;
export const MIN = 60 * 1000;
export const GROW = TEST_MODE ? 5 * MIN : null;
export const REGROW = TEST_MODE ? 2 * MIN : null;
export const DAY_MS = 4 * 60 * 60 * 1000;                 // Một ngày trong game = 4 giờ thực (hằng số nội bộ)
export const WATER_CD = TEST_MODE ? 10 * MIN : 2 * 60 * 60 * 1000;   // Sửa #3: hồi chiêu tưới nước 10 phút
export const REGROW_MAX = 3;                                          // Sửa #4: tái sinh tối đa 3 vụ
export const POKE_CD = 10 * MIN;                                      // Sửa #9: hồi chiêu chọc thú cưng rơi tiền
export const TREASURE_CD = TEST_MODE ? 10 * MIN : 2 * 60 * 60 * 1000; // v0.6b: chu kỳ tìm kho báu
export const PETS_OUT_MAX = 8;                                        // Giới hạn số thú ra sân (#25: bỏ điều phái, ra sân = có hiệu lực trên mọi trang)
export const WITCH_STAY = TEST_MODE ? 10 * MIN : 20 * MIN;            // Phù thuỷ ở lại 20 phút (do wen chốt, định vị trứng phục sinh)
export const witchGap = () => TEST_MODE ? 15 * MIN + Math.random() * 20 * MIN : 100 * MIN + Math.random() * 80 * MIN;   // Bản chính thức ≈ mỗi chu kỳ 4h có 1~2 lần
export const SNAP_EDGE = 48;                                          // Sửa #1: lại gần mép mới hít vào
  /* zone: 1 đồng cỏ, 2 vùng nước, 3 khu mỏ (mặc định = 1); hidden: cửa hàng không bán / tìm kho báu không rơi (#34); họ mystery xem plant() */
export const CROPS = {
    /* Số liệu chính thức v1.0 (chốt theo "Bảng số liệu chính thức - chờ duyệt.md"): grow/regrowM tính bằng phút thực */
    douya:     { name: 'Giá đỗ',        grow: 5,   seed: 5,    sell: 12,   sp: 'douya' },
    radish:    { name: 'Củ cải cherry', grow: 10,  seed: 25,   sell: 45,   sp: 'radish' },
    tomato:    { name: 'Cà chua',       grow: 20,  regrowM: 15, seed: 100, sell: 90,   sp: 'tomato', regrow: true },
    strawberry: { name: 'Dâu tây',       grow: 90,  seed: 350,  sell: 800,  sp: 'strawberry' },
    pumpkin:   { name: 'Bí ngô',        grow: 120, seed: 500,  sell: 1300, sp: 'pumpkin' },
    moonberry: { name: 'Dâu ánh trăng', grow: 180, seed: 600,  sell: 1500, sp: 'moonberry' },
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
export const FERTS = {
    compost: { name: 'Phân ủ',       price: 50,  desc: 'Thời gian còn lại của vụ này ×0.75' },
    shiny:   { name: 'Phân lấp lánh', price: 100, desc: 'Khi thu hoạch vụ này rơi thêm số vàng bằng 25% giá bán' },
  };
export const BLOCK_PRICE_PG = {   // v1.0: giá khai hoang riêng cho từng trang (chốt theo bảng B)
    1: [0, 0, 800, 3000, 12000, 30000],
    2: [0, 2000, 6000, 18000, 45000, 90000],
    3: [0, 5000, 15000, 40000, 90000, 180000],
  };

export const WEATHERS = ['Nắng', 'Nắng', 'Nắng', 'Nhiều mây', 'Mưa nhỏ'];

