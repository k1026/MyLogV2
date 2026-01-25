// Path: app/lib/utils.ts
import { z } from 'zod';

// 仕様（スキーマ）
export const TaskSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'タイトルは必須です'),
  completed: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;

// ロジック
export const toggleTask = (task: Task): Task => {
  return { ...task, completed: !task.completed };
};