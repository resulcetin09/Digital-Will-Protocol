import { useState } from 'react'
import { Shield, ChevronRight, Lock, Heart, Users } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { initialize, deposit } from '../contract/client'
import { xlmToStroops, MIN_DEPOSIT, XLM_FACTOR } from '../contract/types'

interface Props {
  onComplete: (contractAddress: string) => void
}

const INTERVAL_OPTIONS = [
  { label: '7 Days', value: 7 * 24 * 60 * 60, desc: 'Weekly check-in' },
  { label: '14 Days', value: 14 * 24 * 60 * 60, desc: 'Bi-weekly check-in' },
  { label: '30 Days', value: 30 * 24 * 60 * 60, desc: 'Monthly check-in' },
]

const STEPS = ['Connect Wallet', 'Configure Will', 'Lock Assets']

export default function Setup({ onComplete }: Props) {
  const wallet = useWallet()
  const [step, setStep] = useState(0)
  const [beneficiary, setBeneficiary] = useState('')
  const [beneficiaryTouched, setBeneficiaryTouched] = useState(false)
  const [interval, setIntervalVal] = useState(INTERVAL_OPTIONS[2].value)
  const [xlmAmount, setXlmAmount] = useState('')
  const [amountTouched, setAmountTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Manuel adres girişi için state
  const [manualAddress, setManualAddress] = useState('')
  const [manualAddressTouched, setManualAddressTouched] = useState(false)
  const [useManualEntry, setUseManualEntry] = useState(false)

  const amountStroops = xlmToStroops(parseFloat(xlmAmount) || 0)
  const belowMinimum = amountStroops < MIN_DEPOSIT
  const beneficiaryValid = beneficiary.trim().startsWith('G') && beneficiary.trim().length >= 56
  
  // Manuel adres validasyonu
  const manualAddressValid = manualAddress.trim().startsWith('G') && manualAddress.trim().length === 56
  
  // Aktif adres: Freighter'dan veya manuel girişten
  const activeAddress = useManualEntry ? (manualAddressValid ? manualAddress.trim() : null) : wallet.address
  const isConnected = useManualEntry ? manualAddressValid : wallet.connected

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeAddress) return
    setSubmitting(true)
    setError(null)
    try {
      const contractAddress = `mock_contract_${Date.now()}`
      await initialize(contractAddress, activeAddress, beneficiary.trim(), interval)
      await deposit(contractAddress, activeAddress, amountStroops)
      onComplete(contractAddress)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--surface)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>

      {/* ── Left panel — brand / steps ── */}
      <div style={{
        background: 'var(--surface-container-low)',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid rgba(68,71,77,0.15)',
      }}>
        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '3.5rem' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, var(--primary), var(--on-primary-container))',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={18} color="var(--on-primary)" strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--title-lg)', color: 'var(--on-surface)', lineHeight: 1.2 }}>
                Eternal Vault
              </p>
              <p style={{ fontSize: 'var(--label-sm)', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Digital Will Protocol
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STEPS.map((s, i) => {
              const done = i < step
              const active = i === step
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '32px', height: '32px',
                      borderRadius: '50%',
                      background: done ? 'var(--primary)' : active ? 'var(--primary-container)' : 'var(--surface-container)',
                      border: active ? '2px solid var(--primary)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}>
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--on-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <span style={{
                          fontSize: 'var(--label-sm)',
                          fontWeight: 700,
                          color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
                        }}>{i + 1}</span>
                      )}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{
                        width: '2px',
                        height: '40px',
                        background: done ? 'var(--primary)' : 'rgba(68,71,77,0.3)',
                        margin: '4px 0',
                        transition: 'background 0.2s ease',
                      }} />
                    )}
                  </div>
                  <div style={{ paddingTop: '6px', paddingBottom: i < STEPS.length - 1 ? '0' : '0' }}>
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: active ? 600 : 400,
                      fontSize: 'var(--body-md)',
                      color: active ? 'var(--on-surface)' : done ? 'var(--primary)' : 'var(--on-surface-variant)',
                    }}>{s}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feature highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { icon: <Heart size={14} color="var(--primary)" />, text: 'Heartbeat-based liveness detection' },
            { icon: <Lock size={14} color="var(--primary)" />, text: 'Self-custodial — you always own your assets' },
            { icon: <Users size={14} color="var(--primary)" />, text: 'Permissionless execution on Stellar' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '28px', height: '28px',
                background: 'var(--primary-container)',
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <p style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>

          {/* Step 0 — Connect Wallet */}
          {step === 0 && (
            <div>
              <p className="label-sm-caps" style={{ marginBottom: '0.5rem' }}>Step 1 of 3</p>
              <h2 className="headline-md" style={{ marginBottom: '0.5rem' }}>Connect Your Wallet</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)', lineHeight: 1.6, marginBottom: '2rem' }}>
                Connect your Freighter wallet to begin creating your digital will on the Stellar network.
              </p>

              {!wallet.connected ? (
                <div>
                  <button
                    className="btn-primary"
                    onClick={wallet.connect}
                    disabled={wallet.connecting || useManualEntry}
                    style={{ width: '100%', padding: '1rem', fontSize: 'var(--title-md)', marginBottom: '1rem' }}
                    aria-busy={wallet.connecting}
                  >
                    {wallet.connecting ? 'Connecting…' : 'Connect Freighter Wallet'}
                  </button>
                  {wallet.error && (
                    <p role="alert" style={{ color: '#ff6b6b', fontSize: 'var(--body-sm)', marginTop: '0.5rem' }}>
                      {wallet.error}
                    </p>
                  )}
                  <p style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: '1rem' }}>
                    Don't have Freighter?{' '}
                    <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      Install it here
                    </a>
                  </p>
                  
                  {/* Ayırıcı */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(68,71,77,0.15)' }} />
                    <span style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      veya
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(68,71,77,0.15)' }} />
                  </div>
                  
                  {/* Manuel adres girişi toggle */}
                  <button
                    type="button"
                    onClick={() => setUseManualEntry(!useManualEntry)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: 'var(--body-md)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 500,
                      minHeight: '44px',
                    }}
                  >
                    {useManualEntry ? '← Freighter ile bağlan' : 'Adresi manuel gir'}
                  </button>
                  
                  {/* Manuel adres input alanı */}
                  {useManualEntry && (
                    <div style={{ marginTop: '1rem' }}>
                      <label htmlFor="manual-address" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        <span className="label-sm-caps">Stellar Public Key *</span>
                      </label>
                      <input
                        id="manual-address"
                        className="input"
                        type="text"
                        placeholder="G... (56 karakter)"
                        value={manualAddress}
                        onChange={e => setManualAddress(e.target.value)}
                        onBlur={() => setManualAddressTouched(true)}
                        autoComplete="off"
                        aria-describedby="manual-address-hint manual-address-error"
                        style={{ minHeight: '48px' }}
                      />
                      <p id="manual-address-hint" style={{ marginTop: '0.375rem', fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)' }}>
                        Stellar public key adresinizi girin (G ile başlar, 56 karakter).
                      </p>
                      {manualAddressTouched && !manualAddressValid && manualAddress.length > 0 && (
                        <p id="manual-address-error" role="alert" style={{ marginTop: '0.375rem', fontSize: 'var(--body-sm)', color: '#ff6b6b' }}>
                          Geçerli bir Stellar public key girin (G ile başlamalı, 56 karakter olmalı).
                        </p>
                      )}
                      {manualAddressValid && (
                        <button
                          className="btn-primary"
                          onClick={() => setStep(1)}
                          style={{ width: '100%', padding: '1rem', fontSize: 'var(--title-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
                        >
                          Continue <ChevronRight size={18} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: 'var(--surface-container)',
                    borderRadius: 'var(--radius-xl)',
                    marginBottom: '1.5rem',
                    borderLeft: '2px solid var(--primary)',
                  }}>
                    <span className="chip chip-active">Connected</span>
                    <span style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {wallet.address?.slice(0, 10)}…{wallet.address?.slice(-8)}
                    </span>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => setStep(1)}
                    style={{ width: '100%', padding: '1rem', fontSize: 'var(--title-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Configure Will */}
          {step === 1 && (
            <div>
              <p className="label-sm-caps" style={{ marginBottom: '0.5rem' }}>Step 2 of 3</p>
              <h2 className="headline-md" style={{ marginBottom: '0.5rem' }}>Configure Your Will</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)', lineHeight: 1.6, marginBottom: '2rem' }}>
                Set your beneficiary address and how often you'll check in to confirm you're active.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Beneficiary */}
                <div>
                  <label htmlFor="beneficiary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    <span className="label-sm-caps">Beneficiary Address *</span>
                  </label>
                  <input
                    id="beneficiary"
                    className="input"
                    type="text"
                    placeholder="G... (Stellar public key)"
                    value={beneficiary}
                    onChange={e => setBeneficiary(e.target.value)}
                    onBlur={() => setBeneficiaryTouched(true)}
                    autoComplete="off"
                    aria-describedby="beneficiary-hint beneficiary-error"
                    style={{ minHeight: '48px' }}
                  />
                  <p id="beneficiary-hint" style={{ marginTop: '0.375rem', fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)' }}>
                    The Stellar address that will receive your assets.
                  </p>
                  {beneficiaryTouched && !beneficiaryValid && beneficiary.length > 0 && (
                    <p id="beneficiary-error" role="alert" style={{ marginTop: '0.375rem', fontSize: 'var(--body-sm)', color: '#ff6b6b' }}>
                      Enter a valid Stellar public key (starts with G, 56 characters).
                    </p>
                  )}
                </div>

                {/* Heartbeat interval */}
                <div>
                  <p className="label-sm-caps" style={{ marginBottom: '0.75rem' }}>Check-in Frequency *</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {INTERVAL_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setIntervalVal(opt.value)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.875rem 1rem',
                          background: interval === opt.value ? 'var(--primary-container)' : 'var(--surface-container)',
                          border: interval === opt.value ? '1px solid rgba(78,222,163,0.3)' : '1px solid rgba(68,71,77,0.15)',
                          borderRadius: 'var(--radius-xl)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          minHeight: '52px',
                        }}
                        aria-pressed={interval === opt.value}
                      >
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ fontWeight: 600, fontSize: 'var(--body-md)', color: interval === opt.value ? 'var(--primary)' : 'var(--on-surface)' }}>
                            {opt.label}
                          </p>
                          <p style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)' }}>{opt.desc}</p>
                        </div>
                        {interval === opt.value && (
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--on-primary)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!beneficiaryValid}
                  style={{ width: '100%', padding: '1rem', fontSize: 'var(--title-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  Continue <ChevronRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)', textAlign: 'center', padding: '0.5rem', minHeight: '44px' }}
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Lock Assets */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <p className="label-sm-caps" style={{ marginBottom: '0.5rem' }}>Step 3 of 3</p>
              <h2 className="headline-md" style={{ marginBottom: '0.5rem' }}>Lock Your Assets</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)', lineHeight: 1.6, marginBottom: '2rem' }}>
                Deposit XLM into your vault. These assets will be transferred to your beneficiary when the protocol executes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Summary */}
                <div style={{
                  padding: '1rem',
                  background: 'var(--surface-container)',
                  borderRadius: 'var(--radius-xl)',
                  borderLeft: '2px solid var(--primary)',
                }}>
                  <p className="label-sm-caps" style={{ marginBottom: '0.75rem' }}>Will Summary</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)' }}>Beneficiary</span>
                      <span style={{ fontSize: 'var(--body-sm)', fontFamily: 'monospace', color: 'var(--on-surface)' }}>
                        {beneficiary.slice(0, 8)}…{beneficiary.slice(-6)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)' }}>Check-in frequency</span>
                      <span style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface)' }}>
                        {INTERVAL_OPTIONS.find(o => o.value === interval)?.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)' }}>Grace period</span>
                      <span style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface)' }}>72 hours</span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="xlm-amount" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    <span className="label-sm-caps">Amount to Lock (XLM) *</span>
                  </label>
                  <input
                    id="xlm-amount"
                    className="input"
                    type="number"
                    min={MIN_DEPOSIT / XLM_FACTOR}
                    step="0.1"
                    placeholder={`Minimum ${MIN_DEPOSIT / XLM_FACTOR} XLM`}
                    value={xlmAmount}
                    onChange={e => setXlmAmount(e.target.value)}
                    onBlur={() => setAmountTouched(true)}
                    aria-describedby="amount-hint amount-error"
                    style={{ minHeight: '48px' }}
                  />
                  <p id="amount-hint" style={{ marginTop: '0.375rem', fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)' }}>
                    Minimum {MIN_DEPOSIT / XLM_FACTOR} XLM (includes 1 XLM Stellar reserve).
                  </p>
                  {amountTouched && xlmAmount && belowMinimum && (
                    <p id="amount-error" role="alert" style={{ marginTop: '0.375rem', fontSize: 'var(--body-sm)', color: '#ff6b6b' }}>
                      Minimum deposit is {MIN_DEPOSIT / XLM_FACTOR} XLM.
                    </p>
                  )}
                </div>

                {error && (
                  <p role="alert" style={{ color: '#ff6b6b', fontSize: 'var(--body-sm)', padding: '0.75rem 1rem', background: 'rgba(255,107,107,0.08)', borderRadius: 'var(--radius-xl)' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!activeAddress || belowMinimum || !xlmAmount || submitting}
                  style={{ width: '100%', padding: '1rem', fontSize: 'var(--title-md)' }}
                  aria-busy={submitting}
                >
                  {submitting ? 'Creating Vault…' : 'Create & Lock Vault'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)', textAlign: 'center', padding: '0.5rem', minHeight: '44px' }}
                >
                  ← Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
