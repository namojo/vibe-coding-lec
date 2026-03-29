#!/usr/bin/env node

/**
 * 알림봇 웹 관리 페이지
 * Express.js 기반 웹 서버로 일정/마감일을 관리하고 알림 상태를 확인합니다.
 *
 * 사용법: node server.js
 * 기본 포트: 3000 (PORT 환경변수로 변경 가능)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;

// ── 데이터 파일 경로 ──
const SCHEDULE_PATH = path.join(__dirname, 'schedule.json');
const DEADLINES_PATH = path.join(__dirname, 'deadlines.json');

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── 알림 이력 (메모리) ──
const notificationLog = [];

function addLog(type, title, message) {
    notificationLog.unshift({
        timestamp: new Date().toISOString(),
        type,
        title,
        message,
    });
    if (notificationLog.length > 100) notificationLog.length = 100;
}

// ── 마감일 상태 계산 ──
function enrichDeadlines(deadlines) {
    const now = new Date();
    return deadlines.map(d => {
        const due = new Date(d.dueDate);
        const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        let urgency = 'normal';
        if (d.status === '완료') urgency = 'done';
        else if (daysLeft < 0) urgency = 'overdue';
        else if (daysLeft === 0) urgency = 'today';
        else if (daysLeft <= 3) urgency = 'soon';
        return { ...d, daysLeft, urgency };
    });
}

// ── HTML 페이지 ──
function renderPage() {
    const schedules = readJSON(SCHEDULE_PATH);
    const deadlines = enrichDeadlines(readJSON(DEADLINES_PATH));

    const urgencyBadge = (u) => {
        const map = {
            overdue: '<span style="background:#d63031;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px;">기한초과</span>',
            today: '<span style="background:#e17055;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px;">오늘마감</span>',
            soon: '<span style="background:#fdcb6e;color:#333;padding:2px 8px;border-radius:10px;font-size:12px;">임박</span>',
            normal: '<span style="background:#dfe6e9;color:#333;padding:2px 8px;border-radius:10px;font-size:12px;">정상</span>',
            done: '<span style="background:#00b894;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px;">완료</span>',
        };
        return map[u] || map.normal;
    };

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>알림봇 관리</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #f5f6fa; color: #2d3436; }
        .header { background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: #fff; padding: 20px 32px; }
        .header h1 { font-size: 22px; }
        .header p { font-size: 13px; opacity: .8; margin-top: 4px; }
        .container { max-width: 1100px; margin: 0 auto; padding: 24px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .panel { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
        .panel h2 { font-size: 16px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
        .panel h2 .count { font-size: 13px; color: #b2bec3; font-weight: 400; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #f0f0f0; }
        th { background: #fafafa; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #636e72; }
        .full-width { grid-column: 1 / -1; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
        .stat-card { background: #fff; border-radius: 12px; padding: 16px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); text-align: center; }
        .stat-card .val { font-size: 28px; font-weight: 700; }
        .stat-card .lbl { font-size: 12px; color: #b2bec3; margin-top: 4px; }
        .stat-card.danger .val { color: #d63031; }
        .stat-card.warn .val { color: #e17055; }
        .stat-card.ok .val { color: #00b894; }
        .btn { display: inline-block; padding: 6px 14px; border-radius: 6px; font-size: 13px; text-decoration: none; cursor: pointer; border: none; }
        .btn-primary { background: #6c5ce7; color: #fff; }
        .btn-primary:hover { background: #5a4bd1; }
        .btn-sm { padding: 4px 10px; font-size: 12px; }
        .log-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .log-item .time { color: #b2bec3; font-size: 11px; }
        .empty { color: #b2bec3; text-align: center; padding: 24px; font-size: 14px; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } .stats { grid-template-columns: repeat(2, 1fr); } }
    </style>
</head>
<body>
    <div class="header">
        <h1>NIA 알림봇 관리 대시보드</h1>
        <p>일정 및 마감일 모니터링 · Webhook 알림 관리</p>
    </div>
    <div class="container">
        <div class="stats">
            <div class="stat-card">
                <div class="val">${schedules.length}</div>
                <div class="lbl">등록 일정</div>
            </div>
            <div class="stat-card ${deadlines.filter(d => d.urgency === 'overdue').length > 0 ? 'danger' : 'ok'}">
                <div class="val">${deadlines.filter(d => d.urgency === 'overdue').length}</div>
                <div class="lbl">기한 초과</div>
            </div>
            <div class="stat-card ${deadlines.filter(d => d.urgency === 'today' || d.urgency === 'soon').length > 0 ? 'warn' : 'ok'}">
                <div class="val">${deadlines.filter(d => d.urgency === 'today' || d.urgency === 'soon').length}</div>
                <div class="lbl">마감 임박</div>
            </div>
            <div class="stat-card ok">
                <div class="val">${deadlines.filter(d => d.urgency === 'done').length}</div>
                <div class="lbl">완료</div>
            </div>
        </div>

        <div class="grid">
            <div class="panel">
                <h2>마감일 관리 <span class="count">${deadlines.length}건</span></h2>
                <table>
                    <thead><tr><th>제목</th><th>마감일</th><th>담당</th><th>상태</th></tr></thead>
                    <tbody>
                        ${deadlines.map(d => `<tr>
                            <td>${d.title}</td>
                            <td>${d.dueDate} ${d.daysLeft >= 0 && d.status !== '완료' ? `(${d.daysLeft}일)` : ''}</td>
                            <td>${d.assignee}</td>
                            <td>${urgencyBadge(d.urgency)}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>

            <div class="panel">
                <h2>등록 일정 <span class="count">${schedules.length}건</span></h2>
                <table>
                    <thead><tr><th>일정</th><th>시간</th><th>장소</th><th>유형</th></tr></thead>
                    <tbody>
                        ${schedules.map(s => `<tr>
                            <td>${s.title}</td>
                            <td>${s.time}</td>
                            <td>${s.location || '-'}</td>
                            <td>${s.recurring ? `반복(${s.days.join(',')})` : s.date}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>

            <div class="panel full-width">
                <h2>최근 알림 이력 <span class="count">${notificationLog.length}건</span></h2>
                ${notificationLog.length === 0
                    ? '<div class="empty">아직 발송된 알림이 없습니다. <code>node bot.js --check</code>로 알림을 실행하세요.</div>'
                    : notificationLog.slice(0, 20).map(l => `
                        <div class="log-item">
                            <span class="time">${new Date(l.timestamp).toLocaleString('ko-KR')}</span>
                            &nbsp;[${l.type}] <strong>${l.title}</strong> - ${l.message}
                        </div>
                    `).join('')
                }
            </div>
        </div>
    </div>
</body>
</html>`;
}

// ── API 라우터 ──
function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try { resolve(JSON.parse(body)); }
            catch { resolve(querystring.parse(body)); }
        });
    });
}

async function handleRequest(req, res) {
    const parsed = url.parse(req.url, true);

    // 메인 페이지
    if (parsed.pathname === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderPage());
        return;
    }

    // API: 일정 목록
    if (parsed.pathname === '/api/schedules' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(readJSON(SCHEDULE_PATH)));
        return;
    }

    // API: 마감일 목록
    if (parsed.pathname === '/api/deadlines' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(enrichDeadlines(readJSON(DEADLINES_PATH))));
        return;
    }

    // API: 마감일 상태 변경
    if (parsed.pathname === '/api/deadlines/update' && req.method === 'POST') {
        const body = await parseBody(req);
        const deadlines = readJSON(DEADLINES_PATH);
        const idx = deadlines.findIndex(d => d.id === body.id);
        if (idx !== -1) {
            deadlines[idx].status = body.status;
            writeJSON(DEADLINES_PATH, deadlines);
            addLog('상태변경', deadlines[idx].title, `상태: ${body.status}`);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        return;
    }

    // API: 테스트 알림
    if (parsed.pathname === '/api/test-notify' && req.method === 'POST') {
        addLog('테스트', '테스트 알림', '관리 페이지에서 발송');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: '테스트 알림 발송됨' }));
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
}

// ── 서버 시작 ──
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  NIA 알림봇 관리 서버`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`API 엔드포인트:`);
    console.log(`  GET  /api/schedules       일정 목록`);
    console.log(`  GET  /api/deadlines       마감일 목록`);
    console.log(`  POST /api/deadlines/update 상태 변경`);
    console.log(`  POST /api/test-notify     테스트 알림\n`);
});
