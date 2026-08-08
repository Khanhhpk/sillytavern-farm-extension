import { now } from './state.js';
import { CROPS } from './data.js';
/* ---------- Tài nguyên pixel (cùng nguồn với bản xem trước) ---------- */
export const P = {
  G: '#6cb457', D: '#3e7d3a', E: '#a4dc8c', R: '#dd5548', x: '#a33528',
  F: '#e06578', f: '#a83a52', p: '#ffb8c4', O: '#e89a4e', Q: '#c9772e',
  q: '#96551f', S: '#8a6844', h: '#f7c07a', B: '#9ed8f2', b: '#5fa8cc',
  u: '#3f7ea6', T: '#8a6a52', Y: '#c2b878', y: '#9a915c', L: '#b8b0a2',
  M: '#8a8274', C: '#f2c231', U: '#bf8a1a', W: '#fffdf4', K: '#3a2c22',
  n: '#ffb0bc', V: '#b48ae0', v: '#8a5cc0',
  '1': '#aecb87', '2': '#a0bd77', '3': '#c6dfa0', '4': '#8dab68',
  a: '#b99b84', c: '#9c7d66', d: '#cbb096', e: '#8a6a52',
  w: '#9d7458', g: '#b08a6d', m: '#7d5a42', s: '#684a36',
};

/* ===== Bảng màu riêng siêu chi tiết cho Gacha AI (62 màu: 0-9, a-z, A-Z) ===== */
export const GACHA_P = {
  '0': '#ffffff', '1': '#e0e0e0', '2': '#c0c0c0', '3': '#a0a0a0', '4': '#808080', '5': '#606060', '6': '#404040', '7': '#202020', '8': '#101010', '9': '#000000',
  'a': '#ff0000', 'b': '#cc0000', 'c': '#990000', 'd': '#ff6666', 'e': '#ff9999', 'f': '#ff6600', 'g': '#cc5200', 'h': '#ff9933', 'i': '#8b4513', 'j': '#a0522d', 'k': '#cd853f', 'l': '#deb887',
  'm': '#ffff00', 'n': '#ffd700', 'o': '#ffcc00', 'p': '#ffdab9', 'q': '#eee8aa', 'r': '#bdb76b',
  's': '#00ff00', 't': '#32cd32', 'u': '#008000', 'v': '#006400', 'w': '#98fb98', 'x': '#90ee90', 'y': '#adff2f', 'z': '#556b2f',
  'A': '#0000ff', 'B': '#0000cc', 'C': '#00008b', 'D': '#4169e1', 'E': '#6495ed', 'F': '#87ceeb', 'G': '#00ffff', 'H': '#00ced1', 'I': '#20b2aa', 'J': '#008080', 'K': '#7fffd4',
  'L': '#ff00ff', 'M': '#c71585', 'N': '#800080', 'O': '#4b0082', 'P': '#9370db', 'Q': '#da70d6', 'R': '#ffc0cb', 'S': '#ffb6c1', 'T': '#ff69b4', 'U': '#db7093',
  'V': '#ffe4c4', 'W': '#ffe4e1', 'X': '#faf0e6', 'Y': '#ffefd5', 'Z': '#ffebcd'
};
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SPR = {
  sprout: ["................", "................", "................", "................", "...DD......DD...", "..DEED....DEED..", ".DEGGGD..DGGGED.", ".DGGGGD..DGGGGD.", "..DGGGGDDGGGGD..", "...DGGGDDGGGD...", "....DGGGGGGD....", "......DGGD......", "...TTTDGGDTTT...", "..TTTTTTTTTTTT..", "................", "................"],
  seedling: ["................", "................", "................", "................", "................", "................", "................", "......EE........", ".....DGE........", "......DG........", "......GD........", "......GG........", "....TTGGTT......", "...TTTTTTTT.....", "................", "................"],
  douya: ["................", "................", "................", "................", "...DD......DD...", "..DEED....DEED..", ".DEGGGD..DGGGED.", ".DGGGGD..DGGGGD.", "..DGGGGDDGGGGD..", "...DGGGDDGGGD...", "....DGGGGGGD....", "......DGGD......", "...TTTDGGDTTT...", "..TTTTTTTTTTTT..", "................", "................"],
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
  tradeIcon: [
    "........................",
    "...............K........",
    "..............KKK.......",
    ".............KEEEK......",
    "...KKKKKKKKKKKEEEEK.....",
    "..KEEEEEEEEEEEEEEEEK....",
    "..KEEEEEEEEEEEEEEEEEK...",
    "..KGGGGGGGGGGGGGGGGGK...",
    "..KGGGGGGGGGGGGGGGGK....",
    "...KKKKKKKKKKKGGGGK.....",
    ".............KGGGK......",
    "..............KKK.......",
    "...............K........",
    "........K...............",
    ".......KKK..............",
    "......KbbbK.............",
    ".....KbbbbKKKKKKKKKKK...",
    "....KbbbbbbbbbbbbbbbbK..",
    "...KbbbbbbbbbbbbbbbbbK..",
    "...KuuuuuuuuuuuuuuuuuK..",
    "....KuuuuuuuuuuuuuuuuK..",
    ".....KuuuuKKKKKKKKKKK...",
    "......KuuuK.............",
    ".......KKK..............",
    "........K..............."
  ],
  bagIcon: ["................", "................", ".....ffff.......", "....f....f......", "...ffffffffff...", "..fddddddddddf..", "..fddddddddddf..", "..fFFFFFFFFFFf..", "..fFFFFCCFFFFf..", "..fFpFFCCFFFFf..", "..fFpFFFFFFFFf..", "..fFFFFFFFFFFf..", "...ffffffffff...", "................", "................", "................"],
  gearIcon: ["................", "................", "................", "................", "......MM........", "....MLLLLM......", "...MLLLLLLM.....", "..MMLLMMLLMM....", "..MMLLMMLLMM....", "...MLLLLLLM.....", "....MLLLLM......", "......MM........", "................", "................", "................", "................"],
  diceIcon: ["................", "................", "..KKKKKKKKKKKK..", "..KWWWWWWWWWWK..", "..KWWKKWWWWWWK..", "..KWWKKWWWWWWK..", "..KWWWWWWWWWWK..", "..KWWWWKKWWWWK..", "..KWWWWKKWWWWK..", "..KWWWWWWWWWWK..", "..KWWWWWWWKKWK..", "..KWWWWWWWKKWK..", "..KWWWWWWWWWWK..", "..KKKKKKKKKKKK..", "................", "................"],
  toolSeed: ["................", "................", "................", "...qqqqqqqqqq...", "...qccccccccq...", "...qdddGGdddq...", "...qddGGGGddq...", "...qdddDDdddq...", "...qdddDDdddq...", "...qddeeeeddq...", "...qddddddddq...", "...qqqqqqqqqq...", "................", "................", "................", "................"],
  toolWater: ["................", "................", "................", "..........uu....", ".........u..u...", "..u..uuuuu...u..", "..uu.ukkbbu..u..", ".B.uuubbbbu.u...", "....ubbbbbbuu...", "....ubbbbbbu....", "....ubbbbbbu....", "....uibbbbiu....", ".....uuuuuu.....", "................", "................", "................"],
  toolFert: ["................", "................", "................", "......qq........", ".....q..q.......", "....qaaaaq......", "...qaaaaaaq.....", "..qaaGGaaaaq....", "..qaaGGaaaaq....", "..qaaaaaeaaq....", "..qaeaaaaaaq....", "...qaaaaaaq.....", "....qqqqqq......", "................", "................", "................"],
  toolHarvest: ["................", "................", "................", "................", "................", "................", "...FF.OO.GG.....", "..qqqqqqqqqq....", "...qacacacaq....", "...qcacacacq....", "....qacacaq.....", "....qcacacq.....", ".....qqqqq......", "................", "................", "................"],
  mapIcon: ["................", ".KKKKKKKKKKKKKK.", "KLLLWWLLLLLGGGLK", "KLLLWWKKKLLGGGLK", "KLLLWKRRRKLGGGLK", "KLLLWKRWRKLLLLLK", "KLLLWKRRRKLLLLLK", "KWWWWWKRKWWWWWWK", "KWWWWWWKWWWWWWWK", "KbbLWWLLLLLLLLLK", "KLbbLWWLLLLLLLLK", "KLLbbWWLLLLLGGLK", "KLLLbWWLLLLLGGLK", "KLLLLWWLLLLLLLLK", ".KKKKKKKKKKKKKK.", "................"],
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
  legendShard: ["................", "................", ".......x........", "......xOx.......", ".....xOWOx......", ".....xOOOx......", "....xOOWOOx.....", "....xOOOOOx.....", "...xOOWOOOOx....", "..UuxOOOOOxUu...", ".uUUxOOOOOxUUu..", ".uuuxxxxxxxuuu..", "..MMMMMMMMMMM...", "...MMMMMMMMM....", "................", "................"],
  emBang: ["................", "................", ".....ffff.......", ".....fpFf.......", ".....fFFf.......", ".....fFFf.......", ".....fFFf.......", ".....fFFf.......", "......ff........", "................", ".....ffff.......", ".....fFFf.......", ".....ffff.......", "................", "................", "................"],
  ticketNorm: ["................", "....ffffffff....", "...fFFFFFFFFf...", "...fFCCCCCCFf...", "..fFCCCCCCCCFf..", "..fFCCCCCCWCFf..", "..fFCCCCWWCCFf..", "..fFCCCCCCWCFf..", "..fFCCCCCCCCFf..", "..fFCCCCCCCCFf..", "...fFCCCCCCFf...", "...fFFFFFFFFf...", "....ffffffff....", "................", "................", "................"],
  ticketSpec: ["................", "....ffffffff....", "...ffffffffff...", "...fvVVVVVVvf...", "..fvVVVVVVVVvf..", "..fvVVVWWVVVvf..", "..fvVVWWWWVVvf..", "..fvVVVWWVVVvf..", "..fvVVVVVVVVvf..", "..fvVVVVVVVVvf..", "...fvVVVVVVvf...", "...ffffffffff...", "....ffffffff....", "................", "................", "................"],
  ticketSuper: ["................", "....ffffffff....", "...ffffffffff...", "...fxOOOOOOxf...", "..fxOOOOOOOOxf..", "..fxOOOWWOOOxf..", "..fxOOWWWWOOxf..", "..fxOOOWWOOOxf..", "..fxOOOOOOOOxf..", "..fxOOOOOOOOxf..", "...fxOOOOOOxf...", "...ffffffffff...", "....ffffffff....", "................", "................", "................"],
  gachaCapsuleNorm: ["................", ".....ffff.......", "...fCCCCCCf.....", "..fCCCCWCCCf....", "..fCCCCCCCCf....", "..ffffffffff....", "..fvvvvvvvvf....", "..fvvvvWvvvf....", "...fvvvvvvf.....", ".....ffff.......", "................", "................", "................", "................", "................", "................"],
  gachaRatesIcon: [
    "................",
    "................",
    "................",
    "................",
    "..LLLLLLLLLLLL..",
    "..LWWWWWWWWWWL..",
    "..LWWWWWWWbWWL..",
    "..LWWWWWfWbWWL..",
    "..LWWWGWfWbWWL..",
    "..LWWWGWfWbWWL..",
    "..LWWWGWfWbWWL..",
    "..LWWWWWWWWWWL..",
    "..LLLLLLLLLLLL..",
    "................",
    "................",
    "................"
  ],
  gachaCapsuleSpec: ["................", ".....ffff.......", "...fYYYYYYf.....", "..fYYYYWYYYf....", "..fYYYYYYYYf....", "..ffffffffff....", "..fvvvvvvvvf....", "..fvvvvWvvvf....", "...fvvvvvvf.....", ".....ffff.......", "................", "................", "................", "................", "................", "................"],
  gachapon: [
    ".............ffffff.............",
    "...........ffFFFFFFff...........",
    "..........fFFFFFFFFFFf..........",
    ".........fFFFFFFFFFFFFf.........",
    "........fFFFFFFFFFFFFFFf........",
    ".......fBBBBBBBBBBBBBBBBf.......",
    "......fBiiiBBBBBBBBBBBBBBf......",
    "......fBiiWiBBBBBBBBBBBBBf......",
    ".....fBBiiiiBBBBBBBBBBBBBBf.....",
    ".....fBBBBDGGDBBBBUCCUBBBBf.....",
    ".....fBBBBGWWGFnnFCWWCBBBBf.....",
    ".....fBBBBGGGGnWWnCCCCBBBBf.....",
    ".....fBBBBDGGDnnnnUCCUBBBBf.....",
    ".....fBBfFFfDEFnnFOQdvvdBBf.....",
    ".....fBBFWWFEWWEOWWOvWWvBBf.....",
    "......fBFFFFEEEEOOOOvvvvBf......",
    "......fBfFFfDEEDQOOQdvvdBf......",
    ".......fbbbbbbbbbbbbbbbbf.......",
    "......ffffffffffffffffffff......",
    "......fFFFFFFFFFFFFFFFFFFf......",
    "......fFFFFFFFFFFFFFFFFFFf......",
    "......fFFFFFFFFFFFFFFFFFFf......",
    ".....fFFFFFFFMMMMMMFFFFFFFf.....",
    ".....fFFFFFFMMLLLLMMFFFFFFf.....",
    ".....fFFFFFFMLLWWLLMFFFFFFf.....",
    ".....fFFFFFFMLLWWLLMFFFFFFf.....",
    ".....fFFFFFFMMLLLLMMFFFFFFf.....",
    ".....fFFFFFFFMMMMMMFFFFFFFf.....",
    ".....fFFFFFFMMMMMMMMFFFFFFf.....",
    ".....fFFFFFFMKKKKKKMFFFFFFf.....",
    ".....fFFFFFFMKKKKKKMFFFFFFf.....",
    ".....ffffffffffffffffffffff....."
  ],
  dungeonGate: [
    "................",
    "....MMMMMMMM....",
    "...MLLLLLLLLM...",
    "..MLLMCMMCMLLM..",
    "..MLMvvvvvvMLM..",
    "..MLvVuuuuVvLM..",
    "..MLvVuBKuVvLM..",
    "..MLvVKuuKVvLM..",
    "..MLvVuuWKVvLM..",
    "..MLvVKuuuVvLM..",
    "..MLvVKKuBVvLM..",
    "..MLvVuKKuVvLM..",
    "..MLvVuuuuVvLM..",
    "..MLMvvvvvvMLM..",
    ".MMLMvvvvvvMLMM.",
    ".MMMMvvvvvvMMMM."
  ],
  fireball: [
    "................",
    ".......qq.......",
    "......qQQq......",
    ".....qQOOQq.....",
    "....qQOhhOQq....",
    "....qQOhhOQq....",
    ".....qQOOQq.....",
    "......qQQq......",
    ".......qq.......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],
  iceball: [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "uu..............",
    "ubuu............",
    "ubWBbuuu........",
    "uBWWWWBBbuu.....",
    "uBWWWWWWWBBBbuuu",
    "uBWWWWBBbuuu....",
    "ubWBbuu.........",
    "ubu.............",
    "uu.............."
  ],
  lightning: [
    "........C.......",
    ".......WC.......",
    "......WWC.......",
    ".....WWCC.......",
    "....WWCC........",
    "...WWCC.........",
    "..WWWWWWWWC.....",
    "...CCCCCWWC.....",
    ".......WWC......",
    "......WWC.......",
    ".....WWC........",
    "....WWC.........",
    "...WC...........",
    "..C.............",
    "................",
    "................"
  ],
  arrow: [
    "................",
    ".......W........",
    "......LWL.......",
    "......LWL.......",
    "......LWL.......",
    "......LWL.......",
    ".....LLWLL......",
    ".....MMWMM......",
    ".....MMWMM......",
    "......MWM.......",
    "......MWM.......",
    ".......M........",
    "................",
    "................",
    "................",
    "................"
  ],
  leafBolt: [
    "................",
    "..............E.",
    ".............EGE",
    "...........EGGDE",
    ".........EGGGDE.",
    ".......EGGGGDE..",
    ".....EGGGGGDE...",
    "...EGGGGGGDE....",
    "..EGGGGGGDE.....",
    ".EGGGGGGDE......",
    "EGGGGGGDE.......",
    "EGGGGGDE........",
    ".EDGGDE.........",
    "..EDDE..........",
    "...EE...........",
    "................"
  ],
  holyLight: [
    ".......C........",
    ".......W........",
    "......CWC.......",
    "...C..CWC..C....",
    "...WCCWWWCCW....",
    "...C..CWC..C....",
    "......CWC.......",
    ".......W........",
    ".......C........",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],
  waterball: [
    "................",
    ".......uu.......",
    "......uWWu......",
    ".....uWbbu......",
    "....uWbbbbWu....",
    "...uWbbbbbbWu...",
    "...uWbbbbbbWu...",
    "....uWbbbbWu....",
    ".....uuuuuu.....",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],
  threeSlimesWalking: [
    "................................",
    "...........WW...................",
    ".........WWWWWW.................",
    "........WWWWWWWW.........W......",
    ".........WWWWWW........WWWWW....",
    "........................WWW.....",
    "................................",
    "..................FFFFFF........",
    "................FFppppFFFF......",
    "...............FppppppppppF.....",
    "..............FppppWppWppppF....",
    "..............FppppKppKppppF....",
    "..............FppppppppppppF....",
    ".....EEEEEE....FppppppppppF.....",
    "...EEEEEEEEEE...FFFFFFFFFF......",
    ".EEEEEEEEEEEEE..................",
    "EEEEEbbbbbbEEEEEEEEEEEGGGGGGEEE.",
    "EEEbbBBBBbbbbEEEEEEGGGEEEEGGGGEE",
    "EEbBBBBBBBBBbbEEEEEGEEEEEEEEEEGE",
    "EabBBBBWBBWBBBbbeeGEEEEWEEWEEEEG",
    "aabBBBBKBBKBBBbbaaeGEEEEKEEKEEEG",
    "aabBBBBBBBBBBBbbaaeGEEEEEEEEEEEG",
    "eeabBBBBBBBBBbbcceaeGEEEEEEEEEEG",
    "cceeebbbbbbbbbbcceeaaeGGGGGGGGGG",
    "cccceeeeeeeeeeccMMMMMcaaaeeeeeaa",
    "SccccceeTTeccSSMMMMMMMeeccaceeec",
    "SSScceeeTTeeSSSSMMMMMceccceeeccc",
    "TSSScceeeeeSSSSSTTSScccccccccccS",
    "TTTSSccceecSSTTTTTSSSccSccccSSSS",
    "aTTTSSSSSSSSSTTaTTTTSSSSSSSSSSST",
    "aaTTTTTTTTTTTTaaaaTTTTTTTTTTTTTa",
    "aaaaaTTTTTTTaaaaaaaaaTTTTTTTaaaa"
  ],
  swordIcon: [
    ".............KK.",
    "............KWKK",
    "...........KWLMK",
    "..........KWLMK.",
    ".........KWLMK..",
    "........KWLMK...",
    ".......KWLMK....",
    "......KWLMK.....",
    "...KKKWLMK......",
    "...KCCKMK.......",
    "...KCCCK........",
    "...KsCCK........",
    "..KsKKKK........",
    ".KRK............",
    "..K.............",
    "................"
  ],
  coldBreath: [
    "................",
    "................",
    ".............u..",
    "...........WuW..",
    ".........Wu.Wu..",
    ".......WuuWuu...",
    ".....WuuuWuuW...",
    "....Wuu.uuW.....",
    ".....WuuuWuuW...",
    ".......WuuWuu...",
    ".........Wu.Wu..",
    "...........WuW..",
    ".............u..",
    "................",
    "................",
    "................"
  ],
  starBolt: [
    "................",
    ".......W........",
    "......WCW.......",
    ".....WCCCW......",
    "....WCOCOCW.....",
    "...WCOCOOOCW....",
    "..WCOCOOOCOCW...",
    ".WCCCOOCOOOCCW..",
    "..WCOCOOOCOCW...",
    "...WCOCOOOCW....",
    "....WCOCOCW.....",
    ".....WCCCW......",
    "......WCW.......",
    ".......W........",
    "................",
    "................"
  ],
  slashFx: [
    "................",
    "............W...",
    "..........WW....",
    "........WWW.....",
    "......WWW.......",
    "....WWW.........",
    "..WWW...........",
    "W.............W.",
    ".W..........WW..",
    "..W.......WW....",
    "...W....WW......",
    "....W.WW........",
    ".....W..........",
    "................",
    "................",
    "................"
  ],
  biteFx: [
    "................",
    "....L......L....",
    "...LWL....LWL...",
    "..LWWL....LWWL..",
    "..LWLL....LLWL..",
    "...LL......LL...",
    "................",
    "................",
    "...LL......LL...",
    "..LWLL....LLWL..",
    "..LWWL....LWWL..",
    "...LWL....LWL...",
    "....L......L....",
    "................",
    "................",
    "................"
  ],
  smashFx: [
    "................",
    "...Q........Q...",
    "....Q......Q....",
    ".....Q....Q.....",
    "......QQQQ......",
    "..Q...QOOQ...Q..",
    "...Q.QOOOOQ.Q...",
    "....QQOOOOQQ....",
    "....QQOOOOQQ....",
    "...Q.QOOOOQ.Q...",
    "..Q...QOOQ...Q..",
    "......QQQQ......",
    ".....Q....Q.....",
    "....Q......Q....",
    "...Q........Q...",
    "................"
  ],
  healFx: [
    "................",
    "................",
    ".......F........",
    "......FpF.......",
    ".....FpWpF......",
    "....FpWWWpF.....",
    ".....FpWpF......",
    "......FpF.......",
    ".......F........",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],
  shieldFx: [
    "................",
    "...CCCCCCCCCC...",
    "..CWBBBBBBBBWC..",
    ".CWBbbbbbbbbBWC.",
    ".CWBbbbWWbbbBWC.",
    ".CWBbbWWWWbbBWC.",
    ".CWBbbbWWbbbBWC.",
    ".CWBbbbbbbbbBWC.",
    "..CWBbbbbbbBWC..",
    "...CWBbbbbBWC...",
    "....CWBbbBWC....",
    ".....CWBBWC.....",
    "......CWWC......",
    ".......CC.......",
    "................",
    "................"
  ],
  stunFx: [
    ".......C........",
    "......CWC.......",
    "...CCWWWWWCC....",
    "....CCWWWCC.....",
    "......CWC.......",
    ".......C........",
    "................",
    "................",
    ".......C........",
    "......CWC.......",
    "...CCWWWWWCC....",
    "....CCWWWCC.....",
    "......CWC.......",
    ".......C........",
    "................",
    "................"
  ],
  snowball: [
    "................",
    ".......WW.......",
    "......WbbW......",
    ".....WbBBbW.....",
    "....WbBWWbBW....",
    "....WbBWWbBW....",
    ".....WbBBbW.....",
    "......WbbW......",
    ".......WW.......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],
  shadowBolt: [
    "................",
    ".......v........",
    "......vVv.......",
    "....vvVVVvv.....",
    "...vVVVVVVVv....",
    "....vvVVVvv.....",
    "......vVv.......",
    ".......v........",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],
  rainbowBolt: [
    "................",
    "..........R.....",
    "........ROR.....",
    "......ROCOR.....",
    "....ROCECOR.....",
    "..ROCEbECOR.....",
    "ROCEbVbECOR.....",
    "ROCEbVbECOR.....",
    "..ROCEbECOR.....",
    "....ROCECOR.....",
    "......ROCOR.....",
    "........ROR.....",
    "..........R.....",
    "................",
    "................",
    "................"
  ],
  emLock: [
    "......LLLL......",
    ".....L....L.....",
    "....L......L....",
    "....L......L....",
    "....L......L....",
    "...CCCCCCCCCC...",
    "...CCCCCCCCCC...",
    "...CCCKKKKCCC...",
    "...CCCKKKKCCC...",
    "...CCCCKKCCCC...",
    "...CCCCKKCCCC...",
    "...CCCCCCCCCC...",
    "................",
    "................",
    "................",
    "................"
  ],
  heartFx: [
    "................",
    "................",
    "...FFF....FFF...",
    "..FFFFF..FFFFF..",
    ".FFFFFFFFFFFFFF.",
    ".FFFFFFFFFFFFFF.",
    ".FFFFFFFFFFFFFF.",
    "..FFFFFFFFFFFF..",
    "...FFFFFFFFFF...",
    "....FFFFFFFF....",
    ".....FFFFFF.....",
    "......FFFF......",
    ".......FF.......",
    "................",
    "................",
    "................"
  ],
  scytheFx: [
    ".........WWWWW..",
    ".......WWLLLLq..",
    "......WLLL...q..",
    ".....WLL....q...",
    "....WLL....q....",
    "...WL.....q.....",
    "...W.....q......",
    "..W.....q.......",
    ".......q........",
    "......q.........",
    ".....q..........",
    "....q...........",
    "...q............",
    "..q.............",
    ".q..............",
    "q..............."
  ],
  skullFx: [
    "................",
    "................",
    ".....WWWWWW.....",
    "...WWWWWWWWWW...",
    "..WWWWWWWWWWWW..",
    "..WWWKKWWWWKKW..",
    "..WWKKKKWWKKKK..",
    "..WWKKKKWWKKKK..",
    "..WWWKKWWWWKKW..",
    "...WWWWWWWWWW...",
    "....WWWWWWWW....",
    "....WW.WW.WW....",
    "....W..WW..W....",
    "................",
    "................",
    "................"
  ],
  sugarFx: [
    "................",
    "................",
    "................",
    ".......WW.......",
    "....W.WFFW.W....",
    "...WpWWFFWWpW...",
    "..WppWFFFFWppW..",
    "...WpWWFFWWpW...",
    "....W.WFFW.W....",
    ".......WW.......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],
  bloodFx: [
    "................",
    ".......f........",
    "......fff.......",
    ".....fffff......",
    "....fffffff.....",
    "...fffffffff....",
    "...fffffffff....",
    "...fffffffff....",
    "....fffffff.....",
    ".....fffff......",
    "......fff.......",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],
  dispelFx: [
    "................",
    "....B......B....",
    "........B.......",
    "..B...B...B...B.",
    ".......W........",
    "....B.WWW.B.....",
    ".....WWWW.......",
    "..B...WWW...B...",
    ".......W........",
    "....B.....B.....",
    "........B.......",
    "..B...B...B...B.",
    "................",
    "................",
    "................",
    "................"
  ],
  blindFx: [
    "................",
    "................",
    "......MMM.......",
    "....MMMMMMM.....",
    "...MMMMMMMMM....",
    "..MMKKMMMKKMM...",
    ".MMKKKKMKKKKMM..",
    ".MMKKKKMKKKKMM..",
    "..MMKKMMMKKMM...",
    "...MMMMMMMMM....",
    "....MMMMMMM.....",
    "......MMM.......",
    "................",
    "................",
    "................",
    "................"
  ]
};
/* Nếu bảng màu thiếu màu xanh k/i trong toolWater thì bù vào */
P.k = P.k || '#c4e3f0'; P.i = P.i || '#a9cede';
/* ===== Chuyển bộ sưu tập bé tròn (14+1): namespace riêng, tránh đụng chữ cái với bảng màu của game ===== */
export const PET_P = {
  B: '#9ed8f2', b: '#5fa8cc', W: '#fffdf4', K: '#3a2c22', n: '#ffb0bc', '3': '#4a7ba6',   // '3' = ngũ quan của slime xanh (xanh xám, thay cho K nâu đen gốc)
  V: '#b48ae0', v: '#8a5cc0',
  p: '#ffb8c4', F: '#e06578', f: '#a83a52',
  o: '#e8963a', t: '#b0641e',
  A: '#f4e8d8', z: '#d9c5aa',
  N: '#5c5c6a', L: '#b8b0a2', M: '#8a8274',
  C: '#f2c231', U: '#bf8a1a',
  E: '#fff5dc', e: '#d9cfe5', I: '#cbeaf2',
  G: '#f6cf62', g: '#bd822d',
  D: '#49315f', d: '#6f4a89', J: '#9b70ad',
  R: '#9569a6', r: '#c198ca', X: '#fff2bd',
  T: '#8b5936', S: '#d99a43', Q: '#76545f',
  H: '#56649d', h: '#8492c7', Y: '#f5d76d', y: '#bd923b',
  O: '#fffaf0', q: '#cfc5df', Z: '#72d4c7', c: '#3fa6a5', a: '#bff3df',
  k: '#688f57', l: '#a6cb7d', i: '#c8d8f0', j: '#8296c9', x: '#8e6bad',
  m: '#d9bd6f', u: '#dcf3e7', s: '#92c4b0'
};
const PET_SPR = {
  slime: [
    "................", "................", "................", "................",
    ".....BBBBBB.....", "....BBBBBBBB....", "...BBWWBBBBBB...", "..BBWWBBBBBBBB..",
    "..BBBBBBBBBBBB..", "..BB33BBBB33BB..", ".BBBBBBBBBBBBBB.", ".BnBBBB33BBBBnB.",
    ".BBBBBBBBBBBBBB.", ".bBBBBBBBBBBBBb.", "..bbbbbbbbbbbb..", "................"],
  slimePink: [
    "................", "................", "................", "................",
    ".....pppppp.....", "....pppppppp....", "...ppWWpppppp...", "..ppWWpppppppp..",
    "..pppppppppppp..", "..ppffppppffpp..", ".pppppppppppppp.", ".pFppppffppppFp.",
    ".pppppppppppppp.", ".FppppppppppppF.", "..FFFFFFFFFFFF..", "................"],
  peach_soda: [
    ".......O........", "......OOO.......", ".......t........", ".....TTTTTT.....",
    "....TTTTTTTT....", "...TCTTTTTTTT...", "..TCTTTTTTTTTT..", ".TTTTDTTTTDTTTT.",
    ".TTPPTTDDTTPPTT.", ".TTTTTTTTTTTTTT.", "..tTTTTTTTTTTt..", ".tTT.tTTTT.tTTt.",
    "tTt..tTTt..tTTt.", ".t...tT.tT...tT.", ".....t...t......", "................"],
  octo: [
    "................", "................", "................", ".....VVVVVV.....",
    "....VVVVVVVV....", "...VVWWVVVVVV...", "...VWWVVVVVVV...", "..VVVVVVVVVVVV..",
    "..VVKKVVVVKKVV..", "..VVVVVVVVVVVV..", "..VnVVVKKVVVnV..", "..VVVVVVVVVVVV..",
    "..VVVVVVVVVVVV..", "..VV.VV..VV.VV..", "..vv.vv..vv.vv..", "................"],
  octoCream: [
    "................", "................", "................", ".....AAAAAA.....",
    "....AAAAAAAA....", "...AAWWAAAAAA...", "...AWWAAAAAAA...", "..AAAAAAAAAAAA..",
    "..AAAAAAAAAAAA..", "..AAKKAAAAKKAA..", "..AnAAAAAAAAnA..", "..AAAAAAAAAAAA..",
    "..AAAAAAAAAAAA..", "..AA.AA..AA.AA..", "..zz.zz..zz.zz..", "................"],
  jellyfish: [
    "......S.........", ".....SSS........", "......S.........", ".....IIIIII.....",
    "....IIIIIIII....", "...IIBIIIIIII...", "..IIBIIIIIIIII..", ".IIIIYIIIIYIIII.",
    ".IIPPIISSIIPPII.", ".IIIIIIIIIIIIII.", "..iIIIIIIIIIIi..", "...iiiiiiiiii...",
    "...LL..LL..LL...", "..LL...LL...LL..", "..L....L....L...", ".LL...LL...LL..."],
  mystery_blob: [
    "................", "...oo......oo...", "...ooo....ooo...", "...oooo..oooo...",
    "....oooooooo....", "...oooooooooo...", "..oooooooooooo..", "..ooKKooooKKoo..",
    "ttooooonnooooott", ".toooooooooooot.", ".onoooooooooono.", ".oooooooooooooo.",
    ".oooooooooooooo.", ".toooooooooooot.", "..tttttttttttt..", "................"],
  ghostBlob: [
    "................", ".......uu.......", "......uuuu......", ".....uuuuuu.....",
    "....uuWuuuuu....", "...uuWuuuuuuu...", "..uuuuuuuuuuuu..", ".uuuuQuuuuQuuuu.",
    ".unnuuuQQuuunnu.", ".uuuuuuuuuuuuuu.", "uuuuuuuuuuuuuuuu", "suuuuuuuuuuuuuus",
    ".suuuuuuuuuuuus.", "..suuuuuuuuuus..", "...suus..suus...", "................"],
  impBlob: [
    "................", "................", "....f......f....", "....ff....ff....",
    ".....FFFFFF.....", "....FFFFFFFF....", "...FFWWFFFFFF...", ".KFFWWFFFFFFFFK.",
    "KKFFFFFFFFFFFFKK", "..FFKKFFFFKKFF..", ".FFFFFFFFFFFFFF.", ".FnFFFFKKFFFFnF.",
    ".FFFFFFFFFFFFFF.", ".fFFFFFFFFFFFFf.", "..ffffffffffff..", "................"],
  angelBlob: [
    ".....gggggg.....", "...gGG....GGg...", ".....gggggg.....", "................",
    ".....EEEEEE.....", "....EEEEEEEE....", "...EEWEEEEEEE...", ".WEEWEEEEEEEEEW.",
    "WIEEEEEEEEEEEEEW", "IEEEQQEEEEQQEEEI", ".EnnEEEQQEEEnnE.", ".EEEEEEEEEEEEEE.",
    ".eEEEEEEEEEEEEe.", "..eEEEEEEEEEEe..", "...eeeeeeeeee...", "................"],
  witchBlob: [
    "...DDD..........", "..DDDJ..........", "...DDJDD........", "...DDdDDDD......",
    "..DDdddDDDDD....", ".DDDddGGdddDDD..", "DDDDDDDDDDDDDDDD", "...RRRRRRRRRR..T",
    "..RrRRRRRRRRRR.T", ".RrRRRRRRRRRRRR.", ".RRRXKRRRRDDRRR.", ".RnRRRRRGDRRRnR.",
    ".RRRRRRRRRRRRR.T", "..dRRRRRRRRRd.T.", "...ddddddddd.SSS", "...........SSSSS"],
  starBell: [
    "..Y....Y........", ".......Y....Y...", ".....YYYYY......", ".Y....YYY.......",
    "......Y.Y.......", ".....HHHHHH.....", "....HHHHHHHH....", "...HHhHHHHHHH...",
    "..HHhHHHHHHHHH..", "..HHHHHHHHHHHH..", ".HHHmmHHHHmmHHH.", ".HYHHHHHHHHHHYH.",
    ".HHHHHHHHHHHHHH.", ".hHHHHHHHHHHHHh.", "..hHHHHHHHHHHh..", "...hhhhhhhhhh..."],
  cloudMallow: [
    "................", "................", "......OOOO......", "....OOOOOOOO....",
    "..OOOOOOOOOOOO..", ".OOOWOOOOOOOOOO.", "OOOOOOOOOOOOOOOO", "OOOOQOOOOOOQOOOO",
    "OOnOOOOQQOOOOnOO", "OOOOOOOOOOOOOOOO", ".qOOOOOOOOOOOOq.", "..qqOOqqqqOOqq..",
    "....I......I....", "....II....II....", ".....I....I.....", "................"],
  dewSprout: [
    ".....kk..kk.....", "....kllkkllk....", "......kk........", ".......ZZ.......",
    "......ZZZZ......", ".....ZZZZZZ.....", "....ZZaZZZZZ....", "...ZZaZZZZZZZ...",
    "..ZZZZZZZZZZZZ..", ".ZZZZQZZZZQZZZZ.", ".ZnZZZZQZZZZZnZ.", ".ZZZZZZZZZZZZZZ.",
    ".cZZZZZZZZZZZZc.", "..cZZZZZZZZZZc..", "...cccccccccc...", "................"],
  prismBlob: [
    "..j..........j..", ".jij........jij.", "..j..........j..", "......xxxx.....y",
    "y...xxiiiixx..yY", "Yy.xiiiiiiiix..y", "y.xiiiiiiiiiix..", ".xiiiiiiiiiiiix.",
    ".xiiQQiiiiQQiix.", ".xiriiiiQiiiirx.", ".xiiiiiiiiiiiix.", "..xiiiiiiiiix...",
    "...xiiiiiiix....", "....xxxxxxxx....", "......jjjj......", "................"],
  penguin: [
    "................", "................", ".....333333.....", "....33WWWW33....",
    "...33WWWWWW33...", "...3WKKWWKKW3...", "..33WnWooWnW33..", "..33WWWWWWWW33..",
    "..33WWWWWWWW33..", "...33WWWWWW33...", "....33333333....", ".....oo..oo.....",
    "................", "................", "................", "................"]
};
/* ===== v0.8c (#43): hệ thống da chuyển sắc (bộ sưu tập codex 0718) —— màu phủ theo từng sprite, giá trị có thể là màu đơn hoặc gradient tuyến tính ===== */
const petLinear = (x1, y1, x2, y2, stops) => ({ type: 'linear', x1, y1, x2, y2, stops });
const PET_FX = {
  mystery_blob: {                                            // Bé bí ẩn: bản cam dịu thứ hai (wen chốt: pha sữa giảm độ tinh khiết nhưng giữ dòng máu cam; bản oải hương để dành cho kho da DLC)
    o: petLinear(1, 2, 15, 14, [['0%', '#ffe0a6'], ['46%', '#f7b374'], ['100%', '#ea9060']]),
    t: petLinear(0, 7, 16, 15, [['0%', '#d18a58'], ['100%', '#b06a44']]),
    K: '#6b4548', n: '#ffcdd8',
  },
  peach_soda: {
    T: petLinear(1, 2, 15, 14, [['0%', '#ffe8a6'], ['35%', '#ffbdc9'], ['64%', '#ff94bf'], ['100%', '#c99bf5']]),
    t: petLinear(0, 4, 16, 15, [['0%', '#f28bc2'], ['100%', '#9b78de']]),
    C: '#effffb', D: '#5b4568', P: '#65e0cf',
    O: petLinear(0, 0, 15, 3, [['0%', '#b9fff3'], ['100%', '#9ba7ff']]),
  },
  jellyfish: {
    I: petLinear(1, 2, 15, 14, [['0%', '#c8f4ff'], ['28%', '#8cddff'], ['62%', '#58b7f2'], ['100%', '#6576dc']]),
    i: petLinear(0, 7, 16, 15, [['0%', '#579dd1'], ['100%', '#5459aa']]),
    B: '#effcff', Y: '#fff0a6', P: '#ff8fca',
    S: petLinear(0, 0, 16, 4, [['0%', '#fff6aa'], ['100%', '#a8dbff']]),
    L: petLinear(0, 11, 16, 16, [['0%', '#bdeaff'], ['100%', '#8d90ee']]),
  },
};
const petCache = new Map();
export function petSVG(name, px) {
  const key = name + '@' + px;
  if (petCache.has(key)) return petCache.get(key);
  const map = PET_SPR[name]; if (!map) return '';
  const fx = PET_FX[name];
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const fills = {};
  if (fx) for (const ch in fx) {
    const v = fx[ch];
    if (v && typeof v === 'object') {
      const grad = ctx.createLinearGradient(v.x1, v.y1, v.x2, v.y2);
      v.stops.forEach(s => grad.addColorStop(parseFloat(s[0]) / 100, s[1]));
      fills[ch] = grad;
    } else fills[ch] = v;
  }
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const c = fills[ch] || PET_P[ch];
      if (c) {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
  const out = `<img draggable="false" width="${px}" height="${px}" src="${canvas.toDataURL('image/png')}" style="display:block; image-rendering:pixelated;" />`;
  petCache.set(key, out);
  return out;
}
/* ===== Bảng dữ liệu thú cưng (giá là chỗ giữ chỗ để test; page = trang mở khoá, 2/3 cần vé tương ứng) ===== */
export const PETS = {
  /* —— Trang 1 —— */
  slime: { name: 'Slime xanh', page: 1, price: 0, starter: true, cry: ['Bụp bụp~', 'Bựppp!', 'Grù grù…', 'Bụp?', 'Nhảy nhảy!'], desc: 'Loại tìm kho báu · bé tròn tổ tiên, bạn đồng hành từ đầu' },
  octo: { name: 'Bạch tuộc tím', page: 1, price: 500, cry: ['Ục bốp?', 'Ục ực!', 'Chíu mi!', 'Bóp bóp…', 'Ục bốp bốp!'], desc: 'Loại tìm kho báu · thích chồng lên đầu người khác' },
  slimePink: { name: 'Slime hồng', page: 1, price: 600, cry: ['Bụp hì~', 'Bụp bụp!', 'Hì hì…', 'Bụp chíu~'], desc: 'Loại tìm kho báu · vị dâu (nhưng không ăn được)' },
  octoCream: { name: 'Bạch tuộc kem', page: 1, price: 700, cry: ['Bốp…', 'Ục…', '(chậm rì rì) bóp~'], desc: 'Loại tìm kho báu · bậc thầy nguỵ trang, trùng màu với bảng điều khiển' },
  dewSprout: { job: 'plant', name: 'Bé mầm sương', page: 1, price: 1200, cry: ['Tí tách~', 'Mầm!', '(đội lá lên)'], desc: 'Loại làm việc · chọc một cái là gieo khắp ruộng, hạt xuống đất là nảy mầm' },
  cloudMallow: { job: 'water', name: 'Bé bông mây', page: 1, price: 1500, cry: ['Bông bông~', 'Vù——', '(bay lơ lửng)'], desc: 'Loại làm việc · ra sân là mây mưa nhỏ tự động tưới' },
  /* —— Trang 2 (vé vùng nước) —— */
  ghostBlob: { name: 'Bé ma nhỏ', page: 2, price: 1500, cry: ['Uuu~', 'Bay bay…', '(xuyên qua tay bạn)'], desc: 'Loại tìm kho báu · bay được vào những chỗ người khác không vào nổi' },
  mystery_blob: { job: 'fert', name: 'Bé bí ẩn', page: 2, price: 1800, cry: ['……?', '(nghiêng đầu)', '?!'], desc: 'Loại làm việc · chọc một cái là bón phân hàng loạt · phân của nó bón ra cái gì thì không ai đoán nổi' },
  jellyfish: { job: 'harvest', name: 'Bé sứa xoăn', page: 2, price: 2200, cry: ['Ục grù~', '(cuộn cuộn xúc tu)', 'Bốp ục!'], desc: 'Loại làm việc · chọc một cái là xúc tu nhẹ nhàng cuộn rau chín vào balo' },
  impBlob: { name: 'Bé quỷ nhỏ', page: 2, price: 3000, cry: ['Hì hì.', 'Hư!', '(giấu cái gì đó đi)'], desc: 'Loại tìm kho báu · khi tìm kho báu sẽ tha về hạt giống bí ẩn đen sì' },
  angelBlob: { name: 'Bé thiên thần', page: 2, price: 3000, cry: ['Ting~', '(phát sáng dịu dàng)', 'Chúc phúc cho bạn.'], desc: 'Loại tìm kho báu · khi tìm kho báu sẽ ngậm về hạt giống bí ẩn ánh lấp lánh' },
  /* —— Trang 3 (vé khu mỏ) —— */
  prismBlob: { name: 'Bé lăng quang', page: 3, price: 8000, cry: ['Keng~', '(khúc xạ ra một dải cầu vồng)', 'Kengg!'], desc: 'Loại sản xuất · tìm kho báu mang về mảnh lăng quang (đổi được một đơn ở trang đơn hàng phù thuỷ)' },
  starBell: { name: 'Bé chuông sao', page: 3, price: 8000, cry: ['Leng keng~', '☆!', '(lắc lắc nhẹ)'], desc: 'Loại sản xuất · tìm kho báu rung rơi mảnh ngôi sao (triệu hồi được phù thuỷ tròn)' },
  /* —— Át chủ bài (page 1 = không cần vé, đủ tiền là mang về được, thuần tuý thuế dễ thương) —— */
  peach_soda: { name: 'Bé soda đào', page: 1, price: 9999, cry: ['Bốp——!', '(nổi một bong bóng nhỏ)', 'Xì~', '(vị ngòn ngọt)'], desc: 'Loại tìm kho báu · tinh linh soda vị đào · dễ thương quá mức nên đắt nhất' },
  penguin: { name: 'Chim cánh cụt', page: 1, price: 100000, cry: ['Pingu!', 'Núp núp~', 'Trượt tuyết nào!', 'Cánh cụt!'], desc: 'Loại đặc biệt · AFK mỗi 1 tiếng mang về 1 vé gacha ngẫu nhiên (70% vé thường, 30% vé đặc biệt)' },
};
export const PASSES = {
  water: { name: 'Vé vùng nước', price: 6000, desc: 'Mở khoá ruộng vùng nước (trang 2) + quyền mua bé tròn trang 2 và hạt giống thuỷ sinh, tặng kèm ô ruộng nổi đầu tiên' },
  mine: { name: 'Vé khu mỏ', price: 35000, desc: 'Mở khoá ruộng khu mỏ (trang 3) + quyền mua bé tròn trang 3 và hạt giống khu mỏ, tặng kèm luống ươm đầu tiên' },
};
/* ===== v0.8: cây trồng mới trang 2-3 + tinh linh hạt giống bí ẩn (chuyển từ bản thiết kế chốt; namespace riêng, mỗi hình mang bảng màu của mình) ===== */
const C2 = {
  chuncai: {
    p: { g: '#2e6a50', G: '#4d9a6e', W: '#a8d8bc', o: '#8a5540' }, m: [
      '................', '................', '....gg....gg....', '...gGGg..gGGWg..', '...gGGGg.gGGg...', '....gg....gg....', '.......o........', '..gg...o...gg...', '.gGGWg.o.gGGg...', '.gGGg..o.gGWGg..', '..gg...o..gg....', '................', '................', '................', '................', '................']
  },
  biqi: {
    p: { t: '#4d7a26', T: '#79b544', m: '#3f2a20', M: '#6a4534', W: '#f2e8d8' }, m: [
      '....t..T..t.....', '....t.T..t......', '.....tT.tT......', '....T.t.t.......', '.....t.tT.......', '......ttt.......', '.......t........', '.......t........', '.......t........', '......mmm.......', '..mmmmMMMm.mmm..', '.mMMWmMMMMmMMm..', '.mMMMmMMMMmMWm..', '..mmm.mmmm.mm...', '................', '................']
  },
  lingjiao: {
    p: { g: '#2e6a50', G: '#4d9a6e', K: '#241b2e', P: '#5a3f66', W: '#b79ae0' }, m: [
      '................', '.......gg.......', '....ggGGGGgg....', '...gGGgGGgGGg...', '....ggGGGGgg....', '.......gg.......', '................', '................', '...KK......KK...', '....KK....KK....', '.....KKKKKK.....', '....KPPKKPPK....', '....KPPWPPPK....', '.....KKKKKK.....', '................', '................']
  },
  jiaobai: {
    p: { g: '#3f7a30', G: '#6aab44', W: '#f6f2e2', s: '#d9d0b8' }, m: [
      '....g....g......', '...gG...gG.g....', '...gG..gGG.Gg...', '..gGG..gGG.Gg...', '..gGG.gGGg.GG...', '..gGGggGGggGG...', '..gGGgGGGgGGG...', '..gGGgGGGgGGg...', '..sWWsWWWsWWs...', '..sWWsWWWsWWs...', '..sWWsWWWsWWs...', '..sWWsWWWsWWs...', '................', '................', '................', '................']
  },
  lianou: {
    p: { f: '#c25a78', P: '#f5aec2', W: '#fff0f5', g: '#2e6a50', G: '#4d9a6e', B: '#245a40', o: '#e8dcc2', O: '#c2b090' }, m: [
      '......ff........', '.....fPPf.......', '....fPWWPf......', '..ffPPPPPPff....', '.fPPfPWWPfPPf...', '..fPPPPPPPPf....', '...ffPPPPff.....', '.....gGGg.......', '...gGGGGGGg.....', '..gGGGBGGGGg....', '...gGGGGGGg.....', '................', '...OooOooO......', '...OooOooO......', '....OOOOO.......', '................']
  },
  wujing: {
    p: { K: '#3f2a58', V: '#8a64c0', W: '#dcc8f5' }, m: [
      '.......K........', '......KVK.......', '..K...KVK...K...', '.KVK..KVK..KVK..', '.KVK.KKVKK.KVK..', '.KVWKKVWVKKVVK..', '..KVKKVVVKKVK...', '..KVVKVVVKVVK...', '...KKKVVVKKK....', '.....KVVVK......', '......KKK.......', '................', '................', '................', '................', '................']
  },
  starbush: {
    p: { b: '#2e5a34', B: '#4f8a55', s: '#ffd94d', S: '#fff2b0', t: '#8a6244', y: '#ffd94d' }, m: [
      '..y..........y..', '.....bbbbbb.....', '...bbBBBBBBbb...', '..bBBsBBBBBBBb..', '..bBsSsBBBBBBb..', '.bBBBsBBBBsBBBb.', '.bBBBBBBBsSsBBb.', '.bBBBBBsBBsBBBb.', '..bBBBsSsBBBBb..', '...bbBBsBBBbb...', '.....bbbbbb.....', '.y.....tt.....y.', '.......tt.......', '......t..t......', '................', '................']
  },
  gemflower: {
    p: { K: '#5a4268', r: '#d95a6a', R: '#f090a0', b: '#4a7ac2', B: '#8fb8ec', g: '#38a06a', G: '#7cd4a4', p: '#8a5cc0', P: '#c0a0e8', y: '#c89a38', Y: '#ffd94d', W: '#fff2b0', t: '#4d7a26', T: '#79b544' }, m: [
      '................', '......KrrK......', '.....KrRRrK.....', '.....KrRRrK.....', '..KKK.KrrK.KKK..', '.KbBBK.yy.KgGGK.', '.KbBBKyYWYKgGGK.', '..KKK.yYYy.KKK..', '.......yy.......', '.....KpPK.......', '....KpPPpK......', '....KpPPpK..T...', '.....KppK..T....', '......tt..T.....', '......ttT.......', '................']
  },
  opalvine: {
    p: { t: '#3f5a5a', T: '#5c8080', K: '#8a7a9a', o: '#f2ecf5', P: '#f5b8d0', C: '#8adbe0' }, m: [
      '......t.........', '...t..tt........', '...tt..t...t....', '....t..tt.tt....', '.KK..t..tt......', 'KooK..t....KK...', 'KoPCK.tt..KooK..', '.KK....t..KoCK..', '.......t...KK...', '....KK.t........', '...KooKt........', '...KoCPK........', '....KK.t........', '.......t........', '................', '................']
  },
  dragoncry: {
    p: { K: '#8a2a26', T: '#e8604a', t: '#c23c34', W: '#ffe0a0', g: '#3f7a30', G: '#6aab44' }, m: [
      '.......gg.......', '......gGGg......', '.......KK.......', '.....KKTTKK.....', '....KTtTTtTK....', '...KTTTTTTTTK...', '...KTtTWWtTTK...', '..KTTTWWWWTTTK..', '..KTtTTWWTTtTK..', '...KTTTTTTTTK...', '...KTtTTTTtTK...', '....KTTTTTTK....', '.....KKTTKK.....', '.......KK.......', '................', '................']
  },
  seedDark: {
    p: { K: '#1c1420', k: '#33263d', v: '#8a2a4a', a: '#5a3f78' }, m: [
      '................', '................', '.....K...K......', '.....KK.KK......', '......KkK.......', '.....KkkkK......', '....KkKkkkK.....', '....KkkkvkK.....', '....KkkkkkK.....', '.....KkkkK......', '......KKK.......', '................', '...a...a...a....', '................', '................', '................']
  },
  seedLight: {
    p: { h: '#ffe89a', y: '#c8a94a', Y: '#f5dfa0', W: '#fff8e0', s: '#ffd94d' }, m: [
      '................', '.....hh.hh......', '....h.....h.....', '................', '......yy........', '.....yYYy.......', '....yYWYYy......', '....yYYYYy......', '....yYYYYy......', '.....yYYy.......', '......yy........', '................', '...s....s...s...', '................', '................', '................']
  },
  /* —— v0.9b (#49): ba họ bí ẩn · kén mộng / cỏ chìa khoá / cây ăn thịt (bản thiết kế chốt) —— */
  dreamG: {
    p: { K: '#b8a890', W: '#f8f4ea', w: '#e4dcc8', s: '#d9cfc0', p: '#f5b8d0', t: '#8a6844', g: '#4d7a26' }, m: [
      '........t.......', '.......ts.......', '......s.s.......', '.....sKKs.......', '....KWWWWK......', '...KWwWWWWK.....', '..KWWWWWWWWK....', '..KWwWWWWwWK....', '..KWWWWWWWWK....', '..KWWwWWWWWK....', '...KWWWWwWK.....', '....KWWWWK......', '.....KKKK.......', '......p.........', '.......p........', '...g.......g....']
  },
  dreamW: {
    p: { K: '#4a7a94', B: '#bcdde8', b: '#94c2d4', W: '#eef8fa', d: '#7a94b8', o: '#d8ecf2' }, m: [
      '................', '......KKK.......', '....KKBBBK......', '...KBBWBBBK.....', '..KBBBBBBBBK....', '..KBBdddBBBK....', '.KBBddBddBBBK...', '.KBBdBBBdBBBK...', '.KBBddBddBBbK...', '..KBBdddBBbK....', '..KBBBBBBbbK....', '...KBBBBbbK.....', '....KKbbbK......', '......KKK.......', '..o.........o...', '......o.........']
  },
  dreamM: {
    p: { K: '#3f3a50', S: '#8d8398', s: '#6d657c', c: '#241f2c', O: '#ffd94d', o: '#ffb060', d: '#575070' }, m: [
      '................', '......KKK.......', '....KKSSSK......', '...KSSSSSSK.....', '..KSSsSSSSSK....', '..KSScSSSsSK....', '.KSSScOcSSSSK...', '.KSsScOOcSSSK...', '.KSSSScOcSsSK...', '..KSSSScSSSK....', '..KsSSSSSsSK....', '...KSSSSSSK.....', '....KKSSSK......', '......KKK.......', '...d.......d....', '................']
  },
  keyG: {
    p: { t: '#4d7a26', T: '#79b544', c: '#a8681f', C: '#d99a43', W: '#ffe9b8', g: '#79b544' }, m: [
      '...tt...........', '..t..tt.........', '..t....tt.......', '.tT......tt.....', '.tT........t....', '..t.......CCC...', '..t.......CWC...', '..t.......CCC...', '.tTt.......c....', '..t........c....', '..t........cC...', '..t........c....', '..t........cC...', '.gtg............', 'g.t..g..........', '................']
  },
  keyW: {
    p: { t: '#2e6a50', T: '#4d9a6e', c: '#3f7a5c', C: '#7cc4a4', W: '#c8ecd8', v: '#245a40', o: '#d8ecf2' }, m: [
      '...tt...........', '..t..tt.........', '..t....tt.......', '.tT......tt.....', '.tT........t....', '..t.......CCC...', '..t.......CWC...', '..t.......CCC...', '.tTt.......c....', '..t....o...cv...', '..t........cC...', '..t........cv...', '..t........cC...', '..t.............', '.o..............', '................']
  },
  keyM: {
    p: { t: '#b8862a', T: '#ffd94d', P: '#9a6ce0', p: '#c4a2e8', z: '#f0e4ff', s: '#ffd94d' }, m: [
      '...tt...........', '..t..tt.........', '..t....tt.......', '.tT......tt.....', '.tT........t....', '..t.......PpP...', '..t.......PzP...', '..t.......PPP...', '.tTt.......P....', '..t........P....', '..t........Pp...', '..t........P....', '..t........Pp...', '.sts....z.......', '..t.............', '................']
  },
  fangG: {
    p: { K: '#2e5a1e', G: '#6cb457', E: '#a4dc8c', R: '#c24a5a', W: '#fffdf4', t: '#4d7a26', g: '#79b544' }, m: [
      '....KKKK........', '..KKGGGGKK......', '.KGGEGGGGGK.....', '.KGGGGGGGGK.....', '..KGGGGGGK......', '...KRRRRK.......', '..W.W..W.W......', '...KRRRRK.......', '..KGGGGGGK......', '.KGGGGGGGGK.....', '.KGGEGGGGGK.....', '..KKGGGGKK..g...', '....KKKK.t.g....', '......t.t.......', '.......t........', '....g..t...g....']
  },
  fangW: {
    p: { K: '#6a2420', R: '#a83a35', r: '#c25a50', C: '#f2dfc0', D: '#2e1210', g: '#2e6a50', G: '#4d9a6e' }, m: [
      '.....KKKKK......', '...KKRRRRRKK....', '..KRRCRRRCRRK...', '.KRRRRrRrRRRK...', '.KRCRRKKKRRCK...', '.KRRRKDDDKRRK...', '.KRrKDDDDDKrK...', '.KRRRKDDDKRRK...', '.KRCRRKKKRRCK...', '.KRRRRrRrRRRK...', '..KRRCRRRCRRK...', '...KKRRRRRKK....', '.....KKKKK......', '..Gg.......gG...', '.GggG.....GggG..', '................']
  },
  fangM: {
    p: { K: '#1c1428', P: '#3a2a52', p: '#5a4278', F: '#8ae0ea', f: '#d8f8fc', O: '#ffb060', o: '#ffe0a0', t: '#2e2440' }, m: [
      '....KKKK........', '..KKPPPPKK......', '.KPPpPPPPPK.....', '.KPPPPPPPPK.....', '..KPPPPPPK......', '...KOOOOK.......', '..F.FoOF.F......', '..f.KOOK.f......', '..KPPPPPPK......', '.KPPPPPPPPK.....', '.KPPpPPPPPK.....', '..KKPPPPKK......', '....KKKK.t......', '......t.t.......', '.......t........', '....F..t...F....']
  },
  shardPrism: {
    p: { K: '#8ab8c8', k: '#4a8098', W: '#e8f8ff', w: '#c0e8f4', R: '#ff6060', G: '#60cc60', B: '#6090ff', Y: '#ffd940', P: '#c060e0', C: '#40d0d0' }, m: [
      '................', '..........R.....', '.....K..........', '....KWK..G......', '...KWwWK........', '..KWwwwWK...B...', '..KWwwwWK.......', '...KwwWK....Y...', '....KWK..P......', '.....K..........', '......C.........', '...R............', '........G.......', '................', '................', '................']
  },
  shardStar: {
    p: { K: '#6a4ab8', P: '#b094e0', p: '#d8c4ff', W: '#ffffff', o: '#ffd94d', y: '#fff4b0' }, m: [
      '................', '........o.......', '.......oyo......', '......oyyo......', '...ooooWooo.....', '..oPPPpWpKK.....', '..oKKKKK........', '...oooo.........', '................', '..........oo....', '.........oyo....', '........oWyo....', '.......oWpyo....', '........oooo....', '................', '................']
  },
  strawhat: {
    p: { K: '#a83a52', P: '#f7a6bd', p: '#ffd0dc', k: '#e07b96', Y: '#f5e0a8', y: '#e0be7a' }, m: [
      '................', '................', '................', '......KKKK......',
      '.....KYyYYK.....', '....KYYYYYYK....', '....KYYYYYYK....', '..KKKPPPPPPKKK..',
      '.KYYKPpPPPKYYYK.', 'KYyYYYYYYYYYYyYK', '.KKKKKKKKKKKKKK.', '.........kPk....',
      '..........kPk...', '................', '................', '................']
  },   // Huy hiệu mặt tiền: nón rơm ruy băng hồng (wen chốt, chỗ ký tên tác giả)
  strawberry: {
    p: { g: '#4d7a26', G: '#79b544', K: '#8a2a35', r: '#d94f5c', R: '#e8808e', y: '#ffe0a8' }, m: [
      '................', '................', '................', '................', '......G..g......', '.....gGGGGg.....', '.......GG.......', '.....KrrrrK.....', '....KrryrryK....', '....KrrrrrrK....', '....KryrrryK....', '.....KrrrrK.....', '......KrrK......', '.......KK.......', '................', '................']
  },
  strawberryW: {
    p: { g: '#2e6a50', G: '#4d9a6e', K: '#2e6a80', r: '#7fd4dd', R: '#b8ecf0', W: '#f0fcff' }, m: [
      '.....G..g.......', '....gGGGGg......', '......GG........', '....KrrrrK......', '...KrrWrrrK.....', '...KrRRrrrK.....', '...KrrrrRrK.....', '....KrrrrK......', '.....KrrK.......', '......KK........', '.......W........', '................', '................', '................', '................', '................']
  },
  strawberryM: {
    p: { g: '#5a3f78', G: '#8a5cc0', K: '#3a2258', r: '#9a6ac8', R: '#c4a2e8', W: '#e8d8f8' }, m: [
      '.....G..g.......', '....gGGGGg......', '......GG........', '....KrrrrK......', '...KrRrWrrK.....', '...KrrRrrrK.....', '...KRrrrRrK.....', '....KrrRrK......', '.....KrrK.......', '......KK........', '................', '................', '................', '................', '................', '................']
  },
};
export const DYNAMIC_SPR = {};
export function registerDynamicSprite(name, mapArray) {
  DYNAMIC_SPR[name] = mapArray;
}
const spriteCache = new Map();
export function spriteSVG(name, px) {
  const key = name + '@' + px;
  if (spriteCache.has(key)) return spriteCache.get(key);
  const map = SPR[name] || DYNAMIC_SPR[name] || (C2[name] && C2[name].m); if (!map) return '';
  const pal = DYNAMIC_SPR[name] ? GACHA_P : ((SPR[name]) ? P : C2[name].p);
  const canvas = document.createElement('canvas');
  canvas.width = map[0].length || 16;
  canvas.height = map.length || 16;
  const ctx = canvas.getContext('2d');
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = pal[row[x]];
      if (c) {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
  const out = `<img draggable="false" width="${px}" height="${px}" src="${canvas.toDataURL('image/png')}" style="display:block; image-rendering:pixelated; object-fit:contain;" />`;
  spriteCache.set(key, out);
  return out;
}
const tileCache = new Map();
export function tileURI(kind, seedNum) {
  const tkey = kind + '@' + seedNum;
  if (tileCache.has(tkey)) return tileCache.get(tkey);
  const out = buildTile(kind, seedNum);
  tileCache.set(tkey, out);
  return out;
}
/* v0.8: màu riêng cho nền đất trang 2-3 (W1 ruộng nổi đầm sen / M1 mạch quặng kim cương, bản thiết kế chốt) */
/* v0.8: màu riêng cho nền đất trang 2-3 (W1 ruộng nổi đầm sen / M1 mạch quặng kim cương, bản thiết kế chốt; W3 ruộng bậc thang khe suối thử xong bị loại #71) */
export const LP = {
  '8': '#8ec8d8', '~': '#b8e0ea', '-': '#79b4c6', '_': '#6faabf', '9': '#3f7290', '!': '#35617d',
  '6': '#5f5870', '^': '#6d657c', '&': '#4e4860', '7': '#433c54', '5': '#8ae0ea', '*': '#e8fcff', '%': '#5fc8d8', '#': '#3a3450',
  'l': '#5aa06a', 'L': '#7cc48a',
  '=': '#b9d194', '0': '#ffe9b8', '+': '#fff2b0'
};   // v1.0 G2: đốm cỏ nhạt (=, tránh h của bảng chính = cam bí ngô!) / cánh hoa vàng kem / nhuỵ vàng nhạt
function buildTile(kind, seedNum) {
  const rnd = mulberry32(seedNum);
  const base = { grass: '1', wet: 'w', soil: 'a', water: '8', wplot: '9', wplotwet: '!', mine: '6', mplot: '7', mplotwet: '#' }[kind] || 'a';
  const SZ = (kind === 'water' || kind === 'mine' || kind === 'grass') ? 96 : 32;   // v0.9/v1.0: nền đất cả ba trang đều dùng khung vẽ lớn
  const g = [];
  for (let y = 0; y < SZ; y++) g.push(new Array(SZ).fill(base));
  const blot = (cx, cy, rad, ch) => {                   // Hoạ tiết vòng tròn đậm nhạt của bản thiết kế
    cx |= 0; cy |= 0; rad |= 0;                         // Sửa: làm tròn tâm/bán kính, chỉ số thập phân sẽ làm nổ mảng
    for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) {
      if (i * i + j * j > rad * rad + rnd() * 2) continue;
      const x = ((cx + i) % SZ + SZ) % SZ, y = ((cy + j) % SZ + SZ) % SZ;   // Lấy dư kiểu vòng lại, lát nền không có đường ghép
      g[y][x] = ch;
    }
  };
  if (kind === 'grass') {                              // v1.0 G2 "thảm hoa dại": đốm cỏ dịu + lá cỏ + hoa dại nhỏ ba màu hồng/trắng/vàng
    for (let i = 0; i < 5; i++) blot(rnd() * SZ, rnd() * SZ, 4 + rnd() * 5, '=');
    for (let i = 0; i < 4; i++) blot(rnd() * SZ, rnd() * SZ, 3 + rnd() * 4, '2');
    for (let i = 0; i < 55; i++) { const x = (rnd() * SZ) | 0, y = (rnd() * (SZ - 1)) | 0; g[y][x] = '3'; g[y + 1][x] = '4'; }
    for (let i = 0; i < 30; i++) g[(rnd() * SZ) | 0][(rnd() * SZ) | 0] = '2';
    const combos = [['n', 'W'], ['W', '0'], ['C', '+']];
    for (let i = 0; i < 10; i++) {
      const fx = 2 + ((rnd() * (SZ - 4)) | 0), fy = 2 + ((rnd() * (SZ - 4)) | 0);
      const c = combos[(rnd() * 3) | 0];
      g[fy][fx] = c[0]; g[fy][fx + 1] = c[0]; g[fy + 1][fx] = c[0]; g[fy + 1][fx + 1] = c[1];
    }
  } else if (kind === 'water') {                        // W1 nước ngoài ruộng (khung vẽ lớn v0.9): đốm tròn đậm nhạt làm nền + ánh sóng + lá sen —— theo bản thiết kế
    for (let i = 0; i < 3; i++) blot(rnd() * SZ, rnd() * SZ, 6 + rnd() * 5, '-');   // Đốm nước lớn màu đậm (ít mà to)
    for (let i = 0; i < 4; i++) {                       // Vân nước nhạt: vòng tròn lớn khoét rỗng thành vành, trông như gợn sóng (tách biệt với đốm vụn đặc của khu mỏ)
      const cx = rnd() * SZ, cy = rnd() * SZ, r = 8 + ((rnd() * 5) | 0);
      blot(cx, cy, r, '~'); blot(cx, cy, r - 2, '8');
    }
    for (let i = 0; i < 55; i++) { const x = (rnd() * (SZ - 2)) | 0, y = (rnd() * SZ) | 0; g[y][x] = '~'; g[y][x + 1] = '~'; }
    for (let i = 0; i < 22; i++) g[(rnd() * SZ) | 0][(rnd() * SZ) | 0] = '_';
    for (let i = 0; i < 5; i++) { const x = 2 + ((rnd() * (SZ - 6)) | 0), y = 2 + ((rnd() * (SZ - 4)) | 0); g[y][x] = 'l'; g[y][x + 1] = 'L'; g[y][x + 2] = 'l'; g[y + 1][x] = 'l'; g[y + 1][x + 1] = 'l'; }
  } else if (kind === 'wplot' || kind === 'wplotwet') { // W1 nước sâu trong ruộng (đã tưới = sâu hơn)
    for (let i = 0; i < 6; i++) { const x = (rnd() * 30) | 0, y = (rnd() * 32) | 0; g[y][x] = kind === 'wplot' ? '!' : '9'; g[y][x + 1] = kind === 'wplot' ? '!' : '9'; }
    for (let i = 0; i < 3; i++) g[(rnd() * 32) | 0][(rnd() * 32) | 0] = '~';
  } else if (kind === 'mine') {                         // M1 đá phiến (khung vẽ lớn v0.9): đốm tròn đậm nhạt + đốm vụn + kim cương nhỏ khắp nơi —— theo bản thiết kế
    for (let i = 0; i < 7; i++) blot(rnd() * SZ, rnd() * SZ, 4 + rnd() * 5, '^');
    for (let i = 0; i < 6; i++) blot(rnd() * SZ, rnd() * SZ, 3 + rnd() * 4, '&');
    for (let i = 0; i < 55; i++) g[(rnd() * SZ) | 0][(rnd() * SZ) | 0] = '^';
    for (let i = 0; i < 28; i++) g[(rnd() * SZ) | 0][(rnd() * SZ) | 0] = '&';
    for (let i = 0; i < 9; i++) {
      const x = 2 + ((rnd() * (SZ - 4)) | 0), y = 2 + ((rnd() * (SZ - 4)) | 0);
      g[y - 1][x] = '5'; g[y][x - 1] = '5'; g[y][x + 1] = '5'; g[y + 1][x] = '5'; g[y][x] = '*';
    }
    for (let i = 0; i < 14; i++) g[(rnd() * SZ) | 0][(rnd() * SZ) | 0] = '*';
  } else if (kind === 'mplot' || kind === 'mplotwet') { // Lớp lót trong luống ươm pha lê M1 (đã tưới = ngả xanh)
    for (let i = 0; i < 5; i++) g[(rnd() * 32) | 0][(rnd() * 32) | 0] = '&';
    for (let i = 0; i < 3; i++) g[(rnd() * 32) | 0][(rnd() * 32) | 0] = '%';
  } else {
    const top = kind === 'wet' ? 'g' : 'd', dark = kind === 'wet' ? 'm' : 'c', speck = kind === 'wet' ? 's' : 'e';
    for (let y = 0; y < 32; y++) { if (y % 4 === 0) g[y].fill(top); if (y % 4 === 3) g[y].fill(dark); }
    for (let i = 0; i < 5; i++) { const y = 4 * ((rnd() * 8) | 0) + 1 + ((rnd() * 2) | 0); g[y][(rnd() * 32) | 0] = speck; }
  }
  const canvas = document.createElement('canvas');
  canvas.width = SZ;
  canvas.height = SZ;
  const ctx = canvas.getContext('2d');
  g.forEach((row, y) => {
    row.forEach((ch, x) => {
      const c = P[ch] || LP[ch];
      if (c) {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  });
  return `url("${canvas.toDataURL('image/png')}")`;
}

// Pre-warm the canvas cache asynchronously to guarantee 0-stutter when opening the UI
export function warmUpCache(CROPS) {
  const tasks = [];
  Object.keys(PETS).forEach(p => tasks.push(() => petSVG(p, 48)));
  Object.keys(SPR).forEach(s => tasks.push(() => spriteSVG(s, s === 'emBang' ? 48 : 24)));
  if (CROPS) {
    Object.keys(CROPS).forEach(c => {
      tasks.push(() => spriteSVG(CROPS[c].sp, 24));
    });
  }
  ['grass', 'water', 'mine'].forEach(bg => tasks.push(() => tileURI(bg, 0)));

  let i = 0;
  function next() {
    const end = performance.now() + 10;
    while (i < tasks.length && performance.now() < end) {
      try { tasks[i](); } catch (e) { }
      i++;
    }
    if (i < tasks.length) setTimeout(next, 20);
  }
  setTimeout(next, 1000); // Wait 1 second before starting to let ST settle
}


