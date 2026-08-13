# Adding your real photos & videos

Your cottage media lives in Apple Photos right now. Export copies into this project, then list them in `data/gallery.json`.

## 1. Export from Apple Photos (Mac)

1. Open **Photos**
2. Select the cottage / beach shots and clips
3. **File → Export → Export Photos…** (or **Export Unmodified Original** for full quality)
4. For images: JPEG, large or actual size
5. For videos: original or 1080p MP4 if available

## 2. Drop files here

```
assets/images/gallery/   ← your photos (kitchen.jpg, porch.jpg, …)
assets/videos/           ← your videos (tour.mp4, beach-walk.mp4, …)
```

Tip: use short lowercase names with hyphens, e.g. `living-room.jpg`, `sunset-yard.mp4`.

## 3. Register them in `data/gallery.json`

```json
{
  "images": [
    {
      "src": "assets/images/gallery/living-room.jpg",
      "alt": "Living room with coastal light",
      "caption": "Living room"
    }
  ],
  "videos": [
    {
      "src": "assets/videos/cottage-tour.mp4",
      "poster": "assets/images/gallery/living-room.jpg",
      "caption": "Cottage tour"
    }
  ]
}
```

The site loads this file automatically. Keep the existing exterior/kitchen/etc. images as long as you like, or replace those files in `assets/images/` with real photos using the **same filenames** for an instant upgrade (no JSON edit needed for hero/about sections).

## 4. Quick win without renaming everything

Overwrite these placeholders with your real shots (same names):

| File | Best use |
|------|----------|
| `assets/images/exterior.jpg` | Hero / curb appeal |
| `assets/images/kitchen.jpg` | Kitchen island |
| `assets/images/dining.jpg` | Dining area |
| `assets/images/bedroom.jpg` | Bedroom |
| `assets/images/backyard.jpg` | Yard / BBQ |
| `assets/images/beach.jpg` | Nearby beach |

## Size tips

- Photos: aim under ~400–800 KB each (export “Large” is usually fine)
- Videos: prefer 1080p MP4 under ~25–40 MB for smooth loading on phones
