/**
 * レア度に応じた背景色スタイルを生成するユーティリティ
 */

// 仕様 9.4: 色彩表現
// Rare (1.0): Start: #667eea, End: #764ba2
// Common (0.0): ベースカラーの約60%の濃度（白とブレンド）

const RARE_START = { r: 0x66, g: 0x7e, b: 0xea }; // #667eea
const RARE_END = { r: 0x76, g: 0x4b, b: 0xa2 };   // #764ba2

const COMMON_FACTOR = 0.6;

/**
 * 2つの数値の線形補間
 */
function lerp(start: number, end: number, factor: number): number {
    return Math.round(start + (end - start) * factor);
}

/**
 * RGB値を白とブレンドして淡くする
 */
function lighten(color: { r: number, g: number, b: number }, factor: number): { r: number, g: number, b: number } {
    return {
        r: lerp(255, color.r, factor),
        g: lerp(255, color.g, factor),
        b: lerp(255, color.b, factor),
    };
}

/**
 * RGBをHEX文字列に変換
 */
function toHex(color: { r: number, g: number, b: number }): string {
    return `#${((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1)}`;
}

/**
 * レア度(0.0-1.0)に対応するグラデーションCSSを生成する
 * @param rarity レア度
 * @returns CSS background style (linear-gradient)
 */
export function getRarityStyle(rarity: number): { background: string } {
    // 0.0以下、1.0以上に丸める
    const r = Math.max(0, Math.min(1, rarity));

    // Common(0.0)はRare(1.0)の60%濃度
    // すなわち、rarity=0のときは Rare * 0.6 + White * 0.4
    // rarity=1のときは Rare * 1.0 + White * 0.0
    // 濃度係数 = 0.6 + (0.4 * rarity)
    const factor = COMMON_FACTOR + (1 - COMMON_FACTOR) * r;

    const startColor = lighten(RARE_START, factor);
    const endColor = lighten(RARE_END, factor);

    return {
        background: `linear-gradient(135deg, ${toHex(startColor)}, ${toHex(endColor)})`,
    };
}
