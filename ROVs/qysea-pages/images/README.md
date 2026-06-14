# W6 NAVI Images — Squarespace Upload Guide

## Files in this folder

| File | Used on | Section |
|---|---|---|
| `w6-hero.png` | w6-navi.html | Hero (split layout, right side) |
| `w6-front.png` | w6-navi.html | Intro split visual (sticky left panel) |
| `w6-dvl-sonar.png` | w6-navi.html | U-INS Navigation section (DVL visualization) |
| `w6-station-lock-diagram.png` | w6-navi.html | Mapping section (Q-DVL sonar diagram) |
| `w6-bathymetry.png` | w6-navi.html | Mapping section (bathymetric scan) |
| `w6-camera-fov.png` | w6-navi.html | Camera section (166° FOV diagram) |
| `w6-top-view.png` | w6-navi.html | Available for future use |
| `w6-station-lock.gif` | w6-navi.html | Q-DVL stability card (animated) |
| `w6-collision-avoidance.gif` | w6-navi.html | Collision avoidance card (animated) |
| `w6-altitude-tracking.gif` | w6-navi.html | Altitude tracking card (animated) |
| `w6-underwater-action.gif` | w6-navi.html | Available for future use |

## How to deploy to Squarespace

1. Go to **Squarespace > Pages > Design > Custom CSS** (or use a Code Block)
2. For each image file, upload it via **Pages > Media** or a **Gallery Block** to get a Squarespace CDN URL
3. The CDN URL will look like: `https://images.squarespace-cdn.com/content/v1/SITE-ID/.../filename.png`
4. In `w6-navi.html`, find each `src="images/FILENAME"` and replace with the full Squarespace CDN URL

## Local testing

The `src="images/..."` paths work when you open `w6-navi.html` directly from the `qysea-pages/` folder in a browser.
When embedded in Squarespace, **update the paths to full CDN URLs** before pasting the code block.
