// ── Authentication ────────────────────────────────────────────────────────

function updateNav() {
  const u = state.currentUser;
  $('navUser').innerHTML = u
    ? `<div class="avatar">${u.display[0].toUpperCase()}</div>
       <span style="font-size:13px;color:var(--text-secondary)">${escHtml(u.display)}</span>
       <button class="btn btn-sm btn-danger" onclick="doLogout()">Sign out</button>`
    : `<button class="btn btn-sm" onclick="showScreen('auth')">Sign in</button>`;
}

function requireAuth(next) {
  if (state.currentUser) { showScreen(next); return; }
  state.afterAuth = next;
  showScreen('auth');
}

function switchAuthTab(tab) {
  $('tab-login').className    = 'tab' + (tab === 'login'    ? ' active' : '');
  $('tab-register').className = 'tab' + (tab === 'register' ? ' active' : '');
  $('auth-login').style.display    = tab === 'login'    ? '' : 'none';
  $('auth-register').style.display = tab === 'register' ? '' : 'none';
}

function demoLogin() {
  state.currentUser = { username: 'demo', display: 'Guest' };
  updateNav();
  showScreen(state.afterAuth || 'home');
  state.afterAuth = null;
}

function doLogin() {
  const u = $('loginUser').value.trim();
  const p = $('loginPass').value;
  const found = state.users.find(x => x.username === u && x.password === p);
  const err = $('loginErr');

  if (!found) {
    err.textContent = 'Invalid username or password.';
    err.style.display = '';
    return;
  }
  err.style.display = 'none';
  state.currentUser = { username: found.username, display: found.display || found.username };
  updateNav();
  showScreen(state.afterAuth || 'home');
  state.afterAuth = null;
}

function doRegister() {
  const u = $('regUser').value.trim();
  const p = $('regPass').value;
  const err = $('regErr');

  if (!u || !p) {
    err.textContent = 'Please fill in all fields.';
    err.style.display = '';
    return;
  }
  if (state.users.find(x => x.username === u)) {
    err.textContent = 'Username already taken.';
    err.style.display = '';
    return;
  }
  err.style.display = 'none';
  state.users.push({ username: u, password: p, display: u });
  state.currentUser = { username: u, display: u };
  updateNav();
  showScreen(state.afterAuth || 'home');
  state.afterAuth = null;
}

function doLogout() {
  state.currentUser = null;
  updateNav();
  goHome();
}
