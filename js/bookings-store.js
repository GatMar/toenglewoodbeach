/**
 * Bookings store — loads/saves booked date ranges.
 * Modes: "local" (localStorage + static JSON seed) | "firebase" (shared)
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "tropicalOasisBookings";
  const listeners = new Set();

  let ranges = [];
  let ready = false;
  let firebaseDb = null;

  function config() {
    return global.TropicalOasisConfig || {};
  }

  function notify() {
    const snapshot = getRanges();
    listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (err) {
        console.error(err);
      }
    });
  }

  function normalizeRange(r) {
    if (!r || !r.start || !r.end) return null;
    const start = String(r.start).slice(0, 10);
    const end = String(r.end).slice(0, 10);
    if (end <= start) return null;
    return {
      id: r.id || uid(),
      start,
      end,
      note: String(r.note || "").trim(),
      status: r.status || "booked",
    };
  }

  function uid() {
    return "b_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  /** Inclusive start, exclusive end (checkout day is free for next guest). */
  function eachBookedNight(range, fn) {
    const cur = parseYMD(range.start);
    const end = parseYMD(range.end);
    if (!cur || !end) return;
    while (cur < end) {
      fn(toYMD(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }

  function parseYMD(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function toYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function getBookedSet(list) {
    const set = new Set();
    (list || ranges).forEach((r) => eachBookedNight(r, (day) => set.add(day)));
    return set;
  }

  function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
  }

  function isRangeAvailable(start, end, ignoreId) {
    if (!start || !end || end <= start) return false;
    return !ranges.some((r) => {
      if (ignoreId && r.id === ignoreId) return false;
      return rangesOverlap(start, end, r.start, r.end);
    });
  }

  async function loadFromStaticJson() {
    try {
      const res = await fetch("data/bookings.json", { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.ranges || []).map(normalizeRange).filter(Boolean);
    } catch {
      return [];
    }
  }

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return (data.ranges || []).map(normalizeRange).filter(Boolean);
    } catch {
      return null;
    }
  }

  function saveToLocalStorage(list) {
    const payload = {
      updatedAt: new Date().toISOString(),
      ranges: list,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  async function initFirebase() {
    const fb = config().firebase || {};
    if (!fb.databaseURL || !fb.apiKey) {
      throw new Error("Firebase is not configured in js/config.js");
    }
    if (!global.firebase) {
      throw new Error("Firebase SDK not loaded");
    }
    if (!global.firebase.apps.length) {
      global.firebase.initializeApp({
        apiKey: fb.apiKey,
        authDomain: fb.authDomain,
        databaseURL: fb.databaseURL,
        projectId: fb.projectId,
      });
    }
    firebaseDb = global.firebase.database();
    return new Promise((resolve, reject) => {
      const ref = firebaseDb.ref("bookings");
      ref.on(
        "value",
        (snap) => {
          const val = snap.val();
          if (val && Array.isArray(val.ranges)) {
            ranges = val.ranges.map(normalizeRange).filter(Boolean);
          } else if (val && typeof val === "object" && !Array.isArray(val)) {
            // object map of id -> range
            ranges = Object.keys(val)
              .map((k) => normalizeRange({ ...val[k], id: k }))
              .filter(Boolean);
          } else {
            ranges = [];
          }
          ready = true;
          notify();
          resolve(ranges);
        },
        reject
      );
    });
  }

  async function persistFirebase(list) {
    if (!firebaseDb) throw new Error("Firebase not initialized");
    await firebaseDb.ref("bookings").set({
      updatedAt: new Date().toISOString(),
      ranges: list,
    });
  }

  async function init() {
    const mode = config().storageMode || "local";

    if (mode === "firebase") {
      try {
        await initFirebase();
        return getRanges();
      } catch (err) {
        console.warn("Firebase unavailable, falling back to local storage:", err.message);
      }
    }

    const local = loadFromLocalStorage();
    if (local && local.length) {
      ranges = local;
    } else {
      ranges = await loadFromStaticJson();
      saveToLocalStorage(ranges);
    }
    ready = true;
    notify();
    return getRanges();
  }

  function getRanges() {
    return ranges
      .slice()
      .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  }

  async function setRanges(next) {
    ranges = next.map(normalizeRange).filter(Boolean);
    const mode = config().storageMode || "local";
    if (mode === "firebase" && firebaseDb) {
      await persistFirebase(ranges);
    } else {
      saveToLocalStorage(ranges);
      notify();
    }
    // firebase listener will notify on remote write
    if (!(mode === "firebase" && firebaseDb)) {
      /* already notified */
    }
    return getRanges();
  }

  async function addRange({ start, end, note }) {
    const next = normalizeRange({ start, end, note, status: "booked" });
    if (!next) throw new Error("Invalid date range");
    if (!isRangeAvailable(next.start, next.end)) {
      throw new Error("Those dates overlap an existing booking");
    }
    return setRanges([...ranges, next]);
  }

  async function removeRange(id) {
    return setRanges(ranges.filter((r) => r.id !== id));
  }

  function subscribe(fn) {
    listeners.add(fn);
    if (ready) fn(getRanges());
    return () => listeners.delete(fn);
  }

  function isReady() {
    return ready;
  }

  function isDateBooked(ymd) {
    return getBookedSet().has(ymd);
  }

  function exportJson() {
    return JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        ranges: getRanges(),
      },
      null,
      2
    );
  }

  global.BookingsStore = {
    init,
    getRanges,
    setRanges,
    addRange,
    removeRange,
    subscribe,
    isReady,
    isDateBooked,
    isRangeAvailable,
    getBookedSet,
    eachBookedNight,
    parseYMD,
    toYMD,
    exportJson,
  };
})(window);
