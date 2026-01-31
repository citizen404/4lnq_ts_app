# 📦 4LNQ: P2P Delivery Matcher Bot 
### (prepared task for The Open Network Hackaton 2024 by dorahacks)

A decentralized Telegram-based service connecting travelers and senders for small parcel delivery, secured by TON blockchain smart contracts.

## 🚀 The Problem
Travelers and senders are currently scattered across thousands of chaotic Telegram chats. Finding a match is time-consuming, and transactions rely purely on "word of mouth," creating significant security risks for both parties.

## ✨ The Solution
4LNQ acts as a bridge, automating the matching process via a Telegram Mini App and ensuring transparent payments through the TON ecosystem.
Seamless Matching: Automated search based on airports, dates, and cargo dimensions.
Trustless Payments: Smart contracts handle the escrow and payout logic.
Flexible Interaction: Users can either connect via direct contact or opt for a blockchain-secured deal.

## 🛠 How It Works
Item Creation: Senders define weight, size, value, route (airports), and urgency (1 day to 1 month). The system calculates a fee ranging from $80 to $1,000.
Trip Registration: Carriers (Travelers) log their flight details and dates via the Mini App.
Matching: When a match is found, the bot exchanges contacts.
Escrow & QR Confirmation:
The Sender receives a unique QR code to be forwarded to the Recipient.
Note: Currently, once balances are verified, the Smart Contract is manually deployed by the operator for each request to ensure maximum security during the MVP stage.
Delivery & Payout: Upon meeting the Recipient, the Carrier scans the QR code. This triggers the smart contract to:
Release funds from the Sender to the Carrier.
Transfer a 2% service fee to the platform (4LNQ).
-----------------------------------------
# 💻 Tech Stack
Backend: TypeScript
Frontend: JavaScript (Telegram Mini App)
Smart Contracts: Tact (TON Blockchain)
Wallet Integration: TON Keeper

# 🛡 Security & Roadmap
Current State: Manual contract deployment after balance verification.
Future Feature: Cargo Insurance — funds will be locked on the Carrier's balance as collateral until successful delivery.
Full Automation: Transitioning from operator-led deployment to fully autonomous contract instantiation.

# 📺 Pitch Video
Watch our Project Presentation on YouTube
-----------------------------------------
### Bridging borders, one parcel at a time.