//バグ注入テストのためにバックアップを作成し、注入対象にマーカーを設置するスクリプト

const fs = require('fs');
const path = require('path');

// 引数: 対象ファイルパス, バグコードが書かれたソースパス
const [, , targetPath, mutantSourcePath] = process.argv;

if (!targetPath || !mutantSourcePath) {
    console.error('Usage: node scripts/mutation-inject.js <target_file> <mutant_source>');
    process.exit(1);
}

const absTarget = path.resolve(targetPath);
const absMutant = path.resolve(mutantSourcePath);
const backupPath = absTarget + '.sat_backup'; // バックアップ拡張子

// 自爆装置ヘッダー
const MUTANT_HEADER = `// <MUTANT_FILE_MARKER>
// ⚠️ DANGER: This file is a MUTANT for testing.
// It will crash the app unless running in 'test' mode.
if (process.env.NODE_ENV !== 'test') {
  const msg = '🛑 FATAL: Mutant file detected in non-test environment! (' + __filename + ')';
  console.error(msg);
  throw new Error(msg);
}
// </MUTANT_FILE_MARKER>

`;

try {
    // 1. 安全確認: 既にバックアップがある場合は「二重注入」を防ぐため何もしないかエラーにする
    if (fs.existsSync(backupPath)) {
        console.error(`⚠️ Backup already exists: ${backupPath}`);
        console.error('   Please restore the file first before injecting a new mutant.');
        process.exit(1);
    }

    // 2. 元ファイルをバックアップ（リネーム）
    if (fs.existsSync(absTarget)) {
        fs.renameSync(absTarget, backupPath);
    } else {
        // 新規ファイルとして注入する場合の考慮（基本はありえないが念のため）
        console.warn('Target file did not exist, creating new.');
    }

    // 3. バグコードを読み込み、ヘッダーを結合して書き込み
    const mutantContent = fs.readFileSync(absMutant, 'utf8');
    const finalContent = MUTANT_HEADER + mutantContent;

    fs.writeFileSync(absTarget, finalContent);
    console.log(`💉 Injected NODE_ENV guarded mutant into: ${targetPath}`);

} catch (e) {
    console.error('❌ Injection failed:', e);
    // 失敗時は復元を試みる
    if (fs.existsSync(backupPath) && !fs.existsSync(absTarget)) {
        fs.renameSync(backupPath, absTarget);
    }
    process.exit(1);
}