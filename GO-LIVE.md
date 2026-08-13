# Go live — Tropical Oasis (toenglewoodbeach.com)

Your site is a static HTML/CSS/JS project (same style as MariCooks / Florida Nature Prints).  
This checklist gets domain, email inquiries, shared calendar admin, and real photos online.

---

## 1. Put your me.com address in config

Edit **`js/config.js`**:

```js
inquiryEmail: "you@me.com",        // private inbox (not shown on the site)
displayEmail: "stay@toenglewoodbeach.com",  // public alias guests see
adminPin: "change-this-pin",       // shared with the other admin
```

Guests only see `displayEmail`. Inquiries are delivered to `inquiryEmail` via Web3Forms.

---

## 2. Wire the inquiry form → me.com (about 2 minutes)

1. Open [https://web3forms.com](https://web3forms.com)
2. Create a free access key using **your me.com address** as the destination email
3. Confirm the email if they send a verification
4. Paste the key into `js/config.js`:

```js
web3formsAccessKey: "your-key-here",
inquiryEmail: "you@me.com",
```

5. Submit a test inquiry from the site — it should land in me.com (check spam once)

**Public alias (optional but recommended)**  
At your domain registrar (where you bought `toenglewoodbeach.com`), set **email forwarding**:

| Alias | Forwards to |
|-------|-------------|
| `stay@toenglewoodbeach.com` | `you@me.com` |

That way the site can show a professional address while you keep using Apple Mail / me.com.

---

## 3. Shared admin calendar (you + one other person)

### Right now (works offline / demo)

- Open **`admin.html`**
- Enter the PIN from `js/config.js` (`adminPin`)
- Add check-in → check-out ranges after you confirm a guest
- Storage mode **`local`**: each browser has its own copy (fine for testing on one computer)

### For both admins on any phone (recommended for real use)

1. Create a free [Firebase](https://console.firebase.google.com/) project  
2. Enable **Realtime Database** (start in test mode, then lock down)  
3. Copy config values into `js/config.js`:

```js
storageMode: "firebase",
firebase: {
  apiKey: "...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
},
```

4. Suggested rules while you’re the only hosts (low-stakes availability data):

```json
{
  "rules": {
    "bookings": {
      ".read": true,
      ".write": true
    }
  }
}
```

> Note: the admin PIN only protects the UI. Anyone who finds `admin.html` could try to guess the PIN. Change the PIN, don’t publish it, and you can tighten Firebase rules later with Google sign-in if you want.

5. Both of you open: `https://toenglewoodbeach.com/admin.html` → same PIN → same live calendar.

**Workflow**

1. Guest selects free dates → sends inquiry  
2. Email arrives at me.com  
3. You reply / confirm stay  
4. Either admin marks those dates booked in **Admin**  
5. Public calendar updates for the next guest  

---

## 4. Connect the domain `toenglewoodbeach.com`

Same pattern as your other sites (GitHub Pages + CNAME):

1. Create a GitHub repo (e.g. `toenglewoodbeach` or `tropical-oasis-florida`)
2. Push this folder
3. **Settings → Pages →** deploy from `main` / root (or `/docs` if you prefer)
4. Repo already has a **`CNAME`** file with `toenglewoodbeach.com`
5. At your registrar, add DNS:

| Type | Name | Value |
|------|------|--------|
| `A` or `CNAME` | `@` / `www` | per GitHub Pages instructions |

GitHub’s current docs: [Configuring a custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

After DNS propagates, visit `https://toenglewoodbeach.com`.

---

## 5. Add real photos & videos from Apple Photos

See **`assets/MEDIA-README.md`**.

**Fastest path**

1. Export photos/videos from Photos app  
2. Overwrite placeholders in `assets/images/` (same filenames) for hero/about  
3. Drop extras in `assets/images/gallery/` and `assets/videos/`  
4. List them in **`data/gallery.json`**

---

## 6. Local preview

```bash
cd ~/tropical-oasis-florida
python3 -m http.server 8080
```

Open:

- Site: http://localhost:8080  
- Admin: http://localhost:8080/admin.html  

---

## 7. Security & privacy notes

- Do **not** put your real me.com address in visible HTML if you use the alias + Web3Forms  
- Change `adminPin` before sharing the admin link  
- `admin.html` is set to `noindex` so search engines are asked not to list it  
- Inquiry form is **request only** — no payments, no auto-booking  

---

## Quick file map

| File | Purpose |
|------|---------|
| `js/config.js` | Email, PIN, Firebase, fees |
| `data/bookings.json` | Seed / example booked ranges |
| `data/gallery.json` | Photo & video list |
| `admin.html` | Mark dates booked |
| `CNAME` | `toenglewoodbeach.com` |
| `assets/MEDIA-README.md` | Exporting from Photos |
