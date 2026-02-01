import React from 'react';

/**
 * テキスト内のキーワードをハイライトする (背景色変更)
 * @param text 対象テキスト
 * @param keywords ハイライトするキーワードの配列
 * @returns ReactNode (文字列とspanの配列)
 */
export function highlightText(text: string, keywords: string[]): React.ReactNode {
    if (!text || !keywords || keywords.length === 0) return text;

    // キーワードをエスケープして正規表現を作成 (OR検索)
    const escapedKeywords = keywords
        .filter(kw => kw.trim().length > 0)
        .map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (escapedKeywords.length === 0) return text;

    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-orange-200 text-inherit px-0.5 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}
