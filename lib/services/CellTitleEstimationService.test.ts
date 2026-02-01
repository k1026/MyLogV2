/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CellTitleEstimationService } from '@/lib/services/CellTitleEstimationService';
import { Cell, CellAttribute } from '@/lib/models/cell';
import { CellRepository } from '@/lib/db/operations';
import { getGeoKey } from '@/lib/services/utils';

// Mock CellRepository
vi.mock('@/lib/db/operations', () => ({
    CellRepository: {
        getRecentCells: vi.fn(),
        getCards: vi.fn(),
    }
}));

describe('CellTitleEstimationService', () => {
    let service: CellTitleEstimationService;

    beforeEach(() => {
        service = CellTitleEstimationService.getInstance();
        service.clear(); // Reset state
        vi.clearAllMocks();
    });

    const createCell = (id: string, name: string, dateStr: string, geo: string | null) => {
        // Mocking value as timestamp for sorting if needed, but here we just need object
        return new Cell({
            id: id, // ID usually has timestamp
            attribute: CellAttribute.Text,
            name: name,
            value: 'val',
            geo: geo,
            remove: null
        });
    };

    describe('Learning Process', () => {
        it('should learn time, location, and transition from a sequence of cells', async () => {
            // C1: "Breakfast" at 08:00, Home
            // C2: "Commute" at 08:30, Home
            // C3: "Work" at 09:00, Office

            // Mocking dates requires careful ID creation or relying on caller to pass ordered list?
            // The service learn method should probably handle sorting or assume order.
            // Let's assume we pass cells in CHRONOLOGICAL order (Old -> New) for this test,
            // or we expect the service to handle it.
            // Documentation says "syncWithDB uses recent 3000". Recent usually implies Newest First.
            // If service.learn expects Newest First, then C3, C2, C1.

            // Let's assume learn implementation sorts by ID to be safe, or we pass sorted.
            // Let's pass random order and expect it to handle.
            // Wait, Cell ID has timestamp.

            const time1 = new Date('2023-01-01T08:00:00').getTime();
            const time2 = new Date('2023-01-01T08:30:00').getTime();
            const time3 = new Date('2023-01-01T09:00:00').getTime();

            const c1 = createCell(`${time1}-AAAAA`, 'Breakfast', '', '35.000 139.000');
            const c2 = createCell(`${time2}-BBBBB`, 'Commute', '', '35.000 139.000');
            const c3 = createCell(`${time3}-CCCCC`, 'Work', '', '35.100 139.100');

            await service.learn([c1, c2, c3]); // Passed in order

            const maps = service.getMaps();

            // Time Map
            // 8: Breakfast, Commute
            // 9: Work
            expect(maps.time[8]).toBeDefined();
            expect(maps.time[8]['Breakfast']).toBe(1);
            expect(maps.time[8]['Commute']).toBe(1);
            expect(maps.time[9]['Work']).toBe(1);

            // Location Map
            // Home (35.000, 139.000) -> Breakfast, Commute
            // Office (35.100, 139.100) -> Work
            const homeKey = getGeoKey('35.000 139.000')!;
            const officeKey = getGeoKey('35.100 139.100')!;

            expect(maps.location[homeKey]['Breakfast']).toBe(1);
            expect(maps.location[homeKey]['Commute']).toBe(1);
            expect(maps.location[officeKey]['Work']).toBe(1);

            // Transition Map
            // Breakfast -> Commute
            // Commute -> Work
            expect(maps.transition['Breakfast']).toBeDefined();
            expect(maps.transition['Breakfast']['Commute']).toBe(1);

            expect(maps.transition['Commute']).toBeDefined();
            expect(maps.transition['Commute']['Work']).toBe(1);
        });
    });

    describe('Estimation Process', () => {
        it('should estimate based on context', async () => {
            // Train first
            const time1 = new Date('2023-01-01T08:00:00').getTime();
            const time2 = new Date('2023-01-01T08:30:00').getTime();
            const c1 = createCell(`${time1}-AAAAA`, 'A', '', '35.000 139.000');
            const c2 = createCell(`${time2}-BBBBB`, 'B', '', '35.000 139.000');
            await service.learn([c1, c2]); // A -> B

            // Context: History=[A], Time=8, Loc=35.000 139.000
            const context = {
                historyTitles: ['A'],
                currentHour: 8,
                geoKey: getGeoKey('35.000 139.000')
            };

            const candidates = service.estimate(context);

            // Expect B to be top candidate
            expect(candidates.length).toBeGreaterThan(0);
            expect(candidates[0].title).toBe('B');

            // Verify scores are present
            expect(candidates[0].details.seqScore).toBeGreaterThan(0);
            expect(candidates[0].details.timeScore).toBeGreaterThan(0);
            expect(candidates[0].details.locScore).toBeGreaterThan(0);
        });

        it('should handle missing history gracefully', async () => {
            const time1 = new Date('2023-01-01T08:00:00').getTime();
            const c1 = createCell(`${time1}-AAAAA`, 'Solo', '', null);
            await service.learn([c1]);

            const context = {
                historyTitles: [], // No history
                currentHour: 8,
                geoKey: null
            };

            const candidates = service.estimate(context);
            // Should suggest Solo based on time
            expect(candidates).toBeDefined();
            const match = candidates.find(c => c.title === 'Solo');
            expect(match).toBeDefined();
            expect(match?.details.timeScore).toBeGreaterThan(0);
        });
    });

    describe('DB Sync', () => {
        it('should load recent cells from DB and learn', async () => {
            const time1 = new Date('2023-01-01T10:00:00').getTime();
            const c1 = createCell(`${time1}-AAAAA`, 'DBItem', '', null);

            // Mock DB return
            (CellRepository.getRecentCells as any).mockResolvedValue([c1]);

            await service.syncWithDB();

            const maps = service.getMaps();
            expect(maps.time[10]['DBItem']).toBe(1);
            expect(CellRepository.getRecentCells).toHaveBeenCalledWith(3000, expect.anything());
        });
    });
});
