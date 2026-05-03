// ── Shared application state ──────────────────────────────────────────────
const state = {
  currentUser: null,
  afterAuth: null,
  users: [
    { username: 'demo', password: 'demo', display: 'Guest' }
  ],
  quizzes: [
    {
      id: 1,
      title: 'World Geography Basics',
      desc: 'Test your knowledge of countries and capitals',
      author: 'Guest',
      questions: [
        { text: 'What is the capital of France?',      options: ['London','Berlin','Paris','Madrid'],    correct: 2 },
        { text: 'Which is the largest ocean?',         options: ['Atlantic','Indian','Arctic','Pacific'], correct: 3 },
        { text: 'How many continents are there?',      options: ['5','6','7','8'],                       correct: 2 },
      ]
    },
    {
      id: 2,
      title: 'Science Trivia',
      desc: 'Basic science questions for all ages',
      author: 'Guest',
      questions: [
        { text: 'What is the chemical symbol for water?',         options: ['WA','HO','H2O','OW'],  correct: 2 },
        { text: 'How many planets are in our solar system?',      options: ['7','8','9','10'],       correct: 1 },
      ]
    }
  ],
  nextId: 3,
  // Quiz-taking session
  takeQuiz: null,
  takeAnswers: [],
  currentQuestion: 0,
  // Create form
  qCount: 0,
};

// ── Utility ───────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
