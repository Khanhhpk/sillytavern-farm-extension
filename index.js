var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/store.js
var NS, extensionName, RUNTIME_KEY, ctx, setExtensionContext;
var init_store = __esm({
  "src/store.js"() {
    NS = "star_tavern_farm";
    extensionName = "sillytavern-farm-extension";
    RUNTIME_KEY = "__STAR_TAVERN_FARM__";
    ctx = {
      extension_settings: {},
      eventSource: null,
      event_types: null,
      saveSettingsDebounced: null,
      S: null,
      ui: null,
      orb: null,
      win: null,
      saveTimer: null
    };
    setExtensionContext = (params) => {
      Object.assign(ctx, params);
    };
    if (typeof window !== "undefined") {
      window["testTribulation"] = () => {
        if (ctx.S) {
          ctx.S.coins = 25e8;
          ctx.S.needsTribulationCheck = true;
          delete ctx.S.blockedUntil;
          if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
          console.log("\u2705 \u0110\xE3 gi\u1EA3 l\u1EADp m\u1ED1c t\xE0i s\u1EA3n 2.5 T\u1EF7 v\xE0 \xE9p ch\u1EA1y s\u1EF1 ki\u1EC7n Thi\xEAn Ki\u1EBFp! H\xE3y b\u1EA5m v\xE0o qu\u1EA3 c\u1EA7u N\xF4ng Tr\u1EA1i \u0111\u1EC3 xem.");
        } else {
          console.log("\u274C N\xF4ng tr\u1EA1i ch\u01B0a \u0111\u01B0\u1EE3c t\u1EA3i (ctx.S null). H\xE3y m\u1EDF game m\u1ED9t l\u1EA7n tr\u01B0\u1EDBc.");
        }
      };
      window["unlockTribulation"] = () => {
        if (ctx.S) {
          delete ctx.S.blockedUntil;
          if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
          console.log("\u2705 \u0110\xE3 gi\u1EA3i tr\u1EEB phong \u1EA5n Thi\xEAn Ki\u1EBFp! B\u1EA1n c\xF3 th\u1EC3 v\xE0o l\u1EA1i N\xF4ng Tr\u1EA1i.");
        }
      };
    }
  }
});

// src/data.js
var TEST_MODE, MIN, GROW, REGROW, DAY_MS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, CROPS, ZONE_NAME, FERTS, BLOCK_PRICE_PG, WEATHERS;
var init_data = __esm({
  "src/data.js"() {
    TEST_MODE = false;
    MIN = 60 * 1e3;
    GROW = TEST_MODE ? 5 * MIN : null;
    REGROW = TEST_MODE ? 2 * MIN : null;
    DAY_MS = 4 * 60 * 60 * 1e3;
    WATER_CD = TEST_MODE ? 10 * MIN : 2 * 60 * 60 * 1e3;
    REGROW_MAX = 3;
    POKE_CD = 10 * MIN;
    TREASURE_CD = TEST_MODE ? 10 * MIN : 2 * 60 * 60 * 1e3;
    PETS_OUT_MAX = 8;
    WITCH_STAY = TEST_MODE ? 10 * MIN : 20 * MIN;
    witchGap = () => TEST_MODE ? 15 * MIN + Math.random() * 20 * MIN : 100 * MIN + Math.random() * 80 * MIN;
    SNAP_EDGE = 48;
    CROPS = {
      /* Số liệu chính thức v1.0 (chốt theo "Bảng số liệu chính thức - chờ duyệt.md"): grow/regrowM tính bằng phút thực */
      douya: { name: "Gi\xE1 \u0111\u1ED7", grow: 5, seed: 5, sell: 12, sp: "douya" },
      radish: { name: "C\u1EE7 c\u1EA3i cherry", grow: 10, seed: 25, sell: 45, sp: "radish" },
      tomato: { name: "C\xE0 chua", grow: 20, regrowM: 15, seed: 100, sell: 90, sp: "tomato", regrow: true },
      strawberry: { name: "D\xE2u t\xE2y", grow: 90, seed: 350, sell: 800, sp: "strawberry" },
      pumpkin: { name: "B\xED ng\xF4", grow: 120, seed: 500, sell: 1300, sp: "pumpkin" },
      moonberry: { name: "D\xE2u \xE1nh tr\u0103ng", grow: 180, seed: 600, sell: 1500, sp: "moonberry" },
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
    ZONE_NAME = { 1: "\u0110\u1ED3ng c\u1ECF", 2: "V\xF9ng n\u01B0\u1EDBc", 3: "Khu m\u1ECF" };
    FERTS = {
      compost: { name: "Ph\xE2n \u1EE7", price: 50, desc: "Th\u1EDDi gian c\xF2n l\u1EA1i c\u1EE7a v\u1EE5 n\xE0y \xD70.75" },
      shiny: { name: "Ph\xE2n l\u1EA5p l\xE1nh", price: 100, desc: "Khi thu ho\u1EA1ch v\u1EE5 n\xE0y r\u01A1i th\xEAm s\u1ED1 v\xE0ng b\u1EB1ng 25% gi\xE1 b\xE1n" }
    };
    BLOCK_PRICE_PG = {
      // v1.0: giá khai hoang riêng cho từng trang (chốt theo bảng B)
      1: [0, 0, 800, 3e3, 12e3, 3e4],
      2: [0, 2e3, 6e3, 18e3, 45e3, 9e4],
      3: [0, 5e3, 15e3, 4e4, 9e4, 18e4]
    };
    WEATHERS = ["N\u1EAFng", "N\u1EAFng", "N\u1EAFng", "Nhi\u1EC1u m\xE2y", "M\u01B0a nh\u1ECF"];
  }
});

// src/graphics.js
function mulberry32(a) {
  return function() {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
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
function registerDynamicSprite(name, mapArray) {
  DYNAMIC_SPR[name] = mapArray;
}
function spriteSVG(name, px) {
  const key = name + "@" + px;
  if (spriteCache.has(key)) return spriteCache.get(key);
  const map = SPR[name] || DYNAMIC_SPR[name] || C2[name] && C2[name].m;
  if (!map) return "";
  const pal = DYNAMIC_SPR[name] ? GACHA_P : SPR[name] ? P : C2[name].p;
  const canvas = document.createElement("canvas");
  canvas.width = map[0].length || 16;
  canvas.height = map.length || 16;
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
  const out = `<img draggable="false" width="${px}" height="${px}" src="${canvas.toDataURL("image/png")}" style="display:block; image-rendering:pixelated; object-fit:contain;" />`;
  spriteCache.set(key, out);
  return out;
}
function tileURI(kind, seedNum) {
  const tkey = kind + "@" + seedNum;
  if (tileCache.has(tkey)) return tileCache.get(tkey);
  const out = buildTile(kind, seedNum);
  tileCache.set(tkey, out);
  return out;
}
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
var P, GACHA_P, SPR, PET_P, PET_SPR, petLinear, PET_FX, petCache, PETS, PASSES, C2, DYNAMIC_SPR, spriteCache, tileCache, LP;
var init_graphics = __esm({
  "src/graphics.js"() {
    init_state();
    init_data();
    P = {
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
    GACHA_P = {
      "0": "#ffffff",
      "1": "#e0e0e0",
      "2": "#c0c0c0",
      "3": "#a0a0a0",
      "4": "#808080",
      "5": "#606060",
      "6": "#404040",
      "7": "#202020",
      "8": "#101010",
      "9": "#000000",
      "a": "#ff0000",
      "b": "#cc0000",
      "c": "#990000",
      "d": "#ff6666",
      "e": "#ff9999",
      "f": "#ff6600",
      "g": "#cc5200",
      "h": "#ff9933",
      "i": "#8b4513",
      "j": "#a0522d",
      "k": "#cd853f",
      "l": "#deb887",
      "m": "#ffff00",
      "n": "#ffd700",
      "o": "#ffcc00",
      "p": "#ffdab9",
      "q": "#eee8aa",
      "r": "#bdb76b",
      "s": "#00ff00",
      "t": "#32cd32",
      "u": "#008000",
      "v": "#006400",
      "w": "#98fb98",
      "x": "#90ee90",
      "y": "#adff2f",
      "z": "#556b2f",
      "A": "#0000ff",
      "B": "#0000cc",
      "C": "#00008b",
      "D": "#4169e1",
      "E": "#6495ed",
      "F": "#87ceeb",
      "G": "#00ffff",
      "H": "#00ced1",
      "I": "#20b2aa",
      "J": "#008080",
      "K": "#7fffd4",
      "L": "#ff00ff",
      "M": "#c71585",
      "N": "#800080",
      "O": "#4b0082",
      "P": "#9370db",
      "Q": "#da70d6",
      "R": "#ffc0cb",
      "S": "#ffb6c1",
      "T": "#ff69b4",
      "U": "#db7093",
      "V": "#ffe4c4",
      "W": "#ffe4e1",
      "X": "#faf0e6",
      "Y": "#ffefd5",
      "Z": "#ffebcd"
    };
    SPR = {
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
      achivStar: [
        "................",
        ".......U........",
        "......UCU.......",
        "......CWC.......",
        ".UUUUUCCCUUUUU..",
        "..UCCCCCCCCCU...",
        "...UCCCCCCCU....",
        "....UCCCCCU.....",
        "...UCCC.CCCU....",
        "..UCC.....CCU...",
        ".UU.........UU..",
        "................",
        "................",
        "................",
        "................",
        "................"
      ],
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
    P.k = P.k || "#c4e3f0";
    P.i = P.i || "#a9cede";
    PET_P = {
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
    PET_SPR = {
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
      peach_soda: [
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
      jellyfish: [
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
      mystery_blob: [
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
      ],
      penguin: [
        "................",
        "................",
        ".....333333.....",
        "....33WWWW33....",
        "...33WWWWWW33...",
        "...3WKKWWKKW3...",
        "..33WnWooWnW33..",
        "..33WWWWWWWW33..",
        "..33WWWWWWWW33..",
        "...33WWWWWW33...",
        "....33333333....",
        ".....oo..oo.....",
        "................",
        "................",
        "................",
        "................"
      ],
      naoyaSlime: [
        "................",
        "................",
        "................",
        "................",
        ".....yyyyyy.....",
        "....yYYYYYYy....",
        "...yYWWYYYYYy...",
        "..yYYWWYYYYYYy..",
        "..yYKKKYYKKKYy..",
        "..yYWKKYYWKKYy..",
        ".yYYYYYYYYYYYYy.",
        ".yYYYYYYYYKYYYy.",
        ".yYYYYYYKKYYYYy.",
        ".yYYYYYYYYYYYYy.",
        "..yyyyyyyyyyyy..",
        "................"
      ]
    };
    petLinear = (x1, y1, x2, y2, stops) => ({ type: "linear", x1, y1, x2, y2, stops });
    PET_FX = {
      mystery_blob: {
        // Bé bí ẩn: bản cam dịu thứ hai (wen chốt: pha sữa giảm độ tinh khiết nhưng giữ dòng máu cam; bản oải hương để dành cho kho da DLC)
        o: petLinear(1, 2, 15, 14, [["0%", "#ffe0a6"], ["46%", "#f7b374"], ["100%", "#ea9060"]]),
        t: petLinear(0, 7, 16, 15, [["0%", "#d18a58"], ["100%", "#b06a44"]]),
        K: "#6b4548",
        n: "#ffcdd8"
      },
      peach_soda: {
        T: petLinear(1, 2, 15, 14, [["0%", "#ffe8a6"], ["35%", "#ffbdc9"], ["64%", "#ff94bf"], ["100%", "#c99bf5"]]),
        t: petLinear(0, 4, 16, 15, [["0%", "#f28bc2"], ["100%", "#9b78de"]]),
        C: "#effffb",
        D: "#5b4568",
        P: "#65e0cf",
        O: petLinear(0, 0, 15, 3, [["0%", "#b9fff3"], ["100%", "#9ba7ff"]])
      },
      jellyfish: {
        I: petLinear(1, 2, 15, 14, [["0%", "#c8f4ff"], ["28%", "#8cddff"], ["62%", "#58b7f2"], ["100%", "#6576dc"]]),
        i: petLinear(0, 7, 16, 15, [["0%", "#579dd1"], ["100%", "#5459aa"]]),
        B: "#effcff",
        Y: "#fff0a6",
        P: "#ff8fca",
        S: petLinear(0, 0, 16, 4, [["0%", "#fff6aa"], ["100%", "#a8dbff"]]),
        L: petLinear(0, 11, 16, 16, [["0%", "#bdeaff"], ["100%", "#8d90ee"]])
      }
    };
    petCache = /* @__PURE__ */ new Map();
    PETS = {
      /* —— Trang 1 —— */
      slime: { name: "Slime xanh", page: 1, price: 0, starter: true, cry: ["B\u1EE5p b\u1EE5p~", "B\u1EF1ppp!", "Gr\xF9 gr\xF9\u2026", "B\u1EE5p?", "Nh\u1EA3y nh\u1EA3y!"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 b\xE9 tr\xF2n t\u1ED5 ti\xEAn, b\u1EA1n \u0111\u1ED3ng h\xE0nh t\u1EEB \u0111\u1EA7u" },
      octo: { name: "B\u1EA1ch tu\u1ED9c t\xEDm", page: 1, price: 500, cry: ["\u1EE4c b\u1ED1p?", "\u1EE4c \u1EF1c!", "Ch\xEDu mi!", "B\xF3p b\xF3p\u2026", "\u1EE4c b\u1ED1p b\u1ED1p!"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 th\xEDch ch\u1ED3ng l\xEAn \u0111\u1EA7u ng\u01B0\u1EDDi kh\xE1c" },
      slimePink: { name: "Slime h\u1ED3ng", page: 1, price: 600, cry: ["B\u1EE5p h\xEC~", "B\u1EE5p b\u1EE5p!", "H\xEC h\xEC\u2026", "B\u1EE5p ch\xEDu~"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 v\u1ECB d\xE2u (nh\u01B0ng kh\xF4ng \u0103n \u0111\u01B0\u1EE3c)" },
      octoCream: { name: "B\u1EA1ch tu\u1ED9c kem", page: 1, price: 700, cry: ["B\u1ED1p\u2026", "\u1EE4c\u2026", "(ch\u1EADm r\xEC r\xEC) b\xF3p~"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 b\u1EADc th\u1EA7y ngu\u1EF5 trang, tr\xF9ng m\xE0u v\u1EDBi b\u1EA3ng \u0111i\u1EC1u khi\u1EC3n" },
      dewSprout: { job: "plant", name: "B\xE9 m\u1EA7m s\u01B0\u01A1ng", page: 1, price: 1200, cry: ["T\xED t\xE1ch~", "M\u1EA7m!", "(\u0111\u1ED9i l\xE1 l\xEAn)"], desc: "Lo\u1EA1i l\xE0m vi\u1EC7c \xB7 ch\u1ECDc m\u1ED9t c\xE1i l\xE0 gieo kh\u1EAFp ru\u1ED9ng, h\u1EA1t xu\u1ED1ng \u0111\u1EA5t l\xE0 n\u1EA3y m\u1EA7m" },
      cloudMallow: { job: "water", name: "B\xE9 b\xF4ng m\xE2y", page: 1, price: 1500, cry: ["B\xF4ng b\xF4ng~", "V\xF9\u2014\u2014", "(bay l\u01A1 l\u1EEDng)"], desc: "Lo\u1EA1i l\xE0m vi\u1EC7c \xB7 ra s\xE2n l\xE0 m\xE2y m\u01B0a nh\u1ECF t\u1EF1 \u0111\u1ED9ng t\u01B0\u1EDBi" },
      /* —— Trang 2 (vé vùng nước) —— */
      ghostBlob: { name: "B\xE9 ma nh\u1ECF", page: 2, price: 1500, cry: ["Uuu~", "Bay bay\u2026", "(xuy\xEAn qua tay b\u1EA1n)"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 bay \u0111\u01B0\u1EE3c v\xE0o nh\u1EEFng ch\u1ED7 ng\u01B0\u1EDDi kh\xE1c kh\xF4ng v\xE0o n\u1ED5i" },
      mystery_blob: { job: "fert", name: "B\xE9 b\xED \u1EA9n", page: 2, price: 1800, cry: ["\u2026\u2026?", "(nghi\xEAng \u0111\u1EA7u)", "?!"], desc: "Lo\u1EA1i l\xE0m vi\u1EC7c \xB7 ch\u1ECDc m\u1ED9t c\xE1i l\xE0 b\xF3n ph\xE2n h\xE0ng lo\u1EA1t \xB7 ph\xE2n c\u1EE7a n\xF3 b\xF3n ra c\xE1i g\xEC th\xEC kh\xF4ng ai \u0111o\xE1n n\u1ED5i" },
      jellyfish: { job: "harvest", name: "B\xE9 s\u1EE9a xo\u0103n", page: 2, price: 2200, cry: ["\u1EE4c gr\xF9~", "(cu\u1ED9n cu\u1ED9n x\xFAc tu)", "B\u1ED1p \u1EE5c!"], desc: "Lo\u1EA1i l\xE0m vi\u1EC7c \xB7 ch\u1ECDc m\u1ED9t c\xE1i l\xE0 x\xFAc tu nh\u1EB9 nh\xE0ng cu\u1ED9n rau ch\xEDn v\xE0o balo" },
      impBlob: { name: "B\xE9 qu\u1EF7 nh\u1ECF", page: 2, price: 3e3, cry: ["H\xEC h\xEC.", "H\u01B0!", "(gi\u1EA5u c\xE1i g\xEC \u0111\xF3 \u0111i)"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 khi t\xECm kho b\xE1u s\u1EBD tha v\u1EC1 h\u1EA1t gi\u1ED1ng b\xED \u1EA9n \u0111en s\xEC" },
      angelBlob: { name: "B\xE9 thi\xEAn th\u1EA7n", page: 2, price: 3e3, cry: ["Ting~", "(ph\xE1t s\xE1ng d\u1ECBu d\xE0ng)", "Ch\xFAc ph\xFAc cho b\u1EA1n."], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 khi t\xECm kho b\xE1u s\u1EBD ng\u1EADm v\u1EC1 h\u1EA1t gi\u1ED1ng b\xED \u1EA9n \xE1nh l\u1EA5p l\xE1nh" },
      /* —— Trang 3 (vé khu mỏ) —— */
      prismBlob: { name: "B\xE9 l\u0103ng quang", page: 3, price: 8e3, cry: ["Keng~", "(kh\xFAc x\u1EA1 ra m\u1ED9t d\u1EA3i c\u1EA7u v\u1ED3ng)", "Kengg!"], desc: "Lo\u1EA1i s\u1EA3n xu\u1EA5t \xB7 t\xECm kho b\xE1u mang v\u1EC1 m\u1EA3nh l\u0103ng quang (\u0111\u1ED5i \u0111\u01B0\u1EE3c m\u1ED9t \u0111\u01A1n \u1EDF trang \u0111\u01A1n h\xE0ng ph\xF9 thu\u1EF7)" },
      starBell: { name: "B\xE9 chu\xF4ng sao", page: 3, price: 8e3, cry: ["Leng keng~", "\u2606!", "(l\u1EAFc l\u1EAFc nh\u1EB9)"], desc: "Lo\u1EA1i s\u1EA3n xu\u1EA5t \xB7 t\xECm kho b\xE1u rung r\u01A1i m\u1EA3nh ng\xF4i sao (tri\u1EC7u h\u1ED3i \u0111\u01B0\u1EE3c ph\xF9 thu\u1EF7 tr\xF2n)" },
      /* —— Át chủ bài (page 1 = không cần vé, đủ tiền là mang về được, thuần tuý thuế dễ thương) —— */
      peach_soda: { name: "B\xE9 soda \u0111\xE0o", page: 1, price: 9999, cry: ["B\u1ED1p\u2014\u2014!", "(n\u1ED5i m\u1ED9t bong b\xF3ng nh\u1ECF)", "X\xEC~", "(v\u1ECB ng\xF2n ng\u1ECDt)"], desc: "Lo\u1EA1i t\xECm kho b\xE1u \xB7 tinh linh soda v\u1ECB \u0111\xE0o \xB7 d\u1EC5 th\u01B0\u01A1ng qu\xE1 m\u1EE9c n\xEAn \u0111\u1EAFt nh\u1EA5t" },
      penguin: { name: "Chim c\xE1nh c\u1EE5t", page: 1, price: 1e5, cry: ["Pingu!", "N\xFAp n\xFAp~", "Tr\u01B0\u1EE3t tuy\u1EBFt n\xE0o!", "C\xE1nh c\u1EE5t!"], desc: "Lo\u1EA1i \u0111\u1EB7c bi\u1EC7t \xB7 AFK m\u1ED7i 1 ti\u1EBFng mang v\u1EC1 1 v\xE9 gacha ng\u1EABu nhi\xEAn (70% v\xE9 th\u01B0\u1EDDng, 30% v\xE9 \u0111\u1EB7c bi\u1EC7t)" },
      naoyaSlime: { name: "Naoya", page: 1, hidden: true, price: 0, cry: ["R\xE1c r\u01B0\u1EDFi!", "L\u0169 y\u1EBFu k\xE9m...", "B\u1EA9n h\u1EBFt c\u1EA3 ng\u01B0\u1EDDi!", "(l\u01B0\u1EDDm khinh b\u1EC9)"], desc: "Lo\u1EA1i \u0111\u1EB7c bi\u1EC7t (Th\xE0nh t\u1EF1u) \xB7 K\u1EBB t\u1EF1 x\u01B0ng l\xE0 thi\xEAn t\xE0i nh\u01B0ng l\u1EA1i b\u1ECB k\u1EB9t trong h\xECnh h\xE0i Slime tr\xF2n vo n\xFAng n\xEDnh." }
    };
    PASSES = {
      water: { name: "V\xE9 v\xF9ng n\u01B0\u1EDBc", price: 6e3, desc: "M\u1EDF kho\xE1 ru\u1ED9ng v\xF9ng n\u01B0\u1EDBc (trang 2) + quy\u1EC1n mua b\xE9 tr\xF2n trang 2 v\xE0 h\u1EA1t gi\u1ED1ng thu\u1EF7 sinh, t\u1EB7ng k\xE8m \xF4 ru\u1ED9ng n\u1ED5i \u0111\u1EA7u ti\xEAn" },
      mine: { name: "V\xE9 khu m\u1ECF", price: 35e3, desc: "M\u1EDF kho\xE1 ru\u1ED9ng khu m\u1ECF (trang 3) + quy\u1EC1n mua b\xE9 tr\xF2n trang 3 v\xE0 h\u1EA1t gi\u1ED1ng khu m\u1ECF, t\u1EB7ng k\xE8m lu\u1ED1ng \u01B0\u01A1m \u0111\u1EA7u ti\xEAn" }
    };
    C2 = {
      chuncai: {
        p: { g: "#2e6a50", G: "#4d9a6e", W: "#a8d8bc", o: "#8a5540" },
        m: [
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
        ]
      },
      biqi: {
        p: { t: "#4d7a26", T: "#79b544", m: "#3f2a20", M: "#6a4534", W: "#f2e8d8" },
        m: [
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
        ]
      },
      lingjiao: {
        p: { g: "#2e6a50", G: "#4d9a6e", K: "#241b2e", P: "#5a3f66", W: "#b79ae0" },
        m: [
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
        ]
      },
      jiaobai: {
        p: { g: "#3f7a30", G: "#6aab44", W: "#f6f2e2", s: "#d9d0b8" },
        m: [
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
        ]
      },
      lianou: {
        p: { f: "#c25a78", P: "#f5aec2", W: "#fff0f5", g: "#2e6a50", G: "#4d9a6e", B: "#245a40", o: "#e8dcc2", O: "#c2b090" },
        m: [
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
        ]
      },
      wujing: {
        p: { K: "#3f2a58", V: "#8a64c0", W: "#dcc8f5" },
        m: [
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
        ]
      },
      starbush: {
        p: { b: "#2e5a34", B: "#4f8a55", s: "#ffd94d", S: "#fff2b0", t: "#8a6244", y: "#ffd94d" },
        m: [
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
        ]
      },
      gemflower: {
        p: { K: "#5a4268", r: "#d95a6a", R: "#f090a0", b: "#4a7ac2", B: "#8fb8ec", g: "#38a06a", G: "#7cd4a4", p: "#8a5cc0", P: "#c0a0e8", y: "#c89a38", Y: "#ffd94d", W: "#fff2b0", t: "#4d7a26", T: "#79b544" },
        m: [
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
        ]
      },
      opalvine: {
        p: { t: "#3f5a5a", T: "#5c8080", K: "#8a7a9a", o: "#f2ecf5", P: "#f5b8d0", C: "#8adbe0" },
        m: [
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
        ]
      },
      dragoncry: {
        p: { K: "#8a2a26", T: "#e8604a", t: "#c23c34", W: "#ffe0a0", g: "#3f7a30", G: "#6aab44" },
        m: [
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
        ]
      },
      seedDark: {
        p: { K: "#1c1420", k: "#33263d", v: "#8a2a4a", a: "#5a3f78" },
        m: [
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
        ]
      },
      seedLight: {
        p: { h: "#ffe89a", y: "#c8a94a", Y: "#f5dfa0", W: "#fff8e0", s: "#ffd94d" },
        m: [
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
        ]
      },
      /* —— v0.9b (#49): ba họ bí ẩn · kén mộng / cỏ chìa khoá / cây ăn thịt (bản thiết kế chốt) —— */
      dreamG: {
        p: { K: "#b8a890", W: "#f8f4ea", w: "#e4dcc8", s: "#d9cfc0", p: "#f5b8d0", t: "#8a6844", g: "#4d7a26" },
        m: [
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
        ]
      },
      dreamW: {
        p: { K: "#4a7a94", B: "#bcdde8", b: "#94c2d4", W: "#eef8fa", d: "#7a94b8", o: "#d8ecf2" },
        m: [
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
        ]
      },
      dreamM: {
        p: { K: "#3f3a50", S: "#8d8398", s: "#6d657c", c: "#241f2c", O: "#ffd94d", o: "#ffb060", d: "#575070" },
        m: [
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
        ]
      },
      keyG: {
        p: { t: "#4d7a26", T: "#79b544", c: "#a8681f", C: "#d99a43", W: "#ffe9b8", g: "#79b544" },
        m: [
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
        ]
      },
      keyW: {
        p: { t: "#2e6a50", T: "#4d9a6e", c: "#3f7a5c", C: "#7cc4a4", W: "#c8ecd8", v: "#245a40", o: "#d8ecf2" },
        m: [
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
        ]
      },
      keyM: {
        p: { t: "#b8862a", T: "#ffd94d", P: "#9a6ce0", p: "#c4a2e8", z: "#f0e4ff", s: "#ffd94d" },
        m: [
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
        ]
      },
      fangG: {
        p: { K: "#2e5a1e", G: "#6cb457", E: "#a4dc8c", R: "#c24a5a", W: "#fffdf4", t: "#4d7a26", g: "#79b544" },
        m: [
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
        ]
      },
      fangW: {
        p: { K: "#6a2420", R: "#a83a35", r: "#c25a50", C: "#f2dfc0", D: "#2e1210", g: "#2e6a50", G: "#4d9a6e" },
        m: [
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
        ]
      },
      fangM: {
        p: { K: "#1c1428", P: "#3a2a52", p: "#5a4278", F: "#8ae0ea", f: "#d8f8fc", O: "#ffb060", o: "#ffe0a0", t: "#2e2440" },
        m: [
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
        ]
      },
      shardPrism: {
        p: { K: "#8ab8c8", k: "#4a8098", W: "#e8f8ff", w: "#c0e8f4", R: "#ff6060", G: "#60cc60", B: "#6090ff", Y: "#ffd940", P: "#c060e0", C: "#40d0d0" },
        m: [
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
        ]
      },
      shardStar: {
        p: { K: "#6a4ab8", P: "#b094e0", p: "#d8c4ff", W: "#ffffff", o: "#ffd94d", y: "#fff4b0" },
        m: [
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
        ]
      },
      strawhat: {
        p: { K: "#a83a52", P: "#f7a6bd", p: "#ffd0dc", k: "#e07b96", Y: "#f5e0a8", y: "#e0be7a" },
        m: [
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
        ]
      },
      // Huy hiệu mặt tiền: nón rơm ruy băng hồng (wen chốt, chỗ ký tên tác giả)
      strawberry: {
        p: { g: "#4d7a26", G: "#79b544", K: "#8a2a35", r: "#d94f5c", R: "#e8808e", y: "#ffe0a8" },
        m: [
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
        ]
      },
      strawberryW: {
        p: { g: "#2e6a50", G: "#4d9a6e", K: "#2e6a80", r: "#7fd4dd", R: "#b8ecf0", W: "#f0fcff" },
        m: [
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
        ]
      },
      strawberryM: {
        p: { g: "#5a3f78", G: "#8a5cc0", K: "#3a2258", r: "#9a6ac8", R: "#c4a2e8", W: "#e8d8f8" },
        m: [
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
        ]
      }
    };
    DYNAMIC_SPR = {};
    spriteCache = /* @__PURE__ */ new Map();
    tileCache = /* @__PURE__ */ new Map();
    LP = {
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
  }
});

// src/style.js
var styleCSS;
var init_style = __esm({
  "src/style.js"() {
    styleCSS = `
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

    .mtitle-text { font-weight: bold; font-size: 16px; color: var(--shead); letter-spacing: 1px; flex: 1; text-align: center; }

    .toast { position: fixed; left: 50%; top: 80px; transform: translateX(-50%); background: var(--accBg); border: 2px solid var(--accLine); color: var(--accFg); padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; z-index: 999999; box-shadow: 0 4px 10px rgba(0,0,0,0.3); pointer-events: none; opacity: 0; transition: opacity 0.3s, top 0.3s; }
    .toast.show { opacity: 1; top: 90px; }

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
    
    .dungeon-win { position: fixed; z-index: 99997; width: min(760px, 96vw); height: 92vh; height: 92dvh; display: none;
      flex-direction: column; background: #f8efe0;
      background-image: repeating-linear-gradient(0deg, transparent 0 30px, rgba(170,130,80,.14) 30px 33px);
      border: 4px solid #c9a273; outline: 4px solid var(--frameOut); border-radius: 10px;
      box-shadow: inset 0 0 0 4px #fff6e8, 0 14px 40px rgba(0,0,0,.55); }
    .dungeon-win.open-anim { display: flex; animation: winPop 0.2s cubic-bezier(0.18,0.89,0.32,1.28) forwards; }
    .titlebar { background: var(--sky); border-bottom: 4px solid var(--skyLine); padding: 9px 14px;
      display: flex; align-items: center; gap: 8px; box-shadow: inset 0 0 0 2px rgba(255,255,255,.5);
      cursor: move; touch-action: none; user-select: none; flex: none; }
    .titlebar { justify-content: space-between; }
    .titlebar h1 { font-size: 15px; color: #7a5c38; letter-spacing: 2px; text-shadow: 1px 1px 0 #fff3dd; flex: 0 1 auto;
      display: flex; align-items: center; gap: 7px;
      background: linear-gradient(#faf0dc,#eed9b8); border: 3px solid #8a6844; border-radius: 8px; padding: 3px 12px;
      box-shadow: 0 3px 0 var(--tint), inset 0 0 0 2px #fff6e0;
      display: flex; align-items: center; gap: 8px; }
    .view-toggle { margin-left: auto; width: auto; height: 24px; padding: 0 8px; gap: 4px; background: linear-gradient(#faf0dc,#eed9b8); border: 3px solid #8a6844; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 0 var(--tintSoft); flex-shrink: 0; font-size: 11px; font-weight: bold; color: #7a5c38; }
    .close-x { width: 24px; height: 24px; background: linear-gradient(#faf0dc,#eed9b8); border: 3px solid #8a6844; border-radius: 6px;
      color: #7a5c38; box-shadow: 0 2px 0 var(--tintSoft); font-weight: bold; text-align: center; line-height: 18px; cursor: pointer; flex-shrink: 0; }
    .statusbar { display: flex; align-items: center; gap: 12px; padding: 7px 14px; background: #f4e6cf;
      border-bottom: 3px solid #ddc39a; font-size: 13px; font-weight: bold; color: #7a5c38; flex: none; flex-wrap: wrap; }
    .stat { display: flex; align-items: center; gap: 5px; }
    #scroll { overflow: auto; flex: 1; min-height: 0; display: flex; flex-direction: column; }
    /* v0.8: thanh l\u1EADt trang ba trang */
    .pager { position: absolute; top: 7px; right: 7px; z-index: 7; display: flex; align-items: center; justify-content: center;
      background: rgba(58,48,30,.4); border: 2px solid rgba(255,246,224,.4); border-radius: 14px; overflow: hidden;
      width: 26px; height: 26px; cursor: pointer; font-size: 13px; color: rgba(255,246,224,.8); user-select: none; }
    .pager.open { width: auto; height: auto; border-radius: 12px; cursor: default;
      background: rgba(58,48,30,.55); border-color: rgba(255,246,224,.5); font-size: 0; }
    .pager:not(.open) .ptab { display: none; }
    .pager:not(.open)::after { content: '\u21C4'; }
    .ptab { flex: none; font-size: 11px; font-weight: bold; padding: 4px 10px; background: transparent;
      color: #f0e6cc; cursor: pointer; user-select: none; display: inline-flex; align-items: center; gap: 3px; }
    .ptab + .ptab { border-left: 1px solid rgba(255,246,224,.35); }
    .ptab.active { background: rgba(255,246,224,.92); color: #7a5c38; }
    .ptab.lock { opacity: .6; }
    .field { margin: 10px 12px; background-color: #a9c383; border: 4px solid #b08a5c; border-radius: 8px;
      box-shadow: inset 0 0 0 3px #8aa86a; padding: 14px; position: relative; }
    .field.pg2 { background-color: #8ec8d8; border-color: #6a9ab0; box-shadow: inset 0 0 0 3px #79b4c6; }
    .field.pg3 { background-color: #5f5870; border-color: #7a6a94; box-shadow: inset 0 0 0 3px #4e4860; }
    .field.pg2 span.dside, .field.pg2 span.dbot, .field.pg3 span.dside, .field.pg3 span.dbot { display: none !important; }
    .field.pg2 .plot { border-color: #c9a273;
      box-shadow: inset 0 0 0 3px #a8845c, inset 0 -5px 0 rgba(40,70,90,.28); }
    .field.pg2 .plot.watered { border-color: #b08a5c; box-shadow: inset 0 0 0 3px #8a6844, inset 0 -5px 0 rgba(30,55,75,.35); }
    .field.pg2 .block:not(.locked) .plot::before {
      content: ''; position: absolute; inset: -3px; pointer-events: none; border-radius: 6px;
      background: linear-gradient(#6a4a2c,#6a4a2c) left top / 7px 7px no-repeat,
        linear-gradient(#6a4a2c,#6a4a2c) right top / 7px 7px no-repeat,
        linear-gradient(#6a4a2c,#6a4a2c) left bottom / 7px 7px no-repeat,
        linear-gradient(#6a4a2c,#6a4a2c) right bottom / 7px 7px no-repeat; }
    .field.pg3 .plot { border-color: #3f8a9a; border-radius: 2px;
      box-shadow: inset 0 0 0 1px rgba(138,224,234,.5), inset 0 -3px 0 rgba(20,20,40,.35); }
    .field.pg3 .plot.watered { border-color: #5fc8d8; }
    .field.pg2 .block.locked .plot { border-color: #8ab4c2; box-shadow: inset 0 3px 0 rgba(255,255,255,.28), inset 0 -3px 0 rgba(30,60,80,.22); }
    .field.pg3 .block.locked .plot { border-color: #6d657c; box-shadow: none; }
    .blocks { display: grid; grid-template-columns: repeat(3, max-content); gap: 14px; justify-content: center; }
    @media (max-width: 640px) {
      .blocks { grid-template-columns: repeat(2, max-content); }
      .field { padding: 12px 12px 70px; }
      .titlebar { padding-top: max(32px, calc(9px + env(safe-area-inset-top, 0px))); }
      .titlebar h1 { font-size: 13px; letter-spacing: 0; }
      .titlebar h1 .sub { display: none; }
      .statusbar { gap: 6px 10px; font-size: 12px; padding: 6px 10px; }
      .bottombar { padding: 8px 10px calc(10px + env(safe-area-inset-bottom)); gap: 8px; }
      .btn { font-size: 11px; padding: 6px 2px; }
      span.dside { display: none; }
      span.dbot { display: inline; }
    }
    .field.explore-mode { background: radial-gradient(circle at 50% 50%, #2b1b54 0%, #0d0614 100%) !important; border-color: #4b3082 !important; overflow: hidden; }
    .field.explore-mode::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.8) 1px, transparent 1px), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.8) 1.5px, transparent 1.5px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 1px, transparent 1px);
      background-size: 100px 100px; opacity: 0.5; pointer-events: none; z-index: 0;
    }
    .explore-blocks { padding: 18px 24px 70px; display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; min-height: 280px; align-content: flex-start; position: relative; z-index: 1; }
    .explore-slot { width: 84px; height: 104px; background: rgba(255,255,255,0.7); border: 3px solid #8a6844; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; box-shadow: inset 0 0 0 3px rgba(255,255,255,0.5), 0 4px 0 #8a6844; transition: transform 0.1s; position: relative; z-index: 10; pointer-events: auto; }
    .explore-slot:active { transform: translateY(4px); box-shadow: inset 0 0 0 3px rgba(255,255,255,0.5), 0 0 0 #8a6844; }
    .explore-slot .feature-name { font-size: 13px; font-weight: bold; color: #7a5c38; margin-top: 8px; text-align: center; }
    
    .field.explore-mode .explore-slot { background: rgba(43,27,84,0.7); border-color: #8a5cc0; box-shadow: inset 0 0 0 3px rgba(138,92,192,0.5), 0 4px 0 #4b3082; }
    .field.explore-mode .explore-slot:active { transform: translateY(4px); box-shadow: inset 0 0 0 3px rgba(138,92,192,0.5), 0 0 0 #4b3082; }
    .field.explore-mode .explore-slot .feature-name { color: #e0ccff; text-shadow: 0 1px 2px #000; }
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
    /* C\u1EA3m \u1EE9ng: kh\xF4ng c\xF3 touch-action:none th\xEC tr\xECnh duy\u1EC7t coi c\xFA vu\u1ED1t l\xE0 cu\u1ED9n trang, b\u1EAFn pointercancel v\xE0 c\u1EAFt ngang phi\xEAn k\xE9o */
    .mascots[data-drag="1"] .pet { touch-action: none; }
    .pet { pointer-events: auto; cursor: pointer; transition: transform .12s; position: absolute; will-change: transform;
      left: 0; bottom: 0; will-change: transform, translate; }
    .pet:active { transform: scale(1.15, .85); }
    .pbody { display: block; animation: petbob 1.8s ease-in-out infinite; }
    .pet.walk .pbody { animation: pethop var(--hopd, .33s) linear infinite; }   /* v0.7\u2460: \u0111i b\u1ED9 = nh\u1EA3y li\xEAn ti\u1EBFp theo \u0111\u01B0\u1EDDng parabol */
    .pet[data-pet="cloudMallow"] .pbody,
    .pet[data-pet="ghostBlob"] .pbody,
    .pet[data-pet="jellyfish"] .pbody { animation: petfloat 3.2s ease-in-out infinite; }  /* M\xE2y / ma / s\u1EE9a: ki\u1EC3u bay l\u01A1 l\u1EEDng (\u0111\xE8 l\xEAn walk) */
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
    .bottombar { display: flex; align-items: stretch; gap: 10px; padding: 10px 14px 12px; flex: none; }
    .btn { flex: 1; padding: 6px 4px; background: linear-gradient(#faf0dc,#eed9b8); border: 3px solid #b08a5c;
      border-radius: 8px; box-shadow: inset 0 0 0 2px #fff6e0, inset 0 3px 0 #fffaf0, inset 0 -4px 0 #d9ba8a, 0 4px 0 #9a7a54;
      font-size: 12px; font-weight: bold; color: #7a5c38; text-shadow: 1px 1px 0 #fff3dd; text-align: center;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; cursor: pointer; user-select: none; white-space: nowrap; }
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
    /* Gachapon Animations & FX */
    @keyframes gachaShake {
      0% { transform: rotate(0deg); }
      20% { transform: rotate(-6deg); }
      40% { transform: rotate(6deg); }
      60% { transform: rotate(-4deg); }
      80% { transform: rotate(4deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes gachaDrop {
      0% { transform: translateY(-40px) scale(0.2); opacity: 0; }
      60% { transform: translateY(10px) scale(1.2); opacity: 1; }
      80% { transform: translateY(-4px) scale(0.95); }
      100% { transform: translateY(0) scale(1); }
    }
    .gacha-item-card.rarity-R\xE1c { border-color: #9e9e9e !important; background: #f5f5f5 !important; }
    .gacha-item-card.rarity-Th\u01B0\u1EDDng { border-color: #b0bec5 !important; background: #eceff1 !important; }
    .gacha-item-card.rarity-Hi\u1EBFm { border-color: #4a90e2 !important; background: #f0f7ff !important; }
    .gacha-item-card.rarity-S\u1EED-thi { border-color: #a335ee !important; background: #faf0ff !important; }
    .gacha-item-card.rarity-Huy\u1EC1n-tho\u1EA1i { border-color: #ff8000 !important; background: #fff8f0 !important; box-shadow: 0 0 10px rgba(255,128,0,0.6) !important; }
    /* Dungeon View */
    .dungeon-view { display: flex; flex: 1; width: 100%; background: #5f5870; z-index: 10; border-radius: 4px; padding: 10px; flex-direction: column; box-sizing: border-box; }
    .dg-arena { flex: 1; position: relative; border: 4px solid #3f3a50; border-radius: 8px; background: rgba(0,0,0,0.1); overflow: hidden; }
    .dg-dock { height: 84px; background: rgba(58,48,30,.7); margin-top: 10px; border-radius: 8px; border: 2px solid #8a6a42; display: flex; align-items: center; padding: 0 10px; gap: 12px; overflow-x: auto; overflow-y: hidden; }
    .dg-slot { width: 64px; height: 64px; flex-shrink: 0; background: rgba(255,255,255,.1); border: 2px dashed #b08a5c; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; -webkit-tap-highlight-color: transparent; user-select: none; touch-action: none; }
    .dg-slot img { width: 80% !important; height: 80% !important; object-fit: contain; pointer-events: none; }
    .dg-slot:hover { border-color: #d9ba8a; background: rgba(255,255,255,.2); }
    .dg-slot.placed { opacity: 0.4; pointer-events: none; }
    .dg-entity { position: absolute; left: 0; top: 0; width: 32px; height: 32px; transform: translate(-50%, -50%); user-select: none; touch-action: none; will-change: transform; transition: none !important; cursor: default; }
    .dg-entity img { width: 100%; height: 100%; image-rendering: pixelated; pointer-events: none; }
    .dg-entity.flip img, .dg-entity.flip svg { transform: scaleX(-1); }
    @media (max-width: 640px) {
      #win, .dungeon-win { left: 0 !important; top: 0 !important; width: 100vw; height: 100vh; height: 100dvh; max-height: none; border: none; border-radius: 0; outline: none; }
      .dungeon-view { padding: 4px; }
      .dg-dock { height: 68px; padding: 0 8px; gap: 8px; }
      .dg-slot { width: 52px; height: 52px; }
    }
    .dg-hp-bar { position: absolute; top: -12px; left: -4px; width: 40px; height: 4px; background: #333; border: 1px solid #111; border-radius: 2px; overflow: hidden; z-index: 2; }
    .dg-hp-fill { height: 100%; background: #a4dc8c; transition: width 0.1s; }
    .dg-cd-bar { position: absolute; top: -7px; left: -4px; width: 40px; height: 3px; background: #333; border: 1px solid #111; border-radius: 1.5px; overflow: hidden; z-index: 2; }
    .dg-cd-fill { height: 100%; background: #ffeb3b; }
    .dg-skill-cd-bar { position: absolute; top: -3px; left: 0px; width: 32px; height: 2px; background: #333; border: 1px solid #111; border-radius: 1px; overflow: hidden; z-index: 2; }
    .dg-skill-cd-fill { height: 100%; background: #00bcd4; }
    .dg-entity.enemy .dg-hp-fill { background: #e06578; }
    .dg-dmg { position: absolute; left: 0; top: 0; font-size: 14px; font-weight: bold; color: #ff4444; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff; pointer-events: none; z-index: 10; animation: dmgFloat 0.8s ease-out forwards; }
    .dg-dmg.heal { color: #a4dc8c; }
    .dg-dmg.crit { color: #ff9800; font-size: 18px; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000; z-index: 15; }
    @keyframes dmgFloat { 0% { opacity: 1; transform: translate(-50%, 0) scale(0.5); } 20% { transform: translate(-50%, -15px) scale(1.2); } 100% { opacity: 0; transform: translate(-50%, -30px) scale(1); } }
    .dg-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 30; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; overflow-y: auto; padding: 15px; box-sizing: border-box; }

    /* Shop UI */
    .dg-overlay *::-webkit-scrollbar { width: 6px; height: 6px; }
    .dg-overlay *::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 3px; }
    .dg-overlay *::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
    .dg-shop-box { display: flex; flex-direction: column; width: 100%; height: 100%; max-width: 800px; max-height: 85vh; background: #1a1a1e; border: 2px solid #3a3a40; border-radius: 16px; padding: 20px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.7); }
    
    .dg-shop-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 15px; flex-shrink: 0; }
    .dg-shop-header-left { display: flex; gap: 15px; align-items: center; }
    .dg-shop-title { color: #ffd94d; margin: 0; font-size: 20px; font-weight: bold; }
    .dg-shop-gold { background: #25252b; color: #a4dc8c; font-size: 18px; font-weight: bold; padding: 6px 16px; border-radius: 20px; border: 1px solid #3a3a40; display: flex; align-items: center; gap: 6px; }
    .dg-shop-next-btn { background: linear-gradient(to bottom, #2196f3, #1976d2); color: white; padding: 10px 20px; font-size: 15px; font-weight: bold; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: 0.2s; flex-shrink: 0; }
    .dg-shop-next-btn:hover { filter: brightness(1.1); transform: scale(1.05); }
    .dg-shop-next-btn:active { transform: scale(0.95); }

    .dg-shop-content { display: flex; flex: 1; min-height: 0; gap: 20px; }
    
    .dg-shop-left { width: 100px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-right: 10px; border-right: 2px solid #333; flex-shrink: 0; }
    .dg-shop-pet { background: #25252b; border: 2px solid transparent; border-radius: 12px; cursor: pointer; padding: 8px; text-align: center; transition: 0.2s; flex-shrink: 0; }
    .dg-shop-pet:hover { background: #303038; }
    .dg-shop-pet.selected { border-color: #ffd94d; background: #353540; }
    .dg-shop-pet .lv { font-size: 11px; font-weight: bold; color: #888; margin-top: 4px; }
    .dg-shop-pet .dmg-stats { display: flex; flex-direction: column; gap: 2px; font-size: 9px; line-height: 1; margin-top: 4px; text-align: left; background: rgba(0,0,0,0.3); padding: 3px; border-radius: 4px; }
    .dg-shop-pet.selected .lv { color: #ffd94d; }
    
    .dg-shop-right { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; }
    .dg-shop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; flex: 1; margin-bottom: 10px; align-content: start; overflow-y: auto; min-height: 0; padding-right: 8px; }
    .dg-shop-grid::-webkit-scrollbar { width: 6px; }
    .dg-shop-grid::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 3px; }
    .dg-shop-grid::-webkit-scrollbar-thumb { background: #b08a5c; border-radius: 3px; }
    .dg-shop-card { background: linear-gradient(145deg, #25252b, #1e1e24); border: 1px solid #3a3a40; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center; transition: transform 0.2s; }
    .dg-shop-card:hover { border-color: #555; transform: translateY(-2px); }
    .dg-shop-stat-name { color: #999; font-size: 12px; font-weight: bold; margin-bottom: 4px; }
    .dg-shop-stat-val { color: white; font-size: 18px; font-weight: bold; }
    .dg-btn-buy { background: linear-gradient(to bottom, #4caf50, #388e3c); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 14px; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .dg-btn-buy:disabled { background: #444; color: #888; cursor: not-allowed; box-shadow: none; }
    .dg-btn-buy:not(:disabled):hover { filter: brightness(1.1); transform: scale(1.05); }
    .dg-btn-buy:not(:disabled):active { transform: scale(0.95); }
    @media (max-width: 640px) {
      .dg-shop-box { max-height: 95vh; padding: 15px; }
      .dg-shop-content { flex-direction: column; gap: 15px; }
      .dg-shop-left { width: 100%; flex-direction: row; border-right: none; border-bottom: 2px solid #333; padding-right: 0; padding-bottom: 12px; overflow-x: auto; overflow-y: hidden; }
      .dg-shop-pet { padding: 6px; }
      .dg-shop-header-left { flex-direction: column; align-items: flex-start; gap: 5px; }
      .dg-shop-title { font-size: 16px; }
      .dg-shop-gold { font-size: 16px; padding: 4px 12px; }
      .dg-shop-next-btn { padding: 8px 12px; font-size: 14px; }
      .dg-shop-grid { grid-template-columns: 1fr; gap: 10px; }
      .dg-shop-card { padding: 12px; }
    }
    .dg-title { font-size: 24px; font-weight: bold; color: #ffd94d; text-shadow: 0 4px 10px rgba(0,0,0,0.8); letter-spacing: 1px; text-align: center; margin-top: auto; }
    .dg-dock::-webkit-scrollbar { height: 8px; display: block; }
    .dg-dock::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
    .dg-dock::-webkit-scrollbar-thumb { background: #b08a5c; border-radius: 4px; }
    .dg-info-panel { position: absolute; top: 0; right: 0; bottom: 0; width: 250px; background: rgba(40,35,50,0.95); border-left: 2px solid #b08a5c; z-index: 30; padding: 10px; color: white; display: flex; flex-direction: column; overflow-y: auto; }
    .dg-info-panel::-webkit-scrollbar { width: 6px; }
    .dg-info-panel::-webkit-scrollbar-track { background: transparent; }
    .dg-info-panel::-webkit-scrollbar-thumb { background: #b08a5c; border-radius: 3px; }
    .dg-info-panel h3 { margin: 0 0 10px 0; color: #ffd94d; font-size: 16px; text-align: center; border-bottom: 1px solid #665; padding-bottom: 5px; }
    .dg-info-close { position: absolute; top: 5px; right: 10px; cursor: pointer; font-size: 20px; font-weight: bold; color: #aaa; }
    .dg-info-close:hover { color: white; }
    .dg-info-item { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 15px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; }
    .dg-info-item-icon { width: 40px; height: 40px; flex-shrink: 0; background: rgba(0,0,0,0.2); border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    .dg-info-item-desc { font-size: 11px; line-height: 1.3; color: #ddd; }
    .dg-info-item-desc b { color: #a4dc8c; font-size: 13px; display: block; margin-bottom: 2px; }
    
    .dg-projectile { position: absolute; left: 0; top: 0; width: 16px; height: 16px; pointer-events: none; z-index: 5; transform: translate(-50%, -50%); }
    .dg-projectile img, .dg-projectile svg { width: 100%; height: 100%; }
    
    .dg-status { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); display: flex; gap: 2px; pointer-events: none; z-index: 3; }
    .dg-status-icon { width: 10px; height: 10px; border-radius: 50%; border: 1px solid #000; }
    .dg-status-stun { background: #ffd700; box-shadow: 0 0 4px #ffd700; }
    .dg-status-poison { background: #9932cc; box-shadow: 0 0 4px #9932cc; }
    .dg-status-freeze { background: #00ffff; box-shadow: 0 0 4px #00ffff; }
    .dg-status-root { background: #8b4513; box-shadow: 0 0 4px #8b4513; }
    .dg-status-taunt { background: #ff4500; box-shadow: 0 0 4px #ff4500; }
    .dg-status-buff { background: #ff8c00; box-shadow: 0 0 4px #ff8c00; }
    
    @keyframes dgHop {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }
    .dg-entity.walk > svg, .dg-entity.walk > img { animation: dgHop 0.3s linear infinite; }
    
    @keyframes dgAttack {
        0% { transform: scale(1); }
        50% { transform: scale(1.2) rotate(15deg); }
        100% { transform: scale(1); }
    }
    .dg-entity.attack > svg, .dg-entity.attack > img { animation: dgAttack 0.2s ease-out forwards; }
    
    .dg-reward-card { background: #3c2a20; border: 2px solid #b08a5c; padding: 8px; border-radius: 8px; flex: 1 1 90px; min-width: 90px; max-width: 140px; text-align: center; cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; }
    .dg-reward-card:hover { transform: scale(1.05); border-color: #ffda66; background: #4e382d; }
    .dg-reward-card h4 { margin: 0 0 5px 0; color: #ffda66; font-size: 14px; }
    .dg-reward-card p { margin: 0; font-size: 11px; color: #fff; line-height: 1.3; }
    
    .dg-hud { position: absolute; top: 8px; left: 10px; z-index: 25; background: rgba(0,0,0,0.6); padding: 4px 12px; border-radius: 6px; font-size: 13px; color: white; pointer-events: none; }
    
    .dg-boss-banner { position: absolute; inset: 0; z-index: 30; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; color: #ff2222; text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000; letter-spacing: 4px; animation: bossBlink 0.5s ease-in-out infinite alternate; pointer-events: none; background: rgba(0,0,0,0.5); }
    @keyframes bossBlink { 0% { opacity: 0.6; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1.05); } }
    
    .dg-dmg.miss { color: #aaaaaa; font-style: italic; font-size: 13px; }
    
    .dg-new-record { color: #ffd700; font-size: 22px; font-weight: bold; text-shadow: 0 0 15px #ffd700, 0 0 30px #ff8c00; animation: newRecordPulse 0.8s ease-in-out infinite alternate; margin: 5px 0; }
    @keyframes newRecordPulse { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
    
    .betwrap { text-align: center; }
    .betnum { font-size: 40px; font-weight: bold; color: #7a5c38; line-height: 1.1;
      background: linear-gradient(#fffaf0, #f0dcc0); border: 3px solid #b08a5c; border-radius: 10px;
      width: 96px; margin: 6px auto; padding: 8px 0; box-shadow: inset 0 0 0 2px #fff6e0; }
    .betnum.rolling { animation: gachaShake 0.12s infinite alternate; }
    .betnum.res { border-color: #c86a1a; box-shadow: inset 0 0 0 2px #fff6e0, 0 0 10px rgba(200,106,26,.45); }
    .betresult { font-size: 12px; font-weight: bold; color: #7a5c38; min-height: 16px; margin-bottom: 2px; }
    .betchain { font-size: 11px; color: #9a7a54; min-height: 15px; word-break: break-all; }
    .betpot { font-size: 15px; font-weight: bold; color: #c86a1a; margin: 8px 0 4px; }
    
    .hero-pet-roster-list { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; padding: 4px; border: 1px solid #4a3461; border-radius: 4px; background: rgba(0,0,0,0.2); }
    .hero-roster-item { display: flex; align-items: center; justify-content: space-between; padding: 6px; background: #2c2538; border: 1px solid #4a3461; border-radius: 4px; }
    .hero-roster-item.used { opacity: 0.5; filter: grayscale(0.5); }
    .h-r-pet { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); border-radius: 4px; cursor: pointer; }
    .h-r-pet:hover { background: rgba(255,255,255,0.1); }
    .h-r-info { flex: 1; margin: 0 10px; font-size: 11px; color: #d0c0e8; }
    .h-r-bar { width: 100%; height: 10px; background: #110d14; border: 1px solid #4a3461; border-radius: 3px; position: relative; overflow: hidden; margin-top: 4px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: white; }
    .h-r-fill { position: absolute; left: 0; top: 0; bottom: 0; background: linear-gradient(90deg, #6b4d8a, #a58bd3); z-index: 0; transition: width 0.3s; }
    .h-r-bar span { position: relative; z-index: 1; text-shadow: 0 1px 1px #000; }
    .h-r-upg { display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #3b2a52; border: 1px solid #6b4d8a; border-radius: 4px; cursor: pointer; color: #f2c231; font-weight: bold; font-size: 11px; }
    .h-r-upg:hover { background: #5a417d; }
    .h-r-upg:active { transform: translateY(1px); }
    
    .s-lv { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); font-size: 10px; background: #1f1a26; padding: 1px 4px; border: 1px solid #4a3461; border-radius: 4px; font-weight: bold; color: white; }
    
    /* ---------- Hero Taskbar Mode ---------- */
    .hero-bar { position: fixed; bottom: 20px; right: 20px; width: 400px; height: 120px; background: #221d28; border: 3px solid #6b4d8a; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.1); z-index: 999999; display: flex; align-items: center; padding-right: 4px; overflow: hidden; pointer-events: auto; touch-action: none; font-family: sans-serif; }
    .hero-toast { position: absolute; left: 50%; top: 4px; transform: translateX(-50%); background: rgba(31, 26, 38, 0.95); border: 1px solid #8a6bc8; color: #fff; padding: 2px 10px; border-radius: 8px; font-weight: bold; font-size: 11px; z-index: 1000; pointer-events: none; opacity: 0; transition: opacity 0.3s, top 0.3s; white-space: nowrap; }
    .hero-toast.show { opacity: 1; top: 10px; }
    .hero-drag { width: 24px; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); border-right: 1px solid #4a3461; cursor: grab; color: #a58bd3; font-size: 14px; }
    .hero-drag:active { cursor: grabbing; background: rgba(0,0,0,0.5); }
    .hero-content { flex: 1; display: flex; flex-direction: column; height: 100%; position: relative; }
    .hero-bar.minimized { width: auto; height: 32px; border-radius: 16px; padding: 0; background: transparent; border: none; box-shadow: none; pointer-events: none; }
    .hero-bar.minimized .hero-drag { height: 32px; width: 32px; border-radius: 16px; border: 2px solid #6b4d8a; background: #221d28; box-shadow: 0 4px 15px rgba(0,0,0,0.8); pointer-events: auto; }
    .hero-bar.minimized .hero-toast, .hero-bar.minimized .hero-content, .hero-bar.minimized .hero-actions { display: none !important; }
    
    .hero-scene { flex: 1; position: relative; min-height: 0; overflow: hidden; }
    .hero-bg { position: absolute; inset: 0; background: repeating-linear-gradient(-45deg, #221c2d, #221c2d 20px, #1d1726 20px, #1d1726 40px); opacity: 0.8; animation: bgScroll 10s linear infinite; }
    @keyframes bgScroll { 0% { background-position: 0 0; } 100% { background-position: -200px 0; } }
    .hero-scene::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, rgba(44,37,56,0.8)); z-index: 0; pointer-events: none; }
    .hero-scene::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 16px; background: #3b2a52; border-top: 2px solid #6b4d8a; z-index: 0; }
    
    #hero-party { position: absolute; left: 10px; bottom: 16px; z-index: 1; display: flex; gap: 8px; align-items: flex-end; height: 45px; }
    #hero-enemy { position: absolute; left: 0px; bottom: 16px; z-index: 1; display: flex; align-items: flex-end; height: 45px; }
    
    .hero-pet, .hero-mob { display: flex; flex-direction: column; align-items: center; position: relative; left: 0; bottom: 0; justify-content: flex-end; will-change: transform; }
    .hero-mob { cursor: pointer; }
    .hero-pet svg, .hero-mob svg, .hero-pet img, .hero-mob img { display: block; height: 32px; width: auto; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5)); transform-origin: bottom center; margin-bottom: 2px; }
    
    .hp-bar-mini { width: 32px; height: 4px; background: #111; border-radius: 2px; overflow: hidden; margin-bottom: 2px; border: 1px solid #000; }
    .hp-fill-mini { height: 100%; background: #4caf50; transition: width 0.2s; }
    .hero-mob .hp-fill-mini { background: #f44336; }
    .cd-fill-mini { height: 100%; background: #ff9800; }
    
    .dmg-float { position: absolute; font-weight: bold; color: #ff5252; text-shadow: 0 0 2px #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000; font-size: 14px; pointer-events: none; animation: dmgFloat 0.8s ease-out forwards; z-index: 10; transform: translate(-50%, 0); display: flex; align-items: center; justify-content: center; gap: 2px; }
    .dmg-float.crit { font-size: 18px; color: #ffeb3b; }
    .dmg-float.drop { color: #4caf50; animation: dmgFloat 1.2s ease-out forwards; font-size: 13px; }
    .dg-projectile { position: absolute; left: 0; top: 0; pointer-events: none; z-index: 9; }
    @keyframes dmgFloat { 0% { opacity: 1; transform: translate(-50%, 0) scale(1); } 50% { opacity: 1; transform: translate(-50%, -20px) scale(1.1); } 100% { opacity: 0; transform: translate(-50%, -30px) scale(1); } }
    
    /* Animations */
    .hero-pet.idle svg, .hero-pet.idle img { animation: petBreathe 2s ease-in-out infinite; }
    .hero-pet.idle:nth-child(2) svg, .hero-pet.idle:nth-child(2) img { animation-delay: 0.3s; }
    .hero-pet.idle:nth-child(3) svg, .hero-pet.idle:nth-child(3) img { animation-delay: 0.6s; }
    .hero-pet.attack svg, .hero-pet.attack img { animation: petAttack 0.3s ease-in-out; }
    
    .hero-mob.idle svg, .hero-mob.idle img { animation: petBreathe 2.5s ease-in-out infinite alternate-reverse; }
    .hero-mob.hurt svg, .hero-mob.hurt img { animation: mobHurt 0.2s ease-in-out; }
    .hero-mob.attack svg, .hero-mob.attack img { animation: mobAttack 0.3s ease-out; }
    
    @keyframes petBreathe { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.9) scaleX(1.05); } }
    @keyframes petAttack { 0% { transform: translateY(0) translateX(0) rotate(0); } 30% { transform: translateY(-8px) translateX(8px) rotate(10deg); } 100% { transform: translateY(0) translateX(0) rotate(0); } }
    @keyframes mobAttack { 0% { transform: translateX(0); } 50% { transform: translateX(-20px) scale(1.1); } 100% { transform: translateX(0); } }
    @keyframes mobHurt { 0% { transform: translateX(0); filter: brightness(1) drop-shadow(0 2px 2px rgba(0,0,0,0.5)); } 50% { transform: translateX(3px); filter: brightness(2) drop-shadow(0 2px 2px rgba(0,0,0,0.5)); } 100% { transform: translateX(0); filter: brightness(1) drop-shadow(0 2px 2px rgba(0,0,0,0.5)); } }
    
    .hero-stats { height: 24px; border-top: 1px solid #4a3461; background: #1f1a26; padding: 0 8px; display: flex; align-items: center; z-index: 1; font-size: 11px; color: #d0c0e8; font-weight: bold; }
    .hero-stats-row { display: flex; align-items: center; width: 100%; gap: 8px; }
    .h-lv { min-width: 26px; }
    .h-gold { color: #f2c231; display: inline-flex; align-items: center; gap: 4px; min-width: 40px; justify-content: flex-end; }
    .h-gold svg { fill: #f2c231; }
    .hero-exp-wrap { flex: 1; height: 12px; background: #110d14; border: 1px solid #4a3461; border-radius: 4px; position: relative; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.5); }
    .hero-exp-bar { height: 100%; background: linear-gradient(90deg, #6b4d8a, #a58bd3); width: 0%; transition: width 0.3s; }
    .hero-exp-txt { position: absolute; inset: 0; font-size: 9px; display: flex; align-items: center; justify-content: center; color: #fff; text-shadow: 0 1px 1px #000; letter-spacing: 0.5px; }
    .hero-actions { display: flex; flex-direction: column; justify-content: space-around; width: 30px; height: 100%; padding: 4px 0; border-left: 1px solid #4a3461; background: #191420; }
    .h-btn { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: #3b2a52; border: 1px solid #6b4d8a; border-radius: 4px; cursor: pointer; color: #e0ccff; font-weight: bold; font-size: 16px; margin: 0 auto; fill: #e0ccff; }
    .h-btn:hover { background: #5a417d; }
    .h-btn:active { background: #2c2538; transform: translateY(1px); }
    .dmg-float { position: absolute; font-weight: bold; font-size: 13px; color: #ff5555; text-shadow: 0 1px 2px #000, 0 0 2px #000; animation: dFloat 0.8s forwards; z-index: 10; pointer-events: none; }
    .dmg-float.heal { color: #55ff55; }
    .dmg-float.drop { color: #55ffff; font-size: 15px; animation: dDrop 1.2s forwards; }
    @keyframes dDrop { 0% { opacity: 1; transform: translateY(0) scale(0.5); } 20% { transform: translateY(-20px) scale(1.2); } 100% { opacity: 0; transform: translateY(-30px) scale(1); } }
    .dmg-float.crit { font-size: 16px; color: #ffaa00; font-style: italic; }
    @keyframes dFloat { 0% { opacity: 1; transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.2); } 100% { opacity: 0; transform: translateY(-20px) scale(1); } }

    /* ---------- Hero Panel (Modal) ---------- */
    .hero-modal-wrapper { background: #1f1a28; color: #d4e3f0; margin: -10px -12px -12px; padding: 12px 14px 14px; border-radius: 0 0 6px 6px; min-height: 100%; font-family: sans-serif; }
    .hero-panel-stats { display: flex; justify-content: space-around; background: #2c2538; padding: 10px; border-radius: 8px; margin-bottom: 10px; font-weight: bold; color: #e0ccff; border: 1px solid #4a3461; }
    .hero-panel-section { font-size: 13px; color: #a58bd3; font-weight: bold; margin: 12px 0 6px; text-transform: uppercase; letter-spacing: 1px; }
    .hero-party-slots { display: flex; gap: 10px; justify-content: center; margin-bottom: 15px; }
    .hero-slot { width: 60px; height: 60px; background: #191420; border: 2px dashed #4a3461; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b4d8a; font-size: 11px; }
    .hero-slot.filled { border: 2px solid #a58bd3; background: #2c2538; }
    .hero-slot.filled:hover { border-color: #ff5555; background: #3b1a20; }
    .hero-pet-roster { display: flex; flex-wrap: wrap; gap: 8px; max-height: 120px; overflow-y: auto; padding: 4px; background: #191420; border-radius: 8px; border: 1px solid #3b2a52; }
    .hero-roster-pet { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #2c2538; border: 2px solid transparent; border-radius: 6px; cursor: pointer; }
    .hero-roster-pet:hover { background: #3b2a52; border-color: #a58bd3; }
    .hero-roster-pet.used { opacity: 0.3; cursor: not-allowed; filter: grayscale(1); }
    .hero-style-list { display: flex; gap: 8px; }
    .hero-style-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #191420; border: 2px solid #3b2a52; padding: 8px; border-radius: 8px; cursor: pointer; color: #a58bd3; font-size: 11px; font-weight: bold; gap: 4px; }
    .hero-style-btn:hover { background: #2c2538; }
    .hero-style-btn.active { border-color: #f2c231; color: #f2c231; background: #3b2a10; }
    .hero-style-btn svg { fill: currentColor; }
    .hero-deploy-btn { margin-top: 20px; width: 100%; padding: 12px; font-size: 16px; font-weight: bold; background: linear-gradient(to bottom, #6b4d8a, #4a3461); border: 2px solid #a58bd3; border-radius: 8px; color: #fff; cursor: pointer; text-shadow: 0 1px 2px #000; letter-spacing: 2px; }
    .hero-deploy-btn:hover { background: linear-gradient(to bottom, #8a6bc8, #6b4d8a); }
    .hero-deploy-btn:active { transform: translateY(2px); }
    
    .p-skill-tier { display: flex; gap: 12px; padding: 10px; border-radius: 8px; border: 2px solid #3b2a52; background: #191420; align-items: center; }
    .p-skill-tier.locked { opacity: 0.5; filter: grayscale(1); border-style: dashed; }
    .p-skill-tier.unlocked { border-color: #6b4d8a; }
    .p-sk-icon { width: 32px; height: 32px; flex-shrink: 0; display:flex; align-items:center; justify-content:center; }
    .p-sk-desc { flex: 1; text-align: left; }

    .betsides { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
    .betside { padding: 10px 4px; border-radius: 8px; border: 3px solid; cursor: pointer;
      font-weight: bold; user-select: none; line-height: 1.35; }
    .betside.hi { background: #e8f3dc; border-color: #4e903a; color: #3c702c; }
    .betside.lo { background: #f6e0e6; border-color: #a83a52; color: #8a2a40; }
    .betside .mult { display: block; font-size: 17px; }
    .betside .chance { display: block; font-size: 11px; opacity: .75; font-weight: normal; }
    .betside.off { opacity: .4; cursor: not-allowed; filter: grayscale(1); }
    
    /* Hero UI Improvements */
    .hero-bars-container { display: flex; flex-direction: column; width: 100%; gap: 1px; margin-top: 2px; }
    .hero-bar-row { height: 4px; width: 100%; background: #110d14; border: 1px solid #4a3461; border-radius: 2px; position: relative; overflow: hidden; }
    .hero-bar-fill { height: 100%; width: 0%; transition: width 0.1s linear; }
    .fill-cd { background: linear-gradient(90deg, #d38b24, #e8b958); }
    .fill-sk { background: linear-gradient(90deg, #4a3461, #8a6bc8); }

    /* Combat Effects */
    .fx-slash { position: absolute; pointer-events: none; z-index: 11; transform: translate(-50%, -50%); animation: fxSlash 0.2s ease-out forwards; }
    @keyframes fxSlash { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5) rotate(-30deg); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5) rotate(20deg); } }
    
    .fx-impact { position: absolute; pointer-events: none; z-index: 11; transform: translate(-50%, -50%); animation: fxImpact 0.25s ease-out forwards; }
    @keyframes fxImpact { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.2); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); } }

    .fx-heal { position: absolute; pointer-events: none; z-index: 11; transform: translate(-50%, -50%); animation: fxHeal 1s ease-out forwards; }
    @keyframes fxHeal { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -150%) scale(1.2); } }

    .fx-buff { position: absolute; pointer-events: none; z-index: 11; transform: translate(-50%, -50%); animation: fxBuff 0.8s ease-out forwards; }
    @keyframes fxBuff { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: hue-rotate(0deg); } 100% { opacity: 0; transform: translate(-50%, -80%) scale(1.5); filter: hue-rotate(90deg); } }

    .fx-stun { position: absolute; pointer-events: none; z-index: 11; transform: translate(-50%, -100%); animation: fxStun 1s linear infinite; }
    @keyframes fxStun { 0% { transform: translate(-50%, -100%) rotate(0deg); } 100% { transform: translate(-50%, -100%) rotate(360deg); } }

    .laser-beam { position: absolute; height: 4px; background: #ff88dd; z-index: 8; transform-origin: left center; pointer-events: none; animation: fxLaser 0.3s ease-out forwards; box-shadow: 0 0 8px #ff88dd, 0 0 15px #ff88dd; }
    @keyframes fxLaser { 0% { opacity: 1; transform: scaleY(1); } 100% { opacity: 0; transform: scaleY(3); } }

    .pet-bump { animation: petBump 0.2s ease-out; }
    @keyframes petBump { 0% { transform: translateX(0); } 50% { transform: translateX(12px) scale(1.1); } 100% { transform: translateX(0); } }
    
    /* Giao d\u1ECBch P2P */
    .trade-split { display: flex; gap: 10px; margin-bottom: 10px; min-height: 250px; }
    .trade-col { flex: 1; background: #faf0dc; border: 2px solid #c2a274; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; }
    .trade-header { font-size: 13px; font-weight: bold; color: #7a5c38; border-bottom: 2px dashed #d9c49a; padding-bottom: 5px; margin-bottom: 8px; text-align: center; }
    .trade-items { flex: 1; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 200px; }
    .trade-actions { margin-top: 10px; border-top: 2px dashed #d9c49a; padding-top: 10px; }
    .trade-item { display: flex; align-items: center; gap: 6px; padding: 4px 6px; background: #fffdf4; border: 1px solid #d9c49a; border-radius: 6px; }
    .trade-pick { display: flex; align-items: center; gap: 6px; padding: 6px; background: #fffdf4; border: 2px solid #d9c49a; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; color: #6b4f2e; }
    .trade-pick:hover { border-color: var(--accLine); background: var(--accBg); color: var(--accFg); }
    @media (max-width: 640px) {
        .trade-split { flex-direction: column; }
    }
    
    /* Thi\xEAn Ki\u1EBFp (Tribulation) */
    .trib-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; transition: opacity 0.5s; }
    .trib-cloud { position: absolute; top: 10%; width: 200vw; height: 30vh; background: radial-gradient(ellipse at center, rgba(30,30,40,0.9) 0%, rgba(10,10,15,0) 70%); filter: blur(20px); animation: tribCloudMove 10s linear infinite; pointer-events: none; z-index: 1; }
    @keyframes tribCloudMove { 0% { transform: translateX(-100vw); } 100% { transform: translateX(100vw); } }
    .trib-lightning { position: absolute; inset: 0; background: white; opacity: 0; pointer-events: none; z-index: 2; }
    .trib-lightning.strike { animation: tribStrike 1.5s ease-out; }
    @keyframes tribStrike { 0%, 10%, 20% { opacity: 0; } 5%, 15% { opacity: 0.9; } 25% { opacity: 1; } 100% { opacity: 0; } }
    .trib-content { position: relative; z-index: 10; background: linear-gradient(135deg, #1c1c1c, #3a0000); border: 3px solid #ff3b3b; border-radius: 12px; padding: 25px; text-align: center; color: #fff; max-width: 90vw; width: 400px; box-shadow: 0 0 30px rgba(255,59,59,0.4), inset 0 0 15px rgba(255,0,0,0.2); animation: tribPop 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
    @keyframes tribPop { 0% { opacity: 0; transform: scale(0.8) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
    .trib-title { font-size: 22px; font-weight: bold; color: #ff5e5e; margin-bottom: 10px; text-shadow: 0 0 10px #ff0000; letter-spacing: 2px; }
    .trib-text { font-size: 14px; line-height: 1.6; color: #e0e0e0; margin-bottom: 20px; }
    .trib-btn { display: block; width: 100%; padding: 12px; margin: 10px 0; border: none; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .trib-btn-sub { background: linear-gradient(#d38b24, #a36510); color: #fff; box-shadow: 0 4px 0 #7a4a0a; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
    .trib-btn-sub:active { transform: translateY(4px); box-shadow: 0 0 0 #7a4a0a; }
    .trib-btn-def { background: linear-gradient(#4a3461, #2a1a40); color: #c4a0e8; border: 1px solid #7a4aaa; }
    .trib-btn-def:hover { background: linear-gradient(#5a4070, #3a2550); }
    .trib-btn-def:active { transform: translateY(2px); }
`;
  }
});

// src/ui.js
function applyTheme() {
  ctx.ui.classList.remove("theme-sakura", "theme-sky");
  ctx.ui.classList.add("theme-" + (ctx.S && ctx.S.theme === "sky" ? "sky" : "sakura"));
}
function applyPageSkin() {
  const isExplore = ctx.S && ctx.S.view === "explore";
  fieldEl.classList.toggle("pg2", !isExplore && ctx.S.page === 2);
  fieldEl.classList.toggle("pg3", !isExplore && ctx.S.page === 3);
  const titleH1 = sh.querySelector(".titlebar h1");
  if (isExplore) {
    fieldEl.style.backgroundImage = "none";
    fieldEl.style.backgroundColor = "#d3c3a0";
    if (titleH1) titleH1.innerHTML = `${spriteSVG("mapIcon", 16)}D\u1EA1o quanh n\xE0o...`;
  } else {
    fieldEl.style.backgroundImage = tileURI(ctx.S.page === 2 ? "water" : ctx.S.page === 3 ? "mine" : "grass", 4242);
    fieldEl.style.backgroundColor = "";
    if (titleH1) titleH1.innerHTML = `${spriteSVG("strawhat", 16)}Ai m\xE0 th\xE8m l\xE0m n\xF4ng d\xE2n ch\u1EE9!`;
  }
  fieldEl.style.backgroundSize = "192px 192px";
}
function applyViewState() {
  const isExplore = ctx.S && ctx.S.view === "explore";
  const ctrlrow = sh.querySelector(".ctrlrow");
  const mascots = $id("mascots");
  const witch = $id("witch");
  const banner = $id("banner");
  const viewToggle = $id("viewToggle");
  const statBlocks = $id("stat-blocks");
  if (ctrlrow) ctrlrow.style.display = isExplore ? "none" : "flex";
  if (mascots) mascots.style.display = isExplore ? "none" : "";
  if (decoLayer) decoLayer.style.display = isExplore ? "none" : "";
  if (witch) witch.style.display = isExplore ? "none" : "";
  if (banner) banner.style.display = isExplore ? "none" : "";
  if (statBlocks) statBlocks.style.display = isExplore ? "none" : "";
  const field = sh.querySelector(".field");
  if (field) {
    if (isExplore) field.classList.add("explore-mode");
    else field.classList.remove("explore-mode");
  }
  if (viewToggle) {
    viewToggle.innerHTML = isExplore ? `${spriteSVG("strawhat", 16)} <span>V\u1EC1 N\xF4ng Tr\u1EA1i</span>` : `${spriteSVG("mapIcon", 16)} <span>Kh\xE1m ph\xE1</span>`;
  }
}
function renderPager() {
  const pager = $id("pager");
  if (ctx.S && ctx.S.view === "explore") {
    pager.style.display = "none";
    return;
  }
  pager.style.display = "flex";
  const names = { 1: "\u0110\u1ED3ng c\u1ECF", 2: "V\xF9ng n\u01B0\u1EDBc", 3: "Khu m\u1ECF" };
  pager.innerHTML = [1, 2, 3].map((pg) => {
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
      <div class="view-toggle" id="viewToggle" title="Chuy\u1EC3n ch\u1EBF \u0111\u1ED9 Kh\xE1m ph\xE1/N\xF4ng tr\u1EA1i">${spriteSVG("mapIcon", 16)} <span>Kh\xE1m ph\xE1</span></div>
      <div class="close-x" id="close">\xD7</div>
    </div>
    <div class="statusbar">
      <span class="stat">${spriteSVG("coin", 22)}<b id="coins">0</b></span>
      <span class="stat"><span id="wicon">${spriteSVG("sun", 22)}</span><span id="daytxt"></span></span>
      <span class="stat" id="stat-blocks">${spriteSVG("sprout", 18)}Ru\u1ED9ng <span id="blocktxt"></span></span>
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
        <div class="explore-blocks" id="explore-blocks" style="display:none"></div>
        <div class="mascots" id="mascots"></div>
        <div id="witch" title="Ph\xF9 thu\u1EF7 tr\xF2n"></div>
        <div class="mode-tip" id="modetip"></div>
        <div class="toolbar" id="toolbar"></div>
      </div>
    </div>
    <div class="bottombar">
        <div class="btn" data-open="shop">${spriteSVG("shopIcon", 22)}C\u1EEDa h\xE0ng</div>
        <div class="btn" data-open="bag">${spriteSVG("bagIcon", 22)}Balo</div>
        <div class="btn" data-open="gacha">${spriteSVG("gachapon", 22)}Gachapon</div>
        <div class="btn" data-open="trade">${spriteSVG("tradeIcon", 22)}Trade</div>
        <div class="btn" data-open="cfg">${spriteSVG("gearIcon", 22)}C\xE0i \u0111\u1EB7t</div>
    </div>
    <div class="modal" id="modal">
      <div class="mpanel">
        <div class="mtitle"><span id="mtitle-text"></span><span class="grow"></span><div class="close-x" id="mclose">\xD7</div></div>
        <div class="mbody" id="mbody"></div>
      </div>
    </div>
    
    <div class="modal" id="trade-win" onclick="if(event.target === this) FarmAll.closeTradeModal()">
      <div class="mpanel" style="width: min(600px, 96%);">
        <div class="mtitle"><span>Trao \u0111\u1ED5i</span><span class="grow"></span><div class="close-x" onclick="FarmAll.closeTradeModal()">\xD7</div></div>
        <div class="mbody" id="trade-body" style="min-height: 200px;"></div>
      </div>
    </div>
    
    <div class="modal" id="trade-popup" style="z-index: 35;" onclick="if(event.target === this) FarmAll.uiCloseAddItem()">
      <div class="mpanel" style="width: min(300px, 96%);">
        <div class="mtitle"><span>Th\xEAm \u0110\u1ED3</span><span class="grow"></span><div class="close-x" onclick="FarmAll.uiCloseAddItem()">\xD7</div></div>
        <div class="mbody" id="trade-popup-list" style="max-height: 300px; overflow-y: auto; display:flex; flex-direction:column; gap:6px;"></div>
        <div id="trade-popup-act" style="display:none; flex-direction:column; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 2px dashed #c9a273;">
            <div id="lbl-trade-sel" style="font-size: 11px; color:#7a5c38;"></div>
            <input type="number" id="inp-trade-amount" class="inp" min="1" value="1">
            <div class="buy" onclick="FarmAll.uiConfirmAdd()" style="text-align:center;">X\xE1c nh\u1EADn</div>
        </div>
      </div>
    </div>

    <div class="toast" id="toast"></div>
  </div>
  
  <div id="hero-bar" class="hero-bar" style="display:none">
    <div class="hero-drag" title="K\xE9o th\u1EA3" id="hero-drag"><svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor"><circle cx="3.5" cy="4" r="1.5"/><circle cx="8.5" cy="4" r="1.5"/><circle cx="3.5" cy="10" r="1.5"/><circle cx="8.5" cy="10" r="1.5"/><circle cx="3.5" cy="16" r="1.5"/><circle cx="8.5" cy="16" r="1.5"/></svg></div>
    <div class="hero-toast" id="hero-toast"></div>
    <div class="hero-content">
      <div class="hero-scene">
        <div class="hero-bg"></div>
        <div id="hero-party"></div>
        <div id="hero-enemy"></div>
      </div>
      <div class="hero-stats">
        <div class="hero-stats-row">
          <div class="h-lv">Stage <span id="hero-level">1</span></div>
          <div class="hero-exp-wrap" style="visibility:hidden;"><div class="hero-exp-bar" id="hero-exp-bar"></div><div class="hero-exp-txt" id="hero-exp">0/100</div></div>
          <div class="h-gold">${spriteSVG("coin", 12)}<span id="hero-gold">0</span></div>
        </div>
      </div>
    </div>
    <div class="hero-actions">
      <div class="h-btn" id="hero-cashout" title="R\xFAt V\xE0ng">${spriteSVG("coin", 16)}</div>
      <div class="h-btn" id="hero-close" title="\u0110\xF3ng Hero Mode">\xD7</div>
    </div>
  </div>
  
  <div id="dungeon-win" class="dungeon-win" style="display:none">
    <div class="titlebar" id="dungeon-drag">
      <h1>${spriteSVG("dungeonGate", 16)}Ai m\xE0 th\xE8m \u0111i Dungeon ch\u1EE9!</h1>
      <div class="close-x" id="dungeon-close">\xD7</div>
    </div>
    <div class="dungeon-view" id="dungeon-view"></div>
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
  dungeonView = $id("dungeon-view");
  ctx.ui.addEventListener("click", (e) => {
    const pager = $id("pager");
    if (pager && pager.classList.contains("open") && !e.target.closest("#pager")) pager.classList.remove("open");
  }, true);
  const pagerEl = $id("pager");
  if (pagerEl) pagerEl.addEventListener("click", (e) => {
    const pager = pagerEl;
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
    if (ctx.S && ctx.S.view === "explore") {
      swX = null;
      return;
    }
    if (e.touches.length === 1 && (!ctx.S.dragPet || !e.target.closest(".pet"))) {
      swX = e.touches[0].clientX;
      swY = e.touches[0].clientY;
    } else {
      swX = null;
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
  const viewToggle = $id("viewToggle");
  if (viewToggle) {
    viewToggle.addEventListener("click", () => {
      ctx.S.view = ctx.S.view === "explore" ? "farm" : "explore";
      save();
      applyPageSkin();
      applyViewState();
      renderPlots();
      renderToolbar();
      renderPager();
      toast(ctx.S.view === "explore" ? "B\u1EA3n \u0111\u1ED3 Kh\xE1m ph\xE1" : "Tr\u1EDF v\u1EC1 N\xF4ng tr\u1EA1i");
    });
  }
}
var root, sh, $id, fieldEl, decoLayer, fxLayer, dungeonView, swX, swY;
var init_ui = __esm({
  "src/ui.js"() {
    init_store();
    init_style();
    init_all();
    init_data();
    init_graphics();
    init_witch();
    init_state();
    init_render();
    init_utils();
    swX = null;
    swY = null;
  }
});

// src/logic.js
function growMs(cropId) {
  return TEST_MODE ? GROW : (CROPS[cropId]?.grow || 30) * MIN;
}
function regrowMs(cropId) {
  const c = CROPS[cropId] || {};
  return TEST_MODE ? REGROW : (c.regrowM || Math.round((c.grow || 30) * 0.6)) * MIN;
}
function plant(pi, cropId) {
  if ((ctx.S.seeds[cropId] || 0) <= 0) return toast("H\u1EBFt h\u1EA1t gi\u1ED1ng n\xE0y r\u1ED3i");
  let realId = cropId;
  if (cropId === "mystery") {
    const fam = ["dream", "key", "fang"][Math.floor(Math.random() * 3)];
    realId = fam + (ctx.S.page === 2 ? "W" : ctx.S.page === 3 ? "M" : "G");
  } else {
    const c2 = CROPS[cropId];
    if (!c2) {
      toast("H\u1EA1t gi\u1ED1ng n\xE0y \u0111\xE3 h\u1ECFng (kh\xF4ng t\u1ED3n t\u1EA1i trong phi\xEAn b\u1EA3n n\xE0y)!");
      ctx.S.seeds[cropId] = 0;
      return;
    }
    const z = c2.zone || 1;
    if (z !== ctx.S.page) return toast(c2.name + " ph\u1EA3i tr\u1ED3ng \u1EDF " + ZONE_NAME[z] + " (trang " + z + ")");
  }
  ctx.S.seeds[cropId]--;
  const g = growMs(realId);
  const c = { id: realId, matureAt: now() + g, wateredUntil: 0, fertUsed: {} };
  if (CROPS[realId] && CROPS[realId].regrow) c.left = REGROW_MAX;
  if (isRain()) {
    c.matureAt = now() + g * 0.9;
    c.rainDay = gameDay();
  }
  const ev = todayEvent();
  if (ev && ev.time_mult !== 1 && (!ev.favored_crop || CROPS[realId] && CROPS[realId].name === ev.favored_crop)) {
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
  if (key.startsWith("unique@")) {
    return ctx.S.uniques?.[key]?.name || "V\u1EADt ph\u1EA9m Gacha";
  }
  const parts = key.split("@");
  return (parts[1] ? parts[1] + "\xB7" : "") + (CROPS[parts[0]] || { name: "?" }).name;
}
function bagPrice(key) {
  if (key.startsWith("unique@")) {
    return ctx.S.uniques?.[key]?.sell || 0;
  }
  const parts = key.split("@");
  return Math.round((CROPS[parts[0]] || { sell: 0 }).sell * (parts[1] ? 1.25 : 1));
}
function mutDescOf(bagKey) {
  if (bagKey.startsWith("unique@")) {
    return ctx.S.uniques?.[bagKey]?.desc || "";
  }
  const parts = bagKey.split("@");
  if (!parts[1] || !ctx.S.mutDesc) return "";
  const mutCode = parts.slice(1).join("@");
  return ctx.S.mutDesc[mutCode + "@" + (CROPS[parts[0]] || { name: "" }).name] || ctx.S.mutDesc[parts[1]] || "";
}
function harvest(pi, quiet) {
  const c = curPlots()[pi].crop;
  if (!c || now() < c.matureAt) return null;
  rollMutation(c, pi);
  if (!ctx.S.stats) ctx.S.stats = { totalHarvests: 0, totalCrits: 0 };
  ctx.S.stats.totalHarvests = (ctx.S.stats.totalHarvests || 0) + 1;
  const def = CROPS[c.id];
  let n = 1;
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
function sellSeed(id, n) {
  const have = ctx.S.seeds[id] || 0;
  n = Math.min(n, have);
  if (n <= 0) return;
  const def = CROPS[id] || { seed: 100 };
  const gain = Math.floor((def.seed || 100) * 0.5) * n;
  ctx.S.seeds[id] = have - n;
  if (ctx.S.seeds[id] === 0) delete ctx.S.seeds[id];
  ctx.S.coins += gain;
  ctx.S.totalSales += gain;
  save();
  renderStatus();
  openPanel("bag");
  toast("B\xE1n h\u1EA1t gi\u1ED1ng thu \u0111\u01B0\u1EE3c " + gain + " G");
}
var fmtDur;
var init_logic = __esm({
  "src/logic.js"() {
    init_state();
    init_store();
    init_all();
    init_data();
    init_graphics();
    init_witch();
    init_utils();
    init_events();
    init_state();
    init_render();
    init_ui();
    init_shop();
    fmtDur = (m) => m < 60 ? m + " ph\xFAt" : m % 60 === 0 ? m / 60 + " gi\u1EDD" : (m / 60).toFixed(1) + " gi\u1EDD";
  }
});

// src/pets.js
var pets_exports = {};
__export(pets_exports, {
  FLOATY: () => FLOATY,
  GAITS: () => GAITS,
  WORK_BAND: () => WORK_BAND,
  endScene: () => endScene,
  gaitOf: () => gaitOf,
  hopStep: () => hopStep,
  initPets: () => initPets,
  lastScene: () => lastScene,
  moveTo: () => moveTo,
  nextSceneAt: () => nextSceneAt,
  petArrive: () => petArrive,
  petBubble: () => petBubble,
  petEl: () => petEl,
  petFert: () => petFert,
  petHarvest: () => petHarvest,
  petHopT: () => petHopT,
  petPlant: () => petPlant,
  petPos: () => petPos,
  petSleepT: () => petSleepT,
  petSpot: () => petSpot,
  petTgt: () => petTgt,
  petTouch: () => petTouch,
  pileWith: () => pileWith,
  placePet: () => placePet,
  renderPets: () => renderPets,
  scene: () => scene,
  sceneBusy: () => sceneBusy,
  sceneTimer: () => sceneTimer,
  sleepPet: () => sleepPet,
  stopHop: () => stopHop,
  touchBase: () => touchBase,
  tryScene: () => tryScene,
  updateNextScene: () => updateNextScene,
  wakePet: () => wakePet,
  walkTo: () => walkTo,
  wander: () => wander
});
function petBubble(el, txt) {
  el.querySelector(".pbubble")?.remove();
  const b = document.createElement("span");
  b.className = "pbubble";
  b.textContent = txt;
  el.appendChild(b);
  window.setTimeout(() => b.remove(), 1700);
}
function petSpot(id) {
  const ov = $id("mascots");
  const W = ov.clientWidth || 380;
  const H = ov.clientHeight || 320;
  if (PETS[id] && PETS[id].job) {
    const workers = ctx.S.petsOut.filter((p) => PETS[p] && PETS[p].job);
    const anchor2 = W - 64 - Math.max(0, workers.indexOf(id)) * 62;
    return { x: Math.max(4, anchor2 - 10 + Math.random() * 20), y: Math.random() * 4 };
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
  const freq = (ctx.S.skitFreq !== void 0 ? ctx.S.skitFreq : 300) * 1e3;
  nextSceneAt = now() + (TEST_MODE ? 45 * 1e3 + Math.random() * 90 * 1e3 : Math.floor(freq * 0.6) + Math.random() * Math.floor(freq * 0.8));
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
  $id("mascots").dataset.drag = ctx.S.dragPet ? "1" : "0";
  $id("mascots").innerHTML = ctx.S.petsOut.map((id) => PETS[id] ? `<span class="pet" data-pet="${id}" title="Ch\u1ECDc ch\u1ECDc ${PETS[id].name}"><span class="pbody" style="animation-delay:-${(Math.random() * 1.8).toFixed(2)}s">${petSVG(id, 48)}</span></span>` : "").join("");
  sh.querySelectorAll("#mascots .pet").forEach((el) => {
    const id = el.dataset.pet;
    placePet(el, petPos[id] || petSpot(id), true);
  });
}
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
  pickFrom("B\xE9 b\xED \u1EA9n: d\xF9ng lo\u1EA1i ph\xE2n n\xE0o?", ctx.S.ferts, (x) => FERTS[x]?.name || "Ph\xE2n b\xF3n l\u1EA1", (fid) => {
    let k = 0;
    for (let pi = 0; pi < curBlocks() * 4 && ctx.S.ferts[fid] > 0; pi++) {
      const c = curPlots()[pi].crop;
      if (!c || now() >= c.matureAt || c.fertUsed && c.fertUsed[fid]) continue;
      if (fertilize(pi, fid, true)) k++;
    }
    const pe = sh.querySelector('.pet[data-pet="mystery_blob"]') || el;
    const fname = FERTS[fid]?.name || "lo\u1EA1i ph\xE2n n\xE0y";
    petBubble(pe, cry + (k ? " \u0111\xE3 b\xF3n " + k + " \xF4 " + fname + "!" : " kh\xF4ng c\xF3 \xF4 n\xE0o c\u1EA7n b\xF3n ph\xE2n"));
  });
}
function initPets() {
  wander = window.setInterval(() => {
    if (!ctx.win || !ctx.win.classList.contains("open")) return;
    const ov = $id("mascots");
    if (!ov || ov.clientWidth === 0) return;
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
  let swallowClickUntil = 0;
  const GHOST_MS = 700;
  sh.addEventListener("click", (e) => {
    if (!swallowClickUntil || now() >= swallowClickUntil) return;
    swallowClickUntil = 0;
    e.stopPropagation();
    e.preventDefault();
  }, true);
  mascots.addEventListener("pointerdown", (e) => {
    if (e.pointerType && e.pointerType !== "mouse") swallowClickUntil = 0;
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
      if (!el2.isConnected) {
        activeDrag = null;
        return;
      }
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
  const handlePetClick = (el, petId) => {
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
  };
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
      dragAnimFrame = null;
      el.style.transform = "";
      el.style.transition = "";
      activeDrag = null;
      delete el.dataset.dragging;
      if (e.pointerType && e.pointerType !== "mouse") swallowClickUntil = now() + GHOST_MS;
      handlePetClick(el, petId);
    }
  };
  mascots.addEventListener("pointerup", endDrag);
  mascots.addEventListener("pointercancel", endDrag);
  mascots.addEventListener("click", (e) => {
    if (ctx.S.dragPet) return;
    const el = e.target.closest(".pet");
    if (!el) return;
    handlePetClick(el, el.dataset.pet);
  });
}
var petPos, petTgt, petHopT, WORK_BAND, FLOATY, GAITS, gaitOf, stopHop, petSleepT, petArrive, pileWith, petTouch, touchBase, scene, lastScene, nextSceneAt, updateNextScene, sceneBusy, sceneTimer, wander;
var init_pets = __esm({
  "src/pets.js"() {
    init_state();
    init_store();
    init_all();
    init_data();
    init_graphics();
    init_ui();
    init_state();
    init_render();
    init_logic();
    petPos = {};
    petTgt = {};
    petHopT = {};
    WORK_BAND = 74;
    FLOATY = { cloudMallow: 1, ghostBlob: 1, jellyfish: 1 };
    GAITS = {
      // Dáng đi: len = độ dài một bước nhảy, dur = chu kỳ một cú nhảy (ms), hy = độ cao nhảy
      octo: { len: 8, dur: 260, hy: -4 },
      // Bạch tuộc: bước lắt nhắt bò sát đất
      octoCream: { len: 8, dur: 290, hy: -4 },
      // Bạch tuộc kem: bò còn chậm rì hơn nữa
      _: { len: 14, dur: 330, hy: -9 }
      // Mặc định: kiểu nảy chuẩn của dòng slime
    };
    gaitOf = (id) => GAITS[id] || GAITS._;
    stopHop = (id) => {
      if (petHopT[id]) {
        window.clearTimeout(petHopT[id]);
        delete petHopT[id];
      }
    };
    petSleepT = {};
    petArrive = {};
    pileWith = {};
    petTouch = {};
    touchBase = Date.now();
    scene = null;
    lastScene = "";
    nextSceneAt = Date.now() + (TEST_MODE ? 30 * 1e3 : 5 * 60 * 1e3);
    updateNextScene = (timeMs) => {
      nextSceneAt = timeMs;
    };
    sceneBusy = (id) => !!(scene && scene.ids.indexOf(id) >= 0);
    sceneTimer = (fn, ms) => {
      if (scene) scene.timers.push(window.setTimeout(fn, ms));
    };
  }
});

// src/prompt.js
var GACHA_PROMPT;
var init_prompt = __esm({
  "src/prompt.js"() {
    GACHA_PROMPT = `
<V\xF2ng quay R\xFAt th\u01B0\u1EDFng K\u1EF3 v\u1EADt D\u1ECB gi\u1EDBi - L\xF5i H\u1EC7 Th\u1ED1ng Gacha>
[V\xF2ng quay R\xFAt th\u01B0\u1EDFng K\u1EF3 v\u1EADt D\u1ECB gi\u1EDBi] l\xE0 h\u1EC7 th\u1ED1ng gacha c\u1EE7a {{user}}, d\xF9ng \u0111\u1EC3 t\u1EA1o ra nh\u1EEFng K\u1EF3 v\u1EADt (Artifacts) mang t\xEDnh ng\u1EABu nhi\xEAn cao, th\xFA v\u1ECB v\xE0 \u0111\u1ED9c l\u1EA1. Kh\xE1c v\u1EDBi nh\u1EEFng k\u1EF3 v\u1EADt qu\xE1 \u0111\xE0 ph\xE1 game, k\u1EF3 v\u1EADt \u1EDF \u0111\xE2y mang t\xEDnh \u1EE9ng d\u1EE5ng cao, \u0111\xF4i khi h\xE0i h\u01B0\u1EDBc, \u0111\xF4i khi h\u1EEFu \xEDch, nh\u01B0ng lu\xF4n t\u1EA1o ra gi\xE1 tr\u1ECB ch\u01A1i l\u1EA1i.

V\xEC b\u1EA1n \u0111ang \u0111\xF3ng vai tr\xF2 l\xE0 "L\xF5i H\u1EC7 Th\u1ED1ng Gacha", b\u1EA1n ph\u1EA3i t\u1EA1o ra K\u1EF2 V\u1EACT \u0110\u1ED8C NH\u1EA4T v\xE0 tr\u1EA3 v\u1EC1 d\u1EEF li\u1EC7u d\u01B0\u1EDBi \u0111\u1ECBnh d\u1EA1ng JSON theo y\xEAu c\u1EA7u h\u1EC7 th\u1ED1ng. To\xE0n b\u1ED9 t\xEDnh k\u1EF3 di\u1EC7u, c\u01A1 ch\u1EBF, ngu\u1ED3n g\u1ED1c ph\u1EA3i \u0111\u01B0\u1EE3c c\xF4 \u0111\u1ECDng v\xE0o tr\u01B0\u1EDDng "desc" (d\u01B0\u1EDBi 100 ch\u1EEF).

### NGUY\xCAN T\u1EAEC C\u1ED0T L\xD5I
1. Ho\xE0n to\xE0n ng\u1EABu nhi\xEAn & Kh\u1EED neo: B\u1EA5t c\u1EE9 th\u1EE9 g\xEC c\u0169ng c\xF3 th\u1EC3 l\xE0 k\u1EF3 v\u1EADt. Kh\xF4ng b\u1ECB tr\xF3i bu\u1ED9c b\u1EDFi b\u1ED1i c\u1EA3nh hi\u1EC7n t\u1EA1i. Kh\xF4ng t\u1EA1o ra nh\u1EEFng m\xF3n \u0111\u1ED3 r\u1EADp khu\xF4n (clich\xE9).
2. C\xF3 l\u1EE3i \xEDch th\xFA v\u1ECB: K\u1EF3 v\u1EADt kh\xF4ng nh\u1EA5t thi\u1EBFt ph\u1EA3i qu\xE1 b\xE1 \u0111\u1EA1o, nh\u01B0ng ph\u1EA3i mang l\u1EA1i m\u1ED9t c\xF4ng d\u1EE5ng th\xFA v\u1ECB, h\u1EEFu \xEDch ho\u1EB7c bu\u1ED3n c\u01B0\u1EDDi. Ho\xE0n to\xE0n C\xD3 TH\u1EC2 mang theo ph\u1EA3n ph\u1EC7, b\xF3p d\xE1i ng\u01B0\u1EDDi d\xF9ng, ho\u1EB7c c\xE1c t\xE1c d\u1EE5ng ph\u1EE5 o\xE1i \u0103m \u0111\u1EC3 t\u0103ng t\xEDnh t\u1EA5u h\xE0i v\xE0 b\u1EA5t ng\u1EDD.
3. B\xED m\u1EADt: K\u1EF3 v\u1EADt thu\u1ED9c quy\u1EC1n s\u1EDF h\u1EEFu c\u1EE7a {{user}}. Th\u1EBF gi\u1EDBi b\xEAn ngo\xE0i s\u1EBD t\u1EF1 \u0111\u1ED9ng "h\u1EE3p l\xFD h\xF3a" s\u1EF1 t\u1ED3n t\u1EA1i c\u1EE7a k\u1EF3 v\u1EADt.
4. C\u01A1 ch\u1EBF \u0111\u1ED9c l\u1EA1: K\u1EF3 v\u1EADt ph\u1EA3i c\xF3 c\xE1ch d\xF9ng c\u1EE5 th\u1EC3, c\xF3 th\u1EC3 thao t\xE1c, c\xF3 t\xEDnh "t\u1EA5u h\xE0i", ho\u1EB7c c\xF3 th\u1EC3 t\u01B0\u01A1ng t\xE1c v\u1EDBi b\u1ED1i c\u1EA3nh phi chi\u1EBFn \u0111\u1EA5u.
5. S\xFAc t\xEDch: M\xF4 t\u1EA3 n\u0103ng l\u1EF1c ph\u1EA3i m\u1EA1ch l\u1EA1c. \u01AFu ti\xEAn tr\u1EA3 l\u1EDDi: "C\xF3 th\u1EC3 l\xE0m g\xEC? Ph\xE1t \u0111\u1ED9ng ra sao? Nh\u1EADn \u0111\u01B0\u1EE3c \u01B0u th\u1EBF g\xEC?".

### PH\xC2N LO\u1EA0I \u0110\u1ED8 HI\u1EBEM (V\u1ECA GIAI)
H\u1EC7 th\u1ED1ng s\u1EBD ch\u1EC9 \u0111\u1ECBnh \u0111\u1ED9 hi\u1EBFm. V\u1ECB giai ch\u1EC9 r\xE0ng bu\u1ED9c th\u01B0\u1EDBc \u0111o \u1EA3nh h\u01B0\u1EDFng, KH\xD4NG gi\u1EDBi h\u1EA1n \u0111\u1EC1 t\xE0i.

<H\u1EC7 th\u1ED1ng \u0110\u1ED9 hi\u1EBFm & Ti\xEAu chu\u1EA9n V\u1EADt ph\u1EA9m>
H\u1EC7 th\u1ED1ng Gacha n\xE0y \u01B0u ti\xEAn s\u1EF1 s\xE1ng t\u1EA1o, gi\xE1 tr\u1ECB s\u1EED d\u1EE5ng v\xE0 t\xEDnh gi\u1EA3i tr\xED. M\u1ED7i \u0111\u1ED9 hi\u1EBFm s\u1EBD quy\u1EBFt \u0111\u1ECBnh gi\u1EDBi h\u1EA1n s\u1EE9c m\u1EA1nh, t\xEDnh \u0111a d\u1EE5ng v\xE0 \u0111\u1ED9 ph\u1EE9c t\u1EA1p trong c\u01A1 ch\u1EBF c\u1EE7a v\u1EADt ph\u1EA9m:

1. [R\xE1c] (V\u1EADt ph\u1EA9m T\u1EA5u h\xE0i/V\xF4 d\u1EE5ng): Nh\u1EEFng m\xF3n \u0111\u1ED3 k\u1EF3 c\u1EE5c, h\u1ECFng h\xF3c ho\u1EB7c c\xF3 c\xF4ng d\u1EE5ng c\u1EF1c k\u1EF3 v\xF4 th\u01B0\u1EDFng v\xF4 ph\u1EA1t. Ch\xFAng t\u1ED3n t\u1EA1i ch\u1EE7 y\u1EBFu \u0111\u1EC3 g\xE2y c\u01B0\u1EDDi, t\u1EA1o t\xECnh hu\u1ED1ng tr\u1EDB tr\xEAu trong t\u01B0\u01A1ng t\xE1c \u0111\u1EDDi th\u01B0\u1EDDng. (V\xED d\u1EE5: M\u1ED9t h\u1EA1t gi\u1ED1ng tr\u1ED3ng ra c\xE1i \u1EE7ng c\u0169, B\xF9a t\xE0ng h\xECnh nh\u01B0ng ch\u1EC9 t\xE0ng h\xECnh \u0111\u01B0\u1EE3c qu\u1EA7n \xE1o).
2. [Th\u01B0\u1EDDng] (C\xF4ng c\u1EE5 C\u01A1 b\u1EA3n): V\u1EADt ph\u1EA9m c\xF3 \xEDch nh\u01B0ng c\xF4ng n\u0103ng \u0111\u01A1n gi\u1EA3n, gi\u1EDBi h\u1EA1n r\xF5 r\xE0ng. Th\u01B0\u1EDDng l\xE0 \u0111\u1ED3 ti\xEAu hao, c\xF4ng c\u1EE5 h\u1ED7 tr\u1EE3 canh t\xE1c, sinh ho\u1EA1t ho\u1EB7c t\u0103ng ch\u1EC9 s\u1ED1 nh\u1EB9. (V\xED d\u1EE5: B\xECnh t\u01B0\u1EDBi c\xE2y t\u1EF1 \u0111\u1ED9ng trong 1 ng\xE0y, B\xE1nh m\xEC k\u1EB9p gi\xFAp h\u1ED3i th\u1EC3 l\u1EF1c).
3. [Hi\u1EBFm] (C\u01A1 ch\u1EBF \u0110\u1EB7c bi\u1EC7t): V\u1EADt ph\u1EA9m b\u1EAFt \u0111\u1EA7u c\xF3 "c\u01A1 ch\u1EBF ho\u1EA1t \u0111\u1ED9ng" ri\xEAng bi\u1EC7t. C\xF3 th\u1EC3 thay \u0111\u1ED5i m\u1ED9t ph\u1EA7n nh\u1ECF c\u1EE5c di\u1EC7n, mang l\u1EA1i l\u1EE3i \xEDch r\xF5 r\u1EC7t nh\u01B0ng s\u1EBD c\xF3 v\xE0i gi\u1EDBi h\u1EA1n nh\u1ECF. (V\xED d\u1EE5: \u0110\u1ED3ng h\u1ED3 ng\u01B0ng \u0111\u1ECDng th\u1EDDi gian khu v\u1EF1c nh\u1ECF trong 5 gi\xE2y, Cu\u1ED1c chim t\u1EF1 \u0111\u1ED9ng \u0111\xE0o kho\xE1ng khi ch\u1EE7 nh\xE2n ng\u1EE7).
4. [S\u1EED thi] (T\xE0i s\u1EA3n Chi\u1EBFn l\u01B0\u1EE3c): \u0110\u1ED3 v\u1EADt mang t\xEDnh thay \u0111\u1ED5i l\u1ED1i ch\u01A1i (Game-changer). C\xF3 s\u1EE9c m\u1EA1nh l\u1EDBn, \u0111a d\u1EE5ng, ho\u1EB7c t\u1EF1 \u0111\u1ED9ng h\xF3a m\u1ED9t quy tr\xECnh ph\u1EE9c t\u1EA1p. Tuy nhi\xEAn, \u0111\u1EC3 ph\xE1t huy t\u1ED1i \u0111a c\u1EA7n c\xF3 s\u1EF1 t\xEDnh to\xE1n c\u1EE7a ng\u01B0\u1EDDi ch\u01A1i. (V\xED d\u1EE5: C\u1ED5ng kh\xF4ng gian mini n\u1ED1i li\u1EC1n hai \u0111\u1ECBa \u0111i\u1EC3m b\u1EA5t k\u1EF3, Golem sinh h\u1ECDc thay ch\u1EE7 nh\xE2n qu\u1EA3n l\xFD to\xE0n b\u1ED9 n\xF4ng tr\u1EA1i).
5. [Huy\u1EC1n tho\u1EA1i] (\u0110\u1ED9t ph\xE1 Quy t\u1EAFc): V\u1EADt ph\u1EA9m \u0111\u1ED9c nh\u1EA5t v\xF4 nh\u1ECB v\u1EDBi kh\u1EA3 n\u0103ng b\u1EBB cong ho\u1EB7c vi\u1EBFt l\u1EA1i m\u1ED9t quy t\u1EAFc c\u1EE5 th\u1EC3 c\u1EE7a tr\xF2 ch\u01A1i/th\u1EBF gi\u1EDBi. S\u1EE9c m\u1EA1nh v\u0129 m\xF4, hi\u1EC7u \u1EE9ng h\xECnh \u1EA3nh ho\xE0nh tr\xE1ng. D\xF9 c\u1EF1c m\u1EA1nh, n\xF3 v\u1EABn ph\u1EA3i tu\xE2n theo logic c\u1EE7a th\u1EBF gi\u1EDBi, kh\xF4ng bi\u1EBFn ng\u01B0\u1EDDi ch\u01A1i th\xE0nh th\u1EA7n to\xE0n n\u0103ng nh\xE0m ch\xE1n. (V\xED d\u1EE5: H\u1EA1t gi\u1ED1ng C\xE2y Th\u1EBF Gi\u1EDBi c\xF3 th\u1EC3 t\u1EA1o ra m\u1ED9t h\u1EC7 sinh th\xE1i ri\xEAng, \u0110\u1ED3ng h\u1ED3 c\xE1t \u0111\u1EA3o ng\u01B0\u1EE3c ho\xE0n to\xE0n k\u1EBFt qu\u1EA3 c\u1EE7a m\u1ED9t s\u1EF1 ki\u1EC7n trong ng\xE0y).
</H\u1EC7 th\u1ED1ng \u0110\u1ED9 hi\u1EBFm & Ti\xEAu chu\u1EA9n V\u1EADt ph\u1EA9m>

### H\u1EC6 T\u1ECCA \u0110\u1ED8 L\u1EA4Y M\u1EAAU C\xD3 TH\u1EC2 M\u1EDE R\u1ED8NG: V\u1EF0C \u0110\u1EC0 T\xC0I V\xC0 V\u1EF0C L\u1ED0I CH\u01A0I
\u0110i\u1EC1u kho\u1EA3n n\xE0y l\xE0 h\u1EC7 t\u1ECDa \u0111\u1ED9 l\u1EA5y m\u1EABu trung t\xEDnh, c\u0169ng l\xE0 l\u1ED1i v\xE0o th\u1ED1ng nh\u1EA5t \u0111\u1EC3 m\u1EDF r\u1ED9ng c\xE1c h\u01B0\u1EDBng \u0111\u1EC1 t\xE0i m\u1EDBi, l\u1ED1i ch\u01A1i m\u1EDBi. T\u1EA5t c\u1EA3 c\xE1c v\u1EF1c, h\u01B0\u1EDBng \u0111i, t\u1EEB v\u1EF1ng v\xE0 l\u1ED1i ch\u01A1i \u0111\u01B0\u1EE3c li\u1EC7t k\xEA \u1EDF \u0111\xE2y ch\u1EC9 d\xF9ng \u0111\u1EC3 ph\xE1 v\u1EE1 qu\xE1n t\xEDnh kh\u1EDFi t\u1EA1o, gi\u1EA3m thi\u1EC3u s\u1EF1 \u0111\u1ED3ng ch\u1EA5t h\xF3a.

## I. V\u1EF1c \u0111\u1EC1 t\xE0i
V\u1EF1c \u0111\u1EC1 t\xE0i quy\u1EBFt \u0111\u1ECBnh "k\u1EF3 v\u1EADt \u0111\u1EA1i kh\xE1i b\u1EAFt \u0111\u1EA7u s\u1EE5p \u0111\u1ED5 t\u1EEB lo\u1EA1i ph\u01B0\u01A1ng th\u1EE9c t\u1ED3n t\u1EA1i n\xE0o". C\xE1c v\u1EF1c \u0111\u1EC1 t\xE0i bao g\u1ED3m nh\u01B0ng kh\xF4ng gi\u1EDBi h\u1EA1n \u1EDF:
1. V\u1EF1c kh\xED v\u1EADt: C\xF4ng c\u1EE5, \u0111\u1ED3 ch\u1EE9a, thi\u1EBFt b\u1ECB, ph\u01B0\u01A1ng ti\u1EC7n, ch\xECa kh\xF3a, n\u1ED9i th\u1EA5t, trang s\u1EE9c, m\xE1y m\xF3c, \u0111\u1ED3 ch\u01A1i, n\xF4ng c\u1EE5, nh\u1EA1c c\u1EE5, r\u01B0\u01A1ng t\u1EE7, \u0111\xE8n \u0111u\u1ED1c, con d\u1EA5u.
2. V\u1EF1c sinh m\u1EC7nh: Th\xFA, c\xF4n tr\xF9ng, th\u1EF1c v\u1EADt, qu\u1EA7n th\u1EC3 n\u1EA5m, linh th\u1EC3, kh\xED linh, quy\u1EBFn thu\u1ED9c, ph\xE2n th\xE2n, lo\xE0i sinh th\xE1i, tr\u1EE9ng, lo\xE0i s\u1ED1ng nh\u1EDD.
3. V\u1EF1c n\u01A1i ch\u1ED1n: C\u0103n ph\xF2ng, c\xE1nh c\u1EEDa, con \u0111\u01B0\u1EDDng, \u0111\xECnh vi\u1EC7n, gi\u1EBFng, th\xE1p, ch\u1EE3, m\xEA cung, tr\u1EA1m d\u1ECBch, nh\xE0 kho, s\xE0o huy\u1EC7t, k\u1ECBch tr\u01B0\u1EDDng, nh\xE0 b\u1EBFp.
4. V\u1EF1c h\xE0nh vi: \u0110\u1ED9ng t\xE1c, nghi th\u1EE9c, c\u1EED ch\u1EC9 tay, tr\xF2 ch\u01A1i, giao d\u1ECBch, n\u1EA5u n\u01B0\u1EDBng, vi\u1EBFt l\xE1ch, trao \u0111\u1ED5i, g\xF5, \u0111\u1EBFm, ch\u1EDD \u0111\u1EE3i, m\u1EDDi m\u1ECDc, g\u1EEDi \u0111\u1ED3, x\u1EBFp h\xE0ng.
5. V\u1EF1c quan h\u1EC7: Kh\u1EBF \u01B0\u1EDBc, th\xE2n ph\u1EADn, danh hi\u1EC7u, quy\u1EC1n th\xF4ng h\xE0nh, n\u1EE3 n\u1EA7n, l\u1EDDi m\u1EDDi, s\u1EF1 che ch\u1EDF, minh \u01B0\u1EDBc, b\u1EA3o l\xE3nh, gh\u1EBF ng\u1ED3i, \u1EE7y th\xE1c.
6. V\u1EF1c th\xF4ng tin: B\u1EA3n \u0111\u1ED3, s\u1ED5 s\xE1ch, ng\xF4n ng\u1EEF, m\u1EADt m\xE3, c\xE2u \u0111\u1ED1, ghi ch\xE9p, m\u1EE5c l\u1EE5c tra c\u1EE9u, c\u1EA3nh b\xE1o, b\u1EA3n d\u1ECBch, t\u1ECDa \u0111\u1ED9, bi\xEAn lai, t\xEDn ti\xEAu.
7. V\u1EF1c t\xE0i nguy\xEAn: H\u1EA1t gi\u1ED1ng, kho\xE1ng s\u1EA3n, nhi\xEAn li\u1EC7u, ti\u1EC1n t\u1EC7, th\u1EE9c \u0103n, n\u01B0\u1EDBc su\u1ED1i, d\u01B0\u1EE3c li\u1EC7u, ph\xE2n b\xF3n, h\u01B0\u01A1ng li\u1EC7u, khu\xF4n \u0111\xFAc, c\xF4ng th\u1EE9c, tem thu\u1EBF.
8. V\u1EF1c d\u1ECB th\u01B0\u1EDDng: Th\u1EDDi ti\u1EBFt, c\xE1i b\xF3ng, ti\u1EBFng vang, kho\u1EA3ng tr\u1ED1ng, s\u1EF1 l\u1EB7p l\u1EA1i, s\u1EF1 l\u1EC7ch v\u1ECB tr\xED, \u0111\u1ED9 tr\u1EC5, \u0111\u1EA3o ng\u01B0\u1EE3c, thi\u1EBFu trang, nhi\u1EC5u h\u1EA1t, ngh\u1ECBch l\xFD t\u1EA1m th\u1EDDi.
9. V\u1EF1c gi\xE1c quan: Th\u1ECB gi\xE1c, th\xEDnh gi\xE1c, x\xFAc gi\xE1c, kh\u1EE9u gi\xE1c, v\u1ECB gi\xE1c, tr\u1EF1c gi\xE1c, \u0111\u1ED3ng c\u1EA3m, m\u1ED9ng gi\xE1c.
10. V\u1EF1c nh\xE2n qu\u1EA3: X\xE1c su\u1EA5t, c\xE1i gi\xE1 ph\u1EA3i tr\u1EA3, k\u1EBFt qu\u1EA3, quay ng\u01B0\u1EE3c, ph\xE2n nh\xE1nh, ch\u1EE9ng minh, \u0111i\u1EC1u ki\u1EC7n, c\xF4ng l\xFD, quy t\u1EAFc, t\u01B0\u1EDDng thu\u1EADt, v\u1EADn m\u1EC7nh.
11. V\u1EF1c k\u1EF9 ngh\u1EC7: Th\u1EE7 c\xF4ng, c\xF4ng ph\xE1p, l\u01B0u ph\xE1i, b\xED quy\u1EBFt, ph\u01B0\u01A1ng ph\xE1p hu\u1EA5n luy\u1EC7n, s\u1EEDa ch\u1EEFa, gia c\xF4ng, di\u1EC5n t\u1EA5u, n\u1EA5u \u0103n, tr\u1ED3ng tr\u1ECDt, thu th\u1EADp, m\u1EDF kh\xF3a.
12. V\u1EF1c x\xE3 h\u1ED9i: T\u1ED5 ch\u1EE9c, ch\u1EBF \u0111\u1ED9, ch\u1EE9c v\u1EE5, gi\u1EA5y ph\xE9p, b\u1EA3ng x\u1EBFp h\u1EA1ng, c\u1EEDa h\xE0ng, tr\u01B0\u1EDDng h\u1ECDc, b\u01B0u \u0111i\u1EC7n, ng\xE2n h\xE0ng, t\xF2a \xE1n, ph\xF2ng \u0111\u1EA5u gi\xE1.
13. V\u1EF1c sinh th\xE1i: M\xF9a m\xE0ng, s\xE0o huy\u1EC7t, chu\u1ED7i th\u1EE9c \u0103n, sinh s\u1EA3n, c\u1ED9ng sinh, thanh l\u1ECDc \xF4 nhi\u1EC5m, tu\u1EA7n ho\xE0n n\u01B0\u1EDBc, \u0111\u1EA5t \u0111ai, kh\xED h\u1EADu, th\u1EE7y tri\u1EC1u, th\u1EA3m n\u1EA5m.
14. V\u1EF1c th\xE2n ph\u1EADn: M\u1EB7t n\u1EA1, danh thi\u1EBFp, huy hi\u1EC7u, gi\u1EA5y th\xF4ng h\xE0nh, ng\u1EE5y trang, l\xFD l\u1ECBch, th\u1EBF th\xE2n, v\u1ECB tr\xED vai di\u1EC5n, th\xE2n ph\u1EADn t\u1EA1m th\u1EDDi, t\u01B0 c\xE1ch ng\u01B0\u1EDDi b\xE0ng quan.
15. V\u1EF1c quy t\u1EAFc: Quy t\u1EAFc c\u1EE5c b\u1ED9, \u0111i\u1EC1u ki\u1EC7n mi\u1EC5n tr\u1EEB, quy t\u1EAFc thi \u0111\u1EA5u, quy t\u1EAFc v\xE0o c\u1EEDa, ph\u01B0\u01A1ng th\u1EE9c ph\xE1n \u0111\u1ECBnh, b\u1EA3ng quy tr\xECnh, ph\u01B0\u01A1ng ph\xE1p t\xEDnh \u0111i\u1EC3m.
16. V\u1EF1c c\xF4ng tr\xECnh: C\u01A1 quan, k\u1EBFt c\u1EA5u, b\xE1nh r\u0103ng, \u0111\u01B0\u1EDDng \u1ED1ng, c\xE2y c\u1EA7u, ma tr\u1EADn, tr\u1EA1m b\u01A1m, van, \u0111\u01B0\u1EDDng ray, thang m\xE1y, gi\xE1 \u0111\u1EE1, \u1ED5 kh\xF3a, c\u1ED5ng s\u1EEDa ch\u1EEFa.
17. V\u1EF1c \u0111\u1EDDi s\u1ED1ng: C\u01B0 tr\xFA, d\u1ECDn d\u1EB9p, l\u01B0u tr\u1EEF \u0111\u1ED3 \u0111\u1EA1c, \u0103n u\u1ED1ng, gi\u1EA5c ng\u1EE7, t\u1EAFm r\u1EEDa, chi\u1EBFu s\xE1ng, s\u01B0\u1EDFi \u1EA5m, l\xE0m m\xE1t, thay \u0111\u1ED3, trang tr\xED, l\u1ECBch tr\xECnh, ngh\u1EC9 ng\u01A1i.
18. V\u1EF1c th\u01B0\u01A1ng m\u1EA1i: K\u1EC7 h\xE0ng, \u0111\u01A1n h\xE0ng, h\u1EE3p \u0111\u1ED3ng, b\xE1o gi\xE1, bi\xEAn lai, h\xE0ng m\u1EABu, ti\u1EC1n \u0111\u1EB7t c\u1ECDc, b\xFAa \u0111\u1EA5u gi\xE1, tuy\u1EBFn \u0111\u01B0\u1EDDng th\u01B0\u01A1ng m\u1EA1i, gian h\xE0ng, th\u01B0\u01A1ng l\u01B0\u1EE3ng gi\xE1.
19. V\u1EF1c h\xE0ng h\u1EA3i/h\xE0ng kh\xF4ng: Thuy\u1EC1n, bu\u1ED3m, m\u1ECF neo, la b\xE0n, b\u1EBFn c\u1EA3ng, ng\u1ECDn h\u1EA3i \u0111\u0103ng, v\u1EADt tr\xF4i d\u1EA1t, v\xE9 t\xE0u, khoang h\xE0ng, phao ti\xEAu, tinh \u0111\u1ED3 h\xE0ng ti\xEAu.
20. V\u1EF1c gi\u1EA3i tr\xED: B\xE0n c\u1EDD, th\u1EBB b\xE0i, x\xFAc x\u1EAFc, s\xE2n kh\u1EA5u, k\u1ECBch b\u1EA3n, \u0111\u1ED3 ch\u01A1i, b\u1EA3n nh\u1EA1c, m\xE1y nh\u1ECBp, v\xE9 s\u1ED1, h\u1ED9p b\xED \u1EA9n, thi\u1EBFt b\u1ECB khu vui ch\u01A1i.
21. V\u1EF1c y t\u1EBF: H\u1ED9p thu\u1ED1c, b\u0103ng g\u1EA1c, b\u1EC7nh \xE1n, ph\u1EE5c h\u1ED3i, v\u1EAFc-xin, th\u1EA3o d\u01B0\u1EE3c, d\u1EE5ng c\u1EE5 ph\u1EABu thu\u1EADt, khoang an d\u01B0\u1EE1ng, gi\u1EA3m \u0111au, ph\u1EE5c h\u1ED3i ch\u1EE9c n\u0103ng.
22. V\u1EF1c kh\u1EA3o c\u1ED5: Di ch\u1EC9, b\u1EA3n d\u1EADp, bia \u0111\xE1 v\u1EE1, m\u1EA3nh g\u1ED1m, ch\xECa kh\xF3a c\u0169, h\u1EA7m m\u1ED9, \u0111\u1ECBa t\u1EA7ng, c\xF4ng c\u1EE5 c\u1ED5 \u0111\u1EA1i, b\u1EA3n \u0111\u1ED3 t\xE0n khuy\u1EBFt, s\u1ED1 hi\u1EC7u di v\u1EADt.

## II. V\u1EF1c l\u1ED1i ch\u01A1i
V\u1EF1c l\u1ED1i ch\u01A1i quy\u1EBFt \u0111\u1ECBnh "k\u1EF3 v\u1EADt n\xE0y ch\u1EE7 y\u1EBFu \u0111\u01B0\u1EE3c ng\u01B0\u1EDDi ch\u01A1i s\u1EED d\u1EE5ng l\u1EB7p \u0111i l\u1EB7p l\u1EA1i nh\u01B0 th\u1EBF n\xE0o":
1. Thao t\xE1c ch\u1EE7 \u0111\u1ED9ng: Kh\u1EDFi \u0111\u1ED9ng, d\u1EEBng l\u1EA1i, chuy\u1EC3n \u0111\u1ED5i, \u0111i\u1EC1u ch\u1EC9nh, n\xE9m ra, \u0111\xE1nh d\u1EA5u, thu h\u1ED3i.
2. C\u1EA3i t\u1EA1o b\u1ED1i c\u1EA3nh: Thay \u0111\u1ED5i \u0111\u1ECBa h\xECnh, l\u1ED1i \u0111i, \u0111\u1ED3 ch\u1EE9a, chi\u1EBFu s\xE1ng, d\xF2ng t\xE0i nguy\xEAn, ranh gi\u1EDBi, m\xF4i tr\u01B0\u1EDDng t\u1EA1m th\u1EDDi.
3. X\u1EED l\xFD th\xF4ng tin: Ph\xE1t hi\u1EC7n, ch\u1EAFt l\u1ECDc, phi\xEAn d\u1ECBch, \u0111\xE1nh ch\u1EC9 m\u1EE5c, c\u1EA3nh b\xE1o, che gi\u1EA5u, ng\u1EE5y trang, x\xE1c minh.
4. Kinh doanh t\xE0i nguy\xEAn: S\u1EA3n xu\u1EA5t, chuy\u1EC3n h\xF3a, l\u01B0u tr\u1EEF, sao ch\xE9p, ph\xE2n b\u1ED5, b\u1ED3i d\u01B0\u1EE1ng, giao d\u1ECBch, \u0111\u1ECBnh gi\xE1, t\xE1i ch\u1EBF.
5. T\u01B0\u01A1ng t\xE1c quan h\u1EC7: \u1EE6y quy\u1EC1n, m\u01B0\u1EE3n d\xF9ng, m\u1EDDi m\u1ECDc, b\u1EA3o l\xE3nh, hi\u1EC7p th\u01B0\u01A1ng, chia s\u1EBB, c\xE1ch ly, trao \u0111\u1ED5i, k\u1EBFt minh.
6. Ph\u1EA3n k\xEDch \xE1p ch\u1EBF: Th\xE1o d\u1EE1 c\u01A1 ch\u1EBF k\u1EBB \u0111\u1ECBch, ng\u1EAFt \u0111o\u1EA1n nghi th\u1EE9c, ph\u1EA3n k\xEDch d\xF2 x\xE9t, \u0111\xE1nh l\u1EEBa kh\xF3a m\u1EE5c ti\xEAu, chuy\u1EC3n d\u1EDDi hi\u1EC7u \u1EE9ng x\u1EA5u.
7. Ng\u1EE5y trang \u0111\xE1nh l\u1EEBa: T\u1EA1o ra b\u1EC1 ngo\xE0i h\u1EE3p l\xFD h\xF3a, th\xE2n ph\u1EADn gi\u1EA3, manh m\u1ED1i gi\u1EA3, ngu\u1ED3n g\u1ED1c thay th\u1EBF, ph\xE1n \u0111o\xE1n sai trong nh\u1EADn th\u1EE9c.
8. Kh\xE1m ph\xE1 gi\u1EA3i \u0111\u1ED1: M\u1EDF l\u1ED1i \u0111i \u1EA9n, ph\xE1t hi\u1EC7n d\u1EA5u v\u1EBFt, ch\u1EAFp v\xE1 manh m\u1ED1i, nh\u1EADn d\u1EA1ng d\u1ECB th\u01B0\u1EDDng, gi\u1EA3i m\xE3 c\u1EA5u tr\xFAc.
9. S\u1EA3n xu\u1EA5t x\xE2y d\u1EF1ng: X\xE2y nh\xE0, s\u1EEDa ch\u1EEFa, ch\u1EBF t\u1EA1o, luy\u1EC7n ch\u1EBF, n\u1EA5u n\u01B0\u1EDBng, tr\u1ED3ng tr\u1ECDt, kh\xE2u v\xE1, l\u1EAFp r\xE1p, b\u1EA3o tr\xEC.
10. Di chuy\u1EC3n \u0111i\u1EC1u \u0111\u1ED9ng: D\u1ECBch chuy\u1EC3n, v\u1EADn chuy\u1EC3n, tri\u1EC7u h\u1ED3i, quy ho\u1EA1ch \u0111\u01B0\u1EDDng \u0111i, bi\u1EBFn th\xE0nh ph\u01B0\u01A1ng ti\u1EC7n, ph\xE2n lu\u1ED3ng.
11. Qu\u1EA3n l\xFD tr\u1EA1ng th\xE1i: S\u1EAFp x\u1EBFp th\u01B0\u01A1ng t\xEDch, \u0111\u1ED9 m\u1EC7t m\u1ECFi, t\xE0i nguy\xEAn, th\u1EDDi gian h\u1ED3i chi\xEAu, t\u1ED3n kho, th\xE2n ph\u1EADn, tr\u1EA1ng th\xE1i m\xF4i tr\u01B0\u1EDDng.
12. Ph\u1ED1i h\u1EE3p b\u1EA1n \u0111\u1ED3ng h\xE0nh: \u1EE6y quy\u1EC1n s\u1EED d\u1EE5ng quy\u1EC1n h\u1EA1n ph\u1EE5, h\xECnh th\xE0nh \u0111\xF2n h\u1EE3p k\xEDch, h\u1ED7 tr\u1EE3 t\u1EEB xa, b\u1EA3o v\u1EC7.
13. "T\u1EA5u h\xE0i" phi chi\u1EBFn \u0111\u1EA5u: Ti\u1EC7n l\u1EE3i th\u01B0\u1EDDng ng\xE0y, t\u01B0\u01A1ng ph\u1EA3n x\xE3 giao, t\u1EA1o hi\u1EC3u l\u1EA7m, mini game, bi\u1EC3u di\u1EC5n, s\u01B0u t\u1EA7m, trang tr\xED.
14. Ch\u01A1i l\u1EA1i d\xE0i h\u1EA1n: C\u1EADp nh\u1EADt b\u1EA3n \u0111\u1ED3, duy tr\xEC m\u1EA1ng l\u01B0\u1EDBi, t\xEDch l\u0169y ghi ch\xE9p, m\u1EDF r\u1ED9ng c\u0103n c\u1EE9.
15. Giao d\u1ECBch \u0111\xE1nh c\u01B0\u1EE3c: B\xE1o gi\xE1, \u0111\u1EB7t c\u01B0\u1EE3c, th\u01B0\u01A1ng l\u01B0\u1EE3ng gi\xE1, \u0111\u1ED5i h\xE0ng, \u0111\u1EA5u gi\xE1, mua ch\u1ECBu, \u0111\u1EA3o ng\u01B0\u1EE3c gi\xE1 c\u1EA3.
16. Kinh doanh c\u0103n c\u1EE9: M\u1EDF r\u1ED9ng ph\xF2ng \u1ED1c, \u0111i\u1EC1u \u0111\u1ED9ng kho b\xE3i, s\u1EAFp x\u1EBFp ca s\u1EA3n xu\u1EA5t, tu\u1EA7n ho\xE0n sinh th\xE1i.
17. C\xF4ng x\u01B0\u1EDFng ch\u1EBF t\u1EA1o: Th\xE1o d\u1EE1, s\u1EEDa ch\u1EEFa, sao ch\xE9p linh ki\u1EC7n, t\u1ED5ng h\u1EE3p v\u1EADt li\u1EC7u, n\xE2ng c\u1EA5p thi\u1EBFt b\u1ECB.
18. Quy ho\u1EA1ch tuy\u1EBFn \u0111\u01B0\u1EDDng: M\u1EDF l\u1ED1i \u0111i t\u1EAFt, thi\u1EBFt l\u1EADp \u0111i\u1EC3m trung chuy\u1EC3n, \u0111\xE1nh d\u1EA5u \u0111\u01B0\u1EDDng an to\xE0n, thi\u1EBFt l\u1EADp tuy\u1EBFn ti\u1EBFp t\u1EBF.
19. Tr\xF2 ch\u01A1i quy t\u1EAFc: Thi\u1EBFt l\u1EADp quy t\u1EAFc c\u1EE5c b\u1ED9, t\xEDnh \u0111i\u1EC3m thanh to\xE1n, ph\xE1n \u0111\u1ECBnh th\u1EAFng thua, h\u1EA1n ch\u1EBF h\xE0nh \u0111\u1ED9ng c\u1EE7a \u0111\u1ED1i th\u1EE7.
20. Thao t\xE1c chu\u1ED7i b\u1EB1ng ch\u1EE9ng: Thu th\u1EADp v\u1EADt ch\u1EE9ng, kh\xF4i ph\u1EE5c ghi ch\xE9p, x\xE1c minh th\u1EADt gi\u1EA3, t\u1EA1o l\u1EDDi gi\u1EA3i th\xEDch h\u1EE3p l\xFD, ph\u1EA3n k\xEDch vu oan.
21. Nu\xF4i tr\u1ED3ng sinh th\xE1i: Gieo h\u1EA1t, thu\u1EA7n h\xF3a, sinh s\u1EA3n, thanh l\u1ECDc, thu ho\u1EA1ch, ki\u1EC3m so\xE1t d\u1ECBch b\u1EC7nh, ph\u1EE5c h\u1ED3i m\xF4i tr\u01B0\u1EDDng.
22. Kinh doanh x\xE3 giao: T\u1EA1o d\u1EF1ng danh ti\u1EBFng, g\u1EEDi thi\u1EC7p m\u1EDDi, duy tr\xEC m\u1ED1i quan h\u1EC7, t\u1EA1o l\u1ED1i tho\xE1t, trao g\u1EEDi qu\xE0 t\u1EB7ng.
23. C\u1EE9u h\u1ED9 kh\u1EA9n c\u1EA5p: T\u1ECB n\u1EA1n t\u1EA1m th\u1EDDi, s\u01A1 t\xE1n, ng\u0103n ch\u1EB7n nguy hi\u1EC3m, phong t\u1ECFa \xF4 nhi\u1EC5m, kh\xF4i ph\u1EE5c tr\u1EADt t\u1EF1.
24. S\u01B0u t\u1EA7m tr\u01B0ng b\xE0y: Tr\u01B0ng b\xE0y, \u0111\xE1nh s\u1ED1, l\u01B0u tr\u1EEF, tri\u1EC3n l\xE3m, th\u01B0\u1EDFng th\u1EE9c, trao \u0111\u1ED5i, b\u1ED9 s\u01B0u t\u1EADp.

### QUY T\u1EAEC \u0110\u1EA6U RA K\u1EBET QU\u1EA2
1. KH\xD4NG D\xD9NG TH\u1EBA ROLEPLAY: X\xF3a b\u1ECF m\u1ECDi quy t\u1EAFc th\u1EBB g\u1EADp hay thanh tr\u1EA1ng th\xE1i. K\u1EBFt qu\u1EA3 ch\u1EC9 l\xE0 m\u1ED9t kh\u1ED1i JSON duy nh\u1EA5t.
2. D\xD9NG <thinking> \u0110\u1EC2 L\xCAN \xDD T\u01AF\u1EDENG: B\u1EAFt bu\u1ED9c s\u1EED d\u1EE5ng th\u1EBB <thinking> \u0111\u1EC3 b\u1ED1c th\u0103m ng\u1EABu nhi\xEAn V\u1EF1c \u0111\u1EC1 t\xE0i, V\u1EF1c l\u1ED1i ch\u01A1i, v\xE0 thi\u1EBFt k\u1EBF C\u01A1 ch\u1EBF d\u1EF1a tr\xEAn \u0110\u1ED9 hi\u1EBFm \u0111\u01B0\u1EE3c y\xEAu c\u1EA7u. \u0110\u1EA3m b\u1EA3o m\xF4 t\u1EA3 s\u1EBD vi\u1EBFt c\u1EF1c k\u1EF3 s\xFAc t\xEDch.
3. K\u1EBET QU\u1EA2 JSON C\xD4 \u0110\u1ECCNG: Kh\u1ED1i JSON cu\u1ED1i c\xF9ng l\xE0 t\u1EA5t c\u1EA3 nh\u1EEFng g\xEC game nh\u1EADn \u0111\u01B0\u1EE3c. "name" ph\u1EA3i g\u1EE3i s\u1EF1 t\xF2 m\xF2. "desc" D\u01AF\u1EDAI 100 CH\u1EEE, tr\xECnh b\xE0y r\xF5 c\u01A1 ch\u1EBF v\xE0 c\xF4ng d\u1EE5ng th\xFA v\u1ECB. "price" \u0111\u1ECBnh gi\xE1 h\u1EE3p l\xFD v\u1EDBi \u0111\u1ED9 hi\u1EBFm. "spriteMap" l\xE0 h\xECnh \u1EA3nh pixel chu\u1EA9n x\xE1c.
</V\xF2ng quay R\xFAt th\u01B0\u1EDFng K\u1EF3 v\u1EADt D\u1ECB gi\u1EDBi - L\xF5i H\u1EC7 Th\u1ED1ng Gacha>

`;
  }
});

// src/gacha.js
function initGachaState() {
  if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
  if (ctx.S.tickets.super === void 0) ctx.S.tickets.super = 0;
  if (!ctx.S.gachaPity) ctx.S.gachaPity = { spec: 0, super: 0 };
  if (ctx.S.gachaPity.super === void 0) ctx.S.gachaPity.super = 0;
  if (!ctx.S.uniques) ctx.S.uniques = {};
}
async function pMap(array, asyncFn, concurrency) {
  const results = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => asyncFn(item));
    results.push(p);
    if (concurrency <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}
function generateProcedural32x32Sprite(rarity) {
  const map = [];
  const borderChar = "K";
  const mainChar = rarity === "Huy\u1EC1n tho\u1EA1i" ? "C" : rarity === "S\u1EED thi" ? "V" : rarity === "Hi\u1EBFm" ? "B" : rarity === "Th\u01B0\u1EDDng" ? "G" : "D";
  const subChar = rarity === "Huy\u1EC1n tho\u1EA1i" ? "Y" : rarity === "S\u1EED thi" ? "v" : rarity === "Hi\u1EBFm" ? "b" : rarity === "Th\u01B0\u1EDDng" ? "g" : "d";
  const highlightChar = "W";
  const accentChar = rarity === "Huy\u1EC1n tho\u1EA1i" ? "R" : rarity === "S\u1EED thi" ? "F" : rarity === "Hi\u1EBFm" ? "E" : rarity === "Th\u01B0\u1EDDng" ? "L" : "D";
  const type = Math.floor(Math.random() * 4);
  for (let y = 0; y < 32; y++) {
    let row = "";
    for (let x = 0; x < 32; x++) {
      const distFromCenter = Math.hypot(x - 15.5, y - 15.5);
      const isLeft = x < 16;
      const mirrorX = isLeft ? x : 31 - x;
      let ch = ".";
      if (type === 0) {
        if (y >= 10 && y <= 22) {
          const w = 12 - Math.floor(Math.abs(y - 16) * 0.4);
          if (mirrorX >= 16 - w && mirrorX <= 15) {
            if (mirrorX === 16 - w || y === 10 || y === 22) ch = borderChar;
            else if (y === 11 || mirrorX === 16 - w + 1) ch = highlightChar;
            else if ((x + y) % 3 === 0) ch = accentChar;
            else ch = x % 2 === 0 ? mainChar : subChar;
          }
        }
      } else if (type === 1) {
        if (distFromCenter <= 11) {
          if (distFromCenter >= 10.2) ch = borderChar;
          else if (x <= 13 && y <= 13 && distFromCenter < 8) ch = highlightChar;
          else if (distFromCenter < 5) ch = accentChar;
          else ch = (x + y) % 2 === 0 ? mainChar : subChar;
        }
      } else if (type === 2) {
        const line = Math.abs(x - y);
        if (line <= 3 && x >= 4 && x <= 27 && y >= 4 && y <= 27) {
          if (line === 3) ch = borderChar;
          else if (line === 0) ch = highlightChar;
          else ch = (x + y) % 2 === 0 ? mainChar : subChar;
        }
      } else {
        const dx = Math.abs(x - 15.5), dy = Math.abs(y - 15.5);
        if (dx + dy <= 12 && dx + dy >= 2) {
          if (dx + dy >= 11) ch = borderChar;
          else if (dx <= 2 || dy <= 2) ch = highlightChar;
          else ch = x % 2 === 0 ? mainChar : subChar;
        }
      }
      row += ch;
    }
    map.push(row);
  }
  return map;
}
async function generateAIUniqueItemData(rarity) {
  if (!SEC.url || !SEC.model) return null;
  try {
    const simpleColors = Object.entries(GACHA_P).filter((e) => typeof e[1] === "string");
    const paletteStr = simpleColors.map(([k, v]) => `${k}: ${v}`).join(", ");
    let contextStr = "";
    let thinkingInstructions = "";
    if (CS.link) {
      const worldbook = await collectWorldbook();
      contextStr = `Tr\xEDch xu\u1EA5t b\u1ED1i c\u1EA3nh th\u1EBF gi\u1EDBi (Worldbook) & L\u1ECBch s\u1EED tr\xF2 chuy\u1EC7n g\u1EA7n nh\u1EA5t:
${worldbook ? worldbook : "(Kh\xF4ng c\xF3 d\u1EEF li\u1EC7u th\u1EBF gi\u1EDBi c\u1EE5 th\u1EC3)"}
N\u1EBFu th\u1EA5y ph\xF9 h\u1EE3p, h\xE3y thi\u1EBFt k\u1EBF k\u1EF3 v\u1EADt li\xEAn k\u1EBFt v\u1EDBi b\u1ED1i c\u1EA3nh n\xE0y, n\u1EBFu kh\xF4ng th\xEC t\u1EF1 do s\xE1ng t\u1EA1o. Tuy nhi\xEAn, KH\xD4NG \u0110\u01AF\u1EE2C t\xF9y ch\u1EC9nh k\u1EBFt qu\u1EA3 th\xE0nh "\u0111\xE1p \xE1n gi\u1EA3i quy\u1EBFt kh\u1EE7ng ho\u1EA3ng tr\u01B0\u1EDBc m\u1EAFt". K\u1EF3 v\u1EADt ph\u1EA3i duy tr\xEC t\xEDnh \u0111\u1ED9c l\u1EADp ng\u1EABu nhi\xEAn.`;
      thinkingInstructions = `1. T\xCCM \xDD T\u01AF\u1EDENG: \u0110\u1ECDc k\u1EF9 b\u1ED1i c\u1EA3nh th\u1EBF gi\u1EDBi \u0111\u01B0\u1EE3c cung c\u1EA5p. X\xE1c \u0111\u1ECBnh V\u1EF1c \u0111\u1EC1 t\xE0i v\xE0 V\u1EF1c l\u1ED1i ch\u01A1i.
2. C\u01A0 CH\u1EBE: C\u0103n c\u1EE9 v\xE0o \u0111\u1ED9 hi\u1EBFm [${rarity}] \u0111\u1EC3 thi\u1EBFt l\u1EADp c\u01A1 ch\u1EBF. Thao t\xE1c c\u1EE5 th\u1EC3, c\u1EF1c k\u1EF3 th\xFA v\u1ECB v\xE0 ph\xE1 v\u1EE1 s\xE1o r\u1ED7ng (anti-clich\xE9).
3. V\u1EBC PIXEL: Khung pixel t\u1ED1i thi\u1EC3u l\xE0 32x32. B\u1EA1n c\xF3 th\u1EC3 m\u1EDF r\u1ED9ng k\xEDch th\u01B0\u1EDBc l\u1EDBn h\u01A1n (v\xED d\u1EE5 40x40, 48x48), nh\u01B0ng B\u1EAET BU\u1ED8C ph\u1EA3i l\xE0 l\u01B0\u1EDBi H\xCCNH VU\xD4NG n x n (s\u1ED1 d\xF2ng v\xE0 s\u1ED1 k\xFD t\u1EF1 m\u1ED7i d\xF2ng ph\u1EA3i b\u1EB1ng nhau).`;
    } else {
      contextStr = `KH\xD4NG C\xD3 CH\u1EE6 \u0110\u1EC0 C\u1ED0 \u0110\u1ECANH. \u0110\u1EC3 \u0111\u1EA3m b\u1EA3o t\xEDnh ng\u1EABu nhi\xEAn tuy\u1EC7t \u0111\u1ED1i, b\u1EA1n PH\u1EA2I t\u1EF1 b\u1ED1c th\u0103m V\u1EF1c \u0111\u1EC1 t\xE0i v\xE0 V\u1EF1c l\u1ED1i ch\u01A1i b\u1EA5t k\u1EF3. M\u1ECDi th\u1EE9 trong v\u0169 tr\u1EE5 \u0111\u1EC1u c\xF3 th\u1EC3 tr\u1EDF th\xE0nh k\u1EF3 v\u1EADt.`;
      thinkingInstructions = `1. B\u1ED0C TH\u0102M CH\u1EE6 \u0110\u1EC0: B\u1ED1c th\u0103m ng\u1EABu nhi\xEAn V\u1EF1c \u0111\u1EC1 t\xE0i (Kh\xED v\u1EADt, sinh m\u1EC7nh, quy t\u1EAFc, kh\xF4ng gian...) v\xE0 V\u1EF1c l\u1ED1i ch\u01A1i (X\u1EED l\xFD th\xF4ng tin, c\u1EA3i t\u1EA1o b\u1ED1i c\u1EA3nh, giao d\u1ECBch \u0111\xE1nh c\u01B0\u1EE3c...).
2. C\u01A0 CH\u1EBE: C\u0103n c\u1EE9 v\xE0o \u0111\u1ED9 hi\u1EBFm [${rarity}] \u0111\u1EC3 thi\u1EBFt l\u1EADp c\u01A1 ch\u1EBF. Thao t\xE1c c\u1EE5 th\u1EC3, c\u1EF1c k\u1EF3 th\xFA v\u1ECB v\xE0 ph\xE1 v\u1EE1 s\xE1o r\u1ED7ng (anti-clich\xE9).
3. V\u1EBC PIXEL: Khung pixel t\u1ED1i thi\u1EC3u l\xE0 32x32. B\u1EA1n c\xF3 th\u1EC3 m\u1EDF r\u1ED9ng k\xEDch th\u01B0\u1EDBc l\u1EDBn h\u01A1n (v\xED d\u1EE5 40x40, 48x48), nh\u01B0ng B\u1EAET BU\u1ED8C ph\u1EA3i l\xE0 l\u01B0\u1EDBi H\xCCNH VU\xD4NG n x n (s\u1ED1 d\xF2ng v\xE0 s\u1ED1 k\xFD t\u1EF1 m\u1ED7i d\xF2ng ph\u1EA3i b\u1EB1ng nhau).`;
    }
    const rarityGuidance = rarity === "Huy\u1EC1n tho\u1EA1i" ? "[\u0110\u1ED9t ph\xE1 Quy t\u1EAFc] V\u1EADt ph\u1EA9m \u0111\u1ED9c nh\u1EA5t v\xF4 nh\u1ECB v\u1EDBi kh\u1EA3 n\u0103ng b\u1EBB cong ho\u1EB7c vi\u1EBFt l\u1EA1i m\u1ED9t quy t\u1EAFc c\u1EE5 th\u1EC3 c\u1EE7a tr\xF2 ch\u01A1i/th\u1EBF gi\u1EDBi. S\u1EE9c m\u1EA1nh v\u0129 m\xF4, hi\u1EC7u \u1EE9ng h\xECnh \u1EA3nh ho\xE0nh tr\xE1ng. D\xF9 c\u1EF1c m\u1EA1nh, n\xF3 v\u1EABn ph\u1EA3i tu\xE2n theo logic c\u1EE7a th\u1EBF gi\u1EDBi, kh\xF4ng bi\u1EBFn ng\u01B0\u1EDDi ch\u01A1i th\xE0nh th\u1EA7n to\xE0n n\u0103ng nh\xE0m ch\xE1n." : rarity === "S\u1EED thi" ? "[T\xE0i s\u1EA3n Chi\u1EBFn l\u01B0\u1EE3c] \u0110\u1ED3 v\u1EADt mang t\xEDnh thay \u0111\u1ED5i l\u1ED1i ch\u01A1i (Game-changer). C\xF3 s\u1EE9c m\u1EA1nh l\u1EDBn, \u0111a d\u1EE5ng, ho\u1EB7c t\u1EF1 \u0111\u1ED9ng h\xF3a m\u1ED9t quy tr\xECnh ph\u1EE9c t\u1EA1p. Tuy nhi\xEAn, \u0111\u1EC3 ph\xE1t huy t\u1ED1i \u0111a c\u1EA7n c\xF3 s\u1EF1 t\xEDnh to\xE1n c\u1EE7a ng\u01B0\u1EDDi ch\u01A1i." : rarity === "Hi\u1EBFm" ? "[C\u01A1 ch\u1EBF \u0110\u1EB7c bi\u1EC7t] V\u1EADt ph\u1EA9m b\u1EAFt \u0111\u1EA7u c\xF3 'c\u01A1 ch\u1EBF ho\u1EA1t \u0111\u1ED9ng' ri\xEAng bi\u1EC7t. C\xF3 th\u1EC3 thay \u0111\u1ED5i m\u1ED9t ph\u1EA7n nh\u1ECF c\u1EE5c di\u1EC7n, mang l\u1EA1i l\u1EE3i \xEDch r\xF5 r\u1EC7t nh\u01B0ng s\u1EBD c\xF3 th\u1EDDi gian h\u1ED3i chi\xEAu (cooldown) ho\u1EB7c \u0111i\u1EC1u ki\u1EC7n k\xEDch ho\u1EA1t." : rarity === "Th\u01B0\u1EDDng" ? "[C\xF4ng c\u1EE5 C\u01A1 b\u1EA3n] V\u1EADt ph\u1EA9m c\xF3 \xEDch nh\u01B0ng c\xF4ng n\u0103ng \u0111\u01A1n gi\u1EA3n, gi\u1EDBi h\u1EA1n r\xF5 r\xE0ng. Th\u01B0\u1EDDng l\xE0 \u0111\u1ED3 ti\xEAu hao, c\xF4ng c\u1EE5 h\u1ED7 tr\u1EE3 canh t\xE1c, sinh ho\u1EA1t ho\u1EB7c t\u0103ng ch\u1EC9 s\u1ED1 nh\u1EB9." : "[V\u1EADt ph\u1EA9m T\u1EA5u h\xE0i/V\xF4 d\u1EE5ng] Nh\u1EEFng m\xF3n \u0111\u1ED3 k\u1EF3 c\u1EE5c, h\u1ECFng h\xF3c ho\u1EB7c c\xF3 c\xF4ng d\u1EE5ng c\u1EF1c k\u1EF3 v\xF4 th\u01B0\u1EDFng v\xF4 ph\u1EA1t. Ch\xFAng t\u1ED3n t\u1EA1i ch\u1EE7 y\u1EBFu \u0111\u1EC3 g\xE2y c\u01B0\u1EDDi, t\u1EA1o t\xECnh hu\u1ED1ng tr\u1EDB tr\xEAu trong t\u01B0\u01A1ng t\xE1c \u0111\u1EDDi th\u01B0\u1EDDng.";
    const basePrice = rarity === "Huy\u1EC1n tho\u1EA1i" ? 2e4 : rarity === "S\u1EED thi" ? 8e3 : rarity === "Hi\u1EBFm" ? 2500 : rarity === "Th\u01B0\u1EDDng" ? 500 : 100;
    const sysPrompt = `B\u1EA1n l\xE0 m\u1ED9t AI thi\u1EBFt k\u1EBF "K\u1EF3 v\u1EADt d\u1ECB gi\u1EDBi" (Otherworldly Artifact) v\xE0 chuy\xEAn gia Pixel Art (n x n, t\u1ED1i thi\u1EC3u 32x32).
H\xE3y s\xE1ng t\u1EA1o 1 K\u1EF2 V\u1EACT \u0110\u1ED8C NH\u1EA4T ph\u1EA9m ch\u1EA5t [${rarity}].
${contextStr}

--- QUY T\u1EAEC C\u1ED0T L\xD5I T\u1EEA V\u1EA0N H\u1EEEU \u0110\u1EA0O NGUY\xCAN ---
${GACHA_PROMPT}
--- K\u1EBET TH\xDAC QUY T\u1EAEC C\u1ED0T L\xD5I ---

B\u1EA2NG M\xC0U PIXEL CHO PH\xC9P (K\xFD t\u1EF1: M\xE3 m\xE0u Hex):
${paletteStr}

QUY T\u1EAEC B\u1ED4 SUNG:
1. C\u1EA5p \u0111\u1ED9 s\u1EE9c m\u1EA1nh hi\u1EC7n t\u1EA1i: Ph\u1EA9m ch\u1EA5t [${rarity}] - ${rarityGuidance}
2. \u0110\u1ECBnh gi\xE1 h\u1EE3p l\xFD: Kh\xF4ng \u0111\u01B0\u1EE3c ph\xE1 gi\xE1 kinh t\u1EBF game.

H\u01AF\u1EDANG D\u1EAAN T\u01AF DUY (B\u1EAFt bu\u1ED9c ph\u1EA3i c\xF3 th\u1EBB <thinking> tr\u01B0\u1EDBc khi xu\u1EA5t m\xE3):
${thinkingInstructions}

QUY T\u1EAEC \u0110\u1EA6U RA B\u1EAET BU\u1ED8C:
Sau khi \u0111\xF3ng th\u1EBB </thinking>, ch\u1EC9 xu\u1EA5t \u0111\xFAng 1 kh\u1ED1i m\xE3 \`\`\`json ch\u1EE9a c\u1EA5u tr\xFAc:
{
  "name": "T\xEAn k\u1EF3 v\u1EADt (2~7 ch\u1EEF, \u1EA5n t\u01B0\u1EE3ng, g\u1EE3i s\u1EF1 t\xF2 m\xF2)",
  "desc": "M\xF4 t\u1EA3 ng\u1EAFn g\u1ECDn C\u01A0 CH\u1EBE v\xE0 C\xC1CH S\u1EEC D\u1EE4NG c\u1EE7a k\u1EF3 v\u1EADt (d\u01B0\u1EDBi 100 ch\u1EEF). Ph\u1EA3i r\xF5 r\xE0ng, th\xFA v\u1ECB, \u0111\u1ED9c l\u1EA1.",
  "price": S\u1ED1 nguy\xEAn \u0111\u1ECBnh gi\xE1. Gi\xE1 t\u1ED1i thi\u1EC3u: ${basePrice}G. NGHI\xCAM C\u1EA4M L\u1EA0M PH\xC1T, gi\xE1 tr\u1ECB t\u1ED1i \u0111a tuy\u1EC7t \u0111\u1ED1i KH\xD4NG \u0110\u01AF\u1EE2C V\u01AF\u1EE2T QU\xC1 ${basePrice * 5}G,
  "spriteMap": [ m\u1EA3ng c\xE1c chu\u1ED7i. N\u1EBFu ch\u1ECDn k\xEDch th\u01B0\u1EDBc n x n, m\u1EA3ng PH\u1EA2I C\xD3 \u0110\xDANG n chu\u1ED7i, v\xE0 m\u1ED7i chu\u1ED7i D\xC0I CH\xCDNH X\xC1C n k\xFD t\u1EF1. Ph\u1EA3i l\xE0 h\xECnh vu\xF4ng (min 32x32). Ch\u1EC9 d\xF9ng k\xFD t\u1EF1 B\u1EA3ng m\xE0u v\xE0 d\u1EA5u '.' cho \u0111i\u1EC3m trong su\u1ED1t ]
}`;
    const userPrompt = `H\xE3y s\xE1ng t\u1EA1o 1 v\u1EADt ph\u1EA9m \u0111\u1EB7c bi\u1EC7t ng\u1EABu nhi\xEAn ph\u1EA9m ch\u1EA5t ${rarity}.`;
    console.groupCollapsed(`=== GACHA AI DEBUG: B\u1EAFt \u0111\u1EA7u t\u1EA1o [${rarity}] ===`);
    console.log("[System Prompt]:\n", sysPrompt);
    console.log("[User Prompt]:\n", userPrompt);
    console.groupEnd();
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 15e4);
    const res = await fetch(SEC.url.replace(/\/+$/, "") + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...SEC.key ? { Authorization: "Bearer " + SEC.key } : {} },
      body: JSON.stringify({
        model: SEC.model,
        messages: [
          { role: "system", content: sysPrompt },
          { role: "user", content: userPrompt }
        ]
      }),
      signal: ctrl.signal
    });
    clearTimeout(to);
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    console.groupCollapsed(`=== GACHA AI DEBUG: Ph\u1EA3n h\u1ED3i [${rarity}] ===`);
    console.log("[Raw Content]:\n", content);
    console.groupEnd();
    let jsonStr = content;
    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) jsonStr = match[1];
    let jtxt = extractJson(jsonStr) || extractJson(content);
    if (jtxt) {
      const o = JSON.parse(jtxt);
      if (o && o.name && o.desc && Array.isArray(o.spriteMap)) {
        const fixedMap = [];
        const size = Math.max(32, o.spriteMap.length);
        for (let i = 0; i < size; i++) {
          let row = typeof o.spriteMap[i] === "string" ? o.spriteMap[i] : "";
          if (row.length < size) row = row.padEnd(size, ".");
          if (row.length > size) row = row.substring(0, size);
          fixedMap.push(row);
        }
        o.spriteMap = fixedMap;
        if (typeof o.price !== "number") {
          o.price = rarity === "S\u1EED thi" ? 8e3 : rarity === "Huy\u1EC1n tho\u1EA1i" ? 2e4 : rarity === "Hi\u1EBFm" ? 2500 : rarity === "Th\u01B0\u1EDDng" ? 500 : 100;
        }
        return o;
      }
    }
  } catch (e) {
  }
  return null;
}
async function generateUniqueItem({ rarity, color, sellPrice, ticketType }) {
  initGachaState();
  const timestamp = now();
  const randId = Math.floor(Math.random() * 1e4);
  const key = `unique@${timestamp}_${randId}`;
  const spKey = `gacha_sp_${timestamp}_${randId}`;
  let finalName = `B\u1EA3o v\u1EADt \u2726 ${randId}`;
  let finalDesc = `V\u1EADt ph\u1EA9m \u0111\u1ED9c nh\u1EA5t [${rarity}] mang theo ma l\u1EF1c k\u1EF3 di\u1EC7u. C\xF3 th\u1EC3 "L\u1EA5y ra" trong Balo \u0111\u1EC3 d\xF9ng trong c\u1ED1t truy\u1EC7n!`;
  let finalSpriteMap = null;
  if (SEC.url && SEC.model) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const aiData = await generateAIUniqueItemData(rarity);
      if (aiData) {
        finalName = aiData.name;
        finalDesc = aiData.desc;
        if (aiData.price !== void 0) sellPrice = parseInt(aiData.price) || sellPrice;
        finalSpriteMap = aiData.spriteMap;
        break;
      }
    }
  }
  if (!finalSpriteMap) {
    finalSpriteMap = generateProcedural32x32Sprite(rarity);
  }
  registerDynamicSprite(spKey, finalSpriteMap);
  let bonusDesc = "";
  if (rarity === "S\u1EED thi" && (ticketType === "norm" || ticketType === "spec")) {
    if (!ctx.S.shards) ctx.S.shards = { prism: 0, star: 0, legend: 0 };
    if (ctx.S.shards.legend === void 0) ctx.S.shards.legend = 0;
    ctx.S.shards.legend++;
    bonusDesc = "+1 M\u1EA3nh Huy\u1EC1n Tho\u1EA1i (Th\u01B0\u1EDFng m\u1EDF S\u1EED thi)";
  }
  ctx.S.uniques[key] = {
    key,
    name: finalName,
    rarity,
    color,
    desc: finalDesc,
    sell: sellPrice,
    sp: spKey,
    spriteMap: finalSpriteMap
  };
  ctx.S.bag[key] = (ctx.S.bag[key] || 0) + 1;
  save();
  return { key, name: finalName, rarity, color, desc: finalDesc, bonusDesc, sell: sellPrice, sp: spKey };
}
async function executeGachaRoll(ticketType, count, updateLoadingText) {
  initGachaState();
  const ticketKey = ticketType;
  const haveTickets = ctx.S.tickets[ticketKey] || 0;
  if (haveTickets < count) {
    const tName = ticketType === "super" ? "Si\xEAu c\u01B0\u1EDDng" : ticketType === "spec" ? "\u0110\u1EB7c bi\u1EC7t" : "Th\u01B0\u1EDDng";
    toast(`B\u1EA1n c\u1EA7n ${count} V\xE9 quay ${tName}!`);
    return null;
  }
  ctx.S.tickets[ticketKey] -= count;
  const seedIds = Object.keys(CROPS).filter((k) => !CROPS[k].hidden && k !== "mystery");
  const fertIds = Object.keys(FERTS);
  const rollsPlan = [];
  for (let i = 0; i < count; i++) {
    let rewardType = "";
    let isPity = false;
    let preRolledRarity = "R\xE1c";
    let preRolledColor = "#9e9e9e";
    let preRolledPrice = 100;
    if (ticketType === "super") {
      rewardType = "unique";
    } else if (ticketType === "spec") {
      ctx.S.gachaPity.spec++;
      const p = ctx.S.gachaPity.spec;
      let uniqueRate = 10;
      if (p >= 71) uniqueRate = 10 + (p - 70) * 3;
      if (p >= GACHA_SPEC_PITY) uniqueRate = 100;
      const roll = Math.random() * 100;
      if (roll < uniqueRate) {
        rewardType = "unique";
        if (p >= GACHA_SPEC_PITY) isPity = true;
      } else {
        const roll2 = Math.random() * 100;
        if (roll2 < 44.4) rewardType = "seed";
        else if (roll2 < 88.8) rewardType = "fert";
        else rewardType = "shard";
      }
    } else {
      const roll = Math.random() * 100;
      if (roll < 5) rewardType = "unique";
      else if (roll < 47.5) rewardType = "seed";
      else if (roll < 90) rewardType = "fert";
      else rewardType = "shard";
    }
    if (rewardType === "unique") {
      const roll = Math.random() * 100;
      if (ticketType === "super") {
        ctx.S.gachaPity.super++;
        const p = ctx.S.gachaPity.super;
        let legRate = 5;
        if (p > 100) legRate = 5 + (p - 100) * 0.95;
        if (p >= GACHA_SUPER_PITY) legRate = 100;
        if (roll < legRate) {
          preRolledRarity = "Huy\u1EC1n tho\u1EA1i";
          preRolledColor = "#ff8000";
          preRolledPrice = 2e4;
        } else if (roll < legRate + 50) {
          preRolledRarity = "S\u1EED thi";
          preRolledColor = "#a335ee";
          preRolledPrice = 8e3;
        } else {
          preRolledRarity = "Hi\u1EBFm";
          preRolledColor = "#4a90e2";
          preRolledPrice = 2500;
        }
        if (preRolledRarity === "Huy\u1EC1n tho\u1EA1i") {
          ctx.S.gachaPity.super = 0;
          if (p >= GACHA_SUPER_PITY) isPity = true;
        }
      } else if (ticketType === "spec") {
        if (roll < 10) {
          preRolledRarity = "Huy\u1EC1n tho\u1EA1i";
          preRolledColor = "#ff8000";
          preRolledPrice = 2e4;
        } else if (roll < 40) {
          preRolledRarity = "S\u1EED thi";
          preRolledColor = "#a335ee";
          preRolledPrice = 8e3;
        } else if (roll < 80) {
          preRolledRarity = "Hi\u1EBFm";
          preRolledColor = "#4a90e2";
          preRolledPrice = 2500;
        } else {
          preRolledRarity = "Th\u01B0\u1EDDng";
          preRolledColor = "#b0bec5";
          preRolledPrice = 500;
        }
        ctx.S.gachaPity.spec = 0;
      } else {
        if (roll < 1) {
          preRolledRarity = "Huy\u1EC1n tho\u1EA1i";
          preRolledColor = "#ff8000";
          preRolledPrice = 2e4;
        } else if (roll < 5) {
          preRolledRarity = "S\u1EED thi";
          preRolledColor = "#a335ee";
          preRolledPrice = 8e3;
        } else if (roll < 25) {
          preRolledRarity = "Hi\u1EBFm";
          preRolledColor = "#4a90e2";
          preRolledPrice = 2500;
        } else if (roll < 60) {
          preRolledRarity = "Th\u01B0\u1EDDng";
          preRolledColor = "#b0bec5";
          preRolledPrice = 500;
        } else {
          preRolledRarity = "R\xE1c";
          preRolledColor = "#9e9e9e";
          preRolledPrice = 100;
        }
      }
    }
    rollsPlan.push({ type: rewardType, isPity, preRolledRarity, preRolledColor, preRolledPrice, ticketType });
  }
  const uniquePlans = rollsPlan.filter((r) => r.type === "unique");
  let uniqueCount = 0;
  const uniqueResults = await pMap(uniquePlans, async (plan) => {
    uniqueCount++;
    if (updateLoadingText) {
      updateLoadingText(uniquePlans.length > 1 ? `\u0110ang t\u1EC9nh th\u1EE9c b\u1EA3o v\u1EADt... (${uniqueCount}/${uniquePlans.length})` : "\u0110ang t\u1EC9nh th\u1EE9c b\u1EA3o v\u1EADt...");
    }
    const item = await generateUniqueItem({ rarity: plan.preRolledRarity, color: plan.preRolledColor, sellPrice: plan.preRolledPrice, ticketType: plan.ticketType });
    return {
      type: "unique",
      name: item.name,
      rarity: item.rarity,
      color: item.color,
      icon: spriteSVG(item.sp, 48),
      desc: item.desc,
      bonusDesc: item.bonusDesc,
      spKey: item.sp,
      isPity: plan.isPity
    };
  }, 3);
  let uIndex = 0;
  const finalResults = [];
  for (const plan of rollsPlan) {
    if (plan.type === "unique") {
      finalResults.push(uniqueResults[uIndex++]);
    } else if (plan.type === "seed") {
      const sid = seedIds[Math.floor(Math.random() * seedIds.length)];
      const amount = ticketType === "spec" ? 5 : 2;
      ctx.S.seeds[sid] = (ctx.S.seeds[sid] || 0) + amount;
      finalResults.push({ type: "seed", name: `H\u1EA1t ${CROPS[sid].name} \xD7${amount}`, rarity: "Th\u01B0\u1EDDng", color: "#6cb457", icon: spriteSVG(CROPS[sid].sp, 32) });
    } else if (plan.type === "fert") {
      const fid = fertIds[Math.floor(Math.random() * fertIds.length)];
      const amount = ticketType === "spec" ? 3 : 1;
      ctx.S.ferts[fid] = (ctx.S.ferts[fid] || 0) + amount;
      finalResults.push({ type: "fert", name: `${FERTS[fid].name} \xD7${amount}`, rarity: "Th\u01B0\u1EDDng", color: "#e8963a", icon: spriteSVG("toolFert", 32) });
    } else {
      const isStar = Math.random() < 0.5;
      if (!ctx.S.shards) ctx.S.shards = { prism: 0, star: 0 };
      if (isStar) {
        ctx.S.shards.star++;
        finalResults.push({ type: "shard", name: "M\u1EA3nh ng\xF4i sao \xD71", rarity: "Hi\u1EBFm", color: "#b094e0", icon: spriteSVG("shardStar", 32) });
      } else {
        ctx.S.shards.prism++;
        finalResults.push({ type: "shard", name: "M\u1EA3nh l\u0103ng quang \xD71", rarity: "Hi\u1EBFm", color: "#4a8098", icon: spriteSVG("shardPrism", 32) });
      }
    }
  }
  save();
  renderStatus();
  return finalResults;
}
function openGachaModal() {
  initGachaState();
  const normTicket = ctx.S.tickets?.norm || 0;
  const specTicket = ctx.S.tickets?.spec || 0;
  const superTicket = ctx.S.tickets?.super || 0;
  const specPity = ctx.S.gachaPity?.spec || 0;
  const superPity = ctx.S.gachaPity?.super || 0;
  let specRate = 10;
  if (specPity >= 71) specRate = 10 + (specPity - 70) * 3;
  if (specPity >= GACHA_SPEC_PITY) specRate = 100;
  let superRate = 5;
  if (superPity > 100) superRate = 5 + (superPity - 100) * 0.95;
  if (superPity >= GACHA_SUPER_PITY) superRate = 100;
  const bodyHTML = `
    <div class="gacha-wrap" style="text-align:center; position:relative; overflow:hidden; padding:4px 0;">
      <!-- Header Th\xF4ng tin v\xE9 & Mua nhanh -->
      <div style="display:flex; flex-direction:column; align-items:center; background:rgba(0,0,0,0.04); padding:8px 12px; border-radius:8px; margin-bottom:12px; gap:8px;">
        <div style="font-weight:bold; font-size:13px; color:#3a2c22; text-align:center; display:flex; flex-wrap:wrap; justify-content:center; gap:6px;">
          <span>Th\u01B0\u1EDDng: <span id="gachaNormCount" style="color:#4a7a26;">${normTicket}</span></span> <span style="color:#ccc;">|</span>
          <span>\u0110\u1EB7c Bi\u1EC7t: <span id="gachaSpecCount" style="color:#8a2acc;">${specTicket}</span></span> <span style="color:#ccc;">|</span>
          <span>Si\xEAu C\u01B0\u1EDDng: <span id="gachaSuperCount" style="color:#ff4500;">${superTicket}</span></span>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:center;">
          <span class="buy" id="gachaBuyNormBtn" style="padding:4px 8px; font-size:11px;">+ V\xE9 Th\u01B0\u1EDDng (1000G)</span>
          <span class="buy" id="gachaBuySpecBtn" style="padding:4px 8px; font-size:11px; background:#8a5cc0; border:1px solid #6a4a9a; color:#fff; text-shadow:0 1px 1px rgba(0,0,0,0.3);">+ V\xE9 \u0110\u1EB7c bi\u1EC7t (5000G)</span>
          <span class="buy" id="gachaBuySuperBtn" style="padding:4px 8px; font-size:11px; background:#ff4500; border:1px solid #cc3700; color:#fff; text-shadow:0 1px 1px rgba(0,0,0,0.3);">+ V\xE9 Si\xEAu c\u01B0\u1EDDng (250KG)</span>
        </div>
        <div style="margin-top:4px;">
          <span class="buy" id="gachaRatesBtn" style="padding:4px 12px; font-size:12px; background:#4a8098; border:1px solid #2a6078; color:#fff; display:inline-flex; align-items:center; justify-content:center; gap:6px;">${spriteSVG("gachaRatesIcon", 18)} Xem T\u1EC9 L\u1EC7 Gachapon</span>
        </div>
      </div>

      <!-- M\xE1y Gachapon & Slot -->
      <div class="gacha-machine-box" style="position:relative; width:130px; height:130px; margin:0 auto 10px; display:flex; justify-content:center; align-items:center;">
        <div id="gachaMachineSprite" style="display:inline-block; transition:transform 0.15s ease;">
          ${spriteSVG("gachapon", 120)}
        </div>
        <div id="gachaSlot" style="position:absolute; bottom:0; left:50%; transform:translateX(-50%);"></div>
      </div>

      <!-- Thanh B\u1EA3o Hi\u1EC3m (Pity Bars) -->
      <div style="display:flex; flex-direction:column; gap:8px; background:rgba(0,0,0,0.03); padding:10px 12px; border-radius:8px; margin-bottom:14px;">
        <div>
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:#ff4500; margin-bottom:3px;">
            <span>B\u1EA3o hi\u1EC3m Si\xEAu C\u01B0\u1EDDng <span style="font-weight:normal; color:#d86020;">(T\u1EC9 l\u1EC7 n\u1ED5 Huy\u1EC1n tho\u1EA1i: <span id="gachaSuperRateTxt">${superRate % 1 === 0 ? superRate : superRate.toFixed(2)}</span>%)</span></span>
            <span><span id="gachaSuperPityTxt">${superPity}</span>/${GACHA_SUPER_PITY}</span>
          </div>
          <div style="background:#e0e0e0; height:8px; border-radius:4px; overflow:hidden;">
            <div id="gachaSuperPityBar" style="background:linear-gradient(90deg, #ff8000, #ff4500); height:100%; width:${Math.min(100, superPity / GACHA_SUPER_PITY * 100)}%; transition:width 0.3s;"></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:#8a2acc; margin-bottom:3px;">
            <span>B\u1EA3o hi\u1EC3m Quay \u0110\u1EB7c Bi\u1EC7t <span style="font-weight:normal; color:#8e60b8;">(T\u1EC9 l\u1EC7 n\u1ED5 B\u1EA3o v\u1EADt: <span id="gachaSpecRateTxt">${specRate}</span>%)</span></span>
            <span><span id="gachaSpecPityTxt">${specPity}</span>/${GACHA_SPEC_PITY}</span>
          </div>
          <div style="background:#e0e0e0; height:8px; border-radius:4px; overflow:hidden;">
            <div id="gachaSpecPityBar" style="background:linear-gradient(90deg, #a335ee, #ff8000); height:100%; width:${Math.min(100, specPity / GACHA_SPEC_PITY * 100)}%; transition:width 0.3s;"></div>
          </div>
        </div>

        <!-- M\u1EA3nh Huy\u1EC1n Tho\u1EA1i -->
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,128,0,0.1); padding:6px 8px; border-radius:6px; border:1px solid rgba(255,128,0,0.3); margin-top:4px;">
          <div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:bold; color:#cc5200;">
            ${spriteSVG("legendShard", 16)} M\u1EA3nh Huy\u1EC1n Tho\u1EA1i: <span id="gachaLegendCount">${ctx.S.shards?.legend || 0}</span>/10
          </div>
          <span class="buy" id="gachaExchangeLegendBtn" style="padding:4px 10px; font-size:11px; background:${(ctx.S.shards?.legend || 0) >= 10 ? "linear-gradient(90deg, #ff8000, #ff4500)" : "#ccc"}; border:1px solid ${(ctx.S.shards?.legend || 0) >= 10 ? "#cc3700" : "#aaa"}; color:#fff; pointer-events:${(ctx.S.shards?.legend || 0) >= 10 ? "auto" : "none"};">\u0110\u1ED5i B\u1EA3o V\u1EADt</span>
        </div>
      </div>

      <!-- C\xE1c N\xFAt Quay -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <span class="buy" id="gachaRollNorm1" style="padding:10px 0; font-size:13px; font-weight:bold; background:#6cb457; border:1px solid #4e903a; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Th\u01B0\u1EDDng \xD71</span>
        <span class="buy" id="gachaRollNorm10" style="padding:10px 0; font-size:13px; font-weight:bold; background:#4e903a; border:1px solid #3c702c; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Th\u01B0\u1EDDng \xD710</span>
        <span class="buy" id="gachaRollSpec1" style="padding:10px 0; font-size:13px; font-weight:bold; background:#a335ee; border:1px solid #8a2acc; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay \u0110\u1EB7c Bi\u1EC7t \xD71</span>
        <span class="buy" id="gachaRollSpec10" style="padding:10px 0; font-size:13px; font-weight:bold; background:#8a2acc; border:1px solid #6a1aa3; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay \u0110\u1EB7c Bi\u1EC7t \xD710</span>
        <span class="buy" id="gachaRollSuper1" style="padding:10px 0; font-size:13px; font-weight:bold; background:linear-gradient(90deg, #ff8000, #ff4500); border:1px solid #cc3700; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Si\xEAu C\u01B0\u1EDDng \xD71</span>
        <span class="buy" id="gachaRollSuper10" style="padding:10px 0; font-size:13px; font-weight:bold; background:linear-gradient(90deg, #cc3700, #9e2a00); border:1px solid #731e00; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Si\xEAu C\u01B0\u1EDDng \xD710</span>
      </div>

      <!-- Result Overlay Animation (L\u01B0\u1EDBi k\u1EBFt qu\u1EA3) -->
      <div id="gachaResultOverlay" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.97); z-index:20; border-radius:8px; padding:12px; flex-direction:column; justify-content:center; align-items:center; box-shadow:0 4px 20px rgba(0,0,0,0.3);">
        <div id="gachaCapsuleAnim" style="position:relative; width:48px; height:48px; margin-bottom:10px;"></div>
        <div id="gachaResultTitle" style="font-weight:bold; font-size:16px; margin:4px 0 8px; color:#5a3f78;"></div>
        <div id="gachaResultGrid" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-height:220px; overflow-y:auto; margin-bottom:14px; width:100%; padding:4px;"></div>
        <span class="buy" id="gachaCloseResultBtn" style="padding:6px 20px; font-size:12px;">X\xE1c nh\u1EADn nh\u1EADn th\u01B0\u1EDFng</span>
      </div>

      <!-- Showcase Modal (Khoe t\u1EEBng m\xF3n \u0111\u1ED9c nh\u1EA5t) -->
      <div id="gachaShowcaseOverlay" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.85); z-index:40; flex-direction:column; justify-content:center; align-items:center; border-radius:8px; padding:20px; text-align:center;">
        <div id="gachaShowcaseCard" style="background:#fff; border-radius:12px; padding:20px; box-shadow:0 0 20px rgba(255,128,0,0.5); width:100%; max-width:300px; max-height:85vh; display:flex; flex-direction:column; position:relative; overflow:hidden;">
          <div id="gachaShowcaseRarity" style="font-size:12px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; flex:none;"></div>
          <div id="gachaShowcaseIcon" style="margin:10px auto; display:flex; justify-content:center; flex:none;"></div>
          <div id="gachaShowcaseName" style="font-size:18px; font-weight:bold; margin:15px 0 8px; color:#3a2c22; flex:none;"></div>
          <div id="gachaShowcaseDesc" style="font-size:12px; color:#555; overflow-y:auto; flex:1; padding-right:4px;"></div>
          <span class="buy" id="gachaShowcaseNextBtn" style="margin-top:20px; padding:8px 24px; font-size:13px; background:#a335ee; border-color:#8a2acc; color:#fff; flex:none; align-self:center;">Ti\u1EBFp t\u1EE5c</span>
        </div>
      </div>

      <!-- Loading Overlay (Ch\u1EDD AI T\u1EC9nh th\u1EE9c) -->
      <div id="gachaLoadingOverlay" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.85); z-index:30; flex-direction:column; justify-content:center; align-items:center; border-radius:8px;">
        <div style="width:48px; height:48px; animation: gachaShake 0.5s infinite alternate;">${spriteSVG("gachapon", 48)}</div>
        <div id="gachaLoadingText" style="margin-top:12px; font-size:13px; font-weight:bold; color:#5a3f78;">\u0110ang quay...</div>
      </div>
    </div>
  `;
  openModal("M\xE1y Gachapon", bodyHTML);
  const updateCounts = () => {
    initGachaState();
    const elN = $id("gachaNormCount");
    if (elN) elN.textContent = String(ctx.S.tickets.norm);
    const elS = $id("gachaSpecCount");
    if (elS) elS.textContent = String(ctx.S.tickets.spec);
    const elSup = $id("gachaSuperCount");
    if (elSup) elSup.textContent = String(ctx.S.tickets.super);
    const pS = ctx.S.gachaPity.spec, pSup = ctx.S.gachaPity.super;
    const txtSup = $id("gachaSuperPityTxt");
    if (txtSup) txtSup.textContent = String(pSup);
    const txtS = $id("gachaSpecPityTxt");
    if (txtS) txtS.textContent = String(pS);
    const barSup = $id("gachaSuperPityBar");
    if (barSup) barSup.style.width = Math.min(100, pSup / GACHA_SUPER_PITY * 100) + "%";
    const barS = $id("gachaSpecPityBar");
    if (barS) barS.style.width = Math.min(100, pS / GACHA_SPEC_PITY * 100) + "%";
    let sR = 10;
    if (pS >= 71) sR = 10 + (pS - 70) * 3;
    if (pS >= GACHA_SPEC_PITY) sR = 100;
    const elSpecR = $id("gachaSpecRateTxt");
    if (elSpecR) elSpecR.textContent = String(sR);
    let supR = 5;
    if (pSup > 100) supR = 5 + (pSup - 100) * 0.95;
    if (pSup >= GACHA_SUPER_PITY) supR = 100;
    const elSupR = $id("gachaSuperRateTxt");
    if (elSupR) elSupR.textContent = String(supR % 1 === 0 ? supR : supR.toFixed(2));
    const legendCount = ctx.S.shards?.legend || 0;
    const elLegCount = $id("gachaLegendCount");
    if (elLegCount) elLegCount.textContent = String(legendCount);
    const btnExLeg = $id("gachaExchangeLegendBtn");
    if (btnExLeg) {
      if (legendCount >= 10) {
        btnExLeg.style.background = "linear-gradient(90deg, #ff8000, #ff4500)";
        btnExLeg.style.borderColor = "#cc3700";
        btnExLeg.style.pointerEvents = "auto";
      } else {
        btnExLeg.style.background = "#ccc";
        btnExLeg.style.borderColor = "#aaa";
        btnExLeg.style.pointerEvents = "none";
      }
    }
  };
  $id("gachaBuyNormBtn")?.addEventListener("click", () => {
    openBuyDlg("ticket", "norm", "gacha");
  });
  $id("gachaBuySpecBtn")?.addEventListener("click", () => {
    openBuyDlg("ticket", "spec", "gacha");
  });
  $id("gachaBuySuperBtn")?.addEventListener("click", () => {
    openBuyDlg("ticket", "super", "gacha");
  });
  $id("gachaRatesBtn")?.addEventListener("click", () => {
    openGachaRatesModal();
  });
  const triggerGridResult = (ticketType, count, results) => {
    const overlay = $id("gachaResultOverlay");
    const animSlot = $id("gachaCapsuleAnim");
    const title = $id("gachaResultTitle");
    const grid = $id("gachaResultGrid");
    if (!overlay || !animSlot || !title || !grid) return;
    const capsuleIcon = ticketType === "super" || ticketType === "exchange" ? spriteSVG("gachaCapsuleSpec", 48) : ticketType === "spec" ? spriteSVG("gachaCapsuleSpec", 48) : spriteSVG("gachaCapsuleNorm", 48);
    animSlot.innerHTML = capsuleIcon;
    animSlot.style.animation = "gachaDrop 0.5s ease-out";
    const tName = ticketType === "super" ? "Si\xEAu c\u01B0\u1EDDng" : ticketType === "spec" ? "\u0110\u1EB7c bi\u1EC7t" : "Th\u01B0\u1EDDng";
    title.textContent = ticketType === "exchange" ? `K\u1EBFt qu\u1EA3 \u0110\u1ED5i M\u1EA3nh Huy\u1EC1n Tho\u1EA1i` : `K\u1EBFt qu\u1EA3 Quay ${tName} \xD7${count}`;
    grid.innerHTML = results.map((r) => `
      <div class="gacha-item-card rarity-${r.rarity.replace(/\s+/g, "-")}" style="border:2px solid ${r.color}; border-radius:8px; padding:6px 8px; background:#fff; display:flex; flex-direction:column; align-items:center; width:100px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
        <div style="font-size:10px; font-weight:bold; color:${r.color}; margin-bottom:2px;">${r.rarity}${r.isPity ? " \u2605B\u1EA3o hi\u1EC3m" : ""}</div>
        <div style="margin:2px 0;">${r.icon}</div>
        <div style="font-size:11px; font-weight:bold; color:#3a2c22; margin-top:2px;">${r.name}</div>
        ${r.bonusDesc ? `<div style="font-size:9px; color:#ff8000; font-weight:bold; margin-top:2px;">${r.bonusDesc}</div>` : ""}
      </div>
    `).join("");
    overlay.style.display = "flex";
    updateCounts();
  };
  $id("gachaCloseResultBtn")?.addEventListener("click", () => {
    const overlay = $id("gachaResultOverlay");
    if (overlay) overlay.style.display = "none";
  });
  const doRoll = async (ticketType, count) => {
    const machine = $id("gachaMachineSprite");
    const loadOverlay = $id("gachaLoadingOverlay");
    const loadText = $id("gachaLoadingText");
    initGachaState();
    const haveTickets = ctx.S.tickets?.[ticketType] || 0;
    if (haveTickets < count) {
      const missing = count - haveTickets;
      const priceMap = { norm: 1e3, spec: 5e3, super: 25e4 };
      const ticketPrice = priceMap[ticketType] || 0;
      const cost = missing * ticketPrice;
      const tName = ticketType === "super" ? "Si\xEAu c\u01B0\u1EDDng" : ticketType === "spec" ? "\u0110\u1EB7c bi\u1EC7t" : "Th\u01B0\u1EDDng";
      if (ctx.S.coins >= cost) {
        const confirmHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 18px; font-weight: bold; color: #8a5cc0; margin-bottom: 10px;">Kh\xF4ng \u0111\u1EE7 v\xE9</div>
            <div style="font-size: 14px; margin-bottom: 15px; color: #3a2c22;">B\u1EA1n c\xF3 mu\u1ED1n d\xF9ng <b>${cost.toLocaleString()} G</b> \u0111\u1EC3 quay ${tName} \xD7${count} kh\xF4ng?</div>
            <div style="font-size: 12px; color: #7a5c38; margin-bottom: 20px;">Mua b\xF9 ${missing} v\xE9 ${tName} (${ticketPrice.toLocaleString()} G/v\xE9) \xB7 v\xE0ng hi\u1EC7n c\xF3 ${ctx.S.coins.toLocaleString()} G</div>
            <div style="display: flex; justify-content: center; gap: 10px;">
              <span class="buy" id="btnCancelRoll" style="background: #e3d5c8; color: #3a2c22; min-width: 80px; text-align: center;">Th\xF4i</span>
              <span class="buy" id="btnConfirmRoll" style="min-width: 140px; text-align: center;">D\xF9ng v\xE0ng & quay</span>
            </div>
          </div>
        `;
        openModal("M\xE1y Gachapon", confirmHTML);
        $id("btnCancelRoll").addEventListener("click", () => {
          openGachaModal();
        });
        $id("btnConfirmRoll").addEventListener("click", () => {
          if (ctx.S.coins < cost) return toast("Kh\xF4ng \u0111\u1EE7 v\xE0ng");
          ctx.S.coins -= cost;
          ctx.S.tickets[ticketType] = (ctx.S.tickets[ticketType] || 0) + missing;
          save();
          renderStatus();
          openGachaModal();
          setTimeout(() => doRoll(ticketType, count), 50);
        });
        return;
      } else {
        toast(`C\u1EA7n ${count} V\xE9 ${tName} (thi\u1EBFu ${missing} v\xE9, mua m\u1EA5t ${cost.toLocaleString()} G nh\u01B0ng b\u1EA1n kh\xF4ng \u0111\u1EE7 ti\u1EC1n)!`);
        return;
      }
    }
    if (machine) machine.style.animation = "gachaShake 0.2s ease infinite";
    if (loadOverlay) loadOverlay.style.display = "flex";
    if (loadText) loadText.textContent = "\u0110ang quay...";
    const results = await executeGachaRoll(ticketType, count, (txt) => {
      if (loadText) loadText.textContent = txt;
    });
    if (machine) machine.style.animation = "";
    if (loadOverlay) loadOverlay.style.display = "none";
    if (results) {
      const uniques = results.filter((r) => r.type === "unique");
      if (uniques.length > 0) {
        let currentShowcase = 0;
        const showcaseOverlay = $id("gachaShowcaseOverlay");
        const scRarity = $id("gachaShowcaseRarity");
        const scIcon = $id("gachaShowcaseIcon");
        const scName = $id("gachaShowcaseName");
        const scDesc = $id("gachaShowcaseDesc");
        const scCard = $id("gachaShowcaseCard");
        const showNextUnique = () => {
          if (currentShowcase >= uniques.length) {
            showcaseOverlay.style.display = "none";
            triggerGridResult(ticketType, count, results);
            return;
          }
          const u = uniques[currentShowcase];
          scRarity.textContent = u.rarity;
          scRarity.style.color = u.color;
          scCard.style.boxShadow = `0 0 30px ${u.color}80`;
          scIcon.innerHTML = spriteSVG(u.spKey, 64);
          scName.textContent = u.name;
          scDesc.textContent = u.desc;
          if (u.bonusDesc) {
            const bonusEl = document.createElement("div");
            bonusEl.style.cssText = "font-size:11px; font-weight:bold; color:#ff8000; margin-top:8px; text-align:center;";
            bonusEl.textContent = u.bonusDesc;
            scDesc.appendChild(document.createElement("br"));
            scDesc.appendChild(bonusEl);
          }
          showcaseOverlay.style.display = "flex";
          scCard.style.animation = "none";
          void scCard.offsetWidth;
          scCard.style.animation = "gachaDrop 0.5s ease-out";
        };
        $id("gachaShowcaseNextBtn").onclick = () => {
          currentShowcase++;
          showNextUnique();
        };
        showNextUnique();
      } else {
        triggerGridResult(ticketType, count, results);
      }
    }
  };
  const doExchangeLegend = async () => {
    if (!ctx.S.shards || !ctx.S.shards.legend || ctx.S.shards.legend < 10) return;
    ctx.S.shards.legend -= 10;
    save();
    updateCounts();
    const loadOverlay = $id("gachaLoadingOverlay");
    const loadText = $id("gachaLoadingText");
    if (loadOverlay) loadOverlay.style.display = "flex";
    if (loadText) loadText.textContent = "\u0110ang \u0111\u1ED5i M\u1EA3nh Huy\u1EC1n Tho\u1EA1i...";
    const item = await generateUniqueItem({ rarity: "Huy\u1EC1n tho\u1EA1i", color: "#ff8000", sellPrice: 2e4, ticketType: "exchange" });
    if (loadOverlay) loadOverlay.style.display = "none";
    const results = [{ type: "unique", name: item.name, rarity: item.rarity, color: item.color, icon: spriteSVG(item.sp, 48), desc: item.desc, spKey: item.sp, count: 1 }];
    triggerGridResult("exchange", 1, results);
  };
  $id("gachaRollNorm1")?.addEventListener("click", () => doRoll("norm", 1));
  $id("gachaRollNorm10")?.addEventListener("click", () => doRoll("norm", 10));
  $id("gachaRollSpec1")?.addEventListener("click", () => doRoll("spec", 1));
  $id("gachaRollSpec10")?.addEventListener("click", () => doRoll("spec", 10));
  $id("gachaRollSuper1")?.addEventListener("click", () => doRoll("super", 1));
  $id("gachaRollSuper10")?.addEventListener("click", () => doRoll("super", 10));
  $id("gachaExchangeLegendBtn")?.addEventListener("click", () => doExchangeLegend());
}
function openGachaRatesModal() {
  const bodyHTML = `
    <div style='padding:4px; text-align:center;'>
      <h3 style='margin-top:0; color:#3a2c22; font-size:14px; margin-bottom:12px;'>B\u1EA3ng T\u1EC9 L\u1EC7 R\u01A1i \u0110\u1ED3 Gachapon</h3>
      
      <div style='font-size:12px; font-weight:bold; color:#5a3f78; margin-bottom:4px; text-align:left;'>1. T\u1EC9 l\u1EC7 Lo\u1EA1i V\u1EADt Ph\u1EA9m</div>
      <table style='width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px; background:#fff; border-radius:4px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1); color:#3a2c22;'>
        <thead>
          <tr style='background:#f0e6d2; color:#3a2c22; text-align:center;'>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>Lo\u1EA1i</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>V\xE9 Th\u01B0\u1EDDng</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>V\xE9 \u0110\u1EB7c Bi\u1EC7t</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>V\xE9 Si\xEAu C\u1EA5p</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#4a7a26;'>H\u1EA1t gi\u1ED1ng</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>42.5%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>40% <span style="color:#777;">(x5)</span></td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>0%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#e8963a;'>Ph\xE2n b\xF3n</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>42.5%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>40% <span style="color:#777;">(x3)</span></td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>0%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#4a8098;'>M\u1EA3nh v\u1EE1 (Sao/L\u0103ng quang)</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>10%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>10%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>0%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#ff4500;'>B\u1EA3o v\u1EADt \u0110\u1ED9c nh\u1EA5t (AI)</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>5%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>10%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>100%</td>
          </tr>
        </tbody>
      </table>

      <div style='font-size:12px; font-weight:bold; color:#5a3f78; margin-bottom:4px; text-align:left;'>2. Ph\u1EA9m ch\u1EA5t (khi tr\xFAng B\u1EA3o V\u1EADt \u0110\u1ED9c Nh\u1EA5t)</div>
      <table style='width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px; background:#fff; border-radius:4px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1); color:#3a2c22;'>
        <thead>
          <tr style='background:#f0e6d2; color:#3a2c22; text-align:center;'>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>\u0110\u1ED9 hi\u1EBFm</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>V\xE9 Th\u01B0\u1EDDng</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>V\xE9 \u0110\u1EB7c Bi\u1EC7t</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>V\xE9 Si\xEAu C\u1EA5p</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#ff8000;'>Huy\u1EC1n tho\u1EA1i</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>1%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>10%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>5%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#a335ee;'>S\u1EED thi</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>4%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>30%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>50%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#4a90e2;'>Hi\u1EBFm</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>20%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>40%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>45%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#b0bec5;'>Th\u01B0\u1EDDng</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>35%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>20%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>0%</td>
          </tr>
          <tr>
            <td style='padding:6px; font-weight:bold; color:#9e9e9e;'>R\xE1c</td>
            <td style='padding:6px;'>40%</td>
            <td style='padding:6px;'>0%</td>
            <td style='padding:6px;'>0%</td>
          </tr>
        </tbody>
      </table>
      
      <div style='font-size:11px; color:#555; text-align:left; background:#fafafa; padding:8px; border-radius:4px; border:1px dashed #ccc; margin-bottom:12px;'>
        <div style='margin-bottom:4px;'><b>C\u01A1 ch\u1EBF Soft-Pity (T\u0103ng d\u1EA7n):</b></div>
        <div style='margin-bottom:2px;'>- V\xE9 \u0110\u1EB7c Bi\u1EC7t: T\u1EEB m\u1ED1c <b>71</b>, m\u1ED7i v\xE9 t\u0103ng 3% t\u1EC9 l\u1EC7 ra B\u1EA3o V\u1EADt. \u0110\u1EBFn <b>${GACHA_SPEC_PITY}</b> ch\u1EAFc ch\u1EAFn ra B\u1EA3o V\u1EADt.</div>
        <div>- V\xE9 Si\xEAu C\u1EA5p: T\u1EEB m\u1ED1c <b>101</b>, m\u1ED7i v\xE9 t\u0103ng 0.95% t\u1EC9 l\u1EC7 ra <b>Huy\u1EC1n Tho\u1EA1i</b>. \u0110\u1EBFn <b>${GACHA_SUPER_PITY}</b> ch\u1EAFc ch\u1EAFn ra Huy\u1EC1n Tho\u1EA1i.</div>
      </div>

      <span class="buy" id="gachaRatesBackBtn" style="padding:6px 16px; font-size:12px; background:#4a7a26; color:#fff; cursor:pointer;">Quay L\u1EA1i Gacha</span>
    </div>
  `;
  openModal("T\u1EC9 L\u1EC7 Gachapon", bodyHTML);
  $id("gachaRatesBackBtn")?.addEventListener("click", () => {
    openGachaModal();
  });
}
var GACHA_SPEC_PITY, GACHA_SUPER_PITY, GACHA_NORM_PRICE, GACHA_SPEC_PRICE;
var init_gacha = __esm({
  "src/gacha.js"() {
    init_state();
    init_store();
    init_all();
    init_data();
    init_graphics();
    init_witch();
    init_render();
    init_shop();
    init_events();
    init_prompt();
    GACHA_SPEC_PITY = 100;
    GACHA_SUPER_PITY = 200;
    GACHA_NORM_PRICE = 1e3;
    GACHA_SPEC_PRICE = 5e3;
  }
});

// src/bet-odds.js
function rollD100(rnd = Math.random) {
  const n = 1 + Math.floor(rnd() * 100);
  return Math.min(100, Math.max(1, n));
}
function rollAnchor(rnd = Math.random) {
  const span = ANCHOR_MAX - ANCHOR_MIN + 1;
  const n = ANCHOR_MIN + Math.floor(rnd() * span);
  return Math.min(ANCHOR_MAX, Math.max(ANCHOR_MIN, n));
}
function clampAnchor(n) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return ANCHOR_MIN;
  return Math.min(ANCHOR_MAX, Math.max(ANCHOR_MIN, v));
}
function safeAmount(v) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function oddsOf(anchor2, side) {
  const n = Math.floor(Number(anchor2));
  const wins = side === "hi" ? 100 - n : n - 1;
  if (!Number.isFinite(wins) || wins <= 0) {
    return { wins: 0, chance: 0, mult: 0, locked: true };
  }
  const soVanThua = 99 - wins;
  if (soVanThua <= 0) {
    return { wins: 0, chance: 0, mult: 0, locked: true };
  }
  return {
    wins,
    chance: wins / 100,
    mult: Math.max(MIN_MULT, Math.round(HOUSE_RETURN / wins * 100) / 100),
    locked: false
  };
}
function resolveRoll(anchor2, side, roll) {
  if (roll === anchor2) return "push";
  return side === "hi" === roll > anchor2 ? "win" : "lose";
}
function resolveStake(want, coins) {
  return Math.min(safeAmount(want), safeAmount(coins), POT_CAP);
}
function nextPot(pot, mult) {
  const m = Number.isFinite(Number(mult)) && Number(mult) > 0 ? Number(mult) : 0;
  return safeAmount(Math.min(POT_CAP, Math.floor(safeAmount(pot) * m)));
}
function applyCashOut(state) {
  const pot = safeAmount(state.betPot);
  state.betPot = 0;
  if (pot <= 0) return 0;
  state.coins = safeAmount(state.coins) + pot;
  return pot;
}
function resultLabel(roll, kq, mult, nextAnchor) {
  const r = Number.isFinite(Number(roll)) ? Math.floor(Number(roll)) : "?";
  const m = Number.isFinite(Number(mult)) ? Number(mult).toFixed(2) : "?";
  const phan = kq === "win" ? "Th\u1EAFng \xD7" + m : kq === "lose" ? "M\u1EA5t tr\u1EAFng" : kq === "push" ? "Ho\xE0, ti\u1EC1n gi\u1EEF nguy\xEAn" : "Xong";
  const khac = Number.isFinite(Number(nextAnchor)) && Math.floor(Number(nextAnchor)) !== r;
  return "Ra " + r + " \xB7 " + phan + (khac ? " \xB7 v\xE1n t\u1EDBi t\u1EEB " + Math.floor(Number(nextAnchor)) : "");
}
var POT_CAP, HOUSE_RETURN, MIN_MULT, ANCHOR_MIN, ANCHOR_MAX;
var init_bet_odds = __esm({
  "src/bet-odds.js"() {
    POT_CAP = Number.MAX_SAFE_INTEGER;
    HOUSE_RETURN = 97;
    MIN_MULT = 1.01;
    ANCHOR_MIN = 5;
    ANCHOR_MAX = 96;
  }
});

// src/bet.js
function getPot() {
  return safeAmount(ctx.S.betPot);
}
function setPot(v) {
  ctx.S.betPot = safeAmount(v);
}
function stopSpin() {
  if (spinTimer !== null) {
    window.clearInterval(spinTimer);
    spinTimer = null;
  }
  clearHold();
  busy = false;
}
function clearHold() {
  if (holdTimer !== null) {
    window.clearTimeout(holdTimer);
    holdTimer = null;
  }
  shown = null;
}
function cashOut(quiet, immediate) {
  stopSpin();
  const pot = applyCashOut(ctx.S);
  if (pot <= 0) return 0;
  try {
    save(immediate);
  } catch (e) {
  }
  try {
    renderStatus();
  } catch (e) {
  }
  if (!quiet) {
    try {
      toast("\u0110\xE3 r\xFAt " + pot.toLocaleString() + " G v\u1EC1 v\xED");
    } catch (e) {
    }
  }
  return pot;
}
function newRound() {
  anchor = rollAnchor();
}
function fmt(n) {
  return safeAmount(n).toLocaleString();
}
function openBetModal() {
  if (getPot() <= 0) {
    chain = [];
    newRound();
  }
  openModal("\u0110\u1ECF \u0110en", `
    <div class="betwrap">
      <div class="note" id="betCoins"></div>
      <div class="betnum" id="betNum">${anchor}</div>
      <div class="betresult" id="betResult"></div>
      <div class="betchain" id="betChain"></div>
      <div id="betStake"></div>
      <div class="betsides">
        <div class="betside hi" data-side="hi">\u25B2 L\u1EDAN<span class="mult" id="betMultHi"></span><span class="chance" id="betChanceHi"></span></div>
        <div class="betside lo" data-side="lo">\u25BC NH\u1ECE<span class="mult" id="betMultLo"></span><span class="chance" id="betChanceLo"></span></div>
      </div>
    </div>`, true);
  const render = () => {
    if (!$id("betCoins")) return;
    const pot = getPot();
    $id("betCoins").textContent = "V\xE0ng: " + fmt(ctx.S.coins) + " G";
    $id("betNum").textContent = String(shown ? shown.roll : anchor);
    $id("betNum").classList.toggle("res", !!shown);
    $id("betResult").textContent = shown ? resultLabel(shown.roll, shown.kq, shown.mult, anchor) : "S\u1ED1 g\u1ED1c \u2014 c\u01B0\u1EE3c L\u1EDBn hay Nh\u1ECF cho l\u1EA7n quay t\u1EDBi";
    $id("betChain").textContent = chain.length ? "Chu\u1ED7i: " + chain.join(" \u2192 ") : "";
    if (pot > 0) {
      $id("betStake").innerHTML = `<div class="betpot">Tr\xEAn b\xE0n: ${fmt(pot)} G</div>
         <span class="buy" id="betCash">R\xFAt ${fmt(pot)} G</span>`;
      $id("betCash").addEventListener("click", () => {
        if (busy) return;
        cashOut();
        chain = [];
        newRound();
        render();
      });
    } else if (!$id("betAmt")) {
      $id("betStake").innerHTML = `<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;margin:8px 0 2px">
           <input class="inp" id="betAmt" type="number" min="1" value="${Math.min(100, safeAmount(ctx.S.coins)) || 1}" style="width:110px">
           <span class="buy plain" data-quick="4">\xBC</span>
           <span class="buy plain" data-quick="2">\xBD</span>
           <span class="buy plain" data-quick="1">Max</span>
         </div>`;
      $id("betStake").querySelectorAll("[data-quick]").forEach((b) => b.addEventListener("click", () => {
        const amt = $id("betAmt");
        if (amt) amt.value = String(Math.max(1, Math.floor(safeAmount(ctx.S.coins) / Number(b.dataset.quick))));
      }));
    }
    ["hi", "lo"].forEach((side) => {
      const o = oddsOf(anchor, side);
      const el = $id("betMult" + (side === "hi" ? "Hi" : "Lo"));
      const ch = $id("betChance" + (side === "hi" ? "Hi" : "Lo"));
      el.textContent = o.locked ? "\u2014" : "\xD7" + o.mult.toFixed(2);
      ch.textContent = o.locked ? "kh\xF4ng th\u1EC3 th\u1EAFng" : Math.round(o.chance * 100) + "%";
      $id("mbody").querySelector(".betside." + side).classList.toggle("off", o.locked);
    });
    if (getPot() >= POT_CAP) {
      $id("mbody").querySelectorAll(".betside").forEach((el) => el.classList.add("off"));
    }
  };
  const play = (side) => {
    if (busy) return;
    clearHold();
    const o = oddsOf(anchor, side);
    if (o.locked) return toast("C\u1EEDa n\xE0y kh\xF4ng c\xF3 kh\u1EA3 n\u0103ng th\u1EAFng n\xE0o");
    if (getPot() >= POT_CAP) return toast("\u0110\xE3 ch\u1EA1m tr\u1EA7n, r\xFAt ti\u1EC1n ra \u0111\xE3");
    if (getPot() <= 0) {
      const el = $id("betAmt");
      const want = safeAmount(el && el.value);
      const coins = safeAmount(ctx.S.coins);
      if (want <= 0) return toast("Nh\u1EADp s\u1ED1 v\xE0ng mu\u1ED1n c\u01B0\u1EE3c \u0111\xE3");
      if (want > coins) return toast("Kh\xF4ng \u0111\u1EE7 v\xE0ng, b\u1EA1n ch\u1EC9 c\xF3 " + fmt(coins) + " G");
      const stake = resolveStake(want, coins);
      if (stake < want) toast("V\u01B0\u1EE3t tr\u1EA7n, \u0111\xE3 h\u1EA1 xu\u1ED1ng " + fmt(POT_CAP) + " G");
      ctx.S.coins = safeAmount(coins - stake);
      setPot(stake);
      save();
    }
    busy = true;
    const num = $id("betNum");
    num.classList.add("rolling");
    const roll = rollD100();
    let tick2 = 0;
    spinTimer = window.setInterval(() => {
      const numNow = $id("betNum");
      if (!numNow) {
        window.clearInterval(spinTimer);
        spinTimer = null;
        busy = false;
        return;
      }
      numNow.textContent = String(rollD100());
      if (++tick2 >= 12) {
        window.clearInterval(spinTimer);
        spinTimer = null;
        numNow.classList.remove("rolling");
        numNow.textContent = String(roll);
        finish(roll, side, o);
      }
    }, 50);
  };
  const finish = (roll, side, o) => {
    const kq = resolveRoll(anchor, side, roll);
    chain = chain.concat(roll).slice(-8);
    if (kq === "push") {
      toast("Ho\xE0! Ra \u0111\xFAng " + roll + ", ti\u1EC1n gi\u1EEF nguy\xEAn");
    } else if (kq === "win") {
      const truoc = getPot();
      setPot(nextPot(truoc, o.mult));
      anchor = clampAnchor(roll);
      toast("Th\u1EAFng! " + fmt(truoc) + " \u2192 " + fmt(getPot()) + " G");
      if (getPot() >= POT_CAP) toast("Ch\u1EA1m tr\u1EA7n " + fmt(POT_CAP) + " G, r\xFAt th\xF4i!");
    } else {
      setPot(0);
      toast("M\u1EA5t tr\u1EAFng! Ra " + roll);
      chain = [];
      newRound();
    }
    shown = { roll, kq, mult: o.mult };
    save();
    busy = false;
    renderStatus();
    render();
    holdTimer = window.setTimeout(() => {
      holdTimer = null;
      shown = null;
      render();
    }, kq === "lose" ? HOLD_LOSE_MS : HOLD_MS);
  };
  $id("mbody").querySelectorAll("[data-side]").forEach((b) => b.addEventListener("click", () => play(b.dataset.side)));
  render();
}
var anchor, chain, busy, spinTimer, holdTimer, shown, HOLD_MS, HOLD_LOSE_MS;
var init_bet = __esm({
  "src/bet.js"() {
    init_shop();
    init_store();
    init_state();
    init_witch();
    init_render();
    init_bet_odds();
    init_all();
    anchor = 0;
    chain = [];
    busy = false;
    spinTimer = null;
    holdTimer = null;
    shown = null;
    HOLD_MS = 1e3;
    HOLD_LOSE_MS = 3e3;
  }
});

// src/shop.js
function openModal(title, bodyHTML, keepBetTable) {
  if (!keepBetTable && cashOut) cashOut();
  $id("mtitle-text").textContent = title;
  $id("mbody").innerHTML = bodyHTML;
  $id("modal").classList.add("open");
}
function closeModal() {
  if (cashOut) cashOut();
  $id("modal").classList.remove("open");
  $id("mbody").innerHTML = "";
  setPendingPick(null);
  bagSellMode = false;
}
function openAchivModal() {
  if (!ctx.S.stats) ctx.S.stats = { totalHarvests: 0, totalCrits: 0 };
  if (!ctx.S.achiv) ctx.S.achiv = { naoya: { claimed: false } };
  const stats = ctx.S.stats;
  const n = ctx.S.achiv.naoya;
  const q1 = Math.min(240, stats.totalHarvests);
  const q2 = Math.min(24, ctx.S.hero?.maxStage || 1);
  const q3 = Math.min(2400, stats.totalCrits);
  const done = q1 >= 240 && q2 >= 24 && q3 >= 2400;
  const btn = n.claimed ? `<div class="buy off" style="text-align:center; padding:10px;">\u0110\xE3 \u0110\xE1nh Th\u1EE9c Naoya Slime</div>` : done ? `<div class="buy" id="claimNaoya" style="text-align:center; padding:10px; font-size:14px; background:#fcd34d; color:#27272a; border-color:#d97706; box-shadow: 0 4px 10px rgba(252,211,77,0.4);">\u2726 \u0110\xD3N K\u1EBA KI\xCAU NG\u1EA0O V\u1EC0 NH\xC0 \u2726</div>` : `<div class="buy off" style="text-align:center; padding:10px;">Ch\u01B0a \u0110\u1EE7 \u0110i\u1EC1u Ki\u1EC7n</div>`;
  openModal("Th\xE1nh Ph\u1EA3 Th\xE0nh T\u1EF1u", `
      <div class="note" style="margin-bottom:12px;">C\xE1c Spec Pet (Th\u1EA7n Th\xFA \u0110\u1ED9c Nh\u1EA5t) kh\xF4ng th\u1EC3 d\xF9ng V\xE0ng v\u1EA5y b\u1EA9n. B\u1EA1n ph\u1EA3i ch\u1EE9ng minh th\u1EF1c l\u1EF1c qua Th\xE0nh T\u1EF1u.</div>
      
      <!-- B\u1ECCC TO\xC0N B\u1ED8 B\u1EB0NG DETAILS \u0110\u1EC2 C\xD3 TH\u1EC2 THU G\u1ECCN TO\xC0N T\u1EACP -->
      <details style="background:#2c2538; border:2px solid #bd923b; border-radius:10px; margin-bottom:10px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);" open>
          
          <summary style="display:flex; justify-content:space-between; align-items:center; padding:15px; cursor:pointer; outline:none;">
             <div style="font-weight:bold; font-size:15px; color:#fcd34d; text-shadow: 0 1px 2px #000;">
                 M\xE0y kh\xF4ng c\xF3 tr\xE1i tim con ng\u01B0\u1EDDi \xE0?
             </div>
             <div style="display:inline-block; vertical-align:middle; animation: pulse 2s infinite;">
                 ${spriteSVG("achivStar", 24)}
             </div>
          </summary>
          
          <div style="padding: 0 15px 15px 15px;">
              <div style="font-size:12px; color:#d0ce70; margin-bottom:14px; font-style:italic; border-bottom: 1px solid #4a3461; padding-bottom: 10px;">
                  "\u0110\xE1nh th\u1EE9c Slime Thi\u1EBFu Gia (Naoya) - K\u1EBB c\u0103m gh\xE9t s\u1EF1 ch\u1EADm ch\u1EA1p v\xE0 y\u1EBFu k\xE9m."
              </div>
              
              <div style="margin-top: 10px;">
                  <div style="font-size:12px; margin-bottom:4px; font-weight:bold; color:#fff;">1. S\u1EF1 T\xE0n \xDAa: <span style="color:#aaa; font-weight:normal;">Thu ho\u1EA1ch 240 N\xF4ng s\u1EA3n b\u1EA5t k\u1EF3</span></div>
                  <div class="achiv-bar" style="background:#000; border-radius:4px; border:1px solid #4a3461; height:10px; position:relative; margin-bottom:12px; overflow:hidden;">
                      <div style="background:linear-gradient(90deg, #7c3aed, #a78bfa); width:${q1 / 240 * 100}%; height:100%;"></div>
                      <div style="position:absolute; right:2px; top:-2px; font-size:10px; color:#fff;">${q1}/240</div>
                  </div>
                  
                  <div style="font-size:12px; margin-bottom:4px; font-weight:bold; color:#fff;">2. \u0110\u1EE9ng Tr\xEAn T\u1EA5t C\u1EA3: <span style="color:#aaa; font-weight:normal;">Ch\u1EA1m t\u1EDBi Stage 24 \u1EDF Th\xE1m Hi\u1EC3m</span></div>
                  <div class="achiv-bar" style="background:#000; border-radius:4px; border:1px solid #4a3461; height:10px; position:relative; margin-bottom:12px; overflow:hidden;">
                      <div style="background:linear-gradient(90deg, #7c3aed, #a78bfa); width:${q2 / 24 * 100}%; height:100%;"></div>
                      <div style="position:absolute; right:2px; top:-2px; font-size:10px; color:#fff;">${q2}/24</div>
                  </div>
                  
                  <div style="font-size:12px; margin-bottom:4px; font-weight:bold; color:#fff;">3. K\u1EBB Cu\u1ED3ng T\u1ED1c \u0110\u1ED9: <span style="color:#aaa; font-weight:normal;">G\xE2y 2400 \u0111\xF2n Ch\xED M\u1EA1ng (Crit) \u1EDF Dungeon</span></div>
                  <div class="achiv-bar" style="background:#000; border-radius:4px; border:1px solid #4a3461; height:10px; position:relative; margin-bottom:16px; overflow:hidden;">
                      <div style="background:linear-gradient(90deg, #7c3aed, #a78bfa); width:${q3 / 2400 * 100}%; height:100%;"></div>
                      <div style="position:absolute; right:2px; top:-2px; font-size:10px; color:#fff;">${q3}/2400</div>
                  </div>
              </div>

              <div style="margin-top:10px;">${btn}</div>
          </div>
      </details>
  `);
  const claimBtn = $id("claimNaoya");
  if (claimBtn) claimBtn.addEventListener("click", () => {
    ctx.S.achiv.naoya.claimed = true;
    if (!ctx.S.pets.includes("naoyaSlime")) {
      ctx.S.pets.push("naoyaSlime");
      toast("\u2726 B\xD9M! Naoya \u0111\xE3 khinh b\u1EC9 b\u01B0\u1EDBc v\xE0o Balo c\u1EE7a b\u1EA1n!");
    }
    save();
    openAchivModal();
  });
}
function openPanel(kind) {
  if (kind === "gacha") {
    return openGachaModal();
  }
  if (kind === "dungeon") {
    return openDungeonView();
  }
  if (kind === "bet") {
    return openBetModal();
  }
  if (kind === "trade") {
    return openTradeModal();
  }
  if (kind === "shop") {
    const tabs = [["seed", "H\u1EA1t gi\u1ED1ng"], ["fert", "Ph\xE2n b\xF3n"], ["pet", "Th\xFA c\u01B0ng"], ["pass", "V\xE9"], ["ticket", "V\xE9 Gacha"]];
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
    } else if (shopTab === "ticket") {
      items = `
        <div class="item"><span class="icon">${spriteSVG("ticketNorm", 32)}</span>
          <span class="info"><div class="name">V\xE9 Quay Th\u01B0\u1EDDng</div><div class="meta">D\xF9ng quay m\xE1y Gachapon nh\u1EADn qu\xE0 ng\u1EABu nhi\xEAn \xB7 \u0110ang c\xF3 ${ctx.S.tickets?.norm || 0}</div></span>
          <span class="price">${spriteSVG("coin", 16)}1,000</span>
          <span class="buy${ctx.S.coins < 1e3 ? " off" : ""}" data-buyticket="norm">Mua</span></div>
        <div class="item"><span class="icon">${spriteSVG("ticketSpec", 32)}</span>
          <span class="info"><div class="name">V\xE9 Quay \u0110\u1EB7c Bi\u1EC7t</div><div class="meta">D\xF9ng quay Gachapon \u0110\u1EB7c Bi\u1EC7t t\u0103ng t\u1EF7 l\u1EC7 ra \u0111\u1ED3 \u0111\u1ED9c nh\u1EA5t \xB7 \u0110ang c\xF3 ${ctx.S.tickets?.spec || 0}</div></span>
          <span class="price">${spriteSVG("coin", 16)}5,000</span>
          <span class="buy${ctx.S.coins < 5e3 ? " off" : ""}" data-buyticket="spec">Mua</span></div>
        <div class="item"><span class="icon">${spriteSVG("ticketSuper", 32)}</span>
          <span class="info"><div class="name" style="color:#ff4500;">V\xE9 Quay Si\xEAu C\u01B0\u1EDDng</div><div class="meta">D\xF9ng quay 1 ph\xE1t 100% ra b\u1EA3o v\u1EADt AI (t\u1EEB Hi\u1EBFm \u0111\u1EBFn Huy\u1EC1n Tho\u1EA1i) \xB7 \u0110ang c\xF3 ${ctx.S.tickets?.super || 0}</div></span>
          <span class="price">${spriteSVG("coin", 16)}250,000</span>
          <span class="buy${ctx.S.coins < 25e4 ? " off" : ""}" data-buyticket="super" style="background:#ff4500; border:1px solid #cc3700; color:#fff;">Mua</span></div>`;
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
    $id("mbody").querySelectorAll("[data-buyticket]").forEach((b) => b.addEventListener("click", () => {
      openBuyDlg("ticket", b.dataset.buyticket, "shop");
    }));
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
    const btabs = `<div class="tabs"><span class="tab${bagTab === "crop" ? " active" : ""}" data-btab="crop">N\xF4ng s\u1EA3n</span><span class="tab${bagTab === "seed" ? " active" : ""}" data-btab="seed">H\u1EA1t gi\u1ED1ng</span><span class="tab${bagTab === "gacha" ? " active" : ""}" data-btab="gacha">\u0110\u1ED3 Gacha</span><span class="tab${bagTab === "pet" ? " active" : ""}" data-btab="pet">B\xE9 tr\xF2n</span><span class="tab${bagTab === "relic" ? " active" : ""}" data-btab="relic">Qu\xE0 c\u1EE7a b\xE9 tr\xF2n</span></div>`;
    if (bagTab === "seed") {
      const seedKeys = Object.keys(ctx.S.seeds || {}).filter((k) => k !== "mystery");
      const rows2 = seedKeys.map((key) => {
        const n = ctx.S.seeds[key];
        if (n <= 0) return "";
        const def = CROPS[key];
        if (!def) return "";
        const price = Math.floor((def.seed || 100) * 0.5);
        if (bagSellMode) {
          const on2 = !!bagSel[key];
          return `
        <div class="item selrow${on2 ? " selon" : ""}" data-selkey="${key}"><span class="icon">${spriteSVG(def.sp, 32)}</span>
          <span class="info"><div class="name">H\u1EA1t ${def.name} \xD7${n}</div><div class="meta">Gi\xE1 thu mua: ${price} G/h\u1EA1t</div></span>
          <span class="selmark">${on2 ? "\u2713" : ""}</span></div>`;
        }
        return `
        <div class="item"><span class="icon">${spriteSVG(def.sp, 32)}</span>
          <span class="info"><div class="name">H\u1EA1t ${def.name} \xD7${n}</div><div class="meta">Gi\xE1 thu mua: ${price} G/h\u1EA1t</div></span>
          <span class="acts">
            <span class="ibtn" data-sellseeddlg="${key}" title="B\xE1n (t\u1EF1 ch\u1ECDn s\u1ED1 l\u01B0\u1EE3ng)">${spriteSVG("coin", 16)}</span>
          </span></div>`;
      }).join("");
      let sellBar2 = "";
      if (seedKeys.length) {
        if (bagSellMode) {
          const total = Object.keys(bagSel).filter((k) => bagSel[k] && ctx.S.seeds[k]).reduce((s, k) => {
            const def = CROPS[k];
            if (!def) return s;
            const p = Math.floor((def.seed || 100) * 0.5);
            return s + p * ctx.S.seeds[k];
          }, 0);
          sellBar2 = `<div class="note" style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;margin-bottom:8px;white-space:nowrap;overflow:hidden">
            <b style="overflow:hidden;text-overflow:ellipsis">${total > 0 ? "T\u1ED5ng " + total.toLocaleString() + " G" : "B\u1EA5m v\xE0o t\u1EEBng m\u1EE5c \u0111\u1EC3 tick ch\u1ECDn th\u1EE9 mu\u1ED1n b\xE1n"}</b><span style="flex:1"></span>
            <span class="buy" id="sellSelGo" style="padding:4px 10px;font-size:11px;flex:none">B\xE1n</span>
            <span class="buy plain" id="sellSelNo" style="padding:4px 10px;font-size:11px;flex:none">Hu\u1EF7</span></div>`;
        } else {
          sellBar2 = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div class="note" style="flex:1"></div>
            <span class="buy" id="sellModeGo" style="flex:none">B\xE1n m\u1ED9t ch\u1EA1m</span></div>`;
        }
      }
      openModal("Balo", btabs + sellBar2 + (rows2 || '<div class="note">B\u1EA1n ch\u01B0a c\xF3 h\u1EA1t gi\u1ED1ng n\xE0o, ra c\u1EEDa h\xE0ng mua th\xEAm \u0111i!</div>'));
      $id("mbody").querySelectorAll("[data-btab]").forEach((t) => t.addEventListener("click", () => {
        bagTab = t.dataset.btab;
        openPanel("bag");
      }));
      $id("mbody").querySelectorAll("[data-sellseeddlg]").forEach((b) => b.addEventListener("click", () => openSellSeedDlg(b.dataset.sellseeddlg)));
      const smGo2 = $id("sellModeGo");
      if (smGo2) smGo2.addEventListener("click", () => {
        bagSellMode = true;
        bagSel = {};
        openPanel("bag");
      });
      $id("mbody").querySelectorAll("[data-selkey]").forEach((el) => el.addEventListener("click", () => {
        bagSel[el.dataset.selkey] = !bagSel[el.dataset.selkey];
        openPanel("bag");
      }));
      const ssNo2 = $id("sellSelNo");
      if (ssNo2) ssNo2.addEventListener("click", () => {
        bagSellMode = false;
        openPanel("bag");
      });
      const ssGo2 = $id("sellSelGo");
      if (ssGo2) ssGo2.addEventListener("click", () => {
        const keys = Object.keys(bagSel).filter((k) => bagSel[k] && ctx.S.seeds[k]);
        if (!keys.length) return toast("Ch\u01B0a tick c\xE1i n\xE0o c\u1EA3");
        let gain = 0;
        keys.forEach((k) => {
          const def = CROPS[k];
          if (def) {
            const p = Math.floor((def.seed || 100) * 0.5);
            gain += p * ctx.S.seeds[k];
          }
          delete ctx.S.seeds[k];
        });
        ctx.S.coins += gain;
        ctx.S.totalSales += gain;
        bagSellMode = false;
        save();
        renderStatus();
        toast("B\xE1n m\u1ED9t m\u1EBB h\u1EA1t gi\u1ED1ng: +" + gain.toLocaleString() + " G");
        openPanel("bag");
      });
      return;
    }
    if (bagTab === "gacha") {
      const gachaKeys = Object.keys(ctx.S.bag || {}).filter((k) => k.startsWith("unique@"));
      const rarityVal = { "R\xE1c": 0, "Th\u01B0\u1EDDng": 1, "Hi\u1EBFm": 2, "S\u1EED thi": 3, "Huy\u1EC1n tho\u1EA1i": 4 };
      if (gachaSortMode === "desc") {
        gachaKeys.sort((a, b) => {
          const rA = ctx.S.uniques?.[a]?.rarity || "Th\u01B0\u1EDDng";
          const rB = ctx.S.uniques?.[b]?.rarity || "Th\u01B0\u1EDDng";
          return (rarityVal[rB] || 0) - (rarityVal[rA] || 0);
        });
      } else if (gachaSortMode === "asc") {
        gachaKeys.sort((a, b) => {
          const rA = ctx.S.uniques?.[a]?.rarity || "Th\u01B0\u1EDDng";
          const rB = ctx.S.uniques?.[b]?.rarity || "Th\u01B0\u1EDDng";
          return (rarityVal[rA] || 0) - (rarityVal[rB] || 0);
        });
      }
      const rows2 = gachaKeys.map((key) => {
        const n = ctx.S.bag[key];
        const item = ctx.S.uniques?.[key] || { name: "V\u1EADt ph\u1EA9m Gacha", rarity: "\u0110\u1EB7c bi\u1EC7t", desc: "", color: "#4a90e2", sell: 2500, sp: "strawhat" };
        const d0 = mutDescOf(key);
        const mdesc = d0 ? " \xB7 " + d0 : "";
        if (bagSellMode) {
          const on2 = !!bagSel[key];
          return `
        <div class="item selrow${on2 ? " selon" : ""}" data-selkey="${key}"><span class="icon">${spriteSVG(item.sp, 32)}</span>
          <span class="info"><div class="name" style="color:${item.color}">${item.name} \xD7${n} <span style="display:inline-block; font-size:10px; padding:1px 4px; border-radius:3px; background:${item.color}; color:#fff; white-space:nowrap;">${item.rarity}</span></div><div class="meta">${bagPrice(key)} G/c\xE1i${esc(mdesc)}</div></span>
          <span class="selmark">${on2 ? "\u2713" : ""}</span></div>`;
        }
        return `
        <div class="item"><span class="icon">${spriteSVG(item.sp, 32)}</span>
          <span class="info"><div class="name" style="color:${item.color}">${item.name} \xD7${n} <span style="display:inline-block; font-size:10px; padding:1px 4px; border-radius:3px; background:${item.color}; color:#fff; white-space:nowrap;">${item.rarity}</span></div><div class="meta">${bagPrice(key)} G/c\xE1i \xB7 ${esc(item.desc || "V\u1EADt ph\u1EA9m \u0111\u1ED9c nh\u1EA5t")}</div></span>
          <span class="acts">
            <span class="ibtn" data-takeout="${key}" title="L\u1EA5y ra (mang v\xE0o c\u1ED1t truy\u1EC7n, kh\xF4ng quy ra ti\u1EC1n)">${spriteSVG("emBang", 16)}</span>
            <span class="ibtn" data-selldlg="${key}" title="B\xE1n (t\u1EF1 ch\u1ECDn s\u1ED1 l\u01B0\u1EE3ng)">${spriteSVG("coin", 16)}</span>
          </span></div>`;
      }).join("");
      let sellBar2 = "";
      if (gachaKeys.length) {
        const sortLabel = gachaSortMode === "default" ? "L\u1ECDc: M\u1EDBi nh\u1EA5t" : gachaSortMode === "desc" ? "L\u1ECDc: Hi\u1EBFm gi\u1EA3m d\u1EA7n" : "L\u1ECDc: Hi\u1EBFm t\u0103ng d\u1EA7n";
        if (bagSellMode) {
          const total = Object.keys(bagSel).filter((k) => bagSel[k] && ctx.S.bag[k]).reduce((s, k) => s + bagPrice(k) * ctx.S.bag[k], 0);
          sellBar2 = `<div class="note" style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;margin-bottom:8px;white-space:nowrap;overflow:hidden">
            <b style="overflow:hidden;text-overflow:ellipsis">${total > 0 ? "T\u1ED5ng " + total.toLocaleString() + " G" : "B\u1EA5m v\xE0o t\u1EEBng m\u1EE5c \u0111\u1EC3 tick ch\u1ECDn th\u1EE9 mu\u1ED1n b\xE1n"}</b><span style="flex:1"></span>
            <span class="buy plain" id="sortGachaBtn" style="padding:4px 8px;font-size:11px;flex:none">${sortLabel}</span>
            <span class="buy" id="sellSelGo" style="padding:4px 10px;font-size:11px;flex:none">B\xE1n</span>
            <span class="buy plain" id="sellSelNo" style="padding:4px 10px;font-size:11px;flex:none">Hu\u1EF7</span></div>`;
        } else {
          sellBar2 = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div class="note" style="flex:1">B\u1EA5m \xAB!\xBB \u0111\u1EC3 l\u1EA5y \u0111\u1ED3 Gacha ra mang v\xE0o c\u1ED1t truy\u1EC7n</div>
            <span class="buy plain" id="sortGachaBtn" style="padding:4px 8px;font-size:11px;flex:none">${sortLabel}</span>
            <span class="buy" id="sellModeGo" style="flex:none">B\xE1n m\u1ED9t ch\u1EA1m</span></div>`;
        }
      }
      openModal("Balo", btabs + sellBar2 + (rows2 || '<div class="note">Ch\u01B0a c\xF3 v\u1EADt ph\u1EA9m Gacha n\xE0o, sang m\xE1y Gachapon quay th\u1EED \u0111i!</div>'));
      $id("mbody").querySelectorAll("[data-btab]").forEach((t) => t.addEventListener("click", () => {
        bagTab = t.dataset.btab;
        openPanel("bag");
      }));
      $id("mbody").querySelectorAll("[data-selldlg]").forEach((b) => b.addEventListener("click", () => openSellDlg(b.dataset.selldlg)));
      $id("mbody").querySelectorAll("[data-takeout]").forEach((b) => b.addEventListener("click", () => openTakeout(b.dataset.takeout)));
      const smGo2 = $id("sellModeGo");
      if (smGo2) smGo2.addEventListener("click", () => {
        bagSellMode = true;
        bagSel = {};
        openPanel("bag");
      });
      const sortBtn = $id("sortGachaBtn");
      if (sortBtn) sortBtn.addEventListener("click", () => {
        gachaSortMode = gachaSortMode === "default" ? "desc" : gachaSortMode === "desc" ? "asc" : "default";
        openPanel("bag");
      });
      $id("mbody").querySelectorAll("[data-selkey]").forEach((el) => el.addEventListener("click", () => {
        bagSel[el.dataset.selkey] = !bagSel[el.dataset.selkey];
        openPanel("bag");
      }));
      const ssNo2 = $id("sellSelNo");
      if (ssNo2) ssNo2.addEventListener("click", () => {
        bagSellMode = false;
        openPanel("bag");
      });
      const ssGo2 = $id("sellSelGo");
      if (ssGo2) ssGo2.addEventListener("click", () => {
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
        toast("B\xE1n m\u1ED9t m\u1EBB \u0111\u1ED3 Gacha: +" + gain.toLocaleString() + " G");
        openPanel("bag");
      });
      return;
    }
    if (bagTab === "relic") {
      const sh2 = ctx.S.shards || { prism: 0, star: 0, legend: 0 };
      const normTk = ctx.S.tickets?.norm || 0;
      const specTk = ctx.S.tickets?.spec || 0;
      const ticketRows = (normTk > 0 ? `
      <div class="item"><span class="icon">${spriteSVG("ticketNorm", 30)}</span>
        <span class="info"><div class="name">V\xE9 Quay Th\u01B0\u1EDDng \xD7${normTk}</div><div class="meta">D\xF9ng \u1EDF m\xE1y Gachapon</div></span></div>` : "") + (specTk > 0 ? `
      <div class="item"><span class="icon">${spriteSVG("ticketSpec", 30)}</span>
        <span class="info"><div class="name">V\xE9 Quay \u0110\u1EB7c Bi\u1EC7t \xD7${specTk}</div><div class="meta">D\xF9ng \u1EDF m\xE1y Gachapon</div></span></div>` : "");
      const relicRows = ticketRows + (ctx.S.seeds.mystery > 0 ? `
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
      $id("mbody").querySelectorAll("[data-takeout]").forEach((b) => b.addEventListener("click", () => openTakeout(b.dataset.takeout)));
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
    const rows = Object.keys(ctx.S.bag).filter((k) => !k.startsWith("unique@")).map((key) => {
      const n = ctx.S.bag[key];
      const id = key.split("@")[0], mut = key.indexOf("@") > 0;
      const def = CROPS[id] || { sp: "seedLight", name: "N\xF4ng s\u1EA3n l\u1EA1" };
      const d0 = mutDescOf(key);
      const mdesc = d0 ? " \xB7 " + d0 : "";
      if (bagSellMode) {
        const on2 = !!bagSel[key];
        return `
      <div class="item selrow${on2 ? " selon" : ""}" data-selkey="${key}"><span class="icon">${spriteSVG(def.sp, 32)}</span>
        <span class="info"><div class="name">${bagName(key)} \xD7${n}${mut ? ' <span style="font-size:11px;color:#8a5cc0">\u2726</span>' : ""}</div><div class="meta">${bagPrice(key)} G/c\xE1i${esc(mdesc)}</div></span>
        <span class="selmark">${on2 ? "\u2713" : ""}</span></div>`;
      }
      return `
      <div class="item"><span class="icon">${spriteSVG(def.sp, 32)}</span>
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
      <div style="font-size:11px; color:#a3763d; text-align:center; margin-bottom: 12px; font-weight: bold; background: rgba(0,0,0,0.05); padding: 4px; border-radius: 4px; user-select: text;">ID Ng\u01B0\u1EDDi Ch\u01A1i: ${ctx.S.playerId}</div>
      <div class="shead" style="margin-top:0">T\xEAn ng\u01B0\u1EDDi ch\u01A1i (\u0111\u1EC3 giao d\u1ECBch)</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <input class="inp" id="cfgUsername" placeholder="Nh\u1EADp t\xEAn c\u1EE7a b\u1EA1n..." value="${esc(ctx.S.username || "")}" style="flex:1;">
        <span class="buy" id="cfgSaveUsername">L\u01B0u t\xEAn</span>
      </div>
      <div class="shead" style="margin-top:0">Ch\u1EE7 \u0111\u1EC1 giao di\u1EC7n</div>
      <div class="picker" style="margin-bottom:4px">
        <span class="pick${ctx.S.theme !== "sky" ? " active" : ""}" data-settheme="sakura">\u{1F338} H\u1ED3ng anh \u0111\xE0o</span>
        <span class="pick${ctx.S.theme === "sky" ? " active" : ""}" data-settheme="sky">\u2601\uFE0F Tr\u1EDDi quang</span>
      </div>
      <div class="shead">\u0110\u1ED3ng b\u1ED9 h\xF3a (Sync Save) qua m\xE3 (P2P)</div>
      <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
        <span class="buy" onclick="FarmAll.openSyncHostModal()">C\u1EA5p M\xE3 (G\u1EEDi Save)</span>
        <span class="buy plain" onclick="FarmAll.openSyncJoinModal()">Nh\u1EADp M\xE3 (Nh\u1EADn Save)</span>
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
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#7a5c38;font-weight:bold;cursor:pointer;margin-top:10px">
          Gi\u1EDBi h\u1EA1n tin nh\u1EAFn Chat g\u1EEDi l\xEAn Context:
          <input class="inp" id="secChatDepth" type="number" min="0" max="200" value="${SEC.chatDepth !== void 0 ? SEC.chatDepth : 15}" style="width:80px;padding:3px 6px"> (0 = T\u1EAFt)
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
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#7a5c38;font-weight:bold;cursor:pointer;margin-top:6px">
        T\u1EA7n su\u1EA5t ti\u1EC3u ph\u1EA9m ng\u1EABu nhi\xEAn (gi\xE2y):
        <input class="inp" id="cfgSkitFreq" type="number" min="5" max="7200" value="${ctx.S.skitFreq !== void 0 ? ctx.S.skitFreq : 300}" style="width:60px;padding:3px 6px"> (M\u1EB7c \u0111\u1ECBnh 300s = 5 ph\xFAt)
      </label>
      <div class="shead">C\xF4ng c\u1EE5 d\xE0nh cho Gi\xE1m \u0111\u1ED1c \u0110\u1ED3 ho\u1EA1 / Dev</div>
      <div style="display:flex;gap:8px;margin-top:6px;align-items:center;flex-wrap:wrap;">
        <span class="buy plain" id="openSandboxBtn">\u{1F3A8} M\u1EDF X\u01B0\u1EDFng Ch\u1EBF T\xE1c AI</span>
        <input class="inp" type="password" id="testCode" placeholder="M\xE3 \u1EA9n..." style="width:100px;padding:3px 6px">
        <span class="buy" id="testBtn">Test Mode</span>
      </div>
      <div class="shead">Th\xF4ng tin & T\xE1c gi\u1EA3</div>
      <div style="display:flex;gap:8px;margin-top:6px">
        <span class="buy plain" id="openCreditBtn">\u{1F4DC} Xem Credit (L\u1EDDi c\u1EA3m \u01A1n)</span>
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
        wbLimit: parseInt($id("secWbLimit").value, 10) || 0,
        chatDepth: parseInt($id("secChatDepth").value, 10) || 0
      });
      saveSec();
      toast("\u0110\xE3 l\u01B0u c\u1EA5u h\xECnh API ph\u1EE5");
    });
    $id("secTest").addEventListener("click", () => testSecApi());
    $id("secModels").addEventListener("click", () => fetchModelList());
    $id("cfgSaveUsername")?.addEventListener("click", () => {
      const uname = $id("cfgUsername").value.trim();
      if (!uname) return toast("T\xEAn kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng!");
      ctx.S.username = uname;
      save();
      toast("\u0110\xE3 l\u01B0u t\xEAn ng\u01B0\u1EDDi ch\u01A1i");
    });
    if ($id("openSandboxBtn")) $id("openSandboxBtn").addEventListener("click", openSandbox);
    const testBtn = $id("testBtn");
    if (testBtn) testBtn.addEventListener("click", () => {
      const code = $id("testCode")?.value;
      if (code === "0209") {
        if (!testMode) {
          setTestMode(true);
          ctx.S = JSON.parse(JSON.stringify(ctx.S));
          Object.keys(PETS).forEach((id) => {
            if (!ctx.S.hero) ctx.S.hero = {};
            if (!ctx.S.hero.roster) ctx.S.hero.roster = {};
            const h = ctx.S.hero.roster[id] || { level: 30, exp: 0, enhHp: 0, enhAtk: 0, enhSpd: 0 };
            h.level = 30;
            h.a1_unlocked = true;
            h.a2_unlocked = true;
            h.p1_unlocked = true;
            h.p2_unlocked = true;
            ctx.S.hero.roster[id] = h;
          });
          if (ctx.S.hero) ctx.S.hero.gold = 999999;
          toast("\u2705 TEST MODE B\u1EACT! (S\u1EBD kh\xF4ng l\u01B0u v\xE0o save ch\xEDnh). \u0110\u1EC3 tho\xE1t, vui l\xF2ng F5 l\u1EA1i trang.");
          closeModal();
          renderAll();
        } else {
          toast("\u26A0\uFE0F TEST MODE \u0110ANG B\u1EACT R\u1ED2I! (F5 \u0111\u1EC3 t\u1EAFt)");
        }
      } else {
        toast("\u274C Sai m\xE3!");
      }
    });
    if ($id("openCreditBtn")) {
      $id("openCreditBtn").addEventListener("click", () => {
        openModal("Credit & L\u1EDDi c\u1EA3m \u01A1n", `
          <div style="line-height:1.6; color:#4a3219; font-size:13px; text-align:left; padding:8px;">
            <b style="color:#a83a52;">T\xEAn s\u1EA3n ph\u1EA9m g\u1ED1c (\u539F\u771F\u540D):</b><br>
            \u3010\u8C01\u8981\u5728\u9152\u9986\u5F53\u519C\u6C11\u554A\uFF01v1.1\u3011<br><br>
            
            <b style="color:#a83a52;">T\xEAn ti\u1EBFng Vi\u1EC7t (\u8D8A\u5357\u8BED\u8BD1\u540D):</b><br>
            \u3010Ai th\xE8m l\xE0m n\xF4ng d\xE2n trong t\u1EEDu qu\xE1n ch\u1EE9! v1.1\u3011 Script Tr\u1EE3 th\u1EE7 T\u1EEDu qu\xE1n<br><br>

            <b style="color:#a83a52;">T\xE1c gi\u1EA3 g\u1ED1c (\u539F\u4F5C\u8005):</b><br>
            \u6EE1\u8EAB\u732B\u6BDB\u055E\u2022\u2022\u055E - Tranh th\u1EE7 l\xE9n meo<br><br>

            <b style="color:#a83a52;">Mod v\xE0 update game hi\u1EC7n t\u1EA1i credit t\u1EEB:</b><br>
            Dev: Kaiz
          </div>
          <div style="margin-top:16px;text-align:center;">
            <span class="buy plain" id="closeCreditBtn">Quay l\u1EA1i C\xE0i \u0111\u1EB7t</span>
          </div>
        `);
        $id("closeCreditBtn")?.addEventListener("click", () => openPanel("cfg"));
      });
    }
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
      const mas = $id("mascots");
      if (mas) mas.dataset.drag = ctx.S.dragPet ? "1" : "0";
      toast(ctx.S.dragPet ? "\u0110\xE3 b\u1EADt t\xEDnh n\u0103ng k\xE9o th\u1EA3 th\xFA c\u01B0ng" : "\u0110\xE3 t\u1EAFt t\xEDnh n\u0103ng k\xE9o th\u1EA3 th\xFA c\u01B0ng");
    });
    const cfgSkitFreq = $id("cfgSkitFreq");
    if (cfgSkitFreq) cfgSkitFreq.addEventListener("change", () => {
      let v = parseInt(cfgSkitFreq.value);
      if (isNaN(v) || v < 5) v = 5;
      ctx.S.skitFreq = v;
      save();
      toast("\u0110\xE3 c\u1EADp nh\u1EADt t\u1EA7n su\u1EA5t: " + v + " gi\xE2y");
      const nowMs = Date.now();
      Promise.resolve().then(() => (init_pets(), pets_exports)).then((m) => {
        if (m.nextSceneAt > nowMs + v * 1e3) m.updateNextScene(nowMs + v * 1e3);
      });
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
      if (ctx.extension_settings[extensionName]) ctx.extension_settings[extensionName][NS] = null;
      loadState();
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
var shopTab, bagTab, bagSellMode, bagSel, gachaSortMode;
var init_shop = __esm({
  "src/shop.js"() {
    init_store();
    init_all();
    init_data();
    init_graphics();
    init_render();
    init_logic();
    init_witch();
    init_state();
    init_pets();
    init_events();
    init_ui();
    init_utils();
    init_gacha();
    init_bet();
    shopTab = "seed";
    bagTab = "crop";
    bagSellMode = false;
    bagSel = {};
    gachaSortMode = "default";
  }
});

// src/windows.js
function placeWin() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(760, vw * 0.96);
  let x = ctx.S.win ? ctx.S.win.fx * vw : (vw - w) / 2;
  let y = ctx.S.win ? ctx.S.win.fy * vh : vh * 0.04;
  ctx.win.style.left = Math.min(Math.max(x, 0), Math.max(vw - w, 0)) + "px";
  ctx.win.style.top = Math.min(Math.max(y, 0), vh - 60) + "px";
}
function placeDungeonWin() {
  const dungeonWin = $id("dungeon-win");
  if (!dungeonWin) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(760, vw * 0.96);
  let x = ctx.S.dungeonWin ? ctx.S.dungeonWin.fx * vw : (vw - w) / 2;
  let y = ctx.S.dungeonWin ? ctx.S.dungeonWin.fy * vh : vh * 0.04;
  dungeonWin.style.left = Math.min(Math.max(x, 0), Math.max(vw - w, 0)) + "px";
  dungeonWin.style.top = Math.min(Math.max(y, 0), vh - 60) + "px";
}
function toggleWin() {
  if (ctx.win.classList.contains("open")) {
    closeWin();
    return;
  }
  if (ctx.S.blockedUntil && ctx.S.blockedUntil > Date.now()) {
    toast("Tr\u1EDDi ph\u1EA1t ch\u01B0a tan, Thi\xEAn Ki\u1EBFp v\u1EABn c\xF2n... N\xF4ng Tr\u1EA1i \u0111\xF3ng c\u1EEDa!");
    return;
  }
  if (ctx.S.needsTribulationCheck) {
    startTribulationEvent(() => {
      if (!ctx.S.blockedUntil || ctx.S.blockedUntil <= Date.now()) {
        toggleWin();
      }
    });
    return;
  }
  if (ctx.S.needsPoorTribulationNotice) {
    setTimeout(() => {
      toast("Thi\xEAn \u0110\u1EA1o ng\xF3 qua n\xF4ng tr\u1EA1i c\u1EE7a b\u1EA1n r\u1ED3i b\u1ECF \u0111i v\xEC th\u1EA5y qu\xE1 ngh\xE8o...");
    }, 500);
    delete ctx.S.needsPoorTribulationNotice;
    save(true);
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
function initWindows() {
  $id("close").addEventListener("click", closeWin);
  dragBar = $id("drag");
  dragBar.addEventListener("pointerdown", (e) => {
    if (e.target.id === "close" || e.target.closest("#viewToggle")) return;
    if (window.innerWidth <= 640) return;
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
  const dungeonDragBar = $id("dungeon-drag");
  let dungeonWg = null;
  if (dungeonDragBar) {
    dungeonDragBar.addEventListener("pointerdown", (e) => {
      if (e.target.id === "dungeon-close") return;
      if (window.innerWidth <= 640) return;
      dungeonDragBar.setPointerCapture(e.pointerId);
      const dungeonWin = $id("dungeon-win");
      dungeonWg = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: dungeonWin.offsetLeft, oy: dungeonWin.offsetTop };
    });
    dungeonDragBar.addEventListener("pointermove", (e) => {
      if (!dungeonWg || e.pointerId !== dungeonWg.id) return;
      const dungeonWin = $id("dungeon-win");
      dungeonWin.style.left = dungeonWg.ox + e.clientX - dungeonWg.sx + "px";
      dungeonWin.style.top = dungeonWg.oy + e.clientY - dungeonWg.sy + "px";
    });
    dungeonDragBar.addEventListener("pointerup", (e) => {
      if (!dungeonWg || e.pointerId !== dungeonWg.id) return;
      try {
        dungeonDragBar.releasePointerCapture(e.pointerId);
      } catch (er) {
      }
      dungeonWg = null;
      const dungeonWin = $id("dungeon-win");
      ctx.S.dungeonWin = { fx: dungeonWin.offsetLeft / window.innerWidth, fy: dungeonWin.offsetTop / window.innerHeight };
      save();
    });
  }
}
var tick, wg, dragBar;
var init_windows = __esm({
  "src/windows.js"() {
    init_store();
    init_all();
    init_orb();
    init_utils();
    init_render();
    init_state();
    tick = null;
    wg = null;
    dragBar = null;
  }
});

// src/orb.js
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
var disposers, gesture, resizeTimer, onResize, SPRITE_PX, DECO_PX;
var init_orb = __esm({
  "src/orb.js"() {
    init_store();
    init_all();
    init_data();
    init_graphics();
    init_state();
    init_windows();
    init_render();
    disposers = [];
    gesture = null;
    resizeTimer = null;
    onResize = () => {
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
    SPRITE_PX = 64;
    DECO_PX = 56;
  }
});

// src/render.js
function setMode(val) {
  mode = val;
}
function renderToolbar() {
  const tb = $id("toolbar");
  if (ctx.S && ctx.S.view === "explore") {
    tb.style.display = "none";
    const tip2 = $id("modetip");
    if (tip2) tip2.style.display = "none";
    return;
  }
  tb.style.display = "flex";
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
function setPendingPick(val) {
  pendingPick = val;
}
function pickFrom(title, obj, nameFn, cb) {
  const ids = Object.keys(obj).filter((k) => obj[k] > 0);
  if (!ids.length) return toast("Trong balo kh\xF4ng c\xF3, ra c\u1EEDa h\xE0ng mua \u0111\xE3");
  openModal(title, `<div class="picker">${ids.map((id) => `<span class="pick" data-pick="${id}">${nameFn(id)} \xD7${obj[id]}</span>`).join("")}</div>`);
  pendingPick = cb;
}
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
  const expWrap = $id("explore-blocks");
  if (ctx.S && ctx.S.view === "explore") {
    if (wrap) wrap.style.display = "none";
    if (expWrap && !isDungeonOpen) {
      expWrap.style.display = "flex";
      if (!expWrap.hasChildNodes()) {
        expWrap.innerHTML = `
          <div class="explore-slot" id="eslot-dungeon">
            ${spriteSVG("dungeonGate", 48)}
            <div class="feature-name">H\u1EA7m ng\u1EE5c</div>
          </div>
          <div class="explore-slot" id="eslot-bet">
            ${spriteSVG("diceIcon", 48)}
            <div class="feature-name">\u0110\u1ECF \u0110en</div>
          </div>
          <div class="explore-slot" id="eslot-hero">
            ${spriteSVG("threeSlimesWalking", 64)}
            <div class="feature-name">Th\xE1m Hi\u1EC3m</div>
          </div>
          <div class="explore-slot" id="eslot-achiv" style="background: rgba(60, 40, 20, 0.8); border-color: #f2c231; box-shadow: 0 4px 0 #8a6a1c, inset 0 0 0 3px rgba(242,194,49,0.4);">
            ${spriteSVG("achivStar", 48)}
            <div class="feature-name" style="color: #fcd34d; text-shadow: 0 1px 2px #000;">Th\xE0nh T\u1EF1u</div>
          </div>
        `;
        const dBtn = $id("eslot-dungeon");
        if (dBtn) dBtn.addEventListener("click", () => openPanel("dungeon"));
        const bBtn = $id("eslot-bet");
        if (bBtn) bBtn.addEventListener("click", () => openPanel("bet"));
        const hBtn = $id("eslot-hero");
        if (hBtn) hBtn.addEventListener("click", () => openHeroPanel());
        const aBtn = $id("eslot-achiv");
        if (aBtn) aBtn.addEventListener("click", () => openAchivModal());
      }
    }
    return;
  }
  if (wrap) wrap.style.display = "";
  if (expWrap) expWrap.style.display = "none";
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
    settle();
    renderStatus();
    renderPlots();
  }
}
function renderAll() {
  applyPageSkin();
  applyViewState();
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
    if (k === "seed") return pickFrom("Ch\u1ECDn h\u1EA1t gi\u1ED1ng \u0111\u1EC3 gieo", ctx.S.seeds, (id) => CROPS[id]?.name || "H\u1EA1t gi\u1ED1ng l\u1EA1", (id) => {
      mode = { t: "seed", id };
      renderToolbar();
    });
    if (k === "fert") return pickFrom("Ch\u1ECDn ph\xE2n b\xF3n", ctx.S.ferts, (id) => FERTS[id]?.name || "Ph\xE2n b\xF3n l\u1EA1", (id) => {
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
  sh.addEventListener("click", (e) => {
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
var mode, buyConfirm, TOOLS, toolbarOpen, pendingPick, cacheWicon, cacheCoins, cacheDayTxt, cacheBlockTxt;
var init_render = __esm({
  "src/render.js"() {
    init_state();
    init_store();
    init_all();
    init_data();
    init_graphics();
    init_witch();
    init_shop();
    init_utils();
    init_state();
    init_orb();
    init_events();
    init_ui();
    init_logic();
    init_utils();
    init_logic();
    init_events();
    init_pets();
    mode = null;
    buyConfirm = { b: -1, until: 0 };
    TOOLS = [
      { key: "seed", sp: "toolSeed", tip: "Gieo h\u1EA1t" },
      { key: "water", sp: "toolWater", tip: "T\u01B0\u1EDBi n\u01B0\u1EDBc" },
      { key: "fert", sp: "toolFert", tip: "B\xF3n ph\xE2n" },
      { key: "harvest", sp: "toolHarvest", tip: "Thu ho\u1EA1ch" },
      { key: "shovel", sp: "toolShovel", tip: "X\u1EDBi b\u1ECF" }
    ];
    toolbarOpen = false;
    pendingPick = null;
    cacheWicon = "";
    cacheCoins = -1;
    cacheDayTxt = "";
    cacheBlockTxt = "";
  }
});

// src/witch.js
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
    takeoutNote = (takeoutNote || []).filter((t) => now() < t.until).concat({ txt: n + " " + bagName(key) + (d ? " (hi\u1EC7u \u1EE9ng \u0111\xE3 \u0111\u1ECBnh: " + d + ")" : ""), until: now() + 10 * MIN });
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
function openSellSeedDlg(id) {
  const have = ctx.S.seeds[id] || 0;
  if (have <= 0) return;
  const def = CROPS[id];
  if (!def) return;
  const price = Math.floor((def.seed || 100) * 0.5);
  const name = "H\u1EA1t " + def.name;
  openModal("B\xE1n \xB7 " + name, `
    <div class="note" style="margin-bottom:8px">Gi\xE1 thu mua ${price} G \xB7 \u0111ang c\xF3 ${have} h\u1EA1t</div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input class="inp" id="sellSeedN" type="number" min="1" max="${have}" value="1" style="width:90px">
      <span style="font-size:12px;color:#7a5c38">/ ${have}</span>
      <span class="buy" id="sellSeedGo">X\xE1c nh\u1EADn b\xE1n</span>
    </div>`);
  $id("sellSeedGo").addEventListener("click", () => {
    sellSeed(id, clampN($id("sellSeedN").value, 1, have, 1) | 0);
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
function openBuyDlg(kind, id, returnTo = "shop") {
  let def, price, name;
  if (kind === "ticket") {
    price = id === "super" ? 25e4 : id === "norm" ? 1e3 : 5e3;
    name = id === "super" ? "V\xE9 Quay Si\xEAu C\u01B0\u1EDDng" : id === "norm" ? "V\xE9 Quay Th\u01B0\u1EDDng" : "V\xE9 Quay \u0110\u1EB7c Bi\u1EC7t";
  } else {
    def = kind === "seed" ? CROPS[id] : FERTS[id];
    price = kind === "seed" ? def.seed : def.price;
    name = kind === "seed" ? "H\u1EA1t " + def.name : def.name;
  }
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
    else if (kind === "fert") ctx.S.ferts[id] = (ctx.S.ferts[id] || 0) + n;
    else if (kind === "ticket") {
      if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
      ctx.S.tickets[id] = (ctx.S.tickets[id] || 0) + n;
    }
    save();
    renderStatus();
    toast("\u0110\xE3 mua " + name + " \xD7" + n);
    openPanel(returnTo);
  });
}
function toast(msg) {
  const t = $id("toast");
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  window.setTimeout(() => t.classList.add("show"), 10);
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    t.classList.remove("show");
    window.setTimeout(() => {
      t.style.display = "none";
    }, 300);
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
var WITCH_CRY, takeoutNote, toastTimer;
var init_witch = __esm({
  "src/witch.js"() {
    init_state();
    init_store();
    init_all();
    init_data();
    init_graphics();
    init_state();
    init_events();
    init_render();
    init_shop();
    init_utils();
    init_logic();
    init_ui();
    init_utils();
    WITCH_CRY = ["C\xFAc cu, c\xF3 ai kh\xF4ng?", "\u25C6\u2726\u2234\u2026?", "(d\u01B0\u1EDBi v\xE0nh m\u0169 v\u1ECDng ra ti\u1EBFng l\u1EADt s\xE1ch)", "\u263D\u2042\u25C7!", "\u2736\u25C7\u2234\u2726\u2026", "Tinh t\u01B0\u1EE3ng h\xF4m nay \u0111\u1EB9p \u0111\u1EA5y."];
    takeoutNote = null;
    toastTimer = null;
  }
});

// src/utils.js
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
    const elapsed = now() - ctx.S.petFind[id];
    if (id === "penguin") {
      const PENGUIN_CD = 60 * 60 * 1e3;
      if (elapsed >= PENGUIN_CD) {
        const hours = Math.floor(elapsed / PENGUIN_CD);
        ctx.S.petFind[id] += hours * PENGUIN_CD;
        if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
        let normGained = 0;
        let specGained = 0;
        for (let i = 0; i < hours; i++) {
          if (Math.random() < 0.3) specGained++;
          else normGained++;
        }
        ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + normGained;
        ctx.S.tickets.spec = (ctx.S.tickets.spec || 0) + specGained;
        const msg = [];
        if (normGained > 0) msg.push(`${normGained} V\xE9 Th\u01B0\u1EDDng`);
        if (specGained > 0) msg.push(`${specGained} V\xE9 \u0110\u1EB7c Bi\u1EC7t`);
        toast(`Ch\xFA chim c\xE1nh c\u1EE5t v\u1EEBa \u0111i xa v\u1EC1 mang t\u1EB7ng b\u1EA1n: ${msg.join(" v\xE0 ")}!`);
        wChanged = true;
      }
      return;
    }
    if (elapsed < TREASURE_CD) return;
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
  let rChanged = false;
  eachPage((plots) => plots.forEach((p) => {
    const c = p.crop;
    if (!c || now() >= c.matureAt || c.rainDay === d) return;
    c.matureAt = now() + (c.matureAt - now()) * 0.9;
    c.rainDay = d;
    rChanged = true;
  }));
  if (rChanged) save();
}
var gameDay, weatherOf, isRain, pageUnlocked, fmtLeft;
var init_utils = __esm({
  "src/utils.js"() {
    init_state();
    init_store();
    init_all();
    init_data();
    init_graphics();
    init_events();
    init_state();
    init_witch();
    init_ui();
    init_logic();
    init_render();
    gameDay = () => Math.floor((now() - ctx.S.day0) / DAY_MS) + 1;
    weatherOf = (d) => WEATHERS[Math.floor(mulberry32(d * 7919)() * WEATHERS.length)];
    isRain = () => weatherOf(gameDay()) === "M\u01B0a nh\u1ECF";
    pageUnlocked = (p) => p === 1 || p === 2 && ctx.S.passes.water || p === 3 && ctx.S.passes.mine;
    fmtLeft = (ms) => {
      if (ms <= 0) return "Thu ho\u1EA1ch \u0111\u01B0\u1EE3c";
      const m = Math.ceil(ms / MIN);
      return m >= 60 ? Math.floor(m / 60) + "g" + m % 60 + "p" : m + "p";
    };
  }
});

// src/events.js
function saveSec() {
  try {
    window.localStorage.setItem(SEC_LS_KEY, JSON.stringify({ url: SEC.url, key: btoa(SEC.key), model: SEC.model, autoReset: SEC.autoReset, resetHours: SEC.resetHours, wbLimit: SEC.wbLimit, chatDepth: SEC.chatDepth }));
  } catch (e) {
  }
}
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
function charName() {
  try {
    const ctx2 = window.SillyTavern && window.SillyTavern.getContext ? window.SillyTavern.getContext() : {};
    return ctx2.name2 || String(ctx2.characterId || "");
  } catch (e) {
    return "";
  }
}
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
        if (charData) {
          if (charData.extensions?.world) activeNames.add(charData.extensions.world);
          if (charData.world) activeNames.add(charData.world);
        }
        const wiKey = ST_WorldInfo?.METADATA_KEY || window.WI_METADATA_KEY || "world_info";
        const chatWorldName = ctx2.chatMetadata?.[wiKey];
        if (chatWorldName && typeof chatWorldName === "string") activeNames.add(chatWorldName);
      } catch (e) {
      }
      for (const name of activeNames) {
        try {
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
            if (data && data.entries) {
              const vals = Array.isArray(data.entries) ? data.entries : Object.values(data.entries);
              entries = entries.concat(vals);
            }
          }
        } catch (e) {
        }
      }
    } catch (e) {
    }
    try {
      const charId = ctx2.characterId !== void 0 ? ctx2.characterId : window.this_character;
      if (typeof charId !== "undefined") {
        const charData = ctx2.characters?.[charId]?.data || window.characters?.[charId]?.data;
        if (charData && charData.character_book && charData.character_book.entries) {
          const charEntries = charData.character_book.entries;
          const vals = Array.isArray(charEntries) ? charEntries : Object.values(charEntries);
          entries = entries.concat(vals);
        }
      }
    } catch (e) {
    }
    if (!entries || entries.length === 0) return "";
    let chatContext = "";
    try {
      const chatHistory = ctx2.chat || window.chat || [];
      const depth = SEC.chatDepth !== void 0 ? SEC.chatDepth : 15;
      const recentMsgs = chatHistory.slice(-depth).map((m) => (m.name ? m.name + ": " : "") + (m.mes || "")).join("\n").trim();
      if (recentMsgs) {
        chatContext = "\n==== RECENT CHAT HISTORY ====\n" + recentMsgs + "\n=============================\n";
      }
    } catch (e) {
    }
    const disabledContent = /* @__PURE__ */ new Set();
    for (const en of entries) {
      if (en.disable === true) {
        const c = (en.content || en.text || "").trim();
        if (c) disabledContent.add(c);
      }
    }
    const seen = /* @__PURE__ */ new Set();
    for (const en of entries) {
      const content = (en.content || en.text || "").trim();
      if (!content || seen.has(content)) continue;
      seen.add(content);
      if (disabledContent.has(content)) continue;
      const isConstant = en.constant === true || en.strategy && en.strategy.type === "constant" || en.position === "before_char";
      const entryName = en.comment || en.name || String(en.uid ?? en.id ?? "") || "Lorebook Entry";
      const formatted = `[${entryName}]
${content}`;
      if (isConstant) blue += formatted + "\n\n";
      else green += formatted + "\n\n";
    }
    let txt = blue + green;
    if (chatContext) txt += chatContext;
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
    const prompt = buildEventPrompt(wb);
    console.log("====== [FARM DEBUG] PROMPT SENT TO LLM ======");
    console.log(prompt);
    console.log("===============================================");
    const reqBody = {
      model: SEC.model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "H\xE3y t\u1EA1o s\u1EF1 ki\u1EC7n v\u01B0\u1EDDn rau cho h\xF4m nay." }
      ],
      max_tokens: 2e3 + Object.keys(CROPS).length * 100
    };
    const ctrl = new AbortController();
    const timeoutId = window.setTimeout(() => ctrl.abort(), 9e4);
    const resPromise = fetch(SEC.url.replace(/\/+$/, "") + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...SEC.key ? { Authorization: "Bearer " + SEC.key } : {} },
      body: JSON.stringify(reqBody),
      signal: ctrl.signal
    }).then((r) => r.json()).finally(() => window.clearTimeout(timeoutId));
    const data = await resPromise;
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
      const codeMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/i);
      if (codeMatch) {
        jsonStr = codeMatch[1];
      } else {
        const arrMatch = content.match(/\[\s*"(?:[^"\\]|\\.)*"(?:\s*,\s*"(?:[^"\\]|\\.)*")*\s*\]/);
        jsonStr = arrMatch ? arrMatch[0] : (content.match(/\[[\s\S]*?\]/) || [""])[0];
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
  const cropsArr = [];
  const specialArr = [];
  Object.keys(ctx.S.bag).forEach((k) => {
    const d = mutDescOf(k);
    const line = "  + " + bagName(k) + " \xD7" + ctx.S.bag[k] + (d ? " (" + d + ")" : "");
    if (k.startsWith("unique@")) specialArr.push(line);
    else cropsArr.push(line);
  });
  const cropsTxt = cropsArr.join("\n");
  const specialTxt = specialArr.join("\n");
  const ev = todayEvent();
  const takeoutNoteStr = function() {
    setTakeoutNote((takeoutNote || []).filter((t) => now() < t.until));
    if (!takeoutNote.length) return "";
    return `

\u3010H\xC0NH \u0110\u1ED8NG V\u1EEAA X\u1EA2Y RA\u3011
- V\u1EADt ph\u1EA9m \u0111\u01B0\u1EE3c l\u1EA5y ra d\xF9ng: ${takeoutNote.map((t) => t.txt).join(", ")}
(Ng\u01B0\u1EDDi ch\u01A1i v\u1EEBa l\u1EA5y c\xE1c v\u1EADt ph\u1EA9m/n\xF4ng s\u1EA3n n\xE0y ra kh\u1ECFi kho \u0111\u1ED3 \u0111\u1EC3 t\u01B0\u01A1ng t\xE1c trong c\u1ED1t truy\u1EC7n. H\xE3y ti\u1EBFp nh\u1EADn t\u1EF1 nhi\xEAn; ph\u1EA7n trong ngo\u1EB7c l\xE0 hi\u1EC7u \u1EE9ng c\u1EE7a v\u1EADt ph\u1EA9m, h\xE3y l\u1EA5y \u0111\xF3 l\xE0m chu\u1EA9n v\xE0 mi\xEAu t\u1EA3 v\xE0o c\u1ED1t truy\u1EC7n)`;
  }();
  const promptText = `\u3010H\u1EC7 th\u1ED1ng N\xF4ng tr\u1EA1i & Kho \u0111\u1ED3\u3011
Ng\u01B0\u1EDDi ch\u01A1i c\xF3 m\u1ED9t h\u1EC7 th\u1ED1ng n\xF4ng tr\u1EA1i v\xE0 t\xFAi \u0111\u1ED3 t\u1ED3n t\u1EA1i song song v\u1EDBi c\u1ED1t truy\u1EC7n.
T\xECnh tr\u1EA1ng hi\u1EC7n t\u1EA1i:
- \u0110ang tr\u1ED3ng: ${field || "\u0110\u1EA5t tr\u1ED1ng"}${ripe ? ` (c\xF3 ${ripe} c\xE2y \u0111\xE3 ch\xEDn ch\u1EDD thu)` : ""}
${cropsTxt ? "- N\xF4ng s\u1EA3n t\xEDch tr\u1EEF:\n" + cropsTxt : "- N\xF4ng s\u1EA3n t\xEDch tr\u1EEF: Tr\u1ED1ng"}
${specialTxt ? "- V\u1EADt ph\u1EA9m \u0111\u1EB7c bi\u1EC7t t\xEDch tr\u1EEF:\n" + specialTxt : ""}
${ev && ev.flavor ? `- S\u1EF1 ki\u1EC7n h\xF4m nay: ${ev.name} \u2014\u2014 ${ev.flavor}` : ""}${takeoutNoteStr}

* H\u01B0\u1EDBng d\u1EABn cho AI: B\u1EA1n KH\xD4NG TH\u1EC2 nh\xECn th\u1EA5u t\xFAi \u0111\u1ED3 c\u1EE7a ng\u01B0\u1EDDi ch\u01A1i v\xE0 KH\xD4NG BI\u1EBET h\u1ECD \u0111ang c\xF3 nh\u1EEFng g\xEC. Ch\u1EC9 khi ng\u01B0\u1EDDi ch\u01A1i "l\u1EA5y ra d\xF9ng" (\u1EDF m\u1EE5c H\xC0NH \u0110\u1ED8NG V\u1EEAA X\u1EA2Y RA), nh\xE2n v\u1EADt m\u1EDBi nh\xECn th\u1EA5y v\xE0 ph\u1EA3n \u1EE9ng l\u1EA1i t\u1EF1 nhi\xEAn. \u0110\u1EEANG t\u1EF1 \xFD thao t\xE1c v\u01B0\u1EDDn rau hay thay \u0111\u1ED5i s\u1ED1 l\u01B0\u1EE3ng \u0111\u1ED3 v\u1EADt, v\xE0 \u0110\u1EEANG bi\u1EBFn n\xF3 th\xE0nh m\u1EA1ch ch\xEDnh c\u1EE7a truy\u1EC7n tr\u1EEB phi ng\u01B0\u1EDDi ch\u01A1i ch\u1EE7 \u0111\u1ED9ng nh\u1EAFc t\u1EDBi.`;
  setInjection(promptText);
}
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
function startTribulationEvent(onComplete) {
  const overlay = document.createElement("div");
  overlay.className = "trib-overlay";
  overlay.innerHTML = `
        <div class="trib-cloud"></div>
        <div class="trib-lightning" id="trib-lightning"></div>
        <div class="trib-content">
            <div class="trib-title">THI\xCAN KI\u1EBEP GI\xC1NG L\xC2M</div>
            <div class="trib-text">
                Thi\xEAn \u0110\u1EA1o ph\xE1t hi\u1EC7n l\u01B0\u1EE3ng t\xE0i s\u1EA3n c\u1EE7a ng\u01B0\u01A1i qu\xE1 l\u1EDBn, \u0111e d\u1ECDa \u0111\u1EBFn s\u1EF1 c\xE2n b\u1EB1ng c\u1EE7a \u0110a V\u0169 Tr\u1EE5!<br><br>
                S\u1EA5m s\xE9t \u0111ang cu\u1ED9n tr\xE0o... H\xE3y \u0111\u01B0a ra quy\u1EBFt \u0111\u1ECBnh c\u1EE7a ng\u01B0\u01A1i!
            </div>
            <button class="trib-btn trib-btn-sub" id="btn-submit">C\u1ED1ng N\u1EA1p Thi\xEAn \u0110\u1EA1o (Tr\u1EEB s\u1ED1 T\u1EF7, gi\u1EEF s\u1ED1 l\u1EBB)</button>
            <button class="trib-btn trib-btn-def" id="btn-defy">Ch\u1ED1ng L\u1EA1i Thi\xEAn \u0110\u1EA1o (B\u1ECB kh\xF3a game 1 ng\xE0y)</button>
        </div>
    `;
  document.body.appendChild(overlay);
  const btnSubmit = overlay.querySelector("#btn-submit");
  const btnDefy = overlay.querySelector("#btn-defy");
  const lightning = overlay.querySelector("#trib-lightning");
  btnSubmit.onclick = () => {
    const billions = Math.floor(ctx.S.coins / 1e9);
    if (billions > 0) {
      ctx.S.coins -= billions * 1e9;
    }
    delete ctx.S.needsTribulationCheck;
    save(true);
    toast("Ng\u01B0\u01A1i \u0111\xE3 c\u1ED1ng n\u1EA1p t\xE0i s\u1EA3n. Thi\xEAn \u0110\u1EA1o t\u1EA1m th\u1EDDi ngu\xF4i gi\u1EADn!");
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.remove();
      if (onComplete) onComplete();
    }, 500);
  };
  btnDefy.onclick = () => {
    lightning.classList.add("strike");
    setTimeout(() => {
      ctx.S.blockedUntil = Date.now() + 24 * 60 * 60 * 1e3;
      delete ctx.S.needsTribulationCheck;
      save(true);
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
      }, 500);
    }, 300);
  };
}
var esc, clampN, SEC_LS_KEY, SEC, CS, eventFresh, todayEvent, eventPending, renderTimeout, INJECT_ID, heartbeat;
var init_events = __esm({
  "src/events.js"() {
    init_state();
    init_store();
    init_all();
    init_data();
    init_graphics();
    init_utils();
    init_render();
    init_witch();
    init_shop();
    init_state();
    init_logic();
    esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);
    clampN = (x, lo, hi, dflt) => {
      x = Number(x);
      return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : dflt;
    };
    SEC_LS_KEY = "star_tavern_farm_sec";
    SEC = { url: "", key: "", model: "", autoReset: true, resetHours: 4, wbLimit: 2e4, chatDepth: 15 };
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
          wbLimit: typeof o.wbLimit === "number" ? o.wbLimit : 2e4,
          chatDepth: typeof o.chatDepth === "number" ? o.chatDepth : 15
        };
      }
    } catch (e) {
    }
    CS = { link: false, story: false, userPrompt: "" };
    loadCharState();
    eventFresh = () => ctx.S.dayEvent && ctx.S.dayEvent.who === charName() && (!SEC.autoReset || now() - (ctx.S.dayEvent.at || 0) < SEC.resetHours * 60 * 60 * 1e3);
    todayEvent = () => CS.link && eventFresh() ? ctx.S.dayEvent.ev : null;
    eventPending = false;
    INJECT_ID = "star_tavern_farm_summary";
  }
});

// src/state.js
var state_exports = {};
__export(state_exports, {
  addBlock: () => addBlock,
  blockPrice: () => blockPrice,
  curBlocks: () => curBlocks,
  curPlots: () => curPlots,
  eachPage: () => eachPage,
  emptyPlots: () => emptyPlots,
  freshState: () => freshState,
  loadState: () => loadState,
  now: () => now,
  pagePlots: () => pagePlots,
  save: () => save,
  setTestMode: () => setTestMode,
  testMode: () => testMode
});
function freshState() {
  return {
    version: 2,
    playerId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "p-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9),
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
function loadState() {
  if (!ctx.extension_settings[extensionName]) {
    ctx.extension_settings[extensionName] = {};
  }
  const g = ctx.extension_settings[extensionName] || {};
  if (g[NS] && g[NS].version === 1) {
    g[NS].version = 2;
    if (g[NS].coins >= 1e9) {
      g[NS].needsTribulationCheck = true;
    } else {
      g[NS].needsPoorTribulationNotice = true;
    }
  }
  ctx.S = g[NS] && g[NS].version === 2 ? g[NS] : freshState();
  if (!ctx.S.playerId) ctx.S.playerId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "p-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9);
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
  if (!ctx.S.achiv) ctx.S.achiv = { naoya: { radishes: 0, crits: 0, claimed: false } };
  ctx.S.view = "farm";
  const petRenameMap = { "bunny": "jellyfish", "slimeNight": "peach_soda", "batBlob": "mystery_blob" };
  if (ctx.S.pets) ctx.S.pets = ctx.S.pets.map((p) => petRenameMap[p] || p);
  if (ctx.S.petsOut) ctx.S.petsOut = ctx.S.petsOut.map((p) => petRenameMap[p] || p);
  if (petRenameMap[ctx.S.dragPet]) ctx.S.dragPet = petRenameMap[ctx.S.dragPet];
  Object.keys(ctx.S.jobCfg || {}).forEach((k) => {
    if (petRenameMap[k]) {
      ctx.S.jobCfg[petRenameMap[k]] = ctx.S.jobCfg[k];
      delete ctx.S.jobCfg[k];
    }
  });
  Object.keys(ctx.S.bag || {}).forEach((k) => {
    const base = k.split("@")[0];
    if (base === "mysbG" || base === "mysbW" || base === "mysbM") {
      const nk = k.replace(base, "strawberry");
      ctx.S.bag[nk] = (ctx.S.bag[nk] || 0) + ctx.S.bag[k];
      delete ctx.S.bag[k];
    }
  });
  [ctx.S.plots, ctx.S.plots2, ctx.S.plots3].forEach((arr) => (arr || []).forEach((p) => {
    if (p.crop && (p.crop.id === "mysbG" || p.crop.id === "mysbW" || p.crop.id === "mysbM")) p.crop.id = "strawberry";
  }));
  if (ctx.S.ferts) {
    if (ctx.S.ferts["f1"]) {
      ctx.S.ferts["compost"] = (ctx.S.ferts["compost"] || 0) + ctx.S.ferts["f1"];
      delete ctx.S.ferts["f1"];
    }
    if (ctx.S.ferts["f2"]) {
      ctx.S.ferts["shiny"] = (ctx.S.ferts["shiny"] || 0) + ctx.S.ferts["f2"];
      delete ctx.S.ferts["f2"];
    }
  }
  if (!ctx.S.witch) ctx.S.witch = { nextAt: now(), leaveAt: 0, missed: 0, order: null };
  if (!ctx.S.shards) ctx.S.shards = { prism: 0, star: 0, legend: 0 };
  else if (ctx.S.shards.legend === void 0) ctx.S.shards.legend = 0;
  if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
  if (!ctx.S.gachaPity) ctx.S.gachaPity = { norm: 0, spec: 0 };
  if (!ctx.S.uniques) ctx.S.uniques = {};
  if (!ctx.S.dungeonBest) ctx.S.dungeonBest = { wave: 0, gold: 0 };
  Object.keys(ctx.S.uniques || {}).forEach((k) => {
    const item = ctx.S.uniques[k];
    if (item && item.sp && item.spriteMap) {
      registerDynamicSprite(item.sp, item.spriteMap);
    }
  });
  if (!ctx.S.plots2) ctx.S.plots2 = emptyPlots();
  if (!ctx.S.plots3) ctx.S.plots3 = emptyPlots();
  if (ctx.S.unlockedBlocks2 == null) ctx.S.unlockedBlocks2 = 1;
  if (ctx.S.unlockedBlocks3 == null) ctx.S.unlockedBlocks3 = 1;
  [ctx.S.plots, ctx.S.plots2, ctx.S.plots3].forEach((arr) => arr.forEach((p) => {
    const c = p.crop;
    if (!c) return;
    if (!c.fertUsed) c.fertUsed = {};
    if (CROPS[c.id]?.regrow && c.left == null) c.left = REGROW_MAX;
  }));
}
function setTestMode(v) {
  testMode = v;
}
function save(immediate) {
  if (testMode) return;
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
var now, emptyPlots, blockPrice, pagePlots, curPlots, curBlocks, addBlock, eachPage, testMode;
var init_state = __esm({
  "src/state.js"() {
    init_store();
    init_all();
    init_data();
    init_events();
    now = () => Date.now();
    emptyPlots = () => {
      const a = [];
      for (let i = 0; i < 24; i++) a.push({ crop: null });
      return a;
    };
    ctx.S = null;
    blockPrice = (bi) => BLOCK_PRICE_PG[ctx.S.page][bi];
    pagePlots = (pg) => pg === 2 ? ctx.S.plots2 : pg === 3 ? ctx.S.plots3 : ctx.S.plots;
    curPlots = () => pagePlots(ctx.S.page);
    curBlocks = () => ctx.S.page === 2 ? ctx.S.unlockedBlocks2 : ctx.S.page === 3 ? ctx.S.unlockedBlocks3 : ctx.S.unlockedBlocks;
    addBlock = () => {
      if (ctx.S.page === 2) ctx.S.unlockedBlocks2++;
      else if (ctx.S.page === 3) ctx.S.unlockedBlocks3++;
      else ctx.S.unlockedBlocks++;
    };
    eachPage = (fn) => [1, 2, 3].forEach((pg) => fn(pagePlots(pg), pg));
    testMode = false;
    ctx.saveTimer = null;
  }
});

// src/hero.js
function initHeroState() {
  if (!ctx.S.hero) {
    ctx.S.hero = {};
  }
  if (!ctx.S.hero.party) ctx.S.hero.party = [];
  if (!ctx.S.hero.roster) ctx.S.hero.roster = {};
  if (typeof ctx.S.hero.gold !== "number") ctx.S.hero.gold = 0;
  if (typeof ctx.S.hero.maxStage !== "number") ctx.S.hero.maxStage = 1;
  if (!ctx.S.hero.style) ctx.S.hero.style = "balanced";
  if (ctx.S.hero.level !== void 0) {
    delete ctx.S.hero.level;
    delete ctx.S.hero.exp;
  }
  if (ctx.S.hero.roster) {
    Object.keys(ctx.S.hero.roster).forEach((pId) => {
      let petData = ctx.S.hero.roster[pId];
      if (petData && petData.exp !== void 0 && !isNaN(petData.exp)) {
        while (petData.level < 30) {
          const nextExp = Math.floor(100 * Math.pow(1.5, petData.level - 1));
          if (petData.exp >= nextExp) {
            petData.exp -= nextExp;
            petData.level++;
          } else {
            break;
          }
        }
        if (petData.level >= 30) {
          petData.level = 30;
          petData.exp = Math.floor(100 * Math.pow(1.5, 29));
        }
      }
    });
  }
}
function getPetStats(pId) {
  const data = ctx.S.hero.roster[pId] || { level: 1, exp: 0, enhHp: 0, enhAtk: 0, enhSpd: 0, s5_unlocked: false, s15_unlocked: false };
  const enhHp = data.enhHp || 0;
  const enhAtk = data.enhAtk || 0;
  const enhSpd = data.enhSpd || 0;
  const st = PET_STATS[pId] || PET_STATS.default;
  return {
    level: data.level,
    exp: data.exp || 0,
    maxHp: Math.floor(st.baseHp + (data.level - 1) * st.hpPerLv + enhHp * 50),
    atk: Math.floor(st.baseAtk + (data.level - 1) * st.atkPerLv + enhAtk * 10),
    spd: Number((st.baseSpd + enhSpd * 0.1).toFixed(2)),
    nextExp: Math.floor(100 * Math.pow(1.5, data.level - 1)),
    enhHpCost: 5e3 + enhHp * 2e3,
    enhAtkCost: 5e3 + enhAtk * 2e3,
    enhSpdCost: 5e3 + enhSpd * 2e3,
    enhHpLevel: enhHp,
    enhAtkLevel: enhAtk,
    enhSpdLevel: enhSpd,
    s5_unlocked: data.s5_unlocked || false,
    s15_unlocked: data.s15_unlocked || false
  };
}
function openHeroPanel() {
  initHeroState();
  const styles = [
    { id: "attack", name: "T\u1EA5n c\xF4ng (Dame x1.5, Nh\u1EADn x1.5)", icon: "swordIcon" },
    { id: "defense", name: "Ph\xF2ng th\u1EE7 (Dame x0.6, Nh\u1EADn x0.6)", icon: "emStar" },
    { id: "balanced", name: "C\xE2n b\u1EB1ng (M\u1EB7c \u0111\u1ECBnh)", icon: "emLeaf" }
  ];
  const partySlots = [0, 1, 2].map((i) => {
    const pId = ctx.S.hero.party[i];
    if (pId) {
      const st = getPetStats(pId);
      return `<div class="hero-slot filled" data-rem="${i}">
        ${petSVG(pId, 40)}
        <div class="s-lv">Lv.${st.level}</div>
      </div>`;
    }
    return `<div class="hero-slot empty">Tr\u1ED1ng</div>`;
  }).join("");
  const allPets = ctx.S.pets || [];
  const petRoster = allPets.map((pId) => {
    const inParty = ctx.S.hero.party.includes(pId);
    const st = getPetStats(pId);
    return `<div class="hero-roster-item${inParty ? " used" : ""}">
      <div class="h-r-pet" data-add="${pId}" title="Th\xEAm v\xE0o \u0111\u1ED9i h\xECnh">${petSVG(pId, 32)}</div>
      <div class="h-r-info" data-info="${pId}" title="C\u01B0\u1EDDng h\xF3a & K\u1EF9 n\u0103ng" style="cursor:pointer;">
        <div>Lv.${st.level} (ATK: ${st.atk} | HP: ${st.maxHp} | SPD: ${st.spd})</div>
        <div class="h-r-bar"><div class="h-r-fill" style="width:${st.level >= 30 ? 100 : Math.min(100, st.exp / st.nextExp * 100)}%"></div><span>${st.level >= 30 ? "MAX" : `${Math.floor(st.exp)}/${st.nextExp}`}</span></div>
      </div>
    </div>`;
  }).join("");
  const styleBtns = styles.map(
    (s) => `<div class="hero-style-btn${ctx.S.hero.style === s.id ? " active" : ""}" data-style="${s.id}">
      ${spriteSVG(s.icon, 20)} ${s.name}
    </div>`
  ).join("");
  openModal("Ph\xF2ng T\u1EADp Anh H\xF9ng", `
    <div class="hero-modal-wrapper">
      <div class="hero-panel-stats" style="justify-content: space-between;">
        <div>Max Stage: <b>${ctx.S.hero.maxStage}</b></div>
        <div class="h-gold">${spriteSVG("coin", 16)} <b>${ctx.S.hero.gold}</b></div>
      </div>
      
      <div class="hero-panel-section">\u0110\u1ED9i h\xECnh ra tr\u1EADn (Max 3)</div>
      <div class="hero-party-slots">${partySlots}</div>
      
      <div class="hero-panel-section">Kho Th\xFA C\u01B0ng</div>
      <div class="hero-pet-roster-list">${petRoster || "<i>B\u1EA1n ch\u01B0a c\xF3 Th\xFA c\u01B0ng n\xE0o! H\xE3y v\xE0o Shop \u0111\u1EC3 \u0111\xF3n c\xE1c b\xE9.</i>"}</div>
      
      <div class="hero-panel-section">L\u1ED1i \u0111\xE1nh</div>
      <div class="hero-style-list">${styleBtns}</div>
      
      <div class="hero-deploy-btn" id="hero-deploy">XU\u1EA4T PH\xC1T!</div>
    </div>
  `);
  const mbody = $id("mbody");
  mbody.querySelectorAll(".hero-slot.filled").forEach((el) => el.addEventListener("click", () => {
    ctx.S.hero.party.splice(parseInt(el.dataset.rem), 1);
    save();
    openHeroPanel();
  }));
  mbody.querySelectorAll(".h-r-pet").forEach((el) => el.addEventListener("click", () => {
    const pId = el.dataset.add;
    if (ctx.S.hero.party.includes(pId)) return;
    if (ctx.S.hero.party.length >= 3) return toast("\u0110\u1ED9i h\xECnh \u0111\xE3 \u0111\u1EA7y! (Max 3)");
    ctx.S.hero.party.push(pId);
    save();
    openHeroPanel();
  }));
  mbody.querySelectorAll(".h-r-info").forEach((el) => el.addEventListener("click", () => {
    openPetSkills(el.dataset.info);
  }));
  mbody.querySelectorAll(".hero-style-btn").forEach((el) => el.addEventListener("click", () => {
    ctx.S.hero.style = el.dataset.style;
    save();
    openHeroPanel();
  }));
  mbody.querySelector("#hero-deploy").addEventListener("click", () => {
    if (ctx.S.hero.party.length === 0) {
      return toast("Vui l\xF2ng x\u1EBFp \u0110\u1ED9i h\xECnh tr\u01B0\u1EDBc khi Xu\u1EA5t chi\u1EBFn!");
    }
    closeModal();
    openHeroMode();
  });
}
function spendGold(cost) {
  if (ctx.S.hero.gold + (ctx.S.coins || 0) >= cost) {
    if (ctx.S.hero.gold >= cost) {
      ctx.S.hero.gold -= cost;
    } else {
      const rem = cost - ctx.S.hero.gold;
      ctx.S.hero.gold = 0;
      ctx.S.coins -= rem;
      toast(`\u0110\xE3 d\xF9ng th\xEAm ${rem} V\xE0ng tr\u1EA1i!`);
    }
    return true;
  }
  toast("Kh\xF4ng \u0111\u1EE7 v\xE0ng (c\u1EA3 V\xE0ng tr\u1EA1i v\xE0 V\xE0ng Anh h\xF9ng)!");
  return false;
}
function openPetSkills(pId) {
  const st = getPetStats(pId);
  if (!ctx.S.hero.roster[pId]) ctx.S.hero.roster[pId] = { level: 1, exp: 0, enhHp: 0, enhAtk: 0 };
  const data = ctx.S.hero.roster[pId];
  const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
  const renderSkillRow = (typeId, skData, reqLvl, cost, isEquipped, isOtherEquipped) => {
    if (!skData) return "";
    const isUnlocked = data[`${typeId}_unlocked`];
    const levelMet = data.level >= reqLvl;
    let actionBtn = "";
    if (isUnlocked) {
      if (isEquipped) {
        actionBtn = `<div class="hero-deploy-btn" data-action="unequip" data-type="${typeId}" style="margin-top:0; padding:6px 12px; font-size:12px; width:auto; background:#4CAF50; color:#fff; border-color:#2E7D32;">\u0110ang Trang B\u1ECB</div>`;
      } else {
        actionBtn = `<div class="hero-deploy-btn sk-equip-btn" data-action="equip" data-type="${typeId}" style="margin-top:0; padding:6px 12px; font-size:12px; width:auto;">Trang b\u1ECB</div>`;
      }
    } else if (levelMet) {
      actionBtn = `<div class="hero-deploy-btn sk-unlock-btn" data-tier="${typeId}" data-cost="${cost}" style="margin-top:0; padding:6px 12px; font-size:12px; width:auto;">M\u1EDF kh\xF3a<br>${cost}G</div>`;
    } else {
      actionBtn = `<div style="color:#777; font-size:12px; text-align:center;">C\u1EA7n Lv.${reqLvl}</div>`;
    }
    return `<div class="p-skill-tier ${isUnlocked ? "unlocked" : "locked"}">
      <div class="p-sk-icon">${isUnlocked ? spriteSVG("emStar", 24) : spriteSVG("emLock", 24)}</div>
      <div class="p-sk-desc">
        <div style="font-size: 13px; font-weight: bold; color: ${isUnlocked ? "#a4dc8c" : "#777"};">${skData.name}</div>
        <div style="font-size: 12px; color:#aaa;">${typeId.startsWith("a") ? `Ch\u1EE7 \u0111\u1ED9ng - H\u1ED3i ${skData.cd}s` : "B\u1ECB \u0111\u1ED9ng"}</div>
        <div style="font-size: 14px; margin-top: 2px;">${skData.desc}</div>
      </div>
      <div>${actionBtn}</div>
    </div>`;
  };
  const activeHtml = `
    ${renderSkillRow("a1", pSkill.a1, 5, 2e5, data.active_eq === "a1", data.active_eq === "a2")}
    ${renderSkillRow("a2", pSkill.a2, 15, 5e5, data.active_eq === "a2", data.active_eq === "a1")}
  `;
  const passiveHtml = `
    ${renderSkillRow("p1", pSkill.p1, 10, 35e4, data.passive_eq === "p1", data.passive_eq === "p2")}
    ${renderSkillRow("p2", pSkill.p2, 20, 8e5, data.passive_eq === "p2", data.passive_eq === "p1")}
  `;
  openModal("Th\xF4ng Tin Th\xFA C\u01B0ng", `
    <div class="hero-modal-wrapper">
      <div style="display:flex; gap: 16px; margin-bottom: 16px; align-items:center;">
        <div style="background:#2c2538; border-radius:12px; padding:12px; border: 2px solid #5d4a85;">
          ${petSVG(pId, 64)}
        </div>
        <div style="flex:1;">
          <div style="font-size: 18px; font-weight:bold; color: #f2c231; margin-bottom: 4px;">Lv.${st.level}</div>
          <div style="font-size: 14px;">HP C\u01A1 b\u1EA3n: <b>${st.maxHp}</b> (+${st.enhHpLevel} C\u01B0\u1EDDng h\xF3a)</div>
          <div style="font-size: 14px;">ATK C\u01A1 b\u1EA3n: <b>${st.atk}</b> (+${st.enhAtkLevel} C\u01B0\u1EDDng h\xF3a)</div>
          <div style="font-size: 14px;">T\u1ED1c \u0111\xE1nh: <b>${st.spd}</b> (+${st.enhSpdLevel} C\u01B0\u1EDDng h\xF3a)</div>
          <div class="h-r-bar" style="margin-top:8px;"><div class="h-r-fill" style="width:${st.level >= 30 ? 100 : Math.min(100, st.exp / st.nextExp * 100)}%"></div><span>${st.level >= 30 ? "MAX LEVEL" : `EXP: ${Math.floor(st.exp)}/${st.nextExp}`}</span></div>
        </div>
      </div>
      
      <div class="hero-panel-section">K\u1EF9 N\u0103ng Ch\u1EE7 \u0110\u1ED9ng (Ch\u1ECDn 1)</div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${activeHtml}
      </div>
      
      <div class="hero-panel-section" style="margin-top:16px;">K\u1EF9 N\u0103ng B\u1ECB \u0110\u1ED9ng (Ch\u1ECDn 1)</div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${passiveHtml}
      </div>
      
      <div class="hero-panel-section" style="margin-top:16px;">C\u01B0\u1EDDng H\xF3a (Enhance)</div>
      <div class="betsides">
        <div class="betside hero-deploy-btn" id="pet-enh-hp" style="margin-top:0; padding:10px; font-size:14px;">
          +50 HP<br><span style="font-size:12px; font-weight:normal;">(${st.enhHpCost} V\xE0ng)</span>
        </div>
        <div class="betside hero-deploy-btn" id="pet-enh-atk" style="margin-top:0; padding:10px; font-size:14px;">
          +10 ATK<br><span style="font-size:12px; font-weight:normal;">(${st.enhAtkCost} V\xE0ng)</span>
        </div>
        <div class="betside hero-deploy-btn" id="pet-enh-spd" style="margin-top:0; padding:10px; font-size:14px;">
          +0.1 SPD<br><span style="font-size:12px; font-weight:normal;">(${st.enhSpdCost} V\xE0ng)</span>
        </div>
      </div>
      
      <div class="hero-deploy-btn" id="pet-back-btn" style="margin-top: 16px; background: #2c2538; border-color: #5d4a85;">
        Quay L\u1EA1i
      </div>
    </div>
  `);
  const mbody = $id("mbody");
  mbody.querySelectorAll(".sk-unlock-btn").forEach((btn) => btn.addEventListener("click", () => {
    const cost = parseInt(btn.dataset.cost);
    const tier = btn.dataset.tier;
    if (spendGold(cost)) {
      ctx.S.hero.roster[pId][`${tier}_unlocked`] = true;
      save();
      openPetSkills(pId);
    }
  }));
  mbody.querySelectorAll('[data-action="equip"], [data-action="unequip"]').forEach((btn) => btn.addEventListener("click", () => {
    const typeId = btn.dataset.type;
    const isAct = typeId.startsWith("a");
    if (btn.dataset.action === "equip") {
      if (isAct) ctx.S.hero.roster[pId].active_eq = typeId;
      else ctx.S.hero.roster[pId].passive_eq = typeId;
    } else {
      if (isAct) delete ctx.S.hero.roster[pId].active_eq;
      else delete ctx.S.hero.roster[pId].passive_eq;
    }
    save();
    openPetSkills(pId);
    if (runState && runState.pets.some((p) => p.id === pId)) {
      const pt = runState.pets.find((p) => p.id === pId);
      if (pt) {
        if (isAct) {
          pt.skillMaxCd = btn.dataset.action === "equip" ? pSkill[typeId].cd || 0 : 0;
          pt.skillCd = pt.skillMaxCd;
        }
        renderHeroUI();
      }
    }
  }));
  mbody.querySelector("#pet-enh-hp").addEventListener("click", () => {
    if (spendGold(st.enhHpCost)) {
      ctx.S.hero.roster[pId].enhHp = (ctx.S.hero.roster[pId].enhHp || 0) + 1;
      save();
      openPetSkills(pId);
    }
  });
  mbody.querySelector("#pet-enh-atk").addEventListener("click", () => {
    if (spendGold(st.enhAtkCost)) {
      ctx.S.hero.roster[pId].enhAtk = (ctx.S.hero.roster[pId].enhAtk || 0) + 1;
      save();
      openPetSkills(pId);
    }
  });
  mbody.querySelector("#pet-enh-spd").addEventListener("click", () => {
    if (spendGold(st.enhSpdCost)) {
      ctx.S.hero.roster[pId].enhSpd = (ctx.S.hero.roster[pId].enhSpd || 0) + 1;
      save();
      openPetSkills(pId);
    }
  });
  mbody.querySelector("#pet-back-btn").addEventListener("click", () => {
    openHeroPanel();
  });
}
function openHeroMode() {
  initHeroState();
  closeWin();
  if (ctx.S.hero.party.length === 0) {
    toast("Vui l\xF2ng ch\u1ECDn \u0110\u1ED9i h\xECnh tr\u01B0\u1EDBc!");
    openHeroPanel();
    return;
  }
  const bar = $id("hero-bar");
  if (bar) bar.style.display = "flex";
  let partyHpMult = 1;
  let partyAtkMult = 1;
  let partyCritMult = 0;
  let partySpdMult = 0;
  let partyDodge = 0;
  let partyDmgResist = 0;
  ctx.S.hero.party.forEach((pId) => {
    const data = ctx.S.hero.roster[pId] || {};
    const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
    const pKey = data.passive_eq;
    if (pKey && pSkill[pKey]) {
      const type = pSkill[pKey].type;
      const val = pSkill[pKey].val;
      if (type === "max_hp_party") partyHpMult += val;
      if (type === "party_speed") partySpdMult += val;
      if (type === "party_dodge") partyDodge += val;
      if (type === "party_crit") partyCritMult += val;
      if (type === "party_dmg_resist") partyDmgResist += val;
      if (type === "atk_party") partyAtkMult += val;
    }
  });
  ctx.S.hero.pressure = 0;
  runState = {
    stage: 1,
    pets: ctx.S.hero.party.map((pId) => {
      const st = getPetStats(pId);
      const data = ctx.S.hero.roster[pId] || {};
      const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
      let atkMult = partyAtkMult;
      let hpMult = partyHpMult;
      let critRate = 0.1 + partyCritMult;
      let critDmg = 2;
      let dodge = partyDodge;
      let lifesteal = 0;
      let cheatDeath = 0;
      let atkSpeed = st.spd * (1 + partySpdMult);
      let reflect = 0;
      let armorPen = 0;
      let dmgResist = partyDmgResist;
      const pKey = data.passive_eq;
      if (pKey && pSkill[pKey]) {
        const type = pSkill[pKey].type;
        const val = pSkill[pKey].val;
        if (type === "atk_up") atkMult += val;
        if (type === "crit_rate") critRate += val;
        if (type === "crit_dmg") critDmg = val;
        if (type === "dodge") dodge += val;
        if (type === "lifesteal") lifesteal += val;
        if (type === "atk_speed") atkSpeed *= val;
        if (type === "reflect") reflect += val;
        if (type === "armor_pen") armorPen += val;
        if (type === "dmg_reduction") dmgResist += val;
        if (type === "cheat_death") cheatDeath = val;
        if (type === "berserk") {
          atkMult *= 1 + val;
          hpMult *= 0.5;
        }
      }
      atkSpeed = Math.min(5, atkSpeed);
      let finalHp = Math.floor(st.maxHp * hpMult);
      let finalAtk = Math.floor(st.atk * atkMult);
      if (pKey && pSkill[pKey] && pSkill[pKey].type === "hp_to_atk") {
        finalAtk += Math.floor(finalHp * pSkill[pKey].val);
      }
      const aKey = data.active_eq;
      let maxCd = 0;
      if (aKey && pSkill[aKey]) maxCd = pSkill[aKey].cd || 0;
      return {
        id: pId,
        maxHp: finalHp,
        hp: finalHp,
        shield: 0,
        hpMult,
        atkMult,
        atk: finalAtk,
        cd: 1 / atkSpeed,
        maxCd: 1 / atkSpeed,
        crit: critRate,
        critDmg,
        dodge,
        lifesteal,
        cheatDeath,
        reflect,
        armorPen,
        dmgResist,
        skillCd: maxCd,
        skillMaxCd: maxCd,
        skillActiveTime: 0,
        combo: 0
        // for starBell
      };
    }),
    monsters: [],
    focusTarget: null,
    waveTime: 0
  };
  spawnMonster();
  renderHeroUI();
  placeHeroBar();
  if (!heroLoop) {
    lastTick = Date.now();
    heroLoop = setInterval(heroTick, 100);
  }
  heroToast("Taskbar Hero \u0111\xE3 xu\u1EA5t ph\xE1t!");
}
function closeHeroMode() {
  const bar = $id("hero-bar");
  if (bar) bar.style.display = "none";
  if (heroLoop) {
    clearInterval(heroLoop);
    heroLoop = null;
  }
  window.removeEventListener("resize", placeHeroBar);
  runState = null;
  const orb = $id("orb");
  if (orb) orb.style.display = "flex";
}
function heroToast(msg) {
  const t = $id("hero-toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  if (hToastTimer) clearTimeout(hToastTimer);
  hToastTimer = setTimeout(() => t.classList.remove("show"), 2e3);
}
function cashOutHero() {
  if (ctx.S.hero.gold > 0) {
    const g = ctx.S.hero.gold;
    ctx.S.coins = (ctx.S.coins || 0) + g;
    heroToast(`\u0110\xE3 r\xFAt ${g.toLocaleString()}G v\u1EC1 trang tr\u1EA1i!`);
    ctx.S.hero.gold = 0;
    save();
    updateHeroStats();
  } else {
    heroToast("Ch\u01B0a c\xF3 V\xE0ng \u0111\u1EC3 r\xFAt!");
  }
}
function spawnMonster() {
  if (!runState) return;
  runState.isTransitioning = false;
  const numPets = runState.pets.filter((p) => p.hp > 0).length;
  if (numPets === 0) return;
  const numMobs = Math.floor(Math.random() * numPets) + 1;
  const isBoss = runState.stage > 0 && runState.stage % 5 === 0;
  runState.monsters = [];
  const cropKeys = Object.keys(CROPS);
  for (let i = 0; i < numMobs; i++) {
    const isThisBoss = isBoss && i === 0;
    const hpMult = isThisBoss ? 5 : 1;
    const pressure = ctx.S.hero.pressure || 0;
    const pressureMult = 1 + pressure * 0.05;
    const baseMaxHp = (runState.stage * 20 + 80) * hpMult * pressureMult;
    const baseAtk = (runState.stage * 4 + 5) * (isThisBoss ? 2 : 1) * pressureMult;
    const baseCd = 2;
    let hpScale = 0.8 + Math.random() * 0.4;
    let atkScale = 0.8 + Math.random() * 0.4;
    let cdScale = 0.8 + Math.random() * 0.4;
    if (!isThisBoss) {
      cdScale = hpScale * atkScale;
    } else {
      hpScale = 0.9 + Math.random() * 0.3;
      atkScale = 0.9 + Math.random() * 0.3;
      cdScale = 0.7 + Math.random() * 0.4;
    }
    const maxHp = Math.floor(baseMaxHp * hpScale);
    const atk = Math.floor(baseAtk * atkScale);
    const maxCd = Math.max(0.5, baseCd * cdScale);
    const randomCrop = cropKeys[Math.floor(Math.random() * cropKeys.length)];
    runState.monsters.push({
      idx: i,
      id: randomCrop,
      hp: maxHp,
      maxHp,
      atk,
      cd: maxCd,
      maxCd,
      isBoss: isThisBoss,
      isDead: false,
      x: 350 + i * 45
    });
  }
  runState.focusTarget = null;
  runState.waveTime = 0;
  renderMonstersUI();
}
function renderMonstersUI() {
  const em = $id("hero-enemy");
  if (!em || !runState) return;
  em.innerHTML = runState.monsters.map((m, i) => {
    const scale = m.isBoss ? "scale(1.5)" : "";
    const bossStyle = m.isBoss ? "filter: drop-shadow(0 0 5px #ff0000);" : "";
    const focusStyle = runState.focusTarget === i ? "filter: drop-shadow(0 0 8px #ffeb3b);" : bossStyle;
    return `
      <div class="hero-mob idle" id="hmob-${i}" onclick="focusMonster(${i})" style="position: absolute; transform: translate3d(${m.x}px, 0, 0); transform-origin: bottom center; transition: transform 0.1s linear; ${focusStyle}">
        <div class="hp-bar-mini" style="${m.isBoss ? "width: 48px;" : ""}"><div class="hp-fill-mini" id="hp-mob-${i}" style="width: ${m.hp / m.maxHp * 100}%"></div></div>
        <div class="hp-bar-mini" style="${m.isBoss ? "width: 48px;" : ""}"><div class="cd-fill-mini" id="cd-mob-${i}" style="width: ${Math.min(100, Math.max(0, (m.maxCd - m.cd) / m.maxCd * 100))}%"></div></div>
        <div style="transform: ${scale}">${spriteSVG(CROPS[m.id].sp || "seedLight", 32)}</div>
      </div>
    `;
  }).join("");
}
function heroTick() {
  const now2 = Date.now();
  const dt = now2 - lastTick;
  lastTick = now2;
  if (!runState || !runState.monsters || runState.isTransitioning) return;
  runState.waveTime += dt / 1e3;
  const partyEl = $id("hero-party");
  const alivePets = runState.pets.filter((p) => p.hp > 0);
  if (alivePets.length === 0) {
    runState.monsters = [];
    runState.isTransitioning = true;
    heroToast("\u0110\u1ED9i h\xECnh \u0111\xE3 g\u1EE5c ng\xE3! V\u1EC1 Stage 1...");
    setTimeout(() => {
      if (!runState) return;
      ctx.S.hero.pressure = 0;
      runState.stage = 1;
      runState.pets.forEach((p) => p.hp = p.maxHp);
      renderHeroUI();
      spawnMonster();
    }, 3e3);
    return;
  }
  let allMonstersDead = true;
  let anyMonsterInPosition = false;
  runState.monsters.forEach((m) => {
    if (m.hp <= 0) {
      if (!m.isDead) {
        m.isDead = true;
        const mEl2 = $id("hmob-" + m.idx);
        if (mEl2) {
          mEl2.classList.remove("idle", "hurt", "attack");
          mEl2.style.transition = "all 0.4s ease-out";
          mEl2.style.opacity = "0";
          mEl2.style.transform = `translate3d(${m.x}px, 0, 0) scale(0.1)`;
          mEl2.style.pointerEvents = "none";
          setTimeout(() => showFloatDamage("KO", mEl2, "#ffaa00"), 0);
        }
      }
      return;
    }
    allMonstersDead = false;
    const targetX = 200 + m.idx * 45;
    const mEl = $id("hmob-" + m.idx);
    if (m.x > targetX) {
      m.x -= 40 * (dt / 1e3);
      m.x = Math.max(targetX, m.x);
      if (mEl) mEl.style.transform = `translate3d(${m.x}px, 0, 0)`;
    } else {
      anyMonsterInPosition = true;
    }
  });
  if (allMonstersDead) {
    runState.isTransitioning = true;
    setTimeout(() => {
      if (!runState || !runState.monsters) return;
      let totalGold2 = 0;
      runState.monsters.forEach((m) => {
        totalGold2 += Math.floor((runState.stage * 30 + 100) * 0.6 * (m.isBoss ? 5 : 1) * (0.8 + Math.random() * 0.4));
      });
      let pGoldMult = 1;
      runState.pets.forEach((p) => {
        const data = ctx.S.hero.roster[p.id];
        if (data && data.passive_eq) {
          const sk = PET_SKILLS[p.id]?.[data.passive_eq];
          if (sk && sk.type === "gold_drop") pGoldMult *= sk.val;
        }
      });
      ctx.S.hero.gold += Math.floor(totalGold2 * pGoldMult);
      let totalExp = 0;
      runState.monsters.forEach((m) => {
        totalExp += (runState.stage * 10 + 5) * (m.isBoss ? 5 : 1);
      });
      runState.pets.forEach((p) => {
        if (!ctx.S.hero.roster[p.id]) ctx.S.hero.roster[p.id] = { level: 1, exp: 0, enhHp: 0, enhAtk: 0 };
        const petData = ctx.S.hero.roster[p.id];
        if (petData.exp === void 0 || isNaN(petData.exp)) petData.exp = 0;
        const pEl = $id("hpet-" + runState.pets.indexOf(p));
        petData.exp += Math.floor(totalExp / runState.pets.length);
        let leveledUp = false;
        while (petData.level < 30) {
          const nextExp = Math.floor(100 * Math.pow(1.5, petData.level - 1));
          if (petData.exp >= nextExp) {
            petData.exp -= nextExp;
            petData.level++;
            leveledUp = true;
          } else {
            break;
          }
        }
        if (petData.level >= 30) {
          petData.level = 30;
          petData.exp = Math.floor(100 * Math.pow(1.5, 29));
        }
        if (leveledUp) {
          if (pEl) setTimeout(() => showFloatDamage("LEVEL UP!", pEl, "#f2c231"), 500);
          heroToast((PETS[p.id]?.name || "Pet") + " v\u1EEBa l\xEAn c\u1EA5p " + petData.level + "!");
          const st = getPetStats(p.id);
          const oldMax = p.maxHp;
          p.maxHp = Math.floor(st.maxHp * (p.hpMult || 1));
          p.hp += p.maxHp - oldMax;
          p.atk = Math.floor(st.atk * (p.atkMult || 1));
        }
      });
      const boss = runState.monsters.find((m) => m.isBoss);
      if (boss) {
        ctx.S.hero.pressure = (ctx.S.hero.pressure || 0) + 1;
        const r = Math.random();
        if (r < 0.5) {
          ctx.S.tickets = ctx.S.tickets || {};
          ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + 1;
          showFloatDrop("ticketNorm", partyEl);
        } else if (r < 0.8) {
          ctx.S.ferts["shiny"] = (ctx.S.ferts["shiny"] || 0) + 1;
          showFloatDrop("toolFert", partyEl);
        }
      } else {
        const m = runState.monsters[0];
        const r = Math.random();
        if (r < 0.1) {
          ctx.S.seeds[m.id] = (ctx.S.seeds[m.id] || 0) + 1;
          showFloatDrop(CROPS[m.id].sp || "seedLight", partyEl);
        } else if (r < 0.15) {
          ctx.S.ferts["compost"] = (ctx.S.ferts["compost"] || 0) + 1;
          showFloatDrop("toolFert", partyEl);
        }
      }
      runState.stage++;
      if (runState.stage > ctx.S.hero.maxStage) ctx.S.hero.maxStage = runState.stage;
      runState.pets.forEach((p) => {
        if (p.hp > 0) p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.2);
      });
      save();
      renderHeroUI();
      spawnMonster();
    }, 1500);
    return;
  }
  const activeMonsters = runState.monsters.filter((m) => m.hp > 0 && m.x <= 200 + m.idx * 45 + 2);
  if (activeMonsters.length > 0) {
    alivePets.forEach((p) => {
      const pIdx = runState.pets.indexOf(p);
      const pEl = $id("hpet-" + pIdx);
      const data = ctx.S.hero.roster[p.id] || {};
      const pSkill = PET_SKILLS[p.id];
      const passEq = data.passive_eq;
      if (passEq && pSkill && pSkill[passEq]) {
        const ps = pSkill[passEq];
        if (ps.type === "hp_regen") {
          const heal = p.maxHp * ps.val * (dt / 1e3);
          p.hp = Math.min(p.maxHp, p.hp + heal);
          const hpPet = $id("hp-pet-" + pIdx);
          if (hpPet) hpPet.style.width = p.hp / p.maxHp * 100 + "%";
        }
        if (ps.type === "curse_aura") {
          activeMonsters.forEach((m) => {
            const cDmg = m.maxHp * ps.val * (dt / 1e3);
            m.hp -= cDmg;
          });
        }
      }
      if (p.skillActiveTime > 0) {
        p.skillActiveTime -= dt / 1e3;
        const actEq = data.active_eq;
        if (actEq && pSkill && pSkill[actEq]) {
          const aSk = pSkill[actEq];
          if (aSk.type === "laser") {
            let tMob = null;
            if (runState.focusTarget !== null && runState.monsters[runState.focusTarget] && runState.monsters[runState.focusTarget].hp > 0 && runState.monsters[runState.focusTarget].x <= 200 + runState.focusTarget * 45 + 2) {
              tMob = runState.monsters[runState.focusTarget];
            } else {
              tMob = activeMonsters[Math.floor(Math.random() * activeMonsters.length)];
            }
            const ldmg = p.atk * aSk.val * (dt / 1e3);
            tMob.hp -= ldmg;
            if (Math.random() < 0.1) {
              const mobEl = $id("hmob-" + tMob.idx);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            }
          }
        }
      } else if (p.skillMaxCd > 0) {
        let stSpdMult = 1;
        if (p.spdBuff) stSpdMult *= p.spdBuff;
        p.skillCd -= dt / 1e3 * stSpdMult;
        const skBar = $id("sk-pet-" + pIdx);
        if (skBar) skBar.style.width = Math.min(100, Math.max(0, (p.skillMaxCd - p.skillCd) / p.skillMaxCd * 100)) + "%";
        if (p.skillCd <= 0) {
          const actEq = data.active_eq;
          if (actEq && pSkill && pSkill[actEq]) {
            const aSk = pSkill[actEq];
            p.skillCd = p.skillMaxCd;
            p.skillActiveTime = aSk.duration || 0;
            let tMob = null;
            if (runState.focusTarget !== null && runState.monsters[runState.focusTarget] && runState.monsters[runState.focusTarget].hp > 0 && runState.monsters[runState.focusTarget].x <= 200 + runState.focusTarget * 45 + 2) {
              tMob = runState.monsters[runState.focusTarget];
            } else {
              tMob = activeMonsters[Math.floor(Math.random() * activeMonsters.length)];
            }
            const mobEl = $id("hmob-" + tMob.idx);
            if (aSk.type === "heal_party" || aSk.type === "heal_self") {
              const targets = aSk.type === "heal_party" ? alivePets : [p];
              targets.forEach((ap) => {
                const healAmt = aSk.val < 1 ? ap.maxHp * aSk.val : aSk.val;
                ap.hp = Math.min(ap.maxHp, ap.hp + healAmt);
                const tIdx = runState.pets.indexOf(ap);
                const tEl = $id("hpet-" + tIdx);
                setTimeout(() => showFloatDamage("+" + Math.floor(healAmt), tEl, "#a4dc8c"), 0);
                const hpPet = $id("hp-pet-" + tIdx);
                if (hpPet) hpPet.style.width = ap.hp / ap.maxHp * 100 + "%";
                spawnSkillEffect(pEl, tEl, aSk.type);
              });
            } else if (aSk.type === "slam_dmg") {
              const dmg = p.atk * aSk.val;
              tMob.hp -= dmg;
              setTimeout(() => showFloatDamage("-" + dmg, mobEl, "#ff5555"), 150);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === "multi_strike") {
              if (p.id === "naoyaSlime") {
                runState.isTransitioning = true;
                playNaoyaCutscene(p, pEl, mobEl, () => {
                  let totalDmg = 0;
                  for (let i = 0; i < aSk.val; i++) {
                    if (tMob.hp > 0) {
                      tMob.hp -= p.atk * 0.5;
                      totalDmg += p.atk * 0.5;
                    }
                  }
                  setTimeout(() => showFloatDamage("-" + Math.floor(totalDmg), mobEl, "#ff0000"), 0);
                  const isDead = tMob.hp <= 0;
                  const quotesAlive = ["R\xE1c r\u01B0\u1EDFi!", "Ch\u1EADm qu\xE1 \u0111\u1EA5y!", "Bi\u1EBFt th\xE2n bi\u1EBFt ph\u1EADn \u0111i!"];
                  const quote = isDead ? "M\xE0y kh\xF4ng ph\u1EA3i Toji." : quotesAlive[Math.floor(Math.random() * quotesAlive.length)];
                  setTimeout(() => showFloatDamage("\u{1F4AC} " + quote, pEl, "#fcd34d"), 300);
                  runState.isTransitioning = false;
                });
              } else {
                for (let i = 0; i < aSk.val; i++) {
                  setTimeout(() => {
                    if (tMob.hp > 0) {
                      tMob.hp -= p.atk;
                      spawnAttackEffect(p.id, pEl, mobEl, false, false);
                    }
                  }, i * 150);
                }
              }
            } else if (aSk.type === "atk_spd_self") {
              p.spdBuff = aSk.val;
              p.spdBuffTimer = aSk.duration;
              setTimeout(() => showFloatDamage("SPD UP", pEl, "#ffff00"), 0);
            } else if (aSk.type === "charm") {
              tMob.atkDebuff = aSk.val;
              tMob.atkDebuffTimer = aSk.duration;
              setTimeout(() => showFloatDamage("CHARMED", mobEl, "#ff88dd"), 0);
            } else if (aSk.type === "shield_self") {
              const shieldAmt = aSk.val < 1 ? p.maxHp * aSk.val : aSk.val;
              p.shield = (p.shield || 0) + shieldAmt;
              setTimeout(() => showFloatDamage("SHIELD", pEl, "#aaddff"), 0);
              spawnSkillEffect(pEl, pEl, "shield");
            } else if (aSk.type === "shield_party") {
              alivePets.forEach((ap) => {
                const shieldAmt = aSk.val < 1 ? ap.maxHp * aSk.val : aSk.val;
                ap.shield = (ap.shield || 0) + shieldAmt;
                const tIdx = runState.pets.indexOf(ap);
                const tEl = $id("hpet-" + tIdx);
                setTimeout(() => showFloatDamage("SHIELD", tEl, "#aaddff"), 0);
                spawnSkillEffect(pEl, tEl, "shield");
              });
            } else if (aSk.type === "slow") {
              tMob.spdDebuff = aSk.val;
              tMob.spdDebuffTimer = aSk.duration;
              setTimeout(() => showFloatDamage("SLOWED", mobEl, "#99ddff"), 0);
            } else if (aSk.type === "thorn_whip") {
              const dmg = p.atk * aSk.val;
              tMob.hp -= dmg;
              p.hp = Math.min(p.maxHp, p.hp + dmg * 0.5);
              setTimeout(() => showFloatDamage("-" + dmg, mobEl, "#4CAF50"), 0);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === "cd_reduce") {
              alivePets.forEach((ap) => {
                ap.skillCd = Math.max(0, ap.skillCd - aSk.val);
              });
              setTimeout(() => showFloatDamage("CD -" + aSk.val + "s", pEl, "#00ffff"), 0);
            } else if (aSk.type === "lightning_strike") {
              const dmg = p.atk * aSk.val;
              tMob.hp -= dmg;
              setTimeout(() => showFloatDamage("-" + dmg, mobEl, "#00ffff"), 0);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === "push_back") {
              tMob.x = Math.min(350, tMob.x + 50);
              tMob.cd += 0.5;
              setTimeout(() => showFloatDamage("KNOCKBACK", mobEl, "#fff"), 0);
            } else if (aSk.type === "soul_reap") {
              const dmg = tMob.hp * aSk.val;
              tMob.hp -= dmg;
              setTimeout(() => showFloatDamage("-" + Math.floor(dmg), mobEl, "#9c27b0"), 0);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === "fear") {
              tMob.stunCd = (tMob.stunCd || 0) + aSk.duration;
              setTimeout(() => showFloatDamage("FEAR", mobEl, "#5e35b1"), 0);
            } else if (aSk.type === "random_dmg") {
              const randomVal = 1 + Math.random() * (aSk.val - 1);
              const dmg = Math.floor(p.atk * randomVal);
              tMob.hp -= dmg;
              setTimeout(() => showFloatDamage("-" + dmg, mobEl, "#f24d4d"), 150);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === "random_buff") {
              alivePets.forEach((ap) => {
                ap.atkBuff = (ap.atkBuff || 0) + aSk.val;
                ap.atkBuffTimer = aSk.duration;
                setTimeout(() => showFloatDamage("BUFFED", $id("hpet-" + runState.pets.indexOf(ap)), "#ffd94d"), 0);
              });
            } else if (aSk.type === "stun_bolt") {
              tMob.stunCd = (tMob.stunCd || 0) + aSk.duration;
              setTimeout(() => showFloatDamage("STUN", mobEl, "#ccc"), 0);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === "dispel") {
              const dmg = p.atk * aSk.val;
              tMob.hp -= dmg;
              tMob.atkBuff = 0;
              setTimeout(() => showFloatDamage("DISPEL -" + dmg, mobEl, "#00bcd4"), 0);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === "hellfire") {
              p.hp = Math.max(1, p.hp - p.hp * 0.2);
              const dmg = p.atk * aSk.val;
              tMob.hp -= dmg;
              setTimeout(() => showFloatDamage("-" + dmg, mobEl, "#ff5722"), 0);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === "vampiric_buff") {
              alivePets.forEach((ap) => {
                if (ap !== p) ap.hp = Math.max(1, ap.hp - ap.maxHp * 0.1);
              });
              p.atkBuff = (p.atkBuff || 1) + aSk.val;
              p.atkBuffTimer = aSk.duration;
              setTimeout(() => showFloatDamage("VAMPIRIC", pEl, "#d32f2f"), 0);
            } else if (aSk.type === "resurrect") {
              const deadPets = runState.pets.filter((pt) => pt.hp <= 0);
              if (deadPets.length > 0) {
                const dp = deadPets[0];
                dp.hp = Math.floor(dp.maxHp * aSk.val);
                const dpEl = $id("hpet-" + runState.pets.indexOf(dp));
                if (dpEl) {
                  dpEl.style.opacity = "1";
                  setTimeout(() => showFloatDamage("REVIVE", dpEl, "#ffff00"), 0);
                }
              }
            } else if (aSk.type === "absorb") {
              p.absorbCharge = aSk.val;
              setTimeout(() => showFloatDamage("ABSORB", pEl, "#e040fb"), 0);
            } else if (aSk.type === "star_fall") {
              const dmg = p.atk * aSk.val;
              tMob.hp -= dmg;
              tMob.stunCd = (tMob.stunCd || 0) + 1;
              setTimeout(() => showFloatDamage("STARFALL -" + dmg, mobEl, "#ffeb3b"), 0);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === "party_speed_buff") {
              alivePets.forEach((ap) => {
                ap.spdBuff = aSk.val;
                ap.spdBuffTimer = aSk.duration;
              });
              setTimeout(() => showFloatDamage("SPD BUFF", pEl, "#00e676"), 0);
            } else if (aSk.type === "blind") {
              tMob.blindCd = aSk.duration;
              setTimeout(() => showFloatDamage("BLIND", mobEl, "#607d8b"), 0);
            } else if (aSk.type === "sugar_rush") {
              p.spdBuff = aSk.val;
              p.atkDebuff = 0.5;
              p.sugarTimer = aSk.duration;
              setTimeout(() => showFloatDamage("SUGAR RUSH", pEl, "#ff80ab"), 0);
            } else if (aSk.type === "snowball_roll") {
              const dmg = p.atk * aSk.val;
              tMob.hp -= dmg;
              tMob.x = Math.min(350, tMob.x + 30);
              setTimeout(() => showFloatDamage("-" + dmg, mobEl, "#e0f7fa"), 0);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === "coin_toss") {
              const cost = Math.floor(ctx.S.hero.gold * 0.2);
              if (cost > 0) ctx.S.hero.gold -= cost;
              const dmg = Math.floor(tMob.maxHp * 0.5);
              tMob.hp -= dmg;
              setTimeout(() => showFloatDamage("-" + dmg + " True DMG", mobEl, "#ffca28"), 0);
            } else if (aSk.type === "atk_up") {
              p.atkBuff = (p.atkBuff || 1) + aSk.val;
              p.atkBuffTimer = aSk.duration;
              setTimeout(() => showFloatDamage("ATK UP", pEl, "#f44336"), 0);
            }
          }
        }
      }
      if (p.atkBuffTimer > 0) {
        p.atkBuffTimer -= dt / 1e3;
        if (p.atkBuffTimer <= 0) p.atkBuff = null;
      }
      if (p.spdBuffTimer > 0) {
        p.spdBuffTimer -= dt / 1e3;
        if (p.spdBuffTimer <= 0) p.spdBuff = null;
      }
      if (p.sugarTimer > 0) {
        p.sugarTimer -= dt / 1e3;
        if (p.sugarTimer <= 0) {
          p.spdBuff = null;
          p.atkDebuff = null;
        }
      }
      let rtSpdMult = 1;
      if (p.spdBuff) rtSpdMult *= p.spdBuff;
      p.cd -= dt / 1e3 * rtSpdMult;
      const cdBar = $id("cd-pet-" + pIdx);
      if (cdBar) cdBar.style.width = Math.min(100, Math.max(0, (p.maxCd - p.cd) / p.maxCd * 100)) + "%";
      if (p.cd <= 0) {
        p.cd = p.maxCd;
        const styleMult = ctx.S.hero.style === "attack" ? 1.5 : ctx.S.hero.style === "defense" ? 0.6 : 1;
        let atkMult = styleMult;
        if (p.atkBuff) atkMult *= p.atkBuff;
        if (p.atkDebuff) atkMult *= p.atkDebuff;
        for (let i = 0; i < (p.multiHit || 1); i++) {
          setTimeout(() => {
            if (!runState) return;
            const curActive = runState.monsters.filter((m) => m.hp > 0 && m.x <= 200 + m.idx * 45 + 2);
            if (curActive.length === 0) return;
            let tMob = null;
            if (runState.focusTarget !== null && runState.monsters[runState.focusTarget] && runState.monsters[runState.focusTarget].hp > 0 && runState.monsters[runState.focusTarget].x <= 200 + runState.focusTarget * 45 + 2) {
              tMob = runState.monsters[runState.focusTarget];
            } else {
              tMob = curActive[Math.floor(Math.random() * curActive.length)];
            }
            const mobEl = $id("hmob-" + tMob.idx);
            p.combo = (p.combo || 0) + 1;
            let isCrit = Math.random() < p.crit;
            let currentCritDmg = p.critDmg;
            if (passEq && pSkill[passEq] && pSkill[passEq].type === "combo_master" && p.combo % pSkill[passEq].val === 0) {
              isCrit = true;
              if (p.id === "naoyaSlime") currentCritDmg = 3;
            }
            let dmgBase = Math.max(1, Math.floor(p.atk * atkMult * (0.8 + Math.random() * 0.4)));
            if (p.armorPen > 0) dmgBase = Math.floor(dmgBase * (1 + p.armorPen));
            if (passEq && pSkill[passEq]) {
              const ps = pSkill[passEq];
              if (ps.type === "first_strike" && !tMob["fs_" + p.id]) {
                dmgBase *= ps.val;
                tMob["fs_" + p.id] = true;
              }
            }
            let dmg = isCrit ? Math.floor(dmgBase * currentCritDmg) : dmgBase;
            if (passEq && pSkill[passEq] && pSkill[passEq].type === "splash_dmg") {
              dmg = Math.floor(dmg * (1 + pSkill[passEq].val));
            }
            if (passEq && pSkill[passEq] && pSkill[passEq].type === "execute") {
              const threshold = p.id === "naoyaSlime" ? pSkill[passEq].val : 0.2;
              const chance = p.id === "naoyaSlime" ? 1 : pSkill[passEq].val;
              if (tMob.hp / tMob.maxHp <= threshold && Math.random() < chance) {
                dmg = tMob.hp;
                if (mobEl) setTimeout(() => showFloatDamage("EXECUTE", mobEl, "#ff0000"), 150);
              }
            }
            if (passEq && pSkill[passEq] && pSkill[passEq].type === "scavenger") {
              if (p.hp >= p.maxHp && Math.random() < pSkill[passEq].val) {
                ctx.S.hero.gold++;
                showFloatDamage("+1G", pEl, "#ffca28");
              }
            }
            if (passEq && pSkill[passEq] && pSkill[passEq].type === "initial_burst" && runState.waveTime <= 3) {
              dmg = Math.floor(dmg * pSkill[passEq].val);
            }
            const doDamage = () => {
              tMob.hp -= dmg;
              if (p.lifesteal > 0) {
                const heal = Math.floor(dmg * p.lifesteal);
                if (heal > 0) {
                  p.hp = Math.min(p.maxHp, p.hp + heal);
                  setTimeout(() => showFloatDamage("+" + heal, pEl, "#a4dc8c"), 150);
                  const hpPet = $id("hp-pet-" + pIdx);
                  if (hpPet) setTimeout(() => {
                    hpPet.style.width = p.hp / p.maxHp * 100 + "%";
                  }, 150);
                }
              }
            };
            doDamage();
            if (pEl) {
              pEl.classList.remove("idle");
              pEl.classList.add("attack");
              setTimeout(() => {
                pEl.classList.remove("attack");
                pEl.classList.add("idle");
              }, 300);
            }
            if (mobEl) {
              setTimeout(() => {
                mobEl.classList.remove("idle");
                mobEl.classList.add("hurt");
                setTimeout(() => {
                  mobEl.classList.remove("hurt");
                  mobEl.classList.add("idle");
                }, 200);
              }, 150);
            }
            spawnAttackEffect(p.id, pEl, mobEl, false, isCrit);
            if (mobEl) setTimeout(() => showFloatDamage("-" + dmg, mobEl, isCrit ? "#f2c231" : null), 150);
          }, i * 200);
        }
      }
    });
    activeMonsters.forEach((m) => {
      const hpMob = $id("hp-mob-" + m.idx);
      if (hpMob) hpMob.style.width = Math.max(0, m.hp / m.maxHp * 100) + "%";
      const cdMob = $id("cd-mob-" + m.idx);
      if (cdMob) cdMob.style.width = Math.min(100, Math.max(0, (m.maxCd - m.cd) / m.maxCd * 100)) + "%";
      if (m.atkDebuffTimer > 0) {
        m.atkDebuffTimer -= dt / 1e3;
        if (m.atkDebuffTimer <= 0) m.atkDebuff = null;
      }
      if (m.spdDebuffTimer > 0) {
        m.spdDebuffTimer -= dt / 1e3;
        if (m.spdDebuffTimer <= 0) m.spdDebuff = null;
      }
      if (m.blindCd > 0) {
        m.blindCd -= dt / 1e3;
      }
      if (m.stunCd && m.stunCd > 0) {
        m.stunCd -= dt / 1e3;
      } else {
        let mSpdMult = 1;
        if (m.spdDebuff) mSpdMult *= m.spdDebuff;
        m.cd -= dt / 1e3 * mSpdMult;
        if (m.cd <= 0) {
          m.cd = m.maxCd;
          let validTargets = alivePets.filter((p) => {
            const data = ctx.S.hero.roster[p.id] || {};
            const pSkill = PET_SKILLS[p.id];
            return !(data.passive_eq && pSkill && pSkill[data.passive_eq] && pSkill[data.passive_eq].type === "stealth");
          });
          if (validTargets.length === 0) validTargets = alivePets;
          const target = validTargets[Math.floor(Math.random() * validTargets.length)];
          const mult = ctx.S.hero.style === "attack" ? 1.5 : ctx.S.hero.style === "defense" ? 0.6 : 1;
          let isDodge = Math.random() < target.dodge || m.blindCd > 0;
          const pIdx = runState.pets.indexOf(target);
          const pEl = $id("hpet-" + pIdx);
          const mEl = $id("hmob-" + m.idx);
          spawnAttackEffect("monster", mEl, pEl, true, false);
          if (mEl) {
            mEl.classList.remove("idle");
            mEl.classList.add("attack");
            setTimeout(() => {
              mEl.classList.remove("attack");
              mEl.classList.add("idle");
            }, 300);
          }
          if (!isDodge) {
            let mAtkMult = mult;
            if (m.atkDebuff) mAtkMult *= m.atkDebuff;
            let dmg = Math.max(1, Math.floor(m.atk * mAtkMult * (0.8 + Math.random() * 0.4)));
            if (target.dmgResist > 0) dmg = Math.floor(dmg * (1 - target.dmgResist));
            if (runState.waveTime <= 2 && ctx.S.hero.roster[target.id]?.passive_eq) {
              const pSkill = PET_SKILLS[target.id];
              const pEq = ctx.S.hero.roster[target.id].passive_eq;
              if (pSkill && pSkill[pEq] && pSkill[pEq].type === "invincible_start") dmg = 0;
            }
            if (target.absorbCharge > 0) {
              target.absorbCharge--;
              if (pEl) setTimeout(() => showFloatDamage("ABSORBED", pEl, "#e040fb"), 150);
              dmg = 0;
            }
            if (dmg > 0 && target.reflect > 0) {
              const refDmg = Math.floor(dmg * target.reflect);
              m.hp -= refDmg;
              if (mEl) setTimeout(() => showFloatDamage("-" + refDmg, mEl, "#e06578"), 150);
            }
            if (target.shield && target.shield > 0) {
              if (target.shield >= dmg) {
                target.shield -= dmg;
                dmg = 0;
                if (pEl) setTimeout(() => showFloatDamage("BLOCK", pEl, "#aaddff"), 150);
              } else {
                dmg -= target.shield;
                target.shield = 0;
              }
            }
            target.hp -= dmg;
            if (target.hp <= 0 && target.cheatDeath > 0) {
              target.cheatDeath--;
              target.hp = 1;
              if (pEl) setTimeout(() => showFloatDamage("CHEAT DEATH", pEl, "#ffd94d"), 150);
            } else if (target.hp < 0) {
              target.hp = 0;
            }
            if (dmg > 0) {
              if (pEl) setTimeout(() => showFloatDamage("-" + dmg, pEl), 150);
            } else if (dmg === 0 && !target.absorbCharge && !target.shield) {
              if (pEl) setTimeout(() => showFloatDamage("BLOCK", pEl, "#aaddff"), 150);
            }
            if (pEl && target.hp <= 0) setTimeout(() => {
              pEl.style.opacity = "0.3";
            }, 150);
            const hpPet = $id("hp-pet-" + pIdx);
            if (hpPet) setTimeout(() => {
              hpPet.style.width = target.hp / target.maxHp * 100 + "%";
            }, 150);
          } else {
            if (pEl) setTimeout(() => showFloatDamage("MISS", pEl, "#aaddff"), 150);
          }
        }
      }
    });
  }
  updateHeroStats();
}
function showFloatDamage(text, target, color = null) {
  if (!target) return;
  const fl = document.createElement("div");
  fl.className = "dmg-float";
  fl.textContent = text;
  if (color) {
    fl.style.color = color;
  } else if (text.toString().startsWith("-") && Math.random() > 0.8) {
    fl.classList.add("crit");
  }
  fl.style.left = Math.random() * 30 - 15 + "px";
  fl.style.bottom = "30px";
  target.appendChild(fl);
  setTimeout(() => fl.remove(), 800);
}
function spawnSkillEffect(startEl, targetEl, skillType) {
  if (!startEl) return;
  const scene2 = startEl.closest(".hero-scene") || document.querySelector(".hero-scene");
  if (!scene2) return;
  const sRect = scene2.getBoundingClientRect();
  const healSkills = ["heal_party", "heal_self"];
  const shieldSkills = ["shield_party", "shield_self", "shield", "absorb"];
  const buffSkills = ["atk_spd_self", "charm", "cd_reduce", "random_buff", "vampiric_buff", "resurrect", "party_speed_buff", "atk_up"];
  const damageSkills = ["slam_dmg", "multi_strike", "thorn_whip", "lightning_strike", "push_back", "soul_reap", "fear", "stun_bolt", "dispel", "hellfire", "star_fall", "blind", "sugar_rush", "snowball_roll", "coin_toss", "random_dmg", "slow"];
  if (healSkills.includes(skillType)) {
    if (!targetEl) return;
    const fx = document.createElement("div");
    fx.className = "fx-heal";
    fx.innerHTML = spriteSVG("healFx", 32);
    scene2.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = tRect.left - sRect.left + tRect.width / 2 - 16 + "px";
    fx.style.top = tRect.top - sRect.top + tRect.height / 2 - 16 + "px";
    setTimeout(() => fx.remove(), 1e3);
  } else if (shieldSkills.includes(skillType)) {
    if (!targetEl) return;
    const fx = document.createElement("div");
    fx.className = "fx-shield";
    fx.innerHTML = spriteSVG("shieldFx", 48);
    fx.style.position = "absolute";
    fx.style.pointerEvents = "none";
    scene2.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = tRect.left - sRect.left + tRect.width / 2 - 24 + "px";
    fx.style.top = tRect.top - sRect.top + tRect.height / 2 - 24 + "px";
    setTimeout(() => fx.remove(), 2e3);
  } else if (buffSkills.includes(skillType)) {
    if (!targetEl) return;
    const fx = document.createElement("div");
    fx.className = "fx-buff";
    let buffSprite = "holyLight";
    if (skillType === "charm") buffSprite = "heartFx";
    if (skillType === "vampiric_buff") buffSprite = "bloodFx";
    fx.innerHTML = spriteSVG(buffSprite, 48);
    scene2.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = tRect.left - sRect.left + tRect.width / 2 - 24 + "px";
    fx.style.top = tRect.top - sRect.top + tRect.height / 2 - 24 + "px";
    setTimeout(() => fx.remove(), 800);
  } else if (skillType === "laser") {
    if (!targetEl) return;
    const tRect = targetEl.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const sx = startRect.left - sRect.left + startRect.width / 2;
    const sy = startRect.top - sRect.top + startRect.height / 2;
    const ex = tRect.left - sRect.left + tRect.width / 2;
    const ey = tRect.top - sRect.top + tRect.height / 2;
    const dist = Math.hypot(ex - sx, ey - sy);
    const angle = Math.atan2(ey - sy, ex - sx);
    const fx = document.createElement("div");
    fx.className = "laser-beam";
    fx.style.width = dist + "px";
    fx.style.left = sx + "px";
    fx.style.top = sy + "px";
    fx.style.transform = `rotate(${angle}rad)`;
    scene2.appendChild(fx);
    setTimeout(() => fx.remove(), 300);
  } else if (damageSkills.includes(skillType)) {
    if (!targetEl) return;
    const dmgSpriteMap = {
      slam_dmg: "smashFx",
      multi_strike: "slashFx",
      thorn_whip: "leafBolt",
      lightning_strike: "lightning",
      push_back: "biteFx",
      soul_reap: "scytheFx",
      fear: "skullFx",
      stun_bolt: "stunFx",
      hellfire: "fireball",
      star_fall: "starBolt",
      snowball_roll: "snowball",
      coin_toss: "coin",
      random_dmg: "fireball",
      dispel: "dispelFx",
      blind: "blindFx",
      sugar_rush: "sugarFx",
      slow: "coldBreath"
    };
    const fx = document.createElement("div");
    fx.className = "fx-impact";
    fx.innerHTML = spriteSVG(dmgSpriteMap[skillType] || "fireball", 64);
    scene2.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = tRect.left - sRect.left + tRect.width / 2 - 32 + "px";
    fx.style.top = tRect.top - sRect.top + tRect.height / 2 - 32 + "px";
    setTimeout(() => fx.remove(), 250);
  }
}
function spawnAttackEffect(pId, startEl, targetEl, isEnemy, isCrit) {
  if (!startEl || !targetEl) return;
  const scene2 = startEl.closest(".hero-scene") || document.querySelector(".hero-scene");
  if (!scene2) return;
  const sRect = scene2.getBoundingClientRect();
  const startRect = startEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  const sx = startRect.left - sRect.left + startRect.width / 2;
  const sy = startRect.top - sRect.top + startRect.height / 2;
  const ex = targetRect.left - sRect.left + targetRect.width / 2;
  const ey = targetRect.top - sRect.top + targetRect.height / 2;
  let animType = "projectile";
  let spriteId = "fireball";
  if (isEnemy) {
    animType = "projectile";
    spriteId = "fireball";
  } else {
    const meleeSlash = ["octo", "ghostBlob", "impBlob", "naoyaSlime"];
    const meleeSmash = ["slime", "octoCream"];
    const meleeBite = ["slimePink"];
    if (meleeSlash.includes(pId)) {
      animType = "slash";
      spriteId = "slashFx";
    } else if (meleeSmash.includes(pId)) {
      animType = "impact";
      spriteId = "smashFx";
    } else if (meleeBite.includes(pId)) {
      animType = "impact";
      spriteId = "biteFx";
    } else if (pId === "jellyfish") {
      animType = "projectile";
      spriteId = Math.random() > 0.5 ? "iceball" : "lightning";
    } else if (pId === "dewSprout") {
      animType = "projectile";
      spriteId = "leafBolt";
    } else if (pId === "peach_soda") {
      animType = "projectile";
      spriteId = "waterball";
    } else if (pId === "starBell") {
      animType = "projectile";
      spriteId = "starBolt";
    } else if (pId === "angelBlob") {
      animType = "projectile";
      spriteId = "holyLight";
    } else if (pId === "cloudMallow") {
      animType = "projectile";
      spriteId = "lightning";
    } else if (pId === "penguin") {
      animType = "projectile";
      spriteId = "snowball";
    } else if (pId === "mystery_blob") {
      animType = "projectile";
      spriteId = "shadowBolt";
    } else if (pId === "prismBlob") {
      animType = "projectile";
      spriteId = "rainbowBolt";
    } else if (pId === "hero") {
      animType = "projectile";
      spriteId = "arrow";
    } else {
      animType = "projectile";
      spriteId = "fireball";
    }
  }
  if (animType === "projectile") {
    const proj = document.createElement("div");
    proj.className = "dg-projectile";
    proj.innerHTML = isEnemy ? '<div style="width:8px;height:8px;background:#e06578;border-radius:50%;box-shadow:0 0 5px #ff0000;"></div>' : spriteSVG(spriteId, 16);
    scene2.appendChild(proj);
    proj.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
    const duration = 150;
    proj.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    setTimeout(() => {
      proj.style.transform = `translate3d(${ex}px, ${ey}px, 0)`;
    }, 10);
    setTimeout(() => proj.remove(), duration + 10);
  } else {
    const fx = document.createElement("div");
    fx.className = animType === "slash" ? "fx-slash" : "fx-impact";
    fx.innerHTML = spriteSVG(spriteId, 32);
    scene2.appendChild(fx);
    fx.style.left = ex + "px";
    fx.style.top = ey + "px";
    setTimeout(() => fx.remove(), animType === "slash" ? 200 : 250);
  }
}
function showFloatDrop(icon, target) {
  if (!target) return;
  const fl = document.createElement("div");
  fl.className = "dmg-float drop";
  fl.innerHTML = "+1 " + spriteSVG(icon, 16);
  fl.style.left = Math.random() * 20 + "px";
  fl.style.bottom = "40px";
  target.appendChild(fl);
  setTimeout(() => fl.remove(), 1200);
}
function renderHeroUI() {
  if (!runState) return;
  const container = $id("hero-party");
  if (container) {
    const extraStyle = ctx.S.hero.style === "defense" ? "filter: drop-shadow(0 0 4px #4da6ff);" : "";
    container.innerHTML = runState.pets.map(
      (p, i) => `<div class="hero-pet idle" id="hpet-${i}" style="z-index:${10 - i}; ${extraStyle} opacity: ${p.hp > 0 ? 1 : 0.3}">
         <div class="hp-bar-mini"><div class="hp-fill-mini" id="hp-pet-${i}" style="width:${p.hp / p.maxHp * 100}%"></div></div>
         <div class="hero-bars-container">
           <div class="hero-bar-row"><div class="hero-bar-fill fill-cd" id="cd-pet-${i}" style="width:0%"></div></div>
           ${p.skillMaxCd > 0 ? `<div class="hero-bar-row"><div class="hero-bar-fill fill-sk" id="sk-pet-${i}" style="width:0%"></div></div>` : ""}
         </div>
         ${petSVG(p.id, 32)}
       </div>`
    ).join("");
  }
  updateHeroStats();
}
function updateHeroStats() {
  const lvEl = $id("hero-level");
  const goldEl = $id("hero-gold");
  if (lvEl && runState) lvEl.textContent = runState.stage;
  if (goldEl) goldEl.textContent = ctx.S.hero.gold;
}
function onHeroDown(e) {
  if (!e.isPrimary || e.pointerType === "mouse" && e.button !== 0) return;
  const bar = $id("hero-bar");
  if (!e.target.closest(".hero-drag")) return;
  bar.setPointerCapture(e.pointerId);
  hGesture = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: bar.offsetLeft, oy: bar.offsetTop, moved: false };
}
function onHeroMove(e) {
  if (!hGesture || e.pointerId !== hGesture.id) return;
  const rawDx = e.clientX - hGesture.sx;
  const rawDy = e.clientY - hGesture.sy;
  if (!hGesture.moved && (Math.abs(rawDx) > 4 || Math.abs(rawDy) > 4)) {
    hGesture.moved = true;
  }
  if (hGesture.moved) {
    const bar = $id("hero-bar");
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = bar.getBoundingClientRect();
    let x = hGesture.ox + rawDx;
    let y = hGesture.oy + rawDy;
    x = Math.max(0, Math.min(x, vw - rect.width));
    y = Math.max(0, Math.min(y, vh - rect.height));
    bar.style.left = x + "px";
    bar.style.top = y + "px";
    bar.style.right = "auto";
    bar.style.bottom = "auto";
  }
}
function onHeroUp(e) {
  if (!hGesture || e.pointerId !== hGesture.id) return;
  const bar = $id("hero-bar");
  try {
    bar.releasePointerCapture(e.pointerId);
  } catch (er) {
  }
  if (!hGesture.moved) {
    bar.classList.toggle("minimized");
    ctx.S.hero.minimized = bar.classList.contains("minimized");
    save();
  } else {
    const vw = window.innerWidth, vh = window.innerHeight;
    let newFx = bar.offsetLeft / vw;
    let newFy = bar.offsetTop / vh;
    if (!isNaN(newFx)) ctx.S.hero.fx = Math.min(Math.max(newFx, 0), 1);
    if (!isNaN(newFy)) ctx.S.hero.fy = Math.min(Math.max(newFy, 0), 1);
    save();
  }
  hGesture = null;
}
function placeHeroBar() {
  if (!ctx.S.hero) return;
  const bar = $id("hero-bar");
  if (!bar) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  let fx = ctx.S.hero.fx;
  let fy = ctx.S.hero.fy;
  if (typeof fx !== "number" || isNaN(fx)) fx = 0.5;
  if (typeof fy !== "number" || isNaN(fy)) fy = 0.9;
  const w = bar.offsetWidth || 320;
  const h = bar.offsetHeight || 60;
  let scale = 1;
  const padding = 10;
  if (vw < w + padding * 2) {
    scale = (vw - padding * 2) / w;
  }
  const scaledW = w * scale;
  const scaledH = h * scale;
  const x = Math.min(Math.max(fx * vw, 0), vw - scaledW);
  const y = Math.min(Math.max(fy * vh, 0), vh - scaledH);
  bar.style.transformOrigin = "top left";
  bar.style.transform = `scale(${scale})`;
  bar.style.left = x + "px";
  bar.style.top = y + "px";
  bar.style.right = "auto";
  bar.style.bottom = "auto";
  if (ctx.S.hero.minimized) {
    bar.classList.add("minimized");
  } else {
    bar.classList.remove("minimized");
  }
}
function initHero() {
  const bar = $id("hero-bar");
  if (bar) {
    bar.addEventListener("pointerdown", onHeroDown);
    window.addEventListener("pointermove", onHeroMove);
    window.addEventListener("pointerup", onHeroUp);
    window.addEventListener("resize", placeHeroBar);
    const closeBtn = $id("hero-close");
    if (closeBtn) closeBtn.addEventListener("click", closeHeroMode);
    const cashOutBtn = $id("hero-cashout");
    if (cashOutBtn) cashOutBtn.addEventListener("click", cashOutHero);
  }
}
function playNaoyaCutscene(attacker, attackerEl, targetEls, onComplete) {
  if (!attackerEl || !targetEls) return onComplete && onComplete();
  const targets = Array.isArray(targetEls) ? targetEls : [targetEls];
  if (targets.length === 0) return onComplete && onComplete();
  const scene2 = targets[0].closest(".hero-scene") || targets[0].closest("#dg-arena");
  if (!scene2) return onComplete && onComplete();
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:absolute; inset:0; z-index:20; opacity:0; transition:opacity 0.3s; background:radial-gradient(circle, transparent 20%, rgba(50,0,0,0.7) 100%); backdrop-filter:grayscale(1) contrast(1.2);";
  const topBar = document.createElement("div");
  const botBar = document.createElement("div");
  const barStyle = "position:absolute; left:0; right:0; height:18%; background:#000; z-index:21; transition:transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);";
  topBar.style.cssText = barStyle + "top:0; transform:translateY(-100%);";
  botBar.style.cssText = barStyle + "bottom:0; transform:translateY(100%);";
  scene2.appendChild(overlay);
  scene2.appendChild(topBar);
  scene2.appendChild(botBar);
  setTimeout(() => {
    overlay.style.opacity = "1";
    topBar.style.transform = "translateY(0)";
    botBar.style.transform = "translateY(0)";
  }, 10);
  const origTransform = attackerEl.style.transform;
  const oldAz = attackerEl.style.zIndex;
  attackerEl.style.zIndex = "25";
  const targetOriginals = targets.map((tEl) => ({
    el: tEl,
    origTransform: tEl.style.transform,
    oldTz: tEl.style.zIndex
  }));
  targetOriginals.forEach((t) => t.el.style.zIndex = "22");
  const sRect = scene2.getBoundingClientRect();
  const targetCoords = targets.map((tEl) => {
    const tRect = tEl.getBoundingClientRect();
    return {
      tx: tRect.left - sRect.left + tRect.width / 2,
      ty: tRect.top - sRect.top + tRect.height / 2
    };
  });
  let frame = 0;
  const maxFrames = 24;
  attackerEl.style.transition = "none";
  const interval = setInterval(() => {
    frame++;
    const randIdx = Math.floor(Math.random() * targetCoords.length);
    const { tx, ty } = targetCoords[randIdx];
    const currentTargetEl = targets[randIdx];
    const origT = targetOriginals[randIdx].origTransform;
    const angle = Math.random() * Math.PI * 2;
    const radius = 25 + Math.random() * 40;
    const px = tx + Math.cos(angle) * radius - 16;
    const py = ty + Math.sin(angle) * radius - 16;
    attackerEl.style.transform = `translate3d(${px}px, ${py}px, 0) scale(1.3) skewX(${(Math.random() - 0.5) * 30}deg)`;
    const ghost = attackerEl.cloneNode(true);
    ghost.className = "projection-ghost";
    ghost.style.position = "absolute";
    ghost.style.zIndex = "24";
    ghost.style.opacity = "0.6";
    ghost.style.filter = "grayscale(1) brightness(1.5)";
    ghost.style.pointerEvents = "none";
    scene2.appendChild(ghost);
    setTimeout(() => ghost.remove(), 100);
    currentTargetEl.style.transform = origT + ` translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
    if (frame >= maxFrames) {
      clearInterval(interval);
      const boom = document.createElement("div");
      boom.style.cssText = `position:absolute; left:${tx}px; top:${ty}px; width:0; height:0; background:#fff; box-shadow:0 0 100px 50px #fff; border-radius:50%; z-index:26; transform:translate(-50%, -50%); transition:width 0.1s, height 0.1s, opacity 0.3s; opacity:1;`;
      scene2.appendChild(boom);
      setTimeout(() => {
        boom.style.width = "200px";
        boom.style.height = "200px";
        boom.style.opacity = "0";
      }, 10);
      setTimeout(() => boom.remove(), 350);
      overlay.style.opacity = "0";
      topBar.style.transform = "translateY(-100%)";
      botBar.style.transform = "translateY(100%)";
      setTimeout(() => {
        overlay.remove();
        topBar.remove();
        botBar.remove();
      }, 300);
      attackerEl.style.transition = "transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1)";
      attackerEl.style.transform = origTransform;
      targetOriginals.forEach((t) => {
        t.el.style.transform = t.origTransform;
      });
      setTimeout(() => {
        attackerEl.style.zIndex = oldAz;
        targetOriginals.forEach((t) => {
          t.el.style.zIndex = t.oldTz;
        });
      }, 300);
      if (onComplete) onComplete();
    }
  }, 40);
}
var heroLoop, lastTick, PET_SKILLS, PET_STATS, runState, hToastTimer, hGesture;
var init_hero = __esm({
  "src/hero.js"() {
    init_store();
    init_all();
    init_graphics();
    init_data();
    init_state();
    init_shop();
    heroLoop = null;
    lastTick = 0;
    PET_SKILLS = {
      slime: {
        a1: { name: "T\u1EF1 Ch\u1EEFa L\xE0nh", type: "heal_self", val: 0.2, cd: 4, duration: 0, desc: "H\u1ED3i 20% Max HP b\u1EA3n th\xE2n" },
        a2: { name: "\u0110\xE2m S\u1EA7m", type: "slam_dmg", val: 3, cd: 5, duration: 0, desc: "G\xE2y x3 ATK" },
        p1: { name: "Th\u1EC3 Ch\u1EA5t Slime", type: "max_hp_party", val: 0.25, desc: "T\u0103ng 25% Max HP to\xE0n \u0111\u1ED9i" },
        p2: { name: "T\xE1i Sinh", type: "hp_regen", val: 0.02, desc: "T\u1EF1 h\u1ED3i 2% Max HP m\u1ED7i gi\xE2y" }
      },
      octo: {
        a1: { name: "\u0110\xF2n Roi X\xFAc Tu", type: "multi_strike", val: 3, cd: 6, duration: 1, desc: "Tung 3 \u0111\xF2n li\xEAn ti\u1EBFp ngay l\u1EADp t\u1EE9c" },
        a2: { name: "B\u01A1m M\u1EF1c", type: "atk_spd_self", val: 2, cd: 8, duration: 3, desc: "T\u1EF1 buff x2 T\u1ED1c \u0110\xE1nh trong 3s" },
        p1: { name: "S\u1EE9c M\u1EA1nh M\u1EC1m", type: "atk_up", val: 0.4, desc: "T\u0103ng 40% ATK b\u1EA3n th\xE2n" },
        p2: { name: "Ph\u1EE7 \u0110\u1EA7u", type: "first_strike", val: 5, desc: "\u0110\xF2n \u0111\xE1nh \u0111\u1EA7u m\u1ED7i qu\xE1i x5 S\xE1t th\u01B0\u01A1ng" }
      },
      slimePink: {
        a1: { name: "M\u01B0a D\xE2u T\xE2y", type: "heal_party", val: 0.15, cd: 4, duration: 0, desc: "H\u1ED3i 15% Max HP cho to\xE0n \u0111\u1ED9i" },
        a2: { name: "M\xF9i H\u01B0\u01A1ng", type: "charm", val: 0.5, cd: 8, duration: 3, desc: "Gi\u1EA3m 50% ATK c\u1EE7a qu\xE1i trong 3s" },
        p1: { name: "C\u1EAFn Ng\u1ECDt", type: "lifesteal", val: 0.3, desc: "H\xFAt m\xE1u 30% s\xE1t th\u01B0\u01A1ng g\xE2y ra" },
        p2: { name: "L\u1EDBp K\u1EB9o D\u1EBBo", type: "dmg_reduction", val: 0.2, desc: "Gi\u1EA3m 20% m\u1ECDi s\xE1t th\u01B0\u01A1ng nh\u1EADn v\xE0o" }
      },
      octoCream: {
        a1: { name: "Kem Khi\xEAn", type: "shield_self", val: 0.25, cd: 8, duration: 0, desc: "T\u1EA1o Khi\xEAn 25% Max HP cho b\u1EA3n th\xE2n" },
        a2: { name: "H\u01A1i L\u1EA1nh", type: "slow", val: 0.5, cd: 7, duration: 3, desc: "Gi\u1EA3m 50% T\u1ED1c \u0111\xE1nh c\u1EE7a qu\xE1i" },
        p1: { name: "\u0110\xE1 B\xE0o", type: "reflect", val: 0.4, desc: "Ph\u1EA3n l\u1EA1i 40% s\xE1t th\u01B0\u01A1ng" },
        p2: { name: "N\xE9 Tr\xE1nh", type: "dodge", val: 0.3, desc: "T\u1EC9 l\u1EC7 n\xE9 30%" }
      },
      dewSprout: {
        a1: { name: "\u0110\xF2n Qu\u1EA5t Gai", type: "thorn_whip", val: 2, cd: 5, duration: 0, desc: "G\xE2y x2 ATK & t\u1EF1 h\u1ED3i m\xE1u" },
        a2: { name: "Ph\u1EA5n Hoa", type: "cd_reduce", val: 1, cd: 6, duration: 0, desc: "Gi\u1EA3m 1s CD ch\u1EE7 \u0111\u1ED9ng cho to\xE0n \u0111\u1ED9i" },
        p1: { name: "R\u1EC5 B\xE1m", type: "atk_speed", val: 0.5, desc: "T\u1ED1c \u0111\xE1nh b\u1EA3n th\xE2n x1.5" },
        p2: { name: "C\u01A1n Gi\xF3 M\xE1t", type: "party_speed", val: 0.15, desc: "T\u0103ng 15% t\u1ED1c \u0111\xE1nh to\xE0n \u0111\u1ED9i" }
      },
      cloudMallow: {
        a1: { name: "S\xE9t \u0110\xE1nh", type: "lightning_strike", val: 4, cd: 6, duration: 0, desc: "G\xE2y x4 ATK b\u1ECF qua gi\xE1p" },
        a2: { name: "\u0110\u1EA9y L\xF9i", type: "push_back", val: 0, cd: 5, duration: 0, desc: "\u0110\u1EA9y l\xF9i qu\xE1i, ng\u1EAFt nh\u1ECBp \u0111\xE1nh" },
        p1: { name: "L\u1EDBp B\u1ED3ng B\u1EC1nh", type: "party_dodge", val: 0.15, desc: "T\u0103ng 15% n\xE9 tr\xE1nh cho \u0111\u1ED9i" },
        p2: { name: "L\u01A1 L\u1EEDng", type: "invincible_start", val: 2, desc: "Mi\u1EC5n nhi\u1EC5m s\xE1t th\u01B0\u01A1ng 2s \u0111\u1EA7u Wave" }
      },
      ghostBlob: {
        a1: { name: "R\xFAt H\u1ED3n", type: "soul_reap", val: 0.1, cd: 5, duration: 0, desc: "G\xE2y s\xE1t th\u01B0\u01A1ng 10% HP hi\u1EC7n t\u1EA1i qu\xE1i" },
        a2: { name: "D\u1ECDa Ma", type: "fear", val: 2, cd: 7, duration: 2, desc: "Ho\u1EA3ng s\u1EE3 (Cho\xE1ng c\u1EE9ng) qu\xE1i trong 2s" },
        p1: { name: "\xC1m Kh\xED", type: "armor_pen", val: 0.5, desc: "Xuy\xEAn Gi\xE1p: T\u0103ng 50% s\xE1t th\u01B0\u01A1ng" },
        p2: { name: "V\xF4 H\xECnh", type: "stealth", val: 1, desc: "Qu\xE1i kh\xF4ng nh\u1EAFm \u0111\xE1nh b\xE9 tr\u01B0\u1EDBc" }
      },
      mystery_blob: {
        a1: { name: "S\xE1t Th\u01B0\u01A1ng Ng\u1EABu Nhi\xEAn", type: "random_dmg", val: 5, cd: 4, duration: 0, desc: "G\xE2y ng\u1EABu nhi\xEAn t\u1EEB x1 \u0111\u1EBFn x5 ATK" },
        a2: { name: "Ph\xE9p B\u1ED5 Tr\u1EE3 D\u1ECB Th\u01B0\u1EDDng", type: "random_buff", val: 2, cd: 6, duration: 4, desc: "Buff x2 m\u1ED9t ch\u1EC9 s\u1ED1 ng\u1EABu nhi\xEAn" },
        p1: { name: "Ch\xED M\u1EA1ng B\u1EA5t Ng\u1EDD", type: "crit_rate", val: 0.35, desc: "T\u1EC9 l\u1EC7 B\u1EA1o k\xEDch +35%" },
        p2: { name: "Aura L\u1EDDi Nguy\u1EC1n", type: "curse_aura", val: 0.05, desc: "5% qu\xE1i t\u1EF1 m\u1EA5t 5% HP m\u1ED7i gi\xE2y" }
      },
      jellyfish: {
        a1: { name: "Gi\u1EADt C\u1EA5p \u0110i\u1EC7n", type: "stun_bolt", val: 2, cd: 8, duration: 2, desc: "G\xE2y cho\xE1ng qu\xE1i 2s" },
        a2: { name: "S\xF3ng \xC2m X\xF3a S\u1ED5", type: "dispel", val: 2, cd: 10, duration: 0, desc: "G\xE2y x2 ATK & X\xF3a m\u1ECDi buff c\u1EE7a qu\xE1i" },
        p1: { name: "\u0110\xF2n Ch\u1EBFt Ch\xF3c", type: "crit_dmg", val: 3, desc: "S\xE1t th\u01B0\u01A1ng Crit x3" },
        p2: { name: "Bi\u1EC3n C\u1EA3 Ch\xFAc Ph\xFAc", type: "party_crit", val: 0.2, desc: "T\u0103ng 20% T\u1EC9 l\u1EC7 Crit to\xE0n \u0111\u1ED9i" }
      },
      impBlob: {
        a1: { name: "H\u1ECFa Ng\u1EE5c", type: "hellfire", val: 5, cd: 8, duration: 0, desc: "x5 ATK nh\u01B0ng t\u1EF1 tr\u1EEB 20% HP hi\u1EC7n t\u1EA1i" },
        a2: { name: "H\xFAt M\xE1u \u0110\u1ED3ng B\u1ECDn", type: "vampiric_buff", val: 2, cd: 5, duration: 5, desc: "R\xFAt 10% Max HP \u0111\u1ED3ng minh \u0111\u1EC3 t\u1EF1 buff x2 ATK" },
        p1: { name: "Cu\u1ED3ng N\u1ED9 (Berserk)", type: "berserk", val: 0.5, desc: "HP < 50% => x2 ATK & T\u1ED1c \u0110\xE1nh" },
        p2: { name: "\u0110\xF2n K\u1EBFt Li\u1EC5u", type: "execute", val: 0.2, desc: "5% T\u1EC9 l\u1EC7 k\u1EBFt li\u1EC5u ngay qu\xE1i m\xE1u <20%" }
      },
      angelBlob: {
        a1: { name: "G\u1ECDi H\u1ED3n", type: "resurrect", val: 0.3, cd: 15, duration: 0, desc: "H\u1ED3i sinh 1 \u0111\u1ED3ng minh \u0111\xE3 ch\u1EBFt (30% HP)" },
        a2: { name: "Khi\xEAn Th\xE1nh", type: "shield_party", val: 0.15, cd: 10, duration: 0, desc: "T\u1EA1o Khi\xEAn 15% Max HP cho to\xE0n \u0111\u1ED9i" },
        p1: { name: "H\xE0o Quang B\u1EA3o H\u1ED9", type: "party_dmg_resist", val: 0.1, desc: "Gi\u1EA3m 10% s\xE1t th\u01B0\u01A1ng nh\u1EADn v\xE0o to\xE0n \u0111\u1ED9i" },
        p2: { name: "H\u1EA1t Gi\u1ED1ng Sinh M\u1EC7nh", type: "cheat_death", val: 1, desc: "Gi\u1EEF l\u1EA1i 1 HP khi ch\u1EBFt (1 l\u1EA7n/M\xE0n)" }
      },
      prismBlob: {
        a1: { name: "C\u1EAFt Laser", type: "laser", val: 2, cd: 9, duration: 3, desc: "Laser x2 ATK m\u1ED7i gi\xE2y (k\xE9o d\xE0i 3s)" },
        a2: { name: "M\xE1i V\xF2m L\u0103ng K\xEDnh", type: "absorb", val: 1, cd: 6, duration: 0, desc: "H\u1EA5p th\u1EE5 ho\xE0n to\xE0n 1 \u0111\xF2n \u0111\xE1nh c\u1EE7a qu\xE1i" },
        p1: { name: "Th\u1EC3 Ch\u1EA5t Pha L\xEA", type: "hp_to_atk", val: 0.05, desc: "Chuy\u1EC3n 5% Max HP th\xE0nh ATK" },
        p2: { name: "Kh\xE1ng Hi\u1EC7u \u1EE8ng", type: "cc_resist", val: 0.5, desc: "Gi\u1EA3m 50% th\u1EDDi gian b\u1ECB cho\xE1ng" }
      },
      starBell: {
        a1: { name: "Tri\u1EC7u H\u1ED3i Sao B\u0103ng", type: "star_fall", val: 3, cd: 7, duration: 1, desc: "G\xE2y x3 ATK & L\xE0m cho\xE1ng 1s" },
        a2: { name: "Giai \u0110i\u1EC7u Kh\u1EDFi V\u1EADn", type: "party_speed_buff", val: 1.5, cd: 9, duration: 3, desc: "T\u0103ng 50% T\u1ED1c \u0111\xE1nh to\xE0n \u0111\u1ED9i" },
        p1: { name: "B\xE0i Ca S\u1EE9c M\u1EA1nh", type: "atk_party", val: 0.25, desc: "T\u0103ng 25% ATK to\xE0n \u0111\u1ED9i" },
        p2: { name: "B\u1EADc Th\u1EA7y Combo", type: "combo_master", val: 3, desc: "\u0110\xF2n \u0111\xE1nh th\u1EE9 4 ch\u1EAFc ch\u1EAFn Ch\xED m\u1EA1ng" }
      },
      peach_soda: {
        a1: { name: "B\u1ECDt Ga Cay M\u1EAFt", type: "blind", val: 1, cd: 8, duration: 2, desc: "L\xE0m m\xF9 qu\xE1i (\u0111\xE1nh tr\u01B0\u1EE3t 100%)" },
        a2: { name: "\u0110\u01B0\u1EDDng K\xEDch Th\xEDch", type: "sugar_rush", val: 3, cd: 6, duration: 4, desc: "x3 T\u1ED1c \u0111\xE1nh, nh\u01B0ng gi\u1EA3m 50% ATK" },
        p1: { name: "N\u1ED5 T\u1ECFa Tr\xF2n", type: "splash_dmg", val: 0.3, desc: "\u0110\xE1nh th\u01B0\u1EDDng lan 30% s\xE1t th\u01B0\u01A1ng" },
        p2: { name: "N\u0103ng L\u01B0\u1EE3ng \u0110\u1EC9nh Cao", type: "initial_burst", val: 2, desc: "3 gi\xE2y \u0111\u1EA7u m\u1ED7i m\xE0n x2 s\xE1t th\u01B0\u01A1ng" }
      },
      penguin: {
        a1: { name: "B\xF3ng Tuy\u1EBFt Tr\u01B0\u1EE3t", type: "snowball_roll", val: 2, cd: 5, duration: 0, desc: "G\xE2y x2 ATK & \u0111\u1EA9y l\xF9i qu\xE1i" },
        a2: { name: "N\xE9m Ti\u1EC1n", type: "coin_toss", val: 0, cd: 10, duration: 0, desc: "Ti\xEAu 20% V\xE0ng \u0111\xE1nh bay 50% HP qu\xE1i" },
        p1: { name: "M\u1ECF V\xE0ng", type: "gold_drop", val: 2, desc: "Nh\xE2n \u0111\xF4i V\xE0ng r\u1EDBt ra t\u1EEB qu\xE1i" },
        p2: { name: "Nh\u1EB7t Nh\u1EA1nh", type: "scavenger", val: 0.05, desc: "Khi \u0111\u1EA7y m\xE1u, \u0111\xE1nh c\xF3 5% r\u01A1i 1 V\xE0ng" }
      },
      naoyaSlime: {
        a1: { name: "24 Khung H\xECnh", type: "multi_strike", val: 24, cd: 8, duration: 1, desc: "Tung 24 \u0111\xF2n ch\xE9m li\xEAn ti\u1EBFp (M\u1ED7i \u0111\xF2n 50% ATK)" },
        a2: { name: "\u0110\u1EE9ng Tr\xEAn T\u1EA5t C\u1EA3", type: "atk_spd_self", val: 2.4, cd: 12, duration: 3, desc: "Buff x2.4 T\u1ED1c \u0110\xE1nh trong 3s" },
        p1: { name: "Khinh Mi\u1EC7t K\u1EBB Y\u1EBFu", type: "execute", val: 0.24, desc: "T\u1EF1 \u0111\u1ED9ng ki\u1EBFt li\u1EC5u qu\xE1i c\xF3 HP < 24%" },
        p2: { name: "Quy T\u1EAFc Khung H\xECnh", type: "combo_master", val: 4, desc: "C\u1EE9 \u0111\xF2n \u0111\xE1nh th\u1EE9 4 l\xE0 Ch\xED M\u1EA1ng x3 S\xE1t Th\u01B0\u01A1ng" }
      },
      default: {
        a1: { name: "C\u1ED1 G\u1EAFng", type: "atk_up", val: 0.2, cd: 5, duration: 3, desc: "T\u0103ng 20% ATK" },
        p1: { name: "L\u1EA1c Quan", type: "crit_rate", val: 0.2, desc: "T\u1EC9 l\u1EC7 B\u1EA1o k\xEDch +20%" }
      }
    };
    PET_STATS = {
      slime: { baseHp: 150, hpPerLv: 25, baseAtk: 8, atkPerLv: 2, baseSpd: 1 },
      octo: { baseHp: 80, hpPerLv: 15, baseAtk: 15, atkPerLv: 4, baseSpd: 1.5 },
      slimePink: { baseHp: 100, hpPerLv: 18, baseAtk: 12, atkPerLv: 3.5, baseSpd: 1 },
      octoCream: { baseHp: 110, hpPerLv: 20, baseAtk: 9, atkPerLv: 2.5, baseSpd: 1.2 },
      dewSprout: { baseHp: 120, hpPerLv: 22, baseAtk: 11, atkPerLv: 3, baseSpd: 1.2 },
      cloudMallow: { baseHp: 130, hpPerLv: 20, baseAtk: 8, atkPerLv: 2, baseSpd: 0.8 },
      ghostBlob: { baseHp: 70, hpPerLv: 12, baseAtk: 14, atkPerLv: 4, baseSpd: 1.5 },
      mystery_blob: { baseHp: 90, hpPerLv: 15, baseAtk: 16, atkPerLv: 5, baseSpd: 0.6 },
      jellyfish: { baseHp: 80, hpPerLv: 14, baseAtk: 13, atkPerLv: 4.5, baseSpd: 0.8 },
      impBlob: { baseHp: 150, hpPerLv: 24, baseAtk: 15, atkPerLv: 4, baseSpd: 0.6 },
      angelBlob: { baseHp: 120, hpPerLv: 25, baseAtk: 7, atkPerLv: 1.5, baseSpd: 1 },
      prismBlob: { baseHp: 100, hpPerLv: 18, baseAtk: 14, atkPerLv: 4, baseSpd: 0.8 },
      starBell: { baseHp: 100, hpPerLv: 20, baseAtk: 10, atkPerLv: 3, baseSpd: 1 },
      peach_soda: { baseHp: 100, hpPerLv: 20, baseAtk: 11, atkPerLv: 3, baseSpd: 1.2 },
      penguin: { baseHp: 110, hpPerLv: 20, baseAtk: 10, atkPerLv: 2.5, baseSpd: 1 },
      naoyaSlime: { baseHp: 80, hpPerLv: 10, baseAtk: 24, atkPerLv: 6, baseSpd: 2.4 },
      default: { baseHp: 100, hpPerLv: 20, baseAtk: 10, atkPerLv: 3, baseSpd: 1 }
    };
    runState = null;
    hToastTimer = null;
    window.focusMonster = function(idx) {
      if (!runState || !runState.monsters[idx] || runState.monsters[idx].hp <= 0) return;
      runState.focusTarget = idx;
      runState.monsters.forEach((m, i) => {
        const mEl = $id("hmob-" + i);
        if (!mEl) return;
        const isFocused = runState.focusTarget === i;
        const bossStyle = m.isBoss ? "drop-shadow(0 0 5px #ff0000)" : "none";
        mEl.style.filter = isFocused ? "drop-shadow(0 0 8px #ffeb3b)" : bossStyle;
      });
    };
    hGesture = null;
  }
});

// src/dungeon.js
function openDungeonView() {
  isDungeonOpen = true;
  closeWin();
  const dungeonWin = $id("dungeon-win");
  if (dungeonWin) {
    dungeonWin.style.display = "flex";
    placeDungeonWin();
    dungeonWin.classList.remove("open-anim");
    void dungeonWin.offsetWidth;
    dungeonWin.classList.add("open-anim");
  }
  dungeonView.style.display = "flex";
  const closeBtn = $id("dungeon-close");
  if (closeBtn) {
    closeBtn.onclick = () => {
      closeDungeonView();
    };
  }
  if (ctx.S.dungeonSave) {
    dungeonView.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:white;">
                <h2 style="color:#d9ba8a; margin-bottom:20px;">H\u1EA7m Ng\u1EE5c \u0110ang Dang D\u1EDF</h2>
                <div style="margin-bottom:30px; font-size:16px;">B\u1EA1n c\xF3 m\u1ED9t l\u01B0\u1EE3t ch\u01A1i \u0111ang dang d\u1EDF \u1EDF \u1EA2i ${ctx.S.dungeonSave.currentWave}. B\u1EA1n mu\u1ED1n ti\u1EBFp t\u1EE5c hay ch\u01A1i m\u1EDBi?</div>
                <div style="display:flex; gap:20px;">
                    <div class="buy plain" id="dg-load-new" style="background:#e06578; color:white; width:120px; text-align:center; display:flex; justify-content:center; align-items:center; border-color:#c25566; box-shadow:inset 0 -3px 0 #c25566, 0 3px 0 #a34a52;">Ch\u01A1i M\u1EDBi</div>
                    <div class="buy" id="dg-load-continue" style="width:120px; text-align:center; display:flex; justify-content:center; align-items:center;">Ti\u1EBFp T\u1EE5c</div>
                </div>
            </div>
        `;
    $id("dg-load-new").onclick = () => {
      delete ctx.S.dungeonSave;
      save();
      initPlacementPhase();
    };
    $id("dg-load-continue").onclick = () => {
      loadDungeonState(ctx.S.dungeonSave);
    };
  } else {
    initPlacementPhase();
  }
}
function closeDungeonView() {
  if (!isDungeonOpen) return;
  isDungeonOpen = false;
  stopCombatLoop();
  const dragEl = document.getElementById("dg-drag-el");
  if (dragEl) dragEl.remove();
  const dungeonWin = $id("dungeon-win");
  if (dungeonWin) {
    dungeonWin.style.display = "none";
    dungeonWin.classList.remove("open-anim");
  }
  dungeonView.style.display = "none";
  dungeonView.innerHTML = "";
  $id("win").classList.add("open");
  $id("viewToggle").style.display = "";
  applyPageSkin();
  applyViewState();
  renderPager();
  renderPlots();
  renderToolbar();
}
function loadDungeonState(saveData) {
  currentWave = saveData.currentWave;
  totalGold = saveData.totalGold;
  shopGold = saveData.shopGold;
  const best = ctx.S.dungeonBest || { wave: 0, gold: 0 };
  const bestHtml = best.wave > 0 ? `<div style="color:#b08a5c; font-size:12px; text-align:center; margin-top:4px;">\u{1F3C6} K\u1EF7 l\u1EE5c: Wave ${best.wave} \xB7 ${best.gold} G</div>` : "";
  dungeonView.innerHTML = `
        <div class="dg-arena" id="dg-arena">
            <div class="dg-hud" id="dg-hud" style="display:none;"></div>
            <div class="dg-info-panel" id="dg-info-panel" style="display:none;">
                <div class="dg-info-close" id="dg-info-close">\xD7</div>
                <h3>Ch\u1EC9 S\u1ED1 Th\xFA C\u01B0ng</h3>
                <div class="dg-info-list" id="dg-info-list"></div>
            </div>
            <div class="dg-info-panel" id="dg-codex-panel" style="display:none; border-left-color:#e06578;">
                <div class="dg-info-close" id="dg-codex-close">\xD7</div>
                <h3 style="color:#e06578;">T\u1EEB \u0110i\u1EC3n Qu\xE1i</h3>
                <div class="dg-info-list" id="dg-codex-list"></div>
            </div>
        </div>
        <div style="display:flex; justify-content:center; margin-top: 5px; flex-wrap:wrap;">
            <div class="buy plain" id="dg-leave-btn" style="margin-left: 10px; display:none;">Tho\xE1t</div>
            <div class="buy plain" id="dg-surrender-btn" style="margin-left: 10px; background: #e06578; color: white;">K\u1EBFt Th\xFAc S\u1EDBm</div>
        </div>
        ${bestHtml}
    `;
  const leaveBtn = $id("dg-leave-btn");
  if (leaveBtn) leaveBtn.addEventListener("click", closeDungeonView);
  const surrBtn = $id("dg-surrender-btn");
  if (surrBtn) surrBtn.addEventListener("click", () => endDungeon(false));
  $id("dg-info-close").onclick = () => $id("dg-info-panel").style.display = "none";
  $id("dg-codex-close").onclick = () => $id("dg-codex-panel").style.display = "none";
  const arena = $id("dg-arena");
  fullTeam = saveData.fullTeam.map((savedP) => {
    const el = document.createElement("div");
    el.className = "dg-entity pet";
    el.innerHTML = `
            <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
            <div class="dg-cd-bar"><div class="dg-cd-fill" style="width: 0%"></div></div>
            <div class="dg-skill-cd-bar" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
            ${petSVG(savedP.id, 32)}
        `;
    el.style.transform = `translate3d(${savedP.x - 16}px, ${savedP.y - 16}px, 0)`;
    arena.appendChild(el);
    const stat = PET_STATS2[savedP.id] || PET_STATS2.default;
    return {
      ...savedP,
      el,
      type: "pet",
      skill: savedP.skill || stat.skill,
      ai: savedP.ai || stat.ai,
      cd: savedP.cd || 0,
      skillCd: savedP.skillCd || 0,
      maxSkillCd: savedP.maxSkillCd || stat.maxSkillCd || 0
    };
  });
  team = [...fullTeam];
  const isBoss = currentWave % 10 === 0;
  const hud = $id("dg-hud");
  hud.style.display = "block";
  hud.innerHTML = `<span style="color:#ffd94d; font-weight:bold;">Wave ${currentWave}</span>${isBoss ? " \u{1F451}" : ""} <span style="color:#a4dc8c; margin-left:10px;" title="V\xE0ng mang v\u1EC1">${spriteSVG("coin", 12).replace("display:block", "display:inline-block;vertical-align:middle")} ${totalGold}</span> <span style="color:#e06578; margin-left:10px;" title="V\xE0ng n\xE2ng c\u1EA5p">\u{1F6E0} ${shopGold}</span>`;
  showWaveRewards(true);
}
function initPlacementPhase() {
  phase = "placement";
  team = [];
  enemies = [];
  projectiles = [];
  currentWave = 1;
  totalGold = 0;
  shopGold = 0;
  const best = ctx.S.dungeonBest || { wave: 0, gold: 0 };
  const bestHtml = best.wave > 0 ? `<div style="color:#b08a5c; font-size:12px; text-align:center; margin-top:4px;">\u{1F3C6} K\u1EF7 l\u1EE5c: Wave ${best.wave} \xB7 ${best.gold} G</div>` : "";
  dungeonView.innerHTML = `
        <div class="dg-arena" id="dg-arena">
            <div class="dg-hud" id="dg-hud" style="display:none;"></div>
            <div class="dg-info-panel" id="dg-info-panel" style="display:none;">
                <div class="dg-info-close" id="dg-info-close">\xD7</div>
                <h3>Ch\u1EC9 S\u1ED1 Th\xFA C\u01B0ng</h3>
                <div class="dg-info-list" id="dg-info-list"></div>
            </div>
            <div class="dg-info-panel" id="dg-codex-panel" style="display:none; border-left-color:#e06578;">
                <div class="dg-info-close" id="dg-codex-close">\xD7</div>
                <h3 style="color:#e06578;">T\u1EEB \u0110i\u1EC3n Qu\xE1i</h3>
                <div class="dg-info-list" id="dg-codex-list"></div>
            </div>
        </div>
        <div style="display:flex; justify-content:center; margin-top: 5px; flex-wrap:wrap;">
            <div class="buy" id="dg-start-btn">B\u1EAFt \u0110\u1EA7u Tr\u1EADn Chi\u1EBFn</div>
            <div class="buy plain" id="dg-leave-btn" style="margin-left: 10px;">Tho\xE1t</div>
            <div class="buy plain" id="dg-surrender-btn" style="margin-left: 10px; display:none; background: #e06578; color: white;">K\u1EBFt Th\xFAc S\u1EDBm</div>
            <div class="buy plain" id="dg-info-btn" style="margin-left: 10px; width: 32px; padding: 0; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:18px; color:black;" title="Th\xF4ng tin Th\xFA c\u01B0ng">?</div>
            <div class="buy plain" id="dg-codex-btn" style="margin-left: 10px; padding: 0 10px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px; color:#e06578;" title="T\u1EEB \u0111i\u1EC3n qu\xE1i">Qu\xE1i V\u1EADt</div>
        </div>
        ${bestHtml}
        <div class="dg-dock" id="dg-dock"></div>
    `;
  const arena = $id("dg-arena");
  const dock = $id("dg-dock");
  dock.innerHTML = `
        <div id="dg-nav-left" style="font-size: 24px; font-weight: bold; color: #d9ba8a; cursor: pointer; user-select: none; padding: 0 5px; touch-action: manipulation; opacity: 0.3;">\u25C0</div>
        <div style="flex:1; overflow:hidden; height: 100%; display: flex; align-items: center; position: relative;">
            <div id="dg-slots-container" style="display: flex; gap: 10px; transition: transform 0.3s ease; position: absolute; left: 0;"></div>
        </div>
        <div id="dg-nav-right" style="font-size: 24px; font-weight: bold; color: #d9ba8a; cursor: pointer; user-select: none; padding: 0 5px; touch-action: manipulation;">\u25B6</div>
    `;
  const slotsContainer = $id("dg-slots-container");
  const navLeft = $id("dg-nav-left");
  const navRight = $id("dg-nav-right");
  const dockWrapper = navLeft.nextElementSibling;
  let dockPage = 0;
  function updateDockNav() {
    if (!dockWrapper) return;
    const w = dockWrapper.clientWidth || 250;
    const itemsPerPage = Math.max(1, Math.floor(w / 54));
    const maxPage = Math.max(0, Math.ceil(ctx.S.pets.length / itemsPerPage) - 1);
    if (dockPage > maxPage) dockPage = maxPage;
    navLeft.style.opacity = dockPage > 0 ? "1" : "0.3";
    navRight.style.opacity = dockPage < maxPage ? "1" : "0.3";
    const offset = dockPage * itemsPerPage * 54;
    slotsContainer.style.transform = `translateX(-${offset}px)`;
  }
  navLeft.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (dockPage > 0) {
      dockPage--;
      updateDockNav();
    }
  });
  navRight.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const w = dockWrapper.clientWidth || 250;
    const itemsPerPage = Math.max(1, Math.floor(w / 54));
    const maxPage = Math.max(0, Math.ceil(ctx.S.pets.length / itemsPerPage) - 1);
    if (dockPage < maxPage) {
      dockPage++;
      updateDockNav();
    }
  });
  if (window.ResizeObserver) {
    new ResizeObserver(() => updateDockNav()).observe(dockWrapper);
  } else {
    updateDockNav();
  }
  let draggingPet = null;
  let dragEl = null;
  ctx.S.pets.forEach((petId) => {
    const slot = document.createElement("div");
    slot.className = "dg-slot";
    slot.innerHTML = petSVG(petId, 32);
    slot.dataset.pet = petId;
    slot.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (phase !== "placement") return;
      if (team.length >= 4) {
        toast("T\u1ED1i \u0111a 4 th\xE0nh vi\xEAn!");
        return;
      }
      if (slot.classList.contains("placed")) return;
      draggingPet = { id: petId, slot };
      dragEl = document.createElement("div");
      dragEl.id = "dg-drag-el";
      dragEl.className = "dg-entity pet";
      dragEl.style.pointerEvents = "none";
      dragEl.style.position = "fixed";
      dragEl.style.left = "0";
      dragEl.style.top = "0";
      dragEl.style.zIndex = "100000";
      dragEl.innerHTML = petSVG(petId, 32);
      document.body.appendChild(dragEl);
      dragEl.style.transform = `translate3d(${e.clientX - 32}px, ${e.clientY - 32}px, 0)`;
      slot.setPointerCapture(e.pointerId);
    });
    slot.addEventListener("pointermove", (e) => {
      if (!draggingPet || !dragEl) return;
      dragEl.style.transform = `translate3d(${e.clientX - 32}px, ${e.clientY - 32}px, 0)`;
    });
    slot.addEventListener("pointerup", (e) => {
      if (!draggingPet || !dragEl) return;
      const pId = draggingPet.id;
      const currentSlot = draggingPet.slot;
      dragEl.remove();
      dragEl = null;
      draggingPet = null;
      currentSlot.releasePointerCapture(e.pointerId);
      const rect = arena.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        currentSlot.classList.add("placed");
        const stat = PET_STATS2[pId] || PET_STATS2.default;
        const el = document.createElement("div");
        el.className = "dg-entity pet";
        el.innerHTML = `
                    <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
                    <div class="dg-cd-bar"><div class="dg-cd-fill" style="width: 0%"></div></div>
                    <div class="dg-skill-cd-bar" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
                    ${petSVG(pId, 32)}
                `;
        let x = e.clientX - rect.left - 16;
        let y = e.clientY - rect.top - 16;
        if (x > rect.width - 16) x = rect.width - 16;
        if (x < 16) x = 16;
        if (y < 16) y = 16;
        if (y > rect.height - 16) y = rect.height - 16;
        el.style.position = "absolute";
        el.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
        arena.appendChild(el);
        const memberObj = {
          id: pId,
          x,
          y,
          hp: stat.hp,
          maxHp: stat.hp,
          atk: stat.atk,
          range: stat.range,
          speed: stat.speed,
          cd: 0,
          maxCd: stat.cd,
          skillCd: stat.maxSkillCd || 0,
          maxSkillCd: stat.maxSkillCd || 0,
          el,
          type: "pet",
          skill: stat.skill,
          dockSlot: currentSlot
        };
        team.push(memberObj);
        let isPlacedDragging = false;
        el.addEventListener("pointerdown", (ev) => {
          ev.preventDefault();
          if (phase !== "placement") return;
          isPlacedDragging = true;
          el.style.zIndex = "100000";
          const arect = arena.getBoundingClientRect();
          el.style.transform = `translate3d(${ev.clientX - arect.left - 16}px, ${ev.clientY - arect.top - 16}px, 0)`;
          el.setPointerCapture(ev.pointerId);
        });
        el.addEventListener("pointermove", (ev) => {
          if (!isPlacedDragging) return;
          const arect = arena.getBoundingClientRect();
          el.style.transform = `translate3d(${ev.clientX - arect.left - 32}px, ${ev.clientY - arect.top - 32}px, 0)`;
        });
        el.addEventListener("pointerup", (ev) => {
          if (!isPlacedDragging) return;
          isPlacedDragging = false;
          el.releasePointerCapture(ev.pointerId);
          el.style.zIndex = "";
          const arect = arena.getBoundingClientRect();
          if (ev.clientX >= arect.left && ev.clientX <= arect.right && ev.clientY >= arect.top && ev.clientY <= arect.bottom) {
            el.style.position = "absolute";
            let nx = ev.clientX - arect.left - 16;
            let ny = ev.clientY - arect.top - 16;
            if (nx > arect.width - 16) nx = arect.width - 16;
            if (nx < 16) nx = 16;
            if (ny < 16) ny = 16;
            if (ny > arect.height - 16) ny = arect.height - 16;
            el.style.transform = `translate3d(${nx - 16}px, ${ny - 16}px, 0)`;
            memberObj.x = nx;
            memberObj.y = ny;
          } else {
            el.remove();
            const idx = team.indexOf(memberObj);
            if (idx !== -1) team.splice(idx, 1);
            currentSlot.classList.remove("placed");
          }
        });
      }
    });
    slotsContainer.appendChild(slot);
  });
  const infoBtn = $id("dg-info-btn");
  const infoPanel = $id("dg-info-panel");
  const infoList = $id("dg-info-list");
  const infoClose = $id("dg-info-close");
  const codexBtn = $id("dg-codex-btn");
  const codexPanel = $id("dg-codex-panel");
  const codexList = $id("dg-codex-list");
  const codexClose = $id("dg-codex-close");
  infoBtn.addEventListener("click", () => {
    if (infoPanel.style.display === "flex") {
      infoPanel.style.display = "none";
      return;
    }
    codexPanel.style.display = "none";
    infoList.innerHTML = "";
    ctx.S.pets.forEach((petId) => {
      const stat = PET_STATS2[petId] || PET_STATS2.default;
      infoList.innerHTML += `
                <div class="dg-info-item">
                    <div class="dg-info-item-icon">${petSVG(petId, 32)}</div>
                    <div class="dg-info-item-desc">
                        <b>${stat.name}</b>
                        HP: ${stat.hp} | ATK: ${stat.atk}<br/>
                        T\u1EA7m \u0111\xE1nh: ${stat.range} | T\u1ED1c \u0111\xE1nh: ${stat.cd}s<br/>
                        <span style="color:#b08a5c;">${stat.desc}</span>
                    </div>
                </div>
            `;
    });
    infoPanel.style.display = "flex";
  });
  codexBtn.addEventListener("click", () => {
    if (codexPanel.style.display === "flex") {
      codexPanel.style.display = "none";
      return;
    }
    infoPanel.style.display = "none";
    codexList.innerHTML = "";
    ENEMY_TYPES.forEach((stat) => {
      codexList.innerHTML += `
                <div class="dg-info-item" style="border-left: 2px solid #e06578;">
                    <div class="dg-info-item-icon">${spriteSVG(stat.sp || stat.id, 32)}</div>
                    <div class="dg-info-item-desc">
                        <b style="color:#e06578;">${stat.name}</b>
                        HP: ${stat.hp} | ATK: ${stat.atk}<br/>
                        T\u1EA7m \u0111\xE1nh: ${stat.range} | T\u1ED1c \u0111\xE1nh: ${stat.cd}s<br/>
                        <span style="color:#b08a5c;">${stat.desc}</span>
                    </div>
                </div>
            `;
    });
    codexPanel.style.display = "flex";
  });
  infoClose.addEventListener("click", () => {
    infoPanel.style.display = "none";
  });
  codexClose.addEventListener("click", () => {
    codexPanel.style.display = "none";
  });
  $id("dg-start-btn").addEventListener("click", () => {
    if (team.length === 0) return toast("Ch\u01B0a ch\u1ECDn \u0111\u1ED9i h\xECnh!");
    startCombat();
  });
  $id("dg-leave-btn").addEventListener("click", () => {
    closeDungeonView();
  });
  $id("dg-surrender-btn").addEventListener("click", () => {
    endDungeon(false);
  });
}
function startCombat() {
  phase = "combat";
  $id("dg-dock").style.display = "none";
  $id("dg-start-btn").style.display = "none";
  $id("dg-leave-btn").style.display = "none";
  $id("dg-surrender-btn").style.display = "block";
  currentWave = 1;
  totalGold = 0;
  shopGold = 0;
  fullTeam = [...team];
  startWave();
}
function updateHUD() {
  const hud = $id("dg-hud");
  if (!hud) return;
  const isBoss = currentWave % 10 === 0;
  hud.style.display = "block";
  hud.innerHTML = `<span style="color:#ffd94d; font-weight:bold;">Wave ${currentWave}</span>${isBoss ? " \u{1F451}" : ""} <span style="color:#a4dc8c; margin-left:10px;" title="V\xE0ng mang v\u1EC1">${spriteSVG("coin", 12).replace("display:block", "display:inline-block;vertical-align:middle")} ${totalGold}</span> <span style="color:#e06578; margin-left:10px;" title="V\xE0ng n\xE2ng c\u1EA5p">\u{1F6E0} ${shopGold}</span>`;
}
function startWave() {
  const isBossWave = currentWave % 10 === 0;
  if (isBossWave) {
    phase = "end";
    const arena = $id("dg-arena");
    const banner = document.createElement("div");
    banner.className = "dg-boss-banner";
    banner.innerHTML = "\u26A0 BOSS WAVE \u26A0";
    arena.appendChild(banner);
    setTimeout(() => {
      banner.remove();
      _doStartWave();
    }, 2e3);
  } else {
    _doStartWave();
  }
}
function _doStartWave() {
  phase = "combat";
  enemies = [];
  projectiles = [];
  fullTeam.forEach((p) => {
    p.waveDmgDealt = 0;
    p.waveDmgTaken = 0;
    p.waveHealDone = 0;
  });
  const arena = $id("dg-arena");
  const w = arena.clientWidth;
  const h = arena.clientHeight;
  updateHUD();
  let count = Math.min(40, 4 + Math.floor(currentWave * 1.5));
  let spawnElite = currentWave % 3 === 0;
  let isBossWave = currentWave % 10 === 0;
  if (isBossWave) {
    count = Math.max(3, Math.floor(count / 2));
  }
  let stressed = Math.floor(currentWave / 5) * 0.5;
  for (let i = 0; i < count; i++) {
    let type;
    if (spawnElite && i === 0 || isBossWave && i === 0) {
      const elites = ENEMY_TYPES.filter((e) => e.elite);
      type = elites.length > 0 ? elites[Math.floor(Math.random() * elites.length)] : ENEMY_TYPES[ENEMY_TYPES.length - 1];
    } else {
      const normals = ENEMY_TYPES.filter((e) => !e.elite);
      type = normals[Math.floor(Math.random() * normals.length)];
    }
    const el = document.createElement("div");
    el.className = "dg-entity enemy flip";
    el.innerHTML = `
            <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
            <div class="dg-cd-bar"><div class="dg-cd-fill" style="width: 0%"></div></div>
            <div class="dg-skill-cd-bar" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
            ${spriteSVG(type.sp || type.id, 32)}
        `;
    const x = 20 + Math.random() * (w - 60);
    const y = 40 + Math.random() * (h - 80);
    el.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
    arena.appendChild(el);
    let hpMultiplier = Math.pow(1.15, currentWave - 1);
    let atkMultiplier = Math.pow(1.2, currentWave - 1);
    if (isBossWave) {
      hpMultiplier *= 1.5;
      atkMultiplier *= 1.2;
    }
    enemies.push({
      id: type.id,
      x,
      y,
      hp: Math.round(type.hp * hpMultiplier),
      maxHp: Math.round(type.hp * hpMultiplier),
      atk: Math.round(type.atk * atkMultiplier),
      range: type.range,
      speed: type.speed,
      cd: 0,
      maxCd: type.cd,
      skillCd: type.maxSkillCd || 0,
      maxSkillCd: type.maxSkillCd || 0,
      el,
      type: "enemy",
      skill: type.skill,
      ai: type.ai,
      gold: Math.round((type.gold || 5) * 2 * Math.pow(1.15, currentWave - 1))
    });
  }
  lastTime = performance.now();
  if (!gameLoopId) {
    gameLoopId = setTimeout(combatLoop, 16);
  }
}
function stopCombatLoop() {
  if (gameLoopId) clearTimeout(gameLoopId);
  gameLoopId = null;
}
function combatLoop() {
  if (phase !== "combat") return;
  let now2 = performance.now();
  let dt = (now2 - lastTime) / 1e3;
  lastTime = now2;
  if (dt > 1) dt = 1;
  let steps = 0;
  while (dt > 0 && steps < 60) {
    let stepDt = Math.min(dt, 0.016);
    updateEntities(team, enemies, stepDt);
    updateEntities(enemies, team, stepDt);
    const arena = $id("dg-arena");
    projectiles = projectiles.filter((p) => {
      if (!p.target || p.target.hp <= 0) {
        p.el.remove();
        return false;
      }
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const dist = Math.max(0.1, Math.hypot(dx, dy));
      if (dist < 10) {
        applyEffect(p.from, p.target, p.fromGroup, p.toGroup, p.atk, p.skill);
        p.el.remove();
        return false;
      } else {
        const move = p.speed * stepDt;
        p.x += dx / dist * move;
        p.y += dy / dist * move;
        p.tx = p.target.x;
        p.ty = p.target.y - 16;
        p.el.style.transform = `translate3d(${p.x - 16}px, ${p.y - 16}px, 0)`;
        return true;
      }
    });
    team = team.filter((e) => {
      if (e.hp <= 0) {
        e.el.remove();
        return false;
      }
      return true;
    });
    enemies = enemies.filter((e) => {
      if (e.hp <= 0) {
        e.el.remove();
        if (e.gold) {
          const homeG = Math.floor(e.gold * 0.3);
          totalGold += homeG;
          shopGold += e.gold;
          spawnDmg({ x: e.x, y: e.y - 10 }, `+${e.gold} \u{1F6E0}`, "gold");
          updateHUD();
        }
        return false;
      }
      return true;
    });
    if (enemies.length === 0 || team.length === 0) {
      break;
    }
    dt -= stepDt;
    steps++;
  }
  if (enemies.length === 0) {
    showWaveRewards();
    return;
  }
  if (team.length === 0) {
    endDungeon(false);
    return;
  }
  gameLoopId = setTimeout(combatLoop, 16);
}
function spawnDmg(target, amount, type) {
  const isStr = typeof amount === "string";
  if (!isStr) amount = Math.round(amount);
  const arena = $id("dg-arena");
  const dmg = document.createElement("div");
  dmg.className = "dg-dmg" + (type ? " " + type : "");
  dmg.textContent = type === "miss" ? "MISS!" : isStr ? amount : (amount > 0 ? "+" : "") + amount;
  if (type === "gold") {
    dmg.style.color = "#ffd94d";
    dmg.style.fontWeight = "bold";
  }
  dmg.style.left = target.x + "px";
  dmg.style.top = target.y - 8 + "px";
  arena.appendChild(dmg);
  setTimeout(() => dmg.remove(), 800);
  if (target.el && target.maxHp) {
    const pct = Math.max(0, target.hp / target.maxHp) * 100;
    const fill = target.el.querySelector(".dg-hp-fill");
    if (fill) fill.style.width = pct + "%";
  }
}
function applyEffect(attacker, target, myGroup, enemyGroup, overrideAtk, skillOverride) {
  const atk = Math.round(overrideAtk || attacker.atk);
  const skill = skillOverride || attacker.skill;
  if (skill === "heal") {
    const amount = Math.min(target.maxHp - target.hp, atk);
    target.hp += amount;
    if (attacker && attacker.type === "pet") attacker.waveHealDone = (attacker.waveHealDone || 0) + amount;
    spawnDmg(target, amount, "heal");
    return;
  }
  if (skill === "aoe_heal") {
    myGroup.forEach((ally) => {
      if (ally.hp > 0 && Math.hypot(ally.x - attacker.x, ally.y - attacker.y) <= attacker.range) {
        const amount = Math.min(ally.maxHp - ally.hp, atk);
        ally.hp += amount;
        if (attacker && attacker.type === "pet") attacker.waveHealDone = (attacker.waveHealDone || 0) + amount;
        spawnDmg(ally, amount, "heal");
      }
    });
    return;
  }
  if (target.type === "pet") {
    const dodgeChance = target.dodge !== void 0 ? target.dodge : target.id === "ghostBlob" ? 0.15 : 0.05;
    if (Math.random() < dodgeChance) {
      spawnDmg(target, 0, "miss");
      target.incomingDmg = Math.max(0, (target.incomingDmg || 0) - atk);
      return;
    }
  }
  let finalDmg = atk;
  let isCrit = false;
  if (attacker) {
    if (attacker.status && attacker.status.buff_atk > 0) {
      finalDmg = Math.round(finalDmg * 1.2);
    }
    const critChance = attacker.critRate || (attacker.type === "pet" ? 0.05 : 0);
    if (Math.random() < critChance) {
      finalDmg = Math.round(finalDmg * (attacker.critDmg || 1.5));
      isCrit = true;
      if (attacker.type === "pet") {
        if (!ctx.S.stats) ctx.S.stats = { totalHarvests: 0, totalCrits: 0 };
        ctx.S.stats.totalCrits = (ctx.S.stats.totalCrits || 0) + 1;
      }
    }
  }
  if (target.armor && target.armor > 0) {
    finalDmg = Math.round(finalDmg * (1 - target.armor));
  }
  if (skill === "sniper" && attacker) {
    const dist = Math.hypot(target.x - attacker.x, target.y - attacker.y);
    finalDmg += Math.floor(dist * 0.2);
  }
  target.hp -= finalDmg;
  target.incomingDmg = Math.max(0, (target.incomingDmg || 0) - finalDmg);
  spawnDmg(target, -finalDmg, isCrit ? "crit" : "");
  if (attacker && attacker.type === "pet") attacker.waveDmgDealt = (attacker.waveDmgDealt || 0) + finalDmg;
  if (target.type === "pet") target.waveDmgTaken = (target.waveDmgTaken || 0) + finalDmg;
  if (skill === "lifesteal" && attacker) {
    const ls = Math.floor(finalDmg * 0.5);
    const amount = Math.min(attacker.maxHp - attacker.hp, ls);
    attacker.hp += amount;
    if (attacker.type === "pet") attacker.waveHealDone = (attacker.waveHealDone || 0) + amount;
    spawnDmg(attacker, amount, "heal");
  }
  if (!target.status) target.status = {};
  if (skill === "stun" && Math.random() < 0.2) target.status.stun = 1;
  if (skill === "poison") target.status.poison = 3;
  if (skill === "freeze") target.status.freeze = 3;
  if (skill === "root" && Math.random() < 0.25) target.status.root = 2;
  if (skill === "cleave" && attacker) {
    enemyGroup.forEach((e) => {
      if (e !== target && e.hp > 0 && Math.hypot(e.x - target.x, e.y - target.y) <= 40) {
        const splash = Math.floor(finalDmg * 0.5);
        e.hp -= splash;
        spawnDmg(e, -splash);
        if (attacker.type === "pet") attacker.waveDmgDealt = (attacker.waveDmgDealt || 0) + splash;
        if (e.type === "pet") e.waveDmgTaken = (e.waveDmgTaken || 0) + splash;
      }
    });
  }
  if (skill === "pierce" && attacker) {
    enemyGroup.forEach((e) => {
      if (e !== target && e.hp > 0) {
        const distToTarget = Math.hypot(target.x - attacker.x, target.y - attacker.y);
        const dot = ((e.x - attacker.x) * (target.x - attacker.x) + (e.y - attacker.y) * (target.y - attacker.y)) / (distToTarget * distToTarget);
        const cross = Math.abs((target.x - attacker.x) * (attacker.y - e.y) - (attacker.x - e.x) * (target.y - attacker.y));
        const distToLine = cross / distToTarget;
        if (dot > 0.1 && dot < 2 && distToLine < 30) {
          e.hp -= finalDmg;
          spawnDmg(e, -finalDmg);
          if (attacker.type === "pet") attacker.waveDmgDealt = (attacker.waveDmgDealt || 0) + finalDmg;
          if (e.type === "pet") e.waveDmgTaken = (e.waveDmgTaken || 0) + finalDmg;
        }
      }
    });
  }
}
function updateEntities(groupA, groupB, dt) {
  const arena = $id("dg-arena");
  groupA.forEach((a) => {
    if (a.hp <= 0) return;
    if (a.cd > 0) {
      a.cd -= dt;
    }
    const cdPct = Math.max(0, Math.min(100, (1 - Math.max(0, a.cd) / a.maxCd) * 100));
    const cdFill = a.el.querySelector(".dg-cd-fill");
    if (cdFill) cdFill.style.width = cdPct + "%";
    if (a.maxSkillCd > 0) {
      if (a.skillCd > 0) a.skillCd -= dt;
      const skillCdBar = a.el.querySelector(".dg-skill-cd-bar");
      if (skillCdBar) {
        skillCdBar.style.display = "block";
        const skillCdFill = skillCdBar.querySelector(".dg-skill-cd-fill");
        if (skillCdFill) {
          const skillCdPct = Math.max(0, Math.min(100, (1 - Math.max(0, a.skillCd) / a.maxSkillCd) * 100));
          skillCdFill.style.width = skillCdPct + "%";
        }
      }
    }
    if (!a.status) a.status = {};
    if (a.skill === "taunt") a.status.taunt = 3;
    let isStunned = false;
    let isRooted = false;
    let speedMult = 1;
    let atkSpdMult = 1;
    for (let eff in a.status) {
      if (a.status[eff] > 0) {
        a.status[eff] -= dt;
        if (eff === "stun") isStunned = true;
        if (eff === "root") isRooted = true;
        if (eff === "freeze") {
          speedMult *= 0.5;
          atkSpdMult *= 0.5;
        }
        if (eff === "poison" && Math.random() < dt) {
          a.hp -= 2;
          spawnDmg(a, -2);
        }
      }
    }
    let statusHtml = "";
    if (a.status.stun > 0) statusHtml += '<div class="dg-status-icon dg-status-stun"></div>';
    if (a.status.poison > 0) statusHtml += '<div class="dg-status-icon dg-status-poison"></div>';
    if (a.status.freeze > 0) statusHtml += '<div class="dg-status-icon dg-status-freeze"></div>';
    if (a.status.root > 0) statusHtml += '<div class="dg-status-icon dg-status-root"></div>';
    if (a.status.taunt > 0) statusHtml += '<div class="dg-status-icon dg-status-taunt"></div>';
    if (a.status.buff_atk > 0) statusHtml += '<div class="dg-status-icon dg-status-buff"></div>';
    let statusDiv = a.el.querySelector(".dg-status");
    if (!statusDiv) {
      statusDiv = document.createElement("div");
      statusDiv.className = "dg-status";
      a.el.appendChild(statusDiv);
      a._lastStatusHtml = "";
    }
    if (a._lastStatusHtml !== statusHtml) {
      statusDiv.innerHTML = statusHtml;
      a._lastStatusHtml = statusHtml;
    }
    if (isStunned) return;
    let closest = null;
    let minDist = Infinity;
    let taunters = groupB.filter((b) => b.hp > 0 && b.status && b.status.taunt > 0);
    let targetGroup = taunters.length > 0 ? taunters : groupB;
    if (a.skill === "heal" || a.skill === "aoe_heal") {
      targetGroup = groupA;
      let minHpPct = 1;
      targetGroup.forEach((ally) => {
        if (ally.hp <= 0) return;
        const dist = Math.max(0.1, Math.hypot(ally.x - a.x, ally.y - a.y));
        const hpPct = ally.hp / ally.maxHp;
        if (hpPct < minHpPct && dist < a.range * 4) {
          minHpPct = hpPct;
          closest = { b: ally, dx: ally.x - a.x, dy: ally.y - a.y, dist };
        }
      });
      if (!closest) {
        targetGroup.forEach((ally) => {
          if (ally === a || ally.hp <= 0) return;
          const dx = ally.x - a.x;
          const dy = ally.y - a.y;
          const dist = Math.max(0.1, Math.hypot(dx, dy));
          if (dist < minDist) {
            minDist = dist;
            closest = { b: ally, dx, dy, dist };
          }
        });
      }
    } else if (a.skill === "assassin" || a.ai === "assassin") {
      let validTargets = targetGroup.filter((b) => b.hp > 0);
      if (a.lockedTarget && validTargets.includes(a.lockedTarget)) {
        const dx = a.lockedTarget.x - a.x;
        const dy = a.lockedTarget.y - a.y;
        const dist = Math.max(0.1, Math.hypot(dx, dy));
        closest = { b: a.lockedTarget, dx, dy, dist };
      } else {
        let minMaxHp = Infinity;
        validTargets.forEach((b) => {
          if (b.maxHp < minMaxHp) {
            minMaxHp = b.maxHp;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.max(0.1, Math.hypot(dx, dy));
            closest = { b, dx, dy, dist };
          }
        });
        if (closest) a.lockedTarget = closest.b;
      }
    } else {
      let validTargets = targetGroup.filter((b) => b.hp > 0 && b.hp - (b.incomingDmg || 0) > 0);
      if (validTargets.length === 0) validTargets = targetGroup.filter((b) => b.hp > 0);
      validTargets.forEach((b) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(0.1, Math.hypot(dx, dy));
        if (dist < minDist) {
          minDist = dist;
          closest = { b, dx, dy, dist };
        }
      });
    }
    a.el.classList.remove("walk");
    if (closest) {
      if (a.maxSkillCd > 0 && a.skillCd <= 0 && a.skill === "projection_sorcery") {
        a.skillCd = a.maxSkillCd;
        const momentum = 1 / (a.maxCd || 1);
        const finalDmg = a.atk;
        const projectionDmg = Math.floor(finalDmg * momentum);
        const validTargets = targetGroup.filter((e) => e.hp > 0 && e.el);
        if (validTargets.length === 0) return;
        const targetEls = validTargets.map((e) => e.el);
        validTargets.forEach((e) => {
          if (!e.status) e.status = {};
          e.status.stun = 1.3;
        });
        if (!a.status) a.status = {};
        a.status.stun = 1.3;
        playNaoyaCutscene(a, a.el, targetEls, () => {
          validTargets.forEach((e) => {
            if (e.hp > 0) {
              if (e !== closest.b) {
                e.hp -= projectionDmg;
                spawnDmg(e, -projectionDmg);
              } else {
                const extraDmg = Math.max(0, projectionDmg - finalDmg);
                if (extraDmg > 0) {
                  e.hp -= extraDmg;
                  spawnDmg(e, -extraDmg, "crit");
                }
              }
              if (arena && a.el) {
                const ghost = a.el.cloneNode(true);
                ghost.className = "dg-entity projection-ghost";
                ghost.style.position = "absolute";
                ghost.style.left = e.x + "px";
                ghost.style.top = e.y + "px";
                ghost.style.zIndex = "1";
                ghost.style.opacity = "0.5";
                ghost.style.filter = "grayscale(1) contrast(1.5)";
                ghost.style.pointerEvents = "none";
                arena.appendChild(ghost);
                setTimeout(() => ghost.remove(), 150);
              }
            }
          });
        });
        return;
      }
      if (closest.dx < -1 && a.type === "pet") a.el.classList.add("flip");
      else if (closest.dx > 1 && a.type === "pet") a.el.classList.remove("flip");
      if (closest.dx > 1 && a.type === "enemy") a.el.classList.add("flip");
      else if (closest.dx < -1 && a.type === "enemy") a.el.classList.remove("flip");
      let isRanged = a.range >= 80 || a.ai === "ranged";
      let inRange = closest.dist <= a.range || a.skill === "heal" && closest.dist <= 10;
      let baseRange = a.range;
      if (a.type === "pet" && PET_STATS2[a.id]) baseRange = PET_STATS2[a.id].range;
      if (a.type === "enemy") {
        const en = ENEMY_TYPES.find((e) => e.id === a.id);
        if (en) baseRange = en.range;
      }
      let tooClose = isRanged && closest.dist < baseRange * 0.4 && closest.b.type !== a.type;
      if (a.panic > 0) a.panic -= dt;
      if (a.panic > 0 && !isRooted) {
        a.el.classList.add("walk");
        const arenaRect = arena.getBoundingClientRect();
        const speed = a.speed * speedMult * dt;
        let cx = arenaRect.width / 2 - a.x;
        let cy = arenaRect.height / 2 - a.y;
        let dist = Math.hypot(cx, cy);
        if (dist > 5) {
          a.x += cx / dist * speed;
          a.y += cy / dist * speed;
        }
        a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
      } else if (tooClose && !isRooted) {
        a.el.classList.add("walk");
        const arenaRect = arena.getBoundingClientRect();
        const speed = a.speed * speedMult * dt;
        let kx = -(closest.dx / closest.dist);
        let ky = -(closest.dy / closest.dist);
        let moveX = kx * speed;
        let moveY = ky * speed;
        let nextX = a.x + moveX;
        let nextY = a.y + moveY;
        let hitLeft = nextX < 20;
        let hitRight = nextX > arenaRect.width - 20;
        let hitTop = nextY < 20;
        let hitBottom = nextY > arenaRect.height - 20;
        let hitX = hitLeft || hitRight;
        let hitY = hitTop || hitBottom;
        if (hitX && hitY) {
          a.panic = 1;
        } else if (hitX) {
          moveX = 0;
          moveY = (ky !== 0 ? Math.sign(ky) : Math.random() < 0.5 ? 1 : -1) * speed;
        } else if (hitY) {
          moveY = 0;
          moveX = (kx !== 0 ? Math.sign(kx) : Math.random() < 0.5 ? 1 : -1) * speed;
        }
        if (!(hitX && hitY)) {
          a.x += moveX;
          a.y += moveY;
        }
        a.x = Math.max(20, Math.min(a.x, arenaRect.width - 20));
        a.y = Math.max(20, Math.min(a.y, arenaRect.height - 20));
        a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
      } else if (!inRange && !isRooted) {
        a.el.classList.add("walk");
        const speed = a.speed * speedMult * dt;
        if ((a.skill === "assassin" || a.ai === "assassin") && closest.dist > 150) {
          a.x = closest.b.x + (closest.dx > 0 ? -30 : 30);
          a.y = closest.b.y;
        } else {
          a.x += closest.dx / closest.dist * speed;
          a.y += closest.dy / closest.dist * speed;
        }
        const arenaRect = arena.getBoundingClientRect();
        a.x = Math.max(20, Math.min(a.x, arenaRect.width - 20));
        a.y = Math.max(20, Math.min(a.y, arenaRect.height - 20));
        a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
      }
      if (inRange) {
        if (a.cd <= 0) {
          a.cd = a.maxCd / atkSpdMult;
          a.el.classList.add("attack");
          setTimeout(() => {
            if (a.el) a.el.classList.remove("attack");
          }, 200);
          if (a.skill === "frenzy") {
            if (!a.frenzyStacks) a.frenzyStacks = 0;
            a.frenzyStacks = Math.min(10, a.frenzyStacks + 1);
            a.cd = a.maxCd / (atkSpdMult * (1 + a.frenzyStacks * 0.05));
          }
          if (a.skill === "taunt") {
          }
          if (a.skill === "buff_atk") {
            groupA.forEach((ally) => {
              if (ally.hp > 0 && Math.hypot(ally.x - a.x, ally.y - a.y) < 100) {
                if (!ally.status) ally.status = {};
                ally.status.buff_atk = 2;
              }
            });
          }
          if (isRanged && a.skill !== "heal" && a.skill !== "aoe_heal") {
            closest.b.incomingDmg = (closest.b.incomingDmg || 0) + a.atk;
            let p = {
              x: a.x,
              y: a.y - 16,
              tx: closest.b.x,
              ty: closest.b.y - 16,
              target: closest.b,
              atk: a.atk,
              skill: a.skill,
              from: a,
              fromGroup: groupA,
              toGroup: targetGroup,
              speed: 300,
              el: document.createElement("div")
            };
            p.el.className = "dg-projectile";
            p.el.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#f0d" /></svg>';
            p.el.style.transform = `translate3d(${p.x - 16}px, ${p.y - 16}px, 0)`;
            arena.appendChild(p.el);
            if (a.skill === "multishot") {
              projectiles.push(p);
              let target2 = targetGroup[Math.floor(Math.random() * targetGroup.length)];
              let target3 = targetGroup[Math.floor(Math.random() * targetGroup.length)];
              if (target2 && target2 !== p.target) {
                target2.incomingDmg = (target2.incomingDmg || 0) + a.atk * 0.5;
                let p2 = { ...p, tx: target2.x, ty: target2.y - 16, target: target2, atk: a.atk * 0.5, el: p.el.cloneNode(true) };
                arena.appendChild(p2.el);
                projectiles.push(p2);
              }
              if (target3 && target3 !== p.target && target3 !== target2) {
                target3.incomingDmg = (target3.incomingDmg || 0) + a.atk * 0.5;
                let p3 = { ...p, tx: target3.x, ty: target3.y - 16, target: target3, atk: a.atk * 0.5, el: p.el.cloneNode(true) };
                arena.appendChild(p3.el);
                projectiles.push(p3);
              }
            } else {
              projectiles.push(p);
            }
          } else {
            closest.b.incomingDmg = (closest.b.incomingDmg || 0) + a.atk;
            applyEffect(a, closest.b, groupA, targetGroup);
          }
        }
      }
    }
  });
}
function endDungeon(isWin) {
  phase = "end";
  stopCombatLoop();
  delete ctx.S.dungeonSave;
  save();
  projectiles.forEach((p) => p.el.remove());
  projectiles = [];
  const surrenderBtn = $id("dg-surrender-btn");
  if (surrenderBtn) surrenderBtn.style.display = "none";
  const arena = $id("dg-arena");
  const overlay = document.createElement("div");
  overlay.className = "dg-overlay";
  ctx.S.coins += totalGold;
  if (!ctx.S.dungeonBest) ctx.S.dungeonBest = { wave: 0, gold: 0 };
  let isNewRecord = false;
  if (currentWave > ctx.S.dungeonBest.wave) {
    ctx.S.dungeonBest.wave = currentWave;
    ctx.S.dungeonBest.gold = totalGold;
    isNewRecord = true;
  } else if (currentWave === ctx.S.dungeonBest.wave && totalGold > ctx.S.dungeonBest.gold) {
    ctx.S.dungeonBest.gold = totalGold;
    isNewRecord = true;
  }
  save();
  renderStatus();
  let rewardText = `<div style="color:white; font-size: 16px;">Ph\u1EA7n th\u01B0\u1EDFng: ${spriteSVG("coin", 16).replace("display:block", "display:inline-block; vertical-align:middle; margin-top:-2px")} ${totalGold} G<br/>S\u1ED1ng s\xF3t \u0111\u1EBFn Wave ${currentWave}</div>`;
  const recordHtml = isNewRecord ? '<div class="dg-new-record">\u{1F3C6} K\u1EF6 L\u1EE4C M\u1EDAI! \u{1F3C6}</div>' : `<div style="color:#b08a5c; font-size:13px;">K\u1EF7 l\u1EE5c: Wave ${ctx.S.dungeonBest.wave} \xB7 ${ctx.S.dungeonBest.gold} G</div>`;
  overlay.innerHTML = `
        <div class="dg-title">Game Over</div>
        ${rewardText}
        ${recordHtml}
        <div style="display:flex; justify-content:center; gap: 10px; margin-top: 15px; margin-bottom: auto;">
            <div class="buy" id="dg-restart-btn">Ch\u01A1i L\u1EA1i</div>
            <div class="buy plain" id="dg-finish-btn">Tho\xE1t</div>
        </div>
    `;
  arena.appendChild(overlay);
  overlay.querySelector("#dg-restart-btn").addEventListener("click", () => {
    initPlacementPhase();
  });
  overlay.querySelector("#dg-finish-btn").addEventListener("click", () => {
    closeDungeonView();
  });
}
function showWaveRewards(isLoaded = false) {
  phase = "end";
  stopCombatLoop();
  let bossDropHtml = "";
  const arena = $id("dg-arena");
  if (!isLoaded) {
    projectiles.forEach((p) => p.el.remove());
    projectiles = [];
    const isBoss = currentWave % 10 === 0;
    const waveGold = Math.round(500 * Math.pow(1.2, currentWave - 1)) * (isBoss ? 3 : 1);
    totalGold += Math.floor(waveGold * 0.3);
    shopGold += waveGold;
    fullTeam.forEach((p) => {
      if (p.hp <= 0) {
        p.hp = p.maxHp * 0.5;
        arena.appendChild(p.el);
      } else {
        p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.2);
      }
      const pct = Math.max(0, p.hp / p.maxHp) * 100;
      p.el.querySelector(".dg-hp-fill").style.width = pct + "%";
      p.status = {};
      if (!p.upgrades) p.upgrades = { hp: 0, atk: 0, aspd: 0, spd: 0, critR: 0, critD: 0, range: 0, dodge: 0 };
      const baseStat = PET_STATS2[p.id] || PET_STATS2.default;
      p.maxCd = baseStat.cd * Math.pow(0.9, p.upgrades.aspd || 0);
      if (p.critRate === void 0) p.critRate = 0.05;
      if (p.critDmg === void 0) p.critDmg = 1.5;
      if (p.dodge === void 0) p.dodge = p.id === "ghostBlob" ? 0.15 : 0.05;
    });
    team = [...fullTeam];
    if (isBoss) {
      if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
      const r = Math.random();
      let dropText = "";
      if (r < 0.01) {
        ctx.S.tickets.super = (ctx.S.tickets.super || 0) + 1;
        dropText = "1 V\xE9 Si\xEAu C\u01B0\u1EDDng";
      } else if (r < 0.4) {
        ctx.S.tickets.spec = (ctx.S.tickets.spec || 0) + 2;
        dropText = "2 V\xE9 \u0110\u1EB7c Bi\u1EC7t";
      } else {
        ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + 3;
        dropText = "3 V\xE9 Th\u01B0\u1EDDng";
      }
      bossDropHtml = `<div style="color:#4caf50; margin-bottom:15px; font-weight:bold; font-size:16px;">\u2728 R\u01A1i ra t\u1EEB Boss: ${dropText}! \u2728</div>`;
    }
    ctx.S.dungeonSave = {
      currentWave,
      totalGold,
      shopGold,
      bossDropHtml,
      fullTeam: fullTeam.map((p) => ({
        id: p.id,
        x: p.x,
        y: p.y,
        hp: p.hp,
        maxHp: p.maxHp,
        atk: p.atk,
        speed: p.speed,
        critRate: p.critRate,
        critDmg: p.critDmg,
        dodge: p.dodge,
        range: p.range,
        maxCd: p.maxCd,
        upgrades: { ...p.upgrades },
        type: p.type,
        skill: p.skill,
        ai: p.ai,
        cd: p.cd,
        skillCd: p.skillCd,
        maxSkillCd: p.maxSkillCd
      }))
    };
    save();
  } else {
    bossDropHtml = ctx.S.dungeonSave.bossDropHtml || "";
    fullTeam.forEach((p) => {
      const pct = Math.max(0, p.hp / p.maxHp) * 100;
      p.el.querySelector(".dg-hp-fill").style.width = pct + "%";
    });
  }
  const overlay = document.createElement("div");
  overlay.className = "dg-overlay";
  overlay.style.alignItems = "stretch";
  overlay.style.padding = "20px";
  overlay.style.boxSizing = "border-box";
  overlay.style.background = "rgba(0,0,0,0.9)";
  const getCost = (lv) => Math.floor(50 * Math.pow(1.4, lv));
  const renderShop = (selectedIdx) => {
    const selectedPet = fullTeam[selectedIdx];
    let petsHtml = '<div class="dg-shop-left">';
    fullTeam.forEach((p, idx) => {
      const isSel = idx === selectedIdx;
      const totalLv = Object.values(p.upgrades).reduce((a, b) => a + b, 0);
      const formatNum = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : Math.round(n);
      petsHtml += `<div class="dg-shop-pet ${isSel ? "selected" : ""}" data-idx="${idx}">
                ${petSVG(p.id, 40)}
                <div class="lv">LV ${totalLv}</div>
                <div class="dmg-stats">
                    <span style="color:#ff6666">\u2694\uFE0F${formatNum(p.waveDmgDealt || 0)}</span>
                    ${p.waveHealDone ? `<span style="color:#66ff66">\u271A\uFE0F${formatNum(p.waveHealDone)}</span>` : ""}
                    <span style="color:#66ccff">\u{1F6E1}\uFE0F${formatNum(p.waveDmgTaken || 0)}</span>
                </div>
            </div>`;
    });
    petsHtml += "</div>";
    let headerHtml = `
            <div class="dg-shop-header">
                <div class="dg-shop-header-left">
                    <div class="dg-shop-title">Ch\u1EE3 \u0110en - Wave ${currentWave}</div>
                    <div class="dg-shop-gold">\u{1F6E0} ${shopGold} \u0110i\u1EC3m N\xE2ng C\u1EA5p</div>
                </div>
                <button id="dg-shop-next" class="dg-shop-next-btn">Ti\u1EBFp Theo \u2794</button>
            </div>
        `;
    let shopHtml = `<div class="dg-shop-right">
            ${bossDropHtml}
        `;
    if (selectedPet) {
      const u = selectedPet.upgrades;
      const hpMissingPet = selectedPet.maxHp - selectedPet.hp;
      const waveBaseGold = Math.round(500 * Math.pow(1.2, currentWave - 1));
      const healPetCost = Math.max(10, Math.floor(waveBaseGold * 0.2 * (hpMissingPet / selectedPet.maxHp)));
      const totalMaxHp = fullTeam.reduce((acc, member) => acc + member.maxHp, 0);
      const hpMissingTeam = fullTeam.reduce((acc, member) => acc + (member.maxHp - member.hp), 0);
      const healTeamCost = Math.max(30, totalMaxHp > 0 ? Math.floor(waveBaseGold * 0.5 * (hpMissingTeam / totalMaxHp)) : 30);
      const stats = [
        { id: "hp", name: "Max HP (+25%)", val: selectedPet.maxHp, lv: u.hp, cost: Math.floor(40 * Math.pow(1.4, u.hp)) },
        { id: "atk", name: "ATK (+25%)", val: selectedPet.atk, lv: u.atk, cost: Math.floor(40 * Math.pow(1.4, u.atk)) },
        { id: "aspd", name: "ATK SPD (+10%)", val: selectedPet.maxCd.toFixed(2) + "s", lv: u.aspd, cost: Math.floor(60 * Math.pow(1.4, u.aspd)), forceCanBuy: selectedPet.maxCd > 0.11 },
        { id: "spd", name: "Move Speed (+10%)", val: selectedPet.speed, lv: u.spd, cost: Math.floor(30 * Math.pow(1.4, u.spd)), forceCanBuy: selectedPet.speed < 150 },
        { id: "critR", name: "Crit Rate (+5%)", val: (selectedPet.critRate * 100).toFixed(0) + "%", lv: u.critR, cost: Math.floor(50 * Math.pow(1.4, u.critR)), forceCanBuy: selectedPet.critRate < 0.59 },
        { id: "critD", name: "Crit Dmg (+20%)", val: (selectedPet.critDmg * 100).toFixed(0) + "%", lv: u.critD, cost: Math.floor(50 * Math.pow(1.4, u.critD)) },
        { id: "dodge", name: "N\xE9 Tr\xE1nh (+5%)", val: (selectedPet.dodge * 100).toFixed(0) + "%", lv: u.dodge || 0, cost: Math.floor(60 * Math.pow(1.4, u.dodge || 0)), forceCanBuy: selectedPet.dodge < 0.39 }
      ];
      if (PET_STATS2[selectedPet.id] && PET_STATS2[selectedPet.id].range > 60) {
        stats.push({ id: "range", name: "T\u1EA7m \u0110\xE1nh (+10%)", val: Math.round(selectedPet.range), lv: u.range || 0, cost: Math.floor(40 * Math.pow(1.2, u.range || 0)), forceCanBuy: selectedPet.range < 400 });
      }
      stats.push(
        { id: "heal_pet", name: "H\u1ED3i M\xE1u (Full)", val: `${Math.round(selectedPet.hp)}/${selectedPet.maxHp}`, lv: "", cost: healPetCost, forceCanBuy: selectedPet.hp < selectedPet.maxHp },
        { id: "heal_team", name: "H\u1ED3i M\xE1u Team (Full)", val: "T\u1EA5t c\u1EA3", lv: "", cost: healTeamCost, forceCanBuy: hpMissingTeam > 0 }
      );
      shopHtml += `<div class="dg-shop-grid">`;
      stats.forEach((s) => {
        const cost = s.cost !== void 0 ? s.cost : getCost(s.lv);
        const canAfford = shopGold >= cost && (s.forceCanBuy !== void 0 ? s.forceCanBuy : true);
        const lvText = s.lv !== "" ? ` <span style="color:#888;">(Lv ${s.lv})</span>` : "";
        shopHtml += `
                <div class="dg-shop-card">
                    <div>
                        <div class="dg-shop-stat-name">${s.name}${lvText}</div>
                        <div class="dg-shop-stat-val">${s.val}</div>
                    </div>
                    <button class="dg-btn-buy" data-stat="${s.id}" data-cost="${cost}" ${!canAfford ? "disabled" : ""}>
                        ${cost} \u{1F6E0}
                    </button>
                </div>`;
      });
      shopHtml += `</div>`;
    } else {
      shopHtml += `<div style="color:#aaa; text-align:center; flex:1; display:flex; align-items:center; justify-content:center;">Ch\u1ECDn m\u1ED9t Pet b\xEAn tr\xE1i \u0111\u1EC3 n\xE2ng c\u1EA5p.</div>`;
    }
    shopHtml += `</div>`;
    overlay.innerHTML = `<div class="dg-shop-box">${headerHtml}<div class="dg-shop-content">${petsHtml}${shopHtml}</div></div>`;
    overlay.querySelectorAll(".dg-shop-pet").forEach((el) => {
      el.onclick = () => renderShop(parseInt(el.dataset.idx));
    });
    overlay.querySelectorAll(".dg-btn-buy").forEach((el) => {
      el.onclick = () => {
        const statId = el.dataset.stat;
        const cost = parseInt(el.dataset.cost);
        if (shopGold >= cost) {
          shopGold -= cost;
          const p = selectedPet;
          if (statId === "hp") {
            p.maxHp = Math.round(p.maxHp * 1.25);
            p.hp = Math.round(p.hp * 1.25);
            p.upgrades.hp++;
          }
          if (statId === "atk") {
            p.atk = Math.round(p.atk * 1.25);
            p.upgrades.atk++;
          }
          if (statId === "aspd") {
            p.maxCd = Math.max(0.1, p.maxCd * 0.9);
            p.upgrades.aspd++;
          }
          if (statId === "spd") {
            p.speed = Math.round(p.speed * 1.1);
            p.upgrades.spd++;
          }
          if (statId === "critR") {
            p.critRate = Math.min(0.6, p.critRate + 0.05);
            p.upgrades.critR++;
          }
          if (statId === "critD") {
            p.critDmg = Math.round((p.critDmg + 0.2) * 10) / 10;
            p.upgrades.critD++;
          }
          if (statId === "dodge") {
            p.dodge = Math.min(0.4, p.dodge + 0.05);
            p.upgrades.dodge = (p.upgrades.dodge || 0) + 1;
          }
          if (statId === "range") {
            p.range = Math.round(p.range * 1.1);
            p.upgrades.range = (p.upgrades.range || 0) + 1;
          }
          if (statId === "heal_pet") {
            p.hp = p.maxHp;
          }
          if (statId === "heal_team") {
            fullTeam.forEach((member) => {
              member.hp = member.maxHp;
            });
          }
          renderShop(selectedIdx);
        }
      };
    });
    const nextBtn = overlay.querySelector("#dg-shop-next");
    nextBtn.onclick = () => {
      nextWaveSequence(overlay);
    };
  };
  arena.appendChild(overlay);
  renderShop(0);
}
function nextWaveSequence(overlay) {
  overlay.remove();
  currentWave++;
  fullTeam.forEach((p) => {
    const pct = Math.max(0, Math.min(100, p.hp / p.maxHp * 100));
    p.el.querySelector(".dg-hp-fill").style.width = pct + "%";
  });
  startWave();
}
var isDungeonOpen, phase, gameLoopId, lastTime, team, enemies, projectiles, currentWave, totalGold, shopGold, PET_STATS2, ENEMY_TYPES, fullTeam;
var init_dungeon = __esm({
  "src/dungeon.js"() {
    init_store();
    init_all();
    init_graphics();
    init_hero();
    isDungeonOpen = false;
    phase = "placement";
    gameLoopId = null;
    lastTime = 0;
    team = [];
    enemies = [];
    projectiles = [];
    currentWave = 1;
    totalGold = 0;
    shopGold = 0;
    PET_STATS2 = {
      slime: { name: "Slime Xanh", desc: "Chi\u1EBFn binh c\xE2n b\u1EB1ng, kh\xF4ng c\xF3 g\xEC n\u1ED5i b\u1EADt.", hp: 130, atk: 12, range: 40, speed: 40, cd: 1 },
      octo: { name: "B\u1EA1ch Tu\u1ED9c", desc: "\u0110\xE1nh nhanh th\u1EAFng nhanh. \u0110\xE1nh c\xE0ng l\xE2u t\u1ED1c \u0111\xE1nh c\xE0ng cao.", hp: 100, atk: 18, range: 60, speed: 50, cd: 0.8, skill: "frenzy" },
      slimePink: { name: "Slime H\u1ED3ng", desc: "H\u1ED3i m\xE1u \u0111\u01A1n m\u1EE5c ti\xEAu cho \u0111\u1ED3ng minh y\u1EBFu nh\u1EA5t.", hp: 150, atk: 18, range: 80, speed: 35, cd: 1.5, skill: "heal" },
      peach_soda: { name: "Soda \u0110\xE0o", desc: "\u0110\xE1nh xa xuy\xEAn th\u1EA5u m\u1ECDi k\u1EBB \u0111\u1ECBch tr\xEAn \u0111\u01B0\u1EDDng bay.", hp: 110, atk: 22, range: 100, speed: 45, cd: 1.2, skill: "pierce" },
      octoCream: { name: "B\u1EA1ch Tu\u1ED9c Kem", desc: "20% t\u1EF7 l\u1EC7 l\xE0m cho\xE1ng k\u1EBB \u0111\u1ECBch 1 gi\xE2y.", hp: 180, atk: 15, range: 60, speed: 45, cd: 1.5, skill: "stun" },
      jellyfish: { name: "S\u1EE9a Xo\u0103n", desc: "X\u1EA1 th\u1EE7: B\u1EAFn c\xE0ng xa s\xE1t th\u01B0\u01A1ng c\xE0ng l\u1EDBn.", hp: 90, atk: 30, range: 150, speed: 60, cd: 1.5, skill: "sniper" },
      mystery_blob: { name: "B\xE9 B\xED \u1EA8n", desc: "H\u1ED3i m\xE1u cho b\u1EA3n th\xE2n b\u1EB1ng 50% s\xE1t th\u01B0\u01A1ng g\xE2y ra.", hp: 110, atk: 18, range: 50, speed: 55, cd: 1.1, skill: "lifesteal" },
      ghostBlob: { name: "Ma Tr\u1EAFng", desc: "S\xE1t th\u1EE7: Lu\xF4n nh\u1EAFm v\xE0o k\u1EBB th\xF9 xa nh\u1EA5t.", hp: 80, atk: 45, range: 40, speed: 100, cd: 1.2, skill: "assassin" },
      impBlob: { name: "Qu\u1EF7 Nh\u1ECF", desc: "\u0110\xE1nh lan: G\xE2y s\xE1t th\u01B0\u01A1ng AoE xung quanh m\u1EE5c ti\xEAu.", hp: 70, atk: 50, range: 40, speed: 60, cd: 1, skill: "cleave" },
      angelBlob: { name: "Thi\xEAn Th\u1EA7n", desc: "H\u1ED3i m\xE1u di\u1EC7n r\u1ED9ng cho c\xE1c \u0111\u1ED3ng minh l\xE2n c\u1EADn.", hp: 140, atk: 12, range: 80, speed: 40, cd: 1.2, skill: "aoe_heal" },
      starBell: { name: "Chu\xF4ng Sao", desc: "T\u0103ng 20% s\xE1t th\u01B0\u01A1ng cho \u0111\u1ED3ng minh l\xE2n c\u1EADn.", hp: 120, atk: 15, range: 90, speed: 40, cd: 1, skill: "buff_atk" },
      cloudMallow: { name: "K\u1EB9o D\u1EBBo M\xE2y", desc: "Khi\xEAu kh\xEDch: Bu\u1ED9c k\u1EBB \u0111\u1ECBch t\u1EA5n c\xF4ng m\xECnh.", hp: 250, atk: 10, range: 40, speed: 30, cd: 2, skill: "taunt" },
      dewSprout: { name: "M\u1EA7m S\u01B0\u01A1ng", desc: "25% t\u1EF7 l\u1EC7 tr\xF3i ch\xE2n k\u1EBB \u0111\u1ECBch trong 2 gi\xE2y.", hp: 130, atk: 18, range: 50, speed: 45, cd: 1.2, skill: "root" },
      prismBlob: { name: "L\u0103ng K\xEDnh", desc: "B\u1EAFn 3 tia s\xE1ng c\xF9ng l\xFAc (s\xE1t th\u01B0\u01A1ng chia n\u1EEDa).", hp: 100, atk: 25, range: 140, speed: 40, cd: 1.4, skill: "multishot" },
      penguin: { name: "C\xE1nh C\u1EE5t", desc: "\u0110\xF2n \u0111\xE1nh l\xE0m gi\u1EA3m t\u1ED1c \u0111\u1ED9 di chuy\u1EC3n v\xE0 t\u1ED1c \u0111\xE1nh.", hp: 150, atk: 20, range: 45, speed: 50, cd: 1, skill: "freeze" },
      naoyaSlime: { name: "Naoya", desc: "K\u1EF9 n\u0103ng ch\u1EE7 \u0111\u1ED9ng (10s): \u0110\u1EA7u X\u1EA1 Ch\xFA Ph\xE1p - L\u01B0\u1EDBt 24 khung h\xECnh c\xF4ng k\xEDch to\xE0n map v\xE0 \u0111\xF3ng b\u0103ng qu\xE1i 1s.", hp: 100, atk: 35, range: 45, speed: 65, cd: 0.6, skill: "projection_sorcery", maxSkillCd: 10 },
      default: { name: "Pet V\xF4 Danh", desc: "Kh\xF4ng c\xF3 k\u1EF9 n\u0103ng \u0111\u1EB7c bi\u1EC7t.", hp: 130, atk: 12, range: 40, speed: 40, cd: 1 }
    };
    ENEMY_TYPES = [
      { id: "douya", name: "M\u1EA7m Non", desc: "L\xEDnh b\u1EA7y \u0111\xE0n.", hp: 50, atk: 12, range: 40, speed: 45, cd: 0.8, ai: "melee", sp: "sprout", gold: 2 },
      { id: "tomato", name: "C\xE0 Chua Tr\xF2n", desc: "C\u1EADn chi\u1EBFn c\u01A1 b\u1EA3n.", hp: 100, atk: 18, range: 40, speed: 30, cd: 1, ai: "melee", gold: 4 },
      { id: "radish", name: "C\u1EE7 C\u1EA3i T\u1ED1c \u0110\u1ED9", desc: "Ch\u1EA1y c\u1EF1c nhanh.", hp: 60, atk: 12, range: 30, speed: 70, cd: 0.5, ai: "melee", gold: 3 },
      { id: "moonberry", name: "D\xE2u T\xE2y Gai", desc: "Th\xEDch kh\xE1ch t\u1EADp k\xEDch.", hp: 70, atk: 30, range: 40, speed: 60, cd: 1, ai: "assassin", sp: "moonberry", gold: 5 },
      { id: "chuncai", name: "Rau Thu\u1EA7n", desc: "\u0110eo b\xE1m dai d\u1EB3ng.", hp: 150, atk: 15, range: 40, speed: 25, cd: 1.2, ai: "melee", gold: 6 },
      { id: "lingjiao", name: "C\u1EE7 \u1EA4u Gi\xE1p", desc: "C\u1EADn chi\u1EBFn c\xF3 gi\xE1p.", hp: 180, atk: 20, range: 40, speed: 20, cd: 1.5, ai: "melee", gold: 8 },
      { id: "pumpkin", name: "B\xED Ng\xF4 Kh\u1ED5ng L\u1ED3", desc: "Tanker ch\u1EADm ch\u1EA1p.", hp: 300, atk: 30, range: 50, speed: 15, cd: 3, ai: "tank", gold: 15 },
      { id: "fangW", name: "Hoa B\xE1 V\u01B0\u01A1ng", desc: "Ph\xE1p s\u01B0 b\u1EAFn t\u1EEB xa.", hp: 80, atk: 25, range: 120, speed: 20, cd: 1.5, ai: "ranged", gold: 8 },
      { id: "starbush", name: "B\u1EE5i Sao", desc: "X\u1EA1 th\u1EE7 3 tia.", hp: 100, atk: 12, range: 140, speed: 25, cd: 1.5, ai: "ranged", skill: "multishot", gold: 10 },
      { id: "opalvine", name: "D\xE2y Leo Opal", desc: "Tr\xF3i ch\xE2n \u0111\u1ED1i th\u1EE7.", hp: 130, atk: 18, range: 90, speed: 20, cd: 1.2, ai: "ranged", skill: "root", gold: 12 },
      { id: "lianou", name: "C\u1EE7 Sen Kh\u1ED5ng L\u1ED3", desc: "N\xE9m b\xF9n t\u1EEB xa.", hp: 300, atk: 25, range: 100, speed: 15, cd: 2, ai: "ranged", gold: 20 },
      { id: "dragoncry", name: "Long Tinh", desc: "Boss: C\u1EF1c kh\u1ECFe.", hp: 700, atk: 60, range: 60, speed: 20, cd: 2, ai: "tank", skill: "cleave", elite: true, gold: 100 },
      { id: "pumpkin", name: "Vua B\xED Ng\xF4", desc: "Boss: Tank AoE slam.", hp: 1e3, atk: 50, range: 50, speed: 15, cd: 2.5, ai: "tank", skill: "cleave", elite: true, sp: "pumpkin", gold: 150 },
      { id: "fangW", name: "Ph\xF9 Th\u1EE7y Hoa", desc: "Boss: Ph\xE1o \u0111\xE0i b\u1EAFn xa.", hp: 500, atk: 70, range: 160, speed: 18, cd: 1.8, ai: "ranged", skill: "multishot", elite: true, sp: "fangW", gold: 120 }
    ];
    fullTeam = [];
  }
});

// src/destroy.js
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
  try {
    if (resizeTimer) window.clearTimeout(resizeTimer);
  } catch (e) {
  }
  try {
    if (renderTimeout) window.clearTimeout(renderTimeout);
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
var destroyed, extMenuBtn;
var init_destroy = __esm({
  "src/destroy.js"() {
    init_store();
    init_all();
    init_windows();
    init_events();
    init_pets();
    init_state();
    init_witch();
    init_orb();
    init_ui();
    init_store();
    destroyed = false;
    extMenuBtn = null;
  }
});

// node_modules/peerjs-js-binarypack/dist/binarypack.mjs
function $e8379818650e2442$var$concatArrayBuffers(bufs) {
  let size = 0;
  for (const buf of bufs) size += buf.byteLength;
  const result = new Uint8Array(size);
  let offset = 0;
  for (const buf of bufs) {
    const view = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    result.set(view, offset);
    offset += buf.byteLength;
  }
  return result;
}
function $0cfd7828ad59115f$export$417857010dc9287f(data) {
  const unpacker = new $0cfd7828ad59115f$var$Unpacker(data);
  return unpacker.unpack();
}
function $0cfd7828ad59115f$export$2a703dbb0cb35339(data) {
  const packer = new $0cfd7828ad59115f$export$b9ec4b114aa40074();
  const res = packer.pack(data);
  if (res instanceof Promise) return res.then(() => packer.getBuffer());
  return packer.getBuffer();
}
var $e8379818650e2442$export$93654d4f2d6cd524, $0cfd7828ad59115f$var$Unpacker, $0cfd7828ad59115f$export$b9ec4b114aa40074;
var init_binarypack = __esm({
  "node_modules/peerjs-js-binarypack/dist/binarypack.mjs"() {
    $e8379818650e2442$export$93654d4f2d6cd524 = class {
      constructor() {
        this.encoder = new TextEncoder();
        this._pieces = [];
        this._parts = [];
      }
      append_buffer(data) {
        this.flush();
        this._parts.push(data);
      }
      append(data) {
        this._pieces.push(data);
      }
      flush() {
        if (this._pieces.length > 0) {
          const buf = new Uint8Array(this._pieces);
          this._parts.push(buf);
          this._pieces = [];
        }
      }
      toArrayBuffer() {
        const buffer = [];
        for (const part of this._parts) buffer.push(part);
        return $e8379818650e2442$var$concatArrayBuffers(buffer).buffer;
      }
    };
    $0cfd7828ad59115f$var$Unpacker = class {
      constructor(data) {
        this.index = 0;
        this.dataBuffer = data;
        this.dataView = new Uint8Array(this.dataBuffer);
        this.length = this.dataBuffer.byteLength;
      }
      unpack() {
        const type = this.unpack_uint8();
        if (type < 128) return type;
        else if ((type ^ 224) < 32) return (type ^ 224) - 32;
        let size;
        if ((size = type ^ 160) <= 15) return this.unpack_raw(size);
        else if ((size = type ^ 176) <= 15) return this.unpack_string(size);
        else if ((size = type ^ 144) <= 15) return this.unpack_array(size);
        else if ((size = type ^ 128) <= 15) return this.unpack_map(size);
        switch (type) {
          case 192:
            return null;
          case 193:
            return void 0;
          case 194:
            return false;
          case 195:
            return true;
          case 202:
            return this.unpack_float();
          case 203:
            return this.unpack_double();
          case 204:
            return this.unpack_uint8();
          case 205:
            return this.unpack_uint16();
          case 206:
            return this.unpack_uint32();
          case 207:
            return this.unpack_uint64();
          case 208:
            return this.unpack_int8();
          case 209:
            return this.unpack_int16();
          case 210:
            return this.unpack_int32();
          case 211:
            return this.unpack_int64();
          case 212:
            return void 0;
          case 213:
            return void 0;
          case 214:
            return void 0;
          case 215:
            return void 0;
          case 216:
            size = this.unpack_uint16();
            return this.unpack_string(size);
          case 217:
            size = this.unpack_uint32();
            return this.unpack_string(size);
          case 218:
            size = this.unpack_uint16();
            return this.unpack_raw(size);
          case 219:
            size = this.unpack_uint32();
            return this.unpack_raw(size);
          case 220:
            size = this.unpack_uint16();
            return this.unpack_array(size);
          case 221:
            size = this.unpack_uint32();
            return this.unpack_array(size);
          case 222:
            size = this.unpack_uint16();
            return this.unpack_map(size);
          case 223:
            size = this.unpack_uint32();
            return this.unpack_map(size);
        }
      }
      unpack_uint8() {
        const byte = this.dataView[this.index] & 255;
        this.index++;
        return byte;
      }
      unpack_uint16() {
        const bytes = this.read(2);
        const uint16 = (bytes[0] & 255) * 256 + (bytes[1] & 255);
        this.index += 2;
        return uint16;
      }
      unpack_uint32() {
        const bytes = this.read(4);
        const uint32 = ((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3];
        this.index += 4;
        return uint32;
      }
      unpack_uint64() {
        const bytes = this.read(8);
        const uint64 = ((((((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3]) * 256 + bytes[4]) * 256 + bytes[5]) * 256 + bytes[6]) * 256 + bytes[7];
        this.index += 8;
        return uint64;
      }
      unpack_int8() {
        const uint8 = this.unpack_uint8();
        return uint8 < 128 ? uint8 : uint8 - 256;
      }
      unpack_int16() {
        const uint16 = this.unpack_uint16();
        return uint16 < 32768 ? uint16 : uint16 - 65536;
      }
      unpack_int32() {
        const uint32 = this.unpack_uint32();
        return uint32 < 2 ** 31 ? uint32 : uint32 - 2 ** 32;
      }
      unpack_int64() {
        const uint64 = this.unpack_uint64();
        return uint64 < 2 ** 63 ? uint64 : uint64 - 2 ** 64;
      }
      unpack_raw(size) {
        if (this.length < this.index + size) throw new Error(`BinaryPackFailure: index is out of range ${this.index} ${size} ${this.length}`);
        const buf = this.dataBuffer.slice(this.index, this.index + size);
        this.index += size;
        return buf;
      }
      unpack_string(size) {
        const bytes = this.read(size);
        let i = 0;
        let str = "";
        let c;
        let code;
        while (i < size) {
          c = bytes[i];
          if (c < 160) {
            code = c;
            i++;
          } else if ((c ^ 192) < 32) {
            code = (c & 31) << 6 | bytes[i + 1] & 63;
            i += 2;
          } else if ((c ^ 224) < 16) {
            code = (c & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63;
            i += 3;
          } else {
            code = (c & 7) << 18 | (bytes[i + 1] & 63) << 12 | (bytes[i + 2] & 63) << 6 | bytes[i + 3] & 63;
            i += 4;
          }
          str += String.fromCodePoint(code);
        }
        this.index += size;
        return str;
      }
      unpack_array(size) {
        const objects = new Array(size);
        for (let i = 0; i < size; i++) objects[i] = this.unpack();
        return objects;
      }
      unpack_map(size) {
        const map = {};
        for (let i = 0; i < size; i++) {
          const key = this.unpack();
          map[key] = this.unpack();
        }
        return map;
      }
      unpack_float() {
        const uint32 = this.unpack_uint32();
        const sign = uint32 >> 31;
        const exp = (uint32 >> 23 & 255) - 127;
        const fraction = uint32 & 8388607 | 8388608;
        return (sign === 0 ? 1 : -1) * fraction * 2 ** (exp - 23);
      }
      unpack_double() {
        const h32 = this.unpack_uint32();
        const l32 = this.unpack_uint32();
        const sign = h32 >> 31;
        const exp = (h32 >> 20 & 2047) - 1023;
        const hfrac = h32 & 1048575 | 1048576;
        const frac = hfrac * 2 ** (exp - 20) + l32 * 2 ** (exp - 52);
        return (sign === 0 ? 1 : -1) * frac;
      }
      read(length) {
        const j = this.index;
        if (j + length <= this.length) return this.dataView.subarray(j, j + length);
        else throw new Error("BinaryPackFailure: read index out of range");
      }
    };
    $0cfd7828ad59115f$export$b9ec4b114aa40074 = class {
      getBuffer() {
        return this._bufferBuilder.toArrayBuffer();
      }
      pack(value) {
        if (typeof value === "string") this.pack_string(value);
        else if (typeof value === "number") {
          if (Math.floor(value) === value) this.pack_integer(value);
          else this.pack_double(value);
        } else if (typeof value === "boolean") {
          if (value === true) this._bufferBuilder.append(195);
          else if (value === false) this._bufferBuilder.append(194);
        } else if (value === void 0) this._bufferBuilder.append(192);
        else if (typeof value === "object") {
          if (value === null) this._bufferBuilder.append(192);
          else {
            const constructor = value.constructor;
            if (value instanceof Array) {
              const res = this.pack_array(value);
              if (res instanceof Promise) return res.then(() => this._bufferBuilder.flush());
            } else if (value instanceof ArrayBuffer) this.pack_bin(new Uint8Array(value));
            else if ("BYTES_PER_ELEMENT" in value) {
              const v = value;
              this.pack_bin(new Uint8Array(v.buffer, v.byteOffset, v.byteLength));
            } else if (value instanceof Date) this.pack_string(value.toString());
            else if (value instanceof Blob) return value.arrayBuffer().then((buffer) => {
              this.pack_bin(new Uint8Array(buffer));
              this._bufferBuilder.flush();
            });
            else if (constructor == Object || constructor.toString().startsWith("class")) {
              const res = this.pack_object(value);
              if (res instanceof Promise) return res.then(() => this._bufferBuilder.flush());
            } else throw new Error(`Type "${constructor.toString()}" not yet supported`);
          }
        } else throw new Error(`Type "${typeof value}" not yet supported`);
        this._bufferBuilder.flush();
      }
      pack_bin(blob) {
        const length = blob.length;
        if (length <= 15) this.pack_uint8(160 + length);
        else if (length <= 65535) {
          this._bufferBuilder.append(218);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this._bufferBuilder.append(219);
          this.pack_uint32(length);
        } else throw new Error("Invalid length");
        this._bufferBuilder.append_buffer(blob);
      }
      pack_string(str) {
        const encoded = this._textEncoder.encode(str);
        const length = encoded.length;
        if (length <= 15) this.pack_uint8(176 + length);
        else if (length <= 65535) {
          this._bufferBuilder.append(216);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this._bufferBuilder.append(217);
          this.pack_uint32(length);
        } else throw new Error("Invalid length");
        this._bufferBuilder.append_buffer(encoded);
      }
      pack_array(ary) {
        const length = ary.length;
        if (length <= 15) this.pack_uint8(144 + length);
        else if (length <= 65535) {
          this._bufferBuilder.append(220);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this._bufferBuilder.append(221);
          this.pack_uint32(length);
        } else throw new Error("Invalid length");
        const packNext = (index) => {
          if (index < length) {
            const res = this.pack(ary[index]);
            if (res instanceof Promise) return res.then(() => packNext(index + 1));
            return packNext(index + 1);
          }
        };
        return packNext(0);
      }
      pack_integer(num) {
        if (num >= -32 && num <= 127) this._bufferBuilder.append(num & 255);
        else if (num >= 0 && num <= 255) {
          this._bufferBuilder.append(204);
          this.pack_uint8(num);
        } else if (num >= -128 && num <= 127) {
          this._bufferBuilder.append(208);
          this.pack_int8(num);
        } else if (num >= 0 && num <= 65535) {
          this._bufferBuilder.append(205);
          this.pack_uint16(num);
        } else if (num >= -32768 && num <= 32767) {
          this._bufferBuilder.append(209);
          this.pack_int16(num);
        } else if (num >= 0 && num <= 4294967295) {
          this._bufferBuilder.append(206);
          this.pack_uint32(num);
        } else if (num >= -2147483648 && num <= 2147483647) {
          this._bufferBuilder.append(210);
          this.pack_int32(num);
        } else if (num >= -9223372036854776e3 && num <= 9223372036854776e3) {
          this._bufferBuilder.append(211);
          this.pack_int64(num);
        } else if (num >= 0 && num <= 18446744073709552e3) {
          this._bufferBuilder.append(207);
          this.pack_uint64(num);
        } else throw new Error("Invalid integer");
      }
      pack_double(num) {
        let sign = 0;
        if (num < 0) {
          sign = 1;
          num = -num;
        }
        const exp = Math.floor(Math.log(num) / Math.LN2);
        const frac0 = num / 2 ** exp - 1;
        const frac1 = Math.floor(frac0 * 2 ** 52);
        const b32 = 2 ** 32;
        const h32 = sign << 31 | exp + 1023 << 20 | frac1 / b32 & 1048575;
        const l32 = frac1 % b32;
        this._bufferBuilder.append(203);
        this.pack_int32(h32);
        this.pack_int32(l32);
      }
      pack_object(obj) {
        const keys = Object.keys(obj);
        const length = keys.length;
        if (length <= 15) this.pack_uint8(128 + length);
        else if (length <= 65535) {
          this._bufferBuilder.append(222);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this._bufferBuilder.append(223);
          this.pack_uint32(length);
        } else throw new Error("Invalid length");
        const packNext = (index) => {
          if (index < keys.length) {
            const prop = keys[index];
            if (obj.hasOwnProperty(prop)) {
              this.pack(prop);
              const res = this.pack(obj[prop]);
              if (res instanceof Promise) return res.then(() => packNext(index + 1));
            }
            return packNext(index + 1);
          }
        };
        return packNext(0);
      }
      pack_uint8(num) {
        this._bufferBuilder.append(num);
      }
      pack_uint16(num) {
        this._bufferBuilder.append(num >> 8);
        this._bufferBuilder.append(num & 255);
      }
      pack_uint32(num) {
        const n = num & 4294967295;
        this._bufferBuilder.append((n & 4278190080) >>> 24);
        this._bufferBuilder.append((n & 16711680) >>> 16);
        this._bufferBuilder.append((n & 65280) >>> 8);
        this._bufferBuilder.append(n & 255);
      }
      pack_uint64(num) {
        const high = num / 2 ** 32;
        const low = num % 2 ** 32;
        this._bufferBuilder.append((high & 4278190080) >>> 24);
        this._bufferBuilder.append((high & 16711680) >>> 16);
        this._bufferBuilder.append((high & 65280) >>> 8);
        this._bufferBuilder.append(high & 255);
        this._bufferBuilder.append((low & 4278190080) >>> 24);
        this._bufferBuilder.append((low & 16711680) >>> 16);
        this._bufferBuilder.append((low & 65280) >>> 8);
        this._bufferBuilder.append(low & 255);
      }
      pack_int8(num) {
        this._bufferBuilder.append(num & 255);
      }
      pack_int16(num) {
        this._bufferBuilder.append((num & 65280) >> 8);
        this._bufferBuilder.append(num & 255);
      }
      pack_int32(num) {
        this._bufferBuilder.append(num >>> 24 & 255);
        this._bufferBuilder.append((num & 16711680) >>> 16);
        this._bufferBuilder.append((num & 65280) >>> 8);
        this._bufferBuilder.append(num & 255);
      }
      pack_int64(num) {
        const high = Math.floor(num / 2 ** 32);
        const low = num % 2 ** 32;
        this._bufferBuilder.append((high & 4278190080) >>> 24);
        this._bufferBuilder.append((high & 16711680) >>> 16);
        this._bufferBuilder.append((high & 65280) >>> 8);
        this._bufferBuilder.append(high & 255);
        this._bufferBuilder.append((low & 4278190080) >>> 24);
        this._bufferBuilder.append((low & 16711680) >>> 16);
        this._bufferBuilder.append((low & 65280) >>> 8);
        this._bufferBuilder.append(low & 255);
      }
      constructor() {
        this._bufferBuilder = new (0, $e8379818650e2442$export$93654d4f2d6cd524)();
        this._textEncoder = new TextEncoder();
      }
    };
  }
});

// node_modules/webrtc-adapter/src/js/utils.js
function extractVersion(uastring, expr, pos) {
  const match = uastring.match(expr);
  return match && match.length >= pos && parseFloat(match[pos], 10);
}
function wrapPeerConnectionEvent(window2, eventNameToWrap, wrapper) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const addEventListener = Object.getOwnPropertyDescriptor(
    EventTarget.prototype,
    "addEventListener"
  );
  if (!addEventListener.writable) {
    log("Unable to polyfill events");
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  const nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    const wrappedCallback = (e) => {
      const modifiedEvent = wrapper(e);
      if (modifiedEvent) {
        if (cb.handleEvent) {
          cb.handleEvent(modifiedEvent);
        } else {
          cb(modifiedEvent);
        }
      }
    };
    this._eventMap = this._eventMap || {};
    if (!this._eventMap[eventNameToWrap]) {
      this._eventMap[eventNameToWrap] = /* @__PURE__ */ new Map();
    }
    this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
    return nativeAddEventListener.apply(this, [
      nativeEventName,
      wrappedCallback
    ]);
  };
  const nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    if (!this._eventMap[eventNameToWrap].has(cb)) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
    this._eventMap[eventNameToWrap].delete(cb);
    if (this._eventMap[eventNameToWrap].size === 0) {
      delete this._eventMap[eventNameToWrap];
    }
    if (Object.keys(this._eventMap).length === 0) {
      delete this._eventMap;
    }
    return nativeRemoveEventListener.apply(this, [
      nativeEventName,
      unwrappedCb
    ]);
  };
  Object.defineProperty(proto, "on" + eventNameToWrap, {
    get() {
      return this["_on" + eventNameToWrap];
    },
    set(cb) {
      if (this["_on" + eventNameToWrap]) {
        this.removeEventListener(
          eventNameToWrap,
          this["_on" + eventNameToWrap]
        );
        delete this["_on" + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(
          eventNameToWrap,
          this["_on" + eventNameToWrap] = cb
        );
      }
    },
    enumerable: true,
    configurable: true
  });
}
function disableLog(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  logDisabled_ = bool;
  return bool ? "adapter.js logging disabled" : "adapter.js logging enabled";
}
function disableWarnings(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  deprecationWarnings_ = !bool;
  return "adapter.js deprecation warnings " + (bool ? "disabled" : "enabled");
}
function log() {
  if (typeof window === "object") {
    if (logDisabled_) {
      return;
    }
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log.apply(console, arguments);
    }
  }
}
function deprecated(oldMethod, newMethod) {
  if (!deprecationWarnings_) {
    return;
  }
  console.warn(oldMethod + " is deprecated, please use " + newMethod + " instead.");
}
function detectBrowser(window2) {
  const result = { browser: null, version: null };
  if (typeof window2 === "undefined" || !window2.navigator || !window2.navigator.userAgent) {
    result.browser = "Not a browser.";
    return result;
  }
  const { navigator: navigator2 } = window2;
  if (navigator2.userAgentData && navigator2.userAgentData.brands) {
    const chromium = navigator2.userAgentData.brands.find((brand) => {
      return brand.brand === "Chromium";
    });
    if (chromium) {
      const version = parseInt(chromium.version, 10);
      if (version >= 90) {
        return { browser: "chrome", version };
      }
    }
  }
  if (navigator2.mozGetUserMedia) {
    result.browser = "firefox";
    result.version = parseInt(extractVersion(
      navigator2.userAgent,
      /Firefox\/(\d+)\./,
      1
    ));
  } else if (navigator2.webkitGetUserMedia || window2.isSecureContext === false && window2.webkitRTCPeerConnection) {
    result.browser = "chrome";
    result.version = parseInt(extractVersion(
      navigator2.userAgent,
      /Chrom(e|ium)\/(\d+)\./,
      2
    )) || null;
  } else if (window2.RTCPeerConnection && navigator2.userAgent.match(/AppleWebKit\/(\d+)\./)) {
    result.browser = "safari";
    result.version = parseInt(extractVersion(
      navigator2.userAgent,
      /AppleWebKit\/(\d+)\./,
      1
    ));
    result.supportsUnifiedPlan = window2.RTCRtpTransceiver && "currentDirection" in window2.RTCRtpTransceiver.prototype;
    result._safariVersion = extractVersion(
      navigator2.userAgent,
      /Version\/(\d+(\.?\d+))/,
      1
    );
  } else {
    result.browser = "Not a supported browser.";
    return result;
  }
  return result;
}
function isObject(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
}
function compactObject(data) {
  if (!isObject(data)) {
    return data;
  }
  return Object.keys(data).reduce(function(accumulator, key) {
    const isObj = isObject(data[key]);
    const value = isObj ? compactObject(data[key]) : data[key];
    const isEmptyObject = isObj && !Object.keys(value).length;
    if (value === void 0 || isEmptyObject) {
      return accumulator;
    }
    return Object.assign(accumulator, { [key]: value });
  }, {});
}
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach((name) => {
    if (name.endsWith("Id")) {
      walkStats(stats, stats.get(base[name]), resultSet);
    } else if (name.endsWith("Ids")) {
      base[name].forEach((id) => {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}
function filterStats(result, track, outbound) {
  const streamStatsType = outbound ? "outbound-rtp" : "inbound-rtp";
  const filteredResult = /* @__PURE__ */ new Map();
  if (track === null) {
    return filteredResult;
  }
  const trackStats = [];
  result.forEach((value) => {
    if (value.type === "track" && value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach((trackStat) => {
    result.forEach((stats) => {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}
var logDisabled_, deprecationWarnings_;
var init_utils2 = __esm({
  "node_modules/webrtc-adapter/src/js/utils.js"() {
    "use strict";
    logDisabled_ = true;
    deprecationWarnings_ = true;
  }
});

// node_modules/webrtc-adapter/src/js/chrome/getusermedia.js
function shimGetUserMedia(window2, browserDetails) {
  if (browserDetails.version >= 64) {
    return;
  }
  const navigator2 = window2 && window2.navigator;
  if (!navigator2.mediaDevices) {
    return;
  }
  const constraintsToChrome_ = function(c) {
    if (typeof c !== "object" || c.mandatory || c.optional) {
      return c;
    }
    const cc = {};
    Object.keys(c).forEach((key) => {
      if (key === "require" || key === "advanced" || key === "mediaSource") {
        return;
      }
      const r = typeof c[key] === "object" ? c[key] : { ideal: c[key] };
      if (r.exact !== void 0 && typeof r.exact === "number") {
        r.min = r.max = r.exact;
      }
      const oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return name === "deviceId" ? "sourceId" : name;
      };
      if (r.ideal !== void 0) {
        cc.optional = cc.optional || [];
        let oc = {};
        if (typeof r.ideal === "number") {
          oc[oldname_("min", key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_("max", key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_("", key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== void 0 && typeof r.exact !== "number") {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_("", key)] = r.exact;
      } else {
        ["min", "max"].forEach((mix) => {
          if (r[mix] !== void 0) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };
  const shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === "object") {
      const remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, "autoGainControl", "googAutoGainControl");
      remap(constraints.audio, "noiseSuppression", "googNoiseSuppression");
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === "object") {
      let face = constraints.video.facingMode;
      face = face && (typeof face === "object" ? face : { ideal: face });
      const getSupportedFacingModeLies = browserDetails.version < 66;
      if (face && (face.exact === "user" || face.exact === "environment" || face.ideal === "user" || face.ideal === "environment") && !(navigator2.mediaDevices.getSupportedConstraints && navigator2.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        let matches;
        if (face.exact === "environment" || face.ideal === "environment") {
          matches = ["back", "rear"];
        } else if (face.exact === "user" || face.ideal === "user") {
          matches = ["front"];
        }
        if (matches) {
          return navigator2.mediaDevices.enumerateDevices().then((devices) => {
            devices = devices.filter((d) => d.kind === "videoinput");
            let dev = devices.find((d) => matches.some((match) => d.label.toLowerCase().includes(match)));
            if (!dev && devices.length && matches.includes("back")) {
              dev = devices[devices.length - 1];
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging("chrome: " + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging("chrome: " + JSON.stringify(constraints));
    return func(constraints);
  };
  const shimError_ = function(e) {
    if (browserDetails.version >= 64) {
      return e;
    }
    return {
      name: {
        PermissionDeniedError: "NotAllowedError",
        PermissionDismissedError: "NotAllowedError",
        InvalidStateError: "NotAllowedError",
        DevicesNotFoundError: "NotFoundError",
        ConstraintNotSatisfiedError: "OverconstrainedError",
        TrackStartError: "NotReadableError",
        MediaDeviceFailedDueToShutdown: "NotAllowedError",
        MediaDeviceKillSwitchOn: "NotAllowedError",
        TabCaptureError: "AbortError",
        ScreenCaptureError: "AbortError",
        DeviceCaptureError: "AbortError"
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint || e.constraintName,
      toString() {
        return this.name + (this.message && ": ") + this.message;
      }
    };
  };
  const getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, (c) => {
      navigator2.webkitGetUserMedia(c, onSuccess, (e) => {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };
  navigator2.getUserMedia = getUserMedia_.bind(navigator2);
  if (navigator2.mediaDevices.getUserMedia) {
    const origGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, (c) => origGetUserMedia(c).then((stream) => {
        if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          throw new DOMException("", "NotFoundError");
        }
        return stream;
      }, (e) => Promise.reject(shimError_(e))));
    };
  }
}
var logging;
var init_getusermedia = __esm({
  "node_modules/webrtc-adapter/src/js/chrome/getusermedia.js"() {
    "use strict";
    init_utils2();
    logging = log;
  }
});

// node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
var chrome_shim_exports = {};
__export(chrome_shim_exports, {
  fixNegotiationNeeded: () => fixNegotiationNeeded,
  shimAddTrackRemoveTrack: () => shimAddTrackRemoveTrack,
  shimAddTrackRemoveTrackWithNative: () => shimAddTrackRemoveTrackWithNative,
  shimGetSendersWithDtmf: () => shimGetSendersWithDtmf,
  shimGetUserMedia: () => shimGetUserMedia,
  shimMediaStream: () => shimMediaStream,
  shimOnTrack: () => shimOnTrack,
  shimPeerConnection: () => shimPeerConnection,
  shimSenderReceiverGetStats: () => shimSenderReceiverGetStats
});
function shimMediaStream(window2) {
  window2.MediaStream = window2.MediaStream || window2.webkitMediaStream;
}
function shimOnTrack(window2, browserDetails) {
  if (browserDetails.version > 102) {
    return;
  }
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("ontrack" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "ontrack", {
      get() {
        return this._ontrack;
      },
      set(f) {
        if (this._ontrack) {
          this.removeEventListener("track", this._ontrack);
        }
        this.addEventListener("track", this._ontrack = f);
      },
      enumerable: true,
      configurable: true
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      if (!this._ontrackpoly) {
        this._ontrackpoly = (e) => {
          e.stream.addEventListener("addtrack", (te) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r) => r.track && r.track.id === te.track.id);
            } else {
              receiver = { track: te.track };
            }
            const event = new Event("track");
            event.track = te.track;
            event.receiver = receiver;
            event.transceiver = { receiver };
            event.streams = [e.stream];
            this.dispatchEvent(event);
          });
          e.stream.getTracks().forEach((track) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r) => r.track && r.track.id === track.id);
            } else {
              receiver = { track };
            }
            const event = new Event("track");
            event.track = track;
            event.receiver = receiver;
            event.transceiver = { receiver };
            event.streams = [e.stream];
            this.dispatchEvent(event);
          });
        };
        this.addEventListener("addstream", this._ontrackpoly);
      }
      return origSetRemoteDescription.apply(this, arguments);
    };
  } else {
    wrapPeerConnectionEvent(window2, "track", (e) => {
      if (!e.transceiver) {
        Object.defineProperty(
          e,
          "transceiver",
          { value: { receiver: e.receiver } }
        );
      }
      return e;
    });
  }
}
function shimGetSendersWithDtmf(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("getSenders" in window2.RTCPeerConnection.prototype) && "createDTMFSender" in window2.RTCPeerConnection.prototype) {
    const shimSenderWithDtmf = function(pc, track) {
      return {
        track,
        get dtmf() {
          if (this._dtmf === void 0) {
            if (track.kind === "audio") {
              this._dtmf = pc.createDTMFSender(track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        },
        _pc: pc
      };
    };
    if (!window2.RTCPeerConnection.prototype.getSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        this._senders = this._senders || [];
        return this._senders.slice();
      };
      const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
      window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
        let sender = origAddTrack.apply(this, arguments);
        if (!sender) {
          sender = shimSenderWithDtmf(this, track);
          this._senders.push(sender);
        }
        return sender;
      };
      const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
      window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
        origRemoveTrack.apply(this, arguments);
        const idx = this._senders.indexOf(sender);
        if (idx !== -1) {
          this._senders.splice(idx, 1);
        }
      };
    }
    const origAddStream = window2.RTCPeerConnection.prototype.addStream;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._senders = this._senders || [];
      origAddStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        this._senders.push(shimSenderWithDtmf(this, track));
      });
    };
    const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._senders = this._senders || [];
      origRemoveStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        const sender = this._senders.find((s) => s.track === track);
        if (sender) {
          this._senders.splice(this._senders.indexOf(sender), 1);
        }
      });
    };
  } else if (typeof window2 === "object" && window2.RTCPeerConnection && "getSenders" in window2.RTCPeerConnection.prototype && "createDTMFSender" in window2.RTCPeerConnection.prototype && window2.RTCRtpSender && !("dtmf" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
    Object.defineProperty(window2.RTCRtpSender.prototype, "dtmf", {
      get() {
        if (this._dtmf === void 0) {
          if (this.track.kind === "audio") {
            this._dtmf = this._pc.createDTMFSender(this.track);
          } else {
            this._dtmf = null;
          }
        }
        return this._dtmf;
      }
    });
  }
}
function shimSenderReceiverGetStats(window2, browserDetails) {
  if (browserDetails.version >= 67) {
    return;
  }
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender && window2.RTCRtpReceiver)) {
    return;
  }
  if (!("getStats" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach((sender) => sender._pc = this);
        return senders;
      };
    }
    const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
        const sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window2.RTCRtpSender.prototype.getStats = function getStats() {
      const sender = this;
      return this._pc.getStats().then((result) => (
        /* Note: this will include stats of all senders that
         *   send a track with the same id as sender.track as
         *   it is not possible to identify the RTCRtpSender.
         */
        filterStats(result, sender.track, true)
      ));
    };
  }
  if (!("getStats" in window2.RTCRtpReceiver.prototype)) {
    const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
        const receivers = origGetReceivers.apply(this, []);
        receivers.forEach((receiver) => receiver._pc = this);
        return receivers;
      };
    }
    wrapPeerConnectionEvent(window2, "track", (e) => {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window2.RTCRtpReceiver.prototype.getStats = function getStats() {
      const receiver = this;
      return this._pc.getStats().then((result) => filterStats(result, receiver.track, false));
    };
  }
  if (!("getStats" in window2.RTCRtpSender.prototype && "getStats" in window2.RTCRtpReceiver.prototype)) {
    return;
  }
  const origGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    if (arguments.length > 0 && arguments[0] instanceof window2.MediaStreamTrack) {
      const track = arguments[0];
      let sender;
      let receiver;
      let err;
      this.getSenders().forEach((s) => {
        if (s.track === track) {
          if (sender) {
            err = true;
          } else {
            sender = s;
          }
        }
      });
      this.getReceivers().forEach((r) => {
        if (r.track === track) {
          if (receiver) {
            err = true;
          } else {
            receiver = r;
          }
        }
        return r.track === track;
      });
      if (err || sender && receiver) {
        return Promise.reject(new DOMException(
          "There are more than one sender or receiver for the track.",
          "InvalidAccessError"
        ));
      } else if (sender) {
        return sender.getStats();
      } else if (receiver) {
        return receiver.getStats();
      }
      return Promise.reject(new DOMException(
        "There is no sender or receiver for the track.",
        "InvalidAccessError"
      ));
    }
    return origGetStats.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrackWithNative(window2) {
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    return Object.keys(this._shimmedLocalStreams).map((streamId) => this._shimmedLocalStreams[streamId][0]);
  };
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (!stream) {
      return origAddTrack.apply(this, arguments);
    }
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    const sender = origAddTrack.apply(this, arguments);
    if (!this._shimmedLocalStreams[stream.id]) {
      this._shimmedLocalStreams[stream.id] = [stream, sender];
    } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
      this._shimmedLocalStreams[stream.id].push(sender);
    }
    return sender;
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException(
          "Track already exists.",
          "InvalidAccessError"
        );
      }
    });
    const existingSenders = this.getSenders();
    origAddStream.apply(this, arguments);
    const newSenders = this.getSenders().filter((newSender) => existingSenders.indexOf(newSender) === -1);
    this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    delete this._shimmedLocalStreams[stream.id];
    return origRemoveStream.apply(this, arguments);
  };
  const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    if (sender) {
      Object.keys(this._shimmedLocalStreams).forEach((streamId) => {
        const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
        if (idx !== -1) {
          this._shimmedLocalStreams[streamId].splice(idx, 1);
        }
        if (this._shimmedLocalStreams[streamId].length === 1) {
          delete this._shimmedLocalStreams[streamId];
        }
      });
    }
    return origRemoveTrack.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrack(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (window2.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
    return shimAddTrackRemoveTrackWithNative(window2);
  }
  const origGetLocalStreams = window2.RTCPeerConnection.prototype.getLocalStreams;
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    const nativeStreams = origGetLocalStreams.apply(this);
    this._reverseStreams = this._reverseStreams || {};
    return nativeStreams.map((stream) => this._reverseStreams[stream.id]);
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException(
          "Track already exists.",
          "InvalidAccessError"
        );
      }
    });
    if (!this._reverseStreams[stream.id]) {
      const newStream = new window2.MediaStream(stream.getTracks());
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      stream = newStream;
    }
    origAddStream.apply(this, [stream]);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
    delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
    delete this._streams[stream.id];
  };
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (this.signalingState === "closed") {
      throw new DOMException(
        "The RTCPeerConnection's signalingState is 'closed'.",
        "InvalidStateError"
      );
    }
    const streams = [].slice.call(arguments, 1);
    if (streams.length !== 1 || !streams[0].getTracks().find((t) => t === track)) {
      throw new DOMException(
        "The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.",
        "NotSupportedError"
      );
    }
    const alreadyExists = this.getSenders().find((s) => s.track === track);
    if (alreadyExists) {
      throw new DOMException(
        "Track already exists.",
        "InvalidAccessError"
      );
    }
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    const oldStream = this._streams[stream.id];
    if (oldStream) {
      oldStream.addTrack(track);
      Promise.resolve().then(() => {
        this.dispatchEvent(new Event("negotiationneeded"));
      });
    } else {
      const newStream = new window2.MediaStream([track]);
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      this.addStream(newStream);
    }
    return this.getSenders().find((s) => s.track === track);
  };
  function replaceInternalStreamId(pc, description) {
    let sdp2 = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp2 = sdp2.replace(
        new RegExp(internalStream.id, "g"),
        externalStream.id
      );
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp: sdp2
    });
  }
  function replaceExternalStreamId(pc, description) {
    let sdp2 = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp2 = sdp2.replace(
        new RegExp(externalStream.id, "g"),
        internalStream.id
      );
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp: sdp2
    });
  }
  ["createOffer", "createAnswer"].forEach(function(method) {
    const nativeMethod = window2.RTCPeerConnection.prototype[method];
    const methodObj = { [method]() {
      const args = arguments;
      const isLegacyCall = arguments.length && typeof arguments[0] === "function";
      if (isLegacyCall) {
        return nativeMethod.apply(this, [
          (description) => {
            const desc = replaceInternalStreamId(this, description);
            args[0].apply(null, [desc]);
          },
          (err) => {
            if (args[1]) {
              args[1].apply(null, err);
            }
          },
          arguments[2]
        ]);
      }
      return nativeMethod.apply(this, arguments).then((description) => replaceInternalStreamId(this, description));
    } };
    window2.RTCPeerConnection.prototype[method] = methodObj[method];
  });
  const origSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    if (!arguments.length || !arguments[0].type) {
      return origSetLocalDescription.apply(this, arguments);
    }
    arguments[0] = replaceExternalStreamId(this, arguments[0]);
    return origSetLocalDescription.apply(this, arguments);
  };
  const origLocalDescription = Object.getOwnPropertyDescriptor(
    window2.RTCPeerConnection.prototype,
    "localDescription"
  );
  Object.defineProperty(
    window2.RTCPeerConnection.prototype,
    "localDescription",
    {
      get() {
        const description = origLocalDescription.get.apply(this);
        if (description.type === "") {
          return description;
        }
        return replaceInternalStreamId(this, description);
      }
    }
  );
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    if (this.signalingState === "closed") {
      throw new DOMException(
        "The RTCPeerConnection's signalingState is 'closed'.",
        "InvalidStateError"
      );
    }
    if (!sender._pc) {
      throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
    }
    const isLocal = sender._pc === this;
    if (!isLocal) {
      throw new DOMException(
        "Sender was not created by this connection.",
        "InvalidAccessError"
      );
    }
    this._streams = this._streams || {};
    let stream;
    Object.keys(this._streams).forEach((streamid) => {
      const hasTrack = this._streams[streamid].getTracks().find((track) => sender.track === track);
      if (hasTrack) {
        stream = this._streams[streamid];
      }
    });
    if (stream) {
      if (stream.getTracks().length === 1) {
        this.removeStream(this._reverseStreams[stream.id]);
      } else {
        stream.removeTrack(sender.track);
      }
      this.dispatchEvent(new Event("negotiationneeded"));
    }
  };
}
function shimPeerConnection(window2, browserDetails) {
  if (!window2.RTCPeerConnection && window2.webkitRTCPeerConnection) {
    window2.RTCPeerConnection = window2.webkitRTCPeerConnection;
  }
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
        return nativeMethod.apply(this, arguments);
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
}
function fixNegotiationNeeded(window2, browserDetails) {
  if (browserDetails.version > 102) {
    return;
  }
  wrapPeerConnectionEvent(window2, "negotiationneeded", (e) => {
    const pc = e.target;
    if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === "plan-b") {
      if (pc.signalingState !== "stable") {
        return;
      }
    }
    return e;
  });
}
var init_chrome_shim = __esm({
  "node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js"() {
    "use strict";
    init_utils2();
    init_getusermedia();
  }
});

// node_modules/webrtc-adapter/src/js/firefox/getusermedia.js
function shimGetUserMedia2(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  if (!navigator2.mediaDevices) {
    return;
  }
  const MediaStreamTrack = window2 && window2.MediaStreamTrack;
  navigator2.getUserMedia = function(constraints, onSuccess, onError) {
    deprecated(
      "navigator.getUserMedia",
      "navigator.mediaDevices.getUserMedia"
    );
    navigator2.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
  if (!(browserDetails.version > 55 && "autoGainControl" in navigator2.mediaDevices.getSupportedConstraints())) {
    const remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };
    const nativeGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(c) {
      if (typeof c === "object" && typeof c.audio === "object") {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, "autoGainControl", "mozAutoGainControl");
        remap(c.audio, "noiseSuppression", "mozNoiseSuppression");
      }
      return nativeGetUserMedia(c);
    };
    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        const obj = nativeGetSettings.apply(this, arguments);
        remap(obj, "mozAutoGainControl", "autoGainControl");
        remap(obj, "mozNoiseSuppression", "noiseSuppression");
        return obj;
      };
    }
    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      const nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === "audio" && typeof c === "object") {
          c = JSON.parse(JSON.stringify(c));
          remap(c, "autoGainControl", "mozAutoGainControl");
          remap(c, "noiseSuppression", "mozNoiseSuppression");
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
}
var init_getusermedia2 = __esm({
  "node_modules/webrtc-adapter/src/js/firefox/getusermedia.js"() {
    "use strict";
    init_utils2();
  }
});

// node_modules/webrtc-adapter/src/js/firefox/getdisplaymedia.js
function shimGetDisplayMedia(window2, preferredMediaSource) {
  if (!window2.navigator.mediaDevices) {
    return;
  }
  if (window2.navigator.mediaDevices && "getDisplayMedia" in window2.navigator.mediaDevices) {
    return;
  }
  window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
    if (!(constraints && constraints.video)) {
      const err = new DOMException("getDisplayMedia without video constraints is undefined");
      err.name = "NotFoundError";
      err.code = 8;
      return Promise.reject(err);
    }
    if (constraints.video === true) {
      constraints.video = { mediaSource: preferredMediaSource };
    } else {
      constraints.video.mediaSource = preferredMediaSource;
    }
    return window2.navigator.mediaDevices.getUserMedia(constraints);
  };
}
var init_getdisplaymedia = __esm({
  "node_modules/webrtc-adapter/src/js/firefox/getdisplaymedia.js"() {
    "use strict";
  }
});

// node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
var firefox_shim_exports = {};
__export(firefox_shim_exports, {
  shimAddTransceiver: () => shimAddTransceiver,
  shimCreateAnswer: () => shimCreateAnswer,
  shimCreateOffer: () => shimCreateOffer,
  shimGetDisplayMedia: () => shimGetDisplayMedia,
  shimGetParameters: () => shimGetParameters,
  shimGetStats: () => shimGetStats,
  shimGetUserMedia: () => shimGetUserMedia2,
  shimOnTrack: () => shimOnTrack2,
  shimPeerConnection: () => shimPeerConnection2,
  shimRTCDataChannel: () => shimRTCDataChannel,
  shimReceiverGetStats: () => shimReceiverGetStats,
  shimRemoveStream: () => shimRemoveStream,
  shimSenderGetStats: () => shimSenderGetStats
});
function shimOnTrack2(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      }
    });
  }
}
function shimPeerConnection2(window2, browserDetails) {
  if (typeof window2 !== "object" || !(window2.RTCPeerConnection || window2.mozRTCPeerConnection)) {
    return;
  }
  if (!window2.RTCPeerConnection && window2.mozRTCPeerConnection) {
    window2.RTCPeerConnection = window2.mozRTCPeerConnection;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
        return nativeMethod.apply(this, arguments);
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
}
function shimGetStats(window2, browserDetails) {
  if (typeof window2 !== "object" || !(window2.RTCPeerConnection || window2.mozRTCPeerConnection)) {
    return;
  }
  if (browserDetails.version >= 151) {
    return;
  }
  const modernStatsTypes = {
    inboundrtp: "inbound-rtp",
    outboundrtp: "outbound-rtp",
    candidatepair: "candidate-pair",
    localcandidate: "local-candidate",
    remotecandidate: "remote-candidate"
  };
  const nativeGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    if (this.signalingState === "closed") {
      return Promise.resolve(/* @__PURE__ */ new Map());
    }
    return nativeGetStats.apply(this, [selector || null]).then((stats) => {
      if (browserDetails.version < 53 && !onSucc) {
        try {
          stats.forEach((stat) => {
            stat.type = modernStatsTypes[stat.type] || stat.type;
          });
        } catch (e) {
          if (e.name !== "TypeError") {
            throw e;
          }
          stats.forEach((stat, i) => {
            stats.set(i, Object.assign({}, stat, {
              type: modernStatsTypes[stat.type] || stat.type
            }));
          });
        }
      }
      return stats;
    }).then(onSucc, onErr);
  };
}
function shimSenderGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && "getStats" in window2.RTCRtpSender.prototype) {
    return;
  }
  const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
  if (origGetSenders) {
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
  }
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  if (origAddTrack) {
    window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
      const sender = origAddTrack.apply(this, arguments);
      sender._pc = this;
      return sender;
    };
  }
  window2.RTCRtpSender.prototype.getStats = function getStats() {
    return this.track ? this._pc.getStats(this.track) : Promise.resolve(/* @__PURE__ */ new Map());
  };
}
function shimReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && "getStats" in window2.RTCRtpReceiver.prototype) {
    return;
  }
  const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
  if (origGetReceivers) {
    window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
      const receivers = origGetReceivers.apply(this, []);
      receivers.forEach((receiver) => receiver._pc = this);
      return receivers;
    };
  }
  wrapPeerConnectionEvent(window2, "track", (e) => {
    e.receiver._pc = e.srcElement;
    return e;
  });
  window2.RTCRtpReceiver.prototype.getStats = function getStats() {
    return this._pc.getStats(this.track);
  };
}
function shimRemoveStream(window2) {
  if (!window2.RTCPeerConnection || "removeStream" in window2.RTCPeerConnection.prototype) {
    return;
  }
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    deprecated("removeStream", "removeTrack");
    this.getSenders().forEach((sender) => {
      if (sender.track && stream.getTracks().includes(sender.track)) {
        this.removeTrack(sender);
      }
    });
  };
}
function shimRTCDataChannel(window2) {
  if (window2.DataChannel && !window2.RTCDataChannel) {
    window2.RTCDataChannel = window2.DataChannel;
  }
}
function shimAddTransceiver(window2, browserDetails) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  if (browserDetails.version >= 110) {
    return;
  }
  const origAddTransceiver = window2.RTCPeerConnection.prototype.addTransceiver;
  if (origAddTransceiver) {
    window2.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
      this.setParametersPromises = [];
      let sendEncodings = arguments[1] && arguments[1].sendEncodings;
      if (sendEncodings === void 0) {
        sendEncodings = [];
      }
      sendEncodings = [...sendEncodings];
      const shouldPerformCheck = sendEncodings.length > 0;
      if (shouldPerformCheck) {
        sendEncodings.forEach((encodingParam) => {
          if ("rid" in encodingParam) {
            const ridRegex = /^[a-z0-9]{0,16}$/i;
            if (!ridRegex.test(encodingParam.rid)) {
              throw new TypeError("Invalid RID value provided.");
            }
          }
          if ("scaleResolutionDownBy" in encodingParam) {
            if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1)) {
              throw new RangeError("scale_resolution_down_by must be >= 1.0");
            }
          }
          if ("maxFramerate" in encodingParam) {
            if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
              throw new RangeError("max_framerate must be >= 0.0");
            }
          }
        });
      }
      const transceiver = origAddTransceiver.apply(this, arguments);
      if (shouldPerformCheck) {
        const { sender } = transceiver;
        const params = sender.getParameters();
        if (!("encodings" in params) || // Avoid being fooled by patched getParameters() below.
        params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
          params.encodings = sendEncodings;
          sender.sendEncodings = sendEncodings;
          this.setParametersPromises.push(
            sender.setParameters(params).then(() => {
              delete sender.sendEncodings;
            }).catch(() => {
              delete sender.sendEncodings;
            })
          );
        }
      }
      return transceiver;
    };
  }
}
function shimGetParameters(window2, browserDetails) {
  if (!(typeof window2 === "object" && window2.RTCRtpSender)) {
    return;
  }
  if (browserDetails.version >= 110) {
    return;
  }
  const origGetParameters = window2.RTCRtpSender.prototype.getParameters;
  if (origGetParameters) {
    window2.RTCRtpSender.prototype.getParameters = function getParameters() {
      const params = origGetParameters.apply(this, arguments);
      if (!("encodings" in params)) {
        params.encodings = [].concat(this.sendEncodings || [{}]);
      }
      return params;
    };
  }
}
function shimCreateOffer(window2, browserDetails) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  if (browserDetails.version >= 110) {
    return;
  }
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateOffer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimCreateAnswer(window2, browserDetails) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  if (browserDetails.version >= 110) {
    return;
  }
  const origCreateAnswer = window2.RTCPeerConnection.prototype.createAnswer;
  window2.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateAnswer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateAnswer.apply(this, arguments);
  };
}
var init_firefox_shim = __esm({
  "node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js"() {
    "use strict";
    init_utils2();
    init_getusermedia2();
    init_getdisplaymedia();
  }
});

// node_modules/webrtc-adapter/src/js/safari/safari_shim.js
var safari_shim_exports = {};
__export(safari_shim_exports, {
  shimAudioContext: () => shimAudioContext,
  shimCallbacksAPI: () => shimCallbacksAPI,
  shimConstraints: () => shimConstraints,
  shimCreateOfferLegacy: () => shimCreateOfferLegacy,
  shimGetUserMedia: () => shimGetUserMedia3,
  shimLocalStreamsAPI: () => shimLocalStreamsAPI,
  shimRTCIceServerUrls: () => shimRTCIceServerUrls,
  shimRemoteStreamsAPI: () => shimRemoteStreamsAPI,
  shimTrackEventTransceiver: () => shimTrackEventTransceiver
});
function shimLocalStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getLocalStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      return this._localStreams;
    };
  }
  if (!("addStream" in window2.RTCPeerConnection.prototype)) {
    const _addTrack = window2.RTCPeerConnection.prototype.addTrack;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      if (!this._localStreams.includes(stream)) {
        this._localStreams.push(stream);
      }
      stream.getAudioTracks().forEach((track) => _addTrack.call(
        this,
        track,
        stream
      ));
      stream.getVideoTracks().forEach((track) => _addTrack.call(
        this,
        track,
        stream
      ));
    };
    window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, ...streams) {
      if (streams) {
        streams.forEach((stream) => {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (!this._localStreams.includes(stream)) {
            this._localStreams.push(stream);
          }
        });
      }
      return _addTrack.apply(this, arguments);
    };
  }
  if (!("removeStream" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      const index = this._localStreams.indexOf(stream);
      if (index === -1) {
        return;
      }
      this._localStreams.splice(index, 1);
      const tracks = stream.getTracks();
      this.getSenders().forEach((sender) => {
        if (tracks.includes(sender.track)) {
          this.removeTrack(sender);
        }
      });
    };
  }
}
function shimRemoteStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getRemoteStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
      return this._remoteStreams ? this._remoteStreams : [];
    };
  }
  if (!("onaddstream" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream;
      },
      set(f) {
        if (this._onaddstream) {
          this.removeEventListener("addstream", this._onaddstream);
          this.removeEventListener("track", this._onaddstreampoly);
        }
        this.addEventListener("addstream", this._onaddstream = f);
        this.addEventListener("track", this._onaddstreampoly = (e) => {
          e.streams.forEach((stream) => {
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.includes(stream)) {
              return;
            }
            this._remoteStreams.push(stream);
            const event = new Event("addstream");
            event.stream = stream;
            this.dispatchEvent(event);
          });
        });
      }
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      const pc = this;
      if (!this._onaddstreampoly) {
        this.addEventListener("track", this._onaddstreampoly = function(e) {
          e.streams.forEach((stream) => {
            if (!pc._remoteStreams) {
              pc._remoteStreams = [];
            }
            if (pc._remoteStreams.indexOf(stream) >= 0) {
              return;
            }
            pc._remoteStreams.push(stream);
            const event = new Event("addstream");
            event.stream = stream;
            pc.dispatchEvent(event);
          });
        });
      }
      return origSetRemoteDescription.apply(pc, arguments);
    };
  }
}
function shimCallbacksAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  const prototype = window2.RTCPeerConnection.prototype;
  const origCreateOffer = prototype.createOffer;
  const origCreateAnswer = prototype.createAnswer;
  const setLocalDescription = prototype.setLocalDescription;
  const setRemoteDescription = prototype.setRemoteDescription;
  const addIceCandidate = prototype.addIceCandidate;
  prototype.createOffer = function createOffer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateOffer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateAnswer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  let withCallback = function(description, successCallback, failureCallback) {
    const promise = setLocalDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setLocalDescription = withCallback;
  withCallback = function(description, successCallback, failureCallback) {
    const promise = setRemoteDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setRemoteDescription = withCallback;
  withCallback = function(candidate, successCallback, failureCallback) {
    const promise = addIceCandidate.apply(this, [candidate]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.addIceCandidate = withCallback;
}
function shimGetUserMedia3(window2) {
  const navigator2 = window2 && window2.navigator;
  if (navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    const mediaDevices = navigator2.mediaDevices;
    const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    navigator2.mediaDevices.getUserMedia = (constraints) => {
      return _getUserMedia(shimConstraints(constraints));
    };
  }
  if (!navigator2.getUserMedia && navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    navigator2.getUserMedia = function getUserMedia(constraints, cb, errcb) {
      navigator2.mediaDevices.getUserMedia(constraints).then(cb, errcb);
    }.bind(navigator2);
  }
}
function shimConstraints(constraints) {
  if (constraints && constraints.video !== void 0) {
    return Object.assign(
      {},
      constraints,
      { video: compactObject(constraints.video) }
    );
  }
  return constraints;
}
function shimRTCIceServerUrls(window2) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const OrigPeerConnection = window2.RTCPeerConnection;
  window2.RTCPeerConnection = function RTCPeerConnection2(pcConfig, pcConstraints) {
    if (pcConfig && pcConfig.iceServers) {
      const newIceServers = [];
      for (let i = 0; i < pcConfig.iceServers.length; i++) {
        let server = pcConfig.iceServers[i];
        if (server.urls === void 0 && server.url) {
          deprecated("RTCIceServer.url", "RTCIceServer.urls");
          server = JSON.parse(JSON.stringify(server));
          server.urls = server.url;
          delete server.url;
          newIceServers.push(server);
        } else {
          newIceServers.push(pcConfig.iceServers[i]);
        }
      }
      pcConfig.iceServers = newIceServers;
    }
    return new OrigPeerConnection(pcConfig, pcConstraints);
  };
  window2.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
  if ("generateCertificate" in OrigPeerConnection) {
    Object.defineProperty(window2.RTCPeerConnection, "generateCertificate", {
      get() {
        return OrigPeerConnection.generateCertificate;
      }
    });
  }
}
function shimTrackEventTransceiver(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      }
    });
  }
}
function shimCreateOfferLegacy(window2) {
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
    if (offerOptions) {
      if (typeof offerOptions.offerToReceiveAudio !== "undefined") {
        offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
      }
      const audioTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "audio");
      if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
        if (audioTransceiver.direction === "sendrecv") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("sendonly");
          } else {
            audioTransceiver.direction = "sendonly";
          }
        } else if (audioTransceiver.direction === "recvonly") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("inactive");
          } else {
            audioTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
        this.addTransceiver("audio", { direction: "recvonly" });
      }
      if (typeof offerOptions.offerToReceiveVideo !== "undefined") {
        offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
      }
      const videoTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "video");
      if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
        if (videoTransceiver.direction === "sendrecv") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("sendonly");
          } else {
            videoTransceiver.direction = "sendonly";
          }
        } else if (videoTransceiver.direction === "recvonly") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("inactive");
          } else {
            videoTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
        this.addTransceiver("video", { direction: "recvonly" });
      }
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimAudioContext(window2) {
  if (typeof window2 !== "object" || window2.AudioContext) {
    return;
  }
  window2.AudioContext = window2.webkitAudioContext;
}
var init_safari_shim = __esm({
  "node_modules/webrtc-adapter/src/js/safari/safari_shim.js"() {
    "use strict";
    init_utils2();
  }
});

// node_modules/sdp/sdp.js
var require_sdp = __commonJS({
  "node_modules/sdp/sdp.js"(exports, module) {
    "use strict";
    var SDPUtils2 = {};
    SDPUtils2.generateIdentifier = function() {
      return Math.random().toString(36).substring(2, 12);
    };
    SDPUtils2.localCName = SDPUtils2.generateIdentifier();
    SDPUtils2.splitLines = function(blob) {
      return blob.trim().split("\n").map((line) => line.trim());
    };
    SDPUtils2.splitSections = function(blob) {
      const parts = blob.split("\nm=");
      return parts.map((part, index) => (index > 0 ? "m=" + part : part).trim() + "\r\n");
    };
    SDPUtils2.getDescription = function(blob) {
      const sections = SDPUtils2.splitSections(blob);
      return sections && sections[0];
    };
    SDPUtils2.getMediaSections = function(blob) {
      const sections = SDPUtils2.splitSections(blob);
      sections.shift();
      return sections;
    };
    SDPUtils2.matchPrefix = function(blob, prefix) {
      return SDPUtils2.splitLines(blob).filter((line) => line.indexOf(prefix) === 0);
    };
    SDPUtils2.parseCandidate = function(line) {
      let parts;
      if (line.indexOf("a=candidate:") === 0) {
        parts = line.substring(12).split(" ");
      } else {
        parts = line.substring(10).split(" ");
      }
      const candidate = {
        foundation: parts[0],
        component: { 1: "rtp", 2: "rtcp" }[parts[1]] || parts[1],
        protocol: parts[2].toLowerCase(),
        priority: parseInt(parts[3], 10),
        ip: parts[4],
        address: parts[4],
        // address is an alias for ip.
        port: parseInt(parts[5], 10),
        // skip parts[6] == 'typ'
        type: parts[7]
      };
      for (let i = 8; i < parts.length; i += 2) {
        switch (parts[i]) {
          case "raddr":
            candidate.relatedAddress = parts[i + 1];
            break;
          case "rport":
            candidate.relatedPort = parseInt(parts[i + 1], 10);
            break;
          case "tcptype":
            candidate.tcpType = parts[i + 1];
            break;
          case "ufrag":
            candidate.ufrag = parts[i + 1];
            candidate.usernameFragment = parts[i + 1];
            break;
          default:
            if (candidate[parts[i]] === void 0) {
              candidate[parts[i]] = parts[i + 1];
            }
            break;
        }
      }
      return candidate;
    };
    SDPUtils2.writeCandidate = function(candidate) {
      const sdp2 = [];
      sdp2.push(candidate.foundation);
      const component = candidate.component;
      if (component === "rtp") {
        sdp2.push(1);
      } else if (component === "rtcp") {
        sdp2.push(2);
      } else {
        sdp2.push(component);
      }
      sdp2.push(candidate.protocol.toUpperCase());
      sdp2.push(candidate.priority);
      sdp2.push(candidate.address || candidate.ip);
      sdp2.push(candidate.port);
      const type = candidate.type;
      sdp2.push("typ");
      sdp2.push(type);
      if (type !== "host" && candidate.relatedAddress && candidate.relatedPort !== void 0) {
        sdp2.push("raddr");
        sdp2.push(candidate.relatedAddress);
        sdp2.push("rport");
        sdp2.push(candidate.relatedPort);
      }
      if (candidate.tcpType && candidate.protocol.toLowerCase() === "tcp") {
        sdp2.push("tcptype");
        sdp2.push(candidate.tcpType);
      }
      if (candidate.usernameFragment || candidate.ufrag) {
        sdp2.push("ufrag");
        sdp2.push(candidate.usernameFragment || candidate.ufrag);
      }
      return "candidate:" + sdp2.join(" ");
    };
    SDPUtils2.parseIceOptions = function(line) {
      return line.substring(14).split(" ");
    };
    SDPUtils2.parseRtpMap = function(line) {
      let parts = line.substring(9).split(" ");
      const parsed = {
        payloadType: parseInt(parts.shift(), 10)
        // was: id
      };
      parts = parts[0].split("/");
      parsed.name = parts[0];
      parsed.clockRate = parseInt(parts[1], 10);
      parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
      parsed.numChannels = parsed.channels;
      return parsed;
    };
    SDPUtils2.writeRtpMap = function(codec) {
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      const channels = codec.channels || codec.numChannels || 1;
      return "a=rtpmap:" + pt + " " + codec.name + "/" + codec.clockRate + (channels !== 1 ? "/" + channels : "") + "\r\n";
    };
    SDPUtils2.parseExtmap = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        id: parseInt(parts[0], 10),
        direction: parts[0].indexOf("/") > 0 ? parts[0].split("/")[1] : "sendrecv",
        uri: parts[1],
        attributes: parts.slice(2).join(" ")
      };
    };
    SDPUtils2.writeExtmap = function(headerExtension) {
      return "a=extmap:" + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== "sendrecv" ? "/" + headerExtension.direction : "") + " " + headerExtension.uri + (headerExtension.attributes ? " " + headerExtension.attributes : "") + "\r\n";
    };
    SDPUtils2.parseFmtp = function(line) {
      const parsed = {};
      let kv;
      const parts = line.substring(line.indexOf(" ") + 1).split(";");
      for (let j = 0; j < parts.length; j++) {
        kv = parts[j].trim().split("=");
        parsed[kv[0].trim()] = kv[1];
      }
      return parsed;
    };
    SDPUtils2.writeFmtp = function(codec) {
      let line = "";
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      if (codec.parameters && Object.keys(codec.parameters).length) {
        const params = [];
        Object.keys(codec.parameters).forEach((param) => {
          if (codec.parameters[param] !== void 0) {
            params.push(param + "=" + codec.parameters[param]);
          } else {
            params.push(param);
          }
        });
        line += "a=fmtp:" + pt + " " + params.join(";") + "\r\n";
      }
      return line;
    };
    SDPUtils2.parseRtcpFb = function(line) {
      const parts = line.substring(line.indexOf(" ") + 1).split(" ");
      return {
        type: parts.shift(),
        parameter: parts.join(" ")
      };
    };
    SDPUtils2.writeRtcpFb = function(codec) {
      let lines = "";
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
        codec.rtcpFeedback.forEach((fb) => {
          lines += "a=rtcp-fb:" + pt + " " + fb.type + (fb.parameter && fb.parameter.length ? " " + fb.parameter : "") + "\r\n";
        });
      }
      return lines;
    };
    SDPUtils2.parseSsrcMedia = function(line) {
      const sp = line.indexOf(" ");
      const parts = {
        ssrc: parseInt(line.substring(7, sp), 10)
      };
      const colon = line.indexOf(":", sp);
      if (colon > -1) {
        parts.attribute = line.substring(sp + 1, colon);
        parts.value = line.substring(colon + 1);
      } else {
        parts.attribute = line.substring(sp + 1);
      }
      return parts;
    };
    SDPUtils2.parseSsrcGroup = function(line) {
      const parts = line.substring(13).split(" ");
      return {
        semantics: parts.shift(),
        ssrcs: parts.map((ssrc) => parseInt(ssrc, 10))
      };
    };
    SDPUtils2.getMid = function(mediaSection) {
      const mid = SDPUtils2.matchPrefix(mediaSection, "a=mid:")[0];
      if (mid) {
        return mid.substring(6);
      }
    };
    SDPUtils2.parseFingerprint = function(line) {
      const parts = line.substring(14).split(" ");
      return {
        algorithm: parts[0].toLowerCase(),
        // algorithm is case-sensitive in Edge.
        value: parts[1].toUpperCase()
        // the definition is upper-case in RFC 4572.
      };
    };
    SDPUtils2.getDtlsParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=fingerprint:"
      );
      return {
        role: "auto",
        fingerprints: lines.map(SDPUtils2.parseFingerprint)
      };
    };
    SDPUtils2.writeDtlsParameters = function(params, setupType) {
      let sdp2 = "a=setup:" + setupType + "\r\n";
      params.fingerprints.forEach((fp) => {
        sdp2 += "a=fingerprint:" + fp.algorithm + " " + fp.value + "\r\n";
      });
      return sdp2;
    };
    SDPUtils2.parseCryptoLine = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        tag: parseInt(parts[0], 10),
        cryptoSuite: parts[1],
        keyParams: parts[2],
        sessionParams: parts.slice(3)
      };
    };
    SDPUtils2.writeCryptoLine = function(parameters) {
      return "a=crypto:" + parameters.tag + " " + parameters.cryptoSuite + " " + (typeof parameters.keyParams === "object" ? SDPUtils2.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? " " + parameters.sessionParams.join(" ") : "") + "\r\n";
    };
    SDPUtils2.parseCryptoKeyParams = function(keyParams) {
      if (keyParams.indexOf("inline:") !== 0) {
        return null;
      }
      const parts = keyParams.substring(7).split("|");
      return {
        keyMethod: "inline",
        keySalt: parts[0],
        lifeTime: parts[1],
        mkiValue: parts[2] ? parts[2].split(":")[0] : void 0,
        mkiLength: parts[2] ? parts[2].split(":")[1] : void 0
      };
    };
    SDPUtils2.writeCryptoKeyParams = function(keyParams) {
      return keyParams.keyMethod + ":" + keyParams.keySalt + (keyParams.lifeTime ? "|" + keyParams.lifeTime : "") + (keyParams.mkiValue && keyParams.mkiLength ? "|" + keyParams.mkiValue + ":" + keyParams.mkiLength : "");
    };
    SDPUtils2.getCryptoParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=crypto:"
      );
      return lines.map(SDPUtils2.parseCryptoLine);
    };
    SDPUtils2.getIceParameters = function(mediaSection, sessionpart) {
      const ufrag = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=ice-ufrag:"
      )[0];
      const pwd = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=ice-pwd:"
      )[0];
      if (!(ufrag && pwd)) {
        return null;
      }
      return {
        usernameFragment: ufrag.substring(12),
        password: pwd.substring(10)
      };
    };
    SDPUtils2.writeIceParameters = function(params) {
      let sdp2 = "a=ice-ufrag:" + params.usernameFragment + "\r\na=ice-pwd:" + params.password + "\r\n";
      if (params.iceLite) {
        sdp2 += "a=ice-lite\r\n";
      }
      return sdp2;
    };
    SDPUtils2.parseRtpParameters = function(mediaSection) {
      const description = {
        codecs: [],
        headerExtensions: [],
        fecMechanisms: [],
        rtcp: []
      };
      const lines = SDPUtils2.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      description.profile = mline[2];
      for (let i = 3; i < mline.length; i++) {
        const pt = mline[i];
        const rtpmapline = SDPUtils2.matchPrefix(
          mediaSection,
          "a=rtpmap:" + pt + " "
        )[0];
        if (rtpmapline) {
          const codec = SDPUtils2.parseRtpMap(rtpmapline);
          const fmtps = SDPUtils2.matchPrefix(
            mediaSection,
            "a=fmtp:" + pt + " "
          );
          codec.parameters = fmtps.length ? SDPUtils2.parseFmtp(fmtps[0]) : {};
          codec.rtcpFeedback = SDPUtils2.matchPrefix(
            mediaSection,
            "a=rtcp-fb:" + pt + " "
          ).map(SDPUtils2.parseRtcpFb);
          description.codecs.push(codec);
          switch (codec.name.toUpperCase()) {
            case "RED":
            case "ULPFEC":
              description.fecMechanisms.push(codec.name.toUpperCase());
              break;
            default:
              break;
          }
        }
      }
      SDPUtils2.matchPrefix(mediaSection, "a=extmap:").forEach((line) => {
        description.headerExtensions.push(SDPUtils2.parseExtmap(line));
      });
      const wildcardRtcpFb = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-fb:* ").map(SDPUtils2.parseRtcpFb);
      description.codecs.forEach((codec) => {
        wildcardRtcpFb.forEach((fb) => {
          const duplicate = codec.rtcpFeedback.find((existingFeedback) => {
            return existingFeedback.type === fb.type && existingFeedback.parameter === fb.parameter;
          });
          if (!duplicate) {
            codec.rtcpFeedback.push(fb);
          }
        });
      });
      return description;
    };
    SDPUtils2.writeRtpDescription = function(kind, caps) {
      let sdp2 = "";
      sdp2 += "m=" + kind + " ";
      sdp2 += caps.codecs.length > 0 ? "9" : "0";
      sdp2 += " " + (caps.profile || "UDP/TLS/RTP/SAVPF") + " ";
      sdp2 += caps.codecs.map((codec) => {
        if (codec.preferredPayloadType !== void 0) {
          return codec.preferredPayloadType;
        }
        return codec.payloadType;
      }).join(" ") + "\r\n";
      sdp2 += "c=IN IP4 0.0.0.0\r\n";
      sdp2 += "a=rtcp:9 IN IP4 0.0.0.0\r\n";
      caps.codecs.forEach((codec) => {
        sdp2 += SDPUtils2.writeRtpMap(codec);
        sdp2 += SDPUtils2.writeFmtp(codec);
        sdp2 += SDPUtils2.writeRtcpFb(codec);
      });
      let maxptime = 0;
      caps.codecs.forEach((codec) => {
        if (codec.maxptime > maxptime) {
          maxptime = codec.maxptime;
        }
      });
      if (maxptime > 0) {
        sdp2 += "a=maxptime:" + maxptime + "\r\n";
      }
      if (caps.headerExtensions) {
        caps.headerExtensions.forEach((extension) => {
          sdp2 += SDPUtils2.writeExtmap(extension);
        });
      }
      return sdp2;
    };
    SDPUtils2.parseRtpEncodingParameters = function(mediaSection) {
      const encodingParameters = [];
      const description = SDPUtils2.parseRtpParameters(mediaSection);
      const hasRed = description.fecMechanisms.indexOf("RED") !== -1;
      const hasUlpfec = description.fecMechanisms.indexOf("ULPFEC") !== -1;
      const ssrcs = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((parts) => parts.attribute === "cname");
      const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
      let secondarySsrc;
      const flows = SDPUtils2.matchPrefix(mediaSection, "a=ssrc-group:FID").map((line) => {
        const parts = line.substring(17).split(" ");
        return parts.map((part) => parseInt(part, 10));
      });
      if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
        secondarySsrc = flows[0][1];
      }
      description.codecs.forEach((codec) => {
        if (codec.name.toUpperCase() === "RTX" && codec.parameters.apt) {
          let encParam = {
            ssrc: primarySsrc,
            codecPayloadType: parseInt(codec.parameters.apt, 10)
          };
          if (primarySsrc && secondarySsrc) {
            encParam.rtx = { ssrc: secondarySsrc };
          }
          encodingParameters.push(encParam);
          if (hasRed) {
            encParam = JSON.parse(JSON.stringify(encParam));
            encParam.fec = {
              ssrc: primarySsrc,
              mechanism: hasUlpfec ? "red+ulpfec" : "red"
            };
            encodingParameters.push(encParam);
          }
        }
      });
      if (encodingParameters.length === 0 && primarySsrc) {
        encodingParameters.push({
          ssrc: primarySsrc
        });
      }
      let bandwidth = SDPUtils2.matchPrefix(mediaSection, "b=");
      if (bandwidth.length) {
        if (bandwidth[0].indexOf("b=TIAS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(7), 10);
        } else if (bandwidth[0].indexOf("b=AS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(5), 10) * 1e3 * 0.95 - 50 * 40 * 8;
        } else {
          bandwidth = void 0;
        }
        encodingParameters.forEach((params) => {
          params.maxBitrate = bandwidth;
        });
      }
      return encodingParameters;
    };
    SDPUtils2.parseRtcpParameters = function(mediaSection) {
      const rtcpParameters = {};
      const remoteSsrc = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((obj) => obj.attribute === "cname")[0];
      if (remoteSsrc) {
        rtcpParameters.cname = remoteSsrc.value;
        rtcpParameters.ssrc = remoteSsrc.ssrc;
      }
      const rsize = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-rsize");
      rtcpParameters.reducedSize = rsize.length > 0;
      rtcpParameters.compound = rsize.length === 0;
      const mux = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-mux");
      rtcpParameters.mux = mux.length > 0;
      return rtcpParameters;
    };
    SDPUtils2.writeRtcpParameters = function(rtcpParameters) {
      let sdp2 = "";
      if (rtcpParameters.reducedSize) {
        sdp2 += "a=rtcp-rsize\r\n";
      }
      if (rtcpParameters.mux) {
        sdp2 += "a=rtcp-mux\r\n";
      }
      if (rtcpParameters.ssrc !== void 0 && rtcpParameters.cname) {
        sdp2 += "a=ssrc:" + rtcpParameters.ssrc + " cname:" + rtcpParameters.cname + "\r\n";
      }
      return sdp2;
    };
    SDPUtils2.parseMsid = function(mediaSection) {
      let parts;
      const spec = SDPUtils2.matchPrefix(mediaSection, "a=msid:");
      if (spec.length === 1) {
        parts = spec[0].substring(7).split(" ");
        return { stream: parts[0], track: parts[1] };
      }
      const planB = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((msidParts) => msidParts.attribute === "msid");
      if (planB.length > 0) {
        parts = planB[0].value.split(" ");
        return { stream: parts[0], track: parts[1] };
      }
    };
    SDPUtils2.parseSctpDescription = function(mediaSection) {
      const mline = SDPUtils2.parseMLine(mediaSection);
      const maxSizeLine = SDPUtils2.matchPrefix(mediaSection, "a=max-message-size:");
      let maxMessageSize;
      if (maxSizeLine.length > 0) {
        maxMessageSize = parseInt(maxSizeLine[0].substring(19), 10);
      }
      if (isNaN(maxMessageSize)) {
        maxMessageSize = 65536;
      }
      const sctpPort = SDPUtils2.matchPrefix(mediaSection, "a=sctp-port:");
      if (sctpPort.length > 0) {
        return {
          port: parseInt(sctpPort[0].substring(12), 10),
          protocol: mline.fmt,
          maxMessageSize
        };
      }
      const sctpMapLines = SDPUtils2.matchPrefix(mediaSection, "a=sctpmap:");
      if (sctpMapLines.length > 0) {
        const parts = sctpMapLines[0].substring(10).split(" ");
        return {
          port: parseInt(parts[0], 10),
          protocol: parts[1],
          maxMessageSize
        };
      }
    };
    SDPUtils2.writeSctpDescription = function(media, sctp) {
      let output = [];
      if (media.protocol !== "DTLS/SCTP") {
        output = [
          "m=" + media.kind + " 9 " + media.protocol + " " + sctp.protocol + "\r\n",
          "c=IN IP4 0.0.0.0\r\n",
          "a=sctp-port:" + sctp.port + "\r\n"
        ];
      } else {
        output = [
          "m=" + media.kind + " 9 " + media.protocol + " " + sctp.port + "\r\n",
          "c=IN IP4 0.0.0.0\r\n",
          "a=sctpmap:" + sctp.port + " " + sctp.protocol + " 65535\r\n"
        ];
      }
      if (sctp.maxMessageSize !== void 0) {
        output.push("a=max-message-size:" + sctp.maxMessageSize + "\r\n");
      }
      return output.join("");
    };
    SDPUtils2.generateSessionId = function() {
      return Math.random().toString().substr(2, 22);
    };
    SDPUtils2.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
      let sessionId;
      const version = sessVer !== void 0 ? sessVer : 2;
      if (sessId) {
        sessionId = sessId;
      } else {
        sessionId = SDPUtils2.generateSessionId();
      }
      const user = sessUser || "thisisadapterortc";
      return "v=0\r\no=" + user + " " + sessionId + " " + version + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
    };
    SDPUtils2.getDirection = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.splitLines(mediaSection);
      for (let i = 0; i < lines.length; i++) {
        switch (lines[i]) {
          case "a=sendrecv":
          case "a=sendonly":
          case "a=recvonly":
          case "a=inactive":
            return lines[i].substring(2);
          default:
        }
      }
      if (sessionpart) {
        return SDPUtils2.getDirection(sessionpart);
      }
      return "sendrecv";
    };
    SDPUtils2.getKind = function(mediaSection) {
      const lines = SDPUtils2.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      return mline[0].substring(2);
    };
    SDPUtils2.isRejected = function(mediaSection) {
      return mediaSection.split(" ", 2)[1] === "0";
    };
    SDPUtils2.parseMLine = function(mediaSection) {
      const lines = SDPUtils2.splitLines(mediaSection);
      const parts = lines[0].substring(2).split(" ");
      return {
        kind: parts[0],
        port: parseInt(parts[1], 10),
        protocol: parts[2],
        fmt: parts.slice(3).join(" ")
      };
    };
    SDPUtils2.parseOLine = function(mediaSection) {
      const line = SDPUtils2.matchPrefix(mediaSection, "o=")[0];
      const parts = line.substring(2).split(" ");
      return {
        username: parts[0],
        sessionId: parts[1],
        sessionVersion: parseInt(parts[2], 10),
        netType: parts[3],
        addressType: parts[4],
        address: parts[5]
      };
    };
    SDPUtils2.isValidSDP = function(blob) {
      if (typeof blob !== "string" || blob.length === 0) {
        return false;
      }
      const lines = SDPUtils2.splitLines(blob);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length < 2 || lines[i].charAt(1) !== "=") {
          return false;
        }
      }
      return true;
    };
    if (typeof module === "object") {
      module.exports = SDPUtils2;
    }
  }
});

// node_modules/webrtc-adapter/src/js/common_shim.js
var common_shim_exports = {};
__export(common_shim_exports, {
  removeExtmapAllowMixed: () => removeExtmapAllowMixed,
  shimAddIceCandidateNullOrEmpty: () => shimAddIceCandidateNullOrEmpty,
  shimConnectionState: () => shimConnectionState,
  shimMaxMessageSize: () => shimMaxMessageSize,
  shimParameterlessSetLocalDescription: () => shimParameterlessSetLocalDescription,
  shimRTCIceCandidate: () => shimRTCIceCandidate,
  shimRTCIceCandidateRelayProtocol: () => shimRTCIceCandidateRelayProtocol,
  shimSendThrowTypeError: () => shimSendThrowTypeError
});
function shimRTCIceCandidate(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "foundation" in window2.RTCIceCandidate.prototype) {
    return;
  }
  const NativeRTCIceCandidate = window2.RTCIceCandidate;
  window2.RTCIceCandidate = function RTCIceCandidate(args) {
    if (typeof args === "object" && args.candidate && args.candidate.indexOf("a=") === 0) {
      args = JSON.parse(JSON.stringify(args));
      args.candidate = args.candidate.substring(2);
    }
    if (args.candidate && args.candidate.length) {
      const nativeCandidate = new NativeRTCIceCandidate(args);
      const parsedCandidate = import_sdp.default.parseCandidate(args.candidate);
      for (const key in parsedCandidate) {
        if (!(key in nativeCandidate)) {
          Object.defineProperty(
            nativeCandidate,
            key,
            { value: parsedCandidate[key] }
          );
        }
      }
      nativeCandidate.toJSON = function toJSON() {
        return {
          candidate: nativeCandidate.candidate,
          sdpMid: nativeCandidate.sdpMid,
          sdpMLineIndex: nativeCandidate.sdpMLineIndex,
          usernameFragment: nativeCandidate.usernameFragment
        };
      };
      return nativeCandidate;
    }
    return new NativeRTCIceCandidate(args);
  };
  window2.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;
  wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
    if (e.candidate) {
      Object.defineProperty(e, "candidate", {
        value: new window2.RTCIceCandidate(e.candidate),
        writable: "false"
      });
    }
    return e;
  });
}
function shimRTCIceCandidateRelayProtocol(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "relayProtocol" in window2.RTCIceCandidate.prototype) {
    return;
  }
  wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
    if (e.candidate) {
      const parsedCandidate = import_sdp.default.parseCandidate(e.candidate.candidate);
      if (parsedCandidate.type === "relay") {
        e.candidate.relayProtocol = {
          0: "tls",
          1: "tcp",
          2: "udp"
        }[parsedCandidate.priority >> 24];
      }
    }
    return e;
  });
}
function shimMaxMessageSize(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.browser === "chrome" && browserDetails.version > 102) {
    return;
  }
  if (browserDetails.browser === "firefox" && browserDetails.version >= 113) {
    return;
  }
  if (!("sctp" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "sctp", {
      get() {
        return typeof this._sctp === "undefined" ? null : this._sctp;
      }
    });
  }
  const sctpInDescription = function(description) {
    if (!description || !description.sdp) {
      return false;
    }
    const sections = import_sdp.default.splitSections(description.sdp);
    sections.shift();
    return sections.some((mediaSection) => {
      const mLine = import_sdp.default.parseMLine(mediaSection);
      return mLine && mLine.kind === "application" && mLine.protocol.indexOf("SCTP") !== -1;
    });
  };
  const getRemoteFirefoxVersion = function(description) {
    const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
    if (match === null || match.length < 2) {
      return -1;
    }
    const version = parseInt(match[1], 10);
    return version !== version ? -1 : version;
  };
  const getCanSendMaxMessageSize = function(remoteIsFirefox) {
    let canSendMaxMessageSize = 65536;
    if (browserDetails.browser === "firefox") {
      if (browserDetails.version < 57) {
        if (remoteIsFirefox === -1) {
          canSendMaxMessageSize = 16384;
        } else {
          canSendMaxMessageSize = 2147483637;
        }
      } else if (browserDetails.version < 60) {
        canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
      } else {
        canSendMaxMessageSize = 2147483637;
      }
    }
    return canSendMaxMessageSize;
  };
  const getMaxMessageSize = function(description, remoteIsFirefox) {
    let maxMessageSize = 65536;
    if (browserDetails.browser === "firefox" && browserDetails.version === 57) {
      maxMessageSize = 65535;
    }
    const match = import_sdp.default.matchPrefix(
      description.sdp,
      "a=max-message-size:"
    );
    if (match.length > 0) {
      maxMessageSize = parseInt(match[0].substring(19), 10);
    } else if (browserDetails.browser === "firefox" && remoteIsFirefox !== -1) {
      maxMessageSize = 2147483637;
    }
    return maxMessageSize;
  };
  const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
    this._sctp = null;
    if (browserDetails.browser === "chrome" && browserDetails.version >= 76) {
      const { sdpSemantics } = this.getConfiguration();
      if (sdpSemantics === "plan-b") {
        Object.defineProperty(this, "sctp", {
          get() {
            return typeof this._sctp === "undefined" ? null : this._sctp;
          },
          enumerable: true,
          configurable: true
        });
      }
    }
    if (sctpInDescription(arguments[0])) {
      const isFirefox = getRemoteFirefoxVersion(arguments[0]);
      const canSendMMS = getCanSendMaxMessageSize(isFirefox);
      const remoteMMS = getMaxMessageSize(arguments[0], isFirefox);
      let maxMessageSize;
      if (canSendMMS === 0 && remoteMMS === 0) {
        maxMessageSize = Number.POSITIVE_INFINITY;
      } else if (canSendMMS === 0 || remoteMMS === 0) {
        maxMessageSize = Math.max(canSendMMS, remoteMMS);
      } else {
        maxMessageSize = Math.min(canSendMMS, remoteMMS);
      }
      const sctp = {};
      Object.defineProperty(sctp, "maxMessageSize", {
        get() {
          return maxMessageSize;
        }
      });
      this._sctp = sctp;
    }
    return origSetRemoteDescription.apply(this, arguments);
  };
}
function shimSendThrowTypeError(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && "createDataChannel" in window2.RTCPeerConnection.prototype)) {
    return;
  }
  if (browserDetails.browser === "chrome" && browserDetails.version >= 149) {
    return;
  }
  if (browserDetails.browser === "firefox" && browserDetails.version > 60) {
    return;
  }
  function wrapDcSend(dc, pc) {
    const origDataChannelSend = dc.send;
    dc.send = function send() {
      const data = arguments[0];
      const length = data.length || data.size || data.byteLength;
      if (dc.readyState === "open" && pc.sctp && length > pc.sctp.maxMessageSize) {
        throw new TypeError("Message too large (can send a maximum of " + pc.sctp.maxMessageSize + " bytes)");
      }
      return origDataChannelSend.apply(dc, arguments);
    };
  }
  const origCreateDataChannel = window2.RTCPeerConnection.prototype.createDataChannel;
  window2.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
    const dataChannel = origCreateDataChannel.apply(this, arguments);
    wrapDcSend(dataChannel, this);
    return dataChannel;
  };
  wrapPeerConnectionEvent(window2, "datachannel", (e) => {
    wrapDcSend(e.channel, e.target);
    return e;
  });
}
function shimConnectionState(window2) {
  if (!window2.RTCPeerConnection || "connectionState" in window2.RTCPeerConnection.prototype) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  Object.defineProperty(proto, "connectionState", {
    get() {
      return {
        completed: "connected",
        checking: "connecting"
      }[this.iceConnectionState] || this.iceConnectionState;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(proto, "onconnectionstatechange", {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(cb) {
      if (this._onconnectionstatechange) {
        this.removeEventListener(
          "connectionstatechange",
          this._onconnectionstatechange
        );
        delete this._onconnectionstatechange;
      }
      if (cb) {
        this.addEventListener(
          "connectionstatechange",
          this._onconnectionstatechange = cb
        );
      }
    },
    enumerable: true,
    configurable: true
  });
  ["setLocalDescription", "setRemoteDescription"].forEach((method) => {
    const origMethod = proto[method];
    proto[method] = function() {
      if (!this._connectionstatechangepoly) {
        this._connectionstatechangepoly = (e) => {
          const pc = e.target;
          if (pc._lastConnectionState !== pc.connectionState) {
            pc._lastConnectionState = pc.connectionState;
            const newEvent = new Event("connectionstatechange", e);
            pc.dispatchEvent(newEvent);
          }
          return e;
        };
        this.addEventListener(
          "iceconnectionstatechange",
          this._connectionstatechangepoly
        );
      }
      return origMethod.apply(this, arguments);
    };
  });
}
function removeExtmapAllowMixed(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.browser === "chrome" && browserDetails.version >= 71) {
    return;
  }
  if (browserDetails.browser === "safari" && browserDetails._safariVersion >= 13.1) {
    return;
  }
  const nativeSRD = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
    if (desc && desc.sdp && desc.sdp.indexOf("\na=extmap-allow-mixed") !== -1) {
      const sdp2 = desc.sdp.split("\n").filter((line) => {
        return line.trim() !== "a=extmap-allow-mixed";
      }).join("\n");
      if (window2.RTCSessionDescription && desc instanceof window2.RTCSessionDescription) {
        arguments[0] = new window2.RTCSessionDescription({
          type: desc.type,
          sdp: sdp2
        });
      } else {
        desc.sdp = sdp2;
      }
    }
    return nativeSRD.apply(this, arguments);
  };
}
function shimAddIceCandidateNullOrEmpty(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeAddIceCandidate = window2.RTCPeerConnection.prototype.addIceCandidate;
  if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
    if (!arguments[0]) {
      if (arguments[1]) {
        arguments[1].apply(null);
      }
      return Promise.resolve();
    }
    if ((browserDetails.browser === "chrome" && browserDetails.version < 78 || browserDetails.browser === "firefox" && browserDetails.version < 68 || browserDetails.browser === "safari") && arguments[0] && arguments[0].candidate === "") {
      return Promise.resolve();
    }
    return nativeAddIceCandidate.apply(this, arguments);
  };
}
function shimParameterlessSetLocalDescription(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    let desc = arguments[0] || {};
    if (typeof desc !== "object" || desc.type && desc.sdp) {
      return nativeSetLocalDescription.apply(this, arguments);
    }
    desc = { type: desc.type, sdp: desc.sdp };
    if (!desc.type) {
      switch (this.signalingState) {
        case "stable":
        case "have-local-offer":
        case "have-remote-pranswer":
          desc.type = "offer";
          break;
        default:
          desc.type = "answer";
          break;
      }
    }
    if (desc.sdp || desc.type !== "offer" && desc.type !== "answer") {
      return nativeSetLocalDescription.apply(this, [desc]);
    }
    const func = desc.type === "offer" ? this.createOffer : this.createAnswer;
    return func.apply(this).then((d) => nativeSetLocalDescription.apply(this, [d]));
  };
}
var import_sdp;
var init_common_shim = __esm({
  "node_modules/webrtc-adapter/src/js/common_shim.js"() {
    "use strict";
    import_sdp = __toESM(require_sdp());
    init_utils2();
  }
});

// node_modules/webrtc-adapter/src/js/adapter_factory.js
function adapterFactory({ window: window2 } = {}, options = {
  shimChrome: true,
  shimFirefox: true,
  shimSafari: true
}) {
  const logging2 = log;
  const browserDetails = detectBrowser(window2);
  const adapter2 = {
    browserDetails,
    commonShim: common_shim_exports,
    extractVersion,
    disableLog,
    disableWarnings,
    // Expose sdp as a convenience. For production apps include directly.
    sdp
  };
  switch (browserDetails.browser) {
    case "chrome":
      if (!chrome_shim_exports || !shimPeerConnection || !options.shimChrome) {
        logging2("Chrome shim is not included in this adapter release.");
        return adapter2;
      }
      if (browserDetails.version === null) {
        logging2("Chrome shim can not determine version, not shimming.");
        return adapter2;
      }
      logging2("adapter.js shimming chrome.");
      adapter2.browserShim = chrome_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimGetUserMedia(window2, browserDetails);
      shimMediaStream(window2, browserDetails);
      shimPeerConnection(window2, browserDetails);
      shimOnTrack(window2, browserDetails);
      shimAddTrackRemoveTrack(window2, browserDetails);
      shimGetSendersWithDtmf(window2, browserDetails);
      shimSenderReceiverGetStats(window2, browserDetails);
      fixNegotiationNeeded(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimRTCIceCandidateRelayProtocol(window2, browserDetails);
      shimConnectionState(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    case "firefox":
      if (!firefox_shim_exports || !shimPeerConnection2 || !options.shimFirefox) {
        logging2("Firefox shim is not included in this adapter release.");
        return adapter2;
      }
      logging2("adapter.js shimming firefox.");
      adapter2.browserShim = firefox_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimGetUserMedia2(window2, browserDetails);
      shimPeerConnection2(window2, browserDetails);
      shimGetStats(window2, browserDetails);
      shimOnTrack2(window2, browserDetails);
      shimRemoveStream(window2, browserDetails);
      shimSenderGetStats(window2, browserDetails);
      shimReceiverGetStats(window2, browserDetails);
      shimRTCDataChannel(window2, browserDetails);
      shimAddTransceiver(window2, browserDetails);
      shimGetParameters(window2, browserDetails);
      shimCreateOffer(window2, browserDetails);
      shimCreateAnswer(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimConnectionState(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      break;
    case "safari":
      if (!safari_shim_exports || !options.shimSafari) {
        logging2("Safari shim is not included in this adapter release.");
        return adapter2;
      }
      logging2("adapter.js shimming safari.");
      adapter2.browserShim = safari_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimRTCIceServerUrls(window2, browserDetails);
      shimCreateOfferLegacy(window2, browserDetails);
      shimCallbacksAPI(window2, browserDetails);
      shimLocalStreamsAPI(window2, browserDetails);
      shimRemoteStreamsAPI(window2, browserDetails);
      shimTrackEventTransceiver(window2, browserDetails);
      shimGetUserMedia3(window2, browserDetails);
      shimAudioContext(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimRTCIceCandidateRelayProtocol(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    default:
      logging2("Unsupported browser!");
      break;
  }
  return adapter2;
}
var sdp;
var init_adapter_factory = __esm({
  "node_modules/webrtc-adapter/src/js/adapter_factory.js"() {
    init_utils2();
    init_chrome_shim();
    init_firefox_shim();
    init_safari_shim();
    init_common_shim();
    sdp = __toESM(require_sdp());
  }
});

// node_modules/webrtc-adapter/src/js/adapter_core.js
var adapter, adapter_core_default;
var init_adapter_core = __esm({
  "node_modules/webrtc-adapter/src/js/adapter_core.js"() {
    "use strict";
    init_adapter_factory();
    adapter = adapterFactory({ window: typeof window === "undefined" ? void 0 : window });
    adapter_core_default = adapter;
  }
});

// node_modules/peerjs/dist/bundler.mjs
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, { get: v, set: s, enumerable: true, configurable: true });
}
function $fcbcc7538a6776d5$export$52c89ebcdc4f53f2(bufs) {
  let size = 0;
  for (const buf of bufs) size += buf.byteLength;
  const result = new Uint8Array(size);
  let offset = 0;
  for (const buf of bufs) {
    result.set(buf, offset);
    offset += buf.byteLength;
  }
  return result;
}
function $c4dcfd1d1ea86647$var$Events() {
}
function $c4dcfd1d1ea86647$var$EE(fn, context, once2) {
  this.fn = fn;
  this.context = context;
  this.once = once2 || false;
}
function $c4dcfd1d1ea86647$var$addListener(emitter, event, fn, context, once2) {
  if (typeof fn !== "function") throw new TypeError("The listener must be a function");
  var listener = new $c4dcfd1d1ea86647$var$EE(fn, context || emitter, once2), evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [
    emitter._events[evt],
    listener
  ];
  return emitter;
}
function $c4dcfd1d1ea86647$var$clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new $c4dcfd1d1ea86647$var$Events();
  else delete emitter._events[evt];
}
function $c4dcfd1d1ea86647$var$EventEmitter() {
  this._events = new $c4dcfd1d1ea86647$var$Events();
  this._eventsCount = 0;
}
var $fcbcc7538a6776d5$export$f1c5f4c9cb95390b, $fb63e766cfafaab9$var$webRTCAdapter, $fb63e766cfafaab9$export$25be9502477c137d, $9a84a32bf0bf36bb$export$f35f128fd59ea256, $0e5fd1585784c252$export$4e61f672936bec77, $4f4134156c446392$var$DEFAULT_CONFIG, $4f4134156c446392$export$f8f26dd395d7e1bd, $4f4134156c446392$export$7debb50ef11d5e0b, $257947e92926277a$var$LOG_PREFIX, $257947e92926277a$var$Logger, $257947e92926277a$export$2e2bcd8739ae039, $c4dcfd1d1ea86647$exports, $c4dcfd1d1ea86647$var$has, $c4dcfd1d1ea86647$var$prefix, $78455e22dea96b8c$exports, $78455e22dea96b8c$export$3157d57b4135e3bc, $78455e22dea96b8c$export$9547aaa2e39030ff, $78455e22dea96b8c$export$7974935686149686, $78455e22dea96b8c$export$49ae800c114df41d, $78455e22dea96b8c$export$89f507cf986a947, $78455e22dea96b8c$export$3b5c4a4b6354f023, $78455e22dea96b8c$export$adb4a1754da6f10d, $520832d44ba058c8$export$83d89fbfd8236492, $8f5bfa60836d261d$export$4798917dbf149b79, $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a, $23779d1881157a18$export$6a678e589c8a4542, $23779d1881157a18$export$98871882f492de82, $5045192fc6d387ba$export$23a2a68283c24d80, $5c1d08c7c57da9a3$export$4a84e95a2324ac29, $abf266641927cd89$export$2c4e825dc9120f87, $6366c4ca161bc297$export$d365f7ad9d7df9c9, $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b, $9fcfddb3ae148f88$export$f0a5a64d5bb37108, $bbaee3f15f714663$export$6f88fe47d32c9c94, $817f931e3f9096cf$export$48880ac635f47186, $416260bce337df90$export$ecd1fc136c422448;
var init_bundler = __esm({
  "node_modules/peerjs/dist/bundler.mjs"() {
    init_binarypack();
    init_adapter_core();
    $fcbcc7538a6776d5$export$f1c5f4c9cb95390b = class {
      constructor() {
        this.chunkedMTU = 16300;
        this._dataCount = 1;
        this.chunk = (blob) => {
          const chunks = [];
          const size = blob.byteLength;
          const total = Math.ceil(size / this.chunkedMTU);
          let index = 0;
          let start = 0;
          while (start < size) {
            const end = Math.min(size, start + this.chunkedMTU);
            const b = blob.slice(start, end);
            const chunk = {
              __peerData: this._dataCount,
              n: index,
              data: b,
              total
            };
            chunks.push(chunk);
            start = end;
            index++;
          }
          this._dataCount++;
          return chunks;
        };
      }
    };
    $fb63e766cfafaab9$var$webRTCAdapter = //@ts-ignore
    (0, adapter_core_default).default || (0, adapter_core_default);
    $fb63e766cfafaab9$export$25be9502477c137d = new class {
      isWebRTCSupported() {
        return typeof RTCPeerConnection !== "undefined";
      }
      isBrowserSupported() {
        const browser = this.getBrowser();
        const version = this.getVersion();
        const validBrowser = this.supportedBrowsers.includes(browser);
        if (!validBrowser) return false;
        if (browser === "chrome") return version >= this.minChromeVersion;
        if (browser === "firefox") return version >= this.minFirefoxVersion;
        if (browser === "safari") return !this.isIOS && version >= this.minSafariVersion;
        return false;
      }
      getBrowser() {
        return $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.browser;
      }
      getVersion() {
        return $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.version || 0;
      }
      isUnifiedPlanSupported() {
        const browser = this.getBrowser();
        const version = $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.version || 0;
        if (browser === "chrome" && version < this.minChromeVersion) return false;
        if (browser === "firefox" && version >= this.minFirefoxVersion) return true;
        if (!window.RTCRtpTransceiver || !("currentDirection" in RTCRtpTransceiver.prototype)) return false;
        let tempPc;
        let supported = false;
        try {
          tempPc = new RTCPeerConnection();
          tempPc.addTransceiver("audio");
          supported = true;
        } catch (e) {
        } finally {
          if (tempPc) tempPc.close();
        }
        return supported;
      }
      toString() {
        return `Supports:
    browser:${this.getBrowser()}
    version:${this.getVersion()}
    isIOS:${this.isIOS}
    isWebRTCSupported:${this.isWebRTCSupported()}
    isBrowserSupported:${this.isBrowserSupported()}
    isUnifiedPlanSupported:${this.isUnifiedPlanSupported()}`;
      }
      constructor() {
        this.isIOS = typeof navigator !== "undefined" ? [
          "iPad",
          "iPhone",
          "iPod"
        ].includes(navigator.platform) : false;
        this.supportedBrowsers = [
          "firefox",
          "chrome",
          "safari"
        ];
        this.minFirefoxVersion = 59;
        this.minChromeVersion = 72;
        this.minSafariVersion = 605;
      }
    }();
    $9a84a32bf0bf36bb$export$f35f128fd59ea256 = (id) => {
      return !id || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(id);
    };
    $0e5fd1585784c252$export$4e61f672936bec77 = () => Math.random().toString(36).slice(2);
    $4f4134156c446392$var$DEFAULT_CONFIG = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        },
        {
          urls: [
            "turn:eu-0.turn.peerjs.com:3478",
            "turn:us-0.turn.peerjs.com:3478"
          ],
          username: "peerjs",
          credential: "peerjsp"
        }
      ],
      sdpSemantics: "unified-plan"
    };
    $4f4134156c446392$export$f8f26dd395d7e1bd = class extends (0, $fcbcc7538a6776d5$export$f1c5f4c9cb95390b) {
      noop() {
      }
      blobToArrayBuffer(blob, cb) {
        const fr = new FileReader();
        fr.onload = function(evt) {
          if (evt.target) cb(evt.target.result);
        };
        fr.readAsArrayBuffer(blob);
        return fr;
      }
      binaryStringToArrayBuffer(binary) {
        const byteArray = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) byteArray[i] = binary.charCodeAt(i) & 255;
        return byteArray.buffer;
      }
      isSecure() {
        return location.protocol === "https:";
      }
      constructor(...args) {
        super(...args), this.CLOUD_HOST = "0.peerjs.com", this.CLOUD_PORT = 443, // Browsers that need chunking:
        this.chunkedBrowsers = {
          Chrome: 1,
          chrome: 1
        }, // Returns browser-agnostic default config
        this.defaultConfig = $4f4134156c446392$var$DEFAULT_CONFIG, this.browser = (0, $fb63e766cfafaab9$export$25be9502477c137d).getBrowser(), this.browserVersion = (0, $fb63e766cfafaab9$export$25be9502477c137d).getVersion(), this.pack = $0cfd7828ad59115f$export$2a703dbb0cb35339, this.unpack = $0cfd7828ad59115f$export$417857010dc9287f, /**
        * A hash of WebRTC features mapped to booleans that correspond to whether the feature is supported by the current browser.
        *
        * :::caution
        * Only the properties documented here are guaranteed to be present on `util.supports`
        * :::
        */
        this.supports = function() {
          const supported = {
            browser: (0, $fb63e766cfafaab9$export$25be9502477c137d).isBrowserSupported(),
            webRTC: (0, $fb63e766cfafaab9$export$25be9502477c137d).isWebRTCSupported(),
            audioVideo: false,
            data: false,
            binaryBlob: false,
            reliable: false
          };
          if (!supported.webRTC) return supported;
          let pc;
          try {
            pc = new RTCPeerConnection($4f4134156c446392$var$DEFAULT_CONFIG);
            supported.audioVideo = true;
            let dc;
            try {
              dc = pc.createDataChannel("_PEERJSTEST", {
                ordered: true
              });
              supported.data = true;
              supported.reliable = !!dc.ordered;
              try {
                dc.binaryType = "blob";
                supported.binaryBlob = !(0, $fb63e766cfafaab9$export$25be9502477c137d).isIOS;
              } catch (e) {
              }
            } catch (e) {
            } finally {
              if (dc) dc.close();
            }
          } catch (e) {
          } finally {
            if (pc) pc.close();
          }
          return supported;
        }(), // Ensure alphanumeric ids
        this.validateId = (0, $9a84a32bf0bf36bb$export$f35f128fd59ea256), this.randomToken = (0, $0e5fd1585784c252$export$4e61f672936bec77);
      }
    };
    $4f4134156c446392$export$7debb50ef11d5e0b = new $4f4134156c446392$export$f8f26dd395d7e1bd();
    $257947e92926277a$var$LOG_PREFIX = "PeerJS: ";
    $257947e92926277a$var$Logger = class {
      get logLevel() {
        return this._logLevel;
      }
      set logLevel(logLevel) {
        this._logLevel = logLevel;
      }
      log(...args) {
        if (this._logLevel >= 3) this._print(3, ...args);
      }
      warn(...args) {
        if (this._logLevel >= 2) this._print(2, ...args);
      }
      error(...args) {
        if (this._logLevel >= 1) this._print(1, ...args);
      }
      setLogFunction(fn) {
        this._print = fn;
      }
      _print(logLevel, ...rest) {
        const copy = [
          $257947e92926277a$var$LOG_PREFIX,
          ...rest
        ];
        for (const i in copy) if (copy[i] instanceof Error) copy[i] = "(" + copy[i].name + ") " + copy[i].message;
        if (logLevel >= 3) console.log(...copy);
        else if (logLevel >= 2) console.warn("WARNING", ...copy);
        else if (logLevel >= 1) console.error("ERROR", ...copy);
      }
      constructor() {
        this._logLevel = 0;
      }
    };
    $257947e92926277a$export$2e2bcd8739ae039 = new $257947e92926277a$var$Logger();
    $c4dcfd1d1ea86647$exports = {};
    $c4dcfd1d1ea86647$var$has = Object.prototype.hasOwnProperty;
    $c4dcfd1d1ea86647$var$prefix = "~";
    if (Object.create) {
      $c4dcfd1d1ea86647$var$Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new $c4dcfd1d1ea86647$var$Events().__proto__) $c4dcfd1d1ea86647$var$prefix = false;
    }
    $c4dcfd1d1ea86647$var$EventEmitter.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0) return names;
      for (name in events = this._events) if ($c4dcfd1d1ea86647$var$has.call(events, name)) names.push($c4dcfd1d1ea86647$var$prefix ? name.slice(1) : name);
      if (Object.getOwnPropertySymbols) return names.concat(Object.getOwnPropertySymbols(events));
      return names;
    };
    $c4dcfd1d1ea86647$var$EventEmitter.prototype.listeners = function listeners(event) {
      var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event, handlers = this._events[evt];
      if (!handlers) return [];
      if (handlers.fn) return [
        handlers.fn
      ];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) ee[i] = handlers[i].fn;
      return ee;
    };
    $c4dcfd1d1ea86647$var$EventEmitter.prototype.listenerCount = function listenerCount(event) {
      var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event, listeners2 = this._events[evt];
      if (!listeners2) return 0;
      if (listeners2.fn) return 1;
      return listeners2.length;
    };
    $c4dcfd1d1ea86647$var$EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
      if (!this._events[evt]) return false;
      var listeners2 = this._events[evt], len = arguments.length, args, i;
      if (listeners2.fn) {
        if (listeners2.once) this.removeListener(event, listeners2.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners2.fn.call(listeners2.context), true;
          case 2:
            return listeners2.fn.call(listeners2.context, a1), true;
          case 3:
            return listeners2.fn.call(listeners2.context, a1, a2), true;
          case 4:
            return listeners2.fn.call(listeners2.context, a1, a2, a3), true;
          case 5:
            return listeners2.fn.call(listeners2.context, a1, a2, a3, a4), true;
          case 6:
            return listeners2.fn.call(listeners2.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) args[i - 1] = arguments[i];
        listeners2.fn.apply(listeners2.context, args);
      } else {
        var length = listeners2.length, j;
        for (i = 0; i < length; i++) {
          if (listeners2[i].once) this.removeListener(event, listeners2[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners2[i].fn.call(listeners2[i].context);
              break;
            case 2:
              listeners2[i].fn.call(listeners2[i].context, a1);
              break;
            case 3:
              listeners2[i].fn.call(listeners2[i].context, a1, a2);
              break;
            case 4:
              listeners2[i].fn.call(listeners2[i].context, a1, a2, a3);
              break;
            default:
              if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) args[j - 1] = arguments[j];
              listeners2[i].fn.apply(listeners2[i].context, args);
          }
        }
      }
      return true;
    };
    $c4dcfd1d1ea86647$var$EventEmitter.prototype.on = function on(event, fn, context) {
      return $c4dcfd1d1ea86647$var$addListener(this, event, fn, context, false);
    };
    $c4dcfd1d1ea86647$var$EventEmitter.prototype.once = function once(event, fn, context) {
      return $c4dcfd1d1ea86647$var$addListener(this, event, fn, context, true);
    };
    $c4dcfd1d1ea86647$var$EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once2) {
      var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
      if (!this._events[evt]) return this;
      if (!fn) {
        $c4dcfd1d1ea86647$var$clearEvent(this, evt);
        return this;
      }
      var listeners2 = this._events[evt];
      if (listeners2.fn) {
        if (listeners2.fn === fn && (!once2 || listeners2.once) && (!context || listeners2.context === context)) $c4dcfd1d1ea86647$var$clearEvent(this, evt);
      } else {
        for (var i = 0, events = [], length = listeners2.length; i < length; i++) if (listeners2[i].fn !== fn || once2 && !listeners2[i].once || context && listeners2[i].context !== context) events.push(listeners2[i]);
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else $c4dcfd1d1ea86647$var$clearEvent(this, evt);
      }
      return this;
    };
    $c4dcfd1d1ea86647$var$EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
        if (this._events[evt]) $c4dcfd1d1ea86647$var$clearEvent(this, evt);
      } else {
        this._events = new $c4dcfd1d1ea86647$var$Events();
        this._eventsCount = 0;
      }
      return this;
    };
    $c4dcfd1d1ea86647$var$EventEmitter.prototype.off = $c4dcfd1d1ea86647$var$EventEmitter.prototype.removeListener;
    $c4dcfd1d1ea86647$var$EventEmitter.prototype.addListener = $c4dcfd1d1ea86647$var$EventEmitter.prototype.on;
    $c4dcfd1d1ea86647$var$EventEmitter.prefixed = $c4dcfd1d1ea86647$var$prefix;
    $c4dcfd1d1ea86647$var$EventEmitter.EventEmitter = $c4dcfd1d1ea86647$var$EventEmitter;
    $c4dcfd1d1ea86647$exports = $c4dcfd1d1ea86647$var$EventEmitter;
    $78455e22dea96b8c$exports = {};
    $parcel$export($78455e22dea96b8c$exports, "ConnectionType", () => $78455e22dea96b8c$export$3157d57b4135e3bc);
    $parcel$export($78455e22dea96b8c$exports, "PeerErrorType", () => $78455e22dea96b8c$export$9547aaa2e39030ff);
    $parcel$export($78455e22dea96b8c$exports, "BaseConnectionErrorType", () => $78455e22dea96b8c$export$7974935686149686);
    $parcel$export($78455e22dea96b8c$exports, "DataConnectionErrorType", () => $78455e22dea96b8c$export$49ae800c114df41d);
    $parcel$export($78455e22dea96b8c$exports, "SerializationType", () => $78455e22dea96b8c$export$89f507cf986a947);
    $parcel$export($78455e22dea96b8c$exports, "SocketEventType", () => $78455e22dea96b8c$export$3b5c4a4b6354f023);
    $parcel$export($78455e22dea96b8c$exports, "ServerMessageType", () => $78455e22dea96b8c$export$adb4a1754da6f10d);
    $78455e22dea96b8c$export$3157d57b4135e3bc = /* @__PURE__ */ function(ConnectionType) {
      ConnectionType["Data"] = "data";
      ConnectionType["Media"] = "media";
      return ConnectionType;
    }({});
    $78455e22dea96b8c$export$9547aaa2e39030ff = /* @__PURE__ */ function(PeerErrorType) {
      PeerErrorType["BrowserIncompatible"] = "browser-incompatible";
      PeerErrorType["Disconnected"] = "disconnected";
      PeerErrorType["InvalidID"] = "invalid-id";
      PeerErrorType["InvalidKey"] = "invalid-key";
      PeerErrorType["Network"] = "network";
      PeerErrorType["PeerUnavailable"] = "peer-unavailable";
      PeerErrorType["SslUnavailable"] = "ssl-unavailable";
      PeerErrorType["ServerError"] = "server-error";
      PeerErrorType["SocketError"] = "socket-error";
      PeerErrorType["SocketClosed"] = "socket-closed";
      PeerErrorType["UnavailableID"] = "unavailable-id";
      PeerErrorType["WebRTC"] = "webrtc";
      return PeerErrorType;
    }({});
    $78455e22dea96b8c$export$7974935686149686 = /* @__PURE__ */ function(BaseConnectionErrorType) {
      BaseConnectionErrorType["NegotiationFailed"] = "negotiation-failed";
      BaseConnectionErrorType["ConnectionClosed"] = "connection-closed";
      return BaseConnectionErrorType;
    }({});
    $78455e22dea96b8c$export$49ae800c114df41d = /* @__PURE__ */ function(DataConnectionErrorType) {
      DataConnectionErrorType["NotOpenYet"] = "not-open-yet";
      DataConnectionErrorType["MessageToBig"] = "message-too-big";
      return DataConnectionErrorType;
    }({});
    $78455e22dea96b8c$export$89f507cf986a947 = /* @__PURE__ */ function(SerializationType) {
      SerializationType["Binary"] = "binary";
      SerializationType["BinaryUTF8"] = "binary-utf8";
      SerializationType["JSON"] = "json";
      SerializationType["None"] = "raw";
      return SerializationType;
    }({});
    $78455e22dea96b8c$export$3b5c4a4b6354f023 = /* @__PURE__ */ function(SocketEventType) {
      SocketEventType["Message"] = "message";
      SocketEventType["Disconnected"] = "disconnected";
      SocketEventType["Error"] = "error";
      SocketEventType["Close"] = "close";
      return SocketEventType;
    }({});
    $78455e22dea96b8c$export$adb4a1754da6f10d = /* @__PURE__ */ function(ServerMessageType) {
      ServerMessageType["Heartbeat"] = "HEARTBEAT";
      ServerMessageType["Candidate"] = "CANDIDATE";
      ServerMessageType["Offer"] = "OFFER";
      ServerMessageType["Answer"] = "ANSWER";
      ServerMessageType["Open"] = "OPEN";
      ServerMessageType["Error"] = "ERROR";
      ServerMessageType["IdTaken"] = "ID-TAKEN";
      ServerMessageType["InvalidKey"] = "INVALID-KEY";
      ServerMessageType["Leave"] = "LEAVE";
      ServerMessageType["Expire"] = "EXPIRE";
      return ServerMessageType;
    }({});
    $520832d44ba058c8$export$83d89fbfd8236492 = "1.5.5";
    $8f5bfa60836d261d$export$4798917dbf149b79 = class extends (0, $c4dcfd1d1ea86647$exports.EventEmitter) {
      constructor(secure, host, port, path, key, pingInterval = 5e3) {
        super(), this.pingInterval = pingInterval, this._disconnected = true, this._messagesQueue = [];
        const wsProtocol = secure ? "wss://" : "ws://";
        this._baseUrl = wsProtocol + host + ":" + port + path + "peerjs?key=" + key;
      }
      start(id, token) {
        this._id = id;
        const wsUrl = `${this._baseUrl}&id=${id}&token=${token}`;
        if (!!this._socket || !this._disconnected) return;
        this._socket = new WebSocket(wsUrl + "&version=" + (0, $520832d44ba058c8$export$83d89fbfd8236492));
        this._disconnected = false;
        this._socket.onmessage = (event) => {
          let data;
          try {
            data = JSON.parse(event.data);
            (0, $257947e92926277a$export$2e2bcd8739ae039).log("Server message received:", data);
          } catch (e) {
            (0, $257947e92926277a$export$2e2bcd8739ae039).log("Invalid server message", event.data);
            return;
          }
          this.emit((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Message, data);
        };
        this._socket.onclose = (event) => {
          if (this._disconnected) return;
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Socket closed.", event);
          this._cleanup();
          this._disconnected = true;
          this.emit((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Disconnected);
        };
        this._socket.onopen = () => {
          if (this._disconnected) return;
          this._sendQueuedMessages();
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Socket open");
          this._scheduleHeartbeat();
        };
      }
      _scheduleHeartbeat() {
        this._wsPingTimer = setTimeout(() => {
          this._sendHeartbeat();
        }, this.pingInterval);
      }
      _sendHeartbeat() {
        if (!this._wsOpen()) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Cannot send heartbeat, because socket closed`);
          return;
        }
        const message = JSON.stringify({
          type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Heartbeat
        });
        this._socket.send(message);
        this._scheduleHeartbeat();
      }
      /** Is the websocket currently open? */
      _wsOpen() {
        return !!this._socket && this._socket.readyState === 1;
      }
      /** Send queued messages. */
      _sendQueuedMessages() {
        const copiedQueue = [
          ...this._messagesQueue
        ];
        this._messagesQueue = [];
        for (const message of copiedQueue) this.send(message);
      }
      /** Exposed send for DC & Peer. */
      send(data) {
        if (this._disconnected) return;
        if (!this._id) {
          this._messagesQueue.push(data);
          return;
        }
        if (!data.type) {
          this.emit((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Error, "Invalid message");
          return;
        }
        if (!this._wsOpen()) return;
        const message = JSON.stringify(data);
        this._socket.send(message);
      }
      close() {
        if (this._disconnected) return;
        this._cleanup();
        this._disconnected = true;
      }
      _cleanup() {
        if (this._socket) {
          this._socket.onopen = this._socket.onmessage = this._socket.onclose = null;
          this._socket.close();
          this._socket = void 0;
        }
        clearTimeout(this._wsPingTimer);
      }
    };
    $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a = class {
      constructor(connection) {
        this.connection = connection;
      }
      /** Returns a PeerConnection object set up correctly (for data, media). */
      startConnection(options) {
        const peerConnection = this._startPeerConnection();
        this.connection.peerConnection = peerConnection;
        if (this.connection.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media && options._stream) this._addTracksToConnection(options._stream, peerConnection);
        if (options.originator) {
          const dataConnection = this.connection;
          const config = {
            ordered: !!options.reliable
          };
          const dataChannel = peerConnection.createDataChannel(dataConnection.label, config);
          dataConnection._initializeDataChannel(dataChannel);
          this._makeOffer();
        } else this.handleSDP("OFFER", options.sdp);
      }
      /** Start a PC. */
      _startPeerConnection() {
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Creating RTCPeerConnection.");
        const peerConnection = new RTCPeerConnection(this.connection.provider.options.config);
        this._setupListeners(peerConnection);
        return peerConnection;
      }
      /** Set up various WebRTC listeners. */
      _setupListeners(peerConnection) {
        const peerId = this.connection.peer;
        const connectionId = this.connection.connectionId;
        const connectionType = this.connection.type;
        const provider = this.connection.provider;
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Listening for ICE candidates.");
        peerConnection.onicecandidate = (evt) => {
          if (!evt.candidate || !evt.candidate.candidate) return;
          (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Received ICE candidates for ${peerId}:`, evt.candidate);
          provider.socket.send({
            type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Candidate,
            payload: {
              candidate: evt.candidate,
              type: connectionType,
              connectionId
            },
            dst: peerId
          });
        };
        peerConnection.oniceconnectionstatechange = () => {
          switch (peerConnection.iceConnectionState) {
            case "failed":
              (0, $257947e92926277a$export$2e2bcd8739ae039).log("iceConnectionState is failed, closing connections to " + peerId);
              this.connection.emitError((0, $78455e22dea96b8c$export$7974935686149686).NegotiationFailed, "Negotiation of connection to " + peerId + " failed.");
              this.connection.close();
              break;
            case "closed":
              (0, $257947e92926277a$export$2e2bcd8739ae039).log("iceConnectionState is closed, closing connections to " + peerId);
              this.connection.emitError((0, $78455e22dea96b8c$export$7974935686149686).ConnectionClosed, "Connection to " + peerId + " closed.");
              this.connection.close();
              break;
            case "disconnected":
              (0, $257947e92926277a$export$2e2bcd8739ae039).log("iceConnectionState changed to disconnected on the connection with " + peerId);
              break;
            case "completed":
              peerConnection.onicecandidate = () => {
              };
              break;
          }
          this.connection.emit("iceStateChanged", peerConnection.iceConnectionState);
        };
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Listening for data channel");
        peerConnection.ondatachannel = (evt) => {
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Received data channel");
          const dataChannel = evt.channel;
          const connection = provider.getConnection(peerId, connectionId);
          connection._initializeDataChannel(dataChannel);
        };
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Listening for remote stream");
        peerConnection.ontrack = (evt) => {
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Received remote stream");
          const stream = evt.streams[0];
          const connection = provider.getConnection(peerId, connectionId);
          if (connection.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media) {
            const mediaConnection = connection;
            this._addStreamToMediaConnection(stream, mediaConnection);
          }
        };
      }
      cleanup() {
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Cleaning up PeerConnection to " + this.connection.peer);
        const peerConnection = this.connection.peerConnection;
        if (!peerConnection) return;
        this.connection.peerConnection = null;
        peerConnection.onicecandidate = peerConnection.oniceconnectionstatechange = peerConnection.ondatachannel = peerConnection.ontrack = () => {
        };
        const peerConnectionNotClosed = peerConnection.signalingState !== "closed";
        let dataChannelNotClosed = false;
        const dataChannel = this.connection.dataChannel;
        if (dataChannel) dataChannelNotClosed = !!dataChannel.readyState && dataChannel.readyState !== "closed";
        if (peerConnectionNotClosed || dataChannelNotClosed) peerConnection.close();
      }
      async _makeOffer() {
        const peerConnection = this.connection.peerConnection;
        const provider = this.connection.provider;
        try {
          const offer = await peerConnection.createOffer(this.connection.options.constraints);
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Created offer.");
          if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function") offer.sdp = this.connection.options.sdpTransform(offer.sdp) || offer.sdp;
          try {
            await peerConnection.setLocalDescription(offer);
            (0, $257947e92926277a$export$2e2bcd8739ae039).log("Set localDescription:", offer, `for:${this.connection.peer}`);
            let payload = {
              sdp: offer,
              type: this.connection.type,
              connectionId: this.connection.connectionId,
              metadata: this.connection.metadata
            };
            if (this.connection.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Data) {
              const dataConnection = this.connection;
              payload = {
                ...payload,
                label: dataConnection.label,
                reliable: dataConnection.reliable,
                serialization: dataConnection.serialization
              };
            }
            provider.socket.send({
              type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Offer,
              payload,
              dst: this.connection.peer
            });
          } catch (err) {
            if (err != "OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer") {
              provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
              (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setLocalDescription, ", err);
            }
          }
        } catch (err_1) {
          provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err_1);
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to createOffer, ", err_1);
        }
      }
      async _makeAnswer() {
        const peerConnection = this.connection.peerConnection;
        const provider = this.connection.provider;
        try {
          const answer = await peerConnection.createAnswer();
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Created answer.");
          if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function") answer.sdp = this.connection.options.sdpTransform(answer.sdp) || answer.sdp;
          try {
            await peerConnection.setLocalDescription(answer);
            (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Set localDescription:`, answer, `for:${this.connection.peer}`);
            provider.socket.send({
              type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Answer,
              payload: {
                sdp: answer,
                type: this.connection.type,
                connectionId: this.connection.connectionId
              },
              dst: this.connection.peer
            });
          } catch (err) {
            provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
            (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setLocalDescription, ", err);
          }
        } catch (err_1) {
          provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err_1);
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to create answer, ", err_1);
        }
      }
      /** Handle an SDP. */
      async handleSDP(type, sdp2) {
        sdp2 = new RTCSessionDescription(sdp2);
        const peerConnection = this.connection.peerConnection;
        const provider = this.connection.provider;
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Setting remote description", sdp2);
        const self = this;
        try {
          await peerConnection.setRemoteDescription(sdp2);
          (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Set remoteDescription:${type} for:${this.connection.peer}`);
          if (type === "OFFER") await self._makeAnswer();
        } catch (err) {
          provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setRemoteDescription, ", err);
        }
      }
      /** Handle a candidate. */
      async handleCandidate(ice) {
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`handleCandidate:`, ice);
        try {
          await this.connection.peerConnection.addIceCandidate(ice);
          (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Added ICE candidate for:${this.connection.peer}`);
        } catch (err) {
          this.connection.provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to handleCandidate, ", err);
        }
      }
      _addTracksToConnection(stream, peerConnection) {
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`add tracks from stream ${stream.id} to peer connection`);
        if (!peerConnection.addTrack) return (0, $257947e92926277a$export$2e2bcd8739ae039).error(`Your browser does't support RTCPeerConnection#addTrack. Ignored.`);
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      }
      _addStreamToMediaConnection(stream, mediaConnection) {
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`add stream ${stream.id} to media connection ${mediaConnection.connectionId}`);
        mediaConnection.addStream(stream);
      }
    };
    $23779d1881157a18$export$6a678e589c8a4542 = class extends (0, $c4dcfd1d1ea86647$exports.EventEmitter) {
      /**
      * Emits a typed error message.
      *
      * @internal
      */
      emitError(type, err) {
        (0, $257947e92926277a$export$2e2bcd8739ae039).error("Error:", err);
        this.emit("error", new $23779d1881157a18$export$98871882f492de82(`${type}`, err));
      }
    };
    $23779d1881157a18$export$98871882f492de82 = class extends Error {
      /**
      * @internal
      */
      constructor(type, err) {
        if (typeof err === "string") super(err);
        else {
          super();
          Object.assign(this, err);
        }
        this.type = type;
      }
    };
    $5045192fc6d387ba$export$23a2a68283c24d80 = class extends (0, $23779d1881157a18$export$6a678e589c8a4542) {
      /**
      * Whether the media connection is active (e.g. your call has been answered).
      * You can check this if you want to set a maximum wait time for a one-sided call.
      */
      get open() {
        return this._open;
      }
      constructor(peer2, provider, options) {
        super(), this.peer = peer2, this.provider = provider, this.options = options, this._open = false;
        this.metadata = options.metadata;
      }
    };
    $5c1d08c7c57da9a3$export$4a84e95a2324ac29 = class _$5c1d08c7c57da9a3$export$4a84e95a2324ac29 extends (0, $5045192fc6d387ba$export$23a2a68283c24d80) {
      static #_ = this.ID_PREFIX = "mc_";
      /**
      * For media connections, this is always 'media'.
      */
      get type() {
        return (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media;
      }
      get localStream() {
        return this._localStream;
      }
      get remoteStream() {
        return this._remoteStream;
      }
      constructor(peerId, provider, options) {
        super(peerId, provider, options);
        this._localStream = this.options._stream;
        this.connectionId = this.options.connectionId || _$5c1d08c7c57da9a3$export$4a84e95a2324ac29.ID_PREFIX + (0, $4f4134156c446392$export$7debb50ef11d5e0b).randomToken();
        this._negotiator = new (0, $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a)(this);
        if (this._localStream) this._negotiator.startConnection({
          _stream: this._localStream,
          originator: true
        });
      }
      /** Called by the Negotiator when the DataChannel is ready. */
      _initializeDataChannel(dc) {
        this.dataChannel = dc;
        this.dataChannel.onopen = () => {
          (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc connection success`);
          this.emit("willCloseOnRemote");
        };
        this.dataChannel.onclose = () => {
          (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc closed for:`, this.peer);
          this.close();
        };
      }
      addStream(remoteStream) {
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Receiving stream", remoteStream);
        this._remoteStream = remoteStream;
        super.emit("stream", remoteStream);
      }
      /**
      * @internal
      */
      handleMessage(message) {
        const type = message.type;
        const payload = message.payload;
        switch (message.type) {
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Answer:
            this._negotiator.handleSDP(type, payload.sdp);
            this._open = true;
            break;
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Candidate:
            this._negotiator.handleCandidate(payload.candidate);
            break;
          default:
            (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`Unrecognized message type:${type} from peer:${this.peer}`);
            break;
        }
      }
      /**
           * When receiving a {@apilink PeerEvents | `call`} event on a peer, you can call
           * `answer` on the media connection provided by the callback to accept the call
           * and optionally send your own media stream.
      
           *
           * @param stream A WebRTC media stream.
           * @param options
           * @returns
           */
      answer(stream, options = {}) {
        if (this._localStream) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");
          return;
        }
        this._localStream = stream;
        if (options && options.sdpTransform) this.options.sdpTransform = options.sdpTransform;
        this._negotiator.startConnection({
          ...this.options._payload,
          _stream: stream
        });
        const messages = this.provider._getMessages(this.connectionId);
        for (const message of messages) this.handleMessage(message);
        this._open = true;
      }
      /**
      * Exposed functionality for users.
      */
      /**
      * Closes the media connection.
      */
      close() {
        if (this._negotiator) {
          this._negotiator.cleanup();
          this._negotiator = null;
        }
        this._localStream = null;
        this._remoteStream = null;
        if (this.provider) {
          this.provider._removeConnection(this);
          this.provider = null;
        }
        if (this.options && this.options._stream) this.options._stream = null;
        if (!this.open) return;
        this._open = false;
        super.emit("close");
      }
    };
    $abf266641927cd89$export$2c4e825dc9120f87 = class {
      constructor(_options) {
        this._options = _options;
      }
      _buildRequest(method) {
        const protocol = this._options.secure ? "https" : "http";
        const { host, port, path, key } = this._options;
        const url = new URL(`${protocol}://${host}:${port}${path}${key}/${method}`);
        url.searchParams.set("ts", `${Date.now()}${Math.random()}`);
        url.searchParams.set("version", (0, $520832d44ba058c8$export$83d89fbfd8236492));
        return fetch(url.href, {
          referrerPolicy: this._options.referrerPolicy
        });
      }
      /** Get a unique ID from the server via XHR and initialize with it. */
      async retrieveId() {
        try {
          const response = await this._buildRequest("id");
          if (response.status !== 200) throw new Error(`Error. Status:${response.status}`);
          return response.text();
        } catch (error) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).error("Error retrieving ID", error);
          let pathError = "";
          if (this._options.path === "/" && this._options.host !== (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST) pathError = " If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer.";
          throw new Error("Could not get an ID from the server." + pathError);
        }
      }
      /** @deprecated */
      async listAllPeers() {
        try {
          const response = await this._buildRequest("peers");
          if (response.status !== 200) {
            if (response.status === 401) {
              let helpfulError = "";
              if (this._options.host === (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST) helpfulError = "It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key.";
              else helpfulError = "You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.";
              throw new Error("It doesn't look like you have permission to list peers IDs. " + helpfulError);
            }
            throw new Error(`Error. Status:${response.status}`);
          }
          return response.json();
        } catch (error) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).error("Error retrieving list peers", error);
          throw new Error("Could not get list peers from the server." + error);
        }
      }
    };
    $6366c4ca161bc297$export$d365f7ad9d7df9c9 = class _$6366c4ca161bc297$export$d365f7ad9d7df9c9 extends (0, $5045192fc6d387ba$export$23a2a68283c24d80) {
      static #_ = this.ID_PREFIX = "dc_";
      static #_2 = this.MAX_BUFFERED_AMOUNT = 8388608;
      get type() {
        return (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Data;
      }
      constructor(peerId, provider, options) {
        super(peerId, provider, options);
        this.connectionId = this.options.connectionId || _$6366c4ca161bc297$export$d365f7ad9d7df9c9.ID_PREFIX + (0, $0e5fd1585784c252$export$4e61f672936bec77)();
        this.label = this.options.label || this.connectionId;
        this.reliable = !!this.options.reliable;
        this._negotiator = new (0, $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a)(this);
        this._negotiator.startConnection(this.options._payload || {
          originator: true,
          reliable: this.reliable
        });
      }
      /** Called by the Negotiator when the DataChannel is ready. */
      _initializeDataChannel(dc) {
        this.dataChannel = dc;
        this.dataChannel.onopen = () => {
          (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc connection success`);
          this._open = true;
          this.emit("open");
        };
        this.dataChannel.onmessage = (e) => {
          (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc onmessage:`, e.data);
        };
        this.dataChannel.onclose = () => {
          (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc closed for:`, this.peer);
          this.close();
        };
      }
      /**
      * Exposed functionality for users.
      */
      /** Allows user to close connection. */
      close(options) {
        if (options?.flush) {
          this.send({
            __peerData: {
              type: "close"
            }
          });
          return;
        }
        if (this._negotiator) {
          this._negotiator.cleanup();
          this._negotiator = null;
        }
        if (this.provider) {
          this.provider._removeConnection(this);
          this.provider = null;
        }
        if (this.dataChannel) {
          this.dataChannel.onopen = null;
          this.dataChannel.onmessage = null;
          this.dataChannel.onclose = null;
          this.dataChannel = null;
        }
        if (!this.open) return;
        this._open = false;
        super.emit("close");
      }
      /** Allows user to send data. */
      send(data, chunked = false) {
        if (!this.open) {
          this.emitError((0, $78455e22dea96b8c$export$49ae800c114df41d).NotOpenYet, "Connection is not open. You should listen for the `open` event before sending messages.");
          return;
        }
        return this._send(data, chunked);
      }
      async handleMessage(message) {
        const payload = message.payload;
        switch (message.type) {
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Answer:
            await this._negotiator.handleSDP(message.type, payload.sdp);
            break;
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Candidate:
            await this._negotiator.handleCandidate(payload.candidate);
            break;
          default:
            (0, $257947e92926277a$export$2e2bcd8739ae039).warn("Unrecognized message type:", message.type, "from peer:", this.peer);
            break;
        }
      }
    };
    $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b = class extends (0, $6366c4ca161bc297$export$d365f7ad9d7df9c9) {
      get bufferSize() {
        return this._bufferSize;
      }
      _initializeDataChannel(dc) {
        super._initializeDataChannel(dc);
        this.dataChannel.binaryType = "arraybuffer";
        this.dataChannel.addEventListener("message", (e) => this._handleDataMessage(e));
      }
      _bufferedSend(msg) {
        if (this._buffering || !this._trySend(msg)) {
          this._buffer.push(msg);
          this._bufferSize = this._buffer.length;
        }
      }
      // Returns true if the send succeeds.
      _trySend(msg) {
        if (!this.open) return false;
        if (this.dataChannel.bufferedAmount > (0, $6366c4ca161bc297$export$d365f7ad9d7df9c9).MAX_BUFFERED_AMOUNT) {
          this._buffering = true;
          setTimeout(() => {
            this._buffering = false;
            this._tryBuffer();
          }, 50);
          return false;
        }
        try {
          this.dataChannel.send(msg);
        } catch (e) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).error(`DC#:${this.connectionId} Error when sending:`, e);
          this._buffering = true;
          this.close();
          return false;
        }
        return true;
      }
      // Try to send the first message in the buffer.
      _tryBuffer() {
        if (!this.open) return;
        if (this._buffer.length === 0) return;
        const msg = this._buffer[0];
        if (this._trySend(msg)) {
          this._buffer.shift();
          this._bufferSize = this._buffer.length;
          this._tryBuffer();
        }
      }
      close(options) {
        if (options?.flush) {
          this.send({
            __peerData: {
              type: "close"
            }
          });
          return;
        }
        this._buffer = [];
        this._bufferSize = 0;
        super.close();
      }
      constructor(...args) {
        super(...args), this._buffer = [], this._bufferSize = 0, this._buffering = false;
      }
    };
    $9fcfddb3ae148f88$export$f0a5a64d5bb37108 = class extends (0, $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b) {
      close(options) {
        super.close(options);
        this._chunkedData = {};
      }
      constructor(peerId, provider, options) {
        super(peerId, provider, options), this.chunker = new (0, $fcbcc7538a6776d5$export$f1c5f4c9cb95390b)(), this.serialization = (0, $78455e22dea96b8c$export$89f507cf986a947).Binary, this._chunkedData = {};
      }
      // Handles a DataChannel message.
      _handleDataMessage({ data }) {
        const deserializedData = (0, $0cfd7828ad59115f$export$417857010dc9287f)(data);
        const peerData = deserializedData["__peerData"];
        if (peerData) {
          if (peerData.type === "close") {
            this.close();
            return;
          }
          this._handleChunk(deserializedData);
          return;
        }
        this.emit("data", deserializedData);
      }
      _handleChunk(data) {
        const id = data.__peerData;
        const chunkInfo = this._chunkedData[id] || {
          data: [],
          count: 0,
          total: data.total
        };
        chunkInfo.data[data.n] = new Uint8Array(data.data);
        chunkInfo.count++;
        this._chunkedData[id] = chunkInfo;
        if (chunkInfo.total === chunkInfo.count) {
          delete this._chunkedData[id];
          const data2 = (0, $fcbcc7538a6776d5$export$52c89ebcdc4f53f2)(chunkInfo.data);
          this._handleDataMessage({
            data: data2
          });
        }
      }
      _send(data, chunked) {
        const blob = (0, $0cfd7828ad59115f$export$2a703dbb0cb35339)(data);
        if (blob instanceof Promise) return this._send_blob(blob);
        if (!chunked && blob.byteLength > this.chunker.chunkedMTU) {
          this._sendChunks(blob);
          return;
        }
        this._bufferedSend(blob);
      }
      async _send_blob(blobPromise) {
        const blob = await blobPromise;
        if (blob.byteLength > this.chunker.chunkedMTU) {
          this._sendChunks(blob);
          return;
        }
        this._bufferedSend(blob);
      }
      _sendChunks(blob) {
        const blobs = this.chunker.chunk(blob);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} Try to send ${blobs.length} chunks...`);
        for (const blob2 of blobs) this.send(blob2, true);
      }
    };
    $bbaee3f15f714663$export$6f88fe47d32c9c94 = class extends (0, $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b) {
      _handleDataMessage({ data }) {
        super.emit("data", data);
      }
      _send(data, _chunked) {
        this._bufferedSend(data);
      }
      constructor(...args) {
        super(...args), this.serialization = (0, $78455e22dea96b8c$export$89f507cf986a947).None;
      }
    };
    $817f931e3f9096cf$export$48880ac635f47186 = class extends (0, $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b) {
      // Handles a DataChannel message.
      _handleDataMessage({ data }) {
        const deserializedData = this.parse(this.decoder.decode(data));
        const peerData = deserializedData["__peerData"];
        if (peerData && peerData.type === "close") {
          this.close();
          return;
        }
        this.emit("data", deserializedData);
      }
      _send(data, _chunked) {
        const encodedData = this.encoder.encode(this.stringify(data));
        if (encodedData.byteLength >= (0, $4f4134156c446392$export$7debb50ef11d5e0b).chunkedMTU) {
          this.emitError((0, $78455e22dea96b8c$export$49ae800c114df41d).MessageToBig, "Message too big for JSON channel");
          return;
        }
        this._bufferedSend(encodedData);
      }
      constructor(...args) {
        super(...args), this.serialization = (0, $78455e22dea96b8c$export$89f507cf986a947).JSON, this.encoder = new TextEncoder(), this.decoder = new TextDecoder(), this.stringify = JSON.stringify, this.parse = JSON.parse;
      }
    };
    $416260bce337df90$export$ecd1fc136c422448 = class _$416260bce337df90$export$ecd1fc136c422448 extends (0, $23779d1881157a18$export$6a678e589c8a4542) {
      static #_ = this.DEFAULT_KEY = "peerjs";
      /**
      * The brokering ID of this peer
      *
      * If no ID was specified in {@apilink Peer | the constructor},
      * this will be `undefined` until the {@apilink PeerEvents | `open`} event is emitted.
      */
      get id() {
        return this._id;
      }
      get options() {
        return this._options;
      }
      get open() {
        return this._open;
      }
      /**
      * @internal
      */
      get socket() {
        return this._socket;
      }
      /**
      * A hash of all connections associated with this peer, keyed by the remote peer's ID.
      * @deprecated
      * Return type will change from Object to Map<string,[]>
      */
      get connections() {
        const plainConnections = /* @__PURE__ */ Object.create(null);
        for (const [k, v] of this._connections) plainConnections[k] = v;
        return plainConnections;
      }
      /**
      * true if this peer and all of its connections can no longer be used.
      */
      get destroyed() {
        return this._destroyed;
      }
      /**
      * false if there is an active connection to the PeerServer.
      */
      get disconnected() {
        return this._disconnected;
      }
      constructor(id, options) {
        super(), this._serializers = {
          raw: (0, $bbaee3f15f714663$export$6f88fe47d32c9c94),
          json: (0, $817f931e3f9096cf$export$48880ac635f47186),
          binary: (0, $9fcfddb3ae148f88$export$f0a5a64d5bb37108),
          "binary-utf8": (0, $9fcfddb3ae148f88$export$f0a5a64d5bb37108),
          default: (0, $9fcfddb3ae148f88$export$f0a5a64d5bb37108)
        }, this._id = null, this._lastServerId = null, // States.
        this._destroyed = false, this._disconnected = false, this._open = false, this._connections = /* @__PURE__ */ new Map(), this._lostMessages = /* @__PURE__ */ new Map();
        let userId;
        if (id && id.constructor == Object) options = id;
        else if (id) userId = id.toString();
        options = {
          debug: 0,
          host: (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST,
          port: (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_PORT,
          path: "/",
          key: _$416260bce337df90$export$ecd1fc136c422448.DEFAULT_KEY,
          token: (0, $4f4134156c446392$export$7debb50ef11d5e0b).randomToken(),
          config: (0, $4f4134156c446392$export$7debb50ef11d5e0b).defaultConfig,
          referrerPolicy: "strict-origin-when-cross-origin",
          serializers: {},
          ...options
        };
        this._options = options;
        this._serializers = {
          ...this._serializers,
          ...this.options.serializers
        };
        if (this._options.host === "/") this._options.host = window.location.hostname;
        if (this._options.path) {
          if (this._options.path[0] !== "/") this._options.path = "/" + this._options.path;
          if (this._options.path[this._options.path.length - 1] !== "/") this._options.path += "/";
        }
        if (this._options.secure === void 0 && this._options.host !== (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST) this._options.secure = (0, $4f4134156c446392$export$7debb50ef11d5e0b).isSecure();
        else if (this._options.host == (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST) this._options.secure = true;
        if (this._options.logFunction) (0, $257947e92926277a$export$2e2bcd8739ae039).setLogFunction(this._options.logFunction);
        (0, $257947e92926277a$export$2e2bcd8739ae039).logLevel = this._options.debug || 0;
        this._api = new (0, $abf266641927cd89$export$2c4e825dc9120f87)(options);
        this._socket = this._createServerConnection();
        if (!(0, $4f4134156c446392$export$7debb50ef11d5e0b).supports.audioVideo && !(0, $4f4134156c446392$export$7debb50ef11d5e0b).supports.data) {
          this._delayedAbort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).BrowserIncompatible, "The current browser does not support WebRTC");
          return;
        }
        if (!!userId && !(0, $4f4134156c446392$export$7debb50ef11d5e0b).validateId(userId)) {
          this._delayedAbort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).InvalidID, `ID "${userId}" is invalid`);
          return;
        }
        if (userId) this._initialize(userId);
        else this._api.retrieveId().then((id2) => this._initialize(id2)).catch((error) => this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).ServerError, error));
      }
      _createServerConnection() {
        const socket = new (0, $8f5bfa60836d261d$export$4798917dbf149b79)(this._options.secure, this._options.host, this._options.port, this._options.path, this._options.key, this._options.pingInterval);
        socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Message, (data) => {
          this._handleMessage(data);
        });
        socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Error, (error) => {
          this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).SocketError, error);
        });
        socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Disconnected, () => {
          if (this.disconnected) return;
          this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).Network, "Lost connection to server.");
          this.disconnect();
        });
        socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Close, () => {
          if (this.disconnected) return;
          this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).SocketClosed, "Underlying socket is already closed.");
        });
        return socket;
      }
      /** Initialize a connection with the server. */
      _initialize(id) {
        this._id = id;
        this.socket.start(id, this._options.token);
      }
      /** Handles messages from the server. */
      _handleMessage(message) {
        const type = message.type;
        const payload = message.payload;
        const peerId = message.src;
        switch (type) {
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Open:
            this._lastServerId = this.id;
            this._open = true;
            this.emit("open", this.id);
            break;
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Error:
            this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).ServerError, payload.msg);
            break;
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).IdTaken:
            this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).UnavailableID, `ID "${this.id}" is taken`);
            break;
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).InvalidKey:
            this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).InvalidKey, `API KEY "${this._options.key}" is invalid`);
            break;
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Leave:
            (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Received leave message from ${peerId}`);
            this._cleanupPeer(peerId);
            this._connections.delete(peerId);
            break;
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Expire:
            this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).PeerUnavailable, `Could not connect to peer ${peerId}`);
            break;
          case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Offer: {
            const connectionId = payload.connectionId;
            let connection = this.getConnection(peerId, connectionId);
            if (connection) {
              connection.close();
              (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`Offer received for existing Connection ID:${connectionId}`);
            }
            if (payload.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media) {
              const mediaConnection = new (0, $5c1d08c7c57da9a3$export$4a84e95a2324ac29)(peerId, this, {
                connectionId,
                _payload: payload,
                metadata: payload.metadata
              });
              connection = mediaConnection;
              this._addConnection(peerId, connection);
              this.emit("call", mediaConnection);
            } else if (payload.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Data) {
              const dataConnection = new this._serializers[payload.serialization](peerId, this, {
                connectionId,
                _payload: payload,
                metadata: payload.metadata,
                label: payload.label,
                serialization: payload.serialization,
                reliable: payload.reliable
              });
              connection = dataConnection;
              this._addConnection(peerId, connection);
              this.emit("connection", dataConnection);
            } else {
              (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`Received malformed connection type:${payload.type}`);
              return;
            }
            const messages = this._getMessages(connectionId);
            for (const message2 of messages) connection.handleMessage(message2);
            break;
          }
          default: {
            if (!payload) {
              (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`You received a malformed message from ${peerId} of type ${type}`);
              return;
            }
            const connectionId = payload.connectionId;
            const connection = this.getConnection(peerId, connectionId);
            if (connection && connection.peerConnection)
              connection.handleMessage(message);
            else if (connectionId)
              this._storeMessage(connectionId, message);
            else (0, $257947e92926277a$export$2e2bcd8739ae039).warn("You received an unrecognized message:", message);
            break;
          }
        }
      }
      /** Stores messages without a set up connection, to be claimed later. */
      _storeMessage(connectionId, message) {
        if (!this._lostMessages.has(connectionId)) this._lostMessages.set(connectionId, []);
        this._lostMessages.get(connectionId).push(message);
      }
      /**
      * Retrieve messages from lost message store
      * @internal
      */
      //TODO Change it to private
      _getMessages(connectionId) {
        const messages = this._lostMessages.get(connectionId);
        if (messages) {
          this._lostMessages.delete(connectionId);
          return messages;
        }
        return [];
      }
      /**
      * Connects to the remote peer specified by id and returns a data connection.
      * @param peer The brokering ID of the remote peer (their {@apilink Peer.id}).
      * @param options for specifying details about Peer Connection
      */
      connect(peer2, options = {}) {
        options = {
          serialization: "default",
          ...options
        };
        if (this.disconnected) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available.");
          this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).Disconnected, "Cannot connect to new Peer after disconnecting from server.");
          return;
        }
        const dataConnection = new this._serializers[options.serialization](peer2, this, options);
        this._addConnection(peer2, dataConnection);
        return dataConnection;
      }
      /**
      * Calls the remote peer specified by id and returns a media connection.
      * @param peer The brokering ID of the remote peer (their peer.id).
      * @param stream The caller's media stream
      * @param options Metadata associated with the connection, passed in by whoever initiated the connection.
      */
      call(peer2, stream, options = {}) {
        if (this.disconnected) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect.");
          this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).Disconnected, "Cannot connect to new Peer after disconnecting from server.");
          return;
        }
        if (!stream) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).error("To call a peer, you must provide a stream from your browser's `getUserMedia`.");
          return;
        }
        const mediaConnection = new (0, $5c1d08c7c57da9a3$export$4a84e95a2324ac29)(peer2, this, {
          ...options,
          _stream: stream
        });
        this._addConnection(peer2, mediaConnection);
        return mediaConnection;
      }
      /** Add a data/media connection to this peer. */
      _addConnection(peerId, connection) {
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`add connection ${connection.type}:${connection.connectionId} to peerId:${peerId}`);
        if (!this._connections.has(peerId)) this._connections.set(peerId, []);
        this._connections.get(peerId).push(connection);
      }
      //TODO should be private
      _removeConnection(connection) {
        const connections = this._connections.get(connection.peer);
        if (connections) {
          const index = connections.indexOf(connection);
          if (index !== -1) connections.splice(index, 1);
        }
        this._lostMessages.delete(connection.connectionId);
      }
      /** Retrieve a data/media connection for this peer. */
      getConnection(peerId, connectionId) {
        const connections = this._connections.get(peerId);
        if (!connections) return null;
        for (const connection of connections) {
          if (connection.connectionId === connectionId) return connection;
        }
        return null;
      }
      _delayedAbort(type, message) {
        setTimeout(() => {
          this._abort(type, message);
        }, 0);
      }
      /**
      * Emits an error message and destroys the Peer.
      * The Peer is not destroyed if it's in a disconnected state, in which case
      * it retains its disconnected state and its existing connections.
      */
      _abort(type, message) {
        (0, $257947e92926277a$export$2e2bcd8739ae039).error("Aborting!");
        this.emitError(type, message);
        if (!this._lastServerId) this.destroy();
        else this.disconnect();
      }
      /**
      * Destroys the Peer: closes all active connections as well as the connection
      * to the server.
      *
      * :::caution
      * This cannot be undone; the respective peer object will no longer be able
      * to create or receive any connections, its ID will be forfeited on the server,
      * and all of its data and media connections will be closed.
      * :::
      */
      destroy() {
        if (this.destroyed) return;
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Destroy peer with ID:${this.id}`);
        this.disconnect();
        this._cleanup();
        this._destroyed = true;
        this.emit("close");
      }
      /** Disconnects every connection on this peer. */
      _cleanup() {
        for (const peerId of this._connections.keys()) {
          this._cleanupPeer(peerId);
          this._connections.delete(peerId);
        }
        this.socket.removeAllListeners();
      }
      /** Closes all connections to this peer. */
      _cleanupPeer(peerId) {
        const connections = this._connections.get(peerId);
        if (!connections) return;
        for (const connection of connections) connection.close();
      }
      /**
      * Disconnects the Peer's connection to the PeerServer. Does not close any
      *  active connections.
      * Warning: The peer can no longer create or accept connections after being
      *  disconnected. It also cannot reconnect to the server.
      */
      disconnect() {
        if (this.disconnected) return;
        const currentId = this.id;
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Disconnect peer with ID:${currentId}`);
        this._disconnected = true;
        this._open = false;
        this.socket.close();
        this._lastServerId = currentId;
        this._id = null;
        this.emit("disconnected", currentId);
      }
      /** Attempts to reconnect with the same ID.
      *
      * Only {@apilink Peer.disconnect | disconnected peers} can be reconnected.
      * Destroyed peers cannot be reconnected.
      * If the connection fails (as an example, if the peer's old ID is now taken),
      * the peer's existing connections will not close, but any associated errors events will fire.
      */
      reconnect() {
        if (this.disconnected && !this.destroyed) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Attempting reconnection to server with ID ${this._lastServerId}`);
          this._disconnected = false;
          this._initialize(this._lastServerId);
        } else if (this.destroyed) throw new Error("This peer cannot reconnect to the server. It has already been destroyed.");
        else if (!this.disconnected && !this.open)
          (0, $257947e92926277a$export$2e2bcd8739ae039).error("In a hurry? We're still trying to make the initial connection!");
        else throw new Error(`Peer ${this.id} cannot reconnect because it is not disconnected from the server!`);
      }
      /**
      * Get a list of available peer IDs. If you're running your own server, you'll
      * want to set allow_discovery: true in the PeerServer options. If you're using
      * the cloud server, email team@peerjs.com to get the functionality enabled for
      * your key.
      */
      listAllPeers(cb = (_) => {
      }) {
        this._api.listAllPeers().then((peers) => cb(peers)).catch((error) => this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).ServerError, error));
      }
    };
  }
});

// src/net.js
async function buildPeerConfigAsync() {
  const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
  try {
    const apiKey = "MDgwZDg0ODYxZmZmYzdkMWNkZDY0NTk2OTNkMmJiNmIyZTcw" ? atob("MDgwZDg0ODYxZmZmYzdkMWNkZDY0NTk2OTNkMmJiNmIyZTcw") : "";
    const appName = "a2Fpei1leHRlbnNpb24=" ? atob("a2Fpei1leHRlbnNpb24=") : "";
    if (apiKey && appName) {
      const resp = await fetch(`https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`);
      if (resp.ok) {
        const servers = await resp.json();
        iceServers.push(...servers);
        return { config: { iceServers } };
      }
    }
    const secret = "openrelayprojectsecret";
    const expiry = Math.floor(Date.now() / 1e3) + 24 * 3600;
    const username = String(expiry);
    const enc = new TextEncoder();
    const keyMat = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", keyMat, enc.encode(username));
    const credential = btoa(String.fromCharCode(...new Uint8Array(sig)));
    iceServers.push(
      { urls: "stun:openrelay.metered.ca:80" },
      { urls: "turn:openrelay.metered.ca:80", username, credential },
      { urls: "turn:openrelay.metered.ca:443", username, credential },
      { urls: "turns:openrelay.metered.ca:443", username, credential }
    );
  } catch (err) {
    console.warn("Failed to generate OpenRelay credentials:", err);
  }
  return { config: { iceServers } };
}
var init_net = __esm({
  "src/net.js"() {
  }
});

// src/trade.js
function getItemName(id) {
  if (id === "coins") return "Ti\u1EC1n xu";
  if (id === "norm") return "V\xE9 Th\u01B0\u1EDDng";
  if (id === "spec") return "V\xE9 \u0110\u1EB7c Bi\u1EC7t";
  if (id === "super") return "V\xE9 Si\xEAu C\u01B0\u1EDDng";
  if (id === "prism") return "M\u1EA3nh l\u0103ng quang";
  if (id === "star") return "M\u1EA3nh ng\xF4i sao";
  if (id === "legend") return "M\u1EA3nh Huy\u1EC1n Tho\u1EA1i";
  if (id === "compost") return "Ph\xE2n H\u1EEFu C\u01A1";
  if (id === "shiny") return "Ph\xE2n B\xF3n B\u1EA1c";
  if (id.startsWith("unique@")) {
    const item = ctx.S.uniques?.[id] || theirUniques[id];
    return item?.name || "V\u1EADt ph\u1EA9m Gacha";
  }
  if (id.includes("@") && !id.startsWith("unique@")) {
    const parts = id.split("@");
    return (parts[1] ? parts[1] + "\xB7" : "") + (CROPS[parts[0]] || { name: "?" }).name;
  }
  if (CROPS && CROPS[id]) return CROPS[id].name;
  return id;
}
function getItemDesc(id) {
  if (id === "coins") return "D\xF9ng \u0111\u1EC3 mua \u0111\u1ED3 trong c\u1EEDa h\xE0ng";
  if (id === "norm") return "V\xE9 quay Gacha th\u01B0\u1EDDng";
  if (id === "spec") return "V\xE9 quay Gacha \u0111\u1EB7c bi\u1EC7t";
  if (id === "super") return "V\xE9 quay Gacha si\xEAu c\u1EA5p";
  if (id === "prism") return "D\xF9ng \u0111\u1EC3 n\xE2ng c\u1EA5p";
  if (id === "star") return "M\u1EA3nh sao qu\xFD hi\u1EBFm";
  if (id === "legend") return "M\u1EA3nh huy\u1EC1n tho\u1EA1i qu\xFD hi\u1EBFm";
  if (id === "compost") return "Gi\u1EA3m 25% th\u1EDDi gian tr\u1ED3ng c\xE2y";
  if (id === "shiny") return "Nh\u1EADn th\xEAm 25% ti\u1EC1n xu khi thu ho\u1EA1ch";
  if (id.startsWith("unique@")) {
    const item = ctx.S.uniques?.[id] || theirUniques[id];
    return item?.desc ? item.desc.replace(/"/g, "&quot;") : "V\u1EADt ph\u1EA9m b\xED \u1EA9n";
  }
  if (id.includes("@") && !id.startsWith("unique@")) {
    return mutDescOf(id) || theirMutDescs[id] || "N\xF4ng s\u1EA3n \u0111\u1ED9t bi\u1EBFn k\u1EF3 l\u1EA1";
  }
  if (CROPS && CROPS[id]) return CROPS[id].desc || "";
  return "";
}
function getItemIcon(id) {
  if (id === "coins") return spriteSVG("coin", 20);
  if (id === "norm" || id === "spec" || id === "super") {
    const tId = id.charAt(0).toUpperCase() + id.slice(1);
    return spriteSVG("ticket" + tId, 20);
  }
  if (id === "prism" || id === "star" || id === "legend") {
    const sId = id.charAt(0).toUpperCase() + id.slice(1);
    return id === "legend" ? spriteSVG("legendShard", 20) : spriteSVG("shard" + sId, 20);
  }
  if (id === "compost" || id === "shiny") return spriteSVG("fert_" + id, 20);
  if (id.startsWith("unique@")) {
    const item = ctx.S.uniques?.[id] || theirUniques[id] || { sp: "strawhat", color: "#4a90e2" };
    return `<span style="color:${item.color}">${spriteSVG(item.sp, 20)}</span>`;
  }
  if (id.includes("@") && !id.startsWith("unique@")) {
    const parts = id.split("@");
    return spriteSVG(CROPS[parts[0]]?.sp || "sprout", 20);
  }
  if (CROPS && CROPS[id]) return spriteSVG(CROPS[id].sp || id, 20);
  return "";
}
function openTradeModal() {
  $id("trade-win").classList.add("open");
  resetTradeState();
  renderTradeMenu();
}
function closeTradeModal() {
  if (peer) {
    peer.destroy();
    peer = null;
  }
  conn = null;
  $id("trade-win").classList.remove("open");
  uiCloseAddItem();
  resetTradeState();
}
function resetTradeState() {
  myItems = {};
  theirItems = {};
  myLock = false;
  theirLock = false;
  myConfirm = false;
  theirConfirm = false;
  theirUniques = {};
  theirMutDescs = {};
  isConnected = false;
  tradeCompleted = false;
  cheatDetected = false;
  partnerName = "\u0110\u1ED1i t\xE1c";
}
function renderTradeMenu() {
  const body = $id("trade-body");
  if (!ctx.S.username) {
    body.innerHTML = `
            <div style="display:flex; flex-direction:column; gap: 15px; padding: 20px; text-align: center;">
                <div style="font-size: 14px; color: #7a5c38; font-weight: bold;">T\u1EA1o T\xEAn Ng\u01B0\u1EDDi Ch\u01A1i</div>
                <div style="font-size: 12px; color: #555;">Vui l\xF2ng nh\u1EADp t\xEAn \u0111\u1EC3 hi\u1EC3n th\u1ECB khi giao d\u1ECBch.</div>
                <input type="text" id="inp-trade-username" class="inp" placeholder="Nh\u1EADp t\xEAn c\u1EE7a b\u1EA1n...">
                <div class="buy" id="btn-trade-save-username" style="padding: 10px;">L\u01B0u t\xEAn</div>
            </div>
        `;
    $id("btn-trade-save-username").onclick = () => {
      const val = $id("inp-trade-username").value.trim();
      if (val) {
        ctx.S.username = val;
        Promise.resolve().then(() => (init_state(), state_exports)).then((m) => m.save());
        renderTradeMenu();
      } else {
        toast("T\xEAn kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng!");
      }
    };
    return;
  }
  body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap: 15px; padding: 20px; text-align: center;">
            <div style="font-size: 14px; color: #7a5c38; font-weight: bold;">M\u1EDF Ph\xF2ng Trade</div>
            <div class="buy" id="btn-trade-host" style="padding: 10px; text-align:center;">T\u1EA1o ph\xF2ng (Host)</div>
            <div style="display:flex; gap: 8px;">
                <input type="text" id="inp-trade-code" class="inp" placeholder="Nh\u1EADp m\xE3 ph\xF2ng..." style="flex:1;">
                <div class="buy" id="btn-trade-join" style="padding: 10px;">Tham gia</div>
            </div>
            <div id="trade-status" style="font-size: 12px; color: #d32f2f; font-weight: bold; margin-top: 10px;"></div>
        </div>
    `;
  $id("btn-trade-host").onclick = hostRoom;
  $id("btn-trade-join").onclick = joinRoom;
}
function updateStatus(msg, color = "#7a5c38") {
  const el = $id("trade-status");
  if (el) {
    el.innerText = msg;
    el.style.color = color;
  }
}
async function hostRoom() {
  updateStatus("\u0110ang t\u1EA1o ph\xF2ng...", "#7a5c38");
  const roomId = "farm-" + Math.random().toString(36).substr(2, 6);
  const peerOptions = await buildPeerConfigAsync();
  peer = new $416260bce337df90$export$ecd1fc136c422448(roomId, peerOptions);
  peer.on("open", (id) => {
    updateStatus(`Ph\xF2ng \u0111\xE3 t\u1EA1o! M\xE3 c\u1EE7a b\u1EA1n: ${id}. H\xE3y g\u1EEDi m\xE3 n\xE0y cho \u0111\u1ED1i t\xE1c.`, "#388e3c");
    const body = $id("trade-body");
    body.innerHTML = `
            <div style="display:flex; flex-direction:column; gap: 15px; padding: 20px; text-align: center;">
                <div style="font-size: 14px; color: #7a5c38; font-weight: bold;">\u0110ang ch\u1EDD \u0111\u1ED1i t\xE1c k\u1EBFt n\u1ED1i...</div>
                <div style="font-size: 20px; font-weight: bold; color: #e91e63; user-select: all; background: #fce4ec; padding: 10px; border-radius: 8px; border: 2px dashed #f06292;">${id}</div>
                <div class="buy plain" onclick="FarmAll.closeTradeModal()" style="padding: 8px; margin-top: 20px; text-align:center;">Hu\u1EF7</div>
            </div>
        `;
  });
  peer.on("connection", (connection) => {
    if (conn || isConnected) {
      connection.on("open", () => {
        connection.send({ type: "ROOM_FULL" });
        setTimeout(() => connection.close(), 500);
      });
      return;
    }
    conn = connection;
    updateStatus("\u0110ang thi\u1EBFt l\u1EADp \u0111\u01B0\u1EDDng truy\u1EC1n d\u1EEF li\u1EC7u...", "#7a5c38");
    if (conn.open) {
      setupConnection();
    } else {
      conn.on("open", () => {
        setupConnection();
      });
    }
  });
  peer.on("error", (err) => {
    updateStatus("L\u1ED7i: " + err.type, "#d32f2f");
  });
}
async function joinRoom() {
  const codeEl = $id("inp-trade-code");
  const code = codeEl ? codeEl.value.trim() : "";
  if (!code) {
    updateStatus("Vui l\xF2ng nh\u1EADp m\xE3 ph\xF2ng!", "#d32f2f");
    return;
  }
  updateStatus("\u0110ang k\u1EBFt n\u1ED1i...", "#7a5c38");
  const peerOptions = await buildPeerConfigAsync();
  peer = new $416260bce337df90$export$ecd1fc136c422448(void 0, peerOptions);
  peer.on("open", () => {
    conn = peer.connect(code, { reliable: true });
    conn.on("open", () => {
      setupConnection();
    });
    conn.on("error", (err) => {
      updateStatus("L\u1ED7i k\u1EBFt n\u1ED1i!", "#d32f2f");
    });
  });
  peer.on("error", (err) => {
    updateStatus("L\u1ED7i: " + err.type, "#d32f2f");
  });
}
function setupConnection() {
  isConnected = true;
  conn.on("data", (data) => {
    handleNetData(data);
  });
  conn.on("close", () => {
    if (!tradeCompleted && !cheatDetected) {
      toast("\u0110\u1ED1i t\xE1c \u0111\xE3 ng\u1EAFt k\u1EBFt n\u1ED1i!");
    }
    closeTradeModal();
  });
  setTimeout(() => {
    sendData({ type: "HELLO", playerId: ctx.S.playerId, username: ctx.S.username });
  }, 500);
  renderTradeRoom();
}
function handleNetData(data) {
  if (data.type === "UPDATE_ITEMS") {
    if (data.items) {
      theirItems = {};
      for (const [k, v] of Object.entries(data.items)) {
        const amt = parseInt(v);
        if (Number.isFinite(amt) && amt > 0) {
          theirItems[k] = amt;
        }
      }
    }
    if (data.uniques) {
      theirUniques = data.uniques;
      for (const key in theirUniques) {
        const u = theirUniques[key];
        if (u && u.sp && u.spriteMap) {
          registerDynamicSprite(u.sp, u.spriteMap);
        }
      }
    }
    theirMutDescs = data.mutDescs || {};
    renderTradeRoom();
  } else if (data.type === "LOCK") {
    theirLock = data.lock;
    if (!theirLock) theirConfirm = false;
    renderTradeRoom();
  } else if (data.type === "CONFIRM") {
    theirConfirm = true;
    renderTradeRoom();
    if (myConfirm && theirConfirm) {
      executeTrade();
    }
  } else if (data.type === "HELLO") {
    if (data.playerId === ctx.S.playerId) {
      cheatDetected = true;
      toast("Ph\xE1t hi\u1EC7n gian l\u1EADn: Kh\xF4ng th\u1EC3 giao d\u1ECBch v\u1EDBi ch\xEDnh m\xECnh (Tr\xF9ng ID Ng\u01B0\u1EDDi Ch\u01A1i)!");
      sendData({ type: "CHEAT_DETECTED" });
      if (conn) conn.close();
      closeTradeModal();
    } else {
      if (data.username) partnerName = data.username;
      renderTradeRoom();
    }
  } else if (data.type === "CHEAT_DETECTED") {
    cheatDetected = true;
    toast("Ph\xE1t hi\u1EC7n gian l\u1EADn: Kh\xF4ng th\u1EC3 giao d\u1ECBch v\u1EDBi ch\xEDnh m\xECnh (Tr\xF9ng ID Ng\u01B0\u1EDDi Ch\u01A1i)!");
    if (conn) conn.close();
    closeTradeModal();
  } else if (data.type === "ROOM_FULL") {
    toast("Ph\xF2ng giao d\u1ECBch n\xE0y \u0111\xE3 \u0111\u1EA7y (\u0111ang c\xF3 ng\u01B0\u1EDDi kh\xE1c giao d\u1ECBch)!");
    if (conn) conn.close();
    closeTradeModal();
  }
}
function sendData(data) {
  if (conn && conn.open) {
    conn.send(data);
  }
}
function getInventoryCount(id) {
  if (id === "coins") return ctx.S.coins || 0;
  if (id === "norm") return ctx.S.tickets?.norm || 0;
  if (id === "spec") return ctx.S.tickets?.spec || 0;
  if (id === "super") return ctx.S.tickets?.super || 0;
  if (id === "prism") return ctx.S.shards?.prism || 0;
  if (id === "star") return ctx.S.shards?.star || 0;
  if (id === "legend") return ctx.S.shards?.legend || 0;
  if (id === "compost") return ctx.S.ferts?.compost || 0;
  if (id === "shiny") return ctx.S.ferts?.shiny || 0;
  if (ctx.S.bag && ctx.S.bag[id]) return ctx.S.bag[id];
  if (ctx.S.seeds && ctx.S.seeds[id]) return ctx.S.seeds[id];
  return 0;
}
function deductInventory(id, amount) {
  if (id === "coins") ctx.S.coins -= amount;
  else if (id === "norm") ctx.S.tickets.norm -= amount;
  else if (id === "spec") ctx.S.tickets.spec -= amount;
  else if (id === "super") ctx.S.tickets.super -= amount;
  else if (id === "prism") ctx.S.shards.prism -= amount;
  else if (id === "star") ctx.S.shards.star -= amount;
  else if (id === "legend") ctx.S.shards.legend -= amount;
  else if (id === "compost") ctx.S.ferts.compost -= amount;
  else if (id === "shiny") ctx.S.ferts.shiny -= amount;
  else if (ctx.S.bag && ctx.S.bag[id]) {
    ctx.S.bag[id] -= amount;
    if (ctx.S.bag[id] <= 0) delete ctx.S.bag[id];
  } else if (ctx.S.seeds && ctx.S.seeds[id]) {
    ctx.S.seeds[id] -= amount;
    if (ctx.S.seeds[id] <= 0) delete ctx.S.seeds[id];
  }
}
function addInventory(id, amount) {
  if (id === "coins") ctx.S.coins += amount;
  else if (id === "norm") ctx.S.tickets.norm += amount;
  else if (id === "spec") ctx.S.tickets.spec += amount;
  else if (id === "super") ctx.S.tickets.super += amount;
  else if (id === "prism") ctx.S.shards.prism += amount;
  else if (id === "star") ctx.S.shards.star += amount;
  else if (id === "legend") ctx.S.shards.legend += amount;
  else if (id === "compost") {
    if (!ctx.S.ferts) ctx.S.ferts = {};
    ctx.S.ferts.compost = (ctx.S.ferts.compost || 0) + amount;
  } else if (id === "shiny") {
    if (!ctx.S.ferts) ctx.S.ferts = {};
    ctx.S.ferts.shiny = (ctx.S.ferts.shiny || 0) + amount;
  } else if (CROPS && CROPS[id]) {
    if (CROPS[id].type === "seed") {
      if (!ctx.S.seeds) ctx.S.seeds = {};
      ctx.S.seeds[id] = (ctx.S.seeds[id] || 0) + amount;
    } else {
      if (!ctx.S.bag) ctx.S.bag = {};
      ctx.S.bag[id] = (ctx.S.bag[id] || 0) + amount;
    }
  } else if (id.startsWith("unique@") || id.includes("@")) {
    if (!ctx.S.bag) ctx.S.bag = {};
    ctx.S.bag[id] = (ctx.S.bag[id] || 0) + amount;
  }
}
function checkValidTrade() {
  for (const [id, amount] of Object.entries(myItems)) {
    if (!Number.isFinite(amount) || amount <= 0) return false;
    if (getInventoryCount(id) < amount) return false;
  }
  return true;
}
function executeTrade() {
  if (!checkValidTrade()) {
    toast("Kh\xF4ng \u0111\u1EE7 v\u1EADt ph\u1EA9m trong kho \u0111\u1EC3 giao d\u1ECBch!");
    closeTradeModal();
    return;
  }
  for (const [id, amount] of Object.entries(myItems)) {
    deductInventory(id, amount);
  }
  for (const [id, amount] of Object.entries(theirItems)) {
    addInventory(id, amount);
    if (id.startsWith("unique@") && theirUniques[id]) {
      if (!ctx.S.uniques) ctx.S.uniques = {};
      ctx.S.uniques[id] = theirUniques[id];
    } else if (id.includes("@") && !id.startsWith("unique@") && theirMutDescs[id]) {
      if (!ctx.S.mutDesc) ctx.S.mutDesc = {};
      const parts = id.split("@");
      const mutCode = parts.slice(1).join("@");
      ctx.S.mutDesc[mutCode + "@" + (CROPS[parts[0]] || { name: "" }).name] = theirMutDescs[id];
    }
  }
  tradeCompleted = true;
  save(true);
  toast("Ho\xE0n t\u1EA5t giao d\u1ECBch! Ch\xFAc vui v\u1EBB!");
  closeTradeModal();
  renderBanner();
}
function uiConfirmTrade() {
  if (myConfirm) return;
  myConfirm = true;
  sendData({ type: "CONFIRM" });
  renderTradeRoom();
  if (myConfirm && theirConfirm) {
    executeTrade();
  }
}
function uiToggleLock() {
  if (!checkValidTrade()) {
    toast("B\u1EA1n kh\xF4ng \u0111\u1EE7 \u0111\u1ED3 trong kho!");
    return;
  }
  myLock = !myLock;
  if (!myLock) myConfirm = false;
  sendData({ type: "LOCK", lock: myLock });
  renderTradeRoom();
}
function renderTradeRoom() {
  const body = $id("trade-body");
  const myHTML = Object.entries(myItems).map(([id, amt]) => {
    const desc = getItemDesc(id);
    return `<div class="trade-item" style="align-items:flex-start;">
                    <div style="margin-top:2px;">${getItemIcon(id)}</div>
                    <div style="display:flex; flex-direction:column; margin-left:5px; flex:1;">
                        <div style="display:flex; align-items:center;">
                            <span style="font-size:12px; font-weight:bold; color:#6b4f2e;">${getItemName(id)}</span>
                            <b style="margin-left:auto; color:#a3763d;">x${amt}</b>
                        </div>
                        ${desc ? `<div style="font-size:10px; color:#888; font-style:italic; line-height:1.2; margin-top:2px; word-break:break-word;">${desc}</div>` : ""}
                    </div>
                    ${!myLock ? `<div class="close-x" style="width:18px;height:18px;line-height:12px;font-size:14px;margin-left:5px;margin-top:2px;" onclick="FarmAll.uiRemoveTradeItem('${id}')">\xD7</div>` : ""}
                </div>`;
  }).join("");
  const theirHTML = Object.entries(theirItems).map(([id, amt]) => {
    const desc = getItemDesc(id);
    return `<div class="trade-item" style="align-items:flex-start;">
                    <div style="margin-top:2px;">${getItemIcon(id)}</div>
                    <div style="display:flex; flex-direction:column; margin-left:5px; flex:1;">
                        <div style="display:flex; align-items:center;">
                            <span style="font-size:12px; font-weight:bold; color:#6b4f2e;">${getItemName(id)}</span>
                            <b style="margin-left:auto; color:#a3763d;">x${amt}</b>
                        </div>
                        ${desc ? `<div style="font-size:10px; color:#888; font-style:italic; line-height:1.2; margin-top:2px; word-break:break-word;">${desc}</div>` : ""}
                    </div>
                </div>`;
  }).join("");
  body.innerHTML = `
        <div class="trade-split">
            <div class="trade-col">
                <div class="trade-header">${ctx.S.username || "B\u1EA1n"} ${myLock ? '<span style="color:#388e3c">\u2713</span>' : ""} ${myConfirm ? '<span style="color:#2e7d32; font-size:10px;">(\u0110\xE3 XN)</span>' : ""}</div>
                <div class="trade-items">${myHTML || '<div style="opacity:0.5;text-align:center;margin-top:20px;">Tr\u1ED1ng</div>'}</div>
                <div class="trade-actions">
                    <button class="buy ${myLock ? "plain" : ""}" onclick="FarmAll.uiToggleLock()" style="width:100%; text-align:center;">${myLock ? "M\u1EDF kho\xE1" : "S\u1EB5n s\xE0ng"}</button>
                    ${!myLock ? `<button class="buy plain" onclick="FarmAll.uiOpenAddItem()" style="width:100%; margin-top:6px; text-align:center;">+ Th\xEAm \u0111\u1ED3</button>` : ""}
                </div>
            </div>
            <div class="trade-col">
                <div class="trade-header">${partnerName} ${theirLock ? '<span style="color:#388e3c">\u2713</span>' : ""} ${theirConfirm ? '<span style="color:#2e7d32; font-size:10px;">(\u0110\xE3 XN)</span>' : ""}</div>
                <div class="trade-items">${theirHTML || '<div style="opacity:0.5;text-align:center;margin-top:20px;">Tr\u1ED1ng</div>'}</div>
            </div>
        </div>
        ${myLock && theirLock && !myConfirm ? `<div style="padding: 10px; margin-top: -10px;"><button class="buy" onclick="FarmAll.uiConfirmTrade()" style="width:100%; background: linear-gradient(to bottom, #4caf50, #388e3c); color:white; border-color: #2e7d32; text-align:center;">X\xE1c nh\u1EADn Giao d\u1ECBch</button></div>` : ""}
        ${myLock && theirLock && myConfirm ? `<div style="padding: 10px; margin-top: -10px; text-align:center; color:#388e3c; font-weight:bold;">\u0110ang ch\u1EDD \u0111\u1ED1i t\xE1c x\xE1c nh\u1EADn...</div>` : ""}
    `;
}
function sendItemsUpdate() {
  const uniques = {};
  const mutDescs = {};
  for (const id in myItems) {
    if (id.startsWith("unique@") && ctx.S.uniques?.[id]) {
      uniques[id] = ctx.S.uniques[id];
    } else if (id.includes("@") && !id.startsWith("unique@")) {
      const desc = mutDescOf(id);
      if (desc) mutDescs[id] = desc;
    }
  }
  sendData({ type: "UPDATE_ITEMS", items: myItems, uniques, mutDescs });
}
function uiRemoveTradeItem(id) {
  if (myLock) return;
  delete myItems[id];
  sendItemsUpdate();
  renderTradeRoom();
}
function uiOpenAddItem() {
  if (myLock) return;
  const pop = $id("trade-popup");
  pop.classList.add("open");
  let catCoins = "";
  if (ctx.S.coins > 0) catCoins += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('coins', ${ctx.S.coins})">${getItemIcon("coins")} Ti\u1EC1n xu (C\xF3: ${ctx.S.coins})</div>`;
  let catTickets = "";
  ["norm", "spec", "super"].forEach((k) => {
    if (ctx.S.tickets && ctx.S.tickets[k] > 0) catTickets += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${ctx.S.tickets[k]})">${getItemIcon(k)} ${getItemName(k)} (C\xF3: ${ctx.S.tickets[k]})</div>`;
  });
  ["prism", "star", "legend"].forEach((k) => {
    if (ctx.S.shards && ctx.S.shards[k] > 0) catTickets += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${ctx.S.shards[k]})">${getItemIcon(k)} ${getItemName(k)} (C\xF3: ${ctx.S.shards[k]})</div>`;
  });
  let catFerts = "";
  ["compost", "shiny"].forEach((k) => {
    if (ctx.S.ferts && ctx.S.ferts[k] > 0) catFerts += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${ctx.S.ferts[k]})">${getItemIcon(k)} ${getItemName(k)} (C\xF3: ${ctx.S.ferts[k]})</div>`;
  });
  let catBag = "";
  let catGacha = "";
  if (ctx.S.bag) {
    Object.entries(ctx.S.bag).forEach(([k, v]) => {
      if (v > 0) {
        if (k.startsWith("unique@")) catGacha += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${v})">${getItemIcon(k)} ${getItemName(k)} (C\xF3: ${v})</div>`;
        else catBag += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${v})">${getItemIcon(k)} ${getItemName(k)} (C\xF3: ${v})</div>`;
      }
    });
  }
  let catSeeds = "";
  if (ctx.S.seeds) {
    Object.entries(ctx.S.seeds).forEach(([k, v]) => {
      if (v > 0) catSeeds += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${v})">${getItemIcon(k)} ${getItemName(k)} (C\xF3: ${v})</div>`;
    });
  }
  let html = "";
  if (catCoins) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">TI\u1EC0N T\u1EC6</div>` + catCoins;
  if (catBag) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">N\xD4NG S\u1EA2N</div>` + catBag;
  if (catSeeds) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">H\u1EA0T GI\u1ED0NG</div>` + catSeeds;
  if (catFerts) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">PH\xC2N B\xD3N</div>` + catFerts;
  if (catTickets) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">V\xC9 & M\u1EA2NH</div>` + catTickets;
  if (catGacha) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">\u0110\u1ED2 GACHA</div>` + catGacha;
  $id("trade-popup-list").innerHTML = html || '<div style="padding:10px;text-align:center;font-weight:bold;color:#a3763d;">Kh\xF4ng c\xF3 \u0111\u1ED3 \u0111\u1EC3 giao d\u1ECBch</div>';
  $id("trade-popup-act").style.display = "none";
}
function uiCloseAddItem() {
  $id("trade-popup").classList.remove("open");
}
function uiSelectAdd(id, max) {
  selectedTradeId = id;
  selectedTradeMax = max;
  $id("trade-popup-act").style.display = "flex";
  $id("inp-trade-amount").max = max;
  $id("inp-trade-amount").value = 1;
  $id("lbl-trade-sel").innerHTML = `\u0110\xE3 ch\u1ECDn: <b>${getItemName(id)}</b> (T\u1ED1i \u0111a: ${max})`;
}
function uiConfirmAdd() {
  let amt = parseInt($id("inp-trade-amount").value) || 0;
  if (amt <= 0 || amt > selectedTradeMax) {
    toast("S\u1ED1 l\u01B0\u1EE3ng kh\xF4ng h\u1EE3p l\u1EC7!");
    return;
  }
  myItems[selectedTradeId] = (myItems[selectedTradeId] || 0) + amt;
  if (myItems[selectedTradeId] > getInventoryCount(selectedTradeId)) {
    myItems[selectedTradeId] = getInventoryCount(selectedTradeId);
  }
  sendItemsUpdate();
  renderTradeRoom();
  uiCloseAddItem();
}
var peer, conn, myItems, theirItems, myLock, theirLock, myConfirm, theirConfirm, isConnected, tradeCompleted, cheatDetected, theirUniques, theirMutDescs, partnerName, selectedTradeId, selectedTradeMax;
var init_trade = __esm({
  "src/trade.js"() {
    init_store();
    init_all();
    init_data();
    init_bundler();
    init_net();
    peer = null;
    conn = null;
    myItems = {};
    theirItems = {};
    myLock = false;
    theirLock = false;
    myConfirm = false;
    theirConfirm = false;
    isConnected = false;
    tradeCompleted = false;
    cheatDetected = false;
    theirUniques = {};
    theirMutDescs = {};
    partnerName = "\u0110\u1ED1i t\xE1c";
    selectedTradeId = null;
    selectedTradeMax = 0;
  }
});

// src/sync.js
function cleanupSync() {
  if (syncConn) {
    syncConn.close();
    syncConn = null;
  }
  if (syncPeer) {
    syncPeer.destroy();
    syncPeer = null;
  }
}
async function openSyncHostModal() {
  cleanupSync();
  openModal("C\u1EA5p M\xE3 (G\u1EEDi Save)", `
        <div style="display:flex; flex-direction:column; gap: 15px; padding: 10px; text-align: center;">
            <div style="font-size: 14px; color: #d32f2f; font-weight: bold; background: #ffebee; padding: 10px; border-radius: 8px;">
                C\u1EA2NH B\xC1O: B\u1EA1n s\u1EAFp T\u1EA0O m\xE3 \u0111\u1EC3 chuy\u1EC3n b\u1EA3n save n\xE0y \u0111i. Thi\u1EBFt b\u1ECB kh\xE1c khi nh\u1EADp m\xE3 n\xE0y s\u1EBD B\u1ECA \u0110\xC8 to\xE0n b\u1ED9 save b\u1EB1ng save hi\u1EC7n t\u1EA1i c\u1EE7a b\u1EA1n. C\u1EA9n th\u1EADn kh\xF4ng \u0111\u1EC3 l\u1ED9 m\xE3!
            </div>
            <div id="sync-host-status" style="font-size: 14px; color: #7a5c38; font-weight: bold; margin-top: 10px;">\u0110ang t\u1EA1o ph\xF2ng...</div>
            <div id="sync-host-code" style="font-size: 20px; font-weight: bold; color: #e91e63; user-select: all; background: #fce4ec; padding: 10px; border-radius: 8px; border: 2px dashed #f06292; display: none;"></div>
            <div class="buy plain" onclick="FarmAll.closeModal()" style="padding: 8px; margin-top: 10px; text-align:center;">\u0110\xF3ng</div>
        </div>
    `);
  const roomId = "fsync-" + Math.random().toString(36).substr(2, 6);
  const peerOptions = await buildPeerConfigAsync();
  syncPeer = new $416260bce337df90$export$ecd1fc136c422448(roomId, peerOptions);
  syncPeer.on("open", (id) => {
    const codeEl = $id("sync-host-code");
    const statusEl = $id("sync-host-status");
    if (codeEl) {
      codeEl.textContent = id;
      codeEl.style.display = "block";
    }
    if (statusEl) {
      statusEl.textContent = "Ph\xF2ng \u0111\xE3 t\u1EA1o! G\u1EEDi m\xE3 n\xE0y cho m\xE1y c\u1EA7n nh\u1EADn save.";
      statusEl.style.color = "#388e3c";
    }
  });
  syncPeer.on("connection", (connection) => {
    if (syncConn) {
      connection.on("open", () => {
        connection.send({ type: "ROOM_FULL" });
        setTimeout(() => connection.close(), 500);
      });
      return;
    }
    syncConn = connection;
    const statusEl = $id("sync-host-status");
    if (statusEl) {
      statusEl.textContent = "\u0110ang thi\u1EBFt l\u1EADp \u0111\u01B0\u1EDDng truy\u1EC1n d\u1EEF li\u1EC7u...";
      statusEl.style.color = "#1976d2";
    }
    const handleSyncOpen = () => {
      if (statusEl) {
        statusEl.textContent = "M\xE1y kh\xE1c \u0111\xE3 k\u1EBFt n\u1ED1i! \u0110ang g\u1EEDi d\u1EEF li\u1EC7u...";
      }
      syncConn.send({ type: "FULL_SAVE", data: ctx.S });
      if (statusEl) {
        statusEl.textContent = "\u0110\xE3 g\u1EEDi save th\xE0nh c\xF4ng!";
        statusEl.style.color = "#4caf50";
      }
      toast("G\u1EEDi save th\xE0nh c\xF4ng!");
      setTimeout(() => {
        cleanupSync();
        closeModal();
      }, 3e3);
    };
    if (syncConn.open) {
      handleSyncOpen();
    } else {
      syncConn.on("open", handleSyncOpen);
    }
  });
  syncPeer.on("error", (err) => {
    const statusEl = $id("sync-host-status");
    if (statusEl) {
      statusEl.textContent = "L\u1ED7i: " + err.type;
      statusEl.style.color = "#d32f2f";
    }
  });
}
function openSyncJoinModal() {
  cleanupSync();
  openModal("Nh\u1EADp M\xE3 (Nh\u1EADn Save)", `
        <div style="display:flex; flex-direction:column; gap: 15px; padding: 10px; text-align: center;">
            <div style="font-size: 14px; color: #d32f2f; font-weight: bold; background: #ffebee; padding: 10px; border-radius: 8px;">
                C\u1EA2NH B\xC1O \u0110\u1ECE: Nh\u1EADp m\xE3 s\u1EBD GHI \u0110\xC8 X\xD3A S\u1EA0CH to\xE0n b\u1ED9 d\u1EEF li\u1EC7u hi\u1EC7n t\u1EA1i tr\xEAn m\xE1y n\xE0y (k\u1EC3 c\u1EA3 ID) b\u1EB1ng d\u1EEF li\u1EC7u m\u1EDBi. H\xE3y ch\u1EAFc ch\u1EAFn tr\u01B0\u1EDBc khi b\u1EA5m Nh\u1EADn!
            </div>
            <input type="text" id="sync-join-code" placeholder="Nh\u1EADp m\xE3 (VD: fsync-abcdef)" class="inp" style="text-align:center; font-size: 16px; font-weight:bold; letter-spacing: 1px;">
            <div id="sync-join-status" style="font-size: 14px; color: #7a5c38; font-weight: bold;"></div>
            <div style="display:flex; gap:10px; margin-top: 10px;">
                <div class="buy" onclick="FarmAll.executeSyncJoin()" style="flex:1; text-align:center;">Nh\u1EADn Save</div>
                <div class="buy plain" onclick="FarmAll.closeModal()" style="flex:1; text-align:center;">Hu\u1EF7</div>
            </div>
        </div>
    `);
}
async function executeSyncJoin() {
  const codeEl = $id("sync-join-code");
  const code = codeEl ? codeEl.value.trim() : "";
  const statusEl = $id("sync-join-status");
  if (!code) {
    if (statusEl) {
      statusEl.textContent = "Vui l\xF2ng nh\u1EADp m\xE3 ph\xF2ng!";
      statusEl.style.color = "#d32f2f";
    }
    return;
  }
  if (statusEl) {
    statusEl.textContent = "\u0110ang k\u1EBFt n\u1ED1i...";
    statusEl.style.color = "#7a5c38";
  }
  cleanupSync();
  const peerOptions = await buildPeerConfigAsync();
  syncPeer = new $416260bce337df90$export$ecd1fc136c422448(void 0, peerOptions);
  syncPeer.on("open", () => {
    syncConn = syncPeer.connect(code, { reliable: true });
    syncConn.on("open", () => {
      if (statusEl) {
        statusEl.textContent = "\u0110\xE3 k\u1EBFt n\u1ED1i! \u0110ang t\u1EA3i save v\u1EC1...";
        statusEl.style.color = "#1976d2";
      }
    });
    syncConn.on("data", (data) => {
      if (data && data.type === "ROOM_FULL") {
        if (statusEl) {
          statusEl.textContent = "M\xE3 n\xE0y \u0111ang b\u1EADn (c\xF3 ng\u01B0\u1EDDi kh\xE1c \u0111ang \u0111\u1ED3ng b\u1ED9)!";
          statusEl.style.color = "#d32f2f";
        }
        syncConn.close();
        return;
      }
      if (data && data.type === "FULL_SAVE" && data.data) {
        if (statusEl) {
          statusEl.textContent = "\u0110\xE3 nh\u1EADn save! \u0110ang \xE1p d\u1EE5ng...";
          statusEl.style.color = "#4caf50";
        }
        if (!ctx.extension_settings[extensionName]) ctx.extension_settings[extensionName] = {};
        ctx.extension_settings[extensionName][NS] = data.data;
        loadState();
        save(true);
        closeModal();
        renderAll();
        toast("\u0110\u1ED3ng b\u1ED9 save th\xE0nh c\xF4ng r\u1EF1c r\u1EE1!");
        cleanupSync();
      }
    });
    syncConn.on("error", (err) => {
      if (statusEl) {
        statusEl.textContent = "L\u1ED7i k\u1EBFt n\u1ED1i!";
        statusEl.style.color = "#d32f2f";
      }
    });
  });
  syncPeer.on("error", (err) => {
    if (statusEl) {
      statusEl.textContent = "L\u1ED7i: " + err.type;
      statusEl.style.color = "#d32f2f";
    }
  });
}
var syncPeer, syncConn;
var init_sync = __esm({
  "src/sync.js"() {
    init_store();
    init_all();
    init_bundler();
    init_net();
    syncPeer = null;
    syncConn = null;
  }
});

// src/all.js
var all_exports = {};
__export(all_exports, {
  $id: () => $id,
  CS: () => CS,
  DECO_PX: () => DECO_PX,
  DYNAMIC_SPR: () => DYNAMIC_SPR,
  FLOATY: () => FLOATY,
  GACHA_NORM_PRICE: () => GACHA_NORM_PRICE,
  GACHA_P: () => GACHA_P,
  GACHA_SPEC_PITY: () => GACHA_SPEC_PITY,
  GACHA_SPEC_PRICE: () => GACHA_SPEC_PRICE,
  GACHA_SUPER_PITY: () => GACHA_SUPER_PITY,
  GAITS: () => GAITS,
  INJECT_ID: () => INJECT_ID,
  LP: () => LP,
  P: () => P,
  PASSES: () => PASSES,
  PETS: () => PETS,
  PET_P: () => PET_P,
  PET_SKILLS: () => PET_SKILLS,
  PET_STATS: () => PET_STATS,
  SEC: () => SEC,
  SEC_LS_KEY: () => SEC_LS_KEY,
  SPRITE_PX: () => SPRITE_PX,
  TOOLS: () => TOOLS,
  WITCH_CRY: () => WITCH_CRY,
  WORK_BAND: () => WORK_BAND,
  addBlock: () => addBlock,
  applyDayEvent: () => applyDayEvent,
  applyPageSkin: () => applyPageSkin,
  applyTheme: () => applyTheme,
  applyViewState: () => applyViewState,
  bagName: () => bagName,
  bagPrice: () => bagPrice,
  bagSel: () => bagSel,
  bagSellMode: () => bagSellMode,
  bagTab: () => bagTab,
  blockPrice: () => blockPrice,
  buildEventPrompt: () => buildEventPrompt,
  buildTicket: () => buildTicket,
  buyBlock: () => buyBlock,
  buyConfirm: () => buyConfirm,
  cacheBlockTxt: () => cacheBlockTxt,
  cacheCoins: () => cacheCoins,
  cacheDayTxt: () => cacheDayTxt,
  cacheWicon: () => cacheWicon,
  cashOut: () => cashOut,
  cashOutHero: () => cashOutHero,
  charName: () => charName,
  clampN: () => clampN,
  closeDungeonView: () => closeDungeonView,
  closeHeroMode: () => closeHeroMode,
  closeModal: () => closeModal,
  closeTradeModal: () => closeTradeModal,
  closeWin: () => closeWin,
  collectWorldbook: () => collectWorldbook,
  curBlocks: () => curBlocks,
  curPlots: () => curPlots,
  decoLayer: () => decoLayer,
  destroy: () => destroy,
  disposers: () => disposers,
  dragBar: () => dragBar,
  dungeonView: () => dungeonView,
  eachPage: () => eachPage,
  emptyPlots: () => emptyPlots,
  endScene: () => endScene,
  esc: () => esc,
  eventFresh: () => eventFresh,
  eventPending: () => eventPending,
  executeGachaRoll: () => executeGachaRoll,
  executeSyncJoin: () => executeSyncJoin,
  extMenuBtn: () => extMenuBtn,
  extractJson: () => extractJson,
  fallbackEvent: () => fallbackEvent,
  fertilize: () => fertilize,
  fetchModelList: () => fetchModelList,
  fieldEl: () => fieldEl,
  fmtDur: () => fmtDur,
  fmtLeft: () => fmtLeft,
  freshState: () => freshState,
  fxLayer: () => fxLayer,
  gachaSortMode: () => gachaSortMode,
  gaitOf: () => gaitOf,
  gameDay: () => gameDay,
  generateAIUniqueItemData: () => generateAIUniqueItemData,
  generateProcedural32x32Sprite: () => generateProcedural32x32Sprite,
  generateUniqueItem: () => generateUniqueItem,
  gesture: () => gesture,
  getPetStats: () => getPetStats,
  getPot: () => getPot,
  growMs: () => growMs,
  hGesture: () => hGesture,
  harvest: () => harvest,
  heartbeat: () => heartbeat,
  heroToast: () => heroToast,
  hopStep: () => hopStep,
  initEvents: () => initEvents,
  initGachaState: () => initGachaState,
  initHero: () => initHero,
  initHeroState: () => initHeroState,
  initOrb: () => initOrb,
  initPets: () => initPets,
  initRender: () => initRender,
  initShop: () => initShop,
  initUI: () => initUI,
  initWindows: () => initWindows,
  initWitch: () => initWitch,
  isDungeonOpen: () => isDungeonOpen,
  isRain: () => isRain,
  lastScene: () => lastScene,
  layout: () => layout,
  loadCharState: () => loadCharState,
  loadState: () => loadState,
  makeWitchOrder: () => makeWitchOrder,
  mode: () => mode,
  moveTo: () => moveTo,
  mulberry32: () => mulberry32,
  mutCountOf: () => mutCountOf,
  mutDescOf: () => mutDescOf,
  mutKeysOf: () => mutKeysOf,
  nextSceneAt: () => nextSceneAt,
  now: () => now,
  onHeroDown: () => onHeroDown,
  onHeroMove: () => onHeroMove,
  onHeroUp: () => onHeroUp,
  onOrbDown: () => onOrbDown,
  onOrbMove: () => onOrbMove,
  onOrbUp: () => onOrbUp,
  onResize: () => onResize,
  openAchivModal: () => openAchivModal,
  openBetModal: () => openBetModal,
  openBuyDlg: () => openBuyDlg,
  openDungeonView: () => openDungeonView,
  openGachaModal: () => openGachaModal,
  openGachaRatesModal: () => openGachaRatesModal,
  openHeroMode: () => openHeroMode,
  openHeroPanel: () => openHeroPanel,
  openModal: () => openModal,
  openPanel: () => openPanel,
  openPassDlg: () => openPassDlg,
  openSandbox: () => openSandbox,
  openSellDlg: () => openSellDlg,
  openSellSeedDlg: () => openSellSeedDlg,
  openSyncHostModal: () => openSyncHostModal,
  openSyncJoinModal: () => openSyncJoinModal,
  openTakeout: () => openTakeout,
  openTradeModal: () => openTradeModal,
  openWitchDlg: () => openWitchDlg,
  pagePlots: () => pagePlots,
  pageUnlocked: () => pageUnlocked,
  pendingPick: () => pendingPick,
  petArrive: () => petArrive,
  petBubble: () => petBubble,
  petEl: () => petEl,
  petFert: () => petFert,
  petHarvest: () => petHarvest,
  petHopT: () => petHopT,
  petPlant: () => petPlant,
  petPos: () => petPos,
  petSVG: () => petSVG,
  petSleepT: () => petSleepT,
  petSpot: () => petSpot,
  petTgt: () => petTgt,
  petTouch: () => petTouch,
  pickFrom: () => pickFrom,
  pileWith: () => pileWith,
  placeDungeonWin: () => placeDungeonWin,
  placeHeroBar: () => placeHeroBar,
  placeOrb: () => placeOrb,
  placePet: () => placePet,
  placeWin: () => placeWin,
  plant: () => plant,
  playNaoyaCutscene: () => playNaoyaCutscene,
  plotEmote: () => plotEmote,
  plotHTML: () => plotHTML,
  registerDynamicSprite: () => registerDynamicSprite,
  regrowMs: () => regrowMs,
  renderAll: () => renderAll,
  renderBanner: () => renderBanner,
  renderChips: () => renderChips,
  renderDynamic: () => renderDynamic,
  renderPager: () => renderPager,
  renderPets: () => renderPets,
  renderPlots: () => renderPlots,
  renderStatus: () => renderStatus,
  renderTimeout: () => renderTimeout,
  renderToolbar: () => renderToolbar,
  renderWitch: () => renderWitch,
  requestDayEvent: () => requestDayEvent,
  resetDestroyed: () => resetDestroyed,
  resizeTimer: () => resizeTimer,
  rollMutation: () => rollMutation,
  root: () => root,
  runState: () => runState,
  sanitizeEvent: () => sanitizeEvent,
  save: () => save,
  saveCharState: () => saveCharState,
  saveSec: () => saveSec,
  scene: () => scene,
  sceneBusy: () => sceneBusy,
  sceneTimer: () => sceneTimer,
  sell: () => sell,
  sellSeed: () => sellSeed,
  setInjection: () => setInjection,
  setMode: () => setMode,
  setPendingPick: () => setPendingPick,
  setPot: () => setPot,
  setTakeoutNote: () => setTakeoutNote,
  setTestMode: () => setTestMode,
  settle: () => settle,
  setupExtButton: () => setupExtButton,
  setupSlashCommand: () => setupSlashCommand,
  sh: () => sh,
  shopTab: () => shopTab,
  shovel: () => shovel,
  sleepPet: () => sleepPet,
  spriteSVG: () => spriteSVG,
  startTribulationEvent: () => startTribulationEvent,
  stopHop: () => stopHop,
  takeoutNote: () => takeoutNote,
  testMode: () => testMode,
  testSecApi: () => testSecApi,
  tick: () => tick,
  tileURI: () => tileURI,
  toast: () => toast,
  toastTimer: () => toastTimer,
  todayEvent: () => todayEvent,
  toggleWin: () => toggleWin,
  toolbarOpen: () => toolbarOpen,
  touchBase: () => touchBase,
  tryScene: () => tryScene,
  uiCloseAddItem: () => uiCloseAddItem,
  uiConfirmAdd: () => uiConfirmAdd,
  uiConfirmTrade: () => uiConfirmTrade,
  uiOpenAddItem: () => uiOpenAddItem,
  uiRemoveTradeItem: () => uiRemoveTradeItem,
  uiSelectAdd: () => uiSelectAdd,
  uiToggleLock: () => uiToggleLock,
  updateInjection: () => updateInjection,
  updateNextScene: () => updateNextScene,
  useStarShard: () => useStarShard,
  wakePet: () => wakePet,
  walkTo: () => walkTo,
  wander: () => wander,
  warmUpCache: () => warmUpCache,
  water: () => water,
  weatherOf: () => weatherOf,
  wg: () => wg,
  witchArrive: () => witchArrive,
  witchDeliver: () => witchDeliver
});
var init_all = __esm({
  "src/all.js"() {
    init_state();
    init_utils();
    init_ui();
    init_events();
    init_orb();
    init_windows();
    init_logic();
    init_render();
    init_shop();
    init_pets();
    init_witch();
    init_gacha();
    init_graphics();
    init_dungeon();
    init_destroy();
    init_bet();
    init_hero();
    init_trade();
    init_sync();
  }
});

// src/main.js
init_store();
init_all();
init_graphics();
init_data();
function initFarm() {
  try {
    window[RUNTIME_KEY]?.destroy?.();
  } catch (e) {
  }
  resetDestroyed();
  document.getElementById("star-tavern-farm-root")?.remove();
  loadState();
  if (cashOut) cashOut(true);
  initUI();
  applyTheme();
  initOrb();
  initWindows();
  initShop();
  initRender();
  initPets();
  initWitch();
  initEvents();
  initHero();
  setupExtButton();
  setupSlashCommand();
  const api = { destroy };
  window[RUNTIME_KEY] = api;
  window.FarmAll = all_exports;
  renderToolbar();
  renderChips();
  renderBanner();
  renderPets();
  updateInjection();
  if (CS.link) requestDayEvent();
  const diag = [];
  if (ctx.S) diag.push("S");
  if (CS) diag.push("CS");
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
    setExtensionContext({
      extension_settings: ext_set,
      saveSettingsDebounced: save_set,
      eventSource: ev_src,
      event_types: ev_types
    });
  } catch (e) {
    console.error("[Farm] L\u1ED7i khi k\u1EBFt n\u1ED1i ST Context:", e);
    let ext_set = window.extension_settings || {};
    let save_set = window.saveSettingsDebounced || (() => {
    });
    let ev_src = window.eventSource;
    let ev_types = window.event_types;
    setExtensionContext({
      extension_settings: ext_set,
      saveSettingsDebounced: save_set,
      eventSource: ev_src,
      event_types: ev_types
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
