// ============================================
// HUMAN OR AI? — Leaderboard
// ============================================

let currentTab = 'game1';
let refreshTimer = null;

function init() {
  loadLeaderboard();
  startAutoRefresh();
  highlightCurrentPlayer();
}

function switchTab(tab, btnEl) {
  currentTab = tab;
  document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
  loadLeaderboard();
}

function loadLeaderboard() {
  let entries = getLeaderboard();

  if (currentTab !== 'all') {
    entries = entries.filter(e => e.game === currentTab);
  }

  entries.sort((a, b) => b.score - a.score);
  const top20 = entries.slice(0, 20);

  renderPodium(top20.slice(0, 3));
  renderTable(top20);
}

function renderPodium(top) {
  const area = document.getElementById('podiumArea');
  if (!top || top.length === 0) {
    area.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No scores yet. Be the first to play!</p>';
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  const order = [1, 0, 2]; // visual order: 2nd, 1st, 3rd

  const players = order.map(i => top[i]).filter(Boolean);

  area.innerHTML = players.map((p, vi) => {
    const actualRank = top.indexOf(p) + 1;
    const rankClass = `podium-${actualRank}`;
    return `
      <div class="podium-player ${rankClass}" style="${actualRank === 1 ? 'transform: scale(1.08);' : ''}">
        <div class="podium-rank">${medals[actualRank - 1]}</div>
        <div class="podium-name">${escapeHtml(p.playerName)}</div>
        <div class="podium-score">${p.score}</div>
        <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">${gameTag(p.game)}</div>
      </div>
    `;
  }).join('');
}

function renderTable(entries) {
  const tbody = document.getElementById('leaderboardBody');
  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="lb-loading">No scores yet. Start playing!</td></tr>';
    return;
  }

  const currentPlayerId = localStorage.getItem('playerId');

  tbody.innerHTML = entries.map((e, i) => {
    const rank = i + 1;
    const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
    const isMe = e.playerId === currentPlayerId;
    return `
      <tr class="${isMe ? 'my-row' : ''}">
        <td><span class="rank-badge ${rankClass}">${rank}</span></td>
        <td>${escapeHtml(e.playerName)}${isMe ? ' <span style="color:var(--accent);font-size:0.75rem;">(you)</span>' : ''}</td>
        <td>${gameTag(e.game)}</td>
        <td class="score-cell">${e.score}</td>
        <td class="time-cell">${formatTime(e.timestamp)}</td>
      </tr>
    `;
  }).join('');
}

function highlightCurrentPlayer() {
  const playerId = localStorage.getItem('playerId');
  const playerName = localStorage.getItem('playerName');
  if (!playerId || !playerName) return;

  const lb = getLeaderboard();
  const sorted = [...lb].sort((a, b) => b.score - a.score);
  const idx = sorted.findIndex(e => e.playerId === playerId);

  if (idx !== -1) {
    const banner = document.getElementById('currentPlayerBanner');
    banner.style.display = 'block';
    document.getElementById('currentPlayerText').textContent =
      `${playerName} — Rank #${idx + 1} with ${sorted[idx].score} points`;
  }
}

function gameTag(game) {
  if (game === 'game1') return `<span class="game-tag game-tag-1">🖼️ Image</span>`;
  if (game === 'game2') return `<span class="game-tag game-tag-2">💬 Chat</span>`;
  return `<span class="game-tag">—</span>`;
}

function startAutoRefresh() {
  refreshTimer = setInterval(() => {
    loadLeaderboard();
  }, 5000);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
