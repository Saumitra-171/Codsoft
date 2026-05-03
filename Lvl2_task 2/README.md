#  Lvl2_task_2 — QuizMaker

A full-featured quiz creation and taking app built with vanilla HTML, CSS, and JavaScript. Users can sign up, create quizzes, and take quizzes — all in the browser with localStorage persistence.

---

##  Task

**Level 2 — Task 2:** Build an interactive quiz application where users can create and take quizzes.

---

##  Features

-  **Authentication** — Sign up and sign in with localStorage-based auth
-  **Create Quizzes** — Add multiple questions with multiple choice answers
-  **Quiz List** — Browse all available quizzes
-  **Take Quizzes** — Answer questions and get a score at the end
-  **Persistent Storage** — All data saved in localStorage (no backend needed)
-  **Single Page App** — Smooth screen transitions without page reloads

---

##  Folder Structure

```
Lvl2_task_2/
├── index.html          # Full SPA shell + all screen markup
├── css/
│   └── style.css       # All styling and layout
└── js/
    ├── app.js          # App bootstrap, screen routing
    ├── auth.js         # Sign up / sign in logic
    ├── create.js       # Quiz creation logic
    ├── quizList.js     # Browse and list quizzes
    ├── state.js        # Global state and localStorage management
    └── take.js         # Quiz taking and scoring logic
```

---

##  Tech Stack

| Technology | Usage |
|-----------|-------|
| HTML5 | SPA structure and all screen markup |
| CSS3 | Styling, layout, responsive design |
| JavaScript (ES6) | App logic, routing, localStorage |

---

##  How to Run

No installation needed — just open in a browser:

```bash
# Simply open the file
double-click index.html
```

---

##  App Screens

| Screen | Description |
|--------|-------------|
| Home | Featured quizzes and quick actions |
| Auth | Sign up / Sign in form |
| Create | Build a new quiz with questions |
| Quiz List | Browse all quizzes |
| Take Quiz | Answer questions one by one |
| Results | Score summary after completing a quiz |

---

##  Data Storage

All data (users, quizzes, scores) is stored in the browser's `localStorage`. No backend or database required. Data persists between sessions on the same browser.
