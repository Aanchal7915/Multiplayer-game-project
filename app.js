const $ = id => document.getElementById(id);
const views = ['homeView', 'roomView', 'gameView', 'resultView'];
let session = { room: null, playerId: null, playerName: null, isHost: false, seenVersion: 0, seenRound: -1, answered: false, shownQuestion: -1, soundPlayedForRound: -1 };
let pollTimer = null, toastTimer = null, requestBusy = false;

// Synthesized Sound FX Engine (Web Audio API - 100% Client-Side, No External Assets)
let soundEnabled = true;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type, duration, delay = 0, vol = 0.12) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (e) {}
}

const sfx = {
  click: () => playTone(650, 'sine', 0.06, 0, 0.08),
  join: () => { playTone(440, 'triangle', 0.12, 0); playTone(660, 'sine', 0.18, 0.09); },
  lock: () => { playTone(540, 'square', 0.08, 0, 0.07); playTone(820, 'sine', 0.14, 0.07, 0.09); },
  correct: () => {
    playTone(523.25, 'triangle', 0.12, 0);
    playTone(659.25, 'triangle', 0.14, 0.1);
    playTone(783.99, 'sine', 0.25, 0.2);
  },
  wrong: () => {
    playTone(320, 'sawtooth', 0.14, 0, 0.09);
    playTone(230, 'sawtooth', 0.22, 0.11, 0.09);
  },
  win: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      playTone(freq, 'triangle', 0.3, idx * 0.12, 0.15);
    });
  }
};

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = $('soundToggleBtn');
  const label = $('soundLabel');
  if (btn) btn.classList.toggle('muted', !soundEnabled);
  if (label) label.textContent = soundEnabled ? 'SFX ON' : 'SFX OFF';
  if (soundEnabled) sfx.click();
}

// Confetti Animation for Winner Screen
function launchConfetti() {
  const canvas = $('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = [];
  const colors = ['#06b6d4', '#6366f1', '#fbbf24', '#10b981', '#f43f5e', '#a855f7'];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 15,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rv: (Math.random() - 0.5) * 10
    });
  }

  let frames = 0;
  function animate() {
    if (frames > 130) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.rotation += p.rv;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    frames++;
    requestAnimationFrame(animate);
  }
  animate();
}

function showView(id) {
  views.forEach(v => $(v).classList.toggle('hidden', v !== id));
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

const BACKEND_BASE = window.BACKEND_URL || '';

async function api(action, data = {}) {
  const endpoint = BACKEND_BASE ? `${BACKEND_BASE.replace(/\/+$/, '')}/api/game` : '/api/game';
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data })
  });
  const d = await r.json().catch(() => ({ error: 'The server returned an unreadable response.' }));
  if (!r.ok) throw new Error(d.error || 'Something went wrong.');
  return d;
}

function stopPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(refreshRoom, 1100);
  refreshRoom();
}

function cleanName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 18);
}

function requireName(value) {
  const n = cleanName(value);
  if (n.length < 2) throw new Error('Please choose a nickname with at least 2 characters.');
  return n;
}

async function createRoom() {
  if (requestBusy) return;
  requestBusy = true;
  const b = $('createBtn');
  b.disabled = true;
  try {
    const name = requireName($('hostName').value);
    const d = await api('create', { name });
    sfx.join();
    enterRoom(d, true);
    toast('Arena created! Share your 7-character code.');
  } catch (e) {
    toast(e.message);
  } finally {
    requestBusy = false;
    b.disabled = false;
  }
}

async function joinRoom() {
  if (requestBusy) return;
  requestBusy = true;
  const b = $('joinBtn');
  b.disabled = true;
  try {
    const name = requireName($('joinName').value);
    const code = $('roomCode').value.trim().toUpperCase();
    if (!/^[A-Z0-9]{7}$/.test(code)) throw new Error('Enter the 7-character arena code.');
    const d = await api('join', { name, code });
    sfx.join();
    enterRoom(d, false);
    toast('You joined the arena!');
  } catch (e) {
    toast(e.message);
  } finally {
    requestBusy = false;
    b.disabled = false;
  }
}

function enterRoom(data, isHost) {
  session.room = data.room.code;
  session.playerId = data.player.id;
  session.playerName = data.player.name;
  session.isHost = isHost;
  session.answered = false;
  session.seenRound = -1;
  session.shownQuestion = -1;
  session.soundPlayedForRound = -1;
  showView('roomView');
  startPolling();
}

function renderPlayers(room) {
  $('roomTitle').textContent = 'Arena ' + room.code;
  $('roomSubtitle').textContent = room.status === 'lobby' ? 'Challengers are assembling. Ready when you are.' : 'Battle in progress';
  $('roomCodeDisplay').textContent = room.code;
  $('miniCode').textContent = room.code;
  $('playerCount').textContent = `${room.players.length}/8`;
  $('playersList').innerHTML = room.players.map(p => `
    <div class="player-row ${p.id === session.playerId ? 'me' : ''}">
      <div class="avatar">${escapeHtml(p.name.slice(0, 1).toUpperCase())}</div>
      <div class="player-name">${escapeHtml(p.name)}${p.id === session.playerId ? ' (you)' : ''}</div>
      ${p.id === room.hostId ? '<span class="host-tag"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> HOST</span>' : ''}
    </div>
  `).join('');

  $('hostTip').textContent = session.isHost
    ? (room.players.length < 2
        ? '✦ Share your 7-character code with friends. 2–8 players required to launch.'
        : '✦ All challengers assembled? Launch the battle when ready!')
    : '✦ You are in the arena! Waiting for host to launch.';

  $('startBtn').classList.toggle('hidden', !session.isHost);
  $('startBtn').disabled = room.players.length < 2 || room.status !== 'lobby';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function refreshRoom() {
  if (!session.room) return;
  try {
    const d = await api('get', { code: session.room, playerId: session.playerId });
    if (!d.room) {
      leaveToHome();
      return;
    }
    const room = d.room;
    if (room.status === 'lobby') {
      renderPlayers(room);
      showView('roomView');
    } else if (room.status === 'playing') {
      renderGame(room);
    } else if (room.status === 'finished') {
      renderResults(room);
    }
  } catch (e) {
    console.warn(e);
  }
}

function sortedPlayers(room) {
  return [...room.players].sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt);
}

function renderScores(room) {
  $('scoreList').innerHTML = sortedPlayers(room).map((p, i) => `
    <div class="score-row">
      <span class="rank">${String(i + 1).padStart(2, '0')}</span>
      <span class="score-name">${escapeHtml(p.name)}${p.id === session.playerId ? ' · you' : ''}</span>
      <span class="score-points">${p.score}</span>
    </div>
  `).join('');
}

function renderGame(room) {
  showView('gameView');
  renderScores(room);
  const q = room.currentQuestion;
  if (!q) return;

  $('roundPill').textContent = `ROUND ${room.round + 1} / ${room.roundCount || 3}`;
  $('categoryPill').textContent = q.category.toUpperCase();
  $('questionNumber').textContent = `ROUND ${String(room.round + 1).padStart(2, '0')}`;
  $('questionText').textContent = q.text;
  $('answeredCount').textContent = `${room.answerCount} / ${room.players.length} locked in`;
  $('progressBar').style.width = `${Math.round(room.answerCount / room.players.length * 100)}%`;

  const myAnswer = room.answers?.[session.playerId];
  const isRevealed = room.revealed;
  session.answered = Boolean(myAnswer);

  if (session.shownQuestion !== room.round) {
    session.shownQuestion = room.round;
    session.answered = Boolean(myAnswer);
    session.soundPlayedForRound = -1;
    $('answerFeedback').textContent = '';
  }

  $('answersGrid').innerHTML = q.options.map((opt, i) => {
    let cls = '';
    if (isRevealed && i === q.correctIndex) cls = 'correct';
    else if (myAnswer && i === myAnswer.choice && i !== q.correctIndex) cls = 'wrong';
    else if (myAnswer && i === myAnswer.choice) cls = 'selected';

    return `<button class="answer-btn ${cls}" data-choice="${i}" ${myAnswer || isRevealed ? 'disabled' : ''}>
      <span class="answer-key">${'ABCD'[i]}</span>
      <span>${escapeHtml(opt)}</span>
    </button>`;
  }).join('');

  $('answersGrid').querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.click();
      submitAnswer(Number(btn.dataset.choice));
    });
  });

  if (myAnswer && !isRevealed) {
    $('answerFeedback').textContent = 'Choice locked in! Waiting for remaining challengers…';
  }

  if (isRevealed) {
    const correct = myAnswer && myAnswer.choice === q.correctIndex;
    if (session.soundPlayedForRound !== room.round) {
      session.soundPlayedForRound = room.round;
      if (myAnswer) {
        if (correct) sfx.correct();
        else sfx.wrong();
      }
    }
    $('answerFeedback').textContent = myAnswer
      ? (correct ? `Correct! +${myAnswer.points} points awarded. ${q.explanation || ''}` : `Not quite — ${q.explanation || 'Better luck next round!'}`)
      : `Round complete. Correct answer: ${q.options[q.correctIndex]}.`;
  }

  $('nextBtn').classList.toggle('hidden', !(session.isHost && isRevealed));
  $('nextBtn').disabled = !isRevealed;
  $('roundHint').textContent = isRevealed
    ? 'Round complete. Host can advance.'
    : (myAnswer ? 'Choice locked — cannot be changed.' : 'Select one option. Locked immediately!');
}

async function submitAnswer(choice) {
  if (session.answered) return;
  try {
    sfx.lock();
    const d = await api('answer', { code: session.room, playerId: session.playerId, choice });
    session.answered = true;
    $('answerFeedback').textContent = 'Choice locked in! Waiting for remaining challengers…';
    await refreshRoom();
  } catch (e) {
    toast(e.message);
  }
}

async function startGame() {
  try {
    sfx.click();
    await api('start', { code: session.room, playerId: session.playerId });
    await refreshRoom();
  } catch (e) {
    toast(e.message);
  }
}

async function nextRound() {
  try {
    sfx.click();
    await api('next', { code: session.room, playerId: session.playerId });
    await refreshRoom();
  } catch (e) {
    toast(e.message);
  }
}

function medalBadge(i) {
  if (i === 0) {
    return `<span class="medal-badge gold"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> 1ST</span>`;
  }
  if (i === 1) {
    return `<span class="medal-badge silver"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> 2ND</span>`;
  }
  if (i === 2) {
    return `<span class="medal-badge bronze"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> 3RD</span>`;
  }
  return `<span class="medal-badge normal">#${i + 1}</span>`;
}

function renderResults(room) {
  stopPolling();
  showView('resultView');
  const players = sortedPlayers(room);
  const winner = players[0];

  // Winner victory audio & confetti burst!
  if (session.soundPlayedForRound !== 999) {
    session.soundPlayedForRound = 999;
    sfx.win();
    launchConfetti();
  }

  $('winnerTitle').textContent = winner ? `${winner.name} takes the crown!` : 'Battle complete!';
  $('winnerSubtitle').textContent = players.length > 1
    ? `${winner.name} finished at #1 with ${winner.score} points. Incredible battle, everyone!`
    : 'Thanks for competing in MindBlitz Arena.';
  $('finalScores').innerHTML = players.map((p, i) => `
    <div class="final-row ${i === 0 ? 'winner' : ''}">
      <span class="final-rank">${medalBadge(i)}</span>
      <span class="final-player">${escapeHtml(p.name)}${p.id === session.playerId ? ' (you)' : ''}</span>
      <span class="final-points">${p.score} pts</span>
    </div>
  `).join('');
  $('playAgainBtn').classList.toggle('hidden', !session.isHost);
}

function leaveToHome() {
  stopPolling();
  session = { room: null, playerId: null, playerName: null, isHost: false, seenVersion: 0, seenRound: -1, answered: false, shownQuestion: -1, soundPlayedForRound: -1 };
  showView('homeView');
}

// Event Listeners
$('createBtn').addEventListener('click', createRoom);
$('joinBtn').addEventListener('click', joinRoom);

$('roomCode').addEventListener('input', e => {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
});

$('copyCodeBtn').addEventListener('click', async () => {
  sfx.click();
  try {
    await navigator.clipboard.writeText(session.room);
    toast('Arena code copied!');
  } catch {
    toast(`Share code: ${session.room}`);
  }
});

const soundBtn = $('soundToggleBtn');
if (soundBtn) soundBtn.addEventListener('click', toggleSound);

const brandLink = $('brandLink');
if (brandLink) {
  brandLink.addEventListener('click', e => {
    e.preventDefault();
    sfx.click();
    if (session.room) {
      if (confirm('Exit current arena and return to home?')) {
        leaveToHome();
      }
    } else {
      leaveToHome();
    }
  });
}

$('startBtn').addEventListener('click', startGame);
$('nextBtn').addEventListener('click', nextRound);

$('leaveBtn').addEventListener('click', () => {
  sfx.click();
  if (confirm('Exit this arena lobby?')) leaveToHome();
});

$('backLobbyBtn').addEventListener('click', () => {
  sfx.click();
  if (confirm('Return to lobby view? Battle continues in background.')) showView('roomView');
});

$('homeBtn').addEventListener('click', () => { sfx.click(); leaveToHome(); });
$('playAgainBtn').addEventListener('click', () => { sfx.click(); leaveToHome(); });

$('roomCode').addEventListener('keydown', e => { if (e.key === 'Enter') joinRoom(); });
$('joinName').addEventListener('keydown', e => { if (e.key === 'Enter') joinRoom(); });
$('hostName').addEventListener('keydown', e => { if (e.key === 'Enter') createRoom(); });

// Welcome Overlay Controller
function initWelcomeOverlay() {
  const overlay = $('welcomeOverlay');
  const btn = $('welcomeEnterBtn');
  const progress = $('welcomeProgress');
  if (!overlay) return;

  setTimeout(() => {
    if (progress) progress.style.width = '100%';
  }, 100);

  const dismiss = () => {
    if (overlay.classList.contains('dismissed')) return;
    overlay.classList.add('dismissed');
    sfx.click();
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 450);
  };

  if (btn) btn.addEventListener('click', dismiss);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.classList.contains('welcome-backdrop')) {
      dismiss();
    }
  });

  document.addEventListener('keydown', e => {
    if ((e.key === 'Escape' || e.key === 'Enter') && !overlay.classList.contains('dismissed')) {
      dismiss();
    }
  });

  setTimeout(() => {
    dismiss();
  }, 4500);
}

initWelcomeOverlay();

