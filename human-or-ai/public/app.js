// ============================================
// HUMAN OR AI? — Shared App Utilities
// ============================================

// ---- Settings ----
const SETTINGS_KEY = 'hoai_settings';
const LEADERBOARD_KEY = 'hoai_leaderboard';
const QUESTIONS_KEY = 'hoai_questions';
const CHAT_QUESTIONS_KEY = 'hoai_chat_questions';

function getSettings() {
  const d = localStorage.getItem(SETTINGS_KEY);
  return d ? JSON.parse(d) : {
    questionCount: 12,
    eventMode: false,
    autoReset: false
  };
}
function saveSetting(key, value) {
  const s = getSettings();
  s[key] = value;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  if (key === 'eventMode') applyEventMode(value);
}
function applyEventMode(enabled) {
  document.body.classList.toggle('event-mode', !!enabled);
  const toggle = document.getElementById('eventModeToggle');
  if (toggle) toggle.checked = !!enabled;
}

// ---- Leaderboard ----
function getLeaderboard() {
  const d = localStorage.getItem(LEADERBOARD_KEY);
  return d ? JSON.parse(d) : [];
}
function addToLeaderboard(entry) {
  const lb = getLeaderboard();
  lb.push(entry);
  lb.sort((a, b) => b.score - a.score);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(lb));
  return lb.findIndex(e => e.playerId === entry.playerId) + 1;
}
function resetLeaderboardData() {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));
}

// ---- Questions Storage ----
function getQuestionsData() {
  const d = localStorage.getItem(QUESTIONS_KEY);
  if (d) return JSON.parse(d);
  // Seed with defaults
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(DEFAULT_QUESTIONS));
  return DEFAULT_QUESTIONS;
}
function saveQuestionsData(questions) {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}
function getChatQuestionsData() {
  const d = localStorage.getItem(CHAT_QUESTIONS_KEY);
  if (d) return JSON.parse(d);
  localStorage.setItem(CHAT_QUESTIONS_KEY, JSON.stringify(DEFAULT_CHAT_QUESTIONS));
  return DEFAULT_CHAT_QUESTIONS;
}
function saveChatQuestionsData(questions) {
  localStorage.setItem(CHAT_QUESTIONS_KEY, JSON.stringify(questions));
}

// ---- Confetti ----
function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  const colors = ['#6C63FF','#00E5FF','#FFD700','#00E5B4','#FF6B8A','#fff'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const x = Math.random() * window.innerWidth;
    const drift = (Math.random() - 0.5) * 200;
    const duration = 1.5 + Math.random() * 1.5;
    piece.style.cssText = `
      left: ${x}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --x: 0px;
      --drift: ${drift}px;
      animation-duration: ${duration}s;
      animation-delay: ${Math.random() * 0.3}s;
      width: ${6 + Math.random() * 10}px;
      height: ${6 + Math.random() * 10}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      top: 0;
      transform: translate(${x}px, -20px);
    `;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), (duration + 0.5) * 1000);
  }
}

// ---- Sound Effects (Web Audio) ----
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playSound(type) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'tick') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch(e) { /* Audio not supported */ }
}

// ---- Particles (Landing Page) ----
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 20;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = 2 + Math.random() * 4;
    const x = Math.random() * 100;
    const duration = 10 + Math.random() * 20;
    const delay = Math.random() * 10;
    p.style.cssText = `
      position: fixed;
      width: ${size}px; height: ${size}px;
      left: ${x}vw; bottom: -10px;
      background: ${Math.random() > 0.5 ? '#6C63FF' : '#00E5FF'};
      border-radius: 50%;
      opacity: ${0.1 + Math.random() * 0.3};
      animation: floatUp ${duration}s ${delay}s ease-in infinite;
      z-index: 0;
      pointer-events: none;
    `;
    container.appendChild(p);
  }
  if (!document.getElementById('particleStyle')) {
    const style = document.createElement('style');
    style.id = 'particleStyle';
    style.textContent = `
      @keyframes floatUp {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.3; }
        90% { opacity: 0.1; }
        100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ---- Confirm Exit ----
function confirmExit() {
  if (confirm('Exit current game? Your progress will be lost.')) {
    window.location.href = 'index.html';
  }
}

// ---- Format timestamp ----
function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---- Init event mode ----
document.addEventListener('DOMContentLoaded', () => {
  const s = getSettings();
  if (s.eventMode) applyEventMode(true);
});

// ============================================
// DEFAULT QUIZ QUESTIONS (Game 1)
// ============================================
const DEFAULT_QUESTIONS = [
  // --- AI Images ---
  {
    id: 'q1', type: 'image',
    content: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/DALL%C2%B7E_2023-11-02_10.17.21_-_oil_painting_of_a_woman_reading_a_book_in_a_café_in_Paris.png/800px-DALL%C2%B7E_2023-11-02_10.17.21_-_oil_painting_of_a_woman_reading_a_book_in_a_café_in_Paris.png',
    answer: 'ai',
    explanation: 'This image was generated by DALL-E 3, an AI image model. Note the slightly dreamlike quality and perfect composition that feels a bit too polished.'
  },
  {
    id: 'q2', type: 'image',
    content: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80',
    answer: 'human',
    explanation: 'A real photograph taken by a human photographer. The natural lighting, grain, and authentic emotion are hallmarks of real photography.'
  },
  {
    id: 'q3', type: 'image',
    content: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
    answer: 'human',
    explanation: 'A stunning real landscape photo. The natural imperfections in lighting and composition confirm it was captured by a human photographer.'
  },
  {
    id: 'q4', type: 'image',
    content: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    answer: 'human',
    explanation: 'A real night sky photograph. The authentic star patterns and natural noise in this image confirm it was taken with a real camera.'
  },
  {
    id: 'q5', type: 'image',
    content: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80',
    answer: 'human',
    explanation: 'A real portrait photograph with authentic skin texture, lighting, and the subtle imperfections that AI struggles to replicate naturally.'
  },
  {
    id: 'q6', type: 'image',
    content: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=600&q=80',
    answer: 'human',
    explanation: 'A genuine lifestyle photograph. Real photos often have natural composition choices and authentic moments that AI tends to idealize.'
  },
  // --- Text Questions ---
  {
    id: 'q7', type: 'text',
    content: 'I spent 20 minutes looking for my phone while it was in my hand the whole time.',
    answer: 'human',
    explanation: 'This reads like a genuine human anecdote — relatable, self-deprecating, and specific. AI tends to write more formally and avoids embarrassing self-revelations.'
  },
  {
    id: 'q8', type: 'text',
    content: 'Artificial intelligence continues to transform the landscape of modern innovation, enabling unprecedented capabilities across diverse domains.',
    answer: 'ai',
    explanation: 'Classic AI-generated corporate-speak. The formal, sweeping language with no personal perspective is a telltale sign of generated text.'
  },
  {
    id: 'q9', type: 'text',
    content: 'I reheated my coffee three times before finally just drinking it cold and accepting defeat.',
    answer: 'human',
    explanation: 'Specific, relatable, and self-deprecating with a natural narrative arc. Humans write about mundane struggles; AI tends toward the abstract and polished.'
  },
  {
    id: 'q10', type: 'text',
    content: 'Machine learning models improve performance through iterative training on large datasets, optimizing loss functions via gradient descent algorithms.',
    answer: 'ai',
    explanation: 'The clinical precision and structured technical language is characteristic of AI output. Notice there\'s no human voice or personal angle — just pure explanation.'
  },
  {
    id: 'q11', type: 'text',
    content: 'I opened the fridge five times hoping different food would appear. It didn\'t. I ate cereal at 11pm.',
    answer: 'human',
    explanation: 'The specific detail (five times), the hopeful delusion, and the defeated resolution are authentically human. AI wouldn\'t frame a "story" this way.'
  },
  {
    id: 'q12', type: 'text',
    content: 'Technological progress often emerges from the convergence of data, computation, and human creativity, fostering innovation at the intersection of disciplines.',
    answer: 'ai',
    explanation: 'Buzzword-heavy, vague, and lacking any real insight or personal angle. This is a hallmark of AI-generated marketing and editorial content.'
  },
  {
    id: 'q13', type: 'text',
    content: 'Just burned my tongue on tea I made an hour ago. Brain fully offline today.',
    answer: 'human',
    explanation: 'Casual, self-aware humor with a specific mishap. The informal syntax and relatable exaggeration are distinctly human writing patterns.'
  },
  {
    id: 'q14', type: 'text',
    content: 'The implementation of robust cybersecurity protocols is essential for safeguarding digital infrastructure against evolving threat vectors.',
    answer: 'ai',
    explanation: 'The formal structure, passive voice, and use of industry jargon without context or personality strongly suggest AI authorship.'
  },
  {
    id: 'q15', type: 'text',
    content: 'My dog just barked at his own reflection for 10 minutes. We are not the same. Or maybe we are.',
    answer: 'human',
    explanation: 'The comedic timing, self-reflection, and narrative twist are genuine human humour patterns. AI doesn\'t typically write in this existential-comic style unprompted.'
  },
];

// ============================================
// DEFAULT CHAT QUESTIONS (Game 2)
// ============================================
const DEFAULT_CHAT_QUESTIONS = [
  {
    id: 'cq1',
    contactName: 'Alex',
    answer: 'ai',
    explanation: 'This was an AI chatbot. The responses are perfectly structured, comprehensive, and contain no hesitation or personality.',
    clues: ['Every response is perfectly formatted', 'No typos or casual abbreviations', 'Answers are suspiciously comprehensive', 'Never says "I don\'t know"'],
    messages: [
      { sender: 'you', text: 'Hey, can you recommend a good book?' },
      { sender: 'them', text: 'I would be happy to recommend a book for you! There are several excellent options depending on your interests. For fiction, consider "The Midnight Library" by Matt Haig — a thought-provoking story about second chances. For non-fiction, "Atomic Habits" by James Clear provides actionable insights on building productive habits. Could you share your preferred genres so I can provide more personalized recommendations?' },
      { sender: 'you', text: 'I like mystery novels' },
      { sender: 'them', text: 'Excellent choice! For mystery novels, I recommend the following highly-regarded titles: "Gone Girl" by Gillian Flynn for psychological suspense, "The Girl with the Dragon Tattoo" by Stieg Larsson for complex investigative plots, and "In the Woods" by Tana French for atmospheric Nordic noir. Each offers a distinct approach to the mystery genre. Which of these appeals to you most?' },
    ]
  },
  {
    id: 'cq2',
    contactName: 'Jamie',
    answer: 'human',
    explanation: 'This was a real human. Notice the casual language, typos, personal opinions without justification, and natural conversation flow.',
    clues: ['Uses casual abbreviations', 'Makes typos and doesn\'t correct them', 'Gives opinions without explaining why', 'Conversation feels natural and unpredictable'],
    messages: [
      { sender: 'you', text: 'Hey, can you recommend a good book?' },
      { sender: 'them', text: 'omg yes!! have you read anything by Brandon Sanderson? he writes these massive fantasy epics and they\'re so good' },
      { sender: 'you', text: 'I\'m more into mysteries honestly' },
      { sender: 'them', text: 'ohhh ok ok um... have u tried Agatha Christie? kinda old school but my grandma got me into it lol. Or if u want something newer The Thursday Murder Club is hilarious' },
      { sender: 'you', text: 'Is that good?' },
      { sender: 'them', text: 'yeah its like cozy mystery vibes, old retired spies trying to solve murders in a retirement village?? sounds weird but its genuinely so fun' },
    ]
  },
  {
    id: 'cq3',
    contactName: 'Support Bot',
    answer: 'ai',
    explanation: 'An AI customer support bot. The pattern of acknowledging, then providing structured solutions, then asking for confirmation is a classic chatbot pattern.',
    clues: ['Always acknowledges before answering', 'Very formal and apologetic language', 'Offers exactly 3 options every time', 'Ends every message with a question'],
    messages: [
      { sender: 'you', text: 'My order hasn\'t arrived yet' },
      { sender: 'them', text: 'I sincerely apologize for the inconvenience you\'re experiencing with your order. I completely understand how frustrating delayed deliveries can be. To assist you most effectively, could you please provide your order number?' },
      { sender: 'you', text: 'It\'s #98234' },
      { sender: 'them', text: 'Thank you for providing that information. I can see order #98234 was dispatched on the 3rd and is currently in transit. There are three possible resolutions I can offer: 1) Wait 2 additional business days, 2) File a trace request, or 3) Issue a full refund. Which option would you prefer?' },
      { sender: 'you', text: 'Just tell me where it is' },
      { sender: 'them', text: 'Of course! Your package is currently at a sorting facility in your region. Based on current transit times, estimated delivery is within 1-2 business days. Would you like me to send you real-time tracking updates via email?' },
    ]
  },
  {
    id: 'cq4',
    contactName: 'Sam',
    answer: 'human',
    explanation: 'Definitely human! The fragmented messages, emotional venting, tangents, and very personal tone are unmistakably real.',
    clues: ['Sends multiple short messages in a row', 'Goes off-topic naturally', 'Shares personal frustrations without prompting', 'Inconsistent capitalization and punctuation'],
    messages: [
      { sender: 'you', text: 'How was your weekend?' },
      { sender: 'them', text: 'ugh' },
      { sender: 'them', text: 'terrible honestly' },
      { sender: 'them', text: 'my flatmate decided to have people over without telling me and i had to pretend to be fine about it for like 6 hours' },
      { sender: 'you', text: 'oh no' },
      { sender: 'them', text: 'yeah and then my cat knocked my coffee off the table RIGHT as I finally sat down to watch something' },
      { sender: 'them', text: 'how was yours' },
    ]
  },
  {
    id: 'cq5',
    contactName: 'Aria',
    answer: 'ai',
    explanation: 'An AI assistant with a persona. Despite the friendly name and tone, the linguistic patterns — perfectly balanced sentences, comprehensive coverage, no genuine emotion — reveal it\'s AI.',
    clues: ['Perfectly balanced sentence lengths', 'Always covers multiple angles', 'No genuine emotional variance', 'Subtly redirects to being helpful'],
    messages: [
      { sender: 'you', text: 'I\'m feeling really stressed today' },
      { sender: 'them', text: 'I\'m really sorry to hear that — stress can feel so overwhelming. It\'s completely valid to feel that way. Sometimes it helps to identify what\'s causing the stress. Would you like to talk about what\'s going on, or would you prefer some quick techniques to help you feel calmer right now?' },
      { sender: 'you', text: 'I just have too much work' },
      { sender: 'them', text: 'Having too much on your plate is genuinely exhausting. A few things that often help: breaking big tasks into smaller steps, using time-blocking to stay focused, and making sure to schedule short breaks. Would you like help prioritizing your tasks, or is there something specific you\'re worried about completing?' },
    ]
  },
  {
    id: 'cq6',
    contactName: 'Morgan',
    answer: 'human',
    explanation: 'Real human through and through. The incomplete thoughts, genuine uncertainty, and asking you questions out of actual curiosity rather than helpfulness are telltale signs.',
    clues: ['Expresses genuine uncertainty', 'Incomplete thoughts mid-message', 'Asks questions out of curiosity not helpfulness', 'Uses personal experiences as reference points'],
    messages: [
      { sender: 'you', text: 'Do you know anything about learning guitar?' },
      { sender: 'them', text: 'a little? i tried for like 3 months last year' },
      { sender: 'them', text: 'got to the point where i could play wonderwall which feels like a rite of passage lol' },
      { sender: 'you', text: 'Any tips for a beginner?' },
      { sender: 'them', text: 'honestly the calluses are the hardest part at first. your fingers just hurt. theres no way around it' },
      { sender: 'them', text: 'also i spent way too long on chords and not enough on actual songs, like... practice songs you actually want to play otherwise you\'ll quit' },
      { sender: 'them', text: 'what kind of music are you into?' },
    ]
  },
  {
    id: 'cq7',
    contactName: 'Helper',
    answer: 'ai',
    explanation: 'An AI with an attempt at casual style, but the underlying patterns still give it away. No true unpredictability, perfectly appropriate responses every time.',
    clues: ['Casual tone but suspiciously perfect grammar', 'Never makes a wrong assumption', 'Always stays on topic', 'Responses scale perfectly with question complexity'],
    messages: [
      { sender: 'you', text: 'what should i cook for dinner' },
      { sender: 'them', text: 'Ooh good question! What have you got in the fridge? 😊' },
      { sender: 'you', text: 'pasta, eggs, some cheese' },
      { sender: 'them', text: 'Perfect for cacio e pepe or carbonara! Both are quick and super satisfying. Carbonara uses eggs + cheese + pasta water — no cream needed. Cacio e pepe is even simpler: just cheese, pepper, and pasta water. Want steps for either one?' },
      { sender: 'you', text: 'carbonara sounds good' },
      { sender: 'them', text: 'Nice choice! The key is not scrambling the eggs — take the pan off the heat before mixing them in, then use pasta water to loosen the sauce. The starch in the water helps everything emulsify. Want the full recipe?' },
    ]
  },
  {
    id: 'cq8',
    contactName: 'Taylor',
    answer: 'human',
    explanation: 'A real person with a distinct, slightly scatterbrained personality. The oversharing, the tangents, and the very specific personal details are authentically human.',
    clues: ['Overshares personal details', 'Goes on tangents', 'Uses very specific personal references', 'Forgets what the original question was'],
    messages: [
      { sender: 'you', text: 'Do you know a good recipe for banana bread?' },
      { sender: 'them', text: 'yes!! ok so my aunt makes the BEST one but she refuses to share the actual recipe' },
      { sender: 'them', text: 'i tried recreating it for like 2 years and finally got something close' },
      { sender: 'them', text: 'the key is brown butter. like you toast the butter first until its nutty and then let it cool' },
      { sender: 'you', text: 'Oh interesting' },
      { sender: 'them', text: 'also wait are your bananas very ripe? because if they\'re not fully black i usually put them in the oven for like 15 mins to caramelise them' },
      { sender: 'them', text: 'anyway do you want the full thing or just tips' },
    ]
  },
  {
    id: 'cq9',
    contactName: 'Eva',
    answer: 'ai',
    explanation: 'A sophisticated AI using emotion simulation. Despite the empathetic language, every response is too balanced, too measured, and never goes off-script.',
    clues: ['Perfectly validates emotions each time', 'Never expresses its own opinion strongly', 'Always offers choices rather than direct answers', 'Zero variance in response quality or tone'],
    messages: [
      { sender: 'you', text: 'Should I quit my job?' },
      { sender: 'them', text: 'That\'s such a big decision — it makes sense you\'re thinking hard about it. What\'s making you feel like it might be time to leave?' },
      { sender: 'you', text: 'My boss is terrible and I\'m underpaid' },
      { sender: 'them', text: 'Those are really significant issues, and it\'s completely reasonable to want better. A useful way to think about it: have you already tried addressing the pay directly, or does the relationship with your boss feel beyond repair? Sometimes a direct conversation changes things — and sometimes it confirms it\'s time to go.' },
      { sender: 'you', text: 'I just don\'t know' },
      { sender: 'them', text: 'Sitting with uncertainty is really hard. It might help to separate the two issues — the pay and the relationship. If the pay were fixed tomorrow, would you feel differently? That can clarify whether it\'s fixable or if something deeper is off.' },
    ]
  },
  {
    id: 'cq10',
    contactName: 'Chris',
    answer: 'human',
    explanation: 'Real human with a very online, chaotic-good energy. The non sequiturs, all-caps emphasis, and very casual relationship with grammar are distinctly human.',
    clues: ['Uses all-caps for emphasis randomly', 'Non-sequitur interjections', 'Makes jokes at unexpected moments', 'Has inconsistent energy throughout'],
    messages: [
      { sender: 'you', text: 'What are you up to?' },
      { sender: 'them', text: 'watching a documentary about crows and honestly these birds are SMARTER THAN ME' },
      { sender: 'you', text: 'haha what's it about?' },
      { sender: 'them', text: 'they can recognise human faces and hold grudges for years. years!! i have wronged no crows but i am now afraid' },
      { sender: 'them', text: 'also one crow in this thing learned to use a vending machine. it just... figured it out. we need to stop underestimating birds' },
      { sender: 'you', text: 'That\'s wild' },
      { sender: 'them', text: 'i\'m changing my career to crow researcher. tell no one' },
    ]
  }
];
