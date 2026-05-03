// ── Quiz creation ─────────────────────────────────────────────────────────

function initCreate() {
  $('quizTitle').value = '';
  $('quizDesc').value  = '';
  $('questionsList').innerHTML = '';
  $('createErr').style.display = 'none';
  $('createOk').style.display  = 'none';
  state.qCount = 0;
  addQuestion();
}

function addQuestion() {
  state.qCount++;
  const idx = state.qCount;
  const div = document.createElement('div');
  div.className = 'q-block';
  div.id = 'q-' + idx;
  div.innerHTML = `
    <div class="q-block-header">
      <span class="q-num">Question ${idx}</span>
      <button class="btn btn-sm btn-danger" onclick="removeQuestion(${idx})">Remove</button>
    </div>
    <div class="field">
      <label>Question text *</label>
      <input type="text" id="qt-${idx}" placeholder="Type your question here..." />
    </div>
    <label style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;display:block">
      Answer options — select (●) the correct one
    </label>
    ${[0, 1, 2, 3].map(i => `
      <div class="opt-row">
        <input type="radio" name="correct-${idx}" value="${i}" id="rc-${idx}-${i}" ${i === 0 ? 'checked' : ''} />
        <input type="text" id="opt-${idx}-${i}" placeholder="Option ${i + 1}" />
      </div>`).join('')}`;
  $('questionsList').appendChild(div);
}

function removeQuestion(idx) {
  const el = $('q-' + idx);
  if (el) el.remove();
}

function saveQuiz() {
  const title  = $('quizTitle').value.trim();
  const desc   = $('quizDesc').value.trim();
  const errEl  = $('createErr');
  const okEl   = $('createOk');

  errEl.style.display = 'none';
  okEl.style.display  = 'none';

  if (!title) {
    errEl.textContent = 'Please add a quiz title.';
    errEl.style.display = '';
    return;
  }

  const qBlocks = $('questionsList').querySelectorAll('.q-block');
  if (!qBlocks.length) {
    errEl.textContent = 'Please add at least one question.';
    errEl.style.display = '';
    return;
  }

  const questions = [];
  let valid = true;

  qBlocks.forEach(block => {
    const id   = block.id.split('-')[1];
    const text = $('qt-' + id)?.value.trim();
    if (!text) { valid = false; return; }

    const opts   = [0, 1, 2, 3].map(i => $('opt-' + id + '-' + i)?.value.trim() || '');
    const filled = opts.filter(Boolean);
    if (filled.length < 2) { valid = false; return; }

    const checked = block.querySelector(`input[name="correct-${id}"]:checked`);
    const correct = checked ? parseInt(checked.value) : 0;
    questions.push({ text, options: opts, correct });
  });

  if (!valid) {
    errEl.textContent = 'Please fill in all questions with at least 2 options each.';
    errEl.style.display = '';
    return;
  }

  state.quizzes.push({
    id: state.nextId++,
    title,
    desc,
    author: state.currentUser.display,
    questions,
  });

  okEl.textContent = 'Quiz published successfully! Redirecting…';
  okEl.style.display = '';
  setTimeout(() => showScreen('list'), 1200);
}
