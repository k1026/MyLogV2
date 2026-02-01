import Dexie, { Table } from 'dexie';

// Define the interface for the DB object (as stored in Dexie)
// Mapped keys: I: id, A: attribute, N: name, V: value, G: geo, R: remove
export interface CellDB {
    I: string;
    A: string;
    N: string;
    V: string;
    G: string | null;
    R: string | null;
}

export class MyLogV2DB extends Dexie {
    cells!: Table<CellDB>;

    constructor() {
        super('MyLogV2DB');
        this.version(1).stores({
            cells: '&I' // Primary key "I"
        });
    }
}

const globalForDb = globalThis as unknown as {
    conn: MyLogV2DB | undefined;
};

export const db = globalForDb.conn ?? new MyLogV2DB();

if (process.env.NODE_ENV !== 'production') globalForDb.conn = db;
