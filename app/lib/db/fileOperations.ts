import { Cell } from '../models/cell';
import { CellRepository } from './operations';

export async function exportDatabase(onProgress?: (progress: number) => void): Promise<{ count: number; aborted: boolean; content: string }> {
    const cells = await CellRepository.getAll();
    const total = cells.length;
    onProgress?.(50); // ダミー進捗
    const content = JSON.stringify(cells.map(c => c.toObject()), null, 2);
    onProgress?.(100);
    return { count: total, aborted: false, content };
}

/**
 * データベースの追加インポート処理
 */
export async function appendDatabase(content: string, onProgress?: (progress: number) => void): Promise<{ added: number; skipped: number; aborted: boolean }> {
    try {
        const data = JSON.parse(content) as any[];
        if (!Array.isArray(data)) throw new Error('Invalid format');

        let added = 0;
        let skipped = 0;

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const existing = await CellRepository.getById(item.id);
            if (existing) {
                skipped++;
            } else {
                const cell = Cell.fromObject(item);
                await CellRepository.save(cell);
                added++;
            }
            onProgress?.(((i + 1) / data.length) * 100);
        }

        return { added, skipped, aborted: false };
    } catch (error) {
        console.error('Failed to append database:', error);
        return { added: 0, skipped: 0, aborted: false };
    }
}
