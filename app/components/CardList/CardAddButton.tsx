import React from 'react';

interface CardAddButtonProps {
    onClick: () => void;
    visible: boolean;
}

/**
 * カード追加ボタン (FAB)
 * 
 * 仕様 7.7: 
 * - デザイン: 角を丸めた白の四角いフローティングボタン、中央に紫の十字マークを表示
 * - 配置: カードリストの右下に配置
 * - 挙動: リスト内のカードを開くとボタンを非表示にし、カードを閉じると表示する
 */
export function CardAddButton({ onClick, visible }: CardAddButtonProps) {
    if (!visible) return null;
    return (
        <button
            data-testid="card-add-button-root"
            onClick={onClick}
            className="fixed bottom-8 right-8 w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-[100]"
            aria-label="Add new card"
        >
            <svg
                data-testid="plus-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-purple-600"
            >
                <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}
