# Project Management Site

A simple full‑stack project management web application.

## Overview
This repository contains a **frontend** (plain HTML/CSS/JS) and a **backend** (Node.js with TypeScript). The frontend provides a login/registration UI with interactive effects, while the backend serves API endpoints for user management (not fully implemented yet).

## Project Structure
```
project_management_site/
├─ backend/               # Node/Express backend (TypeScript)
│   ├─ src/               # Source code
│   │   └─ migrations/    # Database migration scripts
│   ├─ server.ts          # Entry point for the Express server
│   └─ README.md          # (this file – describes the backend)
├─ frontend/              # Static assets served to the browser
│   ├─ public/            # Public files (index.html, etc.)
│   └─ assets/js/         # JavaScript files
│       ├─ main.js        # Handles authentication page logic
│       └─ Welcome.js     # Controls UI switching and mouse‑move effect
└─ README.md              # **Project‑level README** (this file)
```

## Prerequisites
- **Node.js** (v20 or later)
- **npm** (comes with Node)
- **TypeScript** (`npm i -g typescript` – optional, the project already includes it as a dev dependency)
- **SQLite** (used by the migration script, no extra setup needed)

## Setup
```bash
# Clone the repository (if you haven't already)
git clone <repo‑url>
cd project_management_site

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (only for possible future tooling, e.g., linting)
cd ../frontend
npm install   # may be empty – the frontend currently uses static files
```

## Running the Application (development)
```bash
# Start the backend server (listens on port 3000 by default)
cd backend
npm run dev   # assumes a script like "dev": "ts-node-dev server.ts"

# Open the frontend in a browser (served by the backend or via a simple static server)
# If the backend serves static files, just navigate to http://localhost:3000
# Otherwise you can use a quick static server, e.g.:
cd ../frontend/public
npx serve .   # installs a temporary static server
```

## Building / Deploying
- **Backend**: compile TypeScript to JavaScript with `npm run build` (produces `dist/`). Deploy the compiled output with `node dist/server.js`.
- **Frontend**: the files in `frontend/public/` are ready for production; you may copy the entire `frontend/` directory to a static‑hosting service (Netlify, Vercel, etc.).

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Make your changes and ensure the code builds (`npm run lint` / `npm test` if tests exist).
4. Open a Pull Request describing the changes.

## License
This project is open source and available under the MIT License.
