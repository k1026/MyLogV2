//バグ注入テストで作成したファイルが意図せず残っていないか検査するスクリプト

const fs = require('fs');
const path = require('path');

// 検索対象外のディレクトリ
const IGNORE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.agent'];
// 検索対象の拡張子
const TARGET_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
// ★重要: このタグだけを探すので、他のNODE_ENV利用には影響しない
const GUARD_TAG = '<MUTANT_FILE_MARKER>';

let foundCount = 0;

// 再帰的にディレクトリをスキャンする関数
function scanDirectory(dir) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        console.error(`⚠️ Cannot read directory: ${dir}`);
        return;
    }

    for (const file of files) {
        const fullPath = path.join(dir, file);
        let stat;

        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            continue; // ファイルが読み取れない場合はスキップ
        }

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                scanDirectory(fullPath);
            }
        } else {
            if (TARGET_EXTS.includes(path.extname(file))) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes(GUARD_TAG)) {
                    console.error(`\n🚨 MUTANT DETECTED in: ${fullPath}`);
                    console.error(`   The guard tag "${GUARD_TAG}" was found.`);
                    foundCount++;
                }
            }
        }
    }
}

// ▼▼▼ 修正箇所: 引数から対象フォルダを決定するロジック ▼▼▼

const [, , targetPath] = process.argv;
let scanTargetDir;

if (targetPath) {
    // 引数がある場合: そのファイルの「親ディレクトリ」をスキャン対象にする
    // 例: src/utils/calc.ts が渡されたら -> src/utils/ をスキャン
    scanTargetDir = path.dirname(path.resolve(targetPath));
    console.log(`🎯 Targeted Scan: Checking folder "${scanTargetDir}"`);
} else {
    // 引数がない場合: 安全のためプロジェクトルート(スクリプトの親)をスキャン
    // ※ プロジェクト全体を確認したい場合用
    scanTargetDir = path.resolve(__dirname, '..', '..', '..', '..', '..');
    console.log(`🛡️  Full Scan: Checking project root "${scanTargetDir}"`);
}

// ▲▲▲ 修正箇所ここまで ▲▲▲

console.log('🔍 Scanning for mutant markers...');
scanDirectory(scanTargetDir);

if (foundCount > 0) {
    console.error(`\n❌ FAILED: ${foundCount} mutant file(s) found in target area. Do not commit!`);
    process.exit(1);
} else {
    console.log('✅ Clean. No mutants found.');
    process.exit(0);
}