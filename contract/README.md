# Digital Will Protocol - Smart Contract

A Soroban smart contract for the Digital Will Protocol on Stellar blockchain.

## Overview

This contract implements a heartbeat-based digital will system where:
- Owner must send periodic heartbeats to prove they're alive
- If heartbeat stops, a grace period begins (72 hours)
- After grace period, assets can be transferred to beneficiary
- Owner can update beneficiary and heartbeat interval anytime

## Architecture

### Files

- **`src/lib.rs`** - Main contract implementation with all functions
- **`src/state.rs`** - State management and data structures
- **`src/error.rs`** - Error types and codes
- **`Cargo.toml`** - Dependencies and build configuration

### State Structure

```rust
pub struct WillState {
    pub owner: Address,              // Owner of the will
    pub beneficiary: Address,        // Beneficiary address
    pub heartbeat_interval: u64,     // Interval in seconds
    pub last_heartbeat: u64,         // Last heartbeat timestamp
    pub grace_period: u64,           // Grace period (72 hours)
    pub initialized: bool,           // Initialization flag
}
```

## Functions

### Core Functions

#### `initialize(owner, beneficiary, heartbeat_interval)`
Initialize the will contract with owner, beneficiary, and heartbeat interval.

**Parameters:**
- `owner: Address` - Owner's Stellar address
- `beneficiary: Address` - Beneficiary's Stellar address  
- `heartbeat_interval: u64` - Interval in seconds (minimum 60)

**Authorization:** Requires owner signature

#### `heartbeat()`
Send a heartbeat to prove owner is alive. Resets the countdown timer.

**Authorization:** Requires owner signature

#### `execute(token_address)`
Execute the will and transfer all tokens to beneficiary. Can only be called after grace period expires.

**Parameters:**
- `token_address: Address` - Token contract address (e.g., XLM)

**Authorization:** Anyone can call after grace period

### Query Functions

#### `get_state()`
Returns the current will state.

**Returns:** `WillState` struct

#### `is_alive()`
Check if owner is still considered alive.

**Returns:** `bool`

#### `time_until_execution()`
Get remaining time until will can be executed.

**Returns:** `u64` (seconds, 0 if executable)

### Management Functions

#### `update_beneficiary(new_beneficiary)`
Update the beneficiary address.

**Parameters:**
- `new_beneficiary: Address` - New beneficiary address

**Authorization:** Requires owner signature

#### `update_interval(new_interval)`
Update the heartbeat interval.

**Parameters:**
- `new_interval: u64` - New interval in seconds (minimum 60)

**Authorization:** Requires owner signature

## Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 1 | `AlreadyInitialized` | Contract already initialized |
| 2 | `NotInitialized` | Contract not initialized |
| 3 | `Unauthorized` | Caller is not authorized |
| 4 | `GracePeriodNotExpired` | Grace period hasn't expired yet |
| 5 | `OwnerStillAlive` | Owner is still alive |
| 6 | `InvalidBeneficiary` | Invalid beneficiary address |
| 7 | `InvalidInterval` | Invalid heartbeat interval |
| 8 | `InsufficientBalance` | Insufficient token balance |

## Timeline Example

```
Day 0:  Initialize contract (interval = 30 days)
Day 15: Send heartbeat ✓
Day 30: Send heartbeat ✓
Day 60: Send heartbeat ✓
Day 90: ❌ No heartbeat
Day 93: Grace period expires (72 hours)
Day 93+: Anyone can execute will
```

## Build & Test

### Build
```bash
cargo build --target wasm32-unknown-unknown --release
```

### Test
```bash
cargo test -- --nocapture
```

### Deploy
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Security Considerations

1. **Owner Control**: Only owner can send heartbeats and update settings
2. **Grace Period**: 72-hour buffer prevents accidental execution
3. **Permissionless Execution**: Anyone can trigger execution after grace period
4. **Token Safety**: Contract only transfers tokens it holds
5. **Minimum Interval**: 60-second minimum prevents spam

## Integration

### Frontend Integration

The contract is designed to work with the React frontend in `../frontend`.

Update `frontend/src/contract/client.ts` with your deployed contract ID:

```typescript
export const CONTRACT_ID = 'CXXXXXXXXX...'
```

### Direct CLI Usage

```bash
# Initialize
stellar contract invoke --id <CONTRACT_ID> --source owner \
  -- initialize --owner <ADDR> --beneficiary <ADDR> --heartbeat_interval 2592000

# Heartbeat
stellar contract invoke --id <CONTRACT_ID> --source owner \
  -- heartbeat

# Check state
stellar contract invoke --id <CONTRACT_ID> \
  -- get_state

# Execute (after grace period)
stellar contract invoke --id <CONTRACT_ID> --source anyone \
  -- execute --token_address <TOKEN_ADDR>
```

## License

MIT License - See LICENSE file for details

## Resources

- [Soroban Documentation](https://soroban.stellar.org/)
- [Stellar SDK](https://developers.stellar.org/)
- [Project Documentation](../docs/)
