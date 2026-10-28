/* Skylance tanıtım — ortak zaman çizelgesi (ses + görüntü aynı tablodan beslenir) */
(function (g) {
  "use strict";
  const BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4;
  const DUR = 38;

  // Seslendirme: [id, başlangıç sn, ekranda gösterilecek metin]
  const VO = [
    ["k01", 0.8, "Gökyüzü... seni bekliyor."],
    ["k02", 4.3, "Kemerini bağla, pilot!"],
    ["k03", 10.4, "Karşınızda: Skylance!"],
    ["k04", 14.5, "Görevleri tamamla, kredi kazan!"],
    ["k05", 18.3, "Uçağını yükselt, yeni savaş uçaklarını aç, hadi!"],
    ["k06", 22.35, "Reklam yok, takip yok. İnternet bile gerekmez."],
    ["k07", 28.4, "Gökyüzü artık senin."],
    ["k08", 32.6, "Hemen indir, havalan!"]
  ];

  // Efektler: [zaman, tür, kazanç, ek]
  const SFX = [
    [0.05, "whoosh", 0.3], [0.25, "pop", 0.3, 1.3], [0.85, "scribble", 0.22, 0.6], [1.5, "scribble", 0.22, 0.6],
    [2.3, "jet", 0.5, 1.3],
    [4.0, "whoosh", 0.4], [4.3, "tape", 0.3],
    [6.0, "stamp", 0.45, 1.3], [6.6, "stamp", 0.45, 1.15], [7.2, "stamp", 0.5, 1.0], [7.8, "stamp", 0.6, 0.8],
    [6.0, "jet", 0.18, 2.6], [8.6, "jet", 0.55, 1.6],
    [9.8, "whoosh", 0.4], [10.0, "tear", 0.3],
    [10.95, "stamp", 0.35, 1.2], [11.02, "stamp", 0.3, 1.1], [11.09, "stamp", 0.35, 1.25], [11.16, "stamp", 0.3, 0.95], [11.23, "stamp", 0.35, 1.15], [11.3, "stamp", 0.3, 1.05], [11.37, "stamp", 0.35, 0.9], [11.44, "stamp", 0.4, 1.1],
    [10.95, "sparkle", 0.3], [11.9, "tape", 0.3], [12.6, "jet", 0.25, 1.2],
    [13.5, "whoosh", 0.4],
    [14.15, "slide", 0.3], [14.6, "scribble", 0.18, 2.0], [15.0, "pop", 0.2, 1.0], [15.42, "pop", 0.2, 1.1], [15.84, "pop", 0.2, 1.2], [16.26, "pop", 0.2, 1.4],
    [15.5, "ching", 0.2], [16.0, "ching", 0.18], [16.4, "pop", 0.3, 1.3],
    [17.5, "whoosh", 0.4],
    [18.25, "slide", 0.25], [18.45, "slide", 0.25], [18.65, "slide", 0.25], [19.2, "tick", 0.25], [19.5, "tick", 0.25], [19.8, "tick", 0.25], [20.6, "click", 0.45], [20.95, "sparkle", 0.3],
    [21.5, "whoosh", 0.4],
    [22.4, "pop", 0.25, 0.9], [23.1, "pop", 0.25, 1.0], [23.8, "pop", 0.25, 1.1], [24.6, "ding", 0.3],
    [25.5, "whoosh", 0.4], [25.7, "jet", 0.45, 2.2],
    [27.6, "whoosh", 0.4],
    [28.4, "scribble", 0.2, 0.6], [28.95, "scribble", 0.2, 0.7],
    [31.5, "whoosh", 0.45],
    [32.1, "slide", 0.35], [32.2, "jet", 0.35, 1.3],
    [33.15, "stamp", 0.7, 0.8],
    [34.0, "sparkle", 0.4], [34.05, "boing", 0.3]
  ];

  // Müzik: daha hızlı ve maceracı; Re minör renkli akorlar, sert davul
  const MUSIC = {
    key: 2, drive: true, trombone: false, grooveEnd: 14,
    prog: ["Dm", "Bb", "F", "C"], intro: ["F", "Bb"], chaos: ["Dm", "C"], brk: ["Bb", "C"],
    theme: [
      [[0, 74, .5], [.5, 77, .5], [1, 81, 1], [2, 79, .5], [2.5, 77, .5], [3, 76, 1]],
      [[0, 74, .75], [.75, 77, .25], [1, 77, 1], [2, 79, .5], [2.5, 81, .5], [3, 82, 1]],
      [[0, 81, .5], [.5, 79, .5], [1, 77, 1], [2, 76, .5], [2.5, 77, .5], [3, 72, 1]],
      [[0, 76, .5], [.5, 77, .5], [1, 79, 1.5], [2.5, 76, .5], [3, 72, 1]]
    ]
  };

  g.TL = { BPM, BEAT, BAR, DUR, VO, SFX, MUSIC };
})(typeof window !== "undefined" ? window : globalThis);
