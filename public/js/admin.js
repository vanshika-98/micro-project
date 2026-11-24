/**
 * The Ivory Table - Owner & Manager Portal Engine
 * Real-time Kitchen Display System (KDS), Table Reservations, Menu CRUD & Analytics
 */

// Admin State
const adminState = {
  token: localStorage.getItem('ivory_admin_token'),
  activeSection: 'overview',
  orders: [],
  reservations: [],
  menu: [],
  messages: [],
  reviews: [],
  metrics: {}
};

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initSidebar();
  initModals();
  startAutoRefresh();
});

/* --- 1. AUTHENTICATION --- */
function checkAuth() {
  const overlay = document.getElementById('login-overlay');
  if (!adminState.token) {
    if (overlay) overlay.style.display = 'flex';
  } else {
    if (overlay) overlay.style.display = 'none';
    loadAllAdminData();
  }

  // Login form handler
  const loginForm = document.getElementById('admin-login-form');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const btn = loginForm.querySelector('button[type="submit"]');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json.success) {
        adminState.token = json.token;
        localStorage.setItem('ivory_admin_token', json.token);
        if (overlay) overlay.style.display = 'none';
        showAdminToast('Welcome back, Executive Manager!');
        loadAllAdminData();
      } else {
        alert(json.message || 'Invalid credentials');
      }
    } catch (err) {
      // Offline fallback login for demo
      if (password === 'admin123' || email === 'admin@ivorytable.com') {
        adminState.token = 'local-token-ivory-99';
        localStorage.setItem('ivory_admin_token', adminState.token);
        if (overlay) overlay.style.display = 'none';
        showAdminToast('Welcome back, Executive Manager!');
        loadAllAdminData();
      } else {
        alert('Could not authenticate. Use email: admin@ivorytable.com and password: admin123');
      }
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `Access Owner Portal <i class="fa-solid fa-arrow-right"></i>`;
    }
  });

  // Logout
  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you wish to log out of the Owner Portal?')) {
      localStorage.removeItem('ivory_admin_token');
      adminState.token = null;
      if (overlay) overlay.style.display = 'flex';
    }
  });
}

/* --- 2. SIDEBAR NAVIGATION --- */
function initSidebar() {
  document.querySelectorAll('.nav-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-view');
      switchView(section);
    });
  });

  // Mobile sidebar toggle
  document.getElementById('mobile-sidebar-toggle')?.addEventListener('click', () => {
    document.querySelector('.admin-sidebar')?.classList.toggle('open');
  });
}

function switchView(viewName) {
  adminState.activeSection = viewName;

  document.querySelectorAll('.nav-item-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-view') === viewName);
  });

  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `view-${viewName}`);
  });

  const titleEl = document.getElementById('current-view-title');
  const viewTitles = {
    overview: 'Executive Dashboard & Live Analytics',
    kds: 'Kitchen Display System (Live Orders)',
    reservations: 'Table Reservations Management',
    menu: 'Culinary Menu & Inventory Control',
    messages: 'Customer Inquiries & Banquets',
    reviews: 'Guest Feedback & Moderation'
  };
  if (titleEl) {
    titleEl.textContent = viewTitles[viewName] || 'Owner Portal';
  }

  // Close mobile sidebar if open
  document.querySelector('.admin-sidebar')?.classList.remove('open');
}

/* --- 3. DATA LOADING --- */
async function loadAllAdminData() {
  await Promise.all([
    fetchDashboardKPIs(),
    fetchOrders(),
    fetchReservations(),
    fetchMenu(),
    fetchMessages(),
    fetchReviews()
  ]);
}

function startAutoRefresh() {
  setInterval(() => {
    if (adminState.token) {
      fetchOrders(true);
      fetchReservations(true);
      fetchDashboardKPIs();
    }
  }, 12000);
}

/* --- 4. DASHBOARD & KPIS --- */
async function fetchDashboardKPIs() {
  try {
    const res = await fetch('/api/admin/dashboard');
    const json = await res.json();
    if (json.success) {
      adminState.metrics = json.metrics;
      renderKPIs(json.metrics);
      renderDashboardRecent(json.recent_reservations, json.recent_orders);
    }
  } catch (err) {
    console.warn("Error fetching dashboard KPIs:", err);
  }
}

function renderKPIs(m) {
  if (!m) return;
  document.getElementById('kpi-today-res').textContent = m.today_reservations ?? '6';
  document.getElementById('kpi-active-orders').textContent = m.active_kitchen_orders ?? '3';
  document.getElementById('kpi-revenue').textContent = `₹${(m.total_revenue ?? 18450).toLocaleString()}`;
  document.getElementById('kpi-occupancy').textContent = m.table_occupancy_rate ?? '78%';

  // Update sidebar counters
  const orderPill = document.getElementById('sidebar-orders-count');
  if (orderPill) {
    orderPill.textContent = m.active_kitchen_orders ?? '0';
    orderPill.style.display = m.active_kitchen_orders > 0 ? 'inline-block' : 'none';
  }

  const msgPill = document.getElementById('sidebar-msg-count');
  if (msgPill) {
    msgPill.textContent = m.unread_messages ?? '0';
    msgPill.style.display = m.unread_messages > 0 ? 'inline-block' : 'none';
  }
}

function renderDashboardRecent(reservations, orders) {
  const resTable = document.getElementById('dash-recent-reservations');
  if (resTable && reservations) {
    resTable.innerHTML = reservations.map(r => `
      <tr>
        <td><strong>${r.booking_code}</strong></td>
        <td>${r.customer_name}</td>
        <td>${r.guests} Guests</td>
        <td>${r.reservation_time}</td>
        <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
      </tr>
    `).join('');
  }

  const ordTable = document.getElementById('dash-recent-orders');
  if (ordTable && orders) {
    ordTable.innerHTML = orders.map(o => `
      <tr>
        <td><strong>${o.order_code}</strong></td>
        <td>${o.customer_name}</td>
        <td>${o.order_type} ${o.table_number ? '• ' + o.table_number : ''}</td>
        <td>₹${o.total_amount}</td>
        <td><span class="status-badge ${o.order_status.toLowerCase().replace(/[^a-z]/g, '-')}">${o.order_status}</span></td>
      </tr>
    `).join('');
  }
}

/* --- 5. KITCHEN DISPLAY SYSTEM (KDS) --- */
async function fetchOrders(silent = false) {
  try {
    const res = await fetch('/api/admin/orders');
    const json = await res.json();
    if (json.success) {
      // Check if new pending order arrived
      if (!silent && json.data.length > adminState.orders.length) {
        playKitchenOrderChime();
      }
      adminState.orders = json.data;
      renderKDS(adminState.orders);
    }
  } catch (err) {
    console.warn("Could not load orders:", err);
  }
}

function renderKDS(orders) {
  const pendingCol = document.getElementById('kds-pending-cards');
  const kitchenCol = document.getElementById('kds-kitchen-cards');
  const readyCol = document.getElementById('kds-ready-cards');
  const deliveredCol = document.getElementById('kds-delivered-cards');

  if (!pendingCol) return;

  const pending = orders.filter(o => o.order_status === 'Pending');
  const kitchen = orders.filter(o => o.order_status === 'In Kitchen');
  const ready = orders.filter(o => o.order_status === 'Ready');
  const delivered = orders.filter(o => o.order_status === 'Delivered');

  // Counts
  document.getElementById('count-kds-pending').textContent = pending.length;
  document.getElementById('count-kds-kitchen').textContent = kitchen.length;
  document.getElementById('count-kds-ready').textContent = ready.length;
  document.getElementById('count-kds-delivered').textContent = delivered.length;

  pendingCol.innerHTML = renderKDSCards(pending, 'In Kitchen', 'Start Cooking <i class="fa-solid fa-fire"></i>');
  kitchenCol.innerHTML = renderKDSCards(kitchen, 'Ready', 'Ready to Serve <i class="fa-solid fa-bell-concierge"></i>');
  readyCol.innerHTML = renderKDSCards(ready, 'Delivered', 'Mark Delivered <i class="fa-solid fa-circle-check"></i>');
  deliveredCol.innerHTML = renderKDSCards(delivered, null, null);
}

function renderKDSCards(list, nextStatus, nextLabel) {
  if (list.length === 0) {
    return `<div style="text-align: center; padding: 40px 0; color: var(--text-dim); font-size: 0.85rem;">No Tickets</div>`;
  }

  return list.map(o => {
    let items = o.items || [];
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch(e) { items = []; }
    }

    return `
      <div class="kds-ticket">
        <div class="kds-ticket-top">
          <span class="ticket-code">${o.order_code}</span>
          <span class="ticket-type">${o.order_type}</span>
        </div>
        <div class="ticket-customer">${o.customer_name} ${o.table_number ? '• ' + o.table_number : ''}</div>
        <div class="ticket-items-list">
          ${items.map(i => `
            <div class="ticket-item-line">
              <span>${i.name}</span>
              <span class="ticket-item-qty">${i.qty}x</span>
            </div>
          `).join('')}
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 10px;">
          <span>Total: ₹${o.total_amount}</span> • <span>${o.payment_method || 'Paid'}</span>
        </div>
        ${nextStatus ? `
          <div class="ticket-actions">
            <button class="btn-ticket-step" onclick="updateOrderStatus(${o.id}, '${nextStatus}')">
              ${nextLabel}
            </button>
          </div>
        ` : `<div style="font-size: 0.75rem; color: var(--emerald-green); font-weight: 600;"><i class="fa-solid fa-check-double"></i> Ticket Completed</div>`}
      </div>
    `;
  }).join('');
}

window.updateOrderStatus = async function(orderId, newStatus) {
  try {
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    showAdminToast(`Order status updated to ${newStatus}`);
    fetchOrders(true);
    fetchDashboardKPIs();
  } catch (err) {
    alert("Could not update order status");
  }
};

function playKitchenOrderChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch(e) {}
}

/* --- 6. RESERVATIONS MANAGEMENT --- */
async function fetchReservations(silent = false) {
  try {
    const res = await fetch('/api/admin/reservations');
    const json = await res.json();
    if (json.success) {
      adminState.reservations = json.data;
      renderReservationsTable(adminState.reservations);
    }
  } catch (err) {
    console.warn("Could not load reservations:", err);
  }
}

function renderReservationsTable(list) {
  const tbody = document.getElementById('admin-reservations-tbody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px;">No reservations found</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td><strong>${r.booking_code}</strong></td>
      <td>
        <div style="font-weight: 600;">${r.customer_name}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${r.phone} • ${r.email}</div>
      </td>
      <td><strong>${r.guests}</strong> Guests</td>
      <td>
        <div>${r.reservation_date}</div>
        <div style="font-size: 0.8rem; color: var(--gold);">${r.reservation_time}</div>
      </td>
      <td>
        <div>${r.seating_area}</div>
        ${r.occasion !== 'None' ? `<div style="font-size: 0.75rem; color: var(--saffron);">${r.occasion}</div>` : ''}
      </td>
      <td>
        <select onchange="updateReservationStatus(${r.id}, this.value)" style="background: var(--admin-card); color: #fff; border: 1px solid var(--admin-border-subtle); padding: 4px 8px; border-radius: 8px; font-size: 0.82rem;">
          <option value="Confirmed" ${r.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Seated" ${r.status === 'Seated' ? 'selected' : ''}>Seated</option>
          <option value="Completed" ${r.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Pending" ${r.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Cancelled" ${r.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="tbl-action-btn delete" onclick="deleteReservation(${r.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

window.updateReservationStatus = async function(id, status) {
  try {
    await fetch(`/api/admin/reservations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showAdminToast(`Reservation status updated to ${status}`);
    fetchDashboardKPIs();
  } catch (err) {
    alert("Could not update reservation");
  }
};

window.deleteReservation = async function(id) {
  if (!confirm(`Are you sure you want to delete reservation #${id}?`)) return;
  try {
    await fetch(`/api/admin/reservations/${id}`, { method: 'DELETE' });
    showAdminToast("Reservation deleted");
    fetchReservations();
    fetchDashboardKPIs();
  } catch (err) {
    alert("Could not delete reservation");
  }
};

/* --- 7. MENU MANAGEMENT (CRUD) --- */
async function fetchMenu() {
  try {
    const res = await fetch('/api/admin/menu');
    const json = await res.json();
    if (json.success) {
      adminState.menu = json.data;
      renderAdminMenuTable(adminState.menu);
    }
  } catch (err) {
    console.warn("Could not load admin menu:", err);
  }
}

function renderAdminMenuTable(items) {
  const tbody = document.getElementById('admin-menu-tbody');
  if (!tbody) return;

  tbody.innerHTML = items.map(dish => `
    <tr>
      <td>
        <img src="${dish.image_url}" alt="${dish.name}" class="dish-tbl-thumb">
      </td>
      <td>
        <div style="font-weight: 600; font-size: 0.95rem;">${dish.name}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${dish.prep_time} • ${dish.calories || 400} kcal</div>
      </td>
      <td><span style="font-size: 0.82rem; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.08);">${dish.category}</span></td>
      <td>
        <span class="status-badge ${dish.dietary.toLowerCase().replace(/[^a-z]/g, '-')}">${dish.dietary}</span>
      </td>
      <td><strong>₹${dish.price}</strong></td>
      <td>
        <label class="switch">
          <input type="checkbox" ${dish.is_available ? 'checked' : ''} onchange="toggleDishAvailability(${dish.id})">
          <span class="slider"></span>
        </label>
      </td>
      <td>
        <div style="display: flex; gap: 8px;">
          <button class="tbl-action-btn" onclick="openEditDishModal(${dish.id})" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="tbl-action-btn delete" onclick="deleteDish(${dish.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.toggleDishAvailability = async function(id) {
  try {
    await fetch(`/api/admin/menu/${id}/toggle`, { method: 'PATCH' });
    showAdminToast("Availability status updated");
  } catch (err) {
    alert("Could not toggle availability");
  }
};

window.deleteDish = async function(id) {
  if (!confirm(`Are you sure you want to remove dish #${id} from the menu?`)) return;
  try {
    await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
    showAdminToast("Dish removed from menu");
    fetchMenu();
  } catch (err) {
    alert("Could not delete dish");
  }
};

/* --- 8. REVIEWS & MESSAGES --- */
async function fetchMessages() {
  try {
    const res = await fetch('/api/admin/messages');
    const json = await res.json();
    if (json.success) {
      adminState.messages = json.data;
      renderAdminMessages(adminState.messages);
    }
  } catch (err) {
    console.warn("Could not load messages:", err);
  }
}

function renderAdminMessages(msgs) {
  const container = document.getElementById('admin-messages-list');
  if (!container) return;

  if (msgs.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px;">No customer inquiries</div>`;
    return;
  }

  container.innerHTML = msgs.map(m => `
    <div style="background: var(--admin-card); border: 1px solid var(--admin-border-subtle); border-radius: 16px; padding: 20px; margin-bottom: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <div>
          <div style="font-weight: 700; font-size: 1.05rem;">${m.subject}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">From: <strong>${m.sender_name}</strong> (${m.phone} • ${m.email})</div>
        </div>
        <span class="status-badge ${m.status === 'Unread' ? 'pending' : 'confirmed'}">${m.status}</span>
      </div>
      <p style="color: var(--text-main); font-size: 0.92rem; line-height: 1.6; margin-bottom: 14px;">"${m.message}"</p>
      <div style="display: flex; gap: 10px;">
        <button class="btn-admin btn-admin-outline" onclick="markMessageStatus(${m.id}, 'Responded')">
          <i class="fa-solid fa-reply"></i> Mark Responded
        </button>
      </div>
    </div>
  `).join('');
}

window.markMessageStatus = async function(id, status) {
  try {
    await fetch(`/api/admin/messages/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showAdminToast(`Inquiry marked as ${status}`);
    fetchMessages();
  } catch (err) {
    alert("Could not update message");
  }
};

async function fetchReviews() {
  try {
    const res = await fetch('/api/admin/reviews');
    const json = await res.json();
    if (json.success) {
      adminState.reviews = json.data;
      renderAdminReviews(adminState.reviews);
    }
  } catch (err) {
    console.warn("Could not load reviews:", err);
  }
}

function renderAdminReviews(revs) {
  const container = document.getElementById('admin-reviews-list');
  if (!container) return;

  container.innerHTML = revs.map(r => `
    <div style="background: var(--admin-card); border: 1px solid var(--admin-border-subtle); border-radius: 16px; padding: 20px; margin-bottom: 14px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div style="font-weight: 700;">${r.customer_name} <span style="color: var(--gold); margin-left: 8px;">${'★'.repeat(r.rating)}</span></div>
        <span class="status-badge ${r.status === 'Approved' ? 'confirmed' : 'cancelled'}">${r.status}</span>
      </div>
      <p style="font-size: 0.92rem; color: var(--text-main); margin-bottom: 10px;">"${r.review_text}"</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.8rem; color: var(--saffron);">Dish: ${r.dish_recommended || "Chef Special"}</div>
        <button class="btn-admin btn-admin-outline" style="padding: 6px 12px; font-size: 0.78rem;" onclick="toggleReviewStatus(${r.id}, '${r.status === 'Approved' ? 'Hidden' : 'Approved'}')">
          ${r.status === 'Approved' ? 'Hide Review' : 'Approve & Feature'}
        </button>
      </div>
    </div>
  `).join('');
}

window.toggleReviewStatus = async function(id, status) {
  try {
    await fetch(`/api/admin/reviews/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showAdminToast(`Review updated to ${status}`);
    fetchReviews();
  } catch (err) {
    alert("Could not update review");
  }
};

/* --- 9. MODALS & FORMS --- */
function initModals() {
  // Add Dish Modal
  document.getElementById('btn-add-dish-modal')?.addEventListener('click', () => {
    openDishFormModal();
  });

  // Add Walk-In Reservation Modal
  document.getElementById('btn-add-res-modal')?.addEventListener('click', () => {
    openWalkInModal();
  });
}

function openDishFormModal(dish = null) {
  const isEdit = !!dish;
  const modal = document.getElementById('admin-modal-container');
  if (!modal) return;

  modal.innerHTML = `
    <div class="admin-modal-backdrop active" id="dish-form-modal">
      <div class="admin-modal-box">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">${isEdit ? 'Edit Culinary Dish' : 'Add New Culinary Creation'}</h3>
          <button class="modal-close-icon" onclick="closeAdminModal('dish-form-modal')"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <form id="dish-crud-form" onsubmit="handleDishFormSubmit(event, ${isEdit ? dish.id : 'null'})">
          <div class="admin-form-group">
            <label>Dish Name *</label>
            <input type="text" id="df-name" class="admin-input" required value="${dish ? dish.name : ''}" placeholder="e.g. Saffron Butter Garlic Prawns">
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Category *</label>
              <select id="df-cat" class="admin-input">
                <option value="Starters" ${dish && dish.category === 'Starters' ? 'selected' : ''}>Starters</option>
                <option value="Coastal Seafood" ${dish && dish.category === 'Coastal Seafood' ? 'selected' : ''}>Coastal Seafood</option>
                <option value="Progressive Mains" ${dish && dish.category === 'Progressive Mains' ? 'selected' : ''}>Progressive Mains</option>
                <option value="Breads & Biryanis" ${dish && dish.category === 'Breads & Biryanis' ? 'selected' : ''}>Breads & Biryanis</option>
                <option value="Decadent Desserts" ${dish && dish.category === 'Decadent Desserts' ? 'selected' : ''}>Decadent Desserts</option>
                <option value="Beverages" ${dish && dish.category === 'Beverages' ? 'selected' : ''}>Beverages</option>
              </select>
            </div>
            <div class="admin-form-group">
              <label>Dietary Tag *</label>
              <select id="df-diet" class="admin-input">
                <option value="Veg" ${dish && dish.dietary === 'Veg' ? 'selected' : ''}>Veg</option>
                <option value="Non-Veg" ${dish && dish.dietary === 'Non-Veg' ? 'selected' : ''}>Non-Veg</option>
                <option value="Chef's Special" ${dish && dish.dietary === "Chef's Special" ? 'selected' : ''}>Chef's Special</option>
                <option value="Vegan" ${dish && dish.dietary === 'Vegan' ? 'selected' : ''}>Vegan</option>
              </select>
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Price (₹ INR) *</label>
              <input type="number" id="df-price" class="admin-input" required value="${dish ? dish.price : ''}" placeholder="850">
            </div>
            <div class="admin-form-group">
              <label>Preparation Time</label>
              <input type="text" id="df-prep" class="admin-input" value="${dish ? dish.prep_time : '15-20 min'}" placeholder="15-20 min">
            </div>
          </div>

          <div class="admin-form-group">
            <label>Description & Story</label>
            <textarea id="df-desc" class="admin-input" rows="3" placeholder="Artistic preparation, key flavors...">${dish ? dish.description : ''}</textarea>
          </div>

          <div class="admin-form-group">
            <label>Ingredients</label>
            <input type="text" id="df-ing" class="admin-input" value="${dish ? dish.ingredients : ''}" placeholder="Key herbs, spices, catch...">
          </div>

          <div class="admin-form-group">
            <label>High-Resolution Image URL (Unsplash or CDN)</label>
            <input type="url" id="df-img" class="admin-input" value="${dish ? dish.image_url : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85'}">
          </div>

          <button type="submit" class="btn-admin btn-admin-saffron" style="width: 100%; justify-content: center; margin-top: 10px;">
            ${isEdit ? 'Update Dish' : 'Publish Dish to Menu'}
          </button>
        </form>
      </div>
    </div>
  `;
}

window.openEditDishModal = function(id) {
  const dish = adminState.menu.find(d => d.id === id);
  if (dish) openDishFormModal(dish);
};

window.handleDishFormSubmit = async function(e, editId) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('df-name').value.trim(),
    category: document.getElementById('df-cat').value,
    dietary: document.getElementById('df-diet').value,
    price: parseFloat(document.getElementById('df-price').value),
    prep_time: document.getElementById('df-prep').value.trim(),
    description: document.getElementById('df-desc').value.trim(),
    ingredients: document.getElementById('df-ing').value.trim(),
    image_url: document.getElementById('df-img').value.trim()
  };

  try {
    if (editId) {
      await fetch(`/api/admin/menu/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showAdminToast("Dish updated successfully");
    } else {
      await fetch(`/api/admin/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showAdminToast("New dish added to menu");
    }
    closeAdminModal('dish-form-modal');
    fetchMenu();
  } catch (err) {
    alert("Could not save dish");
  }
};

function openWalkInModal() {
  const modal = document.getElementById('admin-modal-container');
  if (!modal) return;

  const today = new Date().toISOString().split('T')[0];

  modal.innerHTML = `
    <div class="admin-modal-backdrop active" id="walkin-modal">
      <div class="admin-modal-box">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Book Walk-In / Phone Table</h3>
          <button class="modal-close-icon" onclick="closeAdminModal('walkin-modal')"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <form id="walkin-form" onsubmit="handleWalkInSubmit(event)">
          <div class="admin-form-group">
            <label>Guest Name *</label>
            <input type="text" id="wk-name" class="admin-input" required placeholder="Guest Full Name">
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Phone *</label>
              <input type="tel" id="wk-phone" class="admin-input" required placeholder="9820012345">
            </div>
            <div class="admin-form-group">
              <label>Guests Count *</label>
              <input type="number" id="wk-guests" class="admin-input" min="1" max="25" value="2" required>
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Date *</label>
              <input type="date" id="wk-date" class="admin-input" value="${today}" required>
            </div>
            <div class="admin-form-group">
              <label>Time Slot *</label>
              <select id="wk-time" class="admin-input">
                <option value="13:00">1:00 PM (Lunch)</option>
                <option value="14:00">2:00 PM (Lunch)</option>
                <option value="17:30">5:30 PM (Sunset)</option>
                <option value="19:30">7:30 PM (Dinner)</option>
                <option value="20:30" selected>8:30 PM (Dinner)</option>
                <option value="21:30">9:30 PM (Late Dinner)</option>
              </select>
            </div>
          </div>

          <div class="admin-form-group">
            <label>Seating Area *</label>
            <select id="wk-area" class="admin-input">
              <option value="Seaside Terrace">Seaside Terrace (Panoramic Arabian Sea View)</option>
              <option value="Indoor Fine Dining">Indoor Fine Dining Glasshouse</option>
              <option value="Sunset Deck">Sunset Deck Lounge</option>
              <option value="Private VIP Lounge">Private VIP Wine Cellar</option>
            </select>
          </div>

          <button type="submit" class="btn-admin btn-admin-saffron" style="width: 100%; justify-content: center; margin-top: 10px;">
            Confirm Reservation
          </button>
        </form>
      </div>
    </div>
  `;
}

window.handleWalkInSubmit = async function(e) {
  e.preventDefault();
  const payload = {
    customer_name: document.getElementById('wk-name').value.trim(),
    phone: document.getElementById('wk-phone').value.trim(),
    email: 'walkin@ivorytable.com',
    guests: document.getElementById('wk-guests').value,
    reservation_date: document.getElementById('wk-date').value,
    reservation_time: document.getElementById('wk-time').value,
    seating_area: document.getElementById('wk-area').value,
    occasion: 'Walk-In',
    status: 'Confirmed'
  };

  try {
    await fetch('/api/admin/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showAdminToast("Walk-in table reserved successfully");
    closeAdminModal('walkin-modal');
    fetchReservations();
    fetchDashboardKPIs();
  } catch (err) {
    alert("Could not book reservation");
  }
};

window.closeAdminModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
};

function showAdminToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99999;
    background: var(--admin-card);
    border: 1.5px solid var(--gold);
    color: #FFF8F0;
    padding: 12px 20px;
    border-radius: var(--radius-full);
    font-size: 0.88rem;
    font-weight: 600;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--gold);"></i> ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}
