/* ==========================================================================
   STORE - Product listing, cart, checkout, and order history.
   Talks to the backend when reachable, falls back to js/localdb.js when not.
   ========================================================================== */

let allProducts = [];
let wishlistIds = [];
let activeCategory = '';

document.addEventListener('DOMContentLoaded', () => {
  const session = verifyAccess('user');
  if (!session) return;

  updateCartCount();

  if (document.getElementById('productGrid')) {
    setupCategoryTiles();
    setupSearchAndFilters();
    loadProducts(session);
  }
  if (document.getElementById('cartList')) loadCart();
  if (document.getElementById('ordersList')) loadOrders(session);
});

/* ------------------- CATEGORY TILES (Amazon/Flipkart-style browse) ------------------- */
function setupCategoryTiles() {
  const container = document.getElementById('categoryTiles');
  if (!container || typeof APP_CATEGORIES === 'undefined') return;

  container.innerHTML = APP_CATEGORIES.map(c => `
    <div class="category-tile" data-category="${c.name}" onclick="selectCategory('${c.name}', this)">
      <span class="category-icon">${c.icon}</span>
      <span>${c.name}</span>
    </div>
  `).join('');

  // Deep-linking: store.html?category=Electronics preselects a category
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get('category');
  if (preselect) {
    activeCategory = preselect;
    document.querySelectorAll('.category-tile').forEach(tile => {
      tile.classList.toggle('active', tile.dataset.category === preselect);
    });
  }
}

function selectCategory(categoryName, tileEl) {
  activeCategory = categoryName;
  document.querySelectorAll('.category-tile').forEach(t => t.classList.remove('active'));
  tileEl.classList.add('active');
  applyFilters();
}

function scrollToCategories() {
  const el = document.getElementById('categorySection');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ------------------- SEARCH + FILTER PANEL ------------------- */
function setupSearchAndFilters() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => applyFilters());
  }
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.addEventListener('change', () => applyFilters());
}

function toggleFilterPanel() {
  const panel = document.getElementById('filterPanel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('minPriceInput').value = '';
  document.getElementById('maxPriceInput').value = '';
  document.getElementById('sortSelect').value = 'newest';
  activeCategory = '';
  document.querySelectorAll('.category-tile').forEach(t => t.classList.remove('active'));
  document.querySelector('.category-tile[data-category=""]')?.classList.add('active');
  applyFilters();
}

function applyFilters() {
  let results = [...allProducts];

  const query = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  if (query) {
    results = results.filter(p =>
      (p.title || '').toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query) ||
      (p.category || '').toLowerCase().includes(query)
    );
  }

  if (activeCategory) {
    results = results.filter(p => p.category === activeCategory);
  }

  const minPrice = parseFloat(document.getElementById('minPriceInput')?.value);
  const maxPrice = parseFloat(document.getElementById('maxPriceInput')?.value);
  if (!isNaN(minPrice)) results = results.filter(p => Number(p.price) >= minPrice);
  if (!isNaN(maxPrice)) results = results.filter(p => Number(p.price) <= maxPrice);

  const sortBy = document.getElementById('sortSelect')?.value || 'newest';
  if (sortBy === 'price-low') results.sort((a, b) => Number(a.price) - Number(b.price));
  else if (sortBy === 'price-high') results.sort((a, b) => Number(b.price) - Number(a.price));
  else if (sortBy === 'name-az') results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

  const summary = document.getElementById('resultsSummary');
  if (summary) {
    const label = activeCategory ? ` in "${activeCategory}"` : '';
    summary.textContent = `${results.length} product${results.length === 1 ? '' : 's'} found${label}`;
  }

  renderProductGrid(results);
}

async function loadProducts(session) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '<p class="empty-state">Loading products...</p>';

  try {
    let products, wishlistProducts;
    try {
      const [productsRes, wishlistRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/products`),
        fetch(`${API_BASE_URL}/api/wishlist/${encodeURIComponent(session.email)}`)
      ]);
      products = await productsRes.json();
      wishlistProducts = wishlistRes.ok ? await wishlistRes.json() : [];
    } catch (networkErr) {
      products = ldbGetProducts();
      wishlistProducts = ldbGetWishlist(session.email);
    }
    allProducts = products;
    wishlistIds = wishlistProducts.map((p) => String(p.id));
    applyFilters();
  } catch (error) {
    grid.innerHTML = '<p class="empty-state">Could not load products.</p>';
  }
}

function renderProductGrid(products) {
  const grid = document.getElementById('productGrid');
  if (!products.length) {
    grid.innerHTML = '<p class="empty-state">No products match your search/filters.</p>';
    return;
  }

  grid.innerHTML = products.map(p => {
    const isWishlisted = wishlistIds.includes(String(p.id));
    return `
    <div class="card" onclick="window.location.href='product-details.html?id=${p.id}'" style="cursor:pointer;">
      <button class="wishlist-heart ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${p.id}', this)" title="Save to wishlist">
        ${isWishlisted ? '♥' : '♡'}
      </button>
      <img src="${p.image}" alt="${p.title}">
      <h4>${p.title}</h4>
      <p style="color:var(--text-muted); font-size:11px; text-transform:uppercase; letter-spacing:0.03em;">${p.category || 'Other'}</p>
      <p style="color:#2874f0; font-size:12px;">Seller: ${p.dealerName || p.dealerEmail}</p>
      <p style="color:#388e3c; font-weight:bold;">$${Number(p.price).toFixed(2)}</p>
      <button class="btn-secondary" onclick="event.stopPropagation(); addToCart('${p.id}')">Add to Cart</button>
    </div>
  `;
  }).join('');
}

async function toggleWishlist(productId, btnEl) {
  const session = JSON.parse(localStorage.getItem('userSession'));
  const isActive = btnEl.classList.contains('active');

  try {
    if (isActive) {
      try {
        await fetch(`${API_BASE_URL}/api/wishlist/${encodeURIComponent(session.email)}/${productId}`, { method: 'DELETE' });
      } catch (networkErr) {
        ldbRemoveWishlist(session.email, productId);
      }
      btnEl.classList.remove('active');
      btnEl.textContent = '♡';
      wishlistIds = wishlistIds.filter((id) => id !== String(productId));
    } else {
      try {
        await fetch(`${API_BASE_URL}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.email, productId })
        });
      } catch (networkErr) {
        ldbAddWishlist(session.email, productId);
      }
      btnEl.classList.add('active');
      btnEl.textContent = '♥';
      wishlistIds.push(String(productId));
    }
  } catch (error) {
    alert('Could not update wishlist. Please try again.');
  }
}

function getCart() {
  return JSON.parse(localStorage.getItem('userCart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('userCart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId) {
  const product = allProducts.find((p) => String(p.id) === String(productId));
  if (!product) return;
  const cart = getCart();
  cart.push(product);
  saveCart(cart);
  alert(`${product.title} added to cart.`);
}

function updateCartCount() {
  const counter = document.getElementById('cartCount');
  if (counter) counter.innerText = getCart().length;
}

function loadCart() {
  const cart = getCart();
  const container = document.getElementById('cartList');

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-state">Your cart is empty.</p>';
    return;
  }

  let total = 0;
  let cartHTML = cart.map((item, index) => {
    total += Number(item.price);
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding:10px 0;">
        <span><strong>${item.title}</strong> - $${Number(item.price).toFixed(2)} (Seller: ${item.dealerName || item.dealerEmail})</span>
        <button onclick="removeFromCart(${index})" style="background:var(--danger-color); color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">Remove</button>
      </div>
    `;
  }).join('');

  cartHTML += `
    <h3>Total Amount: $${total.toFixed(2)}</h3>
    <hr>
    <h3>Delivery Address Details</h3>
    <form id="checkoutForm" onsubmit="processCheckout(event, ${total})">
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="cust-name" required placeholder="John Doe">
      </div>
      <div class="form-group">
        <label>Mobile Number</label>
        <input type="tel" id="cust-mobile" pattern="[0-9]{10}" required placeholder="10-digit mobile number">
      </div>
      <div class="form-group">
        <label>Street Address / House No.</label>
        <textarea id="cust-address" rows="2" required placeholder="Flat, Street, Area"></textarea>
      </div>
      <div class="form-group">
        <label>City & Pincode</label>
        <input type="text" id="cust-pincode" required placeholder="e.g. Mumbai - 400001">
      </div>
      <button type="submit" class="btn-primary">Confirm & Place Order</button>
    </form>
  `;

  container.innerHTML = cartHTML;
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  loadCart();
}

async function processCheckout(event, totalAmount) {
  event.preventDefault();
  const cart = getCart();
  const session = JSON.parse(localStorage.getItem('userSession'));
  const submitBtn = event.target.querySelector('button[type="submit"]');

  const payload = {
    userEmail: session.email,
    items: cart.map((item) => ({ id: item.id, title: item.title, price: item.price, dealer: item.dealerEmail })),
    total: totalAmount,
    shipping: {
      name: document.getElementById('cust-name').value,
      mobile: document.getElementById('cust-mobile').value,
      address: document.getElementById('cust-address').value,
      pincode: document.getElementById('cust-pincode').value
    }
  };

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Placing order...'; }

  try {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Could not place order. Please try again.');
        return;
      }
    } catch (networkErr) {
      ldbCreateOrder(payload);
    }

    localStorage.removeItem('userCart');
    alert('Order placed successfully!');
    window.location.href = 'orders.html';
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Confirm & Place Order'; }
  }
}

async function loadOrders(session) {
  const container = document.getElementById('ordersList');
  container.innerHTML = '<p class="empty-state">Loading your orders...</p>';

  let orders;
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(session.email)}`);
    orders = await response.json();
  } catch (networkErr) {
    orders = ldbGetOrders(session.email);
  }

  if (!orders.length) {
    container.innerHTML = '<p class="empty-state">No orders placed yet.</p>';
    return;
  }

  container.innerHTML = orders.map(order => `
    <div style="border:1px solid var(--border-color); padding:15px; margin-bottom:15px; border-radius:4px; background:var(--card-bg);">
      <h4>Order #${order.id}</h4>
      <p><strong>Date Placed:</strong> ${order.date}</p>
      <p><strong>Ordered Items:</strong> ${order.items.map(i => i.title).join(', ')}</p>
      <p><strong>Total Amount:</strong> $${Number(order.total).toFixed(2)}</p>
      <p><strong>Shipping To:</strong> ${order.custName} (${order.custMobile})</p>
      <p><strong>Delivery Address:</strong> ${order.custAddress}, ${order.custPincode}</p>
      <p><strong>Order Status:</strong> <span class="status-badge status-${order.status.replace(/ /g, '-')}">${order.status}</span></p>
    </div>
  `).join('');
}
