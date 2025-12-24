import React from 'react';
import type { Rules } from '../strategy/types';

interface RulesDisplayProps {
    rules: Rules;
}

export const RulesDisplay: React.FC<RulesDisplayProps> = ({ rules }) => {
    const ruleText = rules.dealerHitsSoft17
        ? 'DEALER MUST HIT SOFT 17'
        : 'DEALER MUST STAND ON ALL 17';

    return (
        <div className="rules-banner w-full py-3 px-6 text-center">
            <span className="text-sm font-medium tracking-wide">
                {ruleText}
            </span>
        </div>
    );
};

export default RulesDisplay;
