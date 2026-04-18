import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { initialize, deposit } from '../contract/client'
import { xlmToStroops, MIN_DEPOSIT, XLM_FACTOR } from '../contract/types'

interface Props {
  onComplete: (contractAddress: string) => void
}

const INTERVAL_OPTIONS = [
  { label: '7 gün', value: 7 * 24 * 60 * 60 },
  { label: '14 gün', value: 14 * 24 * 60 * 60 },
  { label: '30 gün', value: 30 * 24 * 60 * 60 },
]

export default function Setup({ onComplete }: Props) {
  const wallet = useWallet()
  const [beneficiary, setBeneficiary] = useState('')
  const [interval, setInterval] = useState(INTERVAL_OPTIONS[2].value)
  const [xlmAmount, setXlmAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amountStroops = xlmToStroops(parseFloat(xlmAmount) || 0)
  const belowMinimum = amountStroops < MIN_DEPOSIT
  const canSubmit = wallet.connected && beneficiary.trim().length > 0 && !belowMinimum && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !wallet.address) return
    setSubmitting(true)
    setError(null)
    try {
      // In MVP the contract address is the owner address (mock)
      const contractAddress = `mock_contract_${Date.now()}`
      await initialize(contractAddress, wallet.address, beneficiary.trim(), interval)
      await deposit(contractAddress, wallet.address, amountStroops)
      onComplete(contractAddress)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <p className="label-sm-caps" style={{ marginBottom: '0.5rem' }}>
            Dijital Vasiyetname Protokolü
          </p>
          <h1 className="display-lg" style={{ color: 'var(--on-surface)' }}>
            The Eternal<br />
            <span style={{ color: 'var(--primary)' }}>Vault</span>
          </h1>
          <p style={{
            marginTop: '1rem',
            color: 'var(--on-surface-variant)',
            fontSize: 'var(--body-md)',
            maxWidth: '480px',
            lineHeight: 1.6,
          }}>
            Kripto varlıklarını güvence altına al. Belirlediğin koşullar gerçekleştiğinde,
            hiçbir aracıya ihtiyaç duymadan varisine otomatik olarak aktarılır.
          </p>
        </div>

        {/* Wallet connect */}
        {!wallet.connected ? (
          <div className="vitality-card" style={{ marginBottom: '2rem' }}>
            <p className="label-sm-caps" style={{ marginBottom: '1rem' }}>Başlamak için cüzdanını bağla</p>
            <button className="btn-primary" onClick={wallet.connect} disabled={wallet.connecting}>
              {wallet.connecting ? 'Bağlanıyor…' : '🔗 Freighter ile Bağlan'}
            </button>
            {wallet.error && (
              <p style={{ marginTop: '0.75rem', color: '#ff6b6b', fontSize: 'var(--body-sm)' }}>
                {wallet.error}
              </p>
            )}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
            padding: '0.75rem 1rem',
            background: 'var(--surface-container)',
            borderRadius: 'var(--radius-xl)',
          }}>
            <span className="chip chip-active">Bağlı</span>
            <span style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)', fontFamily: 'monospace' }}>
              {wallet.address?.slice(0, 8)}…{wallet.address?.slice(-6)}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Beneficiary */}
            <div>
              <label className="label-sm-caps" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Varis Adresi
              </label>
              <input
                className="input"
                type="text"
                placeholder="G... (Stellar public key)"
                value={beneficiary}
                onChange={e => setBeneficiary(e.target.value)}
                disabled={!wallet.connected}
              />
            </div>

            {/* Heartbeat interval */}
            <div>
              <label className="label-sm-caps" style={{ display: 'block', marginBottom: '0.75rem' }}>
                Heartbeat Aralığı
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {INTERVAL_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setInterval(opt.value)}
                    className={interval === opt.value ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1 }}
                    disabled={!wallet.connected}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)' }}>
                Bu süre içinde sinyal vermezsen transfer tetiklenebilir.
              </p>
            </div>

            {/* XLM amount */}
            <div>
              <label className="label-sm-caps" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Kilitlenecek XLM Miktarı
              </label>
              <input
                className="input"
                type="number"
                min={MIN_DEPOSIT / XLM_FACTOR}
                step="0.1"
                placeholder={`Minimum ${MIN_DEPOSIT / XLM_FACTOR} XLM`}
                value={xlmAmount}
                onChange={e => setXlmAmount(e.target.value)}
                disabled={!wallet.connected}
              />
              {xlmAmount && belowMinimum && (
                <p style={{ marginTop: '0.5rem', fontSize: 'var(--body-sm)', color: '#ff6b6b' }}>
                  Minimum {MIN_DEPOSIT / XLM_FACTOR} XLM gereklidir (1 XLM rezerv + 1 XLM buffer).
                </p>
              )}
            </div>

            {error && (
              <p style={{ color: '#ff6b6b', fontSize: 'var(--body-sm)' }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={!canSubmit}
              style={{ width: '100%', padding: '1rem' }}
            >
              {submitting ? 'İşlem yapılıyor…' : 'Vasiyetnameyi Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
