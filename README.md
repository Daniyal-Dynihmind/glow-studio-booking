# Glow Studio | Online Booking System 💅

A modern online booking system for a beauty salon. Customers choose a service, pick a date and a free time slot, and confirm their appointment in a few clicks. The salon owner manages every booking from a built-in admin dashboard.

**Live Booking Page:** https://glow-studio-booking-mu.vercel.app/
**Admin Dashboard:** https://glow-studio-booking-mu.vercel.app/admin.html

> Demo note: The admin page is currently public (no login) for demonstration. Login with Supabase authentication will be added in the next version.

---

## 📌 The Problem

Beauty salons often manage appointments through phone calls, WhatsApp messages and paper diaries. This causes double bookings, missed appointments and lost revenue, and customers have no way to see free times on their own.

## ✅ The Solution

Glow Studio Booking gives the salon a simple online system:
- Customers see the full service menu with price and duration
- Only free time slots are shown, so double booking is prevented
- Long services (like hair coloring) automatically block the correct time range
- The owner sees every booking, confirms or completes it, and tracks revenue
- Prices and durations can be updated from the admin panel without touching code

---

## ✨ Features

### Customer Booking Page
- Service selection with price and duration
- Date picker (past dates are blocked)
- Live time slots (booked and past slots are disabled automatically)
- Overlap protection for services longer than one slot
- Closed days handled (for example, Sundays)
- Booking form with name, phone, email and notes
- Success popup with a reference code

### Admin Dashboard
- Summary cards: today's bookings, pending, confirmed and completed revenue
- Search by name, phone or reference code
- Filter by status (Pending, Confirmed, Completed, Cancelled)
- Change booking status from a dropdown
- View full booking details
- Delete bookings (with confirmation popup)
- Edit service prices and durations (saved and shown on the booking page)

---

## 🛠️ Tech Stack

- **HTML5** and **CSS3** (Tailwind CSS via CDN, custom styles)
- **Vanilla JavaScript** (no framework)
- **Lucide Icons**
- **Poppins** and **Inter** fonts (Google Fonts)
- **LocalStorage** for data persistence
- **Vercel** for hosting

---

## 📂 Project Structure

glow-studio-booking/
├── index.html # Customer booking page
├── admin.html # Admin dashboard
├── css/
│ └── styles.css # Theme, booking UI and admin styles
├── js/
│ ├── app.js # Business config, slot engine and booking logic
│ └── admin.js # Admin dashboard logic
└── README.md


---

## ⚙️ How to Customize for Another Business

All business details are in one place: the `CONFIG` block at the top of `js/app.js`.

- `name`, `type`, `tagline`, `phone`, `address`
- `openTime`, `closeTime` and `slotMinutes` (time slot length)
- `closedDays` (0 = Sunday, 6 = Saturday)
- `accent`, `accentSoft`, `accentDark` (brand colors)
- `services` (name, duration, price, description)

---

## 🚀 Getting Started

1. Open the live booking page link above.
2. Choose a service, pick a date and a time slot.
3. Fill in your details and confirm.
4. Open the admin link to see the booking appear instantly.

---

## 🔭 Future Improvements

- Supabase database and admin login
- Email or WhatsApp confirmation to the customer
- Staff selection (choose a specific barber or stylist)
- Google Calendar sync
- Online deposit payment with Stripe

---

## 👨‍💻 Author

**Daniyal Dynihmind**
Vibe Coder and Full-Stack Builder | Karachi, Pakistan

- GitHub: [@Daniyal-Dynihmind](https://github.com/Daniyal-Dynihmind)
- Open for freelance and client projects

If you like this project, give it a ⭐ on GitHub!
