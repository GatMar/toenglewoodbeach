/**
 * Admin — mark date ranges as booked (shared PIN)
 */
(function () {
  "use strict";

  const cfg = () => window.TropicalOasisConfig || {};
  const SESSION_KEY = "tropicalOasisAdminOk";

  const loginView = document.getElementById("admin-login");
  const appView = document.getElementById("admin-app");
  const pinForm = document.getElementById("pin-form");
  const pinInput = document.getElementById("admin-pin");
  const pinError = document.getElementById("pin-error");
  const logoutBtn = document.getElementById("admin-logout");
  const addForm = document.getElementById("add-booking-form");
  const listEl = document.getElementById("bookings-list");
  const statusEl = document.getElementById("admin-status");
  const exportBtn = document.getElementById("export-json");
  const modeLabel = document.getElementById("storage-mode-label");
  const calRoot = document.getElementById("admin-calendar");

  let calendar = null;

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.hidden = !msg;
    statusEl.textContent = msg || "";
    statusEl.className = "admin-status" + (type ? " admin-status--" + type : "");
  }

  function isAuthed() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function setAuthed(ok) {
    if (ok) sessionStorage.setItem(SESSION_KEY, "1");
    else sessionStorage.removeItem(SESSION_KEY);
  }

  function showApp(show) {
    if (loginView) loginView.hidden = show;
    if (appView) appView.hidden = !show;
  }

  function formatRange(r) {
    const opts = { month: "short", day: "numeric", year: "numeric" };
    const s = BookingsStore.parseYMD(r.start);
    const e = BookingsStore.parseYMD(r.end);
    const a = s ? s.toLocaleDateString(undefined, opts) : r.start;
    const b = e ? e.toLocaleDateString(undefined, opts) : r.end;
    return `${a} → ${b}`;
  }

  function nights(r) {
    const s = BookingsStore.parseYMD(r.start);
    const e = BookingsStore.parseYMD(r.end);
    if (!s || !e) return 0;
    return Math.round((e - s) / 86400000);
  }

  function renderList(ranges) {
    if (!listEl) return;
    if (!ranges.length) {
      listEl.innerHTML = `<li class="admin-empty">No booked ranges yet. Add one above.</li>`;
      return;
    }
    listEl.innerHTML = ranges
      .map(
        (r) => `
      <li class="admin-booking" data-id="${escapeAttr(r.id)}">
        <div>
          <strong>${escapeHtml(formatRange(r))}</strong>
          <span class="admin-booking__meta">${nights(r)} night${nights(r) === 1 ? "" : "s"}${
          r.note ? " · " + escapeHtml(r.note) : ""
        }</span>
        </div>
        <button type="button" class="btn btn--danger-ghost btn--sm" data-remove="${escapeAttr(r.id)}">Remove</button>
      </li>`
      )
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function onBookingsChange(ranges) {
    renderList(ranges);
    if (calendar) calendar.setBookedFromRanges(ranges);
  }

  if (pinForm) {
    pinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pin = String(pinInput.value || "");
      if (pin === String(cfg().adminPin || "")) {
        setAuthed(true);
        pinError.hidden = true;
        pinInput.value = "";
        showApp(true);
        setStatus("Signed in. Changes save to " + (cfg().storageMode === "firebase" ? "Firebase (shared)." : "this browser (local)."), "ok");
      } else {
        pinError.hidden = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      setAuthed(false);
      showApp(false);
      setStatus("");
    });
  }

  if (listEl) {
    listEl.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      const id = btn.getAttribute("data-remove");
      if (!confirm("Remove this booked range?")) return;
      try {
        await BookingsStore.removeRange(id);
        setStatus("Booking removed.", "ok");
      } catch (err) {
        setStatus(err.message || "Could not remove.", "error");
      }
    });
  }

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(addForm);
      const start = String(data.get("start") || "");
      const end = String(data.get("end") || "");
      const note = String(data.get("note") || "").trim();
      try {
        await BookingsStore.addRange({ start, end, note });
        addForm.reset();
        setStatus("Booked range added.", "ok");
      } catch (err) {
        setStatus(err.message || "Could not add booking.", "error");
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const blob = new Blob([BookingsStore.exportJson()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bookings.json";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("Downloaded bookings.json — you can replace data/bookings.json if you want a static seed.", "ok");
    });
  }

  async function boot() {
    if (modeLabel) {
      modeLabel.textContent =
        (cfg().storageMode || "local") === "firebase"
          ? "Shared (Firebase)"
          : "Local browser only";
    }

    // Min dates on add form
    const startInput = document.getElementById("booking-start");
    const endInput = document.getElementById("booking-end");
    const today = BookingsStore.toYMD(new Date());
    if (startInput) startInput.min = today;
    if (endInput) endInput.min = today;

    if (calRoot && window.AvailabilityCalendar) {
      calendar = AvailabilityCalendar.createCalendar(calRoot, {
        selectable: false,
        dualMonth: true,
      });
    }

    BookingsStore.subscribe(onBookingsChange);
    await BookingsStore.init();

    if (isAuthed()) showApp(true);
    else showApp(false);
  }

  boot().catch((err) => {
    console.error(err);
    setStatus("Could not load bookings: " + err.message, "error");
  });
})();
