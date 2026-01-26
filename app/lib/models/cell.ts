import { z } from 'zod';

/**
 * Cellの属性を定義する列挙型
 */
export type CellAttribute = 'Card' | 'Time' | 'Text' | 'Task';

/**
 * Cellデータクラスのバリデーションスキーマ
 */
export const CellSchema = z.object({
    id: z.string().regex(/^\d+-[A-Z0-9]{5}$/, "IDの形式が不正です"),
    attribute: z.enum(['Card', 'Time', 'Text', 'Task']),
    name: z.string(),
    value: z.string(),
    geo: z.string(),
    remove: z.string(),
});

/**
 * CellSchemaから推論される型
 */
export type CellData = z.infer<typeof CellSchema>;

/**
 * IDのバリデーション用正規表現
 */
const ID_REGEX = /^\d+-[A-Z0-9]{5}$/;

/**
 * アプリケーションのデータの基本単位である「Cell（セル）」クラス
 * 仕様書: docs/specs/02_CellDataStructure.md
 * 
 * すべてのプロパティは文字列で管理され、属性（attribute）によって
 * name や value の意味や制限が変化します。
 */
export class Cell {
    readonly id: string;
    readonly attribute: CellAttribute;
    name: string;
    value: string;
    geo: string;
    remove: string;

    constructor(data: CellData) {
        this.id = data.id;
        this.attribute = data.attribute;
        this.name = data.name;
        this.value = data.value;
        this.geo = data.geo;
        this.remove = data.remove;
    }

    /**
     * Cellを一意に識別するIDを生成する
     * フォーマット: [Unix timestamp in ms]-[5-digit random uppercase alphanumeric]
     */
    static generateId(): string {
        const timestamp = Date.now();
        // より確実に5文字の英数字を生成する
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase().padEnd(5, '0');
        return `${timestamp}-${randomStr}`;
    }

    /**
     * IDから生成時間を取得する（Unixミリ秒）
     */
    get createdAt(): number {
        const timestampPart = this.id.split('-')[0];
        if (!timestampPart) return 0;
        const ts = parseInt(timestampPart, 10);
        return isNaN(ts) ? 0 : ts;
    }

    /**
     * IDリストをパースする（空白区切り）
     */
    private getCellIds(): string[] {
        return this.value.trim() ? this.value.trim().split(/\s+/) : [];
    }

    /**
     * Card属性のCellに新しいCell IDを追加する
     * 重複は許可しない。
     */
    addCellId(cellId: string): void {
        if (this.attribute !== 'Card' || !ID_REGEX.test(cellId)) return;

        const ids = new Set(this.getCellIds());
        if (!ids.has(cellId)) {
            ids.add(cellId);
            this.value = Array.from(ids).join(' ');
        }
    }

    /**
     * Card属性のCellからCell IDを削除する
     */
    removeCellId(cellId: string): void {
        if (this.attribute !== 'Card') return;

        const ids = this.getCellIds();
        const filteredIds = ids.filter(id => id !== cellId);
        this.value = filteredIds.join(' ');
    }

    /**
     * 新しいCellインスタンスを生成するファクトリメソッド
     */
    static create(params: {
        attribute: CellAttribute;
        name?: string;
        value?: string;
        geo?: string;
    }): Cell {
        const data: CellData = {
            id: this.generateId(),
            attribute: params.attribute,
            name: this.getDefaultName(params.attribute, params.name),
            value: this.getDefaultValue(params.attribute, params.value),
            geo: params.geo ?? '',
            remove: '',
        };

        return new Cell(data);
    }

    private static readonly DEFAULT_NAMES: Partial<Record<CellAttribute, string>> = {
        Card: 'Card',
        Time: 'Time',
    };

    /**
     * 属性に応じたデフォルトの名前を取得する
     */
    private static getDefaultName(attribute: CellAttribute, providedName?: string): string {
        return providedName ?? this.DEFAULT_NAMES[attribute] ?? '';
    }

    /**
     * 属性に応じたデフォルトの値を取得する
     */
    private static getDefaultValue(attribute: CellAttribute, providedValue?: string): string {
        if (providedValue !== undefined) return providedValue;

        switch (attribute) {
            case 'Time': return Date.now().toString();
            case 'Task': return ''; // 未完了状態
            default: return '';
        }
    }

    /**
     * オブジェクトからCellインスタンスを復元する
     */
    static fromObject(obj: unknown): Cell {
        const validated = CellSchema.parse(obj);
        return new Cell(validated);
    }

    /**
     * plain objectに変換する
     */
    toObject(): CellData {
        return {
            id: this.id,
            attribute: this.attribute,
            name: this.name,
            value: this.value,
            geo: this.geo,
            remove: this.remove,
        };
    }
}

