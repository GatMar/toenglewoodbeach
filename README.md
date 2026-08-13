# Tropical Oasis Englewood

Warm, modern single-page website for **Tropical Oasis** — a cozy 2-bedroom beach cottage rental in Englewood, Florida.

**Domain:** [toenglewoodbeach.com](https://toenglewoodbeach.com)

## Quick start

```bash
cd ~/tropical-oasis-florida
python3 -m http.server 8080
```

- Site: http://localhost:8080  
- Admin (mark booked dates): http://localhost:8080/admin.html  

Or open `index.html` directly (calendar/gallery fetch best with a local server).

## What’s included

| Feature | How it works |
|---------|----------------|
| **Availability calendar** | Guests see booked nights and pick check-in / check-out |
| **Date inquiry form** | Sends to your private **me.com** inbox via Web3Forms |
| **Public email alias** | Site shows e.g. `stay@toenglewoodbeach.com` (forward to me.com) |
| **Admin page** | You + another host enter a PIN and mark ranges as booked |
| **Photo / video gallery** | Driven by `data/gallery.json` + files in `assets/` |
| **Sister sites** | MariCooks, Florida Nature Prints |

## Configure

Edit **`js/config.js`**:

- `inquiryEmail` — your private me.com address  
- `displayEmail` — public alias on the site  
- `web3formsAccessKey` — free key from [web3forms.com](https://web3forms.com)  
- `adminPin` — shared admin PIN  
- `storageMode` — `"local"` (demo) or `"firebase"` (shared live calendar)  

Full checklist: **[GO-LIVE.md](./GO-LIVE.md)**  
Media from Apple Photos: **[assets/MEDIA-README.md](./assets/MEDIA-README.md)**

## Stack

- Plain **HTML / CSS / JS** — no build step  
- Google Fonts: Fraunces + DM Sans  
- Optional Firebase Realtime Database for multi-admin sync  

## Project structure

```
tropical-oasis-florida/
├── index.html              # Public site
├── admin.html              # Hosts: mark dates booked
├── CNAME                   # toenglewoodbeach.com
├── GO-LIVE.md
├── css/styles.css
├── js/
│   ├── config.js           # ← edit me first
│   ├── bookings-store.js
│   ├── calendar.js
│   ├── main.js
│   └── admin.js
├── data/
│   ├── bookings.json
│   └── gallery.json
└── assets/
    ├── images/
    ├── videos/
    └── MEDIA-README.md
```

## Notes

- Inquiry does **not** confirm a reservation or take payment  
- Standard cleaning fee: **$150**; pets welcome with extra cleaning fee  
- Default admin PIN is in `config.js` — change before go-live  
