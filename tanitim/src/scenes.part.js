  // ================= SKYLANCE SAHNELERİ =================
  const BRAND = "Skylance", BRAND_C = "#1d3f73";
  const S = { sky: "#9fd3f0", sky2: "#c9e8f8", deep: "#1d3f73", night: "#16284d", red: "#e2513f", orange: "#f39a3a", gold: "#f6c945", steel: "#aeb9c6", steelD: "#6e7b8b", mint: "#c9ecd9", peach: "#f8d2b8", lilac: "#dcd3f2", cream: "#f6efdd" };
  function blinkAt(t0) { return T > t0 && T < t0 + 0.12; }

  // ---------- savaş uçağı (yandan, sağa bakar) ----------
  // o: {x,y,s,rot, body, stripe, wing, eyes, look, flame, blink, mood:'smile'|'grin'|'o'}
  function jet(o) {
    const s = o.s || 1; if (s <= 0.01) return;
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
    if (o.flame !== false) {
      const fl = 1 + 0.25 * Math.sin(T * 47) + 0.15 * Math.sin(T * 31);
      ctx.save(); ctx.translate(-250, 6); ctx.scale(fl, 1);
      cut(cached("flame", () => [[0, -26], [-120, -6], [-150, 0], [-120, 8], [0, 26]]), { fill: S.orange, lift: 0, edgeW: 3, tex: 0.3 });
      cut(cached("flame2", () => [[0, -14], [-70, -3], [-86, 0], [-70, 4], [0, 14]]), { fill: S.gold, lift: 0, edge: false, tex: 0 });
      ctx.restore();
    }
    cut(cached("tail", () => [[-250, -10], [-190, -10], [-150, -120], [-200, -125]]), { fill: o.stripe || S.red, lift: 0.9, edgeW: 5 });
    const body = cached("fus", () => [[-260, -30], [120, -40], [210, -22], [290, 6], [210, 26], [120, 34], [-260, 30]]);
    cut(body, { fill: o.body || S.steel, lift: 1.3, edgeW: 7, tex: 0.6, inner: () => {
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(-250, -26, 470, 12);
      ctx.fillStyle = o.stripe || S.red; ctx.fillRect(-120, -6, 230, 14);
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(-260, 14, 500, 20);
    } });
    cut(cached("wing", () => [[-40, 6], [80, 10], [-10, 120], [-90, 120]]), { fill: o.wing || S.steelD, lift: 1, edgeW: 5, tex: 0.5 });
    cut(cached("canopy", () => { const a = []; for (let i = 0; i <= 20; i++) { const t = Math.PI + i / 20 * Math.PI; a.push([60 + Math.cos(t) * 95, -30 + Math.sin(t) * 52]); } return a; }), { fill: "#bfe6fb", lift: 0.6, edgeW: 5, tex: 0.2, inner: () => { ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(10, -76, 18, 40); } });
    if (o.eyes !== false) {
      const lx = (o.look ? o.look[0] : 0) * 6, ly = (o.look ? o.look[1] : 0) * 5, bl = o.blink ? 0.12 : 1;
      [[38, -50], [92, -50]].forEach(([ex, ey]) => { ctx.fillStyle = "#fffdf6"; ctx.strokeStyle = P.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.ellipse(ex, ey, 17, 20 * bl, 0, 0, 7); ctx.fill(); ctx.stroke(); if (bl > 0.5) { ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(ex + 5 + lx, ey + 3 + ly, 8, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ex + 2 + lx, ey + ly, 3, 0, 7); ctx.fill(); } });
      ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.lineCap = "round";
      if (o.mood === "grin") { ctx.fillStyle = "#5a1d12"; ctx.beginPath(); ctx.moveTo(160, -2); ctx.quadraticCurveTo(195, 26, 232, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (o.mood === "o") { ctx.fillStyle = "#5a1d12"; ctx.beginPath(); ctx.ellipse(198, 8, 9, 11, 0, 0, 7); ctx.fill(); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(198, -10, 22, 0.5, Math.PI - 0.7); ctx.stroke(); }
    }
    ctx.restore();
  }
  function speedLines(n, sd, dir = 1, alpha = 0.6, speed = 1) {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = "#ffffff"; ctx.lineCap = "round";
    for (let i = 0; i < n; i++) { const y = hr(sd + i) * H, len = 120 + hr(sd + i * 2) * 260, sp = (1400 + hr(i * 3) * 1600) * speed, x = ((hr(sd + i * 5) * (W + 600) - T * sp * dir) % (W + 600) + W + 600) % (W + 600) - 300; ctx.lineWidth = 2 + hr(i * 7) * 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * dir, y); ctx.stroke(); }
    ctx.restore();
  }
  function skyBg(color, key, cloudSpeed = 60) {
    bg(color, key);
    [[0.35, 230, 0.6, 21], [0.6, 560, 0.8, 22], [1.0, 860, 1.1, 23]].forEach(([sp, y, sc, sd], layer) => {
      for (let i = 0; i < 3; i++) { const x = ((hr(sd + i) * 2400 - T * cloudSpeed * sp) % 2400 + 2400) % 2400 - 240; cloud(x, y + hr(sd + i * 3) * 120 - 60, sc * (0.8 + hr(i + sd) * 0.4), 4 + ((i + layer) % 5)); }
    });
  }
  function trail(pts, c = "#ffffff", w = 18) { ctx.save(); ctx.globalAlpha = 0.85; pencil(pts, 1, { w, c, id: 3300, passes: 1, j: 0.6 }); ctx.restore(); }

  // ---------- S1: Gökyüzü (0 – 4.6) ----------
  function s1() {
    skyBg(S.sky2, "sky2");
    sun(1550, 230, eBack(seg(T, 0.2, 0.7)), T * 0.3);
    text("Gökyüzü...", 960, 300, { size: 150, start: 0.85, dur: 0.6, align: "center", color: S.deep, stroke: "#fbf6ea", strokeW: 14 });
    text("seni bekliyor.", 960, 470, { size: 120, start: 1.5, dur: 0.6, align: "center", color: S.red, stroke: "#fbf6ea", strokeW: 14, id: 20 });
    const k = seg(T, 2.3, 3.5);
    if (k > 0 && k < 1) {
      const x = lerp(-500, W + 500, eIO(k)), y = 760 - Math.sin(k * Math.PI) * 140;
      const pts = []; for (let i = 0; i <= 30; i++) { const kk = Math.max(0, k - 0.45 + i / 30 * 0.45); pts.push([lerp(-500, W + 500, eIO(kk)) - 250 * 0.75, 766 - Math.sin(kk * Math.PI) * 140]); }
      trail(pts);
      jet({ x, y, s: 0.75, rot: -Math.cos(k * Math.PI) * 0.18, mood: "grin" });
    }
  }
  // ---------- S2: Pist + geri sayım (4.0 – 10.0) ----------
  function runway() {
    const mv = T > 8.6 ? 900 * (T - 8.6) * (T - 8.6) : 0;
    cut(cached("runway", () => [[-60, 0], [W + 60, 0], [W + 60, 420], [-60, 420]]), { y: 880, fill: "#5d6878", lift: 1.2, edgeW: 8, inner: () => { ctx.fillStyle = "#f6efdd"; for (let i = 0; i < 14; i++) ctx.fillRect(-60 + ((i * 180 - mv) % 2520 + 2520) % 2520 - 180, 70, 100, 16); } });
  }
  function s2() {
    skyBg(S.sky, "sky", 30);
    runway();
    cut(tornRect(120, 360, 3001, 3), { x: 1700, y: 700, fill: S.cream, lift: 1.2 });
    cut(tornRect(220, 110, 3002, 3), { x: 1700, y: 500, fill: "#9fb8cf", lift: 1.1, inner: () => { ctx.fillStyle = "#e7f6ff"; ctx.fillRect(-90, -30, 180, 50); } });
    const go = seg(T, 8.6, 10.0), x = 760 + eIn(go) * 1600, y = 810 - eIn(seg(T, 9.2, 10.0)) * 700, rot = -eIn(seg(T, 9.1, 9.6)) * 0.35;
    const shake = T > 6.0 && T < 8.6 ? Math.sin(T * 70) * 2 : 0;
    jet({ x: x + shake, y: y + shake, s: 0.95, rot, mood: T > 5.6 ? "grin" : "smile", look: T < 5.6 ? [0, -0.6] : [1, 0], blink: blinkAt(4.9), flame: T > 6.0 });
    label(110, 110, "Kemerini bağla,", "pilot!", 4.3, { size: 110 });
    [["3", 6.0], ["2", 6.6], ["1", 7.2]].forEach(([n, t0], i) => {
      const kk = seg(T, t0, t0 + 0.55); if (kk <= 0 || kk >= 1) return;
      const sc = lerp(2.2, 1, eOut(Math.min(1, kk * 3))), a = 1 - seg(T, t0 + 0.4, t0 + 0.55);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(1180, 460); ctx.scale(sc, sc); ctx.rotate(jit(3010 + i, 0.05));
      cut(tornCircle(110, 3011 + i, 4), { fill: [S.gold, S.orange, S.red][i], lift: 1.3 });
      ctx.fillStyle = "#fff"; ctx.font = `900 150px ${FONTS.rubik}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(n, 0, 10);
      ctx.restore();
    });
    { const kk = eBack(seg(T, 7.8, 8.1)) * (1 - seg(T, 9.3, 9.6)); if (kk > 0) { ctx.save(); ctx.translate(1180, 460); ctx.scale(kk, kk); ctx.rotate(-0.06); cut(tornRect(460, 170, 3020, 4), { fill: S.red, lift: 1.3 }); ctx.fillStyle = "#fff"; ctx.font = `900 110px ${FONTS.rubik}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("KALK!", 0, 8); ctx.restore(); } }
    if (T > 8.6) speedLines(26, 40, 1, seg(T, 8.6, 9.2) * 0.7, 1.4);
  }

  // ---------- S3: Logo (10.0 – 14.0) ----------
  const LETTERS = [["S", FONTS.slab, S.gold, S.deep, -0.07], ["K", FONTS.rubik, S.red, "#fff", 0.05], ["Y", FONTS.slab, P.paper, S.deep, -0.03], ["L", FONTS.rubik, S.orange, "#fff", 0.06], ["A", FONTS.slab, "#cfe3f7", S.deep, -0.05], ["N", FONTS.rubik, "#2c5a9e", "#fff", 0.04], ["C", FONTS.slab, S.gold, S.deep, -0.06], ["E", FONTS.rubik, S.red, "#fff", 0.05]];
  function logo(cx, cy, scale, t0, dt = 0.07) {
    const step = 180 * scale, n = LETTERS.length;
    LETTERS.forEach(([ch, font, bgc, fg, rot], i) => {
      const ta = t0 + i * dt, k = seg(T, ta, ta + 0.22); if (k <= 0) return;
      const sc = lerp(2.6, 1, eOut(k)) * scale, a = clamp(k * 4);
      const x = cx + (i - (n - 1) / 2) * step, y = cy + (i % 2 ? 12 : -8) * scale + jit(1500 + i, 1.5);
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot + (1 - eOut(k)) * 0.5 + jit(1510 + i, 0.012)); ctx.scale(sc, sc);
      cut(tornRect(160, 200, 1520 + i, 4.5), { fill: bgc, lift: 1.3 * (2 - eOut(k)), tx: i * 70, ty: i * 40 });
      ctx.fillStyle = fg; ctx.font = `${font === FONTS.rubik ? 900 : 400} ${font === FONTS.rubik ? 150 : 140}px ${font}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(ch, 0, 10);
      ctx.restore();
    });
  }
  function sceneReveal() {
    bg(S.deep, "deep");
    speedLines(30, 70, -1, 0.25, 0.8);
    text("Karşınızda:", 960, 215, { size: 96, start: 10.3, dur: 0.35, align: "center", color: S.gold, id: 90 });
    logo(960, 500, 1, 10.95);
    const tk = eBack(seg(T, 11.9, 12.2));
    if (tk > 0) { ctx.save(); ctx.translate(960, 770); ctx.rotate(-0.015); ctx.scale(tk, 1); cut(tornRect(1060, 110, 1601, 3), { fill: "rgba(246,236,200,0.95)", lift: 0.6, edgeW: 2 }); ctx.restore();
      text("Çevrimdışı savaş uçağı oyunu", 960, 793, { size: 66, font: FONTS.print, weight: 400, start: 12.0, dur: 0.8, align: "center", color: S.deep, id: 91 }); }
    const k = seg(T, 10.0, 14.0), a = -Math.PI * 0.9 + k * Math.PI * 2.2;
    jet({ x: 960 + Math.cos(a) * 820, y: 520 + Math.sin(a) * 380, s: 0.45, rot: a + Math.PI / 2, mood: "grin" });
    confetti(10.95, 70, 960, 600, 3, 1.2);
  }

  // ---------- F1: Görevler & kredi (14.0 – 18.0) ----------
  function credit(x, y, s, rot) {
    cut(tornCircle(40, 3160, 2), { x, y, s, rot, fill: S.gold, lift: 0.8, edgeW: 5, inner: () => { ctx.strokeStyle = "rgba(150,100,10,0.7)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 28, 0, 7); ctx.stroke(); ctx.fillStyle = "#9a6a10"; ctx.font = `900 40px ${FONTS.rubik}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("★", 0, 2); } });
  }
  function f1() {
    bg(S.mint, "mintS");
    label(110, 110, "Görev & Kredi", "görevi bitir, krediyi topla", 14.05);
    const km = eBack(seg(T, 14.15, 14.55));
    ctx.save(); ctx.translate(1240, 590 + (1 - km) * 800); ctx.rotate(0.02);
    cut(tornRect(900, 640, 3101, 4), { fill: "#efe9d6", lift: 1.4, inner: () => {
      ctx.strokeStyle = "rgba(120,140,100,0.35)"; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { ctx.beginPath(); for (let x = -460; x <= 460; x += 20) ctx.lineTo(x, -300 + i * 75 + Math.sin(x / 90 + i) * 18); ctx.stroke(); }
    } });
    tape(-380, -300, 150, -0.4, 1, 8); tape(380, -300, 150, 0.4, 1, 9);
    text("GÖREV HARİTASI", 0, -230, { size: 60, font: FONTS.print, weight: 400, align: "center", start: -9, id: 3102, color: S.deep });
    const pts = [[-330, 180], [-160, 40], [40, 120], [200, -60], [330, -140]];
    ctx.save(); ctx.setLineDash([22, 16]); pencil(pts, seg(T, 14.6, 16.6), { w: 6, c: S.red, id: 3103, passes: 1 }); ctx.restore();
    pts.slice(1).forEach(([px, py], i) => { const t0 = 15.0 + i * 0.42, kk = eBack(seg(T, t0, t0 + 0.25)); if (kk <= 0) return;
      ctx.save(); ctx.translate(px, py); ctx.scale(kk, kk); cut(tornCircle(34, 3110 + i, 2), { fill: i === 3 ? S.gold : "#fff", lift: 0.7, outline: S.red, olw: 4, oid: 3120 + i });
      if (i < 3) pencil([[-18, 0], [-6, 14], [22, -18]], seg(T, t0 + 0.2, t0 + 0.35), { w: 6, c: "#2b8a4b", id: 3130 + i }); else text("★", 0, 18, { size: 50, align: "center", color: S.red, id: 3140 });
      ctx.restore(); });
    const kp = seg(T, 14.6, 16.6); if (kp > 0 && kp < 1) { const f0 = kp * (pts.length - 1), idx = Math.min(pts.length - 2, Math.floor(f0)), f = f0 - idx; const px = lerp(pts[idx][0], pts[idx + 1][0], f), py = lerp(pts[idx][1], pts[idx + 1][1], f); jet({ x: px, y: py - 30, s: 0.22, rot: Math.atan2(pts[idx + 1][1] - pts[idx][1], pts[idx + 1][0] - pts[idx][0]), mood: "grin" }); }
    ctx.restore();
    for (let i = 0; i < 9; i++) { const t0 = 15.4 + i * 0.12, kk = seg(T, t0, t0 + 0.55); if (kk <= 0) continue; const x = 220 + hr(i + 3) * 460, y = lerp(-80, 760 + hr(i) * 160, eIn(kk)); credit(x, y, 1, T * 4 + i); }
    { const kk = eBack(seg(T, 16.4, 16.7)); if (kk > 0) { ctx.save(); ctx.translate(470, 530); ctx.rotate(-0.05); ctx.scale(kk, kk); cut(tornRect(360, 100, 3150, 3), { fill: S.gold, lift: 1.2 }); text("+ KREDİ", 0, 26, { size: 72, align: "center", color: S.deep, id: 3151 }); ctx.restore(); } }
  }

  // ---------- F2: Yükselt & yeni uçaklar (18.0 – 22.0) ----------
  function f2() {
    bg(S.peach, "peachS");
    label(110, 90, "Yükselt & Aç", "uçağını güçlendir, yenilerini aç", 18.05);
    const cards = [[S.steel, S.red, 18.25, false], ["#8fb3d9", S.gold, 18.45, false], ["#3a3f4a", S.orange, 18.65, true]];
    cards.forEach(([body, stripe, t0, locked], i) => {
      const kk = eBack(seg(T, t0, t0 + 0.35)); if (kk <= 0) return;
      ctx.save(); ctx.translate(400 + i * 560, 720 + (1 - kk) * 600); ctx.rotate((i - 1) * 0.03);
      cut(tornRect(500, 400, 3201 + i, 3), { fill: "#fffaf0", lift: 1.4 });
      tape(0, -196, 160, (i - 1) * 0.1, 1, i + 3);
      const unlock = locked ? seg(T, 20.6, 20.9) : 1;
      ctx.save(); if (locked) ctx.globalAlpha = 0.3 + 0.7 * unlock; jet({ x: 10, y: -40, s: 0.6, body, stripe, eyes: !locked || unlock > 0.5, mood: "grin", flame: false }); ctx.restore();
      if (locked) {
        const kl = seg(T, 20.6, 21.0);
        if (kl < 1) { ctx.save(); ctx.translate(0, -40 - kl * 200); ctx.rotate(kl * 1.5); ctx.globalAlpha = 1 - kl; ctx.strokeStyle = "#8a6d1e"; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, -40, 34, Math.PI, 0); ctx.lineTo(34, -10); ctx.moveTo(-34, -40); ctx.lineTo(-34, -10); ctx.stroke(); cut(tornRect(110, 90, 3220, 2), { fill: S.gold, lift: 0.9 }); ctx.restore(); }
        else { const kz = eBack(seg(T, 20.95, 21.25)); ctx.save(); ctx.translate(150, -150); ctx.scale(kz, kz); ctx.rotate(0.15); cut(tornRect(170, 64, 3221, 2), { fill: S.red, lift: 1 }); text("YENİ!", 0, 18, { size: 48, align: "center", color: "#fff", id: 3222 }); ctx.restore(); }
      }
      for (let b = 0; b < 5; b++) { const kb = seg(T, 19.2 + i * 0.15 + b * 0.12, 19.35 + i * 0.15 + b * 0.12), on = kb > 0 && b < 3 + (locked ? (unlock >= 1 ? 1 : -3) : i); ctx.fillStyle = on ? [S.red, S.orange, S.gold, "#7bc47f", "#4aa3df"][b] : "rgba(42,34,29,0.15)"; ctx.fillRect(-170 + b * 70, 150 - b * 6, 56, 26 + b * 6); }
      ctx.restore();
    });
  }

  // ---------- F3: Reklamsız & çevrimdışı (22.0 – 26.0) ----------
  function noSign(x, y, t0, inner, sd) {
    const k = eBack(seg(T, t0, t0 + 0.3)); if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    cut(tornCircle(150, sd, 3), { fill: "#fffaf0", lift: 1.4 });
    inner();
    ctx.strokeStyle = S.red; ctx.lineWidth = 22; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(0, 0, 130, 0, 7); ctx.stroke();
    const p = seg(T, t0 + 0.25, t0 + 0.45); if (p > 0) { ctx.beginPath(); ctx.moveTo(-92, -92); ctx.lineTo(-92 + 184 * p, -92 + 184 * p); ctx.stroke(); }
    ctx.restore();
  }
  function f3() {
    bg(S.lilac, "lilS");
    label(110, 100, "Reklam yok · Takip yok", "internet bile gerekmez", 22.05, { size: 96 });
    noSign(420, 640, 22.4, () => { ctx.fillStyle = S.deep; ctx.font = `900 110px ${FONTS.rubik}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("AD", 0, 8); }, 3301);
    noSign(960, 640, 23.1, () => { ctx.strokeStyle = S.deep; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-80, 0); ctx.quadraticCurveTo(0, -70, 80, 0); ctx.quadraticCurveTo(0, 70, -80, 0); ctx.stroke(); ctx.fillStyle = S.deep; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); }, 3302);
    noSign(1500, 640, 23.8, () => { ctx.strokeStyle = S.deep; ctx.lineWidth = 12; ctx.lineCap = "round"; [70, 46, 22].forEach(r => { ctx.beginPath(); ctx.arc(0, 40, r, -Math.PI * 0.78, -Math.PI * 0.22); ctx.stroke(); }); ctx.fillStyle = S.deep; ctx.beginPath(); ctx.arc(0, 40, 9, 0, 7); ctx.fill(); }, 3303);
    [["reklam", 420, 22.6], ["takip", 960, 23.3], ["internet", 1500, 24.0]].forEach(([w, x, t0], i) => text(w, x, 870, { size: 64, align: "center", start: t0, dur: 0.3, color: S.deep, id: 3310 + i }));
    { const kk = eBack(seg(T, 24.6, 24.9)); if (kk > 0) { ctx.save(); ctx.translate(960, 990); ctx.rotate(-0.03); ctx.scale(kk, kk); cut(tornRect(560, 96, 3320, 3), { fill: "#2b8a4b", lift: 1.2 }); text("sadece oyun ✓", 0, 24, { size: 66, align: "center", color: "#fff", id: 3321 }); ctx.restore(); } }
  }

  // ---------- F4: Akrobasi (26.0 – 28.0) ----------
  function f4() {
    skyBg(S.sky, "sky", 160);
    speedLines(24, 90, -1, 0.5, 1.2);
    const k = seg(T, 25.6, 28.0), a = -Math.PI / 2 + eIO(k) * Math.PI * 2, cx = 960, cy = 540, R = 300;
    const pts = []; for (let i = 0; i <= 40; i++) { const kk = Math.max(0, eIO(k) - 0.55 + i / 40 * 0.55), aa = -Math.PI / 2 + kk * Math.PI * 2; pts.push([cx + Math.cos(aa) * R * 1.4, cy + Math.sin(aa) * R]); }
    trail(pts, "#ffffff", 22);
    jet({ x: cx + Math.cos(a) * R * 1.4, y: cy + Math.sin(a) * R, s: 0.7, rot: a + Math.PI / 2, mood: "grin" });
    [[300, 300], [1620, 780]].forEach(([x, y], i) => jet({ x: x + Math.sin(T * 2 + i) * 30, y: y + Math.cos(T * 2 + i) * 20, s: 0.32, rot: -0.1, body: ["#8fb3d9", "#3a3f4a"][i], stripe: [S.gold, S.orange][i], mood: "grin" }));
  }
  // ---------- S6: Gün batımı (28.0 – 32.0) ----------
  function s6() {
    bg("#f7c79a", "dusk");
    ctx.save(); const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(120,90,180,0.35)"); gr.addColorStop(1, "rgba(255,160,90,0)"); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
    sun(960, 940, 1.6, T * 0.15);
    for (let i = 0; i < 4; i++) { const x = ((hr(50 + i) * 2400 - T * 40) % 2400 + 2400) % 2400 - 240; cloud(x, 680 + hr(i) * 160, 0.9, 4 + i, "#fde8d6"); }
    const k = seg(T, 28.0, 32.0);
    jet({ x: lerp(-300, 1500, eOut(k)), y: 560 + Math.sin(T * 2) * 20, s: 0.8, rot: -0.05 + Math.sin(T * 2) * 0.03, mood: "smile", blink: blinkAt(30.4) });
    text("Gökyüzü", 960, 220, { size: 140, start: 28.4, dur: 0.5, align: "center", color: S.deep, stroke: "#fbf6ea", strokeW: 14, id: 150 });
    text("artık senin.", 960, 370, { size: 120, start: 28.95, dur: 0.6, align: "center", color: S.red, stroke: "#fbf6ea", strokeW: 14, id: 151 });
  }
  // ---------- S7: Çağrı (32.0 – 38.0) ----------
  function s7() {
    bg(S.deep, "deep2");
    speedLines(24, 120, -1, 0.18, 0.6);
    logo(960, 230, 0.62, 32.1, 0.05);
    text("Çevrimdışı savaş uçağı oyunu", 960, 390, { size: 54, font: FONTS.print, weight: 400, align: "center", color: S.gold, start: 32.4, dur: 0.6, id: 162 });
    { const kp = eBack(seg(T, 32.55, 32.95)); if (kp > 0) { ctx.save(); ctx.translate(960, 600); ctx.rotate(0.015); ctx.scale(kp, kp); cut(tornRect(1060, 250, 2490, 5), { fill: P.paper, lift: 1.5 }); tape(-470, -110, 160, -0.6, 1, 2); tape(470, -112, 160, 0.6, 1, 6); ctx.restore(); } }
    const ks = seg(T, 33.0, 33.15), sc = T < 33.0 ? 0 : lerp(2.4, 1, eIn(ks)) + (T > 33.15 ? Math.sin((T - 33.15) * 30) * Math.exp(-(T - 33.15) * 9) * 0.04 : 0);
    if (T > 33.0) { ctx.save(); ctx.globalAlpha = clamp(ks * 3); stamp(960, 600, sc, -0.05, "REKLAMSIZ · ÇEVRİMDIŞI", S.red, 980, 170, 74); ctx.restore(); }
    const kb = eBack(seg(T, 34.0, 34.35));
    if (kb > 0) { ctx.save(); ctx.translate(960, 850); ctx.rotate(0.02); ctx.scale(kb, kb); cut(tornRect(560, 120, 2501, 3.5), { fill: S.gold, lift: 1.4 }); text("Hemen indir  →", 0, 30, { size: 84, align: "center", color: S.deep, id: 160 }); ctx.restore(); }
    const k = seg(T, 32.2, 33.4);
    if (k > 0) jet({ x: lerp(-400, 1640, eOut(k)), y: 920 - Math.sin(T * 3) * 10, s: 0.5, rot: -0.04, mood: T > 34.2 && T < 34.6 ? "o" : "grin" });
    confetti(34.0, 80, 960, 640, 9, 1.4);
    const fo = seg(T, 37.3, 38); if (fo > 0) { ctx.fillStyle = `rgba(10,18,40,${fo})`; ctx.fillRect(0, 0, W, H); }
  }

  // ================= ANA ÇİZİM =================
  function drawFrame(c, t) {
    ctx = c; T = t; BOIL = Math.floor(t * 12);
    if (!TEX.fiber) buildTextures();
    ctx.save();
    ctx.setTransform(c.canvas.width / W, 0, 0, c.canvas.height / H, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const sh = t > 8.6 && t < 10.0 ? 3.5 : 1.2;
    ctx.translate(W / 2 + jit(9001, sh), H / 2 + jit(9002, sh)); ctx.rotate(jit(9003, 0.0012)); ctx.scale(1.012, 1.012); ctx.translate(-W / 2, -H / 2);

    if (t < 4.0) s1();
    else if (t < 4.6) { s1(); sheetIn(4.0, 0.55, "d", s2, 11); }
    else if (t < 9.8) s2();
    else if (t < 10.25) { s2(); sheetIn(9.8, 0.4, "u", sceneReveal, 12); }
    else if (t < 13.5) sceneReveal();
    else if (t < 14.1) { sceneReveal(); sheetIn(13.5, 0.55, "r", f1, 13); }
    else if (t < 17.5) f1();
    else if (t < 18.1) { f1(); sheetIn(17.5, 0.55, "r", f2, 14); }
    else if (t < 21.5) f2();
    else if (t < 22.1) { f2(); sheetIn(21.5, 0.55, "r", f3, 15); }
    else if (t < 25.5) f3();
    else if (t < 26.1) { f3(); sheetIn(25.5, 0.55, "u", f4, 16); }
    else if (t < 27.6) f4();
    else if (t < 28.2) { f4(); sheetIn(27.6, 0.55, "l", s6, 17); }
    else if (t < 31.5) s6();
    else if (t < 32.1) { s6(); sheetIn(31.5, 0.55, "d", s7, 18); }
    else s7();

    ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = 0.08;
    const ox = Math.floor(hr(BOIL) * 256), oy = Math.floor(hr(BOIL + 5) * 256);
    ctx.drawImage(TEX.fiber, -ox, -oy, 1024, 1024); ctx.drawImage(TEX.fiber, 1024 - ox, -oy, 1024, 1024); ctx.drawImage(TEX.fiber, -ox, 1024 - oy, 1024, 1024); ctx.drawImage(TEX.fiber, 1024 - ox, 1024 - oy, 1024, 1024);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.restore();
  }

  g.PromoAnim = { drawFrame, W, H };
})(typeof window !== "undefined" ? window : globalThis);
