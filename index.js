// src/store.js
var NS = "star_tavern_farm";
var extensionName = "sillytavern-farm-extension";
var RUNTIME_KEY = "__STAR_TAVERN_FARM__";
var ctx = {
  extension_settings: {},
  eventSource: null,
  event_types: null,
  saveSettingsDebounced: null,
  generateRaw: null,
  S: null,
  ui: null,
  orb: null,
  win: null,
  bagWin: null,
  passWin: null,
  shopWin: null,
  msg: null,
  saveTimer: null,
  witchTimer: null
};
var setExtensionContext = (params) => {
  Object.assign(ctx, params);
};

// src/data.js
var TEST_MODE = false;
var MIN = 60 * 1e3;
var GROW = TEST_MODE ? 5 * MIN : null;
var REGROW = TEST_MODE ? 2 * MIN : null;
var DAY_MS = 4 * 60 * 60 * 1e3;
var WATER_CD = TEST_MODE ? 10 * MIN : 2 * 60 * 60 * 1e3;
var REGROW_MAX = 3;
var POKE_CD = 10 * MIN;
var TREASURE_CD = TEST_MODE ? 10 * MIN : 2 * 60 * 60 * 1e3;
var PETS_OUT_MAX = 8;
var WITCH_STAY = TEST_MODE ? 10 * MIN : 20 * MIN;
var witchGap = () => TEST_MODE ? 15 * MIN + Math.random() * 20 * MIN : 100 * MIN + Math.random() * 80 * MIN;
var SNAP_EDGE = 48;
var CROPS = {
  /* Số liệu chính thức v1.0 (chốt theo "Bảng số liệu chính thức - chờ duyệt.md"): grow/regrowM tính bằng phút thực */
  douya: { name: "Gi\xE1 \u0111\u1ED7", grow: 5, seed: 5, sell: 12, sp: "sprout" },
  radish: { name: "C\u1EE7 c\u1EA3i cherry", grow: 10, seed: 25, sell: 45, sp: "radish" },
  tomato: { name: "C\xE0 chua", grow: 20, regrowM: 15, seed: 100, sell: 90, sp: "tomato", regrow: true },
  moonberry: { name: "D\xE2u t\xE2y", grow: 90, seed: 350, sell: 800, sp: "mysbG" },
  pumpkin: { name: "B\xED ng\xF4", grow: 120, seed: 500, sell: 1300, sp: "pumpkin" },
  /* —— Vùng nước (trang 2) —— */
  chuncai: { name: "Rau thu\u1EA7n", grow: 10, seed: 40, sell: 60, sp: "chuncai", zone: 2 },
  biqi: { name: "C\u1EE7 n\u0103ng", grow: 30, seed: 120, sell: 220, sp: "biqi", zone: 2 },
  lingjiao: { name: "C\u1EE7 \u1EA5u", grow: 60, seed: 220, sell: 520, sp: "lingjiao", zone: 2 },
  jiaobai: { name: "C\u1EE7 ni\u1EC5ng", grow: 60, seed: 450, sell: 1150, sp: "jiaobai", zone: 2 },
  lianou: { name: "C\u1EE7 sen", grow: 180, seed: 900, sell: 3200, sp: "lianou", zone: 2 },
  /* —— Khu mỏ (trang 3) —— */
  wujing: { name: "C\u1ECF \xF4 tinh", grow: 30, seed: 150, sell: 340, sp: "wujing", zone: 3 },
  starbush: { name: "B\u1EE5i sao", grow: 60, seed: 400, sell: 1150, sp: "starbush", zone: 3 },
  gemflower: { name: "Hoa b\u1EA3o th\u1EA1ch", grow: 120, seed: 700, sell: 2300, sp: "gemflower", zone: 3 },
  opalvine: { name: "D\xE2y leo opal", grow: 180, regrowM: 120, seed: 1200, sell: 2300, sp: "opalvine", zone: 3, regrow: true },
  dragoncry: { name: "Qu\u1EA3 long tinh", grow: 360, seed: 2500, sell: 8e3, sp: "dragoncry", zone: 3 },
  /* —— Họ bí ẩn (#29/#34/#49): hạt giống duy nhất, hộp mù hai lớp; không bán; đồng loạt 30 phút —— */
  mystery: { name: "H\u1EA1t gi\u1ED1ng b\xED \u1EA9n", grow: 30, seed: 0, sell: 0, sp: "seedLight", hidden: true, zone: 0, seedOnly: true },
  dreamG: { name: "K\xE9n m\u1ED9ng", grow: 30, seed: 0, sell: 300, sp: "dreamG", hidden: true, zone: 1 },
  dreamW: { name: "K\xE9n tr\u1EA7m m\u1ED9ng", grow: 30, seed: 0, sell: 600, sp: "dreamW", hidden: true, zone: 2 },
  dreamM: { name: "K\xE9n th\u1EA1ch m\u1ED9ng", grow: 30, seed: 0, sell: 900, sp: "dreamM", hidden: true, zone: 3 },
  keyG: { name: "C\u1ECF ch\xECa \u0111\u1ED3ng", grow: 30, seed: 0, sell: 350, sp: "keyG", hidden: true, zone: 1 },
  keyW: { name: "C\u1ECF ch\xECa g\u1EC9", grow: 30, seed: 0, sell: 700, sp: "keyW", hidden: true, zone: 2 },
  keyM: { name: "C\u1ECF ch\xECa b\xED \u1EA9n", grow: 30, seed: 0, sell: 1050, sp: "keyM", hidden: true, zone: 3 },
  fangG: { name: "C\xE2y b\u1EAFt ru\u1ED3i", grow: 30, seed: 0, sell: 400, sp: "fangG", hidden: true, zone: 1 },
  fangW: { name: "Hoa b\xE1 v\u01B0\u01A1ng", grow: 30, seed: 0, sell: 800, sp: "fangW", hidden: true, zone: 2 },
  fangM: { name: "Hoa nanh r\u1ED3ng", grow: 30, seed: 0, sell: 1200, sp: "fangM", hidden: true, zone: 3 }
};
var ZONE_NAME = { 1: "\u0110\u1ED3ng c\u1ECF", 2: "V\xF9ng n\u01B0\u1EDBc", 3: "Khu m\u1ECF" };
var FERTS = {
  compost: { name: "Ph\xE2n \u1EE7", price: 50, desc: "Th\u1EDDi gian c\xF2n l\u1EA1i c\u1EE7a v\u1EE5 n\xE0y \xD70.75" },
  shiny: { name: "Ph\xE2n l\u1EA5p l\xE1nh", price: 100, desc: "Khi thu ho\u1EA1ch v\u1EE5 n\xE0y r\u01A1i th\xEAm s\u1ED1 v\xE0ng b\u1EB1ng 25% gi\xE1 b\xE1n" }
};
var BLOCK_PRICE_PG = {
  // v1.0: giá khai hoang riêng cho từng trang (chốt theo bảng B)
  1: [0, 0, 800, 3e3, 12e3, 3e4],
  2: [0, 2e3, 6e3, 18e3, 45e3, 9e4],
  3: [0, 5e3, 15e3, 4e4, 9e4, 18e4]
};
var WEATHERS = ["N\u1EAFng", "N\u1EAFng", "N\u1EAFng", "Nhi\u1EC1u m\xE2y", "M\u01B0a nh\u1ECF"];

// src/graphics.js
var P = {
  G: "#6cb457",
  D: "#3e7d3a",
  E: "#a4dc8c",
  R: "#dd5548",
  x: "#a33528",
  F: "#e06578",
  f: "#a83a52",
  p: "#ffb8c4",
  O: "#e89a4e",
  Q: "#c9772e",
  q: "#96551f",
  S: "#8a6844",
  h: "#f7c07a",
  B: "#9ed8f2",
  b: "#5fa8cc",
  u: "#3f7ea6",
  T: "#8a6a52",
  Y: "#c2b878",
  y: "#9a915c",
  L: "#b8b0a2",
  M: "#8a8274",
  C: "#f2c231",
  U: "#bf8a1a",
  W: "#fffdf4",
  K: "#3a2c22",
  n: "#ffb0bc",
  V: "#b48ae0",
  v: "#8a5cc0",
  "1": "#aecb87",
  "2": "#a0bd77",
  "3": "#c6dfa0",
  "4": "#8dab68",
  a: "#b99b84",
  c: "#9c7d66",
  d: "#cbb096",
  e: "#8a6a52",
  w: "#9d7458",
  g: "#b08a6d",
  m: "#7d5a42",
  s: "#684a36"
};
function mulberry32(a) {
  return function() {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var SPR = {
  sprout: ["................", "................", "................", "................", "...DD......DD...", "..DEED....DEED..", ".DEGGGD..DGGGED.", ".DGGGGD..DGGGGD.", "..DGGGGDDGGGGD..", "...DGGGDDGGGD...", "....DGGGGGGD....", "......DGGD......", "...TTTDGGDTTT...", "..TTTTTTTTTTTT..", "................", "................"],
  seedling: ["................", "................", "................", "................", "................", "................", "................", "......EE........", ".....DGE........", "......DG........", "......GD........", "......GG........", "....TTGGTT......", "...TTTTTTTT.....", "................", "................"],
  radish: ["....DD...DD.....", "...DGED.DEGD....", "...DGGEDEGGD....", "....DGGDGGD.....", ".....DGGGD......", "......DGD.......", "....fDDGDDf.....", "...fFppFFFFf....", "..fFpppFFFFFf...", "..fFppFFFFFFf...", "..fFpFFFFFFFf...", ".TfFFFFFFFFFfT..", ".TTfFFFFFFFfTT..", "..TTfFFFFFfTT...", "...TTTfffTTT....", "................"],
  tomato: ["................", "......DDDD......", "....DDGEEGDD....", "...DGEGGGGEGD...", "..DGEGGGGGGEGD..", "..DGpRRGGRRpGD..", "..DGRRxGGxRRGD..", "..DGGGGGGGGGGD..", "...DGGGpRGGGD...", "...DGGGRxGGGD...", "....DGGGGGGD....", ".....DGGGGD.....", "....TTDGGDTT....", "...TTTTTTTTTT...", "................", "................"],
  pumpkin: ["................", "................", ".......SS.S.....", "......DSSDS.....", "...qqq.SS.qqq...", "..qOOOqqqqOOOq..", ".qOhhOQOOQOOOOq.", ".qOhOOQOOQOOOOq.", ".qOOOOQOOQOOOOq.", ".qOOOOQOOQOOOOq.", ".qOOOOQOOQOOOOq.", "..qOOOQOOQOOOq..", "...qqOOOOOOqq...", "..TTqqqqqqqqTT..", "...TTTTTTTTTT...", "................"],
  moonberry: ["....W......W....", "................", "......DDDD......", "....DDGEEGDD....", "...DGEGGGGEGD...", "..DGWBBGGBBWGD..", "..DGBBuGGuBBGD..", "..DGGGGGGGGGGD..", "...DGGGWBGGGD...", "...DGGGBuGGGD...", "....DGGGGGGD....", ".....DGGGGD.....", "....TTDGGDTT....", "...TTTTTTTTTT...", ".......W........", "................"],
  weed: ["................", "................", "................", "................", "................", "................", "....Y....Y......", "....Y..Y.Y..Y...", ".....y.Y.y.Y....", "..Y...yYYy......", "...y..YY...Y....", "....yYYY..y.....", ".....YY.Yy......", ".....yYYY.......", "................", "................"],
  stone: ["................", "................", "................", "................", "................", "................", "......LLL.......", "....LLLLLLL.....", "...LLWLLLLLL....", "...LLLLLLLMLL...", "..LLLLLLLLLML...", "..MLLLLLLLLLL...", "..MMLLLLLLLLM...", "...MMMMMMMMM....", "................", "................"],
  slime: ["................", "................", "................", "................", ".....BBBBBB.....", "....BBBBBBBB....", "...BBWWBBBBBB...", "..BBWWBBBBBBBB..", "..BBBBBBBBBBBB..", "..BB33BBBB33BB..", ".BBBBBBBBBBBBBB.", ".BnBBBB33BBBBnB.", ".BBBBBBBBBBBBBB.", ".bBBBBBBBBBBBBb.", "..bbbbbbbbbbbb..", "................"],
  octo: ["................", "................", "................", ".....VVVVVV.....", "....VVVVVVVV....", "...VVWWVVVVVV...", "...VWWVVVVVVV...", "..VVVVVVVVVVVV..", "..VVKKVVVVKKVV..", "..VVVVVVVVVVVV..", "..VnVVVKKVVVnV..", "..VVVVVVVVVVVV..", "..VVVVVVVVVVVV..", "..VV.VV..VV.VV..", "..vv.vv..vv.vv..", "................"],
  coin: ["................", "................", "................", ".....UUUUU......", "....UCCCCCU.....", "...UCCWWCCCU....", "...UCWCCCCCU....", "...UCWCCCCCU....", "...UCCCCCCCU....", "...UCCCCCCCU....", "....UCCCCCU.....", ".....UUUUU......", "................", "................", "................", "................"],
  sun: ["................", ".......C........", "...C...C...C....", "....C.....C.....", "......CCC.......", ".....CCCCC......", "..CC.CCWCC.CC...", ".....CCCCC......", "......CCC.......", "....C.....C.....", "...C...C...C....", ".......C........", "................", "................", "................", "................"],
  flower: ["................", "................", "................", "....nnn.nnn.....", "...npppnpppn....", "...nppnCnppn....", "....nnCCCnn.....", "...nppnCnppn....", "...npppnpppn....", "....nnn.nnn.....", "................", "................", "................", "................", "................", "................"],
  shopIcon: ["................", "................", "................", "....fpf.fpf.....", "....fppffppf....", ".....ffFFff.....", "..qddddFFddddq..", "..qqqqqFFqqqqq..", "...qdddFFdddq...", "...qFFFFFFFFq...", "...qdddFFdddq...", "...qdddFFdddq...", "...qqqqqqqqqq...", "................", "................", "................"],
  bagIcon: ["................", "................", ".....ffff.......", "....f....f......", "...ffffffffff...", "..fddddddddddf..", "..fddddddddddf..", "..fFFFFFFFFFFf..", "..fFFFFCCFFFFf..", "..fFpFFCCFFFFf..", "..fFpFFFFFFFFf..", "..fFFFFFFFFFFf..", "...ffffffffff...", "................", "................", "................"],
  gearIcon: ["................", "................", "................", "................", "......MM........", "....MLLLLM......", "...MLLLLLLM.....", "..MMLLMMLLMM....", "..MMLLMMLLMM....", "...MLLLLLLM.....", "....MLLLLM......", "......MM........", "................", "................", "................", "................"],
  toolSeed: ["................", "................", "................", "...qqqqqqqqqq...", "...qccccccccq...", "...qdddGGdddq...", "...qddGGGGddq...", "...qdddDDdddq...", "...qdddDDdddq...", "...qddeeeeddq...", "...qddddddddq...", "...qqqqqqqqqq...", "................", "................", "................", "................"],
  toolWater: ["................", "................", "................", "..........uu....", ".........u..u...", "..u..uuuuu...u..", "..uu.ukkbbu..u..", ".B.uuubbbbu.u...", "....ubbbbbbuu...", "....ubbbbbbu....", "....ubbbbbbu....", "....uibbbbiu....", ".....uuuuuu.....", "................", "................", "................"],
  toolFert: ["................", "................", "................", "......qq........", ".....q..q.......", "....qaaaaq......", "...qaaaaaaq.....", "..qaaGGaaaaq....", "..qaaGGaaaaq....", "..qaaaaaeaaq....", "..qaeaaaaaaq....", "...qaaaaaaq.....", "....qqqqqq......", "................", "................", "................"],
  toolHarvest: ["................", "................", "................", "................", "................", "................", "...FF.OO.GG.....", "..qqqqqqqqqq....", "...qacacacaq....", "...qcacacacq....", "....qacacaq.....", "....qcacacq.....", ".....qqqqq......", "................", "................", "................"],
  toolShovel: ["................", "................", "................", "......SSSS......", ".......SS.......", ".......SS.......", ".......SS.......", ".......SS.......", ".....MLLLLM.....", "....MLLWLLLM....", "....MLLLLLLM....", ".....MLLLLM.....", "......MMMM......", "................", "................", "................"],
  cloud: ["................", "................", "................", "................", "......LLLL......", ".....LWWWWL.....", "...LLWWWWWWL....", "..LWWWWWWWWWL...", "..LWWWWWWWWWL...", "...LLLLLLLLLL...", "................", "................", "................", "................", "................", "................"],
  raincloud: ["................", "................", "................", "......LLLL......", ".....LWWWWL.....", "...LLWWWWWWL....", "..LWWWWWWWWWL...", "..LWWWWWWWWWL...", "...LLLLLLLLLL...", "................", "....B...B...B...", "................", "...B...B...B....", "................", "................", "................"],
  bush: ["................", "................", ".....DDDD.......", "...DDGEEGDD.....", "..DGEEGGWEGD....", ".DGEGGEEGGGED...", ".DGGEEGGGEGGD...", ".DGGWGGEEGGGD...", ".DGEGGGGGGEGD...", ".DGGGEGGGWGGD...", "..DGGGGGGGGD....", "...DDGGGGDD.....", ".....DDDD.......", "................", "................", "................"],
  pinkgrass: ["................", "................", "....W......W....", ".....pp...pp....", "....pnfp.pfnp...", ".....pp...pp....", "......f....f....", ".....pp...pp....", "....pfnp.pnfp...", ".....pp...pp....", "..W...f....f....", "...BBbfBBBfbBB..", "..BbBBbBbBBbBb..", "...bbBBbbBBbb...", "................", "................"],
  emHeart: ["................", "................", "................", "................", "....ff...ff.....", "...fFpf.fFFf....", "...fFFFfFFFf....", "...fFFFFFFFf....", "....fFFFFFf.....", ".....fFFFf......", "......fFf.......", ".......f........", "................", "................", "................", "................"],
  emStar: ["................", "................", "................", ".......U........", "......UCU.......", "......UCU.......", "...UUUCCCUUU....", "....UCCCCCU.....", ".....UCCCU......", "....UCU.UCU.....", "....U.....U.....", "................", "................", "................", "................", "................"],
  emLeaf: ["................", "................", "................", "................", "......DD........", ".....DGGD.......", "....DGEGGD......", "....DGGGGD......", ".....DGGD.......", "......DD........", ".......D........", ".......D........", "................", "................", "................", "................"],
  emNote: ["................", "................", "................", ".....KKKKK......", ".....K...K......", ".....K...K......", ".....K...K......", "...KKK..KKK.....", "...KKK..KKK.....", "................", "................", "................", "................", "................", "................", "................"],
  lotus: ["................", "................", "......Ff........", ".....pFfp.......", "....pFppFp......", "....fpFFpf......", ".....fppf.......", "...DGGGGGGD.....", "..DGGGGGGGGD....", "...DDGGGGDD.....", "................", "..b..bbb...b....", ".bBbbBBBbbBb....", "..bb..b..bb.....", "................", "................"],
  gem: ["................", "................", ".......v........", "......vVv.......", ".....vVWVv......", ".....vVVVv......", "....vVVWVVv.....", "....vVVVVVv.....", "...vVVWVVVVv....", "..BbvVVVVVvBb...", ".bBBvVVVVVvBBb..", ".bbbvvvvvvvbbb..", "..MMMMMMMMMMM...", "...MMMMMMMMM....", "................", "................"],
  emBang: ["................", "................", ".....ffff.......", ".....fpFf.......", ".....fFFf.......", ".....fFFf.......", ".....fFFf.......", ".....fFFf.......", "......ff........", "................", ".....ffff.......", ".....fFFf.......", ".....ffff.......", "................", "................", "................"]
};
P.k = P.k || "#c4e3f0";
P.i = P.i || "#a9cede";
var PET_P = {
  B: "#9ed8f2",
  b: "#5fa8cc",
  W: "#fffdf4",
  K: "#3a2c22",
  n: "#ffb0bc",
  "3": "#4a7ba6",
  // '3' = ngũ quan của slime xanh (xanh xám, thay cho K nâu đen gốc)
  V: "#b48ae0",
  v: "#8a5cc0",
  p: "#ffb8c4",
  F: "#e06578",
  f: "#a83a52",
  o: "#e8963a",
  t: "#b0641e",
  A: "#f4e8d8",
  z: "#d9c5aa",
  N: "#5c5c6a",
  L: "#b8b0a2",
  M: "#8a8274",
  C: "#f2c231",
  U: "#bf8a1a",
  E: "#fff5dc",
  e: "#d9cfe5",
  I: "#cbeaf2",
  G: "#f6cf62",
  g: "#bd822d",
  D: "#49315f",
  d: "#6f4a89",
  J: "#9b70ad",
  R: "#9569a6",
  r: "#c198ca",
  X: "#fff2bd",
  T: "#8b5936",
  S: "#d99a43",
  Q: "#76545f",
  H: "#56649d",
  h: "#8492c7",
  Y: "#f5d76d",
  y: "#bd923b",
  O: "#fffaf0",
  q: "#cfc5df",
  Z: "#72d4c7",
  c: "#3fa6a5",
  a: "#bff3df",
  k: "#688f57",
  l: "#a6cb7d",
  i: "#c8d8f0",
  j: "#8296c9",
  x: "#8e6bad",
  m: "#d9bd6f",
  u: "#dcf3e7",
  s: "#92c4b0"
};
var PET_SPR = {
  slime: [
    "................",
    "................",
    "................",
    "................",
    ".....BBBBBB.....",
    "....BBBBBBBB....",
    "...BBWWBBBBBB...",
    "..BBWWBBBBBBBB..",
    "..BBBBBBBBBBBB..",
    "..BB33BBBB33BB..",
    ".BBBBBBBBBBBBBB.",
    ".BnBBBB33BBBBnB.",
    ".BBBBBBBBBBBBBB.",
    ".bBBBBBBBBBBBBb.",
    "..bbbbbbbbbbbb..",
    "................"
  ],
  slimePink: [
    "................",
    "................",
    "................",
    "................",
    ".....pppppp.....",
    "....pppppppp....",
    "...ppWWpppppp...",
    "..ppWWpppppppp..",
    "..pppppppppppp..",
    "..ppffppppffpp..",
    ".pppppppppppppp.",
    ".pFppppffppppFp.",
    ".pppppppppppppp.",
    ".FppppppppppppF.",
    "..FFFFFFFFFFFF..",
    "................"
  ],
  slimeNight: [
    ".......O........",
    "......OOO.......",
    ".......t........",
    ".....TTTTTT.....",
    "....TTTTTTTT....",
    "...TCTTTTTTTT...",
    "..TCTTTTTTTTTT..",
    ".TTTTDTTTTDTTTT.",
    ".TTPPTTDDTTPPTT.",
    ".TTTTTTTTTTTTTT.",
    "..tTTTTTTTTTTt..",
    ".tTT.tTTTT.tTTt.",
    "tTt..tTTt..tTTt.",
    ".t...tT.tT...tT.",
    ".....t...t......",
    "................"
  ],
  octo: [
    "................",
    "................",
    "................",
    ".....VVVVVV.....",
    "....VVVVVVVV....",
    "...VVWWVVVVVV...",
    "...VWWVVVVVVV...",
    "..VVVVVVVVVVVV..",
    "..VVKKVVVVKKVV..",
    "..VVVVVVVVVVVV..",
    "..VnVVVKKVVVnV..",
    "..VVVVVVVVVVVV..",
    "..VVVVVVVVVVVV..",
    "..VV.VV..VV.VV..",
    "..vv.vv..vv.vv..",
    "................"
  ],
  octoCream: [
    "................",
    "................",
    "................",
    ".....AAAAAA.....",
    "....AAAAAAAA....",
    "...AAWWAAAAAA...",
    "...AWWAAAAAAA...",
    "..AAAAAAAAAAAA..",
    "..AAAAAAAAAAAA..",
    "..AAKKAAAAKKAA..",
    "..AnAAAAAAAAnA..",
    "..AAAAAAAAAAAA..",
    "..AAAAAAAAAAAA..",
    "..AA.AA..AA.AA..",
    "..zz.zz..zz.zz..",
    "................"
  ],
  bunny: [
    "......S.........",
    ".....SSS........",
    "......S.........",
    ".....IIIIII.....",
    "....IIIIIIII....",
    "...IIBIIIIIII...",
    "..IIBIIIIIIIII..",
    ".IIIIYIIIIYIIII.",
    ".IIPPIISSIIPPII.",
    ".IIIIIIIIIIIIII.",
    "..iIIIIIIIIIIi..",
    "...iiiiiiiiii...",
    "...LL..LL..LL...",
    "..LL...LL...LL..",
    "..L....L....L...",
    ".LL...LL...LL..."
  ],
  batBlob: [
    "................",
    "...oo......oo...",
    "...ooo....ooo...",
    "...oooo..oooo...",
    "....oooooooo....",
    "...oooooooooo...",
    "..oooooooooooo..",
    "..ooKKooooKKoo..",
    "ttooooonnooooott",
    ".toooooooooooot.",
    ".onoooooooooono.",
    ".oooooooooooooo.",
    ".oooooooooooooo.",
    ".toooooooooooot.",
    "..tttttttttttt..",
    "................"
  ],
  ghostBlob: [
    "................",
    ".......uu.......",
    "......uuuu......",
    ".....uuuuuu.....",
    "....uuWuuuuu....",
    "...uuWuuuuuuu...",
    "..uuuuuuuuuuuu..",
    ".uuuuQuuuuQuuuu.",
    ".unnuuuQQuuunnu.",
    ".uuuuuuuuuuuuuu.",
    "uuuuuuuuuuuuuuuu",
    "suuuuuuuuuuuuuus",
    ".suuuuuuuuuuuus.",
    "..suuuuuuuuuus..",
    "...suus..suus...",
    "................"
  ],
  impBlob: [
    "................",
    "................",
    "....f......f....",
    "....ff....ff....",
    ".....FFFFFF.....",
    "....FFFFFFFF....",
    "...FFWWFFFFFF...",
    ".KFFWWFFFFFFFFK.",
    "KKFFFFFFFFFFFFKK",
    "..FFKKFFFFKKFF..",
    ".FFFFFFFFFFFFFF.",
    ".FnFFFFKKFFFFnF.",
    ".FFFFFFFFFFFFFF.",
    ".fFFFFFFFFFFFFf.",
    "..ffffffffffff..",
    "................"
  ],
  angelBlob: [
    ".....gggggg.....",
    "...gGG....GGg...",
    ".....gggggg.....",
    "................",
    ".....EEEEEE.....",
    "....EEEEEEEE....",
    "...EEWEEEEEEE...",
    ".WEEWEEEEEEEEEW.",
    "WIEEEEEEEEEEEEEW",
    "IEEEQQEEEEQQEEEI",
    ".EnnEEEQQEEEnnE.",
    ".EEEEEEEEEEEEEE.",
    ".eEEEEEEEEEEEEe.",
    "..eEEEEEEEEEEe..",
    "...eeeeeeeeee...",
    "................"
  ],
  witchBlob: [
    "...DDD..........",
    "..DDDJ..........",
    "...DDJDD........",
    "...DDdDDDD......",
    "..DDdddDDDDD....",
    ".DDDddGGdddDDD..",
    "DDDDDDDDDDDDDDDD",
    "...RRRRRRRRRR..T",
    "..RrRRRRRRRRRR.T",
    ".RrRRRRRRRRRRRR.",
    ".RRRXKRRRRDDRRR.",
    ".RnRRRRRGDRRRnR.",
    ".RRRRRRRRRRRRR.T",
    "..dRRRRRRRRRd.T.",
    "...ddddddddd.SSS",
    "...........SSSSS"
  ],
  starBell: [
    "..Y....Y........",
    ".......Y....Y...",
    ".....YYYYY......",
    ".Y....YYY.......",
    "......Y.Y.......",
    ".....HHHHHH.....",
    "....HHHHHHHH....",
    "...HHhHHHHHHH...",
    "..HHhHHHHHHHHH..",
    "..HHHHHHHHHHHH..",
    ".HHHmmHHHHmmHHH.",
    ".HYHHHHHHHHHHYH.",
    ".HHHHHHHHHHHHHH.",
    ".hHHHHHHHHHHHHh.",
    "..hHHHHHHHHHHh..",
    "...hhhhhhhhhh..."
  ],
  cloudMallow: [
    "................",
    "................",
    "......OOOO......",
    "....OOOOOOOO....",
    "..OOOOOOOOOOOO..",
    ".OOOWOOOOOOOOOO.",
    "OOOOOOOOOOOOOOOO",
    "OOOOQOOOOOOQOOOO",
    "OOnOOOOQQOOOOnOO",
    "OOOOOOOOOOOOOOOO",
    ".qOOOOOOOOOOOOq.",
    "..qqOOqqqqOOqq..",
    "....I......I....",
    "....II....II....",
    ".....I....I.....",
    "................"
  ],
  dewSprout: [
    ".....kk..kk.....",
    "....kllkkllk....",
    "......kk........",
    ".......ZZ.......",
    "......ZZZZ......",
    ".....ZZZZZZ.....",
    "....ZZaZZZZZ....",
    "...ZZaZZZZZZZ...",
    "..ZZZZZZZZZZZZ..",
    ".ZZZZQZZZZQZZZZ.",
    ".ZnZZZZQZZZZZnZ.",
    ".ZZZZZZZZZZZZZZ.",
    ".cZZZZZZZZZZZZc.",
    "..cZZZZZZZZZZc..",
    "...cccccccccc...",
    "................"
  ],
  prismBlob: [
    "..j..........j..",
    ".jij........jij.",
    "..j..........j..",
    "......xxxx.....y",
    "y...xxiiiixx..yY",
    "Yy.xiiiiiiiix..y",
    "y.xiiiiiiiiiix..",
    ".xiiiiiiiiiiiix.",
    ".xiiQQiiiiQQiix.",
    ".xiriiiiQiiiirx.",
    ".xiiiiiiiiiiiix.",
    "..xiiiiiiiiix...",
    "...xiiiiiiix....",
    "....xxxxxxxx....",
    "......jjjj......",
    "................"
  ]
};
var petLinear = (x1, y1, x2, y2, stops) => ({ type: "linear", x1, y1, x2, y2, stops });
var PET_FX = {
  batBlob: {
    // Bé bí ẩn: bản cam dịu thứ hai (wen chốt: pha sữa giảm độ tinh khiết nhưng giữ dòng máu cam; bản oải hương để dành cho kho da DLC)
    o: petLinear(1, 2, 15, 14, [["0%", "#ffe0a6"], ["46%", "#f7b374"], ["100%", "#ea9060"]]),
    t: petLinear(0, 7, 16, 15, [["0%", "#d18a58"], ["100%", "#b06a44"]]),
    K: "#6b4548",
    n: "#ffcdd8"
  },
  slimeNight: {
    // Bé soda đào (giữ id slimeNight để không hỏng save, #43)
    T: petLinear(1, 2, 15, 14, [["0%", "#ffe8a6"], ["35%", "#ffbdc9"], ["64%", "#ff94bf"], ["100%", "#c99bf5"]]),
    t: petLinear(0, 4, 16, 15, [["0%", "#f28bc2"], ["100%", "#9b78de"]]),
    C: "#effffb",
    D: "#5b4568",
    P: "#65e0cf",
    O: petLinear(0, 0, 15, 3, [["0%", "#b9fff3"], ["100%", "#9ba7ff"]])
  },
  bunny: {
    // Bé sứa xoăn (giữ id bunny để không hỏng save, #43)
    I: petLinear(1, 2, 15, 14, [["0%", "#c8f4ff"], ["28%", "#8cddff"], ["62%", "#58b7f2"], ["100%", "#6576dc"]]),
    i: petLinear(0, 7, 16, 15, [["0%", "#579dd1"], ["100%", "#5459aa"]]),
    B: "#effcff",
    Y: "#fff0a6",
    P: "#ff8fca",
    S: petLinear(0, 0, 16, 4, [["0%", "#fff6aa"], ["100%", "#a8dbff"]]),
    L: petLinear(0, 11, 16, 16, [["0%", "#bdeaff"], ["100%", "#8d90ee"]])
  }
};
var petCache = /* @__PURE__ */ new Map();
function petSVG(name, px) {
  const key = name + "@" + px;
  if (petCache.has(key)) return petCache.get(key);
  const map = PET_SPR[name];
  if (!map) return "";
  const fx = PET_FX[name];
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx2 = canvas.getContext("2d");
  const fills = {};
  if (fx) for (const ch in fx) {
    const v = fx[ch];
    if (v && typeof v === "object") {
      const grad = ctx2.createLinearGradient(v.x1, v.y1, v.x2, v.y2);
      v.stops.forEach((s) => grad.addColorStop(parseFloat(s[0]) / 100, s[1]));
      fills[ch] = grad;
    } else fills[ch] = v;
  }
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const c = fills[ch] || PET_P[ch];
      if (c) {
        ctx2.fillStyle = c;
        ctx2.fillRect(x, y, 1, 1);
      }
    }
  });
  const out = `<img draggable="false" width="${px}" height="${px}" src="${canvas.toDataURL("image/png")}" style="display:block; image-rendering:pixelated;" />`;
  petCache.set(key, out);
  return out;
}
var PETS = {
  /* —— Trang 1 —— */
  slime: { name: "Slime xanh", page: 1, price: 0, starter: true, cry: ["B\u1EE5p b\u1EE5p~", "B\u1EF1ppp!", "Gr\xF9 gr\xF9\u2026", "B\u1EE5p?", "Nh\u1EA3y nh\u1EA3y!"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 b\xE9 tr\xF2n t\u1ED5 ti\xEAn, b\u1EA1n \u0111\u1ED3ng h\xE0nh t\u1EEB \u0111\u1EA7u" },
  octo: { name: "B\u1EA1ch tu\u1ED9c t\xEDm", page: 1, price: 500, cry: ["\u1EE4c b\u1ED1p?", "\u1EE4c \u1EF1c!", "Ch\xEDu mi!", "B\xF3p b\xF3p\u2026", "\u1EE4c b\u1ED1p b\u1ED1p!"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 th\xEDch ch\u1ED3ng l\xEAn \u0111\u1EA7u ng\u01B0\u1EDDi kh\xE1c" },
  slimePink: { name: "Slime h\u1ED3ng", page: 1, price: 600, cry: ["B\u1EE5p h\xEC~", "B\u1EE5p b\u1EE5p!", "H\xEC h\xEC\u2026", "B\u1EE5p ch\xEDu~"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 v\u1ECB d\xE2u (nh\u01B0ng kh\xF4ng \u0103n \u0111\u01B0\u1EE3c)" },
  octoCream: { name: "B\u1EA1ch tu\u1ED9c kem", page: 1, price: 700, cry: ["B\u1ED1p\u2026", "\u1EE4c\u2026", "(ch\u1EADm r\xEC r\xEC) b\xF3p~"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 b\u1EADc th\u1EA7y ngu\u1EF5 trang, tr\xF9ng m\xE0u v\u1EDBi b\u1EA3ng \u0111i\u1EC1u khi\u1EC3n" },
  dewSprout: { job: "plant", name: "B\xE9 m\u1EA7m s\u01B0\u01A1ng", page: 1, price: 1200, cry: ["T\xED t\xE1ch~", "M\u1EA7m!", "(\u0111\u1ED9i l\xE1 l\xEAn)"], desc: "Lo\u1EA1i l\xE0m vi\u1EC7c \xB7 ch\u1ECDc m\u1ED9t c\xE1i l\xE0 gieo kh\u1EAFp ru\u1ED9ng, h\u1EA1t xu\u1ED1ng \u0111\u1EA5t l\xE0 n\u1EA3y m\u1EA7m" },
  cloudMallow: { job: "water", name: "B\xE9 b\xF4ng m\xE2y", page: 1, price: 1500, cry: ["B\xF4ng b\xF4ng~", "V\xF9\u2014\u2014", "(bay l\u01A1 l\u1EEDng)"], desc: "Lo\u1EA1i l\xE0m vi\u1EC7c \xB7 ra s\xE2n l\xE0 m\xE2y m\u01B0a nh\u1ECF t\u1EF1 \u0111\u1ED9ng t\u01B0\u1EDBi" },
  /* —— Trang 2 (vé vùng nước) —— */
  ghostBlob: { name: "B\xE9 ma nh\u1ECF", page: 2, price: 1500, cry: ["Uuu~", "Bay bay\u2026", "(xuy\xEAn qua tay b\u1EA1n)"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 bay \u0111\u01B0\u1EE3c v\xE0o nh\u1EEFng ch\u1ED7 ng\u01B0\u1EDDi kh\xE1c kh\xF4ng v\xE0o n\u1ED5i" },
  batBlob: { job: "fert", name: "B\xE9 b\xED \u1EA9n", page: 2, price: 1800, cry: ["\u2026\u2026?", "(nghi\xEAng \u0111\u1EA7u)", "?!"], desc: "Lo\u1EA1i l\xE0m vi\u1EC7c \xB7 ch\u1ECDc m\u1ED9t c\xE1i l\xE0 b\xF3n ph\xE2n h\xE0ng lo\u1EA1t \xB7 ph\xE2n c\u1EE7a n\xF3 b\xF3n ra c\xE1i g\xEC th\xEC kh\xF4ng ai \u0111o\xE1n n\u1ED5i" },
  bunny: { job: "harvest", name: "B\xE9 s\u1EE9a xo\u0103n", page: 2, price: 2200, cry: ["\u1EE4c gr\xF9~", "(cu\u1ED9n cu\u1ED9n x\xFAc tu)", "B\u1ED1p \u1EE5c!"], desc: "Lo\u1EA1i l\xE0m vi\u1EC7c \xB7 ch\u1ECDc m\u1ED9t c\xE1i l\xE0 x\xFAc tu nh\u1EB9 nh\xE0ng cu\u1ED9n rau ch\xEDn v\xE0o balo" },
  // #43: giữ id bunny để không hỏng save
  impBlob: { name: "B\xE9 qu\u1EF7 nh\u1ECF", page: 2, price: 3e3, cry: ["H\xEC h\xEC.", "H\u01B0!", "(gi\u1EA5u c\xE1i g\xEC \u0111\xF3 \u0111i)"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 khi t\xECm kho b\xE1u s\u1EBD tha v\u1EC1 h\u1EA1t gi\u1ED1ng b\xED \u1EA9n \u0111en s\xEC" },
  angelBlob: { name: "B\xE9 thi\xEAn th\u1EA7n", page: 2, price: 3e3, cry: ["Ting~", "(ph\xE1t s\xE1ng d\u1ECBu d\xE0ng)", "Ch\xFAc ph\xFAc cho b\u1EA1n."], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 khi t\xECm kho b\xE1u s\u1EBD ng\u1EADm v\u1EC1 h\u1EA1t gi\u1ED1ng b\xED \u1EA9n \xE1nh l\u1EA5p l\xE1nh" },
  /* —— Trang 3 (vé khu mỏ) —— */
  prismBlob: { name: "B\xE9 l\u0103ng quang", page: 3, price: 8e3, cry: ["Keng~", "(kh\xFAc x\u1EA1 ra m\u1ED9t d\u1EA3i c\u1EA7u v\u1ED3ng)", "Kengg!"], desc: "Lo\u1EA1i s\u1EA3n xu\u1EA5t \xB7 t\xECm kho b\xE1u mang v\u1EC1 m\u1EA3nh l\u0103ng quang (\u0111\u1ED5i \u0111\u01B0\u1EE3c m\u1ED9t \u0111\u01A1n \u1EDF trang \u0111\u01A1n h\xE0ng ph\xF9 thu\u1EF7)" },
  starBell: { name: "B\xE9 chu\xF4ng sao", page: 3, price: 8e3, cry: ["Leng keng~", "\u2606!", "(l\u1EAFc l\u1EAFc nh\u1EB9)"], desc: "Lo\u1EA1i s\u1EA3n xu\u1EA5t \xB7 t\xECm kho b\xE1u rung r\u01A1i m\u1EA3nh ng\xF4i sao (tri\u1EC7u h\u1ED3i \u0111\u01B0\u1EE3c ph\xF9 thu\u1EF7 tr\xF2n)" },
  /* —— Át chủ bài (#43: giữ id slimeNight để không hỏng save; page 1 = không cần vé, đủ tiền là mang về được, thuần tuý thuế dễ thương) —— */
  slimeNight: { name: "B\xE9 soda \u0111\xE0o", page: 1, price: 9999, cry: ["B\u1ED1p\u2014\u2014!", "(n\u1ED5i m\u1ED9t bong b\xF3ng nh\u1ECF)", "X\xEC~", "(v\u1ECB ng\xF2n ng\u1ECDt)"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 tinh linh soda v\u1ECB \u0111\xE0o \xB7 d\u1EC5 th\u01B0\u01A1ng qu\xE1 m\u1EE9c n\xEAn \u0111\u1EAFt nh\u1EA5t" }
};
var PASSES = {
  water: { name: "V\xE9 v\xF9ng n\u01B0\u1EDBc", price: 6e3, desc: "M\u1EDF kho\xE1 ru\u1ED9ng v\xF9ng n\u01B0\u1EDBc (trang 2) + quy\u1EC1n mua b\xE9 tr\xF2n trang 2 v\xE0 h\u1EA1t gi\u1ED1ng thu\u1EF7 sinh, t\u1EB7ng k\xE8m \xF4 ru\u1ED9ng n\u1ED5i \u0111\u1EA7u ti\xEAn" },
  mine: { name: "V\xE9 khu m\u1ECF", price: 35e3, desc: "M\u1EDF kho\xE1 ru\u1ED9ng khu m\u1ECF (trang 3) + quy\u1EC1n mua b\xE9 tr\xF2n trang 3 v\xE0 h\u1EA1t gi\u1ED1ng khu m\u1ECF, t\u1EB7ng k\xE8m lu\u1ED1ng \u01B0\u01A1m \u0111\u1EA7u ti\xEAn" }
};
var C2 = {
  chuncai: { p: { g: "#2e6a50", G: "#4d9a6e", W: "#a8d8bc", o: "#8a5540" }, m: [
    "................",
    "................",
    "....gg....gg....",
    "...gGGg..gGGWg..",
    "...gGGGg.gGGg...",
    "....gg....gg....",
    ".......o........",
    "..gg...o...gg...",
    ".gGGWg.o.gGGg...",
    ".gGGg..o.gGWGg..",
    "..gg...o..gg....",
    "................",
    "................",
    "................",
    "................",
    "................"
  ] },
  biqi: { p: { t: "#4d7a26", T: "#79b544", m: "#3f2a20", M: "#6a4534", W: "#f2e8d8" }, m: [
    "....t..T..t.....",
    "....t.T..t......",
    ".....tT.tT......",
    "....T.t.t.......",
    ".....t.tT.......",
    "......ttt.......",
    ".......t........",
    ".......t........",
    ".......t........",
    "......mmm.......",
    "..mmmmMMMm.mmm..",
    ".mMMWmMMMMmMMm..",
    ".mMMMmMMMMmMWm..",
    "..mmm.mmmm.mm...",
    "................",
    "................"
  ] },
  lingjiao: { p: { g: "#2e6a50", G: "#4d9a6e", K: "#241b2e", P: "#5a3f66", W: "#b79ae0" }, m: [
    "................",
    ".......gg.......",
    "....ggGGGGgg....",
    "...gGGgGGgGGg...",
    "....ggGGGGgg....",
    ".......gg.......",
    "................",
    "................",
    "...KK......KK...",
    "....KK....KK....",
    ".....KKKKKK.....",
    "....KPPKKPPK....",
    "....KPPWPPPK....",
    ".....KKKKKK.....",
    "................",
    "................"
  ] },
  jiaobai: { p: { g: "#3f7a30", G: "#6aab44", W: "#f6f2e2", s: "#d9d0b8" }, m: [
    "....g....g......",
    "...gG...gG.g....",
    "...gG..gGG.Gg...",
    "..gGG..gGG.Gg...",
    "..gGG.gGGg.GG...",
    "..gGGggGGggGG...",
    "..gGGgGGGgGGG...",
    "..gGGgGGGgGGg...",
    "..sWWsWWWsWWs...",
    "..sWWsWWWsWWs...",
    "..sWWsWWWsWWs...",
    "..sWWsWWWsWWs...",
    "................",
    "................",
    "................",
    "................"
  ] },
  lianou: { p: { f: "#c25a78", P: "#f5aec2", W: "#fff0f5", g: "#2e6a50", G: "#4d9a6e", B: "#245a40", o: "#e8dcc2", O: "#c2b090" }, m: [
    "......ff........",
    ".....fPPf.......",
    "....fPWWPf......",
    "..ffPPPPPPff....",
    ".fPPfPWWPfPPf...",
    "..fPPPPPPPPf....",
    "...ffPPPPff.....",
    ".....gGGg.......",
    "...gGGGGGGg.....",
    "..gGGGBGGGGg....",
    "...gGGGGGGg.....",
    "................",
    "...OooOooO......",
    "...OooOooO......",
    "....OOOOO.......",
    "................"
  ] },
  wujing: { p: { K: "#3f2a58", V: "#8a64c0", W: "#dcc8f5" }, m: [
    ".......K........",
    "......KVK.......",
    "..K...KVK...K...",
    ".KVK..KVK..KVK..",
    ".KVK.KKVKK.KVK..",
    ".KVWKKVWVKKVVK..",
    "..KVKKVVVKKVK...",
    "..KVVKVVVKVVK...",
    "...KKKVVVKKK....",
    ".....KVVVK......",
    "......KKK.......",
    "................",
    "................",
    "................",
    "................",
    "................"
  ] },
  starbush: { p: { b: "#2e5a34", B: "#4f8a55", s: "#ffd94d", S: "#fff2b0", t: "#8a6244", y: "#ffd94d" }, m: [
    "..y..........y..",
    ".....bbbbbb.....",
    "...bbBBBBBBbb...",
    "..bBBsBBBBBBBb..",
    "..bBsSsBBBBBBb..",
    ".bBBBsBBBBsBBBb.",
    ".bBBBBBBBsSsBBb.",
    ".bBBBBBsBBsBBBb.",
    "..bBBBsSsBBBBb..",
    "...bbBBsBBBbb...",
    ".....bbbbbb.....",
    ".y.....tt.....y.",
    ".......tt.......",
    "......t..t......",
    "................",
    "................"
  ] },
  gemflower: { p: { K: "#5a4268", r: "#d95a6a", R: "#f090a0", b: "#4a7ac2", B: "#8fb8ec", g: "#38a06a", G: "#7cd4a4", p: "#8a5cc0", P: "#c0a0e8", y: "#c89a38", Y: "#ffd94d", W: "#fff2b0", t: "#4d7a26", T: "#79b544" }, m: [
    "................",
    "......KrrK......",
    ".....KrRRrK.....",
    ".....KrRRrK.....",
    "..KKK.KrrK.KKK..",
    ".KbBBK.yy.KgGGK.",
    ".KbBBKyYWYKgGGK.",
    "..KKK.yYYy.KKK..",
    ".......yy.......",
    ".....KpPK.......",
    "....KpPPpK......",
    "....KpPPpK..T...",
    ".....KppK..T....",
    "......tt..T.....",
    "......ttT.......",
    "................"
  ] },
  opalvine: { p: { t: "#3f5a5a", T: "#5c8080", K: "#8a7a9a", o: "#f2ecf5", P: "#f5b8d0", C: "#8adbe0" }, m: [
    "......t.........",
    "...t..tt........",
    "...tt..t...t....",
    "....t..tt.tt....",
    ".KK..t..tt......",
    "KooK..t....KK...",
    "KoPCK.tt..KooK..",
    ".KK....t..KoCK..",
    ".......t...KK...",
    "....KK.t........",
    "...KooKt........",
    "...KoCPK........",
    "....KK.t........",
    ".......t........",
    "................",
    "................"
  ] },
  dragoncry: { p: { K: "#8a2a26", T: "#e8604a", t: "#c23c34", W: "#ffe0a0", g: "#3f7a30", G: "#6aab44" }, m: [
    ".......gg.......",
    "......gGGg......",
    ".......KK.......",
    ".....KKTTKK.....",
    "....KTtTTtTK....",
    "...KTTTTTTTTK...",
    "...KTtTWWtTTK...",
    "..KTTTWWWWTTTK..",
    "..KTtTTWWTTtTK..",
    "...KTTTTTTTTK...",
    "...KTtTTTTtTK...",
    "....KTTTTTTK....",
    ".....KKTTKK.....",
    ".......KK.......",
    "................",
    "................"
  ] },
  seedDark: { p: { K: "#1c1420", k: "#33263d", v: "#8a2a4a", a: "#5a3f78" }, m: [
    "................",
    "................",
    ".....K...K......",
    ".....KK.KK......",
    "......KkK.......",
    ".....KkkkK......",
    "....KkKkkkK.....",
    "....KkkkvkK.....",
    "....KkkkkkK.....",
    ".....KkkkK......",
    "......KKK.......",
    "................",
    "...a...a...a....",
    "................",
    "................",
    "................"
  ] },
  seedLight: { p: { h: "#ffe89a", y: "#c8a94a", Y: "#f5dfa0", W: "#fff8e0", s: "#ffd94d" }, m: [
    "................",
    ".....hh.hh......",
    "....h.....h.....",
    "................",
    "......yy........",
    ".....yYYy.......",
    "....yYWYYy......",
    "....yYYYYy......",
    "....yYYYYy......",
    ".....yYYy.......",
    "......yy........",
    "................",
    "...s....s...s...",
    "................",
    "................",
    "................"
  ] },
  /* —— v0.9b (#49): ba họ bí ẩn · kén mộng / cỏ chìa khoá / cây ăn thịt (bản thiết kế chốt) —— */
  dreamG: { p: { K: "#b8a890", W: "#f8f4ea", w: "#e4dcc8", s: "#d9cfc0", p: "#f5b8d0", t: "#8a6844", g: "#4d7a26" }, m: [
    "........t.......",
    ".......ts.......",
    "......s.s.......",
    ".....sKKs.......",
    "....KWWWWK......",
    "...KWwWWWWK.....",
    "..KWWWWWWWWK....",
    "..KWwWWWWwWK....",
    "..KWWWWWWWWK....",
    "..KWWwWWWWWK....",
    "...KWWWWwWK.....",
    "....KWWWWK......",
    ".....KKKK.......",
    "......p.........",
    ".......p........",
    "...g.......g...."
  ] },
  dreamW: { p: { K: "#4a7a94", B: "#bcdde8", b: "#94c2d4", W: "#eef8fa", d: "#7a94b8", o: "#d8ecf2" }, m: [
    "................",
    "......KKK.......",
    "....KKBBBK......",
    "...KBBWBBBK.....",
    "..KBBBBBBBBK....",
    "..KBBdddBBBK....",
    ".KBBddBddBBBK...",
    ".KBBdBBBdBBBK...",
    ".KBBddBddBBbK...",
    "..KBBdddBBbK....",
    "..KBBBBBBbbK....",
    "...KBBBBbbK.....",
    "....KKbbbK......",
    "......KKK.......",
    "..o.........o...",
    "......o........."
  ] },
  dreamM: { p: { K: "#3f3a50", S: "#8d8398", s: "#6d657c", c: "#241f2c", O: "#ffd94d", o: "#ffb060", d: "#575070" }, m: [
    "................",
    "......KKK.......",
    "....KKSSSK......",
    "...KSSSSSSK.....",
    "..KSSsSSSSSK....",
    "..KSScSSSsSK....",
    ".KSSScOcSSSSK...",
    ".KSsScOOcSSSK...",
    ".KSSSScOcSsSK...",
    "..KSSSScSSSK....",
    "..KsSSSSSsSK....",
    "...KSSSSSSK.....",
    "....KKSSSK......",
    "......KKK.......",
    "...d.......d....",
    "................"
  ] },
  keyG: { p: { t: "#4d7a26", T: "#79b544", c: "#a8681f", C: "#d99a43", W: "#ffe9b8", g: "#79b544" }, m: [
    "...tt...........",
    "..t..tt.........",
    "..t....tt.......",
    ".tT......tt.....",
    ".tT........t....",
    "..t.......CCC...",
    "..t.......CWC...",
    "..t.......CCC...",
    ".tTt.......c....",
    "..t........c....",
    "..t........cC...",
    "..t........c....",
    "..t........cC...",
    ".gtg............",
    "g.t..g..........",
    "................"
  ] },
  keyW: { p: { t: "#2e6a50", T: "#4d9a6e", c: "#3f7a5c", C: "#7cc4a4", W: "#c8ecd8", v: "#245a40", o: "#d8ecf2" }, m: [
    "...tt...........",
    "..t..tt.........",
    "..t....tt.......",
    ".tT......tt.....",
    ".tT........t....",
    "..t.......CCC...",
    "..t.......CWC...",
    "..t.......CCC...",
    ".tTt.......c....",
    "..t....o...cv...",
    "..t........cC...",
    "..t........cv...",
    "..t........cC...",
    "..t.............",
    ".o..............",
    "................"
  ] },
  keyM: { p: { t: "#b8862a", T: "#ffd94d", P: "#9a6ce0", p: "#c4a2e8", z: "#f0e4ff", s: "#ffd94d" }, m: [
    "...tt...........",
    "..t..tt.........",
    "..t....tt.......",
    ".tT......tt.....",
    ".tT........t....",
    "..t.......PpP...",
    "..t.......PzP...",
    "..t.......PPP...",
    ".tTt.......P....",
    "..t........P....",
    "..t........Pp...",
    "..t........P....",
    "..t........Pp...",
    ".sts....z.......",
    "..t.............",
    "................"
  ] },
  fangG: { p: { K: "#2e5a1e", G: "#6cb457", E: "#a4dc8c", R: "#c24a5a", W: "#fffdf4", t: "#4d7a26", g: "#79b544" }, m: [
    "....KKKK........",
    "..KKGGGGKK......",
    ".KGGEGGGGGK.....",
    ".KGGGGGGGGK.....",
    "..KGGGGGGK......",
    "...KRRRRK.......",
    "..W.W..W.W......",
    "...KRRRRK.......",
    "..KGGGGGGK......",
    ".KGGGGGGGGK.....",
    ".KGGEGGGGGK.....",
    "..KKGGGGKK..g...",
    "....KKKK.t.g....",
    "......t.t.......",
    ".......t........",
    "....g..t...g...."
  ] },
  fangW: { p: { K: "#6a2420", R: "#a83a35", r: "#c25a50", C: "#f2dfc0", D: "#2e1210", g: "#2e6a50", G: "#4d9a6e" }, m: [
    ".....KKKKK......",
    "...KKRRRRRKK....",
    "..KRRCRRRCRRK...",
    ".KRRRRrRrRRRK...",
    ".KRCRRKKKRRCK...",
    ".KRRRKDDDKRRK...",
    ".KRrKDDDDDKrK...",
    ".KRRRKDDDKRRK...",
    ".KRCRRKKKRRCK...",
    ".KRRRRrRrRRRK...",
    "..KRRCRRRCRRK...",
    "...KKRRRRRKK....",
    ".....KKKKK......",
    "..Gg.......gG...",
    ".GggG.....GggG..",
    "................"
  ] },
  fangM: { p: { K: "#1c1428", P: "#3a2a52", p: "#5a4278", F: "#8ae0ea", f: "#d8f8fc", O: "#ffb060", o: "#ffe0a0", t: "#2e2440" }, m: [
    "....KKKK........",
    "..KKPPPPKK......",
    ".KPPpPPPPPK.....",
    ".KPPPPPPPPK.....",
    "..KPPPPPPK......",
    "...KOOOOK.......",
    "..F.FoOF.F......",
    "..f.KOOK.f......",
    "..KPPPPPPK......",
    ".KPPPPPPPPK.....",
    ".KPPpPPPPPK.....",
    "..KKPPPPKK......",
    "....KKKK.t......",
    "......t.t.......",
    ".......t........",
    "....F..t...F...."
  ] },
  shardPrism: { p: { K: "#8ab8c8", k: "#4a8098", W: "#e8f8ff", w: "#c0e8f4", R: "#ff6060", G: "#60cc60", B: "#6090ff", Y: "#ffd940", P: "#c060e0", C: "#40d0d0" }, m: [
    "................",
    "..........R.....",
    ".....K..........",
    "....KWK..G......",
    "...KWwWK........",
    "..KWwwwWK...B...",
    "..KWwwwWK.......",
    "...KwwWK....Y...",
    "....KWK..P......",
    ".....K..........",
    "......C.........",
    "...R............",
    "........G.......",
    "................",
    "................",
    "................"
  ] },
  shardStar: { p: { K: "#6a4ab8", P: "#b094e0", p: "#d8c4ff", W: "#ffffff", o: "#ffd94d", y: "#fff4b0" }, m: [
    "................",
    "........o.......",
    ".......oyo......",
    "......oyyo......",
    "...ooooWooo.....",
    "..oPPPpWpKK.....",
    "..oKKKKK........",
    "...oooo.........",
    "................",
    "..........oo....",
    ".........oyo....",
    "........oWyo....",
    ".......oWpyo....",
    "........oooo....",
    "................",
    "................"
  ] },
  strawhat: { p: { K: "#a83a52", P: "#f7a6bd", p: "#ffd0dc", k: "#e07b96", Y: "#f5e0a8", y: "#e0be7a" }, m: [
    "................",
    "................",
    "................",
    "......KKKK......",
    ".....KYyYYK.....",
    "....KYYYYYYK....",
    "....KYYYYYYK....",
    "..KKKPPPPPPKKK..",
    ".KYYKPpPPPKYYYK.",
    "KYyYYYYYYYYYYyYK",
    ".KKKKKKKKKKKKKK.",
    ".........kPk....",
    "..........kPk...",
    "................",
    "................",
    "................"
  ] },
  // Huy hiệu mặt tiền: nón rơm ruy băng hồng (wen chốt, chỗ ký tên tác giả)
  mysbG: { p: { g: "#4d7a26", G: "#79b544", K: "#8a2a35", r: "#d94f5c", R: "#e8808e", y: "#ffe0a8" }, m: [
    "................",
    "................",
    "................",
    "................",
    "......G..g......",
    ".....gGGGGg.....",
    ".......GG.......",
    ".....KrrrrK.....",
    "....KrryrryK....",
    "....KrrrrrrK....",
    "....KryrrryK....",
    ".....KrrrrK.....",
    "......KrrK......",
    ".......KK.......",
    "................",
    "................"
  ] },
  mysbW: { p: { g: "#2e6a50", G: "#4d9a6e", K: "#2e6a80", r: "#7fd4dd", R: "#b8ecf0", W: "#f0fcff" }, m: [
    ".....G..g.......",
    "....gGGGGg......",
    "......GG........",
    "....KrrrrK......",
    "...KrrWrrrK.....",
    "...KrRRrrrK.....",
    "...KrrrrRrK.....",
    "....KrrrrK......",
    ".....KrrK.......",
    "......KK........",
    ".......W........",
    "................",
    "................",
    "................",
    "................",
    "................"
  ] },
  mysbM: { p: { g: "#5a3f78", G: "#8a5cc0", K: "#3a2258", r: "#9a6ac8", R: "#c4a2e8", W: "#e8d8f8" }, m: [
    ".....G..g.......",
    "....gGGGGg......",
    "......GG........",
    "....KrrrrK......",
    "...KrRrWrrK.....",
    "...KrrRrrrK.....",
    "...KRrrrRrK.....",
    "....KrrRrK......",
    ".....KrrK.......",
    "......KK........",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ] }
};
var spriteCache = /* @__PURE__ */ new Map();
function spriteSVG(name, px) {
  const key = name + "@" + px;
  if (spriteCache.has(key)) return spriteCache.get(key);
  const map = SPR[name] || C2[name] && C2[name].m;
  if (!map) return "";
  const pal = SPR[name] ? P : C2[name].p;
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx2 = canvas.getContext("2d");
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = pal[row[x]];
      if (c) {
        ctx2.fillStyle = c;
        ctx2.fillRect(x, y, 1, 1);
      }
    }
  });
  const out = `<img draggable="false" width="${px}" height="${px}" src="${canvas.toDataURL("image/png")}" style="display:block; image-rendering:pixelated;" />`;
  spriteCache.set(key, out);
  return out;
}
var tileCache = /* @__PURE__ */ new Map();
function tileURI(kind, seedNum) {
  const tkey = kind + "@" + seedNum;
  if (tileCache.has(tkey)) return tileCache.get(tkey);
  const out = buildTile(kind, seedNum);
  tileCache.set(tkey, out);
  return out;
}
var LP = {
  "8": "#8ec8d8",
  "~": "#b8e0ea",
  "-": "#79b4c6",
  "_": "#6faabf",
  "9": "#3f7290",
  "!": "#35617d",
  "6": "#5f5870",
  "^": "#6d657c",
  "&": "#4e4860",
  "7": "#433c54",
  "5": "#8ae0ea",
  "*": "#e8fcff",
  "%": "#5fc8d8",
  "#": "#3a3450",
  "l": "#5aa06a",
  "L": "#7cc48a",
  "=": "#b9d194",
  "0": "#ffe9b8",
  "+": "#fff2b0"
};
function buildTile(kind, seedNum) {
  const rnd = mulberry32(seedNum);
  const base = { grass: "1", wet: "w", soil: "a", water: "8", wplot: "9", wplotwet: "!", mine: "6", mplot: "7", mplotwet: "#" }[kind] || "a";
  const SZ = kind === "water" || kind === "mine" || kind === "grass" ? 96 : 32;
  const g = [];
  for (let y = 0; y < SZ; y++) g.push(new Array(SZ).fill(base));
  const blot = (cx, cy, rad, ch) => {
    cx |= 0;
    cy |= 0;
    rad |= 0;
    for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) {
      if (i * i + j * j > rad * rad + rnd() * 2) continue;
      const x = ((cx + i) % SZ + SZ) % SZ, y = ((cy + j) % SZ + SZ) % SZ;
      g[y][x] = ch;
    }
  };
  if (kind === "grass") {
    for (let i = 0; i < 5; i++) blot(rnd() * SZ, rnd() * SZ, 4 + rnd() * 5, "=");
    for (let i = 0; i < 4; i++) blot(rnd() * SZ, rnd() * SZ, 3 + rnd() * 4, "2");
    for (let i = 0; i < 55; i++) {
      const x = rnd() * SZ | 0, y = rnd() * (SZ - 1) | 0;
      g[y][x] = "3";
      g[y + 1][x] = "4";
    }
    for (let i = 0; i < 30; i++) g[rnd() * SZ | 0][rnd() * SZ | 0] = "2";
    const combos = [["n", "W"], ["W", "0"], ["C", "+"]];
    for (let i = 0; i < 10; i++) {
      const fx = 2 + (rnd() * (SZ - 4) | 0), fy = 2 + (rnd() * (SZ - 4) | 0);
      const c = combos[rnd() * 3 | 0];
      g[fy][fx] = c[0];
      g[fy][fx + 1] = c[0];
      g[fy + 1][fx] = c[0];
      g[fy + 1][fx + 1] = c[1];
    }
  } else if (kind === "water") {
    for (let i = 0; i < 3; i++) blot(rnd() * SZ, rnd() * SZ, 6 + rnd() * 5, "-");
    for (let i = 0; i < 4; i++) {
      const cx = rnd() * SZ, cy = rnd() * SZ, r = 8 + (rnd() * 5 | 0);
      blot(cx, cy, r, "~");
      blot(cx, cy, r - 2, "8");
    }
    for (let i = 0; i < 55; i++) {
      const x = rnd() * (SZ - 2) | 0, y = rnd() * SZ | 0;
      g[y][x] = "~";
      g[y][x + 1] = "~";
    }
    for (let i = 0; i < 22; i++) g[rnd() * SZ | 0][rnd() * SZ | 0] = "_";
    for (let i = 0; i < 5; i++) {
      const x = 2 + (rnd() * (SZ - 6) | 0), y = 2 + (rnd() * (SZ - 4) | 0);
      g[y][x] = "l";
      g[y][x + 1] = "L";
      g[y][x + 2] = "l";
      g[y + 1][x] = "l";
      g[y + 1][x + 1] = "l";
    }
  } else if (kind === "wplot" || kind === "wplotwet") {
    for (let i = 0; i < 6; i++) {
      const x = rnd() * 30 | 0, y = rnd() * 32 | 0;
      g[y][x] = kind === "wplot" ? "!" : "9";
      g[y][x + 1] = kind === "wplot" ? "!" : "9";
    }
    for (let i = 0; i < 3; i++) g[rnd() * 32 | 0][rnd() * 32 | 0] = "~";
  } else if (kind === "mine") {
    for (let i = 0; i < 7; i++) blot(rnd() * SZ, rnd() * SZ, 4 + rnd() * 5, "^");
    for (let i = 0; i < 6; i++) blot(rnd() * SZ, rnd() * SZ, 3 + rnd() * 4, "&");
    for (let i = 0; i < 55; i++) g[rnd() * SZ | 0][rnd() * SZ | 0] = "^";
    for (let i = 0; i < 28; i++) g[rnd() * SZ | 0][rnd() * SZ | 0] = "&";
    for (let i = 0; i < 9; i++) {
      const x = 2 + (rnd() * (SZ - 4) | 0), y = 2 + (rnd() * (SZ - 4) | 0);
      g[y - 1][x] = "5";
      g[y][x - 1] = "5";
      g[y][x + 1] = "5";
      g[y + 1][x] = "5";
      g[y][x] = "*";
    }
    for (let i = 0; i < 14; i++) g[rnd() * SZ | 0][rnd() * SZ | 0] = "*";
  } else if (kind === "mplot" || kind === "mplotwet") {
    for (let i = 0; i < 5; i++) g[rnd() * 32 | 0][rnd() * 32 | 0] = "&";
    for (let i = 0; i < 3; i++) g[rnd() * 32 | 0][rnd() * 32 | 0] = "%";
  } else {
    const top = kind === "wet" ? "g" : "d", dark = kind === "wet" ? "m" : "c", speck = kind === "wet" ? "s" : "e";
    for (let y = 0; y < 32; y++) {
      if (y % 4 === 0) g[y].fill(top);
      if (y % 4 === 3) g[y].fill(dark);
    }
    for (let i = 0; i < 5; i++) {
      const y = 4 * (rnd() * 8 | 0) + 1 + (rnd() * 2 | 0);
      g[y][rnd() * 32 | 0] = speck;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = SZ;
  canvas.height = SZ;
  const ctx2 = canvas.getContext("2d");
  g.forEach((row, y) => {
    row.forEach((ch, x) => {
      const c = P[ch] || LP[ch];
      if (c) {
        ctx2.fillStyle = c;
        ctx2.fillRect(x, y, 1, 1);
      }
    });
  });
  return `url("${canvas.toDataURL("image/png")}")`;
}
function warmUpCache(CROPS2) {
  const tasks = [];
  Object.keys(PETS).forEach((p) => tasks.push(() => petSVG(p, 48)));
  Object.keys(SPR).forEach((s) => tasks.push(() => spriteSVG(s, s === "emBang" ? 48 : 24)));
  if (CROPS2) {
    Object.keys(CROPS2).forEach((c) => {
      tasks.push(() => spriteSVG(CROPS2[c].sp, 24));
    });
  }
  ["grass", "water", "mine"].forEach((bg) => tasks.push(() => tileURI(bg, 0)));
  let i = 0;
  function next() {
    const end = performance.now() + 10;
    while (i < tasks.length && performance.now() < end) {
      try {
        tasks[i]();
      } catch (e) {
      }
      i++;
    }
    if (i < tasks.length) setTimeout(next, 20);
  }
  setTimeout(next, 1e3);
}

// src/style.js
var styleCSS = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: "Microsoft YaHei", "PingFang SC", sans-serif; }
    img { -webkit-user-drag: none; user-select: none; }
    /* ===== v1.0: ch\u1EE7 \u0111\u1EC1 giao di\u1EC7n (h\u1ED3ng anh \u0111\xE0o / tr\u1EDDi quang), \u0111\u1ED5i \u1EDF trang c\xE0i \u0111\u1EB7t, S.theme l\u01B0u to\xE0n c\u1EE5c ===== */
    .theme-sakura { --sky: radial-gradient(circle at 82% 40%, rgba(255,255,255,.55) 5px, transparent 6px), radial-gradient(circle at 12% 65%, rgba(255,255,255,.4) 4px, transparent 5px), linear-gradient(#f5c6d6, #e29ab8);
      --skyLine: #c27a9a; --tint: rgba(150,70,100,.35); --tintSoft: rgba(150,70,100,.3); --frameOut: #9a7a54;
      --buyBg: linear-gradient(#fdeef2,#f6d0da); --buyLine: #c77b96; --buyFg: #a34a63; --buyInset: #e8b3c2; --buyDeep: #a34a63;
      --accBg: #fdeef2; --accLine: #d9718a; --accFg: #a34a63; --selGlowA: #ffd7e2; --selGlowB: #f2b8c9; --shead: #8a4a63;
      --banBg: linear-gradient(#efe9fa,#e2d6f5); --banLine: #9a86c8; --banFg: #5d4a85; --banIn: #f8f4ff; --tagBg: #8a72c0; --tagFg: #f4edff; }
    .theme-sky { --sky: radial-gradient(circle at 82% 40%, rgba(255,255,255,.55) 5px, transparent 6px), radial-gradient(circle at 12% 65%, rgba(255,255,255,.4) 4px, transparent 5px), linear-gradient(#7cc4f2, #4a90d9);
      --skyLine: #2b5cae; --tint: rgba(30,60,120,.35); --tintSoft: rgba(30,60,120,.3); --frameOut: #3a6098;
      --buyBg: linear-gradient(#eef6ff,#d2e6f8); --buyLine: #85aede; --buyFg: #2f66b8; --buyInset: #b4d2ee; --buyDeep: #5580b8;
      --accBg: #eaf4ff; --accLine: #3a77cc; --accFg: #24549e; --selGlowA: #c8e2f8; --selGlowB: #9cc8ee; --shead: #2b5cae;
      --banBg: linear-gradient(90deg, #24549e, #3a77cc 60%, #5da8e8); --banLine: #24549e; --banFg: #eaf4ff; --banIn: rgba(255,255,255,.18); --tagBg: #ffd94d; --tagFg: #6a4e10; }
    #orb { position: fixed; width: 52px; height: 52px; z-index: 99998; cursor: pointer; touch-action: none;
      border-radius: 50%; background: linear-gradient(#f7ead2,#eed9b8); border: 3px solid #b08a5c;
      box-shadow: inset 0 2px 0 #fffaf0, 0 4px 10px rgba(0,0,0,.35);
      display: flex; align-items: center; justify-content: center; user-select: none;
      transition: transform .18s ease; }
    #orb.dockL:not(:hover) { transform: translateX(-27px); }   /* S\u1EEDa #12: d\xE1n m\xE9p th\xEC thu n\u1EEDa, r\xEA chu\u1ED9t th\xEC b\u1EADt ra */
    #orb.dockR:not(:hover) { transform: translateX(27px); }
    #win { position: fixed; z-index: 99997; width: min(760px, 96vw); max-height: 92vh; max-height: 92dvh; display: none;
      flex-direction: column; background: #f8efe0;
      background-image: repeating-linear-gradient(0deg, transparent 0 30px, rgba(170,130,80,.14) 30px 33px);
      border: 4px solid #c9a273; outline: 4px solid var(--frameOut); border-radius: 10px;
      box-shadow: inset 0 0 0 4px #fff6e8, 0 14px 40px rgba(0,0,0,.55); }
    #win.open { display: flex; }
    .titlebar { background: var(--sky); border-bottom: 4px solid var(--skyLine); padding: 9px 14px;
      display: flex; align-items: center; gap: 8px; box-shadow: inset 0 0 0 2px rgba(255,255,255,.5);
      cursor: move; touch-action: none; user-select: none; flex: none; }
    .titlebar { justify-content: space-between; }
    .titlebar h1 { font-size: 15px; color: #7a5c38; letter-spacing: 2px; text-shadow: 1px 1px 0 #fff3dd; flex: 0 1 auto;
      display: flex; align-items: center; gap: 7px;
      background: linear-gradient(#faf0dc,#eed9b8); border: 3px solid #8a6844; border-radius: 8px; padding: 3px 12px;
      box-shadow: 0 3px 0 var(--tint), inset 0 0 0 2px #fff6e0;
      display: flex; align-items: center; gap: 8px; }
    .close-x { width: 24px; height: 24px; background: linear-gradient(#faf0dc,#eed9b8); border: 3px solid #8a6844; border-radius: 6px;
      color: #7a5c38; box-shadow: 0 2px 0 var(--tintSoft); font-weight: bold; text-align: center; line-height: 18px; cursor: pointer; }
    .statusbar { display: flex; align-items: center; gap: 12px; padding: 7px 14px; background: #f4e6cf;
      border-bottom: 3px solid #ddc39a; font-size: 13px; font-weight: bold; color: #7a5c38; flex: none; flex-wrap: wrap; }
    .stat { display: flex; align-items: center; gap: 5px; }
    #scroll { overflow: auto; flex: 1; min-height: 0; }
    /* v0.8: thanh l\u1EADt trang ba trang */
    .pager { position: absolute; top: 7px; right: 7px; z-index: 7; display: flex; align-items: center; justify-content: center;
      background: rgba(58,48,30,.4); border: 2px solid rgba(255,246,224,.4); border-radius: 14px; overflow: hidden;
      width: 26px; height: 26px; cursor: pointer; font-size: 13px; color: rgba(255,246,224,.8); user-select: none; }   /* Ph\u01B0\u01A1ng \xE1n 2 s\u1EEDa: b\xECnh th\u01B0\u1EDDng l\xE0 qu\u1EA3 c\u1EA7u nh\u1ECF m\u1EDD */
    .pager.open { width: auto; height: auto; border-radius: 12px; cursor: default;
      background: rgba(58,48,30,.55); border-color: rgba(255,246,224,.5); font-size: 0; }   /* B\u1EA5m m\u1EDF = bung th\xE0nh thanh vi\xEAn nang */
    .pager:not(.open) .ptab { display: none; }             /* \u1EDE d\u1EA1ng qu\u1EA3 c\u1EA7u th\xEC \u1EA9n c\xE1c tab trang */
    .pager:not(.open)::after { content: '\u21C4'; }             /* Icon nh\u1ECF tr\xEAn m\u1EB7t c\u1EA7u */
    .ptab { flex: none; font-size: 11px; font-weight: bold; padding: 4px 10px; background: transparent;
      color: #f0e6cc; cursor: pointer; user-select: none; display: inline-flex; align-items: center; gap: 3px; }
    .ptab + .ptab { border-left: 1px solid rgba(255,246,224,.35); }
    .ptab.active { background: rgba(255,246,224,.92); color: #7a5c38; }
    .ptab.lock { opacity: .6; }
    .field { margin: 10px 12px; background-color: #a9c383; border: 4px solid #b08a5c; border-radius: 8px;
      box-shadow: inset 0 0 0 3px #8aa86a; padding: 14px; position: relative; }
    /* v0.8: da trang W1 ru\u1ED9ng n\u1ED5i \u0111\u1EA7m sen / M1 m\u1EA1ch qu\u1EB7ng kim c\u01B0\u01A1ng */
    .field.pg2 { background-color: #8ec8d8; border-color: #6a9ab0; box-shadow: inset 0 0 0 3px #79b4c6; }
    .field.pg3 { background-color: #5f5870; border-color: #7a6a94; box-shadow: inset 0 0 0 3px #4e4860; }
    .field.pg2 span.dside, .field.pg2 span.dbot, .field.pg3 span.dside, .field.pg3 span.dbot { display: none !important; }  /* Trang tr\xED \u0111\u1ED3ng c\u1ECF kh\xF4ng l\u1ED9i n\u01B0\u1EDBc / kh\xF4ng xu\u1ED1ng m\u1ECF */
    .field.pg2 .plot { border-color: #c9a273;            /* v0.9: khung g\u1ED7 hai l\u1EDBp \u2014\u2014 g\u1ED7 nh\u1EA1t ngo\xE0i + g\u1ED7 \u0111\u1EADm trong, l\u1EA5y l\u1EA1i c\u1EA3m gi\xE1c khung vu\xF4ng c\u1EE7a b\u1EA3n thi\u1EBFt k\u1EBF */
      box-shadow: inset 0 0 0 3px #a8845c, inset 0 -5px 0 rgba(40,70,90,.28); }
    .field.pg2 .plot.watered { border-color: #b08a5c; box-shadow: inset 0 0 0 3px #8a6844, inset 0 -5px 0 rgba(30,55,75,.35); }
    .field.pg2 .block:not(.locked) .plot::before {       /* v0.9 s\u1EEDa l\u1EA7n 2: \u0111inh g\xF3c m\xE0u \u0111\u1EADm \u1EDF b\u1ED1n g\xF3c (gi\u1ED1ng b\u1EA3n thi\u1EBFt k\u1EBF) */
      content: ''; position: absolute; inset: -3px; pointer-events: none; border-radius: 6px;
      background: linear-gradient(#6a4a2c,#6a4a2c) left top / 7px 7px no-repeat,
        linear-gradient(#6a4a2c,#6a4a2c) right top / 7px 7px no-repeat,
        linear-gradient(#6a4a2c,#6a4a2c) left bottom / 7px 7px no-repeat,
        linear-gradient(#6a4a2c,#6a4a2c) right bottom / 7px 7px no-repeat; }
    .field.pg3 .plot { border-color: #3f8a9a; border-radius: 2px;   /* v0.9 s\u1EEDa l\u1EA7n 3: lu\u1ED1ng \u01B0\u01A1m pha l\xEA b\u1EDBt bo g\xF3c, c\u1EA1nh s\u1EAFc r\xF5 */
      box-shadow: inset 0 0 0 1px rgba(138,224,234,.5), inset 0 -3px 0 rgba(20,20,40,.35); }
    .field.pg3 .plot.watered { border-color: #5fc8d8; }
    /* v0.9 s\u1EEDa l\u1EA7n 4: \u0111inh g\xF3c tr\u1EAFng \u1EDF khu m\u1ECF th\u1EED th\u1EA5y ch\xF3i m\u1EAFt, b\u1ECF (lu\u1ED1ng \u01B0\u01A1m v\u1EABn gi\u1EEF g\xF3c vu\xF4ng) */
    .field.pg2 .block.locked .plot { border-color: #8ab4c2; box-shadow: inset 0 3px 0 rgba(255,255,255,.28), inset 0 -3px 0 rgba(30,60,80,.22); } /* C\u1EA3m gi\xE1c n\u1ED5i kh\u1ED1i gi\u1ED1ng \xF4 kho\xE1 b\xEAn \u0111\u1ED3ng c\u1ECF */
    .field.pg3 .block.locked .plot { border-color: #6d657c; box-shadow: none; } /* \xD4 kho\xE1 khu m\u1ECF gi\u1EEF khung tr\u01A1n (th\u1EED thanh s\xE1ng n\u1ED5i kh\u1ED1i hai l\u1EA7n \u0111\u1EC1u th\u1EA5y k\u1EF3, wen ch\u1ED1t) */
    .blocks { display: grid; grid-template-columns: repeat(3, max-content); gap: 14px; justify-content: center; }
    @media (max-width: 640px) {
      .blocks { grid-template-columns: repeat(2, max-content); }
      .field { padding: 12px 12px 70px; }                       /* S\u1EEDa #7: d\u1EA3i c\u1ECF ri\xEAng cho thanh c\xF4ng c\u1EE5 / linh v\u1EADt */
      .titlebar h1 { font-size: 13px; letter-spacing: 0; }      /* S\u1EEDa #11: b\u1ED1 c\u1EE5c d\u1ECDc g\u1ECDn l\u1EA1i */
      .titlebar h1 .sub { display: none; }
      .statusbar { gap: 6px 10px; font-size: 12px; padding: 6px 10px; }
      .bottombar { padding: 8px 10px calc(10px + env(safe-area-inset-bottom)); gap: 8px; }
      .btn { font-size: 13px; padding: 7px 6px; }
      span.dside { display: none; }      /* S\u1EEDa #13: m\xE0n h\u1EB9p kh\xF4ng \u0111\u1EE7 l\u1EC1 b\xEAn, chuy\u1EC3n trang tr\xED xu\u1ED1ng d\u1EA3i xanh d\u01B0\u1EDBi \u0111\xE1y */
      span.dbot { display: inline; }     /* N\xE2ng quy\u1EC1n cho span, \u0111\xE8 l\xEAn quy t\u1EAFc \u1EA9n m\u1EB7c \u0111\u1ECBnh ph\xEDa sau */
    }
    .block { display: grid; grid-template-columns: repeat(2, var(--plot, 74px)); grid-auto-rows: var(--plot, 74px);
      gap: 6px; position: relative; }
    .plot { background-color: #b99b84; border: 3px solid #937863; border-radius: 6px;
      box-shadow: inset 0 3px 0 rgba(255,244,225,.35), inset 0 -3px 0 rgba(80,55,35,.18);
      display: flex; align-items: flex-end; justify-content: center; padding-bottom: 3px;
      position: relative; cursor: pointer; background-size: 100% 100%; }
    .plot.watered { background-color: #9d7458; border-color: #7a5a40; }
    .plot .bar { position: absolute; left: 6px; right: 6px; bottom: 3px; height: 5px;
      background: rgba(60,35,15,.35); border-radius: 3px; overflow: hidden; }
    .plot .bar i { display: block; height: 100%; background: #a4dc8c; border-radius: 3px; }
    .plot .ripe { position: absolute; top: -10px; right: -6px; width: 20px; height: 20px; background: #ffd94d;
      border: 3px solid #b8891f; border-radius: 50% 50% 50% 4px; color: #8a5f00; font-weight: bold; font-size: 13px;
      text-align: center; line-height: 15px; z-index: 3; }
    .block.locked .plot { background-color: #aecb87; border-color: #9aa378; cursor: default; }
    .sign { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 92px;
      background: linear-gradient(#f7ead2,#ecd6ae); border: 3px solid #b08a5c; border-radius: 6px;
      box-shadow: 0 3px 0 #8a6844, inset 0 0 0 2px #fff6e0; padding: 6px 4px; font-size: 12px; font-weight: bold;
      color: #7a5c38; text-align: center; line-height: 1.35; z-index: 4; cursor: pointer; }
    .sign small { display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 10px; color: #9a7a50; }
    .sign.confirm { border-color: var(--accLine); color: var(--accFg); }
    /* #26: l\u1EDBp cho b\xE9 tr\xF2n t\u1EF1 do \u0111i l\u1EA1i \u2014\u2014 ph\u1EE7 to\xE0n b\u1ED9 khu ru\u1ED9ng, \u0111i theo khu v\u1EF1c (lo\u1EA1i l\xE0m vi\u1EC7c = h\xE0ng d\u01B0\u1EDBi, lo\u1EA1i \u0111i d\u1EA1o = b\u1EDD ru\u1ED9ng) */
    .mascots { position: absolute; inset: 0; z-index: 6; pointer-events: none; }
    .pet { pointer-events: auto; cursor: pointer; transition: transform .12s; position: absolute;
      left: 0; bottom: 0; will-change: transform, translate; }
    .pet:active { transform: scale(1.15, .85); }
    .pbody { display: block; animation: petbob 1.8s ease-in-out infinite; }
    .pet.walk .pbody { animation: pethop var(--hopd, .33s) linear infinite; }   /* v0.7\u2460: \u0111i b\u1ED9 = nh\u1EA3y li\xEAn ti\u1EBFp theo \u0111\u01B0\u1EDDng parabol */
    .pet[data-pet="cloudMallow"] .pbody,
    .pet[data-pet="ghostBlob"] .pbody,
    .pet[data-pet="bunny"] .pbody { animation: petfloat 3.2s ease-in-out infinite; }  /* M\xE2y / ma / s\u1EE9a: ki\u1EC3u bay l\u01A1 l\u1EEDng (\u0111\xE8 l\xEAn walk) */
    .pet.sleep .pbody { animation: petsleep 3.6s ease-in-out infinite; }   /* v0.7\u2461: ng\u1EE7 = th\u1EDF ch\u1EADm (\u0111\xE8 l\xEAn bay, ma c\u0169ng ph\u1EA3i h\u1EA1 c\xE1nh m\xE0 ng\u1EE7) */
    .pet.flip .pbody img { transform: scaleX(-1); }
    .zzz { position: absolute; bottom: calc(100% - 8px); left: 68%; font-size: 12px; font-weight: bold;
      color: #7a90c8; text-shadow: 1px 1px 0 #fff; pointer-events: none; animation: zrise 2.6s linear infinite; }
    .zzz.z2 { left: 52%; font-size: 10px; animation-delay: 1.3s; }
    @keyframes zrise { 0% { opacity: 0; transform: translate(0, 2px) scale(.7); }
      25% { opacity: 1; } 100% { opacity: 0; transform: translate(7px, -15px) scale(1.15); } }
    @keyframes petsleep { 0%, 100% { transform: translateY(2px) scale(1.07, .93); }
      50% { transform: translateY(2px) scale(1.03, .97); } }
    @keyframes petbob { 0%, 100% { transform: translateY(0) scale(1, 1); }
      30% { transform: translateY(1px) scale(1.05, .94); }
      65% { transform: translateY(-4px) scale(.96, 1.05); } }
    @keyframes petfloat { 0%, 100% { transform: translateY(-2px); } 50% { transform: translateY(-8px); } }
    /* M\u1ED9t chu k\u1EF3 nh\u1EA3y: l\u1EA5y \u0111\xE0 b\u1EB9t xu\u1ED1ng \u2192 bay l\xEAn k\xE9o d\xE0i \u2192 ch\u1EA1m \u0111\u1EA5t n\xE9n nh\u1EB9 \u2192 v\u1EC1 d\xE1ng chu\u1EA9n, \u0111\u1ED9 cao do --hy quy\u1EBFt \u0111\u1ECBnh (kh\xE1c nhau theo d\xE1ng \u0111i) */
    @keyframes pethop { 0%, 100% { transform: translateY(0) scale(1.07, .93); }
      40% { transform: translateY(var(--hy, -9px)) scale(.94, 1.06); }
      80% { transform: translateY(-1px) scale(1.02, .99); } }
    /* v0.8b: qu\u1EA7y h\xE0ng c\u1EE7a ph\xF9 thu\u1EF7 tr\xF2n (wen s\u1EEDa l\u1EA7n 2: h\xE0ng d\u01B0\u1EDBi c\xF9ng b\xEAn tr\xE1i, x\u1EBFp c\xF9ng h\xE0ng v\u1EDBi b\xE9 l\xE0m vi\u1EC7c; b\u1EA3ng \u0111\u01A1n h\xE0ng \u0111\u1ED9i tr\xEAn \u0111\u1EA7u) */
    #witch { position: absolute; left: 12%; bottom: 2px; z-index: 6; cursor: pointer; display: none; text-align: center; }
    #witch.show { display: block; }
    #witch .wbody { display: block; animation: petfloat 3.2s ease-in-out infinite; }
    #witch .wtag { display: inline-block; margin-bottom: 1px; font-size: 10px; font-weight: bold; color: #cfc9f2;
      background: #2a2650; border: 2px solid #8f86d9; border-radius: 6px; padding: 1px 7px;
      box-shadow: 0 0 8px rgba(143,134,217,.5); }
    .pbubble.wb { border-color: #8f86d9; color: #5a52a0; background: #f4f2ff; }
    /* v0.8b: trang \u0111\u01A1n h\xE0ng qu\u1EF9 \u0111\u1EA1o sao A (b\u1EA3n thi\u1EBFt k\u1EBF ch\u1ED1t) */
    .wzwrap { background: linear-gradient(160deg,#1c1b33,#232145 60%,#1a1e3d); border: 3px double #8f86d9;
      border-radius: 10px; padding: 14px 12px 12px; box-shadow: 0 0 14px rgba(143,134,217,.3); }
    .wzhead { color: #cfc9f2; text-align: center; letter-spacing: 3px; font-size: 14px; font-weight: bold; }
    .wzsub { color: #7a72c0; font-size: 10px; text-align: center; letter-spacing: 2px; margin: 2px 0 10px; }
    .wzord { border: 1px solid #4a4488; border-radius: 8px; padding: 9px 10px 7px; margin-bottom: 8px;
      background: rgba(143,134,217,.08); position: relative; }
    .wzord .star { position: absolute; left: -7px; top: 50%; transform: translateY(-50%); color: #ffd94d;
      font-size: 13px; text-shadow: 0 0 6px #ffd94d; }
    .wzwant { color: #e8e4ff; font-size: 13px; font-weight: bold; }
    .wzwant em { font-style: normal; color: #ffd94d; }
    .wzwant .mutq { color: #f2a8c8; }
    .wzgive { color: #9a92d9; font-size: 11px; margin-top: 3px; }
    .wzbtn { float: right; margin-top: -2px; font-size: 11px; font-weight: bold; color: #ffd94d;
      border: 1px solid #b09a3a; border-radius: 6px; padding: 2px 10px; cursor: pointer; background: rgba(255,217,77,.08); }
    .wzbtn.off { color: #6a63b0; border-color: #4a4488; cursor: default; }
    .wzbtn.done { color: #7cd4a4; border-color: #3f8a5a; cursor: default; }
    .wzleave { clear: both; color: #6a63b0; font-size: 10px; text-align: center; letter-spacing: 1px; margin-top: 8px; }
    .pbubble { position: absolute; bottom: calc(100% + 3px); left: 50%; transform: translateX(-50%);
      background: #fbfdff; border: 2px solid #7db8d8; border-radius: 8px 8px 8px 0;
      font-size: 11px; font-weight: bold; color: #4a88aa; padding: 2px 7px; white-space: nowrap;
      pointer-events: none; animation: pbfloat 1.6s ease forwards; z-index: 9; }
    .pet[data-pet="octo"] .pbubble { border-color: #ab84dd; color: #7a54b5; background: #fdfbff; }
    .emote { position: absolute; pointer-events: none; z-index: 8; animation: pbfloat 1.2s ease forwards; }
    @keyframes pbfloat { 0% { opacity: 0; transform: translateY(4px); } 15% { opacity: 1; transform: translateY(0); }
      70% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } }
    .fdot { position: absolute; left: 4px; top: 4px; width: 7px; height: 7px; border-radius: 50%;
      background: #6cb457; border: 1px solid #3e7d3a; z-index: 3; }
    .dbot { display: none; }
    .ctrlrow { display: flex; gap: 6px; align-items: stretch; padding: 7px 14px 0; flex-wrap: nowrap; }   /* Kho\xE1 m\u1ED9t h\xE0ng: kh\xF4ng \u0111\u1EE7 ch\u1ED7 th\xEC \xE9p ch\u1EEF ch\u1EE9 kh\xF4ng \xE9p khung */
    .ctrlrow .chip { flex: 0 1 auto; min-width: 0; white-space: normal; line-height: 1.15; text-align: center; }
    .chip.witchchip { background: #efe9fa; border-color: #9a6ad8; color: #6a4a9a;
      box-shadow: inset 0 2px 0 #f8f4ff, 0 2px 0 rgba(122,74,184,.35); }
    .chips { display: flex; gap: 6px; margin-left: auto; }
    .chip { font-size: 11px; padding: 2px 8px 2px 6px; border-radius: 6px; border: 2px solid #c2a274;
      background: #faf0dc; color: #8a6a42; font-weight: bold; cursor: pointer;
      display: inline-flex; align-items: center; gap: 5px; user-select: none;
      box-shadow: inset 0 2px 0 #fffdf4, 0 2px 0 rgba(154,122,84,.3); }
    .chip::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #d9c49a;
      box-shadow: inset 0 -2px 0 rgba(0,0,0,.15); }
    .chip.on { background: #ead9f7; border-color: #9a6ad8; color: #6a4a9a; }
    .chip.on::before { background: #b48ae0; box-shadow: inset 0 -2px 0 #8a5cc0, 0 0 4px #cdb0ef; }
    .banner { margin: 9px 12px 0; padding: 7px 11px; background: var(--banBg);
      border: 3px solid var(--banLine); border-radius: 8px; font-size: 12px; color: var(--banFg);
      display: none; align-items: center; gap: 9px; box-shadow: inset 0 2px 0 var(--banIn); cursor: pointer; position: relative; }
    .banner #btxt { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }   /* M\u1EB7c \u0111\u1ECBnh m\u1ED9t d\xF2ng, b\u1EA5m v\xE0o banner th\xEC m\u1EDF r\u1ED9ng */
    .banner.expand #btxt { white-space: normal; }
    .banner.show { display: flex; }
    .banner .btag { background: var(--tagBg); color: var(--tagFg); font-weight: bold; padding: 1px 7px;
      border-radius: 5px; font-size: 11px; white-space: nowrap; }
    .bmut { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%;
      background: linear-gradient(135deg, #ead9f7, #d4b8f0); border: 2px solid #9a6ad8;
      color: #6a4a9a; font-size: 13px; font-weight: bold; cursor: pointer;
      display: none; align-items: center; justify-content: center;
      transition: transform .15s, box-shadow .15s; box-shadow: 0 1px 3px rgba(154,106,216,.3); }
    .bmut:hover { transform: scale(1.15); box-shadow: 0 2px 8px rgba(154,106,216,.5); }
    .bmut:active { transform: scale(0.95); }
    .mut-popup { display: none; position: absolute; top: calc(100% + 6px); right: 0;
      min-width: 260px; max-width: 340px; max-height: 240px; overflow-y: auto;
      background: #fdfaff; border: 2px solid #c4a0e8; border-radius: 10px;
      box-shadow: 0 4px 16px rgba(120,60,180,.18); padding: 10px 12px;
      z-index: 20; cursor: default; font-size: 12px; }
    .mut-popup.open { display: block; animation: mutFadeIn .18s ease-out; }
    @keyframes mutFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    .mut-header { font-weight: bold; color: #7a4aaa; font-size: 13px; margin-bottom: 8px;
      padding-bottom: 6px; border-bottom: 1px dashed #d8c0ef; }
    .mut-chance { font-weight: normal; color: #a080c0; font-size: 11px; }
    .mut-list { display: flex; flex-direction: column; gap: 4px; }
    .mut-row { display: flex; gap: 8px; padding: 4px 6px; border-radius: 6px; background: #f4eefa; }
    .mut-row:nth-child(even) { background: #efe4f8; }
    .mut-crop { font-weight: bold; color: #6a4a9a; white-space: nowrap; min-width: 70px; flex-shrink: 0; }
    .mut-effect { color: #5a4070; flex: 1; line-height: 1.35; }\r
    .mdrop { flex-direction: column; gap: 2px; max-height: 150px; overflow: auto; background: #fffdf4;
      border: 2px solid #c2a274; border-radius: 6px; padding: 5px; }
    .mdrop span { padding: 4px 9px; font-size: 12px; font-weight: bold; color: #6b4f2e; border-radius: 5px; cursor: pointer; }
    .mdrop span:hover { background: var(--accBg); color: var(--accFg); }
    .inp { width: 100%; background: #fffdf4; border: 2px solid #c2a274; border-radius: 6px;
      padding: 6px 9px; font-size: 12px; color: #6b4f2e; font-family: inherit;
      box-shadow: inset 0 2px 3px rgba(154,122,84,.18); }
    textarea.inp { resize: vertical; min-height: 60px; }
    .shead { font-size: 13px; font-weight: bold; color: var(--shead); margin: 10px 0 6px; }
    /* ===== V\xE9 gi\u1EA5y phong c\xE1ch ho\xE0i c\u1ED5 (chuy\u1EC3n t\u1EEB b\u1EA3n xem tr\u01B0\u1EDBc c\u1EE7a v\xE9) ===== */
    .tk { position: relative; width: 100%; display: flex; border-radius: 8px;
      box-shadow: 0 8px 20px rgba(0,0,0,.3); margin: 4px 0 10px; }
    .tk.water { --paper: #e9f0e4; --ink: #3f7a8a; --stamp: #4a90a8; --curlD: #b9cfc4; --curlL: #dce8dd; transform: rotate(-1deg); }
    .tk.mine  { --paper: #ece4f0; --ink: #6a4a8a; --stamp: #8a5cc0; --curlD: #c4b3d4; --curlL: #ded2ea; transform: rotate(0.8deg); }
    .tk .stub { flex: none; width: 96px; border-radius: 8px 0 0 8px; border: 3px solid var(--ink); border-right: none;
      background: var(--paper);
      background-image: radial-gradient(circle at 25% 18%, rgba(160,120,60,.1) 0 18%, transparent 19%),
        repeating-linear-gradient(0deg, transparent 0 6px, rgba(120,90,50,.05) 6px 7px);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 10px 4px; }
    .tk .no { font-size: 9px; letter-spacing: 1px; color: var(--ink); opacity: .75; font-weight: bold; }
    .tk .perf { flex: none; width: 0; border-left: 3px dashed var(--ink); opacity: .8; position: relative; }
    .tk .perf::before, .tk .perf::after { content: ''; position: absolute; left: -8px; width: 14px; height: 14px;
      border-radius: 50%; background: #f8efe0; }
    .tk .perf::before { top: -10px; } .tk .perf::after { bottom: -10px; }
    .tk .tmain { flex: 1; border-radius: 0 8px 8px 0; border: 3px solid var(--ink); border-left: none;
      background: var(--paper);
      background-image: radial-gradient(circle at 80% 25%, rgba(160,120,60,.1) 0 15%, transparent 16%),
        repeating-linear-gradient(0deg, transparent 0 6px, rgba(120,90,50,.05) 6px 7px);
      padding: 12px 12px 10px; position: relative; overflow: hidden; }
    .tk .inner { border: 1px solid var(--ink); border-radius: 4px; padding: 7px 10px 8px; }
    .tk .eyebrow { font-size: 8px; letter-spacing: 2px; color: var(--ink); opacity: .7; font-weight: bold; }
    .tk .tname { font-size: 17px; font-weight: bold; color: var(--ink); letter-spacing: 3px; margin: 2px 0; }
    .tk .tsub { font-size: 10px; color: var(--ink); opacity: .85; line-height: 1.7; }
    .tk .trow { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 6px; }
    .tk .serial { font-family: Consolas, monospace; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: var(--ink); }
    .tk .valid { font-size: 8px; color: var(--ink); opacity: .65; letter-spacing: 1px; }
    .tk .curl { position: absolute; right: -1px; bottom: -1px; width: 28px; height: 28px;
      background: linear-gradient(315deg, transparent 47%, var(--curlD) 48%, var(--curlL) 60%, var(--paper) 90%);
      border-radius: 0 0 8px 0; box-shadow: -3px -3px 6px rgba(60,40,15,.18);
      clip-path: polygon(100% 0, 0 100%, 100% 100%); }
    .tk .stamp { position: absolute; right: 36px; top: -5px; width: 44px; height: 44px; border-radius: 50%;
      border: 2px solid var(--stamp); color: var(--stamp); display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: bold; transform: rotate(14deg); opacity: .55;
      box-shadow: inset 0 0 0 1px var(--stamp); pointer-events: none; text-align: center; }
    .tk.mine .tmain::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 8px;
      background: repeating-linear-gradient(45deg, #d8b13a 0 6px, #4a3a52 6px 12px); opacity: .85; }
    .cnt2 { position: absolute; right: 3px; top: 3px; font-size: 9px; background: rgba(255,253,244,.9);
      border: 1px solid #c2a274; border-radius: 4px; padding: 0 3px; color: #7a5c38; font-weight: bold; z-index: 3; }
    .sign.poor { opacity: .6; }
    /* Thanh c\xF4ng c\u1EE5 b\u1EA3n m\u1EDBi: b\xECnh th\u01B0\u1EDDng = tai nh\u1ECF thu n\u1EEDa d\xE1n m\xE9p tr\xE1i (kh\xF4ng chi\u1EBFm \u0111\u1ED3ng c\u1ECF, kh\xF4ng che b\xE9 tr\xF2n \u0111i d\u1EA1o); b\u1EA5m m\u1EDF = bung ra m\u1ED9t c\u1ED9t d\u1ECDc theo b\u1EDD ru\u1ED9ng */
    .toolbar { position: absolute; display: flex; z-index: 7; transition: left .22s ease; }
    .toolbar:not(.open) { left: -14px; bottom: 12px; padding: 5px 5px 5px 14px;
      background: linear-gradient(#f7ead2,#eed9b8); border: 3px solid #b08a5c; border-left: none;
      border-radius: 0 10px 10px 0; box-shadow: 0 3px 0 #8a6844, inset 0 0 0 2px #fff6e0; }
    .toolbar.open { left: 0; top: 0; bottom: 0; flex-direction: column; justify-content: center;
      align-items: center; gap: 6px; padding: 10px 6px; background: linear-gradient(90deg,#f7ead2,#eed9b8);
      border-right: 3px solid #b08a5c; border-radius: 0 10px 10px 0;
      box-shadow: 3px 0 0 rgba(138,104,68,.35), inset 0 0 0 2px #fff6e0; }
    @media (max-width: 640px) {
      .toolbar.open { flex-direction: row; top: auto; left: 0; right: 0; bottom: 0;
        border-right: none; border-top: 3px solid #b08a5c; border-radius: 10px 10px 0 0; padding: 6px 10px;
        box-shadow: 0 -3px 0 rgba(138,104,68,.35), inset 0 0 0 2px #fff6e0; }
      .mode-tip { left: 10px; bottom: 70px; }
    }
    .tool { width: 40px; height: 40px; background: #faf0dc; border: 2px solid #c2a274; border-radius: 6px;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      box-shadow: inset 0 2px 0 #fffdf4, inset 0 -2px 0 #e3c795; }
    .tool.selected { border-color: var(--accLine); background: var(--accBg); box-shadow: inset 0 0 0 2px var(--selGlowA), 0 0 8px var(--selGlowB); }
    .tool.mini { width: 40px; height: 20px; color: #8a6a42; font-weight: bold; font-size: 11px; background: #f0dfc0; }
    .mode-tip { position: absolute; left: 62px; bottom: 14px; background: var(--accBg); border: 2px solid var(--accLine);
      border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: bold; color: var(--accFg); z-index: 7; display: none; }
    .bottombar { display: flex; align-items: center; gap: 10px; padding: 10px 14px 12px; flex: none; }
    .btn { flex: 1; padding: 8px 10px; background: linear-gradient(#faf0dc,#eed9b8); border: 3px solid #b08a5c;
      border-radius: 8px; box-shadow: inset 0 0 0 2px #fff6e0, inset 0 3px 0 #fffaf0, inset 0 -4px 0 #d9ba8a, 0 4px 0 #9a7a54;
      font-size: 14px; font-weight: bold; color: #7a5c38; text-shadow: 1px 1px 0 #fff3dd; text-align: center;
      display: flex; align-items: center; justify-content: center; gap: 7px; cursor: pointer; user-select: none; }
    .modal { position: absolute; inset: 0; background: rgba(60,40,20,.35); display: none; align-items: center;
      justify-content: center; z-index: 20; padding: 14px; }
    .modal.open { display: flex; }
    .mpanel { width: min(480px, 96%); max-height: 90%; overflow: auto; background: #f8efe0; border: 4px solid #c9a273;
      border-radius: 10px; box-shadow: inset 0 0 0 4px #fff6e8, 0 10px 30px rgba(0,0,0,.45); }
    .mtitle { background: var(--sky); border-bottom: 3px solid var(--skyLine); padding: 8px 12px;
      display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: bold; color: #7a5c38; }
    .mtitle > span:first-child { background: linear-gradient(#faf0dc,#eed9b8); border: 2px solid #8a6844; border-radius: 7px;
      padding: 2px 10px; text-shadow: 1px 1px 0 #fff3dd; box-shadow: 0 2px 0 var(--tintSoft), inset 0 0 0 2px #fff6e0; }
    .mtitle .grow { flex: 1; }
    .mbody { padding: 10px 12px 12px; }
    .tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .tab { padding: 4px 12px; border-radius: 7px; background: #f0dfc0; border: 2px solid #c2a274; color: #8a6a42;
      font-size: 12px; font-weight: bold; cursor: pointer; }
    .tab.active { background: var(--accBg); border-color: var(--accLine); color: var(--accFg); }
    .items { display: flex; flex-direction: column; gap: 7px; }
    .item { display: flex; align-items: center; gap: 9px; padding: 5px 9px; background: #faf0dc;
      border: 2px solid #c2a274; border-radius: 8px; }
    .item .icon { width: 40px; height: 40px; flex: none; background: #f4e6cf; border: 2px solid #d9c49a;
      border-radius: 6px; display: flex; align-items: center; justify-content: center; }
    .item .info { flex: 1; min-width: 0; }
    .item .name { font-size: 13px; font-weight: bold; color: #6b4f2e; }
    .selrow { cursor: pointer; }
    .selrow.selon { border-color: var(--accLine); box-shadow: inset 0 0 0 2px var(--accBg); }
    .selmark { width: 22px; text-align: center; font-size: 16px; font-weight: bold; color: var(--accFg); flex: none; }
    .item .meta { font-size: 11px; color: #a3763d; margin-top: 1px; line-height: 1.5; }   /* M-2: m\xF4 t\u1EA3 kh\xF4ng c\u1EAFt ng\u1EAFn, xu\u1ED1ng d\xF2ng \u0111\u1EA7y \u0111\u1EE7 (m\xF4 t\u1EA3 ch\u1EE9c n\u0103ng \u0111\u1ED9t bi\u1EBFn l\xE0 th\xF4ng tin c\u1ED1t l\xF5i) */
    .acts { display: flex; gap: 5px; flex: none; }
    .ibtn { width: 30px; height: 30px; background: #faf0dc; border: 2px solid #b08a5c; border-radius: 6px;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      font-size: 15px; font-weight: bold; color: #7a5c38; user-select: none;
      box-shadow: inset 0 2px 0 #fffdf4, inset 0 -2px 0 #e3c795; }
    .price { display: flex; align-items: center; gap: 3px; font-size: 13px; font-weight: bold; color: #a3763d; }
    .buy { padding: 5px 12px; background: var(--buyBg); border: 3px solid var(--buyLine);
      border-radius: 7px; box-shadow: inset 0 -3px 0 var(--buyInset), 0 3px 0 var(--buyDeep); font-size: 12px; font-weight: bold;
      color: var(--buyFg); cursor: pointer; white-space: nowrap; user-select: none; }
    .buy.plain { background: linear-gradient(#faf0dc,#eed9b8); border-color: #b08a5c; color: #7a5c38;
      box-shadow: inset 0 -3px 0 #d9ba8a, 0 3px 0 #9a7a54; }
    .buy.witchy { background: linear-gradient(#efe9fa,#e2d6f5); border-color: #9a6ad8; color: #6a4a9a;
      box-shadow: inset 0 -3px 0 #cdb0ef, 0 3px 0 #7a4ab8; }   /* #53: gieo l\u1EA1i = ph\xF9 thu\u1EF7 b\xF3i to\xE1n, m\u1EB7c m\xE0u t\xEDm c\u1EE7a c\xF4 \u1EA5y */
    .buy.off { background: #e8dcc2; border-color: #bfa984; color: #a99a78; box-shadow: 0 3px 0 #9a8a68; cursor: default; }
    .note { font-size: 11px; color: #a3763d; line-height: 1.7; background: #f4e6cf; border: 2px solid #ddc39a;
      border-radius: 7px; padding: 7px 10px; }
    .toast { position: absolute; left: 50%; top: 52px; transform: translateX(-50%); background: var(--accBg);
      border: 2px solid var(--accLine); color: var(--accFg); font-size: 12px; font-weight: bold; border-radius: 7px;
      padding: 4px 12px; z-index: 30; display: none; }
    .picker { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .pick { display: flex; align-items: center; gap: 5px; padding: 4px 9px; background: #faf0dc;
      border: 2px solid #c2a274; border-radius: 7px; font-size: 12px; font-weight: bold; color: #6b4f2e; cursor: pointer; }
    .pick.active { border-color: var(--accLine); background: var(--accBg); color: var(--accFg); }
`;

// src/ui.js
var root;
var sh;
var $id;
var fieldEl;
var decoLayer;
var fxLayer;
var swX = null;
var swY = null;
function applyTheme() {
  ctx.ui.classList.remove("theme-sakura", "theme-sky");
  ctx.ui.classList.add("theme-" + (ctx.S && ctx.S.theme === "sky" ? "sky" : "sakura"));
}
function applyPageSkin() {
  fieldEl.classList.toggle("pg2", ctx.S.page === 2);
  fieldEl.classList.toggle("pg3", ctx.S.page === 3);
  fieldEl.style.backgroundImage = tileURI(ctx.S.page === 2 ? "water" : ctx.S.page === 3 ? "mine" : "grass", 4242);
  fieldEl.style.backgroundSize = "192px 192px";
}
function renderPager() {
  const names = { 1: "\u0110\u1ED3ng c\u1ECF", 2: "V\xF9ng n\u01B0\u1EDBc", 3: "Khu m\u1ECF" };
  $id("pager").innerHTML = [1, 2, 3].map((pg) => {
    const un = pageUnlocked(pg);
    return `<span class="ptab p${pg}${ctx.S.page === pg ? " active" : ""}${un ? "" : " lock"}" data-pg="${pg}">${names[pg]}${un ? "" : " \u{1F512}"}</span>`;
  }).join("");
}
function plotEmote(pi, name) {
  const p = sh.querySelector('.plot[data-pi="' + pi + '"]');
  if (!p) return;
  const pr = p.getBoundingClientRect(), fr = fieldEl.getBoundingClientRect();
  const el = document.createElement("span");
  el.className = "emote";
  el.style.left = pr.left - fr.left + pr.width / 2 - 12 + "px";
  el.style.top = pr.top - fr.top - 14 + "px";
  el.innerHTML = spriteSVG(name, 24);
  fxLayer.appendChild(el);
  window.setTimeout(() => el.remove(), 1300);
}
function initUI() {
  root = document.createElement("div");
  root.id = "star-tavern-farm-root";
  document.body.appendChild(root);
  sh = root.attachShadow({ mode: "open" });
  $id = (id) => sh.querySelector("#" + id);
  const style = document.createElement("style");
  style.textContent = styleCSS;
  sh.appendChild(style);
  ctx.ui = document.createElement("div");
  ctx.ui.innerHTML = `
  <div id="orb" title="Ai m\xE0 th\xE8m l\xE0m n\xF4ng d\xE2n trong SillyTavern ch\u1EE9!">${spriteSVG("sprout", 34)}</div>
  <div id="win">
    <div class="titlebar" id="drag">
      <h1>${spriteSVG("strawhat", 16)}Ai m\xE0 th\xE8m l\xE0m n\xF4ng d\xE2n ch\u1EE9!</h1>
      <div class="close-x" id="close">\xD7</div>
    </div>
    <div class="statusbar">
      <span class="stat">${spriteSVG("coin", 22)}<b id="coins">0</b></span>
      <span class="stat"><span id="wicon">${spriteSVG("sun", 22)}</span><span id="daytxt"></span></span>
      <span class="stat">${spriteSVG("sprout", 18)}Ru\u1ED9ng <span id="blocktxt"></span></span>
    </div>
    <div class="ctrlrow">
      <span class="chip witchchip" id="chipRegen" style="display:none">\u2726 Gieo l\u1EA1i s\u1EF1 ki\u1EC7n h\xF4m nay</span>
      <span style="flex:1"></span>
      <span class="chip" id="chipLink">Li\xEAn k\u1EBFt th\u1EBB nh\xE2n v\u1EADt: T\u1EAFt</span>
      <span class="chip" id="chipStory" style="display:none">\u1EA2nh h\u01B0\u1EDFng c\u1ED1t truy\u1EC7n: T\u1EAFt</span>
    </div>
    <div class="banner" id="banner"><span class="btag" id="btag"></span><span id="btxt"></span><span class="bmut" id="bmut" title="Xem kh\u1EA3 n\u0103ng \u0111\u1ED9t bi\u1EBFn">\u2726</span><div class="mut-popup" id="mutPopup"></div></div>
    <div id="scroll">
      <div class="field">
        <div class="pager" id="pager"></div>
        <div class="blocks" id="blocks"></div>
        <div class="mascots" id="mascots"></div>
        <div id="witch" title="Ph\xF9 thu\u1EF7 tr\xF2n"></div>
        <div class="mode-tip" id="modetip"></div>
        <div class="toolbar" id="toolbar"></div>
      </div>
    </div>
    <div class="bottombar">
        <div class="btn" data-open="shop">${spriteSVG("shopIcon", 22)}C\u1EEDa h\xE0ng</div>
        <div class="btn" data-open="bag">${spriteSVG("bagIcon", 22)}Balo</div>
        <div class="btn" data-open="cfg">${spriteSVG("gearIcon", 22)}C\xE0i \u0111\u1EB7t</div>
    </div>
    <div class="modal" id="modal">
      <div class="mpanel">
        <div class="mtitle"><span id="mtitle-text"></span><span class="grow"></span><div class="close-x" id="mclose">\xD7</div></div>
        <div class="mbody" id="mbody"></div>
      </div>
    </div>
    <div class="toast" id="toast"></div>
  </div>`;
  sh.appendChild(ctx.ui);
  ctx.orb = $id("orb");
  ctx.win = $id("win");
  fieldEl = sh.querySelector(".field");
  fieldEl.style.backgroundImage = tileURI("grass", 4242);
  fieldEl.style.backgroundSize = "192px 192px";
  decoLayer = document.createElement("div");
  decoLayer.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;";
  fieldEl.insertBefore(decoLayer, fieldEl.firstChild);
  (function() {
    const drnd = mulberry32(20260717);
    function addDeco(o, cls, pos) {
      const el = document.createElement("span");
      el.className = cls;
      el.style.cssText = "position:absolute;" + pos;
      el.innerHTML = spriteSVG(o.n, o.s | 0);
      decoLayer.appendChild(el);
    }
    const side = [];
    for (let i = 0; i < 3; i++) side.push({ n: "pinkgrass", s: 28 + drnd() * 8, x: 0.4 + drnd() * 1.5, y: 8 + i * 17 + drnd() * 6 });
    for (let i = 0; i < 2; i++) side.push({ n: "pinkgrass", s: 28 + drnd() * 8, x: 90 + drnd() * 3, y: 24 + i * 17 + drnd() * 6 });
    side.forEach((o) => addDeco(o, "dside", `left:${o.x}%;top:${o.y}%;`));
    for (let i = 0; i < 3; i++) addDeco({ n: "pinkgrass", s: 28 + drnd() * 6 }, "dbot", `left:${9 + i * 16 + drnd() * 5}%;bottom:4px;`);
  })();
  fxLayer = document.createElement("div");
  fxLayer.style.cssText = "position:absolute;inset:0;overflow:visible;pointer-events:none;z-index:8;";
  fieldEl.appendChild(fxLayer);
  ctx.ui.addEventListener("click", (e) => {
    const pager = $id("pager");
    if (pager && pager.classList.contains("open") && !e.target.closest("#pager")) pager.classList.remove("open");
  }, true);
  $id("pager") && $id("pager").addEventListener("click", (e) => {
    const pager = $id("pager");
    const t = e.target.closest("[data-pg]");
    if (!t) {
      pager.classList.toggle("open");
      return;
    }
    const pg = +t.dataset.pg;
    if (!pageUnlocked(pg)) return toast("C\u1EA7n mua v\xE9 " + (pg === 2 ? "v\xF9ng n\u01B0\u1EDBc" : "khu m\u1ECF") + " \u1EDF c\u1EEDa h\xE0ng tr\u01B0\u1EDBc \u0111\xE3");
    if (pg === ctx.S.page) {
      pager.classList.remove("open");
      return;
    }
    ctx.S.page = pg;
    save();
    setMode(null);
    pager.classList.remove("open");
    applyPageSkin();
    renderPager();
    renderPlots();
    renderStatus();
    renderToolbar();
  });
  swX = null;
  swY = null;
  fieldEl.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      swX = e.touches[0].clientX;
      swY = e.touches[0].clientY;
    }
  }, { passive: true });
  fieldEl.addEventListener("touchend", (e) => {
    if (swX == null) return;
    const dx = e.changedTouches[0].clientX - swX, dy = e.changedTouches[0].clientY - swY;
    swX = swY = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const dir = dx < 0 ? 1 : -1;
    let pg = ctx.S.page + dir;
    while (pg >= 1 && pg <= 3 && !pageUnlocked(pg)) pg += dir;
    if (pg < 1 || pg > 3 || pg === ctx.S.page) return;
    ctx.S.page = pg;
    save();
    setMode(null);
    applyPageSkin();
    renderPager();
    renderPlots();
    renderStatus();
    renderToolbar();
    toast(pg === 1 ? "V\u1EC1 \u0111\u1ED3ng c\u1ECF~" : pg === 2 ? "T\u1EDBi v\xF9ng n\u01B0\u1EDBc~" : "T\u1EDBi khu m\u1ECF~");
  }, { passive: true });
}

// src/logic.js
var fmtDur = (m) => m < 60 ? m + " ph\xFAt" : m % 60 === 0 ? m / 60 + " gi\u1EDD" : (m / 60).toFixed(1) + " gi\u1EDD";
function growMs(cropId) {
  return TEST_MODE ? GROW : CROPS[cropId].grow * MIN;
}
function regrowMs(cropId) {
  const c = CROPS[cropId];
  return TEST_MODE ? REGROW : (c.regrowM || Math.round(c.grow * 0.6)) * MIN;
}
function plant(pi, cropId) {
  if ((ctx.S.seeds[cropId] || 0) <= 0) return toast("H\u1EBFt h\u1EA1t gi\u1ED1ng n\xE0y r\u1ED3i");
  let realId = cropId;
  if (cropId === "mystery") {
    const fam = ["dream", "key", "fang"][Math.floor(Math.random() * 3)];
    realId = fam + (ctx.S.page === 2 ? "W" : ctx.S.page === 3 ? "M" : "G");
  } else {
    const z = CROPS[cropId].zone || 1;
    if (z !== ctx.S.page) return toast(CROPS[cropId].name + " ph\u1EA3i tr\u1ED3ng \u1EDF " + ZONE_NAME[z] + " (trang " + z + ")");
  }
  ctx.S.seeds[cropId]--;
  const g = growMs(realId);
  const c = { id: realId, matureAt: now() + g, yieldBonus: 0, wateredUntil: 0, fertUsed: {} };
  if (CROPS[realId].regrow) c.left = REGROW_MAX;
  if (isRain()) {
    c.matureAt = now() + g * 0.9;
    c.rainDay = gameDay();
  }
  const ev = todayEvent();
  if (ev && ev.time_mult !== 1 && (!ev.favored_crop || CROPS[realId].name === ev.favored_crop)) {
    c.matureAt = now() + Math.round((c.matureAt - now()) * ev.time_mult);
    c.evDay = gameDay();
  }
  curPlots()[pi].crop = c;
  save();
  renderPlots();
  return true;
}
function water(pi) {
  const c = curPlots()[pi].crop;
  if (!c) return toast("\xD4 n\xE0y ch\u01B0a tr\u1ED3ng g\xEC");
  if (now() >= c.matureAt) return toast("Ch\xEDn r\u1ED3i, thu nhanh \u0111i!");
  if (now() < c.wateredUntil) return toast("V\u1EEBa t\u01B0\u1EDBi xong m\xE0");
  c.matureAt = now() + (c.matureAt - now()) * 0.75;
  c.wateredUntil = now() + WATER_CD;
  save();
  renderPlots();
  toast("T\u01B0\u1EDBi n\u01B0\u1EDBc xong, c\xE2y m\u1ECDc nhanh h\u01A1n!");
}
function fertilize(pi, fid, quiet) {
  const c = curPlots()[pi].crop;
  if (!c) return toast("\xD4 n\xE0y ch\u01B0a tr\u1ED3ng g\xEC");
  if ((ctx.S.ferts[fid] || 0) <= 0) return toast("H\u1EBFt lo\u1EA1i ph\xE2n n\xE0y r\u1ED3i");
  if (!c.fertUsed) c.fertUsed = {};
  if (c.fertUsed[fid]) return toast("V\u1EE5 n\xE0y \u0111\xE3 b\xF3n " + FERTS[fid].name + " r\u1ED3i");
  if (fid === "compost") {
    if (now() >= c.matureAt) return toast("Ch\xEDn r\u1ED3i, kh\u1ECFi b\xF3n ph\xE2n");
    c.matureAt = now() + (c.matureAt - now()) * 0.75;
  } else c.shiny = true;
  c.fertUsed[fid] = true;
  ctx.S.ferts[fid]--;
  save();
  renderPlots();
  if (!quiet) plotEmote(pi, fid === "compost" ? Math.random() < 0.5 ? "emLeaf" : "emNote" : Math.random() < 0.5 ? "emHeart" : "emStar");
  return true;
}
function rollMutation(c, pi) {
  if (c.mutRolled) return;
  c.mutRolled = true;
  const ev = todayEvent();
  if (!ev || !(ev.mutate_on_fert > 0)) return;
  const fertN = (c.fertUsed && c.fertUsed.compost ? 1 : 0) + (c.fertUsed && c.fertUsed.shiny ? 1 : 0);
  if (Math.random() < ev.mutate_on_fert * (0.3 + 0.35 * fertN)) {
    const prefix = (ev.mutate_prefix || "\u0111\u1ED9t bi\u1EBFn").slice(0, 20);
    let mutCode = prefix;
    if (!ctx.S.mutDesc) ctx.S.mutDesc = {};
    const cname = CROPS[c.id].name;
    const dsc = ev.mutate_desc && (ev.mutate_desc[cname] || ev.mutate_desc["*"]);
    if (dsc) {
      let attempt = 1;
      let descKey = mutCode + "@" + cname;
      while (ctx.S.mutDesc[descKey] && ctx.S.mutDesc[descKey] !== dsc) {
        attempt++;
        mutCode = prefix + "@" + attempt;
        descKey = mutCode + "@" + cname;
      }
      ctx.S.mutDesc[descKey] = dsc;
    }
    c.mut = mutCode;
    if (pi != null) {
      try {
        plotEmote(pi, "emStar");
      } catch (e) {
      }
    }
  }
}
function bagName(key) {
  const parts = key.split("@");
  return (parts[1] ? parts[1] + "\xB7" : "") + (CROPS[parts[0]] || { name: "?" }).name;
}
function bagPrice(key) {
  const parts = key.split("@");
  return Math.round((CROPS[parts[0]] || { sell: 0 }).sell * (parts[1] ? 1.25 : 1));
}
function mutDescOf(bagKey) {
  const parts = bagKey.split("@");
  if (!parts[1] || !ctx.S.mutDesc) return "";
  const mutCode = parts.slice(1).join("@");
  return ctx.S.mutDesc[mutCode + "@" + (CROPS[parts[0]] || { name: "" }).name] || ctx.S.mutDesc[parts[1]] || "";
}
function harvest(pi, quiet) {
  const c = curPlots()[pi].crop;
  if (!c || now() < c.matureAt) return null;
  rollMutation(c, pi);
  const def = CROPS[c.id];
  let n = 1 + (c.yieldBonus || 0);
  const dev = todayEvent();
  if (dev && dev.double_yield && (!dev.favored_crop || def.name === dev.favored_crop)) n *= 2;
  const key = c.mut ? c.id + "@" + c.mut : c.id;
  const shownName = (c.mut ? c.mut + "\xB7" : "") + def.name;
  ctx.S.bag[key] = (ctx.S.bag[key] || 0) + n;
  let shinyGain = 0;
  if (c.shiny) {
    shinyGain = Math.ceil(def.sell * 0.25) * n;
    ctx.S.coins += shinyGain;
    delete c.shiny;
  }
  c.yieldBonus = 0;
  if (c.left == null && def.regrow) c.left = REGROW_MAX;
  if (def.regrow && c.left - 1 > 0) {
    c.left--;
    c.matureAt = now() + regrowMs(c.id);
    c.fertUsed = {};
    delete c.rainDay;
    delete c.mut;
    delete c.mutRolled;
    save();
    renderPlots();
    if (!quiet) toast("Thu ho\u1EA1ch " + shownName + " \xD7" + n + " (c\xF2n thu \u0111\u01B0\u1EE3c " + c.left + " v\u1EE5 n\u1EEFa)" + (shinyGain ? " \u2728+" + shinyGain + "G" : ""));
  } else {
    curPlots()[pi].crop = null;
    save();
    renderPlots();
    if (!quiet) toast("Thu ho\u1EA1ch " + shownName + " \xD7" + n + (def.regrow ? " (c\xE2y n\xE0y c\xF4ng th\xE0nh th\xE2n tho\xE1i r\u1ED3i)" : "") + (shinyGain ? " \u2728+" + shinyGain + "G" : ""));
  }
  return { name: shownName, n };
}
function shovel(pi) {
  if (!curPlots()[pi].crop) return;
  curPlots()[pi].crop = null;
  save();
  renderPlots();
  toast("\u0110\xE3 x\u1EDBi b\u1ECF");
}
function buyBlock(bi) {
  const price = blockPrice(bi);
  if (ctx.S.coins < price) return toast("Kh\xF4ng \u0111\u1EE7 v\xE0ng");
  if (bi !== curBlocks()) return;
  ctx.S.coins -= price;
  addBlock();
  save();
  renderAll();
  toast("Khai hoang th\xE0nh c\xF4ng! C\xF3 ru\u1ED9ng m\u1EDBi r\u1ED3i");
}
function sell(key, n) {
  const have = ctx.S.bag[key] || 0;
  n = Math.min(n, have);
  if (n <= 0) return;
  const gain = bagPrice(key) * n;
  ctx.S.bag[key] = have - n;
  if (ctx.S.bag[key] === 0) delete ctx.S.bag[key];
  ctx.S.coins += gain;
  ctx.S.totalSales += gain;
  save();
  renderStatus();
  openPanel("bag");
  toast("B\xE1n \u0111\u01B0\u1EE3c " + gain + " G");
}

// src/pets.js
function petBubble(el, txt) {
  el.querySelector(".pbubble")?.remove();
  const b = document.createElement("span");
  b.className = "pbubble";
  b.textContent = txt;
  el.appendChild(b);
  window.setTimeout(() => b.remove(), 1700);
}
var petPos = {};
var petTgt = {};
var petHopT = {};
var WORK_BAND = 74;
var FLOATY = { cloudMallow: 1, ghostBlob: 1, bunny: 1 };
var GAITS = {
  // Dáng đi: len = độ dài một bước nhảy, dur = chu kỳ một cú nhảy (ms), hy = độ cao nhảy
  octo: { len: 8, dur: 260, hy: -4 },
  // Bạch tuộc: bước lắt nhắt bò sát đất
  octoCream: { len: 8, dur: 290, hy: -4 },
  // Bạch tuộc kem: bò còn chậm rì hơn nữa
  _: { len: 14, dur: 330, hy: -9 }
  // Mặc định: kiểu nảy chuẩn của dòng slime
};
var gaitOf = (id) => GAITS[id] || GAITS._;
var stopHop = (id) => {
  if (petHopT[id]) {
    window.clearTimeout(petHopT[id]);
    delete petHopT[id];
  }
};
function petSpot(id) {
  const ov = $id("mascots"), W = ov.clientWidth, H = ov.clientHeight;
  if (PETS[id] && PETS[id].job) {
    const workers = ctx.S.petsOut.filter((p) => PETS[p] && PETS[p].job);
    const anchor = W - 64 - Math.max(0, workers.indexOf(id)) * 62;
    return { x: Math.max(4, anchor - 10 + Math.random() * 20), y: Math.random() * 4 };
  }
  const x = 4 + Math.random() * Math.max(20, W - 64);
  return { x, y: WORK_BAND + 6 + Math.random() * Math.max(20, H - WORK_BAND - 70) };
}
function placePet(el, p, instant) {
  if (instant) el.style.transitionProperty = "transform, translate";
  else {
    const old = petPos[el.dataset.pet] || p;
    const dist = Math.hypot(p.x - old.x, p.y - old.y);
    const dur = dist < 40 ? 0.5 : Math.min(11, Math.max(3, dist / 18));
    el.style.transitionProperty = "transform, translate";
    el.style.transitionDuration = ".12s, " + dur + "s";
    el.style.transitionTimingFunction = "ease, linear";
    el.classList.toggle("flip", p.x < old.x);
  }
  el.style.translate = p.x + "px " + -p.y + "px";
  petPos[el.dataset.pet] = p;
}
function hopStep(el) {
  const id = el.dataset.pet;
  if (el.dataset.dragging) return;
  if (!el.isConnected) {
    stopHop(id);
    return;
  }
  const cur = petPos[id], tgt = petTgt[id], g = gaitOf(id);
  if (!cur || !tgt || Math.hypot(tgt.x - cur.x, tgt.y - cur.y) < 3) {
    delete petTgt[id];
    el.classList.remove("walk");
    stopHop(id);
    const cb = petArrive[id];
    delete petArrive[id];
    if (cb) cb();
    return;
  }
  const dx = tgt.x - cur.x, dy = tgt.y - cur.y, dist = Math.hypot(dx, dy);
  const len = Math.min(g.len, dist);
  const p = { x: cur.x + dx / dist * len, y: cur.y + dy / dist * len };
  el.classList.toggle("flip", dx < 0);
  el.classList.add("walk");
  el.style.setProperty("--hopd", g.dur + "ms");
  el.style.setProperty("--hy", g.hy + "px");
  el.style.transitionProperty = "transform, translate";
  el.style.transitionDuration = ".12s, " + g.dur + "ms";
  el.style.transitionTimingFunction = "ease, linear";
  el.style.translate = p.x + "px " + -p.y + "px";
  petPos[id] = p;
  petHopT[id] = window.setTimeout(() => hopStep(el), g.dur);
}
function moveTo(el, p) {
  const id = el.dataset.pet;
  if (el.dataset.dragging) return;
  if (FLOATY[id]) return placePet(el, p, false);
  petTgt[id] = p;
  if (!petHopT[id]) hopStep(el);
}
var petSleepT = {};
function sleepPet(el) {
  const id = el.dataset.pet;
  el.classList.add("sleep");
  el.insertAdjacentHTML("beforeend", '<span class="zzz">Z</span><span class="zzz z2">z</span>');
  petSleepT[id] = window.setTimeout(() => wakePet(el, false), 4e4 + Math.random() * 4e4);
}
function wakePet(el, startled) {
  const id = el.dataset.pet;
  if (petSleepT[id]) {
    window.clearTimeout(petSleepT[id]);
    delete petSleepT[id];
  }
  el.classList.remove("sleep");
  el.querySelectorAll(".zzz").forEach((z) => z.remove());
  const mate = pileWith[id];
  delete pileWith[id];
  if (mate) {
    delete pileWith[mate];
    const me = petEl(mate);
    if (startled && me && me.classList.contains("sleep")) window.setTimeout(() => wakePet(me, true), 260);
  }
  if (startled) petBubble(el, "?!");
}
var petArrive = {};
var pileWith = {};
var petTouch = {};
var touchBase = Date.now();
var scene = null;
var lastScene = "";
var nextSceneAt = Date.now() + (TEST_MODE ? 30 * 1e3 : 45 * MIN);
var sceneBusy = (id) => !!(scene && scene.ids.indexOf(id) >= 0);
var sceneTimer = (fn, ms) => {
  if (scene) scene.timers.push(window.setTimeout(fn, ms));
};
function endScene() {
  if (!scene) return;
  scene.timers.forEach((t) => window.clearTimeout(t));
  scene = null;
}
function petEl(id) {
  return sh.querySelector('#mascots .pet[data-pet="' + id + '"]');
}
function walkTo(el, p, cb) {
  const id = el.dataset.pet;
  if (FLOATY[id]) {
    const old = petPos[id] || p;
    const dur = Math.min(11, Math.max(3, Math.hypot(p.x - old.x, p.y - old.y) / 18));
    placePet(el, p, false);
    if (cb) sceneTimer(cb, dur * 1e3 + 80);
    return;
  }
  petTgt[id] = p;
  if (cb) petArrive[id] = cb;
  if (!petHopT[id]) hopStep(el);
}
function tryScene() {
  const idle = [], asleep = [], workIdle = [];
  sh.querySelectorAll("#mascots .pet").forEach((el) => {
    const id = el.dataset.pet;
    if (petTgt[id]) return;
    if (PETS[id].job) {
      if (!el.classList.contains("sleep")) workIdle.push(id);
      return;
    }
    (el.classList.contains("sleep") ? asleep : idle).push(id);
  });
  const pool = [];
  if (idle.length >= 2) pool.push("bump");
  if (idle.length + workIdle.length >= 2) pool.push("yawn");
  if (idle.filter((i) => !FLOATY[i]).length >= 2) pool.push("chase");
  if (idle.length >= 1 && asleep.length >= 1) pool.push("pile");
  const picks = pool.filter((a) => a !== lastScene);
  if (!picks.length) return;
  const act = picks[Math.floor(Math.random() * picks.length)];
  lastScene = act;
  nextSceneAt = now() + (TEST_MODE ? 45 * 1e3 + Math.random() * 90 * 1e3 : 60 * MIN + Math.random() * 120 * MIN);
  const shuffle = (a) => a.sort(() => Math.random() - 0.5);
  const ov = $id("mascots"), W = ov.clientWidth, H = ov.clientHeight;
  const clampX = (x) => Math.max(4, Math.min(W - 60, x));
  const midY = () => WORK_BAND + 20 + Math.random() * Math.max(20, H - WORK_BAND - 100);
  if (act === "bump") {
    const [a, b] = shuffle(idle.slice());
    const ea = petEl(a), eb = petEl(b);
    const mx = clampX(60 + Math.random() * Math.max(40, W - 180)), my = midY();
    scene = { ids: [a, b], timers: [] };
    let met = 0;
    const meet = () => {
      if (++met < 2 || !scene) return;
      petBubble(ea, PETS[a].cry[0]);
      petBubble(eb, PETS[b].cry[0]);
      walkTo(ea, { x: clampX(petPos[a].x - 32), y: petPos[a].y });
      walkTo(eb, { x: clampX(petPos[b].x + 32), y: petPos[b].y });
      sceneTimer(endScene, 1600);
    };
    walkTo(ea, { x: clampX(mx - 26), y: my }, meet);
    walkTo(eb, { x: clampX(mx + 26), y: my }, meet);
    sceneTimer(endScene, 3e4);
  } else if (act === "yawn") {
    const [a, b] = shuffle(idle.concat(workIdle));
    const ea = petEl(a), eb = petEl(b);
    scene = { ids: [a, b], timers: [] };
    petBubble(ea, "(ng\xE1p\u2026)");
    sceneTimer(() => petBubble(eb, "(ng\xE1p theo\u2026)"), 1300);
    sceneTimer(() => sleepPet(ea), 2500);
    sceneTimer(() => {
      sleepPet(eb);
      pileWith[a] = b;
      pileWith[b] = a;
      endScene();
    }, 3300);
  } else if (act === "pile") {
    const b = asleep[Math.floor(Math.random() * asleep.length)];
    const a = idle[Math.floor(Math.random() * idle.length)];
    const ea = petEl(a), eb = petEl(b);
    scene = { ids: [a, b], timers: [] };
    const side = petPos[b].x > 70 ? -1 : 1;
    walkTo(ea, { x: clampX(petPos[b].x + side * 34), y: petPos[b].y }, () => {
      sleepPet(ea);
      pileWith[a] = b;
      pileWith[b] = a;
      endScene();
    });
    sceneTimer(endScene, 3e4);
  } else if (act === "chase") {
    const hop = shuffle(idle.filter((i) => !FLOATY[i]));
    const a = hop[0], b = hop[1];
    const ea = petEl(a), eb = petEl(b);
    scene = { ids: [a, b], timers: [] };
    let leg = 0;
    const run = () => {
      if (!scene) return;
      if (++leg > 3) {
        petBubble(eb, "(ph\xF9\u2026 c\u1EAFt \u0111u\xF4i r\u1ED3i)");
        return endScene();
      }
      const p = { x: clampX(20 + Math.random() * Math.max(40, W - 100)), y: midY() };
      walkTo(eb, p);
      sceneTimer(() => walkTo(ea, { x: clampX(p.x - 22), y: p.y }, run), 380);
    };
    petBubble(ea, "(th\xECnh th\u1ECBch th\u1ECBch!)");
    petBubble(eb, "(oaa!)");
    run();
    sceneTimer(endScene, 45e3);
  }
}
function renderPets() {
  endScene();
  Object.keys(petHopT).forEach(stopHop);
  for (const k in petTgt) delete petTgt[k];
  for (const k in petArrive) delete petArrive[k];
  for (const k in pileWith) delete pileWith[k];
  Object.keys(petSleepT).forEach((k) => {
    window.clearTimeout(petSleepT[k]);
    delete petSleepT[k];
  });
  $id("mascots").innerHTML = ctx.S.petsOut.map((id) => PETS[id] ? `<span class="pet" data-pet="${id}" title="Ch\u1ECDc ch\u1ECDc ${PETS[id].name}"><span class="pbody" style="animation-delay:-${(Math.random() * 1.8).toFixed(2)}s">${petSVG(id, 48)}</span></span>` : "").join("");
  sh.querySelectorAll("#mascots .pet").forEach((el) => {
    const id = el.dataset.pet;
    placePet(el, petPos[id] || petSpot(id), true);
  });
}
var wander;
function petPlant(el, cry) {
  const empty = [];
  for (let pi = 0; pi < curBlocks() * 4; pi++) if (!curPlots()[pi].crop) empty.push(pi);
  if (!empty.length) return petBubble(el, cry + " h\u1EBFt ch\u1ED7 tr\u1ED1ng r\u1ED3i");
  const usable = {};
  Object.keys(ctx.S.seeds).forEach((id) => {
    if (!(ctx.S.seeds[id] > 0) || !CROPS[id]) return;
    if (id === "mystery" || (CROPS[id].zone || 1) === ctx.S.page) usable[id] = ctx.S.seeds[id];
  });
  if (!Object.keys(usable).length) return petBubble(el, cry + " kh\xF4ng c\xF3 h\u1EA1t n\xE0o tr\u1ED3ng \u0111\u01B0\u1EE3c \u1EDF " + ZONE_NAME[ctx.S.page] + "\u2026");
  pickFrom("B\xE9 m\u1EA7m s\u01B0\u01A1ng: l\u1EA7n n\xE0y tr\u1ED3ng g\xEC \u0111\xE2y?", usable, (x) => CROPS[x].name, (sid) => {
    let k = 0;
    for (const pi of empty) {
      if (!(ctx.S.seeds[sid] > 0)) break;
      if (plant(pi, sid)) k++;
    }
    const pe = sh.querySelector('.pet[data-pet="dewSprout"]') || el;
    petBubble(pe, cry + " \u0111\xE3 tr\u1ED3ng " + k + " \xF4 " + CROPS[sid].name + (k < empty.length ? " (h\u1EBFt h\u1EA1t gi\u1ED1ng r\u1ED3i)" : "!"));
  });
}
function petHarvest(el, cry) {
  const got = {};
  curPlots().forEach((p, pi) => {
    const c = p.crop;
    if (!c || now() < c.matureAt) return;
    const r = harvest(pi, true);
    if (r) got[r.name] = (got[r.name] || 0) + r.n;
  });
  const ks = Object.keys(got);
  if (!ks.length) return petBubble(el, cry + " ch\u01B0a c\xF3 rau n\xE0o ch\xEDn");
  petBubble(el, cry + " cu\u1ED9n v\u1EC1 \u0111\u01B0\u1EE3c: " + ks.map((k) => k + "\xD7" + got[k]).join(", "));
}
function petFert(el, cry) {
  pickFrom("B\xE9 b\xED \u1EA9n: d\xF9ng lo\u1EA1i ph\xE2n n\xE0o?", ctx.S.ferts, (x) => FERTS[x].name, (fid) => {
    let k = 0;
    for (let pi = 0; pi < curBlocks() * 4 && ctx.S.ferts[fid] > 0; pi++) {
      const c = curPlots()[pi].crop;
      if (!c || now() >= c.matureAt || c.fertUsed && c.fertUsed[fid]) continue;
      if (fertilize(pi, fid, true)) k++;
    }
    const pe = sh.querySelector('.pet[data-pet="batBlob"]') || el;
    petBubble(pe, cry + (k ? " \u0111\xE3 b\xF3n " + k + " \xF4 " + FERTS[fid].name + "!" : " kh\xF4ng c\xF3 \xF4 n\xE0o c\u1EA7n b\xF3n ph\xE2n"));
  });
}
function initPets() {
  wander = window.setInterval(() => {
    if (!ctx.win || !ctx.win.classList.contains("open")) return;
    if (!scene && now() >= nextSceneAt) tryScene();
    sh.querySelectorAll("#mascots .pet").forEach((el) => {
      const id = el.dataset.pet;
      if (sceneBusy(id) || petTgt[id] || el.classList.contains("sleep")) return;
      if (!PETS[id].job && Math.random() < 0.08) return sleepPet(el);
      if (PETS[id].job && now() - (petTouch[id] || touchBase) > 5 * MIN && Math.random() < 0.08) return sleepPet(el);
      if (Math.random() < 0.35) moveTo(el, petSpot(id));
    });
  }, 7e3);
  let activeDrag = null;
  let dragAnimFrame = null;
  const mascots = $id("mascots");
  mascots.addEventListener("pointerdown", (e) => {
    if (!ctx.S.dragPet) return;
    const el = e.target.closest(".pet");
    if (!el) return;
    if (e.button !== 0) return;
    e.preventDefault();
    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {
    }
    const id = el.dataset.pet;
    if (petHopT[id]) {
      clearTimeout(petHopT[id]);
      petHopT[id] = null;
    }
    delete petTgt[id];
    delete petArrive[id];
    el.dataset.dragging = "true";
    const comp = window.getComputedStyle(el);
    let exactLeft = 0, exactBottom = 0;
    if (comp.translate && comp.translate !== "none") {
      const parts = comp.translate.split(" ").map(parseFloat);
      exactLeft = parts[0] || 0;
      exactBottom = -(parts[1] || 0);
    } else if (petPos[id]) {
      exactLeft = petPos[id].x;
      exactBottom = petPos[id].y;
    }
    el.style.translate = exactLeft + "px " + -exactBottom + "px";
    el.style.transitionProperty = "transform";
    el.style.transitionDuration = "0.12s";
    petPos[id] = { x: exactLeft, y: exactBottom };
    el.classList.remove("walk");
    activeDrag = {
      id: e.pointerId,
      el,
      petId: id,
      sx: e.clientX,
      sy: e.clientY,
      ox: exactLeft,
      oy: exactBottom,
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
      targetVx: 0,
      targetVy: 0,
      moved: false,
      lastX: e.clientX,
      lastY: e.clientY,
      dropped: false,
      lastTime: performance.now(),
      startPhysics: null
    };
    const updateDrag = () => {
      if (!activeDrag) return;
      const { el: el2, dropped, dx, dy, petId } = activeDrag;
      activeDrag.targetVx *= 0.85;
      activeDrag.targetVy *= 0.85;
      activeDrag.vx = activeDrag.vx * 0.7 + activeDrag.targetVx * 0.3;
      activeDrag.vy = activeDrag.vy * 0.7 + activeDrag.targetVy * 0.3;
      const vx = activeDrag.vx;
      const vy = activeDrag.vy;
      const stretchX = 1 + Math.min(Math.abs(vx) * 0.04, 0.4);
      const stretchY = 1 + Math.min(Math.abs(vy) * 0.04, 0.4);
      const scaleX = stretchX / stretchY;
      const scaleY = stretchY / stretchX;
      const skewX = Math.max(-30, Math.min(vx * -1.5, 30));
      const rDx = dropped ? 0 : dx;
      const rDy = dropped ? 0 : dy;
      el2.style.transformOrigin = "center";
      el2.style.transform = `translate3d(${rDx}px, ${rDy}px, 0) scale(${scaleX}, ${scaleY}) skewX(${skewX}deg)`;
      if (dropped && Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
        el2.style.transform = "";
        el2.style.transition = "";
        delete el2.dataset.dragging;
        moveTo(el2, petPos[petId]);
        activeDrag = null;
        return;
      }
      dragAnimFrame = requestAnimationFrame(updateDrag);
    };
    activeDrag.startPhysics = () => {
      dragAnimFrame = requestAnimationFrame(updateDrag);
    };
  });
  mascots.addEventListener("pointermove", (e) => {
    if (!activeDrag || activeDrag.id !== e.pointerId) return;
    const { sx, sy } = activeDrag;
    const rawDx = e.clientX - sx;
    const rawDy = e.clientY - sy;
    if (!activeDrag.moved && (Math.abs(rawDx) > 4 || Math.abs(rawDy) > 4)) {
      activeDrag.moved = true;
      activeDrag.el.style.transition = "none";
      if (activeDrag.startPhysics) activeDrag.startPhysics();
    }
    if (!activeDrag.moved) return;
    const nowMs = performance.now();
    const dt = Math.max(1, nowMs - (activeDrag.lastTime || nowMs));
    const rawVx = (e.clientX - activeDrag.lastX) / dt * 16.66;
    const rawVy = (e.clientY - activeDrag.lastY) / dt * 16.66;
    activeDrag.lastX = e.clientX;
    activeDrag.lastY = e.clientY;
    activeDrag.lastTime = nowMs;
    activeDrag.targetVx = rawVx;
    activeDrag.targetVy = rawVy;
    activeDrag.dx = rawDx;
    activeDrag.dy = rawDy;
  });
  const endDrag = (e) => {
    if (!ctx.S.dragPet) return;
    if (!activeDrag || activeDrag.id !== e.pointerId) return;
    const { el, petId, moved, dx, dy, ox, oy } = activeDrag;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch (err) {
    }
    if (moved) {
      const finalX = ox + dx;
      const finalY = oy - dy;
      el.style.translate = finalX + "px " + -finalY + "px";
      petPos[petId] = { x: finalX, y: finalY };
      activeDrag.dropped = true;
    } else {
      cancelAnimationFrame(dragAnimFrame);
      el.style.transform = "";
      el.style.transition = "";
      activeDrag = null;
      delete el.dataset.dragging;
      const def = PETS[petId];
      if (!def) return;
      petTouch[petId] = now();
      if (el.classList.contains("sleep")) return wakePet(el, true);
      const cry = def.cry[Math.floor(Math.random() * def.cry.length)];
      if (def.job === "plant") return petPlant(el, cry);
      if (def.job === "fert") return petFert(el, cry);
      if (def.job === "harvest") return petHarvest(el, cry);
      if (def.job) return petBubble(el, cry);
      let txt = cry;
      if (now() - (ctx.S.petPoke[petId] || 0) >= POKE_CD) {
        ctx.S.petPoke[petId] = now();
        const gain = 1 + Math.floor(Math.random() * 5);
        ctx.S.coins += gain;
        txt += petId === "prismBlob" ? " r\u0169 ra " + gain + " G \xE1nh v\u1EE5n!" : petId === "starBlob" ? " r\u01A1i ra " + gain + " G \xE1nh sao!" : " r\u01A1i ra " + gain + " G!";
        save();
        renderStatus();
      }
      petBubble(el, txt);
    }
  };
  mascots.addEventListener("pointerup", endDrag);
  mascots.addEventListener("pointercancel", endDrag);
  mascots.addEventListener("click", (e) => {
    if (ctx.S.dragPet) return;
    const el = e.target.closest(".pet");
    if (!el) return;
    const petId = el.dataset.pet;
    const def = PETS[petId];
    if (!def) return;
    petTouch[petId] = now();
    if (el.classList.contains("sleep")) return wakePet(el, true);
    const cry = def.cry[Math.floor(Math.random() * def.cry.length)];
    if (def.job === "plant") return petPlant(el, cry);
    if (def.job === "fert") return petFert(el, cry);
    if (def.job === "harvest") return petHarvest(el, cry);
    if (def.job) return petBubble(el, cry);
    let txt = cry;
    if (now() - (ctx.S.petPoke[petId] || 0) >= POKE_CD) {
      ctx.S.petPoke[petId] = now();
      const gain = 1 + Math.floor(Math.random() * 5);
      ctx.S.coins += gain;
      txt += petId === "prismBlob" ? " r\u0169 ra " + gain + " G \xE1nh v\u1EE5n!" : petId === "starBlob" ? " r\u01A1i ra " + gain + " G \xE1nh sao!" : " r\u01A1i ra " + gain + " G!";
      save();
      renderStatus();
    }
    petBubble(el, txt);
  });
}

// src/shop.js
function openModal(title, bodyHTML) {
  $id("mtitle-text").textContent = title;
  $id("mbody").innerHTML = bodyHTML;
  $id("modal").classList.add("open");
}
function closeModal() {
  $id("modal").classList.remove("open");
  $id("mbody").innerHTML = "";
  setPendingPick(null);
  bagSellMode = false;
}
var shopTab = "seed";
var bagTab = "crop";
var bagSellMode = false;
var bagSel = {};
function openPanel(kind) {
  if (kind === "shop") {
    const tabs = [["seed", "H\u1EA1t gi\u1ED1ng"], ["fert", "Ph\xE2n b\xF3n"], ["pet", "Th\xFA c\u01B0ng"], ["pass", "V\xE9"]];
    let items = "";
    if (shopTab === "seed") {
      items = [1, 2, 3].map((z) => {
        const list = Object.entries(CROPS).filter(([id, c]) => !c.hidden && (c.zone || 1) === z);
        if (!list.length) return "";
        const un = pageUnlocked(z);
        const head = `<div class="note" style="margin:8px 0 6px">C\xE2y ${ZONE_NAME[z]} (trang ${z})${un ? "" : " \xB7 \u{1F512} c\u1EA7n v\xE9 " + (z === 2 ? "v\xF9ng n\u01B0\u1EDBc" : "khu m\u1ECF")}</div>`;
        return head + list.map(([id, c]) => `
        <div class="item${un ? "" : " locked"}"><span class="icon">${spriteSVG(c.sp, 32)}</span>
          <span class="info"><div class="name">H\u1EA1t ${c.name}${c.regrow ? ' <span style="font-size:10px;color:#6a4a9a">t\xE1i sinh</span>' : ""}</div>
          <div class="meta">Ch\xEDn sau ${fmtDur(c.grow)}${c.regrow ? " (t\xE1i sinh " + fmtDur(c.regrowM || Math.round(c.grow * 0.6)) + ")" : ""} \xB7 Gi\xE1 b\xE1n ${c.sell} G \xB7 \u0110ang c\xF3 ${ctx.S.seeds[id] || 0}</div></span>
          ${un ? `<span class="price">${spriteSVG("coin", 16)}${c.seed}</span>
          <span class="buy${ctx.S.coins < c.seed ? " off" : ""}" data-buyseed="${id}">Mua</span>` : '<span class="buy off">Ch\u01B0a m\u1EDF kho\xE1</span>'}</div>`).join("");
      }).join("");
    } else if (shopTab === "fert") {
      items = Object.entries(FERTS).map(([id, f]) => `
        <div class="item"><span class="icon">${spriteSVG("toolFert", 32)}</span>
          <span class="info"><div class="name">${f.name}</div><div class="meta">${f.desc} \xB7 \u0110ang c\xF3 ${ctx.S.ferts[id] || 0}</div></span>
          <span class="price">${spriteSVG("coin", 16)}${f.price}</span>
          <span class="buy${ctx.S.coins < f.price ? " off" : ""}" data-buyfert="${id}">Mua</span></div>`).join("");
    } else if (shopTab === "pet") {
      items = Object.keys(PETS).map((id) => {
        const pd = PETS[id];
        const owned = ctx.S.pets.indexOf(id) >= 0;
        const unlocked = pageUnlocked(pd.page);
        const poor = ctx.S.coins < pd.price;
        const btn = owned ? '<span class="buy off">\u0110\xE3 \u1EDF nh\xE0</span>' : !unlocked ? '<span class="buy off">Ch\u01B0a m\u1EDF kho\xE1</span>' : `<span class="buy${poor ? " off" : ""}" data-buypet="${id}">\u0110\xF3n v\u1EC1 nh\xE0</span>`;
        const priceHtml = owned || !unlocked ? "" : `<span class="price">${spriteSVG("coin", 16)}${pd.price.toLocaleString()}</span>`;
        const lockNote = !unlocked ? " \xB7 c\u1EA7n v\xE9 " + (pd.page === 2 ? "v\xF9ng n\u01B0\u1EDBc" : "khu m\u1ECF") : "";
        return `
        <div class="item${!unlocked && !owned ? " locked" : ""}"><span class="icon">${petSVG(id, 34)}</span>
          <span class="info"><div class="name">${pd.name}</div>
          <div class="meta">${pd.desc}${lockNote}</div></span>
          ${priceHtml}${btn}</div>`;
      }).join("");
    } else {
      items = Object.keys(PASSES).map((k) => {
        const ps = PASSES[k];
        const owned = !!ctx.S.passes[k];
        return `
        <div class="item"><span class="icon">${spriteSVG(k === "water" ? "lotus" : "gem", 32)}</span>
          <span class="info"><div class="name">${ps.name}</div><div class="meta">${ps.desc}</div></span>
          ${owned ? "" : `<span class="price">${spriteSVG("coin", 16)}${ps.price.toLocaleString()}</span>`}
          <span class="buy${owned ? " plain" : ""}" data-passdlg="${k}">${owned ? "Xem v\xE9" : "Mua"}</span></div>`;
      }).join("");
    }
    openModal("C\u1EEDa h\xE0ng", `
      <div style="display:flex;justify-content:flex-end;align-items:center;gap:4px;font-size:12px;font-weight:bold;color:#7a5c38;margin-bottom:6px">${spriteSVG("coin", 16)}${ctx.S.coins.toLocaleString()}</div>
      <div class="tabs">${tabs.map(([k, n]) => `<span class="tab${shopTab === k ? " active" : ""}" data-tab="${k}">${n}</span>`).join("")}</div>
      <div class="items">${items}</div>`);
    $id("mbody").querySelectorAll("[data-tab]").forEach((t) => t.addEventListener("click", () => {
      shopTab = t.dataset.tab;
      openPanel("shop");
    }));
    $id("mbody").querySelectorAll("[data-buyseed]").forEach((b) => b.addEventListener("click", () => openBuyDlg("seed", b.dataset.buyseed)));
    $id("mbody").querySelectorAll("[data-buyfert]").forEach((b) => b.addEventListener("click", () => openBuyDlg("fert", b.dataset.buyfert)));
    $id("mbody").querySelectorAll("[data-buypet]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.buypet, pd = PETS[id];
      if (ctx.S.pets.indexOf(id) >= 0) return;
      if (ctx.S.coins < pd.price) return toast("C\xF2n thi\u1EBFu " + (pd.price - ctx.S.coins).toLocaleString() + " G");
      ctx.S.coins -= pd.price;
      ctx.S.pets.push(id);
      if (ctx.S.petsOut.length < PETS_OUT_MAX) {
        ctx.S.petsOut.push(id);
        toast(pd.name + " \u0111\xE3 d\u1ECDn ra b\u1EDD ru\u1ED9ng nh\xE0 b\u1EA1n!");
      } else toast(pd.name + " \u0111\xE3 v\u1EC1 nh\xE0! B\u1EDD ru\u1ED9ng ch\u1EADt r\u1ED3i, b\xE9 \u0111ang ngh\u1EC9 \u1EDF trang Balo \xB7 B\xE9 tr\xF2n");
      save();
      renderStatus();
      renderPets();
      openPanel("shop");
    }));
    $id("mbody").querySelectorAll("[data-passdlg]").forEach((b) => b.addEventListener("click", () => openPassDlg(b.dataset.passdlg)));
  } else if (kind === "bag") {
    const btabs = `<div class="tabs"><span class="tab${bagTab === "crop" ? " active" : ""}" data-btab="crop">N\xF4ng s\u1EA3n</span><span class="tab${bagTab === "pet" ? " active" : ""}" data-btab="pet">B\xE9 tr\xF2n</span><span class="tab${bagTab === "relic" ? " active" : ""}" data-btab="relic">Qu\xE0 c\u1EE7a b\xE9 tr\xF2n</span></div>`;
    if (bagTab === "relic") {
      const sh2 = ctx.S.shards || { prism: 0, star: 0 };
      const relicRows = (ctx.S.seeds.mystery > 0 ? `
      <div class="item"><span class="icon">${spriteSVG("seedLight", 30)}</span>
        <span class="info"><div class="name">H\u1EA1t gi\u1ED1ng b\xED \u1EA9n \xD7${ctx.S.seeds.mystery}</div><div class="meta">Tr\u1ED3ng xu\u1ED1ng s\u1EBD ra ng\u1EABu nhi\xEAn m\u1ED9t h\u1ECD (ch\u1ECDn khi gieo h\u1EA1t / khi ch\u1ECDc b\xE9 m\u1EA7m s\u01B0\u01A1ng)</div></span></div>` : "") + (sh2.prism > 0 ? `
      <div class="item"><span class="icon">${spriteSVG("shardPrism", 30)}</span>
        <span class="info"><div class="name">M\u1EA3nh l\u0103ng quang \xD7${sh2.prism}</div><div class="meta">D\xF9ng \u0111\u1EC3 "\u0111\u1ED5i \u0111\u01A1n kh\xE1c" \u1EDF trang \u0111\u01A1n h\xE0ng c\u1EE7a ph\xF9 thu\u1EF7</div></span></div>` : "") + (sh2.star > 0 ? `
      <div class="item"><span class="icon">${spriteSVG("shardStar", 30)}</span>
        <span class="info"><div class="name">M\u1EA3nh ng\xF4i sao \xD7${sh2.star}</div><div class="meta">\u0110\u1EADp v\u1EE1 s\u1EBD tri\u1EC7u h\u1ED3i ph\xF9 thu\u1EF7 tr\xF2n gh\xE9 th\u0103m</div></span>
        <span class="buy" data-useshard="star">Tri\u1EC7u h\u1ED3i</span></div>` : "");
      openModal("Balo", btabs + (relicRows || '<div class="note">Ng\u0103n qu\xE0 c\xF2n tr\u1ED1ng~ H\u1EA1t gi\u1ED1ng b\xED \u1EA9n \u0111\u1EBFn t\u1EEB chuy\u1EBFn t\xECm kho b\xE1u c\u1EE7a b\xE9 qu\u1EF7/b\xE9 thi\xEAn th\u1EA7n v\xE0 t\u1EEB \u0111\u01A1n h\xE0ng c\u1EE7a ph\xF9 thu\u1EF7; b\xE9 l\u0103ng quang / b\xE9 chu\xF4ng sao \u0111i t\xECm kho b\xE1u s\u1EBD mang m\u1EA3nh v\u1EE1 v\u1EC1</div>'));
      $id("mbody").querySelectorAll("[data-btab]").forEach((t) => t.addEventListener("click", () => {
        bagTab = t.dataset.btab;
        openPanel("bag");
      }));
      $id("mbody").querySelectorAll("[data-useshard]").forEach((b) => b.addEventListener("click", useStarShard));
      return;
    }
    if (bagTab === "pet") {
      const prow = ctx.S.pets.map((id) => {
        const pd = PETS[id];
        if (!pd) return "";
        const out = ctx.S.petsOut.indexOf(id) >= 0;
        const cfg = "", cfgBtn = "";
        return `
        <div class="item"><span class="icon">${petSVG(id, 34)}</span>
          <span class="info"><div class="name">${pd.name}${out ? ' <span style="font-size:10px;color:#4d7a26">\u0111ang ra s\xE2n</span>' : ""}</div>
          <div class="meta">${pd.desc}${cfg}</div></span>
          ${cfgBtn}
          <span class="buy${out ? " plain" : ""}" data-petout="${id}">${out ? "Thu v\u1EC1" : "Ra s\xE2n"}</span></div>`;
      }).join("") || '<div class="note">Ch\u01B0a c\xF3 b\xE9 tr\xF2n n\xE0o, ra c\u1EEDa h\xE0ng ng\u1EAFm th\u1EED \u0111i</div>';
      openModal("Balo", btabs + `<div class="note" style="margin-bottom:8px">B\u1EDD ru\u1ED9ng c\xF9ng l\xFAc \u0111\u1EE9ng \u0111\u01B0\u1EE3c t\u1ED1i \u0111a ${PETS_OUT_MAX} b\xE9; b\xE9 \u0111\u01B0\u1EE3c thu v\u1EC1 s\u1EBD ngh\u1EC9 \u1EDF \u0111\xE2y, kh\xF4ng l\xE0m vi\u1EC7c c\u0169ng kh\xF4ng t\xECm kho b\xE1u</div>` + prow);
      $id("mbody").querySelectorAll("[data-btab]").forEach((t) => t.addEventListener("click", () => {
        bagTab = t.dataset.btab;
        openPanel("bag");
      }));
      $id("mbody").querySelectorAll("[data-petout]").forEach((b) => b.addEventListener("click", () => {
        const id = b.dataset.petout;
        const i = ctx.S.petsOut.indexOf(id);
        if (i >= 0) ctx.S.petsOut.splice(i, 1);
        else {
          if (ctx.S.petsOut.length >= PETS_OUT_MAX) return toast("B\u1EDD ru\u1ED9ng ch\u1EC9 \u0111\u1EE9ng \u0111\u01B0\u1EE3c " + PETS_OUT_MAX + " b\xE9, thu m\u1ED9t b\xE9 v\u1EC1 \u0111\xE3");
          ctx.S.petsOut.push(id);
        }
        save();
        renderPets();
        openPanel("bag");
      }));
      return;
    }
    const rows = Object.entries(ctx.S.bag).map(([key, n]) => {
      const id = key.split("@")[0], mut = key.indexOf("@") > 0;
      const d0 = mutDescOf(key);
      const mdesc = d0 ? " \xB7 " + d0 : "";
      if (bagSellMode) {
        const on = !!bagSel[key];
        return `
      <div class="item selrow${on ? " selon" : ""}" data-selkey="${key}"><span class="icon">${spriteSVG(CROPS[id].sp, 32)}</span>
        <span class="info"><div class="name">${bagName(key)} \xD7${n}${mut ? ' <span style="font-size:11px;color:#8a5cc0">\u2726</span>' : ""}</div><div class="meta">${bagPrice(key)} G/c\xE1i${esc(mdesc)}</div></span>
        <span class="selmark">${on ? "\u2713" : ""}</span></div>`;
      }
      return `
      <div class="item"><span class="icon">${spriteSVG(CROPS[id].sp, 32)}</span>
        <span class="info"><div class="name">${bagName(key)} \xD7${n}${mut ? ' <span style="font-size:11px;color:#8a5cc0">\u2726</span>' : ""}</div><div class="meta">${bagPrice(key)} G/c\xE1i${esc(mdesc)}</div></span>
        <span class="acts">
          <span class="ibtn" data-takeout="${key}" title="L\u1EA5y ra (mang v\xE0o c\u1ED1t truy\u1EC7n, kh\xF4ng quy ra ti\u1EC1n)">${spriteSVG("emBang", 16)}</span>
          <span class="ibtn" data-selldlg="${key}" title="B\xE1n (t\u1EF1 ch\u1ECDn s\u1ED1 l\u01B0\u1EE3ng)">${spriteSVG("coin", 16)}</span>
        </span></div>`;
    }).join("");
    let sellBar = "";
    if (Object.keys(ctx.S.bag).length) {
      if (bagSellMode) {
        const total = Object.keys(bagSel).filter((k) => bagSel[k] && ctx.S.bag[k]).reduce((s, k) => s + bagPrice(k) * ctx.S.bag[k], 0);
        sellBar = `<div class="note" style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;margin-bottom:8px;white-space:nowrap;overflow:hidden">
          <b style="overflow:hidden;text-overflow:ellipsis">${total > 0 ? "T\u1ED5ng " + total.toLocaleString() + " G" : "B\u1EA5m v\xE0o t\u1EEBng m\u1EE5c \u0111\u1EC3 tick ch\u1ECDn th\u1EE9 mu\u1ED1n b\xE1n"}</b><span style="flex:1"></span>
          <span class="buy" id="sellSelGo" style="padding:4px 10px;font-size:11px;flex:none">B\xE1n</span>
          <span class="buy plain" id="sellSelNo" style="padding:4px 10px;font-size:11px;flex:none">Hu\u1EF7</span></div>`;
      } else {
        sellBar = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div class="note" style="flex:1">B\u1EA5m \xAB!\xBB \u0111\u1EC3 l\u1EA5y n\xF4ng s\u1EA3n ra mang v\xE0o c\u1ED1t truy\u1EC7n</div>
          <span class="buy" id="sellModeGo" style="flex:none">B\xE1n m\u1ED9t ch\u1EA1m</span></div>`;
      }
    }
    openModal("Balo", btabs + sellBar + (rows || '<div class="note">Balo tr\u1ED1ng tr\u01A1n, \u0111i thu \xEDt rau \u0111i n\xE0o</div>'));
    $id("mbody").querySelectorAll("[data-btab]").forEach((t) => t.addEventListener("click", () => {
      bagTab = t.dataset.btab;
      openPanel("bag");
    }));
    $id("mbody").querySelectorAll("[data-selldlg]").forEach((b) => b.addEventListener("click", () => openSellDlg(b.dataset.selldlg)));
    $id("mbody").querySelectorAll("[data-takeout]").forEach((b) => b.addEventListener("click", () => openTakeout(b.dataset.takeout)));
    const smGo = $id("sellModeGo");
    if (smGo) smGo.addEventListener("click", () => {
      bagSellMode = true;
      bagSel = {};
      openPanel("bag");
    });
    $id("mbody").querySelectorAll("[data-selkey]").forEach((el) => el.addEventListener("click", () => {
      bagSel[el.dataset.selkey] = !bagSel[el.dataset.selkey];
      openPanel("bag");
    }));
    const ssNo = $id("sellSelNo");
    if (ssNo) ssNo.addEventListener("click", () => {
      bagSellMode = false;
      openPanel("bag");
    });
    const ssGo = $id("sellSelGo");
    if (ssGo) ssGo.addEventListener("click", () => {
      const keys = Object.keys(bagSel).filter((k) => bagSel[k] && ctx.S.bag[k]);
      if (!keys.length) return toast("Ch\u01B0a tick c\xE1i n\xE0o c\u1EA3");
      let gain = 0;
      keys.forEach((k) => {
        gain += bagPrice(k) * ctx.S.bag[k];
        delete ctx.S.bag[k];
      });
      ctx.S.coins += gain;
      ctx.S.totalSales += gain;
      bagSellMode = false;
      save();
      renderStatus();
      toast("B\xE1n m\u1ED9t m\u1EBB n\xF4ng s\u1EA3n: +" + gain.toLocaleString() + " G");
      openPanel("bag");
    });
  } else {
    openModal("C\xE0i \u0111\u1EB7t", `
      <div class="shead" style="margin-top:0">Ch\u1EE7 \u0111\u1EC1 giao di\u1EC7n</div>
      <div class="picker" style="margin-bottom:4px">
        <span class="pick${ctx.S.theme !== "sky" ? " active" : ""}" data-settheme="sakura">\u{1F338} H\u1ED3ng anh \u0111\xE0o</span>
        <span class="pick${ctx.S.theme === "sky" ? " active" : ""}" data-settheme="sky">\u2601\uFE0F Tr\u1EDDi quang</span>
      </div>
      <div class="shead">API ph\u1EE5 (d\xF9ng cho s\u1EF1 ki\u1EC7n th\u1EBF gi\u1EDBi quan)</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <input class="inp" id="secUrl" placeholder="\u0110\u1ECBa ch\u1EC9 API, v\xED d\u1EE5 https://xx.com/v1" value="${esc(SEC.url)}">
        <input class="inp" id="secKey" type="password" placeholder="API Key (ch\u1EC9 l\u01B0u trong tr\xECnh duy\u1EC7t m\xE1y n\xE0y, kh\xF4ng v\xE0o save)" value="${esc(SEC.key)}">
        <input class="inp" id="secModel" placeholder="T\xEAn model, v\xED d\u1EE5 gemini-2.5-flash" value="${esc(SEC.model)}">
        <div class="mdrop" id="modelDrop" style="display:none"></div>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#7a5c38;font-weight:bold;cursor:pointer">
          <input type="checkbox" id="secAuto" ${SEC.autoReset ? "checked" : ""}> T\u1EF1 \u0111\u1ED9ng \u0111\u1EB7t l\u1EA1i s\u1EF1 ki\u1EC7n, m\u1ED7i
          <input class="inp" id="secHours" type="number" min="1" max="24" value="${SEC.resetHours}" style="width:60px;padding:3px 6px"> gi\u1EDD m\u1ED9t l\u1EA7n (1~24; t\u1EAFt th\xEC s\u1EF1 ki\u1EC7n gi\u1EEF nguy\xEAn, ch\u1EC9 gieo l\u1EA1i th\u1EE7 c\xF4ng)
        </label>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#7a5c38;font-weight:bold;cursor:pointer;margin-top:2px">
          Gi\u1EDBi h\u1EA1n ch\u1EEF Lorebook g\u1EEDi cho AI:
          <input class="inp" id="secWbLimit" type="number" min="0" max="1000000" value="${SEC.wbLimit !== void 0 ? SEC.wbLimit : 2e4}" style="width:80px;padding:3px 6px"> (0 = Kh\xF4ng c\u1EAFt, g\u1EEDi to\xE0n b\u1ED9)
        </label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
          <span class="buy" id="secSave">L\u01B0u c\u1EA5u h\xECnh</span>
          <span class="buy plain" id="secModels">L\u1EA5y model</span>
          <span class="buy plain" id="secTest">Ki\u1EC3m tra k\u1EBFt n\u1ED1i</span>
        </div>
      </div>
      <div class="shead">S\u1EF1 ki\u1EC7n th\u1EBF gi\u1EDBi quan \xB7 prompt tu\u1EF3 ch\u1EC9nh (ch\u1EC9 l\u01B0u \u1EDF th\u1EBB nh\xE2n v\u1EADt hi\u1EC7n t\u1EA1i)</div>
      <textarea class="inp" id="csPrompt" placeholder="V\xED d\u1EE5: th\u1EBF gi\u1EDBi n\xE0y linh kh\xED m\u1ECFng, b\u1EDBt s\u1EF1 ki\u1EC7n t\xEDch c\u1EF1c \u0111i; l\u1EDDi v\u0103n s\u1EF1 ki\u1EC7n vi\u1EBFt theo l\u1ED1i c\u1ED5.">${esc(CS.userPrompt)}</textarea>
      <div style="display:flex;gap:8px;margin-top:6px"><span class="buy" id="csPromptSave">L\u01B0u (ch\u1EC9 th\u1EBB n\xE0y)</span></div>
      <div class="shead">T\u01B0\u01A1ng t\xE1c th\xFA c\u01B0ng</div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#7a5c38;font-weight:bold;cursor:pointer;margin-top:6px">
        <input type="checkbox" id="cfgDragPet" ${ctx.S.dragPet ? "checked" : ""}> B\u1EADt t\xEDnh n\u0103ng nh\xE9o v\xE0 k\xE9o th\xFA c\u01B0ng
      </label>
      <div class="shead">C\xF4ng c\u1EE5 d\xE0nh cho Gi\xE1m \u0111\u1ED1c \u0110\u1ED3 ho\u1EA1</div>
      <div style="display:flex;gap:8px;margin-top:6px">
        <span class="buy plain" id="openSandboxBtn">\u{1F3A8} M\u1EDF X\u01B0\u1EDFng Ch\u1EBF T\xE1c AI</span>
      </div>
      <div class="note" style="margin:12px 0 8px">
        <b>H\u01B0\u1EDBng d\u1EABn ch\u01A1i</b><br>\xB7 Li\xEAn k\u1EBFt th\u1EBB nh\xE2n v\u1EADt: b\u1EADt l\xEAn s\u1EBD t\u1EA1o s\u1EF1 ki\u1EC7n d\u1EF1a theo th\u1EBB nh\xE2n v\u1EADt hi\u1EC7n t\u1EA1i<br>
        \xB7 \u1EA2nh h\u01B0\u1EDFng c\u1ED1t truy\u1EC7n: b\u1EADt l\xEAn c\xF3 th\u1EC3 t\xE1c \u0111\u1ED9ng ng\u01B0\u1EE3c v\xE0o c\u1ED1t truy\u1EC7n hi\u1EC7n t\u1EA1i<br>
        \xB7 Sau khi b\u1EADt li\xEAn k\u1EBFt, c\xE2y tr\u1ED3ng c\xF3 t\u1EC9 l\u1EC7 <b>\u0111\u1ED9t bi\u1EBFn</b> theo th\u1EBF gi\u1EDBi quan (ch\u1EC9 s\u1EF1 ki\u1EC7n c\xF3 n\u1ED9i dung "\u0111\u1ED9t bi\u1EBFn" m\u1EDBi sinh ra c\xE2y \u0111\u1ED9t bi\u1EBFn); c\xE2y \u0111\u1ED9t bi\u1EBFn c\xF3 th\u1EC3 "L\u1EA5y ra" trong balo \u0111\u1EC3 mang v\xE0o c\u1ED1t truy\u1EC7n l\xE0m \u0111\u1EA1o c\u1EE5<br>
        \xB7 H\u1EA1t gi\u1ED1ng b\xED \u1EA9n: tr\u1ED3ng ra c\xE2y ng\u1EABu nhi\xEAn. Ngu\u1ED3n: \u0111\u01A1n h\xE0ng c\u1EE7a ph\xF9 thu\u1EF7 tr\xF2n (c\u1EA7n v\xE9 v\xF9ng n\u01B0\u1EDBc m\u1EDBi m\u1EDF); b\xE9 qu\u1EF7 nh\u1ECF / b\xE9 thi\xEAn th\u1EA7n \u0111i t\xECm kho b\xE1u<br>
        \xB7 Save n\u1EB1m trong ch\xEDnh SillyTavern, c\u1EADp nh\u1EADt phi\xEAn b\u1EA3n c\u1EE9 nh\u1EADp script m\u1EDBi, save kh\xF4ng m\u1EA5t; API Key ph\u1EE5 ch\u1EC9 n\u1EB1m trong tr\xECnh duy\u1EC7t m\xE1y n\xE0y<br>
        \xB7 C\xE1c b\u1EA3n SillyTavern kh\xE1c nhau <b>kh\xF4ng d\xF9ng chung</b> (c\xE0i th\xEAm m\u1ED9t b\u1EA3n tr\xEAn \u0111i\u1EC7n tho\u1EA1i = m\u1ED9t v\u01B0\u1EDDn rau kh\xE1c); tr\u01B0\u1EDBc khi c\xE0i l\u1EA1i SillyTavern nh\u1EDB sao l\u01B0u th\u01B0 m\u1EE5c data</div>
      <span class="buy" id="resetSave">\u0110\u1EB7t l\u1EA1i save (c\u1EA9n th\u1EADn, b\u1EA5m hai l\u1EA7n)</span>`);
    $id("secSave").addEventListener("click", () => {
      Object.assign(SEC, {
        // @ts-ignore
        url: $id("secUrl").value.trim(),
        key: $id("secKey").value.trim(),
        model: $id("secModel").value.trim(),
        // @ts-ignore
        autoReset: $id("secAuto").checked,
        resetHours: clampN($id("secHours").value, 1, 24, 4),
        // @ts-ignore
        wbLimit: parseInt($id("secWbLimit").value, 10) || 0
      });
      saveSec();
      toast("\u0110\xE3 l\u01B0u c\u1EA5u h\xECnh API ph\u1EE5");
    });
    $id("secTest").addEventListener("click", () => testSecApi());
    $id("secModels").addEventListener("click", () => fetchModelList());
    if ($id("openSandboxBtn")) $id("openSandboxBtn").addEventListener("click", openSandbox);
    $id("mbody").querySelectorAll("[data-settheme]").forEach((b) => b.addEventListener("click", () => {
      ctx.S.theme = b.dataset.settheme;
      save();
      applyTheme();
      openPanel("cfg");
      toast(ctx.S.theme === "sky" ? "\u0110\u1ED5i sang giao di\u1EC7n tr\u1EDDi quang~" : "V\u1EC1 l\u1EA1i giao di\u1EC7n h\u1ED3ng anh \u0111\xE0o~");
    }));
    const cfgDragPet = $id("cfgDragPet");
    if (cfgDragPet) cfgDragPet.addEventListener("change", () => {
      ctx.S.dragPet = cfgDragPet.checked;
      save();
      toast(ctx.S.dragPet ? "\u0110\xE3 b\u1EADt t\xEDnh n\u0103ng k\xE9o th\u1EA3 th\xFA c\u01B0ng" : "\u0110\xE3 t\u1EAFt t\xEDnh n\u0103ng k\xE9o th\u1EA3 th\xFA c\u01B0ng");
    });
    $id("csPromptSave").addEventListener("click", () => {
      CS.userPrompt = $id("csPrompt").value.slice(0, 3e3);
      saveCharState();
      toast("\u0110\xE3 l\u01B0u v\xE0o th\u1EBB nh\xE2n v\u1EADt hi\u1EC7n t\u1EA1i");
    });
    let armed = false;
    $id("resetSave").addEventListener("click", () => {
      if (!armed) {
        armed = true;
        $id("resetSave").textContent = "B\u1EA5m l\u1EA7n n\u1EEFa \u0111\u1EC3 x\xE1c nh\u1EADn \u0111\u1EB7t l\u1EA1i!";
        return;
      }
      ctx.S = freshState();
      save(true);
      closeModal();
      renderAll();
      toast("\u0110\xE3 \u0111\u1EB7t l\u1EA1i");
    });
  }
}
function initShop() {
  $id("mclose").addEventListener("click", closeModal);
  $id("mbody").addEventListener("click", (e) => {
    const el = e.target.closest("[data-pick]");
    if (!el || !pendingPick) return;
    const cb = pendingPick;
    setPendingPick(null);
    closeModal();
    cb(el.dataset.pick);
  });
  $id("modal").addEventListener("click", (e) => {
    if (e.target === $id("modal")) closeModal();
  });
  sh.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openPanel(b.dataset.open)));
}

// src/windows.js
var tick = null;
function placeWin() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(760, vw * 0.96);
  let x = ctx.S.win ? ctx.S.win.fx * vw : (vw - w) / 2;
  let y = ctx.S.win ? ctx.S.win.fy * vh : vh * 0.04;
  ctx.win.style.left = Math.min(Math.max(x, 0), Math.max(vw - w, 0)) + "px";
  ctx.win.style.top = Math.min(Math.max(y, 0), vh - 60) + "px";
}
function toggleWin() {
  if (ctx.win.classList.contains("open")) {
    closeWin();
    return;
  }
  ctx.win.classList.add("open");
  layout();
  placeWin();
  settle();
  renderAll();
  tick = window.setInterval(() => {
    renderDynamic();
  }, 1e3);
}
function closeWin() {
  ctx.win.classList.remove("open");
  if (tick) {
    window.clearInterval(tick);
    tick = null;
  }
  save(true);
}
var wg = null;
var dragBar = null;
function initWindows() {
  $id("close").addEventListener("click", closeWin);
  dragBar = $id("drag");
  dragBar.addEventListener("pointerdown", (e) => {
    if (e.target.id === "close") return;
    dragBar.setPointerCapture(e.pointerId);
    wg = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: ctx.win.offsetLeft, oy: ctx.win.offsetTop };
  });
  dragBar.addEventListener("pointermove", (e) => {
    if (!wg || e.pointerId !== wg.id) return;
    ctx.win.style.left = wg.ox + e.clientX - wg.sx + "px";
    ctx.win.style.top = wg.oy + e.clientY - wg.sy + "px";
  });
  dragBar.addEventListener("pointerup", (e) => {
    if (!wg || e.pointerId !== wg.id) return;
    try {
      dragBar.releasePointerCapture(e.pointerId);
    } catch (er) {
    }
    wg = null;
    ctx.S.win = { fx: ctx.win.offsetLeft / window.innerWidth, fy: ctx.win.offsetTop / window.innerHeight };
    save();
  });
}

// src/orb.js
var disposers = [];
var gesture = null;
function placeOrb() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const x = Math.min(Math.max(ctx.S.orb.fx * vw, 4), vw - 56);
  const y = Math.min(Math.max(ctx.S.orb.fy * vh, 4), vh - 56);
  ctx.orb.style.left = x + "px";
  ctx.orb.style.top = y + "px";
  ctx.orb.classList.toggle("dockL", ctx.S.orb.dock === "L");
  ctx.orb.classList.toggle("dockR", ctx.S.orb.dock === "R");
}
function onOrbDown(e) {
  if (!e.isPrimary || e.pointerType === "mouse" && e.button !== 0) return;
  if (gesture) return;
  ctx.orb.setPointerCapture(e.pointerId);
  gesture = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: ctx.orb.offsetLeft, oy: ctx.orb.offsetTop, drag: false };
}
function onOrbMove(e) {
  if (!gesture || e.pointerId !== gesture.id) return;
  if (Math.hypot(e.clientX - gesture.sx, e.clientY - gesture.sy) > 5) {
    gesture.drag = true;
    ctx.orb.classList.remove("dockL", "dockR");
  }
  if (gesture.drag) {
    ctx.orb.style.left = gesture.ox + e.clientX - gesture.sx + "px";
    ctx.orb.style.top = gesture.oy + e.clientY - gesture.sy + "px";
  }
}
function onOrbUp(e, cancelled) {
  if (!gesture || e.pointerId !== gesture.id) return;
  const wasDrag = gesture.drag;
  try {
    ctx.orb.releasePointerCapture(e.pointerId);
  } catch (er) {
  }
  gesture = null;
  if (cancelled) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  if (wasDrag) {
    let nx = Math.min(Math.max(ctx.orb.offsetLeft, 4), vw - 56);
    let dock = null;
    if (nx < SNAP_EDGE) {
      nx = 4;
      dock = "L";
    } else if (nx > vw - 56 - SNAP_EDGE) {
      nx = vw - 56;
      dock = "R";
    }
    ctx.orb.style.left = nx + "px";
    ctx.S.orb = { fx: nx / vw, fy: Math.min(Math.max(ctx.orb.offsetTop, 4), vh - 56) / vh, dock };
    ctx.orb.classList.toggle("dockL", dock === "L");
    ctx.orb.classList.toggle("dockR", dock === "R");
    save();
  } else toggleWin();
}
var resizeTimer = null;
var onResize = () => {
  if (resizeTimer) window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    placeOrb();
    if (ctx.win.classList.contains("open")) {
      layout();
      placeWin();
      renderPlots();
    }
  }, 150);
};
var SPRITE_PX = 64;
var DECO_PX = 56;
function layout() {
  const vw = window.innerWidth;
  let plot = 74;
  if (vw <= 640) plot = Math.max(52, Math.min(74, Math.floor((Math.min(vw * 0.96, 760) - 92) / 4)));
  ctx.win.style.setProperty("--plot", plot + "px");
  SPRITE_PX = 48;
  DECO_PX = plot >= 70 ? 56 : 40;
}
function initOrb() {
  ctx.orb = $id("orb");
  ctx.win = $id("win");
  ctx.orb.addEventListener("pointerdown", onOrbDown);
  ctx.orb.addEventListener("pointermove", onOrbMove);
  ctx.orb.addEventListener("pointerup", (e) => onOrbUp(e, false));
  ctx.orb.addEventListener("pointercancel", (e) => onOrbUp(e, true));
  window.addEventListener("resize", onResize);
  disposers.push(() => window.removeEventListener("resize", onResize));
  placeOrb();
}

// src/render.js
var mode = null;
function setMode(val) {
  mode = val;
}
var buyConfirm = { b: -1, until: 0 };
var TOOLS = [
  { key: "seed", sp: "toolSeed", tip: "Gieo h\u1EA1t" },
  { key: "water", sp: "toolWater", tip: "T\u01B0\u1EDBi n\u01B0\u1EDBc" },
  { key: "fert", sp: "toolFert", tip: "B\xF3n ph\xE2n" },
  { key: "harvest", sp: "toolHarvest", tip: "Thu ho\u1EA1ch" },
  { key: "shovel", sp: "toolShovel", tip: "X\u1EDBi b\u1ECF" }
];
var toolbarOpen = false;
function renderToolbar() {
  const tb = $id("toolbar");
  tb.classList.toggle("open", toolbarOpen);
  if (!toolbarOpen) {
    tb.innerHTML = `<div class="tool" data-tool="expand" title="C\xF4ng c\u1EE5" style="width:34px;height:34px">${spriteSVG("toolSeed", 22)}</div>`;
  } else {
    tb.innerHTML = TOOLS.map(
      (t) => `<div class="tool${mode && mode.t === t.key ? " selected" : ""}" data-tool="${t.key}" title="${t.tip}">${spriteSVG(t.sp, 30)}</div>`
    ).join("") + `<div class="tool mini" data-tool="collapse">\u2715</div>`;
  }
  const tip = $id("modetip");
  if (mode) {
    const names = { seed: "Gieo h\u1EA1t", water: "T\u01B0\u1EDBi n\u01B0\u1EDBc", fert: "B\xF3n ph\xE2n", harvest: "Thu ho\u1EA1ch", shovel: "X\u1EDBi b\u1ECF" };
    let txt = "Ch\u1EBF \u0111\u1ED9 " + names[mode.t];
    if (mode.t === "seed") txt += " \xB7 " + CROPS[mode.id].name;
    if (mode.t === "fert") txt += " \xB7 " + FERTS[mode.id].name;
    if (mode.t === "shovel") txt += " \xB7 b\u1EA5m hai l\u1EA7n \u0111\u1EC3 x\xE1c nh\u1EADn";
    tip.textContent = txt + " \xB7 b\u1EA5m v\xE0o \xF4 ru\u1ED9ng \u0111\u1EC3 th\u1EF1c hi\u1EC7n";
    tip.style.display = "block";
  } else tip.style.display = "none";
}
var pendingPick = null;
function setPendingPick(val) {
  pendingPick = val;
}
function pickFrom(title, obj, nameFn, cb) {
  const ids = Object.keys(obj).filter((k) => obj[k] > 0);
  if (!ids.length) return toast("Trong balo kh\xF4ng c\xF3, ra c\u1EEDa h\xE0ng mua \u0111\xE3");
  openModal(title, `<div class="picker">${ids.map((id) => `<span class="pick" data-pick="${id}">${nameFn(id)} \xD7${obj[id]}</span>`).join("")}</div>`);
  pendingPick = cb;
}
var cacheWicon = "";
var cacheCoins = -1;
var cacheDayTxt = "";
var cacheBlockTxt = "";
function renderStatus() {
  if (ctx.S.coins !== cacheCoins) {
    $id("coins").textContent = ctx.S.coins.toLocaleString();
    cacheCoins = ctx.S.coins;
  }
  const w = weatherOf(gameDay());
  const wiconHtml = spriteSVG(w === "N\u1EAFng" ? "sun" : w === "M\u01B0a nh\u1ECF" ? "raincloud" : "cloud", 22);
  if (cacheWicon !== wiconHtml) {
    $id("wicon").innerHTML = wiconHtml;
    cacheWicon = wiconHtml;
  }
  const dayStr = "Ng\xE0y " + gameDay() + " \xB7 " + w + (w === "M\u01B0a nh\u1ECF" ? " (sinh tr\u01B0\u1EDFng +10%)" : "");
  if (cacheDayTxt !== dayStr) {
    $id("daytxt").textContent = dayStr;
    cacheDayTxt = dayStr;
  }
  const blockStr = ZONE_NAME[ctx.S.page] + " " + curBlocks() + "/6";
  if (cacheBlockTxt !== blockStr) {
    $id("blocktxt").textContent = blockStr;
    cacheBlockTxt = blockStr;
  }
}
function plotHTML(pi) {
  const c = curPlots()[pi].crop;
  if (!c) return "";
  const left = c.matureAt - now();
  const chip = CROPS[c.id].regrow && c.left != null ? `<span class="cnt2">${c.left}/${REGROW_MAX}</span>` : "";
  const fdot = c.fertUsed && (c.fertUsed.compost || c.fertUsed.shiny) ? '<span class="fdot" title="\u0110\xE3 b\xF3n ph\xE2n"></span>' : "";
  const mutPrefix = c.mut ? c.mut.split("@")[0] : "";
  const mut = c.mut ? `<span class="cnt2" style="left:3px;right:auto;background:#ead9f7;border-color:#9a6ad8;color:#6a4a9a" title="${mutPrefix}\xB7\u0111\u1ED9t bi\u1EBFn">\u2726</span>` : "";
  if (left <= 0) return spriteSVG(CROPS[c.id].sp, SPRITE_PX) + `<span class="ripe">!</span>` + chip + fdot + mut;
  const total = growMs(c.id);
  const prog = Math.min(0.99, 1 - left / total);
  return spriteSVG("seedling", SPRITE_PX) + `<div class="bar"><i style="width:${prog * 100 | 0}%"></i></div>` + chip + fdot + mut;
}
function renderPlots() {
  const wrap = $id("blocks");
  const pg = ctx.S.page, plots = curPlots(), nb = curBlocks();
  if (wrap.children.length !== 6 || wrap.dataset.pg !== String(pg)) {
    wrap.dataset.pg = pg;
    let html = "";
    for (let b = 0; b < 6; b++) {
      html += `<div class="block" data-block="${b}">`;
      for (let j = 0; j < 4; j++) {
        html += `<div class="plot" data-pi="${b * 4 + j}"></div>`;
      }
      html += `</div>`;
    }
    wrap.innerHTML = html;
  }
  const groundKind = pg === 2 ? "water" : pg === 3 ? "mine" : "grass";
  const plotKind = pg === 2 ? "wplot" : pg === 3 ? "mplot" : "soil";
  const wetKind = pg === 2 ? "wplotwet" : pg === 3 ? "mplotwet" : "wet";
  for (let b = 0; b < 6; b++) {
    const blockEl = wrap.children[b];
    const locked = b >= nb;
    if (locked !== blockEl.classList.contains("locked")) {
      blockEl.classList.toggle("locked", locked);
    }
    let signEl = blockEl.lastElementChild;
    const hasSign = signEl && signEl.classList.contains("sign");
    if (locked) {
      const next = b === nb;
      const confirming = buyConfirm.b === b && now() < buyConfirm.until;
      const poor = ctx.S.coins < blockPrice(b);
      const sclassName = next ? confirming ? "sign confirm" : poor ? "sign poor" : "sign" : "sign";
      const shtml = next ? confirming ? `B\u1EA5m l\u1EA7n n\u1EEFa<small>x\xE1c nh\u1EADn chi ${blockPrice(b).toLocaleString()} G</small>` : `Khai hoang<small>${spriteSVG("coin", 13)}${blockPrice(b).toLocaleString()} G</small>` : `Ch\u01B0a m\u1EDF<small>khai hoang \xF4 tr\u01B0\u1EDBc \u0111\xE3</small>`;
      if (!hasSign) {
        signEl = document.createElement("div");
        signEl.className = sclassName;
        if (!next) signEl.style.opacity = "0.55";
        if (next) signEl.dataset.buy = String(b);
        signEl.innerHTML = shtml;
        blockEl.appendChild(signEl);
        console.log("[Farm] Added sign to block", b);
      } else {
        if (signEl.className !== sclassName) signEl.className = sclassName;
        if (!next && signEl.style.opacity !== "0.55") signEl.style.opacity = "0.55";
        if (next && signEl.style.opacity === "0.55") signEl.style.opacity = "";
        if (next && signEl.dataset.buy !== String(b)) signEl.dataset.buy = String(b);
        if (!next && signEl.dataset.buy !== void 0) delete signEl.dataset.buy;
        if (signEl.innerHTML !== shtml) signEl.innerHTML = shtml;
      }
    } else {
      if (hasSign) signEl.remove();
    }
    for (let j = 0; j < 4; j++) {
      const pi = b * 4 + j;
      const pEl = blockEl.children[j];
      if (locked) {
        if (pEl.dataset.deco !== "lock") {
          pEl.dataset.deco = "lock";
          if (pEl.innerHTML !== "") pEl.innerHTML = "";
        }
      } else {
        if (pEl.dataset.deco === "lock") delete pEl.dataset.deco;
        const c = plots[pi].crop;
        const wet = c && now() < c.wateredUntil;
        if (wet !== pEl.classList.contains("watered")) {
          pEl.classList.toggle("watered", wet);
        }
        if (!c) {
          if (pEl.dataset.state !== "empty") {
            if (pEl.innerHTML !== "") pEl.innerHTML = "";
            pEl.dataset.state = "empty";
          }
        } else {
          const left = c.matureAt - now();
          if (left <= 0 && !c.mutRolled) {
            rollMutation(c, pi);
            save();
          }
          const stateStr = `${c.id}|${c.left}|${c.mut}|${c.fertUsed ? Object.keys(c.fertUsed).join(",") : ""}|${left <= 0 ? "ripe" : "grow"}`;
          if (pEl.dataset.state !== stateStr) {
            const expected = plotHTML(pi);
            if (pEl.innerHTML !== expected) pEl.innerHTML = expected;
            pEl.dataset.state = stateStr;
          } else {
            if (left > 0) {
              const prog = Math.min(0.99, 1 - left / growMs(c.id));
              const w = (prog * 100 | 0) + "%";
              const barI = pEl.querySelector(".bar i");
              if (barI && barI.style.width !== w) barI.style.width = w;
            }
          }
        }
      }
      const isLocked = pi >= nb * 4;
      const bg = isLocked ? tileURI(groundKind, pi * 31 + 5) : pEl.classList.contains("watered") ? tileURI(wetKind, pi * 31 + 5) : tileURI(plotKind, pi * 31 + 5);
      if (pEl.dataset.bg !== bg) {
        pEl.style.backgroundImage = bg;
        pEl.dataset.bg = bg;
      }
      const bgSz = isLocked ? "144px 144px" : "100% 100%";
      if (pEl.style.backgroundSize !== bgSz) pEl.style.backgroundSize = bgSz;
    }
  }
}
function renderChips() {
  const cl = $id("chipLink"), cs2 = $id("chipStory");
  cl.classList.toggle("on", CS.link);
  cl.textContent = "Li\xEAn k\u1EBFt th\u1EBB nh\xE2n v\u1EADt: " + (CS.link ? "B\u1EADt" : "T\u1EAFt");
  cs2.style.display = CS.link ? "" : "none";
  cs2.classList.toggle("on", CS.story);
  cs2.textContent = "\u1EA2nh h\u01B0\u1EDFng c\u1ED1t truy\u1EC7n: " + (CS.story ? "B\u1EADt" : "T\u1EAFt");
  $id("chipRegen").style.display = CS.link ? "" : "none";
}
function renderBanner() {
  const b = $id("banner");
  const bmut = $id("bmut");
  const mutPopup = $id("mutPopup");
  if (!CS.link) {
    b.classList.remove("show");
    bmut.style.display = "none";
    mutPopup.classList.remove("open");
    return;
  }
  if (eventPending) {
    b.classList.add("show");
    $id("btag").textContent = "S\u1EF1 ki\u1EC7n h\xF4m nay";
    $id("btxt").textContent = "Ph\xF9 thu\u1EF7 tr\xF2n \u0111ang ng\u1EAFm sao b\xF3i to\xE1n\u2026";
    bmut.style.display = "none";
    mutPopup.classList.remove("open");
    return;
  }
  const ev = todayEvent();
  if (!ev) {
    b.classList.remove("show");
    bmut.style.display = "none";
    mutPopup.classList.remove("open");
    return;
  }
  b.classList.add("show");
  $id("btag").textContent = "S\u1EF1 ki\u1EC7n h\xF4m nay \xB7 " + ev.name;
  const fx = [];
  if (ev.double_yield) fx.push("\u2728Thu ho\u1EA1ch h\xF4m nay \xD72!");
  if (ev.time_mult !== 1) fx.push(ev.time_mult < 1 ? "Sinh tr\u01B0\u1EDFng nhanh h\u01A1n (th\u1EDDi l\u01B0\u1EE3ng \xD7" + ev.time_mult + ")" : "Sinh tr\u01B0\u1EDFng ch\u1EADm l\u1EA1i (th\u1EDDi l\u01B0\u1EE3ng \xD7" + ev.time_mult + ")");
  if (ev.mutate_on_fert > 0) fx.push("C\xE2y h\xF4m nay c\xF3 th\u1EC3 \u0111\u1ED9t bi\u1EBFn");
  if (ev.favored_crop) fx.unshift("Ch\u1EC9 " + ev.favored_crop + " ch\u1ECBu \u1EA3nh h\u01B0\u1EDFng");
  const fb = ctx.S.dayEvent && ctx.S.dayEvent.source === "fallback";
  $id("btxt").textContent = (ev.flavor || "") + (fx.length ? "(" + fx.join(" \xB7 ") + ")" : "") + (fb ? "\u3014S\u1EF1 ki\u1EC7n ngo\u1EA1i tuy\u1EBFn" + (ctx.S.dayEvent.reason ? ": " + ctx.S.dayEvent.reason : "") + "\u3015" : "");
  const hasMut = ev.mutate_on_fert > 0 && ev.mutate_desc && Object.keys(ev.mutate_desc).length > 0;
  bmut.style.display = hasMut ? "flex" : "none";
  if (hasMut) {
    const prefix = ev.mutate_prefix || "\u0111\u1ED9t bi\u1EBFn";
    const chance = Math.round(ev.mutate_on_fert * 100);
    let html = '<div class="mut-header">\u2726 ' + esc(prefix) + ' <span class="mut-chance">(c\u01A1 b\u1EA3n ' + chance + "%, b\xF3n ph\xE2n t\u0103ng)</span></div>";
    const desc = ev.mutate_desc;
    const entries = Object.entries(desc).filter(([k]) => k !== "*");
    const wildcard = desc["*"] || "";
    if (entries.length > 0) {
      html += '<div class="mut-list">';
      entries.forEach(([crop, effect]) => {
        html += '<div class="mut-row"><span class="mut-crop">' + esc(crop) + '</span><span class="mut-effect">' + esc(effect) + "</span></div>";
      });
      html += "</div>";
    } else if (wildcard) {
      html += '<div class="mut-list"><div class="mut-row"><span class="mut-crop">T\u1EA5t c\u1EA3</span><span class="mut-effect">' + esc(wildcard) + "</span></div></div>";
    }
    mutPopup.innerHTML = html;
  } else {
    mutPopup.classList.remove("open");
  }
}
function renderDynamic() {
  if (ctx.win.classList.contains("open")) {
    renderStatus();
    renderPlots();
  }
}
function renderAll() {
  applyPageSkin();
  renderPager();
  renderStatus();
  renderPlots();
  renderToolbar();
  renderChips();
  renderBanner();
  renderPets();
  try {
    renderWitch();
  } catch (e) {
  }
}
function initRender() {
  $id("toolbar").addEventListener("click", (e) => {
    const el = e.target.closest("[data-tool]");
    if (!el) return;
    const k = el.dataset.tool;
    if (k === "expand") {
      toolbarOpen = true;
      renderToolbar();
      return;
    }
    if (k === "collapse") {
      toolbarOpen = false;
      mode = null;
      renderToolbar();
      return;
    }
    if (mode && mode.t === k) {
      mode = null;
      renderToolbar();
      return;
    }
    if (k === "seed") return pickFrom("Ch\u1ECDn h\u1EA1t gi\u1ED1ng \u0111\u1EC3 gieo", ctx.S.seeds, (id) => CROPS[id].name, (id) => {
      mode = { t: "seed", id };
      renderToolbar();
    });
    if (k === "fert") return pickFrom("Ch\u1ECDn ph\xE2n b\xF3n", ctx.S.ferts, (id) => FERTS[id].name, (id) => {
      mode = { t: "fert", id };
      renderToolbar();
    });
    mode = { t: k };
    renderToolbar();
  });
  $id("chipLink").addEventListener("click", () => {
    CS.link = !CS.link;
    if (!CS.link) {
      CS.story = false;
      setInjection("");
    }
    saveCharState();
    renderChips();
    renderBanner();
    updateInjection();
    if (CS.link) {
      requestDayEvent();
      toast("\u0110\xE3 b\u1EADt li\xEAn k\u1EBFt, \u0111ang gieo qu\u1EBB s\u1EF1 ki\u1EC7n h\xF4m nay theo th\u1EBF gi\u1EDBi quan");
    } else toast("\u0110\xE3 v\u1EC1 l\u1EA1i v\u01B0\u1EDDn rau ch\u01A1i m\u1ED9t m\xECnh");
  });
  $id("banner").addEventListener("click", (e) => {
    if (e.target.closest(".bmut") || e.target.closest(".mut-popup")) return;
    $id("banner").classList.toggle("expand");
    $id("mutPopup").classList.remove("open");
  });
  $id("bmut").addEventListener("click", (e) => {
    e.stopPropagation();
    $id("mutPopup").classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    const popup = $id("mutPopup");
    if (popup.classList.contains("open") && !e.target.closest(".mut-popup") && !e.target.closest(".bmut")) {
      popup.classList.remove("open");
    }
  });
  $id("chipRegen").addEventListener("click", () => {
    ctx.S.dayEvent = null;
    save();
    requestDayEvent(true);
    toast("\u0110ang gieo qu\u1EBB l\u1EA1i\u2026");
  });
  $id("chipStory").addEventListener("click", () => {
    CS.story = !CS.story;
    saveCharState();
    renderChips();
    updateInjection();
    toast(CS.story ? "T\xECnh h\xECnh v\u01B0\u1EDDn rau s\u1EBD \u0111\u01B0\u1EE3c th\xEC th\u1EA7m cho nh\u1EEFng ng\u01B0\u1EDDi trong c\u1ED1t truy\u1EC7n" : "V\u01B0\u1EDDn rau l\u1EA1i gi\u1EEF b\xED m\u1EADt");
  });
  $id("blocks").addEventListener("click", (e) => {
    const sign = e.target.closest("[data-buy]");
    if (sign) {
      const b = +sign.dataset.buy;
      if (ctx.S.coins < blockPrice(b)) {
        toast("C\xF2n thi\u1EBFu " + (blockPrice(b) - ctx.S.coins).toLocaleString() + " G");
        return;
      }
      if (buyConfirm.b === b && now() < buyConfirm.until) {
        buyConfirm = { b: -1, until: 0 };
        buyBlock(b);
      } else {
        buyConfirm = { b, until: now() + 4e3 };
        renderPlots();
      }
      return;
    }
    const p = e.target.closest(".plot");
    if (!p || p.dataset.deco) return;
    const pi = +p.dataset.pi;
    const c = curPlots()[pi].crop;
    if (c && now() >= c.matureAt && (!mode || mode.t !== "shovel")) {
      harvest(pi);
      return;
    }
    if (!mode) {
      if (c) toast(CROPS[c.id].name + " \xB7 c\xF2n " + fmtLeft(c.matureAt - now()));
      return;
    }
    if (mode.t === "seed") {
      if (c) return toast("\xD4 n\xE0y tr\u1ED3ng r\u1ED3i");
      plant(pi, mode.id);
      if ((ctx.S.seeds[mode.id] || 0) <= 0) {
        setMode(null);
        renderToolbar();
      }
      return;
    }
    if (mode.t === "water") return water(pi);
    if (mode.t === "fert") {
      fertilize(pi, mode.id);
      if ((ctx.S.ferts[mode.id] || 0) <= 0) {
        setMode(null);
        renderToolbar();
      }
      return;
    }
    if (mode.t === "harvest") return harvest(pi);
    if (mode.t === "shovel") {
      if (!c) return;
      if (mode.confirmPi === pi) {
        shovel(pi);
        mode.confirmPi = null;
      } else {
        mode.confirmPi = pi;
        toast("B\u1EA5m l\u1EA7n n\u1EEFa \u0111\u1EC3 x\xE1c nh\u1EADn x\u1EDBi b\u1ECF " + CROPS[c.id].name);
      }
    }
  });
}

// src/witch.js
var WITCH_CRY = ["C\xFAc cu, c\xF3 ai kh\xF4ng?", "\u25C6\u2726\u2234\u2026?", "(d\u01B0\u1EDBi v\xE0nh m\u0169 v\u1ECDng ra ti\u1EBFng l\u1EADt s\xE1ch)", "\u263D\u2042\u25C7!", "\u2736\u25C7\u2234\u2726\u2026", "Tinh t\u01B0\u1EE3ng h\xF4m nay \u0111\u1EB9p \u0111\u1EA5y."];
function witchArrive() {
  const wz = ctx.S.witch;
  wz.leaveAt = now() + WITCH_STAY;
  wz.missed = 0;
  wz.order = makeWitchOrder();
  save();
  renderWitch();
  toast("Ph\xF9 thu\u1EF7 tr\xF2n t\u1EDBi r\u1ED3i! Qu\u1EA7y h\xE0ng ng\xF4i sao \u1EDF g\xF3c d\u01B0\u1EDBi tr\xE1i b\u1EDD ru\u1ED9ng \u0111\xE3 s\xE1ng \u0111\xE8n");
}
function makeWitchOrder() {
  const pool = Object.entries(CROPS).filter(([id, c]) => !c.hidden && pageUnlocked(c.zone || 1));
  const pick = () => pool[Math.floor(Math.random() * pool.length)][0];
  const lines = [{ id: pick(), n: 2 + Math.floor(Math.random() * 3), mut: false, reward: 1, done: false }];
  if (CS.link && Math.random() < 0.5) {
    lines.push({ id: pick(), n: 1 + Math.floor(Math.random() * 2), mut: true, reward: 2, done: false });
  }
  return { lines, done: false };
}
function mutKeysOf(cropId) {
  return Object.keys(ctx.S.bag).filter((k) => k.split("@")[0] === cropId && k.indexOf("@") > 0);
}
function mutCountOf(cropId) {
  return mutKeysOf(cropId).reduce((s, k) => s + ctx.S.bag[k], 0);
}
function witchDeliver(li) {
  const wz = ctx.S.witch;
  if (!wz || !wz.order) return;
  const line = wz.order.lines[li];
  if (!line || line.done) return;
  if (!line.mut) {
    if ((ctx.S.bag[line.id] || 0) < line.n) return toast("C\xF2n thi\u1EBFu " + (line.n - (ctx.S.bag[line.id] || 0)) + " qu\u1EA3 " + CROPS[line.id].name);
    ctx.S.bag[line.id] -= line.n;
    if (!ctx.S.bag[line.id]) delete ctx.S.bag[line.id];
  } else {
    if (mutCountOf(line.id) < line.n) return toast("Lo\u1EA1i " + CROPS[line.id].name + " c\xF3 ti\u1EC1n t\u1ED1 c\xF2n thi\u1EBFu " + (line.n - mutCountOf(line.id)) + " qu\u1EA3");
    let need = line.n;
    for (const k of mutKeysOf(line.id)) {
      const take = Math.min(need, ctx.S.bag[k]);
      ctx.S.bag[k] -= take;
      if (!ctx.S.bag[k]) delete ctx.S.bag[k];
      need -= take;
      if (!need) break;
    }
  }
  ctx.S.seeds.mystery = (ctx.S.seeds.mystery || 0) + line.reward;
  line.done = true;
  if (wz.order.lines.every((l) => l.done)) {
    wz.order.done = true;
    wz.leaveAt = Math.min(wz.leaveAt, now() + 60 * 1e3);
  }
  save();
  renderStatus();
  toast("Giao h\xE0ng xong! Nh\u1EADn \u0111\u01B0\u1EE3c h\u1EA1t gi\u1ED1ng b\xED \u1EA9n \xD7" + line.reward);
  openWitchDlg();
}
function openWitchDlg() {
  const wz = ctx.S.witch;
  if (!wz || !wz.leaveAt || now() > wz.leaveAt || !wz.order) return;
  const rows = wz.order.lines.map((l, i) => {
    const nm = CROPS[l.id].name;
    const have = l.mut ? mutCountOf(l.id) : ctx.S.bag[l.id] || 0;
    const btn = l.done ? '<span class="wzbtn done">\u0110\xE3 giao</span>' : have >= l.n ? `<span class="wzbtn" data-wdeliver="${i}">Giao</span>` : '<span class="wzbtn off">Ch\u01B0a \u0111\u1EE7</span>';
    return `<div class="wzord"><span class="star">\u2726</span>
      <div class="wzwant">Thu th\u1EADp <em>${l.mut ? '<span class="mutq">lo\u1EA1i c\xF3 ti\u1EC1n t\u1ED1</span>' : ""}${nm} \xD7${l.n}</em>${btn}</div>
      <div class="wzgive">Th\xF9 lao: h\u1EA1t gi\u1ED1ng b\xED \u1EA9n \xD7${l.reward}${l.mut ? " \u2726 (\u0111\u01A1n \u0111\u1ED9t bi\u1EBFn)" : ""} \xB7 b\u1EA1n \u0111ang c\xF3 ${have}</div></div>`;
  }).join("");
  const reroll = !wz.order.done && ctx.S.shards && ctx.S.shards.prism > 0 ? `<div style="text-align:center;margin-top:6px"><span class="wzbtn" data-wreroll="1" style="float:none">\u2726 \u0110\u1ED5i \u0111\u01A1n kh\xE1c (m\u1EA3nh l\u0103ng quang \xD7${ctx.S.shards.prism})</span></div>` : "";
  openModal("\u0110\u01A1n h\xE0ng c\u1EE7a ph\xF9 thu\u1EF7", `<div class="wzwrap">
    <div class="wzhead">\u0110\u01A1n h\xE0ng c\u1EE7a ph\xF9 thu\u1EF7</div>
    <div class="wzsub">\u2726 \uFF61\uFF9F\u263D \u2234 \u2727 \u2234 \u263D\uFF9F\uFF61 \u2726</div>${rows}${reroll}
    <div class="wzleave">\u263D ${wz.order.done ? '"\u2736\u25C7\u2026!" (tr\xF4ng c\xF4 \u1EA5y h\xE0i l\xF2ng l\u1EAFm)' : "C\xF4 \u1EA5y c\xF2n n\xE1n l\u1EA1i kho\u1EA3ng " + fmtLeft(wz.leaveAt - now())}</div>
  </div>`);
  $id("mbody").querySelectorAll("[data-wdeliver]").forEach((b) => b.addEventListener("click", () => witchDeliver(+b.dataset.wdeliver)));
  $id("mbody").querySelectorAll("[data-wreroll]").forEach((b) => b.addEventListener("click", () => {
    if (!(ctx.S.shards && ctx.S.shards.prism > 0)) return;
    ctx.S.shards.prism--;
    ctx.S.witch.order = makeWitchOrder();
    save();
    toast("L\u0103ng quang lo\xE9 l\xEAn, \u0111\u01A1n h\xE0ng \u0111\xE3 \u0111\u1ED5i m\u1ED9t lo\u1EA1t");
    openWitchDlg();
  }));
}
function useStarShard() {
  if (!(ctx.S.shards && ctx.S.shards.star > 0)) return;
  if (!ctx.S.passes.water) return toast("Ph\xF9 thu\u1EF7 ch\u1EC9 ch\u1ECBu gh\xE9 nh\u1EEFng n\xF4ng tr\u1EA1i c\xF3 v\xE9 v\xF9ng n\u01B0\u1EDBc");
  if (ctx.S.witch.leaveAt > now()) return toast("Ph\xF9 thu\u1EF7 tr\xF2n \u0111ang \u1EDF qu\u1EA7y r\u1ED3i m\xE0");
  ctx.S.shards.star--;
  closeModal();
  witchArrive();
}
function renderWitch() {
  const el = $id("witch");
  const active = ctx.S.witch && ctx.S.witch.leaveAt > now() && ctx.S.passes.water;
  el.classList.toggle("show", !!active);
  if (active && !el.innerHTML) el.innerHTML = `<span class="wtag">\u2726 \u0110\u01A1n h\xE0ng</span><span class="wbody">${petSVG("witchBlob", 48)}</span>`;
  if (!active) el.innerHTML = "";
}
var takeoutNote = null;
function setTakeoutNote(val) {
  takeoutNote = val;
}
function openTakeout(key) {
  const have = ctx.S.bag[key] || 0;
  if (have <= 0) return;
  openModal("L\u1EA5y ra \xB7 " + bagName(key), `
    <div class="note" style="margin-bottom:8px">L\u1EA5y ra = mang kh\u1ECFi balo \u0111\u1EC3 d\xF9ng trong c\u1ED1t truy\u1EC7n. <b style="color:var(--accFg)">Kh\xF4ng quy ra ti\u1EC1n, l\u1EA5y ra r\u1ED3i kh\xF4ng b\u1ECF l\u1EA1i balo \u0111\u01B0\u1EE3c!</b></div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input class="inp" id="takeN" type="number" min="1" max="${have}" value="1" style="width:90px">
      <span style="font-size:12px;color:#7a5c38">/ \u0111ang c\xF3 ${have}</span>
      <span class="buy" id="takeGo">X\xE1c nh\u1EADn l\u1EA5y ra</span>
    </div>`);
  $id("takeGo").addEventListener("click", () => {
    const n = clampN($id("takeN").value, 1, have, 1) | 0;
    ctx.S.bag[key] = have - n;
    if (ctx.S.bag[key] <= 0) delete ctx.S.bag[key];
    const d = mutDescOf(key);
    takeoutNote = (takeoutNote || []).filter((t) => now() < t.until).concat({ txt: n + " " + bagName(key) + (d ? " (hi\u1EC7u \u1EE9ng \u0111\xE3 \u0111\u1ECBnh: " + d + ")" : ""), until: now() + 10 * MIN }).slice(-3);
    save();
    renderStatus();
    toast("\u0110\xE3 l\u1EA5y ra " + n + " " + bagName(key));
    openPanel("bag");
  });
}
function openSellDlg(key) {
  const have = ctx.S.bag[key] || 0;
  if (have <= 0) return;
  const price = bagPrice(key);
  openModal("B\xE1n \xB7 " + bagName(key), `
    <div class="note" style="margin-bottom:8px">\u0110\u01A1n gi\xE1 ${price} G \xB7 \u0111ang c\xF3 ${have} c\xE1i</div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input class="inp" id="sellN" type="number" min="1" max="${have}" value="1" style="width:90px">
      <span style="font-size:12px;color:#7a5c38">/ ${have}</span>
      <span class="buy" id="sellGo">X\xE1c nh\u1EADn b\xE1n</span>
    </div>`);
  $id("sellGo").addEventListener("click", () => {
    sell(key, clampN($id("sellN").value, 1, have, 1) | 0);
  });
}
function buildTicket(k) {
  const water2 = k === "water";
  return `
  <div class="tk ${water2 ? "water" : "mine"}">
    <div class="stub">${spriteSVG(water2 ? "lotus" : "gem", 52)}<span class="no">${water2 ? "V\xF9ng n\u01B0\u1EDBc \xB7 Trang II" : "Khu m\u1ECF \xB7 Trang III"}</span></div>
    <div class="perf"></div>
    <div class="tmain">
      <div class="inner">
        <div class="eyebrow">Ai m\xE0 th\xE8m l\xE0m n\xF4ng d\xE2n ch\u1EE9! \xB7 Gi\u1EA5y ph\xE9p th\xF4ng h\xE0nh</div>
        <div class="tname">${water2 ? "V \xC9   V \xD9 N G   N \u01AF \u1EDA C" : "V \xC9   K H U   M \u1ECE"}</div>
        <div class="tsub">${water2 ? "C\u1EA7m v\xE9 n\xE0y \u0111\u1EC3 m\u1EDF ru\u1ED9ng v\xF9ng n\u01B0\u1EDBc \u1EDF trang hai \xB7 tr\u1ED3ng \u0111\u01B0\u1EE3c c\xE2y thu\u1EF7 sinh<br>C\u1EE7 sen \u0111ang \u0111\u1EE3i b\u1EA1n, rong bi\u1EC3n c\u0169ng v\u1EADy." : "C\u1EA7m v\xE9 n\xE0y \u0111\u1EC3 v\xE0o ru\u1ED9ng b\u1EA3o th\u1EA1ch \u1EDF trang ba \xB7 \u01B0\u01A1m \u0111\u01B0\u1EE3c c\xE2y tinh th\u1EA1ch<br>Coi ch\u1EEBng d\u01B0\u1EDBi ch\xE2n, th\u1EE9 g\xEC ph\xE1t s\xE1ng th\xEC \u0111\u1EEBng gi\u1EABm."}</div>
        <div class="trow">
          <span class="serial">${water2 ? "N\u2070 000002" : "N\u2070 000003"}</span>
          <span class="valid">${water2 ? "C\xF3 gi\xE1 tr\u1ECB v\u0129nh vi\u1EC5n \xB7 kh\xF4ng chuy\u1EC3n nh\u01B0\u1EE3ng (rau th\xEC \u0111\u01B0\u1EE3c)" : "C\xF3 gi\xE1 tr\u1ECB v\u0129nh vi\u1EC5n \xB7 ch\u1EE9a m\u1ED9t l\u01B0\u1EE3ng nh\u1ECF ma l\u1EF1c"}</span>
        </div>
      </div>
      <div class="stamp">${water2 ? "B\xE9 tr\xF2n<br>\u0111\xE3 duy\u1EC7t" : "Ph\xF9 thu\u1EF7<br>\u0111\u1EB7c duy\u1EC7t"}</div>
      <div class="curl"></div>
    </div>
  </div>`;
}
function openPassDlg(k) {
  const ps = PASSES[k];
  const owned = !!ctx.S.passes[k];
  const poor = ctx.S.coins < ps.price;
  openModal(ps.name, buildTicket(k) + (owned ? '<div class="note">\u0110\xE3 s\u1EDF h\u1EEFu \xB7 c\u1EA5t trong k\u1EB9p gi\u1EA5y t\u1EDD c\u1EE7a b\u1EA1n. C\xE1c b\xE9 tr\xF2n \u1EDF trang t\u01B0\u01A1ng \u1EE9ng lu\xF4n hoan ngh\xEAnh b\u1EA1n gh\xE9 mua.</div>' : `<div style="display:flex;gap:8px;align-items:center">
        <span class="buy${poor ? " off" : ""}" id="passGo">Mua ${ps.price.toLocaleString()} G</span>
        <span class="buy plain" id="passNo">\u0110\u1EC3 ngh\u0129 th\xEAm</span>
      </div>`));
  if (!owned) {
    $id("passGo").addEventListener("click", () => {
      if (ctx.S.coins < ps.price) return toast("C\xF2n thi\u1EBFu " + (ps.price - ctx.S.coins).toLocaleString() + " G");
      ctx.S.coins -= ps.price;
      ctx.S.passes[k] = true;
      save();
      renderStatus();
      renderPager();
      openPanel("shop");
      toast(ps.name + " \u0111\xE3 v\xE0o tay! " + (k === "water" ? "Ru\u1ED9ng v\xF9ng n\u01B0\u1EDBc \u0111\xE3 m\u1EDF, l\u1EADt trang qua xem th\u1EED \u0111i" : "Ru\u1ED9ng khu m\u1ECF \u0111\xE3 m\u1EDF, l\u1EADt trang qua xem th\u1EED \u0111i"));
    });
    $id("passNo").addEventListener("click", () => openPanel("shop"));
  }
}
function openBuyDlg(kind, id) {
  const def = kind === "seed" ? CROPS[id] : FERTS[id];
  const price = kind === "seed" ? def.seed : def.price;
  const name = kind === "seed" ? "H\u1EA1t " + def.name : def.name;
  if (ctx.S.coins < price) return toast("C\xF2n thi\u1EBFu " + (price - ctx.S.coins).toLocaleString() + " G");
  const maxN = Math.max(1, Math.floor(ctx.S.coins / Math.max(1, price)));
  openModal("Mua \xB7 " + name, `
    <div class="note" style="margin-bottom:8px">\u0110\u01A1n gi\xE1 ${price} G \xB7 v\xE0ng hi\u1EC7n c\xF3 ${ctx.S.coins.toLocaleString()} \xB7 mua \u0111\u01B0\u1EE3c t\u1ED1i \u0111a ${maxN}</div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input class="inp" id="buyN" type="number" min="1" max="${maxN}" value="1" style="width:90px">
      <span id="buyTotal" style="font-size:12px;color:#7a5c38;font-weight:bold">T\u1ED5ng ${price} G</span>
      <span class="buy" id="buyGo">X\xE1c nh\u1EADn mua</span>
    </div>`);
  const upd = () => {
    const n = clampN($id("buyN").value, 1, maxN, 1) | 0;
    $id("buyTotal").textContent = "T\u1ED5ng " + (n * price).toLocaleString() + " G";
    return n;
  };
  $id("buyN").addEventListener("input", upd);
  $id("buyGo").addEventListener("click", () => {
    const n = upd(), cost = n * price;
    if (ctx.S.coins < cost) return toast("Kh\xF4ng \u0111\u1EE7 v\xE0ng r\u1ED3i");
    ctx.S.coins -= cost;
    if (kind === "seed") ctx.S.seeds[id] = (ctx.S.seeds[id] || 0) + n;
    else ctx.S.ferts[id] = (ctx.S.ferts[id] || 0) + n;
    save();
    renderStatus();
    toast("\u0110\xE3 mua " + name + " \xD7" + n);
    openPanel("shop");
  });
}
var toastTimer = null;
function toast(msg) {
  const t = $id("toast");
  t.textContent = msg;
  t.style.display = "block";
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    t.style.display = "none";
  }, 1800);
}
function initWitch() {
  $id("witch").addEventListener("click", (e) => {
    if (e.target.closest(".wtag")) return openWitchDlg();
    const el = $id("witch");
    el.querySelector(".pbubble")?.remove();
    const b = document.createElement("span");
    b.className = "pbubble wb";
    b.textContent = WITCH_CRY[Math.floor(Math.random() * WITCH_CRY.length)];
    el.appendChild(b);
    window.setTimeout(() => b.remove(), 1900);
  });
}

// src/utils.js
var gameDay = () => Math.floor((now() - ctx.S.day0) / DAY_MS) + 1;
var weatherOf = (d) => WEATHERS[Math.floor(mulberry32(d * 7919)() * WEATHERS.length)];
var isRain = () => weatherOf(gameDay()) === "M\u01B0a nh\u1ECF";
function settle() {
  if (CS.link && !eventFresh() && !eventPending) requestDayEvent();
  if (ctx.S.passes.water && ctx.S.witch) {
    const wz = ctx.S.witch;
    if (wz.leaveAt && now() >= wz.leaveAt) {
      wz.leaveAt = 0;
      if (wz.order && !wz.order.done) wz.missed++;
      wz.order = null;
      wz.nextAt = now() + witchGap();
      save();
      try {
        renderWitch();
      } catch (e) {
      }
    }
    const open = (() => {
      try {
        return sh.getElementById("win").classList.contains("open");
      } catch (e) {
        return false;
      }
    })();
    if (!wz.leaveAt && open && (now() >= wz.nextAt || wz.missed >= 2)) witchArrive();
  }
  let mutChanged = false;
  eachPage((plots, pg) => plots.forEach((p, pi) => {
    const c = p.crop;
    if (!c || now() < c.matureAt || c.mutRolled) return;
    mutChanged = true;
    rollMutation(c, pg === ctx.S.page ? pi : null);
  }));
  if (mutChanged) save();
  let wChanged = false;
  const outed = (id) => ctx.S.petsOut.indexOf(id) >= 0;
  if (outed("cloudMallow")) {
    eachPage((plots) => plots.forEach((p) => {
      const c = p.crop;
      if (!c || now() >= c.matureAt || now() < c.wateredUntil) return;
      c.matureAt = now() + (c.matureAt - now()) * 0.75;
      c.wateredUntil = now() + WATER_CD;
      wChanged = true;
    }));
  }
  let tGain = 0, tSeed = "", tMyst = "", tPrism = 0, tStar = 0;
  ctx.S.petsOut.forEach((id) => {
    const pd = PETS[id];
    if (!pd || pd.job) return;
    if (ctx.S.petFind[id] == null) {
      ctx.S.petFind[id] = now();
      wChanged = true;
      return;
    }
    if (now() - ctx.S.petFind[id] < TREASURE_CD) return;
    ctx.S.petFind[id] = now();
    tGain += 10 + Math.floor(Math.random() * 41);
    if ((id === "impBlob" || id === "angelBlob") && Math.random() < 0.2) {
      ctx.S.seeds.mystery = (ctx.S.seeds.mystery || 0) + 1;
      tMyst = id;
    }
    if (id === "prismBlob" && Math.random() < 0.2) {
      ctx.S.shards.prism++;
      tPrism++;
    }
    if (id === "starBell" && Math.random() < 0.15) {
      ctx.S.shards.star++;
      tStar++;
    }
    if (!tSeed && !tMyst && Math.random() < 0.1) {
      const ids = Object.keys(CROPS).filter((k) => !CROPS[k].hidden);
      tSeed = ids[Math.floor(Math.random() * ids.length)];
      ctx.S.seeds[tSeed] = (ctx.S.seeds[tSeed] || 0) + 1;
    }
    wChanged = true;
  });
  if (tGain) {
    ctx.S.coins += tGain;
    toast("C\xE1c b\xE9 tr\xF2n \u0111i t\xECm kho b\xE1u v\u1EC1: +" + tGain + " G" + (tSeed ? ", c\xF2n tha v\u1EC1 c\u1EA3 h\u1EA1t gi\u1ED1ng " + CROPS[tSeed].name + "!" : "") + (tMyst ? tMyst === "impBlob" ? ", b\xE9 qu\u1EF7 nh\u1ECF tha v\u1EC1 m\u1ED9t h\u1EA1t gi\u1ED1ng b\xED \u1EA9n \u0111en s\xEC\u2026" : ", b\xE9 thi\xEAn th\u1EA7n ng\u1EADm v\u1EC1 m\u1ED9t h\u1EA1t gi\u1ED1ng b\xED \u1EA9n \xE1nh l\xEAn l\u1EA5p l\xE1nh\u2026" : "") + (tPrism ? ", b\xE9 l\u0103ng quang nh\u1EA3 ra " + tPrism + " m\u1EA3nh l\u0103ng quang" : "") + (tStar ? ", b\xE9 chu\xF4ng sao rung r\u01A1i " + tStar + " m\u1EA3nh ng\xF4i sao\u2726" : ""));
    renderStatus();
  }
  if (wChanged) save();
  if (!isRain()) return;
  const d = gameDay();
  eachPage((plots) => plots.forEach((p) => {
    const c = p.crop;
    if (!c || now() >= c.matureAt || c.rainDay === d) return;
    c.matureAt = now() + (c.matureAt - now()) * 0.9;
    c.rainDay = d;
  }));
}
var pageUnlocked = (p) => p === 1 || p === 2 && ctx.S.passes.water || p === 3 && ctx.S.passes.mine;
var fmtLeft = (ms) => {
  if (ms <= 0) return "Thu ho\u1EA1ch \u0111\u01B0\u1EE3c";
  const m = Math.ceil(ms / MIN);
  return m >= 60 ? Math.floor(m / 60) + "g" + m % 60 + "p" : m + "p";
};

// src/events.js
var esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);
var clampN = (x, lo, hi, dflt) => {
  x = Number(x);
  return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : dflt;
};
var SEC_LS_KEY = "star_tavern_farm_sec";
var SEC = { url: "", key: "", model: "", autoReset: true, resetHours: 4, wbLimit: 2e4 };
try {
  const raw = window.localStorage.getItem(SEC_LS_KEY);
  if (raw) {
    const o = JSON.parse(raw);
    SEC = {
      url: o.url || "",
      key: o.key ? atob(o.key) : "",
      model: o.model || "",
      autoReset: o.autoReset !== false,
      resetHours: clampN(o.resetHours, 1, 24, 4),
      wbLimit: typeof o.wbLimit === "number" ? o.wbLimit : 2e4
    };
  }
} catch (e) {
}
function saveSec() {
  try {
    window.localStorage.setItem(SEC_LS_KEY, JSON.stringify({ url: SEC.url, key: btoa(SEC.key), model: SEC.model, autoReset: SEC.autoReset, resetHours: SEC.resetHours, wbLimit: SEC.wbLimit }));
  } catch (e) {
  }
}
var CS = { link: false, story: false, userPrompt: "" };
function loadCharState() {
  try {
    const cn = charName();
    const key = "cs_" + cn;
    const o = (ctx.extension_settings[extensionName] || {})[key] || {};
    CS = { link: !!o.link, story: !!o.story, userPrompt: o.userPrompt || "" };
  } catch (e) {
    CS = { link: false, story: false, userPrompt: "" };
  }
}
function saveCharState() {
  try {
    const cn = charName();
    const key = "cs_" + cn;
    if (!ctx.extension_settings[extensionName]) ctx.extension_settings[extensionName] = {};
    ctx.extension_settings[extensionName][key] = { link: CS.link, story: CS.story, userPrompt: CS.userPrompt };
    if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
  } catch (e) {
  }
}
loadCharState();
function charName() {
  try {
    const ctx2 = window.SillyTavern && window.SillyTavern.getContext ? window.SillyTavern.getContext() : {};
    return ctx2.name2 || String(ctx2.characterId || "");
  } catch (e) {
    return "";
  }
}
var eventFresh = () => ctx.S.dayEvent && ctx.S.dayEvent.who === charName() && (!SEC.autoReset || now() - (ctx.S.dayEvent.at || 0) < SEC.resetHours * 60 * 60 * 1e3);
var todayEvent = () => CS.link && eventFresh() ? ctx.S.dayEvent.ev : null;
async function collectWorldbook() {
  try {
    let blue = "", green = "";
    let entries = [];
    const ctx2 = window.SillyTavern && window.SillyTavern.getContext ? window.SillyTavern.getContext() : {};
    try {
      const ST_WorldInfo = await new Function("return import('/scripts/world-info.js')")().catch(() => null);
      const activeNames = /* @__PURE__ */ new Set();
      try {
        const charId = ctx2.characterId !== void 0 ? ctx2.characterId : window.this_character;
        const charData = ctx2.characters?.[charId]?.data || window.characters?.[charId]?.data;
        console.log("[FARM DEBUG] Character Data:", charData ? "Found" : "Null", "charId:", charId);
        if (charData) {
          if (charData.extensions?.world) activeNames.add(charData.extensions.world);
          if (charData.world) activeNames.add(charData.world);
        }
        const wiKey = ST_WorldInfo?.METADATA_KEY || window.WI_METADATA_KEY || "world_info";
        const chatWorldName = ctx2.chatMetadata?.[wiKey];
        console.log("[FARM DEBUG] Chat World Name:", chatWorldName);
        if (chatWorldName && typeof chatWorldName === "string") activeNames.add(chatWorldName);
      } catch (e) {
        console.log("[FARM DEBUG] Error getting active names:", e);
      }
      console.log("[FARM DEBUG] Active Worldbook Names to Fetch:", Array.from(activeNames));
      for (const name of activeNames) {
        try {
          console.log("[FARM DEBUG] Fetching API for:", name);
          const res = await fetch("/api/worldinfo/get", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...typeof ctx2.getRequestHeaders === "function" ? ctx2.getRequestHeaders() : {}
            },
            body: JSON.stringify({ name })
          });
          if (res.ok) {
            const data = await res.json();
            console.log("[FARM DEBUG] Fetched API data entries length:", Array.isArray(data.entries) ? data.entries.length : "Not Array");
            if (data && Array.isArray(data.entries)) entries = entries.concat(data.entries);
          } else {
            console.log("[FARM DEBUG] API Failed, status:", res.status);
            const book = ST_WorldInfo?.world_info?.[name];
            if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
          }
        } catch (e) {
          console.log("[FARM DEBUG] Fetch Exception:", e);
          const book = ST_WorldInfo?.world_info?.[name];
          if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
        }
      }
    } catch (e) {
      console.log("[FARM DEBUG] Outer Exception:", e);
    }
    if (ctx2.worldInfo && Array.isArray(ctx2.worldInfo.entries)) {
      entries = entries.concat(ctx2.worldInfo.entries);
    } else if (ctx2.worldInfo && typeof ctx2.worldInfo === "object") {
      Object.values(ctx2.worldInfo).forEach((book) => {
        if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
      });
    }
    if (window.world_info && typeof window.world_info === "object" && !(window.world_info instanceof HTMLElement)) {
      Object.values(window.world_info).forEach((book) => {
        if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
        else if (book && typeof book === "object" && !Array.isArray(book) && !(book instanceof HTMLElement)) {
          if (book.content || book.text) entries.push(book);
        }
      });
    }
    if (window.world_info_data && typeof window.world_info_data === "object") {
      Object.values(window.world_info_data).forEach((book) => {
        if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
      });
    }
    try {
      const charId = ctx2.characterId !== void 0 ? ctx2.characterId : window.this_character;
      if (typeof charId !== "undefined") {
        const charData = ctx2.characters?.[charId]?.data || window.characters?.[charId]?.data;
        if (charData && charData.character_book && Array.isArray(charData.character_book.entries)) {
          entries = entries.concat(charData.character_book.entries);
        }
      }
    } catch (e) {
      console.log("[FARM DEBUG] Embedded Book Exception:", e);
    }
    if (!entries || entries.length === 0) return "";
    const seen = /* @__PURE__ */ new Set();
    for (const en of entries) {
      if (en.enabled === false) continue;
      const content = (en.content || en.text || "").trim();
      if (!content || seen.has(content)) continue;
      seen.add(content);
      const isConstant = en.strategy && en.strategy.type === "constant" || en.constant === true || en.position === "before_char";
      if (isConstant) blue += content + "\n";
      else green += content + "\n";
    }
    const txt = blue.length >= 400 ? blue : blue + "\n" + green;
    const limit = SEC.wbLimit !== void 0 ? SEC.wbLimit : 2e4;
    return limit > 0 ? txt.slice(0, limit) : txt;
  } catch (e) {
    return "";
  }
}
function buildEventPrompt(worldbook) {
  let roll = Math.random() * 100;
  const tendency = roll < 60 ? "t\xEDch c\u1EF1c (h\u01B0\u1EDBng b\u1ED9i thu / t\u0103ng t\u1ED1c / th\u1EDDi ti\u1EBFt \u0111\u1EB9p)" : roll < 90 ? "trung t\xEDnh (k\u1EF3 quan / chuy\u1EC7n l\u1EA1 / chuy\u1EC7n v\u1EB7t kh\xF4ng quan tr\u1ECDng)" : "h\u01A1i ti\xEAu c\u1EF1c (gi\u1EA3m s\u1EA3n l\u01B0\u1EE3ng / ch\u1EADm l\u1EA1i, m\u1EE9c \u0111\u1ED9 ph\u1EA3i nh\u1EB9)";
  const themes = ["c\xF3 th\u1EC3 li\xEAn quan t\u1EDBi th\u1EDDi ti\u1EBFt", "c\xF3 th\u1EC3 li\xEAn quan t\u1EDBi \u0111\u1EA5t \u0111ai ho\u1EB7c ngu\u1ED3n n\u01B0\u1EDBc", "c\xF3 th\u1EC3 li\xEAn quan t\u1EDBi \u0111\u1ED9ng v\u1EADt nh\u1ECF ho\u1EB7c c\xF4n tr\xF9ng", "c\xF3 th\u1EC3 li\xEAn quan t\u1EDBi y\u1EBFu t\u1ED1 si\xEAu nhi\xEAn c\u1EE7a th\u1EBF gi\u1EDBi n\xE0y", "c\xF3 th\u1EC3 li\xEAn quan t\u1EDBi phong t\u1EE5c \u0111\u1ECBa ph\u01B0\u01A1ng ho\u1EB7c ch\u1EE3 phi\xEAn"];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const cropList = Object.entries(CROPS).filter(([id, c]) => !c.seedOnly).map(([id, c]) => c.name).join(", ");
  return ('B\u1EA1n l\xE0 "tr\xECnh t\u1EA1o s\u1EF1 ki\u1EC7n th\u1EBF gi\u1EDBi quan" cho m\u1ED9t game n\xF4ng tr\u1EA1i nh\u1ECF. Ng\u01B0\u1EDDi ch\u01A1i \u0111ang tr\u1ED3ng m\u1ED9t m\u1EA3nh v\u01B0\u1EDDn rau nh\u1ECF trong m\u1ED9t th\u1EBF gi\u1EDBi nh\u1EADp vai n\xE0o \u0111\xF3, v\xE0 b\u1EA1n s\u1EBD nh\u1EADn \u0111\u01B0\u1EE3c ph\u1EA7n tr\xEDch world book c\u1EE7a th\u1EBF gi\u1EDBi \u0111\xF3. H\xE3y t\u1EA1o 1 s\u1EF1 ki\u1EC7n nh\u1ECF ng\u1EABu nhi\xEAn x\u1EA3y ra \u1EDF v\u01B0\u1EDDn rau h\xF4m nay.\n\nQuy t\u1EAFc:\n1. S\u1EF1 ki\u1EC7n b\u1EAFt bu\u1ED9c mang h\u01B0\u01A1ng v\u1ECB c\u1EE7a th\u1EBF gi\u1EDBi n\xE0y \u2014\u2014 c\xE1c danh t\u1EEB v\u1EC1 th\u1EDDi ti\u1EBFt, s\u1EA3n v\u1EADt, y\u1EBFu t\u1ED1 si\xEAu nhi\xEAn\u2026 h\xE3y c\u1ED1 l\u1EA5y ch\u1EA5t li\u1EC7u t\u1EEB world book; nh\u01B0ng s\u1EF1 ki\u1EC7n ch\u1EC9 \u1EA3nh h\u01B0\u1EDFng vi\u1EC7c tr\u1ED3ng tr\u1ECDt, kh\xF4ng \u0111\u1EA9y c\u1ED1t truy\u1EC7n. C\xF3 th\u1EC3 nh\u1EAFc t\xEAn nh\xE2n v\u1EADt trong th\u1EBF gi\u1EDBi \u1EDF ph\u1EA7n flavor cho sinh \u0111\u1ED9ng, nh\u01B0ng tuy\u1EC7t \u0111\u1ED1i kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 nh\xE2n v\u1EADt n\xF3i chuy\u1EC7n, h\xE0nh \u0111\u1ED9ng hay x\u1EA3y ra t\xECnh ti\u1EBFt n\xE0o.\n2. Xu h\u01B0\u1EDBng s\u1EF1 ki\u1EC7n h\xF4m nay: ' + tendency + "; ch\u1EE7 \u0111\u1EC1 tham kh\u1EA3o: " + theme + '.\n3. Tr\u01B0\u1EDDng hi\u1EC7u \u1EE9ng ch\u1EC9 \u0111\u01B0\u1EE3c d\xF9ng time_mult (0.7~1.1, h\u1EC7 s\u1ED1 nh\xE2n th\u1EDDi gian sinh tr\u01B0\u1EDFng) / mutate_on_fert (0~0.5), c\xF3 th\u1EC3 ch\u1EC9 d\xF9ng m\u1ED9t ho\u1EB7c b\u1ECF c\u1EA3 hai. **Tuy\u1EC7t \u0111\u1ED1i \u0111\u1EEBng vi\u1EBFt ng\u01B0\u1EE3c ng\u1EEF ngh\u0129a c\u1EE7a time_mult: <1 = m\u1ECDc nhanh h\u01A1n = s\u1EF1 ki\u1EC7n t\xEDch c\u1EF1c; >1 = m\u1ECDc ch\u1EADm h\u01A1n = s\u1EF1 ki\u1EC7n ti\xEAu c\u1EF1c**. Ngo\xE0i ra c\xF3 tr\u01B0\u1EDDng hi\u1EBFm double_yield:true (s\u1ED1 qu\u1EA3 thu ho\u1EA1ch h\xF4m nay \xD72, ph\xFAc l\u1EE3i cho d\xE2n may m\u1EAFn) \u2014\u2014 ch\u1EC9 n\xEAn xu\u1EA5t hi\u1EC7n kho\u1EA3ng 8% s\u1ED1 ng\xE0y, khi xu\u1EA5t hi\u1EC7n th\xEC s\u1EF1 ki\u1EC7n ph\u1EA3i vi\u1EBFt theo ch\u1EE7 \u0111\u1EC1 b\u1ED9i thu l\u1EDBn / k\u1EF3 t\xEDch, type b\u1EAFt bu\u1ED9c l\xE0 buff. C\xF3 th\u1EC3 th\xEAm favored_crop: \u0111i\u1EC1n m\u1ED9t t\xEAn c\xE2y tr\u1ED3ng (b\u1EAFt bu\u1ED9c l\u1EA5y t\u1EEB danh s\xE1ch c\xE2y tr\u1ED3ng), khi \u0111\xF3 hi\u1EC7u \u1EE9ng ch\u1EC9 t\xE1c d\u1EE5ng l\xEAn c\xE2y \u0111\xF3; kh\xF4ng \u0111i\u1EC1n th\xEC c\u1EA3 ru\u1ED9ng \u0111\u1EC1u ch\u1ECBu t\xE1c d\u1EE5ng.\n4. N\u1EBFu s\u1EF1 ki\u1EC7n l\xE0m c\xE2y b\u1ECB \u0111\u1ED9t bi\u1EBFn (mutate_on_fert>0, l\xE0 x\xE1c su\u1EA5t \u0111\u1ED9t bi\u1EBFn c\u01A1 b\u1EA3n c\u1EE7a c\xE2y ch\xEDn h\xF4m nay, b\xF3n ph\xE2n s\u1EBD khu\u1EBFch \u0111\u1EA1i), th\xEC cho th\xEAm: mutate_prefix (ti\u1EC1n t\u1ED1 \u0111\u1ED9t bi\u1EBFn mang h\u01B0\u01A1ng v\u1ECB c\u1EE7a th\u1EBF gi\u1EDBi n\xE0y, trong 5 ch\u1EEF, v\xED d\u1EE5 "linh ho\xE1", "si\xEAu to", "\u0103n th\u1ECBt", "c\u1EE9ng ng\u1EAFc", "ph\xE1t s\xE1ng") v\xE0 mutate_desc (m\u1ED9t \u0111\u1ED1i t\u01B0\u1EE3ng, **vi\u1EBFt ri\xEAng cho t\u1EEBng lo\u1EA1i c\xE2y \u0111\u01B0\u1EE3c li\u1EC7t k\xEA b\xEAn d\u01B0\u1EDBi** v\u1EC1 **hi\u1EC7u \u1EE9ng ho\u1EB7c c\xF4ng d\u1EE5ng** c\u1EE7a th\u1EC3 \u0111\u1ED9t bi\u1EBFn \u0111\xF3 trong th\u1EBF gi\u1EDBi n\xE0y, m\u1ED7i m\u1EE5c trong 20 ch\u1EEF \u2014\u2014 h\xE3y vi\u1EBFt "n\xF3 l\xE0m \u0111\u01B0\u1EE3c g\xEC / s\u1EBD g\xE2y ra chuy\u1EC7n g\xEC", b\u1EAFt bu\u1ED9c l\xE0 hi\u1EC7u \u1EE9ng **khi c\u1EA7m gi\u1EEF, \u0103n ho\u1EB7c s\u1EED d\u1EE5ng** (n\xF3 s\u1EBD \u0111\u01B0\u1EE3c mang kh\u1ECFi v\u01B0\u1EDDn rau \u0111\u1EC3 d\xF9ng trong c\xE2u chuy\u1EC7n, nghi\xEAm c\u1EA5m vi\u1EBFt ki\u1EC3u "khi thu ho\u1EA1ch / khi nh\u1ED5 l\xEAn" v\xEC r\u1EDDi v\u01B0\u1EDDn l\xE0 m\u1EA5t hi\u1EC7u l\u1EF1c), ph\u1EA3i m\u01A1 h\u1ED3 \u0111\u1EC3 ch\u1EEBa ch\u1ED7 t\u01B0\u1EDFng t\u01B0\u1EE3ng, nghi\xEAm c\u1EA5m m\xF4 t\u1EA3 ki\u1EC3u ngo\u1EA1i h\xECnh l\u1EA5p l\xE1nh; hi\u1EC7u \u1EE9ng c\u1EE7a c\xE1c c\xE2y kh\xE1c nhau ph\u1EA3i kh\xE1c nhau). Khi kh\xF4ng \u0111\u1ED9t bi\u1EBFn th\xEC b\u1ECF c\u1EA3 hai tr\u01B0\u1EDDng.\n   C\xE1c lo\u1EA1i c\xE2y hi\u1EC7n c\xF3 trong v\u01B0\u1EDDn n\xE0y (t\u1ED5ng c\u1ED9ng {{CROPCOUNT}} lo\u1EA1i, mutate_desc b\u1EAFt bu\u1ED9c ph\u1EE7 h\u1EBFt t\u1EEBng lo\u1EA1i m\u1ED9t, nghi\xEAm c\u1EA5m b\u1ECF s\xF3t hay ch\u1EC9 vi\u1EBFt v\xE0i lo\u1EA1i): {{CROPLIST}}\n5. flavor l\xE0 m\u1ED9t c\xE2u cho ng\u01B0\u1EDDi ch\u01A1i \u0111\u1ECDc, trong 30 ch\u1EEF, \u01B0u ti\xEAn h\u01B0\u01A1ng v\u1ECB, c\xF3 th\u1EC3 h\xF3m h\u1EC9nh.\n6. Ch\u1EC9 \u0111\u01B0\u1EE3c xu\u1EA5t \u0111\xFAng m\u1ED9t d\xF2ng JSON, c\u1EA5m xu\u1EA5t gi\u1EA3i th\xEDch, ti\u1EC1n t\u1ED1 h\u1EADu t\u1ED1 hay d\u1EA5u kh\u1ED1i code:\n{"name":"t\xEAn s\u1EF1 ki\u1EC7n 2~6 ch\u1EEF","type":"buff|debuff|neutral","time_mult":1,"double_yield":false,"mutate_on_fert":0,"mutate_prefix":"","mutate_desc":{"t\xEAn c\xE2y tr\u1ED3ng":"m\xF4 t\u1EA3 hi\u1EC7u \u1EE9ng"},"favored_crop":"","flavor":"m\u1ED9t c\xE2u"}\n\nV\xED d\u1EE5 \u0111\u1ECBnh d\u1EA1ng (l\u1EA5y t\u1EEB th\u1EBF gi\u1EDBi kh\xE1c, ch\u1EC9 \u0111\u1EC3 tham kh\u1EA3o \u0111\u1ECBnh d\u1EA1ng v\xE0 h\u01B0\u1EDBng h\u01B0\u01A1ng v\u1ECB, c\u1EA5m ch\xE9p nguy\xEAn):\n- {"name":"M\u01B0a linh","type":"buff","time_mult":0.8,"flavor":"Linh kh\xED \u0111\u1ECDng th\xE0nh m\u01B0a, m\u1EA7m rau l\xE9n v\u01B0\u01A1n \u0111\u1ED1t nghe r\xF5 ti\u1EBFng."}\n- {"name":"M\u01B0a axit","type":"debuff","time_mult":1.1,"mutate_on_fert":0.3,"mutate_prefix":"bi\u1EBFn ch\u1EE7ng","flavor":"M\u01B0a axit g\xF5 m\xE1i, rau \u1EC9u x\xECu m\u1ECDc ch\u1EADm, c\xE2y \u0111\xE3 b\xF3n ph\xE2n e l\xE0 m\u1ECDc m\xE9o m\u1EA5t."}\n- {"name":"R\xF2 r\u1EC9 ph\xE2n nano","type":"neutral","mutate_on_fert":0.4,"mutate_prefix":"si\xEAu to","mutate_desc":{"B\xED ng\xF4":"B\u1ED5 ra th\xEC kh\xF4ng gian b\xEAn trong r\u1ED9ng h\u01A1n b\xEAn ngo\xE0i","C\xE0 chua":"Ng\u01B0\u1EDDi \u0103n nh\u1EDB m\u1ECDi th\u1EE9 trong ch\u1ED1c l\xE1t"},"flavor":"C\xE2y b\xF3n ph\xE2n h\xF4m nay c\xF3 th\u1EC3 m\u1ECDc ra h\xECnh th\xF9 kh\xF3 tin."}\n' + (CS.userPrompt ? "\n[ctx.S\u1EDF th\xEDch tu\u1EF3 ch\u1EC9nh c\u1EE7a ng\u01B0\u1EDDi ch\u01A1i, \u01B0u ti\xEAn \u0111\xE1p \u1EE9ng, nh\u01B0ng kh\xF4ng \u0111\u01B0\u1EE3c v\u01B0\u1EE3t ra ngo\xE0i ph\u1EA1m vi c\xE1c tr\u01B0\u1EDDng]:\n" + CS.userPrompt + "\n" : "") + "\nTr\xEDch world book:\n" + (worldbook || "(Th\u1EBF gi\u1EDBi n\xE0y t\u1EA1m ch\u01B0a c\xF3 world book, h\xE3y t\u1EA1o m\u1ED9t s\u1EF1 ki\u1EC7n \u0111\u1ED3ng qu\xEA chung chung)")).replace("{{CROPLIST}}", cropList).replace("{{CROPCOUNT}}", String(cropList.split(", ").length));
}
function sanitizeEvent(o) {
  if (!o || typeof o !== "object") return null;
  const ev = {
    name: String(o.name || "Chuy\u1EC7n l\u1EA1").slice(0, 40),
    type: ["buff", "debuff", "neutral"].indexOf(o.type) >= 0 ? o.type : "neutral",
    time_mult: clampN(o.time_mult != null ? o.time_mult : o.growth_mult && o.growth_mult !== 1 ? 1 / o.growth_mult : 1, 0.7, 1.1, 1),
    // growth_mult cũ (tốc độ) tự động quy đổi (yield_mult đã nghỉ hưu, bỏ qua thẳng)
    double_yield: o.double_yield === true,
    // v1.1: phúc lợi dân may, số quả ×2 (kiểu boolean, nghiêm cấm số thập phân)
    mutate_on_fert: clampN(o.mutate_on_fert, 0, 0.5, 0),
    mutate_prefix: String(o.mutate_prefix || "\u0111\u1ED9t bi\u1EBFn").slice(0, 20),
    mutate_desc: o.mutate_desc && typeof o.mutate_desc === "object" ? Object.keys(o.mutate_desc).slice(0, 30).reduce((a, k) => {
      a[String(k).slice(0, 30)] = String(o.mutate_desc[k]).slice(0, 100);
      return a;
    }, {}) : typeof o.mutate_desc === "string" && o.mutate_desc ? { "*": String(o.mutate_desc).slice(0, 100) } : {},
    favored_crop: (() => {
      const f = String(o.favored_crop || "");
      return Object.values(CROPS).some((c) => c.name === f) ? f : "";
    })(),
    flavor: String(o.flavor || "")
  };
  return ev;
}
function extractJson(raw) {
  const s = raw.indexOf("{");
  if (s < 0) return null;
  let depth = 0, inStr = false, escd = false;
  for (let i = s; i < raw.length; i++) {
    const ch = raw[i];
    if (inStr) {
      if (escd) escd = false;
      else if (ch === "\\") escd = true;
      else if (ch === '"') inStr = false;
    } else {
      if (ch === '"') inStr = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return raw.slice(s, i + 1);
      }
    }
  }
  return null;
}
function fallbackEvent() {
  const w = weatherOf(gameDay());
  return sanitizeEvent(w === "M\u01B0a nh\u1ECF" ? { name: "M\u01B0a nh\u1ECF", type: "buff", time_mult: 0.9, flavor: "M\u01B0a nh\u1ECF r\u1ED3i, m\u1EA5y c\xE2y rau u\u1ED1ng n\u01B0\u1EDBc vui l\u1EAFm." } : w === "Nhi\u1EC1u m\xE2y" ? { name: "Nhi\u1EC1u m\xE2y", type: "neutral", flavor: "M\xE2y che b\u1EDBt n\u1EAFng, rau v\xE0 b\u1EA1n \u0111\u1EC1u thong th\u1EA3." } : { name: "N\u1EAFng", type: "neutral", flavor: "N\u1EAFng \u0111\u1EB9p l\u1EAFm, h\u1EE3p \u0111\u1EC3 tr\u1ED3ng g\xEC \u0111\xF3." });
}
var eventPending = false;
async function requestDayEvent(force) {
  if (eventPending || !CS.link) return;
  if (!force && todayEvent()) return;
  if (!SEC.url || !SEC.model) {
    applyDayEvent(fallbackEvent(), "fallback", 'Ch\u01B0a c\u1EA5u h\xECnh API ph\u1EE5 (\u0111i\u1EC1n xong trong c\xE0i \u0111\u1EB7t th\xEC nh\u1EDB b\u1EA5m "L\u01B0u c\u1EA5u h\xECnh")');
    return;
  }
  eventPending = true;
  renderBanner();
  try {
    const wb = await collectWorldbook();
    console.log("====== [FARM DEBUG] WORLDBOOK EXTRACTED ======");
    console.log(wb);
    console.log("================================================");
    const prompt = buildEventPrompt(wb);
    const reqBody = {
      model: SEC.model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "H\xE3y t\u1EA1o s\u1EF1 ki\u1EC7n v\u01B0\u1EDDn rau cho h\xF4m nay." }
      ],
      max_tokens: 2e3 + Object.keys(CROPS).length * 100
    };
    const resPromise = fetch(SEC.url.replace(/\/+$/, "") + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...SEC.key ? { Authorization: "Bearer " + SEC.key } : {} },
      body: JSON.stringify(reqBody)
    }).then((r) => r.json());
    const data = await Promise.race([
      resPromise,
      new Promise((_, rej) => window.setTimeout(() => rej(new Error("timeout")), 9e4))
      // v0.8: 15 mô tả nên lượng sinh ra lớn, 30s→90s
    ]);
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    const raw = data.choices && data.choices[0] && data.choices[0].message ? String(data.choices[0].message.content) : "";
    const jtxt = extractJson(raw);
    if (!jtxt) throw new Error(raw.trim() ? "Kh\xF4ng c\xF3 JSON, model tr\u1EA3 v\u1EC1: " + raw.trim().slice(0, 40) : "Model tr\u1EA3 v\u1EC1 r\u1ED7ng (c\xF3 th\u1EC3 max_tokens b\u1ECB ph\u1EA7n suy ngh\u0129 \u0103n h\u1EBFt / API kh\xF4ng xu\u1EA5t g\xEC)");
    const ev = sanitizeEvent(JSON.parse(jtxt));
    if (!ev) throw new Error("Tr\u01B0\u1EDDng JSON b\u1EA5t th\u01B0\u1EDDng");
    applyDayEvent(ev, "ai");
  } catch (e) {
    applyDayEvent(fallbackEvent(), "fallback", (e && e.message || String(e)).slice(0, 60));
  } finally {
    eventPending = false;
    renderBanner();
  }
}
var renderTimeout;
function openSandbox() {
  const html = `
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px;display:flex;flex-direction:column;gap:8px">
        <div class="shead" style="margin-top:0">T\u1EA1o Sprite b\u1EB1ng AI</div>
        <div class="note">Nh\u1EADp \xFD t\u01B0\u1EDFng \u0111\u1EC3 AI x\u1EBFp m\xE3 t\u1EF1 \u0111\u1ED9ng. D\xF9ng chung API \u1EDF ph\u1EA7n c\xE0i \u0111\u1EB7t.</div>
        <div style="display:flex;gap:8px">
          <select class="inp" id="sbPalette" style="padding:6px;flex:1">
            <option value="SPRITES">B\u1EA3ng m\xE0u N\xF4ng s\u1EA3n/V\u1EADt ph\u1EA9m (P)</option>
            <option value="PETS">B\u1EA3ng m\xE0u Th\xFA c\u01B0ng (PET_P)</option>
          </select>
          <select class="inp" id="sbSize" style="padding:6px;width:90px">
            <option value="16">16 x 16</option>
            <option value="24">24 x 24</option>
            <option value="32">32 x 32</option>
          </select>
        </div>
        <textarea class="inp" id="sbPrompt" placeholder="Nh\u1EADp \xFD t\u01B0\u1EDFng pixel art (g\xF5 ti\u1EBFng Vi\u1EC7t c\u0169ng \u0111\u01B0\u1EE3c)..." style="height:60px"></textarea>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="buy" id="sbGenerate">\u2728 T\u1EA1o b\u1EB1ng AI</span>
          <span class="buy plain" id="sbPayloadBtn" style="display:none;padding:4px 8px;font-size:12px">\u{1F50D} Payload</span>
          <span id="sbStatus" style="font-size:12px;color:var(--accFg)"></span>
        </div>
        <textarea class="inp" id="sbPayloadOut" style="display:none;height:120px;font-size:11px;font-family:monospace;margin-top:4px" readonly></textarea>
        <div class="shead">M\xE3 Pixel</div>
        <div class="note">D\u1EA5u . l\xE0 trong su\u1ED1t. D\xE1n ho\u1EB7c s\u1EEDa m\u1EA3ng JSON v\xE0o \u0111\xE2y \u0111\u1EC3 xem th\u1EED tr\xEAn b\u1EA3ng v\u1EBD.</div>
        <textarea class="inp" id="sbCode" style="height:200px;font-family:monospace;white-space:pre"></textarea>
      </div>
      <div style="width:256px;display:flex;flex-direction:column;gap:8px">
        <div class="shead" style="margin-top:0">B\u1EA3n xem tr\u01B0\u1EDBc</div>
        <canvas id="sbCanvas" width="256" height="256" style="background: repeating-conic-gradient(#dfdfdf 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px; image-rendering:pixelated; border:2px solid var(--st-border-color); border-radius:4px; width:100%"></canvas>
      </div>
    </div>
  `;
  openModal("X\u01B0\u1EDFng Ch\u1EBF T\xE1c", html);
  const ta = $id("sbCode");
  const sel = $id("sbPalette");
  const sizeSel = $id("sbSize");
  const ctx2 = $id("sbCanvas").getContext("2d");
  function render() {
    const isPet = sel.value === "PETS";
    const palette = isPet ? PET_P : P;
    const size = parseInt(sizeSel.value) || 16;
    const canvasEl = $id("sbCanvas");
    if (canvasEl.width !== size) {
      canvasEl.width = size;
      canvasEl.height = size;
    }
    ctx2.clearRect(0, 0, size, size);
    const lines = ta.value.split("\n").map((l) => l.trim().replace(/['",\[\]]/g, "")).filter((l) => l.length > 0);
    for (let y = 0; y < Math.min(size, lines.length); y++) {
      const row = lines[y];
      for (let x = 0; x < Math.min(size, row.length); x++) {
        const char = row[x];
        if (char !== ".") {
          const color = palette[char];
          if (color && typeof color === "string") {
            ctx2.fillStyle = color;
            ctx2.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  }
  function debouncedRender() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(render, 150);
  }
  ta.addEventListener("input", debouncedRender);
  sel.addEventListener("change", render);
  sizeSel.addEventListener("change", render);
  $id("sbPayloadBtn").addEventListener("click", () => {
    const out = $id("sbPayloadOut");
    out.style.display = out.style.display === "none" ? "block" : "none";
  });
  $id("sbGenerate").addEventListener("click", async () => {
    const p = $id("sbPrompt").value.trim();
    if (!p) return toast("Vui l\xF2ng nh\u1EADp \xFD t\u01B0\u1EDFng!");
    if (!SEC.url) return toast("Vui l\xF2ng c\u1EA5u h\xECnh API trong C\xE0i \u0111\u1EB7t tr\u01B0\u1EDBc!");
    $id("sbGenerate").style.pointerEvents = "none";
    $id("sbGenerate").style.opacity = "0.5";
    $id("sbStatus").textContent = "\u0110ang g\u1ECDi AI...";
    try {
      const isPet = sel.value === "PETS";
      const palette = isPet ? PET_P : P;
      const simpleColors = Object.entries(palette).filter((e) => typeof e[1] === "string");
      const paletteStr = simpleColors.map(([k, v]) => `${k}: ${v}`).join(", ");
      const size = parseInt(sizeSel.value) || 16;
      const sysPrompt = `B\u1EA1n l\xE0 m\u1ED9t chuy\xEAn gia thi\u1EBFt k\u1EBF Pixel Art (${size}x${size}). Nhi\u1EC7m v\u1EE5 c\u1EE7a b\u1EA1n l\xE0 v\u1EBD m\u1ED9t \u0111\u1ED3 v\u1EADt d\u1EF1a tr\xEAn y\xEAu c\u1EA7u, v\xE0 B\u1EAET BU\u1ED8C ch\u1EC9 \u0111\u01B0\u1EE3c d\xF9ng c\xE1c m\xE3 k\xFD t\u1EF1 trong B\u1EA3ng m\xE0u sau \u0111\xE2y.

B\u1EA2NG M\xC0U CHO PH\xC9P (K\xFD t\u1EF1: M\xE3 m\xE0u Hex):
${paletteStr}

H\u01AF\u1EDANG D\u1EAAN T\u01AF DUY (B\u1EAFt bu\u1ED9c ph\u1EA3i c\xF3 th\u1EBB <thinking> tr\u01B0\u1EDBc khi xu\u1EA5t m\xE3):
\u0110\u1EC3 v\u1EBD pixel art ho\xE0n h\u1EA3o, s\u1EAFc n\xE9t v\xE0 kh\xF4ng b\u1ECB m\xE9o l\u1EC7ch, h\xE3y tu\xE2n th\u1EE7 nghi\xEAm ng\u1EB7t c\xE1c b\u01B0\u1EDBc sau:
1. Ph\xE2n t\xEDch B\u1ED1 c\u1EE5c & H\xECnh kh\u1ED1i: L\u1EF1a ch\u1ECDn g\xF3c \u0111\u1ED9 \u0111\u1EB7t v\u1EADt th\u1EC3 (vd: v\u0169 kh\xED n\xEAn \u0111\u1EB7t ch\xE9o). N\u1EBFu v\u1EBD v\u1EADt th\u1EC3 tr\xF2n/c\xE2n x\u1EE9ng, h\xE3y t\xEDnh to\xE1n sao cho n\u1EEDa tr\xE1i v\xE0 n\u1EEDa ph\u1EA3i kh\u1EDBp nhau. Nh\u1EDB r\u1EB1ng khung ${size}x${size} kh\xF4ng c\xF3 t\xE2m 1 pixel (t\xE2m n\u1EB1m gi\u1EEFa c\u1ED9t ${size / 2 - 1} v\xE0 ${size / 2}).
2. Quy ho\u1EA1ch M\xE0u s\u1EAFc (Palette): Ch\u1ECDn k\xFD t\u1EF1 l\xE0m m\xE0u Vi\u1EC1n (b\u1EAFt bu\u1ED9c bao quanh v\u1EADt th\u1EC3), m\xE0u T\u1ED1i (Shadow) cho h\u01B0\u1EDBng khu\u1EA5t s\xE1ng, m\xE0u ctx.S\xE1ng (Highlight) cho h\u01B0\u1EDBng \u0111\xF3n s\xE1ng, v\xE0 m\xE0u N\u1EC1n (Base). TUY\u1EC6T \u0110\u1ED0I KH\xD4NG ch\u1EBF ra k\xFD t\u1EF1 ngo\xE0i B\u1EA3ng m\xE0u.
3. H\xECnh d\xE1ng (Shape & Texture): Tr\xE1nh l\xE0m c\xE1c kh\u1ED1i m\xE0u b\u1ECB vu\xF4ng v\u1EE9c, th\u1EB3ng \u0111u\u1ED9t. ctx.S\u1EED d\u1EE5ng c\xE1c n\xE9t l\u01B0\u1EE3n \u0111\u1EC3 t\u1EA1o h\xECnh d\xE1ng t\u1EF1 nhi\xEAn.
4. \xC1nh x\u1EA1 & \u0110\u1EBEM K\xDD T\u1EF0 (R\u1EA5t quan tr\u1ECDng): Khi ph\xE1c th\u1EA3o t\u1EEBng d\xF2ng (t\u1EEB d\xF2ng 0 \u0111\u1EBFn ${size - 1}), B\u1EA0N PH\u1EA2I \u0110\u1EBEM CH\xCDNH X\xC1C s\u1ED1 l\u01B0\u1EE3ng k\xFD t\u1EF1. 
 - Khung canvas l\xE0 ${size}x${size}. Do \u0111\xF3, m\u1ED9t d\xF2ng CH\u1EC8 \u0110\u01AF\u1EE2C PH\xC9P d\xE0i \u0111\xFAng ${size} k\xFD t\u1EF1.
 - V\xED d\u1EE5 m\u1ED9t d\xF2ng tr\u1ED1ng h\u1EE3p l\u1EC7: "${".".repeat(size)}"
 - N\u1EBFu b\u1EA1n t\u1EA1o ra d\xF2ng c\xF3 ${size + 1} ho\u1EB7c ${size - 1} k\xFD t\u1EF1, h\xECnh s\u1EBD b\u1ECB c\u1EAFt x\xE9n v\xE0 m\xE9o m\xF3.

QUY T\u1EAEC \u0110\u1EA6U RA B\u1EAET BU\u1ED8C:
- Sau khi \u0111\xF3ng th\u1EBB </thinking>, CH\u1EC8 \u0110\u01AF\u1EE2C XU\u1EA4T 1 kh\u1ED1i m\xE3 \`\`\`json ch\u1EE9a m\u1EA3ng g\u1ED3m \u0110\xDANG ${size} chu\u1ED7i.
- KI\u1EC2M TRA L\u1EA0I: M\u1ED7i chu\u1ED7i \u0111\u1EA1i di\u1EC7n cho 1 h\xE0ng v\xE0 PH\u1EA2I D\xC0I CH\xCDNH X\xC1C ${size} K\xDD T\u1EF0. Kh\xF4ng h\u01A1n kh\xF4ng k\xE9m!
- D\xF9ng d\u1EA5u ch\u1EA5m '.' cho pixel trong su\u1ED1t.
- TUY\u1EC6T \u0110\u1ED0I kh\xF4ng d\xF9ng k\xFD t\u1EF1 l\u1EA1 ngo\xE0i d\u1EA5u '.' v\xE0 c\xE1c k\xFD t\u1EF1 B\u1EA3ng m\xE0u.`;
      const reqBody = {
        model: SEC.model,
        messages: [
          { role: "system", content: sysPrompt },
          { role: "user", content: "V\u1EBD: " + p }
        ]
      };
      $id("sbPayloadOut").value = JSON.stringify(reqBody, null, 2);
      $id("sbPayloadBtn").style.display = "inline-block";
      const res = await fetch(SEC.url.replace(/\/+$/, "") + "/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...SEC.key ? { Authorization: "Bearer " + SEC.key } : {} },
        body: JSON.stringify(reqBody)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      let jsonStr = "";
      const codeMatch = content.match(/```(?:json)?\s*(\[[\s\ctx.S]*?\])\s*```/i);
      if (codeMatch) {
        jsonStr = codeMatch[1];
      } else {
        const arrMatch = content.match(/\[\s*"(?:[^"\\]|\\.)*"(?:\s*,\s*"(?:[^"\\]|\\.)*")*\s*\]/);
        jsonStr = arrMatch ? arrMatch[0] : (content.match(/\[[\s\ctx.S]*?\]/) || [""])[0];
      }
      if (jsonStr) {
        ta.value = jsonStr.trim();
        render();
        $id("sbStatus").textContent = "Ho\xE0n t\u1EA5t!";
      } else {
        throw new Error("AI kh\xF4ng tr\u1EA3 v\u1EC1 m\u1EA3ng JSON");
      }
    } catch (e) {
      console.error(e);
      $id("sbStatus").textContent = "L\u1ED7i!";
      toast("L\u1ED7i AI: " + e.message);
    } finally {
      $id("sbGenerate").style.pointerEvents = "";
      $id("sbGenerate").style.opacity = "1";
    }
  });
}
function applyDayEvent(ev, source, reason) {
  const d = gameDay();
  ctx.S.dayEvent = { day: d, at: now(), who: charName(), ev, source, reason: reason || "" };
  if (ev.time_mult !== 1) {
    eachPage((plots) => plots.forEach((p) => {
      const c = p.crop;
      if (!c || now() >= c.matureAt || c.evDay === d) return;
      if (ev.favored_crop && CROPS[c.id].name !== ev.favored_crop) return;
      c.matureAt = now() + Math.round((c.matureAt - now()) * ev.time_mult);
      c.evDay = d;
    }));
  }
  save();
  renderStatus();
  renderPlots();
}
async function testSecApi() {
  if (!SEC.url || !SEC.model) return toast("H\xE3y \u0111i\u1EC1n \u0111\u1ECBa ch\u1EC9 API v\xE0 t\xEAn model tr\u01B0\u1EDBc");
  toast("\u0110ang ki\u1EC3m tra k\u1EBFt n\u1ED1i\u2026");
  try {
    const reqBody = {
      model: SEC.model,
      messages: [{ role: "user", content: "Ch\u1EC9 tr\u1EA3 l\u1EDDi \u0111\xFAng hai ch\u1EEF: C\xF3 m\u1EB7t" }],
      max_tokens: 16
    };
    const resPromise = fetch(SEC.url.replace(/\/+$/, "") + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...SEC.key ? { Authorization: "Bearer " + SEC.key } : {} },
      body: JSON.stringify(reqBody)
    }).then((r) => r.json());
    const data = await Promise.race([
      resPromise,
      new Promise((_, rej) => window.setTimeout(() => rej(new Error("Qu\xE1 th\u1EDDi gian ch\u1EDD (20s)")), 2e4))
    ]);
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    const raw = data.choices && data.choices[0] && data.choices[0].message ? String(data.choices[0].message.content) : "";
    toast("K\u1EBFt n\u1ED1i th\xE0nh c\xF4ng: " + raw.trim().slice(0, 20));
  } catch (e) {
    toast("K\u1EBFt n\u1ED1i th\u1EA5t b\u1EA1i: " + (e && e.message || e));
  }
}
async function fetchModelList() {
  const url = $id("secUrl").value.trim(), key = $id("secKey").value.trim();
  const drop = $id("modelDrop");
  if (!url) return toast("H\xE3y \u0111i\u1EC1n \u0111\u1ECBa ch\u1EC9 API tr\u01B0\u1EDBc");
  if (drop.style.display !== "none") {
    drop.style.display = "none";
    return;
  }
  toast("\u0110ang l\u1EA5y danh s\xE1ch model\u2026");
  try {
    const ctrl = new AbortController();
    const to = window.setTimeout(() => ctrl.abort(), 15e3);
    const r = await fetch(url.replace(/\/+$/, "") + "/models", { headers: key ? { Authorization: "Bearer " + key } : {}, signal: ctrl.signal });
    window.clearTimeout(to);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const d = await r.json();
    const ids = (d && (d.data || d.models) || []).map((m) => m && (m.id || m.model || m.name) || "").filter(Boolean);
    if (!ids.length) throw new Error("API kh\xF4ng tr\u1EA3 v\u1EC1 danh s\xE1ch model");
    drop.innerHTML = ids.map((id) => `<span data-mpick="${esc(id)}">${esc(id)}</span>`).join("");
    drop.style.display = "flex";
    drop.querySelectorAll("[data-mpick]").forEach((el) => el.addEventListener("click", () => {
      $id("secModel").value = el.dataset.mpick;
      drop.style.display = "none";
      toast("\u0110\xE3 ch\u1ECDn: " + el.dataset.mpick + ", nh\u1EDB b\u1EA5m l\u01B0u c\u1EA5u h\xECnh");
    }));
  } catch (e) {
    toast("L\u1EA5y danh s\xE1ch th\u1EA5t b\u1EA1i: " + (e && e.message || e));
  }
}
var INJECT_ID = "star_tavern_farm_summary";
function setInjection(text) {
  try {
    const ctx2 = window.SillyTavern?.getContext?.() || {};
    if (ctx2.setExtensionPrompt) ctx2.setExtensionPrompt(INJECT_ID, text || "", 1, 4);
  } catch (e) {
  }
}
function updateInjection() {
  if (!CS.link || !CS.story) {
    setInjection("");
    return;
  }
  const counts = {};
  let ripe = 0;
  eachPage((plots) => plots.forEach((p) => {
    const c = p.crop;
    if (!c) return;
    counts[c.id] = (counts[c.id] || 0) + 1;
    if (now() >= c.matureAt) ripe++;
  }));
  const field = Object.keys(counts).map((id) => CROPS[id].name + "\xD7" + counts[id]).join(", ") || "\u0111ang \u0111\u1EC3 tr\u1ED1ng";
  const bagTxt = Object.keys(ctx.S.bag).map((k) => {
    const d = mutDescOf(k);
    return "  + " + bagName(k) + " \xD7" + ctx.S.bag[k] + (d ? " (" + d + ")" : "");
  }).join("\n");
  const ev = todayEvent();
  const takeoutNoteStr = function() {
    setTakeoutNote((takeoutNote || []).filter((t) => now() < t.until));
    if (!takeoutNote.length) return "";
    return `

\u3010QUAN TR\u1ECCNG: H\xC0NH \u0110\u1ED8NG V\u1EEAA X\u1EA2Y RA\u3011
Ng\u01B0\u1EDDi ch\u01A1i v\u1EEBa l\u1EA5y ${takeoutNote.map((t) => t.txt).join(", ")} ra kh\u1ECFi balo v\u01B0\u1EDDn rau, h\u1EB3n l\xE0 \u0111\u1ECBnh d\xF9ng/t\u1EB7ng trong c\u1ED1t truy\u1EC7n. H\xE3y ti\u1EBFp nh\u1EADn m\u1ED9t c\xE1ch t\u1EF1 nhi\xEAn; ph\u1EA7n trong ngo\u1EB7c l\xE0 hi\u1EC7u \u1EE9ng c\u1EE7a v\u1EADt ph\u1EA9m \u0111\xF3, h\xE3y l\u1EA5y \u0111\xF3 l\xE0m chu\u1EA9n v\xE0 c\xF3 th\u1EC3 s\xE1ng t\u1EA1o th\xEAm trong ch\u1EEBng m\u1EF1c.`;
  }();
  const promptText = `\u3010V\u01B0\u1EDDn rau nh\u1ECF c\u1EE7a ng\u01B0\u1EDDi ch\u01A1i\u3011
Ng\u01B0\u1EDDi ch\u01A1i \u0111ang tr\u1ED3ng m\u1ED9t m\u1EA3nh v\u01B0\u1EDDn rau th\u01B0 gi\xE3n tr\xEAn giao di\u1EC7n SillyTavern (l\u1ED1i ch\u01A1i ti\u1EC7n \xEDch, t\u1ED3n t\u1EA1i song song v\u1EDBi c\u1ED1t truy\u1EC7n).
T\xECnh tr\u1EA1ng hi\u1EC7n t\u1EA1i:
- \u0110ang tr\u1ED3ng: ${field || "\u0110\u1EA5t tr\u1ED1ng"}${ripe ? ` (c\xF3 ${ripe} c\xE2y \u0111\xE3 ch\xEDn ch\u1EDD thu)` : ""}
${bagTxt ? "- N\xF4ng s\u1EA3n t\xEDch tr\u1EEF:\n" + bagTxt : "- N\xF4ng s\u1EA3n t\xEDch tr\u1EEF: Tr\u1ED1ng"}
${ev && ev.flavor ? `- S\u1EF1 ki\u1EC7n h\xF4m nay: ${ev.name} \u2014\u2014 ${ev.flavor}` : ""}${takeoutNoteStr}

* H\u01B0\u1EDBng d\u1EABn cho AI: Nh\xE2n v\u1EADt trong c\u1ED1t truy\u1EC7n th\u1EC9nh tho\u1EA3ng c\xF3 th\u1EC3 nh\u1EAFc t\u1EDBi vi\u1EC7c ng\u01B0\u1EDDi ch\u01A1i ch\u0103m v\u01B0\u1EDDn hay thu ho\u1EA1ch th\u1EBF n\xE0o m\u1ED9t c\xE1ch t\u1EF1 nhi\xEAn, nh\u01B0ng \u0110\u1EEANG thao t\xE1c v\u01B0\u1EDDn rau thay ng\u01B0\u1EDDi ch\u01A1i, c\u0169ng \u0110\u1EEANG bi\u1EBFn v\u01B0\u1EDDn rau th\xE0nh m\u1EA1ch ch\xEDnh c\u1EE7a c\u1ED1t truy\u1EC7n.`;
  setInjection(promptText);
}
var heartbeat;
function initEvents() {
  heartbeat = window.setInterval(() => {
    try {
      settle();
    } catch (e) {
    }
  }, 60 * 1e3);
  loadCharState();
  try {
    const chatChangedEvent = ctx.event_types?.CHAT_CHANGED;
    if (ctx.eventSource?.on && chatChangedEvent) {
      const onChatChanged = () => {
        loadCharState();
        renderChips();
        renderBanner();
        updateInjection();
        try {
          if (ctx.S && CS.link) requestDayEvent();
        } catch (e) {
          console.warn("[Farm] L\u1ED7i khi \u0111\u0103ng k\xFD s\u1EF1 ki\u1EC7n CHAT_CHANGED:", e);
        }
      };
      ctx.eventSource.on(chatChangedEvent, onChatChanged);
      disposers.push(() => {
        try {
          if (ctx.eventSource.removeListener) ctx.eventSource.removeListener(chatChangedEvent, onChatChanged);
          else if (ctx.eventSource.off) ctx.eventSource.off(chatChangedEvent, onChatChanged);
        } catch (e) {
        }
      });
    } else {
      console.warn("[Farm] ctx.eventSource ho\u1EB7c ctx.event_types.CHAT_CHANGED kh\xF4ng kh\u1EA3 d\u1EE5ng, b\u1ECF qua \u0111\u0103ng k\xFD s\u1EF1 ki\u1EC7n \u0111\u1ED5i th\u1EBB.");
    }
  } catch (e) {
    console.warn("[Farm] L\u1ED7i khi \u0111\u0103ng k\xFD s\u1EF1 ki\u1EC7n CHAT_CHANGED:", e);
  }
}

// src/state.js
var now = () => Date.now();
var emptyPlots = () => {
  const a = [];
  for (let i = 0; i < 24; i++) a.push({ crop: null });
  return a;
};
function freshState() {
  return {
    version: 1,
    coins: TEST_MODE ? 9999 : 999,
    totalSales: 0,
    unlockedBlocks: 2,
    plots: emptyPlots(),
    seeds: { douya: 4, mystery: 1 },
    ferts: {},
    bag: {},
    petPoke: {},
    // Quà khởi đầu: 4 giá đỗ + 1 hạt giống bí ẩn (popup dạy chơi hộp mù)
    pets: ["slime"],
    passes: {},
    petsOut: ["slime"],
    jobCfg: {},
    petFind: {},
    // Tặng slime xanh lúc mở đầu (thực hiện phương án #9)
    page: 1,
    plots2: emptyPlots(),
    plots3: emptyPlots(),
    unlockedBlocks2: 1,
    unlockedBlocks3: 1,
    // v0.8: ba trang (vé vào trang 2/3 tặng kèm ô đất đầu tiên)
    day0: now(),
    orb: { fx: 0.94, fy: 0.6 },
    win: null
  };
}
ctx.S = null;
var blockPrice = (bi) => BLOCK_PRICE_PG[ctx.S.page][bi];
function loadState() {
  if (!ctx.extension_settings[extensionName]) {
    ctx.extension_settings[extensionName] = {};
  }
  const g = ctx.extension_settings[extensionName] || {};
  ctx.S = g[NS] && g[NS].version === 1 ? g[NS] : freshState();
  if (!ctx.S.petPoke) ctx.S.petPoke = {};
  if (!ctx.S.mutDesc) ctx.S.mutDesc = {};
  if (!ctx.S.passes) ctx.S.passes = {};
  if (!ctx.S.pets) ctx.S.pets = ["slime", "octo"];
  if (!ctx.S.petsOut) ctx.S.petsOut = ctx.S.pets.slice(0, 6);
  if (!ctx.S.jobCfg) ctx.S.jobCfg = {};
  if (!ctx.S.petFind) ctx.S.petFind = {};
  if (!ctx.S.theme) ctx.S.theme = "sakura";
  if (!ctx.S.page) ctx.S.page = 1;
  if (ctx.S.dragPet === void 0) ctx.S.dragPet = false;
  Object.keys(ctx.S.bag || {}).forEach((k) => {
    const base = k.split("@")[0];
    if (base === "mysbG" || base === "mysbW" || base === "mysbM") {
      const nk = k.replace(base, "moonberry");
      ctx.S.bag[nk] = (ctx.S.bag[nk] || 0) + ctx.S.bag[k];
      delete ctx.S.bag[k];
    }
  });
  [ctx.S.plots, ctx.S.plots2, ctx.S.plots3].forEach((arr) => (arr || []).forEach((p) => {
    if (p.crop && (p.crop.id === "mysbG" || p.crop.id === "mysbW" || p.crop.id === "mysbM")) p.crop.id = "moonberry";
  }));
  if (!ctx.S.witch) ctx.S.witch = { nextAt: now(), leaveAt: 0, missed: 0, order: null };
  if (!ctx.S.shards) ctx.S.shards = { prism: 0, star: 0 };
  if (!ctx.S.plots2) ctx.S.plots2 = emptyPlots();
  if (!ctx.S.plots3) ctx.S.plots3 = emptyPlots();
  if (ctx.S.unlockedBlocks2 == null) ctx.S.unlockedBlocks2 = 1;
  if (ctx.S.unlockedBlocks3 == null) ctx.S.unlockedBlocks3 = 1;
  [ctx.S.plots, ctx.S.plots2, ctx.S.plots3].forEach((arr) => arr.forEach((p) => {
    const c = p.crop;
    if (!c) return;
    if (!c.fertUsed) c.fertUsed = {};
    if (CROPS[c.id].regrow && c.left == null) c.left = REGROW_MAX;
  }));
}
var pagePlots = (pg) => pg === 2 ? ctx.S.plots2 : pg === 3 ? ctx.S.plots3 : ctx.S.plots;
var curPlots = () => pagePlots(ctx.S.page);
var curBlocks = () => ctx.S.page === 2 ? ctx.S.unlockedBlocks2 : ctx.S.page === 3 ? ctx.S.unlockedBlocks3 : ctx.S.unlockedBlocks;
var addBlock = () => {
  if (ctx.S.page === 2) ctx.S.unlockedBlocks2++;
  else if (ctx.S.page === 3) ctx.S.unlockedBlocks3++;
  else ctx.S.unlockedBlocks++;
};
var eachPage = (fn) => [1, 2, 3].forEach((pg) => fn(pagePlots(pg), pg));
ctx.saveTimer = null;
function save(immediate) {
  if (ctx.saveTimer) {
    clearTimeout(ctx.saveTimer);
    ctx.saveTimer = null;
  }
  const doSave = () => {
    if (!ctx.extension_settings[extensionName]) ctx.extension_settings[extensionName] = {};
    ctx.extension_settings[extensionName][NS] = ctx.S;
    if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
    try {
      updateInjection();
    } catch (e) {
    }
  };
  if (immediate) doSave();
  else ctx.saveTimer = setTimeout(doSave, 500);
}

// src/destroy.js
var destroyed = false;
function resetDestroyed() {
  destroyed = false;
}
function destroy() {
  if (destroyed) return;
  destroyed = true;
  try {
    if (tick) window.clearInterval(tick);
  } catch (e) {
  }
  try {
    window.clearInterval(heartbeat);
  } catch (e) {
  }
  try {
    window.clearInterval(wander);
  } catch (e) {
  }
  try {
    Object.keys(petHopT).forEach((k) => window.clearTimeout(petHopT[k]));
  } catch (e) {
  }
  try {
    Object.keys(petSleepT).forEach((k) => window.clearTimeout(petSleepT[k]));
  } catch (e) {
  }
  try {
    endScene();
  } catch (e) {
  }
  try {
    if (ctx.saveTimer) {
      clearTimeout(ctx.saveTimer);
      save(true);
    }
  } catch (e) {
  }
  try {
    if (toastTimer) window.clearTimeout(toastTimer);
  } catch (e) {
  }
  while (disposers.length) {
    try {
      disposers.pop()();
    } catch (e) {
    }
  }
  try {
    setInjection("");
  } catch (e) {
  }
  try {
    root.remove();
  } catch (e) {
  }
  try {
    if (extMenuBtn) extMenuBtn.remove();
  } catch (e) {
  }
  try {
    delete window[RUNTIME_KEY];
  } catch (e) {
  }
}
var extMenuBtn = null;
function setupExtButton() {
  if (extMenuBtn) {
    try {
      extMenuBtn.remove();
    } catch (e) {
    }
  }
  const extMenu = document.querySelector("#extensionsMenu");
  if (!extMenu) {
    window.setTimeout(setupExtButton, 500);
    return;
  }
  extMenuBtn = document.createElement("div");
  extMenuBtn.id = "farm-wand-btn";
  extMenuBtn.className = "list-group-item flex-container flexGap5 interactable";
  extMenuBtn.tabIndex = 0;
  extMenuBtn.innerHTML = '<div class="fa-fw fa-solid fa-leaf extensionsMenuExtensionButton"></div> N\xF4ng Tr\u1EA1i';
  extMenuBtn.style.cursor = "pointer";
  extMenuBtn.addEventListener("click", toggleWin);
  extMenu.appendChild(extMenuBtn);
}
function setupSlashCommand() {
  (async function() {
    try {
      let scp, SlashCommand;
      try {
        scp = (await import("../../../slash-commands/SlashCommandParser.js")).SlashCommandParser;
        SlashCommand = (await import("../../../slash-commands/SlashCommand.js")).SlashCommand;
      } catch (err) {
      }
      scp = scp || window.SlashCommandParser || globalThis.SlashCommandParser;
      SlashCommand = SlashCommand || window.SlashCommand || globalThis.SlashCommand;
      if (scp && SlashCommand && SlashCommand.fromProps) {
        scp.addCommandObject(SlashCommand.fromProps({
          name: "farm",
          callback: async () => {
            toggleWin();
            return "";
          },
          helpString: "M\u1EDF/\u0110\xF3ng giao di\u1EC7n N\xF4ng tr\u1EA1i (SillyTavern Farm)"
        }));
      }
    } catch (e) {
      console.error("[Farm] L\u1ED7i \u0111\u0103ng k\xFD l\u1EC7nh /farm:", e);
    }
  })();
}

// src/main.js
function initFarm() {
  try {
    window[RUNTIME_KEY]?.destroy?.();
  } catch (e) {
  }
  resetDestroyed();
  document.getElementById("star-tavern-farm-root")?.remove();
  loadState();
  initUI();
  applyTheme();
  initOrb();
  initWindows();
  initShop();
  initRender();
  initPets();
  initWitch();
  initEvents();
  setupExtButton();
  setupSlashCommand();
  const api = { destroy };
  window[RUNTIME_KEY] = api;
  renderToolbar();
  renderChips();
  renderBanner();
  renderPets();
  updateInjection();
  if (CS.link) requestDayEvent();
  const diag = [];
  if (ctx.S) diag.push("S");
  if (ctx.CS) diag.push("CS");
  if (ctx.ui) diag.push("ui");
  console.log("[Farm] ST Context k\u1EBFt n\u1ED1i th\xE0nh c\xF4ng \u2014 " + diag.join(", "));
  console.log("Farm initialized");
}
async function init() {
  if (window[RUNTIME_KEY]) return;
  try {
    let context = null;
    try {
      context = window.SillyTavern?.getContext?.();
    } catch (_) {
    }
    if (!context) try {
      context = globalThis.SillyTavern?.getContext?.();
    } catch (_) {
    }
    if (!context) context = {};
    let ext_set = context.extensionSettings || context.extension_settings || window.extension_settings || {};
    let save_set = context.saveSettingsDebounced || window.saveSettingsDebounced || (() => {
    });
    let ev_src = context.eventSource || window.eventSource;
    let ev_types = context.event_types || context.eventTypes || window.event_types;
    let gen_raw = context.generateRaw || window.generateRaw;
    setExtensionContext({
      extension_settings: ext_set,
      saveSettingsDebounced: save_set,
      eventSource: ev_src,
      event_types: ev_types,
      generateRaw: gen_raw
    });
  } catch (e) {
    console.error("[Farm] L\u1ED7i khi k\u1EBFt n\u1ED1i ST Context:", e);
    let ext_set = window.extension_settings || {};
    let save_set = window.saveSettingsDebounced || (() => {
    });
    let ev_src = window.eventSource;
    let ev_types = window.event_types;
    let gen_raw = window.generateRaw;
    setExtensionContext({
      extension_settings: ext_set,
      saveSettingsDebounced: save_set,
      eventSource: ev_src,
      event_types: ev_types,
      generateRaw: gen_raw
    });
  }
  initFarm();
  warmUpCache(CROPS);
  setTimeout(() => {
    if (!document.getElementById("star-tavern-farm-root")) {
      console.warn("[Farm] Failsafe: Giao di\u1EC7n ch\u01B0a \u0111\u01B0\u1EE3c n\u1EA1p. Th\u1EED kh\u1EDFi \u0111\u1ED9ng l\u1EA1i extension...");
      try {
        initFarm();
        if (!document.getElementById("star-tavern-farm-root")) {
          console.error("[Farm] Failsafe: Kh\u1EDFi \u0111\u1ED9ng l\u1EA1i th\u1EA5t b\u1EA1i, DOM root v\u1EABn kh\xF4ng t\u1ED3n t\u1EA1i. Vui l\xF2ng ki\u1EC3m tra qu\xE1 tr\xECnh n\u1EA1p extension c\u1EE7a SillyTavern.");
        } else {
          console.log("[Farm] Failsafe: Kh\u1EDFi \u0111\u1ED9ng l\u1EA1i th\xE0nh c\xF4ng.");
        }
      } catch (err) {
        console.error("[Farm] Failsafe: Kh\u1EDFi \u0111\u1ED9ng l\u1EA1i g\u1EB7p l\u1ED7i nghi\xEAm tr\u1ECDng! Chi ti\u1EBFt l\u1ED7i:", err);
      }
    }
  }, 1e4);
}
var jQuery = (
  /** @type {any} */
  window.jQuery
);
if (typeof jQuery === "function") {
  jQuery(async () => {
    if (!window[RUNTIME_KEY]) await init();
  });
} else {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (!window[RUNTIME_KEY]) init();
    });
  } else {
    if (!window[RUNTIME_KEY]) init();
  }
}
