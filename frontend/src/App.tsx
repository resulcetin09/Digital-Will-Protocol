import { useState } from 'react'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import Beneficiary from './pages/Beneficiary'

type Route = 'setup' | 'dashboard' | 'beneficiary'

function getInitialRoute(): Route {
  const params = new URLSearchParams(window.location.search)
  if (params.get('contract')) return 'beneficiary'
  const saved = localStorage.getItem('dwp_contract')
  if (saved) return 'dashboard'
  return 'setup'
}

export default function App() {
  const [route, setRoute] = useState<Route>(getInitialRoute)
  const [contractAddress, setContractAddress] = useState<string>(
    new URLSearchParams(window.location.search).get('contract') ||
    localStorage.getItem('dwp_contract') ||
    ''
  )

  function handleSetupComplete(address: string) {
    localStorage.setItem('dwp_contract', address)
    setContractAddress(address)
    setRoute('dashboard')
  }

  function handleReset() {
    localStorage.removeItem('dwp_contract')
    setContractAddress('')
    setRoute('setup')
  }

  if (route === 'beneficiary') {
    return <Beneficiary contractAddress={contractAddress} />
  }
  if (route === 'dashboard') {
    return <Dashboard contractAddress={contractAddress} onReset={handleReset} />
  }
  return <Setup onComplete={handleSetupComplete} />
}
