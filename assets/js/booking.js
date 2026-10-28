// Booking on the Contact page.
// Shows the booking chosen on the Adventures page (from a "Book Now" button or
// the calculator), adds it to the email the form sends, and shows a thank-you
// message when FormSubmit sends the visitor back here.

(() => {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const BOOKING_KEY = "aesBooking";
  const VAT_RATE = 0.15;
  const SEVERAL = "Several adventures (see Your booking)";
  const PRICES = {
    "Ultimate Adventure Day": 1500,
    "Family Explorer Package": 1500,
    "Mountain Adventure Package": 1500,
    "Corporate Team Challenge": 1500,
    "Ziplining Adventure": 750,
    "Kayaking Experience": 750,
    "Rock Climbing Session": 750,
  };

  const box = document.querySelector("#booking-box");
  const itemsList = document.querySelector("#booking-items");
  const totalsList = document.querySelector("#booking-totals");
  const fields = document.querySelector("#booking-fields");
  const select = document.querySelector("#activity");
  const success = document.querySelector("#form-success");
  const nextUrl = document.querySelector("#next-url");
  const subject = form.querySelector('input[name="_subject"]');
  const params = new URLSearchParams(window.location.search);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  const getDiscountRate = (count) => {
    if (count >= 4) return 0.15;
    if (count === 3) return 0.1;
    if (count === 2) return 0.05;
    return 0;
  };

  const clearStoredBooking = () => {
    try {
      sessionStorage.removeItem(BOOKING_KEY);
    } catch {
      /* storage blocked: nothing to clear */
    }
  };

  const loadStoredBooking = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(BOOKING_KEY));
      return saved && Array.isArray(saved.items) ? saved.items : null;
    } catch {
      return null;
    }
  };

  // After a successful send, FormSubmit returns the visitor to ?sent=1.
  if (window.location.protocol.startsWith("http")) {
    nextUrl.value = `${window.location.origin}${window.location.pathname}?sent=1`;
  } else {
    nextUrl.remove(); // opened as a file: FormSubmit shows its own page
  }

  if (params.get("sent") === "1") {
    clearStoredBooking();
    success.innerHTML =
      "<p><strong>Thank you! Your booking request has been sent.</strong></p>" +
      "<p>We’ll reply by email to confirm your adventure. You can send another inquiry below.</p>";
    success.hidden = false;
    success.focus();
    window.history.replaceState(null, "", window.location.pathname);
    return;
  }

  // Work out which booking to show.
  let items = null;
  if (params.has("booking") || params.has("activity")) {
    items = loadStoredBooking();
    const activity = params.get("activity");
    const storedMatches =
      items &&
      (!activity || (items.length === 1 && items[0].name === activity));
    if (!storedMatches) {
      items =
        activity && PRICES[activity]
          ? [{ name: activity, price: PRICES[activity], qty: 1 }]
          : null;
    }
  }

  const addHidden = (name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    fields.append(input);
  };

  const removeBooking = () => {
    items = null;
    clearStoredBooking();
    box.hidden = true;
    fields.innerHTML = "";
    itemsList.innerHTML = "";
    totalsList.innerHTML = "";
    subject.value = "New Adventure Escape SA booking inquiry";
    const several = select.querySelector(`option[value="${SEVERAL}"]`);
    if (several) {
      if (select.value === SEVERAL) select.value = "";
      several.remove();
    }
  };

  const showBooking = () => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const rate = getDiscountRate(count);
    const discount = subtotal * rate;
    const net = subtotal - discount;
    const vat = net * VAT_RATE;
    const total = net + vat;

    itemsList.innerHTML = "";
    for (const item of items) {
      const li = document.createElement("li");
      const label = document.createElement("span");
      const price = document.createElement("span");
      label.textContent = `${item.qty} × ${item.name}`;
      price.textContent = formatCurrency(item.qty * item.price);
      li.append(label, price);
      itemsList.append(li);
    }

    const rows = [
      ["Subtotal", formatCurrency(subtotal)],
      [`Discount (${rate * 100}%)`, `−${formatCurrency(discount)}`],
      ["Price after discount", formatCurrency(net)],
      ["VAT (15%)", formatCurrency(vat)],
      ["Total (incl. VAT)", formatCurrency(total)],
    ];
    totalsList.innerHTML = "";
    rows.forEach(([term, value], index) => {
      const row = document.createElement("div");
      if (index === rows.length - 1) row.className = "booking-grand-total";
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = value;
      row.append(dt, dd);
      totalsList.append(row);
    });

    // These travel with the form, so the booking appears in the email.
    fields.innerHTML = "";
    addHidden(
      "booking",
      items
        .map((i) => `${i.qty} × ${i.name} (${formatCurrency(i.price)} each)`)
        .join("; "),
    );
    addHidden("number_of_bookings", String(count));
    addHidden("subtotal", formatCurrency(subtotal));
    addHidden("discount", `${rate * 100}% (−${formatCurrency(discount)})`);
    addHidden("vat_15_percent", formatCurrency(vat));
    addHidden("total_incl_vat", formatCurrency(total));
    subject.value = "New Adventure Escape SA booking request";

    // Pick the matching activity in the drop-down.
    const names = [...new Set(items.map((i) => i.name))];
    if (names.length === 1) {
      select.value = names[0];
    } else {
      let several = select.querySelector(`option[value="${SEVERAL}"]`);
      if (!several) {
        several = new Option(SEVERAL, SEVERAL);
        select.options[0].after(several); // right after "Select an activity"
      }
      select.value = SEVERAL;
    }
    select.dispatchEvent(new Event("change"));
    box.hidden = false;
  };

  if (items && items.length > 0) showBooking();

  // Choosing a different activity by hand replaces the saved booking.
  select.addEventListener("change", () => {
    if (!items) return;
    const names = [...new Set(items.map((i) => i.name))];
    const expected = names.length === 1 ? names[0] : SEVERAL;
    if (select.value !== expected) {
      const chosen = select.value;
      removeBooking();
      select.value = chosen;
    }
  });

  document.querySelector("#remove-booking").addEventListener("click", () => {
    removeBooking();
    select.focus();
  });
})();
