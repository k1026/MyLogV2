import React from 'react';
import { cn } from '../../lib/utils';

interface MaterialIconProps {
    icon: string;
    size?: number;
    className?: string;
    fill?: boolean;
    weight?: number; // 100-700
    grade?: number; // -25-200
    opticalSize?: number; // 20-48
    'data-testid'?: string;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
    icon,
    size = 24,
    className,
    fill = false,
    weight = 400,
    grade = 0,
    opticalSize = 24,
    'data-testid': testId
}) => {
    return (
        <span
            className={cn("material-symbols-rounded", className)}
            style={{
                fontSize: `${size}px`,
                fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`
            }}
            aria-hidden="true"
            data-testid={testId}
        >
            {icon}
        </span>
    );
};
