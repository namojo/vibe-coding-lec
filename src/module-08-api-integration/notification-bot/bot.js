#!/usr/bin/env node

/**
 * 알림봇 (Notification Bot)
 * Slack/Teams Webhook을 통해 일정 및 마감일 알림을 자동 발송합니다.
 *
 * 사용법:
 *   node bot.js                    대시보드 + 알림 실행
 *   node bot.js --check            마감일 즉시 확인
 *   node bot.js --send-test        테스트 알림 발송
 *   node bot.js --list-schedules   등록된 일정 목록
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ── 환경변수 로드 (.env 간이 파서) ──
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > 0) {
                const key = trimmed.substring(0, eqIdx).trim();
                const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
                process.env[key] = val;
            }
        }
    }
}
loadEnv();

const CONFIG = {
    slackWebhook: process.env.SLACK_WEBHOOK_URL || '',
    teamsWebhook: process.env.TEAMS_WEBHOOK_URL || '',
    checkInterval: parseInt(process.env.CHECK_INTERVAL_MS) || 60000,
    alertBeforeDays: parseInt(process.env.ALERT_BEFORE_DAYS) || 3,
    botName: process.env.BOT_NAME || 'NIA 알림봇',
};

// ── 데이터 로드 ──
function loadJSON(filename) {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`파일 없음: ${filePath}`);
        return [];
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadSchedules() {
    return loadJSON('schedule.json');
}

function loadDeadlines() {
    return loadJSON('deadlines.json');
}

// ── Webhook 발송 ──
function sendWebhook(url, payload) {
    return new Promise((resolve, reject) => {
        if (!url) {
            console.log(`  [시뮬레이션] Webhook 미설정 - 메시지 출력만 수행`);
            console.log(`  제목: ${payload.title || payload.text}`);
            resolve({ simulated: true });
            return;
        }

        const parsed = new URL(url);
        const data = JSON.stringify(payload);
        const options = {
            hostname: parsed.hostname,
            port: parsed.port || 443,
            path: parsed.pathname + parsed.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        };

        const transport = parsed.protocol === 'https:' ? https : http;
        const req = transport.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function buildSlackMessage(title, text, color) {
    return {
        username: CONFIG.botName,
        icon_emoji: ':bell:',
        attachments: [{
            color: color || '#0984e3',
            title,
            text,
            ts: Math.floor(Date.now() / 1000),
        }],
    };
}

function buildTeamsMessage(title, text, color) {
    return {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: (color || '#0984e3').replace('#', ''),
        summary: title,
        sections: [{
            activityTitle: `${CONFIG.botName}: ${title}`,
            facts: [{ name: '내용', value: text }],
            markdown: true,
        }],
    };
}

async function notify(title, text, color) {
    const timestamp = new Date().toLocaleString('ko-KR');
    console.log(`\n📢 [${timestamp}] ${title}`);
    console.log(`   ${text}\n`);

    const results = [];

    if (CONFIG.slackWebhook) {
        try {
            const r = await sendWebhook(CONFIG.slackWebhook, buildSlackMessage(title, text, color));
            results.push({ channel: 'Slack', ...r });
        } catch (e) {
            results.push({ channel: 'Slack', error: e.message });
        }
    }

    if (CONFIG.teamsWebhook) {
        try {
            const r = await sendWebhook(CONFIG.teamsWebhook, buildTeamsMessage(title, text, color));
            results.push({ channel: 'Teams', ...r });
        } catch (e) {
            results.push({ channel: 'Teams', error: e.message });
        }
    }

    if (!CONFIG.slackWebhook && !CONFIG.teamsWebhook) {
        console.log('  ℹ Webhook URL이 설정되지 않아 콘솔 출력만 수행합니다.');
        console.log('  .env 파일에 SLACK_WEBHOOK_URL 또는 TEAMS_WEBHOOK_URL을 설정하세요.\n');
    }

    return results;
}

// ── 마감일 체크 ──
function checkDeadlines() {
    const deadlines = loadDeadlines();
    const now = new Date();
    const alerts = [];

    for (const item of deadlines) {
        const due = new Date(item.dueDate);
        const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0 && item.status !== '완료') {
            alerts.push({
                ...item,
                daysLeft,
                urgency: 'overdue',
                message: `⛔ [기한 초과] "${item.title}" - ${Math.abs(daysLeft)}일 경과 (담당: ${item.assignee})`,
            });
        } else if (daysLeft <= CONFIG.alertBeforeDays && daysLeft >= 0 && item.status !== '완료') {
            alerts.push({
                ...item,
                daysLeft,
                urgency: daysLeft === 0 ? 'today' : 'upcoming',
                message: daysLeft === 0
                    ? `🔴 [오늘 마감] "${item.title}" (담당: ${item.assignee})`
                    : `🟡 [${daysLeft}일 남음] "${item.title}" - 마감: ${item.dueDate} (담당: ${item.assignee})`,
            });
        }
    }

    return alerts;
}

// ── 오늘의 일정 확인 ──
function getTodaySchedules() {
    const schedules = loadSchedules();
    const today = new Date();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];
    const dateStr = today.toISOString().split('T')[0];

    return schedules.filter(s => {
        if (s.date === dateStr) return true;
        if (s.recurring && s.days && s.days.includes(dayOfWeek)) return true;
        return false;
    });
}

// ── 메인 루프 ──
async function runCheck() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  ${CONFIG.botName} - 상태 점검`);
    console.log(`  ${new Date().toLocaleString('ko-KR')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 오늘 일정
    const todaySchedules = getTodaySchedules();
    if (todaySchedules.length > 0) {
        const scheduleText = todaySchedules
            .map(s => `• ${s.time} ${s.title} (${s.location || '미정'})`)
            .join('\n');
        await notify('오늘의 일정', scheduleText, '#0984e3');
    }

    // 마감일 알림
    const alerts = checkDeadlines();
    if (alerts.length > 0) {
        const overdueAlerts = alerts.filter(a => a.urgency === 'overdue');
        const todayAlerts = alerts.filter(a => a.urgency === 'today');
        const upcomingAlerts = alerts.filter(a => a.urgency === 'upcoming');

        if (overdueAlerts.length > 0) {
            await notify(
                '기한 초과 알림',
                overdueAlerts.map(a => a.message).join('\n'),
                '#d63031'
            );
        }
        if (todayAlerts.length > 0) {
            await notify(
                '오늘 마감 알림',
                todayAlerts.map(a => a.message).join('\n'),
                '#e17055'
            );
        }
        if (upcomingAlerts.length > 0) {
            await notify(
                '마감 임박 알림',
                upcomingAlerts.map(a => a.message).join('\n'),
                '#fdcb6e'
            );
        }
    } else {
        console.log('\n✅ 긴급 마감일 없음 - 모든 일정이 정상입니다.\n');
    }
}

// ── CLI 처리 ──
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--send-test')) {
        console.log('테스트 알림 발송 중...\n');
        await notify('테스트 알림', '알림봇이 정상적으로 작동하고 있습니다.', '#00b894');
        return;
    }

    if (args.includes('--list-schedules')) {
        const schedules = loadSchedules();
        console.log('\n등록된 일정 목록:\n');
        schedules.forEach((s, i) => {
            const recurring = s.recurring ? `[반복: ${s.days.join(',')}]` : `[${s.date}]`;
            console.log(`  ${i + 1}. ${recurring} ${s.time} - ${s.title} (${s.location || ''})`);
        });
        console.log(`\n총 ${schedules.length}건\n`);
        return;
    }

    if (args.includes('--check')) {
        await runCheck();
        return;
    }

    // 기본: 즉시 1회 체크 후 주기적 실행
    console.log(`\n${CONFIG.botName} 시작`);
    console.log(`점검 주기: ${CONFIG.checkInterval / 1000}초\n`);

    await runCheck();

    setInterval(runCheck, CONFIG.checkInterval);
    console.log(`\n다음 점검까지 ${CONFIG.checkInterval / 1000}초 대기 중... (Ctrl+C로 종료)\n`);
}

main().catch(err => {
    console.error('오류 발생:', err.message);
    process.exit(1);
});
