// ============================================
// HUMAN OR AI? — Chat Detective (Game 2)
// ============================================

let chatQuestions = [];
let chatIndex = 0;
let chatScore = 0;
let chatCorrect = 0;
let chatWrong = 0;
let chatPlayerName = '';
let chatPlayerId = '';
let chatTotalQuestions = 10;
let timerInterval = null;
let timeLeft = 30;
let msgRevealIndex = 0;
let msgRevealTimer = null;

function init() {
  chatPlayerName = localStorage.getItem('playerName') || 'Player';
  chatPlayerId = localStorage.getItem('playerId') || 'p_anon';
  document.getElementById('hudPlayer').textContent = chatPlayerName;
}

function startChatGame() {
  // Load and shuffle questions
  const all = getChatQuestionsData();
  chatQuestions = shuffle([...all]).slice(0, Math.min(chatTotalQuestions, all.length));
  chatTotalQuestions = chatQuestions.length;

  document.getElementById('chatQuestionTotal').textContent = `of ${chatTotalQuestions}`;
  document.getElementById('chatIntro').style.display = 'none';
  document.getElementById('chatMain').style.display = 'block';

  renderChatQuestion();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderChatQuestion() {
  clearInterval(timerInterval);
  clearTimeout(msgRevealTimer);

  const q = chatQuestions[chatIndex];
  if (!q) return;

  // Progress
  const num = chatIndex + 1;
  document.getElementById('chatQuestionNum').textContent = `Round ${num}`;
  document.getElementById('chatProgressBar').style.width = `${(chatIndex / chatTotalQuestions) * 100}%`;
  document.getElementById('hudScore').textContent = chatScore;

  // Contact name / avatar
  document.getElementById('chatContactName').textContent = q.contactName || 'Unknown';
  document.getElementById('chatAvatar').textContent = (q.contactName || '?')[0].toUpperCase();

  // Clear messages
  const msgsEl = document.getElementById('chatMessages');
  msgsEl.innerHTML = '';

  // Clues
  const clueList = document.getElementById('clueList');
  clueList.innerHTML = '';
  if (q.clues && q.clues.length > 0) {
    q.clues.forEach(clue => {
      const li = document.createElement('li');
      li.textContent = `• ${clue}`;
      clueList.appendChild(li);
    });
  }

  // Enable buttons
  document.getElementById('chatBtnHuman').disabled = false;
  document.getElementById('chatBtnAI').disabled = false;
  document.getElementById('chatFeedbackOverlay').style.display = 'none';

  // Reveal messages one by one
  msgRevealIndex = 0;
  revealNextMessage(q);
}

function revealNextMessage(q) {
  if (msgRevealIndex >= q.messages.length) {
    // All revealed, start timer
    startTimer();
    return;
  }

  const msg = q.messages[msgRevealIndex];
  appendMessage(msg);
  msgRevealIndex++;

  const delay = msgRevealIndex === 1 ? 300 : 800 + Math.random() * 600;
  msgRevealTimer = setTimeout(() => revealNextMessage(q), delay);
}

function appendMessage(msg) {
  const msgsEl = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg-bubble msg-${msg.sender === 'you' ? 'you' : 'them'}`;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  div.innerHTML = `
    ${msg.sender !== 'you' ? '<div class="msg-label">Them</div>' : ''}
    <div>${escapeHtml(msg.text)}</div>
    <div class="msg-time">${timeStr}</div>
  `;

  msgsEl.appendChild(div);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function startTimer() {
  timeLeft = 30;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 5) {
      document.getElementById('chatTimerBadge')?.classList.add('urgent');
      playSound('tick');
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      // Auto-submit wrong if time runs out
      autoTimeOut();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timerDisplay');
  if (el) el.textContent = timeLeft;

  const fill = document.getElementById('chatTimerFill');
  if (fill) {
    const pct = (timeLeft / 30) * 100;
    fill.style.width = `${pct}%`;
    if (timeLeft <= 10) fill.classList.add('warning');
    else fill.classList.remove('warning');
  }
}

function autoTimeOut() {
  // Show timeout feedback
  showChatFeedback(null, true);
}

function submitChatAnswer(answer) {
  clearInterval(timerInterval);
  clearTimeout(msgRevealTimer);

  const q = chatQuestions[chatIndex];
  const correct = answer === q.answer;
  showChatFeedback(answer, false, correct, q);
}

function showChatFeedback(answer, timedOut, correct, q) {
  if (!q) q = chatQuestions[chatIndex];

  const overlay = document.getElementById('chatFeedbackOverlay');

  document.getElementById('chatBtnHuman').disabled = true;
  document.getElementById('chatBtnAI').disabled = true;

  if (timedOut) {
    document.getElementById('chatFeedbackIcon').textContent = '⏰';
    document.getElementById('chatFeedbackTitle').textContent = 'Time\'s Up!';
    document.getElementById('chatFeedbackTitle').style.color = 'var(--danger)';
    document.getElementById('chatFeedbackExplanation').textContent = `It was actually ${q.answer.toUpperCase()}`;
    document.getElementById('chatFeedbackPoints').textContent = 'No points';
    chatWrong++;
  } else if (correct) {
    document.getElementById('chatFeedbackIcon').textContent = '🎯';
    document.getElementById('chatFeedbackTitle').textContent = q.answer === 'ai' ? '🤖 Correct! It\'s an AI Bot!' : '👤 Correct! It\'s a Human!';
    document.getElementById('chatFeedbackTitle').style.color = 'var(--success)';
    document.getElementById('chatFeedbackPoints').textContent = '+10 points! 🎯';
    chatScore += 10;
    chatCorrect++;
    launchConfetti();
    playSound('correct');
  } else {
    document.getElementById('chatFeedbackIcon').textContent = '❌';
    document.getElementById('chatFeedbackTitle').textContent = q.answer === 'ai' ? '🤖 Nope — it was AI' : '👤 Nope — it was Human';
    document.getElementById('chatFeedbackTitle').style.color = 'var(--danger)';
    document.getElementById('chatFeedbackPoints').textContent = 'No points';
    chatWrong++;
    playSound('wrong');
  }

  document.getElementById('chatFeedbackExplanation').textContent = q.explanation || '';

  // Show telltale signs
  const telltale = document.getElementById('chatTelltale');
  if (q.clues && q.clues.length > 0) {
    telltale.innerHTML = `<strong>Telltale signs:</strong><br>` + q.clues.join(' • ');
    telltale.style.display = 'block';
  } else {
    telltale.style.display = 'none';
  }

  overlay.style.display = 'flex';

  // Countdown
  let count = 3;
  document.getElementById('chatCountdown').textContent = count;
  const timer = setInterval(() => {
    count--;
    const el = document.getElementById('chatCountdown');
    if (el) el.textContent = count;
    if (count <= 0) {
      clearInterval(timer);
      nextChatQuestion();
    }
  }, 1000);
}

function nextChatQuestion() {
  chatIndex++;
  if (chatIndex >= chatTotalQuestions) {
    endChatGame();
  } else {
    renderChatQuestion();
  }
}

function endChatGame() {
  const entry = {
    playerName: chatPlayerName,
    playerId: chatPlayerId,
    score: chatScore,
    game: 'game2',
    timestamp: Date.now()
  };
  const rank = addToLeaderboard(entry);

  document.getElementById('chatResultsPlayer').textContent = chatPlayerName;
  document.getElementById('chatFinalScore').textContent = chatScore;
  document.getElementById('chatStatCorrect').textContent = chatCorrect;
  document.getElementById('chatStatWrong').textContent = chatWrong;
  document.getElementById('chatStatRank').textContent = `#${rank}`;

  const pct = chatScore / (chatTotalQuestions * 10);
  document.getElementById('chatResultsEmoji').textContent = pct >= 0.8 ? '🕵️' : pct >= 0.5 ? '🔍' : '🤔';

  const verdicts = {
    perfect: 'Master Detective — you can\'t be fooled!',
    great: 'Sharp Eye — AI barely got past you.',
    ok: 'Getting warmer — keep practicing!',
    poor: 'AI fooled you this time — but you\'ll get better!'
  };
  const verdict = pct === 1 ? verdicts.perfect : pct >= 0.7 ? verdicts.great : pct >= 0.4 ? verdicts.ok : verdicts.poor;
  document.getElementById('resultsVerdict').textContent = verdict;

  const ring = document.getElementById('chatScoreRingFill');
  if (ring) {
    const offset = 314 - (314 * pct);
    ring.style.stroke = 'var(--accent)';
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 300);
  }

  document.getElementById('chatResultsScreen').style.display = 'flex';
  launchConfetti();

  const s = getSettings();
  if (s.autoReset) setTimeout(() => { window.location.href = 'index.html'; }, 8000);
}

function replayChatGame() {
  window.location.reload();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
