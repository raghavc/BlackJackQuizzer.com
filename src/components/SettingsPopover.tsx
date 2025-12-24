import React, { useState, useRef, useEffect } from 'react';
import type { Settings } from '../strategy/types';

interface SettingsPopoverProps {
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
    onResetStats: () => void;
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({
    settings,
    onSettingsChange,
    onResetStats,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const updateRules = (key: keyof Settings['rules'], value: boolean | number) => {
        onSettingsChange({
            ...settings,
            rules: { ...settings.rules, [key]: value },
        });
    };

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
          p-2 rounded-lg btn-glass
          text-[var(--text-muted)] hover:text-[var(--text-secondary)]
        "
                aria-label="Settings"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {isOpen && (
                <div className="
          absolute right-0 top-full mt-2
          w-64 p-4 rounded-2xl
          bg-[#1a1a1a] border border-white/10
          shadow-2xl
          animate-fade-in
          z-50
        ">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-4">
                        Rules
                    </div>

                    <div className="space-y-3">
                        <Toggle
                            label="Dealer hits soft 17"
                            checked={settings.rules.dealerHitsSoft17}
                            onChange={(checked) => updateRules('dealerHitsSoft17', checked)}
                        />

                        <Toggle
                            label="Double after split"
                            checked={settings.rules.doubleAfterSplit}
                            onChange={(checked) => updateRules('doubleAfterSplit', checked)}
                        />

                        <Toggle
                            label="Late surrender"
                            checked={settings.rules.lateSurrender}
                            onChange={(checked) => updateRules('lateSurrender', checked)}
                        />

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--text-secondary)]">Decks</span>
                            <select
                                value={settings.rules.numberOfDecks}
                                onChange={(e) => updateRules('numberOfDecks', parseInt(e.target.value))}
                                className="
                  px-2 py-1 rounded-lg
                  bg-black/30 border border-white/10
                  text-[var(--text-secondary)] text-sm
                  focus:outline-none
                "
                            >
                                {[1, 2, 4, 6, 8].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-4" />

                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3">
                        Options
                    </div>

                    <Toggle
                        label="Auto-advance"
                        checked={settings.autoNext}
                        onChange={(checked) => onSettingsChange({ ...settings, autoNext: checked })}
                    />

                    <div className="h-px bg-white/5 my-4" />

                    <button
                        onClick={() => {
                            onResetStats();
                            setIsOpen(false);
                        }}
                        className="
              text-sm text-[var(--text-muted)] hover:text-[var(--error)]
              transition-colors duration-150
            "
                    >
                        Reset statistics
                    </button>
                </div>
            )}
        </div>
    );
};

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            {label}
        </span>
        <div
            className={`
        relative w-9 h-5 rounded-full transition-all duration-200
        ${checked
                    ? 'bg-white/20 border-white/30'
                    : 'bg-white/5 border-white/10'
                }
        border
      `}
            onClick={() => onChange(!checked)}
        >
            <div
                className={`
          absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200
          ${checked
                        ? 'left-4 bg-white'
                        : 'left-0.5 bg-white/40'
                    }
        `}
            />
        </div>
    </label>
);

export default SettingsPopover;
