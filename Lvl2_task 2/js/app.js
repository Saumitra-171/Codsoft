// ── App bootstrap ─────────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + id).classList.add('active');
  if (id === 'home')   renderHomeList();
  if (id === 'list')   renderAllList();
  if (id === 'create') initCreate();
}

function goHome() { showScreen('home'); }

// Initialise on load
updateNav();
renderHomeList();
