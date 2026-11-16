/* ==========================================================================
   AUTH - Login + Sign Up.
   Talks to the real backend when it's reachable; automatically falls back
   to a local (browser-only) database when it isn't, so the site is fully
   usable before the backend is deployed. See js/localdb.js.
   ========================================================================== */

let currentRole = 'user';
let currentMode = 'login';

function switchRole(role, element) {
  currentRole = role;
  document.querySelectorAll('.role-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  updateAuthTitle();
  updateDealerFieldsVisibility();
}

function toggleMode(mode) {
  currentMode = mode;
  const isSignup = mode === 'signup';
  document.getElementById('loginForm').style.display = isSignup ? 'none' : 'block';
  document.getElementById('signupForm').style.display = isSignup ? 'block' : 'none';
  document.getElementById('toggle-login-msg').style.display = isSignup ? 'none' : 'inline';
  document.getElementById('toggle-signup-msg').style.display = isSignup ? 'inline' : 'none';
  updateAuthTitle();
  updateDealerFieldsVisibility();
}

// Dealer sign-ups need a couple of extra shop details; only show/require
// them when signing up specifically as a Dealer.
function updateDealerFieldsVisibility() {
  const dealerFields = document.getElementById('dealerSignupFields');
  if (!dealerFields) return;
  const show = currentMode === 'signup' && currentRole === 'dealer';
  dealerFields.style.display = show ? 'block' : 'none';
  const shopNameInput = document.getElementById('signup-shop-name');
  if (shopNameInput) shopNameInput.required = show;
}

function updateAuthTitle() {
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  if (!title) return;
  const roleLabel = currentRole === 'user' ? 'User' : 'Dealer';
  if (currentMode === 'signup') {
    title.innerText = `Create ${roleLabel} Account`;
    subtitle.innerText = 'Sign up to get started.';
  } else {
    title.innerText = `${roleLabel} Sign In`;
    subtitle.innerText = 'Welcome back — log in to continue.';
  }
}

/* -------------------- LOGIN -------------------- */
async function handleAuth(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Please wait...'; }

  let user;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: currentRole })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.message || 'Login failed. Please try again.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Login'; }
      return;
    }
    user = data;
  } catch (networkErr) {
    // Backend unreachable — use local storage instead
    try {
      user = ldbLogin({ email, password, role: currentRole });
    } catch (localErr) {
      alert(localErr.message);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Login'; }
      return;
    }
  }

  localStorage.setItem('userSession', JSON.stringify(user));
  window.location.href = currentRole === 'user' ? 'store.html' : 'sell-product.html';
}

/* -------------------- SIGN UP -------------------- */
async function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  const submitBtn = event.target.querySelector('button[type="submit"]');

  if (password.length < 8) {
    alert('Password must be at least 8 characters long.');
    return;
  }
  if (password !== confirm) {
    alert('Passwords do not match.');
    return;
  }

  let shopName, shopAddress, shopPhone;
  if (currentRole === 'dealer') {
    shopName = document.getElementById('signup-shop-name').value.trim();
    shopAddress = document.getElementById('signup-shop-address').value.trim();
    shopPhone = document.getElementById('signup-shop-phone').value.trim();
    if (!shopName) {
      alert('Please enter your shop name to create a dealer account.');
      return;
    }
  }

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating account...'; }

  let user;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: currentRole, shopName, shopAddress, shopPhone })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.message || 'Could not create account.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
      return;
    }
    user = data;
  } catch (networkErr) {
    try {
      user = ldbRegister({ name, email, password, role: currentRole, shopName, shopAddress, shopPhone });
    } catch (localErr) {
      alert(localErr.message);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
      return;
    }
  }

  alert('Account created successfully! Logging you in...');
  localStorage.setItem('userSession', JSON.stringify(user));
  window.location.href = currentRole === 'user' ? 'store.html' : 'sell-product.html';
}

function verifyAccess(requiredRole) {
  const session = JSON.parse(localStorage.getItem('userSession') || 'null');
  if (!session || session.role !== requiredRole) {
    alert(`Access denied. Please log in as a ${requiredRole}.`);
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

// For pages usable by BOTH users and dealers (Messages, Profile)
function requireAnySession() {
  const session = JSON.parse(localStorage.getItem('userSession') || 'null');
  if (!session) {
    alert('Please log in first.');
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

function logout() {
  localStorage.removeItem('userSession');
  window.location.href = 'index.html';
}
