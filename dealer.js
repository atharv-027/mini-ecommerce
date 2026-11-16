/* ==========================================================================
   DEALER DASHBOARD - product management and order fulfillment.
   Talks to the backend when reachable, falls back to js/localdb.js when not.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const session = verifyAccess('dealer');
  if (!session) return;

  const dealerDisplay = document.getElementById('dealerEmail');
  if (dealerDisplay) dealerDisplay.innerText = session.email;

  populateCategoryOptions();

  if (document.getElementById('dealerOrdersList')) loadDealerOrders(session.email);
  if (document.getElementById('myProductsList')) loadMyProducts(session.email);
});

function populateCategoryOptions() {
  const select = document.getElementById('item-category');
  if (!select || typeof APP_CATEGORIES === 'undefined') return;
  select.innerHTML = APP_CATEGORIES.map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`).join('');
}

async function addProduct(event) {
  event.preventDefault();
  const session = JSON.parse(localStorage.getItem('userSession'));
  const submitBtn = event.target.querySelector('button[type="submit"]');

  const payload = {
    title: document.getElementById('item-title').value,
    price: parseFloat(document.getElementById('item-price').value),
    category: document.getElementById('item-category').value,
    image: document.getElementById('item-image').value,
    description: document.getElementById('item-desc').value,
    dealerEmail: session.email,
    dealerName: session.name || session.email
  };

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Publishing...'; }

  try {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Could not publish product.');
        return;
      }
    } catch (networkErr) {
      ldbAddProduct(payload);
    }

    alert('Product posted successfully!');
    document.getElementById('sellForm').reset();
    loadMyProducts(session.email);
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Publish Item'; }
  }
}

async function loadMyProducts(dealerEmail) {
  const container = document.getElementById('myProductsList');
  container.innerHTML = '<p class="empty-state">Loading your products...</p>';

  let products;
  try {
    const response = await fetch(`${API_BASE_URL}/api/dealer/products/${encodeURIComponent(dealerEmail)}`);
    products = await response.json();
  } catch (networkErr) {
    products = ldbGetDealerProducts(dealerEmail);
  }

  if (!products.length) {
    container.innerHTML = '<p class="empty-state">You have not published any products yet.</p>';
    return;
  }

  container.innerHTML = products.map(p => `
    <div style="display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border-color); padding:12px; margin-bottom:10px; border-radius:4px; background:var(--card-bg);">
      <div style="display:flex; align-items:center; gap:15px;">
        <img src="${p.image}" style="width:50px; height:50px; object-fit:contain;">
        <div>
          <strong>${p.title}</strong> - $${Number(p.price).toFixed(2)}
          <br><small style="color:var(--text-muted);">Category: ${p.category}</small>
        </div>
      </div>
      <button onclick="removeProduct('${p.id}')" style="background:var(--danger-color); color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:4px;">Delete Product</button>
    </div>
  `).join('');
}

async function removeProduct(productId) {
  if (!confirm('Are you sure you want to remove this product?')) return;

  try {
    await fetch(`${API_BASE_URL}/api/products/${productId}`, { method: 'DELETE' });
  } catch (networkErr) {
    ldbDeleteProduct(productId);
  }
  const session = JSON.parse(localStorage.getItem('userSession'));
  loadMyProducts(session.email);
  alert('Product removed successfully!');
}

async function loadDealerOrders(dealerEmail) {
  const container = document.getElementById('dealerOrdersList');
  container.innerHTML = '<p class="empty-state">Loading customer orders...</p>';

  let orders;
  try {
    const response = await fetch(`${API_BASE_URL}/api/dealer/orders/${encodeURIComponent(dealerEmail)}`);
    orders = await response.json();
  } catch (networkErr) {
    orders = ldbGetDealerOrders(dealerEmail);
  }

  if (!orders.length) {
    container.innerHTML = `<p class="empty-state">No customer orders found for dealer account: <strong>${dealerEmail}</strong></p>`;
    return;
  }

  const statusOptions = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  container.innerHTML = orders.map(order => `
    <div style="border:1px solid var(--border-color); padding:15px; margin-bottom:15px; border-radius:4px; background:var(--card-bg);">
      <h4 style="color:var(--primary-color); margin-top:0;">Order ID: #${order.id}</h4>
      <p><strong>Customer Account Email:</strong> ${order.userEmail}</p>
      <p><strong>Recipient Name:</strong> ${order.custName || 'N/A'}</p>
      <p><strong>Mobile Number:</strong> ${order.custMobile || 'N/A'}</p>
      <p><strong>Delivery Address:</strong> ${order.custAddress ? `${order.custAddress}, ${order.custPincode}` : 'N/A'}</p>
      <p><strong>Items Purchased:</strong> ${order.items.map(i => `${i.title} ($${Number(i.price).toFixed(2)})`).join(', ')}</p>
      <p><strong>Current Status:</strong> <span class="status-badge status-${order.status.replace(/ /g, '-')}">${order.status}</span></p>

      <div style="margin-top:10px; background:var(--bg-color); padding:10px; border-radius:4px;">
        <label><strong>Update Fulfillment Status:</strong></label>
        <select id="status-select-${order.id}" style="padding:6px; margin-left:10px;">
          ${statusOptions.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <button onclick="updateOrderStatus('${order.id}')" style="background:var(--primary-color); color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:3px; margin-left:5px;">Save Status</button>
      </div>
    </div>
  `).join('');
}

async function updateOrderStatus(orderId) {
  const newStatus = document.getElementById(`status-select-${orderId}`).value;

  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!response.ok) { alert('Could not update order status.'); return; }
  } catch (networkErr) {
    ldbUpdateOrderStatus(orderId, newStatus);
  }

  alert(`Order #${orderId} status updated to: ${newStatus}`);
  const session = JSON.parse(localStorage.getItem('userSession'));
  loadDealerOrders(session.email);
}
