/* ==========================================================================
   MINI E-COMMERCE - GLOBAL CONFIG

   Edit this ONE file after deploying the backend. Every page/script reads
   API_BASE_URL from here.
   ========================================================================== */

const API_BASE_URL = 'http://localhost:5000';

/* Shared category list used by the store (browse/filter) and the dealer
   "Add Product" form, so both sides always stay in sync. */
const APP_CATEGORIES = [
  { name: 'Electronics', icon: '💻' },
  { name: 'Mobiles', icon: '📱' },
  { name: 'Fashion', icon: '👗' },
  { name: 'Home & Kitchen', icon: '🏠' },
  { name: 'Books', icon: '📚' },
  { name: 'Beauty & Personal Care', icon: '💄' },
  { name: 'Sports & Fitness', icon: '🏋️' },
  { name: 'Toys & Games', icon: '🧸' },
  { name: 'Grocery', icon: '🛒' },
  { name: 'Automotive', icon: '🚗' },
  { name: 'Other', icon: '📦' }
];
