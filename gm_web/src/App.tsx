import { useEffect, useState, type ReactNode } from 'react'
import {
  initializeFacebookInstant,
  isFacebookInstantGames,
  showFacebookPlayerProfileOverlay,
} from './platform/facebook/fbInstant'
import CreateGameScreen from './screens/CreateGameScreen'
import HomeScreen from './screens/HomeScreen'
import MatchLobbyScreen from './screens/MatchLobbyScreen'
import type { CreateGameResponse } from '../../shared/types/game'

type Screen = 'home' | 'create-game' | 'match-lobby'
type NavKey = 'home' | 'matches' | 'history' | 'profile'

const navigationItems: Array<{ key: NavKey; label: string; icon: string }> = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'matches', label: 'Matches', icon: '▤' },
  { key: 'history', label: 'History', icon: '◔' },
  { key: 'profile', label: 'Profile', icon: '◉' },
]

function AppShell({
  children,
  footer,
  activeTab,
  onTabChange,
}: {
  children: ReactNode
  footer?: ReactNode
  activeTab: NavKey
  onTabChange: (tab: NavKey) => void
}) {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-[linear-gradient(180deg,#1d1b21,#121016)]">
      <header className="flex items-center justify-between px-[22px] pt-[18px] pb-2">
        <div className="grid size-[46px] place-items-center rounded-[14px] bg-gradient-to-br from-[#c7d6db] to-[#e7f0f5] text-[0.95rem] font-extrabold tracking-[0.08em] text-[#121319]" aria-label="GuessMacha app icon">
          <span>GM</span>
        </div>

        <button type="button" className="grid size-10 place-items-center rounded-xl bg-white/4 text-[#edf5ff] transition hover:-translate-y-px hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200" aria-label="Open settings">
          <svg className="size-5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8]" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.5v2.1m0 14.8v2.1m8.5-8.5h-2.1M5.6 12H3.5m15.9-5.3L16.7 8.8M7.3 15.2 5.6 16.9m0-9.8 1.7 1.7m9.4 9.4 1.7 1.7M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">{children}</div>

      {footer && <div className="px-[22px] pb-4 text-center max-[520px]:px-[18px]">{footer}</div>}

      <nav className="grid grid-cols-4 border-t border-white/8 bg-[rgba(18,16,22,0.96)]" aria-label="Main navigation">
        {navigationItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`flex min-h-[76px] cursor-pointer flex-col items-center justify-center gap-1.5 bg-transparent text-[0.8rem] font-semibold text-[#a9afbc] transition hover:text-[#f6f9ff] ${activeTab === item.key ? 'bg-white/3 text-[#f6f9ff]' : ''}`}
            onClick={() => onTabChange(item.key)}
            aria-pressed={activeTab === item.key}
          >
            <span className="inline-flex size-6 items-center justify-center text-[1.2rem]" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [activeTab, setActiveTab] = useState<NavKey>('home')
  const [game, setGame] = useState<CreateGameResponse | null>(null)

  useEffect(() => {
    async function initializeGame() {
      try {
        if (isFacebookInstantGames()) {
          await initializeFacebookInstant()
        }
      } catch (initializationError) {
        console.error('Game initialization failed:', initializationError)
      }
    }

    void initializeGame()
  }, [])

  async function handleProfileClick() {
    const container = document.getElementById('profile-overlay-container')

    if (!container) {
      return
    }

    await showFacebookPlayerProfileOverlay(container)
  }

  function handleGameCreated(createdGame: CreateGameResponse) {
    setGame(createdGame)
    setScreen('match-lobby')
  }

  function renderScreen() {
    if (screen === 'create-game') {
      return (
        <CreateGameScreen
          onBack={() => setScreen('home')}
          onGameCreated={handleGameCreated}
        />
      )
    }

    if (screen === 'match-lobby' && game) {
      return (
        <MatchLobbyScreen
          roomCode={game.roomCode}
          onStartGame={() => console.info('Start game selected:', game.gameId)}
        />
      )
    }

    return <HomeScreen onCreateGame={() => setScreen('create-game')} />
  }

  return (
    <main className="min-h-screen w-full bg-[#121016]">
      <AppShell
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab === 'home') {
            setScreen('home')
          }
        }}
        footer={isFacebookInstantGames() ? (
          <>
            <button
              type="button"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#121319] transition hover:bg-cyan-50"
              onClick={handleProfileClick}
            >
              Test Facebook Profile
            </button>
            <div id="profile-overlay-container" className="relative mx-auto mt-3 h-[60px] w-[200px]" />
          </>
        ) : (
          <p className="text-[13px] leading-5 text-[#c6ccdc]">
            Facebook Instant Games features are available when launched inside Facebook.
          </p>
        )}
      >
        {renderScreen()}
      </AppShell>
    </main>
  )
}

export default App
