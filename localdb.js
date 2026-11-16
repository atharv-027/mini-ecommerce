/* ==========================================================================
   LOCAL FALLBACK DATABASE
   Used automatically whenever the backend server can't be reached.
   Every function here mirrors what the real backend API returns, so the
   rest of the site doesn't need to know which one answered.

   Once you deploy the backend (see DEPLOYMENT.md) and update
   js/config.js, the site will talk to the real SQL database instead —
   nothing else needs to change.
   ========================================================================== */

const LDB_KEYS = {
  users: 'ldb_users',
  products: 'ldb_products',
  orders: 'ldb_orders',
  wishlist: 'ldb_wishlist',
  conversations: 'ldb_conversations',
  messages: 'ldb_messages'
};

function ldbRead(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
}
function ldbWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Seed data imported from ecommerce_single_table.sql
const SEED_USERS = [
  {
    "id": "D001",
    "name": "Demo Dealer",
    "email": "dealer@shop.com",
    "password": "Dealer@123",
    "role": "dealer",
    "joinedDate": "2026-06-01",
    "phone": "9800000001",
    "gender": "",
    "dob": "",
    "address": "12 MG Road, Pune",
    "bio": "",
    "shopName": "Demo Electronics",
    "shopAddress": "12 MG Road, Pune",
    "shopPhone": "9800000001"
  },
  {
    "id": "D002",
    "name": "Anita Deshmukh",
    "email": "anita@fashionhub.com",
    "password": "Dealer@123",
    "role": "dealer",
    "joinedDate": "2026-06-03",
    "phone": "9800000002",
    "gender": "",
    "dob": "",
    "address": "45 FC Road, Pune",
    "bio": "",
    "shopName": "Fashion Hub",
    "shopAddress": "45 FC Road, Pune",
    "shopPhone": "9800000002"
  },
  {
    "id": "D003",
    "name": "Vikram Nair",
    "email": "vikram@homeandmore.com",
    "password": "Dealer@123",
    "role": "dealer",
    "joinedDate": "2026-06-05",
    "phone": "9800000003",
    "gender": "",
    "dob": "",
    "address": "8 Baner Road, Pune",
    "bio": "",
    "shopName": "Home & More",
    "shopAddress": "8 Baner Road, Pune",
    "shopPhone": "9800000003"
  },
  {
    "id": "D004",
    "name": "Sunita Rao",
    "email": "sunita@bookbarn.com",
    "password": "Dealer@123",
    "role": "dealer",
    "joinedDate": "2026-06-08",
    "phone": "9800000004",
    "gender": "",
    "dob": "",
    "address": "21 Deccan Gymkhana, Pune",
    "bio": "",
    "shopName": "Book Barn",
    "shopAddress": "21 Deccan Gymkhana, Pune",
    "shopPhone": "9800000004"
  },
  {
    "id": "U001",
    "name": "Rahul Sharma",
    "email": "rahul.sharma@email.com",
    "password": "Password@123",
    "role": "user",
    "joinedDate": "2026-06-20",
    "phone": "9811111101",
    "gender": "Male",
    "dob": "2004-03-14",
    "address": "Kothrud, Pune",
    "bio": "",
    "shopName": "",
    "shopAddress": "",
    "shopPhone": ""
  },
  {
    "id": "U002",
    "name": "Priya Patel",
    "email": "priya.patel@email.com",
    "password": "NewPass@456",
    "role": "user",
    "joinedDate": "2026-06-20",
    "phone": "9811111102",
    "gender": "Female",
    "dob": "2003-11-02",
    "address": "Baner, Pune",
    "bio": "",
    "shopName": "",
    "shopAddress": "",
    "shopPhone": ""
  },
  {
    "id": "U003",
    "name": "Aman Verma",
    "email": "aman.verma@email.com",
    "password": "Password@123",
    "role": "user",
    "joinedDate": "2026-06-20",
    "phone": "9811111103",
    "gender": "Male",
    "dob": "2004-07-21",
    "address": "Wakad, Pune",
    "bio": "",
    "shopName": "",
    "shopAddress": "",
    "shopPhone": ""
  },
  {
    "id": "U004",
    "name": "Sneha Iyer",
    "email": "sneha.iyer@email.com",
    "password": "Password@123",
    "role": "user",
    "joinedDate": "2026-06-20",
    "phone": "9811111104",
    "gender": "Female",
    "dob": "2003-05-30",
    "address": "Hadapsar, Pune",
    "bio": "",
    "shopName": "",
    "shopAddress": "",
    "shopPhone": ""
  },
  {
    "id": "U005",
    "name": "Karan Mehta",
    "email": "karan.mehta@email.com",
    "password": "Password@123",
    "role": "user",
    "joinedDate": "2026-06-20",
    "phone": "9811111105",
    "gender": "Male",
    "dob": "2004-01-09",
    "address": "Viman Nagar, Pune",
    "bio": "",
    "shopName": "",
    "shopAddress": "",
    "shopPhone": ""
  },
  {
    "id": "U006",
    "name": "Neha Kulkarni",
    "email": "neha.kulkarni@email.com",
    "password": "Password@123",
    "role": "user",
    "joinedDate": "2026-06-20",
    "phone": "9811111106",
    "gender": "Female",
    "dob": "2003-09-17",
    "address": "Aundh, Pune",
    "bio": "",
    "shopName": "",
    "shopAddress": "",
    "shopPhone": ""
  },
  {
    "id": "U007",
    "name": "Rohan Joshi",
    "email": "rohan.joshi@email.com",
    "password": "Password@123",
    "role": "user",
    "joinedDate": "2026-06-20",
    "phone": "9811111107",
    "gender": "Male",
    "dob": "2004-12-25",
    "address": "Pashan, Pune",
    "bio": "",
    "shopName": "",
    "shopAddress": "",
    "shopPhone": ""
  },
  {
    "id": "U008",
    "name": "Ishita Gupta",
    "email": "ishita.gupta@email.com",
    "password": "Password@123",
    "role": "user",
    "joinedDate": "2026-06-20",
    "phone": "9811111108",
    "gender": "Female",
    "dob": "2003-02-11",
    "address": "Kalyani Nagar, Pune",
    "bio": "",
    "shopName": "",
    "shopAddress": "",
    "shopPhone": ""
  },
  {
    "id": "U009",
    "name": "Siddharth Rao",
    "email": "siddharth.rao@email.com",
    "password": "Password@123",
    "role": "user",
    "joinedDate": "2026-06-20",
    "phone": "9811111109",
    "gender": "Male",
    "dob": "2004-06-05",
    "address": "Shivajinagar, Pune",
    "bio": "",
    "shopName": "",
    "shopAddress": "",
    "shopPhone": ""
  },
  {
    "id": "U010",
    "name": "Meera Nair",
    "email": "meera.nair@email.com",
    "password": "Password@123",
    "role": "user",
    "joinedDate": "2026-06-20",
    "phone": "9811111110",
    "gender": "Female",
    "dob": "2003-08-19",
    "address": "Camp, Pune",
    "bio": "",
    "shopName": "",
    "shopAddress": "",
    "shopPhone": ""
  }
];

const SEED_PRODUCTS = [
  {
    "id": "101",
    "title": "Wireless Headphones",
    "description": "Noise cancelling over-ear headphones.",
    "price": 89.99,
    "category": "Electronics",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "dealer@shop.com",
    "dealerName": "Demo Dealer",
    "date": "2026-06-02"
  },
  {
    "id": "102",
    "title": "Smartwatch",
    "description": "Fitness tracker with heart rate monitor.",
    "price": 199.99,
    "category": "Electronics",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "dealer@shop.com",
    "dealerName": "Demo Dealer",
    "date": "2026-06-02"
  },
  {
    "id": "103",
    "title": "Bluetooth Speaker",
    "description": "Portable waterproof speaker, 12-hour battery.",
    "price": 49.99,
    "category": "Electronics",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "dealer@shop.com",
    "dealerName": "Demo Dealer",
    "date": "2026-06-10"
  },
  {
    "id": "104",
    "title": "Laptop Backpack",
    "description": "Water-resistant backpack with 15.6-inch laptop sleeve.",
    "price": 34.5,
    "category": "Electronics",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "dealer@shop.com",
    "dealerName": "Demo Dealer",
    "date": "2026-06-12"
  },
  {
    "id": "105",
    "title": "Smartphone 128GB",
    "description": "6.5-inch AMOLED display, 50MP camera.",
    "price": 349.0,
    "category": "Mobiles",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "dealer@shop.com",
    "dealerName": "Demo Dealer",
    "date": "2026-06-15"
  },
  {
    "id": "106",
    "title": "Fast Charger 33W",
    "description": "USB-C fast charger with cable.",
    "price": 14.99,
    "category": "Mobiles",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "dealer@shop.com",
    "dealerName": "Demo Dealer",
    "date": "2026-06-15"
  },
  {
    "id": "107",
    "title": "Phone Case",
    "description": "Shockproof transparent back cover.",
    "price": 7.99,
    "category": "Mobiles",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "dealer@shop.com",
    "dealerName": "Demo Dealer",
    "date": "2026-06-16"
  },
  {
    "id": "108",
    "title": "Mechanical Keyboard",
    "description": "RGB backlit keyboard with blue switches.",
    "price": 59.0,
    "category": "Electronics",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "dealer@shop.com",
    "dealerName": "Demo Dealer",
    "date": "2026-06-20"
  },
  {
    "id": "109",
    "title": "Men Cotton T-Shirt",
    "description": "Regular fit round-neck cotton t-shirt.",
    "price": 12.99,
    "category": "Fashion",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "anita@fashionhub.com",
    "dealerName": "Anita Deshmukh",
    "date": "2026-06-04"
  },
  {
    "id": "110",
    "title": "Women Kurti",
    "description": "Printed cotton kurti, all sizes.",
    "price": 24.99,
    "category": "Fashion",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "anita@fashionhub.com",
    "dealerName": "Anita Deshmukh",
    "date": "2026-06-04"
  },
  {
    "id": "111",
    "title": "Running Shoes",
    "description": "Lightweight breathable running shoes.",
    "price": 44.99,
    "category": "Fashion",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "anita@fashionhub.com",
    "dealerName": "Anita Deshmukh",
    "date": "2026-06-09"
  },
  {
    "id": "112",
    "title": "Denim Jacket",
    "description": "Classic blue denim jacket, unisex.",
    "price": 39.99,
    "category": "Fashion",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "anita@fashionhub.com",
    "dealerName": "Anita Deshmukh",
    "date": "2026-06-14"
  },
  {
    "id": "113",
    "title": "Sunglasses",
    "description": "UV400 polarized sunglasses.",
    "price": 15.5,
    "category": "Fashion",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "anita@fashionhub.com",
    "dealerName": "Anita Deshmukh",
    "date": "2026-06-18"
  },
  {
    "id": "114",
    "title": "Yoga Mat",
    "description": "6mm non-slip yoga mat with carry strap.",
    "price": 18.0,
    "category": "Sports & Fitness",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "anita@fashionhub.com",
    "dealerName": "Anita Deshmukh",
    "date": "2026-06-21"
  },
  {
    "id": "115",
    "title": "Dumbbell Set 10kg",
    "description": "Adjustable rubber-coated dumbbell pair.",
    "price": 42.0,
    "category": "Sports & Fitness",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "vikram@homeandmore.com",
    "dealerName": "Vikram Nair",
    "date": "2026-06-06"
  },
  {
    "id": "116",
    "title": "Non-Stick Cookware Set",
    "description": "3-piece non-stick pan set with lids.",
    "price": 54.99,
    "category": "Home & Kitchen",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "vikram@homeandmore.com",
    "dealerName": "Vikram Nair",
    "date": "2026-06-06"
  },
  {
    "id": "117",
    "title": "Electric Kettle 1.5L",
    "description": "Stainless steel auto shut-off kettle.",
    "price": 22.75,
    "category": "Home & Kitchen",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "vikram@homeandmore.com",
    "dealerName": "Vikram Nair",
    "date": "2026-06-11"
  },
  {
    "id": "118",
    "title": "LED Desk Lamp",
    "description": "Dimmable LED lamp with USB charging port.",
    "price": 19.99,
    "category": "Home & Kitchen",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "vikram@homeandmore.com",
    "dealerName": "Vikram Nair",
    "date": "2026-06-13"
  },
  {
    "id": "119",
    "title": "Face Wash 100ml",
    "description": "Gentle daily face wash for all skin types.",
    "price": 5.99,
    "category": "Beauty & Personal Care",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "vikram@homeandmore.com",
    "dealerName": "Vikram Nair",
    "date": "2026-06-19"
  },
  {
    "id": "120",
    "title": "Building Blocks 500pcs",
    "description": "Creative building block set for kids 6+.",
    "price": 26.0,
    "category": "Toys & Games",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "vikram@homeandmore.com",
    "dealerName": "Vikram Nair",
    "date": "2026-06-22"
  },
  {
    "id": "121",
    "title": "Board Game - Strategy",
    "description": "Family strategy board game for 2-6 players.",
    "price": 29.99,
    "category": "Toys & Games",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "vikram@homeandmore.com",
    "dealerName": "Vikram Nair",
    "date": "2026-06-23"
  },
  {
    "id": "122",
    "title": "Database System Concepts",
    "description": "Textbook covering relational databases and SQL.",
    "price": 45.0,
    "category": "Books",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "sunita@bookbarn.com",
    "dealerName": "Sunita Rao",
    "date": "2026-06-09"
  },
  {
    "id": "123",
    "title": "Fundamentals of Database Systems",
    "description": "Elmasri & Navathe, 7th edition.",
    "price": 42.5,
    "category": "Books",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "sunita@bookbarn.com",
    "dealerName": "Sunita Rao",
    "date": "2026-06-09"
  },
  {
    "id": "124",
    "title": "Atomic Habits",
    "description": "Self-help bestseller on building good habits.",
    "price": 11.99,
    "category": "Books",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "sunita@bookbarn.com",
    "dealerName": "Sunita Rao",
    "date": "2026-06-17"
  },
  {
    "id": "125",
    "title": "Python Programming Crash Course",
    "description": "Hands-on introduction to Python.",
    "price": 28.0,
    "category": "Books",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "sunita@bookbarn.com",
    "dealerName": "Sunita Rao",
    "date": "2026-06-17"
  },
  {
    "id": "126",
    "title": "Organic Green Tea 100 bags",
    "description": "Antioxidant-rich organic green tea.",
    "price": 9.99,
    "category": "Grocery",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "sunita@bookbarn.com",
    "dealerName": "Sunita Rao",
    "date": "2026-06-24"
  },
  {
    "id": "127",
    "title": "Car Phone Holder",
    "description": "Dashboard magnetic mobile holder.",
    "price": 8.75,
    "category": "Automotive",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "sunita@bookbarn.com",
    "dealerName": "Sunita Rao",
    "date": "2026-06-25"
  },
  {
    "id": "128",
    "title": "Tyre Inflator Portable",
    "description": "12V digital portable tyre inflator.",
    "price": 31.0,
    "category": "Automotive",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "sunita@bookbarn.com",
    "dealerName": "Sunita Rao",
    "date": "2026-06-25"
  },
  {
    "id": "129",
    "title": "Wall Clock",
    "description": "Silent quartz wall clock, 30cm.",
    "price": 13.5,
    "category": "Home & Kitchen",
    "image": "https://via.placeholder.com/150",
    "dealerEmail": "vikram@homeandmore.com",
    "dealerName": "Vikram Nair",
    "date": "2026-06-26"
  }
];

const SEED_ORDERS = [
  {
    "id": "ORD10000001",
    "userEmail": "rahul.sharma@email.com",
    "total": 97.98,
    "status": "Delivered",
    "custName": "Rahul Sharma",
    "custMobile": "9811111101",
    "custAddress": "Flat 21, Kothrud, Pune",
    "custPincode": "411038",
    "date": "2026-07-25",
    "items": [
      {
        "productId": "101",
        "title": "Wireless Headphones",
        "price": 89.99,
        "dealerEmail": "dealer@shop.com"
      },
      {
        "productId": "107",
        "title": "Phone Case",
        "price": 7.99,
        "dealerEmail": "dealer@shop.com"
      }
    ]
  },
  {
    "id": "ORD10000002",
    "userEmail": "priya.patel@email.com",
    "total": 40.49,
    "status": "Delivered",
    "custName": "Priya Patel",
    "custMobile": "9811111102",
    "custAddress": "Flat 10, Baner, Pune",
    "custPincode": "411045",
    "date": "2026-07-26",
    "items": [
      {
        "productId": "110",
        "title": "Women Kurti",
        "price": 24.99,
        "dealerEmail": "anita@fashionhub.com"
      },
      {
        "productId": "113",
        "title": "Sunglasses",
        "price": 15.5,
        "dealerEmail": "anita@fashionhub.com"
      }
    ]
  },
  {
    "id": "ORD10000003",
    "userEmail": "aman.verma@email.com",
    "total": 45.0,
    "status": "Delivered",
    "custName": "Aman Verma",
    "custMobile": "9811111103",
    "custAddress": "Flat 26, Wakad, Pune",
    "custPincode": "411057",
    "date": "2026-07-26",
    "items": [
      {
        "productId": "122",
        "title": "Database System Concepts",
        "price": 45.0,
        "dealerEmail": "sunita@bookbarn.com"
      }
    ]
  },
  {
    "id": "ORD10000004",
    "userEmail": "sneha.iyer@email.com",
    "total": 77.74,
    "status": "Delivered",
    "custName": "Sneha Iyer",
    "custMobile": "9811111104",
    "custAddress": "Flat 4, Hadapsar, Pune",
    "custPincode": "411028",
    "date": "2026-07-27",
    "items": [
      {
        "productId": "116",
        "title": "Non-Stick Cookware Set",
        "price": 54.99,
        "dealerEmail": "vikram@homeandmore.com"
      },
      {
        "productId": "117",
        "title": "Electric Kettle 1.5L",
        "price": 22.75,
        "dealerEmail": "vikram@homeandmore.com"
      }
    ]
  },
  {
    "id": "ORD10000005",
    "userEmail": "karan.mehta@email.com",
    "total": 363.99,
    "status": "Delivered",
    "custName": "Karan Mehta",
    "custMobile": "9811111105",
    "custAddress": "Flat 5, Viman Nagar, Pune",
    "custPincode": "411014",
    "date": "2026-08-02",
    "items": [
      {
        "productId": "105",
        "title": "Smartphone 128GB",
        "price": 349.0,
        "dealerEmail": "dealer@shop.com"
      },
      {
        "productId": "106",
        "title": "Fast Charger 33W",
        "price": 14.99,
        "dealerEmail": "dealer@shop.com"
      }
    ]
  },
  {
    "id": "ORD10000006",
    "userEmail": "neha.kulkarni@email.com",
    "total": 82.49,
    "status": "Delivered",
    "custName": "Neha Kulkarni",
    "custMobile": "9811111106",
    "custAddress": "Flat 35, Aundh, Pune",
    "custPincode": "411007",
    "date": "2026-08-05",
    "items": [
      {
        "productId": "124",
        "title": "Atomic Habits",
        "price": 11.99,
        "dealerEmail": "sunita@bookbarn.com"
      },
      {
        "productId": "125",
        "title": "Python Programming Crash Course",
        "price": 28.0,
        "dealerEmail": "sunita@bookbarn.com"
      },
      {
        "productId": "123",
        "title": "Fundamentals of Database Systems",
        "price": 42.5,
        "dealerEmail": "sunita@bookbarn.com"
      }
    ]
  },
  {
    "id": "ORD10000007",
    "userEmail": "rohan.joshi@email.com",
    "total": 44.99,
    "status": "Out for Delivery",
    "custName": "Rohan Joshi",
    "custMobile": "9811111107",
    "custAddress": "Flat 7, Pashan, Pune",
    "custPincode": "411021",
    "date": "2026-08-09",
    "items": [
      {
        "productId": "111",
        "title": "Running Shoes",
        "price": 44.99,
        "dealerEmail": "anita@fashionhub.com"
      }
    ]
  },
  {
    "id": "ORD10000008",
    "userEmail": "ishita.gupta@email.com",
    "total": 60.0,
    "status": "Delivered",
    "custName": "Ishita Gupta",
    "custMobile": "9811111108",
    "custAddress": "Flat 24, Kalyani Nagar, Pune",
    "custPincode": "411006",
    "date": "2026-08-12",
    "items": [
      {
        "productId": "114",
        "title": "Yoga Mat",
        "price": 18.0,
        "dealerEmail": "anita@fashionhub.com"
      },
      {
        "productId": "115",
        "title": "Dumbbell Set 10kg",
        "price": 42.0,
        "dealerEmail": "vikram@homeandmore.com"
      }
    ]
  },
  {
    "id": "ORD10000009",
    "userEmail": "siddharth.rao@email.com",
    "total": 249.98,
    "status": "Shipped",
    "custName": "Siddharth Rao",
    "custMobile": "9811111109",
    "custAddress": "Flat 38, Shivajinagar, Pune",
    "custPincode": "411005",
    "date": "2026-08-18",
    "items": [
      {
        "productId": "102",
        "title": "Smartwatch",
        "price": 199.99,
        "dealerEmail": "dealer@shop.com"
      },
      {
        "productId": "103",
        "title": "Bluetooth Speaker",
        "price": 49.99,
        "dealerEmail": "dealer@shop.com"
      }
    ]
  },
  {
    "id": "ORD10000010",
    "userEmail": "meera.nair@email.com",
    "total": 52.98,
    "status": "Shipped",
    "custName": "Meera Nair",
    "custMobile": "9811111110",
    "custAddress": "Flat 4, Camp, Pune",
    "custPincode": "411001",
    "date": "2026-08-21",
    "items": [
      {
        "productId": "112",
        "title": "Denim Jacket",
        "price": 39.99,
        "dealerEmail": "anita@fashionhub.com"
      },
      {
        "productId": "109",
        "title": "Men Cotton T-Shirt",
        "price": 12.99,
        "dealerEmail": "anita@fashionhub.com"
      }
    ]
  },
  {
    "id": "ORD10000011",
    "userEmail": "rahul.sharma@email.com",
    "total": 59.0,
    "status": "Packed",
    "custName": "Rahul Sharma",
    "custMobile": "9811111101",
    "custAddress": "Flat 33, Kothrud, Pune",
    "custPincode": "411038",
    "date": "2026-09-01",
    "items": [
      {
        "productId": "108",
        "title": "Mechanical Keyboard",
        "price": 59.0,
        "dealerEmail": "dealer@shop.com"
      }
    ]
  },
  {
    "id": "ORD10000012",
    "userEmail": "priya.patel@email.com",
    "total": 55.99,
    "status": "Packed",
    "custName": "Priya Patel",
    "custMobile": "9811111102",
    "custAddress": "Flat 14, Baner, Pune",
    "custPincode": "411045",
    "date": "2026-09-04",
    "items": [
      {
        "productId": "120",
        "title": "Building Blocks 500pcs",
        "price": 26.0,
        "dealerEmail": "vikram@homeandmore.com"
      },
      {
        "productId": "121",
        "title": "Board Game - Strategy",
        "price": 29.99,
        "dealerEmail": "vikram@homeandmore.com"
      }
    ]
  },
  {
    "id": "ORD10000013",
    "userEmail": "aman.verma@email.com",
    "total": 54.49,
    "status": "Shipped",
    "custName": "Aman Verma",
    "custMobile": "9811111103",
    "custAddress": "Flat 3, Wakad, Pune",
    "custPincode": "411057",
    "date": "2026-09-10",
    "items": [
      {
        "productId": "104",
        "title": "Laptop Backpack",
        "price": 34.5,
        "dealerEmail": "dealer@shop.com"
      },
      {
        "productId": "118",
        "title": "LED Desk Lamp",
        "price": 19.99,
        "dealerEmail": "vikram@homeandmore.com"
      }
    ]
  },
  {
    "id": "ORD10000014",
    "userEmail": "karan.mehta@email.com",
    "total": 18.74,
    "status": "Order Placed",
    "custName": "Karan Mehta",
    "custMobile": "9811111105",
    "custAddress": "Flat 6, Viman Nagar, Pune",
    "custPincode": "411014",
    "date": "2026-09-15",
    "items": [
      {
        "productId": "127",
        "title": "Car Phone Holder",
        "price": 8.75,
        "dealerEmail": "sunita@bookbarn.com"
      },
      {
        "productId": "126",
        "title": "Organic Green Tea 100 bags",
        "price": 9.99,
        "dealerEmail": "sunita@bookbarn.com"
      }
    ]
  },
  {
    "id": "ORD10000015",
    "userEmail": "neha.kulkarni@email.com",
    "total": 30.98,
    "status": "Order Placed",
    "custName": "Neha Kulkarni",
    "custMobile": "9811111106",
    "custAddress": "Flat 28, Aundh, Pune",
    "custPincode": "411007",
    "date": "2026-09-20",
    "items": [
      {
        "productId": "119",
        "title": "Face Wash 100ml",
        "price": 5.99,
        "dealerEmail": "vikram@homeandmore.com"
      },
      {
        "productId": "110",
        "title": "Women Kurti",
        "price": 24.99,
        "dealerEmail": "anita@fashionhub.com"
      }
    ]
  },
  {
    "id": "ORD10000016",
    "userEmail": "sneha.iyer@email.com",
    "total": 120.99,
    "status": "Order Placed",
    "custName": "Sneha Iyer",
    "custMobile": "9811111104",
    "custAddress": "Flat 27, Hadapsar, Pune",
    "custPincode": "411028",
    "date": "2026-09-25",
    "items": [
      {
        "productId": "128",
        "title": "Tyre Inflator Portable",
        "price": 31.0,
        "dealerEmail": "sunita@bookbarn.com"
      },
      {
        "productId": "101",
        "title": "Wireless Headphones",
        "price": 89.99,
        "dealerEmail": "dealer@shop.com"
      }
    ]
  }
];

const SEED_WISHLIST = [
  {
    "userEmail": "rahul.sharma@email.com",
    "productId": "102"
  },
  {
    "userEmail": "rahul.sharma@email.com",
    "productId": "105"
  },
  {
    "userEmail": "priya.patel@email.com",
    "productId": "111"
  },
  {
    "userEmail": "priya.patel@email.com",
    "productId": "112"
  },
  {
    "userEmail": "aman.verma@email.com",
    "productId": "108"
  },
  {
    "userEmail": "aman.verma@email.com",
    "productId": "123"
  },
  {
    "userEmail": "sneha.iyer@email.com",
    "productId": "101"
  },
  {
    "userEmail": "karan.mehta@email.com",
    "productId": "102"
  },
  {
    "userEmail": "neha.kulkarni@email.com",
    "productId": "110"
  },
  {
    "userEmail": "neha.kulkarni@email.com",
    "productId": "114"
  },
  {
    "userEmail": "ishita.gupta@email.com",
    "productId": "120"
  },
  {
    "userEmail": "siddharth.rao@email.com",
    "productId": "124"
  },
  {
    "userEmail": "meera.nair@email.com",
    "productId": "116"
  },
  {
    "userEmail": "meera.nair@email.com",
    "productId": "113"
  }
];

const SEED_CONVERSATIONS = [
  {
    "id": "C001",
    "title": "Wireless Headphones",
    "productId": "101",
    "participants": [
      "rahul.sharma@email.com",
      "dealer@shop.com"
    ],
    "participants_key": "dealer@shop.com;rahul.sharma@email.com",
    "createdAt": "2026-07-24"
  },
  {
    "id": "C002",
    "title": "Running Shoes",
    "productId": "111",
    "participants": [
      "anita@fashionhub.com",
      "priya.patel@email.com"
    ],
    "participants_key": "anita@fashionhub.com;priya.patel@email.com",
    "createdAt": "2026-08-08"
  },
  {
    "id": "C003",
    "title": "Database System Concepts",
    "productId": "122",
    "participants": [
      "aman.verma@email.com",
      "sunita@bookbarn.com"
    ],
    "participants_key": "aman.verma@email.com;sunita@bookbarn.com",
    "createdAt": "2026-07-25"
  },
  {
    "id": "C004",
    "title": "Smartwatch",
    "productId": "102",
    "participants": [
      "dealer@shop.com",
      "siddharth.rao@email.com"
    ],
    "participants_key": "dealer@shop.com;siddharth.rao@email.com",
    "createdAt": "2026-08-17"
  }
];

const SEED_MESSAGES = [
  {
    "id": "M001",
    "convId": "C001",
    "sender": "rahul.sharma@email.com",
    "text": "Hi, is the headphone available in black?",
    "time": "10:15 AM"
  },
  {
    "id": "M002",
    "convId": "C001",
    "sender": "dealer@shop.com",
    "text": "Yes, black is in stock. I can ship it today.",
    "time": "10:22 AM"
  },
  {
    "id": "M003",
    "convId": "C001",
    "sender": "rahul.sharma@email.com",
    "text": "Great, placing the order now.",
    "time": "10:25 AM"
  },
  {
    "id": "M004",
    "convId": "C002",
    "sender": "priya.patel@email.com",
    "text": "Do these shoes come in size 7?",
    "time": "05:40 PM"
  },
  {
    "id": "M005",
    "convId": "C002",
    "sender": "anita@fashionhub.com",
    "text": "Yes, sizes 6 to 10 are available.",
    "time": "06:05 PM"
  },
  {
    "id": "M006",
    "convId": "C002",
    "sender": "priya.patel@email.com",
    "text": "Thanks! Will order soon.",
    "time": "06:10 PM"
  },
  {
    "id": "M007",
    "convId": "C003",
    "sender": "aman.verma@email.com",
    "text": "Is this the latest edition?",
    "time": "11:00 AM"
  },
  {
    "id": "M008",
    "convId": "C003",
    "sender": "sunita@bookbarn.com",
    "text": "It is the 7th edition, brand new copy.",
    "time": "11:30 AM"
  },
  {
    "id": "M009",
    "convId": "C004",
    "sender": "siddharth.rao@email.com",
    "text": "Does the smartwatch support call notifications?",
    "time": "02:10 PM"
  },
  {
    "id": "M010",
    "convId": "C004",
    "sender": "dealer@shop.com",
    "text": "Yes, it supports calls, messages and app alerts.",
    "time": "02:25 PM"
  },
  {
    "id": "M011",
    "convId": "C004",
    "sender": "siddharth.rao@email.com",
    "text": "Perfect, ordering it.",
    "time": "02:30 PM"
  }
];

function ldbSeed() {
  const products = ldbRead(LDB_KEYS.products);
  // Re-seed if empty or still on the old 2-product demo
  if (products.length <= 2 || !products.some(p => p.id === '103')) {
    ldbWrite(LDB_KEYS.products, SEED_PRODUCTS);
    ldbWrite(LDB_KEYS.users, SEED_USERS);
    ldbWrite(LDB_KEYS.orders, SEED_ORDERS);
    ldbWrite(LDB_KEYS.wishlist, SEED_WISHLIST);
    ldbWrite(LDB_KEYS.conversations, SEED_CONVERSATIONS);
    ldbWrite(LDB_KEYS.messages, SEED_MESSAGES);
  }
}
ldbSeed();

/* ---------------------------- AUTH ---------------------------- */
function ldbRegister({ name, email, password, role, shopName, shopAddress, shopPhone }) {
  const users = ldbRead(LDB_KEYS.users);
  if (users.some(u => u.email === email && u.role === role)) {
    throw new Error('An account with this email already exists for this role.');
  }
  if (role === 'dealer' && !shopName) {
    throw new Error('Shop name is required for dealer accounts.');
  }
  const newUser = {
    id: Date.now().toString(), name: name || email.split('@')[0], email, password, role,
    joinedDate: new Date().toLocaleDateString(),
    phone: '', gender: '', dob: '', address: '', bio: '',
    shopName: role === 'dealer' ? (shopName || '') : '',
    shopAddress: role === 'dealer' ? (shopAddress || '') : '',
    shopPhone: role === 'dealer' ? (shopPhone || '') : ''
  };
  users.push(newUser);
  ldbWrite(LDB_KEYS.users, users);
  const { password: _pw, ...safe } = newUser;
  return safe;
}

function ldbLogin({ email, password, role }) {
  const users = ldbRead(LDB_KEYS.users);
  const user = users.find(u => u.email === email && u.role === role);
  if (!user) throw new Error('No account found for this email/role. Please sign up first.');
  if (user.password !== password) throw new Error('Incorrect password! Please try again.');
  const { password: _pw, ...safe } = user;
  return safe;
}

function ldbGetUser(email, role) {
  const users = ldbRead(LDB_KEYS.users);
  const user = users.find(u => u.email === email && (!role || u.role === role));
  if (!user) throw new Error('User not found.');
  const { password: _pw, ...safe } = user;
  return safe;
}

function ldbUpdateUser(email, role, {
  name, currentPassword, newPassword,
  phone, gender, dob, address, bio,
  shopName, shopAddress, shopPhone
}) {
  const users = ldbRead(LDB_KEYS.users);
  const idx = users.findIndex(u => u.email === email && u.role === role);
  if (idx === -1) throw new Error('User not found.');

  if (newPassword) {
    if (users[idx].password !== currentPassword) throw new Error('Current password is incorrect.');
    users[idx].password = newPassword;
  }
  if (name) users[idx].name = name;
  if (phone !== undefined) users[idx].phone = phone;
  if (gender !== undefined) users[idx].gender = gender;
  if (dob !== undefined) users[idx].dob = dob;
  if (address !== undefined) users[idx].address = address;
  if (bio !== undefined) users[idx].bio = bio;
  if (users[idx].role === 'dealer') {
    if (shopName !== undefined) users[idx].shopName = shopName;
    if (shopAddress !== undefined) users[idx].shopAddress = shopAddress;
    if (shopPhone !== undefined) users[idx].shopPhone = shopPhone;
  }
  ldbWrite(LDB_KEYS.users, users);
  const { password: _pw, ...safe } = users[idx];
  return safe;
}

/* -------------------------- PRODUCTS -------------------------- */
function ldbGetProducts() {
  return ldbRead(LDB_KEYS.products);
}
function ldbGetProduct(id) {
  const p = ldbRead(LDB_KEYS.products).find(p => String(p.id) === String(id));
  if (!p) throw new Error('Product not found.');
  return p;
}
function ldbAddProduct({ title, description, price, category, image, dealerEmail, dealerName }) {
  const products = ldbRead(LDB_KEYS.products);
  const newProduct = { id: Date.now().toString(), title, description: description || '', price, category: category || 'Other', image: image || '', dealerEmail, dealerName: dealerName || dealerEmail, date: new Date().toLocaleDateString() };
  products.unshift(newProduct);
  ldbWrite(LDB_KEYS.products, products);
  return newProduct;
}
function ldbDeleteProduct(id) {
  ldbWrite(LDB_KEYS.products, ldbRead(LDB_KEYS.products).filter(p => String(p.id) !== String(id)));
}
function ldbGetDealerProducts(email) {
  return ldbRead(LDB_KEYS.products).filter(p => p.dealerEmail === email);
}

/* ---------------------------- ORDERS ---------------------------- */
function ldbCreateOrder({ userEmail, items, total, shipping }) {
  const orders = ldbRead(LDB_KEYS.orders);
  const order = {
    id: 'ORD' + Date.now().toString().slice(-8),
    userEmail, total: total || 0, status: 'Order Placed',
    custName: shipping?.name || '', custMobile: shipping?.mobile || '',
    custAddress: shipping?.address || '', custPincode: shipping?.pincode || '',
    date: new Date().toLocaleDateString(),
    items: items.map(i => ({ productId: String(i.id ?? i.productId ?? ''), title: i.title, price: i.price, dealerEmail: i.dealer || i.dealerEmail || '' }))
  };
  orders.unshift(order);
  ldbWrite(LDB_KEYS.orders, orders);
  return order;
}
function ldbGetOrders(email) {
  return ldbRead(LDB_KEYS.orders).filter(o => o.userEmail === email);
}
function ldbGetDealerOrders(email) {
  return ldbRead(LDB_KEYS.orders)
    .filter(o => o.items.some(i => i.dealerEmail === email))
    .map(o => ({ ...o, items: o.items.filter(i => i.dealerEmail === email) }));
}
function ldbUpdateOrderStatus(id, status) {
  const orders = ldbRead(LDB_KEYS.orders);
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Order not found.');
  orders[idx].status = status;
  ldbWrite(LDB_KEYS.orders, orders);
  return orders[idx];
}

/* --------------------------- WISHLIST --------------------------- */
function ldbGetWishlist(email) {
  const ids = ldbRead(LDB_KEYS.wishlist).filter(w => w.userEmail === email).map(w => w.productId);
  return ldbRead(LDB_KEYS.products).filter(p => ids.includes(String(p.id)));
}
function ldbAddWishlist(email, productId) {
  const list = ldbRead(LDB_KEYS.wishlist);
  if (!list.some(w => w.userEmail === email && w.productId === String(productId))) {
    list.push({ userEmail: email, productId: String(productId) });
    ldbWrite(LDB_KEYS.wishlist, list);
  }
}
function ldbRemoveWishlist(email, productId) {
  ldbWrite(LDB_KEYS.wishlist, ldbRead(LDB_KEYS.wishlist).filter(w => !(w.userEmail === email && w.productId === String(productId))));
}

/* ----------------------- CONVERSATIONS / CHAT ----------------------- */
function ldbGetConversations(email) {
  return ldbRead(LDB_KEYS.conversations).filter(c => c.participants.includes(email));
}
function ldbCreateConversation({ participants, title, productId }) {
  const convs = ldbRead(LDB_KEYS.conversations);
  const key = participants.slice().sort().join(';');
  let conv = convs.find(c => c.participants.slice().sort().join(';') === key);
  if (conv) return conv;
  conv = { id: Date.now().toString(), title: title || 'Conversation', productId: productId || null, participants, createdAt: new Date().toISOString() };
  convs.unshift(conv);
  ldbWrite(LDB_KEYS.conversations, convs);
  return conv;
}
function ldbGetMessages(convId) {
  return ldbRead(LDB_KEYS.messages).filter(m => m.convId === convId);
}
function ldbSendMessage({ convId, sender, text }) {
  const messages = ldbRead(LDB_KEYS.messages);
  const msg = { id: Date.now().toString(), convId, sender, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  messages.push(msg);
  ldbWrite(LDB_KEYS.messages, messages);
  return msg;
}
