---
title: "Самопроверка"
description: "Тест по дисциплине «Архитектура операционных систем»: вопросы с вариантами ответов и пояснениями."
---
# ✅ Самопроверка

Итоговая аттестация по программе проходит **в форме тестирования**. Выберите раздел и количество вопросов. После каждого ответа появится пояснение со ссылкой на нужный вопрос пособия.

<div class="card" id="quiz-setup">
  <p><label for="quiz-section"><strong>Раздел</strong></label><br>
  <select id="quiz-section">
    <option value="0">Все разделы</option>
    {% for sec in site.data.sections %}<option value="{{ sec.id }}">{{ sec.icon }} {{ sec.t }}</option>{% endfor %}
  </select></p>
  <p><label for="quiz-count"><strong>Количество вопросов</strong></label><br>
  <select id="quiz-count">
    <option value="10">10</option>
    <option value="20" selected>20</option>
    <option value="40">40</option>
    <option value="9999">Все</option>
  </select></p>
  <div class="quiz-controls">
    <button class="btn" type="button" id="quiz-start">Начать тест</button>
  </div>
  <p class="quiz-status" id="quiz-best"></p>
</div>

<div class="card" id="quiz-box" hidden>
  <p class="quiz-status" id="quiz-progress"></p>
  <h2 id="quiz-q"></h2>
  <ul class="opts" id="quiz-opts"></ul>
  <div class="explain" id="quiz-explain"></div>
  <div class="quiz-controls">
    <button class="btn" type="button" id="quiz-next" disabled>Дальше →</button>
    <button class="btn btn--ghost" type="button" id="quiz-stop">Завершить</button>
  </div>
</div>

<div class="card" id="quiz-result" hidden>
  <h2 id="quiz-score"></h2>
  <div id="quiz-review"></div>
  <div class="quiz-controls">
    <button class="btn" type="button" id="quiz-again">Ещё раз</button>
    <button class="btn btn--ghost" type="button" id="quiz-retry-wrong">Повторить ошибки</button>
  </div>
</div>

<script>window.SP_QSEC = {{ site.data.questions | map: "s" | jsonify }};</script>
<script src="{{ '/assets/quiz-data.js' | relative_url }}"></script>
<script src="{{ '/assets/quiz.js' | relative_url }}"></script>
