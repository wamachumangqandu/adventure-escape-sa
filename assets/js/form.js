// Contact form error handling.
// Checks every field before the form is sent and shows a clear message
// under each field that needs fixing.

const form = document.querySelector("#contact-form");

if (form) {
  const alertBox = form.querySelector("#form-alert");
  const submitButton = form.querySelector("#submit-button");
  const messageCount = form.querySelector("#message-count");
  const MAX_MONTHS_AHEAD = 12;

  // Dates are compared as YYYY-MM-DD strings in the visitor's own time zone.
  const toISODate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const today = new Date();
  const latest = new Date(today);
  latest.setMonth(latest.getMonth() + MAX_MONTHS_AHEAD);

  const dateInput = form.querySelector("#date");
  dateInput.min = toISODate(today);
  dateInput.max = toISODate(latest);

  // Each rule returns an error message, or "" when the value is fine.
  const rules = {
    name: (value) => {
      if (!value) return "Please enter your name.";
      if (value.length < 2) return "Your name must be at least 2 letters.";
      if (!/^[\p{L}][\p{L}\s'’-]*$/u.test(value)) {
        return "Your name can only use letters, spaces, hyphens and apostrophes.";
      }
      return "";
    },
    email: (value) => {
      if (!value) return "Please enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        return "Please enter a valid email address, like name@example.com.";
      }
      return "";
    },
    activity: (value) => (value ? "" : "Please choose an activity from the list."),
    date: (value, field) => {
      if (field.validity.badInput) return "Please enter a full date.";
      if (!value) return "Please choose a date for your adventure.";
      if (value < dateInput.min) return "Please choose today or a future date.";
      if (value > dateInput.max) {
        return `We take bookings up to ${MAX_MONTHS_AHEAD} months ahead. Please choose an earlier date.`;
      }
      const [y, m, d] = value.split("-").map(Number);
      if (new Date(y, m - 1, d).getDay() === 0) {
        return "We’re closed on Sundays. Please choose Monday to Saturday.";
      }
      return "";
    },
    message: (value) =>
      value.length > 500 ? "Your message must be 500 characters or fewer." : "",
  };

  const fields = Object.keys(rules).map((id) => form.querySelector(`#${id}`));
  let submitted = false;

  // Shows or clears the error for one field. Returns true if it is valid.
  const checkField = (field) => {
    const value = field.value.trim();
    const message = rules[field.id](value, field);
    const errorEl = form.querySelector(`#${field.id}-error`);

    errorEl.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    field.closest(".form-field").classList.toggle("has-error", !!message);
    return !message;
  };

  const showAlert = (html) => {
    alertBox.innerHTML = html;
    alertBox.hidden = false;
  };

  const hideAlert = () => {
    alertBox.hidden = true;
    alertBox.innerHTML = "";
  };

  // After the first attempt to send, re-check fields as the user types.
  fields.forEach((field) => {
    const recheck = () => {
      if (submitted || field.getAttribute("aria-invalid") === "true") {
        checkField(field);
        if (fields.every((f) => f.getAttribute("aria-invalid") !== "true")) {
          hideAlert();
        }
      }
    };
    field.addEventListener("input", recheck);
    field.addEventListener("change", recheck);
    field.addEventListener("blur", () => {
      if (field.value.trim() !== "") checkField(field);
    });
  });

  const messageField = form.querySelector("#message");
  messageField.addEventListener("input", () => {
    messageCount.textContent = `${messageField.value.length} / 500 characters`;
  });

  form.addEventListener("submit", (event) => {
    submitted = true;
    const invalid = fields.filter((field) => !checkField(field));

    if (invalid.length > 0) {
      event.preventDefault();
      const items = invalid
        .map((field) => {
          const label = form
            .querySelector(`label[for="${field.id}"]`)
            .textContent.replace(/[:*]/g, "")
            .trim();
          return `<li><a href="#${field.id}">${label}</a></li>`;
        })
        .join("");
      const noun = invalid.length === 1 ? "problem" : "problems";
      showAlert(
        `<p><strong>Please fix ${invalid.length} ${noun} before sending:</strong></p><ul>${items}</ul>`,
      );
      alertBox.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          form.querySelector(link.getAttribute("href")).focus();
        });
      });
      invalid[0].focus();
      return;
    }

    if (!navigator.onLine) {
      event.preventDefault();
      showAlert(
        "<p><strong>You seem to be offline.</strong> Check your internet connection and try again.</p>",
      );
      alertBox.focus();
      return;
    }

    // Everything is valid: let the form send, and stop double submissions.
    hideAlert();
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
  });

  // If the visitor comes back with the browser's Back button, re-enable the button.
  window.addEventListener("pageshow", () => {
    submitButton.disabled = false;
    submitButton.textContent = "Send inquiry";
  });
}
