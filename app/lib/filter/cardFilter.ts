import { Cell } from '../models/cell';
import { FilterSettings, FilterAttribute } from '../models/filter';

/**
 * カードリストをフィルタリングする
 * @param cards カード（Cell）の配列
 * @param subCellMap カードの子セルを含む全セルのマップ
 * @param settings フィルタ設定
 * @returns フィルタリングされたカードの配列
 */
export function filterCards(
    cards: Cell[],
    subCellMap: Map<string, Cell>,
    settings: FilterSettings
): Cell[] {
    const { attributes, keywords, dateRange } = settings;
    const isRemoveIncluded = attributes.includes('Remove');
    const hasIncludeKeywords = keywords.include.length > 0;
    const hasExcludeKeywords = keywords.exclude.length > 0;

    // タイムスタンプのパース用関数 (YYYY-MM-DD -> timestamp)
    const parseDate = (dateStr: string | null, isEnd: boolean): number | null => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        if (isEnd) {
            date.setHours(23, 59, 59, 999);
        } else {
            date.setHours(0, 0, 0, 0);
        }
        return date.getTime();
    };

    const dateFrom = parseDate(dateRange.from, false);
    const dateTo = parseDate(dateRange.to, true);

    return cards.filter((card) => {
        // 1. 削除フラグの判定
        if (!isRemoveIncluded && card.remove !== null) {
            return false;
        }

        // カードに紐づく全てのサブセルを取得
        const subCellIds = card.value.split(' ').filter((id) => id.length > 0);
        const subCells = subCellIds
            .map((id) => subCellMap.get(id))
            .filter((cell): cell is Cell => cell !== undefined);

        // 2. 属性フィルタリング（判定用のサブセルを絞り込む）
        // Remove は属性フィルタとしてではなく「削除済みカードを表示するか」のフラグとして扱う
        const activeAttributes = attributes.filter((attr) => attr !== 'Remove');
        const matchedSubCells = subCells.filter((cell) =>
            (activeAttributes as string[]).includes(cell.attribute)
        );

        // 属性フィルタに一致するセルが一つもない場合は除外
        // 仕様 15.3.63: "選択された属性を1つ以上持つサブセルがを含んだカードが抽出対象"
        if (activeAttributes.length > 0 && matchedSubCells.length === 0) {
            return false;
        }

        // 3. 期間フィルタ
        if (dateFrom !== null || dateTo !== null) {
            const hasSubCellInRange = subCells.some((cell) => {
                const timestamp = parseInt(cell.id.split('-')[0]);
                if (dateFrom !== null && timestamp < dateFrom) return false;
                if (dateTo !== null && timestamp > dateTo) return false;
                return true;
            });
            if (!hasSubCellInRange) return false;
        }

        // キーワード判定用ヘルパー
        const matchesKeywords = (cell: Cell, searchKeywords: string[]): boolean => {
            const { target } = keywords;
            return searchKeywords.some((kw) => {
                const lowerKw = kw.toLowerCase();
                if (target === 'both' || target === 'name') {
                    if (cell.name.toLowerCase().includes(lowerKw)) return true;
                }
                if (target === 'both' || target === 'value') {
                    if (cell.value.toLowerCase().includes(lowerKw)) return true;
                }
                return false;
            });
        };

        // 4. キーワード除外（優先）
        if (hasExcludeKeywords) {
            const isExcluded = subCells.some((cell) =>
                matchesKeywords(cell, keywords.exclude)
            );
            if (isExcluded) return false;
        }

        // 5. キーワード抽出
        if (hasIncludeKeywords) {
            const isIncluded = subCells.some((cell) =>
                matchesKeywords(cell, keywords.include)
            );
            if (!isIncluded) return false;
        }

        return true;
    });
}
