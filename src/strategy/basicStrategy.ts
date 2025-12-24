import type { Card, Rank, Action, Rules, Hand, HandType } from './types';

/**
 * Basic Strategy Tables
 * 
 * Key format:
 * - Hard totals: 5-20
 * - Soft totals: 13-21 (A+2 through A+10)
 * - Pairs: '2' through 'A' (the rank of the pair)
 * 
 * Dealer upcard: 2-10, A
 * 
 * Actions:
 * H = Hit, S = Stand, D = Double (Hit if not allowed), Ds = Double (Stand if not allowed)
 * P = Split, Ph = Split (Hit if DAS not allowed), Pd = Split (Double if allowed)
 * Rh = Surrender (Hit if not allowed), Rs = Surrender (Stand if not allowed), Rp = Surrender (Split if not allowed)
 */

type BasicAction = 'H' | 'S' | 'D' | 'Ds' | 'P' | 'Ph' | 'Pd' | 'Rh' | 'Rs' | 'Rp';

// Dealer upcard index: 2, 3, 4, 5, 6, 7, 8, 9, 10, A
const DEALER_INDEX: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

// Convert dealer card to index
function getDealerIndex(upcard: Rank): number {
    if (upcard === 'J' || upcard === 'Q' || upcard === 'K') return 8; // 10
    return DEALER_INDEX.indexOf(upcard);
}

/**
 * Hard Totals Strategy Table (S17 rules)
 * Rows: totals 5-20
 * Cols: dealer 2,3,4,5,6,7,8,9,10,A
 */
const HARD_TABLE_S17: Record<number, BasicAction[]> = {
    5: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    6: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    7: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    8: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    9: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
    10: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
    11: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
    12: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
    13: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
    14: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
    15: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'Rh', 'Rh'],
    16: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'Rh', 'Rh', 'Rh'],
    17: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'Rs'],
    18: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    19: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    20: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
};

/**
 * Hard Totals Strategy Table (H17 rules - dealer hits soft 17)
 * Key differences from S17:
 * - Hard 11 vs A: Double instead of Double
 * - Hard 17 vs A: Surrender
 * - Hard 15 vs A: Surrender
 */
const HARD_TABLE_H17: Record<number, BasicAction[]> = {
    5: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    6: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    7: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    8: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    9: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
    10: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
    11: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
    12: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
    13: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
    14: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
    15: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'Rh', 'Rh'],
    16: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'Rh', 'Rh', 'Rh'],
    17: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'Rs'],
    18: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    19: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    20: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
};

/**
 * Soft Totals Strategy Table (S17 rules)
 * Rows: soft totals 13-21 (A+2 through A+10)
 * Cols: dealer 2,3,4,5,6,7,8,9,10,A
 */
const SOFT_TABLE_S17: Record<number, BasicAction[]> = {
    13: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],  // A,2
    14: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],  // A,3
    15: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],  // A,4
    16: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],  // A,5
    17: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],  // A,6
    18: ['Ds', 'Ds', 'Ds', 'Ds', 'Ds', 'S', 'S', 'H', 'H', 'H'],  // A,7
    19: ['S', 'S', 'S', 'S', 'Ds', 'S', 'S', 'S', 'S', 'S'],  // A,8
    20: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],  // A,9
    21: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],  // A,10 (blackjack, but just in case)
};

/**
 * Soft Totals Strategy Table (H17 rules)
 * Key differences:
 * - Soft 18 vs A: Double (stand if not allowed) instead of Hit
 * - Soft 19 vs 6: Double (stand if not allowed)
 */
const SOFT_TABLE_H17: Record<number, BasicAction[]> = {
    13: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
    14: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
    15: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
    16: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
    17: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
    18: ['Ds', 'Ds', 'Ds', 'Ds', 'Ds', 'S', 'S', 'H', 'H', 'S'],  // vs A: Stand (H17 specific)
    19: ['S', 'S', 'S', 'S', 'Ds', 'S', 'S', 'S', 'S', 'S'],
    20: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    21: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
};

/**
 * Pairs Strategy Table (S17 rules with DAS)
 * Rows: pair rank (2-10, A)
 * Cols: dealer 2,3,4,5,6,7,8,9,10,A
 */
const PAIRS_TABLE_S17_DAS: Record<Rank, BasicAction[]> = {
    '2': ['Ph', 'Ph', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
    '3': ['Ph', 'Ph', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
    '4': ['H', 'H', 'H', 'Ph', 'Ph', 'H', 'H', 'H', 'H', 'H'],
    '5': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],  // Never split 5s
    '6': ['Ph', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
    '7': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
    '8': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'Rp'],
    '9': ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'],
    '10': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],  // Never split 10s
    'J': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    'Q': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    'K': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    'A': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],   // Always split Aces
};

/**
 * Pairs Strategy Table (S17 rules without DAS)
 */
const PAIRS_TABLE_S17_NODAS: Record<Rank, BasicAction[]> = {
    '2': ['H', 'H', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
    '3': ['H', 'H', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
    '4': ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    '5': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
    '6': ['H', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
    '7': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
    '8': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'Rp'],
    '9': ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'],
    '10': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    'J': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    'Q': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    'K': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    'A': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
};

/**
 * Pairs Strategy Table (H17 rules with DAS)
 * Main difference for H17: 8,8 vs A is still split (no surrender option preferred)
 */
const PAIRS_TABLE_H17_DAS: Record<Rank, BasicAction[]> = {
    ...PAIRS_TABLE_S17_DAS,
    '8': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'Rp'],
};

const PAIRS_TABLE_H17_NODAS: Record<Rank, BasicAction[]> = {
    ...PAIRS_TABLE_S17_NODAS,
    '8': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'Rp'],
};

/**
 * Get the numeric value of a card
 */
export function getCardValue(rank: Rank): number {
    if (rank === 'A') return 11;
    if (['K', 'Q', 'J', '10'].includes(rank)) return 10;
    return parseInt(rank);
}

/**
 * Get the hand type (hard, soft, or pair)
 */
export function getHandType(hand: Hand): HandType {
    const cards = hand.cards;

    // Check for pair (only on 2-card hands)
    if (cards.length === 2) {
        const v1 = getCardValue(cards[0].rank);
        const v2 = getCardValue(cards[1].rank);
        if (v1 === v2) return 'pair';
    }

    // Check for soft hand (contains an Ace counting as 11)
    const hasAce = cards.some(c => c.rank === 'A');
    if (hasAce) {
        const total = cards.reduce((sum, c) => sum + getCardValue(c.rank), 0);
        if (total <= 21) return 'soft';
    }

    return 'hard';
}

/**
 * Calculate hand value, returning [total, isSoft]
 */
export function getHandValue(hand: Hand): { total: number; isSoft: boolean } {
    const cards = hand.cards;
    let total = 0;
    let aces = 0;

    for (const card of cards) {
        if (card.rank === 'A') {
            aces++;
            total += 11;
        } else {
            total += getCardValue(card.rank);
        }
    }

    // Convert aces from 11 to 1 if busting
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return { total, isSoft: aces > 0 };
}

/**
 * Resolve a basic action code to a concrete action
 */
function resolveAction(action: BasicAction, rules: Rules): Action {
    switch (action) {
        case 'H': return 'HIT';
        case 'S': return 'STAND';
        case 'D': return 'DOUBLE'; // Fallback to HIT handled at call site
        case 'Ds': return 'DOUBLE'; // Fallback to STAND handled at call site
        case 'P': return 'SPLIT';
        case 'Ph': return rules.doubleAfterSplit ? 'SPLIT' : 'HIT';
        case 'Pd': return 'SPLIT';
        case 'Rh': return rules.lateSurrender ? 'SURRENDER' : 'HIT';
        case 'Rs': return rules.lateSurrender ? 'SURRENDER' : 'STAND';
        case 'Rp': return rules.lateSurrender ? 'SURRENDER' : 'SPLIT';
        default: return 'HIT';
    }
}

/**
 * Get the best move according to basic strategy
 */
export function getBestMove(hand: Hand, dealerUpcard: Card, rules: Rules): Action {
    const handType = getHandType(hand);
    const dealerIdx = getDealerIndex(dealerUpcard.rank);
    const { total, isSoft } = getHandValue(hand);

    let action: BasicAction;

    if (handType === 'pair' && hand.cards.length === 2) {
        // Use pair chart
        const pairRank = hand.cards[0].rank;
        const pairTable = rules.dealerHitsSoft17
            ? (rules.doubleAfterSplit ? PAIRS_TABLE_H17_DAS : PAIRS_TABLE_H17_NODAS)
            : (rules.doubleAfterSplit ? PAIRS_TABLE_S17_DAS : PAIRS_TABLE_S17_NODAS);
        action = pairTable[pairRank][dealerIdx];
    } else if (isSoft && total >= 13 && total <= 21) {
        // Use soft chart
        const softTable = rules.dealerHitsSoft17 ? SOFT_TABLE_H17 : SOFT_TABLE_S17;
        action = softTable[total]?.[dealerIdx] || 'H';
    } else {
        // Use hard chart
        const hardTable = rules.dealerHitsSoft17 ? HARD_TABLE_H17 : HARD_TABLE_S17;
        const lookupTotal = Math.min(20, Math.max(5, total));
        action = hardTable[lookupTotal][dealerIdx];
    }

    return resolveAction(action, rules);
}

/**
 * Get an explanation for the move
 */
export function getExplanation(hand: Hand, dealerUpcard: Card, move: Action): string {
    const handType = getHandType(hand);
    const { total } = getHandValue(hand);
    const dealerValue = dealerUpcard.rank === 'A' ? 'A' : getCardValue(dealerUpcard.rank).toString();

    const moveText = {
        HIT: 'Hit',
        STAND: 'Stand',
        DOUBLE: 'Double down',
        SPLIT: 'Split',
        SURRENDER: 'Surrender',
    }[move];

    if (handType === 'pair') {
        const pairRank = hand.cards[0].rank;
        const pairText = pairRank === 'A' ? 'Aces' : `${pairRank}s`;

        if (move === 'SPLIT') {
            if (pairRank === 'A') return `Always split Aces.`;
            if (pairRank === '8') return `Always split 8s.`;
            return `Pair of ${pairText} vs ${dealerValue} → ${moveText}.`;
        } else if (move === 'SURRENDER') {
            return `Pair of 8s vs A → Surrender if allowed, else split.`;
        } else {
            return `Pair of ${pairText} vs ${dealerValue} → Don't split, ${moveText.toLowerCase()}.`;
        }
    }

    const handTypeText = handType === 'soft' ? 'Soft' : 'Hard';

    if (move === 'SURRENDER') {
        return `${handTypeText} ${total} vs ${dealerValue} → Surrender if allowed, else hit.`;
    }

    if (move === 'DOUBLE') {
        return `${handTypeText} ${total} vs ${dealerValue} → Double down${handType === 'hard' && total === 11 ? ' always' : ''}.`;
    }

    return `${handTypeText} ${total} vs ${dealerValue} → ${moveText}.`;
}

/**
 * Get available actions for a hand
 */
export function getAvailableActions(hand: Hand, rules: Rules): Action[] {
    const actions: Action[] = ['HIT', 'STAND'];

    // Double only on initial 2-card hand
    if (hand.cards.length === 2) {
        actions.push('DOUBLE');
    }

    // Split only if pair
    if (getHandType(hand) === 'pair' && hand.cards.length === 2) {
        actions.push('SPLIT');
    }

    // Surrender only if enabled
    if (rules.lateSurrender && hand.cards.length === 2) {
        actions.push('SURRENDER');
    }

    return actions;
}
