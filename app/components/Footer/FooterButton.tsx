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
                isActive ? "text-purple-600" : "text-slate-400 hover:text-slate-600",
                className
            )}
            {...props}
        >
            <div className={cn(
                "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                isActive ? "bg-purple-100" : "bg-transparent hover:bg-slate-100"
            )}>
                {icon}
            </div>
            {label && <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>}
        </button>
    );
};
