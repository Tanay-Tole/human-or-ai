// ============================================
// HUMAN OR AI? — Admin Panel
// ============================================

const ADMIN_CREDENTIALS = { username: 'admin', password: 'CISIEEEBMSIT@2026' };
let editingQuestionId = null;
let editingChatQuestionId = null;

// ---- Auth ----
function adminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value;

  if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    sessionStorage.setItem('adminAuth', '1');
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadAll();
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('adminPass').value = '';
    setTimeout(() => { document.getElementById('loginError').style.display = 'none'; }, 3000);
  }
}

function adminLogout() {
  sessionStorage.removeItem('adminAuth');
  window.location.reload();
}

// ---- Tab Navigation ----
function showAdminTab(tab, btnEl) {
  document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).style.display = 'block';
  btnEl.classList.add('active');
}

function loadAll() {
  loadAdminLeaderboard();
  loadAdminQuestions();
  loadAdminChatQuestions();
  loadSettings();
}

// ---- Leaderboard Tab ----
function loadAdminLeaderboard() {
  const filter = document.getElementById('adminGameFilter')?.value || 'all';
  let entries = getLeaderboard();
  if (filter !== 'all') entries = entries.filter(e => e.game === filter);
  entries.sort((a, b) => b.score - a.score);

  const tbody = document.getElementById('adminLbBody');
  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="lb-loading">No entries yet.</td></tr>';
    return;
  }

  tbody.innerHTML = entries.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(e.playerName)}</td>
      <td>${e.game === 'game2' ? '💬 Chat' : '🖼️ Image'}</td>
      <td style="font-family:monospace;color:var(--accent);">${e.score}</td>
      <td style="font-size:0.8rem;color:var(--text-muted);">${formatTime(e.timestamp)}</td>
      <td>
        <button class="btn-sm btn-accent" onclick="openEditScore('${escapeAttr(e.playerId)}','${escapeAttr(e.playerName)}',${e.score})" style="margin-right:6px;">Edit</button>
        <button class="btn-sm btn-danger" onclick="deletePlayer('${escapeAttr(e.playerId)}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openEditScore(playerId, playerName, score) {
  document.getElementById('editPlayerId').value = playerId;
  document.getElementById('editPlayerName').value = playerName;
  document.getElementById('editPlayerScore').value = score;
  document.getElementById('editScoreModal').style.display = 'flex';
}

function saveEditedScore() {
  const id = document.getElementById('editPlayerId').value;
  const newScore = parseInt(document.getElementById('editPlayerScore').value);
  let lb = getLeaderboard();
  lb = lb.map(e => e.playerId === id ? { ...e, score: newScore } : e);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(lb));
  closeModal('editScoreModal');
  loadAdminLeaderboard();
}

function deletePlayer(playerId) {
  if (!confirm('Delete this player\'s score?')) return;
  let lb = getLeaderboard();
  lb = lb.filter(e => e.playerId !== playerId);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(lb));
  loadAdminLeaderboard();
}

function resetLeaderboard() {
  if (!confirm('Reset ALL leaderboard data? This cannot be undone.')) return;
  resetLeaderboardData();
  loadAdminLeaderboard();
  alert('Leaderboard reset!');
}

function exportCSV() {
  const lb = getLeaderboard().sort((a, b) => b.score - a.score);
  const rows = [['Rank','Name','Game','Score','Timestamp']];
  lb.forEach((e, i) => {
    rows.push([i + 1, e.playerName, e.game, e.score, new Date(e.timestamp).toLocaleString()]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `leaderboard_${Date.now()}.csv`;
  a.click();
}

// ---- Questions Tab ----
function loadAdminQuestions() {
  const questions = getQuestionsData();
  const tbody = document.getElementById('questionsBody');
  tbody.innerHTML = questions.map((q, i) => `
    <tr>
      <td style="color:var(--text-muted);">${i + 1}</td>
      <td>
        <span style="background:rgba(108,99,255,0.15);color:var(--primary);padding:2px 8px;border-radius:4px;font-size:0.8rem;">
          ${q.type}
        </span>
      </td>
      <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.85rem;color:var(--text-muted);">
        ${escapeHtml(q.content?.substring(0, 80))}${q.content?.length > 80 ? '...' : ''}
      </td>
      <td>
        <span style="background:${q.answer === 'ai' ? 'rgba(255,107,138,0.15)' : 'rgba(0,229,180,0.15)'};
          color:${q.answer === 'ai' ? 'var(--ai)' : 'var(--human)'};
          padding:2px 8px;border-radius:4px;font-size:0.8rem;">
          ${q.answer?.toUpperCase()}
        </span>
      </td>
      <td>
        <button class="btn-sm btn-accent" onclick="openQuestionModal('${escapeAttr(q.id)}')" style="margin-right:6px;">Edit</button>
        <button class="btn-sm btn-danger" onclick="deleteQuestion('${escapeAttr(q.id)}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openQuestionModal(qId) {
  editingQuestionId = qId || null;
  document.getElementById('questionModalTitle').textContent = qId ? 'Edit Question' : 'Add Question';

  if (qId) {
    const q = getQuestionsData().find(q => q.id === qId);
    if (q) {
      document.getElementById('qType').value = q.type;
      document.getElementById('qContent').value = q.content;
      document.getElementById('qAnswer').value = q.answer;
      document.getElementById('qExplanation').value = q.explanation || '';
    }
  } else {
    document.getElementById('qType').value = 'text';
    document.getElementById('qContent').value = '';
    document.getElementById('qAnswer').value = 'human';
    document.getElementById('qExplanation').value = '';
  }

  document.getElementById('questionModal').style.display = 'flex';
}

function saveQuestion() {
  const type = document.getElementById('qType').value;
  const content = document.getElementById('qContent').value.trim();
  const answer = document.getElementById('qAnswer').value;
  const explanation = document.getElementById('qExplanation').value.trim();

  if (!content) { alert('Content is required.'); return; }

  let questions = getQuestionsData();

  if (editingQuestionId) {
    questions = questions.map(q => q.id === editingQuestionId ? { ...q, type, content, answer, explanation } : q);
  } else {
    questions.push({ id: 'q_' + Date.now(), type, content, answer, explanation });
  }

  saveQuestionsData(questions);
  closeModal('questionModal');
  loadAdminQuestions();
}

function deleteQuestion(qId) {
  if (!confirm('Delete this question?')) return;
  let questions = getQuestionsData().filter(q => q.id !== qId);
  saveQuestionsData(questions);
  loadAdminQuestions();
}

// ---- Chat Questions Tab ----
function loadAdminChatQuestions() {
  const questions = getChatQuestionsData();
  const tbody = document.getElementById('chatQuestionsBody');
  tbody.innerHTML = questions.map((q, i) => `
    <tr>
      <td style="color:var(--text-muted);">${i + 1}</td>
      <td>${escapeHtml(q.contactName)}</td>
      <td>
        <span style="background:${q.answer === 'ai' ? 'rgba(255,107,138,0.15)' : 'rgba(0,229,180,0.15)'};
          color:${q.answer === 'ai' ? 'var(--ai)' : 'var(--human)'};
          padding:2px 8px;border-radius:4px;font-size:0.8rem;">
          ${q.answer?.toUpperCase()}
        </span>
      </td>
      <td style="color:var(--text-muted);font-size:0.82rem;">${q.messages?.length || 0} messages</td>
      <td>
        <button class="btn-sm btn-accent" onclick="openChatQuestionModal('${escapeAttr(q.id)}')" style="margin-right:6px;">Edit</button>
        <button class="btn-sm btn-danger" onclick="deleteChatQuestion('${escapeAttr(q.id)}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openChatQuestionModal(qId) {
  editingChatQuestionId = qId || null;
  document.getElementById('chatQuestionModalTitle').textContent = qId ? 'Edit Chat Scenario' : 'Add Chat Scenario';

  if (qId) {
    const q = getChatQuestionsData().find(q => q.id === qId);
    if (q) {
      document.getElementById('cqName').value = q.contactName;
      document.getElementById('cqAnswer').value = q.answer;
      document.getElementById('cqExplanation').value = q.explanation || '';
      document.getElementById('cqClues').value = (q.clues || []).join(', ');
      document.getElementById('cqMessages').value = JSON.stringify(q.messages, null, 2);
    }
  } else {
    document.getElementById('cqName').value = '';
    document.getElementById('cqAnswer').value = 'human';
    document.getElementById('cqExplanation').value = '';
    document.getElementById('cqClues').value = '';
    document.getElementById('cqMessages').value = '';
  }

  document.getElementById('chatQuestionModal').style.display = 'flex';
}

function saveChatQuestion() {
  const contactName = document.getElementById('cqName').value.trim();
  const answer = document.getElementById('cqAnswer').value;
  const explanation = document.getElementById('cqExplanation').value.trim();
  const cluesRaw = document.getElementById('cqClues').value;
  const messagesRaw = document.getElementById('cqMessages').value.trim();

  if (!contactName) { alert('Contact name required.'); return; }

  let messages = [];
  try {
    messages = JSON.parse(messagesRaw);
  } catch(e) {
    alert('Invalid JSON for messages. Example:\n[{"sender":"them","text":"Hello!"},{"sender":"you","text":"Hi"}]');
    return;
  }

  const clues = cluesRaw.split(',').map(c => c.trim()).filter(Boolean);

  let questions = getChatQuestionsData();
  if (editingChatQuestionId) {
    questions = questions.map(q => q.id === editingChatQuestionId ? { ...q, contactName, answer, explanation, clues, messages } : q);
  } else {
    questions.push({ id: 'cq_' + Date.now(), contactName, answer, explanation, clues, messages });
  }

  saveChatQuestionsData(questions);
  closeModal('chatQuestionModal');
  loadAdminChatQuestions();
}

function deleteChatQuestion(qId) {
  if (!confirm('Delete this chat scenario?')) return;
  let questions = getChatQuestionsData().filter(q => q.id !== qId);
  saveChatQuestionsData(questions);
  loadAdminChatQuestions();
}

// ---- Settings Tab ----
function loadSettings() {
  const s = getSettings();
  document.getElementById('settingQCount').value = s.questionCount || 12;
  const toggle = document.getElementById('eventModeToggle');
  if (toggle) toggle.checked = !!s.eventMode;
  const ar = document.getElementById('autoResetToggle');
  if (ar) ar.checked = !!s.autoReset;
}

function toggleEventMode(val) {
  saveSetting('eventMode', val);
}

function resetDatabase() {
  if (!confirm('⚠️ This will delete ALL leaderboard data AND reset quiz questions to defaults. Are you absolutely sure?')) return;
  resetLeaderboardData();
  localStorage.removeItem(QUESTIONS_KEY);
  localStorage.removeItem(CHAT_QUESTIONS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  alert('Database reset to defaults!');
  loadAll();
}

// ---- Modals ----
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// ---- Utilities ----
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}
function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('adminAuth') === '1') {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadAll();
  }

  // Enter key on login
  document.getElementById('adminPass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') adminLogin();
  });
});
