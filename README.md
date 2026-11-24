# The Ivory Table — Seaside Fine Dining & Restaurant Management System

> **"Where every bite tells a story"**  
> Modern Coastal Gastronomy & Progressive Indian-Mediterranean Fusion  
> Located along Seaside Marine Drive, Mumbai, Maharashtra, India.

---

## 🌟 Executive Summary

**The Ivory Table** is a complete, production-ready, full-stack restaurant web application featuring an appetizing, luxurious, responsive customer-facing website and an executive **Owner / Manager Admin Server Portal**.

- **Frontend Customer Experience**: Immersive dining experience, interactive culinary menu with dietary & category filters, real-time table reservations engine with instant VIP confirmation codes, online ordering with cart & coupon engine, patron reviews submission, Google Maps direction integration, dark mode, and synthesized seaside ambient audio.
- **Backend & Owner Server Portal**: Real-time Kitchen Display System (KDS) order dispatch pipeline, table reservations roster, full menu CRUD & instant inventory toggling (In Stock / Sold Out), customer feedback moderation, banquet event inquiries, and executive KPI analytics.

---

## 🎨 Design & Style Specifications

- **Vibrant, Appetizing Color Palette**:
  - **Warm Saffron / Orange**: `#FF6B35`
  - **Deep Red**: `#D62828`
  - **Golden Yellow**: `#F7B801`
  - **Rich Dark Charcoal / Brown**: `#1F1A17`
  - **Cream Background**: `#FFF8F0` (Light) / `#110E0C` (Dark)
  - **Pastels & Accents**: Pastel Lavender (`#F3E8FF`), Sunset Pink (`#F43F5E`), Royal Purple (`#7E22CE`), Peach (`#FFEDD5`)
  - **Gradients**: Sunset Gradient (`#FF6B35` → `#D62828` → `#7E22CE`) and Warm Gold (`#FF6B35` → `#F7B801`)
- **Typography**:
  - Display & Headings: `Playfair Display`, serif (Google Fonts)
  - Body & UI: `Poppins`, sans-serif (Google Fonts)
  - Accents & Numerals: `Outfit`, sans-serif
- **Luxury Look & Feel**:
  - Glassmorphic sticky navbar with frosted blur (`backdrop-filter: blur(20px)`)
  - Rounded cards (`border-radius: 20px - 34px`) with multi-layered soft shadows
  - Floating badges, image zoom on hover (`scale(1.08)`), multi-colored glowing borders
  - Animated stat counters (years of service, happy diners, signature recipes, rating)
  - Preloader with animated cloche and smooth reveal
  - Seaside ocean wave & jazz ambient audio engine synthesized via Web Audio API (100% offline, zero audio file dependencies)
  - Dark mode toggle with persistent local storage
  - Full respect for `prefers-reduced-motion`

---

## 🚀 Quick Start Guide

You can launch the server using either **Python (Flask)** or **Node.js**:

### Option 1: Python Flask Server (Recommended)
1. Double-click `run_server.bat` or run in terminal:
   ```bash
   python server.py
   ```
2. Open your browser:
   - **Customer Website**: `http://localhost:5000`
   - **Owner / Manager Admin Portal**: `http://localhost:5000/admin`

### Option 2: Standalone Node.js Companion Server
1. Double-click `run_node_server.bat` or run:
   ```bash
   node server.js
   ```
2. Open your browser at `http://localhost:5000` or `http://localhost:5000/admin`.

---

## 🔐 Owner & Admin Credentials

| Role | Email / Username | Password / PIN | Portal URL |
| :--- | :--- | :--- | :--- |
| **Owner / General Manager** | `admin@ivorytable.com` | `admin123` | `http://localhost:5000/admin` |
| **Quick PIN Access** | *(any)* | `1234` or `admin123` | `http://localhost:5000/admin` |

---

## 🍽️ Key Features

### 1. Customer-Facing Website (`/`)
- **Hero Showcase**: High-definition imagery of Marine Drive, staggered headlines, floating Michelin guide & sunset cocktail badges, and live reservation CTAs.
- **Story of Marine Drive Dining**: Celebrating daily Arabian Sea catch, 36-hour slow-cooked Dal Bukhara, and sunset dining on Mumbai's Queen's Necklace.
- **Interactive Culinary Menu**:
  - Categories: *Small Plates & Starters*, *Coastal Seafood*, *Progressive Mains*, *Breads & Biryanis*, *Decadent Desserts*, *Cocktails & Elixirs*.
  - Dietary filters: *Vegetarian*, *Non-Vegetarian*, *Chef's Special*, *Vegan*.
  - Instant live fuzzy search bar.
  - Interactive Dish Modal with ingredients breakdown, sommelier wine pairing, calories, prep time, and 1-click cart addition.
- **Table Reservation Engine**:
  - Live table booking with date picker, time slot, guest size, and zone selection (*Seaside Terrace*, *Indoor Glasshouse*, *Sunset Deck*, *VIP Wine Cellar*).
  - Generates instant VIP reservation confirmation code (e.g. `IVORY-B8291`).
- **Online Food Ordering Drawer & Checkout**:
  - Slide-out order cart with item quantity controls.
  - Promo coupons: `SEASIDE10` (10% off), `IVORYFIRST` (₹200 off).
  - Dine-In (with table number), Marine Drive Delivery, or Gourmet Takeaway.
  - Generates instant Printable Order Receipt with unique tracking ID (`ORD-XXX`).
- **Customer Reviews**: Verified patron quotes, star ratings, and an interactive "Share Your Experience" review form.
- **Seaside Ambience Soundscape**: Web Audio API synthesized gentle ocean waves and jazz lounge chimes.
- **Contact & Banquet Inquiries**: Private dining & corporate event inquiries form.

### 2. Owner & Manager Server Portal (`/admin`)
- **Executive Dashboard**: Real-time revenue today, active kitchen tickets, table occupancy rate, upcoming bookings, and recent live orders.
- **Kitchen Display System (KDS)**: Real-time Kanban pipeline:
  1. *New / Pending* (with audible kitchen chime)
  2. *In Kitchen (Cooking)*
  3. *Ready to Serve / Dispatch*
  4. *Delivered / Completed*
- **Table Reservations Manager**: Roster of all bookings, filter by status (*Confirmed*, *Seated*, *Completed*, *Cancelled*), instant 1-click status changer, and manual "+ Walk-In Table" booking.
- **Culinary Menu & Inventory Control (Full CRUD)**:
  - Add new dish with high-res image, price, ingredients, wine pairing.
  - Edit existing dish pricing and description.
  - 1-click **In Stock / Sold Out** switch toggle.
  - Delete dish.
- **Guest Feedback Moderation**: Approve or hide reviews before featuring them on the public home page.
- **Inquiries Center**: View and respond to corporate banquet and anniversary inquiries.

---

## 📡 RESTful API Endpoints

### Public APIs
- `GET /api/restaurant-info` — Core restaurant metadata, opening hours, contact details.
- `GET /api/menu` — Fetch active menu items (supports `?category=`, `?dietary=`, `?search=`).
- `GET /api/menu/<id>` — Get dish details and pairing.
- `POST /api/reservations` — Book a table. Returns unique booking code.
- `POST /api/orders` — Place online food order. Returns order tracking ID and itemized breakdown.
- `GET /api/reviews` — Fetch approved customer reviews.
- `POST /api/reviews` — Submit a patron review.
- `POST /api/messages` — Submit banquet or general inquiry.

### Owner / Admin APIs
- `POST /api/auth/login` — Authenticate manager credentials.
- `GET /api/admin/dashboard` — Live revenue, active orders, today's reservations, occupancy.
- `GET /api/admin/orders` — View all orders in KDS pipeline.
- `PATCH /api/admin/orders/<id>/status` — Advance order status (*In Kitchen*, *Ready*, *Delivered*).
- `GET /api/admin/reservations` — Filterable reservations list.
- `POST /api/admin/reservations` — Create walk-in reservation.
- `PATCH /api/admin/reservations/<id>/status` — Update booking status.
- `DELETE /api/admin/reservations/<id>` — Cancel/delete reservation.
- `GET /api/admin/menu` — View full menu inventory.
- `POST /api/admin/menu` — Add new dish.
- `PUT /api/admin/menu/<id>` — Update existing dish.
- `PATCH /api/admin/menu/<id>/toggle` — Fast toggle In Stock / Sold Out.
- `DELETE /api/admin/menu/<id>` — Delete dish from menu.
- `GET /api/admin/messages` & `PATCH /api/admin/messages/<id>/status` — Inquiries inbox.
- `GET /api/admin/reviews` & `PATCH /api/admin/reviews/<id>/status` — Moderate reviews.

---

## 📂 Project Directory Structure

```
micro1/
├── server.py              # Flask backend server with SQLite & REST APIs
├── server.js              # Pure Node.js zero-dependency backend alternative
├── database.py            # SQLite schema initialization and seed data
├── ivory_table.db         # Persistent SQLite database
├── requirements.txt       # Python Flask dependencies
├── run_server.bat         # 1-click Windows launcher for Python Flask server
├── run_node_server.bat    # 1-click Windows launcher for Node.js server
├── README.md              # Complete documentation & API guide
└── public/                # Static assets & Frontend
    ├── index.html         # Customer-facing luxury website
    ├── admin.html         # Owner / Manager Admin Portal
    ├── css/
    │   ├── style.css      # Design system, animations, dark mode
    │   └── admin.css      # Owner dashboard modern glassmorphism UI
    └── js/
        ├── app.js         # Customer website interactivity, cart, booking, menu
        ├── admin.js       # Owner portal live KDS, reservations, menu CRUD
        └── audio.js       # Seaside & Ambient audio synthesizer (Web Audio API)
```

---

## 📍 Restaurant Details

- **Name**: The Ivory Table
- **Cuisine**: Modern Coastal & Progressive Indian-Mediterranean Fusion
- **Location**: Seaside Marine Drive, Mumbai - 400020, Maharashtra, India
- **Phone**: `9856321456` / `022-22894500`
- **Email**: `20tc1va145@mitsgwl.ac.in`
- **Opening Hours**: Monday – Sunday: 11:00 AM – 11:30 PM
- **Tagline**: *"Where every bite tells a story"*
