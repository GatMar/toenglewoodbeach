/**
 * Tropical Oasis Englewood — site interactions
 */
(function () {
  "use strict";

  const cfg = () => window.TropicalOasisConfig || {};
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.querySelector(".nav__menu");
  const sisterToggle = document.querySelector(".nav__sister-toggle");
  const sisterMenu = document.querySelector(".nav__sister-menu");
  const form = document.getElementById("inquiry-form");
  const formSuccess = document.getElementById("form-success");
  const formError = document.getElementById("form-error");
  const yearEl = document.getElementById("year");
  const displayEmailEls = document.querySelectorAll("[data-display-email]");
  const calendarRoot = document.getElementById("availability-calendar");
  let calendar = null;

  /* Footer year */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Public email alias */
  displayEmailEls.forEach((el) => {
    const email = cfg().displayEmail || "stay@toenglewoodbeach.com";
    if (el.tagName === "A") {
      el.href = "mailto:" + email;
      if (!el.textContent.trim()) el.textContent = email;
    } else {
      el.textContent = email;
    }
  });

  /* Sticky header shadow */
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile nav */
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      navMenu.classList.toggle("is-open", !open);
    });

    navMenu.querySelectorAll('.nav__links a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        navMenu.classList.remove("is-open");
      });
    });
  }

  /* Sister sites dropdown */
  if (sisterToggle && sisterMenu) {
    sisterToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = sisterToggle.getAttribute("aria-expanded") === "true";
      setSisterOpen(!open);
    });

    document.addEventListener("click", (e) => {
      if (!sisterToggle.contains(e.target) && !sisterMenu.contains(e.target)) {
        setSisterOpen(false);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setSisterOpen(false);
    });
  }

  function setSisterOpen(open) {
    if (!sisterToggle || !sisterMenu) return;
    sisterToggle.setAttribute("aria-expanded", String(open));
    sisterMenu.hidden = !open;
  }

  /* Placeholder restaurant menu links */
  document.querySelectorAll('a[data-placeholder="true"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      link.textContent = "Menu link coming soon";
      setTimeout(() => {
        link.textContent = "View menu →";
      }, 2000);
    });
  });

  /* ---------- Digital guestbook ---------- */
  const GB_KEY = "tropicalOasisGuestbook";
  const gbForm = document.getElementById("guestbook-form");
  const gbList = document.getElementById("guestbook-entries");
  const gbSuccess = document.getElementById("gb-success");
  const gbError = document.getElementById("gb-error");

  // Start empty — only real guest notes (no sample names)
  const SEED_GUESTBOOK = [];

  function loadGuestbookEntries() {
    try {
      const raw = localStorage.getItem(GB_KEY);
      if (!raw) {
        localStorage.setItem(GB_KEY, JSON.stringify(SEED_GUESTBOOK));
        return [];
      }
      const parsed = JSON.parse(raw);
      // Drop old demo seed entries if present
      const cleaned = (Array.isArray(parsed) ? parsed : []).filter(
        (e) => e && e.id && !String(e.id).startsWith("seed-")
      );
      return cleaned;
    } catch {
      return [];
    }
  }

  function saveGuestbookEntries(list) {
    localStorage.setItem(GB_KEY, JSON.stringify(list));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatGbDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  function renderGuestbook() {
    if (!gbList) return;
    const entries = loadGuestbookEntries().sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );
    if (!entries.length) {
      gbList.innerHTML = `<li class="guestbook__empty">Be the first to sign our guestbook.</li>`;
      return;
    }
    gbList.innerHTML = entries
      .map((e) => {
        const meta = [e.from, e.dates].filter(Boolean).join(" · ");
        return `
          <li class="guestbook__entry">
            <blockquote><p>“${escapeHtml(e.message)}”</p></blockquote>
            <footer>
              <strong>${escapeHtml(e.name)}</strong>
              ${meta ? `<span>${escapeHtml(meta)}</span>` : ""}
              <span>${escapeHtml(formatGbDate(e.createdAt))}</span>
            </footer>
          </li>`;
      })
      .join("");
  }

  if (gbForm) {
    renderGuestbook();
    gbForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (gbSuccess) gbSuccess.hidden = true;
      if (gbError) gbError.hidden = true;

      const data = new FormData(gbForm);
      const name = String(data.get("name") || "").trim();
      const from = String(data.get("from") || "").trim();
      const dates = String(data.get("dates") || "").trim();
      const message = String(data.get("message") || "").trim();

      if (!name || !message) {
        if (gbError) {
          gbError.hidden = false;
          gbError.textContent = "Please add your name and a message.";
        }
        return;
      }
      if (message.length > 800) {
        if (gbError) {
          gbError.hidden = false;
          gbError.textContent = "Please keep your note under 800 characters.";
        }
        return;
      }

      const entry = {
        id: "gb_" + Date.now().toString(36),
        name,
        from,
        dates,
        message,
        createdAt: new Date().toISOString(),
      };

      const list = loadGuestbookEntries();
      list.push(entry);
      saveGuestbookEntries(list);
      renderGuestbook();
      gbForm.reset();

      if (gbSuccess) {
        gbSuccess.hidden = false;
        gbSuccess.textContent =
          "Thank you! Your note is in the guestbook. Wishing you sandy days and easy evenings.";
      }

      // Optional: also email hosts when Web3Forms is configured
      const accessKey = (cfg().web3formsAccessKey || "").trim();
      if (accessKey && accessKey !== "YOUR_ACCESS_KEY") {
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: accessKey,
            subject: "Tropical Oasis guestbook: " + name,
            from_name: "Tropical Oasis Guestbook",
            name,
            message: [message, from && "From: " + from, dates && "Stay: " + dates]
              .filter(Boolean)
              .join("\n"),
          }),
        }).catch(() => {});
      }
    });
  }

  /* ---------- Gallery ---------- */
  async function loadGallery() {
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;

    let data = { images: [], videos: [] };
    try {
      const res = await fetch("data/gallery.json", { cache: "no-store" });
      if (res.ok) data = await res.json();
    } catch (err) {
      console.warn("Gallery JSON not loaded", err);
    }

    const items = [];
    (data.images || []).forEach((img) => {
      items.push({ type: "image", ...img });
    });
    (data.videos || []).forEach((vid) => {
      items.push({ type: "video", ...vid });
    });

    if (!items.length) {
      grid.innerHTML = `<p class="gallery-empty">Photos coming soon — export from Apple Photos into <code>assets/images/gallery/</code>.</p>`;
      return;
    }

    grid.innerHTML = items
      .map((item, i) => {
        if (item.type === "video") {
          return `
            <button type="button" class="gallery-item gallery-item--video" data-gallery-index="${i}" aria-label="${escapeAttr(item.caption || "Play video")}">
              <video src="${escapeAttr(item.src)}" ${item.poster ? `poster="${escapeAttr(item.poster)}"` : ""} muted preload="metadata" playsinline></video>
              <span class="gallery-item__play" aria-hidden="true">▶</span>
              ${item.caption ? `<span class="gallery-item__cap">${escapeHtml(item.caption)}</span>` : ""}
            </button>`;
        }
        return `
          <button type="button" class="gallery-item" data-gallery-index="${i}" aria-label="${escapeAttr(item.caption || item.alt || "View photo")}">
            <img src="${escapeAttr(item.src)}" alt="${escapeAttr(item.alt || "")}" loading="lazy" width="800" height="600" />
            ${item.caption ? `<span class="gallery-item__cap">${escapeHtml(item.caption)}</span>` : ""}
          </button>`;
      })
      .join("");

    setupLightbox(items);
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function setupLightbox(items) {
    let lb = document.getElementById("lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "lightbox";
      lb.className = "lightbox";
      lb.hidden = true;
      lb.innerHTML = `
        <div class="lightbox__backdrop" data-lb-close></div>
        <div class="lightbox__dialog" role="dialog" aria-modal="true" aria-label="Media viewer">
          <button type="button" class="lightbox__close" data-lb-close aria-label="Close">×</button>
          <button type="button" class="lightbox__nav lightbox__nav--prev" data-lb-prev aria-label="Previous">‹</button>
          <div class="lightbox__stage" data-lb-stage></div>
          <button type="button" class="lightbox__nav lightbox__nav--next" data-lb-next aria-label="Next">›</button>
          <p class="lightbox__caption" data-lb-caption></p>
        </div>`;
      document.body.appendChild(lb);
    }

    const stage = lb.querySelector("[data-lb-stage]");
    const caption = lb.querySelector("[data-lb-caption]");
    let index = 0;

    function open(i) {
      index = i;
      show();
      lb.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function close() {
      lb.hidden = true;
      document.body.style.overflow = "";
      stage.innerHTML = "";
    }

    function show() {
      const item = items[index];
      if (!item) return;
      if (item.type === "video") {
        stage.innerHTML = `<video src="${escapeAttr(item.src)}" ${item.poster ? `poster="${escapeAttr(item.poster)}"` : ""} controls playsinline autoplay></video>`;
      } else {
        stage.innerHTML = `<img src="${escapeAttr(item.src)}" alt="${escapeAttr(item.alt || "")}" />`;
      }
      caption.textContent = item.caption || item.alt || "";
    }

    document.getElementById("gallery-grid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-gallery-index]");
      if (!btn) return;
      open(Number(btn.getAttribute("data-gallery-index")));
    });

    lb.addEventListener("click", (e) => {
      if (e.target.closest("[data-lb-close]")) close();
      if (e.target.closest("[data-lb-prev]")) {
        index = (index - 1 + items.length) % items.length;
        show();
      }
      if (e.target.closest("[data-lb-next]")) {
        index = (index + 1) % items.length;
        show();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") {
        index = (index - 1 + items.length) % items.length;
        show();
      }
      if (e.key === "ArrowRight") {
        index = (index + 1) % items.length;
        show();
      }
    });
  }

  /* ---------- Inquiry form + calendar ---------- */
  function toInputDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function markInvalid(selector) {
    const el = form && form.querySelector(selector);
    if (el) el.classList.add("is-invalid");
  }

  function clearInvalid(formEl) {
    formEl.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
    if (formSuccess) formSuccess.hidden = true;
    if (formError) formError.hidden = true;
  }

  function setFormMessage(ok, text) {
    if (formSuccess) {
      formSuccess.hidden = !ok;
      if (ok && text) formSuccess.textContent = text;
    }
    if (formError) {
      formError.hidden = ok;
      if (!ok && text) formError.textContent = text;
    }
  }

  async function submitInquiry(payload) {
    const accessKey = (cfg().web3formsAccessKey || "").trim();
    const toEmail = (cfg().inquiryEmail || "").trim();

    if (!accessKey || accessKey === "YOUR_ACCESS_KEY") {
      // Local / not configured yet — still validate UX
      console.log("Tropical Oasis inquiry (email not configured yet):", payload);
      console.log("Set web3formsAccessKey + inquiryEmail in js/config.js — see GO-LIVE.md");
      return {
        ok: true,
        demo: true,
        message:
          "Thanks! Your inquiry looks good. Email delivery is not wired yet — add your Web3Forms key and me.com address in js/config.js (see GO-LIVE.md).",
      };
    }

    const body = {
      access_key: accessKey,
      subject: `Tropical Oasis inquiry: ${payload.checkin} → ${payload.checkout}`,
      from_name: "Tropical Oasis Website",
      name: payload.name,
      email: payload.email,
      phone: payload.phone || "",
      checkin: payload.checkin,
      checkout: payload.checkout,
      guests: payload.guests,
      pets: payload.pets,
      message: payload.message,
      cleaning_fee: payload.cleaningFee,
      note: payload.note,
      // Prefer delivering to configured inbox when Web3Forms supports it
      ...(toEmail && !toEmail.includes("YOURNAME") ? { email_to: toEmail } : {}),
    };

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Could not send inquiry. Please email us directly.");
    }
    return {
      ok: true,
      message: "Thanks! Your date inquiry was sent. We’ll reply by email to confirm availability.",
    };
  }

  if (form) {
    const checkin = form.querySelector("#checkin");
    const checkout = form.querySelector("#checkout");

    if (checkin) checkin.min = toInputDate(new Date());
    if (checkout) checkout.min = toInputDate(new Date());

    if (calendarRoot && window.AvailabilityCalendar) {
      calendar = AvailabilityCalendar.createCalendar(calendarRoot, {
        selectable: true,
        dualMonth: true,
        checkinInput: checkin,
        checkoutInput: checkout,
        onSelect: ({ start, end }) => {
          if (checkin && start) checkin.value = start;
          if (checkout) checkout.value = end || "";
          if (checkin) checkin.classList.remove("is-invalid");
          if (checkout && end) checkout.classList.remove("is-invalid");
        },
      });
    }

    // Keep calendar in sync if user types dates manually
    function syncCalFromInputs() {
      if (!calendar) return;
      const s = checkin && checkin.value;
      const e = checkout && checkout.value;
      if (s) calendar.setSelection(s, e || null);
    }
    if (checkin) checkin.addEventListener("change", syncCalFromInputs);
    if (checkout) checkout.addEventListener("change", syncCalFromInputs);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearInvalid(form);

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const checkInVal = String(data.get("checkin") || "");
      const checkOutVal = String(data.get("checkout") || "");
      const guests = Number(data.get("guests") || 0);
      const pets = String(data.get("pets") || "no");
      const message = String(data.get("message") || "").trim();
      const cleaningFee = Number(cfg().cleaningFee || 150);

      let valid = true;

      if (!name) {
        markInvalid("#name");
        valid = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        markInvalid("#email");
        valid = false;
      }
      if (!checkInVal) {
        markInvalid("#checkin");
        valid = false;
      }
      if (!checkOutVal || (checkInVal && checkOutVal <= checkInVal)) {
        markInvalid("#checkout");
        valid = false;
      }
      if (!guests || guests < 1) {
        markInvalid("#guests");
        valid = false;
      }

      if (valid && window.BookingsStore && !BookingsStore.isRangeAvailable(checkInVal, checkOutVal)) {
        markInvalid("#checkin");
        markInvalid("#checkout");
        setFormMessage(false, "Those dates include booked nights. Please pick available dates on the calendar.");
        valid = false;
      }

      if (!valid) return;

      const payload = {
        name,
        email,
        phone,
        checkin: checkInVal,
        checkout: checkOutVal,
        guests,
        pets,
        message,
        cleaningFee,
        note:
          pets === "yes"
            ? `Pet cleaning fee applies in addition to $${cleaningFee} standard cleaning fee`
            : `Standard $${cleaningFee} cleaning fee`,
      };

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        const result = await submitInquiry(payload);
        setFormMessage(true, result.message);
        form.reset();
        if (calendar) calendar.setSelection(null, null);
        if (checkin) checkin.min = toInputDate(new Date());
        formSuccess && formSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (err) {
        setFormMessage(
          false,
          err.message +
            (cfg().displayEmail
              ? ` Or email us at ${cfg().displayEmail}.`
              : "")
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send date inquiry";
        }
      }
    });
  }

  /* ---------- Reviews as posted on Airbnb / Vrbo ---------- */
  function stars(n) {
    const filled = Math.max(0, Math.min(5, Number(n) || 0));
    return "★".repeat(filled) + "☆".repeat(5 - filled);
  }

  function reviewSortKey(dateStr) {
    const months = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    };
    const s = String(dateStr || "");
    const m = s.match(/([A-Za-z]+)\s+(\d{4})/);
    if (m) return Number(m[2]) * 100 + (months[m[1].toLowerCase()] || 0);
    const y = s.match(/(\d{4})/);
    return y ? Number(y[1]) * 100 : 0;
  }

  async function loadReviews() {
    const root = document.getElementById("reviews-list");
    if (!root) return;

    let data = { reviews: [] };
    try {
      const res = await fetch("data/reviews.json", { cache: "no-store" });
      if (res.ok) data = await res.json();
    } catch (err) {
      console.warn("Reviews JSON not loaded", err);
    }

    const list = Array.isArray(data.reviews) ? data.reviews.slice() : [];
    list.sort((a, b) => reviewSortKey(b.date) - reviewSortKey(a.date));

    const stats = document.getElementById("review-stats");
    if (stats && list.length) stats.hidden = false;
    if (data.airbnbStats) {
      const r = document.getElementById("stat-airbnb-rating");
      const c = document.getElementById("stat-airbnb-count");
      if (r) r.textContent = String(data.airbnbStats.rating);
      if (c) c.textContent = data.airbnbStats.count + " reviews";
    }
    if (data.vrboStats) {
      const r = document.getElementById("stat-vrbo-rating");
      const c = document.getElementById("stat-vrbo-count");
      if (r) r.textContent = String(data.vrboStats.rating);
      if (c) {
        c.textContent = data.vrboStats.note
          ? data.vrboStats.note + " · " + data.vrboStats.count + " reviews"
          : data.vrboStats.count + " reviews";
      }
    }
    const airbnbLink = document.getElementById("stat-airbnb");
    const vrboLink = document.getElementById("stat-vrbo");
    if (airbnbLink && data.airbnbUrl) airbnbLink.href = data.airbnbUrl;
    if (vrboLink && data.vrboUrl) vrboLink.href = data.vrboUrl;

    function render(filter) {
      const rows = filter === "all" ? list : list.filter((item) => item.platform === filter);
      if (!rows.length) {
        root.innerHTML = `<p class="reviews-empty__hint">No reviews in this view yet.</p>`;
        return;
      }
      root.innerHTML = rows
        .map((item) => {
          const platform = item.platform === "Vrbo" ? "Vrbo" : "Airbnb";
          const slug = platform.toLowerCase();
          const href = item.listingUrl || (platform === "Vrbo" ? data.vrboUrl : data.airbnbUrl) || "#";
          return `
            <article class="review-shot review-shot--${slug}">
              <div class="review-shot__stamp">
                <span class="review-shot__platform">As posted on ${escapeHtml(platform)}</span>
                <span class="review-shot__date">${escapeHtml(item.date || "")}</span>
              </div>
              <div class="review-shot__stars" aria-label="${item.rating} out of 5 stars">${stars(item.rating)}</div>
              <blockquote><p>${escapeHtml(item.text)}</p></blockquote>
              <footer>
                <strong>${escapeHtml(item.name)}</strong>
                <span>Listed ${escapeHtml(item.date || "")}</span>
                <a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">View on ${escapeHtml(platform)}</a>
              </footer>
            </article>`;
        })
        .join("");
    }

    render("all");

    document.querySelectorAll("[data-review-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-review-filter]").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        render(btn.getAttribute("data-review-filter") || "all");
      });
    });
  }

  /* Boot bookings + gallery */
  async function boot() {
    loadGallery();
    loadReviews();

    if (!window.BookingsStore) return;
    BookingsStore.subscribe((ranges) => {
      if (calendar) calendar.setBookedFromRanges(ranges);
    });
    await BookingsStore.init();
  }

  boot().catch((err) => console.error(err));
})();
