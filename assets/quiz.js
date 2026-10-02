(function () {
  'use strict';
  var bank = window.SP_QUIZ || [];
  var qsec = window.SP_QSEC || [];
  var base = window.SP_BASE || '';
  var $ = function (id) { return document.getElementById(id); };

  var setup = $('quiz-setup'), box = $('quiz-box'), result = $('quiz-result');
  var list = [], idx = 0, score = 0, wrong = [], answered = false;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function link(n) { return base + '/q/' + pad(n) + '.html'; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function getBest() { try { return Number(localStorage.getItem('sp-quiz-best') || 0); } catch (e) { return 0; } }
  function setBest(p) { try { localStorage.setItem('sp-quiz-best', String(p)); } catch (e) {} }
  function showBest() {
    var b = getBest();
    $('quiz-best').textContent = 'В банке ' + bank.length + ' вопросов.' + (b ? ' Лучший результат: ' + b + ' %.' : '');
  }

  function start(items) {
    list = items; idx = 0; score = 0; wrong = [];
    setup.hidden = true; result.hidden = true; box.hidden = false;
    render();
    box.scrollIntoView({ block: 'start' });
  }

  function render() {
    var item = list[idx];
    answered = false;
    $('quiz-progress').textContent = 'Вопрос ' + (idx + 1) + ' из ' + list.length + ' · правильно: ' + score;
    $('quiz-q').textContent = item.q;
    var opts = $('quiz-opts');
    opts.innerHTML = '';
    var order = shuffle(item.a.map(function (_, i) { return i; }));
    order.forEach(function (i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = item.a[i];
      b.dataset.i = i;
      b.addEventListener('click', function () { answer(i); });
      li.appendChild(b);
      opts.appendChild(li);
    });
    var ex = $('quiz-explain');
    ex.className = 'explain';
    ex.innerHTML = '';
    $('quiz-next').disabled = true;
    $('quiz-next').textContent = idx === list.length - 1 ? 'Результат' : 'Дальше →';
  }

  function answer(i) {
    if (answered) return;
    answered = true;
    var item = list[idx];
    var ok = i === item.c;
    if (ok) score++; else wrong.push(item);
    $('quiz-opts').querySelectorAll('button').forEach(function (b) {
      var bi = Number(b.dataset.i);
      if (bi === item.c) b.classList.add('is-right');
      else if (bi === i) b.classList.add('is-wrong');
      b.disabled = true;
    });
    var ex = $('quiz-explain');
    ex.innerHTML = '<p><strong>' + (ok ? '✔ Верно!' : '✘ Неверно.') + '</strong> ' + esc(item.e) +
      '</p><p><a href="' + link(item.n) + '">Подробнее: вопрос ' + item.n + '</a></p>';
    ex.classList.add('show');
    $('quiz-next').disabled = false;
    $('quiz-next').focus();
  }

  function finish() {
    box.hidden = true; result.hidden = false;
    var total = idx + (answered ? 1 : 0);
    var pct = total ? Math.round(score / total * 100) : 0;
    if (total >= 10 && pct > getBest()) setBest(pct);
    var mark = pct >= 90 ? '🏆 Отлично!' : pct >= 75 ? '👍 Хорошо' : pct >= 50 ? '🙂 Удовлетворительно' : '📚 Нужно повторить';
    $('quiz-score').textContent = mark + ' ' + score + ' из ' + total + ' (' + pct + ' %)';
    var rev = $('quiz-review');
    if (!wrong.length) {
      rev.innerHTML = total ? '<p>Ошибок нет.</p>' : '';
    } else {
      rev.innerHTML = '<p><strong>Повторите:</strong></p><ul>' + wrong.map(function (w) {
        return '<li>' + esc(w.q) + '<br><em>Ответ: ' + esc(w.a[w.c]) + '</em> · <a href="' + link(w.n) + '">вопрос ' + w.n + '</a></li>';
      }).join('') + '</ul>';
    }
    $('quiz-retry-wrong').hidden = !wrong.length;
    result.scrollIntoView({ block: 'start' });
  }

  $('quiz-start').addEventListener('click', function () {
    var sec = Number($('quiz-section').value);
    var count = Number($('quiz-count').value);
    var pool = bank.filter(function (it) { return !sec || qsec[it.n - 1] === sec; });
    start(shuffle(pool).slice(0, count));
  });
  $('quiz-next').addEventListener('click', function () {
    if (idx < list.length - 1) { idx++; render(); } else { idx = list.length - 1; finish(); }
  });
  $('quiz-stop').addEventListener('click', finish);
  $('quiz-again').addEventListener('click', function () {
    result.hidden = true; setup.hidden = false; showBest();
  });
  $('quiz-retry-wrong').addEventListener('click', function () { start(shuffle(wrong)); });

  showBest();
})();
