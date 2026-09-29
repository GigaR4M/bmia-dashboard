import { NextResponse } from 'next/server';
import { chromium as playwright } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { supabaseAdmin } from '@/lib/supabase';

// Define tempo máximo estendido para a função Serverless da Vercel (evita timeout em renderizações complexas)
export const maxDuration = 30;

// Estilos globais de fontes e reset
const GLOBAL_FONT_STYLES = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800;900&family=Rajdhani:wght@500;600;700;800&family=Inter:wght@400;600;700&display=swap');

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        user-select: none;
    }

    body {
        font-family: 'Rajdhani', sans-serif;
        background: #06080d;
        color: #ffffff;
        overflow: hidden;
    }
</style>
`;

/**
 * 1. Template: PÓDIO MENSAL DE ATIVIDADE (1300x850)
 */
function buildPodiumHtml(data: any): string {
    const guildName = data.guild_name || 'BMIA Esports Community';
    const periodText = data.period_text || 'PÓDIO OFICIAL DE INTERAÇÃO';
    const top3 = data.top_3_data || [];
    const others = data.others_data || [];
    const guildIconUri = data.guild_icon_uri || null;

    const slotConfigs = [
        { rank: 2, color: '#00f0ff', border: 'rgba(0, 240, 255, 0.5)', pedestalH: '130px', badge: '2º LUGAR', crown: '🥈', avatarSize: '95px' },
        { rank: 1, color: '#ffd700', border: 'rgba(255, 215, 0, 0.6)', pedestalH: '170px', badge: '1º LUGAR', crown: '👑', avatarSize: '115px' },
        { rank: 3, color: '#b026ff', border: 'rgba(176, 38, 255, 0.5)', pedestalH: '100px', badge: '3º LUGAR', crown: '🥉', avatarSize: '85px' }
    ];

    let podiumColumnsHtml = '';
    for (const cfg of slotConfigs) {
        const user = top3.find((u: any) => u.rank === cfg.rank) || (top3[cfg.rank === 1 ? 0 : (cfg.rank === 2 ? 1 : 2)]);
        const order = cfg.rank === 2 ? 1 : (cfg.rank === 1 ? 2 : 3);

        if (user) {
            const totalXp = Number(user.total_points || user.xp || 0);
            const level = user.level || Math.max(1, Math.floor(Math.sqrt(totalXp / 100)));
            const avUri = user.avatar_uri || user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name || 'user'}`;

            podiumColumnsHtml += `
            <div class="podium-column" style="order: ${order};">
                <div class="avatar-wrapper">
                    <div class="crown-badge">${cfg.crown}</div>
                    <img class="podium-avatar" src="${avUri}" style="width: ${cfg.avatarSize}; height: ${cfg.avatarSize}; border-color: ${cfg.color}; box-shadow: 0 0 25px ${cfg.border};" alt="${user.name}" />
                </div>
                <div class="podium-user-card" style="border-top: 2px solid ${cfg.color};">
                    <div class="podium-username">${user.name}</div>
                    <div class="podium-meta">
                        <span class="level-tag" style="border-color: ${cfg.color}; color: ${cfg.color};">Nv. ${level}</span>
                        <span class="xp-val">${totalXp.toLocaleString('pt-BR')} XP</span>
                    </div>
                </div>
                <div class="pedestal" style="height: ${cfg.pedestalH}; border-color: ${cfg.border}; background: linear-gradient(180deg, ${cfg.color}22 0%, rgba(10, 16, 30, 0.8) 100%);">
                    <div class="pedestal-rank" style="color: ${cfg.color}; text-shadow: 0 0 15px ${cfg.color};">#${cfg.rank}</div>
                </div>
            </div>
            `;
        } else {
            podiumColumnsHtml += `
            <div class="podium-column empty" style="order: ${order};">
                <div class="pedestal" style="height: ${cfg.pedestalH}; border-color: rgba(255,255,255,0.1);">
                    <div class="pedestal-rank" style="color: rgba(255,255,255,0.2);">#${cfg.rank}</div>
                </div>
            </div>
            `;
        }
    }

    let othersHtml = '';
    others.slice(0, 7).forEach((u: any, idx: number) => {
        const rankNum = u.rank || idx + 4;
        const totalXp = Number(u.total_points || u.xp || 0);
        const level = u.level || Math.max(1, Math.floor(Math.sqrt(totalXp / 100)));
        const avUri = u.avatar_uri || u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name || 'user'}`;

        othersHtml += `
        <div class="list-item">
            <div class="list-rank">#${rankNum}</div>
            <img class="list-avatar" src="${avUri}" alt="${u.name}" />
            <div class="list-name">${u.name}</div>
            <div class="list-level">Nv. ${level}</div>
            <div class="list-xp">${totalXp.toLocaleString('pt-BR')} <span style="font-size: 11px; color: #94a3b8;">XP</span></div>
        </div>
        `;
    });

    const guildIconHtml = guildIconUri 
        ? `<img src="${guildIconUri}" class="guild-icon" alt="Guild Icon" />` 
        : `<div class="guild-icon placeholder">⚔️</div>`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    ${GLOBAL_FONT_STYLES}
    <style>
        body {
            width: 1300px;
            height: 850px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #06080d;
        }
        .card-container {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #070a14 0%, #0d1527 50%, #080c18 100%);
            border: 1.5px solid rgba(0, 240, 255, 0.35);
            padding: 28px 36px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            position: relative;
            box-shadow: inset 0 0 50px rgba(0, 240, 255, 0.05);
        }
        .card-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 15%;
            right: 15%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #00f0ff, #ffd700, #b026ff, transparent);
            box-shadow: 0 0 20px #00f0ff;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .guild-info {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .guild-icon {
            width: 52px;
            height: 52px;
            border-radius: 12px;
            object-fit: cover;
            border: 1.5px solid #00f0ff;
            box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
        }
        .guild-icon.placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            background: rgba(0, 240, 255, 0.1);
        }
        .title-area h1 {
            font-family: 'Orbitron', sans-serif;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #ffffff;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }
        .title-area p {
            font-size: 14px;
            color: #00f0ff;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .badge-period {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.4);
            border-radius: 8px;
            padding: 8px 16px;
            font-family: 'Orbitron', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: #00f0ff;
            letter-spacing: 1px;
            box-shadow: 0 0 15px rgba(0, 240, 255, 0.15);
        }
        .content-layout {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 30px;
            flex: 1;
            min-height: 0;
        }
        .podium-stage {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 16px;
            padding: 20px 10px 0;
            background: rgba(10, 16, 30, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            backdrop-filter: blur(10px);
        }
        .podium-column {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            max-width: 170px;
        }
        .avatar-wrapper {
            position: relative;
            display: flex;
            justify-content: center;
        }
        .crown-badge {
            position: absolute;
            top: -18px;
            font-size: 24px;
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
        }
        .podium-avatar {
            border-radius: 50%;
            border-width: 3px;
            border-style: solid;
            object-fit: cover;
        }
        .podium-user-card {
            width: 100%;
            background: rgba(15, 23, 42, 0.9);
            border-radius: 8px 8px 0 0;
            padding: 8px 6px;
            text-align: center;
        }
        .podium-username {
            font-family: 'Rajdhani', sans-serif;
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .podium-meta {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: 4px;
        }
        .level-tag {
            font-family: 'Orbitron', sans-serif;
            font-size: 10px;
            font-weight: 700;
            border: 1px solid;
            border-radius: 4px;
            padding: 1px 4px;
        }
        .xp-val {
            font-size: 13px;
            font-weight: 700;
            color: #ffd700;
        }
        .pedestal {
            width: 100%;
            border-top: 2px solid;
            border-left: 1px solid;
            border-right: 1px solid;
            border-radius: 6px 6px 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .pedestal-rank {
            font-family: 'Orbitron', sans-serif;
            font-size: 38px;
            font-weight: 900;
        }
        .list-panel {
            background: rgba(10, 16, 30, 0.5);
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: 16px;
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            backdrop-filter: blur(10px);
        }
        .list-header {
            font-family: 'Orbitron', sans-serif;
            font-size: 14px;
            font-weight: 700;
            color: #00f0ff;
            letter-spacing: 1px;
            padding-bottom: 6px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            margin-bottom: 4px;
        }
        .list-item {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 8px;
            padding: 6px 12px;
        }
        .list-rank {
            font-family: 'Orbitron', sans-serif;
            font-size: 13px;
            font-weight: 800;
            color: #00f0ff;
            width: 28px;
        }
        .list-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1.5px solid rgba(0, 240, 255, 0.4);
            object-fit: cover;
        }
        .list-name {
            flex: 1;
            font-size: 15px;
            font-weight: 700;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .list-level {
            font-family: 'Orbitron', sans-serif;
            font-size: 11px;
            color: #94a3b8;
            font-weight: 600;
        }
        .list-xp {
            font-family: 'Orbitron', sans-serif;
            font-size: 12px;
            font-weight: 700;
            color: #ffd700;
            min-width: 75px;
            text-align: right;
        }
        .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            padding-top: 10px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
    </style>
</head>
<body>
    <div class="card-container">
        <div class="header">
            <div class="guild-info">
                ${guildIconHtml}
                <div class="title-area">
                    <h1>${guildName}</h1>
                    <p>HALL DA FAMA & RANKING DE ATIVIDADE</p>
                </div>
            </div>
            <div class="badge-period">${periodText}</div>
        </div>

        <div class="content-layout">
            <div class="podium-stage">
                ${podiumColumnsHtml}
            </div>

            <div class="list-panel">
                <div class="list-header">TOP 4 - 10 MENÇÕES HONROSAS</div>
                ${othersHtml}
            </div>
        </div>

        <div class="footer">
            <span>⚡ Gerado automaticamente pelo sistema BMIA Esports</span>
            <span style="color: #00f0ff;">BDP COMMUNITY • 2026</span>
        </div>
    </div>
</body>
</html>`;
}

/**
 * 2. Template: RETROSPECTIVA ANUAL / WRAPPED (1300x850)
 */
function buildWrappedHtml(data: any): string {
    const year = data.year || 2026;
    const catTitle = data.category_title || 'DESTAQUES DO ANO';
    const catSubtitle = data.category_subtitle || 'Apresentação Oficial';
    const catIcon = data.category_icon || '✨';
    const themeColor = data.theme_color || '#00f0ff';
    const winners = data.winners || [];
    const topWinner = winners[0] || null;

    const winnerName = topWinner ? (topWinner.name || topWinner.username || 'Campeão') : 'Sem registros';
    const winnerScore = topWinner ? (topWinner.score_formatted || `${topWinner.value || 0} pts`) : '';
    const winnerAvatar = topWinner ? (topWinner.avatar_uri || topWinner.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${winnerName}`) : '';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    ${GLOBAL_FONT_STYLES}
    <style>
        body {
            width: 1300px;
            height: 850px;
            background: #06080d;
            background-image: 
                radial-gradient(circle at 50% 15%, ${themeColor}2e 0%, transparent 55%),
                radial-gradient(circle at 10% 85%, rgba(176, 38, 255, 0.18) 0%, transparent 55%),
                radial-gradient(circle at 90% 85%, rgba(255, 215, 0, 0.15) 0%, transparent 55%),
                radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.95) 0%, #06080d 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 50px;
            position: relative;
        }
        .top-glow {
            position: absolute;
            top: 0; left: 0; right: 0; height: 4px;
            background: linear-gradient(90deg, ${themeColor}, #b026ff, #ffd700, ${themeColor});
            box-shadow: 0 0 25px ${themeColor};
        }
        .badge-year {
            background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(176,38,255,0.2));
            border: 1px solid rgba(255,215,0,0.6);
            border-radius: 999px;
            padding: 8px 24px;
            font-family: 'Orbitron', sans-serif;
            font-size: 15px;
            font-weight: 800;
            color: #ffd700;
            letter-spacing: 4px;
            margin-bottom: 20px;
            box-shadow: 0 0 20px rgba(255,215,0,0.3);
        }
        .title {
            font-family: 'Orbitron', sans-serif;
            font-size: 42px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: 2px;
            text-shadow: 0 0 25px rgba(255,255,255,0.3);
            text-align: center;
        }
        .subtitle {
            font-size: 20px;
            color: #94a3b8;
            margin-top: 6px;
            font-weight: 600;
            letter-spacing: 1px;
            text-align: center;
        }
        .card-main {
            margin-top: 35px;
            width: 750px;
            background: rgba(15, 23, 42, 0.85);
            border: 2px solid ${themeColor};
            border-radius: 24px;
            padding: 35px;
            display: flex;
            flex-direction: column;
            align-items: center;
            backdrop-filter: blur(16px);
            box-shadow: 0 0 45px ${themeColor}44;
        }
        .winner-avatar {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            border: 4px solid ${themeColor};
            box-shadow: 0 0 30px ${themeColor}88;
            object-fit: cover;
            margin-bottom: 18px;
        }
        .winner-name {
            font-family: 'Orbitron', sans-serif;
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 8px;
        }
        .score-pill {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid ${themeColor};
            border-radius: 12px;
            padding: 8px 24px;
            font-family: 'Orbitron', sans-serif;
            font-size: 20px;
            font-weight: 700;
            color: ${themeColor};
            margin-top: 6px;
        }
        .footer {
            position: absolute;
            bottom: 25px;
            left: 50px;
            right: 50px;
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #64748b;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="top-glow"></div>
    <div class="badge-year">★ RETROSPECTIVA BMIA • ${year} ★</div>
    <h1 class="title">${catIcon} ${catTitle.toUpperCase()}</h1>
    <p class="subtitle">${catSubtitle}</p>

    <div class="card-main">
        <div style="font-family: 'Orbitron', sans-serif; font-size: 16px; color: #ffd700; font-weight: 800; margin-bottom: 12px;">👑 1º LUGAR OFICIAL</div>
        <img class="winner-avatar" src="${winnerAvatar}" alt="${winnerName}" />
        <div class="winner-name">${winnerName}</div>
        <div class="score-pill">${winnerScore}</div>
    </div>

    <div class="footer">
        <span>⚡ BMIA Community Retrospective Awards</span>
        <span style="color: ${themeColor};">ANO DE ${year}</span>
    </div>
</body>
</html>`;
}

/**
 * 3. Template: ARTE FINAL DE ENCERRAMENTO DO TORNEIO (1920x1080)
 */
function buildTournamentFinalHtml(data: any): string {
    const tName = data.name || 'COPA CYBERPUNK BMIA 2026';
    const gameName = data.game_name || 'Valorant';
    const prize = data.prize || 'R$ 1.000,00 + Troféu';
    const winnerName = data.winner_name || 'Grande Campeão';
    const winnerAvatar = data.winner_avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${winnerName}`;
    const format = data.format || '1v1 Mata-mata';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    ${GLOBAL_FONT_STYLES}
    <style>
        body {
            width: 1920px;
            height: 1080px;
            background: #06080d;
            background-image: 
                radial-gradient(circle at 50% 10%, rgba(255, 215, 0, 0.25) 0%, transparent 60%),
                radial-gradient(circle at 20% 90%, rgba(0, 240, 255, 0.18) 0%, transparent 50%),
                radial-gradient(circle at 80% 90%, rgba(176, 38, 255, 0.18) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.95) 0%, #06080d 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
            position: relative;
        }
        .top-glow {
            position: absolute;
            top: 0; left: 0; right: 0; height: 6px;
            background: linear-gradient(90deg, #ffd700, #00f0ff, #b026ff, #ffd700);
            box-shadow: 0 0 35px rgba(255, 215, 0, 0.9);
        }
        .badge-status {
            background: rgba(255, 215, 0, 0.15);
            border: 2px solid #ffd700;
            border-radius: 999px;
            padding: 10px 32px;
            font-family: 'Orbitron', sans-serif;
            font-size: 18px;
            font-weight: 900;
            color: #ffd700;
            letter-spacing: 4px;
            margin-bottom: 24px;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
        }
        .tourney-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 58px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: 3px;
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
            text-align: center;
        }
        .tourney-meta {
            font-size: 24px;
            color: #00f0ff;
            font-weight: 700;
            margin-top: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .champion-podium {
            margin-top: 45px;
            width: 900px;
            background: linear-gradient(135deg, rgba(30, 24, 10, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
            border: 3px solid #ffd700;
            border-radius: 32px;
            padding: 45px;
            display: flex;
            flex-direction: column;
            align-items: center;
            backdrop-filter: blur(20px);
            box-shadow: 0 0 60px rgba(255, 215, 0, 0.35);
            position: relative;
        }
        .trophy-badge {
            font-size: 64px;
            filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
            margin-bottom: 10px;
        }
        .champ-avatar {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            border: 5px solid #ffd700;
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.7);
            object-fit: cover;
            margin-bottom: 20px;
        }
        .champ-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 20px;
            color: #ffd700;
            font-weight: 800;
            letter-spacing: 3px;
        }
        .champ-name {
            font-family: 'Orbitron', sans-serif;
            font-size: 48px;
            font-weight: 900;
            color: #ffffff;
            margin-top: 4px;
            letter-spacing: 1px;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
        }
        .prize-pill {
            background: rgba(255, 215, 0, 0.12);
            border: 1.5px solid rgba(255, 215, 0, 0.6);
            border-radius: 16px;
            padding: 12px 32px;
            font-family: 'Orbitron', sans-serif;
            font-size: 24px;
            font-weight: 800;
            color: #ffd700;
            margin-top: 20px;
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.2);
        }
        .footer {
            position: absolute;
            bottom: 35px;
            left: 70px;
            right: 70px;
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            color: #64748b;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="top-glow"></div>
    <div class="badge-status">🏆 TORNEIO OFICIAL CONCLUÍDO 🏆</div>
    <h1 class="tourney-title">${tName.toUpperCase()}</h1>
    <div class="tourney-meta">JOGO: ${gameName} • FORMATO: ${format}</div>

    <div class="champion-podium">
        <div class="trophy-badge">👑</div>
        <img class="champ-avatar" src="${winnerAvatar}" alt="${winnerName}" />
        <div class="champ-title">GRANDE CAMPEÃO INVICTO</div>
        <div class="champ-name">${winnerName}</div>
        <div class="prize-pill">PREMIAÇÃO: ${prize}</div>
    </div>

    <div class="footer">
        <span>⚡ BMIA Esports Tournament System • Arte Oficial de Encerramento</span>
        <span style="color: #00f0ff;">BDP COMMUNITY • 2026</span>
    </div>
</body>
</html>`;
}

/**
 * Endpoint Principal POST /api/render
 */
export async function POST(request: Request) {
    try {
        // Validação de Segurança: Checa Bearer Token no Header
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.replace('Bearer ', '').trim();

        const expectedSecrets = [
            process.env.INTERNAL_RENDER_SECRET,
            process.env.NEXTAUTH_SECRET,
            process.env.AUTH_SECRET
        ].filter(Boolean);

        const isAuthorized = expectedSecrets.length === 0 || expectedSecrets.some((s) => s === token);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Acesso não autorizado ao renderizador.' }, { status: 401 });
        }

        const body = await request.json();
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json({ error: 'Parâmetros "type" e "data" são obrigatórios.' }, { status: 400 });
        }

        let viewport = { width: 1300, height: 850 };
        let htmlContent = '';

        if (type === 'podium') {
            htmlContent = buildPodiumHtml(data);
        } else if (type === 'wrapped' || type === 'highlights') {
            htmlContent = buildWrappedHtml(data);
        } else if (type === 'tournament') {
            viewport = { width: 1920, height: 1080 };
            htmlContent = buildTournamentFinalHtml(data);
        } else {
            return NextResponse.json({ error: `Tipo de renderização "${type}" não suportado.` }, { status: 400 });
        }

        // Configuração de Execução do Chromium Serverless
        const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
        let executablePath: string | undefined;

        if (!isLocal) {
            executablePath = await chromium.executablePath();
        }

        const browser = await playwright.launch({
            args: isLocal ? [] : chromium.args,
            executablePath: executablePath,
            headless: true,
        });

        const context = await browser.newContext({ viewport });
        const page = await context.newPage();

        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
        const screenshotBuffer = await page.screenshot({ type: 'png', omitBackground: true });
        await browser.close();

        // Se for torneio e tiver ID, salva automaticamente no Supabase Storage
        if (type === 'tournament' && data.tournament_id && supabaseAdmin) {
            try {
                const tournamentId = data.tournament_id;
                const fileName = `final_bracket_${tournamentId}.png`;

                const { error: storageError } = await supabaseAdmin.storage
                    .from('esports')
                    .upload(`tournaments/${fileName}`, screenshotBuffer, {
                        contentType: 'image/png',
                        upsert: true
                    });

                if (!storageError) {
                    const { data: { publicUrl } } = supabaseAdmin.storage
                        .from('esports')
                        .getPublicUrl(`tournaments/${fileName}`);

                    await supabaseAdmin
                        .from('tournaments')
                        .update({ final_bracket_url: publicUrl, status: 'completed' })
                        .eq('id', tournamentId);
                }
            } catch (storageErr) {
                console.warn('Aviso: Falha ao salvar arte final no Supabase Storage:', storageErr);
            }
        }

        return new Response(new Uint8Array(screenshotBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Content-Length': screenshotBuffer.length.toString(),
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    } catch (error: any) {
        console.error('Erro no endpoint de renderização serverless:', error);
        return NextResponse.json(
            { error: 'Erro interno ao renderizar imagem.', details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
