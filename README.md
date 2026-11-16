# Mini E-Commerce — DBMS Course Project

A peer e-commerce site with User and Dealer roles, built on a real SQL
(SQLite) backend via a REST API + Socket.IO for live chat.

## What's included

- **Login** — User / Dealer role tabs (`index.html`)
- **Store** — product grid with wishlist hearts (`store.html`)
- **Product Details** — single product view, add to cart, message seller (`product-details.html`)
- **Cart & Checkout** — multi-item cart, shipping form, places a real order (`cart.html`)
- **Order Tracking** — buyer's order history + live status (`orders.html`)
- **Wishlist** — saved products (`wishlist.html`)
- **Messages** — real-time buyer ↔ dealer chat via Socket.IO (`messages.html`)
- **Profile** — view account, change password (`profile.html`)
- **Dealer Dashboard** — publish/manage products (`sell-product.html`)
- **Dealer Orders** — update fulfillment status: Order Placed → Packed →
  Shipped → Out for Delivery → Delivered (`dealer-orders.html`)
- **About / Contact / FAQ** — static info pages
- **Dark/Light theme toggle** — applied via a blocking inline script in
  `<head>` on every page so there's no flash of the wrong theme when
  navigating between pages

## Database schema (SQLite, `backend/data/store.db`)

| Table | Purpose |
|---|---|
| `users` | accounts (role: `user` or `dealer`) |
| `products` | listings, linked to the dealer who posted them |
| `orders` | one row per checkout |
| `order_items` | line items per order (many-to-one with `orders`) |
| `wishlist` | many-to-many between users and products |
| `conversations` / `conv_participants` | chat threads |
| `messages` | chat messages |

## Run locally

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`. Open `index.html` in a browser
(or serve the root folder with any static server) — it already points at
`http://localhost:5000` via `js/config.js`.

## Deploying so it works for everyone (not just your machine)

Same two-part setup as before:
1. Deploy `backend/` to Render (see `DEPLOYMENT.md`)
2. Put the live backend URL into `js/config.js`
3. Host the frontend (GitHub Pages, or wherever) — it's plain static files

## Notes

- Login auto-registers a new account the first time you use an email —
  matches the original site's UX. This means anyone can create an account
  with any email; there's no email verification. Fine for a course demo,
  worth mentioning as a known limitation if asked in viva.
- Two demo products and a demo dealer (`dealer@shop.com` / `Dealer@123`)
  are seeded automatically the first time the backend starts.
