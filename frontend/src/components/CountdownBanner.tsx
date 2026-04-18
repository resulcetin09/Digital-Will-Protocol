import { useEffect, useState } from 'react'
import type { WillInfo } from '../contract/types'
import { secondsUntilExpiry, isWarningThreshold, formatDuration } from '../contract/types'

interface Props {
  info: WillInfo
  onHeartbeat: () => void
  loading?: boolean
}

export default function CountdownBanner({ info, onHeartbeat, loading }: Props) {
  const [remaining, setRemaining] = useState(() => secondsUntilExpiry(info))
  const [warning, setWarning] = useState(() => isWarningThreshold(info))

  useEffect(() => {
    const tick = () => {
      const r = secondsUntilExpiry(info)
      setRemaining(r)
      setWarning(isWarningThreshold(info))
    }
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [info])

  if (info.state !== 'Active') return null

  const bannerStyle: React.CSSProperties = warning
    ? {
        background: 'rgba(255,180,0,0.08)',
        borderLeft: '2px solid #ffb400',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }
    : {
        background: 'var(--surface-container)',
        borderLeft: '2px solid var(--primary)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }

  return (
    <div style={bannerStyle}>
      <div>
        <p className="label-sm-caps" style={{ marginBottom: '0.25rem' }}>
          Sonraki heartbeat
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--title-lg)',
          fontWeight: 600,
          color: warning ? '#ffb400' : 'var(--on-surface)',
        }}>
          {remaining === 0
            ? 'Süre doldu — hemen heartbeat at!'
            : `${formatDuration(remaining)} kaldı`}
        </p>
        {warning && (
          <p style={{ fontSize: 'var(--body-sm)', color: '#ffb400', marginTop: '0.25rem' }}>
            Süre dolmadan önce heartbeat at, aksi hâlde transfer tetiklenebilir.
          </p>
        )}
      </div>
      <button
        className="btn-primary"
        onClick={onHeartbeat}
        disabled={loading}
        style={warning ? { flexShrink: 0 } : { flexShrink: 0, opacity: 0.85 }}
      >
        {loading ? 'Gönderiliyor…' : '💚 Heartbeat At'}
      </button>
    </div>
  )
}
