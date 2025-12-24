import React from 'react';
import type { GameStats } from '../strategy/types';

interface StatsBarProps {
    stats: GameStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
    const accuracy = stats.handsPlayed > 0
        ? Math.round((stats.correct / stats.handsPlayed) * 100)
        : 0;

    return (
        <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Stat label="correct" value={stats.correct} />
            <Stat label="wrong" value={stats.wrong} />
            <Stat label="accuracy" value={`${accuracy}%`} />
            <Stat label="streak" value={stats.currentStreak} />
            <Stat label="best" value={stats.bestStreak} />
        </div>
    );
};

interface StatProps {
    label: string;
    value: string | number;
}

const Stat: React.FC<StatProps> = ({ label, value }) => (
    <div className="flex items-center gap-2">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="text-[var(--text-secondary)] font-medium">{value}</span>
    </div>
);

export default StatsBar;
