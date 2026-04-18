import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useWill } from '../hooks/useWill'
import { execute } from '../contract/client'
import {
  stroopsToXlm,
  formatDuration,
  secondsUntilExecutable,
} from '../contract/types'
import StateDisplay from '../components/StateDisplay'

interface Props {
  contractAddress: string
}

export default function Beneficiary({ contractAddress }: Props) {
  const wallet = useWallet()
  const { info, loading, refresh } = useWill(contractAddress)
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [txSuccess, setTxSuccess] = useState(false)

  async function handleExecute() {
    if (!wallet.address) return
    setTxLoading(true)
    setTxError(null)
    try {
      await execute(contractAddress, wallet.address)
      setTxSuccess(true)
      refresh()
    } catch (err) {
      setTxError(err instanceof Error ? err.message : 'İşlem başarısız')
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

  const remainingGrace = secondsUntilExecutable(info)
  const canExecute =
    info.state === 'Pending' &&
    remainingGrace === 0 &&
    info.balance > 0

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <p className="label-sm-caps" style={{ marginBottom: '0.5rem' }}>Dijital Miras</p>
          <h1 className="headline-lg" style={{ marginBottom: '0.75rem' }}>
            Sana bırakılan varlık
          </h1>
          <StateDisplay state={info.state} />
        </div>

        {/* Main status card */}
        <div className="vitality-card ambient-glow" style={{ marginBottom: '2rem' }}>
          <p className="label-sm-caps" style={{ marginBottom: '0.5rem' }}>Kilitli Miktar</p>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--display-lg)',
            fontWeight: 800,
            color: 'var(--primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}>
            {stroopsToXlm(info.balance)} XLM
          </p>

          {/* State-specific messaging */}
          {info.state === 'Active' && (
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)', lineHeight: 1.6 }}>
              Vasiyetname sahibi aktif. Varlıklar henüz transfer edilemez.
              Sahibin heartbeat göndermesi durduğunda ve bekleme süresi dolduğunda
              transfer işlemini başlatabilirsin.
            </p>
          )}

          {info.state === 'Pending' && remainingGrace > 0 && (
            <div>
              <p style={{ color: '#ffb400', fontSize: 'var(--body-md)', marginBottom: '0.5rem' }}>
                Transfer bekleme süresinde.
              </p>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)' }}>
                <strong style={{ color: 'var(--on-surface)' }}>{formatDuration(remainingGrace)}</strong> sonra
                transfer işlemini başlatabilirsin.
              </p>
            </div>
          )}

          {info.state === 'Pending' && remainingGrace === 0 && info.balance > 0 && (
            <p style={{ color: 'var(--primary)', fontSize: 'var(--body-md)', fontWeight: 600 }}>
              Transfer hazır — aşağıdaki butona tıklayarak varlığı al.
            </p>
          )}

          {info.state === 'Executed' && (
            <p style={{ color: 'var(--secondary)', fontSize: 'var(--body-md)' }}>
              Transfer tamamlandı. Varlıklar hesabına aktarıldı.
            </p>
          )}

          {info.balance === 0 && info.state !== 'Executed' && (
            <p style={{ color: '#ff6b6b', fontSize: 'var(--body-sm)', marginTop: '0.5rem' }}>
              Kontrat bakiyesi yetersiz — transfer gerçekleştirilemez.
            </p>
          )}
        </div>

        {/* Wallet connect */}
        {!wallet.connected && info.state === 'Pending' && remainingGrace === 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>
              Transfer için cüzdanını bağla.
            </p>
            <button className="btn-primary" onClick={wallet.connect} disabled={wallet.connecting}>
              {wallet.connecting ? 'Bağlanıyor…' : '🔗 Freighter ile Bağlan'}
            </button>
          </div>
        )}

        {/* Execute button */}
        {!txSuccess && (
          <button
            className="btn-primary"
            onClick={handleExecute}
            disabled={!canExecute || !wallet.connected || txLoading}
            style={{ width: '100%', padding: '1.125rem', fontSize: 'var(--title-md)', marginBottom: '1rem' }}
          >
            {txLoading
              ? 'İşlem yapılıyor…'
              : canExecute
              ? 'Transferi Başlat'
              : info.state === 'Executed'
              ? 'Transfer Tamamlandı'
              : 'Transfer Henüz Hazır Değil'}
          </button>
        )}

        {txSuccess && (
          <div className="vitality-card" style={{ marginBottom: '1rem' }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
              ✓ Transfer başarıyla gerçekleştirildi.
            </p>
          </div>
        )}

        {txError && (
          <p style={{ color: '#ff6b6b', fontSize: 'var(--body-sm)', marginBottom: '1rem' }}>{txError}</p>
        )}

        {/* Pending countdown detail */}
        {info.state === 'Pending' && info.pendingSince && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <p className="label-sm-caps" style={{ marginBottom: '0.75rem' }}>Bekleme Detayı</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}>Tetiklenme zamanı</span>
                <span style={{ fontSize: 'var(--body-sm)' }}>
                  {new Date(info.pendingSince * 1000).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}>Bekleme süresi</span>
                <span style={{ fontSize: 'var(--body-sm)' }}>72 saat</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}>Kalan süre</span>
                <span style={{ fontSize: 'var(--body-sm)', color: remainingGrace === 0 ? 'var(--primary)' : '#ffb400' }}>
                  {remainingGrace === 0 ? 'Hazır' : formatDuration(remainingGrace)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
