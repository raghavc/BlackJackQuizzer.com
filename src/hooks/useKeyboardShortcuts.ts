import { useEffect, useCallback } from 'react';
import type { Action } from '../strategy/types';
import { ACTION_SHORTCUTS } from '../strategy/types';

interface UseKeyboardShortcutsProps {
    onAction: (action: Action) => void;
    onNext: () => void;
    enabled: boolean;
    showingFeedback: boolean;
    availableActions: Action[];
}

export function useKeyboardShortcuts({
    onAction,
    onNext,
    enabled,
    showingFeedback,
    availableActions,
}: UseKeyboardShortcutsProps) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Ignore if typing in an input
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement
            ) {
                return;
            }

            const key = event.key.toLowerCase();

            // Handle Next (N key) when showing feedback
            if (showingFeedback && key === 'n') {
                event.preventDefault();
                onNext();
                return;
            }

            // Handle action shortcuts when enabled and not showing feedback
            if (enabled && !showingFeedback) {
                const action = ACTION_SHORTCUTS[key];
                if (action && availableActions.includes(action)) {
                    event.preventDefault();
                    onAction(action);
                }
            }
        },
        [onAction, onNext, enabled, showingFeedback, availableActions]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
