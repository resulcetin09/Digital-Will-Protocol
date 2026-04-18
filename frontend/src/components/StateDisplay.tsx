import type { WillState } from '../contract/types'

interface Props {
  state: WillState
}

const labels: Record<WillState, string> = {
  Active: 'Aktif',
  Pending: 'Beklemede',
  Executed: 'Tamamlandı',
}

export default function StateDisplay({ state }: Props) {
  const chipClass =
    state === 'Active' ? 'chip chip-active' :
    state === 'Pending' ? 'chip chip-pending' :
    'chip chip-executed'

  return <span className={chipClass}>{labels[state]}</span>
}
