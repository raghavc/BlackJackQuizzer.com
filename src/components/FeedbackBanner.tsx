import React from 'react';
import type { FeedbackResult } from '../strategy/types';
import { ACTION_LABELS } from '../strategy/types';

interface FeedbackBannerProps {
    result: FeedbackResult;
    onNext: () => void;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ result, onNext }) => {
    const isCorrect = result.isCorrect;

    return (
        <div className="animate-slide-up w-full max-w-sm">
            <div className="liquid-glass-subtle rounded-2xl px-6 py-5 flex flex-col items-center gap-4">
                {/* Result */}
                <span className={`text-base font-medium ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                </span>

                {/* Your choice (if wrong) */}
                {!isCorrect && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <span>You chose</span>
                        <span className="text-[var(--text-secondary)]">{ACTION_LABELS[result.playerChoice]}</span>
                    </div>
                )}

                {/* Correct move */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-[var(--text-muted)]">Optimal:</span>
                    <span className="text-[var(--text-primary)] font-medium">{ACTION_LABELS[result.correctMove]}</span>
                </div>

                {/* Explanation */}
                <p className="text-xs text-[var(--text-muted)] text-center leading-relaxed">
                    {result.explanation}
                </p>

                {/* Next button - prominent and easy to click */}
                <button
                    onClick={onNext}
                    className="
            mt-1 w-full py-3 rounded-xl
            btn-primary
            text-sm text-[var(--text-primary)] font-medium
            flex items-center justify-center gap-2
          "
                >
                    Next Hand
                    <span className="text-[10px] text-[var(--text-secondary)] px-1.5 py-0.5 rounded bg-black/20">
                        N
                    </span>
                </button>
            </div>
        </div>
    );
};

export default FeedbackBanner;
