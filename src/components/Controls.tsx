import React from 'react';
import type { Action } from '../strategy/types';
import { ACTION_LABELS } from '../strategy/types';

interface ControlsProps {
    onAction: (action: Action) => void;
    disabledActions: Action[];
    enabled: boolean;
}

const actionConfig: { action: Action; shortcut: string }[] = [
    { action: 'HIT', shortcut: 'H' },
    { action: 'STAND', shortcut: 'S' },
    { action: 'DOUBLE', shortcut: 'D' },
    { action: 'SPLIT', shortcut: 'P' },
    { action: 'SURRENDER', shortcut: 'R' },
];

export const Controls: React.FC<ControlsProps> = ({
    onAction,
    disabledActions,
    enabled,
}) => {
    return (
        <div className="flex flex-wrap justify-center gap-3">
            {actionConfig.map(({ action, shortcut }) => {
                const isDisabled = !enabled || disabledActions.includes(action);

                return (
                    <button
                        key={action}
                        onClick={() => onAction(action)}
                        disabled={isDisabled}
                        className={`
              min-w-[100px] px-6 py-4 
              text-[15px] font-medium tracking-tight
              flex items-center justify-center gap-3
              ${isDisabled
                                ? 'opacity-25 cursor-not-allowed bg-white/5 border border-white/5 rounded-lg text-[var(--text-muted)]'
                                : 'btn-apple text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }
            `}
                    >
                        <span>{ACTION_LABELS[action]}</span>
                        <span className="text-[11px] text-[var(--text-muted)] font-normal">
                            {shortcut}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default Controls;
