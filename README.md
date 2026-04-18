# 🛡️ Eternal Vault - Digital Will Protocol

[![Stellar](https://img.shields.io/badge/Stellar-Soroban-7D00FF?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.org)
[![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **A decentralized digital will protocol on Stellar blockchain that automatically transfers your crypto assets to beneficiaries when you stop sending heartbeats.**

---

## 🎯 Problem Statement

What happens to your cryptocurrency when you pass away? Without proper planning, your digital assets could be lost forever. Traditional solutions require:
- ❌ Trusting third parties with your private keys
- ❌ Complex legal arrangements
- ❌ Expensive estate planning services
- ❌ Centralized custody solutions

**Eternal Vault solves this with a trustless, self-custodial solution on the blockchain.**

---

## 💡 How It Works

### Heartbeat Mechanism

Eternal Vault uses a **heartbeat-based liveness detection system**:

1. **🫀 Regular Heartbeats**: You send periodic heartbeats (e.g., every 30 days) to prove you're alive
2. **⏰ Grace Period**: If you miss a heartbeat, a 72-hour grace period begins
3. **🔓 Automatic Execution**: After the grace period, anyone can trigger the transfer to your beneficiary
4. **✅ Self-Custodial**: You maintain full control of your assets until execution

### State Machine

```
┌─────────┐  Initialize   ┌────────┐  Miss Heartbeat   ┌─────────┐
│  Empty  │──────────────>│ Active │──────────────────>│ Pending │
└─────────┘               └────────┘                    └─────────┘
                              ↑ │                            │
                              │ │ Heartbeat                  │ Grace Period
                              │ │                            │ (72 hours)
                              └─┘                            ↓
                                                        ┌──────────┐
                                                        │ Executed │
                                                        └──────────┘
```

**States:**
- **Active**: Owner is sending regular heartbeats
- **Pending**: Heartbeat missed, grace period active
- **Executed**: Assets transferred to beneficiary

---

## 🖼️ Screenshots

https://www.loom.com/share/e501fb6e43f140948d4a7f426d35a35d
---

## 🏗️ Architecture

### Tech Stack

**Smart Contract:**
- 🦀 **Rust** - Smart contract language
- ⭐ **Soroban** - Stellar's smart contract platform
- 🔗 **Stellar** - Layer-1 blockchain

**Frontend:**
- ⚛️ **React 18** - UI framework
- 📘 **TypeScript** - Type safety
- ⚡ **Vite** - Build tool
- 🎨 **Material Design 3** - Design system
- 👛 **Freighter** - Stellar wallet integration

**Infrastructure:**
- 🌐 **Stellar Testnet/Mainnet** - Deployment target
- 📦 **WASM** - Smart contract compilation target

---

## 📋 Smart Contract Functions

### Core Functions

#### `initialize(owner, beneficiary, heartbeat_interval)`
Initialize the will contract with configuration.

**Parameters:**
- `owner: Address` - Owner's Stellar address
- `beneficiary: Address` - Beneficiary's Stellar address
- `heartbeat_interval: u64` - Interval in seconds (min: 60)

**Authorization:** Requires owner signature

---

#### `heartbeat()`
Send a heartbeat to prove owner is alive. Resets the countdown timer.

**Authorization:** Requires owner signature

---

#### `execute(token_address)`
Execute the will and transfer all tokens to beneficiary. Can only be called after grace period expires.

**Parameters:**
- `token_address: Address` - Token contract address (e.g., XLM)

**Authorization:** Anyone can call after grace period

---

### Query Functions

#### `get_state() -> WillState`
Returns the current will state including owner, beneficiary, intervals, and timestamps.

#### `is_alive() -> bool`
Check if owner is still considered alive based on last heartbeat.

#### `time_until_execution() -> u64`
Get remaining time in seconds until will can be executed (0 if executable).

---

### Management Functions

#### `update_beneficiary(new_beneficiary)`
Update the beneficiary address (owner only).

#### `update_interval(new_interval)`
Update the heartbeat interval (owner only, min: 60 seconds).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+ and Cargo
- **Stellar CLI** (for deployment)
- **Freighter Wallet** (browser extension)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/digital-will-protocol.git
cd digital-will-protocol
```

---

## 🎨 Running Frontend Locally

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Frontend Features
- ✅ Freighter wallet integration
- ✅ Manual address input (for testing)
- ✅ Multi-step setup wizard
- ✅ Real-time countdown display
- ✅ State-based UI (Active/Pending/Executed)
- ✅ Beneficiary claim interface
- ✅ Responsive design

---

## 🔧 Building Smart Contract

```bash
# Navigate to contract directory
cd contract

# Build contract
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test -- --nocapture
```

**Output:**
```
test test::test_initialize ... ok
test test::test_heartbeat ... ok
test test::test_is_alive ... ok

test result: ok. 3 passed; 0 failed; 0 ignored
```

**Compiled WASM:** `target/wasm32-unknown-unknown/release/digital_will_protocol.wasm` (5.7 KB)

---

## 🌐 Deployment

### 1. Install Stellar CLI

```bash
cargo install --locked stellar-cli --features opt
```

### 2. Configure Network

```bash
# Testnet
stellar network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### 3. Create & Fund Account

```bash
# Generate identity
stellar keys generate --global deployer --network testnet

# Fund account (testnet)
stellar keys fund deployer --network testnet
```

### 4. Deploy Contract

```bash
cd contract

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/digital_will_protocol.wasm \
  --source deployer \
  --network testnet
```

**Output:**
```
CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 5. Update Frontend

Update `frontend/src/contract/client.ts`:

```typescript
export const CONTRACT_ID = 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
```

### 6. Deploy Frontend

```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting provider
```

**Detailed deployment guide:** See [`contract/DEPLOYMENT.md`](contract/DEPLOYMENT.md)

---

## 📊 Project Structure

```
digital-will-protocol/
├── contract/                    # Soroban smart contract
│   ├── src/
│   │   ├── lib.rs              # Main contract logic
│   │   ├── state.rs            # State management
│   │   └── error.rs            # Error types
│   ├── Cargo.toml              # Rust dependencies
│   ├── README.md               # Contract documentation
│   └── DEPLOYMENT.md           # Deployment guide
│
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── pages/              # Landing, Setup, Dashboard, Beneficiary
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # useWallet, useWill custom hooks
│   │   ├── contract/           # Contract client & types
│   │   └── App.tsx             # Main application
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                        # Documentation
│   ├── reference/
│   │   ├── DESIGN.md           # Technical design doc
│   │   ├── image1.png          # Screenshots
│   │   └── image2.png
│   └── superpowers/            # Planning documents
│
├── README.md                    # This file
└── DEPLOYMENT_STATUS.md         # Current project status
```

---

## 🗺️ Roadmap

### ✅ Version 1.0 (Current - MVP)

- ✅ Core heartbeat mechanism
- ✅ Single beneficiary support
- ✅ XLM token transfers
- ✅ 72-hour grace period
- ✅ Owner-only management
- ✅ Freighter wallet integration
- ✅ Manual address input
- ✅ Real-time countdown UI
- ✅ Testnet deployment ready

### 🚧 Version 2.0 (Planned)

- 🔄 **Multiple Beneficiaries** - Split assets among multiple recipients
- 🔄 **Percentage Allocation** - Define custom distribution percentages
- 🔄 **Multi-Token Support** - Support for any Stellar asset (not just XLM)
- 🔄 **Conditional Execution** - Time-based or event-based conditions
- 🔄 **Emergency Contacts** - Notify contacts before execution
- 🔄 **Backup Heartbeat Methods** - Email, SMS, or API integrations
- 🔄 **Encrypted Messages** - Leave messages for beneficiaries
- 🔄 **Revocable Wills** - Cancel or modify after initialization
- 🔄 **Multi-Sig Support** - Require multiple signatures for changes
- 🔄 **Mobile App** - Native iOS/Android applications

### 🌟 Version 3.0 (Future)

- 🔮 **Cross-Chain Support** - Ethereum, Polygon, other chains
- 🔮 **NFT Transfers** - Include NFTs in digital wills
- 🔮 **DAO Integration** - Community-governed execution
- 🔮 **Legal Integration** - Connect with traditional legal wills
- 🔮 **Insurance Products** - Partner with crypto insurance providers
- 🔮 **AI Monitoring** - Smart detection of unusual activity
- 🔮 **Social Recovery** - Friends/family can help recover access

---

## 🔐 Security Considerations

### ✅ Security Features

1. **Self-Custodial**: You always control your private keys
2. **Authorization Checks**: Owner-only functions require signature
3. **Grace Period**: 72-hour buffer prevents accidental execution
4. **Permissionless Execution**: Anyone can trigger after grace period (prevents censorship)
5. **Input Validation**: All inputs validated on-chain
6. **Minimal Attack Surface**: Simple, auditable code

### ⚠️ Important Notes

- **Testnet First**: Always test thoroughly on testnet before mainnet
- **Key Management**: Secure your private keys properly
- **Beneficiary Address**: Double-check beneficiary address before initialization
- **Heartbeat Reminders**: Set up reminders to send regular heartbeats
- **Grace Period**: 72 hours may not be enough for long trips - plan accordingly

### 🛡️ Audit Status

- ⏳ **Not Yet Audited** - This is an MVP/prototype
- 🔍 **Community Review Welcome** - Please review and report issues
- 🎯 **Audit Planned** - Professional audit before mainnet launch

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow Rust and TypeScript best practices
- Update documentation for API changes
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Stellar Development Foundation** - For Soroban smart contract platform
- **Freighter Team** - For excellent Stellar wallet
- **Soroban Community** - For documentation and support
- **Material Design** - For design system inspiration

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/digital-will-protocol/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/digital-will-protocol/discussions)
- **Documentation**: [docs/](docs/)
- **Contract Docs**: [contract/README.md](contract/README.md)
- **Deployment Guide**: [contract/DEPLOYMENT.md](contract/DEPLOYMENT.md)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

## 📚 Additional Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Stellar CLI Reference](https://developers.stellar.org/docs/tools/developer-tools/cli)
- [Freighter Wallet](https://freighter.app/)
- [Testnet Friendbot](https://laboratory.stellar.org/#account-creator?network=test)

---

<div align="center">

**Built with ❤️ on Stellar**

[⭐ Star this repo](https://github.com/yourusername/digital-will-protocol) • [🐛 Report Bug](https://github.com/yourusername/digital-will-protocol/issues) • [💡 Request Feature](https://github.com/yourusername/digital-will-protocol/issues)

</div>
