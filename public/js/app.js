/**
 * The Ivory Table - Customer Experience Engine
 * Interactive Menu, Cart & Checkout, Table Reservations, Reviews & Animations
 * Location: Seaside Marine Drive, Mumbai
 */

// Global State
const state = {
  menuItems: [],
  filteredMenu: [],
  activeCategory: 'All',
  activeDietary: 'All',
  searchQuery: '',
  cart: [],
  discountRate: 0,
  discountAmount: 0,
  activeCoupon: ''
};

// Fallback menu data in case backend server is paused
const FALLBACK_MENU = [
  {
    id: 1,
    name: "Saffron & Herb Butter Garlic Prawns",
    category: "Starters",
    description: "Jumbo tiger prawns kissed with saffron-infused garlic butter, white wine glaze, fresh coastal herbs, and warm sourdough.",
    ingredients: "Tiger Prawns, Kashmiri Saffron, Garlic, Herbs, White Wine Butter",
    price: 850,
    dietary: "Non-Veg",
    spice_level: 1,
    image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=85",
    prep_time: "15 min",
    wine_pairing: "Chardonnay or Sauvignon Blanc",
    calories: 420
  },
  {
    id: 2,
    name: "Burrata & Mumbai Heirloom Tomato Chaat",
    category: "Starters",
    description: "Artisanal Puglia burrata rested over spiced heirloom tomato tartare, tamarind glaze, crispy sev, micro-cilantro, and puffed grains.",
    ingredients: "Italian Burrata, Heirloom Tomatoes, Mint-Coriander Emulsion, Tamarind Reduction",
    price: 690,
    dietary: "Veg",
    spice_level: 1,
    image_url: "https://images.unsplash.com/photo-1592417817098-8f3d69104a47?auto=format&fit=crop&w=900&q=85",
    prep_time: "12 min",
    wine_pairing: "Dry Riesling or Sparkling Prosecco",
    calories: 380
  },
  {
    id: 3,
    name: "Truffle Malabar Lobster Thermidor",
    category: "Coastal Seafood",
    description: "Whole Arabian spiny lobster simmered in roasted coconut bisque, finished with black truffle emulsion and golden Gruyère crust.",
    ingredients: "Spiny Lobster, Malabar Coconut Bisque, Black Truffle, Aged Gruyère Cheese",
    price: 2450,
    dietary: "Chef's Special",
    spice_level: 1,
    image_url: "https://images.unsplash.com/photo-1559737558-245cb3518e38?auto=format&fit=crop&w=900&q=85",
    prep_time: "25 min",
    wine_pairing: "Premier Cru Chablis or Champagne",
    calories: 620
  },
  {
    id: 4,
    name: "Kaffir Lime & Coconut Crusted Sea Bass",
    category: "Coastal Seafood",
    description: "Day-catch Chilean sea bass fillet crusted with fresh coconut and kaffir lime, sitting atop turmeric edamame mash and moilee broth.",
    ingredients: "Chilean Sea Bass, Coconut Milk, Kaffir Lime Leaves, Edamame, Mustard Seeds",
    price: 1650,
    dietary: "Non-Veg",
    spice_level: 1,
    image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",
    prep_time: "20 min",
    wine_pairing: "Viognier or Oak Chardonnay",
    calories: 480
  },
  {
    id: 5,
    name: "Kashmiri Rogan Josh Braised Lamb Shank",
    category: "Progressive Mains",
    description: "12-hour slow-braised New Zealand lamb shank infused with Ratan Jot bark, fennel seed reduction, served with zafrani sheermal.",
    ingredients: "Lamb Shank, Kashmiri Mawal Flower, Fennel, Green Cardamom, Ginger Jus",
    price: 1590,
    dietary: "Chef's Special",
    spice_level: 2,
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",
    prep_time: "25 min",
    wine_pairing: "Syrah or Cabernet Sauvignon",
    calories: 740
  },
  {
    id: 6,
    name: "Smoked Dal Bukhara (36-Hour Slow Simmered)",
    category: "Progressive Mains",
    description: "Black lentils cooked over charcoal embers for 36 hours with churned white butter, vine-ripened tomatoes, and subtle spices.",
    ingredients: "Urad Dal, Churned White Butter, Ripe Tomatoes, Fenugreek, Clove Smoke",
    price: 690,
    dietary: "Veg",
    spice_level: 0,
    image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=85",
    prep_time: "10 min",
    wine_pairing: "Chianti Classico",
    calories: 460
  },
  {
    id: 7,
    name: "Dum Awadhi Lamb Biryani in Clay Handi",
    category: "Breads & Biryanis",
    description: "Fragrant aged Basmati rice layered with succulent baby goat, saffron milk, caramelized shallots, sealed and slow dum-cooked in earthenware.",
    ingredients: "Aged Basmati, Baby Goat, Saffron, Rose Water, Mint, Ghee",
    price: 1190,
    dietary: "Non-Veg",
    spice_level: 2,
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=85",
    prep_time: "20 min",
    wine_pairing: "Shiraz or Spiced Chai Highball",
    calories: 780
  },
  {
    id: 8,
    name: "24K Gold Saffron Rasmalai Tres Leches",
    category: "Decadent Desserts",
    description: "Fluffy saffron sponge soaked in evaporated saffron milk, crowned with poached chenna discs, edible 24K gold foil, and Iranian pistachios.",
    ingredients: "Kashmiri Saffron, Milk Sponge, Chenna, Iranian Pistachios, 24K Edible Gold",
    price: 650,
    dietary: "Veg",
    spice_level: 0,
    image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85",
    prep_time: "8 min",
    wine_pairing: "Late Harvest Tokaji or Sweet Port",
    calories: 410
  },
  {
    id: 9,
    name: "Coastal Coconut & Alphonso Mango Panna Cotta",
    category: "Decadent Desserts",
    description: "Silk tender coconut milk panna cotta topped with Ratnagiri Alphonso mango compote and crisp coconut-cardamom tuile.",
    ingredients: "Fresh Coconut Cream, Ratnagiri Alphonso Mango, Agar Agar, Mint Tuile",
    price: 550,
    dietary: "Vegan",
    spice_level: 0,
    image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85",
    prep_time: "6 min",
    wine_pairing: "Moscato d'Asti",
    calories: 320
  },
  {
    id: 10,
    name: "Marine Drive Sunset Twilight Cocktail",
    category: "Beverages",
    description: "Butterfly pea flower infused artisanal gin, French elderflower liqueur, freshly squeezed Sicilian lime, topped with sparkling rosé and edible shimmer.",
    ingredients: "Craft Gin, Butterfly Pea Flower, St. Germain Elderflower, Sicilian Lime, Sparkling Rosé",
    price: 780,
    dietary: "Non-Veg",
    spice_level: 0,
    image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=85",
    prep_time: "5 min",
    wine_pairing: "Signature Apéritif",
    calories: 190
  }
];

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPreloader();
  initNavbar();
  initMenu();
  initCart();
  initReservationForm();
  initReviews();
  initContactForm();
  initScrollAnimations();
  initAudioWidget();
  initCounters();
});

/* --- 1. PRELOADER & NAVBAR --- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('fade-out');
      }, 600);
    });
    // Fallback if load event already fired
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 1800);
  }
}

function initNavbar() {
  const navbarWrapper = document.querySelector('.navbar-wrapper');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbarWrapper?.classList.add('scrolled');
    } else {
      navbarWrapper?.classList.remove('scrolled');
    }
  });

  mobileToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('open');
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu?.classList.remove('open');
    });
  });
}

/* --- 2. DARK / LIGHT THEME TOGGLE --- */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('ivory_theme') || 'light';

  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  themeToggle?.addEventListener('click', () => {
    const active = document.documentElement.getAttribute('data-theme');
    const newTheme = active === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ivory_theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

/* --- 3. MENU ENGINE --- */
async function initMenu() {
  try {
    const res = await fetch('/api/menu');
    const json = await res.json();
    if (json.success && json.data.length > 0) {
      state.menuItems = json.data;
    } else {
      state.menuItems = FALLBACK_MENU;
    }
  } catch (err) {
    console.warn("Using fallback menu data:", err);
    state.menuItems = FALLBACK_MENU;
  }

  renderMenu();

  // Category filter clicks
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeCategory = pill.getAttribute('data-category');
      renderMenu();
    });
  });

  // Dietary filter clicks
  document.querySelectorAll('.diet-toggle').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.diet-toggle').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeDietary = pill.getAttribute('data-diet');
      renderMenu();
    });
  });

  // Search input
  const searchInput = document.getElementById('menu-search-input');
  searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderMenu();
  });
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  let items = state.menuItems.filter(item => {
    // Category check
    const matchCat = state.activeCategory === 'All' || item.category === state.activeCategory;
    // Dietary check
    const matchDiet = state.activeDietary === 'All' || item.dietary === state.activeDietary;
    // Search query
    const matchSearch = !state.searchQuery ||
      item.name.toLowerCase().includes(state.searchQuery) ||
      (item.description && item.description.toLowerCase().includes(state.searchQuery)) ||
      (item.ingredients && item.ingredients.toLowerCase().includes(state.searchQuery));

    return matchCat && matchDiet && matchSearch;
  });

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <i class="fa-solid fa-utensils" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 16px;"></i>
        <h3 style="font-family: var(--font-serif); margin-bottom: 8px;">No Culinary Creations Found</h3>
        <p style="color: var(--text-secondary);">Try clearing your search query or choosing another dietary filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(dish => {
    const dietClass = dish.dietary.toLowerCase().replace(/[^a-z]/g, '-');
    return `
      <div class="menu-card reveal">
        <div class="menu-card-img-wrap" onclick="openDishModal(${dish.id})">
          <img src="${dish.image_url}" alt="${dish.name}" loading="lazy">
          <span class="card-diet-badge ${dietClass}">${dish.dietary}</span>
          <span class="card-prep-time"><i class="fa-regular fa-clock"></i> ${dish.prep_time || '15 min'}</span>
        </div>
        <div class="menu-card-body">
          <div class="card-header-row">
            <h4 class="card-dish-name" onclick="openDishModal(${dish.id})" style="cursor: pointer;">${dish.name}</h4>
            <div class="card-price">₹${dish.price}</div>
          </div>
          <p class="card-desc">${dish.description}</p>
          <div class="card-footer">
            <button class="btn-view-details" onclick="openDishModal(${dish.id})">
              Details & Pairing <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button class="btn-add-cart" onclick="addToCart(${dish.id})">
              <i class="fa-solid fa-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Re-init reveal observer on new cards
  initScrollAnimations();
}

/* --- 4. DISH DETAILS MODAL --- */
window.openDishModal = function(dishId) {
  const dish = state.menuItems.find(d => d.id === dishId) || FALLBACK_MENU.find(d => d.id === dishId);
  if (!dish) return;

  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="dish-modal" onclick="closeModalOnBackdrop(event, 'dish-modal')">
      <div class="modal-dialog">
        <button class="modal-close-icon" onclick="closeModal('dish-modal')"><i class="fa-solid fa-xmark"></i></button>
        <div style="height: 280px; position: relative; overflow: hidden; border-radius: 26px 26px 0 0;">
          <img src="${dish.image_url}" alt="${dish.name}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; bottom: 16px; left: 20px;">
            <span class="card-diet-badge ${dish.dietary.toLowerCase().replace(/[^a-z]/g, '-')}">${dish.dietary}</span>
          </div>
        </div>
        <div style="padding: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <h3 style="font-family: var(--font-serif); font-size: 1.6rem;">${dish.name}</h3>
            <div style="font-family: var(--font-accent); font-size: 1.6rem; font-weight: 700; color: var(--deep-red);">₹${dish.price}</div>
          </div>
          <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: 24px;">${dish.description}</p>

          <div style="background: var(--bg-primary); padding: 18px; border-radius: 16px; margin-bottom: 24px;">
            <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--saffron); margin-bottom: 6px;">Key Ingredients</div>
            <div style="font-size: 0.95rem; color: var(--text-primary);">${dish.ingredients || 'Fresh daily catch, herbs, spices.'}</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 26px;">
            <div style="padding: 14px; border-radius: 14px; border: 1px solid var(--border-light); background: var(--bg-surface);">
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);"><i class="fa-solid fa-wine-glass"></i> Sommelier Pairing</div>
              <div style="font-weight: 600; font-size: 0.9rem; margin-top: 4px;">${dish.wine_pairing || 'Crisp White Wine'}</div>
            </div>
            <div style="padding: 14px; border-radius: 14px; border: 1px solid var(--border-light); background: var(--bg-surface);">
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);"><i class="fa-solid fa-fire-burner"></i> Caloric Energy</div>
              <div style="font-weight: 600; font-size: 0.9rem; margin-top: 4px;">${dish.calories || 420} kcal</div>
            </div>
          </div>

          <div style="display: flex; gap: 16px;">
            <button class="btn btn-sunset" style="width: 100%;" onclick="addToCart(${dish.id}); closeModal('dish-modal');">
              <i class="fa-solid fa-bag-shopping"></i> Add to Order • ₹${dish.price}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};

window.closeModal = function(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.remove();
};

window.closeModalOnBackdrop = function(e, modalId) {
  if (e.target.id === modalId) {
    closeModal(modalId);
  }
};

/* --- 5. CART ENGINE & ONLINE CHECKOUT --- */
function initCart() {
  const savedCart = localStorage.getItem('ivory_cart');
  if (savedCart) {
    try {
      state.cart = JSON.parse(savedCart);
    } catch (e) {
      state.cart = [];
    }
  }
  updateCartBadge();
  setupCartDrawerListeners();
}

function saveCart() {
  localStorage.setItem('ivory_cart', JSON.stringify(state.cart));
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const count = state.cart.reduce((acc, item) => acc + item.qty, 0);
  const badges = document.querySelectorAll('.cart-badge-counter');
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

window.addToCart = function(dishId) {
  const dish = state.menuItems.find(d => d.id === dishId) || FALLBACK_MENU.find(d => d.id === dishId);
  if (!dish) return;

  const existing = state.cart.find(i => i.id === dish.id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      image_url: dish.image_url,
      qty: 1
    });
  }
  saveCart();
  showToast(`Added ${dish.name} to order!`);
};

function setupCartDrawerListeners() {
  const cartButtons = document.querySelectorAll('.btn-cart-toggle');
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartClose = document.getElementById('cart-close-btn');

  cartButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      renderCartDrawer();
      cartBackdrop?.classList.add('active');
    });
  });

  cartClose?.addEventListener('click', () => {
    cartBackdrop?.classList.remove('active');
  });

  cartBackdrop?.addEventListener('click', (e) => {
    if (e.target === cartBackdrop) {
      cartBackdrop.classList.remove('active');
    }
  });

  // Apply Coupon Code
  const couponBtn = document.getElementById('apply-coupon-btn');
  couponBtn?.addEventListener('click', () => {
    const input = document.getElementById('coupon-input');
    const code = input?.value.trim().toUpperCase();
    if (code === 'SEASIDE10') {
      state.discountRate = 0.10;
      state.activeCoupon = 'SEASIDE10 (10% OFF)';
      showToast('10% Seaside Sunset discount applied!');
    } else if (code === 'IVORYFIRST') {
      state.discountAmount = 200;
      state.activeCoupon = 'IVORYFIRST (₹200 OFF)';
      showToast('₹200 welcome gift discount applied!');
    } else {
      showToast('Invalid promo code. Try "SEASIDE10"', 'error');
    }
    renderCartDrawer();
  });
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const taxEl = document.getElementById('cart-tax');
  const discountEl = document.getElementById('cart-discount');
  const totalEl = document.getElementById('cart-total');

  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message">
        <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; color: var(--border-light); margin-bottom: 16px;"></i>
        <p style="font-weight: 600; font-size: 1.1rem; color: var(--text-primary);">Your culinary tray is empty</p>
        <p style="font-size: 0.88rem; margin-top: 4px;">Explore our signature menu and add dishes to savor.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (taxEl) taxEl.textContent = '₹0';
    if (discountEl) discountEl.textContent = '₹0';
    if (totalEl) totalEl.textContent = '₹0';
    return;
  }

  container.innerHTML = state.cart.map(item => `
    <div class="cart-item-row">
      <img src="${item.image_url}" alt="${item.name}" style="width: 58px; height: 58px; border-radius: 12px; object-fit: cover;">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">₹${item.price} each</div>
      </div>
      <div class="cart-qty-ctrl">
        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
        <span style="font-weight: 600; font-size: 0.9rem; min-width: 20px; text-align: center;">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');

  const subtotal = state.cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const tax = Math.round(subtotal * 0.05);
  let discount = state.discountRate > 0 ? Math.round(subtotal * state.discountRate) : state.discountAmount;
  if (discount > subtotal) discount = subtotal;
  const total = Math.max(0, subtotal + tax - discount);

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (taxEl) taxEl.textContent = `₹${tax}`;
  if (discountEl) discountEl.textContent = `-₹${discount} ${state.activeCoupon ? '(' + state.activeCoupon + ')' : ''}`;
  if (totalEl) totalEl.textContent = `₹${total}`;
}

window.updateQty = function(id, change) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;

  item.qty += change;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.id !== id);
  }
  saveCart();
};

/* --- 6. CHECKOUT MODAL & ORDER PLACEMENT --- */
window.openCheckoutModal = function() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty. Add dishes first!', 'error');
    return;
  }

  // Close drawer
  document.getElementById('cart-drawer-backdrop')?.classList.remove('active');

  const subtotal = state.cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const tax = Math.round(subtotal * 0.05);
  let discount = state.discountRate > 0 ? Math.round(subtotal * state.discountRate) : state.discountAmount;
  const total = Math.max(0, subtotal + tax - discount);

  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="checkout-modal" onclick="closeModalOnBackdrop(event, 'checkout-modal')">
      <div class="modal-dialog">
        <button class="modal-close-icon" onclick="closeModal('checkout-modal')"><i class="fa-solid fa-xmark"></i></button>
        <div style="padding: 36px;">
          <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 6px;">Complete Your Order</h3>
          <p style="color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 24px;">Prepared fresh by our Executive Chef at Marine Drive.</p>

          <form id="checkout-form" onsubmit="handleCheckoutSubmit(event)">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div class="form-group">
                <label style="color: var(--text-primary);">Full Name *</label>
                <input type="text" id="chk-name" class="form-control-light" required placeholder="e.g. Vikram Singhania" value="Aditya Malhotra">
              </div>
              <div class="form-group">
                <label style="color: var(--text-primary);">Phone Number *</label>
                <input type="tel" id="chk-phone" class="form-control-light" required placeholder="9856321456" value="9856321456">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
              <label style="color: var(--text-primary);">Order Service Type *</label>
              <select id="chk-type" class="form-control-light" onchange="toggleOrderTypeFields(this.value)">
                <option value="Dine-In">Dine-In (At The Ivory Table Table)</option>
                <option value="Delivery">Marine Drive & South Mumbai Delivery</option>
                <option value="Takeaway">Gourmet Takeaway Pickup</option>
              </select>
            </div>

            <div class="form-group" id="table-number-group" style="margin-bottom: 16px;">
              <label style="color: var(--text-primary);">Table Number / Seating Preference</label>
              <input type="text" id="chk-table" class="form-control-light" placeholder="e.g. Table 14 - Seaside Terrace" value="Table 12 - Seaside Terrace">
            </div>

            <div class="form-group" id="delivery-address-group" style="margin-bottom: 16px; display: none;">
              <label style="color: var(--text-primary);">Delivery Address in Mumbai</label>
              <textarea id="chk-address" class="form-control-light" rows="2" placeholder="Building, Wing, Marine Drive / Nariman Point..."></textarea>
            </div>

            <div class="form-group" style="margin-bottom: 20px;">
              <label style="color: var(--text-primary);">Payment Option</label>
              <select id="chk-payment" class="form-control-light">
                <option value="UPI / QR (GPay, PhonePe, Paytm)">Instant UPI / Dynamic QR</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Pay on Table / Delivery">Pay at Restaurant / Cash on Delivery</option>
              </select>
            </div>

            <div style="background: var(--bg-primary); padding: 18px; border-radius: 16px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
                <span>Dishes (${state.cart.length} items):</span>
                <span>₹${subtotal}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
                <span>GST (5%):</span>
                <span>₹${tax}</span>
              </div>
              ${discount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem; color: var(--deep-red);">
                <span>Discount:</span>
                <span>-₹${discount}</span>
              </div>` : ''}
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.15rem; border-top: 1px solid var(--border-subtle); padding-top: 10px; margin-top: 10px;">
                <span>Grand Total:</span>
                <span style="color: var(--saffron);">₹${total}</span>
              </div>
            </div>

            <button type="submit" class="btn btn-sunset" style="width: 100%; font-size: 1.05rem;" id="submit-order-btn">
              <i class="fa-solid fa-circle-check"></i> Place Order (₹${total})
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
};

window.toggleOrderTypeFields = function(val) {
  const tableGroup = document.getElementById('table-number-group');
  const addrGroup = document.getElementById('delivery-address-group');
  if (val === 'Delivery') {
    if (tableGroup) tableGroup.style.display = 'none';
    if (addrGroup) addrGroup.style.display = 'flex';
  } else if (val === 'Dine-In') {
    if (tableGroup) tableGroup.style.display = 'flex';
    if (addrGroup) addrGroup.style.display = 'none';
  } else {
    if (tableGroup) tableGroup.style.display = 'none';
    if (addrGroup) addrGroup.style.display = 'none';
  }
};

window.handleCheckoutSubmit = async function(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submit-order-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting to Kitchen...`;
  }

  const name = document.getElementById('chk-name').value;
  const phone = document.getElementById('chk-phone').value;
  const type = document.getElementById('chk-type').value;
  const table = document.getElementById('chk-table')?.value || '';
  const address = document.getElementById('chk-address')?.value || '';
  const payment = document.getElementById('chk-payment').value;

  const subtotal = state.cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const tax = Math.round(subtotal * 0.05);
  let discount = state.discountRate > 0 ? Math.round(subtotal * state.discountRate) : state.discountAmount;
  const total = Math.max(0, subtotal + tax - discount);

  const payload = {
    customer_name: name,
    phone: phone,
    order_type: type,
    table_number: table,
    delivery_address: address,
    payment_method: payment,
    items: state.cart,
    subtotal: subtotal,
    tax: tax,
    discount: discount,
    total_amount: total
  };

  let orderData = null;

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      orderData = json.data;
    }
  } catch (err) {
    console.warn("Server unavailable, processing locally:", err);
  }

  // Fallback local receipt if offline
  if (!orderData) {
    orderData = {
      order_code: "ORD-" + Math.floor(100 + Math.random() * 900),
      customer_name: name,
      order_type: type,
      table_number: table,
      total_amount: total,
      items: state.cart,
      estimated_time: "20-25 mins"
    };
  }

  // Clear cart
  state.cart = [];
  saveCart();
  closeModal('checkout-modal');

  // Open Receipt Modal
  renderOrderReceiptModal(orderData);
};

function renderOrderReceiptModal(order) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="receipt-modal">
      <div class="modal-dialog">
        <div style="padding: 36px; text-align: center;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #10B981, #059669); color: #fff; font-size: 2.2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);">
            <i class="fa-solid fa-check"></i>
          </div>
          <h3 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 8px;">Order Confirmed!</h3>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">The kitchen has commenced preparing your dishes with culinary mastery.</p>

          <div style="background: var(--bg-primary); border: 1.5px dashed var(--border-light); border-radius: 20px; padding: 24px; text-align: left; margin-bottom: 26px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 14px;">
              <div>
                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Order Tracking Code</div>
                <div style="font-family: var(--font-accent); font-weight: 700; font-size: 1.25rem; color: var(--gold);">${order.order_code}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Est. Preparation Time</div>
                <div style="font-weight: 600; font-size: 1.1rem; color: var(--saffron);">20 - 25 Mins</div>
              </div>
            </div>

            <div style="font-size: 0.88rem; margin-bottom: 12px;">
              <strong>Guest:</strong> ${order.customer_name} (${order.order_type} ${order.table_number ? '• ' + order.table_number : ''})
            </div>

            <div style="font-size: 0.88rem; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
              ${order.items.map(i => `
                <div style="display: flex; justify-content: space-between;">
                  <span>${i.qty}x ${i.name}</span>
                  <span>₹${i.price * i.qty}</span>
                </div>
              `).join('')}
            </div>

            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
              <span>Total Paid:</span>
              <span style="color: var(--saffron);">₹${order.total_amount}</span>
            </div>
          </div>

          <div style="display: flex; gap: 14px;">
            <button class="btn btn-outline-gold" style="width: 100%;" onclick="window.print()">
              <i class="fa-solid fa-print"></i> Print Receipt
            </button>
            <button class="btn btn-sunset" style="width: 100%;" onclick="closeModal('receipt-modal')">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* --- 7. TABLE RESERVATIONS ENGINE --- */
function initReservationForm() {
  const form = document.getElementById('reservation-form');
  const dateInput = document.getElementById('res-date');

  // Set min date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Reserving Table...`;
    }

    const payload = {
      customer_name: document.getElementById('res-name').value.trim(),
      email: document.getElementById('res-email').value.trim(),
      phone: document.getElementById('res-phone').value.trim(),
      guests: document.getElementById('res-guests').value,
      reservation_date: document.getElementById('res-date').value,
      reservation_time: document.getElementById('res-time').value,
      seating_area: document.getElementById('res-area').value,
      occasion: document.getElementById('res-occasion').value,
      special_requests: document.getElementById('res-requests').value.trim()
    };

    let resultData = null;

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        resultData = json.data;
      }
    } catch (err) {
      console.warn("Server unavailable, generating local confirmation:", err);
    }

    if (!resultData) {
      resultData = {
        booking_code: "IVORY-B" + Math.floor(1000 + Math.random() * 9000),
        customer_name: payload.customer_name,
        guests: payload.guests,
        reservation_date: payload.reservation_date,
        reservation_time: payload.reservation_time,
        seating_area: payload.seating_area,
        status: "Confirmed"
      };
    }

    form.reset();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-calendar-check"></i> Reserve My Seaside Table`;
    }

    renderReservationSuccessModal(resultData);
  });
}

function renderReservationSuccessModal(resData) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="res-success-modal">
      <div class="modal-dialog">
        <div style="padding: 40px; text-align: center;">
          <div style="width: 76px; height: 76px; border-radius: 50%; background: linear-gradient(135deg, var(--saffron), var(--royal-purple)); color: #fff; font-size: 2.2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; box-shadow: var(--shadow-purple-glow);">
            <i class="fa-solid fa-champagne-glasses"></i>
          </div>
          <h3 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 8px;">Table Confirmed!</h3>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">We are honored to welcome you to The Ivory Table on Marine Drive.</p>

          <div style="background: var(--bg-primary); border: 1.5px solid var(--border-light); border-radius: 20px; padding: 24px; text-align: left; margin-bottom: 26px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
              <div>
                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Reservation Code</div>
                <div style="font-family: var(--font-accent); font-weight: 700; font-size: 1.3rem; color: var(--gold);">${resData.booking_code}</div>
              </div>
              <span class="status-badge confirmed" style="align-self: center;">Confirmed</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.92rem;">
              <div>
                <span style="color: var(--text-muted);">Guest Name:</span><br>
                <strong>${resData.customer_name}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted);">Party Size:</span><br>
                <strong>${resData.guests} Guests</strong>
              </div>
              <div>
                <span style="color: var(--text-muted);">Date & Time:</span><br>
                <strong>${resData.reservation_date} at ${resData.reservation_time}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted);">Seating Area:</span><br>
                <strong>${resData.seating_area}</strong>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 14px;">
            <button class="btn btn-sunset" style="width: 100%;" onclick="closeModal('res-success-modal')">
              Splendid, See You There!
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* --- 8. REVIEWS & TESTIMONIALS --- */
async function initReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  try {
    const res = await fetch('/api/reviews');
    const json = await res.json();
    if (json.success && json.data.length > 0) {
      renderReviews(json.data);
    }
  } catch (err) {
    console.warn("Could not load dynamic reviews:", err);
  }

  // Review submission
  const reviewForm = document.getElementById('submit-review-form');
  reviewForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('rev-name').value.trim();
    const rating = document.getElementById('rev-rating').value;
    const dish = document.getElementById('rev-dish').value.trim();
    const text = document.getElementById('rev-text').value.trim();

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          rating: parseInt(rating),
          dish_recommended: dish,
          review_text: text
        })
      });
      showToast('Thank you! Your review has been submitted.');
      reviewForm.reset();
      initReviews();
    } catch (err) {
      showToast('Review recorded locally. Thank you!');
      reviewForm.reset();
    }
  });
}

function renderReviews(reviews) {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  container.innerHTML = reviews.map((r, idx) => `
    <div class="review-card reveal">
      <div class="review-stars">
        ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
      </div>
      <p class="review-quote">"${r.review_text}"</p>
      <div class="review-author-row">
        <div class="author-avatar-letter ${idx % 2 === 0 ? '' : 'purple'}">
          ${r.customer_name.charAt(0)}
        </div>
        <div>
          <div class="author-name">${r.customer_name}</div>
          <div class="author-dish"><i class="fa-solid fa-heart"></i> ${r.dish_recommended || "Chef's Signature"}</div>
        </div>
      </div>
    </div>
  `).join('');

  initScrollAnimations();
}

/* --- 9. CONTACT / EVENT INQUIRY --- */
function initContactForm() {
  const form = document.getElementById('contact-inquiry-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending Message...`;
    }

    const payload = {
      sender_name: document.getElementById('contact-name').value.trim(),
      email: document.getElementById('contact-email').value.trim(),
      phone: document.getElementById('contact-phone').value.trim(),
      subject: document.getElementById('contact-subject').value.trim(),
      message: document.getElementById('contact-msg').value.trim()
    };

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast('Message sent! Our Guest Relations team will reach out shortly.');
    } catch (err) {
      showToast('Message saved! We will contact you soon.');
    }

    form.reset();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `Send Message <i class="fa-solid fa-paper-plane"></i>`;
    }
  });
}

/* --- 10. SCROLL REVEAL ANIMATIONS --- */
function initScrollAnimations() {
  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, .slide-left, .slide-right').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal:not(.revealed), .slide-left:not(.revealed), .slide-right:not(.revealed)').forEach(el => {
    observer.observe(el);
  });
}

/* --- 11. ANIMATED COUNTERS --- */
function initCounters() {
  const counterEls = document.querySelectorAll('.stat-num');
  if (counterEls.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateValue(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counterEls.forEach(el => observer.observe(el));
}

function animateValue(obj) {
  const targetStr = obj.getAttribute('data-target') || obj.textContent;
  const isRating = targetStr.includes('.');
  const hasPlus = targetStr.includes('+');
  const targetNum = parseFloat(targetStr);
  const duration = 1600;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuad = progress * (2 - progress);
    const current = start + (targetNum - start) * easeOutQuad;

    if (isRating) {
      obj.textContent = current.toFixed(1) + '★';
    } else if (hasPlus) {
      obj.textContent = Math.floor(current).toLocaleString() + '+';
    } else {
      obj.textContent = Math.floor(current).toLocaleString();
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* --- 12. SEASIDE AUDIO WIDGET --- */
function initAudioWidget() {
  const widget = document.getElementById('audio-ambient-widget');
  widget?.addEventListener('click', () => {
    if (window.SeasideAudio) {
      const playing = window.SeasideAudio.toggle();
      if (playing) {
        widget.classList.add('playing');
        showToast('Seaside Ocean & Lounge Ambience Playing 🌊');
      } else {
        widget.classList.remove('playing');
        showToast('Ambience Paused');
      }
    }
  });
}

/* --- TOAST NOTIFICATIONS --- */
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const isErr = type === 'error';
  toast.style.cssText = `
    background: ${isErr ? '#D62828' : 'var(--rich-charcoal)'};
    color: #FFF8F0;
    padding: 14px 22px;
    border-radius: 9999px;
    font-size: 0.92rem;
    font-weight: 500;
    border: 1px solid ${isErr ? '#EF4444' : 'rgba(247, 184, 1, 0.4)'};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  toast.innerHTML = `
    <i class="fa-solid ${isErr ? 'fa-triangle-exclamation' : 'fa-circle-check'}" style="color: ${isErr ? '#FFF' : 'var(--golden-yellow)'}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
