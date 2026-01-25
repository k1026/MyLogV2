// Path: app/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { mockValid } from 'zod-mocking';
import { TaskSchema, toggleTask } from './utils';
import type { z } from 'zod';

/**
 * generateMock関数の型定義
 * プロジェクト側のZod型(T)を受け取り、その推論型を返す
 */
type GenerateMock = <T extends z.ZodTypeAny>(schema: T) => z.infer<T>;

/**
 * zod-mocking のバージョン不整合を吸収する実装
 * 内部の mockValid が古い Zod 向けに定義されているため、
 * 呼び出し時のみ unknown を経由して型を適合させる。
 */
const generateMock: GenerateMock = (schema) => {
    // NOTE: zod-mocking内部のZodとプロジェクトのZodのバージョンが異なるため、
    // 関数呼び出し時のみ unknown を経由して型不整合を回避する。
    const mocks = mockValid(schema as unknown as any);
    return mocks.DEFAULT as z.infer<typeof schema>;
};

describe('Utils: toggleTask', () => {
    it('タスクの完了状態が反転すること', () => {
        // Strictな型のままモックを生成
        const mockTask = generateMock(TaskSchema);
        const initialState = mockTask.completed;

        const result = toggleTask(mockTask);

        expect(result.completed).toBe(!initialState);
    });
});