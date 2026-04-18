# Digital Will Protocol — Design Document

**Date:** 2026-04-18  
**Status:** Approved  
**Scope:** MVP v1 — XLM + single beneficiary + heartbeat + permissionless trigger + 72h pending

---

## Overview

Digital Will Protocol is a decentralized digital inheritance system running on Stellar/Soroban. Users lock XLM into a smart contract and designate a single beneficiary. If the owner stops sending periodic "I'm alive" signals (heartbeats), the contract enters a pending state. After a 72-hour grace period with no owner response, anyone can execute the transfer — no intermediary required.

---

## MVP Scope

**In v1:**
- Native XLM only
- Single beneficiary
- Heartbeat-based liveness detection
- Permissionless trigger
- 72-hour pending grace period
- React + TypeScript frontend with Freighter Wallet

**Explicitly out of v1 (deferred to v2+):**
- Multiple beneficiaries with percentage splits
- Custom token support (SAC integration)
- Conditional inheritance ("transfer at age 18")
- Social recovery (2-of-3 trusted contacts)
- Encrypted will text (IPFS/Arweave)
- Freeze/vacation mode (partially covered by pending grace period)

---

## Contract State Machine

Each will exists in one of three states:

```
Active → Pending → Executed
  ↑          |
  └──────────┘  (owner calls heartbeat() during pending → returns to Active)
```

**Active:** Owner is alive and sending heartbeats. Transfer cannot be triggered.

**Pending:** Heartbeat interval has elapsed. Anyone called `trigger()`. Owner has 72 hours to call `heartbeat()` and cancel. `triggered_by` address is recorded on-chain for transparency and dispute resolution.

**Executed:** 72-hour grace period elapsed with no owner response. Anyone called `execute()` and XLM was transferred to beneficiary. Irreversible.

---

## Contract Storage

| Field | Type | Description |
|---|---|---|
| `owner` | Address | Will creator |
| `beneficiary` | Address | Single heir |
| `heartbeat_interval` | u64 | Seconds between required heartbeats (e.g. 30 days) |
| `last_heartbeat` | u64 | Timestamp of last heartbeat signal |
| `state` | Enum | Active / Pending / Executed |
| `pending_since` | Option\<u64\> | Timestamp when pending state was entered |
| `triggered_by` | Option\<Address\> | Address that called trigger() — on-chain audit trail |

---

## Contract Functions

### `initialize(owner, beneficiary, heartbeat_interval)`
Deploys and initializes the contract. Sets `last_heartbeat = now`, `state = Active`. Can only be called once.

### `deposit()`
Owner deposits XLM into the contract. Only callable by owner. Only works in `Active` state. Enforces a minimum deposit of 2 XLM (1 XLM Stellar base reserve + 1 XLM buffer) to prevent the reserve edge case.

### `heartbeat()`
```
/// Signals that the owner is alive and resets the heartbeat timer.
///
/// Dual behavior:
/// - In Active state: updates `last_heartbeat` to now.
/// - In Pending state: cancels the trigger, clears `pending_since` and
///   `triggered_by`, and returns state to Active.
///
/// Only callable by owner. Reverts if state is Executed.
```

### `trigger()`
Anyone can call. Conditions: `state == Active` AND `now - last_heartbeat > heartbeat_interval`. On success: `state = Pending`, `pending_since = now`, `triggered_by = caller`. Reverts if conditions are not met.

### `execute()`
Anyone can call. Conditions: `state == Pending` AND `now - pending_since > 72 hours`. Transfers `balance - base_reserve` XLM to beneficiary, then sets `state = Executed`.

**Atomicity guarantee:** Soroban reverts the entire transaction if the XLM transfer fails (e.g. beneficiary account rejects payment due to limits). State remains `Pending` and `execute()` can be retried. State is never set to `Executed` unless the transfer succeeds.

### `withdraw(amount)`
Owner withdraws XLM from the contract. Only callable by owner in `Active` state. Owner can withdraw the full balance to effectively cancel the will.

---

## Security Model

**Grief attack (repeated trigger() calls):**
Harmless. Contract validates the heartbeat interval condition. If not elapsed, the call reverts. Gas cost falls on the attacker.

**Race condition (trigger and heartbeat in same ledger):**
Not possible. Soroban transactions are processed sequentially with deterministic ledger ordering.

**No one calls execute() after owner dies:**
Permissionless design means any party — beneficiary, a monitoring bot, or a third party — can call `execute()`. Frontend surfaces "this contract is awaiting execution" to beneficiary view.

**Owner deploys but never deposits:**
`execute()` reverts with `InsufficientBalance` if contract balance is zero or below base reserve. Frontend warns if contract balance is zero and disables the Execute button.

**Beneficiary rejects payment:**
Covered by atomicity guarantee above. State stays `Pending`, retryable.

**Reserve edge case:**
If contract balance falls below Stellar's 1 XLM base reserve, the transfer will fail. Mitigated by: (1) minimum 2 XLM deposit enforcement, (2) `execute()` transfers `balance - base_reserve` rather than full balance, (3) explicit test coverage for this scenario.

**Re-entrancy:**
Not possible in Soroban. Each contract call runs in an isolated execution context.

---

## Frontend Architecture

**Stack:** React + TypeScript, `@stellar/stellar-sdk`, Freighter Wallet API. No backend — fully client-side. Contract address stored in URL params or local storage.

### Screens

**Will Setup**
- Input: beneficiary address, heartbeat interval (7 / 14 / 30 days), XLM amount
- Freighter signs deploy + deposit transactions
- Validates minimum 2 XLM deposit before allowing submission

**Dashboard (Owner View)**
- Displays: current state, last heartbeat time, locked XLM amount
- Countdown with actionable UX: when less than 20% of interval remains, display prominent warning — "3 gün kaldı — şimdi heartbeat at" with highlighted CTA button
- "Heartbeat At" button — one click, Freighter signs
- In Pending state: "İtiraz Et" button replaces countdown (calls `heartbeat()`)
- Withdraw option available in Active state

**Beneficiary View**
- Accessed via contract address (URL param)
- Displays: state, locked amount, pending countdown if applicable
- "Execute" button — active only when 72h grace period has elapsed
- Clear messaging for non-crypto users: "Transfer hazır — aktarmak için tıkla"

---

## Test Strategy

### Rust Unit Tests (`#[cfg(test)]`)

**trigger() tests:**
- Reverts if called before heartbeat_interval elapses
- Sets state to Pending, records pending_since and triggered_by when interval elapsed
- Reverts if state is already Pending or Executed

**heartbeat() tests:**
- Updates last_heartbeat in Active state
- Returns state to Active from Pending, clears pending_since and triggered_by
- Reverts if state is Executed

**execute() tests:**
- Reverts if called before 72h grace period
- Transfers XLM to beneficiary and sets state to Executed after 72h
- State remains Pending if transfer fails (atomicity test)
- Transfers `balance - base_reserve`, not full balance

**deposit() tests:**
- Reverts if called by non-owner
- Reverts if state is Pending or Executed
- Reverts if amount is below 2 XLM minimum

**withdraw() tests:**
- Reverts if called by non-owner
- Reverts if state is not Active
- Correctly reduces contract balance

**Reserve edge case test:**
- Contract balance is set to exactly 1 XLM (at reserve limit)
- `execute()` is called — transfer should fail, state stays Pending
- Contract balance is set to 1.5 XLM — `execute()` transfers 0.5 XLM successfully

### Integration Tests (Soroban testutils)

Full lifecycle: `deploy → deposit → heartbeat → trigger → advance time 72h → execute`

Uses `env.ledger().set_timestamp()` for time manipulation — no real waiting required.

### Frontend Tests

- Wallet connection mocked, contract calls verified
- Countdown threshold unit tests (warning appears at correct time remaining)
- Beneficiary view renders correct state for each contract state

---

## v2 Roadmap (out of scope for this spec)

- Multiple beneficiaries with percentage splits
- SAC token support (any Stellar asset)
- Conditional inheritance with oracle integration
- Social recovery (2-of-3 multisig trigger)
- Encrypted will text stored on IPFS/Arweave, decrypted on execution
- Freeze/vacation mode
