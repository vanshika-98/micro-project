/**
 * The Ivory Table - Standalone Node.js Companion Server
 * Zero-dependency pure Node.js HTTP server for Restaurant & Owner Admin Portal
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_JSON_FILE = path.join(__dirname, 'ivory_store.json');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

// Default seed data for standalone node server
function getDefaultStore() {
  return {
    reservations: [
      { id: 1, booking_code: "IVORY-B8291", customer_name: "Dr. Vikramaditya Singhania", email: "vikram.singhania@gmail.com", phone: "9820012345", guests: 4, reservation_date: "2026-11-24", reservation_time: "20:00", seating_area: "Seaside Terrace", occasion: "Anniversary", special_requests: "Sunset ocean view table", status: "Confirmed" },
      { id: 2, booking_code: "IVORY-B8292", customer_name: "Priya Mehra", email: "priya.mehra@techcorp.in", phone: "9819956789", guests: 2, reservation_date: "2026-11-24", reservation_time: "19:30", seating_area: "Sunset Deck", occasion: "Date Night", special_requests: "Window booth requested", status: "Seated" },
      { id: 3, booking_code: "IVORY-B8293", customer_name: "Rohan & Aisha Kapoor", email: "rohan.kapoor@mumbaiadvisors.com", phone: "9821034567", guests: 6, reservation_date: "2026-11-24", reservation_time: "21:00", seating_area: "Private VIP Lounge", occasion: "Birthday", special_requests: "Wine pairing service", status: "Confirmed" }
    ],
    orders: [
      { id: 1, order_code: "ORD-701", customer_name: "Mr. Siddharth Rao", phone: "9820123456", email: "sid.rao@gmail.com", order_type: "Dine-In", table_number: "Table 12 (Seaside)", delivery_address: "", items: [{ name: "Truffle Malabar Lobster Thermidor", qty: 1, price: 2450 }, { name: "Marine Drive Sunset Twilight Cocktail", qty: 2, price: 780 }], subtotal: 4010, tax: 200.5, discount: 0, total_amount: 4210.5, payment_method: "Card", payment_status: "Paid", order_status: "In Kitchen", notes: "Celebrating promotion" },
      { id: 2, order_code: "ORD-702", customer_name: "Kavita Sethi", phone: "9819087654", email: "kavita.s@horizon.com", order_type: "Delivery", table_number: "", delivery_address: "Flat 14B, Sea Green Bay, Marine Drive, Mumbai", items: [{ name: "Saffron & Herb Butter Garlic Prawns", qty: 1, price: 850 }, { name: "Dum Awadhi Lamb Biryani", qty: 2, price: 1190 }], subtotal: 3230, tax: 161.5, discount: 323, total_amount: 3068.5, payment_method: "UPI", payment_status: "Paid", order_status: "Ready", notes: "Extra mint chutney" }
    ],
    reviews: [
      { id: 1, customer_name: "Arjun & Natasha Oberoi", rating: 5, review_text: "Unmatched sunset ocean views on Marine Drive! The Truffle Malabar Lobster and 24K Saffron Tres Leches were culinary masterclasses. Service was impeccable.", dish_recommended: "Truffle Malabar Lobster Thermidor", visit_date: "2026-11-20", status: "Approved" },
      { id: 2, customer_name: "Chef Rahul Akerkar", 5: 5, rating: 5, review_text: "The depth in the 36-hour Smoked Dal Bukhara and the balance in the Burrata Heirloom Chaat showed extraordinary finesse. A true crown jewel on Mumbai's coast.", dish_recommended: "Smoked Dal Bukhara", visit_date: "2026-11-18", status: "Approved" },
      { id: 3, customer_name: "Shweta Bachchan", rating: 5, review_text: "The vibe at sunset is magical. The Sunset Twilight cocktail with glittering shimmer against the Arabian Sea horizon is unforgettable. We will be regular guests!", dish_recommended: "Marine Drive Sunset Twilight Cocktail", visit_date: "2026-11-15", status: "Approved" }
    ],
    messages: [
      { id: 1, sender_name: "Kunal Singhania", email: "kunal@singhaniaholdings.com", phone: "9820098765", subject: "Corporate Sunset Cocktail Party Booking", message: "We wish to book the Private VIP Lounge for 25 executives on Dec 12th.", status: "Unread" }
    ]
  };
}

function loadStore() {
  try {
    if (fs.existsSync(DB_JSON_FILE)) {
      return JSON.parse(fs.readFileSync(DB_JSON_FILE, 'utf8'));
    }
  } catch (err) {
    console.error("Error reading JSON store:", err);
  }
  const defaultStore = getDefaultStore();
  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(store) {
  try {
    fs.writeFileSync(DB_JSON_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving store:", err);
  }
}

// Read body helper
function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    return res.end();
  }

  // --- API ROUTES ---
  if (pathname.startsWith('/api/')) {
    const store = loadStore();

    // 1. Restaurant Info
    if (pathname === '/api/restaurant-info' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: {
          name: "The Ivory Table",
          tagline: "Where every bite tells a story",
          subtitle: "Seaside Culinary Artistry & Coastal Mediterranean-Indian Fusion",
          location: "Seaside Marine Drive, Mumbai - 400020, Maharashtra, India",
          phone: "9856321456",
          email: "20tc1va145@mitsgwl.ac.in",
          opening_hours: "Mon - Sun: 11:00 AM - 11:30 PM",
          stats: { years_experience: 14, happy_guests: "85,000+", signature_dishes: "120+", rating: 4.9, reviews_count: 1420 }
        }
      });
    }

    // 2. Auth Login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await readBody(req);
      const is_valid = (
        (body.email === 'admin@ivorytable.com' && body.password === 'admin123') ||
        (body.pin === 'admin123' || body.pin === '1234') ||
        (body.password === 'admin123')
      );
      if (is_valid) {
        return sendJson(res, 200, {
          success: true,
          token: "ivory-admin-auth-session-token-99881",
          user: { name: "General Manager & Executive Chef", role: "Owner / Administrator" }
        });
      }
      return sendJson(res, 401, { success: false, message: "Invalid credentials" });
    }

    // 3. Admin Dashboard
    if (pathname === '/api/admin/dashboard' && method === 'GET') {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRes = store.reservations.filter(r => r.reservation_date === todayStr).length;
      const totalRev = store.orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
      return sendJson(res, 200, {
        success: true,
        metrics: {
          today_reservations: todayRes || 4,
          upcoming_reservations: store.reservations.length,
          total_orders: store.orders.length,
          active_kitchen_orders: store.orders.filter(o => o.order_status === 'In Kitchen' || o.order_status === 'Pending').length,
          total_revenue: totalRev,
          unread_messages: store.messages.filter(m => m.status === 'Unread').length,
          table_occupancy_rate: "82%"
        },
        recent_reservations: store.reservations.slice(-5).reverse(),
        recent_orders: store.orders.slice(-5).reverse()
      });
    }

    // 4. Reservations API
    if (pathname === '/api/reservations' && method === 'POST') {
      const body = await readBody(req);
      const code = "IVORY-B" + Math.floor(1000 + Math.random() * 9000);
      const newRes = {
        id: store.reservations.length + 1,
        booking_code: code,
        customer_name: body.customer_name || 'Guest',
        email: body.email || '',
        phone: body.phone || '',
        guests: parseInt(body.guests || 2),
        reservation_date: body.reservation_date || new Date().toISOString().split('T')[0],
        reservation_time: body.reservation_time || '20:00',
        seating_area: body.seating_area || 'Seaside Terrace',
        occasion: body.occasion || 'Casual Dining',
        special_requests: body.special_requests || '',
        status: 'Confirmed'
      };
      store.reservations.push(newRes);
      saveStore(store);
      return sendJson(res, 201, { success: true, message: "Table reserved successfully", data: newRes });
    }

    if (pathname === '/api/admin/reservations' && method === 'GET') {
      return sendJson(res, 200, { success: true, count: store.reservations.length, data: store.reservations.slice().reverse() });
    }

    if (pathname.match(/^\/api\/admin\/reservations\/(\d+)\/status$/) && method === 'PATCH') {
      const id = parseInt(pathname.split('/')[4]);
      const body = await readBody(req);
      const target = store.reservations.find(r => r.id === id);
      if (target) {
        target.status = body.status;
        saveStore(store);
        return sendJson(res, 200, { success: true, message: "Status updated" });
      }
      return sendJson(res, 404, { success: false, message: "Reservation not found" });
    }

    // 5. Orders API
    if (pathname === '/api/orders' && method === 'POST') {
      const body = await readBody(req);
      const code = "ORD-" + Math.floor(100 + Math.random() * 900);
      const subtotal = body.items ? body.items.reduce((acc, i) => acc + (i.price * i.qty), 0) : 0;
      const tax = +(subtotal * 0.05).toFixed(2);
      const total = +(subtotal + tax - (body.discount || 0)).toFixed(2);

      const newOrder = {
        id: store.orders.length + 1,
        order_code: code,
        customer_name: body.customer_name || 'Guest Diner',
        phone: body.phone || '9856321456',
        email: body.email || '',
        order_type: body.order_type || 'Dine-In',
        table_number: body.table_number || 'T-1',
        delivery_address: body.delivery_address || '',
        items: body.items || [],
        subtotal,
        tax,
        discount: body.discount || 0,
        total_amount: total,
        payment_method: body.payment_method || 'UPI',
        payment_status: 'Paid',
        order_status: 'In Kitchen',
        notes: body.notes || ''
      };
      store.orders.push(newOrder);
      saveStore(store);
      return sendJson(res, 201, { success: true, message: "Order placed successfully", data: newOrder });
    }

    if (pathname === '/api/admin/orders' && method === 'GET') {
      return sendJson(res, 200, { success: true, count: store.orders.length, data: store.orders.slice().reverse() });
    }

    if (pathname.match(/^\/api\/admin\/orders\/(\d+)\/status$/) && method === 'PATCH') {
      const id = parseInt(pathname.split('/')[4]);
      const body = await readBody(req);
      const target = store.orders.find(o => o.id === id);
      if (target) {
        target.order_status = body.status;
        saveStore(store);
        return sendJson(res, 200, { success: true, message: "Order status updated" });
      }
      return sendJson(res, 404, { success: false, message: "Order not found" });
    }

    // 6. Reviews & Messages
    if (pathname === '/api/reviews') {
      if (method === 'POST') {
        const body = await readBody(req);
        const newRev = {
          id: store.reviews.length + 1,
          customer_name: body.customer_name || 'Anonymous',
          rating: parseInt(body.rating || 5),
          review_text: body.review_text || '',
          dish_recommended: body.dish_recommended || "Chef's Special",
          visit_date: new Date().toISOString().split('T')[0],
          status: 'Approved'
        };
        store.reviews.push(newRev);
        saveStore(store);
        return sendJson(res, 201, { success: true, message: "Review submitted" });
      }
      return sendJson(res, 200, { success: true, data: store.reviews });
    }

    if (pathname === '/api/messages' && method === 'POST') {
      const body = await readBody(req);
      store.messages.push({
        id: store.messages.length + 1,
        sender_name: body.sender_name,
        email: body.email,
        phone: body.phone,
        subject: body.subject,
        message: body.message,
        status: 'Unread'
      });
      saveStore(store);
      return sendJson(res, 201, { success: true, message: "Inquiry received" });
    }
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (pathname === '/admin' || pathname === '/owner') {
    filePath = path.join(PUBLIC_DIR, 'admin.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`[Node Server] Running on http://localhost:${PORT}`);
  console.log(`[Node Server] Owner Admin on http://localhost:${PORT}/admin`);
});
