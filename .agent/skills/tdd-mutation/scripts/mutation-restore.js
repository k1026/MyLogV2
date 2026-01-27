//バグ注入テストの実施後にファイルを元に戻すためのスクリプト

const fs = require('fs');
const path = require('path');

const [, , targetPath] = process.argv;

if (!targetPath) {
  console.error('Usage: node scripts/sat-restore.js <target_file>');
  process.exit(1);
}

const absTarget = path.resolve(targetPath);
const backupPath = absTarget + '.sat_backup';

try {
  // 1. バグファイルの削除
  if (fs.existsSync(absTarget)) {
    // 念のためマーカーがあるか確認しても良いが、強制復元を優先して削除
    fs.unlinkSync(absTarget);
  }

  // 2. バックアップからの復元
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, absTarget);
    console.log(`✨ Restored original file: ${targetPath}`);
  } else {
    console.error(`⚠️ Backup file not found: ${backupPath}`);
    // バックアップがない＝元々ファイルがなかった、もしくは復元済み
    process.exit(1);
  }

} catch (e) {
  console.error('❌ Restore failed:', e);
  process.exit(1);
}