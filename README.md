# Adventure Escape SA

Adventure Escape SA is a responsive, multi-page website for a Cape Town outdoor-adventure business. It presents guided adventure packages and activities, shares information about the business, and provides a contact and booking inquiry form.

**Live website:** https://wamachumangqandu.github.io/adventure-escape-sa/

## Website

The website is built with HTML, CSS and JavaScript. It has no build step or project dependencies.

- **Home** (`index.html`): introduction, mission, and reasons to choose Adventure Escape SA.
- **About** (`about.html`): the company story and values.
- **Adventures** (`adventures.html`): adventure packages and individual activities, a price list, a discount table, and a live booking calculator.
- **Contact** (`contact.html`): an inquiry form with error checking, and business contact information.

### Drop-down navigation menu

The **Adventures** item in the navigation bar has a drop-down menu linking to Adventure Packages, Individual Activities, the Price List and the Booking Calculator. It opens when you hover over it with a mouse or click the arrow, and it works on touch screens and with the keyboard (Enter or Space opens it, Escape closes it). The code is in `assets/js/nav.js`.

### Tables

The Adventures page has two tables:

- **Price list**: every package and activity with its type, highlights and fee.
- **Multi-booking discounts**: the discount for each number of bookings, with example totals before VAT.

On phones the tables shrink to fit the screen.

### Booking

There are two ways to book, and both end on the Contact page:

1. **Book Now** on any adventure card books one of that adventure.
2. **Book these adventures** in the booking calculator books everything chosen there.

The Contact page then shows a **Your booking** box with each adventure, the discount, VAT and total. The visitor adds their name, email and date and presses **Send inquiry**, and the full booking is emailed to the team. They can also **Change booking** (back to the calculator with their choices filled in) or **Remove booking**. After sending, the page shows a thank-you message. The Contact form also works on its own, without a booking.

The booking is passed between pages with the browser's sessionStorage (`assets/js/calculator.js` saves it and `assets/js/booking.js` shows it on the Contact page).

### Booking calculator

On the Adventures page, enter a quantity for each package or activity to see the booking count, subtotal, discount, savings, price after discount, VAT and total. Discounts are based on the total number of bookings: one booking gets no discount, two get 5%, three get 10%, and four or more get 15%. South African VAT of 15% is then added to the discounted price. Prices are shown in South African rand (ZAR) and exclude VAT.

Example: 3 bookings (R1,500 + R1,500 + R750) = R3,750 subtotal, minus 10% (R375) = R3,375, plus 15% VAT (R506.25) = **R3,881.25**. The calculator runs in the browser and does not submit or store a booking.

### Error handling

**Booking calculator** (`assets/js/calculator.js`): each quantity is checked as you type. Negative numbers, decimals, letters, and more than 20 bookings for one adventure show a message under that adventure, and the total is hidden until the quantities are fixed.

**Contact form** (`assets/js/form.js`): the form is checked before it is sent. If something is wrong, a summary appears at the top of the form, each problem is shown in red under its field, and the cursor moves to the first problem. The checks are:

| Field | Rule |
| --- | --- |
| Name | Required, at least 2 letters, letters, spaces, hyphens and apostrophes only |
| Email | Required, must look like `name@example.com` |
| Activity | Must be chosen from the drop-down list |
| Date | Required, not in the past, not more than 12 months ahead, and not a Sunday (we are closed on Sundays) |
| Message | Optional, up to 500 characters (a counter shows how many are used) |

If the visitor is offline when they press **Send inquiry**, a message asks them to check their connection. The button changes to "Sending…" while the form is sent, so it cannot be sent twice.

### Contact form delivery

The contact form sends inquiries to `hello@adventureescapesa.co.za` using FormSubmit, a third-party form delivery service. The first time the form is submitted, the mailbox owner must confirm the activation email from FormSubmit before submissions will be delivered. Test the form after activation to verify delivery. FormSubmit processes the information entered in the form.

### Run locally

The simplest option is to open `index.html` in a browser. For a local web address such as `http://localhost:5500`, use the **Live Server** extension in VS Code:

1. Install **Live Server** from the VS Code Extensions view.
2. Right-click `index.html` in the Explorer and select **Open with Live Server**.
3. Use the address shown in the browser. The other pages are `about.html`, `adventures.html`, and `contact.html` under the same address.

### Publish with GitHub Pages

1. In the repository on GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/ (root)**, then click **Save**.
3. After a minute or two the site is live at the link at the top of this README. Every push to `main` updates it automatically.

## App design in Figma

The Figma file contains low-fidelity wireframes and high-fidelity app screen designs, including home, overview, about, contact, individual activity, and fee calculation screens. The mobile app itself is in a separate repository: https://github.com/wamachumangqandu/adventure-escape-sa-app

## Project structure

```text
adventure-escape-sa/
├── index.html
├── about.html
├── adventures.html
├── contact.html
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── nav.js
    │   ├── calculator.js
    │   ├── booking.js
    │   └── form.js
    └── images/
```

Shared layout and page styling are in `assets/css/style.css`; page content is in the corresponding HTML files; the drop-down menu, booking calculator and form error handling are in `assets/js/`; and photos and the logo are in `assets/images/`.
