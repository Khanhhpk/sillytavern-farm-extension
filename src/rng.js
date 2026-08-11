/* PRNG có hạt giống, tách riêng khỏi graphics.js để các module thuần tuý
   (race-sim.js) và `node --test` dùng được mà không kéo theo `document`.
   Đây là nguồn sự thật duy nhất — graphics.js re-export chính hàm này. */
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
