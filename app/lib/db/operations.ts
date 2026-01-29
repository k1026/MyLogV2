import { db, CellDB } from './db';
import { Cell, CellAttribute, CellSchema } from '../models/cell';

export const CellRepository = {
    mapToDB(cell: Cell): CellDB {
        return {
            I: cell.id,
            A: cell.attribute,
            N: cell.name,
            V: cell.value,
            G: cell.geo,
            R: cell.remove
        };
    },

    mapFromDB(doc: CellDB): Cell {
        return new Cell({
            id: doc.I,
            attribute: doc.A as CellAttribute,
            name: doc.N,
            value: doc.V,
            geo: doc.G,
            remove: doc.R
        });
    },

    async save(cell: Cell): Promise<void> {
        const dbObj = this.mapToDB(cell);
        await db.cells.put(dbObj);
    },

    async getById(id: string): Promise<Cell | undefined> {
        const doc = await db.cells.get(id);
        return doc ? this.mapFromDB(doc) : undefined;
    },

    async getByIds(ids: string[]): Promise<Cell[]> {
        const docs = await db.cells.bulkGet(ids);
        // bulkGet returns (CellDB | undefined)[]
        return docs
            .filter((doc): doc is CellDB => doc !== undefined)
            .map(doc => this.mapFromDB(doc));
    },

    async getAll(): Promise<Cell[]> {
        // ID descending
        const docs = await db.cells.orderBy('I').reverse().toArray();
        return docs.map(doc => this.mapFromDB(doc));
    },

    async delete(id: string): Promise<void> {
        await db.cells.delete(id);
    },

    async clearAll(): Promise<void> {
        await db.cells.clear();
    },

    async getCount(): Promise<number> {
        return await db.cells.count();
    },

    async getRange(offset: number, limit: number): Promise<Cell[]> {
        // ID descending
        const docs = await db.cells.orderBy('I').reverse().offset(offset).limit(limit).toArray();
        return docs.map(doc => this.mapFromDB(doc));
    },

    async getAllKeys(direction: 'next' | 'prev' = 'prev'): Promise<string[]> {
        let collection = db.cells.orderBy('I');
        if (direction === 'prev') {
            collection = collection.reverse();
        }
        return collection.primaryKeys() as Promise<string[]>;
    },

    async processAllInBatches(batchSize: number, callback: (cells: Cell[]) => Promise<void>): Promise<void> {
        let batch: Cell[] = [];

        // Iterate in descending order (same as default view)
        await db.cells.orderBy('I').reverse().each(async (doc) => {
            batch.push(this.mapFromDB(doc));
            if (batch.length >= batchSize) {
                const currentBatch = [...batch];
                batch = [];
                await callback(currentBatch);
            }
        });

        // Process remaining
        if (batch.length > 0) {
            await callback(batch);
        }
    },

    async exportAsJSONL(): Promise<string> {
        const docs = await db.cells.orderBy('I').reverse().toArray();
        return docs.map(doc => JSON.stringify(doc)).join('\n');
    },

    async importFromJSONL(jsonl: string): Promise<ImportResult> {
        const lines = jsonl.split('\n');
        let successCount = 0;
        let failureCount = 0;
        const errors: string[] = [];

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            try {
                const rawDoc = JSON.parse(trimmedLine) as Record<string, unknown>;

                // Basic check for minimal required fields roughly
                if (!rawDoc['I'] || !rawDoc['A']) {
                    throw new Error('Missing required DB keys (I, A)');
                }

                // mapFromDB handles the casting from raw object
                const cell = this.mapFromDB(rawDoc as unknown as CellDB);

                const validation = CellSchema.safeParse(cell);
                if (!validation.success) {
                    const errorMsg = validation.error.issues
                        .map(i => `${i.path.join('.')}: ${i.message}`)
                        .join(', ');
                    throw new Error(`Validation error: ${errorMsg}`);
                }

                await this.save(cell);
                successCount++;
            } catch (e: unknown) {
                failureCount++;
                const message = e instanceof Error ? e.message : String(e);
                errors.push(`Line error: ${message}`);
            }
        }

        return { successCount, failureCount, errors };
    },

    async getCards(offset: number, limit: number): Promise<Cell[]> {
        const docs = await db.cells
            .orderBy('I')
            .reverse()
            .filter(doc => doc.A === 'Card')
            .offset(offset)
            .limit(limit)
            .toArray();
        return docs.map(doc => this.mapFromDB(doc));
    },

    async getCardCount(): Promise<number> {
        return await db.cells.filter(doc => doc.A === 'Card').count();
    },

    async getRecentCells(limit: number, excludeAttributes: CellAttribute[]): Promise<Cell[]> {
        const excludeSet = new Set(excludeAttributes);
        const docs = await db.cells
            .orderBy('I')
            .reverse()
            .filter(doc => !excludeSet.has(doc.A as CellAttribute))
            .limit(limit)
            .toArray();
        return docs.map(doc => this.mapFromDB(doc));
    }
};

export interface ImportResult {
    successCount: number;
    failureCount: number;
    errors: string[];
}
