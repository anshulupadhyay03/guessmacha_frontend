export interface TutorialPoint {
  title?: string;
  text: string;
}

export interface TutorialStep {
  step: number;
  title: string;
  subtitle: string;
  tagline: string;
  points: TutorialPoint[];
  proTip?: string;
  iconType?: string;
}

export const HOW_TO_PLAY_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: 'Create or Join a Room',
    subtitle: 'Start a room or join your friend’s match',
    tagline: 'Step 1: Get the Game Started',
    points: [
      {
        title: 'Create Room',
        text: 'Start a new match and invite a friend. You will become the host of the match!',
      },
      {
        title: 'Join Room',
        text: 'Enter an existing room using the 6-character room code shared by your friend.',
      },
    ],
    proTip: 'As host, you get to choose the category and decide the question limit!',
    iconType: 'room',
  },
  {
    step: 2,
    title: 'Choose Your Category',
    subtitle: 'Pick a category and question limit',
    tagline: 'Step 2: Pick the Topic',
    points: [
      {
        title: 'Select a Category',
        text: 'Choose from Animals, Movies, Global Brands, Countries, Sports, and many more!',
      },
      {
        title: 'Set Question Limit',
        text: 'Choose the number of questions each player can ask (e.g. 5, 7, 10, or 15 questions).',
      },
      {
        title: 'Confirm to Create',
        text: 'Tap Confirm to generate your room and open the Match Lobby.',
      },
    ],
    proTip: 'Pick a category you know well or one that creates fun strategic deduction!',
    iconType: 'category',
  },
  {
    step: 3,
    title: 'Invite Your Friend',
    subtitle: 'Wait in the Match Lobby for your opponent',
    tagline: 'Step 3: Meet in the Lobby',
    points: [
      {
        title: 'Share Room Code',
        text: 'Copy the unique room code or click on the share button to invite your friend.',
      },
      {
        title: 'Friend Enters Code',
        text: 'Your friend opens Sift Mates, enters your code, and joins.',
      },
      {
        title: 'Both Ready',
        text: 'Once both players are in the lobby, the secret selection unlocks!',
      },
    ],
    proTip: 'Room codes stay active for 24 hours, so you can play whenever you’re both ready.',
    iconType: 'lobby',
  },
  {
    step: 4,
    title: 'Choose Your Secret',
    subtitle: 'Pick your secret and keep it hidden!',
    tagline: 'Step 4: Lock In Your Secret',
    points: [
      {
        title: 'Pick Independently',
        text: 'Both players independently choose one item from the category as their secret.',
      },
      {
        title: 'Keep It Hidden',
        text: 'Your opponent must deduce what you selected. Do not reveal your secret choice!',
      },
      {
        title: 'Lock & Confirm',
        text: 'Both players must confirm their secrets before the match begins.',
      },
    ],
    proTip: 'Pick an unexpected choice to keep your opponent guessing longer!',
    iconType: 'secret',
  },
  {
    step: 5,
    title: 'Ask Questions Strategically',
    subtitle: 'Take turns asking YES or NO questions',
    tagline: 'Step 5: The Game Zone',
    points: [
      {
        title: 'Host Starts',
        text: 'The host gets the first turn to ask a strategic question.',
      },
      {
        title: 'YES / NO Rules',
        text: 'Questions must be answerable with a simple YES or NO. Opponents must answer honestly!',
      },
      {
        title: 'Take Turns',
        text: 'After answering, your opponent asks you a question. Turns alternate until someone guesses.',
      },
    ],
    proTip: 'Avoid random guesses! Ask broad questions that eliminate the most suspects (e.g. "Is it living?").',
    iconType: 'questions',
  },
  {
    step: 6,
    title: 'Narrow Down the Possibilities',
    subtitle: 'Filter and eliminate suspects with each clue',
    tagline: 'Step 6: Sift the Suspects',
    points: [
      {
        title: 'Inspect Suspects',
        text: 'Open the Guess Secret sheet at any time to review all remaining possibilities.',
      },
      {
        title: 'Mark Less Likely',
        text: 'Swipe right to eliminate items that contradict the answers you have gathered so far.',
      },
      {
        title: 'Guess Anytime',
        text: 'You do not have to wait for all questions to be used — make a guess whenever you are confident!',
      },
    ],
    proTip: 'Every answer matters. Eliminating the wrong item makes finding the secret harder!',
    iconType: 'deduction',
  },
  {
    step: 7,
    title: 'Make Your Guess!',
    subtitle: 'Identify the secret to win — but watch the penalty!',
    tagline: 'Step 7: The Moment of Truth',
    points: [
      {
        title: 'If Correct',
        text: 'Opponent gets one final rebuttal guess. If they miss, YOU WIN! If they also guess right, it is a DRAW.',
      },
      {
        title: 'If Incorrect',
        text: 'Penalty advantage: Your opponent gets to ask TWO questions back-to-back before normal turns resume!',
      },
      {
        title: 'Confirm Wisely',
        text: 'Be confident before confirming your guess to avoid giving away free turns.',
      },
    ],
    proTip: 'A false guess can turn the tables! Only guess when you have narrowed it down.',
    iconType: 'guess',
  },
  {
    step: 8,
    title: 'Watch Your Question Limit',
    subtitle: 'Manage turns before questions run out',
    tagline: 'Step 8: Final Showdown',
    points: [
      {
        title: 'Track Remaining Turns',
        text: 'Check remaining questions in the status header at the top of the Game Zone.',
      },
      {
        title: 'Zero Questions Left',
        text: 'When all questions are used, each player gets one final opportunity to guess.',
      },
      {
        title: 'Final Deciding Guess',
        text: 'No more questions can be asked. The final guesses decide the match outcome!',
      },
    ],
    proTip: 'Think Smart. Ask Wisely. Guess Right. Welcome to Sift Mates!',
    iconType: 'limit',
  },
];
