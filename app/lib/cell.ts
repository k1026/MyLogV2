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

    constructor(data: z.infer<typeof CellSchema>) {
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
        // 36進数に変換して大文字化し、後ろから5文字取ることで大文字英数字5桁を生成
        const randomStr = Math.random().toString(36).toUpperCase().slice(-5).padStart(5, '0');
        return `${timestamp}-${randomStr}`;
    }

    /**
     * IDから生成時間を取得する（Unixミリ秒）
     */
    get createdAt(): number {
        const parts = this.id.split('-');
        return parseInt(parts[0], 10);
    }

    /**
     * Card属性のCellに新しいCell IDを追加する
     * 重複は許可しない。
     */
    addCellId(cellId: string): void {
        if (this.attribute !== 'Card') return;

        const ids = this.value ? this.value.split(' ') : [];
        if (!ids.includes(cellId)) {
            ids.push(cellId);
            this.value = ids.join(' ').trim();
        }
    }

    /**
     * Card属性のCellからCell IDを削除する
     */
    removeCellId(cellId: string): void {
        if (this.attribute !== 'Card') return;

        const ids = this.value ? this.value.split(' ') : [];
        const filteredIds = ids.filter(id => id !== cellId);
        this.value = filteredIds.join(' ').trim();
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
        const defaultName = this.getDefaultName(params.attribute, params.name);
        const defaultValue = this.getDefaultValue(params.attribute, params.value);

        const data: z.infer<typeof CellSchema> = {
            id: this.generateId(),
            attribute: params.attribute,
            name: defaultName,
            value: defaultValue,
            geo: params.geo ?? '',
            remove: '',
        };

        return new Cell(data);
    }

    /**
     * 属性に応じたデフォルトの名前を取得する
     */
    private static getDefaultName(attribute: CellAttribute, providedName?: string): string {
        if (providedName !== undefined) return providedName;

        switch (attribute) {
            case 'Card': return 'Card';
            case 'Time': return 'Time';
            default: return '';
        }
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
    toObject(): z.infer<typeof CellSchema> {
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
