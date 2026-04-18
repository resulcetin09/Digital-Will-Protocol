import { Shield, Heart, Users, Lock } from 'lucide-react'

interface Props {
  onGetStarted: () => void
}

export default function Landing({ onGetStarted }: Props) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--surface)', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav className="glass" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(68,71,77,0.15)',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '28px', height: '28px',
              background: 'linear-gradient(135deg, var(--primary), var(--on-primary-container))',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={14} color="var(--on-primary)" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--title-md)',
              color: 'var(--on-surface)',
            }}>
              The Eternal Vault
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {['Dashboard', 'Vault', 'Claims', 'Security'].map((item, i) => (
              <a key={item} href="#" style={{
                fontSize: 'var(--body-md)',
                color: i === 0 ? 'var(--primary)' : 'var(--on-surface-variant)',
                textDecoration: 'none',
                fontWeight: i === 0 ? 600 : 400,
                borderBottom: i === 0 ? '2px solid var(--primary)' : 'none',
                paddingBottom: i === 0 ? '2px' : '0',
                transition: 'color 0.15s',
              }}>
                {item}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              aria-label="Notifications"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: '8px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <button
              aria-label="Settings"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: '8px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            </button>
            <button className="btn-primary" onClick={onGetStarted} style={{ padding: '0.5rem 1.25rem', fontSize: 'var(--body-sm)' }}>
              Lock Vault
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'var(--surface)',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 1rem',
            background: 'var(--primary-container)',
            borderRadius: 'var(--radius-full)',
            marginBottom: '2rem',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
            <span style={{ fontSize: 'var(--label-sm)', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--primary)', textTransform: 'uppercase' }}>
              Institutional Grade Security on Stellar
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--on-surface)',
            marginBottom: '1.5rem',
          }}>
            Secure Your Digital{' '}
            <span style={{ color: 'var(--primary)' }}>Legacy</span>
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize: 'var(--title-md)',
            color: 'var(--on-surface-variant)',
            lineHeight: 1.7,
            maxWidth: '480px',
            margin: '0 auto 2.5rem',
          }}>
            The Digital Will Protocol ensures your assets are securely managed
            and automatically distributed to your beneficiaries using
            decentralized Soroban smart contracts.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onGetStarted} style={{ padding: '0.875rem 2rem', fontSize: 'var(--title-md)' }}>
              Create Your Will
            </button>
            <button className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: 'var(--title-md)' }}>
              Explore Protocol
            </button>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div style={{
          maxWidth: '560px',
          margin: '4rem auto 0',
          position: 'relative',
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            inset: '-40px',
            background: 'radial-gradient(ellipse at center, rgba(78,222,163,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Mockup card */}
          <div style={{
            background: 'var(--surface-container)',
            borderRadius: '16px',
            border: '1px solid rgba(68,71,77,0.2)',
            padding: '1.5rem',
            position: 'relative',
          }}>
            {/* Mockup header */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem' }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => (
                <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
              ))}
            </div>

            {/* Vault status row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.875rem 1rem',
              background: 'var(--surface-container-high)',
              borderRadius: 'var(--radius-xl)',
              marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: 'var(--body-sm)', color: 'var(--on-surface-variant)' }}>Vault Status</span>
              <span className="chip chip-active" style={{ fontSize: '0.7rem' }}>Active</span>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{
                padding: '0.875rem 1rem',
                background: 'var(--surface-container-high)',
                borderRadius: 'var(--radius-xl)',
              }}>
                <p style={{ fontSize: 'var(--label-sm)', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Protected Assets</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--title-lg)', color: 'var(--primary)' }}>$1.2M+ USD</p>
              </div>
              <div style={{
                padding: '0.875rem 1rem',
                background: 'var(--surface-container-high)',
                borderRadius: 'var(--radius-xl)',
              }}>
                <p style={{ fontSize: 'var(--label-sm)', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Next Heartbeat Check</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--title-lg)', color: 'var(--on-surface)' }}>in 14 days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{
        background: 'var(--surface-container-low)',
        padding: '5rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--on-surface)',
              marginBottom: '0.75rem',
            }}>
              Architected for Eternity
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)' }}>
              Trustless execution powered by Stellar's robust smart contract platform.
            </p>
          </div>

          {/* Feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              {
                icon: <Heart size={20} color="var(--primary)" strokeWidth={2} />,
                title: 'The Heartbeat Mechanism',
                desc: 'Regular cryptographic check-ins ensure your protocol remains dormant until necessary. If a heartbeat is missed after a predefined grace period, the execution sequence initiates.',
              },
              {
                icon: <Shield size={20} color="var(--primary)" strokeWidth={2} />,
                title: 'Soroban Smart Contracts',
                desc: 'Built on Stellar\'s high-performance compute platform for fast, low-cost, and deterministic execution of complex distribution logic.',
              },
              {
                icon: <Users size={20} color="var(--primary)" strokeWidth={2} />,
                title: 'Multi-Beneficiary Routing',
                desc: 'Define precise percentage allocations or specific asset distributions across multiple wallets with cryptographic certainty.',
              },
              {
                icon: <Lock size={20} color="var(--primary)" strokeWidth={2} />,
                title: 'Self-Custodial Always',
                desc: 'The protocol never takes ownership of your assets. They remain in your control until the specific conditions of your digital will are met.',
                badge: 'Immutable Record',
              },
            ].map((f, i) => (
              <div key={i} className="vitality-card" style={{ cursor: 'default' }}>
                <div style={{
                  width: '40px', height: '40px',
                  background: 'var(--primary-container)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  {f.icon}
                </div>
                {f.badge && (
                  <span className="chip chip-active" style={{ fontSize: '0.65rem', marginBottom: '0.75rem', display: 'inline-flex' }}>
                    {f.badge}
                  </span>
                )}
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--title-lg)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                  marginBottom: '0.75rem',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: 'var(--body-md)',
                  color: 'var(--on-surface-variant)',
                  lineHeight: 1.65,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section style={{
        background: 'var(--surface)',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <p className="label-sm-caps" style={{ marginBottom: '1rem' }}>Start Today</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            color: 'var(--on-surface)',
            marginBottom: '1.5rem',
          }}>
            Your legacy deserves protection
          </h2>
          <button className="btn-primary" onClick={onGetStarted} style={{ padding: '1rem 2.5rem', fontSize: 'var(--title-md)' }}>
            Create Your Will
          </button>
        </div>
      </section>
    </div>
  )
}
