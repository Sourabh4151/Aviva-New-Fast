# Crack-ED Frontend Redesign

This is a Vite + React scaffold with Tailwind CSS for the redesigned frontend.

Quick start:

1. Copy the hero image from the existing frontend into this project:

   - Source: `../crack-ed-frontend/src/assets/aviva_ds_hero.jpg` (from workspace root)
   - Destination: `src/assets/aviva_ds_hero.jpg`

2. (Optional) add Aviva logo at `src/assets/aviva_logo.png` or the header will hide it.

3. Install and run:

```bash
cd crack-ed-frontend-redesign
npm install
npm run dev
```

The dev server runs on port 5000 to match backend CORS (backend at http://localhost:8000).

Integration:
- The callback form in the hero sends POST to `http://localhost:8000/auth/callbackOtp/`.

Notes:
- This scaffold is intentionally minimal — I'll iterate on components and styles once you confirm.

