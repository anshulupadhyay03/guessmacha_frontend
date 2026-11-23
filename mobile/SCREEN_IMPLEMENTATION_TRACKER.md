# GuessMate mobile screen implementation tracker

`gm_web` was inspected as read-only. The navigation journey is Home → Create Room →
Match Lobby → Game Zone → Match Review, with Matches, History, and Profile available
from the persistent bottom navigation. The secret picker and secret confirmation are
dialog states used by the lobby and game zone rather than standalone routes.

| ID | Screen Name | Web Source File | Components | API Dependencies | Status |
|---|---|---|---|---|---|
| 01 | Home | `gm_web/src/screens/HomeScreen.tsx` | Dashboard, active matches, stats, create/join, categories, tutorial | `dashboard`, `join_game` | Tested |
| 02 | Create Room | `gm_web/src/screens/CreateGameScreen.tsx` | Back action, question-limit chips, category radio cards, loading/error/empty states | `categories`, `create_game` | Implemented |
| 03 | Match Lobby | `gm_web/src/screens/MatchLobbyScreen.tsx` | Category/progress cards, room code, player cards, secret chooser, confirmation dialog | `get_game`, `get_puzzles`, `submit_secret` | Implemented |
| 04 | Game Zone | `gm_web/src/screens/GameZoneScreen.tsx` | Game header, player status, question timeline, answer controls, guess and leave dialogs | `game_state`, `get_puzzles`, `ask_question`, `answer_question`, `guess_secret`, `leave_game` | Implemented |
| 05 | Matches | `gm_web/src/screens/MatchesScreen.tsx` | Active/expired tabs, match cards, loading/error/empty states, create action | `get_matches` | Implemented |
| 06 | History | `gm_web/src/screens/HistoryScreen.tsx` | Result filters, history cards, loading/error/empty states, pagination | `history` | Implemented |
| 07 | Match Review | `gm_web/src/screens/MatchReviewScreen.tsx` | Outcome panel, match stats, player secrets, question timeline, fair-play notice | `match_review` | Implemented |
| 08 | Profile | `gm_web/src/screens/ProfileScreen.tsx` | Identity, rank progress, game stats, record, category performance, sign-out | `get_profile`, Supabase session | Tested |
| 09 | Secret picker dialog | `gm_web/src/components/ChooseSecretModal.tsx` | Search, selection rows, less-likely grouping, confirm action | `get_puzzles` | Implemented |
| 10 | Secret confirmation dialog | `gm_web/src/components/ConfirmSecretDialog.tsx` | Lock badge, selected-secret panel, cancel/confirm/error states | `submit_secret` | Implemented |
| 11 | How to Play tutorial | `gm_web/src/components/howToPlay/HowToPlayModal.tsx` | Eight-step tutorial, previous/next, skip | None | Tested |
| 12 | First-time tutorial prompt | `gm_web/src/components/howToPlay/FirstTimeTutorialPrompt.tsx` | Welcome prompt and tutorial launch | AsyncStorage | Tested |
| 13 | Game Rules dialog | `gm_web/src/components/GameRulesModal.tsx` | Rules reference, strategic tips, close action | None | Pending |

## Validation status

The source-to-native implementation has been checked with TypeScript and ESLint. Native
simulator visual comparison and end-to-end authentication require configured Supabase
environment values plus a mobile-compatible replacement for Facebook Instant identity;
those checks remain environment-dependent.
