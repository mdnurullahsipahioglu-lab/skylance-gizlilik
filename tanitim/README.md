# Skylance tanıtım filmi

38 saniyelik, el çizimi kolaj tarzında tanıtım filmi. Görüntü, müzik ve efektlerin hepsi JavaScript ile üretilir; dışarıdan resim ya da müzik dosyası yoktur. Seslendirme Piper TTS (tr_TR-fahrettin-medium) ile üretildi. Gizlilik sayfasına (`../index.html`) dokunmaz.

- `index.html` — tek dosyalık oynatıcı. Tarayıcıda açıp ▶'ye basmak yeterli (boşluk tuşu: durdur/devam).
- `skylance-tanitim.mp4` — yüksek kalite video (1920×1080, 30 fps, -14 LUFS, ~30 MB).
- `skylance-tanitim-paylasim.mp4` — WhatsApp/sosyal medya için küçük sürüm (~9 MB).

## Düzenleme

| Dosya | İçerik |
|---|---|
| `src/timeline.js` | Seslendirme metinleri/zamanları, efekt zamanları, müzik ayarı |
| `src/core.part.js` | Ortak çizim araçları (kâğıt doku, kalem, yazı, bant, makas…) |
| `src/scenes.part.js` | Bu filmin sahneleri ve karakteri |
| `src/audio.js` | Müzik, efekt sentezi ve miks |
| `src/vo/*.mp3` | Seslendirme kayıtları |

```sh
python3 tools/build.py                          # index.html'i yeniden üretir
node tools/export.js skylance-tanitim.mp4 30     # MP4 (Playwright + ffmpeg gerekir)
node tools/snap.js klasor 12.5 30               # belirli saniyelerden kare alır
```
