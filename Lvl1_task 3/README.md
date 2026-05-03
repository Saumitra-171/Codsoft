#  Lvl1_task_3 — Calculator

A fully functional browser-based calculator with keyboard support, calculation history, and expression preview. Built with HTML, CSS, and vanilla JavaScript.

---

##  Task

**Level 1 — Task 3:** Build a basic calculator using HTML, CSS, and JavaScript.

---

##  Features

-  **Basic Operations** — Addition, subtraction, multiplication, division
-  **Keyboard Support** — Full keyboard input supported
-  **Calculation History** — Last 3 calculations shown, clickable to reuse
-  **Expression Preview** — Shows current expression above the display
-  **Backspace** — Delete last character
-  **Toggle Sign** — Flip positive/negative
-  **Safe Evaluation** — Uses `Function()` instead of `eval()` for security
-  **Dynamic Font Sizing** — Display shrinks for long numbers
-  **Button Flash** — Visual feedback on keyboard press

---

##  Folder Structure

```
Lvl1_task_3/
├── index.html      # Calculator UI and button layout
├── index.js        # All calculator logic
└── style.css       # Styling and layout
```

---

##  Tech Stack

| Technology | Usage |
|-----------|-------|
| HTML5 | Calculator layout and buttons |
| CSS3 | Styling, grid layout, animations |
| JavaScript (ES6) | Calculator logic, keyboard events, history |

---

##  How to Run

No installation needed:

```bash
# Simply open the file
double-click index.html
```

---

##  Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0–9` | Input digits |
| `+` `-` `*` `/` | Operators |
| `.` | Decimal point |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete last character |
| `Escape` or `Delete` | Clear all |

---

##  Security

Expressions are validated with a regex whitelist before evaluation — only digits, operators, dots, and parentheses are allowed. Uses `Function()` constructor instead of `eval()`.
