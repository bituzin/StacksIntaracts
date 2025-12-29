
# Stacks Interacts

Stacks Interacts is a modern dApp that enables interaction with Stacks smart contracts on mainnet. The project is built with React, TypeScript, and Vite.

## Application Features

- **Connect Stacks wallet (Hiro Wallet)** – secure login and transaction signing.
- **Support for multiple contracts:**
  - **GM Contract** – send a "GM" greeting to the blockchain network.
  - **Post Message** – publish any message on the blockchain.
  - **Voting** – create polls and vote for selected options.
  - **Name Reservation** – reserve unique on-chain names.
  - **Send To Friend** – send STX to a selected address.
  - **Send To Many** – send STX to multiple recipients at once.
- **Responsive, dark interface** – modern look and usability on any device.
- **Wallet connection persistence** – wallet connection is maintained after page refresh.

## Project Structure

- `src/components/GMContract.tsx` – handles the GM contract (sending greetings).
- `src/components/PostMessage.tsx` – publishing messages to the blockchain.
- `src/components/Voting.tsx` – creating and voting in polls.
- `src/components/NameReservation.tsx` – user name reservation.
- `src/components/SendToFriend.tsx` – sending STX to a single recipient.
- `src/components/SendToMany.tsx` – sending STX to multiple recipients.
- `contracts/` – example Clarity contracts used by the application.


## Technologies

- React 18
- TypeScript
- Vite
- @stacks/connect, @stacks/transactions, @stacks/network

## License

MIT
