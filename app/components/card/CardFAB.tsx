import { Plus } from 'lucide-react';
import { CellAttribute } from '@/app/lib/models/cell';
import { useState, useRef, useEffect } from 'react';

interface CardFABProps {
    onAdd: (attribute: CellAttribute) => void;
}

export const CardFAB: React.FC<CardFABProps> = ({ onAdd }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseDown = () => {
        timeoutRef.current = setTimeout(() => {
            setIsMenuOpen(true);
        }, 500); // 500ms long press
    };

    const handleMouseUp = () => {
        // If timer is still running, it means we haven't reached 500ms
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            // Short press detected
            if (!isMenuOpen) {
                onAdd(CellAttribute.Text);
            }
        }

        if (isMenuOpen) {
            setIsMenuOpen(false);
        }
    };

    // Simple Pie Menu Simulation for testing
    // In real implementation, this would be a sophisticated circular menu overlay.
    // Here we just render absolute positioned buttons when menu open.
    return (
        <div className="relative">
            {isMenuOpen && (
                <div className="absolute bottom-12 right-0 flex flex-col gap-2 mb-2 bg-white/10 p-2 rounded backdrop-blur">
                    <button onClick={(e) => { e.stopPropagation(); onAdd(CellAttribute.Text); setIsMenuOpen(false); }} className="p-2 bg-blue-500 rounded text-white text-xs">Text</button>
                    <button onClick={(e) => { e.stopPropagation(); onAdd(CellAttribute.Task); setIsMenuOpen(false); }} className="p-2 bg-green-500 rounded text-white text-xs">Task</button>
                </div>
            )}

            <button
                aria-label="Add"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp} // Cancel on leave
                className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur transition-all shadow-lg active:scale-95"
            >
                <Plus size={20} />
            </button>
        </div>
    );
}
