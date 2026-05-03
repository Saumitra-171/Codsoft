// ── Quiz listing ──────────────────────────────────────────────────────────

function renderQuizCard(q, container) {
  const isOwner =
    state.currentUser &&
    (state.currentUser.username === q.author ||
     (q.author === 'Guest' && state.currentUser.username === 'demo'));

  const div = document.createElement('div');
  div.className = 'card quiz-item';
  div.innerHTML = `
    <div class="quiz-item-info">
      <h3>${escHtml(q.title)}</h3>
      <p class="meta">
        ${q.desc ? escHtml(q.desc) + ' · ' : ''}
        ${q.questions.length} question${q.questions.length !== 1 ? 's' : ''} · by ${escHtml(q.author)}
      </p>
    </div>
    <div class="quiz-item-actions">
      <button class="btn btn-sm btn-primary" onclick="startQuiz(${q.id})">Take quiz</button>
      ${isOwner ? `<button class="btn btn-sm btn-danger" onclick="deleteQuiz(${q.id})">Delete</button>` : ''}
    </div>`;
  container.appendChild(div);
}

function renderHomeList() {
  const c = $('homeQuizList');
  c.innerHTML = '';
  if (!state.quizzes.length) {
    c.innerHTML = '<div class="empty">No quizzes yet — create the first one!</div>';
    return;
  }
  state.quizzes.slice(-3).reverse().forEach(q => renderQuizCard(q, c));
}

function renderAllList() {
  const c = $('allQuizList');
  c.innerHTML = '';
  if (!state.quizzes.length) {
    c.innerHTML = '<div class="empty">No quizzes yet.</div>';
    return;
  }
  state.quizzes.slice().reverse().forEach(q => renderQuizCard(q, c));
}

function deleteQuiz(id) {
  state.quizzes = state.quizzes.filter(q => q.id !== id);
  renderAllList();
}
