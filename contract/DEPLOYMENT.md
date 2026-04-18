# Digital Will Protocol - Deployment Guide

## Prerequisites

1. **Install Stellar CLI**
   ```bash
   # macOS/Linux
   curl -L https://github.com/stellar/stellar-cli/releases/latest/download/stellar-cli-x86_64-unknown-linux-gnu.tar.gz | tar xz
   sudo mv stellar /usr/local/bin/
   
   # Windows (using Cargo)
   cargo install --locked stellar-cli --features opt
   ```

2. **Verify Installation**
   ```bash
   stellar --version
   ```

## Build Contract

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

The compiled WASM file will be at:
```
target/wasm32-unknown-unknown/release/digital_will_protocol.wasm
```

## Run Tests

```bash
cargo test -- --nocapture
```

Expected output:
```
test test::test_initialize ... ok
test test::test_heartbeat ... ok
test test::test_is_alive ... ok

test result: ok. 3 passed; 0 failed; 0 ignored
```

## Deploy to Testnet

### 1. Configure Stellar CLI for Testnet

```bash
stellar network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### 2. Create/Import Identity

```bash
# Generate new identity
stellar keys generate --global alice --network testnet

# Or import existing secret key
stellar keys add alice --secret-key SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Fund Account (Testnet)

```bash
stellar keys fund alice --network testnet
```

Or use the [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test)

### 4. Deploy Contract

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/digital_will_protocol.wasm \
  --source alice \
  --network testnet
```

This will output a contract ID like:
```
CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 5. Update Frontend Configuration

Copy the contract ID and update `frontend/src/contract/client.ts`:

```typescript
export const CONTRACT_ID = 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
```

## Contract Functions

### Initialize
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  initialize \
  --owner <OWNER_ADDRESS> \
  --beneficiary <BENEFICIARY_ADDRESS> \
  --heartbeat_interval 2592000
```

### Send Heartbeat
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  heartbeat
```

### Check State
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- \
  get_state
```

### Check if Alive
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- \
  is_alive
```

### Execute Will
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  execute \
  --token_address <XLM_TOKEN_ADDRESS>
```

## Mainnet Deployment

⚠️ **Before deploying to mainnet:**

1. Audit the contract code thoroughly
2. Test extensively on testnet
3. Consider a security audit
4. Ensure proper key management
5. Update network configuration:

```bash
stellar network add \
  --global mainnet \
  --rpc-url https://soroban-mainnet.stellar.org:443 \
  --network-passphrase "Public Global Stellar Network ; September 2015"
```

Then deploy using `--network mainnet` instead of `--network testnet`.

## Troubleshooting

### "stellar: command not found"
- Ensure Stellar CLI is installed and in your PATH
- Try `cargo install --locked stellar-cli --features opt`

### "insufficient balance"
- Fund your testnet account using friendbot
- Check balance: `stellar keys address alice`

### "contract already exists"
- Each deployment creates a new contract instance
- Use the returned contract ID for interactions

## Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Stellar CLI Reference](https://developers.stellar.org/docs/tools/developer-tools/cli)
- [Testnet Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
