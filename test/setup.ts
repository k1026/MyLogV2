// Path: test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import 'fake-indexeddb/auto'; // IndexedDBをNode.js環境でシミュレート

// NOTE: Vitest実行時にIndexedDB関連のグローバル変数が自動的にモックされます。
// これにより、Dexie.jsがブラウザ外でも動作可能になります。