/* ==========================================================================
   MINI E-COMMERCE - BACKEND (Express + SQLite + Socket.IO)
   DBMS Course Project

   This is the real database layer for the site. Every page reads/writes
   through this API instead of localStorage, so data is shared correctly
   across everyone using the deployed site (not stuck on one device).
   ========================================================================== */

const path = require('path');
const fs = require('fs');
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'store.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

/* --------------------------------------------------------------------------
   SCHEMA
   -------------------------------------------------------------------------- */
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',      -- 'user' or 'dealer'
  joinedDate TEXT,
  phone TEXT,
  gender TEXT,
  dob TEXT,
  address TEXT,
  bio TEXT,
  shopName TEXT,
  shopAddress TEXT,
  shopPhone TEXT
)`).run();

// Migration: add any of the extra profile/dealer columns above that don't
// already exist yet (needed for databases created before this update).
const USER_EXTRA_COLUMNS = ['phone', 'gender', 'dob', 'address', 'bio', 'shopName', 'shopAddress', 'shopPhone'];
const existingUserColumns = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
USER_EXTRA_COLUMNS.forEach((col) => {
  if (!existingUserColumns.includes(col)) {
    db.prepare(`ALTER TABLE users ADD COLUMN ${col} TEXT`).run();
  }
});

db.prepare(`CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  price REAL,
  category TEXT,
  image TEXT,
  dealerEmail TEXT,
  dealerName TEXT,
  date TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  userEmail TEXT,
  total REAL,
  status TEXT DEFAULT 'Order Placed',
  custName TEXT,
  custMobile TEXT,
  custAddress TEXT,
  custPincode TEXT,
  date TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId TEXT,
  productId TEXT,
  title TEXT,
  price REAL,
  dealerEmail TEXT,
  FOREIGN KEY (orderId) REFERENCES orders(id)
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS wishlist (
  userEmail TEXT,
  productId TEXT,
  PRIMARY KEY (userEmail, productId)
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT,
  productId TEXT,
  participants_key TEXT UNIQUE,
  createdAt TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS conv_participants (
  convId TEXT,
  email TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  convId TEXT,
  sender TEXT,
  text TEXT,
  time TEXT
)`).run();

// Seed data imported from ecommerce_single_table.sql
const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (productCount <= 2) {
  console.log('Seeding database with records from ecommerce_single_table.sql...');
  const seedDml = `
INSERT INTO users (id, name, email, password, role, joinedDate, phone, gender, dob, address, bio, shopName, shopAddress, shopPhone) VALUES
('D001', 'Demo Dealer', 'dealer@shop.com', 'Dealer@123', 'dealer', '2026-06-01', '9800000001', NULL, NULL, '12 MG Road, Pune', NULL, 'Demo Electronics', '12 MG Road, Pune', '9800000001'),
('D002', 'Anita Deshmukh', 'anita@fashionhub.com', 'Dealer@123', 'dealer', '2026-06-03', '9800000002', NULL, NULL, '45 FC Road, Pune', NULL, 'Fashion Hub', '45 FC Road, Pune', '9800000002'),
('D003', 'Vikram Nair', 'vikram@homeandmore.com', 'Dealer@123', 'dealer', '2026-06-05', '9800000003', NULL, NULL, '8 Baner Road, Pune', NULL, 'Home & More', '8 Baner Road, Pune', '9800000003'),
('D004', 'Sunita Rao', 'sunita@bookbarn.com', 'Dealer@123', 'dealer', '2026-06-08', '9800000004', NULL, NULL, '21 Deccan Gymkhana, Pune', NULL, 'Book Barn', '21 Deccan Gymkhana, Pune', '9800000004'),
('U001', 'Rahul Sharma', 'rahul.sharma@email.com', 'Password@123', 'user', '2026-06-20', '9811111101', 'Male', '2004-03-14', 'Kothrud, Pune', NULL, NULL, NULL, NULL),
('U002', 'Priya Patel', 'priya.patel@email.com', 'Password@123', 'user', '2026-06-20', '9811111102', 'Female', '2003-11-02', 'Baner, Pune', NULL, NULL, NULL, NULL),
('U003', 'Aman Verma', 'aman.verma@email.com', 'Password@123', 'user', '2026-06-20', '9811111103', 'Male', '2004-07-21', 'Wakad, Pune', NULL, NULL, NULL, NULL),
('U004', 'Sneha Iyer', 'sneha.iyer@email.com', 'Password@123', 'user', '2026-06-20', '9811111104', 'Female', '2003-05-30', 'Hadapsar, Pune', NULL, NULL, NULL, NULL),
('U005', 'Karan Mehta', 'karan.mehta@email.com', 'Password@123', 'user', '2026-06-20', '9811111105', 'Male', '2004-01-09', 'Viman Nagar, Pune', NULL, NULL, NULL, NULL),
('U006', 'Neha Kulkarni', 'neha.kulkarni@email.com', 'Password@123', 'user', '2026-06-20', '9811111106', 'Female', '2003-09-17', 'Aundh, Pune', NULL, NULL, NULL, NULL),
('U007', 'Rohan Joshi', 'rohan.joshi@email.com', 'Password@123', 'user', '2026-06-20', '9811111107', 'Male', '2004-12-25', 'Pashan, Pune', NULL, NULL, NULL, NULL),
('U008', 'Ishita Gupta', 'ishita.gupta@email.com', 'Password@123', 'user', '2026-06-20', '9811111108', 'Female', '2003-02-11', 'Kalyani Nagar, Pune', NULL, NULL, NULL, NULL),
('U009', 'Siddharth Rao', 'siddharth.rao@email.com', 'Password@123', 'user', '2026-06-20', '9811111109', 'Male', '2004-06-05', 'Shivajinagar, Pune', NULL, NULL, NULL, NULL),
('U010', 'Meera Nair', 'meera.nair@email.com', 'Password@123', 'user', '2026-06-20', '9811111110', 'Female', '2003-08-19', 'Camp, Pune', NULL, NULL, NULL, NULL);
INSERT INTO products (id, title, description, price, category, image, dealerEmail, dealerName, date) VALUES
('101', 'Wireless Headphones', 'Noise cancelling over-ear headphones.', 89.99, 'Electronics', 'https://via.placeholder.com/150', 'dealer@shop.com', 'Demo Dealer', '2026-06-02'),
('102', 'Smartwatch', 'Fitness tracker with heart rate monitor.', 199.99, 'Electronics', 'https://via.placeholder.com/150', 'dealer@shop.com', 'Demo Dealer', '2026-06-02'),
('103', 'Bluetooth Speaker', 'Portable waterproof speaker, 12-hour battery.', 49.99, 'Electronics', 'https://via.placeholder.com/150', 'dealer@shop.com', 'Demo Dealer', '2026-06-10'),
('104', 'Laptop Backpack', 'Water-resistant backpack with 15.6-inch laptop sleeve.', 34.50, 'Electronics', 'https://via.placeholder.com/150', 'dealer@shop.com', 'Demo Dealer', '2026-06-12'),
('105', 'Smartphone 128GB', '6.5-inch AMOLED display, 50MP camera.', 349.00, 'Mobiles', 'https://via.placeholder.com/150', 'dealer@shop.com', 'Demo Dealer', '2026-06-15'),
('106', 'Fast Charger 33W', 'USB-C fast charger with cable.', 14.99, 'Mobiles', 'https://via.placeholder.com/150', 'dealer@shop.com', 'Demo Dealer', '2026-06-15'),
('107', 'Phone Case', 'Shockproof transparent back cover.', 7.99, 'Mobiles', 'https://via.placeholder.com/150', 'dealer@shop.com', 'Demo Dealer', '2026-06-16'),
('108', 'Mechanical Keyboard', 'RGB backlit keyboard with blue switches.', 59.00, 'Electronics', 'https://via.placeholder.com/150', 'dealer@shop.com', 'Demo Dealer', '2026-06-20'),
('109', 'Men Cotton T-Shirt', 'Regular fit round-neck cotton t-shirt.', 12.99, 'Fashion', 'https://via.placeholder.com/150', 'anita@fashionhub.com', 'Anita Deshmukh', '2026-06-04'),
('110', 'Women Kurti', 'Printed cotton kurti, all sizes.', 24.99, 'Fashion', 'https://via.placeholder.com/150', 'anita@fashionhub.com', 'Anita Deshmukh', '2026-06-04'),
('111', 'Running Shoes', 'Lightweight breathable running shoes.', 44.99, 'Fashion', 'https://via.placeholder.com/150', 'anita@fashionhub.com', 'Anita Deshmukh', '2026-06-09'),
('112', 'Denim Jacket', 'Classic blue denim jacket, unisex.', 39.99, 'Fashion', 'https://via.placeholder.com/150', 'anita@fashionhub.com', 'Anita Deshmukh', '2026-06-14'),
('113', 'Sunglasses', 'UV400 polarized sunglasses.', 15.50, 'Fashion', 'https://via.placeholder.com/150', 'anita@fashionhub.com', 'Anita Deshmukh', '2026-06-18'),
('114', 'Yoga Mat', '6mm non-slip yoga mat with carry strap.', 18.00, 'Sports & Fitness', 'https://via.placeholder.com/150', 'anita@fashionhub.com', 'Anita Deshmukh', '2026-06-21'),
('115', 'Dumbbell Set 10kg', 'Adjustable rubber-coated dumbbell pair.', 42.00, 'Sports & Fitness', 'https://via.placeholder.com/150', 'vikram@homeandmore.com', 'Vikram Nair', '2026-06-06'),
('116', 'Non-Stick Cookware Set', '3-piece non-stick pan set with lids.', 54.99, 'Home & Kitchen', 'https://via.placeholder.com/150', 'vikram@homeandmore.com', 'Vikram Nair', '2026-06-06'),
('117', 'Electric Kettle 1.5L', 'Stainless steel auto shut-off kettle.', 22.75, 'Home & Kitchen', 'https://via.placeholder.com/150', 'vikram@homeandmore.com', 'Vikram Nair', '2026-06-11'),
('118', 'LED Desk Lamp', 'Dimmable LED lamp with USB charging port.', 19.99, 'Home & Kitchen', 'https://via.placeholder.com/150', 'vikram@homeandmore.com', 'Vikram Nair', '2026-06-13'),
('119', 'Face Wash 100ml', 'Gentle daily face wash for all skin types.', 5.99, 'Beauty & Personal Care', 'https://via.placeholder.com/150', 'vikram@homeandmore.com', 'Vikram Nair', '2026-06-19'),
('120', 'Building Blocks 500pcs', 'Creative building block set for kids 6+.', 26.00, 'Toys & Games', 'https://via.placeholder.com/150', 'vikram@homeandmore.com', 'Vikram Nair', '2026-06-22'),
('121', 'Board Game - Strategy', 'Family strategy board game for 2-6 players.', 29.99, 'Toys & Games', 'https://via.placeholder.com/150', 'vikram@homeandmore.com', 'Vikram Nair', '2026-06-23'),
('122', 'Database System Concepts', 'Textbook covering relational databases and SQL.', 45.00, 'Books', 'https://via.placeholder.com/150', 'sunita@bookbarn.com', 'Sunita Rao', '2026-06-09'),
('123', 'Fundamentals of Database Systems', 'Elmasri & Navathe, 7th edition.', 42.50, 'Books', 'https://via.placeholder.com/150', 'sunita@bookbarn.com', 'Sunita Rao', '2026-06-09'),
('124', 'Atomic Habits', 'Self-help bestseller on building good habits.', 11.99, 'Books', 'https://via.placeholder.com/150', 'sunita@bookbarn.com', 'Sunita Rao', '2026-06-17'),
('125', 'Python Programming Crash Course', 'Hands-on introduction to Python.', 28.00, 'Books', 'https://via.placeholder.com/150', 'sunita@bookbarn.com', 'Sunita Rao', '2026-06-17'),
('126', 'Organic Green Tea 100 bags', 'Antioxidant-rich organic green tea.', 9.99, 'Grocery', 'https://via.placeholder.com/150', 'sunita@bookbarn.com', 'Sunita Rao', '2026-06-24'),
('127', 'Car Phone Holder', 'Dashboard magnetic mobile holder.', 8.75, 'Automotive', 'https://via.placeholder.com/150', 'sunita@bookbarn.com', 'Sunita Rao', '2026-06-25'),
('128', 'Tyre Inflator Portable', '12V digital portable tyre inflator.', 31.00, 'Automotive', 'https://via.placeholder.com/150', 'sunita@bookbarn.com', 'Sunita Rao', '2026-06-25'),
('129', 'Wall Clock', 'Silent quartz wall clock, 30cm.', 13.50, 'Home & Kitchen', 'https://via.placeholder.com/150', 'vikram@homeandmore.com', 'Vikram Nair', '2026-06-26'),
('130', 'Notebook Set of 5', 'Ruled A5 notebooks, 200 pages each.', 6.25, 'Other', 'https://via.placeholder.com/150', 'sunita@bookbarn.com', 'Sunita Rao', '2026-06-27');
INSERT INTO orders (id, userEmail, total, status, custName, custMobile, custAddress, custPincode, date) VALUES
('ORD10000001', 'rahul.sharma@email.com', 97.98, 'Delivered', 'Rahul Sharma', '9811111101', 'Flat 21, Kothrud, Pune', '411038', '2026-07-25'),
('ORD10000002', 'priya.patel@email.com', 40.49, 'Delivered', 'Priya Patel', '9811111102', 'Flat 10, Baner, Pune', '411045', '2026-07-26'),
('ORD10000003', 'aman.verma@email.com', 45.00, 'Delivered', 'Aman Verma', '9811111103', 'Flat 26, Wakad, Pune', '411057', '2026-07-26'),
('ORD10000004', 'sneha.iyer@email.com', 77.74, 'Delivered', 'Sneha Iyer', '9811111104', 'Flat 4, Hadapsar, Pune', '411028', '2026-07-27'),
('ORD10000005', 'karan.mehta@email.com', 363.99, 'Delivered', 'Karan Mehta', '9811111105', 'Flat 5, Viman Nagar, Pune', '411014', '2026-08-02'),
('ORD10000006', 'neha.kulkarni@email.com', 82.49, 'Delivered', 'Neha Kulkarni', '9811111106', 'Flat 35, Aundh, Pune', '411007', '2026-08-05'),
('ORD10000007', 'rohan.joshi@email.com', 44.99, 'Out for Delivery', 'Rohan Joshi', '9811111107', 'Flat 7, Pashan, Pune', '411021', '2026-08-09'),
('ORD10000008', 'ishita.gupta@email.com', 60.00, 'Delivered', 'Ishita Gupta', '9811111108', 'Flat 24, Kalyani Nagar, Pune', '411006', '2026-08-12'),
('ORD10000009', 'siddharth.rao@email.com', 249.98, 'Shipped', 'Siddharth Rao', '9811111109', 'Flat 38, Shivajinagar, Pune', '411005', '2026-08-18'),
('ORD10000010', 'meera.nair@email.com', 52.98, 'Shipped', 'Meera Nair', '9811111110', 'Flat 4, Camp, Pune', '411001', '2026-08-21'),
('ORD10000011', 'rahul.sharma@email.com', 59.00, 'Packed', 'Rahul Sharma', '9811111101', 'Flat 33, Kothrud, Pune', '411038', '2026-09-01'),
('ORD10000012', 'priya.patel@email.com', 55.99, 'Packed', 'Priya Patel', '9811111102', 'Flat 14, Baner, Pune', '411045', '2026-09-04'),
('ORD10000013', 'aman.verma@email.com', 54.49, 'Order Placed', 'Aman Verma', '9811111103', 'Flat 3, Wakad, Pune', '411057', '2026-09-10'),
('ORD10000014', 'karan.mehta@email.com', 18.74, 'Order Placed', 'Karan Mehta', '9811111105', 'Flat 6, Viman Nagar, Pune', '411014', '2026-09-15'),
('ORD10000015', 'neha.kulkarni@email.com', 30.98, 'Order Placed', 'Neha Kulkarni', '9811111106', 'Flat 28, Aundh, Pune', '411007', '2026-09-20'),
('ORD10000016', 'sneha.iyer@email.com', 120.99, 'Order Placed', 'Sneha Iyer', '9811111104', 'Flat 27, Hadapsar, Pune', '411028', '2026-09-25');
INSERT INTO order_items (orderId, productId, title, price, dealerEmail) VALUES
('ORD10000001', '101', 'Wireless Headphones', 89.99, 'dealer@shop.com'),
('ORD10000001', '107', 'Phone Case', 7.99, 'dealer@shop.com'),
('ORD10000002', '110', 'Women Kurti', 24.99, 'anita@fashionhub.com'),
('ORD10000002', '113', 'Sunglasses', 15.50, 'anita@fashionhub.com'),
('ORD10000003', '122', 'Database System Concepts', 45.00, 'sunita@bookbarn.com'),
('ORD10000004', '116', 'Non-Stick Cookware Set', 54.99, 'vikram@homeandmore.com'),
('ORD10000004', '117', 'Electric Kettle 1.5L', 22.75, 'vikram@homeandmore.com'),
('ORD10000005', '105', 'Smartphone 128GB', 349.00, 'dealer@shop.com'),
('ORD10000005', '106', 'Fast Charger 33W', 14.99, 'dealer@shop.com'),
('ORD10000006', '124', 'Atomic Habits', 11.99, 'sunita@bookbarn.com'),
('ORD10000006', '125', 'Python Programming Crash Course', 28.00, 'sunita@bookbarn.com'),
('ORD10000006', '123', 'Fundamentals of Database Systems', 42.50, 'sunita@bookbarn.com'),
('ORD10000007', '111', 'Running Shoes', 44.99, 'anita@fashionhub.com'),
('ORD10000008', '114', 'Yoga Mat', 18.00, 'anita@fashionhub.com'),
('ORD10000008', '115', 'Dumbbell Set 10kg', 42.00, 'vikram@homeandmore.com'),
('ORD10000009', '102', 'Smartwatch', 199.99, 'dealer@shop.com'),
('ORD10000009', '103', 'Bluetooth Speaker', 49.99, 'dealer@shop.com'),
('ORD10000010', '112', 'Denim Jacket', 39.99, 'anita@fashionhub.com'),
('ORD10000010', '109', 'Men Cotton T-Shirt', 12.99, 'anita@fashionhub.com'),
('ORD10000011', '108', 'Mechanical Keyboard', 59.00, 'dealer@shop.com'),
('ORD10000012', '120', 'Building Blocks 500pcs', 26.00, 'vikram@homeandmore.com'),
('ORD10000012', '121', 'Board Game - Strategy', 29.99, 'vikram@homeandmore.com'),
('ORD10000013', '104', 'Laptop Backpack', 34.50, 'dealer@shop.com'),
('ORD10000013', '118', 'LED Desk Lamp', 19.99, 'vikram@homeandmore.com'),
('ORD10000014', '127', 'Car Phone Holder', 8.75, 'sunita@bookbarn.com'),
('ORD10000014', '126', 'Organic Green Tea 100 bags', 9.99, 'sunita@bookbarn.com'),
('ORD10000015', '119', 'Face Wash 100ml', 5.99, 'vikram@homeandmore.com'),
('ORD10000015', '110', 'Women Kurti', 24.99, 'anita@fashionhub.com'),
('ORD10000016', '128', 'Tyre Inflator Portable', 31.00, 'sunita@bookbarn.com'),
('ORD10000016', '101', 'Wireless Headphones', 89.99, 'dealer@shop.com');
INSERT INTO wishlist (userEmail, productId) VALUES
('rahul.sharma@email.com', '102'),
('rahul.sharma@email.com', '105'),
('priya.patel@email.com', '111'),
('priya.patel@email.com', '112'),
('aman.verma@email.com', '108'),
('aman.verma@email.com', '123'),
('sneha.iyer@email.com', '101'),
('karan.mehta@email.com', '102'),
('neha.kulkarni@email.com', '110'),
('neha.kulkarni@email.com', '114'),
('rohan.joshi@email.com', '103'),
('ishita.gupta@email.com', '120'),
('siddharth.rao@email.com', '124'),
('meera.nair@email.com', '116'),
('meera.nair@email.com', '113');
INSERT INTO conversations (id, title, productId, participants_key, createdAt) VALUES
('C001', 'Wireless Headphones', '101', 'dealer@shop.com;rahul.sharma@email.com', '2026-07-24'),
('C002', 'Running Shoes', '111', 'anita@fashionhub.com;priya.patel@email.com', '2026-08-08'),
('C003', 'Database System Concepts', '122', 'aman.verma@email.com;sunita@bookbarn.com', '2026-07-25'),
('C004', 'Smartwatch', '102', 'dealer@shop.com;siddharth.rao@email.com', '2026-08-17');
INSERT INTO conv_participants (convId, email) VALUES
('C001', 'rahul.sharma@email.com'),
('C001', 'dealer@shop.com'),
('C002', 'anita@fashionhub.com'),
('C002', 'priya.patel@email.com'),
('C003', 'aman.verma@email.com'),
('C003', 'sunita@bookbarn.com'),
('C004', 'dealer@shop.com'),
('C004', 'siddharth.rao@email.com');
INSERT INTO messages (id, convId, sender, text, time) VALUES
('M001', 'C001', 'rahul.sharma@email.com', 'Hi, is the headphone available in black?', '10:15 AM'),
('M002', 'C001', 'dealer@shop.com', 'Yes, black is in stock. I can ship it today.', '10:22 AM'),
('M003', 'C001', 'rahul.sharma@email.com', 'Great, placing the order now.', '10:25 AM'),
('M004', 'C002', 'priya.patel@email.com', 'Do these shoes come in size 7?', '05:40 PM'),
('M005', 'C002', 'anita@fashionhub.com', 'Yes, sizes 6 to 10 are available.', '06:05 PM'),
('M006', 'C002', 'priya.patel@email.com', 'Thanks! Will order soon.', '06:10 PM'),
('M007', 'C003', 'aman.verma@email.com', 'Is this the latest edition?', '11:00 AM'),
('M008', 'C003', 'sunita@bookbarn.com', 'It is the 7th edition, brand new copy.', '11:30 AM'),
('M009', 'C004', 'siddharth.rao@email.com', 'Does the smartwatch support call notifications?', '02:10 PM'),
('M010', 'C004', 'dealer@shop.com', 'Yes, it supports calls, messages and app alerts.', '02:25 PM'),
('M011', 'C004', 'siddharth.rao@email.com', 'Perfect, ordering it.', '02:30 PM');
UPDATE orders SET status = 'Packed'  WHERE id = 'ORD10000013';
UPDATE orders SET status = 'Shipped' WHERE id = 'ORD10000013';
UPDATE users SET password = 'NewPass@456' WHERE email = 'priya.patel@email.com';
DELETE FROM wishlist WHERE userEmail = 'rohan.joshi@email.com' AND productId = '103';
DELETE FROM products WHERE id = '130';
`;
  db.exec(seedDml);
  console.log('Database seeded successfully!');
}

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* --------------------------------------------------------------------------
   HEALTH CHECK
   -------------------------------------------------------------------------- */
app.get('/', (_req, res) => res.json({ ok: true, service: 'Mini E-Commerce API', status: 'running' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Mini E-Commerce API is running' }));

/* --------------------------------------------------------------------------
   AUTH
   Register creates a new account. Login only succeeds for an account that
   already exists.
   -------------------------------------------------------------------------- */
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, shopName, shopAddress, shopPhone } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'email, password and role are required' });
  }
  if (role === 'dealer' && !shopName) {
    return res.status(400).json({ message: 'Shop name is required for dealer accounts.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? AND role = ?').get(email, role);
  if (existing) {
    return res.status(400).json({ message: 'An account with this email already exists for this role.' });
  }

  const id = Date.now().toString();
  db.prepare(`INSERT INTO users (id,name,email,password,role,joinedDate,shopName,shopAddress,shopPhone)
              VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, name || email.split('@')[0], email, password, role, new Date().toLocaleDateString(),
      role === 'dealer' ? (shopName || '') : null,
      role === 'dealer' ? (shopAddress || '') : null,
      role === 'dealer' ? (shopPhone || '') : null);

  const user = db.prepare(`SELECT id,name,email,role,joinedDate,phone,gender,dob,address,bio,shopName,shopAddress,shopPhone
                            FROM users WHERE id = ?`).get(id);
  res.status(201).json(user);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'email, password and role are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, role);
  if (!user) {
    return res.status(404).json({ message: 'No account found for this email/role. Please sign up first.' });
  }
  if (user.password !== password) {
    return res.status(401).json({ message: 'Incorrect password! Please try again.' });
  }

  const { password: _pw, ...safeUser } = user;
  res.json(safeUser);
});

/* --------------------------------------------------------------------------
   PROFILE
   -------------------------------------------------------------------------- */
const PROFILE_COLUMNS = 'id,name,email,role,joinedDate,phone,gender,dob,address,bio,shopName,shopAddress,shopPhone';

app.get('/api/users/:email', (req, res) => {
  const { role } = req.query;
  const user = role
    ? db.prepare(`SELECT ${PROFILE_COLUMNS} FROM users WHERE email = ? AND role = ?`).get(req.params.email, role)
    : db.prepare(`SELECT ${PROFILE_COLUMNS} FROM users WHERE email = ?`).get(req.params.email);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

app.put('/api/users/:email', (req, res) => {
  const {
    name, currentPassword, newPassword, role,
    phone, gender, dob, address, bio,
    shopName, shopAddress, shopPhone
  } = req.body;
  const user = role
    ? db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(req.params.email, role)
    : db.prepare('SELECT * FROM users WHERE email = ?').get(req.params.email);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (newPassword) {
    if (user.password !== currentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    db.prepare('UPDATE users SET password = ? WHERE email = ? AND role = ?').run(newPassword, req.params.email, user.role);
  }

  db.prepare(`UPDATE users SET
      name = ?, phone = ?, gender = ?, dob = ?, address = ?, bio = ?,
      shopName = ?, shopAddress = ?, shopPhone = ?
    WHERE email = ? AND role = ?`)
    .run(
      name || user.name,
      phone ?? user.phone,
      gender ?? user.gender,
      dob ?? user.dob,
      address ?? user.address,
      bio ?? user.bio,
      user.role === 'dealer' ? (shopName ?? user.shopName) : user.shopName,
      user.role === 'dealer' ? (shopAddress ?? user.shopAddress) : user.shopAddress,
      user.role === 'dealer' ? (shopPhone ?? user.shopPhone) : user.shopPhone,
      req.params.email, user.role
    );

  const updated = db.prepare(`SELECT ${PROFILE_COLUMNS} FROM users WHERE email = ? AND role = ?`).get(req.params.email, user.role);
  res.json(updated);
});

/* --------------------------------------------------------------------------
   PRODUCTS
   -------------------------------------------------------------------------- */
app.get('/api/products', (_req, res) => {
  res.json(db.prepare('SELECT * FROM products ORDER BY date DESC').all());
});

app.get('/api/products/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
});

app.post('/api/products', (req, res) => {
  const { title, description, price, category, image, dealerEmail, dealerName } = req.body;
  if (!title || !price || !dealerEmail) {
    return res.status(400).json({ message: 'title, price and dealerEmail are required' });
  }
  const id = Date.now().toString();
  db.prepare(`INSERT INTO products (id,title,description,price,category,image,dealerEmail,dealerName,date) VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, title, description || '', price, category || 'Other', image || '', dealerEmail, dealerName || dealerEmail, new Date().toLocaleDateString());
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
});

app.delete('/api/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.get('/api/dealer/products/:email', (req, res) => {
  res.json(db.prepare('SELECT * FROM products WHERE dealerEmail = ? ORDER BY date DESC').all(req.params.email));
});

/* --------------------------------------------------------------------------
   ORDERS (cart checkout creates one order with multiple order_items)
   -------------------------------------------------------------------------- */
app.post('/api/orders', (req, res) => {
  const { userEmail, items, total, shipping } = req.body;
  if (!userEmail || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'userEmail and at least one item are required' });
  }

  const id = 'ORD' + Date.now().toString().slice(-8);
  const insertOrder = db.prepare(`INSERT INTO orders (id,userEmail,total,status,custName,custMobile,custAddress,custPincode,date) VALUES (?,?,?,?,?,?,?,?,?)`);
  insertOrder.run(id, userEmail, total || 0, 'Order Placed',
    shipping?.name || '', shipping?.mobile || '', shipping?.address || '', shipping?.pincode || '',
    new Date().toLocaleDateString());

  const insertItem = db.prepare(`INSERT INTO order_items (orderId,productId,title,price,dealerEmail) VALUES (?,?,?,?,?)`);
  items.forEach((item) => {
    insertItem.run(id, String(item.id ?? item.productId ?? ''), item.title, item.price, item.dealer || item.dealerEmail || '');
  });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  const orderItems = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(id);
  io.emit('order_created', { ...order, items: orderItems });
  res.status(201).json({ ...order, items: orderItems });
});

function attachItems(order) {
  const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
  return { ...order, items };
}

app.get('/api/orders/:email', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE userEmail = ? ORDER BY rowid DESC').all(req.params.email);
  res.json(orders.map(attachItems));
});

app.get('/api/dealer/orders/:email', (req, res) => {
  const email = req.params.email;
  const orderIds = db.prepare('SELECT DISTINCT orderId FROM order_items WHERE dealerEmail = ?').all(email).map((r) => r.orderId);
  if (orderIds.length === 0) return res.json([]);
  const placeholders = orderIds.map(() => '?').join(',');
  const orders = db.prepare(`SELECT * FROM orders WHERE id IN (${placeholders}) ORDER BY rowid DESC`).all(...orderIds);
  res.json(orders.map((o) => {
    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ? AND dealerEmail = ?').all(o.id, email);
    return { ...o, items };
  }));
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'status is required' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  const order = attachItems(db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id));
  io.emit('order_status_updated', order);
  res.json(order);
});

/* --------------------------------------------------------------------------
   WISHLIST
   -------------------------------------------------------------------------- */
app.get('/api/wishlist/:email', (req, res) => {
  const rows = db.prepare('SELECT productId FROM wishlist WHERE userEmail = ?').all(req.params.email);
  const ids = rows.map((r) => r.productId);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => '?').join(',');
  const products = db.prepare(`SELECT * FROM products WHERE id IN (${placeholders})`).all(...ids);
  res.json(products);
});

app.post('/api/wishlist', (req, res) => {
  const { email, productId } = req.body;
  if (!email || !productId) return res.status(400).json({ message: 'email and productId are required' });
  db.prepare('INSERT OR IGNORE INTO wishlist (userEmail, productId) VALUES (?, ?)').run(email, String(productId));
  res.status(201).json({ ok: true });
});

app.delete('/api/wishlist/:email/:productId', (req, res) => {
  db.prepare('DELETE FROM wishlist WHERE userEmail = ? AND productId = ?').run(req.params.email, req.params.productId);
  res.json({ ok: true });
});

/* --------------------------------------------------------------------------
   CONVERSATIONS & MESSAGES (buyer <-> dealer chat)
   -------------------------------------------------------------------------- */
app.get('/api/conversations/:email', (req, res) => {
  const email = req.params.email;
  const convs = db.prepare('SELECT * FROM conversations WHERE participants_key LIKE ? ORDER BY createdAt DESC').all(`%${email}%`);
  const data = convs.map((c) => {
    const parts = db.prepare('SELECT email FROM conv_participants WHERE convId = ?').all(c.id).map((r) => r.email);
    const product = c.productId ? db.prepare('SELECT id,title,price,image FROM products WHERE id = ?').get(c.productId) : null;
    return { ...c, participants: parts, product };
  });
  res.json(data);
});

app.post('/api/conversations', (req, res) => {
  const { participants, title, productId } = req.body;
  if (!Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ message: 'participants required' });
  }
  const key = participants.slice().sort().join(';');
  let conv = db.prepare('SELECT * FROM conversations WHERE participants_key = ?').get(key);
  if (conv) {
    const parts = db.prepare('SELECT email FROM conv_participants WHERE convId = ?').all(conv.id).map((r) => r.email);
    return res.json({ ...conv, participants: parts });
  }
  const id = Date.now().toString();
  db.prepare('INSERT INTO conversations (id,title,productId,participants_key,createdAt) VALUES (?,?,?,?,?)')
    .run(id, title || '', productId || null, key, new Date().toISOString());
  const insertPart = db.prepare('INSERT INTO conv_participants (convId,email) VALUES (?,?)');
  participants.forEach((p) => insertPart.run(id, p));
  conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
  res.status(201).json({ ...conv, participants });
});

app.get('/api/conversations/:id/messages', (req, res) => {
  res.json(db.prepare('SELECT * FROM messages WHERE convId = ? ORDER BY rowid ASC').all(req.params.id));
});

app.post('/api/messages', (req, res) => {
  const { convId, sender, text } = req.body;
  if (!convId || !text) return res.status(400).json({ message: 'convId and text required' });
  const id = Date.now().toString();
  const time = nowTime();
  db.prepare('INSERT INTO messages (id,convId,sender,text,time) VALUES (?,?,?,?,?)').run(id, convId, sender || 'User', text, time);
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  io.to(convId).emit('receive_message', msg);
  res.status(201).json(msg);
});

io.on('connection', (socket) => {
  socket.on('join_conversation', (convId) => { if (convId) socket.join(convId); });
  socket.on('leave_conversation', (convId) => { if (convId) socket.leave(convId); });
  socket.on('send_message', (data) => {
    if (!data || !data.conversationId || !data.text) return;
    const id = Date.now().toString();
    const time = nowTime();
    db.prepare('INSERT INTO messages (id,convId,sender,text,time) VALUES (?,?,?,?,?)')
      .run(id, data.conversationId, data.sender || 'User', data.text, time);
    const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    io.to(data.conversationId).emit('receive_message', msg);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Mini E-Commerce backend listening on http://localhost:${PORT}`));
