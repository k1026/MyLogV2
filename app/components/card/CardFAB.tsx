import { Plus, FileText, CheckSquare } from 'lucide-react';
import { CellAttribute } from '@/app/lib/models/cell';
import { useState, useRef } from 'react';
import { cn } from '@/app/lib/utils';

interface CardFABProps {
    onAdd: (attribute: CellAttribute) => void;
}

export const CardFAB: React.FC<CardFABProps> = ({ onAdd }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<CellAttribute | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressActive = useRef(false);

    const handleMouseDown = () => {
        isLongPressActive.current = false;
        timeoutRef.current = setTimeout(() => {
            setIsMenuOpen(true);
            isLongPressActive.current = true;
        }, 10); // 10ms threshold as per spec 5.3.2.4.2
    };

    const handleMouseUp = (e: React.MouseEvent, itemOverride?: CellAttribute) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        const attribute = itemOverride || hoveredItem;

        if (!isLongPressActive.current) {
            // Short press (tap) -> Add Text as default
            onAdd(CellAttribute.Text);
        } else {
            // Long press: 
            // If an item is hovered/selected, use it. 
            // Otherwise, default to Text cell as requested.
            onAdd(attribute || CellAttribute.Text);
        }

        setIsMenuOpen(false);
        setHoveredItem(null);
        isLongPressActive.current = false;
    };

    const handleMouseEnterItem = (attribute: CellAttribute) => {
        setHoveredItem(attribute);
    };

    const handleMouseLeaveItem = () => {
        setHoveredItem(null);
    };

    return (
        <div className="relative flex items-center justify-center">
            {isMenuOpen && (
                <>
                    {/* Task Item (Top) */}
                    <div
                        data-testid="fab-menu-task"
                        onMouseEnter={() => handleMouseEnterItem(CellAttribute.Task)}
                        onMouseLeave={handleMouseLeaveItem}
                        onMouseUp={(e) => handleMouseUp(e, CellAttribute.Task)}
                        className={cn(
                            "absolute bottom-16 w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 shadow-md",
                            "bg-purple-200 text-white", // Spec: 薄い紫の背景に白色アイコン
                            hoveredItem === CellAttribute.Task ? "scale-110 shadow-lg ring-2 ring-white/50" : "scale-100"
                        )}
                    >
                        <CheckSquare size={24} />
                    </div>

                    {/* Text Item (Left) */}
                    <div
                        data-testid="fab-menu-text"
                        onMouseEnter={() => handleMouseEnterItem(CellAttribute.Text)}
                        onMouseLeave={handleMouseLeaveItem}
                        onMouseUp={(e) => handleMouseUp(e, CellAttribute.Text)}
                        className={cn(
                            "absolute right-16 w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 shadow-md",
                            "bg-purple-200 text-white",
                            hoveredItem === CellAttribute.Text ? "scale-110 shadow-lg ring-2 ring-white/50" : "scale-100"
                        )}
                    >
                        <FileText size={24} />
                    </div>
                </>
            )}

            <button
                aria-label="Add"
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e)}
                onMouseLeave={(e) => {
                    // If we leave the button, we don't cancel long press if menu is open, 
                    // because we want to drag to items.
                    // But if it was a short press and we left, we cancel.
                    if (!isLongPressActive.current) {
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                            timeoutRef.current = null;
                        }
                    }
                }}
                className={cn(
                    "w-[60px] h-[60px] flex items-center justify-center rounded-full transition-all shadow-lg active:scale-95 z-50",
                    "bg-purple-200 text-white" // Spec: 薄い紫の背景に白い十字
                )}
            >
                <Plus size={28} className={cn("transition-transform", isMenuOpen && "rotate-45")} />
            </button>
        </div>
    );
}
