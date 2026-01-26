import Dexie, { type Table } from 'dexie';

/**
 * データベース保存用のCellデータ型（短縮プロパティ名）
 */
export interface DBCell {
    I: string; // id
    A: string; // attribute
    N: string; // name
    V: string; // value
    G: string | null; // geo
    R: string | null; // remove
}

/**
 * MyLogV2 ローカルデータベースクラス
 * 仕様書: docs/specs/04_DatabaseSpecification.md
 */
export class MyLogV2DB extends Dexie {
    cells!: Table<DBCell>;

    constructor() {
        super('MyLogV2DB');

        // ストアの定義
        // I: プライマリキー
        this.version(1).stores({
            cells: '&I'
        });
    }
}
