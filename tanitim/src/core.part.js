/* Tanıtım filmi — el çizimi kolaj animasyonu (ortak çizim araçları + sahneler). drawFrame(ctx, t) saf fonksiyon: aynı t her zaman aynı kare. */
(function (g) {
  "use strict";
  const W = 1920, H = 1080;
  const P = {
    cream: "#f3ead3", paper: "#fffaf0", ink: "#2a221d", ink2: "#4a3d33",
    kraft: "#c8a273", kraftD: "#a8834f",
    green: "#164c3f", greenD: "#0e3a30", leaf: "#4f8a3a", leaf2: "#77a94a", lime: "#b9d36a", bush: "#3d7432",
    hazel: "#a2602f", hazelD: "#6d3b19", hazelL: "#c98448", base: "#e2c194",
    red: "#df4f3a", orange: "#f19a36", yellow: "#f5c842", sky: "#bfe0ea", blue: "#3d78a8", pink: "#f0a9a0",
    butter: "#f6e2a0", sage: "#d3e3bd", peach: "#f5c7b1", lav: "#d8cff0", bone: "#f1ece2"
  };

  // ---------------- yardımcılar ----------------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const eOut = x => 1 - Math.pow(1 - x, 3);
  const eIn = x => x * x * x;
  const eIO = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const eBack = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const eElastic = x => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
  function hr(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function RNG(s) { let t = s >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
  let T = 0, BOIL = 0, ctx = null;
  const jit = (id, a) => (hr(id * 17.31 + BOIL * 3.77) - 0.5) * 2 * a;   // stop-motion titreşimi (12 fps)

  // ---------------- dokular ----------------
  const TEX = {};
  function mkCanvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function buildTextures() {
    // kâğıt lifi dokusu (multiply ile bindirilir)
    const c = mkCanvas(512, 512), x = c.getContext("2d"), r = RNG(7);
    x.fillStyle = "#fff"; x.fillRect(0, 0, 512, 512);
    const id = x.getImageData(0, 0, 512, 512), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const v = 255 - r() * 38 * r(); d[i] = v; d[i + 1] = v - 2; d[i + 2] = v - 6; }
    x.putImageData(id, 0, 0);
    for (let i = 0; i < 900; i++) {
      x.strokeStyle = `rgba(${r() < 0.5 ? "120,95,60" : "255,255,255"},${0.05 + r() * 0.12})`; x.lineWidth = 0.6 + r();
      const px = r() * 512, py = r() * 512, a = r() * 6.28, l = 4 + r() * 22;
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + 0.5) * l / 2, py + Math.sin(a + 0.5) * l / 2, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
    }
    for (let i = 0; i < 40; i++) { const gr = x.createRadialGradient(r() * 512, r() * 512, 0, r() * 512, r() * 512, 30 + r() * 90); gr.addColorStop(0, "rgba(150,120,80,0.05)"); gr.addColorStop(1, "rgba(150,120,80,0)"); x.fillStyle = gr; x.fillRect(0, 0, 512, 512); }
    TEX.fiber = c;
    // kurşun kalem greni
    const c2 = mkCanvas(512, 512), x2 = c2.getContext("2d"), r2 = RNG(9);
    x2.fillStyle = "#fff";
    for (let i = 0; i < 2600; i++) { x2.globalAlpha = 0.25 + r2() * 0.75; x2.beginPath(); x2.arc(r2() * 512, r2() * 512, r2() < 0.92 ? 0.6 + r2() * 1.6 : 2 + r2() * 5, 0, 7); x2.fill(); }
    for (let i = 0; i < 40; i++) { x2.globalAlpha = 0.5; x2.lineWidth = 1 + r2() * 2; x2.strokeStyle = "#fff"; const px = r2() * 512, py = r2() * 512; x2.beginPath(); x2.moveTo(px, py); x2.lineTo(px + (r2() - 0.5) * 80, py + (r2() - 0.5) * 12); x2.stroke(); }
    TEX.grain = c2;
    TEX.fiberPat = null;
    // arka plan kâğıtları
    TEX.bg = {};
  }
  function bgPaper(color, key) {
    if (TEX.bg[key]) return TEX.bg[key];
    const c = mkCanvas(W, H), x = c.getContext("2d"), r = RNG(key.length * 31 + 5);
    x.fillStyle = color; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { const px = r() * W, py = r() * H, rad = 120 + r() * 420, gr = x.createRadialGradient(px, py, 0, px, py, rad); const dark = r() < 0.45; gr.addColorStop(0, dark ? "rgba(90,60,30,0.05)" : "rgba(255,255,240,0.14)"); gr.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = gr; x.fillRect(0, 0, W, H); }
    x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.3;
    for (let yy = 0; yy < H; yy += 512) for (let xx = 0; xx < W; xx += 512) x.drawImage(TEX.fiber, xx, yy);
    x.globalAlpha = 1; x.globalCompositeOperation = "source-over";
    const v = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(40,20,5,0.2)");
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    // ortalama rengi palet rengine geri çek (dokular kâğıdı griye boğmasın)
    const im = x.getImageData(0, 0, W, H), d = im.data, tgt = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)];
    const m = [0, 0, 0]; let n = 0; for (let i = 0; i < d.length; i += 4 * 97) { m[0] += d[i]; m[1] += d[i + 1]; m[2] += d[i + 2]; n++; }
    const k = m.map((v, i) => tgt[i] / (v / n) * 1.02);
    for (let i = 0; i < d.length; i += 4) { d[i] = Math.min(255, d[i] * k[0]); d[i + 1] = Math.min(255, d[i + 1] * k[1]); d[i + 2] = Math.min(255, d[i + 2] * k[2]); }
    x.putImageData(im, 0, 0);
    TEX.bg[key] = c; return c;
  }

  // ---------------- şekil üreticileri (önbellekli) ----------------
  const SH = new Map();
  function cached(key, fn) { if (!SH.has(key)) SH.set(key, fn()); return SH.get(key); }
  // yırtık kenarlı dikdörtgen: merkezde, w x h
  function tornRect(w, h, seed, rough = 5, step = 16) {
    return cached(`tr${w}|${h}|${seed}|${rough}`, () => {
      const r = RNG(seed), pts = [];
      const edge = (x0, y0, x1, y1, nx, ny) => {
        const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(L / step));
        let o = 0;
        for (let i = 0; i < n; i++) { const t = i / n; o = o * 0.55 + (r() - 0.5) * rough * 1.6; pts.push([lerp(x0, x1, t) + nx * o + (r() - 0.5) * 2, lerp(y0, y1, t) + ny * o]); }
      };
      const a = w / 2, b = h / 2;
      edge(-a, -b, a, -b, 0, -1); edge(a, -b, a, b, 1, 0); edge(a, b, -a, b, 0, 1); edge(-a, b, -a, -b, -1, 0);
      return pts;
    });
  }
  function tornCircle(rad, seed, rough = 4, ry) {
    return cached(`tc${rad}|${seed}|${rough}|${ry}`, () => {
      const r = RNG(seed), n = Math.max(18, Math.round(rad / 5)), pts = []; let o = 0; ry = ry || rad;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o = o * 0.5 + (r() - 0.5) * rough * 1.5; pts.push([Math.cos(a) * (rad + o), Math.sin(a) * (ry + o)]); }
      return pts;
    });
  }
  function blobShape(rad, seed, lumps = 5, amt = 0.18) {
    return cached(`bl${rad}|${seed}|${lumps}|${amt}`, () => {
      const r = RNG(seed), n = 48, ph = r() * 6, pts = [];
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + amt * Math.sin(a * lumps + ph) + (r() - 0.5) * 0.05; pts.push([Math.cos(a) * rad * k, Math.sin(a) * rad * k]); }
      return pts;
    });
  }
  function polyPath(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }

  // Kesilmiş kâğıt çiz: beyaz yırtık kenar + gölge + doku
  function cut(pts, o) {
    const x = o.x || 0, y = o.y || 0, s = o.s == null ? 1 : o.s, rot = o.rot || 0, lift = o.lift == null ? 1 : o.lift;
    if (s <= 0.001 || o.alpha === 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (o.sx || 1), s * (o.sy || 1));
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    polyPath(pts);
    if (lift > 0) { ctx.shadowColor = "rgba(45,25,8,0.33)"; ctx.shadowBlur = 10 * lift; ctx.shadowOffsetX = 4 * lift; ctx.shadowOffsetY = 7 * lift; }
    if (o.edge !== false) { ctx.lineJoin = "round"; ctx.lineWidth = o.edgeW || 7; ctx.strokeStyle = o.edgeC || "#fbf6ea"; ctx.stroke(); }
    ctx.fillStyle = o.fill || P.paper; ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.save(); ctx.clip();
    if (o.inner) o.inner();
    if (o.tex !== 0) { ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha *= (o.tex || 0.85); ctx.drawImage(TEX.fiber, -256 + (o.tx || 0) % 200, -256 + (o.ty || 0) % 200, 1024, 1024); }
    ctx.restore();
    if (o.outline) { ctx.strokeStyle = o.outline; ctx.lineWidth = o.olw || 2.5; ctx.globalAlpha *= 0.8; wobblyPoly(pts, o.oid || 1); }
    ctx.restore();
  }
  function wobblyPoly(pts, id) { ctx.beginPath(); pts.forEach((p, i) => { const px = p[0] + jit(id + i, 1.4), py = p[1] + jit(id + i + 99, 1.4); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.closePath(); ctx.stroke(); }

  // Kurşun kalem çizgisi: noktalar boyunca kısmi (prog) çizim, iki geçiş
  function pencil(pts, prog, o = {}) {
    if (prog <= 0 || pts.length < 2) return;
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const lim = L[L.length - 1] * clamp(prog);
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = o.c || P.ink;
    const passes = o.passes || 2, id = o.id || 1, a = o.j == null ? 1.6 : o.j;
    for (let p = 0; p < passes; p++) {
      ctx.lineWidth = (o.w || 4) * (p ? 0.55 : 1); ctx.globalAlpha = (o.alpha || 1) * (p ? 0.55 : 0.92);
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        let [px, py] = pts[i];
        if (L[i] > lim) { const k = (lim - L[i - 1]) / (L[i] - L[i - 1] || 1); px = lerp(pts[i - 1][0], px, k); py = lerp(pts[i - 1][1], py, k); }
        px += jit(id * 7 + i + p * 31, a); py += jit(id * 11 + i + p * 37, a);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        if (L[i] > lim) break;
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  function ellipsePts(cx, cy, rx, ry, turns = 1.08, start = -1.9, n = 48) { const a = []; for (let i = 0; i <= n; i++) { const t = start + i / n * Math.PI * 2 * turns; const k = 1 + 0.04 * Math.sin(i * 0.7); a.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]); } return a; }
  function linePts(x0, y0, x1, y1, n = 10, bow = 0) { const a = []; for (let i = 0; i <= n; i++) { const t = i / n; a.push([lerp(x0, x1, t) - (y1 - y0) * bow * Math.sin(Math.PI * t), lerp(y0, y1, t) + (x1 - x0) * bow * Math.sin(Math.PI * t)]); } return a; }

  // El yazısı: harf harf beliren, her harf hafif titreyen metin
  const FONTS = { hand: "'Caveat', cursive", handB: "'Caveat Brush', 'Caveat', cursive", print: "'Patrick Hand', 'Caveat', cursive", slab: "'Alfa Slab One', serif", rubik: "'Rubik', sans-serif" };
  function text(str, x, y, o = {}) {
    const size = o.size || 80, font = `${o.weight || 700} ${size}px ${o.font || FONTS.hand}`;
    ctx.save(); ctx.font = font; ctx.textBaseline = "alphabetic";
    const chars = [...str], ws = chars.map(c => ctx.measureText(c).width), tw = ws.reduce((a, b) => a + b, 0) * (o.track || 1);
    let cx = o.align === "center" ? x - tw / 2 : o.align === "right" ? x - tw : x;
    const start = o.start == null ? -9 : o.start, dur = o.dur == null ? 0.8 : o.dur, n = chars.length;
    for (let i = 0; i < n; i++) {
      const ta = start + (i / Math.max(1, n)) * dur, k = seg(T, ta, ta + 0.16);
      if (k > 0 && chars[i] !== " ") {
        const sc = o.pop === false ? 1 : eBack(k);
        ctx.save(); ctx.translate(cx + ws[i] / 2, y + jit(i * 3 + (o.id || 0), o.jy == null ? 1.6 : o.jy));
        ctx.rotate(jit(i * 5 + 1 + (o.id || 0), o.jr == null ? 0.035 : o.jr)); ctx.scale(sc, sc);
        ctx.globalAlpha *= clamp(k * 3);
        if (o.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = o.strokeW || 10; ctx.strokeStyle = o.stroke; ctx.strokeText(chars[i], -ws[i] / 2, 0); }
        ctx.fillStyle = o.color || P.ink; ctx.fillText(chars[i], -ws[i] / 2, 0);
        ctx.restore();
      }
      cx += ws[i] * (o.track || 1);
    }
    ctx.restore();
    return tw;
  }
  function measure(str, size, font, weight = 700) { ctx.save(); ctx.font = `${weight} ${size}px ${font || FONTS.hand}`; const w = [...str].reduce((a, c) => a + ctx.measureText(c).width, 0); ctx.restore(); return w; }

  // Bant parçası
  function tape(x, y, w, rot, alpha = 1, seed = 1) {
    const pts = cached(`tape${w}|${seed}`, () => { const r = RNG(seed), h = 46, a = w / 2, b = h / 2, p = []; for (let i = 0; i <= 6; i++) p.push([-a + (i / 6) * w, -b + (r() - 0.5) * 2]); for (let i = 0; i <= 5; i++) p.push([a + (i % 2 ? 5 : -2) + (r() - 0.5) * 3, -b + (i / 5) * h]); for (let i = 0; i <= 6; i++) p.push([a - (i / 6) * w, b + (r() - 0.5) * 2]); for (let i = 0; i <= 5; i++) p.push([-a + (i % 2 ? -5 : 2) + (r() - 0.5) * 3, b - (i / 5) * h]); return p; });
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= alpha;
    polyPath(pts); ctx.fillStyle = "rgba(246,236,200,0.72)"; ctx.shadowColor = "rgba(0,0,0,0.12)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2; ctx.fill(); ctx.shadowColor = "transparent";
    ctx.clip(); ctx.globalAlpha *= 0.5; ctx.globalCompositeOperation = "multiply"; ctx.drawImage(TEX.fiber, -200, -100, 600, 300);
    ctx.restore();
  }

  // ---------------- dekor parçaları ----------------
  function sun(x, y, s, rot) {
    if (s <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < 12; i++) { const a = rot + i / 12 * Math.PI * 2; pencil([[Math.cos(a) * 120, Math.sin(a) * 120], [Math.cos(a) * 165, Math.sin(a) * 165]], 1, { w: 7, c: P.orange, id: 800 + i }); }
    cut(tornCircle(100, 55, 5), { fill: P.yellow, rot: rot * 0.3, lift: 1, inner: () => { ctx.fillStyle = "rgba(241,154,54,0.35)"; ctx.beginPath(); ctx.arc(30, 30, 80, 0, 7); ctx.fill(); } });
    ctx.restore();
  }
  function cloud(x, y, s, sd = 3, c = "#ffffff") {
    if (s <= 0.01) return;
    const pts = cached("cloud" + sd, () => { const a = [], bumps = [[-90, 10, 55], [-40, -30, 65], [30, -40, 70], [90, -5, 55], [60, 35, 50], [-20, 40, 55], [-80, 40, 40]]; for (let i = 0; i < 120; i++) { const ang = i / 120 * Math.PI * 2; let best = 0; for (const [bx, by, br] of bumps) { const dx = Math.cos(ang), dy = Math.sin(ang), b = bx * dx + by * dy, cc = bx * bx + by * by - br * br, disc = b * b - cc; if (disc > 0) best = Math.max(best, b + Math.sqrt(disc)); } a.push([Math.cos(ang) * best, Math.sin(ang) * best * 0.8]); } return a; });
    cut(pts, { x, y, s, fill: c, lift: 0.9, tex: 0.5, outline: "rgba(42,34,29,0.55)", olw: 3, oid: sd * 7 });
  }
  function coin(x, y, s, rot = 0) {
    cut(tornCircle(38, 77, 2), { x, y, s, rot, fill: "#f2c14e", lift: 0.8, edgeW: 5, inner: () => { ctx.strokeStyle = "rgba(150,100,10,0.7)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.stroke(); ctx.fillStyle = "#9a6a10"; ctx.font = `700 44px ${FONTS.hand}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("₺", 0, 2); } });
  }
  function sticky(x, y, rot, s, label, c = P.yellow, sd = 5) {
    cut(tornRect(180, 170, sd, 2.5), { x, y, rot, s, fill: c, lift: 1, edgeW: 4, inner: () => { ctx.fillStyle = P.ink; ctx.font = `700 50px ${FONTS.hand}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, 0, 4); } });
  }
  function receipt(x, y, rot, s, lines, sd = 9) {
    const pts = cached("rcpt" + sd, () => { const a = [], w = 260, h = 380; for (let i = 0; i <= 13; i++) a.push([-w / 2 + i * w / 13, -h / 2 + (i % 2 ? 0 : 12)]); for (let i = 0; i <= 13; i++) a.push([w / 2 - i * w / 13, h / 2 + (i % 2 ? 0 : -14)]); return a; });
    cut(pts, { x, y, rot, s, fill: "#fdfdf8", lift: 1.2, edgeW: 3, inner: () => {
      ctx.fillStyle = "#3a3a44"; ctx.textAlign = "center"; ctx.font = `700 34px ${FONTS.print}`; ctx.fillText(lines[0], 0, -120);
      ctx.font = `400 26px ${FONTS.print}`; ctx.globalAlpha = 0.75;
      for (let i = 0; i < 4; i++) ctx.fillRect(-100, -80 + i * 34, 120 + hr(i + sd) * 60, 5);
      ctx.globalAlpha = 1; ctx.font = `700 54px ${FONTS.hand}`; ctx.fillText(lines[1], 0, 116);
      ctx.setLineDash([8, 7]); ctx.strokeStyle = "#555"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-110, 65); ctx.lineTo(110, 65); ctx.stroke(); ctx.setLineDash([]);
    } });
  }
  function notebook(x, y, rot, s, sd = 12) {
    cut(tornRect(430, 520, sd, 3), { x, y, rot, s, fill: "#fbfbf4", lift: 1.2, edgeW: 3, inner: () => {
      ctx.strokeStyle = "rgba(80,140,200,0.45)"; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(-215, -190 + i * 40); ctx.lineTo(215, -190 + i * 40); ctx.stroke(); }
      ctx.strokeStyle = "rgba(220,70,60,0.6)"; ctx.beginPath(); ctx.moveTo(-150, -260); ctx.lineTo(-150, 260); ctx.stroke();
      for (let i = 0; i < 7; i++) { ctx.fillStyle = "#c9b99a"; ctx.beginPath(); ctx.arc(-190, -220 + i * 72, 11, 0, 7); ctx.fill(); }
      ctx.fillStyle = "#30304a"; ctx.font = `700 46px ${FONTS.hand}`; ctx.textAlign = "left";
      ctx.fillText("Ali  — 3 gün", -130, -160); ctx.fillText("Ayşe — 2 gün?", -130, -80); ctx.fillText("Hasan  ...", -130, 0); ctx.fillText("mazot ödendi mi?", -130, 80); ctx.fillText("= ???", -130, 160);
    } });
    // karalanmış satır
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    pencil(linePts(-140, 6, 70, -8, 8, 0.02).concat(linePts(70, -8, -120, 12, 8, -0.02)).concat(linePts(-120, 12, 60, 2, 8, 0.02)), 1, { w: 5, c: "#30304a", id: 930 });
    ctx.restore();
  }
  function bubble(x, y, s, inner) {
    if (s <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    cloud(0, 0, 1.25, 8);
    [[-120, 150, 22], [-150, 200, 13]].forEach(([bx, by, br], i) => cut(tornCircle(br, 90 + i, 2), { x: bx, y: by, fill: "#fff", lift: 0.6, edgeW: 3, outline: "rgba(42,34,29,0.5)", oid: 950 + i }));
    if (inner) inner();
    ctx.restore();
  }
  function person(x, y, s, o) {
    if (s <= 0.01) return;
    ctx.save(); ctx.translate(x, y + Math.sin(T * 5 + o.ph) * 4); ctx.scale(s, s); ctx.rotate(Math.sin(T * 3 + o.ph) * 0.03);
    cut(tornRect(120, 150, o.sd, 3), { x: 0, y: 40, fill: o.shirt, lift: 1, edgeW: 5, sx: 1, inner: () => { ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(-60, 80, 120, 40); } });
    if (o.scarf) cut(tornCircle(60, o.sd + 2, 3, 62), { x: 0, y: -78, fill: o.scarf, lift: 0.6, edgeW: 4, inner: () => { ctx.fillStyle = "rgba(255,255,255,0.6)"; for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.arc(-48 + (i % 4) * 32, -48 + Math.floor(i / 4) * 32, 4, 0, 7); ctx.fill(); } } });
    cut(tornCircle(46, o.sd + 1, 2.5), { x: 0, y: -66, fill: o.skin, lift: 0.5, edgeW: 5 });
    if (o.scarf) cut(tornRect(104, 26, o.sd + 5, 2), { x: 0, y: -108, fill: o.scarf, lift: 0.3, edgeW: 3 });
    if (o.cap) { cut(tornRect(110, 34, o.sd + 3, 2), { x: 0, y: -112, fill: o.cap, lift: 0.5, edgeW: 3 }); cut(tornRect(70, 14, o.sd + 4, 1), { x: 44, y: -96, fill: o.cap, lift: 0.4, edgeW: 2 }); }
    ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(-15, -68, 5, 0, 7); ctx.arc(15, -68, 5, 0, 7); ctx.fill(); ctx.fillStyle = "rgba(240,120,110,0.5)"; ctx.beginPath(); ctx.arc(-28, -52, 8, 0, 7); ctx.arc(28, -52, 8, 0, 7); ctx.fill();
    ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -56, 13, 0.3, Math.PI - 0.3); ctx.stroke();
    ctx.restore();
  }
  function stamp(x, y, s, rot, label, c = P.red, w = 520, h = 150, fs = 92) {
    if (s <= 0.01) return;
    // damga ayrı katmanda hazırlanır; mürekkep boşlukları yalnız damgayı deler
    const img = cached(`stamp${label}|${c}|${w}|${h}|${fs}`, () => {
      const cv = mkCanvas(w + 40, h + 40), x = cv.getContext("2d");
      x.translate((w + 40) / 2, (h + 40) / 2); x.strokeStyle = c; x.lineWidth = 12;
      x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, 18); x.stroke();
      x.lineWidth = 4; x.beginPath(); x.roundRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 10); x.stroke();
      x.fillStyle = c; x.font = `900 ${fs}px ${FONTS.rubik}`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(label, 0, 6);
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "destination-out"; x.globalAlpha = 0.85;
      for (let yy = 0; yy < h + 40; yy += 512) for (let xx = 0; xx < w + 40; xx += 512) x.drawImage(TEX.grain, xx, yy);
      return cv;
    });
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= 0.92;
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }
  function phone(x, y, s, rot, screen) {
    if (s <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    cut(tornRect(300, 560, 141, 2.5), { fill: "#2f3540", lift: 1.4, edgeW: 6 });
    cut(tornRect(256, 470, 142, 1.5), { y: -6, fill: P.paper, lift: 0, edgeW: 2, inner: screen });
    ctx.fillStyle = "#555c66"; ctx.beginPath(); ctx.roundRect(-34, -262, 68, 10, 5); ctx.fill();
    ctx.restore();
  }
  function laptop(x, y, s, rot, screen) {
    if (s <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    cut(tornRect(620, 400, 151, 2.5), { y: -40, fill: "#2f3540", lift: 1.3, edgeW: 6 });
    cut(tornRect(570, 350, 152, 1.5), { y: -40, fill: P.paper, lift: 0, edgeW: 2, inner: screen });
    cut(tornRect(760, 46, 153, 2), { y: 182, fill: "#8d96a3", lift: 1, edgeW: 5 });
    ctx.restore();
  }
  // mini panel çizimi (uygulamanın sade temsili)
  function miniDash(w, h, p, big) {
    ctx.save();
    ctx.fillStyle = BRAND_C; ctx.fillRect(-w / 2, -h / 2, w, h * 0.13);
    ctx.fillStyle = "#fff"; ctx.font = `700 ${h * 0.075}px ${FONTS.print}`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(BRAND, -w / 2 + w * 0.06, -h / 2 + h * 0.066);
    const cards = big ? 4 : 2, cw = (w * 0.88 - (cards - 1) * w * 0.03) / cards;
    const cc = [P.leaf2, P.orange, P.blue, P.red];
    for (let i = 0; i < cards; i++) { const k = eOut(seg(p, i * 0.1, i * 0.1 + 0.4)); ctx.globalAlpha = k; ctx.fillStyle = cc[i]; ctx.beginPath(); ctx.roundRect(-w * 0.44 + i * (cw + w * 0.03), -h / 2 + h * 0.18, cw, h * 0.16, 8); ctx.fill(); }
    ctx.globalAlpha = 1;
    const bars = big ? 9 : 6, bw = w * 0.88 / bars;
    for (let i = 0; i < bars; i++) { const bh = h * 0.36 * (0.35 + 0.65 * hr(i + 3)) * eOut(seg(p, 0.2 + i * 0.05, 0.6 + i * 0.05)); ctx.fillStyle = i % 2 ? P.lime : P.leaf; ctx.fillRect(-w * 0.44 + i * bw + bw * 0.15, h * 0.4 - bh, bw * 0.7, bh); }
    ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * 0.44, h * 0.4); ctx.lineTo(w * 0.44, h * 0.4); ctx.stroke();
    ctx.restore();
  }

  // Başlık etiketi: yırtık beyaz kâğıt + bant + el yazısı
  function label(x, y, str, sub, t0, o = {}) {
    const k = eBack(seg(T, t0, t0 + 0.45)); if (k <= 0) return;
    const size = o.size || 104, tw = measure(str, size), w = Math.max(tw + 110, sub ? measure(sub, 56, FONTS.print, 400) + 90 : 0), h = sub ? size * 1.95 : size * 1.4;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2 + (1 - k) * -60); ctx.rotate((o.rot || -0.025) + (1 - k) * -0.15);
    cut(tornRect(Math.round(w / 10) * 10, Math.round(h / 10) * 10, o.sd || 201, 4), { fill: o.fill || P.paper, lift: 1.2, alpha: clamp(k * 2) });
    tape(-w / 2 + 40, -h / 2 + 6, 150, -0.5, clamp(k * 2), 3); tape(w / 2 - 40, -h / 2 + 8, 140, 0.45, clamp(k * 2), 4);
    text(str, -tw / 2, sub ? -h / 2 + size * 0.98 : size * 0.33, { size, start: t0 + 0.15, dur: 0.5, color: o.color || P.ink, id: o.sd || 0 });
    if (sub) text(sub, 0, -h / 2 + size * 1.62, { size: 56, font: FONTS.print, weight: 400, start: t0 + 0.45, dur: 0.5, color: P.ink2, align: "center", id: 40 });
    ctx.restore();
  }

  // Yeni sahne kâğıdı kayarak girer (yırtık ön kenar). dir: 'l','r','u','d'
  function sheetIn(t0, dur, dir, drawNew, sd = 1) {
    const p = eIO(seg(T, t0, t0 + dur));
    if (p <= 0) return false;
    if (p >= 1) { drawNew(); return true; }
    const edge = cached("edge" + sd, () => { const r = RNG(sd), a = []; let o = 0; for (let i = 0; i <= 60; i++) { o = o * 0.6 + (r() - 0.5) * 14; a.push(o); } return a; });
    ctx.save(); ctx.beginPath();
    const horiz = dir === "l" || dir === "r";
    const span = horiz ? W : H, other = horiz ? H : W, pos = p * (span + 80);
    const pts = [];
    for (let i = 0; i <= 60; i++) { const u = i / 60 * other, e = pos + edge[i]; pts.push(horiz ? [dir === "r" ? W - e : e, u] : [u, dir === "d" ? H - e : e]); }
    if (dir === "l") { ctx.moveTo(-10, -10); pts.forEach(q => ctx.lineTo(q[0], q[1])); ctx.lineTo(-10, H + 10); }
    if (dir === "r") { ctx.moveTo(W + 10, -10); pts.forEach(q => ctx.lineTo(q[0], q[1])); ctx.lineTo(W + 10, H + 10); }
    if (dir === "u") { ctx.moveTo(-10, -10); pts.forEach(q => ctx.lineTo(q[0], q[1])); ctx.lineTo(W + 10, -10); }
    if (dir === "d") { ctx.moveTo(-10, H + 10); pts.forEach(q => ctx.lineTo(q[0], q[1])); ctx.lineTo(W + 10, H + 10); }
    ctx.closePath();
    ctx.save(); ctx.shadowColor = "rgba(30,15,0,0.45)"; ctx.shadowBlur = 30; ctx.shadowOffsetX = dir === "l" ? 14 : dir === "r" ? -14 : 0; ctx.shadowOffsetY = dir === "u" ? 14 : dir === "d" ? -14 : 0; ctx.fillStyle = "#fbf6ea"; ctx.fill(); ctx.restore();
    ctx.clip();
    drawNew();
    ctx.restore();
    // beyaz yırtık kenar şeridi
    ctx.save(); ctx.strokeStyle = "#fbf6ea"; ctx.lineWidth = 9; ctx.lineJoin = "round"; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); ctx.restore();
    return true;
  }
  function bg(color, key) { ctx.drawImage(bgPaper(color, key), 0, 0); }

  // Konfeti (kâğıt parçaları)
  function confetti(t0, n, cx, cy, sd, spread = 1) {
    const dt = T - t0; if (dt < 0 || dt > 3.2) return;
    const cols = [P.yellow, P.red, P.orange, P.lime, P.sky, P.pink, "#fff"];
    for (let i = 0; i < n; i++) {
      const r = hr(sd + i * 3.1), r2 = hr(sd + i * 7.7), r3 = hr(sd + i * 1.3);
      const a = -Math.PI / 2 + (r - 0.5) * 2.6 * spread, v = 700 + r2 * 900;
      const x = cx + Math.cos(a) * v * dt * 0.9, y = cy + Math.sin(a) * v * dt + 900 * dt * dt;
      ctx.save(); ctx.translate(x, y); ctx.rotate(dt * (4 + r3 * 8) * (r > 0.5 ? 1 : -1)); ctx.scale(1, Math.cos(dt * 9 + i));
      ctx.globalAlpha = clamp((3.2 - dt) * 2); ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-9, -6, 18 + r2 * 10, 12); ctx.restore();
    }
  }
  function questionMark(x, y, s, id) { if (s <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(jit(id, 0.06)); text("?", 0, 0, { size: 150, font: FONTS.handB, weight: 400, color: P.red, stroke: "#fbf6ea", strokeW: 12, align: "center", id }); ctx.restore(); }

