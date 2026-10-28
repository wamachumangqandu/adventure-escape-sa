// Drop-down navigation menu for "Adventures".
// Opens on hover (mouse), on tap/click of the arrow button (touch and mouse),
// and with the keyboard (Enter/Space on the button, Escape to close).
document.querySelectorAll(".has-dropdown").forEach((item) => {
  const toggle = item.querySelector(".dropdown-toggle");
  const menu = item.querySelector(".dropdown-menu");

  if (!toggle || !menu) return;

  const setOpen = (open) => {
    item.classList.toggle("open", open);
    // "dismissed" stops the hover style from keeping the menu open after the
    // user has deliberately closed it while the mouse is still over it.
    item.classList.toggle("dismissed", !open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  item.addEventListener("mouseleave", () => item.classList.remove("dismissed"));

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(!item.classList.contains("open"));
  });

  // Escape closes the menu and returns focus to the button.
  item.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && item.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Close when keyboard focus leaves the menu.
  item.addEventListener("focusout", (event) => {
    if (!item.contains(event.relatedTarget)) setOpen(false);
  });

  // Close when the user clicks anywhere else on the page.
  document.addEventListener("click", (event) => {
    if (!item.contains(event.target)) setOpen(false);
  });

  // Close after choosing a link (useful when the link is on the same page).
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
});
