# susu: Jenius DeFi Staking Optimizer


## Overview


**susu** is a, AI-powered DeFi savings and staking platform built for the Encode Club hackathon. It leverages the Jenius MCP web3_analysis tool for real-time protocol data and integrates OpenAI's ChatGPT (GPT-4.1) to deliver actionable, user-friendly staking advice. The system is designed for transparency, compliance, and seamless user experience, with both individual and group vaults, auto-split payouts, and a modern web3 UI.


---


## Hackathon Tracks & Relevance


- **Best Use of Jenius**: Full integration with the Jenius MCP Token Discovery Store (web3_analysis), fetching live staking opportunities and technical indicators directly from the Jenius API.
- **Best Use of Polygon**: Deployed and optimized for the Polygon network, supporting native and ERC-20 assets, and leveraging Polygon's scalability for group and individual vaults.


---


## Features


- **Jenius DeFi Staking Optimizer**
  - Backend fetches live staking opportunities using the Jenius MCP API (web3_analysis).
  - OpenAI's ChatGPT (GPT-4.1) interprets protocol data and generates actionable staking advice.
  - Both raw and AI-interpreted data are saved for transparency and compliance.


- **Vaults (Individual & Group)**
  - Secure, non-custodial vaults for saving and managing assets.
  - Group vaults with role-based access, member management, and auto-split payouts powered by AI.
  - Support for native (e.g., MATIC) and ERC-20 tokens.
  - Timelocks and emergency pause mechanisms for added security.


- **Modern Web Frontend**
  - Next.js/React UI with wallet integration (ethers.js).
  - AI-powered auto-split for group vault payouts.
  - Transaction feedback, network handling, and a clean, responsive design (Tailwind CSS).


- **Transparency & Compliance**
  - All protocol data and AI recommendations are logged and available for audit.


---


## Tech Stack


- **Jenius MCP (web3_analysis)**: Live on-chain protocol and staking data
- **OpenAI (ChatGPT, GPT-4.1)**: AI-powered staking advice
- **Node.js/Express**: Backend API and AI orchestration
- **Next.js/React**: Frontend web app
- **ethers.js**: Wallet and smart contract integration
- **Tailwind CSS**: Modern UI styling
- **Gemini Pro**: Earlier AI experiments
- **Perplexity & YouTube**: Research and learning resources


---


## Project Structure


```
susu/
  backend/         # Node.js backend (AI, analytics, API)
  Contracts/       # Solidity smart contracts
  frontend/        # Next.js/React frontend
  deployments/     # Deployment artifacts
  scripts/         # Deployment and migration scripts
  test/            # Smart contract tests
```


---


## Getting Started


### Prerequisites
- Node.js (v16+ recommended)
- npm
- Hardhat (for contract development)
- (Optional) OpenAI API key for AI features


### Install Dependencies
```bash
# Root dependencies
npm install


# Backend
cd backend
npm install


# Frontend
cd ../frontend
npm install
```


### Smart Contract Development
```bash
cd backend
npx hardhat compile
```


### Running the Backend
```bash
cd backend
# (Assuming Express server setup)
node src/index.js
```


### Running the Frontend
```bash
cd frontend
npm run dev
```


---


## Contracts Overview
- **SusuVault.sol**: Individual savings vault with deposit, withdrawal, timelock, and pause features.
- **SusuGroupVault.sol**: Group savings vault with member management, role-based access, and fund distribution.


---


## AI Staking Optimizer
- Located in `backend/src/stakingAgent.js`
- Fetches live on-chain data and uses OpenAI to generate staking recommendations.
- Saves both raw and interpreted data for transparency.


---


## Hackathon Submission Notes
- **Jenius Track**: Full integration with Jenius MCP web3_analysis for live DeFi data.
- **Polygon Track**: Deployed and tested on Polygon, supporting both native and ERC-20 assets.
- **AI/Research**: Used Gemini Pro, Perplexity, and YouTube for research and prototyping.


---


## License
MIT
