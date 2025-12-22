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
