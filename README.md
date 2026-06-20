# Pawtect

Pawtect is a community-focused app to locate, report, and rescue street dogs. This repository includes a lightweight Node/Express backend and a React + Vite frontend with mapping, reporting, and basic rescue workflows.

Why this repo: helps NGOs, shelters and volunteers coordinate rescue efforts and report animal cruelty with location and photos.

Core features
- Report injured or abused animals with location and images
- Browse shelters, NGOs, and rescued dog records
- Map-based views and vaccinated dog overlays
- Chatbot for first-aid guidance

Quick start
Prerequisites
- Node.js 16+ and npm
- (Optional) MongoDB local or Atlas for full functionality

Run locally (two terminals)

Backend (terminal 1):

```bash
cd backend
npm install
# create .env if you want DB or custom port
# development (auto-reload)
npm run dev
# or run normally
npm start
```

Frontend (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

How to verify
- Backend health: `http://localhost:5000/api/health`
- Demo dogs (works without MongoDB): `http://localhost:5000/api/dogs`
- Frontend: follow the Vite URL printed in terminal (usually `http://localhost:5173`)

Environment variables (backend/.env)
- `MONGO_URI` — MongoDB connection string (default: `mongodb://127.0.0.1:27017/pawtect`)
- `CLIENT_URL` — allowed origin for CORS (optional)
- `PORT` — backend port (default: `5000`)

Seeding demo data
The backend includes utility scripts to seed demo data. Example:

```bash
cd backend
node seedDemoData.js
```

Project layout
- `backend/` — Express server, routes, controllers, models, uploads
- `frontend/` — React + Vite app, components, pages

Tech stack
- Backend: Node.js, Express, Mongoose (MongoDB), Multer, JWT
- Frontend: React, Vite, React Router, React Leaflet, Tailwind CSS
- Dev tooling: nodemon (backend dev), Vite (frontend dev)


A glimpse into our website

<img width="1919" height="1087" alt="Screenshot 2025-11-10 192350" src="https://github.com/user-attachments/assets/86f95a3b-0c8d-4f0d-adf0-44233d38226e" />
<img width="1919" height="1097" alt="Screenshot 2025-11-10 192423" src="https://github.com/user-attachments/assets/7baa3cc4-e9b2-4f83-b0bb-db0be0e379e2" />
<img width="1919" height="1077" alt="Screenshot 2025-11-10 192552" src="https://github.com/user-attachments/assets/aa404a80-4859-40f5-8243-a05ea29ea1fc" />
<img width="1919" height="1067" alt="Screenshot 2025-11-10 192616" src="https://github.com/user-attachments/assets/25faa8e9-42a6-412d-b744-cff34f68de40" />
<img width="1913" height="1085" alt="Screenshot 2025-11-10 210912" src="https://github.com/user-attachments/assets/c90976e9-de37-42f3-91d5-df4af3a6d56e" />
<img width="1918" height="1091" alt="Screenshot 2025-11-10 211051" src="https://github.com/user-attachments/assets/25797000-50f0-4ee7-a283-214b0d4bc465" />
<img width="1914" height="1058" alt="Screenshot 2025-11-10 211238" src="https://github.com/user-attachments/assets/0172c763-7984-4bc7-81e6-baf958b3a6b5" />
<img width="1918" height="1068" alt="Screenshot 2025-11-10 211551" src="https://github.com/user-attachments/assets/58ab44cd-47be-4cb3-be3c-aa4322795284" />
<img width="759" height="826" alt="Screenshot 2025-11-10 203143" src="https://github.com/user-attachments/assets/71ccb6d3-d6b6-4402-b214-51ba9de95860" />









