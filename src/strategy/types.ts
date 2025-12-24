// Card types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
    rank: Rank;
    suit: Suit;
}

// Hand types
export type HandType = 'hard' | 'soft' | 'pair';

export interface Hand {
    cards: Card[];
}

// Actions
export type Action = 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT' | 'SURRENDER';

// Action display labels
export const ACTION_LABELS: Record<Action, string> = {
    HIT: 'Hit',
    STAND: 'Stand',
    DOUBLE: 'Double',
    SPLIT: 'Split',
    SURRENDER: 'Surrender',
};

// Keyboard shortcuts
export const ACTION_SHORTCUTS: Record<string, Action> = {
    h: 'HIT',
    s: 'STAND',
    d: 'DOUBLE',
    p: 'SPLIT',
    r: 'SURRENDER',
};

// Game rules configuration
export interface Rules {
    dealerHitsSoft17: boolean;     // H17 vs S17
    doubleAfterSplit: boolean;     // DAS
    lateSurrender: boolean;        // Surrender allowed
    numberOfDecks: number;         // 1, 2, 4, 6, 8
    dealerPeeksForBlackjack: boolean;
}

export const DEFAULT_RULES: Rules = {
    dealerHitsSoft17: false,       // S17 (dealer stands on soft 17)
    doubleAfterSplit: true,
    lateSurrender: true,
    numberOfDecks: 6,
    dealerPeeksForBlackjack: true,
};

// Game state
export interface GameStats {
    correct: number;
    wrong: number;
    currentStreak: number;
    bestStreak: number;
    handsPlayed: number;
}

export const DEFAULT_STATS: GameStats = {
    correct: 0,
    wrong: 0,
    currentStreak: 0,
    bestStreak: 0,
    handsPlayed: 0,
};

// Scenario for quiz
export interface Scenario {
    playerHand: Card[];
    dealerUpcard: Card;
}

// Feedback result
export interface FeedbackResult {
    isCorrect: boolean;
    playerChoice: Action;
    correctMove: Action;
    explanation: string;
}

// Settings
export interface Settings {
    rules: Rules;
    autoNext: boolean;
    autoNextDelay: number; // ms
}

export const DEFAULT_SETTINGS: Settings = {
    rules: DEFAULT_RULES,
    autoNext: false,
    autoNextDelay: 800,
};

// Game phase for practice mode
export type GamePhase = 'player-turn' | 'dealer-turn' | 'finished';

export type GameResult =
    | 'player-blackjack'
    | 'dealer-blackjack'
    | 'player-bust'
    | 'dealer-bust'
    | 'player-win'
    | 'dealer-win'
    | 'push';

// Decision entry for strategy coach
export interface DecisionEntry {
    action: Action;
    wasCorrect: boolean;
    correctAction: Action;
    explanation: string;
    playerTotal: number;
    dealerUpcard: Rank;
}
