# Project 3-05

## Checklist
- [x] Add project structure overview
- [x] Add frontend install steps (`cd Frontend` then `npm install`)
- [x] Add frontend run/build/preview commands
- [x] Add Tailwind CSS note based on current setup
- [x] Add backend placeholder section for setup/run steps

## Project Structure

```text
project3-05/
├── Backend/
├── Frontend/
   ├── app.jsx
   ├── package.json
   ├── images/
   └── pages/
```

- `Frontend/`: React + Vite app.
- `Backend/`: Backend service code (setup steps can be added once backend stack/entrypoint is finalized).

## Prerequisites
- Node.js and npm installed (LTS recommended).

## Frontend Setup

Run these from the project root:

```bash
cd Frontend
npm install
```

## Frontend Development

```bash
cd Frontend
npm run dev
```

## Frontend Production Build

```bash
cd Frontend
npm run build
```

## Frontend Preview Build

```bash
cd Frontend
npm run preview
```

## Tailwind CSS Note
- This project currently uses `tailwindcss@^4.2.2` (from `Frontend/package.json`).
- Tailwind v4 setup does not rely on the older `npx tailwindcss init -p` workflow.
- If you configure Tailwind styles, use the v4 approach (for example, importing Tailwind in your CSS entry file).

## Backend Setup (Placeholder)
Backend setup/run steps are not documented yet in this README because the backend runtime and commands are not confirmed from the current project files.

Add commands here once confirmed, for example:

```bash
cd Backend
# install dependencies
# run backend server
```
