// ============================================
// HUMAN OR AI? — Quiz Game (Game 1)
// ============================================

let questions = [];
let currentIndex = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let playerName = '';
let playerId = '';
let totalQuestions = 12;

function init() {
  playerName = localStorage.getItem('playerName') || 'Player';
  playerId = localStorage.getItem('playerId') || 'p_anon';
  document.getElementById('hudPlayer').textContent = playerName;

  const settings = getSettings();
  totalQuestions = Math.min(settings.questionCount || 12, 15);

  // Load and shuffle questions
  const all = getQuestionsData();
  questions = shuffle([...all]).slice(0, totalQuestions);
  document.getElementById('questionTotal').textContent = `of ${totalQuestions}`;

  renderQuestion();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderQuestion() {
  const q = questions[currentIndex];
  if (!q) return;

  // Update progress
  const num = currentIndex + 1;
  document.getElementById('questionNum').textContent = `Question ${num}`;
  document.getElementById('progressBar').style.width = `${(currentIndex / totalQuestions) * 100}%`;

  // Score HUD
  document.getElementById('hudScore').textContent = score;

  // Content
  const contentEl = document.getElementById('questionContent');
  if (q.type === 'image') {
    contentEl.innerHTML = `<img class="question-image" src="${escapeHtml(q.content)}" alt="Question image" loading="lazy" />`;
  } else {
    contentEl.innerHTML = `<div class="question-text-card">${escapeHtml(q.content)}</div>`;
  }

  // Reset buttons
  const btnH = document.getElementById('btnHuman');
  const btnAI = document.getElementById('btnAI');
  btnH.disabled = false;
  btnAI.disabled = false;
  btnH.className = 'answer-btn human-btn';
  btnAI.className = 'answer-btn ai-btn';

  // Hide feedback
  document.getElementById('feedbackOverlay').style.display = 'none';

  // Animate card
  const card = document.getElementById('quizCard');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'fadeInUp 0.35s ease';
}

function submitAnswer(answer) {
  const q = questions[currentIndex];
  const correct = answer === q.answer;
  const btnH = document.getElementById('btnHuman');
  const btnAI = document.getElementById('btnAI');

  // Disable buttons
  btnH.disabled = true;
  btnAI.disabled = true;

  // Highlight
  if (q.answer === 'human') {
    btnH.className = 'answer-btn human-btn correct-answer';
    if (answer === 'ai') btnAI.className = 'answer-btn ai-btn wrong-answer';
  } else {
    btnAI.className = 'answer-btn ai-btn correct-answer';
    if (answer === 'human') btnH.className = 'answer-btn human-btn wrong-answer';
  }

  // Sound
  playSound(correct ? 'correct' : 'wrong');

  // Score
  if (correct) {
    score += 10;
    correctCount++;
    launchConfetti();
  } else {
    wrongCount++;
  }

  // Feedback
  const overlay = document.getElementById('feedbackOverlay');
  document.getElementById('feedbackIcon').textContent = correct ? '✅' : '❌';
  document.getElementById('feedbackTitle').textContent = correct
    ? (q.answer === 'ai' ? '🤖 Correct! It\'s AI!' : '👤 Correct! It\'s Human!')
    : (q.answer === 'ai' ? '🤖 Actually… it was AI' : '👤 Actually… it was Human');
  document.getElementById('feedbackTitle').style.color = correct ? 'var(--success)' : 'var(--danger)';
  document.getElementById('feedbackExplanation').textContent = q.explanation || '';
  document.getElementById('feedbackPoints').textContent = correct ? '+10 points! 🎯' : 'No points this time';
  overlay.style.display = 'flex';

  // Countdown to next
  let count = 2;
  document.getElementById('countdown').textContent = count;
  const timer = setInterval(() => {
    count--;
    const el = document.getElementById('countdown');
    if (el) el.textContent = count;
    if (count <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= totalQuestions) {
    endGame();
  } else {
    renderQuestion();
  }
}

async function endGame() {
  // Save to leaderboard
  const entry = {
    playerName,
    playerId,
    score,
    game: 'game1',
    timestamp: Date.now()
  };
  const rank = addToLeaderboard(entry);

  // Update results screen
  document.getElementById('resultsPlayer').textContent = `${playerName}`;
  document.getElementById('finalScore').textContent = score;
  document.getElementById('statCorrect').textContent = correctCount;
  document.getElementById('statWrong').textContent = wrongCount;
  document.getElementById('statRank').textContent = `#${rank}`;
  document.getElementById('resultsEmoji').textContent = score >= 100 ? '🏆' : score >= 70 ? '🎉' : score >= 40 ? '👏' : '🤔';

  // Animate score ring
  const ring = document.getElementById('scoreRingFill');
  if (ring) {
    const pct = score / 120;
    const offset = 314 - (314 * pct);
    ring.style.stroke = `var(--accent)`;
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 300);
  }

  // Show results
  document.getElementById('resultsScreen').style.display = 'flex';
  launchConfetti();

  // Auto reset if event mode
  const s = getSettings();
  if (s.autoReset) {
    setTimeout(() => { window.location.href = 'index.html'; }, 8000);
  }
}

function replayGame() {
  window.location.reload();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// Start on load
document.addEventListener('DOMContentLoaded', init);
