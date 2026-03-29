#!/usr/bin/env node

/**
 * 파일 정리 CLI 도구
 * 지정된 폴더의 파일을 확장자별, 날짜별, 크기별로 자동 분류합니다.
 *
 * 사용법:
 *   node organize.js <대상폴더> [옵션]
 *
 * 옵션:
 *   --by-date       날짜별(YYYY-MM) 분류
 *   --by-size       크기별(small/medium/large) 분류
 *   --dry-run       실제 이동 없이 미리보기만
 *   --recursive     하위 폴더 포함
 *   --config <file> 설정 파일 지정
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── CLI 인자 파싱 ──
const args = process.argv.slice(2);
const flags = {
    byDate: args.includes('--by-date'),
    bySize: args.includes('--by-size'),
    dryRun: args.includes('--dry-run'),
    recursive: args.includes('--recursive'),
};

const configIdx = args.indexOf('--config');
const configPath = configIdx !== -1 ? args[configIdx + 1] : path.join(__dirname, 'organize.config.json');

const targetDir = args.find(a => !a.startsWith('--') && a !== (configIdx !== -1 ? args[configIdx + 1] : ''));

if (!targetDir) {
    console.log(`
╔══════════════════════════════════════════════╗
║         파일 정리 도구 (File Organizer)       ║
╚══════════════════════════════════════════════╝

사용법: node organize.js <대상폴더> [옵션]

옵션:
  --by-date       날짜별(YYYY-MM) 하위 폴더로 분류
  --by-size       크기별(small/medium/large) 분류
  --dry-run       실제 이동 없이 미리보기만 표시
  --recursive     하위 폴더의 파일도 포함
  --config <file> 설정 파일 경로 지정

예시:
  node organize.js ./Downloads
  node organize.js ./Documents --by-date --dry-run
  node organize.js ./Desktop --recursive --by-size
`);
    process.exit(0);
}

// ── 설정 로드 ──
let config = {
    categories: {
        '이미지': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
        '문서': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.hwp'],
        '동영상': ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv'],
        '음악': ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
        '압축파일': ['.zip', '.rar', '.7z', '.tar', '.gz'],
        '코드': ['.js', '.py', '.java', '.html', '.css', '.json', '.xml', '.md'],
        '데이터': ['.csv', '.tsv', '.sql', '.db'],
    },
    sizeThresholds: {
        small: 1024 * 1024,          // 1MB 미만
        medium: 100 * 1024 * 1024,   // 100MB 미만
        // large: 그 이상
    },
    ignoredFiles: ['.DS_Store', 'Thumbs.db', '.gitkeep'],
    logFile: 'organize-log.json',
};

if (fs.existsSync(configPath)) {
    try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        config = { ...config, ...userConfig };
        console.log(`설정 파일 로드: ${configPath}`);
    } catch (e) {
        console.warn(`설정 파일 파싱 실패, 기본 설정 사용: ${e.message}`);
    }
}

// ── 유틸리티 ──
function getCategory(ext) {
    for (const [cat, exts] of Object.entries(config.categories)) {
        if (exts.includes(ext.toLowerCase())) return cat;
    }
    return '기타';
}

function getSizeCategory(size) {
    if (size < config.sizeThresholds.small) return 'small';
    if (size < config.sizeThresholds.medium) return 'medium';
    return 'large';
}

function getSizeCategoryKr(cat) {
    return { small: '소형(~1MB)', medium: '중형(1~100MB)', large: '대형(100MB~)' }[cat];
}

function getFileHash(filePath) {
    const data = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(data).digest('hex');
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
}

function collectFiles(dir, recursive) {
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (recursive) results.push(...collectFiles(fullPath, true));
        } else if (entry.isFile()) {
            if (!config.ignoredFiles.includes(entry.name)) {
                const stat = fs.statSync(fullPath);
                results.push({
                    name: entry.name,
                    path: fullPath,
                    ext: path.extname(entry.name),
                    size: stat.size,
                    mtime: stat.mtime,
                });
            }
        }
    }
    return results;
}

// ── 진행률 표시 ──
function showProgress(current, total, label) {
    const pct = Math.round((current / total) * 100);
    const filled = Math.round(pct / 5);
    const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
    process.stdout.write(`\r  [${bar}] ${pct}% (${current}/${total}) ${label}`);
    if (current === total) process.stdout.write('\n');
}

// ── 메인 로직 ──
function main() {
    const absTarget = path.resolve(targetDir);

    if (!fs.existsSync(absTarget)) {
        console.error(`오류: 대상 폴더가 존재하지 않습니다 - ${absTarget}`);
        process.exit(1);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  파일 정리 도구 (File Organizer)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  대상 폴더: ${absTarget}`);
    console.log(`  분류 기준: ${flags.byDate ? '날짜별' : flags.bySize ? '크기별' : '확장자별'}`);
    console.log(`  하위 폴더 포함: ${flags.recursive ? '예' : '아니오'}`);
    console.log(`  모드: ${flags.dryRun ? '미리보기 (Dry Run)' : '실행'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 파일 수집
    console.log('파일 스캔 중...');
    const files = collectFiles(absTarget, flags.recursive);
    console.log(`  총 ${files.length}개 파일 발견\n`);

    if (files.length === 0) {
        console.log('정리할 파일이 없습니다.');
        return;
    }

    // 중복 파일 감지
    console.log('중복 파일 검사 중...');
    const hashMap = {};
    const duplicates = [];
    files.forEach((file, i) => {
        showProgress(i + 1, files.length, file.name.substring(0, 30));
        try {
            const hash = getFileHash(file.path);
            if (hashMap[hash]) {
                duplicates.push({ original: hashMap[hash], duplicate: file });
            } else {
                hashMap[hash] = file;
            }
        } catch (e) {
            // 해시 계산 실패 시 무시
        }
    });

    if (duplicates.length > 0) {
        console.log(`\n  ⚠ 중복 파일 ${duplicates.length}쌍 발견:`);
        duplicates.forEach(d => {
            console.log(`    - ${d.duplicate.name} ↔ ${d.original.name}`);
        });
        console.log('');
    }

    // 분류 계획 수립
    const plan = [];
    for (const file of files) {
        let destFolder;

        if (flags.byDate) {
            const date = file.mtime;
            destFolder = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (flags.bySize) {
            destFolder = getSizeCategoryKr(getSizeCategory(file.size));
        } else {
            destFolder = getCategory(file.ext);
        }

        const destPath = path.join(absTarget, destFolder, file.name);

        if (file.path !== destPath) {
            plan.push({ file, destFolder, destPath });
        }
    }

    // 결과 표시
    const summary = {};
    plan.forEach(p => {
        summary[p.destFolder] = (summary[p.destFolder] || 0) + 1;
    });

    console.log('분류 계획:');
    for (const [folder, count] of Object.entries(summary)) {
        console.log(`  📁 ${folder}: ${count}개 파일`);
    }
    console.log(`  총 ${plan.length}개 파일 이동 예정\n`);

    if (flags.dryRun) {
        console.log('─── 미리보기 모드 (실제 이동하지 않음) ───\n');
        plan.forEach(p => {
            console.log(`  ${p.file.name} (${formatSize(p.file.size)}) → ${p.destFolder}/`);
        });
        console.log(`\n실제 실행하려면 --dry-run 옵션을 제거하세요.`);
        return;
    }

    // 실제 이동
    console.log('파일 이동 중...');
    const log = { timestamp: new Date().toISOString(), actions: [] };
    let moved = 0, skipped = 0;

    plan.forEach((p, i) => {
        showProgress(i + 1, plan.length, p.file.name.substring(0, 30));

        const destDir = path.dirname(p.destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // 동일 이름 파일 존재 시 번호 추가
        let finalPath = p.destPath;
        if (fs.existsSync(finalPath)) {
            const ext = path.extname(p.file.name);
            const base = path.basename(p.file.name, ext);
            let n = 1;
            while (fs.existsSync(finalPath)) {
                finalPath = path.join(path.dirname(p.destPath), `${base} (${n})${ext}`);
                n++;
            }
        }

        try {
            fs.renameSync(p.file.path, finalPath);
            moved++;
            log.actions.push({
                action: 'move',
                from: p.file.path,
                to: finalPath,
                size: p.file.size,
            });
        } catch (e) {
            skipped++;
            log.actions.push({
                action: 'error',
                file: p.file.path,
                error: e.message,
            });
        }
    });

    // 로그 저장
    const logPath = path.join(absTarget, config.logFile);
    fs.writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf-8');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  정리 완료!');
    console.log(`  이동: ${moved}개 / 건너뜀: ${skipped}개`);
    console.log(`  로그: ${logPath}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
