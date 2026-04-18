import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useWill } from '../hooks/useWill'
import { heartbeat, withdraw } from '../contract/client'
import {
  stroopsToXlm,
  xlmToStroops,
  formatDuration,
} from '../contract/types'
import StateDisplay from '../components/StateDisplay'
import CountdownBanner from '../components/CountdownBanner'

interface Props {
  contractAddress: string
  onReset: () => void
}

export default function Dashboard({ contractAddress, onReset }: Props) {
  const wallet = useWallet()
  const { info, loading, refresh } = useWill(contractAddress)
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  async function handleHeartbeat() {
    if (!wallet.address) return
    setTxLoading(true)
    setTxError(null)
    try {
      await heartbeat(contractAddress, wallet.address)
      refresh()
    } catch (err) {
      setTxError(err instanceof Error ? err.message : 'Heartbeat başarısız')
    } finally {
      setTxLoading(false)
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault()
    if (!wallet.address) return
    const stroops = xlmToStroops(parseFloat(withdrawAmount) || 0)
    setTxLoading(true)
    setTxError(null)
    try {
      await withdraw(contractAddress, wallet.address, stroops)
      setWithdrawAmount('')
      refresh()
    } catch (err) {
      setTxError(err instanceof Error ? err.message : 'Çekim başarısız')
    } finally {
      setTxLoading(false)
    }
  }

  if (loading || !info) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--on-surface-variant)' }}>Yükleniyor…</p>
        </div>
      </div>
    )
  }

  const beneficiaryUrl = `${window.location.origin}${window.location.pathname}?contract=${contractAddress}`

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <p className="label-sm-caps" style={{ marginBottom: '0.5rem' }}>Vasiyetname Paneli</p>
            <h1 className="headline-lg">The Eternal Vault</h1>
          </div>
          <StateDisplay state={info.state} />
        </div>

        {/* Wallet */}
        {!wallet.connected && (
          <div className="vitality-card" style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>
              İşlem yapabilmek için cüzdanını bağla.
            </p>
            <button className="btn-primary" onClick={wallet.connect} disabled={wallet.connecting}>
              {wallet.connecting ? 'Bağlanıyor…' : '🔗 Freighter ile Bağlan'}
            </button>
          </div>
        )}

        {/* Countdown banner — Active state */}
        {info.state === 'Active' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <CountdownBanner info={info} onHeartbeat={handleHeartbeat} loading={txLoading} />
          </div>
        )}

        {/* Pending state banner */}
        {info.state === 'Pending' && (
          <div style={{
            background: 'rgba(255,180,0,0.08)',
            borderLeft: '2px solid #ffb400',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <div>
              <p className="label-sm-caps" style={{ color: '#ffb400', marginBottom: '0.25rem' }}>Transfer Beklemede</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--title-lg)', fontWeight: 600 }}>
                {formatDuration(
                  info.pendingSince
                    ? Math.max(0, info.pendingSince + 72 * 3600 - Math.floor(Date.now() / 1000))
                    : 0
                )} içinde kesinleşir
              </p>
              <p style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
                Hayatta olduğunu kanıtlamak için heartbeat at.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={handleHeartbeat}
              disabled={txLoading || !wallet.connected}
            >
              {txLoading ? 'Gönderiliyor…' : '🛡 İtiraz Et'}
            </button>
          </div>
        )}

        {/* Executed state */}
        {info.state === 'Executed' && (
          <div className="vitality-card" style={{ marginBottom: '1.5rem', borderLeftColor: 'var(--secondary)' }}>
            <p className="label-sm-caps" style={{ marginBottom: '0.25rem' }}>Transfer Tamamlandı</p>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)' }}>
              Varlıklar varise aktarıldı. Bu vasiyetname artık kapalıdır.
            </p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <p className="label-sm-caps" style={{ marginBottom: '0.5rem' }}>Kilitli Miktar</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--headline-md)', fontWeight: 700, color: 'var(--primary)' }}>
              {stroopsToXlm(info.balance)} XLM
            </p>
          </div>
          <div className="card">
            <p className="label-sm-caps" style={{ marginBottom: '0.5rem' }}>Son Heartbeat</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--title-lg)', fontWeight: 600 }}>
              {new Date(info.lastHeartbeat * 1000).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Varis info */}
        <div className="vitality-card" style={{ marginBottom: '1.5rem' }}>
          <p className="label-sm-caps" style={{ marginBottom: '0.75rem' }}>Varis</p>
          <p style={{ fontFamily: 'monospace', fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)', wordBreak: 'break-all' }}>
            {info.beneficiary}
          </p>
          <p style={{ marginTop: '1rem', fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)' }}>
            Varis bağlantısı:{' '}
            <a href={beneficiaryUrl} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              {beneficiaryUrl.slice(0, 60)}…
            </a>
          </p>
        </div>

        {/* Withdraw — Active only */}
        {info.state === 'Active' && (
          <form onSubmit={handleWithdraw} style={{ marginBottom: '1.5rem' }}>
            <div className="card">
              <p className="label-sm-caps" style={{ marginBottom: '0.75rem' }}>XLM Çek</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Miktar (XLM)"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  disabled={!wallet.connected || txLoading}
                />
                <button
                  type="submit"
                  className="btn-secondary"
                  disabled={!wallet.connected || txLoading || !withdrawAmount}
                  style={{ flexShrink: 0 }}
                >
                  Çek
                </button>
              </div>
            </div>
          </form>
        )}

        {txError && (
          <p style={{ color: '#ff6b6b', fontSize: 'var(--body-sm)', marginBottom: '1rem' }}>{txError}</p>
        )}

        {/* Reset */}
        <button className="btn-secondary" onClick={onReset} style={{ fontSize: 'var(--body-sm)' }}>
          ← Farklı vasiyetname aç
        </button>
      </div>
    </div>
  )
}
