// ── Quiz taking & results ─────────────────────────────────────────────────

function startQuiz(id) {
  const q = state.quizzes.find(x => x.id === id);
  if (!q) return;
  state.takeQuiz        = q;
  state.takeAnswers     = new Array(q.questions.length).fill(null);
  state.currentQuestion = 0;
  renderQuestion();
  showScreen('take');
}

function renderQuestion() {
  const q      = state.takeQuiz;
  const qi     = state.currentQuestion;
  const qdata  = q.questions[qi];
  const pct    = Math.round((qi / q.questions.length) * 100);
  const answered = state.takeAnswers[qi];

  // Build option buttons
  const optionsHtml = qdata.options.map((opt, i) => {
    if (!opt) return '';
    let cls = 'option-btn';
    if (answered !== null) {
      if (i === qdata.correct)                      cls += ' correct';
      else if (i === answered && i !== qdata.correct) cls += ' wrong';
    }
    const disabled = answered !== null ? 'disabled' : '';
    const onclick  = answered === null ? `onclick="selectAnswer(${i})"` : '';
    return `<button class="${cls}" ${disabled} ${onclick}>${escHtml(opt)}</button>`;
  }).join('');

  // Feedback banner
  let feedbackHtml = '';
  if (answered !== null) {
    if (answered === qdata.correct) {
      feedbackHtml = `<div class="feedback correct">Correct!</div>`;
    } else {
      feedbackHtml = `<div class="feedback wrong">Incorrect — correct answer: <strong>${escHtml(qdata.options[qdata.correct])}</strong></div>`;
    }
  }

  // Navigation buttons
  const prevBtn = qi > 0
    ? `<button class="btn" onclick="navQ(-1)">← Previous</button>` : '';
  const nextBtn = qi < q.questions.length - 1
    ? `<button class="btn btn-primary" onclick="navQ(1)">Next →</button>`
    : `<button class="btn btn-primary" onclick="finishQuiz()">See results →</button>`;

  $('takeContent').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:1.25rem">
      <button class="btn btn-sm" onclick="goHome()">← Exit</button>
      <h2 style="margin:0;flex:1;font-size:16px">${escHtml(q.title)}</h2>
      <span style="font-size:13px;color:var(--text-secondary);white-space:nowrap">${qi + 1} / ${q.questions.length}</span>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="card" style="margin-bottom:1rem">
      <p style="font-size:16px;font-weight:500;color:var(--text)">${escHtml(qdata.text)}</p>
    </div>
    <div id="optionsArea">${optionsHtml}</div>
    ${feedbackHtml}
    <div style="display:flex;gap:8px;margin-top:1.25rem">
      ${prevBtn}
      <div style="flex:1"></div>
      ${nextBtn}
    </div>`;
}

function selectAnswer(i) {
  state.takeAnswers[state.currentQuestion] = i;
  renderQuestion();
}

function navQ(dir) {
  state.currentQuestion += dir;
  renderQuestion();
}

function finishQuiz() {
  const q = state.takeQuiz;
  let score = 0;
  q.questions.forEach((qd, i) => {
    if (state.takeAnswers[i] === qd.correct) score++;
  });
  const pct = Math.round((score / q.questions.length) * 100);
  const msg = pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';

  const breakdown = q.questions.map((qd, i) => {
    const ans     = state.takeAnswers[i];
    const correct = ans === qd.correct;
    return `
      <div class="result-item">
        <div class="result-icon ${correct ? 'r-correct' : 'r-wrong'}">${correct ? '✓' : '✗'}</div>
        <div>
          <div style="font-weight:500;color:var(--text);margin-bottom:3px">${escHtml(qd.text)}</div>
          <div style="font-size:13px;color:var(--text-secondary)">
            ${ans !== null
              ? `Your answer: <strong style="color:${correct ? 'var(--success-text)' : 'var(--danger-text)'}">${escHtml(qd.options[ans])}</strong>`
              : '<em>Not answered</em>'}
            ${!correct ? ` &nbsp;·&nbsp; Correct: <strong style="color:var(--success-text)">${escHtml(qd.options[qd.correct])}</strong>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  $('resultsContent').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:1.5rem">
      <button class="btn btn-sm" onclick="goHome()">← Home</button>
      <h2 style="margin:0">Results</h2>
    </div>
    <div style="text-align:center;margin-bottom:1.5rem">
      <div class="score-circle">
        <span class="score-num">${pct}%</span>
        <span class="score-label">${score} / ${q.questions.length}</span>
      </div>
      <p style="font-size:15px;color:var(--text-secondary)">${msg}</p>
    </div>
    <div class="card">
      <h3 style="font-size:14px;color:var(--text-secondary);margin-bottom:14px;font-weight:500">Question breakdown</h3>
      ${breakdown}
    </div>
    <div style="display:flex;gap:8px;margin-top:1rem;flex-wrap:wrap">
      <button class="btn" onclick="startQuiz(${q.id})">Retake quiz</button>
      <button class="btn btn-primary" onclick="showScreen('list')">Browse more quizzes</button>
    </div>`;

  showScreen('results');
}
