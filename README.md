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

## Project Structure

```text
boba-bytes/
├── Backend/
├── Frontend/
│   ├── App.jsx
│   ├── package.json
│   ├── images/
│   └── pages/
└── index.html
```

## Tailwind CSS

This project has `tailwindcss@^4.2.2` in `Frontend/package.json`.

- Tailwind v4 does not use the older `npx tailwindcss init -p` workflow.
- Configure Tailwind using the v4 approach (for example, import Tailwind in your CSS entry file).

## Troubleshooting

### `CACError: Unknown option --root`
If you see this when running Vite, use positional root form in scripts:
- `vite ..`
- `vite build ..`
- `vite preview ..`

### `http://localhost:5173/` shows 404
Known from current layout:
- `index.html` is at project root.
- Dev command is run from `Frontend/`.

Check:
1. `Frontend/package.json` scripts use positional root (`vite ..`).
2. Root `index.html` exists.
3. Root `index.html` points to a valid module path (example: `/Frontend/Main.jsx` if your entry file is in `Frontend/`).

## Backend

Backend setup/run commands are not documented yet (runtime/entrypoint not verified from current project files). Add them once backend commands are confirmed.
