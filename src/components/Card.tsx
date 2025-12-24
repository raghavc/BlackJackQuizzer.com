import React, { useState, useEffect, useRef } from 'react';
import type { Card as CardType, Rank, Suit } from '../strategy/types';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  className?: string;
  style?: React.CSSProperties;
  dealDelay?: number; // Delay before card slides in (ms)
}

// Build the SVG filename for a card
function getCardFilename(rank: Rank, suit: Suit): string {
  const rankMap: Record<Rank, string> = {
    'A': 'ace',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'J': 'jack',
    'Q': 'queen',
    'K': 'king',
  };
  return `${rankMap[rank]}_of_${suit}.svg`;
}

// Card back component - uses card_back.svg
const CardBack: React.FC = () => (
  <div className="w-[88px] h-[124px]">
    <img
      src={`${import.meta.env.BASE_URL}cards/card_back.svg`}
      alt="Card back"
      className="w-full h-full"
    />
  </div>
);

// Card face component - uses SVG card images
const CardFace: React.FC<{ card: CardType }> = ({ card }) => {
  const filename = getCardFilename(card.rank, card.suit);

  return (
    <div className="w-[88px] h-[124px]">
      <img
        src={`${import.meta.env.BASE_URL}cards/${filename}`}
        alt={`${card.rank} of ${card.suit}`}
        className="w-full h-full"
      />
    </div>
  );
};

export const Card: React.FC<CardProps> = ({
  card,
  faceDown = false,
  className = '',
  style,
  dealDelay = 0
}) => {
  const [isDealt, setIsDealt] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Only animate on initial mount
    if (!mountedRef.current) {
      mountedRef.current = true;
      const timer = setTimeout(() => {
        setIsDealt(true);
      }, dealDelay);
      return () => clearTimeout(timer);
    }
  }, [dealDelay]);

  return (
    <div
      className={`playing-card ${className}`}
      style={{
        ...style,
        transform: isDealt ? 'translateX(0)' : 'translateX(80px)',
        opacity: isDealt ? 1 : 0,
        transition: 'transform 0.3s ease-out, opacity 0.2s ease-out',
      }}
    >
      {faceDown || !card ? <CardBack /> : <CardFace card={card} />}
    </div>
  );
};

export default Card;
