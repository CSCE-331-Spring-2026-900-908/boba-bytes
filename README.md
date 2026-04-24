# Project 3-05

## Quick Start

### Frontend (run from `Frontend/`)
```bash
cd ~/boba-bytes/Frontend
npm install
npm run dev
```

### Frontend scripts currently expected
- `dev`: `vite ..`
- `build`: `vite build ..`
- `preview`: `vite preview ..`

> Note: This setup is intended to run Vite from `Frontend/` while using the project root as app root.


## Tailwind CSS

This project has `tailwindcss@^4.2.2` in `Frontend/package.json`.

- Tailwind v4 does not use the older `npx tailwindcss init -p` workflow.
- Configure Tailwind using the v4 approach (for example, import Tailwind in your CSS entry file).

## Backend
The backend is implemented in FastAPI and located in `FastAPI/`. To run the backend, follow the instructions in `FastAPI/README.md`.
