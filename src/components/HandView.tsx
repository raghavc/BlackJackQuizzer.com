import React from 'react';
import type { Card as CardType } from '../strategy/types';
import { getHandValue } from '../strategy/basicStrategy';
import Card from './Card';

interface HandViewProps {
    cards: CardType[];
    label?: string;
    showTotal?: boolean;
    className?: string;
}

export const HandView: React.FC<HandViewProps> = ({
    cards,
    label,
    showTotal = true,
    className = '',
}) => {
    const { total, isSoft } = getHandValue({ cards });

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            {label && (
                <span className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.15em] font-medium">
                    {label}
                </span>
            )}

            <div className="flex items-center">
                {cards.map((card, index) => (
                    <div
                        key={`${card.rank}-${card.suit}-${index}`}
                        className="animate-card-deal"
                        style={{
                            marginLeft: index > 0 ? '-24px' : '0',
                            zIndex: index,
                            animationDelay: `${index * 100}ms`,
                        }}
                    >
                        <Card card={card} />
                    </div>
                ))}
            </div>

            {showTotal && cards.length > 0 && (
                <span className="text-[15px] text-[var(--text-secondary)] font-medium tabular-nums">
                    {isSoft && total <= 21 ? `Soft ${total}` : total}
                </span>
            )}
        </div>
    );
};

export default HandView;
