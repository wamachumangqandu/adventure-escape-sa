// Booking calculator for the Adventures page.
// Builds one quantity input per adventure card, works out the discount,
// and shows a clear error message when a quantity is not valid.

const MAX_PER_ADVENTURE = 20;
const VAT_RATE = 0.15; // South African VAT

const adventureCards = document.querySelectorAll(
  ".adventures .card[data-price]",
);
const optionsContainer = document.querySelector("#booking-options");
const calculatorError = document.querySelector("#calculator-error");

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

const bookingInputs = [...adventureCards].map((card, index) => {
  const name = card.querySelector("h2").textContent.trim();
  const price = Number(card.dataset.price);
  const label = document.createElement("label");
  const details = document.createElement("span");
  const title = document.createElement("strong");
  const fee = document.createElement("small");
  const input = document.createElement("input");
  const error = document.createElement("small");

  label.className = "booking-option";
  label.htmlFor = `booking-quantity-${index}`;
  title.textContent = name;
  fee.textContent = `${formatCurrency(price)} per booking`;
  details.append(title, fee);

  input.id = `booking-quantity-${index}`;
  input.type = "number";
  input.min = "0";
  input.max = String(MAX_PER_ADVENTURE);
  input.step = "1";
  input.value = "0";
  input.inputMode = "numeric";
  input.setAttribute("aria-label", `Number of ${name} bookings`);
  input.setAttribute("aria-describedby", `booking-error-${index}`);

  error.id = `booking-error-${index}`;
  error.className = "field-error";

  label.append(details, input, error);
  optionsContainer.append(label);

  return { input, error, price, name };
});

// Returns an error message for a quantity, or "" if it is valid.
const validateQuantity = (input) => {
  const raw = input.value.trim();

  // A number input reports letters like "e" or "--" as badInput.
  if (input.validity.badInput) return "Please enter a number, like 1 or 2.";
  if (raw === "") return "";
  if (raw.startsWith("-")) return "The number of bookings can’t be negative.";
  if (!/^\d+$/.test(raw)) return "Please enter a whole number, like 1 or 2.";
  if (Number(raw) > MAX_PER_ADVENTURE) {
    return `You can book up to ${MAX_PER_ADVENTURE} at a time. For bigger groups, please contact us.`;
  }
  return "";
};

const showSummary = ({ count, subtotal, rate, savings, net, vat, total }) => {
  document.querySelector("#booking-count").textContent = count;
  document.querySelector("#booking-subtotal").textContent = subtotal;
  document.querySelector("#booking-discount").textContent = rate;
  document.querySelector("#booking-savings").textContent = savings;
  document.querySelector("#booking-net").textContent = net;
  document.querySelector("#booking-vat").textContent = vat;
  document.querySelector("#booking-total").textContent = total;
};

const getDiscountRate = (bookingCount) => {
  if (bookingCount >= 4) return 0.15;
  if (bookingCount === 3) return 0.1;
  if (bookingCount === 2) return 0.05;
  return 0;
};

const updateSummary = () => {
  let bookingCount = 0;
  let subtotal = 0;
  let errorCount = 0;

  for (const { input, error, price } of bookingInputs) {
    const message = validateQuantity(input);

    error.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
    input.closest(".booking-option").classList.toggle("has-error", !!message);

    if (message) {
      errorCount += 1;
      continue;
    }

    const quantity = Number(input.value.trim() || 0);
    bookingCount += quantity;
    subtotal += quantity * price;
  }

  if (errorCount > 0) {
    calculatorError.hidden = false;
    calculatorError.textContent =
      errorCount === 1
        ? "Fix the highlighted quantity to see your total."
        : `Fix the ${errorCount} highlighted quantities to see your total.`;
    showSummary({
      count: "–",
      subtotal: "–",
      rate: "–",
      savings: "–",
      net: "–",
      vat: "–",
      total: "–",
    });
    return;
  }

  calculatorError.hidden = true;
  calculatorError.textContent = "";

  const discountRate = getDiscountRate(bookingCount);
  const savings = subtotal * discountRate;
  const net = subtotal - savings;
  const vat = net * VAT_RATE;

  showSummary({
    count: bookingCount,
    subtotal: formatCurrency(subtotal),
    rate: `${discountRate * 100}%`,
    savings: formatCurrency(savings),
    net: formatCurrency(net),
    vat: formatCurrency(vat),
    total: formatCurrency(net + vat),
  });
};

for (const { input } of bookingInputs) {
  input.addEventListener("input", updateSummary);
  // Treat an empty box as 0 when the user leaves it.
  input.addEventListener("blur", () => {
    if (input.value.trim() === "" && !input.validity.badInput) {
      input.value = "0";
      updateSummary();
    }
  });
}

updateSummary();
