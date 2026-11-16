# Deploying Mini E-Commerce (Render + GitHub Pages)

Same process as before — deploy the backend to Render, put its URL into
`js/config.js`, then host the static frontend files anywhere (GitHub Pages
works well).

## 1. Push this whole folder to a GitHub repo

Include everything: the HTML pages, `css/`, `js/`, and `backend/`.

## 2. Deploy the backend on Render

1. https://render.com → **New +** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Create the service, wait for it to go live, copy the URL it gives you.

## 3. Point the frontend at it

Edit `js/config.js`:
```js
const API_BASE_URL = 'https://YOUR-BACKEND-URL.onrender.com';
```

## 4. Host the frontend

GitHub repo → Settings → Pages → enable, pick your branch/root.

## Notes

- Free Render services sleep after ~15 min idle; first request after that
  can take 30-50 seconds.
- Test the backend is live: visit `https://YOUR-BACKEND-URL.onrender.com/api/health`
