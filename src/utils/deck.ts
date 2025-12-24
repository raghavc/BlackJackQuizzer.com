import type { Card, Rank, Suit, Scenario } from '../strategy/types';

const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

/**
 * Create a card with given rank and suit
 */
export function createCard(rank: Rank, suit: Suit): Card {
    return { rank, suit };
}

/**
 * Get a random element from an array
 */
function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get a random card from an infinite shoe
 */
export function getRandomCard(): Card {
    return createCard(randomElement(RANKS), randomElement(SUITS));
}

/**
 * Get a random card with a specific value (for generating hands)
 */
function getRandomCardWithValue(value: number): Card {
    let ranks: Rank[];
    if (value === 1 || value === 11) {
        ranks = ['A'];
    } else if (value === 10) {
        ranks = ['10', 'J', 'Q', 'K'];
    } else {
        ranks = [value.toString() as Rank];
    }
    return createCard(randomElement(ranks), randomElement(SUITS));
}

/**
 * Generate a random hard hand (no aces counting as 11)
 * Returns a 2-card hand with the specified total
 */
function generateHardHand(targetTotal: number): Card[] {
    // For hard hands, we need to avoid aces or make sure they count as 1
    // Valid hard totals: 5-20

    // Pick first card value (2-10, avoiding situations that force soft hand)
    const maxFirstCard = Math.min(10, targetTotal - 2);
    const minFirstCard = Math.max(2, targetTotal - 10);

    if (minFirstCard > maxFirstCard) {
        // Fallback - generate any valid 2-card hand
        const card1Value = Math.floor(Math.random() * 9) + 2;
        const card2Value = targetTotal - card1Value;
        return [
            getRandomCardWithValue(card1Value),
            getRandomCardWithValue(Math.max(2, Math.min(10, card2Value))),
        ];
    }

    const firstCardValue = Math.floor(Math.random() * (maxFirstCard - minFirstCard + 1)) + minFirstCard;
    const secondCardValue = targetTotal - firstCardValue;

    return [
        getRandomCardWithValue(firstCardValue),
        getRandomCardWithValue(secondCardValue),
    ];
}

/**
 * Generate a random soft hand (Ace + X)
 * Returns a 2-card hand with an Ace
 */
function generateSoftHand(): Card[] {
    // Soft hands: A+2 (13) through A+9 (20)
    // A+10 would be blackjack, skip that
    const otherCardValue = Math.floor(Math.random() * 8) + 2; // 2-9
    const ace = createCard('A', randomElement(SUITS));
    const otherCard = getRandomCardWithValue(otherCardValue);

    // Randomly order
    return Math.random() < 0.5 ? [ace, otherCard] : [otherCard, ace];
}

/**
 * Generate a pair hand
 */
function generatePairHand(): Card[] {
    // All possible pairs: 2-2 through A-A
    const pairRank = randomElement(RANKS);
    const suit1 = randomElement(SUITS);
    let suit2 = randomElement(SUITS);

    // Ensure different suits for variety
    while (suit2 === suit1) {
        suit2 = randomElement(SUITS);
    }

    return [
        createCard(pairRank, suit1),
        createCard(pairRank, suit2),
    ];
}

/**
 * Generate a random scenario for the quiz
 * 
 * @param pairChance - Probability of generating a pair (0-1)
 */
export function generateScenario(pairChance: number = 0.25): Scenario {
    const roll = Math.random();

    let playerHand: Card[];

    if (roll < pairChance) {
        // Generate pair
        playerHand = generatePairHand();
    } else if (roll < pairChance + 0.25) {
        // Generate soft hand (25% chance after pairs)
        playerHand = generateSoftHand();
    } else {
        // Generate hard hand
        // Weight towards more interesting totals (9-17)
        const weights = {
            5: 1, 6: 1, 7: 1, 8: 2,
            9: 3, 10: 4, 11: 4, 12: 4,
            13: 3, 14: 3, 15: 4, 16: 4,
            17: 3, 18: 2, 19: 1, 20: 1,
        };

        const totals = Object.keys(weights).map(Number);
        const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
        let weightedRoll = Math.random() * weightSum;

        let targetTotal = 12; // default
        for (const total of totals) {
            weightedRoll -= weights[total as keyof typeof weights];
            if (weightedRoll <= 0) {
                targetTotal = total;
                break;
            }
        }

        playerHand = generateHardHand(targetTotal);
    }

    // Generate dealer upcard (any card A-10)
    const dealerUpcard = getRandomCard();

    return { playerHand, dealerUpcard };
}

/**
 * Format card rank for display
 */
export function formatRank(rank: Rank): string {
    return rank;
}

/**
 * Get suit symbol
 */
export function getSuitSymbol(suit: Suit): string {
    switch (suit) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
    }
}

/**
 * Check if suit is red
 */
export function isRedSuit(suit: Suit): boolean {
    return suit === 'hearts' || suit === 'diamonds';
}
