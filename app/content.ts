export type AreaId = "js" | "css" | "html" | "react";

export type LessonSection = {
  title: string;
  body: string[];
  bullets?: string[];
  code?: string;
  workExample?: string;
};

export type QuizSeed = {
  prompt: string;
  answer: string;
  distractors: string[];
  explain: string;
};

export type QuizQuestion = {
  prompt: string;
  options: string[];
  correct: number;
  explain: string;
};

export type Task = {
  id: string;
  topicId: string;
  title: string;
  level: "Junior" | "Junior+" | "Middle-ready";
  scenario: string;
  prompt: string;
  input: string;
  output: string;
  starter: string;
  checklist: string[];
};

export type Topic = {
  id: string;
  area: AreaId;
  title: string;
  subtitle: string;
  level: "Core" | "Interview" | "Production";
  duration: string;
  outcome: string;
  sources: { label: string; url: string }[];
  sections: LessonSection[];
  cheatsheet: string[];
  pitfalls: string[];
  quiz: QuizQuestion[];
  interview: string[];
  tasks: Task[];
};

export const areas: Record<AreaId, { title: string; note: string }> = {
  js: {
    title: "JavaScript",
    note: "Язык, асинхронность, DOM, память и API браузера.",
  },
  css: {
    title: "CSS",
    note: "Каскад, раскладки, адаптивность, архитектура и доступность.",
  },
  html: {
    title: "HTML",
    note: "Семантика, формы, медиа, метаданные и базовая доступность.",
  },
  react: {
    title: "React",
    note: "Компоненты, состояние, эффекты, производительность и архитектура.",
  },
};

function makeQuiz(seeds: QuizSeed[]): QuizQuestion[] {
  return seeds.map((seed, index) => {
    const options = new Array<string>(6);
    const correct = (index * 2 + 1) % 6;
    options[correct] = seed.answer;
    let cursor = 0;

    for (let optionIndex = 0; optionIndex < options.length; optionIndex += 1) {
      if (optionIndex === correct) continue;
      options[optionIndex] = seed.distractors[cursor] ?? "Нужен дополнительный контекст";
      cursor += 1;
    }

    return {
      prompt: seed.prompt,
      options,
      correct,
      explain: seed.explain,
    };
  });
}

const closureTasks: Task[] = [
  {
    id: "task-js-closures-cache",
    topicId: "js-closures-scope",
    title: "Мемоизация расчёта цены",
    level: "Junior+",
    scenario: "В интернет-магазине один и тот же расчёт скидки вызывается десятки раз при перерисовке корзины.",
    prompt:
      "Напиши функцию createPriceCalculator(tax), которая возвращает функцию calculate(base, discount). Внутри должен быть кеш по паре base/discount. Повторный вызов с теми же аргументами должен брать результат из кеша, а не считать заново.",
    input: "const calc = createPriceCalculator(0.2); calc(1000, 100); calc(1000, 100);",
    output: "1080, затем 1080 из кеша",
    starter: `function createPriceCalculator(tax) {
  // верни функцию calculate(base, discount)
}

const calc = createPriceCalculator(0.2);
console.log(calc(1000, 100));
console.log(calc(1000, 100));`,
    checklist: [
      "Кеш живёт в замыкании, а не в глобальной переменной.",
      "Ключ учитывает оба аргумента: base и discount.",
      "Функция не мутирует входные значения.",
    ],
  },
  {
    id: "task-js-closures-counter",
    topicId: "js-closures-scope",
    title: "Счётчик попыток формы",
    level: "Junior",
    scenario: "Форма входа должна показать предупреждение после третьей неудачной попытки.",
    prompt:
      "Создай makeAttemptTracker(limit), которая возвращает объект с методами fail(), reset() и getState(). Состояние должно быть закрыто внутри функции.",
    input: "const tracker = makeAttemptTracker(3); tracker.fail(); tracker.fail(); tracker.fail();",
    output: "{ attempts: 3, locked: true }",
    starter: `function makeAttemptTracker(limit) {
  // attempts нельзя хранить снаружи
}

const tracker = makeAttemptTracker(3);
tracker.fail();
tracker.fail();
tracker.fail();
console.log(tracker.getState());`,
    checklist: [
      "attempts недоступен напрямую извне.",
      "reset возвращает счётчик к нулю.",
      "locked становится true только при достижении лимита.",
    ],
  },
];

const asyncTasks: Task[] = [
  {
    id: "task-js-async-retry",
    topicId: "js-event-loop-async",
    title: "Повторить запрос при временной ошибке",
    level: "Junior+",
    scenario: "В интерфейсе профиля иногда падает сетевой запрос, но второй запуск часто проходит успешно.",
    prompt:
      "Напиши async-функцию retry(fn, attempts), которая вызывает fn. Если fn отклоняет промис, попробуй ещё раз, пока не закончатся попытки. Последнюю ошибку нужно пробросить наружу.",
    input: "await retry(() => fetchUser(42), 3)",
    output: "Результат fetchUser или последняя ошибка",
    starter: `async function retry(fn, attempts) {
  // используй await и try/catch
}`,
    checklist: [
      "Нет рекурсии без условия остановки.",
      "Последняя ошибка не проглатывается.",
      "Функция работает с любой async-функцией, не только с fetch.",
    ],
  },
  {
    id: "task-js-async-queue",
    topicId: "js-event-loop-async",
    title: "Очередь задач без параллельного запуска",
    level: "Middle-ready",
    scenario: "Автосохранение не должно отправлять две версии формы одновременно.",
    prompt:
      "Создай createSerialQueue(), которая возвращает add(task). task - функция, возвращающая промис. Каждая новая задача должна стартовать только после завершения предыдущей.",
    input: "queue.add(saveDraftA); queue.add(saveDraftB);",
    output: "saveDraftB стартует после завершения saveDraftA",
    starter: `function createSerialQueue() {
  // храни цепочку промисов внутри замыкания
}`,
    checklist: [
      "Задачи выполняются строго последовательно.",
      "Ошибка одной задачи не ломает очередь навсегда.",
      "add возвращает промис результата конкретной задачи.",
    ],
  },
];

const classesTasks: Task[] = [
  {
    id: "task-js-classes-modal",
    topicId: "js-prototypes-classes",
    title: "Базовый класс для модальных окон",
    level: "Junior+",
    scenario: "В проекте есть несколько модалок: подтверждение, форма, просмотр картинки. У них общий жизненный цикл.",
    prompt:
      "Создай класс Modal с методами open(), close(), isOpen(). Затем создай ConfirmModal, который наследуется от Modal и добавляет confirm().",
    input: "const modal = new ConfirmModal('Удалить файл?'); modal.open(); modal.confirm();",
    output: "Модалка открыта, confirm возвращает выбранное действие",
    starter: `class Modal {
  // open, close, isOpen
}

class ConfirmModal extends Modal {
  // confirm
}`,
    checklist: [
      "Общее состояние открытости хранится в базовом классе.",
      "Наследник не дублирует open и close.",
      "super используется там, где нужен конструктор родителя.",
    ],
  },
];

const domTasks: Task[] = [
  {
    id: "task-js-dom-delegation",
    topicId: "js-dom-events",
    title: "Делегирование кликов в списке",
    level: "Junior",
    scenario: "Список задач постоянно обновляется, но обработчик удаления должен оставаться один.",
    prompt:
      "Напиши обработчик на контейнере .todo-list. При клике на кнопку с data-action='remove' нужно удалить ближайший элемент .todo-item.",
    input: "<ul class='todo-list'><li class='todo-item'><button data-action='remove'>Удалить</button></li></ul>",
    output: "li.todo-item удалён после клика по кнопке",
    starter: `const list = document.querySelector(".todo-list");

list.addEventListener("click", (event) => {
  // найди кнопку и ближайший todo-item
});`,
    checklist: [
      "Обработчик висит на контейнере, а не на каждой кнопке.",
      "Используется closest для проверки цели клика.",
      "Клик вне кнопки ничего не ломает.",
    ],
  },
];

const cssCascadeTasks: Task[] = [
  {
    id: "task-css-cascade-button",
    topicId: "css-cascade-architecture",
    title: "Стабильная кнопка в дизайн-системе",
    level: "Junior+",
    scenario: "В проекте кнопка ломается из-за слишком сильных селекторов на странице.",
    prompt:
      "Напиши CSS для .button, .button--primary и состояния :disabled так, чтобы стили компонента были предсказуемыми. Используй слои @layer reset, components, utilities.",
    input: "<button class='button button--primary' disabled>Сохранить</button>",
    output: "disabled-стили имеют приоритет внутри компонентного слоя",
    starter: `@layer reset, components, utilities;

@layer components {
  .button {
    /* базовый вид */
  }
}`,
    checklist: [
      "Порядок слоёв задан явно.",
      "Селекторы не завязаны на конкретную страницу.",
      "disabled-состояние читается и не выглядит активным.",
    ],
  },
];

const cssLayoutTasks: Task[] = [
  {
    id: "task-css-layout-dashboard",
    topicId: "css-layout-responsive",
    title: "Адаптивная сетка карточек",
    level: "Junior",
    scenario: "На главной нужно показать карточки уроков: одна колонка на телефоне, несколько на широком экране.",
    prompt:
      "Сверстай .lesson-grid так, чтобы карточки автоматически помещались без медиазапроса на каждую ширину. Используй grid, minmax и auto-fit.",
    input: "<section class='lesson-grid'><article>...</article></section>",
    output: "Карточки не вылезают за экран на 360px и заполняют ряд на десктопе",
    starter: `.lesson-grid {
  /* grid-template-columns */
}`,
    checklist: [
      "Нет горизонтального скролла на 360px.",
      "Карточка имеет понятную минимальную ширину.",
      "Раскладка не зависит от фиксированного количества элементов.",
    ],
  },
];

const htmlTasks: Task[] = [
  {
    id: "task-html-checkout-form",
    topicId: "html-semantics-forms-a11y",
    title: "Доступная форма доставки",
    level: "Junior+",
    scenario: "Форма оформления заказа должна быть понятна и мышью, и клавиатурой, и скринридером.",
    prompt:
      "Разметь форму доставки: имя, телефон, способ доставки, комментарий, кнопка отправки. Используй label, fieldset, legend, autocomplete и понятные типы input.",
    input: "Поля: имя, телефон, доставка курьером/самовывоз, комментарий",
    output: "Форма читается по структуре и валидируется браузером",
    starter: `<form>
  <!-- добавь семантические поля -->
</form>`,
    checklist: [
      "У каждого поля есть связанный label.",
      "Радиокнопки объединены fieldset и legend.",
      "Типы input помогают мобильной клавиатуре.",
    ],
  },
];

const reactTasks: Task[] = [
  {
    id: "task-react-derived-state",
    topicId: "react-render-state-effects",
    title: "Фильтр без лишнего состояния",
    level: "Junior+",
    scenario: "Список задач фильтруется по строке поиска и статусу. Компонент стал рассинхронизироваться.",
    prompt:
      "Напиши компонент TaskList, где исходные задачи, query и status хранятся в состоянии, а отфильтрованный список вычисляется во время рендера. Не храни filteredTasks отдельно.",
    input: "tasks = [{ title: 'Fix modal', done: false }], query = 'modal'",
    output: "На экране только задачи, подходящие под фильтр",
    starter: `function TaskList({ initialTasks }) {
  // query и status - state
  // visibleTasks - derived value
}`,
    checklist: [
      "filteredTasks не хранится отдельным useState.",
      "Список обновляется при изменении query и status.",
      "Компонент не использует useEffect для чистого вычисления.",
    ],
  },
];

export const topics: Topic[] = [
  {
    id: "js-closures-scope",
    area: "js",
    title: "Замыкания, область видимости и лексическое окружение",
    subtitle: "Как JavaScript запоминает переменные и почему это основа модулей, обработчиков и приватного состояния.",
    level: "Interview",
    duration: "55 мин",
    outcome: "Ты сможешь объяснить замыкание на собеседовании и применить его для кеша, фабрик функций, обработчиков и инкапсуляции.",
    sources: [
      { label: "learn.javascript.ru: замыкание", url: "https://learn.javascript.ru/closure" },
      { label: "MDN: Closures", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures" },
      { label: "Дока: JavaScript", url: "https://doka.guide/js/" },
    ],
    sections: [
      {
        title: "Суть темы",
        body: [
          "Замыкание появляется, когда функция использует переменные из внешней области видимости и продолжает иметь к ним доступ после завершения внешней функции.",
          "Важно не заучивать фразу, а видеть механизм: при создании функции она получает ссылку на лексическое окружение, где была объявлена. Поэтому функция помнит не копию значения, а живую связь с переменной.",
        ],
        bullets: [
          "Scope отвечает на вопрос: где переменная доступна.",
          "Lexical environment хранит переменные и ссылку на внешнее окружение.",
          "Closure - функция плюс ссылка на внешнее окружение.",
        ],
        code: `function createCounter() {
  let count = 0;

  return function increment() {
    count += 1;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2`,
      },
      {
        title: "Почему это постоянно встречается в работе",
        body: [
          "Почти каждый обработчик события, колбэк таймера, функция внутри React-компонента и фабрика конфигурации используют замыкание. Даже если код выглядит обычным, переменные вокруг функции не исчезают магически.",
          "На практике замыкания дают приватное состояние без класса, позволяют создавать функции с заранее пришитой конфигурацией и помогают строить небольшие независимые модули.",
        ],
        workExample:
          "В форме оплаты можно создать validateWithRules(rules), чтобы не передавать правила в каждый вызов. Возвращённая функция будет помнить rules и применять их к конкретным значениям формы.",
      },
      {
        title: "Где чаще всего ошибаются",
        body: [
          "Классическая ошибка - считать, что замыкание хранит снимок значения. На самом деле оно хранит доступ к переменной. Если переменная меняется, функция увидит новое значение.",
          "Вторая ошибка - создавать замыкания в цикле и случайно привязать все функции к одной и той же переменной. let создаёт блочную область видимости и обычно решает эту проблему.",
        ],
        code: `const handlers = [];

for (let i = 0; i < 3; i += 1) {
  handlers.push(() => console.log(i));
}

handlers[0](); // 0
handlers[1](); // 1`,
      },
    ],
    cheatsheet: [
      "Функция помнит место, где была создана, а не место, где вызвана.",
      "Замыкание может удерживать данные в памяти, пока жива функция.",
      "Для приватного состояния подходят фабрики функций и модули.",
      "В React замыкания объясняют stale state в обработчиках и эффектах.",
    ],
    pitfalls: [
      "Не хранить большие объекты в замыкании без причины: сборщик мусора не освободит их, пока есть ссылка на функцию.",
      "Не путать lexical scope и this: this зависит от вызова, область видимости - от места объявления.",
      "Не использовать замыкание как глобальное хранилище, если состояние должно быть явно управляемым.",
    ],
    interview: [
      "Объясни замыкание без примера со счётчиком.",
      "Почему функция может помнить переменную после завершения внешней функции?",
      "Чем область видимости отличается от контекста this?",
      "Что такое stale closure в React?",
    ],
    quiz: makeQuiz([
      {
        prompt: "Что точнее всего описывает замыкание?",
        answer: "Функция вместе с доступом к лексическому окружению, где она была создана.",
        distractors: [
          "Объект, который хранит все глобальные переменные.",
          "Способ принудительно привязать this к функции.",
          "Копия всех аргументов функции в момент вызова.",
          "Синтаксис для наследования классов.",
          "Асинхронная очередь браузера.",
        ],
        explain: "Замыкание связано с местом объявления функции и её доступом к внешним переменным.",
      },
      {
        prompt: "Почему createCounter может хранить count между вызовами?",
        answer: "Возвращённая функция продолжает ссылаться на окружение createCounter.",
        distractors: [
          "count автоматически становится глобальной переменной.",
          "return копирует count внутрь window.",
          "JavaScript сериализует состояние функции.",
          "Браузер сохраняет все локальные переменные в DOM.",
          "count хранится в прототипе функции.",
        ],
        explain: "Окружение не удаляется, пока на него есть ссылка через вложенную функцию.",
      },
      {
        prompt: "Что чаще всего вызывает stale closure в React?",
        answer: "Обработчик или эффект использует значение из старого рендера.",
        distractors: [
          "Компонент рендерится только один раз.",
          "CSS-модули не обновили className.",
          "useState всегда мутирует объект напрямую.",
          "Браузер отключил микрозадачи.",
          "JSX компилируется в HTML без JavaScript.",
        ],
        explain: "Функции внутри компонента замыкаются на значения конкретного рендера.",
      },
      {
        prompt: "Чем let помогает в цикле с обработчиками?",
        answer: "Создаёт отдельную блочную привязку переменной для каждой итерации.",
        distractors: [
          "Делает цикл асинхронным.",
          "Копирует DOM-элемент перед обработчиком.",
          "Запрещает создание замыканий.",
          "Автоматически вызывает bind.",
          "Переносит переменную в prototype.",
        ],
        explain: "У let блочная область видимости, поэтому каждая итерация получает свою привязку.",
      },
      {
        prompt: "Когда замыкание может стать проблемой для памяти?",
        answer: "Когда функция удерживает ссылку на большой объект, который больше не нужен.",
        distractors: [
          "Когда функция объявлена через function declaration.",
          "Когда переменная имеет тип number.",
          "Когда код находится в строгом режиме.",
          "Когда функция вызывается синхронно.",
          "Когда объект создан через литерал.",
        ],
        explain: "Сборщик мусора не освободит объект, пока он достижим через замыкание.",
      },
      {
        prompt: "Какой пример является практичным применением замыкания?",
        answer: "Фабрика функции validate, которая помнит набор правил.",
        distractors: [
          "HTML-разметка с несколькими section.",
          "CSS-селектор .button:hover.",
          "JSON-файл без функций.",
          "Обычная строка в localStorage.",
          "Команда npm install.",
        ],
        explain: "Фабрика возвращает функцию, которая использует внешние rules.",
      },
      {
        prompt: "Что будет, если вложенная функция меняет внешнюю переменную?",
        answer: "Она меняет ту же переменную из внешнего окружения.",
        distractors: [
          "Создаётся новая глобальная переменная с тем же именем.",
          "Изменение запрещено спецификацией.",
          "Меняется только локальная копия.",
          "Переменная становится read-only.",
          "Функция теряет доступ к окружению.",
        ],
        explain: "Замыкание даёт доступ к самой привязке переменной, а не к замороженному снимку.",
      },
      {
        prompt: "Что лучше сказать на собеседовании про lexical scope?",
        answer: "Доступность переменных определяется тем, где код написан.",
        distractors: [
          "Доступность переменных определяется только тем, кто вызвал функцию.",
          "Это синоним event loop.",
          "Это часть CSS-каскада.",
          "Это объект, равный this.",
          "Это механизм сборки Vite.",
        ],
        explain: "Lexical значит связанный с расположением кода в исходнике.",
      },
      {
        prompt: "Почему замыкание не равно private field класса?",
        answer: "Они оба могут скрывать состояние, но реализованы разными механизмами.",
        distractors: [
          "private field работает только в CSS.",
          "Замыкания доступны только в Node.js.",
          "Классы не могут хранить состояние.",
          "private field всегда глобальный.",
          "Это полностью одно и то же.",
        ],
        explain: "Замыкание скрывает через область видимости, private field - через синтаксис класса.",
      },
      {
        prompt: "Какой вопрос помогает найти замыкание в коде?",
        answer: "Использует ли функция переменные, объявленные снаружи неё?",
        distractors: [
          "Есть ли у элемента display: grid?",
          "Есть ли у функции имя?",
          "Подключён ли script через defer?",
          "Есть ли у объекта prototype?",
          "Запущен ли код в браузере?",
        ],
        explain: "Если функция обращается к внешним переменным, стоит проверить замыкание.",
      },
    ]),
    tasks: closureTasks,
  },
  {
    id: "js-event-loop-async",
    area: "js",
    title: "Event loop, Promise, async/await и управление запросами",
    subtitle: "Как браузер планирует задачи и почему await не делает код магически синхронным.",
    level: "Production",
    duration: "70 мин",
    outcome: "Ты сможешь объяснить порядок выполнения, отличать microtask от macrotask и проектировать безопасные async-сценарии.",
    sources: [
      { label: "learn.javascript.ru: event loop", url: "https://learn.javascript.ru/event-loop" },
      { label: "learn.javascript.ru: async/await", url: "https://learn.javascript.ru/async-await" },
      { label: "MDN: Promise", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" },
    ],
    sections: [
      {
        title: "Ментальная модель",
        body: [
          "JavaScript выполняет один кусок синхронного кода за раз. Всё, что приходит позже - таймеры, события, ответы сети - попадает в очереди и ждёт, пока стек вызовов освободится.",
          "Promise callbacks и продолжение async-функции после await попадают в очередь микрозадач. Таймеры и многие браузерные события относятся к задачам. Поэтому Promise обычно выполнится раньше setTimeout с нулевой задержкой.",
        ],
        code: `console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");
// A, D, C, B`,
      },
      {
        title: "Async/await в реальном интерфейсе",
        body: [
          "await приостанавливает текущую async-функцию, но не блокирует страницу. Пользователь может кликать, браузер может рисовать, другие задачи могут завершаться.",
          "Производственный код должен думать не только о happy path: отмена запроса при уходе со страницы, гонки между быстрыми кликами, повтор при временной ошибке, состояние loading и пустые ответы.",
        ],
        workExample:
          "В поиске по каталогу нужно отменять устаревший запрос через AbortController. Иначе медленный ответ на старый запрос может перезаписать новые результаты.",
      },
      {
        title: "Гонки и порядок результатов",
        body: [
          "Если пользователь быстро меняет фильтры, ответы могут прийти не в том порядке, в котором запросы были отправлены. Без защиты интерфейс покажет устаревшие данные.",
          "Типовые решения: AbortController, requestId, debounce, serial queue, ограничение параллельности.",
        ],
        code: `let lastRequestId = 0;

async function loadProducts(query) {
  const requestId = lastRequestId + 1;
  lastRequestId = requestId;

  const response = await fetch("/api/products?q=" + query);
  const products = await response.json();

  if (requestId === lastRequestId) {
    renderProducts(products);
  }
}`,
      },
    ],
    cheatsheet: [
      "Сначала выполняется синхронный код.",
      "Микрозадачи Promise выполняются перед следующей задачей таймера.",
      "await возвращает управление event loop и продолжает функцию позже.",
      "Ошибки await ловятся try/catch, ошибки Promise - catch или await.",
      "Отмена, гонки и повтор запросов - часть нормального async-кода.",
    ],
    pitfalls: [
      "Не запускать независимые запросы последовательно, если их можно выполнить через Promise.all.",
      "Не забывать обрабатывать reject: молчаливые ошибки ломают UX.",
      "Не обновлять состояние после размонтирования или устаревшего запроса.",
    ],
    interview: [
      "Почему Promise.then выполнится раньше setTimeout(fn, 0)?",
      "Чем Promise.all отличается от Promise.allSettled?",
      "Как отменить fetch?",
      "Как защититься от гонки запросов в поиске?",
    ],
    quiz: makeQuiz([
      {
        prompt: "Что выполнится раньше: Promise.then или setTimeout(..., 0), если оба поставлены из одного синхронного блока?",
        answer: "Promise.then, потому что микрозадачи выполняются перед следующей задачей.",
        distractors: [
          "setTimeout, потому что у него задержка 0.",
          "Всегда случайный порядок.",
          "Оба выполнятся строго одновременно.",
          "Зависит только от скорости сети.",
          "Ни один не выполнится без await.",
        ],
        explain: "После синхронного кода движок очищает очередь микрозадач, затем берёт следующую задачу.",
      },
      {
        prompt: "Что делает await внутри async-функции?",
        answer: "Приостанавливает продолжение этой функции до результата промиса.",
        distractors: [
          "Блокирует весь поток браузера.",
          "Делает fetch синхронным запросом.",
          "Создаёт новый Web Worker.",
          "Отменяет промис при уходе со страницы.",
          "Преобразует HTML в JSON.",
        ],
        explain: "await не блокирует страницу, он возвращает управление event loop.",
      },
      {
        prompt: "Когда лучше использовать Promise.all?",
        answer: "Когда несколько независимых async-операций можно выполнять параллельно.",
        distractors: [
          "Когда второй запрос зависит от результата первого.",
          "Когда нужно проигнорировать все ошибки.",
          "Когда нужно выполнить задачи строго по одной.",
          "Когда надо заменить try/catch.",
          "Когда данные лежат в CSS.",
        ],
        explain: "Promise.all ускоряет независимые операции, но падает при первом reject.",
      },
      {
        prompt: "Зачем нужен AbortController в интерфейсах?",
        answer: "Чтобы отменять устаревшие или больше не нужные запросы.",
        distractors: [
          "Чтобы ускорить CSS-анимации.",
          "Чтобы превратить Promise в Observable.",
          "Чтобы скрыть ошибку сервера.",
          "Чтобы удалить обработчики DOM автоматически.",
          "Чтобы сериализовать FormData.",
        ],
        explain: "AbortController особенно полезен в поиске, фильтрах и при уходе со страницы.",
      },
      {
        prompt: "Что опасно в цепочке await fetchA(); await fetchB();, если запросы независимы?",
        answer: "Второй запрос ждёт первый без необходимости, общее время растёт.",
        distractors: [
          "Оба запроса гарантированно отменятся.",
          "fetchB выполнится раньше fetchA.",
          "JavaScript запретит такой код.",
          "Ответы попадут в CSSOM.",
          "try/catch перестанет работать.",
        ],
        explain: "Независимые запросы лучше запускать параллельно и ждать вместе.",
      },
      {
        prompt: "Что произойдёт при reject внутри async-функции без try/catch?",
        answer: "Промис, который вернула async-функция, станет rejected.",
        distractors: [
          "Ошибка всегда исчезнет.",
          "Функция станет синхронной.",
          "Браузер повторит запрос автоматически.",
          "setTimeout остановится.",
          "DOM перезагрузится.",
        ],
        explain: "async-функция всегда возвращает Promise; ошибка превращается в reject.",
      },
      {
        prompt: "Как защититься от устаревшего ответа поиска?",
        answer: "Сравнить requestId или отменить предыдущий запрос.",
        distractors: [
          "Поставить z-index выше.",
          "Использовать var вместо let.",
          "Всегда ждать 10 секунд.",
          "Удалить input после ввода.",
          "Хранить ответ в data-атрибуте.",
        ],
        explain: "Нужно связать ответ с актуальным запросом и не применять старые данные.",
      },
      {
        prompt: "Что делает Promise.allSettled?",
        answer: "Ждёт завершения всех промисов и возвращает статусы fulfilled/rejected.",
        distractors: [
          "Останавливается на первом fulfilled.",
          "Отменяет все rejected промисы.",
          "Сортирует ответы по времени выполнения.",
          "Работает только с fetch.",
          "Заменяет event loop.",
        ],
        explain: "allSettled полезен, когда нужны результаты всех операций, даже если часть упала.",
      },
      {
        prompt: "Почему тяжёлый синхронный цикл плохо влияет на интерфейс?",
        answer: "Он занимает call stack и не даёт браузеру обрабатывать ввод и отрисовку.",
        distractors: [
          "Он всегда превращается в микрозадачу.",
          "Он удаляет localStorage.",
          "Он блокирует только CSS, но не JS.",
          "Он работает быстрее через Promise.then.",
          "Он не влияет на страницу.",
        ],
        explain: "Однопоточный JS должен отдавать управление, иначе UI зависает.",
      },
      {
        prompt: "Где правильно ловить ошибку await?",
        answer: "В try/catch вокруг await или через catch у возвращённого промиса.",
        distractors: [
          "Только в CSS media query.",
          "В атрибуте alt.",
          "Через JSON.stringify.",
          "Только внутри setTimeout.",
          "Ошибки await нельзя поймать.",
        ],
        explain: "await позволяет писать асинхронные ошибки похожими на синхронные.",
      },
    ]),
    tasks: asyncTasks,
  },
  {
    id: "js-prototypes-classes",
    area: "js",
    title: "Прототипы, классы и наследование без магии",
    subtitle: "Как class связан с prototype и где ООП в JavaScript действительно полезно.",
    level: "Interview",
    duration: "60 мин",
    outcome: "Ты сможешь объяснить prototype chain, class syntax, super, private fields и выбрать класс или композицию осознанно.",
    sources: [
      { label: "learn.javascript.ru: классы", url: "https://learn.javascript.ru/classes" },
      { label: "MDN: Classes", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes" },
      { label: "Дока: JavaScript", url: "https://doka.guide/js/" },
    ],
    sections: [
      {
        title: "Prototype chain",
        body: [
          "В JavaScript объекты могут ссылаться на другой объект как на прототип. Если свойства нет в самом объекте, движок ищет его выше по цепочке.",
          "Методы класса попадают в prototype, поэтому экземпляры не хранят копию каждого метода. Это экономит память и объясняет, почему методы доступны всем объектам класса.",
        ],
        code: `const user = { name: "Ada" };
const canSayHi = {
  sayHi() {
    return "Hi, " + this.name;
  },
};

Object.setPrototypeOf(user, canSayHi);
console.log(user.sayHi());`,
      },
      {
        title: "Class - синтаксис поверх прототипов",
        body: [
          "class делает прототипное поведение читабельнее, но не превращает JavaScript в Java. Под капотом методы всё равно лежат в prototype, а constructor создаёт и настраивает экземпляр.",
          "extends связывает прототипы классов, а super вызывает родительский constructor или метод.",
        ],
        workExample:
          "Классы удобны для UI-виджетов с общим жизненным циклом: Modal, Dropdown, Tooltip. Но для бизнес-логики часто проще композиция функций.",
        code: `class View {
  constructor(root) {
    this.root = root;
  }

  show() {
    this.root.hidden = false;
  }
}

class Modal extends View {
  close() {
    this.root.hidden = true;
  }
}`,
      },
      {
        title: "Private fields и границы ответственности",
        body: [
          "Поля вида #state доступны только внутри класса. Это полезно, когда нужно защитить внутреннюю реализацию от случайного изменения.",
          "Но класс не должен становиться контейнером всего подряд. Если объекту не нужен жизненный цикл и инварианты, простая функция или объект будут честнее.",
        ],
      },
    ],
    cheatsheet: [
      "prototype - объект, где обычно лежат общие методы.",
      "__proto__ - исторический доступ к прототипу конкретного объекта; в новом коде лучше Object.getPrototypeOf.",
      "class методы не перечисляются в for...in.",
      "super в constructor наследника вызывается до обращения к this.",
      "Композиция часто проще наследования.",
    ],
    pitfalls: [
      "Не путать prototype функции-конструктора и [[Prototype]] объекта.",
      "Не делать глубокую иерархию классов для простого UI.",
      "Не терять this при передаче метода как колбэка.",
    ],
    interview: [
      "Что происходит при чтении свойства, которого нет в объекте?",
      "Чем class отличается от function constructor?",
      "Зачем нужен super?",
      "Когда наследование хуже композиции?",
    ],
    quiz: makeQuiz([
      {
        prompt: "Что делает prototype chain?",
        answer: "Позволяет искать свойства в прототипах, если их нет в самом объекте.",
        distractors: [
          "Копирует все методы в каждый объект.",
          "Запускает асинхронные задачи.",
          "Отвечает за CSS-наследование.",
          "Сохраняет объект в localStorage.",
          "Автоматически валидирует формы.",
        ],
        explain: "Поиск свойства идёт от объекта к его прототипу и выше.",
      },
      {
        prompt: "Где обычно находятся методы, объявленные внутри class?",
        answer: "В prototype класса.",
        distractors: [
          "В каждом экземпляре как отдельная копия.",
          "В window.",
          "В localStorage.",
          "В CSSOM.",
          "В HTML-атрибутах.",
        ],
        explain: "Методы класса общие для экземпляров и лежат в prototype.",
      },
      {
        prompt: "Зачем вызывают super() в constructor наследника?",
        answer: "Чтобы выполнить constructor родителя и инициализировать this.",
        distractors: [
          "Чтобы удалить prototype.",
          "Чтобы сделать метод статическим.",
          "Чтобы остановить event loop.",
          "Чтобы включить strict mode.",
          "Чтобы превратить объект в массив.",
        ],
        explain: "До super() в constructor наследника нельзя обращаться к this.",
      },
      {
        prompt: "Что делает private field #value?",
        answer: "Ограничивает доступ к полю кодом внутри класса.",
        distractors: [
          "Делает поле доступным всем потомкам через CSS.",
          "Создаёт поле в window.",
          "Запрещает создание экземпляра.",
          "Делает поле асинхронным.",
          "Сохраняет поле в JSON автоматически.",
        ],
        explain: "# поля проверяются языком и недоступны обычным обращением снаружи.",
      },
      {
        prompt: "Почему метод класса может потерять this при передаче в addEventListener?",
        answer: "this определяется способом вызова функции.",
        distractors: [
          "class не поддерживает методы.",
          "DOM удаляет все свойства объекта.",
          "prototype очищается после первого вызова.",
          "addEventListener принимает только стрелочные функции.",
          "this всегда равен null.",
        ],
        explain: "Если метод передан отдельно, он вызывается уже не как object.method().",
      },
      {
        prompt: "Когда композиция обычно лучше наследования?",
        answer: "Когда объекту нужны независимые возможности без жёсткой иерархии.",
        distractors: [
          "Когда надо повторить один и тот же код вручную.",
          "Когда есть только один объект Date.",
          "Когда HTML невалиден.",
          "Когда нужны глобальные переменные.",
          "Когда Promise rejected.",
        ],
        explain: "Композиция снижает связность и глубину иерархий.",
      },
      {
        prompt: "Что вернёт Object.getPrototypeOf(obj)?",
        answer: "Прототип конкретного объекта.",
        distractors: [
          "Все ключи объекта в массиве.",
          "JSON-представление объекта.",
          "Родительский DOM-элемент.",
          "Список CSS-классов.",
          "Текущий call stack.",
        ],
        explain: "Это современный способ прочитать [[Prototype]].",
      },
      {
        prompt: "Что такое static method?",
        answer: "Метод класса, вызываемый на самом классе, а не на экземпляре.",
        distractors: [
          "Метод, который нельзя вызвать.",
          "Метод, который всегда возвращает строку.",
          "Метод, который хранится в localStorage.",
          "Метод, который работает только после await.",
          "Метод DOM-элемента.",
        ],
        explain: "Например, Date.now вызывается на Date, а не на new Date().",
      },
      {
        prompt: "Чем class syntax полезен по сравнению с ручной настройкой prototype?",
        answer: "Делает создание конструктора, методов и наследования более читаемым.",
        distractors: [
          "Полностью отключает прототипы.",
          "Ускоряет сеть.",
          "Заменяет HTML.",
          "Автоматически делает все поля приватными.",
          "Запрещает наследование.",
        ],
        explain: "class - удобный синтаксис, а не другой объектный механизм.",
      },
      {
        prompt: "Какая проблема у глубокой иерархии классов?",
        answer: "Поведение становится трудно проследить и переиспользовать отдельно.",
        distractors: [
          "Нельзя использовать constructor.",
          "Все методы исчезают из prototype.",
          "CSS перестаёт работать.",
          "Promise.all перестаёт ждать промисы.",
          "Нельзя создать экземпляр.",
        ],
        explain: "Слишком глубокое наследование повышает связность и усложняет изменения.",
      },
    ]),
    tasks: classesTasks,
  },
  {
    id: "js-dom-events",
    area: "js",
    title: "DOM, события и делегирование",
    subtitle: "Как безопасно находить элементы, обновлять интерфейс и работать с событиями без хаоса.",
    level: "Core",
    duration: "60 мин",
    outcome: "Ты сможешь строить интерактивные элементы на чистом JS и объяснять всплытие, погружение, target/currentTarget.",
    sources: [
      { label: "learn.javascript.ru: браузерные события", url: "https://learn.javascript.ru/introduction-browser-events" },
      { label: "MDN: Event bubbling", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling" },
      { label: "Дока: DOM", url: "https://doka.guide/js/dom/" },
    ],
    sections: [
      {
        title: "DOM как дерево объектов",
        body: [
          "HTML после парсинга становится DOM-деревом. JavaScript работает не со строкой HTML, а с объектами: Element, Node, Document.",
          "Изменение DOM может быть дорогим, если делать его слишком часто и без структуры. Поэтому в реальном коде изменения группируют, используют шаблоны и минимизируют лишние перерисовки.",
        ],
        code: `const item = document.createElement("li");
item.textContent = "Новая задача";

document.querySelector(".todo-list").append(item);`,
      },
      {
        title: "События: target и currentTarget",
        body: [
          "event.target - реальный элемент, с которого началось событие. event.currentTarget - элемент, на котором сейчас выполняется обработчик.",
          "Это различие особенно важно при делегировании: обработчик висит на контейнере, а действие зависит от кнопки внутри.",
        ],
        code: `list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  console.log(event.currentTarget); // list
  console.log(button.dataset.action);
});`,
      },
      {
        title: "Делегирование",
        body: [
          "Делегирование уменьшает количество обработчиков и работает для элементов, добавленных позже. Вместо обработчика на каждой кнопке мы слушаем общий контейнер.",
          "Главное правило - проверять, что клик действительно пришёл из нужной области, и использовать closest аккуратно.",
        ],
        workExample:
          "В таблице заказов можно повесить один обработчик на tbody и реагировать на data-action='edit' или data-action='archive' для любой строки.",
      },
    ],
    cheatsheet: [
      "querySelector возвращает первый элемент, querySelectorAll - статический список.",
      "target - исходная цель события, currentTarget - текущий обработчик.",
      "closest ищет ближайшего предка по селектору.",
      "preventDefault отменяет действие браузера, stopPropagation останавливает всплытие.",
      "Делегирование хорошо для списков, таблиц и динамических элементов.",
    ],
    pitfalls: [
      "Не вешать сотни одинаковых обработчиков, если можно делегировать.",
      "Не использовать innerHTML с пользовательским вводом без очистки.",
      "Не забывать снимать обработчики, если элемент живёт недолго.",
    ],
    interview: [
      "Чем target отличается от currentTarget?",
      "Что такое всплытие события?",
      "Когда нужно preventDefault, а когда stopPropagation?",
      "Почему делегирование работает для новых элементов?",
    ],
    quiz: makeQuiz([
      {
        prompt: "Что такое DOM?",
        answer: "Объектное представление HTML-документа.",
        distractors: [
          "CSS-файл с переменными.",
          "Серверный протокол передачи данных.",
          "Способ объявления классов JS.",
          "Очередь микрозадач.",
          "Формат базы данных.",
        ],
        explain: "DOM позволяет JavaScript читать и менять структуру страницы.",
      },
      {
        prompt: "Чем event.target отличается от event.currentTarget?",
        answer: "target - исходный элемент события, currentTarget - элемент текущего обработчика.",
        distractors: [
          "Это всегда одно и то же.",
          "target доступен только в CSS.",
          "currentTarget показывает URL страницы.",
          "target хранит только координаты мыши.",
          "currentTarget работает только с submit.",
        ],
        explain: "При всплытии событие проходит через родителей, и currentTarget меняется.",
      },
      {
        prompt: "Главная польза делегирования событий?",
        answer: "Один обработчик может обслуживать много дочерних элементов, включая добавленные позже.",
        distractors: [
          "События перестают всплывать.",
          "DOM становится неизменяемым.",
          "CSS получает больший приоритет.",
          "Каждая кнопка получает отдельный поток.",
          "HTML валидируется автоматически.",
        ],
        explain: "Делегирование опирается на всплытие событий.",
      },
      {
        prompt: "Что делает preventDefault?",
        answer: "Отменяет стандартное действие браузера для события.",
        distractors: [
          "Удаляет элемент из DOM.",
          "Останавливает все future Promise.",
          "Меняет currentTarget.",
          "Создаёт новый обработчик.",
          "Очищает localStorage.",
        ],
        explain: "Например, можно отменить отправку формы для кастомной валидации.",
      },
      {
        prompt: "Что делает stopPropagation?",
        answer: "Останавливает дальнейшее распространение события по дереву.",
        distractors: [
          "Отменяет href у ссылки.",
          "Удаляет класс active.",
          "Перезапускает event loop.",
          "Сохраняет форму в sessionStorage.",
          "Ставит таймер на 0 мс.",
        ],
        explain: "Событие не пойдёт к следующим родителям в фазе всплытия.",
      },
      {
        prompt: "Почему innerHTML с пользовательским вводом опасен?",
        answer: "Можно внедрить и выполнить нежелательную разметку или скрипт.",
        distractors: [
          "innerHTML всегда медленнее fetch.",
          "Он отключает CSS Grid.",
          "Он не работает в браузере.",
          "Он делает текст невидимым для всех.",
          "Он запрещён TypeScript.",
        ],
        explain: "Для пользовательского текста безопаснее textContent или очистка HTML.",
      },
      {
        prompt: "Что вернёт querySelectorAll?",
        answer: "Статический NodeList подходящих элементов.",
        distractors: [
          "Только первый элемент.",
          "Живую HTMLCollection во всех случаях.",
          "Promise с массивом элементов.",
          "CSSRuleList.",
          "Событие click.",
        ],
        explain: "NodeList от querySelectorAll не обновляется автоматически при изменении DOM.",
      },
      {
        prompt: "Для чего подходит closest?",
        answer: "Найти ближайшего предка или сам элемент, подходящий под селектор.",
        distractors: [
          "Сравнить две даты.",
          "Отменить сетевой запрос.",
          "Сделать элемент focusable.",
          "Сериализовать форму в JSON.",
          "Создать новый shadow root.",
        ],
        explain: "closest часто используют в делегировании событий.",
      },
      {
        prompt: "Когда нужно снимать обработчик события?",
        answer: "Когда элемент или логика больше не нужны, чтобы избежать лишних вызовов и утечек.",
        distractors: [
          "После каждого console.log.",
          "Перед каждым querySelector.",
          "Только если используется CSS.",
          "Никогда, браузер всегда всё удалит сразу.",
          "Только в Node.js.",
        ],
        explain: "Особенно важно для долгоживущих объектов и подписок.",
      },
      {
        prompt: "Что лучше для вставки обычного пользовательского текста?",
        answer: "textContent.",
        distractors: [
          "innerHTML без проверки.",
          "eval.",
          "document.write после загрузки.",
          "setTimeout.",
          "Object.setPrototypeOf.",
        ],
        explain: "textContent вставляет текст, а не интерпретирует HTML.",
      },
    ]),
    tasks: domTasks,
  },
  {
    id: "css-cascade-architecture",
    area: "css",
    title: "Каскад, специфичность, слои и архитектура CSS",
    subtitle: "Почему стиль победил, как это предсказать и как не устроить войну селекторов.",
    level: "Production",
    duration: "65 мин",
    outcome: "Ты сможешь разбирать конфликт стилей, проектировать компоненты и использовать @layer без случайных !important.",
    sources: [
      { label: "MDN: Cascade", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade" },
      { label: "MDN: Specificity", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity" },
      { label: "Дока: CSS", url: "https://doka.guide/css/" },
    ],
    sections: [
      {
        title: "Каскад как алгоритм",
        body: [
          "Каскад решает, какое объявление применить, когда несколько правил претендуют на одно свойство. Важны источник стиля, важность, слои, специфичность, порядок и наследование.",
          "Если думать о каскаде как об алгоритме, пропадает желание добавлять !important наугад. Становится видно, где именно конфликт.",
        ],
        bullets: [
          "Слой с более поздним приоритетом выигрывает у предыдущего слоя.",
          "Внутри слоя работает специфичность и порядок.",
          "Наследование передаёт не все свойства, а только наследуемые.",
        ],
        code: `@layer reset, base, components, utilities;

@layer components {
  .button {
    color: white;
    background: #111827;
  }
}

@layer utilities {
  .text-danger {
    color: #b91c1c;
  }
}`,
      },
      {
        title: "Специфичность",
        body: [
          "Специфичность - вес селектора. id сильнее class, class сильнее тега. Но @layer может изменить результат: правило в более приоритетном слое победит даже при меньшей специфичности.",
          "Хорошая CSS-архитектура снижает специфичность, чтобы стили было легко переопределять.",
        ],
        workExample:
          "В дизайн-системе компонент .button не должен зависеть от .checkout-page .sidebar .form button. Чем длиннее селектор, тем дороже его поддерживать.",
      },
      {
        title: "Практический стандарт",
        body: [
          "Разделяй reset, базовую типографику, компоненты и utilities. Не смешивай глобальные правила страницы с внутренностями компонента.",
          "Для современного проекта полезно договориться: компоненты пишутся низкой специфичностью, состояния - через классы или атрибуты, одноразовые утилиты - в отдельном слое.",
        ],
      },
    ],
    cheatsheet: [
      "Сначала источник и important, затем layer, specificity и order.",
      ":where() даёт нулевую специфичность и полезен для базовых правил.",
      "Не лечить архитектурную проблему !important.",
      "Состояния компонента лучше описывать явно: .button[disabled], .button.is-loading.",
      "Слои помогают держать reset, components и utilities под контролем.",
    ],
    pitfalls: [
      "Не строить селекторы по всей вложенности DOM.",
      "Не смешивать глобальные стили страницы и переиспользуемый компонент.",
      "Не использовать id в CSS дизайн-системы без крайней причины.",
    ],
    interview: [
      "Как считается специфичность?",
      "Что меняет @layer?",
      "Когда можно использовать !important?",
      "Чем :where отличается от :is по специфичности?",
    ],
    quiz: makeQuiz([
      {
        prompt: "Что решает CSS-каскад?",
        answer: "Какое объявление применить, если правил для свойства несколько.",
        distractors: [
          "Как браузер выполняет Promise.",
          "Как HTML превращается в DOM.",
          "Как React сравнивает state.",
          "Как отправить fetch-запрос.",
          "Как создать private field.",
        ],
        explain: "Каскад - алгоритм выбора итогового значения CSS-свойства.",
      },
      {
        prompt: "Что обычно повышает специфичность сильнее всего из обычных селекторов?",
        answer: "ID-селектор.",
        distractors: [
          "Селектор тега.",
          "Универсальный селектор *.",
          "Псевдоэлемент.",
          "Пробел между селекторами.",
          "Комментарий CSS.",
        ],
        explain: "ID имеет больший вес, чем классы и теги.",
      },
      {
        prompt: "Зачем нужен @layer?",
        answer: "Чтобы явно управлять приоритетом групп CSS-правил.",
        distractors: [
          "Чтобы создать DOM-слой.",
          "Чтобы заменить media queries.",
          "Чтобы включить JavaScript в CSS.",
          "Чтобы автоматически минифицировать код.",
          "Чтобы хранить данные формы.",
        ],
        explain: "@layer добавляет уровень управления перед специфичностью внутри слоя.",
      },
      {
        prompt: "Чем полезен :where()?",
        answer: "Он позволяет писать селектор с нулевой специфичностью.",
        distractors: [
          "Он выполняет HTTP-запрос.",
          "Он создаёт CSS Grid.",
          "Он работает только в React.",
          "Он запрещает наследование.",
          "Он добавляет important.",
        ],
        explain: ":where() удобен для базовых правил, которые легко переопределить.",
      },
      {
        prompt: "Почему длинные селекторы вроде .page .sidebar .form button опасны?",
        answer: "Они сильно связывают стиль с конкретной структурой DOM.",
        distractors: [
          "Они всегда невалидны.",
          "Они не работают в Chrome.",
          "Они превращаются в inline-style.",
          "Они удаляют accessibility tree.",
          "Они запрещают hover.",
        ],
        explain: "При изменении разметки такие стили ломаются или становятся трудными для переопределения.",
      },
      {
        prompt: "Когда !important может быть оправдан?",
        answer: "В редких utility-правилах или при переопределении внешнего кода, когда есть понятная причина.",
        distractors: [
          "В каждом компоненте для надёжности.",
          "Чтобы заменить все классы.",
          "Чтобы исправить JavaScript-ошибку.",
          "Чтобы сделать input обязательным.",
          "Чтобы ускорить загрузку страницы.",
        ],
        explain: "!important - инструмент последнего уровня, а не стандартная архитектура.",
      },
      {
        prompt: "Что такое наследование в CSS?",
        answer: "Передача некоторых свойств от родителя к потомкам.",
        distractors: [
          "Наследование классов JavaScript.",
          "Копирование всех свойств без исключения.",
          "Автоматическое создание media query.",
          "Поведение Promise.",
          "Изменение URL страницы.",
        ],
        explain: "Например, color наследуется, а margin обычно нет.",
      },
      {
        prompt: "Что победит при равной специфичности и одном слое?",
        answer: "Правило, объявленное позже.",
        distractors: [
          "Правило с более коротким именем класса.",
          "Первое правило в файле.",
          "Правило с большим количеством комментариев.",
          "Правило с русским текстом.",
          "Ни одно правило.",
        ],
        explain: "Порядок в источнике важен, когда предыдущие критерии равны.",
      },
      {
        prompt: "Почему компоненты лучше писать с низкой специфичностью?",
        answer: "Их проще переиспользовать, расширять и переопределять.",
        distractors: [
          "Они автоматически становятся быстрее JS.",
          "Они исчезают из DevTools.",
          "Они не требуют HTML.",
          "Они получают доступ к localStorage.",
          "Они работают только в Safari.",
        ],
        explain: "Низкая специфичность снижает борьбу правил между компонентами и страницами.",
      },
      {
        prompt: "Какой слой логично держать последним?",
        answer: "utilities, если они должны точечно переопределять компоненты.",
        distractors: [
          "reset, чтобы он ломал компоненты.",
          "base перед reset.",
          "Любой случайный порядок.",
          "comments.",
          "HTML.",
        ],
        explain: "Поздние слои имеют больший приоритет при нормальном каскаде.",
      },
    ]),
    tasks: cssCascadeTasks,
  },
  {
    id: "css-layout-responsive",
    area: "css",
    title: "Flex, Grid, адаптивность и container queries",
    subtitle: "Как выбирать раскладку под задачу и делать мобильную версию без костылей.",
    level: "Production",
    duration: "75 мин",
    outcome: "Ты сможешь верстать адаптивные интерфейсы, выбирать flex или grid и проверять отсутствие горизонтального скролла.",
    sources: [
      { label: "MDN: CSS layout", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout" },
      { label: "MDN: CSS grid", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout" },
      { label: "Дока: CSS", url: "https://doka.guide/css/" },
    ],
    sections: [
      {
        title: "Flex или Grid",
        body: [
          "Flexbox хорош для одномерных раскладок: строка кнопок, навигация, выравнивание внутри карточки. Grid хорош, когда важны строки и колонки одновременно.",
          "Главная ошибка новичка - пытаться решить всё через flex и фиксированные ширины. В адаптивном интерфейсе лучше дать браузеру правила, по которым он сам распределит пространство.",
        ],
        code: `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 16px;
}`,
      },
      {
        title: "Мобильная версия как база",
        body: [
          "Mobile first не означает бедный интерфейс. Это значит, что базовая разметка работает на узком экране, а затем усиливается для планшета и десктопа.",
          "Важная проверка: documentElement.scrollWidth не должен быть больше clientWidth. Горизонтальный скролл почти всегда показывает, что где-то есть фиксированная ширина, длинная строка или невнимательный grid.",
        ],
        workExample:
          "В учебной платформе список тем на телефоне лучше превращать в горизонтальный rail или раскрывающуюся панель, а не оставлять двухколоночный desktop layout.",
      },
      {
        title: "Container queries",
        body: [
          "Media query смотрит на ширину viewport. Container query смотрит на размер контейнера. Это важно для компонентов, которые могут жить в сайдбаре, модалке или широкой области.",
          "Компонент становится более независимым: он адаптируется не к странице целиком, а к месту, куда его поставили.",
        ],
      },
    ],
    cheatsheet: [
      "Flex - одна ось, Grid - две оси.",
      "minmax(min(100%, X), 1fr) помогает избежать вылета за экран.",
      "Не задавать width: 100vw внутренним блокам без причины.",
      "Использовать gap вместо margin-сеток, когда можно.",
      "Проверять 360px, 768px, 1280px и длинные тексты.",
    ],
    pitfalls: [
      "Фиксированные ширины карточек ломают мобильный экран.",
      "100vw может включать ширину scrollbar и давать лишний скролл.",
      "Grid без minmax может сжимать элементы неожиданно.",
    ],
    interview: [
      "Когда выбрать Grid, а когда Flexbox?",
      "Что делает minmax?",
      "Чем media query отличается от container query?",
      "Почему появляется горизонтальный скролл на мобильном?",
    ],
    quiz: makeQuiz([
      {
        prompt: "Когда Grid обычно подходит лучше Flexbox?",
        answer: "Когда нужно управлять строками и колонками одновременно.",
        distractors: [
          "Когда есть только одна кнопка.",
          "Когда надо выполнить fetch.",
          "Когда нужно создать замыкание.",
          "Когда HTML не содержит div.",
          "Когда нужен this.",
        ],
        explain: "Grid - двумерная раскладка.",
      },
      {
        prompt: "Что помогает auto-fit вместе с minmax?",
        answer: "Автоматически распределять карточки по доступной ширине.",
        distractors: [
          "Запускать JS без браузера.",
          "Менять prototype объекта.",
          "Добавлять alt картинке.",
          "Отменять событие submit.",
          "Сохранять прогресс в localStorage.",
        ],
        explain: "Это частый паттерн адаптивной сетки без лишних breakpoint.",
      },
      {
        prompt: "Почему width: 100vw может создать горизонтальный скролл?",
        answer: "100vw может учитывать ширину scrollbar и стать шире доступной области.",
        distractors: [
          "100vw всегда меньше 100%.",
          "vw работает только внутри Grid.",
          "vw отключает box-sizing.",
          "vw делает элемент position fixed.",
          "vw заменяет rem.",
        ],
        explain: "Для внутренних блоков часто безопаснее width: 100%.",
      },
      {
        prompt: "Чем container query отличается от media query?",
        answer: "Container query реагирует на размер контейнера, media query - на viewport или среду.",
        distractors: [
          "Container query работает только с JS.",
          "Media query запрещена в мобильной версии.",
          "Они полностью одинаковые.",
          "Container query управляет Promise.",
          "Media query меняет DOM.",
        ],
        explain: "Container query делает компонент контекстно адаптивным.",
      },
      {
        prompt: "Что означает mobile first в CSS?",
        answer: "Базовые стили пишутся для узкого экрана, расширения добавляются для больших.",
        distractors: [
          "Десктопная версия не нужна.",
          "Все размеры должны быть в px.",
          "Нельзя использовать Grid.",
          "Нужно удалить hover.",
          "HTML должен быть отдельным для телефона.",
        ],
        explain: "Это стратегия прогрессивного усложнения интерфейса.",
      },
      {
        prompt: "Для чего чаще всего используют gap?",
        answer: "Для расстояний между flex/grid-элементами.",
        distractors: [
          "Для объявления переменной JS.",
          "Для отмены формы.",
          "Для чтения localStorage.",
          "Для создания класса.",
          "Для изменения URL.",
        ],
        explain: "gap проще и предсказуемее, чем индивидуальные margin в сетках.",
      },
      {
        prompt: "Что проверяет scrollWidth > clientWidth?",
        answer: "Есть ли горизонтальное переполнение страницы.",
        distractors: [
          "Есть ли ошибки Promise.",
          "Есть ли у элемента alt.",
          "Есть ли prototype chain.",
          "Есть ли сетевой кеш.",
          "Есть ли React state.",
        ],
        explain: "Это полезная автоматическая проверка мобильной версии.",
      },
      {
        prompt: "Почему fixed-width карточка опасна?",
        answer: "Она может не поместиться на маленьком экране.",
        distractors: [
          "Она отключает семантику HTML.",
          "Она всегда создаёт XSS.",
          "Она запрещает CSS-переменные.",
          "Она делает Promise rejected.",
          "Она удаляет DOM-узел.",
        ],
        explain: "Для адаптива лучше min/max и гибкие треки.",
      },
      {
        prompt: "Что делает flex-wrap?",
        answer: "Разрешает flex-элементам переноситься на новую строку.",
        distractors: [
          "Меняет порядок event loop.",
          "Создаёт columns в Grid.",
          "Превращает div в form.",
          "Добавляет aria-label.",
          "Останавливает анимацию.",
        ],
        explain: "Без wrap элементы могут сжиматься или переполнять контейнер.",
      },
      {
        prompt: "Что лучше использовать для равномерной сетки учебных карточек?",
        answer: "CSS Grid с repeat(auto-fit, minmax(...)).",
        distractors: [
          "Абсолютное позиционирование каждой карточки.",
          "Таблицу для раскладки.",
          "Много br между карточками.",
          "setTimeout для каждой карточки.",
          "Один огромный image.",
        ],
        explain: "Grid даёт браузеру понятные правила распределения карточек.",
      },
    ]),
    tasks: cssLayoutTasks,
  },
  {
    id: "html-semantics-forms-a11y",
    area: "html",
    title: "Семантика, формы и доступность HTML",
    subtitle: "HTML как контракт с браузером, поиском, клавиатурой и вспомогательными технологиями.",
    level: "Production",
    duration: "70 мин",
    outcome: "Ты сможешь выбирать теги по смыслу, делать формы удобными на телефоне и не ломать базовую доступность.",
    sources: [
      { label: "Дока: HTML", url: "https://doka.guide/html/" },
      { label: "Дока: доступность", url: "https://doka.guide/a11y/" },
      { label: "MDN: HTML forms", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms" },
    ],
    sections: [
      {
        title: "Семантика - это не украшение",
        body: [
          "Семантический HTML сообщает смысл: где навигация, где основное содержимое, где статья, где кнопка действия. Браузер, скринридер, поиск и автозаполнение используют эту информацию.",
          "div нейтрален. Он нужен для группировки, но если элемент выполняет роль кнопки, ссылки, формы или заголовка, лучше использовать соответствующий тег.",
        ],
        code: `<main>
  <article>
    <h1>Как работает доставка</h1>
    <p>Заказ можно получить курьером или в пункте выдачи.</p>
  </article>
</main>`,
      },
      {
        title: "Формы",
        body: [
          "Хорошая форма начинается не с CSS, а с правильной связи label и input. Пользователь может нажать на label, мобильная клавиатура выбирает подходящий режим, браузер помогает валидировать данные.",
          "fieldset и legend объединяют связанные поля, например радиокнопки выбора доставки. autocomplete помогает пользователю не вводить одно и то же руками.",
        ],
        code: `<label for="phone">Телефон</label>
<input id="phone" name="phone" type="tel" autocomplete="tel" required />`,
        workExample:
          "В checkout-форме правильные type и autocomplete напрямую влияют на конверсию: телефон открывает цифровую клавиатуру, email проверяется браузером, адрес может подставляться автоматически.",
      },
      {
        title: "Доступность как качество интерфейса",
        body: [
          "Доступность не отдельная фича. Это проверка, может ли интерфейс работать без мыши, с понятными именами контролов и без потери смысла при чтении по структуре.",
          "ARIA нужна для сложных виджетов, но она не заменяет нативные теги. Сначала выбираем правильный HTML, затем добавляем ARIA только при необходимости.",
        ],
      },
    ],
    cheatsheet: [
      "button для действия, a для перехода.",
      "У каждого input должен быть label.",
      "fieldset и legend группируют связанные поля.",
      "alt описывает смысл изображения, а не его внешний вид ради внешнего вида.",
      "tabindex=0 добавляет в порядок фокуса, tabindex=-1 позволяет фокусировать программно.",
    ],
    pitfalls: [
      "Не делать div с onClick вместо button без крайней причины.",
      "Не оставлять placeholder единственным описанием поля.",
      "Не добавлять ARIA, если нативный HTML уже решает задачу.",
    ],
    interview: [
      "Почему button лучше div role='button'?",
      "Как связать label и input?",
      "Когда alt должен быть пустым?",
      "Чем required отличается от aria-required?",
    ],
    quiz: makeQuiz([
      {
        prompt: "Что лучше использовать для действия 'Сохранить форму'?",
        answer: "button.",
        distractors: [
          "a без href.",
          "div с onClick без клавиатурной поддержки.",
          "span с cursor pointer.",
          "img.",
          "meta.",
        ],
        explain: "button уже имеет нужную семантику и клавиатурное поведение.",
      },
      {
        prompt: "Зачем связывать label и input?",
        answer: "Чтобы поле имело понятное имя и клик по label фокусировал input.",
        distractors: [
          "Чтобы CSS Grid заработал.",
          "Чтобы Promise стал fulfilled.",
          "Чтобы скрыть input от браузера.",
          "Чтобы отключить валидацию.",
          "Чтобы создать prototype.",
        ],
        explain: "Связка улучшает доступность и удобство формы.",
      },
      {
        prompt: "Когда alt у изображения может быть пустым?",
        answer: "Когда изображение декоративное и не несёт смысла.",
        distractors: [
          "Когда изображение важное для понимания.",
          "Когда картинка большая.",
          "Когда используется React.",
          "Когда есть CSS-класс.",
          "Всегда, alt не нужен.",
        ],
        explain: "Декоративное изображение можно пропустить для скринридера.",
      },
      {
        prompt: "Для чего fieldset и legend?",
        answer: "Для группировки связанных полей формы с общим описанием.",
        distractors: [
          "Для загрузки изображений.",
          "Для объявления JS-класса.",
          "Для создания media query.",
          "Для отмены события.",
          "Для хранения токена.",
        ],
        explain: "Особенно полезно для группы radio или checkbox.",
      },
      {
        prompt: "Что делает input type='tel' на мобильном?",
        answer: "Подсказывает браузеру показать клавиатуру для телефона.",
        distractors: [
          "Автоматически отправляет SMS.",
          "Гарантирует валидность номера во всех странах.",
          "Создаёт ссылку tel:.",
          "Сохраняет номер в localStorage.",
          "Отключает autocomplete.",
        ],
        explain: "Тип влияет на UX ввода, но полную проверку всё равно нужно продумать.",
      },
      {
        prompt: "Что лучше: ссылка или кнопка для перехода на другую страницу?",
        answer: "a с href.",
        distractors: [
          "button без логики.",
          "div с role='link' всегда.",
          "input type='text'.",
          "section.",
          "script.",
        ],
        explain: "Ссылка выражает навигацию и работает ожидаемо для браузера.",
      },
      {
        prompt: "Почему placeholder не должен быть единственным названием поля?",
        answer: "Он исчезает при вводе и не всегда заменяет доступное имя.",
        distractors: [
          "Он ломает event loop.",
          "Он запрещён HTML.",
          "Он всегда отправляется на сервер.",
          "Он делает поле readonly.",
          "Он создаёт CSS-переменную.",
        ],
        explain: "label остаётся стабильным описанием поля.",
      },
      {
        prompt: "Когда стоит добавить ARIA?",
        answer: "Когда нативной семантики недостаточно для сложного виджета.",
        distractors: [
          "Чтобы заменить любой HTML-тег.",
          "Чтобы исправить плохой CSS.",
          "Чтобы ускорить fetch.",
          "Чтобы скрыть ошибки JS.",
          "Всегда на каждый div.",
        ],
        explain: "Первое правило: использовать нативный HTML, ARIA - дополнение.",
      },
      {
        prompt: "Что означает lang на html?",
        answer: "Основной язык страницы для браузера и вспомогательных технологий.",
        distractors: [
          "Язык программирования сайта.",
          "Фреймворк проекта.",
          "Тип базы данных.",
          "Цветовую схему.",
          "Версию HTTP.",
        ],
        explain: "lang помогает произношению скринридера, переводу и поиску.",
      },
      {
        prompt: "Что делает required?",
        answer: "Включает нативную проверку обязательного поля браузером.",
        distractors: [
          "Делает поле недоступным.",
          "Меняет label.",
          "Добавляет Promise.",
          "Создаёт новую форму.",
          "Очищает значение после ввода.",
        ],
        explain: "required участвует в constraint validation API.",
      },
    ]),
    tasks: htmlTasks,
  },
  {
    id: "react-render-state-effects",
    area: "react",
    title: "Рендер, состояние, производные данные и эффекты",
    subtitle: "Как React думает снимками состояния и почему useEffect не нужен для всего подряд.",
    level: "Production",
    duration: "80 мин",
    outcome: "Ты сможешь отличать state от derived values, писать эффекты без бесконечных циклов и объяснять рендеры на собеседовании.",
    sources: [
      { label: "React Docs: State as a Snapshot", url: "https://react.dev/learn/state-as-a-snapshot" },
      { label: "React Docs: You Might Not Need an Effect", url: "https://react.dev/learn/you-might-not-need-an-effect" },
      { label: "React Docs: Lifecycle of Reactive Effects", url: "https://react.dev/learn/lifecycle-of-reactive-effects" },
    ],
    sections: [
      {
        title: "State как снимок",
        body: [
          "Каждый рендер React получает свой снимок props и state. Обработчики, созданные во время этого рендера, видят именно эти значения.",
          "setState не меняет переменную прямо сейчас. Он просит React запланировать новый рендер с новым значением. Поэтому несколько обновлений подряд нужно писать через функциональную форму, если они зависят от предыдущего значения.",
        ],
        code: `setCount((current) => current + 1);
setCount((current) => current + 1);`,
      },
      {
        title: "Derived values не надо хранить отдельно",
        body: [
          "Если значение можно вычислить из props или state во время рендера, обычно не нужно заводить для него отдельный useState и синхронизировать через useEffect.",
          "Лишнее состояние создаёт риск рассинхронизации: исходные данные обновились, а производное значение забыли пересчитать.",
        ],
        code: `function Products({ products, query }) {
  const visibleProducts = products.filter((product) =>
    product.title.toLowerCase().includes(query.toLowerCase()),
  );

  return <ProductList items={visibleProducts} />;
}`,
      },
      {
        title: "useEffect для синхронизации с внешним миром",
        body: [
          "Эффект нужен, когда компонент синхронизируется с системой вне React: сеть, подписка, таймер, DOM API, аналитика.",
          "Если эффект просто вычисляет данные для отображения, это сигнал пересмотреть код. Часто вычисление можно перенести в рендер или обработчик события.",
        ],
        workExample:
          "В dashboard фильтр списка не должен жить в useEffect. А вот подписка на WebSocket или обновление title документа - нормальный эффект, потому что это внешний мир.",
      },
    ],
    cheatsheet: [
      "State - минимальный набор изменяемых данных.",
      "Derived value вычисляется из state/props во время рендера.",
      "setState планирует рендер, а не меняет значение в текущем рендере.",
      "Effect нужен для внешних систем.",
      "Cleanup эффекта снимает подписки, таймеры и отменяет устаревшую работу.",
    ],
    pitfalls: [
      "Не хранить filteredItems в state, если можно вычислить из items и query.",
      "Не писать useEffect без зависимостей наугад.",
      "Не мутировать state-объекты напрямую.",
    ],
    interview: [
      "Почему state называется snapshot?",
      "Когда useEffect не нужен?",
      "Что такое controlled component?",
      "Почему нельзя мутировать state напрямую?",
    ],
    quiz: makeQuiz([
      {
        prompt: "Что значит state as a snapshot?",
        answer: "Каждый рендер видит собственную версию state и props.",
        distractors: [
          "State хранится в localStorage автоматически.",
          "React делает скриншот DOM.",
          "State нельзя менять никогда.",
          "Все компоненты рендерятся один раз.",
          "State равен CSS-классу.",
        ],
        explain: "Обработчики замыкаются на значения конкретного рендера.",
      },
      {
        prompt: "Когда лучше использовать функциональный setState?",
        answer: "Когда новое значение зависит от предыдущего.",
        distractors: [
          "Только для CSS-анимаций.",
          "Когда state строка.",
          "Когда компонент не имеет props.",
          "Чтобы отключить рендер.",
          "Чтобы заменить JSX.",
        ],
        explain: "Функциональная форма получает актуальное предыдущее значение.",
      },
      {
        prompt: "Что является derived value?",
        answer: "Отфильтрованный список, вычисленный из items и query.",
        distractors: [
          "Текст, введённый пользователем в input.",
          "Ответ сервера, который ещё не получен.",
          "ID таймера.",
          "DOM-элемент вне React.",
          "Событие click.",
        ],
        explain: "Derived value можно вычислить из уже имеющихся данных.",
      },
      {
        prompt: "Когда useEffect действительно нужен?",
        answer: "Для синхронизации с внешней системой: сетью, подпиской, таймером, DOM API.",
        distractors: [
          "Для любого вычисления в render.",
          "Для сложения двух чисел.",
          "Для фильтрации массива всегда.",
          "Для объявления props.",
          "Для создания HTML-тега.",
        ],
        explain: "Эффект - мост между React и внешним миром.",
      },
      {
        prompt: "Почему нельзя мутировать state напрямую?",
        answer: "React может не увидеть изменение и логика станет непредсказуемой.",
        distractors: [
          "JavaScript запрещает менять объекты.",
          "Мутация удаляет компонент.",
          "CSS перестаёт применяться.",
          "Promise становится rejected.",
          "HTML становится невалидным.",
        ],
        explain: "Нужно создавать новое значение, чтобы React мог сравнить ссылки и обновить UI.",
      },
      {
        prompt: "Что должен вернуть cleanup эффекта?",
        answer: "Функцию очистки подписки, таймера или другой внешней связи.",
        distractors: [
          "JSX-элемент.",
          "Новый state.",
          "CSS-строку.",
          "Promise.all.",
          "HTML form.",
        ],
        explain: "Cleanup вызывается перед повторным запуском эффекта и при размонтировании.",
      },
      {
        prompt: "Что такое controlled input?",
        answer: "Поле, значение которого управляется React state.",
        distractors: [
          "Поле без value.",
          "input только с placeholder.",
          "Поле, управляемое CSS Grid.",
          "input внутри iframe.",
          "Поле, которое нельзя редактировать.",
        ],
        explain: "value приходит из state, onChange обновляет state.",
      },
      {
        prompt: "Почему лишний useEffect может быть вреден?",
        answer: "Он добавляет синхронизацию, риск циклов и лишние рендеры.",
        distractors: [
          "Он отключает JavaScript.",
          "Он запрещает props.",
          "Он всегда ломает сборку.",
          "Он удаляет HTML.",
          "Он работает только в CSS.",
        ],
        explain: "Если можно вычислить значение в рендере, эффект часто не нужен.",
      },
      {
        prompt: "Что будет, если dependency array эффекта неполный?",
        answer: "Эффект может использовать устаревшие значения.",
        distractors: [
          "React автоматически угадает все зависимости.",
          "Компонент станет серверным.",
          "CSS станет scoped.",
          "localStorage очистится.",
          "fetch перестанет работать.",
        ],
        explain: "Зависимости описывают, от каких reactive values зависит эффект.",
      },
      {
        prompt: "Что лучше хранить в state?",
        answer: "Минимальные данные, которые реально меняются и не выводятся полностью из других данных.",
        distractors: [
          "Все промежуточные вычисления.",
          "Каждый className.",
          "Любую константу.",
          "Результат map без причины.",
          "Все props целиком.",
        ],
        explain: "Минимальный state снижает рассинхронизацию и упрощает компонент.",
      },
    ]),
    tasks: reactTasks,
  },
];

export const roadmap = [
  {
    title: "Foundation",
    duration: "2 недели",
    items: ["HTML-семантика", "CSS-каскад", "JS-основы", "Git и DevTools"],
  },
  {
    title: "Browser Core",
    duration: "3 недели",
    items: ["DOM", "события", "формы", "fetch", "storage", "performance basics"],
  },
  {
    title: "React Production",
    duration: "4 недели",
    items: ["state model", "effects", "composition", "forms", "routing", "performance"],
  },
  {
    title: "Interview Gym",
    duration: "постоянно",
    items: ["ежедневные вопросы", "задачи в IDE", "разбор ошибок", "повторение слабых тем"],
  },
];

export const qualityPrinciples = [
  "Каждая тема должна объяснять не только синтаксис, но и рабочий контекст.",
  "Вопросы собеседования привязаны к теме и проверяют понимание, а не память.",
  "Задачи нельзя подменять случайными алгоритмами: если тема про DOM, задача должна быть про DOM.",
  "Мобильная версия считается главным интерфейсом обучения.",
  "Материал пишется своими словами, с ориентирами на открытые источники и практику разработки.",
];
