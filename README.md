# susu


**Jenius DeFi Staking Optimizer**


Susu is a next-generation DeFi platform that leverages the Jenius MCP web3_analysis tool for real-time protocol data and AI-powered staking optimization. The backend fetches live staking opportunities using the Jenius MCP API, then uses OpenAI's ChatGPT (GPT-4.1) to generate actionable, user-friendly staking advice. The system saves both raw and AI-interpreted data for transparency and compliance.


The frontend features:
- AI-powered auto-split for vault payouts
- Wallet integration (ethers.js)
- Modern Next.js/React UI


## Tech Used
- **Jenius MCP (web3_analysis):** Live on-chain data and protocol analytics
- **OpenAI (ChatGPT, GPT-4.1):** AI-driven staking advice
- **Node.js/Express:** Backend API and orchestration
- **Next.js/React:** Frontend application
- **ethers.js:** Wallet and smart contract integration
- **Tailwind CSS:** UI styling
- **Gemini Pro:** Earlier multi-modal AI experiments (docs/images)
- **Perplexity & YouTube:** Research and rapid prototyping


## Thoughts
- **Cline** was expensive but powerful for data.
- **Gemini Pro** was a gamechanger for multi-modal AI, especially uploading docs and images.
- **ChatGPT** excelled at planning and code generation.
- **Perplexity and YouTube** were invaluable for research and rapid prototyping.
- **Jenius MCP integration** made real-time DeFi analytics seamless and developer-friendly.


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


## Getting Started


### Prerequisites
- Node.js (v16+ recommended)
- npm
- Hardhat (for contract development)
- (Optional) OpenAI API key for AI features


### Install Dependencies
```bash
# Install root dependencies
npm install


# Backend dependencies
cd backend
npm install


# Frontend dependencies
cd ../frontend
npm install
```


### Smart Contract Development
```bash
# From the root directory
cd backend
npx hardhat compile
```


### Running the Backend
```bash
cd backend
# (Assuming you have an Express or similar server set up)
node src/index.js
```


### Running the Frontend
```bash
cd frontend
npm run dev
```


## License
MIT
