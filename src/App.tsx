import { useState, useEffect, useCallback } from 'react';
import type {
  Action,
  Card,
  GamePhase,
  GameResult,
  DecisionEntry,
  GameStats,
  Settings,
} from './strategy/types';
import {
  DEFAULT_STATS,
  DEFAULT_SETTINGS,
} from './strategy/types';
import { getBestMove, getExplanation, getAvailableActions, getHandValue } from './strategy/basicStrategy';
import { getRandomCard } from './utils/deck';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';


import Controls from './components/Controls';
import StatsBar from './components/StatsBar';
import SettingsPopover from './components/SettingsPopover';
import CardComponent from './components/Card';
import DecisionLog from './components/DecisionLog';
import RulesDisplay from './components/RulesDisplay';

import './index.css';

function App() {
  const [stats, setStats] = useLocalStorage<GameStats>('bj-quiz-stats', DEFAULT_STATS);
  const [settings, setSettings] = useLocalStorage<Settings>('bj-quiz-settings', DEFAULT_SETTINGS);

  // Game state
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [splitHand, setSplitHand] = useState<Card[] | null>(null);
  const [activeHand, setActiveHand] = useState<'main' | 'split'>('main');
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [holeCardRevealed, setHoleCardRevealed] = useState(false);
  const [phase, setPhase] = useState<GamePhase>('player-turn');
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [result, setResult] = useState<GameResult | null>(null);

  // Initialize a new game
  const startNewGame = useCallback(() => {
    const newPlayerHand = [getRandomCard(), getRandomCard()];
    const newDealerHand = [getRandomCard(), getRandomCard()];

    setPlayerHand(newPlayerHand);
    setSplitHand(null);
    setActiveHand('main');
    setDealerHand(newDealerHand);
    setHoleCardRevealed(false);
    setPhase('player-turn');
    setDecisions([]);
    setResult(null);
  }, []);

  // Check for blackjack on initial deal
  const isBlackjack = (hand: Card[]): boolean => {
    if (hand.length !== 2) return false;
    const value = getHandValue({ cards: hand });
    return value.total === 21;
  };

  // Start game on mount
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Check for player blackjack after deal
  useEffect(() => {
    if (playerHand.length === 2 && phase === 'player-turn' && !result) {
      if (isBlackjack(playerHand)) {
        // Player has blackjack - auto finish
        setResult('player-blackjack');
        setHoleCardRevealed(true);
        setPhase('finished');
        setStats({ ...stats, handsPlayed: stats.handsPlayed + 1 });
      }
    }
  }, [playerHand, phase, result, stats, setStats]);

  // Get dealer upcard (second card is the visible one in our setup)
  const dealerUpcard = dealerHand[1] || dealerHand[0];

  // Calculate hand values
  const playerValue = getHandValue({ cards: playerHand });
  const dealerValue = getHandValue({ cards: dealerHand });

  // Record a decision
  const recordDecision = useCallback((action: Action, hand: Card[], upcard: Card) => {
    // Get available actions for this hand state
    const available = getAvailableActions({ cards: hand }, settings.rules);

    // Get the theoretically optimal move
    let optimalMove = getBestMove({ cards: hand }, upcard, settings.rules);

    // If optimal move isn't available (e.g. Double on 3+ cards), find best available
    // For simplicity: if Double not available, Hit is the fallback
    if (!available.includes(optimalMove)) {
      if (optimalMove === 'DOUBLE') {
        optimalMove = 'HIT';
      } else if (optimalMove === 'SPLIT') {
        optimalMove = 'HIT';
      } else if (optimalMove === 'SURRENDER') {
        optimalMove = 'HIT';
      }
    }

    const wasCorrect = action === optimalMove;
    const explanation = getExplanation({ cards: hand }, upcard, optimalMove);
    const value = getHandValue({ cards: hand });

    const entry: DecisionEntry = {
      action,
      wasCorrect,
      correctAction: optimalMove,
      explanation,
      playerTotal: value.total,
      dealerUpcard: upcard.rank,
    };

    setDecisions(prev => [...prev, entry]);

    // Update stats
    const newStats = { ...stats };
    if (wasCorrect) {
      newStats.correct++;
      newStats.currentStreak++;
      newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
    } else {
      newStats.wrong++;
      newStats.currentStreak = 0;
    }
    setStats(newStats);
  }, [settings.rules, stats, setStats]);

  // Determine winner
  const determineResult = useCallback((pValue: number, dValue: number, pBust: boolean, dBust: boolean): GameResult => {
    if (pBust) return 'player-bust';
    if (dBust) return 'dealer-bust';
    if (pValue > dValue) return 'player-win';
    if (dValue > pValue) return 'dealer-win';
    return 'push';
  }, []);

  // Dealer plays out their hand
  const dealerPlay = useCallback(async (currentPlayerHand: Card[]) => {
    setHoleCardRevealed(true);
    setPhase('dealer-turn');

    let currentHand = [...dealerHand];

    // Small delay to show hole card flip
    await new Promise(resolve => setTimeout(resolve, 500));

    // Dealer hits until they should stand
    const shouldDealerHit = (hand: Card[]): boolean => {
      const { total, isSoft } = getHandValue({ cards: hand });
      if (total < 17) return true;
      if (total === 17 && isSoft && settings.rules.dealerHitsSoft17) return true;
      return false;
    };

    while (shouldDealerHit(currentHand)) {
      const newCard = getRandomCard();
      currentHand = [...currentHand, newCard];
      setDealerHand([...currentHand]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Determine result using passed-in player hand
    const finalDealerValue = getHandValue({ cards: currentHand });
    const finalPlayerValue = getHandValue({ cards: currentPlayerHand });
    const dealerBust = finalDealerValue.total > 21;
    const playerBust = finalPlayerValue.total > 21;

    const gameResult = determineResult(
      finalPlayerValue.total,
      finalDealerValue.total,
      playerBust,
      dealerBust
    );

    setResult(gameResult);
    setPhase('finished');

    // Update hands played
    setStats({ ...stats, handsPlayed: stats.handsPlayed + 1 });
  }, [dealerHand, settings.rules.dealerHitsSoft17, determineResult, setStats, stats]);

  // Handle player actions
  const handleAction = useCallback((action: Action) => {
    if (phase !== 'player-turn' || !dealerUpcard) return;

    // Record the decision
    recordDecision(action, playerHand, dealerUpcard);

    if (action === 'HIT') {
      const newCard = getRandomCard();
      const newHand = [...playerHand, newCard];
      setPlayerHand(newHand);

      const newValue = getHandValue({ cards: newHand });
      if (newValue.total > 21) {
        // Bust
        setResult('player-bust');
        setHoleCardRevealed(true);
        setPhase('finished');
        setStats({ ...stats, handsPlayed: stats.handsPlayed + 1 });
      } else if (newValue.total === 21) {
        // Auto-stand on 21
        dealerPlay(newHand);
      }
    } else if (action === 'STAND') {
      dealerPlay(playerHand);
    } else if (action === 'DOUBLE') {
      const newCard = getRandomCard();
      const newHand = [...playerHand, newCard];
      setPlayerHand(newHand);

      const newValue = getHandValue({ cards: newHand });
      if (newValue.total > 21) {
        setResult('player-bust');
        setHoleCardRevealed(true);
        setPhase('finished');
        setStats({ ...stats, handsPlayed: stats.handsPlayed + 1 });
      } else {
        dealerPlay(newHand);
      }
    } else if (action === 'SURRENDER') {
      setResult('dealer-win');
      setHoleCardRevealed(true);
      setPhase('finished');
      setStats({ ...stats, handsPlayed: stats.handsPlayed + 1 });
    } else if (action === 'SPLIT') {
      // Split the pair into two hands
      const card1 = playerHand[0];
      const card2 = playerHand[1];
      // Main hand gets first card + new card
      setPlayerHand([card1, getRandomCard()]);
      // Split hand gets second card + new card
      setSplitHand([card2, getRandomCard()]);
      setActiveHand('main');
    }
  }, [phase, dealerUpcard, playerHand, recordDecision, dealerPlay, setStats]);

  const handleResetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
  }, [setStats]);

  // Get available actions
  const availableActions = playerHand.length > 0
    ? getAvailableActions({ cards: playerHand }, settings.rules)
    : [];

  const disabledActions: Action[] = (['HIT', 'STAND', 'DOUBLE', 'SPLIT', 'SURRENDER'] as Action[]).filter(
    (action) => !availableActions.includes(action)
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAction: handleAction,
    onNext: startNewGame,
    enabled: phase === 'player-turn',
    showingFeedback: phase === 'finished',
    availableActions,
  });

  // Get result display text
  const getResultText = (res: GameResult): { text: string; className: string } => {
    switch (res) {
      case 'player-blackjack': return { text: 'Blackjack!', className: 'win' };
      case 'player-win': return { text: 'You Win!', className: 'win' };
      case 'dealer-bust': return { text: 'Dealer Busts!', className: 'win' };
      case 'dealer-blackjack': return { text: 'Dealer Blackjack', className: 'lose' };
      case 'dealer-win': return { text: 'Dealer Wins', className: 'lose' };
      case 'player-bust': return { text: 'Bust!', className: 'lose' };
      case 'push': return { text: 'Push', className: 'push' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Rules Banner */}
      <RulesDisplay rules={settings.rules} />

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4">
        <div className="w-10" />
        <h1 className="text-[24px] font-semibold tracking-tight text-[var(--text-primary)]">
          Blackjack Trainer
        </h1>
        <SettingsPopover
          settings={settings}
          onSettingsChange={setSettings}
          onResetStats={handleResetStats}
        />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="flex flex-col items-center gap-6 w-full max-w-xl">
          {/* Stats */}
          <StatsBar stats={stats} />

          {/* Game area */}
          <div className="liquid-glass rounded-[20px] p-10 pb-20 w-full flex flex-col items-center gap-10">
            {/* Dealer */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.15em] font-medium">
                  Dealer
                </span>
                {holeCardRevealed && (
                  <span className="text-[14px] text-[var(--text-secondary)] font-medium">
                    {dealerValue.total}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                {/* Hole card (first card) */}
                <div className="animate-card-deal" style={{ zIndex: 0 }}>
                  <CardComponent
                    card={holeCardRevealed ? dealerHand[0] : undefined}
                    faceDown={!holeCardRevealed}
                  />
                </div>
                {/* Remaining dealer cards */}
                {dealerHand.slice(1).map((card, i) => (
                  <div
                    key={i}
                    className="animate-card-deal"
                    style={{ marginLeft: '-24px', zIndex: i + 1, animationDelay: `${(i + 1) * 100}ms` }}
                  >
                    <CardComponent card={card} />
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* Player Hands */}
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.15em] font-medium">
                  Your Hand
                </span>
                <span className="text-[14px] text-[var(--text-secondary)] font-medium">
                  {playerValue.isSoft && playerValue.total <= 21
                    ? `${playerValue.total - 10}/${playerValue.total}`
                    : playerValue.total}
                </span>
              </div>

              {/* Hands container */}
              <div className="flex items-start gap-8">
                {/* Main hand */}
                <div className="flex flex-col items-center">
                  <div className={`flex items-center ${splitHand && activeHand === 'main' ? 'ring-2 ring-white/30 rounded-lg p-1' : ''}`}>
                    {playerHand.map((card, i) => (
                      <div
                        key={i}
                        className="animate-card-deal"
                        style={{ marginLeft: i > 0 ? '-24px' : '0', zIndex: i, animationDelay: `${i * 80}ms` }}
                      >
                        <CardComponent card={card} />
                      </div>
                    ))}
                  </div>
                  {/* Active hand arrow */}
                  {splitHand && activeHand === 'main' && phase === 'player-turn' && (
                    <div className="mt-2 animate-pulse">
                      <span className="text-white/70 text-lg">▲</span>
                    </div>
                  )}
                </div>

                {/* Split hand */}
                {splitHand && (
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center ${activeHand === 'split' ? 'ring-2 ring-white/30 rounded-lg p-1' : ''}`}>
                      {splitHand.map((card, i) => (
                        <div
                          key={i}
                          className="animate-card-deal"
                          style={{ marginLeft: i > 0 ? '-24px' : '0', zIndex: i, animationDelay: `${i * 80}ms` }}
                        >
                          <CardComponent card={card} />
                        </div>
                      ))}
                    </div>
                    {/* Active hand arrow */}
                    {activeHand === 'split' && phase === 'player-turn' && (
                      <div className="mt-2 animate-pulse">
                        <span className="text-white/70 text-lg">▲</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Result */}
            {result && (
              <div className={`game-result ${getResultText(result).className} animate-slide-up`}>
                {getResultText(result).text}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="min-h-[100px] flex items-start justify-center w-full pt-2">
            {phase === 'finished' ? (
              <button
                onClick={startNewGame}
                className="btn-primary px-12 py-4 rounded text-[var(--text-primary)] text-base font-medium flex items-center justify-center gap-4"
              >
                New Hand
                <span className="text-[11px] text-[var(--text-secondary)] px-2 py-1 rounded bg-black/20">
                  N
                </span>
              </button>
            ) : phase === 'player-turn' ? (
              <Controls
                onAction={handleAction}
                disabledActions={disabledActions}
                enabled={phase === 'player-turn'}
              />
            ) : (
              <div className="text-[var(--text-muted)] text-sm">
                Dealer is playing...
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Decision Log */}
      <DecisionLog decisions={decisions} isVisible={decisions.length > 0} />

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-[11px] text-[var(--text-muted)] tracking-wide">
          <span className="opacity-70">Press</span>{' '}
          <span className="text-[var(--text-secondary)]">H S D P R</span>{' '}
          <span className="opacity-70">or</span>{' '}
          <span className="text-[var(--text-secondary)]">N</span>{' '}
          <span className="opacity-70">for new hand</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
