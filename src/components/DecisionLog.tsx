import React from 'react';
import type { DecisionEntry } from '../strategy/types';
import { ACTION_LABELS } from '../strategy/types';

interface DecisionLogProps {
    decisions: DecisionEntry[];
    isVisible: boolean;
}

export const DecisionLog: React.FC<DecisionLogProps> = ({ decisions, isVisible }) => {
    if (!isVisible || decisions.length === 0) return null;

    const correctCount = decisions.filter(d => d.wasCorrect).length;

    return (
        <div className="decision-log animate-fade-in">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                        Coach
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                        {correctCount}/{decisions.length}
                    </span>
                </div>

                {/* All decisions list */}
                <div className="space-y-2 max-h-[240px] overflow-y-auto">
                    {decisions.map((decision, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-[10px] text-[var(--text-muted)] w-4">
                                {i + 1}.
                            </span>
                            <span className={`text-sm ${decision.wasCorrect ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                                {decision.wasCorrect ? '✓' : '✗'}
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">
                                {ACTION_LABELS[decision.action]}
                            </span>
                            {!decision.wasCorrect && (
                                <>
                                    <span className="text-[var(--text-muted)] text-xs">→</span>
                                    <span className="text-xs text-[var(--text-primary)]">
                                        {ACTION_LABELS[decision.correctAction]}
                                    </span>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DecisionLog;
