export const styleCSS = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: "Microsoft YaHei", "PingFang SC", sans-serif; }
    img { -webkit-user-drag: none; user-select: none; }
    /* ===== v1.0: chủ đề giao diện (hồng anh đào / trời quang), đổi ở trang cài đặt, S.theme lưu toàn cục ===== */
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
    #orb.dockL:not(:hover) { transform: translateX(-27px); }   /* Sửa #12: dán mép thì thu nửa, rê chuột thì bật ra */
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
    
    .dialog-win { position: fixed; z-index: 99999; width: min(450px, 90vw); display: flex;
      flex-direction: column; background: #f8efe0;
      background-image: repeating-linear-gradient(0deg, transparent 0 30px, rgba(170,130,80,.14) 30px 33px);
      border: 4px solid #c9a273; outline: 4px solid var(--frameOut); border-radius: 10px;
      box-shadow: inset 0 0 0 4px #fff6e8, 0 14px 40px rgba(0,0,0,.55); animation: winPop 0.2s cubic-bezier(0.18,0.89,0.32,1.28) forwards; overflow: hidden; }
    .dialog-content { padding: 20px 25px; text-align: center; color: #7a5c38; font-size: 15px; font-weight: bold; line-height: 1.6; }
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
    /* v0.8: thanh lật trang ba trang */
    .pager { position: absolute; top: 7px; right: 7px; z-index: 7; display: flex; align-items: center; justify-content: center;
      background: rgba(58,48,30,.4); border: 2px solid rgba(255,246,224,.4); border-radius: 14px; overflow: hidden;
      width: 26px; height: 26px; cursor: pointer; font-size: 13px; color: rgba(255,246,224,.8); user-select: none; }
    .pager.open { width: auto; height: auto; border-radius: 12px; cursor: default;
      background: rgba(58,48,30,.55); border-color: rgba(255,246,224,.5); font-size: 0; }
    .pager:not(.open) .ptab { display: none; }
    .pager:not(.open)::after { content: '⇄'; }
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
      content: ''; position: absolute; inset: 0; background: url('data:image/svg+xml;utf8,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="1.5" fill="%23ffffff22"/></svg>'); opacity: 0.5; z-index: 0; pointer-events: none;
    }
    .field.casino-mode { background: radial-gradient(circle at 50% 50%, #280a3a 0%, #0a0210 100%) !important; border-color: #ffd94d !important; overflow: hidden; }
    .field.casino-mode::before {
      content: ''; position: absolute; inset: 0; background: url('data:image/svg+xml;utf8,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><path d="M30 10 L35 25 L50 30 L35 35 L30 50 L25 35 L10 30 L25 25 Z" fill="%23ffd94d11"/><circle cx="10" cy="10" r="2" fill="%23ffb8c422"/></svg>'); opacity: 0.6; z-index: 0; pointer-events: none;
    }
    .explore-blocks, .casino-blocks { padding: 18px 24px 70px; display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; min-height: 280px; align-content: flex-start; position: relative; z-index: 1; }
    .explore-slot { width: 84px; height: 104px; background: rgba(255,255,255,0.7); border: 3px solid #8a6844; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; box-shadow: inset 0 0 0 3px rgba(255,255,255,0.5), 0 4px 0 #8a6844; transition: transform 0.1s; position: relative; z-index: 10; pointer-events: auto; }
    .explore-slot:active { transform: translateY(4px); box-shadow: inset 0 0 0 3px rgba(255,255,255,0.5), 0 0 0 #8a6844; }
    .explore-slot .feature-name { font-size: 13px; font-weight: bold; color: #7a5c38; margin-top: 8px; text-align: center; }
    
    .field.explore-mode .explore-slot { background: transparent; border-color: #8a5cc0; box-shadow: inset 0 0 0 3px rgba(138,92,192,0.5), 0 4px 0 #4b3082; }
    .field.explore-mode .explore-slot:active { transform: translateY(4px); box-shadow: inset 0 0 0 3px rgba(138,92,192,0.5), 0 0 0 #4b3082; }
    .field.explore-mode .explore-slot .feature-name { color: #e0ccff; text-shadow: 0 1px 2px #000; }
    .casino-blocks .explore-slot { background: transparent; box-shadow: inset 0 0 0 3px rgba(138,104,68,0.5), 0 4px 0 #8a6844; }
    .casino-blocks .explore-slot:active { transform: translateY(4px); box-shadow: inset 0 0 0 3px rgba(138,104,68,0.5), 0 0 0 #8a6844; }
    .casino-blocks .explore-slot .feature-name { color: #ffd94d; text-shadow: 0 1px 2px #000; }
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
    /* #26: lớp cho bé tròn tự do đi lại —— phủ toàn bộ khu ruộng, đi theo khu vực (loại làm việc = hàng dưới, loại đi dạo = bờ ruộng) */
    .mascots { position: absolute; inset: 0; z-index: 6; pointer-events: none; }
    /* Cảm ứng: không có touch-action:none thì trình duyệt coi cú vuốt là cuộn trang, bắn pointercancel và cắt ngang phiên kéo */
    .mascots[data-drag="1"] .pet { touch-action: none; }
    .pet { pointer-events: auto; cursor: pointer; transition: transform .12s; position: absolute; will-change: transform;
      left: 0; bottom: 0; will-change: transform, translate; }
    .pet:active { transform: scale(1.15, .85); }
    .pbody { display: block; animation: petbob 1.8s ease-in-out infinite; }
    .pet.walk .pbody { animation: pethop var(--hopd, .33s) linear infinite; }   /* v0.7①: đi bộ = nhảy liên tiếp theo đường parabol */
    .pet[data-pet="cloudMallow"] .pbody,
    .pet[data-pet="ghostBlob"] .pbody,
    .pet[data-pet="jellyfish"] .pbody { animation: petfloat 3.2s ease-in-out infinite; }  /* Mây / ma / sứa: kiểu bay lơ lửng (đè lên walk) */
    .pet.sleep .pbody { animation: petsleep 3.6s ease-in-out infinite; }   /* v0.7②: ngủ = thở chậm (đè lên bay, ma cũng phải hạ cánh mà ngủ) */
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
    /* Một chu kỳ nhảy: lấy đà bẹt xuống → bay lên kéo dài → chạm đất nén nhẹ → về dáng chuẩn, độ cao do --hy quyết định (khác nhau theo dáng đi) */
    @keyframes pethop { 0%, 100% { transform: translateY(0) scale(1.07, .93); }
      40% { transform: translateY(var(--hy, -9px)) scale(.94, 1.06); }
      80% { transform: translateY(-1px) scale(1.02, .99); } }
    /* v0.8b: quầy hàng của phù thuỷ tròn (wen sửa lần 2: hàng dưới cùng bên trái, xếp cùng hàng với bé làm việc; bảng đơn hàng đội trên đầu) */
    #witch { position: absolute; left: 12%; bottom: 2px; z-index: 6; cursor: pointer; display: none; text-align: center; }
    #witch.show { display: block; }
    #witch .wbody { display: block; animation: petfloat 3.2s ease-in-out infinite; }
    #witch .wtag { display: inline-block; margin-bottom: 1px; font-size: 10px; font-weight: bold; color: #cfc9f2;
      background: #2a2650; border: 2px solid #8f86d9; border-radius: 6px; padding: 1px 7px;
      box-shadow: 0 0 8px rgba(143,134,217,.5); }
    .pbubble.wb { border-color: #8f86d9; color: #5a52a0; background: #f4f2ff; }
    /* v0.8b: trang đơn hàng quỹ đạo sao A (bản thiết kế chốt) */
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
    .ctrlrow { display: flex; gap: 6px; align-items: stretch; padding: 7px 14px 0; flex-wrap: nowrap; }   /* Khoá một hàng: không đủ chỗ thì ép chữ chứ không ép khung */
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
    .banner #btxt { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }   /* Mặc định một dòng, bấm vào banner thì mở rộng */
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
    /* ===== Vé giấy phong cách hoài cổ (chuyển từ bản xem trước của vé) ===== */
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
    /* Thanh công cụ bản mới: bình thường = tai nhỏ thu nửa dán mép trái (không chiếm đồng cỏ, không che bé tròn đi dạo); bấm mở = bung ra một cột dọc theo bờ ruộng */
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
    .item .meta { font-size: 11px; color: #a3763d; margin-top: 1px; line-height: 1.5; }   /* M-2: mô tả không cắt ngắn, xuống dòng đầy đủ (mô tả chức năng đột biến là thông tin cốt lõi) */
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
      box-shadow: inset 0 -3px 0 #cdb0ef, 0 3px 0 #7a4ab8; }   /* #53: gieo lại = phù thuỷ bói toán, mặc màu tím của cô ấy */
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
    .gacha-item-card.rarity-Rác { border-color: #9e9e9e !important; background: #f5f5f5 !important; }
    .gacha-item-card.rarity-Thường { border-color: #b0bec5 !important; background: #eceff1 !important; }
    .gacha-item-card.rarity-Hiếm { border-color: #4a90e2 !important; background: #f0f7ff !important; }
    .gacha-item-card.rarity-Sử-thi { border-color: #a335ee !important; background: #faf0ff !important; }
    .gacha-item-card.rarity-Huyền-thoại { border-color: #ff8000 !important; background: #fff8f0 !important; box-shadow: 0 0 10px rgba(255,128,0,0.6) !important; }
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
    
    /* Giao dịch P2P */
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
    
    /* Thiên Kiếp (Tribulation) */
    .trib-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; transition: opacity 0.5s; border-radius: 6px; }
    .trib-cloud { position: absolute; top: 10%; width: 200vw; height: 30vh; background: radial-gradient(ellipse at center, rgba(30,30,40,0.9) 0%, rgba(10,10,15,0) 60%); animation: tribCloudMove 10s linear infinite; pointer-events: none; z-index: 1; }
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
export const fleaStyles = `
.flea-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px dashed #c2a274; }
.flea-header h3 { margin: 0; color: #7a5c38; }
.flea-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
.flea-item { display: flex; align-items: center; background: #faf0dc; padding: 10px; border: 2px solid #e0c8a0; border-radius: 8px; gap: 10px; }
.flea-item.mine { border-color: #4caf50; background: #e8f5e9; }
.flea-item-icon { font-size: 24px; width: 32px; text-align: center; }
.flea-item-info { flex: 1; }
.flea-item-name { font-weight: bold; color: #5d4037; }
.flea-item-seller { font-size: 11px; color: #8d6e63; }
.flea-item-action { text-align: right; }
.flea-item-price { font-weight: bold; color: #ffb300; text-shadow: 0 1px 1px #000; margin-bottom: 4px; }
.flea-post-form { display: flex; flex-direction: column; gap: 10px; }
.flea-post-form label { font-size: 12px; font-weight: bold; color: #7a5c38; }
.flea-post-form select, .flea-post-form input { padding: 8px; border: 2px solid #e0c8a0; border-radius: 4px; font-family: inherit; }
`;

export const blackjackStyles = `
/* ===== BLACKJACK CSS ===== */
#bj-win.dungeon-win {
    background: #0f2c1b; /* Classic dark green felt */
    background-image: radial-gradient(circle at center, #1b4d2e 0%, #0a1c11 100%);
    border: 4px solid #d4af37; /* Gold border */
    outline: 4px solid #111;
    box-shadow: inset 0 0 50px rgba(0,0,0,0.8);
    color: #f1f1f1;
}
#bj-win .titlebar {
    background: linear-gradient(to bottom, #d4af37, #aa831b);
    border-bottom: 2px solid #5a4200;
    color: #332200;
    text-shadow: 1px 1px 0 rgba(255,255,255,0.4);
}
#bj-win .close-x { color: #332200; text-shadow: 1px 1px 0 rgba(255,255,255,0.4); }

#bj-solo-wrap { display: flex; flex-direction: column; gap: 16px; padding: 10px 0; }
.bj-table { background: rgba(0, 0, 0, 0.2); border: 2px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 20px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5); position: relative; }
.bj-table::before { content: "BLACKJACK PAYS 3 TO 2"; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(212,175,55,0.15); font-weight: bold; font-size: 24px; letter-spacing: 3px; text-align: center; pointer-events: none; width: 100%; text-shadow: 0 0 10px rgba(0,0,0,0.5); }

.bj-dealer-area, .bj-player-area { display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 1; }
.bj-area-label { color: #d4af37; font-weight: bold; font-size: 13px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); text-transform: uppercase; letter-spacing: 1px; background: rgba(0,0,0,0.4); padding: 2px 10px; border-radius: 12px; }
.bj-hand-row { display: flex; justify-content: center; gap: 6px; min-height: 80px; perspective: 1000px; }

.bj-card { width: 56px; height: 80px; background: #fff; border-radius: 6px; border: 1px solid #999; box-shadow: 2px 2px 8px rgba(0,0,0,0.6); position: relative; font-weight: bold; display: flex; align-items: center; justify-content: center; user-select: none; color: #111; }
.bj-card.small { width: 42px; height: 60px; font-size: 12px; }
.bj-card.back { background: #8b0000; border-color: #fff; padding: 4px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }
.bj-card-back-inner { width: 100%; height: 100%; border: 2px dashed rgba(255,255,255,0.4); border-radius: 3px; background: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.15) 5px, rgba(255,255,255,0.15) 10px); }
.bj-card-corner { position: absolute; display: flex; flex-direction: column; align-items: center; line-height: 1; font-size: 13px; }
.bj-card.small .bj-card-corner { font-size: 10px; }
.bj-card-corner.tl { top: 4px; left: 4px; }
.bj-card-corner.br { bottom: 4px; right: 4px; transform: rotate(180deg); }
.bj-card-corner span { font-size: 14px; }
.bj-card.small .bj-card-corner span { font-size: 11px; }
.bj-card-center { font-size: 24px; }
.bj-card.small .bj-card-center { font-size: 18px; }

/* Animations */
.bj-anim-deal { animation: bjDeal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; transform: translateY(-50px) scale(0.8); }
@keyframes bjDeal { to { opacity: 1; transform: translateY(0) scale(1); } }
.bj-anim-flip { animation: bjFlip 0.6s ease-out forwards; transform-style: preserve-3d; }
@keyframes bjFlip { 0% { transform: rotateY(180deg) scale(1); } 50% { transform: rotateY(90deg) scale(1.1); } 100% { transform: rotateY(0deg) scale(1); } }

.bj-score { color: #fff; font-size: 12px; background: rgba(0,0,0,0.8); padding: 3px 10px; border-radius: 12px; min-width: 60px; text-align: center; border: 1px solid rgba(212,175,55,0.5); box-shadow: 0 2px 4px rgba(0,0,0,0.5); }
#bj-player-hands { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
.bj-player-hand { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px; border-radius: 10px; transition: background 0.3s; position: relative; }
.bj-player-hand.active-hand { background: rgba(212, 175, 55, 0.15); box-shadow: 0 0 15px rgba(212, 175, 55, 0.4); border: 1px dashed rgba(212, 175, 55, 0.6); }
.bj-player-hand.active-hand::after { content: "▼"; position: absolute; top: -15px; color: #d4af37; font-size: 14px; animation: bounce 1s infinite; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }

.bj-actions { display: flex; flex-direction: column; gap: 10px; align-items: center; margin-top: 10px; position: relative; z-index: 10; }
.bj-bet-row { display: flex; gap: 6px; align-items: center; background: rgba(0,0,0,0.6); padding: 8px; border-radius: 10px; border: 1px solid #d4af37; box-shadow: 0 4px 6px rgba(0,0,0,0.4); }
.bj-quick { cursor: pointer; padding: 5px 10px; border-radius: 6px; background: linear-gradient(to bottom, #444, #222); font-size: 12px; font-weight: bold; color: #d4af37; border: 1px solid #555; }
.bj-quick:hover { background: linear-gradient(to bottom, #555, #333); border-color: #d4af37; }
.bj-btn-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.bj-message { text-align: center; font-weight: bold; font-size: 14px; color: #f1c40f; min-height: 20px; padding: 5px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); }
.bj-msg-sm { font-size: 13px; color: #ddd; font-weight: bold; text-align: center; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }

/* ROOM MODE */
.bj-room-layout { display: flex; flex-direction: column; height: 100%; }
.bj-room-topbar { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 2px solid #111; background: rgba(0,0,0,0.6); box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
.bj-room-code-badge { background: linear-gradient(45deg, #b8860b, #d4af37); color: #000; padding: 5px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; letter-spacing: 1px; box-shadow: 0 2px 5px rgba(0,0,0,0.5); cursor: pointer; }
.bj-room-code-badge:hover { filter: brightness(1.1); }
.bj-players-grid { display: flex; flex-wrap: wrap; justify-content: space-around; gap: 10px; width: 100%; z-index: 1; margin-top: 10px; }
.bj-player-slot { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px; background: rgba(0,0,0,0.4); border-radius: 10px; min-width: 100px; border: 2px solid transparent; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }
.bj-player-slot.me { border-color: rgba(212,175,55,0.5); }
.bj-player-slot.my-turn { background: rgba(212, 175, 55, 0.2); border-color: #d4af37; box-shadow: 0 0 15px rgba(212, 175, 55, 0.4); }
.bj-player-slot.spectator { opacity: 0.6; filter: grayscale(1); }
.bj-player-name { color: #f1f1f1; font-size: 11px; font-weight: bold; text-shadow: 1px 1px 2px #000; text-align: center; max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 6px; }

.bj-lobby-wrap { display: flex; flex-direction: column; gap: 15px; padding: 15px; flex: 1; justify-content: center; align-items: center; }
.bj-lobby-box { background: rgba(0,0,0,0.5); border: 2px solid #d4af37; border-radius: 12px; padding: 15px; width: 100%; max-width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
.bj-lobby-title { font-size: 16px; font-weight: bold; color: #d4af37; text-align: center; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px dashed rgba(212,175,55,0.3); padding-bottom: 5px; }
.bj-player-list { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; padding-right: 5px; }
.bj-player-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: bold; color: #eee; padding: 8px 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 3px solid transparent; }
.bj-player-row.ready { border-left-color: #2ecc71; background: rgba(46, 204, 113, 0.1); }
.bj-player-row.host { border-left-color: #d4af37; }
.bj-kick-btn { background: #e74c3c; color: white; border: none; border-radius: 4px; padding: 3px 6px; font-size: 10px; cursor: pointer; font-weight: bold; opacity: 0.8; }
.bj-kick-btn:hover { opacity: 1; }

.bj-settings-host { background: rgba(0,0,0,0.6); padding: 15px; border-radius: 12px; margin-top: 15px; border: 1px solid rgba(255,255,255,0.1); }
.bj-chat-wrap { display: flex; flex-direction: column; height: 180px; background: rgba(0,0,0,0.5); border-top: 2px solid #111; }
.bj-chat-log { flex: 1; padding: 10px; overflow-y: auto; font-size: 12px; display: flex; flex-direction: column; gap: 4px; color: #ddd; }
.bj-chat-line { word-break: break-word; line-height: 1.4; }
.bj-chat-line b { color: #d4af37; }
.bj-chat-inp-row { display: flex; gap: 5px; padding: 8px; background: rgba(0,0,0,0.8); border-top: 1px solid #333; }
.bj-chat-inp { background: #222 !important; color: #fff !important; border: 1px solid #444 !important; border-radius: 6px; }

.bj-summary-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; animation: mutFadeIn 0.3s; padding: 20px; }
.bj-summary-box { background: linear-gradient(135deg, #1a2a20, #0a1410); border: 2px solid #d4af37; border-radius: 12px; width: 100%; max-width: 500px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
.bj-summary-title { font-size: 20px; color: #d4af37; text-align: center; margin-bottom: 15px; font-weight: bold; letter-spacing: 2px; }
.bj-summary-table { width: 100%; border-collapse: collapse; font-size: 12px; color: #eee; text-align: left; }
.bj-summary-table th, .bj-summary-table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.bj-summary-table th { color: #d4af37; font-weight: bold; }
.bj-summary-row.me { background: rgba(212,175,55,0.15); }
.bj-val-win { color: #2ecc71; font-weight: bold; }
.bj-val-lose { color: #e74c3c; }
.bj-val-push { color: #f1c40f; }
.bj-countdown { font-size: 14px; color: #aaa; text-align: center; margin-top: 15px; font-weight: bold; }

.bj-double-btn { background: linear-gradient(#f39c12, #d35400) !important; color: white !important; border: 1px solid #e67e22 !important; }
.bj-split-btn { background: linear-gradient(#9b59b6, #8e44ad) !important; color: white !important; border: 1px solid #9b59b6 !important; }
.bj-surr-btn { color: #e74c3c !important; border-color: #c0392b !important; }
.bj-btn-ready { background: linear-gradient(#2ecc71, #27ae60) !important; color: white !important; border-color: #2ecc71 !important; }
.bj-btn-ready.not-ready { background: linear-gradient(#e74c3c, #c0392b) !important; border-color: #e74c3c !important; }
.bj-coin-anim { position: absolute; color: #f1c40f; font-weight: bold; font-size: 16px; animation: bjCoinFly 1.5s ease-out forwards; pointer-events: none; text-shadow: 0 0 5px #000; z-index: 20; }
@keyframes bjCoinFly { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-40px) scale(1.5); } }

@media (max-width: 640px) {
    .bj-chat-wrap.mobile-chat-focus {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100000;
        background: rgba(0,0,0,0.95);
        box-shadow: 0 -5px 20px rgba(0,0,0,0.8);
        border-top: 2px solid #d4af37;
    }
}
`;

