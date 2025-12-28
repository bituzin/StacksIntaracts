# StacksInteracts

A modern dApp for interacting with Stacks smart contracts (mainnet). Built with React and Vite.

## Features
- Connect your Stacks wallet (Hiro Wallet)
- Interact with 4 smart contracts:
  - GM: Say "GM" to the network
  - Post Message: Send a message to the blockchain
  - Voting: Create and vote in polls
  - Name Reservation: Reserve a unique on-chain name
- Gray-black theme, responsive UI
- Wallet connection persists after refresh

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Smart Contracts
- Update contract addresses in the components to match your deployed contracts on mainnet.

## Excluding node_modules
- The `.gitignore` file excludes `node_modules` from git tracking.

## License
MIT
