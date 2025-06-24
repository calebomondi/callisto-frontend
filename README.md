# FVP Frontend Documentation

![Image](https://github.com/user-attachments/assets/15127a40-0f80-4416-a1c7-08f79d5678b4)

## Overview
FVP is a self-custodial financial management tool that allows users to better manage their crypto assets by allowing them to set up virtual vaults for locking the assets. The vaults will unlock when the set conditions are met. This will allow them to curb their impulsive spending behaviour and also to invest in their future by saving up in the locked vaults.

## Features
- Create vaults and lock Stablecoins for a specified duration.
- Add more assets to an existing locked vault.
- Withdraw assets upon lock period expiration.
- Partial and full withdrawal options.
- Integration with Aave for yield earning
- Create a schedule for unlocking assets in vaults after a given duration.
- View your wallet's analytics on the immediate previous 100 transactions of the connected wallet.

## Technical Stack
- Frontend: React.js + Vite
- UI Components: DaisyUI, Lucide React, Shadcn
- Web3 Integration: Wagmi and Viem
- WalletConnect: Rainbowkit

## Development and Testing

### Prerequisites
- Node.js v14+ and npm
- Ethereum Wallet (e.g., MetaMask, Raby Wallet)
- Base Mainnet and Base Sepolia RPC

### Setup

1. Clone this repository
```bash
git clone https://github.com/calebomondi/callisto-frontend
cd callisto-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run:
```bash
npm run dev
```

## Environment Variables
Create a `.env` file with:
```
VITE_BASE_RPC_URL=https://rpc....
VITE_BASE_SEPOLIA_RPC_URL=https://rpc....
VITE_PROJECT_ID=XXX
```

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Submit pull request

## Appendices
1. [FVP Live Link](https://fvp.finance)
2. [FVP Demo Video](https://youtu.be/-m-DzAUTqtE)