// CALCULATOR — upgraded
// Fixes: eval safety, operator chaining, decimal guard
// New: backspace, keyboard support, history, toggle sign, expression preview

const display = document.getElementById('display');
const expressionEl = document.getElementById('expression');
const historyList = document.getElementById('history-list');

let currentExpression = '';
let justCalculated = false;
const MAX_HISTORY = 3;
const history = [];

// ─── Core display helpers ───────────────────────────────────────────

function updateDisplay(value) {
    display.value = value;
    display.classList.remove('error');

    // Shrink font for long numbers
    if (value.length > 12) {
        display.style.fontSize = '1.8rem';
    } else if (value.length > 8) {
        display.style.fontSize = '2.2rem';
    } else {
        display.style.fontSize = '3rem';
    }
}

function setExpression(expr) {
    // Replace operators with nice symbols for the expression line
    expressionEl.textContent = expr
        .replace(/\*/g, '×')
        .replace(/\//g, '÷');
}

// ─── Input functions ─────────────────────────────────────────────────

function appendToDisplay(input) {
    const operators = ['+', '-', '*', '/'];
    const isOperator = operators.includes(input);
    const current = display.value;

    // After a calculation, start fresh on number, continue on operator
    if (justCalculated) {
        if (isOperator) {
            currentExpression = current + input;
            setExpression(currentExpression);
            updateDisplay(current);
            justCalculated = false;
            return;
        } else {
            currentExpression = '';
            justCalculated = false;
        }
    }

    // Prevent multiple operators in a row (replace last operator)
    if (isOperator && current !== '' && operators.includes(current.slice(-1))) {
        currentExpression = currentExpression.slice(0, -1) + input;
        setExpression(currentExpression);
        updateDisplay(current.slice(0, -1) + input);
        return;
    }

    // Prevent leading operator (except minus for negatives)
    if (isOperator && current === '' && input !== '-') return;

    // Prevent multiple decimal points in current number segment
    if (input === '.') {
        const parts = current.split(/[\+\-\*\/]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes('.')) return;
    }

    currentExpression += input;
    setExpression(currentExpression);
    updateDisplay(current + input);
}

function calculate() {
    const expr = display.value;
    if (!expr || expr === '') return;

    try {
        // Safe evaluation: only allow digits, operators, dots, parens
        if (!/^[\d\s\+\-\*\/\.\(\)]+$/.test(expr)) {
            throw new Error('Invalid expression');
        }

        // Evaluate safely using Function instead of eval
        // eslint-disable-next-line no-new-func
        const result = Function('"use strict"; return (' + expr + ')')();

        if (!isFinite(result)) {
            display.classList.add('error');
            updateDisplay('Cannot ÷ by 0');
            expressionEl.textContent = '';
            currentExpression = '';
            justCalculated = true;
            return;
        }

        // Round floating point errors (e.g. 0.1+0.2)
        const rounded = parseFloat(result.toPrecision(12));

        addToHistory(expr, rounded);
        setExpression(expr + ' =');
        updateDisplay(String(rounded));
        currentExpression = String(rounded);
        justCalculated = true;

    } catch (err) {
        display.classList.add('error');
        display.value = 'Error';
        expressionEl.textContent = '';
        currentExpression = '';
        justCalculated = true;
    }
}

function clearDisplay() {
    updateDisplay('');
    setExpression('');
    currentExpression = '';
    justCalculated = false;
}

function backspace() {
    if (justCalculated) {
        clearDisplay();
        return;
    }
    const current = display.value;
    if (!current) return;
    const newVal = current.slice(0, -1);
    currentExpression = newVal;
    updateDisplay(newVal);
    setExpression(newVal);
}

function toggleSign() {
    const current = display.value;
    if (!current || current === '0') return;

    let newVal;
    if (current.startsWith('-')) {
        newVal = current.slice(1);
    } else {
        newVal = '-' + current;
    }
    currentExpression = newVal;
    updateDisplay(newVal);
    setExpression(newVal);
}

// ─── History ─────────────────────────────────────────────────────────

function addToHistory(expr, result) {
    const entry = {
        expr: expr.replace(/\*/g, '×').replace(/\//g, '÷'),
        result
    };
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history.pop();
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-entry';
        div.textContent = `${item.expr} = ${item.result}`;
        div.title = 'Tap to reuse result';
        div.addEventListener('click', () => {
            updateDisplay(String(item.result));
            currentExpression = String(item.result);
            setExpression('');
            justCalculated = true;
        });
        historyList.appendChild(div);
    });
}

// ─── Keyboard support ────────────────────────────────────────────────

const keyMap = {
    '0': () => appendToDisplay('0'),
    '1': () => appendToDisplay('1'),
    '2': () => appendToDisplay('2'),
    '3': () => appendToDisplay('3'),
    '4': () => appendToDisplay('4'),
    '5': () => appendToDisplay('5'),
    '6': () => appendToDisplay('6'),
    '7': () => appendToDisplay('7'),
    '8': () => appendToDisplay('8'),
    '9': () => appendToDisplay('9'),
    '.': () => appendToDisplay('.'),
    '+': () => appendToDisplay('+'),
    '-': () => appendToDisplay('-'),
    '*': () => appendToDisplay('*'),
    '/': () => appendToDisplay('/'),
    'Enter': calculate,
    '=': calculate,
    'Backspace': backspace,
    'Escape': clearDisplay,
    'Delete': clearDisplay,
};

document.addEventListener('keydown', (e) => {
    if (keyMap[e.key]) {
        e.preventDefault();
        keyMap[e.key]();
        flashButton(e.key);
    }
});

function flashButton(key) {
    // Find matching button by its onclick text or content
    const buttons = document.querySelectorAll('#keys button');
    buttons.forEach(btn => {
        const txt = btn.textContent.trim();
        const mapped = {
            'Enter': '=', '=': '=',
            'Escape': 'AC', 'Delete': 'AC',
            'Backspace': '⌫',
            '*': '×', '/': '/',
            '-': '−', '+': '+'
        };
        const display = mapped[key] || key;
        if (txt === display || txt === key) {
            btn.classList.add('pop');
            setTimeout(() => btn.classList.remove('pop'), 150);
        }
    });
}
