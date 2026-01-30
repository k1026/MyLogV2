import React from 'react';
import { cn } from '../../lib/utils';

interface FooterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    label?: string;
    isActive?: boolean;
}

export const FooterButton: React.FC<FooterButtonProps> = ({
    icon,
    label,
    isActive,
    className,
    ...props
}) => {
    return (
        <button
            className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all active:scale-95",
                isActive ? "text-[#9333ea]" : "text-[#94a3b8] hover:text-[#475569]",
                className
            )}
            {...props}
        >
            <div className={cn(
                "w-10 h-10 flex items-center justify-center rounded-[12px] transition-all",
                isActive ? "bg-[#f3e8ff]" : "bg-transparent hover:bg-[#f1f5f9]"
            )}>
                {icon}
            </div>
            {label && (
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] leading-none">
                    {label}
                </span>
            )}
        </button>
    );
};
