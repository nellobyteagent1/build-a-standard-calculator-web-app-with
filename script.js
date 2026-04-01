(() => {
  const display = document.getElementById('display');
  const expression = document.getElementById('expression');

  let current = '0';
  let previous = null;
  let operator = null;
  let shouldResetDisplay = false;
  let lastEquals = false;

  const MAX_DIGITS = 12;

  const opSymbols = {
    add: '+',
    subtract: '−',
    multiply: '×',
    divide: '÷'
  };

  function formatNumber(n) {
    if (typeof n === 'string') n = parseFloat(n);
    if (isNaN(n) || !isFinite(n)) return 'Error';
    const str = n.toPrecision(12);
    const cleaned = parseFloat(str);
    const result = cleaned.toString();
    if (result.length > MAX_DIGITS) {
      return n.toExponential(6);
    }
    return result;
  }

  function updateDisplay() {
    display.textContent = current;
  }

  function updateExpression() {
    if (previous !== null && operator) {
      expression.textContent = `${formatNumber(previous)} ${opSymbols[operator] || ''}`;
    } else {
      expression.textContent = '';
    }
  }

  function clearHighlight() {
    document.querySelectorAll('.btn.op').forEach(b => b.classList.remove('active'));
  }

  function highlightOp() {
    clearHighlight();
    if (operator && shouldResetDisplay) {
      const btn = document.querySelector(`[data-action="${operator}"]`);
      if (btn && !btn.classList.contains('equals')) btn.classList.add('active');
    }
  }

  function calculate(a, op, b) {
    a = parseFloat(a);
    b = parseFloat(b);
    switch (op) {
      case 'add': return a + b;
      case 'subtract': return a - b;
      case 'multiply': return a * b;
      case 'divide': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  function inputDigit(d) {
    if (lastEquals) {
      current = d;
      previous = null;
      operator = null;
      lastEquals = false;
    } else if (shouldResetDisplay) {
      current = d;
      shouldResetDisplay = false;
    } else {
      if (current === '0' && d !== '.') {
        current = d;
      } else {
        if (current.replace(/[^0-9]/g, '').length >= MAX_DIGITS) return;
        current = current + d;
      }
    }
    clearHighlight();
    updateDisplay();
    updateExpression();
  }

  function inputDecimal() {
    if (lastEquals) {
      current = '0.';
      previous = null;
      operator = null;
      lastEquals = false;
      shouldResetDisplay = false;
      clearHighlight();
      updateDisplay();
      updateExpression();
      return;
    }
    if (shouldResetDisplay) {
      current = '0.';
      shouldResetDisplay = false;
      clearHighlight();
      updateDisplay();
      return;
    }
    if (!current.includes('.')) {
      current += '.';
    }
    clearHighlight();
    updateDisplay();
  }

  function handleOperator(nextOp) {
    lastEquals = false;
    const val = parseFloat(current);

    if (previous === null) {
      previous = val;
    } else if (operator && !shouldResetDisplay) {
      const result = calculate(previous, operator, val);
      previous = result;
      current = formatNumber(result);
      updateDisplay();
    }

    operator = nextOp;
    shouldResetDisplay = true;
    updateExpression();
    highlightOp();
  }

  function handleEquals() {
    if (operator === null) return;

    const val = parseFloat(current);
    const result = calculate(previous, operator, val);
    expression.textContent = `${formatNumber(previous)} ${opSymbols[operator]} ${formatNumber(val)} =`;
    current = formatNumber(result);
    previous = null;
    operator = null;
    shouldResetDisplay = true;
    lastEquals = true;
    clearHighlight();
    updateDisplay();
  }

  function handleClear() {
    current = '0';
    previous = null;
    operator = null;
    shouldResetDisplay = false;
    lastEquals = false;
    clearHighlight();
    updateDisplay();
    updateExpression();
  }

  function handlePercent() {
    const val = parseFloat(current);
    if (previous !== null && operator) {
      current = formatNumber((previous * val) / 100);
    } else {
      current = formatNumber(val / 100);
    }
    updateDisplay();
  }

  function handleToggleSign() {
    if (current === '0') return;
    if (current.startsWith('-')) {
      current = current.slice(1);
    } else {
      current = '-' + current;
    }
    updateDisplay();
  }

  document.querySelector('.buttons').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const action = btn.dataset.action;

    if (/^[0-9]$/.test(action)) {
      inputDigit(action);
    } else if (action === 'decimal') {
      inputDecimal();
    } else if (action === 'clear') {
      handleClear();
    } else if (action === 'toggle-sign') {
      handleToggleSign();
    } else if (action === 'percent') {
      handlePercent();
    } else if (action === 'equals') {
      handleEquals();
    } else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
      handleOperator(action);
    }
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (/^[0-9]$/.test(key)) { inputDigit(key); }
    else if (key === '.') { inputDecimal(); }
    else if (key === '+') { handleOperator('add'); }
    else if (key === '-') { handleOperator('subtract'); }
    else if (key === '*') { handleOperator('multiply'); }
    else if (key === '/') { e.preventDefault(); handleOperator('divide'); }
    else if (key === '%') { handlePercent(); }
    else if (key === 'Enter' || key === '=') { handleEquals(); }
    else if (key === 'Escape' || key === 'c' || key === 'C') { handleClear(); }
    else if (key === 'Backspace') {
      if (current.length > 1) {
        current = current.slice(0, -1);
      } else {
        current = '0';
      }
      updateDisplay();
    }
  });
})();
