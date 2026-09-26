import { useEffect, useState, type ReactNode } from 'react'
import {
  initializeFacebookInstant,
  isFacebookInstantGames,
  showFacebookPlayerProfileOverlay,
} from './platform/facebook/fbInstant'
import CreateGameScreen from './screens/CreateGameScreen'
import GameZoneScreen from './screens/GameZoneScreen'
import HomeScreen from './screens/HomeScreen'
import MatchesScreen from './screens/MatchesScreen'
import MatchLobbyScreen from './screens/MatchLobbyScreen'
import HistoryScreen from './screens/HistoryScreen'
import MatchReviewScreen from './screens/MatchReviewScreen'
import type { CreateGameResponse, JoinGameData } from './features/dashboard/types'
import type { MatchItem } from './features/matches/types'
import type { HistoryMatchItem } from './features/history/types'

type Screen = 'home' | 'matches' | 'history' | 'match-review' | 'create-game' | 'match-lobby' | 'game-zone'
type NavKey = 'home' | 'matches' | 'history' | 'profile'

interface NavigationItem {
  key: NavKey
  label: string
  renderIcon: (active: boolean) => ReactNode
}

const navigationItems: NavigationItem[] = [
  {
    key: 'home',
    label: 'Home',
    renderIcon: () => (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'matches',
    label: 'Matches',
    renderIcon: () => (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="15" y1="13" x2="15.01" y2="13" />
        <line x1="18" y1="11" x2="18.01" y2="11" />
        <rect x="2" y="6" width="20" height="12" rx="6" />
      </svg>
    ),
  },
  {
    key: 'history',
    label: 'History',
    renderIcon: () => (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    renderIcon: () => (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

function AppShell({
  children,
  footer,
  activeTab,
  onTabChange,
  screen,
}: {
  children: ReactNode
  footer?: ReactNode
  activeTab: NavKey
  onTabChange: (tab: NavKey) => void
  screen?: Screen
}) {
  const isGameZone = screen === 'game-zone'

  return (
    <div className={`flex w-full flex-col overflow-hidden bg-[linear-gradient(180deg,#1d1b21,#121016)] ${isGameZone ? 'h-screen h-[100dvh] max-h-screen' : 'min-h-screen'}`}>
      {/* Top Header shown on Home tab */}
      {activeTab === 'home' && screen === 'home' && !isGameZone && (
        <header className="flex shrink-0 items-center justify-between px-5.5 pt-4.5 pb-2">
          <div className="grid size-11.5 place-items-center rounded-[14px] bg-linear-to-br from-[#c7d6db] to-[#e7f0f5] text-[0.95rem] font-extrabold tracking-[0.08em] text-[#121319]" aria-label="GuessMacha app icon">
            <span>GM</span>
          </div>

          <button type="button" className="grid size-10 place-items-center rounded-xl bg-white/4 text-[#edf5ff] transition hover:-translate-y-px hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200" aria-label="Open settings">
            <svg className="size-5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] stroke-[1.8]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3.5v2.1m0 14.8v2.1m8.5-8.5h-2.1M5.6 12H3.5m15.9-5.3L16.7 8.8M7.3 15.2 5.6 16.9m0-9.8 1.7 1.7m9.4 9.4 1.7 1.7M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
            </svg>
          </button>
        </header>
      )}

      <div className={`flex-1 ${isGameZone ? 'overflow-hidden flex flex-col min-h-0 h-full' : 'overflow-y-auto'}`}>{children}</div>

      {footer && !isGameZone && <div className="shrink-0 px-5.5 pb-4 text-center max-[520px]:px-4.5">{footer}</div>}

      {!isGameZone && (
        <nav className="grid shrink-0 grid-cols-4 border-t border-white/8 bg-[rgba(18,16,22,0.96)]" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                type="button"
                className={`flex min-h-18 cursor-pointer flex-col items-center justify-center gap-1 bg-transparent text-[0.75rem] font-semibold transition ${
                  isActive
                    ? 'text-[#63d6ea]'
                    : 'text-[#a9afbc] hover:text-[#f6f9ff]'
                }`}
                onClick={() => onTabChange(item.key)}
                aria-pressed={isActive}
              >
                <span className="inline-flex size-6 items-center justify-center" aria-hidden="true">
                  {item.renderIcon(isActive)}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}

interface ActiveGameContext {
  gameId: string
  roomCode: string
  categoryId?: string
  categoryName?: string
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [activeTab, setActiveTab] = useState<NavKey>('home')
  const [game, setGame] = useState<ActiveGameContext | null>(null)
  const [reviewMatch, setReviewMatch] = useState<HistoryMatchItem | null>(null)

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

  function handleSelectMatch(match: MatchItem) {
    if (match.matchStatus === 'expired') {
      return
    }

    setGame({
      gameId: match.gameId,
      roomCode: match.roomCode,
      categoryId: match.categoryId,
      categoryName: match.categoryName,
    })

    if (match.status === 'in_progress') {
      setScreen('game-zone')
    } else {
      setScreen('match-lobby')
    }
  }

  function renderScreen() {
    if (screen === 'create-game') {
      return (
        <CreateGameScreen
          onBack={() => {
            if (activeTab === 'matches') {
              setScreen('matches')
            } else {
              setScreen('home')
            }
          }}
          onGameCreated={handleGameCreated}
        />
      )
    }

    if (screen === 'match-lobby' && game) {
      return (
        <MatchLobbyScreen
          gameId={game.gameId}
          roomCode={game.roomCode}
          onStartGame={() => setScreen('game-zone')}
          onNavigateToGameZone={() => setScreen('game-zone')}
        />
      )
    }

    if (screen === 'game-zone' && game) {
      return (
        <GameZoneScreen
          gameId={game.gameId}
          roomCode={game.roomCode}
          categoryId={game.categoryId}
          categoryName={game.categoryName}
          onBackToLobby={() => setScreen('match-lobby')}
          onLeave={() => {
            setGame(null)
            setScreen(activeTab === 'matches' ? 'matches' : 'home')
          }}
        />
      )
    }

    if (screen === 'match-review' && reviewMatch) {
      return (
        <MatchReviewScreen
          match={reviewMatch}
          onBack={() => setScreen('history')}
        />
      )
    }

    if (activeTab === 'history' || screen === 'history') {
      return (
        <HistoryScreen
          onBack={() => {
            setActiveTab('home')
            setScreen('home')
          }}
          onSelectMatch={(selected) => {
            setReviewMatch(selected)
            setScreen('match-review')
          }}
        />
      )
    }

    if (activeTab === 'matches' || screen === 'matches') {
      return (
        <MatchesScreen
          onCreateGame={() => setScreen('create-game')}
          onSelectMatch={handleSelectMatch}
        />
      )
    }

    function handleGameJoined(joinedGame: JoinGameData) {
      setGame({
        gameId: joinedGame.gameId,
        roomCode: joinedGame.roomCode,
        categoryId: joinedGame.categoryId,
      })
      setScreen('match-lobby')
    }

    return (
      <HomeScreen
        onCreateGame={() => setScreen('create-game')}
        onGameJoined={handleGameJoined}
      />
    )
  }

  return (
    <main className={`w-full bg-[#121016] ${screen === 'game-zone' ? 'h-screen h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      <AppShell
        screen={screen}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab === 'matches') {
            setScreen('matches')
          } else if (tab === 'history') {
            setScreen('history')
          } else if (tab === 'home') {
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
            <div id="profile-overlay-container" className="relative mx-auto mt-3 h-15 w-50" />
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
