import { Cell, CellAttribute } from '../models/cell';

/**
 * レア度計算クラス
 */
export class RarityCalculator {
    /**
     * セル群からレア度を計算する
     * @param cells セルの配列
     * @returns タイトルをキー、レア度(0.0-1.0)を値とするMap
     */
    static calculateRarity(cells: Cell[]): Map<string, number> {
        const rarityMap = new Map<string, number>();
        const DECAY_FACTOR = 0.97;

        // 仕様 9.2.1: 取得した順（新しい順）にタイトルを走査
        // cellsは最新(ID降順)で渡されることを想定
        for (const cell of cells) {
            // 仕様 9.1: Card属性およびTime属性以外が対象
            if (cell.attribute === CellAttribute.Card || cell.attribute === CellAttribute.Time) {
                continue;
            }

            const name = cell.name;
            const currentRarity = rarityMap.get(name);

            if (currentRarity === undefined) {
                // 初回出現時: レア度 1.0
                rarityMap.set(name, 1.0);
            } else {
                // 既出の場合: 現在のレア度 × 0.97
                rarityMap.set(name, currentRarity * DECAY_FACTOR);
            }
        }

        return rarityMap;
    }
}
