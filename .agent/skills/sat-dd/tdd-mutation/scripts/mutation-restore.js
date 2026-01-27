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
  // 1. バックアップの存在確認
  if (!fs.existsSync(backupPath)) {
    console.error(`⚠️ Backup file not found: ${backupPath}`);
    // すでに復元済みか、インジェクションに失敗していた可能性がある
    if (fs.existsSync(absTarget)) {
      const content = fs.readFileSync(absTarget, 'utf8');
      if (content.includes('<MUTANT_FILE_MARKER>')) {
        console.error('🚨 Mutant marker detected but NO BACKUP found! Critical state.');
      } else {
        console.log('✅ File seems already restored or clean.');
        process.exit(0);
      }
    }
    process.exit(1);
  }

  // 2. アトミックな復元の試み
  const tempMutantPath = absTarget + '.mutant_tmp';

  // 現時点のミュータントファイルを一時待避（削除の代わり）
  if (fs.existsSync(absTarget)) {
    fs.renameSync(absTarget, tempMutantPath);
  }

  try {
    // バックアップを元に戻す
    fs.renameSync(backupPath, absTarget);

    // 復元に成功したらミュータント（待避分）を消す
    if (fs.existsSync(tempMutantPath)) {
      fs.unlinkSync(tempMutantPath);
    }
    console.log(`✨ Safely restored original file: ${targetPath}`);

  } catch (renameError) {
    // 復元（バックアップの移動）に失敗した場合、ミュータントを戻してロールバックを試みる
    console.error('❌ Failed to move backup back. Rolling back...', renameError);
    if (fs.existsSync(tempMutantPath)) {
      if (fs.existsSync(absTarget)) fs.unlinkSync(absTarget); // 万が一何かできていたら消す
      fs.renameSync(tempMutantPath, absTarget);
    }
    throw renameError;
  }

} catch (e) {
  console.error('❌ Restore process failed:', e);
  process.exit(1);
}
