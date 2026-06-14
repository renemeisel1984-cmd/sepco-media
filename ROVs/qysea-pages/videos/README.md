# QYSEA Videos — sourced from qysea.com (official)

All clips were downloaded fresh from QYSEA's official CDN (`hwres.qysea.com` / `imgs.qysea.com`).

| File | Used on | Section | Playback | Source URL |
|---|---|---|---|---|
| `index-hero.mp4` | index.html | Hero (split, right side) | autoplay · muted · loop | imgs.qysea.com/qiyuan/2025/10/27/79h9vEhEn24W5.mp4 |
| `e-master-promo.mp4` | e-master.html | "See It In Action" band after hero | click-to-play (controls) | hwres.qysea.com/QYSEA2.0/E-MASTER/E-MASTER-EN.mp4 |
| `v-evo-promo.mp4` | v-evo.html | "See It In Action" band after hero | click-to-play (controls) | hwres.qysea.com/v-evo/video/Promo-V-EVO-ENG5.mp4 |
| `v6-expert-promo.mp4` | v6-expert.html | "See It In Action" band after hero | click-to-play (controls) | imgs.qysea.com/qiyuan/2025/04/01/aJhg0VaF7EmYl.mp4 |
| `w6-promo.mp4` | w6-navi.html | "See It In Action" band after hero | click-to-play (controls) | imgs.qysea.com/qiyuan/2025/04/01/EgUiSPKDRuD4V.mp4 |
| `e-go-hero.mp4` | e-go.html | Cinematic loop band after hero | autoplay · muted · loop | hwres.qysea.com/e-go/videos/ego-video1.mp4 |
| `v6plus-ar-scaler.mp4` | v6-plus.html | Measurement section (AR Ruler) | autoplay · muted · loop | hwres.qysea.com/FIFISH_V6PLUS/V6Plus_AR_Scaler_en_1080.mp4 |
| `v6plus-laser-ruler.mp4` | v6-plus.html | Measurement section (Laser Scaler) | autoplay · muted · loop | hwres.qysea.com/FIFISH_V6PLUS/V6Plus_Laser_Ruler_en_1080.mp4 |
| `v6plus-vr-tracking.mp4` | v6-plus.html | VR Control band | autoplay · muted · loop | hwres.qysea.com/FIFISH_V6PLUS/V6Plus_Vr_Head_Tracking_en_1080.mp4 |

## Deploying to Squarespace

Same workflow as `images/` — local relative paths (`videos/...mp4`) work when opening the files directly.
When embedding in Squarespace, upload each MP4 (Pages > Media, or a File/Video block) to get a CDN URL,
then replace each `<source src="videos/FILENAME">` with the full CDN URL. Keep the `poster="images/..."`
attribute pointing at the corresponding Squarespace image CDN URL.

Notes:
- Click-to-play promos use `preload="none"` so the (larger) MP4 only downloads when the visitor presses play.
- Autoplay loops are `muted` + `playsinline` so they autoplay on mobile and desktop without sound.
- X1 has no official product video on qysea.com, so x1.html remains image-based.
