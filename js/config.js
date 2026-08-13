/**
 * Tropical Oasis — easy settings
 * Edit this file for domain email, form delivery, admin PIN, and booking storage.
 *
 * GO-LIVE checklist is in GO-LIVE.md
 */
window.TropicalOasisConfig = {
  /* ---------- Public contact (shown on the website) ---------- */
  // Alias guests see (set domain email forwarding → your me.com inbox)
  displayEmail: "stay@toenglewoodbeach.com",
  // Optional phone shown on site (leave blank to hide)
  displayPhone: "",

  /* ---------- Inquiry form → your real inbox ---------- */
  // Where Web3Forms delivers messages (your private me.com address)
  // Example: "yourname@me.com"
  inquiryEmail: "YOURNAME@me.com",

  // Free access key from https://web3forms.com (takes ~1 minute)
  // Create key with the me.com address above as the destination.
  web3formsAccessKey: "",

  /* ---------- Admin calendar PIN ---------- */
  // Shared PIN for you + the other admin (change this!)
  // Used only in the browser UI — pair with Firebase for real multi-device sync.
  adminPin: "oasis2026",

  /* ---------- Bookings storage ---------- */
  // "local"  = browser only (demo; each device has its own calendar)
  // "firebase" = shared live calendar for both admins (recommended for go-live)
  storageMode: "local",

  // Firebase Realtime Database (only needed when storageMode is "firebase")
  // See GO-LIVE.md for the 5-minute setup.
  firebase: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
  },

  /* ---------- Property defaults ---------- */
  cleaningFee: 150,
  maxGuests: 8,
  siteName: "Tropical Oasis, Englewood Beach",
  domain: "toenglewoodbeach.com",
};
