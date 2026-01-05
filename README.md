# Blockchain-Based Document Verification System

## Overview
A production-grade system for anchoring document hashes on the Ethereum blockchain, ensuring institution-level trust and immutability.

## Structure
- **/client**: React Frontend (Vite)
- **/server**: Node.js Express Backend
- **/blockchain**: Hardhat Smart Contract Project
- **/database**: SQL Scripts

## Setup
1. **Database**: Import scripts from `/database` into MySQL.
2. **Blockchain**:
   - `cd blockchain`
   - `npm install`
   - Start Ganache (Port 7545).
   - `npx hardhat run scripts/deploy.js --network localhost`
   - Copy Contract Address to `/server/.env`.
3. **Server**:
   - `cd server`
   - `npm install`
   - `npm start`
4. **Client**:
   - `cd client`
   - `npm install`
   - `npm run dev`

## Docker

🔧 Quick steps to run the app with Docker and Docker Compose:

1. Build and start services:

```powershell
docker-compose up --build
```

2. Services:
- Client (React) -> http://localhost:3000
- Server (Express) -> http://localhost:5000
- MySQL -> port 3306 (credentials set in `docker-compose.yml`)

3. Environment variables:
- The `server` reads DB connection details from `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

4. Database seed

After the DB container starts, you can import the provided SQL seed file into the running container (replace `rootpassword` if you changed it in `docker-compose.yml`):

```powershell
docker exec -i $(docker-compose ps -q db) mysql -u root -prootpassword doc_verify_db < database/seed.sql
```

5. To stop and remove containers:

```powershell
docker-compose down -v
```

💡 Tip: For production, replace default DB passwords and consider adding backup strategies and more secure env var management.

