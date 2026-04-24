/**
 * Soroban contract client — wraps all contract interactions.
 * In MVP, calls are stubbed to return mock data so the UI can be
 * developed and tested without a live contract deployment.
 * Replace stub implementations with real SorobanRpc calls when
 * the contract is deployed to testnet.
 */

import type { WillInfo } from './types'

// ── Contract Configuration ──────────────────────────────────────────────
// ✅ Contract deployed to testnet
// Deploy command: stellar contract deploy --wasm target/wasm32-unknown-unknown/release/digital_will_protocol.wasm --network testnet
export const CONTRACT_ID = 'CARKIEYHI3K2NFUVYPSKJWEPDDB26MPNVVAC5YMOLNINSGMDD5J77UZU'
export const NETWORK = 'testnet'
export const RPC_URL = 'https://soroban-testnet.stellar.org'

// ── Mock state (in-memory, resets on page reload) ──────────────────────
let mockState: WillInfo = {
  state: 'Active',
  owner: '',
  beneficiary: '',
  heartbeatInterval: 7 * 24 * 60 * 60,
  lastHeartbeat: Math.floor(Date.now() / 1000),
  balance: 0,
  pendingSince: null,
  triggeredBy: null,
}

// ── Read ───────────────────────────────────────────────────────────────

export async function getWillInfo(_contractAddress: string): Promise<WillInfo> {
  // TODO: replace with SorobanRpc.Server simulation call
  return { ...mockState }
}

// ── Write (all return tx hash stub) ───────────────────────────────────

export async function initialize(
  _contractAddress: string,
  owner: string,
  beneficiary: string,
  heartbeatIntervalSecs: number,
): Promise<string> {
  mockState = {
    state: 'Active',
    owner,
    beneficiary,
    heartbeatInterval: heartbeatIntervalSecs,
    lastHeartbeat: Math.floor(Date.now() / 1000),
    balance: 0,
    pendingSince: null,
    triggeredBy: null,
  }
  return 'mock_tx_initialize'
}

export async function deposit(
  _contractAddress: string,
  _callerAddress: string,
  amountStroops: number,
): Promise<string> {
  mockState.balance += amountStroops
  return 'mock_tx_deposit'
}

export async function heartbeat(
  _contractAddress: string,
  _ownerAddress: string,
): Promise<string> {
  mockState.lastHeartbeat = Math.floor(Date.now() / 1000)
  if (mockState.state === 'Pending') {
    mockState.state = 'Active'
    mockState.pendingSince = null
    mockState.triggeredBy = null
  }
  return 'mock_tx_heartbeat'
}

export async function trigger(
  _contractAddress: string,
  callerAddress: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const elapsed = now - mockState.lastHeartbeat
  if (elapsed <= mockState.heartbeatInterval) {
    throw new Error('HeartbeatTooSoon: interval has not elapsed')
  }
  mockState.state = 'Pending'
  mockState.pendingSince = now
  mockState.triggeredBy = callerAddress
  return 'mock_tx_trigger'
}

export async function execute(
  _contractAddress: string,
  _callerAddress: string,
): Promise<string> {
  if (mockState.state !== 'Pending' || !mockState.pendingSince) {
    throw new Error('InvalidState: contract is not pending')
  }
  const now = Math.floor(Date.now() / 1000)
  const gracePeriod = 72 * 60 * 60
  if (now < mockState.pendingSince + gracePeriod) {
    throw new Error('GracePeriodNotElapsed')
  }
  const BASE_RESERVE = 10_000_000
  const transferable = mockState.balance - BASE_RESERVE
  if (transferable <= 0) {
    throw new Error('InsufficientBalance')
  }
  mockState.balance = 0
  mockState.state = 'Executed'
  return 'mock_tx_execute'
}

export async function withdraw(
  _contractAddress: string,
  _ownerAddress: string,
  amountStroops: number,
): Promise<string> {
  if (mockState.balance < amountStroops) {
    throw new Error('InsufficientBalance')
  }
  mockState.balance -= amountStroops
  return 'mock_tx_withdraw'
}
