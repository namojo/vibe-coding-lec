#!/usr/bin/env node

/**
 * 보고 자동화 파이프라인
 * CSV 데이터를 읽어 통계를 계산하고 HTML 보고서를 생성합니다.
 *
 * 사용법:
 *   node pipeline.js                          기본 데이터로 보고서 생성
 *   node pipeline.js --input data/mydata.csv  지정 CSV 파일 사용
 *   node pipeline.js --output report.html     출력 파일명 지정
 *   node pipeline.js --open                   생성 후 브라우저에서 열기
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── CLI 인자 ──
const args = process.argv.slice(2);
function getArg(flag, defaultVal) {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const inputFile = getArg('--input', path.join(__dirname, 'data', 'weekly_2026_w12.csv'));
const outputFile = getArg('--output', path.join(__dirname, 'report_output.html'));
const shouldOpen = args.includes('--open');

// ── CSV 파서 (간이) ──
function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((h, idx) => {
                const num = parseFloat(values[idx]);
                row[h] = isNaN(num) || values[idx] === '' ? values[idx] : num;
            });
            rows.push(row);
        }
    }

    return { headers, rows };
}

// ── 통계 계산 ──
function computeStats(rows, numericColumns) {
    const stats = {};

    for (const col of numericColumns) {
        const values = rows.map(r => r[col]).filter(v => typeof v === 'number');
        if (values.length === 0) continue;

        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const sorted = [...values].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const median = sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];

        stats[col] = {
            count: values.length,
            sum: Math.round(sum * 100) / 100,
            avg: Math.round(avg * 100) / 100,
            min,
            max,
            median,
        };
    }

    return stats;
}

// ── 부서별 그룹화 ──
function groupBy(rows, key) {
    const groups = {};
    for (const row of rows) {
        const k = row[key] || '미분류';
        if (!groups[k]) groups[k] = [];
        groups[k].push(row);
    }
    return groups;
}

// ── HTML 보고서 생성 ──
function generateReport(data, stats, grouped) {
    const { headers, rows } = data;
    const reportDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const numericCols = Object.keys(stats);

    // 부서별 요약
    const deptSummary = Object.entries(grouped).map(([dept, deptRows]) => {
        const totalTasks = deptRows.length;
        const completed = deptRows.filter(r => r['상태'] === '완료').length;
        const rate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
        const totalHours = deptRows.reduce((s, r) => s + (r['소요시간'] || 0), 0);
        return { dept, totalTasks, completed, rate, totalHours: Math.round(totalHours * 10) / 10 };
    });

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>주간 업무 보고서</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #fff; color: #333; line-height: 1.6; }
        .report { max-width: 900px; margin: 0 auto; padding: 40px; }
        .report-header { border-bottom: 3px solid #0984e3; padding-bottom: 20px; margin-bottom: 30px; }
        .report-header h1 { font-size: 26px; color: #0984e3; }
        .report-header .meta { font-size: 14px; color: #636e72; margin-top: 8px; }
        .section { margin-bottom: 32px; }
        .section h2 { font-size: 18px; color: #2d3436; border-left: 4px solid #0984e3; padding-left: 12px; margin-bottom: 16px; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .summary-item { background: #f8f9fa; border-radius: 10px; padding: 16px; text-align: center; }
        .summary-item .val { font-size: 28px; font-weight: 700; color: #0984e3; }
        .summary-item .lbl { font-size: 12px; color: #636e72; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
        th, td { padding: 8px 12px; text-align: left; border: 1px solid #e0e0e0; }
        th { background: #f8f9fa; font-weight: 600; }
        tr:nth-child(even) { background: #fafafa; }
        .chart-container { max-width: 500px; margin: 16px auto; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
        .badge-done { background: #d4edda; color: #155724; }
        .badge-progress { background: #fff3cd; color: #856404; }
        .badge-wait { background: #e2e3e5; color: #383d41; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #b2bec3; text-align: center; }
        @media print { body { font-size: 12px; } .report { padding: 20px; } }
    </style>
</head>
<body>
<div class="report">
    <div class="report-header">
        <h1>주간 업무 보고서</h1>
        <div class="meta">
            보고 기간: 2026년 3월 16일 ~ 3월 20일 (제12주) &middot;
            생성일: ${reportDate} &middot;
            데이터: ${rows.length}건
        </div>
    </div>

    <div class="section">
        <h2>요약</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="val">${rows.length}</div>
                <div class="lbl">전체 업무</div>
            </div>
            <div class="summary-item">
                <div class="val">${rows.filter(r => r['상태'] === '완료').length}</div>
                <div class="lbl">완료</div>
            </div>
            <div class="summary-item">
                <div class="val">${stats['소요시간'] ? stats['소요시간'].sum : '-'}</div>
                <div class="lbl">총 소요시간(h)</div>
            </div>
            <div class="summary-item">
                <div class="val">${stats['소요시간'] ? stats['소요시간'].avg : '-'}</div>
                <div class="lbl">평균 소요시간(h)</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>부서별 현황</h2>
        <table>
            <thead><tr><th>부서</th><th>전체</th><th>완료</th><th>완료율</th><th>총 소요시간</th></tr></thead>
            <tbody>
                ${deptSummary.map(d => `<tr>
                    <td>${d.dept}</td><td>${d.totalTasks}</td><td>${d.completed}</td>
                    <td>${d.rate}%</td><td>${d.totalHours}h</td>
                </tr>`).join('')}
            </tbody>
        </table>
        <div class="chart-container">
            <canvas id="deptChart" height="200"></canvas>
        </div>
    </div>

    <div class="section">
        <h2>통계 요약</h2>
        <table>
            <thead><tr><th>항목</th><th>건수</th><th>합계</th><th>평균</th><th>최소</th><th>최대</th><th>중앙값</th></tr></thead>
            <tbody>
                ${numericCols.map(col => {
                    const s = stats[col];
                    return `<tr><td>${col}</td><td>${s.count}</td><td>${s.sum}</td><td>${s.avg}</td><td>${s.min}</td><td>${s.max}</td><td>${s.median}</td></tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>전체 업무 상세</h2>
        <table>
            <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>
                ${rows.map(r => `<tr>${headers.map(h => {
                    let val = r[h];
                    if (h === '상태') {
                        const cls = val === '완료' ? 'badge-done' : val === '진행중' ? 'badge-progress' : 'badge-wait';
                        val = `<span class="badge ${cls}">${val}</span>`;
                    }
                    return `<td>${val}</td>`;
                }).join('')}</tr>`).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        이 보고서는 자동 생성되었습니다. &middot; NIA 보고 자동화 파이프라인 v1.0
    </div>
</div>

<script>
    const deptData = ${JSON.stringify(deptSummary)};
    new Chart(document.getElementById('deptChart'), {
        type: 'bar',
        data: {
            labels: deptData.map(d => d.dept),
            datasets: [
                { label: '전체', data: deptData.map(d => d.totalTasks), backgroundColor: '#74b9ffcc', borderRadius: 4 },
                { label: '완료', data: deptData.map(d => d.completed), backgroundColor: '#00b894cc', borderRadius: 4 },
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
<\/script>
</body>
</html>`;
}

// ── 메인 ──
function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  보고 자동화 파이프라인');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. CSV 읽기
    console.log(`1단계: 데이터 읽기`);
    if (!fs.existsSync(inputFile)) {
        console.error(`  오류: 파일을 찾을 수 없습니다 - ${inputFile}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(inputFile, 'utf-8');
    const data = parseCSV(raw);
    console.log(`  파일: ${path.basename(inputFile)}`);
    console.log(`  행: ${data.rows.length}건 / 열: ${data.headers.length}개`);
    console.log(`  컬럼: ${data.headers.join(', ')}\n`);

    // 2. 통계 계산
    console.log(`2단계: 통계 계산`);
    const numericColumns = data.headers.filter(h =>
        data.rows.some(r => typeof r[h] === 'number')
    );
    const stats = computeStats(data.rows, numericColumns);
    for (const [col, s] of Object.entries(stats)) {
        console.log(`  ${col}: 합계=${s.sum}, 평균=${s.avg}, 범위=${s.min}~${s.max}`);
    }
    console.log('');

    // 3. 그룹화
    console.log(`3단계: 부서별 그룹화`);
    const grouped = groupBy(data.rows, '부서');
    for (const [dept, rows] of Object.entries(grouped)) {
        const completed = rows.filter(r => r['상태'] === '완료').length;
        console.log(`  ${dept}: ${rows.length}건 (완료 ${completed}건)`);
    }
    console.log('');

    // 4. HTML 보고서 생성
    console.log(`4단계: HTML 보고서 생성`);
    const html = generateReport(data, stats, grouped);
    fs.writeFileSync(outputFile, html, 'utf-8');
    console.log(`  출력: ${outputFile}`);
    console.log(`  크기: ${(Buffer.byteLength(html) / 1024).toFixed(1)}KB\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  보고서 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 브라우저 열기
    if (shouldOpen) {
        const absPath = path.resolve(outputFile);
        try {
            if (process.platform === 'darwin') execSync(`open "${absPath}"`);
            else if (process.platform === 'win32') execSync(`start "" "${absPath}"`);
            else execSync(`xdg-open "${absPath}"`);
            console.log('브라우저에서 보고서를 열었습니다.\n');
        } catch {
            console.log(`브라우저 열기 실패. 수동으로 열어주세요: ${absPath}\n`);
        }
    }
}

main();
