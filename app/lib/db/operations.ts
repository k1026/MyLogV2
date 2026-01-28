import { db, CellDB } from './db';
import { Cell, CellAttribute } from '../models/cell';

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
        return {
            id: doc.I,
            attribute: doc.A as CellAttribute,
            name: doc.N,
            value: doc.V,
            geo: doc.G,
            remove: doc.R
        };
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
        return await collection.primaryKeys() as Promise<string[]>;
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
    }
};
