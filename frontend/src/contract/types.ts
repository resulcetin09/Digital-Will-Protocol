export type WillState = 'Active' | 'Pending' | 'Executed'

export interface WillInfo {
  state: WillState
  owner: string
  beneficiary: string
  heartbeatInterval: number   // seconds
  lastHeartbeat: number       // unix timestamp (seconds)
  balance: number             // stroops (1 XLM = 10_000_000 stroops)
  pendingSince: number | null // unix timestamp or null
  triggeredBy: string | null
}

export const GRACE_PERIOD_SECS = 72 * 60 * 60   // 72 hours
export const BASE_RESERVE = 10_000_000           // 1 XLM in stroops
export const MIN_DEPOSIT = 20_000_000            // 2 XLM in stroops
export const XLM_FACTOR = 10_000_000             // stroops per XLM

export function stroopsToXlm(stroops: number): string {
  return (stroops / XLM_FACTOR).toFixed(7).replace(/\.?0+$/, '')
}

export function xlmToStroops(xlm: number): number {
  return Math.round(xlm * XLM_FACTOR)
}

export function secondsUntilExpiry(info: WillInfo): number {
  const expiresAt = info.lastHeartbeat + info.heartbeatInterval
  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, expiresAt - now)
}

export function isWarningThreshold(info: WillInfo): boolean {
  const remaining = secondsUntilExpiry(info)
  return remaining < info.heartbeatInterval * 0.2
}

export function secondsUntilExecutable(info: WillInfo): number {
  if (!info.pendingSince) return 0
  const executableAt = info.pendingSince + GRACE_PERIOD_SECS
  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, executableAt - now)
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0 saat'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d} gün ${h} saat`
  if (h > 0) return `${h} saat ${m} dakika`
  return `${m} dakika`
}
