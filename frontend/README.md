# DocuHub Frontend

React + Vite frontend for **DocuHub**, configured via the single global `.env` file at the repository root (`../.env`).

## Install & Run

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — Start Vite dev server (reads `VITE_API_URL` from `../.env` or proxies `/api` to `http://localhost:8000`)
- `npm run build` — Production build to `dist/`
- `npm run lint` — Run `oxlint`
- `npm run preview` — Preview production build
