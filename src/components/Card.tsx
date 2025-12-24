import React from 'react';
import type { Card as CardType, Rank, Suit } from '../strategy/types';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  className?: string;
  style?: React.CSSProperties;
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

export const Card: React.FC<CardProps> = ({ card, faceDown = false, className = '', style }) => {
  return (
    <div className={`playing-card ${className}`} style={style}>
      {faceDown || !card ? <CardBack /> : <CardFace card={card} />}
    </div>
  );
};

export default Card;

