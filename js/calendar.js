/**
 * Interactive availability calendar
 * - Shows booked nights
 * - Lets guests select check-in / check-out range
 * - Writes selection into #checkin / #checkout when present
 */
(function (global) {
  "use strict";

  const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function todayYMD() {
    return BookingsStore.toYMD(new Date());
  }

  function createCalendar(root, options) {
    const opts = Object.assign(
      {
        selectable: true,
        dualMonth: true,
        onSelect: null,
        checkinInput: null,
        checkoutInput: null,
      },
      options || {}
    );

    let view = new Date();
    view.setDate(1);
    view.setHours(0, 0, 0, 0);

    let selectStart = null;
    let selectEnd = null;
    let bookedSet = new Set();

    root.classList.add("cal");
    root.innerHTML = `
      <div class="cal__toolbar">
        <button type="button" class="cal__nav" data-cal-prev aria-label="Previous month">‹</button>
        <div class="cal__titles" data-cal-titles></div>
        <button type="button" class="cal__nav" data-cal-next aria-label="Next month">›</button>
      </div>
      <div class="cal__months" data-cal-months></div>
      <div class="cal__legend">
        <span><i class="cal__swatch cal__swatch--available"></i> Available</span>
        <span><i class="cal__swatch cal__swatch--booked"></i> Booked</span>
        <span><i class="cal__swatch cal__swatch--selected"></i> Your dates</span>
      </div>
      <p class="cal__hint" data-cal-hint>Select check-in, then check-out on the calendar.</p>
    `;

    const monthsEl = root.querySelector("[data-cal-months]");
    const titlesEl = root.querySelector("[data-cal-titles]");
    const hintEl = root.querySelector("[data-cal-hint]");

    root.querySelector("[data-cal-prev]").addEventListener("click", () => {
      view.setMonth(view.getMonth() - 1);
      render();
    });
    root.querySelector("[data-cal-next]").addEventListener("click", () => {
      view.setMonth(view.getMonth() + 1);
      render();
    });

    function syncInputs() {
      if (opts.checkinInput) opts.checkinInput.value = selectStart || "";
      if (opts.checkoutInput) opts.checkoutInput.value = selectEnd || "";
    }

    function setHint(text) {
      if (hintEl) hintEl.textContent = text;
    }

    function selectionBlocked(start, end) {
      if (!start || !end) return false;
      const cur = BookingsStore.parseYMD(start);
      const last = BookingsStore.parseYMD(end);
      if (!cur || !last) return true;
      while (cur < last) {
        if (bookedSet.has(BookingsStore.toYMD(cur))) return true;
        cur.setDate(cur.getDate() + 1);
      }
      return false;
    }

    function onDayClick(ymd, disabled) {
      if (!opts.selectable || disabled) return;

      if (!selectStart || (selectStart && selectEnd)) {
        selectStart = ymd;
        selectEnd = null;
        setHint("Nice — now pick your check-out date.");
      } else if (ymd === selectStart) {
        selectStart = null;
        selectEnd = null;
        setHint("Select check-in, then check-out on the calendar.");
      } else if (ymd < selectStart) {
        selectStart = ymd;
        selectEnd = null;
        setHint("Check-in updated — now pick check-out.");
      } else {
        if (selectionBlocked(selectStart, ymd)) {
          setHint("Those dates include a booked night. Please choose another range.");
          selectStart = null;
          selectEnd = null;
        } else {
          selectEnd = ymd;
          setHint(`Selected ${formatNice(selectStart)} → ${formatNice(selectEnd)}.`);
        }
      }

      syncInputs();
      render();
      if (typeof opts.onSelect === "function") {
        opts.onSelect({ start: selectStart, end: selectEnd });
      }
    }

    function formatNice(ymd) {
      const d = BookingsStore.parseYMD(ymd);
      if (!d) return ymd;
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    function dayClasses(ymd, inMonth) {
      const classes = ["cal__day"];
      if (!inMonth) classes.push("is-outside");
      const today = todayYMD();
      if (ymd === today) classes.push("is-today");
      if (ymd < today) classes.push("is-past");
      if (bookedSet.has(ymd)) classes.push("is-booked");

      if (selectStart && ymd === selectStart) classes.push("is-range-start", "is-selected");
      if (selectEnd && ymd === selectEnd) classes.push("is-range-end", "is-selected");
      if (selectStart && selectEnd && ymd > selectStart && ymd < selectEnd) {
        classes.push("is-in-range");
      }
      return classes.join(" ");
    }

    function isDisabled(ymd) {
      if (ymd < todayYMD()) return true;
      if (bookedSet.has(ymd) && !(selectStart && !selectEnd && ymd === selectStart)) {
        // allow clicking start only; booked nights not selectable as stay nights
        // checkout day can be a booked start for next guest — our model: booked nights are unavailable
        return bookedSet.has(ymd);
      }
      return false;
    }

    function renderMonth(baseDate) {
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const first = new Date(year, month, 1);
      const startPad = first.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const wrap = document.createElement("div");
      wrap.className = "cal__month";

      const head = document.createElement("div");
      head.className = "cal__month-title";
      head.textContent = `${MONTHS[month]} ${year}`;
      wrap.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "cal__grid";
      grid.setAttribute("role", "grid");
      grid.setAttribute("aria-label", `${MONTHS[month]} ${year}`);

      WEEKDAYS.forEach((w) => {
        const el = document.createElement("div");
        el.className = "cal__dow";
        el.textContent = w;
        grid.appendChild(el);
      });

      const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;
      for (let i = 0; i < totalCells; i++) {
        const dayNum = i - startPad + 1;
        const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
        const cellDate = new Date(year, month, inMonth ? dayNum : 1);
        if (!inMonth) {
          // outside days still need a real date for range paint optional — skip interactivity
          const blank = document.createElement("button");
          blank.type = "button";
          blank.className = "cal__day is-outside";
          blank.disabled = true;
          blank.tabIndex = -1;
          blank.innerHTML = inMonth ? String(dayNum) : "";
          grid.appendChild(blank);
          continue;
        }

        const ymd = BookingsStore.toYMD(cellDate);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = dayClasses(ymd, true);
        btn.textContent = String(dayNum);
        btn.dataset.date = ymd;

        const disabled = isDisabled(ymd);
        if (disabled && !bookedSet.has(ymd)) {
          btn.disabled = true;
        }
        if (bookedSet.has(ymd)) {
          btn.title = "Booked";
          btn.setAttribute("aria-label", `${ymd}, booked`);
          if (!opts.selectable) btn.disabled = true;
          else btn.disabled = true;
        } else {
          btn.setAttribute("aria-label", ymd);
        }

        btn.addEventListener("click", () => onDayClick(ymd, btn.disabled));
        grid.appendChild(btn);
      }

      wrap.appendChild(grid);
      return wrap;
    }

    function render() {
      monthsEl.innerHTML = "";
      const m1 = new Date(view.getFullYear(), view.getMonth(), 1);
      monthsEl.appendChild(renderMonth(m1));

      if (opts.dualMonth && window.matchMedia("(min-width: 720px)").matches) {
        const m2 = new Date(view.getFullYear(), view.getMonth() + 1, 1);
        monthsEl.appendChild(renderMonth(m2));
        titlesEl.textContent = `${MONTHS[m1.getMonth()]} – ${MONTHS[m2.getMonth()]} ${m2.getFullYear()}`;
      } else {
        titlesEl.textContent = `${MONTHS[m1.getMonth()]} ${m1.getFullYear()}`;
      }
    }

    function setBookedFromRanges(list) {
      bookedSet = BookingsStore.getBookedSet(list);
      // clear invalid selection if it now overlaps
      if (selectStart && selectEnd && selectionBlocked(selectStart, selectEnd)) {
        selectStart = null;
        selectEnd = null;
        syncInputs();
        setHint("Your previous dates were booked. Please select again.");
      }
      render();
    }

    function setSelection(start, end) {
      selectStart = start || null;
      selectEnd = end || null;
      syncInputs();
      render();
    }

    function getSelection() {
      return { start: selectStart, end: selectEnd };
    }

    // respond to viewport for dual month
    const mq = window.matchMedia("(min-width: 720px)");
    const onMq = () => render();
    if (mq.addEventListener) mq.addEventListener("change", onMq);
    else if (mq.addListener) mq.addListener(onMq);

    render();

    return {
      setBookedFromRanges,
      setSelection,
      getSelection,
      render,
    };
  }

  global.AvailabilityCalendar = { createCalendar };
})(window);
