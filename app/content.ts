import { dokaReferenceSeeds } from "./dokaReferenceSeeds";

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

const featuredTopics: Topic[] = [
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

type ProTopicSeed = {
  id: string;
  area: AreaId;
  title: string;
  subtitle: string;
  level: "Core" | "Interview" | "Production";
  duration: string;
  core: string;
  mechanism: string;
  workplace: string;
  code: string;
  concepts: string[];
  mistakes: string[];
  interview: string[];
  taskScenario: string;
  taskPrompt: string;
  taskInput: string;
  taskOutput: string;
  taskStarter: string;
};

function compactCode(code: string) {
  return code
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");
}

function areaPracticeSurface(area: AreaId) {
  if (area === "html") return "семантика, доступность, валидность разметки и поведение без JavaScript";
  if (area === "css") return "адаптивная раскладка, состояния, каскад, поддержка длинного контента и системных настроек";
  if (area === "react") return "поток данных, состояние, повторные рендеры, доступность и устойчивость сценария";
  return "данные, выполнение кода, ошибки, асинхронность, DOM и наблюдаемое поведение в DevTools";
}

function conceptExplanation(seed: ProTopicSeed) {
  return seed.concepts.map((concept) => {
    return `${concept}. Проверь это на маленьком примере: измени входные данные, сломай крайний случай и объясни, почему результат меняется именно так.`;
  });
}

function interviewChecklist(seed: ProTopicSeed) {
  return [
    `Дай короткое определение без заученной формулы: ${seed.core}`,
    `Покажи механизм на коде: ${compactCode(seed.code)}.`,
    `Назови рабочий сценарий: ${seed.workplace}`,
    `Разбери ошибку: ${seed.mistakes[0]}`,
    "Закончи правилом выбора: когда использовать этот подход, а когда взять более простой.",
  ];
}

const sourceMap: Record<AreaId, { label: string; url: string }[]> = {
  js: [
    { label: "Дока: JavaScript", url: "https://doka.guide/js/" },
    { label: "learn.javascript.ru", url: "https://learn.javascript.ru/" },
    { label: "MDN: JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
  ],
  css: [
    { label: "Дока: CSS", url: "https://doka.guide/css/" },
    { label: "MDN: CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    { label: "MDN Learn: CSS layout", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout" },
  ],
  html: [
    { label: "Дока: HTML", url: "https://doka.guide/html/" },
    { label: "Дока: доступность", url: "https://doka.guide/a11y/" },
    { label: "MDN: HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
  ],
  react: [
    { label: "React Docs: Learn", url: "https://react.dev/learn" },
    { label: "React Docs: Reference", url: "https://react.dev/reference/react" },
    { label: "Дока: рецепты React", url: "https://doka.guide/recipes/" },
  ],
};

function devToolFor(area: AreaId) {
  if (area === "css") return "Computed, Layout и Changes в DevTools";
  if (area === "html") return "Elements, Accessibility tree и валидатор разметки";
  if (area === "react") return "React DevTools Profiler и Components";
  return "Console, Sources, Network и Performance в DevTools";
}

function makeProQuiz(seed: ProTopicSeed): QuizQuestion[] {
  const firstConcept = seed.concepts[0] ?? seed.core;
  const secondConcept = seed.concepts[1] ?? seed.mechanism;
  const thirdConcept = seed.concepts[2] ?? seed.workplace;
  const codeHint = compactCode(seed.code);

  return makeQuiz([
    {
      prompt: `В теме «${seed.title}» какая мысль должна остаться после конспекта?`,
      answer: seed.core,
      distractors: [
        "Достаточно выучить название API без понимания механики.",
        "Тема нужна только для академических примеров и редко влияет на продукт.",
        "Главное - запомнить один синтаксический шаблон и применять его везде.",
        "Это вопрос только дизайна, а не поведения интерфейса.",
        "Правильный ответ всегда зависит от выбранного CSS-фреймворка.",
      ],
      explain: `В этой теме важна рабочая модель: ${seed.mechanism}`,
    },
    {
      prompt: `Какой рабочий пример лучше всего доказывает, что «${seed.title}» не просто теория?`,
      answer: seed.workplace,
      distractors: [
        "Она проявляется только в задачах на алгоритмы без связи с интерфейсом.",
        "Её можно игнорировать, если проект собирается без ошибок.",
        "Она важна только для серверной части приложения.",
        "Она нужна только при написании README.",
        "Она не влияет на поддержку проекта после первого релиза.",
      ],
      explain: "Pro-уровень требует связывать синтаксис с продуктовым сценарием и поддержкой кода.",
    },
    {
      prompt: `Какую механику важно проговорить, если интервьюер просит объяснить «${seed.title}»?`,
      answer: seed.mechanism,
      distractors: [
        "Только краткое определение из одного предложения.",
        "Только название метода без примера.",
        "Только то, что тема существует в браузере.",
        "Только личное мнение без механики.",
        "Только ссылку на документацию без объяснения.",
      ],
      explain: "Сильный ответ включает механизм, пример, ограничения и частую ошибку.",
    },
    {
      prompt: `В задаче по теме «${seed.title}» появился баг. Какая причина наиболее похожа на настоящий источник проблемы?`,
      answer: seed.mistakes[0],
      distractors: [
        "Переименовать переменную без изменения поведения.",
        "Добавить короткий комментарий к сложному месту.",
        "Проверить код на мобильной ширине.",
        "Разбить длинную функцию на маленькие шаги.",
        "Сохранить пример задачи в IDE.",
      ],
      explain: "Ошибки из темы важны тем, что приводят к реальным багам, а не только к некрасивому коду.",
    },
    {
      prompt: `Какой критерий показывает, что тема «${seed.title}» усвоена практически?`,
      answer: `Ты можешь применить её в сценарии: ${seed.taskScenario}`,
      distractors: [
        "Ты прочитал заголовок статьи и сразу перешёл дальше.",
        "Ты можешь повторить только первый пример без изменений.",
        "Ты знаешь, где находится кнопка копирования задачи.",
        "Ты один раз открыл DevTools, но ничего не проверил.",
        "Ты запомнил цвет карточки в интерфейсе.",
      ],
      explain: "Навык закрепляется, когда знание переносится в маленькую рабочую задачу.",
    },
    {
      prompt: `Какой следующий шаг после чтения статьи «${seed.title}» даст больше всего пользы?`,
      answer: `Решить задачу «${seed.taskPrompt}», затем объяснить ${firstConcept} своими словами.`,
      distractors: [
        "Сразу считать тему полностью закрытой.",
        "Перейти к новой теме без проверки понимания.",
        "Скопировать код, не запуская его.",
        "Учить только определения без практики.",
        "Удалить заметки после первого прочтения.",
      ],
      explain: "Платформа строится вокруг цикла: объяснение, проверка, задача, повторение.",
    },
    {
      prompt: `Где лучше всего проверить гипотезу по теме «${seed.title}»?`,
      answer: devToolFor(seed.area),
      distractors: [
        "Только просмотр миниатюры сайта.",
        "Только изменение названия файла.",
        "Только перезапуск компьютера.",
        "Только отключение всех стилей.",
        "Только чтение package.json.",
      ],
      explain: "Инструменты браузера показывают, что происходит с кодом в реальном интерфейсе.",
    },
    {
      prompt: `Что в примере «${codeHint}» должно быть понятно после темы «${seed.title}»?`,
      answer: secondConcept,
      distractors: [
        "Только то, что код можно скопировать без запуска.",
        "Только название файла, где лежит пример.",
        "Только цвет интерфейсной карточки.",
        "Только способ открыть репозиторий.",
        "Только то, что пример существует.",
      ],
      explain: `${secondConcept} - один из опорных пунктов темы, его нужно увидеть в коде, а не только прочитать.`,
    },
    {
      prompt: `Что отличает сильный junior+ ответ по теме «${seed.title}»?`,
      answer: `Механика, пример, ограничение, рабочий кейс и ошибка: ${seed.mistakes[0]}`,
      distractors: [
        "Только слово yes или no.",
        "Только пример из чужого кода без объяснения.",
        "Только субъективная оценка сложности.",
        "Только ссылка на библиотеку.",
        "Только перевод английского термина.",
      ],
      explain: "Junior+ отличается тем, что может объяснить последствия решения.",
    },
    {
      prompt: `Какая задача действительно относится к теме «${seed.title}»?`,
      answer: `Та, где явно тренируются ${firstConcept}, ${thirdConcept} и сценарий: ${seed.taskScenario}`,
      distractors: [
        "Задача проверяет случайную строковую операцию.",
        "Задача вообще не использует тему урока.",
        "Задача решается только копированием ответа.",
        "Задача не имеет примера ввода и вывода.",
        "Задача оценивает только скорость печати.",
      ],
      explain: "Задачи Pro должны быть тематическими, иначе тренировка превращается в шум.",
    },
  ]);
}

function makeProTasks(seed: ProTopicSeed): Task[] {
  return [
    {
      id: `task-${seed.id}-build`,
      topicId: seed.id,
      title: `Собрать рабочий пример: ${seed.title}`,
      level: seed.level === "Core" ? "Junior" : "Junior+",
      scenario: seed.taskScenario,
      prompt: seed.taskPrompt,
      input: seed.taskInput,
      output: seed.taskOutput,
      starter: seed.taskStarter,
      checklist: [
        "Решение использует именно тему урока, а не обходной путь.",
        "Код можно запустить в IDE или браузерной консоли.",
        "Есть проверка граничного случая.",
        "Результат легко объяснить на собеседовании.",
      ],
    },
    {
      id: `task-${seed.id}-debug`,
      topicId: seed.id,
      title: `Разобрать ошибку: ${seed.title}`,
      level: "Junior+",
      scenario: `В рабочем проекте проявилась ошибка: ${seed.mistakes[0]}`,
      prompt:
        "Опиши, почему это ломает интерфейс или поддержку кода. Затем перепиши фрагмент так, чтобы решение стало предсказуемым, проверяемым и устойчивым на мобильной версии.",
      input: `Проблема: ${seed.mistakes[0]}`,
      output: "Короткое объяснение причины и исправленный фрагмент кода",
      starter: seed.code,
      checklist: [
        "В объяснении названа причина, а не только симптом.",
        "Исправление не создаёт новую глобальную зависимость.",
        "Решение учитывает доступность или мобильный сценарий, если тема связана с интерфейсом.",
        "После исправления можно сформулировать правило для будущих задач.",
      ],
    },
    {
      id: `task-${seed.id}-edge-case`,
      topicId: seed.id,
      title: `Проверить крайний случай: ${seed.title}`,
      level: seed.level === "Production" ? "Middle-ready" : "Junior+",
      scenario: `Команда уже написала happy path по теме «${seed.title}», но в реальном интерфейсе появились нестандартные данные или мобильное ограничение.`,
      prompt:
        `Расширь пример так, чтобы он выдерживал один опасный случай: ${seed.mistakes[1] ?? seed.mistakes[0]} Добавь явную проверку результата и коротко подпиши, почему решение относится именно к теме.`,
      input: seed.taskInput,
      output: `Рабочий результат плюс обработка ошибки: ${seed.taskOutput}`,
      starter: seed.taskStarter,
      checklist: [
        "Есть отдельная проверка для неидеальных входных данных.",
        "Решение не скрывает ошибку молча.",
        `В коде виден один из опорных пунктов: ${seed.concepts[0] ?? seed.core}.`,
        "Поведение можно повторить в консоли, браузере или тесте.",
      ],
    },
    {
      id: `task-${seed.id}-interview-demo`,
      topicId: seed.id,
      title: `Ответить как на собеседовании: ${seed.title}`,
      level: "Junior+",
      scenario: `Интервьюер просит не определение, а объяснение с примером, ограничением и рабочим применением темы «${seed.title}».`,
      prompt:
        "Подготовь ответ на 2-3 минуты и маленький демо-фрагмент. В ответе должны быть механизм, пример, типичная ошибка, способ проверки и ситуация, где инструмент лучше не усложнять.",
      input: seed.interview.join(" | "),
      output: "Связный ответ + минимальный кодовый пример + одно ограничение",
      starter: seed.code,
      checklist: interviewChecklist(seed),
    },
  ];
}

function makeProTopic(seed: ProTopicSeed): Topic {
  const practiceSurface = areaPracticeSurface(seed.area);

  return {
    id: seed.id,
    area: seed.area,
    title: seed.title,
    subtitle: seed.subtitle,
    level: seed.level,
    duration: seed.duration,
    outcome: `После темы ты сможешь применить «${seed.title}» в рабочем интерфейсе, объяснить механизм и пройти junior/junior+ вопрос без поверхностного ответа.`,
    sources: sourceMap[seed.area],
    sections: [
      {
        title: "1. Зачем это нужно",
        body: [
          seed.core,
          seed.workplace,
          `В этой теме мы смотрим не только на синтаксис, а на рабочую поверхность: ${practiceSurface}. Если после чтения ты можешь назвать только термин, тема ещё не закреплена. Если можешь объяснить, какой баг она предотвращает и где проверяется, знание уже становится рабочим.`,
        ],
        bullets: seed.concepts,
      },
      {
        title: "2. Ментальная модель",
        body: [
          seed.mechanism,
          `Держи в голове причинно-следственную цепочку: входные данные или состояние попадают в код, код применяет правило темы, браузер или React показывает наблюдаемый результат. Для «${seed.title}» нельзя ограничиться примером из одной строки: важно понимать, что изменится при пустом значении, долгом запросе, маленьком экране, повторном рендере или другом порядке выполнения.`,
        ],
        bullets: conceptExplanation(seed),
      },
      {
        title: "3. Минимальный пример",
        body: [
          "Сначала нужен короткий пример, который можно переписать руками без фреймворков и магии. Он должен показывать один главный механизм, а не пытаться сразу быть архитектурой всего приложения.",
          `После запуска измени входные данные из условия: ${seed.taskInput}. Если результат меняется предсказуемо, значит базовая механика понята.`,
        ],
        code: seed.code,
      },
      {
        title: "4. Рабочий сценарий",
        body: [
          seed.taskScenario,
          seed.taskPrompt,
          `Ожидаемый результат: ${seed.taskOutput}. В рабочем проекте этого мало просто добиться один раз: нужно сделать код читаемым, устойчивым к изменению данных и понятным для следующего разработчика.`,
        ],
        workExample: seed.workplace,
      },
      {
        title: "5. Ошибки и edge cases",
        body: [
          `Главный риск: ${seed.mistakes[0]}`,
          `Ещё проверь: ${seed.mistakes.slice(1).join(" ") || "неидеальные входные данные, повторный запуск и мобильный сценарий."}`,
          "Хорошая учебная задача обязательно ломает happy path: пустые данные, длинный текст, неверный тип, повторный клик, медленная сеть, высокая контрастность или маленькая ширина экрана. Без этого знание остаётся хрупким.",
        ],
      },
      {
        title: "6. Как проверить в работе",
        body: [
          `Практический инструмент: ${devToolFor(seed.area)}.`,
          `Проверяй не только итоговый экран, но и причину результата: какие данные пришли, какое правило сработало, где видна ошибка и почему исправление не создаёт новую зависимость.`,
          "Для мобильной версии отдельная проверка обязательна: длинные подписи, переполнение, touch-target, фокус и состояние ошибки часто ломаются именно там.",
        ],
      },
      {
        title: "7. Собеседование и шпаргалка",
        body: [
          `На junior/junior+ уровне по теме «${seed.title}» обычно хотят услышать не энциклопедию, а ясный ответ: что это решает, как работает, где применяется, какая типичная ошибка и как ты это проверишь.`,
          `Структура ответа: ${interviewChecklist(seed).join(" ")}`,
        ],
      },
    ],
    cheatsheet: [
      ...seed.concepts,
      `Рабочий маркер: ${seed.taskScenario}`,
      `Проверка: ${devToolFor(seed.area)}.`,
    ],
    pitfalls: seed.mistakes,
    interview: [
      ...seed.interview,
      `Как бы ты применил «${seed.title}» в реальном продукте?`,
      `Какая ошибка чаще всего возникает в теме «${seed.title}»?`,
    ],
    quiz: makeProQuiz(seed),
    tasks: makeProTasks(seed),
  };
}

type DokaReferenceSeed = (typeof dokaReferenceSeeds)[number];
type DokaSection = DokaReferenceSeed[0];

type DokaTopicDraft = {
  id: string;
  area: AreaId;
  section: DokaSection;
  sectionName: string;
  slug: string;
  title: string;
  term: string;
  core: string;
  mechanism: string;
  workplace: string;
  code: string;
  concepts: string[];
  mistakes: string[];
  sourceUrl: string;
};

const voidHtmlTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

function cleanDokaTitle(title: string, slug: string) {
  return title.trim() || slug;
}

function stripInlineCode(value: string) {
  return value.replace(/`/g, "");
}

function primaryToken(title: string, slug: string) {
  return title.match(/`([^`]+)`/)?.[1] ?? stripInlineCode(cleanDokaTitle(title, slug));
}

function slugToClassName(slug: string) {
  return slug.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "demo";
}

function dokaSectionName(section: DokaSection) {
  const names: Record<DokaSection, string> = {
    html: "HTML",
    css: "CSS",
    js: "JavaScript",
    a11y: "Доступность",
    tools: "Веб-платформа",
    recipes: "Рецепт",
  };

  return names[section];
}

function dokaArea(section: DokaSection, slug: string, title: string): AreaId {
  const value = `${slug} ${title}`.toLowerCase();

  if (section === "html" || section === "a11y") return "html";
  if (section === "css") return "css";
  if (section === "js") return "js";

  if (section === "recipes") {
    if (value.includes("react")) return "react";
    if (/css|style|grid|flex|center|menu|animation|checkbox|radio|color|layout/.test(value)) return "css";
    if (/form|html|image|picture|semantic|seo|a11y|accessib/.test(value)) return "html";
    return "js";
  }

  if (/react|component|state|typescript|node|api|json|http|cors|storage|test|git|ci|webpack|rollup/.test(value)) {
    return "js";
  }

  if (/css|layout|render|vitals|pixel|preprocessor|css-in-js/.test(value)) return "css";
  if (/seo|screenreader|accessib|html|markdown/.test(value)) return "html";

  return "js";
}

function dokaDisplayTitle(section: DokaSection, title: string, slug: string) {
  const cleaned = stripInlineCode(cleanDokaTitle(title, slug));
  if (section === "a11y") return `A11y: ${cleaned}`;
  if (section === "tools") return `Web: ${cleaned}`;
  if (section === "recipes") return `Рецепт: ${cleaned}`;
  return cleaned;
}

function dokaSourceUrl(section: DokaSection, slug: string) {
  return `https://doka.guide/${section}/${slug}/`;
}

function dokaLevel(section: DokaSection, slug: string, title: string): Topic["level"] {
  const value = `${section} ${slug} ${title}`.toLowerCase();

  if (/architecture|security|performance|vitals|worker|buffer|atomics|prototype|descriptor|observer|suspense|ci|docker|nginx|apache/.test(value)) {
    return "Production";
  }

  if (/this|closure|promise|async|event|grid|flex|aria|role|form|validation|storage|regexp|map|set|reduce/.test(value)) {
    return "Interview";
  }

  return "Core";
}

function dokaConcepts(area: AreaId, section: DokaSection, term: string) {
  if (section === "a11y") {
    return [
      `${term} должен улучшать доступность, а не маскировать плохую семантику`,
      "сначала выбираем правильный HTML, потом добавляем ARIA только при необходимости",
      "проверяем клавиатуру, фокус, доступное имя и состояние в дереве доступности",
      "визуальное состояние и состояние для ассистивных технологий должны совпадать",
    ];
  }

  if (area === "html") {
    return [
      `${term} должен давать браузеру и пользователю правильный смысл`,
      "атрибуты меняют поведение, доступность, отправку формы или загрузку ресурса",
      "валидная разметка легче стилизуется, тестируется и читается скринридером",
      "если элемент интерактивный, важны клавиатура, фокус и понятное имя",
    ];
  }

  if (area === "css") {
    return [
      `${term} участвует в каскаде, наследовании, раскладке или состоянии интерфейса`,
      "значение свойства нужно проверять на длинном тексте и маленькой ширине",
      "DevTools показывает итоговое значение, переопределения и причину проигранного правила",
      "хороший CSS не ломает доступность и системные настройки пользователя",
    ];
  }

  if (area === "react") {
    return [
      `${term} должен улучшать поток данных, композицию или пользовательский сценарий`,
      "компонент должен ясно получать входные данные и отдавать предсказуемый UI",
      "эффекты, состояние и загрузка должны иметь понятные границы ответственности",
      "проверяем повторный рендер, пустые данные, ошибку и мобильное состояние",
    ];
  }

  return [
    `${term} имеет контракт: какие данные принимает, что возвращает и какие ошибки возможны`,
    "важно отличать мутирующее поведение от создания нового значения",
    "проверяем edge cases: пустые данные, неверный тип, повторный вызов и асинхронную ошибку",
    "на собеседовании нужно объяснить механизм, а не только название метода",
  ];
}

function dokaMistakes(area: AreaId, section: DokaSection, term: string) {
  if (section === "a11y") {
    return [
      `Добавлять ${term} механически, не проверяя доступное имя, роль и состояние.`,
      "Считать, что визуально красивый компонент автоматически доступен с клавиатуры.",
      "Прятать проблему ARIA-атрибутом вместо выбора правильного HTML-элемента.",
    ];
  }

  if (area === "html") {
    return [
      `Использовать ${term} по внешнему виду, а не по смыслу и поведению.`,
      "Забыть связать подписи, состояния, типы кнопок или ограничения формы.",
      "Проверять только десктоп и мышь, игнорируя клавиатуру и мобильный ввод.",
    ];
  }

  if (area === "css") {
    return [
      `Применить ${term} как украшение, не проверив влияние на раскладку и каскад.`,
      "Не учесть длинные слова, малую ширину, высокий contrast mode или prefers-reduced-motion.",
      "Исправлять конфликт через !important вместо понимания специфичности и порядка слоёв.",
    ];
  }

  if (area === "react") {
    return [
      `Встроить ${term} без ясной границы состояния и ответственности компонента.`,
      "Сделать пример рабочим только на happy path и забыть загрузку, ошибку или пустые данные.",
      "Пытаться лечить архитектуру лишним состоянием вместо нормальной композиции.",
    ];
  }

  return [
    `Использовать ${term} без понимания входных данных, возвращаемого значения и побочных эффектов.`,
    "Путать синхронное и асинхронное поведение или мутирующий и немутирующий метод.",
    "Проверять один пример и не смотреть пустые данные, неверный тип и повторный вызов.",
  ];
}

function dokaCore(area: AreaId, section: DokaSection, term: string) {
  if (section === "recipes") {
    return `${term} - практический сценарий, где нужно собрать несколько знаний в маленькое рабочее решение.`;
  }

  if (section === "tools") {
    return `${term} относится к инженерной базе фронтендера: это помогает понимать окружение, сборку, сеть, качество или поддержку проекта.`;
  }

  if (section === "a11y") {
    return `${term} помогает сделать интерфейс понятным не только визуально, но и для клавиатуры, скринридеров и других способов взаимодействия.`;
  }

  if (area === "html") return `${term} задаёт смысл, поведение или данные разметки, поэтому влияет на доступность, формы, SEO и поддержку UI.`;
  if (area === "css") return `${term} управляет тем, как элемент выглядит, занимает место, реагирует на состояние или адаптируется к среде пользователя.`;
  if (area === "react") return `${term} помогает собрать интерфейс из компонентов с понятным состоянием, данными и жизненным циклом.`;

  return `${term} - часть языка или браузерного API, которую важно понимать через контракт, пример, ограничения и рабочий баг.`;
}

function dokaMechanism(area: AreaId, section: DokaSection, term: string) {
  if (section === "a11y") {
    return `Механика ${term} видна в дереве доступности: браузер сопоставляет HTML, ARIA, текст, состояние и фокус, а ассистивные технологии озвучивают итоговую модель пользователю.`;
  }

  if (area === "html") {
    return `Браузер парсит разметку, строит DOM и назначает элементам встроенное поведение. ${term} важно проверять не только глазами, но и через валидность, фокус, форму и доступное имя.`;
  }

  if (area === "css") {
    return `Правило с ${term} проходит через каскад, специфичность, вычисленные значения и раскладку. Итог видно в Computed/Layout, а не только в исходном CSS-файле.`;
  }

  if (area === "react") {
    return `${term} нужно рассматривать через поток props/state: компонент получает данные, рендерит интерфейс, реагирует на событие и не должен прятать лишние побочные эффекты.`;
  }

  return `${term} работает по контракту JavaScript: значение попадает на вход, движок выполняет алгоритм, результат или ошибка возвращаются наружу. Важно понимать, меняется исходное значение или создаётся новое.`;
}

function dokaWorkplace(area: AreaId, section: DokaSection, term: string) {
  if (section === "recipes") {
    return `Рабочий сценарий: собрать ${term} как маленькую фичу продукта, где есть состояние, данные, ошибки, доступность и мобильная ширина.`;
  }

  if (section === "tools") {
    return `Рабочий сценарий: объяснить команде, как ${term} влияет на разработку, деплой, отладку или качество фронтенд-проекта.`;
  }

  if (section === "a11y") {
    return `Рабочий сценарий: компонент выглядит готовым, но пользователь с клавиатурой или скринридером должен так же понимать ${term}, состояние и следующий шаг.`;
  }

  if (area === "html") return `Рабочий сценарий: сверстать блок с ${term} так, чтобы он был валидным, доступным, понятным для CSS и устойчивым без JavaScript.`;
  if (area === "css") return `Рабочий сценарий: применить ${term} в карточке, форме или навигации и проверить, что раскладка не ломается на телефоне.`;
  if (area === "react") return `Рабочий сценарий: использовать ${term} в компоненте, который получает данные, показывает состояния загрузки и не ломает повторный рендер.`;

  return `Рабочий сценарий: применить ${term} в обработке данных интерфейса, DOM-сценарии или запросе и объяснить результат в консоли.`;
}

function htmlExample(section: DokaSection, slug: string, title: string) {
  const token = primaryToken(title, slug);
  const tag = token.match(/^<([a-z0-9-]+)/i)?.[1];
  const attr = title.match(/Атрибут [`"]?([a-z0-9-*]+)[`"]?/i)?.[1] ?? token.match(/^[a-z-]+$/i)?.[0];

  if (section === "a11y") {
    return `<button class="filter-toggle" aria-expanded="false" aria-controls="filters-panel">
  Фильтры
</button>
<section id="filters-panel" hidden>
  <h2>Фильтры каталога</h2>
</section>`;
  }

  if (slug === "button") {
    return `<button type="button" class="profile-action">
  Сохранить профиль
</button>`;
  }

  if (slug === "form") {
    return `<form action="/subscribe" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>
  <button type="submit">Подписаться</button>
</form>`;
  }

  if (slug === "input" || attr === "inputmode") {
    return `<label>
  Код подтверждения
  <input name="code" inputmode="numeric" autocomplete="one-time-code">
</label>`;
  }

  if (slug === "img" || slug === "alt") {
    return `<img src="/team/mentor.jpg" alt="Ментор проверяет решение студента">`;
  }

  if (attr && title.toLowerCase().includes("атрибут")) {
    return `<button type="button" ${attr === "disabled" ? "disabled" : `${attr}="demo-value"`}>
  Действие
</button>`;
  }

  if (tag && voidHtmlTags.has(tag)) {
    return `<${tag} class="${slugToClassName(slug)}">`;
  }

  if (tag) {
    return `<${tag} class="${slugToClassName(slug)}">
  Контент интерфейса
</${tag}>`;
  }

  return `<section class="${slugToClassName(slug)}">
  <h2>${stripInlineCode(cleanDokaTitle(title, slug))}</h2>
  <p>Смысловой блок без лишней обёртки.</p>
</section>`;
}

function cssValueFor(property: string) {
  const values: Record<string, string> = {
    "accent-color": "#0b8f76",
    "align-items": "center",
    "aspect-ratio": "16 / 9",
    "background": "#f6f8f7",
    "background-color": "#ffffff",
    "border": "1px solid #d8e0dc",
    "border-radius": "8px",
    "box-shadow": "0 12px 36px rgb(20 34 28 / 10%)",
    "box-sizing": "border-box",
    "color": "#151716",
    "display": "grid",
    "flex": "1 1 18rem",
    "font-size": "1rem",
    "font-weight": "700",
    "gap": "1rem",
    "grid-template-columns": "repeat(auto-fit, minmax(16rem, 1fr))",
    "height": "auto",
    "inset": "0",
    "justify-content": "space-between",
    "line-height": "1.5",
    "margin": "0",
    "max-width": "64rem",
    "min-height": "44px",
    "object-fit": "cover",
    "opacity": "0.92",
    "overflow": "auto",
    "padding": "1rem",
    "position": "relative",
    "text-align": "start",
    "text-overflow": "ellipsis",
    "transform": "translateY(-2px)",
    "transition": "transform 180ms ease",
    "width": "min(100%, 64rem)",
    "z-index": "10",
  };

  return values[property] ?? "initial";
}

function cssExample(slug: string, title: string) {
  const token = primaryToken(title, slug);
  const className = slugToClassName(slug);

  if (token.startsWith("::")) {
    return `.badge${token} {
  content: "";
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background: #0b8f76;
}`;
  }

  if (token.startsWith(":")) {
    return `.field${token} {
  border-color: #0b8f76;
  box-shadow: 0 0 0 3px rgb(11 143 118 / 14%);
}`;
  }

  if (token.startsWith("@media")) {
    return `@media (max-width: 600px) {
  .lesson-grid {
    grid-template-columns: 1fr;
  }
}`;
  }

  if (token.startsWith("@")) {
    return `${token} {
  .card {
    display: grid;
    gap: 1rem;
  }
}`;
  }

  if (token.endsWith("()")) {
    const fn = token.slice(0, -2);
    return `.hero-title {
  font-size: ${fn}(1.8rem, 5vw, 3.6rem);
}`;
  }

  const property = token.replace(/[();]/g, "");

  return `.${className} {
  ${property}: ${cssValueFor(property)};
}`;
}

const jsArrayExamples: Record<string, string> = {
  "array-at": `const lastTask = tasks.at(-1);
console.log(lastTask);`,
  "array-concat": `const fullQueue = urgentTasks.concat(todayTasks);
console.log(fullQueue);`,
  "array-every": `const allValid = fields.every((field) => field.valid);
console.log(allValid);`,
  "array-filter": `const visibleUsers = users.filter((user) => user.active);
console.log(visibleUsers);`,
  "array-find": `const selected = products.find((product) => product.id === selectedId);
console.log(selected);`,
  "array-flat": `const flatErrors = formSections.map((section) => section.errors).flat();
console.log(flatErrors);`,
  "array-foreach": `notifications.forEach((item) => {
  markAsRead(item.id);
});`,
  "array-includes": `const hasAdmin = roles.includes("admin");
console.log(hasAdmin);`,
  "array-map": `const labels = users.map((user) => user.name);
console.log(labels);`,
  "array-reduce": `const total = cart.reduce((sum, item) => sum + item.price, 0);
console.log(total);`,
  "array-some": `const hasErrors = fields.some((field) => field.error);
console.log(hasErrors);`,
  "array-sort": `const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));
console.log(sorted);`,
};

function jsExample(slug: string, title: string) {
  if (jsArrayExamples[slug]) return jsArrayExamples[slug];

  const token = primaryToken(title, slug);
  const method = token.match(/^\.?([a-zA-Z_$][\w$]*)\(\)$/)?.[1];

  if (slug.startsWith("array-") && method) {
    return `const result = items.${method}((item) => item.visible);
console.log(result);`;
  }

  if (slug.startsWith("string-") && method) {
    return `const normalized = message.${method}(" ");
console.log(normalized);`;
  }

  if (slug.includes("promise") || slug.includes("async") || slug.includes("fetch")) {
    return `async function loadProfile(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) throw new Error("Не удалось загрузить профиль");
  return response.json();
}`;
  }

  if (slug.includes("event") || slug.includes("addeventlistener")) {
    return `document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  console.log(button.dataset.action);
});`;
  }

  if (slug.includes("localstorage") || slug.includes("storage")) {
    return `const key = "front-gym-theme";
localStorage.setItem(key, "dark");
console.log(localStorage.getItem(key));`;
  }

  if (slug.includes("map") || slug.includes("set")) {
    return `const selectedIds = new Set([101, 204]);
console.log(selectedIds.has(204));`;
  }

  if (slug.includes("regexp") || slug.includes("regex")) {
    return `const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
console.log(emailPattern.test("student@example.com"));`;
  }

  if (slug.includes("date")) {
    return `const formatter = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" });
console.log(formatter.format(new Date()));`;
  }

  return `function inspectValue(value) {
  console.log("${stripInlineCode(cleanDokaTitle(title, slug))}", value);
  return value;
}`;
}

function reactExample(term: string) {
  return `function PracticeCard({ topic, completed }) {
  return (
    <article aria-label={\`${term}: \${topic.title}\`}>
      <h3>{topic.title}</h3>
      <button type="button">{completed ? "Повторить" : "Начать"}</button>
    </article>
  );
}`;
}

function dokaCodeExample(area: AreaId, section: DokaSection, slug: string, title: string, term: string) {
  if (area === "html") return htmlExample(section, slug, title);
  if (area === "css") return cssExample(slug, title);
  if (area === "react") return reactExample(term);
  return jsExample(slug, title);
}

function dokaTaskStarter(area: AreaId, code: string) {
  if (area === "css") return `${code}\n\n/* Добавь mobile-first проверку ниже */`;
  if (area === "html") return `${code}\n\n<!-- Проверь доступное имя, фокус и валидность -->`;
  if (area === "react") return `${code}\n\n// Добавь состояние загрузки, пустые данные и ошибку`;
  return `${code}\n\n// Добавь проверку edge case и выведи результат через console.log`;
}

function makeDokaDraft(seed: DokaReferenceSeed): DokaTopicDraft {
  const [section, slug, rawTitle] = seed;
  const area = dokaArea(section, slug, rawTitle);
  const title = dokaDisplayTitle(section, rawTitle, slug);
  const term = stripInlineCode(cleanDokaTitle(rawTitle, slug));
  const sectionName = dokaSectionName(section);
  const core = dokaCore(area, section, term);
  const mechanism = dokaMechanism(area, section, term);
  const workplace = dokaWorkplace(area, section, term);
  const code = dokaCodeExample(area, section, slug, rawTitle, term);

  return {
    id: `doka-${section}-${slug.replace(/[^a-z0-9]+/gi, "-")}`,
    area,
    section,
    sectionName,
    slug,
    title,
    term,
    core,
    mechanism,
    workplace,
    code,
    concepts: dokaConcepts(area, section, term),
    mistakes: dokaMistakes(area, section, term),
    sourceUrl: dokaSourceUrl(section, slug),
  };
}

function makeDokaQuiz(draft: DokaTopicDraft): QuizQuestion[] {
  return makeQuiz([
    {
      prompt: `Что главное понять в теме «${draft.title}»?`,
      answer: draft.core,
      distractors: [
        "Достаточно запомнить название и не разбирать рабочее поведение.",
        "Тема нужна только для теоретического экзамена и не влияет на интерфейс.",
        "Можно всегда применять её одинаково, без проверки контекста.",
        "Она не связана с доступностью, мобильностью и поддержкой кода.",
        "Правильный ответ зависит только от личного стиля разработчика.",
      ],
      explain: draft.mechanism,
    },
    {
      prompt: `Где «${draft.term}» проявляется в рабочем фронтенде?`,
      answer: draft.workplace,
      distractors: [
        "Только в абстрактной задаче без интерфейса.",
        "Только в названии файла.",
        "Только при выборе цвета редактора кода.",
        "Только в комментариях к pull request.",
        "Только в серверной базе данных.",
      ],
      explain: "Тема считается усвоенной, когда её можно привязать к пользовательскому сценарию.",
    },
    {
      prompt: `Какой инструмент лучше использовать для проверки темы «${draft.title}»?`,
      answer: devToolFor(draft.area),
      distractors: [
        "Только визуальный осмотр без DevTools.",
        "Только перезапуск сборки.",
        "Только переименование класса.",
        "Только удаление всех стилей.",
        "Только чтение заголовка статьи.",
      ],
      explain: "Проверять нужно наблюдаемое поведение: DOM, computed styles, сеть, состояние или рендер.",
    },
    {
      prompt: `Какая ошибка чаще всего ломает тему «${draft.title}»?`,
      answer: draft.mistakes[0],
      distractors: [
        "Слишком понятное имя переменной.",
        "Наличие короткого демо-примера.",
        "Проверка мобильной ширины.",
        "Использование валидного HTML.",
        "Явная обработка ошибки.",
      ],
      explain: "Вопросы Pro проверяют реальные причины багов, а не случайные действия.",
    },
    {
      prompt: `Что должно быть в хорошем ответе на собеседовании по «${draft.title}»?`,
      answer: "Определение, механизм, рабочий пример, ограничение, типичная ошибка и способ проверки.",
      distractors: [
        "Только перевод термина на английский.",
        "Только ссылка на документацию без объяснения.",
        "Только фраза 'я такое видел'.",
        "Только один скопированный пример.",
        "Только мнение о том, нравится тема или нет.",
      ],
      explain: "Junior+ ответ всегда связывает знание с последствиями в продукте.",
    },
    {
      prompt: `Какой пример задачи относится к теме «${draft.title}»?`,
      answer: `Задача, где нужно применить «${draft.term}» в сценарии: ${draft.workplace}`,
      distractors: [
        "Случайная операция со строкой без связи с темой.",
        "Задача без ввода, вывода и критерия готовности.",
        "Копирование чужого кода без запуска.",
        "Обсуждение дизайна без проверки поведения.",
        "Любая задача, если она достаточно короткая.",
      ],
      explain: "Задача должна тренировать именно тему карточки.",
    },
    {
      prompt: `Что проверить после минимального примера «${draft.term}»?`,
      answer: draft.concepts[2],
      distractors: [
        "Только что код визуально занимает мало строк.",
        "Только что переменная называется красиво.",
        "Только что пример открывается в IDE.",
        "Только что файл лежит в правильной папке.",
        "Только что тема есть в списке.",
      ],
      explain: "Мини-пример без проверки крайних случаев даёт ложное чувство понимания.",
    },
    {
      prompt: `Как понять, что «${draft.title}» не стоит усложнять?`,
      answer: "Если простая семантика, базовое свойство или явная функция решают задачу понятнее, выбираем простой вариант.",
      distractors: [
        "Всегда выбирать самый новый API.",
        "Всегда добавлять библиотеку.",
        "Всегда писать больше абстракций.",
        "Всегда избегать DevTools.",
        "Всегда переносить решение на сервер.",
      ],
      explain: "Pro-уровень - это не усложнение, а точный выбор инструмента.",
    },
    {
      prompt: `Что должно совпасть в UI после применения «${draft.term}»?`,
      answer: "Код, визуальное поведение, доступность, мобильное состояние и объяснение разработчика.",
      distractors: [
        "Только цвет кнопки.",
        "Только число строк в файле.",
        "Только название ветки в Git.",
        "Только порядок импортов.",
        "Только размер шрифта в редакторе.",
      ],
      explain: "Учебная тема ценна, когда её можно проверить с разных сторон.",
    },
    {
      prompt: `Какой следующий шаг после чтения «${draft.title}» самый полезный?`,
      answer: "Переписать пример руками, изменить входные данные, решить задачу и объяснить типичную ошибку вслух.",
      distractors: [
        "Сразу перейти к следующей теме.",
        "Сохранить заголовок в закладки и ничего не делать.",
        "Выучить только первый абзац.",
        "Сравнить только дизайн карточек.",
        "Удалить пример после первого запуска.",
      ],
      explain: "Повторение превращается в навык через активное воспроизведение.",
    },
  ]);
}

function makeDokaTasks(draft: DokaTopicDraft): Task[] {
  return [
    {
      id: `task-${draft.id}-practice`,
      topicId: draft.id,
      title: `Применить: ${draft.title}`,
      level: dokaLevel(draft.section, draft.slug, draft.title) === "Production" ? "Junior+" : "Junior",
      scenario: draft.workplace,
      prompt:
        `Собери небольшой пример по теме «${draft.term}». В решении должен быть виден сам механизм темы, а не случайный обходной путь. Добавь один неидеальный случай и покажи результат.`,
      input: `Тема: ${draft.term}; сценарий: ${draft.sectionName}`,
      output: "Рабочий пример, который можно объяснить и проверить в DevTools или консоли",
      starter: dokaTaskStarter(draft.area, draft.code),
      checklist: [
        "Решение использует именно тему карточки.",
        "Есть пример входных данных или состояния интерфейса.",
        "Есть проверка пустого, длинного, неверного или повторного сценария.",
        "Результат можно объяснить на junior/junior+ собеседовании.",
      ],
    },
    {
      id: `task-${draft.id}-debug`,
      topicId: draft.id,
      title: `Найти ошибку: ${draft.title}`,
      level: "Junior+",
      scenario: `В код-ревью заметили проблему: ${draft.mistakes[0]}`,
      prompt:
        "Опиши причину бага человеческим языком, исправь пример и добавь короткое правило, которое поможет не повторять ошибку в рабочем проекте.",
      input: draft.mistakes.join(" | "),
      output: "Причина бага + исправленный пример + правило для будущей работы",
      starter: draft.code,
      checklist: [
        "Объяснение говорит о причине, а не только о симптоме.",
        "Исправление не ломает мобильный сценарий.",
        "Проверка не зависит от одного счастливого случая.",
        `В ответе упомянут инструмент проверки: ${devToolFor(draft.area)}.`,
      ],
    },
    {
      id: `task-${draft.id}-interview`,
      topicId: draft.id,
      title: `Ответ для интервью: ${draft.title}`,
      level: "Junior+",
      scenario: `Интервьюер просит объяснить «${draft.term}» через реальный интерфейс, пример и ограничение.`,
      prompt:
        "Подготовь ответ на 2 минуты: дай определение, покажи пример, назови один edge case, типичную ошибку и способ проверки.",
      input: draft.concepts.join(" | "),
      output: "Структурированный ответ + минимальный пример кода",
      starter: draft.code,
      checklist: [
        "Ответ начинается с простой формулировки.",
        "Есть пример из фронтенд-интерфейса.",
        "Названо ограничение или ситуация, где инструмент не нужен.",
        "Есть типичная ошибка и проверка результата.",
      ],
    },
  ];
}

function makeDokaReferenceTopic(seed: DokaReferenceSeed): Topic {
  const draft = makeDokaDraft(seed);

  return {
    id: draft.id,
    area: draft.area,
    title: draft.title,
    subtitle: `${draft.sectionName}: авторский Pro-конспект по каталогу Доки с рабочим примером, вопросами и задачами по теме.`,
    level: dokaLevel(draft.section, draft.slug, draft.title),
    duration: draft.section === "recipes" ? "30 мин" : "18 мин",
    outcome: `После темы ты сможешь объяснить «${draft.term}», применить в интерфейсе, назвать ограничения и пройти короткий junior/junior+ вопрос.`,
    sources: [
      { label: `Дока: ${draft.term}`, url: draft.sourceUrl },
      ...sourceMap[draft.area].filter((source) => !source.url.includes("doka.guide")).slice(0, 2),
    ],
    sections: [
      {
        title: "1. Суть темы",
        body: [
          draft.core,
          draft.mechanism,
          `Эта карточка сделана как быстрый Pro-разбор: сначала смысл, потом рабочий пример, затем проверка и тренировка. Текст не копирует статью-источник, а использует каталог Доки как карту покрытия.`,
        ],
        bullets: draft.concepts,
      },
      {
        title: "2. Когда пригодится в работе",
        body: [
          draft.workplace,
          `Смотри на «${draft.term}» как на инструмент для конкретного сценария, а не как на отдельный термин. Если в задаче нет наблюдаемого поведения, данных, состояния или доступности, значит пример нужно усилить.`,
        ],
        workExample: draft.workplace,
      },
      {
        title: "3. Минимальный пример",
        body: [
          "Перепиши пример руками, запусти и измени одно входное значение. Так быстрее видно, где работает механизм, а где начинается случайное совпадение.",
          `Для проверки используй: ${devToolFor(draft.area)}.`,
        ],
        code: draft.code,
      },
      {
        title: "4. Edge cases",
        body: [
          `Главный риск: ${draft.mistakes[0]}`,
          `Дополнительно проверь: ${draft.mistakes.slice(1).join(" ")}`,
          "На телефоне обязательно проверь длинные подписи, область нажатия, фокус, переполнение и состояние ошибки.",
        ],
      },
      {
        title: "5. Собеседование",
        body: [
          `Короткий ответ по «${draft.term}» должен звучать так: что это решает, как работает, где применяется, чем можно сломать и как проверить.`,
          "После объяснения полезно показать маленький пример и отдельно сказать, когда инструмент не нужен.",
        ],
      },
    ],
    cheatsheet: [
      ...draft.concepts,
      `Рабочий кейс: ${draft.workplace}`,
      `Проверка: ${devToolFor(draft.area)}.`,
    ],
    pitfalls: draft.mistakes,
    interview: [
      `Что такое «${draft.term}» и какую проблему оно решает?`,
      `Как «${draft.term}» проявляется в реальном интерфейсе?`,
      `Какая типичная ошибка встречается в теме «${draft.term}»?`,
      `Как проверить результат через ${devToolFor(draft.area)}?`,
      "Когда лучше выбрать более простой инструмент?",
    ],
    quiz: makeDokaQuiz(draft),
    tasks: makeDokaTasks(draft),
  };
}

const proTopicSeeds: ProTopicSeed[] = [
  {
    id: "js-variables-types-conversion",
    area: "js",
    title: "Переменные, типы данных и преобразование типов",
    subtitle: "Как хранить значения, понимать primitive/reference и не попадать в ловушки неявного приведения.",
    level: "Core",
    duration: "45 мин",
    core: "Типы и преобразования определяют, какие операции безопасны и почему одинаковый с виду код может дать разные результаты.",
    mechanism: "Примитивы хранят значение напрямую, объекты передаются по ссылке, а операторы могут запускать ToString, ToNumber или ToBoolean.",
    workplace: "В форме оплаты важно не сравнивать строку из input как число без явного преобразования, иначе фильтры и расчёты начинают работать странно.",
    code: `const amount = Number(input.value);

if (Number.isNaN(amount)) {
  showError("Введите число");
}`,
    concepts: ["let и const задают область видимости", "null и undefined означают разные отсутствия", "Number.isNaN надёжнее глобального isNaN", "объекты сравниваются по ссылке"],
    mistakes: ["Полагаться на неявное преобразование при сравнении пользовательского ввода.", "Путать null и undefined в API-контрактах.", "Сравнивать объекты через === как структуры."],
    interview: ["Какие примитивные типы есть в JavaScript?", "Почему [] == false может быть true?", "Чем null отличается от undefined?"],
    taskScenario: "Фильтр каталога получает значения цены из input как строки и должен корректно сравнивать их с числовыми ценами товаров.",
    taskPrompt: "Напиши normalizePrice(value), которая возвращает число или null, если значение нельзя безопасно использовать как цену.",
    taskInput: "'1200', '', '12px', '0'",
    taskOutput: "1200, null, null, 0",
    taskStarter: `function normalizePrice(value) {
  // явно преобразуй и проверь значение
}`,
  },
  {
    id: "js-operators-control-flow",
    area: "js",
    title: "Операторы, условия, циклы и управление потоком",
    subtitle: "Как писать ветвления и повторения так, чтобы бизнес-правила читались без угадывания.",
    level: "Core",
    duration: "50 мин",
    core: "Условия и циклы превращают данные в поведение, поэтому от их ясности зависит корректность интерфейса.",
    mechanism: "if, switch, ternary, for, while и break/continue управляют тем, какие ветки кода выполняются и когда цикл должен остановиться.",
    workplace: "В checkout-сценарии условия доставки, скидки и доступности кнопки должны быть выражены явно, иначе баги появляются на редких комбинациях данных.",
    code: `function canSubmit(form) {
  if (!form.email || !form.delivery) return false;
  if (form.payment === "card" && !form.cardReady) return false;
  return true;
}`,
    concepts: ["guard clauses уменьшают вложенность", "switch полезен для закрытого набора состояний", "for...of читабелен для перебора значений", "break и continue должны быть очевидны"],
    mistakes: ["Писать глубокую пирамиду if там, где достаточно ранних возвратов.", "Забывать default в switch для неизвестного состояния.", "Менять массив во время обычного перебора без ясной причины."],
    interview: ["Когда выбрать switch вместо if?", "Чем for...of отличается от for...in?", "Что такое short-circuit evaluation?"],
    taskScenario: "Форма бронирования должна включать кнопку только при корректном наборе полей и выбранном способе оплаты.",
    taskPrompt: "Напиши getSubmitState(form), которая возвращает 'disabled', 'ready' или 'needs-card' по набору условий.",
    taskInput: "{ email: 'a@b.ru', delivery: true, payment: 'card', cardReady: false }",
    taskOutput: "'needs-card'",
    taskStarter: `function getSubmitState(form) {
  // верни строковый статус
}`,
  },
  {
    id: "js-functions-params-recursion",
    area: "js",
    title: "Функции, параметры, rest/spread и рекурсия",
    subtitle: "Как проектировать функции с понятным контрактом и не смешивать вычисление с побочными эффектами.",
    level: "Interview",
    duration: "60 мин",
    core: "Функция должна иметь ясный вход, выход и ответственность, иначе код быстро становится неподдерживаемым.",
    mechanism: "Параметры создают локальные привязки, rest собирает хвост аргументов, spread разворачивает коллекции, а рекурсия решает задачи через базовый случай и шаг.",
    workplace: "В дизайн-системе форматтеры, валидаторы и фабрики обработчиков должны быть маленькими функциями, которые легко тестировать отдельно от UI.",
    code: `function formatUserName({ firstName, lastName }) {
  return [firstName, lastName].filter(Boolean).join(" ");
}`,
    concepts: ["чистая функция возвращает результат без внешних изменений", "default parameters задают безопасные значения", "rest отличается от arguments", "рекурсии нужен базовый случай"],
    mistakes: ["Смешивать вычисление, DOM-обновление и сетевой запрос в одной функции.", "Использовать arguments в современном коде без причины.", "Писать рекурсию без условия остановки."],
    interview: ["Что такое чистая функция?", "Чем rest отличается от spread?", "Когда рекурсия лучше цикла?"],
    taskScenario: "Профиль пользователя приходит из API частично заполненным, а UI должен стабильно показать имя.",
    taskPrompt: "Напиши getDisplayName(user), которая собирает имя из firstName, lastName или возвращает fallback.",
    taskInput: "{ firstName: 'Ada', lastName: '' }",
    taskOutput: "'Ada'",
    taskStarter: `function getDisplayName(user, fallback = "Пользователь") {
  // собери имя без лишних пробелов
}`,
  },
  {
    id: "js-objects-this-copying",
    area: "js",
    title: "Объекты, this, копирование и ссылки",
    subtitle: "Почему объект не копируется через присваивание и как this зависит от вызова.",
    level: "Interview",
    duration: "65 мин",
    core: "Объекты лежат за ссылками, а this определяется не местом объявления, а способом вызова функции.",
    mechanism: "Присваивание объекта копирует ссылку, spread делает поверхностную копию, а this получает значение в момент вызова обычной функции.",
    workplace: "В state-менеджменте нельзя мутировать объект настроек напрямую, потому что компоненты и кеши могут не увидеть изменение.",
    code: `const nextUser = {
  ...user,
  profile: {
    ...user.profile,
    city: "Москва",
  },
};`,
    concepts: ["объекты сравниваются по ссылке", "spread копирует только первый уровень", "this теряется при передаче метода", "structuredClone подходит не для всех значений"],
    mistakes: ["Мутировать вложенный объект и ожидать, что все подписчики заметят изменение.", "Делать поверхностную копию там, где меняется вложенная структура.", "Передавать метод как callback и терять this."],
    interview: ["Почему {} === {} возвращает false?", "Как сделать копию вложенного объекта?", "Как работает this в обычной функции?"],
    taskScenario: "Настройки уведомлений пользователя нужно обновить без мутации исходного объекта.",
    taskPrompt: "Напиши updateNotificationSettings(user, patch), которая возвращает новый объект пользователя с обновлённым вложенным settings.notifications.",
    taskInput: "user.settings.notifications.email = false, patch = { email: true }",
    taskOutput: "новый user, исходный объект не изменён",
    taskStarter: `function updateNotificationSettings(user, patch) {
  // не мутируй user
}`,
  },
  {
    id: "js-arrays-iteration-methods",
    area: "js",
    title: "Массивы и методы перебора",
    subtitle: "map, filter, reduce, sort, find и выбор метода под задачу.",
    level: "Core",
    duration: "55 мин",
    core: "Методы массивов позволяют выражать преобразование данных декларативно, но каждый метод имеет свой контракт.",
    mechanism: "map возвращает массив той же длины, filter отбирает элементы, reduce сворачивает коллекцию, sort мутирует исходный массив.",
    workplace: "В интерфейсе списка заказов нужно фильтровать, сортировать и группировать данные без случайной мутации исходного ответа API.",
    code: `const visibleOrders = orders
  .filter((order) => order.status !== "archived")
  .toSorted((a, b) => b.createdAt - a.createdAt);`,
    concepts: ["map не подходит для побочных эффектов", "filter сохраняет порядок", "sort мутирует исходный массив", "reduce должен иметь понятный accumulator"],
    mistakes: ["Использовать map вместо forEach ради побочного эффекта.", "Мутировать массив через sort перед сохранением исходного порядка.", "Писать reduce, который сложнее простого цикла."],
    interview: ["Чем map отличается от forEach?", "Почему sort может быть опасен?", "Когда reduce оправдан?"],
    taskScenario: "Dashboard должен показать активные задачи, отсортированные по дедлайну, не меняя исходный массив.",
    taskPrompt: "Напиши getVisibleTasks(tasks), которая отбирает невыполненные задачи и сортирует их по dueDate.",
    taskInput: "[{ title: 'A', done: false, dueDate: 2 }, { title: 'B', done: true, dueDate: 1 }]",
    taskOutput: "только невыполненные задачи в порядке дедлайна",
    taskStarter: `function getVisibleTasks(tasks) {
  // не мутируй исходный массив
}`,
  },
  {
    id: "js-strings-numbers-dates-json",
    area: "js",
    title: "Строки, числа, даты и JSON",
    subtitle: "Как форматировать данные для интерфейса и не ломать локали, округления и сериализацию.",
    level: "Production",
    duration: "65 мин",
    core: "Пользователь видит строки, деньги, даты и ошибки формата, поэтому базовые типы напрямую влияют на доверие к интерфейсу.",
    mechanism: "Строки неизменяемы, числа имеют ограничения IEEE 754, Date хранит момент времени, JSON сериализует только поддерживаемые типы.",
    workplace: "В личном кабинете дата платежа должна отображаться в локали пользователя, а сумма не должна терять копейки из-за float-арифметики.",
    code: `const formatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});

console.log(formatter.format(1290));`,
    concepts: ["Intl лучше ручного форматирования дат и денег", "JSON.stringify пропускает undefined", "Date хранит timestamp", "деньги лучше хранить в минимальных единицах"],
    mistakes: ["Склеивать дату руками вместо Intl.DateTimeFormat.", "Хранить деньги в float и делать много арифметики.", "Ожидать, что JSON сохранит функции и undefined."],
    interview: ["Почему 0.1 + 0.2 не равно точно 0.3?", "Что делает JSON.stringify с undefined?", "Зачем нужен Intl?"],
    taskScenario: "История платежей должна показать сумму и дату в формате ru-RU.",
    taskPrompt: "Напиши formatPayment(payment), которая возвращает строку вида '1 290,00 ₽ · 18.08.2026'.",
    taskInput: "{ amountKopecks: 129000, paidAt: '2026-08-18T10:00:00Z' }",
    taskOutput: "'1 290,00 ₽ · 18.08.2026'",
    taskStarter: `function formatPayment(payment) {
  // используй Intl.NumberFormat и Intl.DateTimeFormat
}`,
  },
  {
    id: "js-modules-import-export",
    area: "js",
    title: "Модули, import/export и границы файлов",
    subtitle: "Как разбивать код на независимые части и не создавать циклическую паутину зависимостей.",
    level: "Production",
    duration: "55 мин",
    core: "Модули задают архитектурные границы: что файл отдаёт наружу, а что остаётся внутренней реализацией.",
    mechanism: "ES-модули имеют статические import/export, выполняются один раз и кэшируются, а bindings остаются живыми ссылками.",
    workplace: "В большом frontend-проекте модуль filters.ts не должен импортировать UI-компонент, иначе бизнес-логика привяжется к React и станет труднее тестироваться.",
    code: `// price.ts
export function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(value);
}`,
    concepts: ["named export удобен для набора утилит", "default export подходит для главной сущности файла", "баррель-файлы нужно использовать осторожно", "циклические зависимости усложняют запуск"],
    mistakes: ["Экспортировать всё подряд и размывать публичный API модуля.", "Создавать циклические импорты между слоями.", "Смешивать UI, запросы и чистые функции в одном файле."],
    interview: ["Чем named export отличается от default?", "Почему циклические импорты опасны?", "Что значит live binding в ES modules?"],
    taskScenario: "В проекте нужно вынести форматирование цены и даты из компонента в отдельный модуль.",
    taskPrompt: "Раздели код на formatters.ts и ProductCard.tsx так, чтобы компонент импортировал только готовые функции форматирования.",
    taskInput: "ProductCard содержит форматирование inline",
    taskOutput: "Компонент стал тоньше, форматтеры можно тестировать отдельно",
    taskStarter: `// formatters.ts
export function formatPrice(value) {
  // реализация
}`,
  },
  {
    id: "js-errors-debugging",
    area: "js",
    title: "Ошибки, try/catch и отладка",
    subtitle: "Как не скрывать проблемы и превращать сбой в понятный сценарий для пользователя.",
    level: "Production",
    duration: "60 мин",
    core: "Обработка ошибок нужна не для замалчивания сбоя, а для управляемого восстановления и диагностики.",
    mechanism: "throw создаёт исключение, try/catch перехватывает синхронные ошибки и await-reject, finally выполняется независимо от результата.",
    workplace: "Если загрузка профиля упала, интерфейс должен показать понятное состояние, дать повторить запрос и сохранить информацию для диагностики.",
    code: `try {
  const profile = await loadProfile();
  renderProfile(profile);
} catch (error) {
  renderError("Не удалось загрузить профиль");
}`,
    concepts: ["не каждый catch должен молча продолжать", "finally удобен для снятия loading", "Error хранит message и stack", "ошибки async ловятся через await или catch"],
    mistakes: ["Поймать ошибку и ничего не сделать.", "Показывать пользователю технический stack trace.", "Считать, что try/catch поймает ошибку внутри setTimeout без отдельной обработки."],
    interview: ["Что попадает в catch у async/await?", "Зачем нужен finally?", "Почему нельзя глушить ошибки пустым catch?"],
    taskScenario: "Кнопка 'Повторить' должна перезапускать загрузку данных после ошибки сети.",
    taskPrompt: "Напиши loadWithState(fn), которая возвращает объект { status, data, error } для success/error-сценариев.",
    taskInput: "fn resolved или rejected",
    taskOutput: "{ status: 'success', data } или { status: 'error', error }",
    taskStarter: `async function loadWithState(fn) {
  // обработай success и error
}`,
  },
  {
    id: "js-map-set-weakmap-iterators",
    area: "js",
    title: "Map, Set, WeakMap и итераторы",
    subtitle: "Когда Object и Array уже не лучший контейнер для данных.",
    level: "Interview",
    duration: "60 мин",
    core: "Коллекции выбирают по задаче: уникальность, ключи-объекты, порядок обхода, слабые ссылки и итерация.",
    mechanism: "Map хранит пары ключ-значение с любыми ключами, Set хранит уникальные значения, WeakMap не удерживает ключи от сборки мусора.",
    workplace: "В UI-конструкторе можно хранить метаданные DOM-элементов в WeakMap, чтобы не мешать сборке мусора после удаления элемента.",
    code: `const selectedIds = new Set();

function toggle(id) {
  selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id);
}`,
    concepts: ["Set удобен для уникальных значений", "Map лучше Object для произвольных ключей", "WeakMap подходит для приватных метаданных объекта", "итератор возвращает значения по протоколу next"],
    mistakes: ["Использовать массив для частых проверок уникальности на больших данных.", "Ожидать, что WeakMap можно перебрать.", "Хранить объектные ключи в обычном объекте без понимания string coercion."],
    interview: ["Чем Map отличается от Object?", "Почему WeakMap нельзя перебрать?", "Когда Set лучше массива?"],
    taskScenario: "Таблица заказов должна быстро переключать выбранные строки и проверять, выбран ли заказ.",
    taskPrompt: "Напиши createSelection(), которая использует Set и возвращает toggle(id), has(id), values().",
    taskInput: "toggle('a'), toggle('b'), toggle('a')",
    taskOutput: "values() возвращает ['b']",
    taskStarter: `function createSelection() {
  const selected = new Set();
  // верни методы
}`,
  },
  {
    id: "js-generators-advanced-iteration",
    area: "js",
    title: "Генераторы и продвинутая итерация",
    subtitle: "Как описывать ленивые последовательности и свои перебираемые объекты.",
    level: "Interview",
    duration: "55 мин",
    core: "Генераторы позволяют выдавать значения по одному и строить ленивые последовательности без создания больших массивов.",
    mechanism: "function* возвращает iterator, yield приостанавливает выполнение, а Symbol.iterator делает объект перебираемым.",
    workplace: "В списке логов можно читать порции данных и обрабатывать их постепенно, не создавая огромный массив в памяти.",
    code: `function* range(from, to) {
  for (let value = from; value <= to; value += 1) {
    yield value;
  }
}`,
    concepts: ["yield приостанавливает генератор", "iterator имеет метод next", "iterable реализует Symbol.iterator", "ленивость экономит память"],
    mistakes: ["Создавать большой массив там, где достаточно ленивого перебора.", "Путать iterable и iterator.", "Ожидать, что генератор выполнится полностью без обхода."],
    interview: ["Что возвращает generator function?", "Чем iterable отличается от iterator?", "Когда генератор полезнее массива?"],
    taskScenario: "Нужно постранично обойти диапазон id и отправить запросы пачками.",
    taskPrompt: "Напиши генератор paginateIds(ids, size), который выдаёт массивы id фиксированного размера.",
    taskInput: "[1,2,3,4,5], size = 2",
    taskOutput: "[1,2], [3,4], [5]",
    taskStarter: `function* paginateIds(ids, size) {
  // yield пачки id
}`,
  },
  {
    id: "js-memory-garbage-refs",
    area: "js",
    title: "Память, ссылки и сборка мусора",
    subtitle: "Почему утечки возникают даже в браузере с автоматическим управлением памятью.",
    level: "Production",
    duration: "55 мин",
    core: "Сборщик мусора освобождает недостижимые объекты, но код может случайно удерживать ссылки дольше нужного.",
    mechanism: "Объект остаётся в памяти, пока достижим из корней: глобальных переменных, замыканий, DOM-ссылок, активных таймеров или подписок.",
    workplace: "В SPA утечка часто появляется, когда компонент снят со страницы, но подписка или таймер продолжает ссылаться на его данные.",
    code: `const timer = setInterval(updateClock, 1000);

function cleanup() {
  clearInterval(timer);
}`,
    concepts: ["достижимость важнее места создания", "таймеры и подписки удерживают callback", "WeakMap не удерживает ключи", "cleanup должен быть частью жизненного цикла"],
    mistakes: ["Оставлять активный setInterval после ухода со страницы.", "Хранить DOM-узлы в глобальном массиве.", "Считать, что удаление элемента из DOM всегда освобождает все связанные ссылки."],
    interview: ["Что такое достижимый объект?", "Как таймер может создать утечку?", "Зачем WeakMap помогает с метаданными?"],
    taskScenario: "Виджет уведомлений открывается и закрывается много раз, но старые обработчики продолжают работать.",
    taskPrompt: "Напиши createNotificationWidget(root), который возвращает destroy() и снимает обработчики/таймеры.",
    taskInput: "widget.destroy()",
    taskOutput: "после destroy обработчики больше не вызываются",
    taskStarter: `function createNotificationWidget(root) {
  // добавь обработчики и верни destroy
}`,
  },
  {
    id: "js-fetch-formdata-url",
    area: "js",
    title: "Fetch, FormData, URL и работа с API",
    subtitle: "Как отправлять запросы, собирать параметры и обрабатывать статусы без хрупкого кода.",
    level: "Production",
    duration: "70 мин",
    core: "Работа с API требует явной обработки статусов, ошибок сети, параметров URL и формата тела запроса.",
    mechanism: "fetch отклоняется при сетевой ошибке, но HTTP 400/500 остаются resolved Response; URLSearchParams безопасно кодирует query.",
    workplace: "В каталоге товаров фильтры должны попадать в URL, чтобы ссылку можно было отправить, а ошибки API должны показывать понятное состояние.",
    code: `const url = new URL("/api/products", location.origin);
url.searchParams.set("query", query);

const response = await fetch(url);
if (!response.ok) throw new Error("API error");`,
    concepts: ["response.ok проверяет HTTP-статус", "URLSearchParams кодирует параметры", "FormData подходит для форм и файлов", "AbortController отменяет устаревший запрос"],
    mistakes: ["Считать, что fetch сам упадёт на HTTP 500.", "Склеивать query string руками без кодирования.", "Не отменять устаревшие запросы поиска."],
    interview: ["Почему fetch не rejected на 404?", "Как отправить FormData?", "Как собрать query параметры безопасно?"],
    taskScenario: "Страница поиска должна синхронизировать query и category с URL и отправить запрос к API.",
    taskPrompt: "Напиши buildProductsUrl(filters), используя URL и URLSearchParams.",
    taskInput: "{ query: 'phone case', category: 'accessories' }",
    taskOutput: "/api/products?query=phone+case&category=accessories",
    taskStarter: `function buildProductsUrl(filters) {
  // верни строку URL
}`,
  },
  {
    id: "js-storage-cookies-indexeddb",
    area: "js",
    title: "LocalStorage, cookies, sessionStorage и IndexedDB",
    subtitle: "Как выбрать браузерное хранилище под прогресс, настройки, сессию и офлайн-данные.",
    level: "Production",
    duration: "60 мин",
    core: "Хранилище выбирают по размеру данных, сроку жизни, безопасности и необходимости доступа на сервере.",
    mechanism: "localStorage синхронный и простой, sessionStorage живёт в рамках вкладки, cookies уходят с запросами, IndexedDB подходит для больших структурированных данных.",
    workplace: "Прогресс тренажёра можно хранить в localStorage, но токены доступа нельзя класть туда без понимания рисков.",
    code: `const progress = JSON.parse(localStorage.getItem("progress") || "{}");
progress[topicId] = score;
localStorage.setItem("progress", JSON.stringify(progress));`,
    concepts: ["localStorage блокирует поток на время операции", "cookies имеют атрибуты HttpOnly, Secure, SameSite", "IndexedDB асинхронная", "данные браузера может очистить пользователь"],
    mistakes: ["Хранить чувствительные токены в localStorage без оценки угроз.", "Писать большие объёмы в localStorage на каждый keypress.", "Считать cookies просто клиентским хранилищем без сетевых последствий."],
    interview: ["Чем localStorage отличается от sessionStorage?", "Когда использовать IndexedDB?", "Что делает SameSite у cookies?"],
    taskScenario: "Тренажёр должен сохранить лучший результат по теме на устройстве пользователя.",
    taskPrompt: "Напиши saveBestScore(topicId, score), которая обновляет только лучший результат и не затирает остальные темы.",
    taskInput: "topicId = 'js', score = 8 при сохранённом best 6",
    taskOutput: "best для js становится 8",
    taskStarter: `function saveBestScore(topicId, score) {
  // localStorage + JSON
}`,
  },
  {
    id: "js-web-workers-background",
    area: "js",
    title: "Web Workers и тяжёлые вычисления",
    subtitle: "Как вынести работу из главного потока и не заморозить интерфейс.",
    level: "Production",
    duration: "55 мин",
    core: "Worker помогает выполнять тяжёлые вычисления вне главного UI-потока, чтобы клики и отрисовка оставались отзывчивыми.",
    mechanism: "Worker запускается в отдельном контексте, общается через postMessage и получает данные копированием или transferable objects.",
    workplace: "Если импорт CSV на 50 тысяч строк парсится на главном потоке, пользователь видит зависший интерфейс; worker позволяет показать прогресс.",
    code: `const worker = new Worker("/parser-worker.js");
worker.postMessage(file);
worker.onmessage = (event) => {
  renderPreview(event.data);
};`,
    concepts: ["worker не имеет прямого доступа к DOM", "postMessage передаёт данные между потоками", "transferable objects помогают с бинарными данными", "UI должен показывать прогресс и отмену"],
    mistakes: ["Пытаться менять DOM внутри worker.", "Передавать огромные данные без понимания стоимости копирования.", "Не обрабатывать ошибку worker.onerror."],
    interview: ["Что нельзя делать в Web Worker?", "Как worker общается с главным потоком?", "Когда worker оправдан?"],
    taskScenario: "Пользователь загружает большой CSV, а интерфейс должен оставаться кликабельным.",
    taskPrompt: "Опиши и реализуй минимальную схему main thread + worker для парсинга строк и отправки прогресса.",
    taskInput: "file с 50000 строк",
    taskOutput: "UI получает progress и итоговый массив ошибок",
    taskStarter: `// main.js
const worker = new Worker("/worker.js");
// настрой сообщения`,
  },
  {
    id: "js-security-xss-cors",
    area: "js",
    title: "Безопасность фронтенда: XSS, CORS и доверие к данным",
    subtitle: "Как не превратить пользовательский ввод в уязвимость.",
    level: "Production",
    duration: "70 мин",
    core: "Frontend отвечает за безопасную вставку данных, корректную работу с origin и осторожное обращение с токенами.",
    mechanism: "XSS возникает, когда непроверенные данные интерпретируются как код или HTML; CORS управляет тем, какие origin могут читать ответ.",
    workplace: "Комментарии пользователей, markdown-превью и rich text редакторы требуют очистки HTML, иначе один комментарий может выполнить скрипт у других пользователей.",
    code: `element.textContent = userComment;
// не element.innerHTML = userComment`,
    concepts: ["textContent безопаснее для обычного текста", "CORS не является авторизацией", "HttpOnly cookie недоступна JavaScript", "CSP снижает последствия XSS"],
    mistakes: ["Вставлять пользовательский ввод через innerHTML.", "Считать CORS защитой от всех запросов.", "Хранить access token там, где его легко украсть через XSS."],
    interview: ["Что такое XSS?", "Почему CORS не заменяет авторизацию?", "Чем textContent безопаснее innerHTML?"],
    taskScenario: "Чат должен показать сообщение пользователя без выполнения HTML.",
    taskPrompt: "Напиши renderMessage(container, message), которая безопасно добавляет текст и не интерпретирует HTML.",
    taskInput: "\"<img src=x onerror=alert(1)>\"",
    taskOutput: "текст показан как текст, скрипт не выполняется",
    taskStarter: `function renderMessage(container, message) {
  // создай элемент и используй textContent
}`,
  },
  {
    id: "css-selectors-pseudo",
    area: "css",
    title: "Селекторы, псевдоклассы и псевдоэлементы",
    subtitle: "Как выбирать элементы точно и не повышать специфичность без причины.",
    level: "Core",
    duration: "55 мин",
    core: "Селекторы задают область действия стилей, поэтому от их точности зависит поддерживаемость CSS.",
    mechanism: "Классы, атрибуты, псевдоклассы и псевдоэлементы участвуют в специфичности и применяются к разным состояниям или частям элемента.",
    workplace: "В форме нужно подсветить :focus-visible и :invalid, но не ломать все input на сайте длинными глобальными селекторами.",
    code: `.field:focus-within {
  border-color: #0b8f76;
}

.field::after {
  content: attr(data-hint);
}`,
    concepts: [":focus-visible лучше для клавиатурного фокуса", "::before и ::after создают псевдоэлементы", "[data-state='open'] удобно для состояний", ":where снижает специфичность"],
    mistakes: ["Писать селектор от body через всю вложенность.", "Стилизовать фокус так, что клавиатурный пользователь его не видит.", "Использовать псевдоэлементы для важного текста без доступной альтернативы."],
    interview: ["Чем псевдокласс отличается от псевдоэлемента?", "Для чего нужен :focus-visible?", "Как работает селектор по атрибуту?"],
    taskScenario: "Компонент поля ввода должен показывать фокус, ошибку и подсказку без JavaScript.",
    taskPrompt: "Напиши CSS для .field, .field:focus-within и .field[data-state='error'].",
    taskInput: "<label class='field' data-state='error'><input /></label>",
    taskOutput: "видимый фокус и состояние ошибки",
    taskStarter: `.field {
  /* базовое состояние */
}`,
  },
  {
    id: "css-box-model-sizing",
    area: "css",
    title: "Блочная модель, box-sizing, margin и overflow",
    subtitle: "Почему элемент занимает больше места, чем кажется, и как контролировать переполнение.",
    level: "Core",
    duration: "55 мин",
    core: "Блочная модель определяет реальный размер элемента: content, padding, border и margin.",
    mechanism: "box-sizing: border-box включает padding и border в заданную ширину, а overflow управляет содержимым, которое не помещается.",
    workplace: "Мобильная карточка может вылететь за экран из-за width, padding и длинного слова, даже если визуально CSS выглядит простым.",
    code: `* {
  box-sizing: border-box;
}

.card {
  max-width: 100%;
  overflow-wrap: anywhere;
}`,
    concepts: ["margin находится вне border", "padding увеличивает область внутри элемента", "border-box упрощает расчёт ширины", "overflow-wrap спасает длинные строки"],
    mistakes: ["Задавать width: 100% и большой padding без border-box.", "Скрывать overflow вместо исправления причины.", "Не проверять длинные URL и кодовые строки на телефоне."],
    interview: ["Из чего состоит box model?", "Что меняет box-sizing?", "Почему появляется горизонтальный overflow?"],
    taskScenario: "Карточка задачи на 360px вылезает за экран из-за длинной строки кода.",
    taskPrompt: "Исправь CSS карточки так, чтобы текст переносился, а код прокручивался внутри pre.",
    taskInput: "длинный URL внутри карточки",
    taskOutput: "страница без горизонтального скролла",
    taskStarter: `.task-card {
  /* исправь размеры и переносы */
}`,
  },
  {
    id: "css-colors-typography",
    area: "css",
    title: "Цвет, контраст, типографика и читаемость",
    subtitle: "Как сделать интерфейс не только красивым, но и читаемым в реальной среде.",
    level: "Production",
    duration: "60 мин",
    core: "Цвет и типографика управляют вниманием, иерархией и доступностью интерфейса.",
    mechanism: "Размер, line-height, font-weight, contrast ratio и состояние ссылок/кнопок вместе определяют, насколько легко пользоваться страницей.",
    workplace: "В учебной платформе длинный конспект должен читаться на телефоне без усталости: нормальная длина строки, контраст и предсказуемые размеры.",
    code: `.article {
  color: #151716;
  font-size: 1rem;
  line-height: 1.65;
}`,
    concepts: ["line-height важен для длинного текста", "контраст нужен не только для кнопок", "цвет не должен быть единственным сигналом", "длина строки влияет на скорость чтения"],
    mistakes: ["Делать серый текст слишком светлым.", "Показывать ошибку только красным цветом без текста.", "Использовать огромные заголовки внутри маленьких карточек."],
    interview: ["Что такое контрастность?", "Почему нельзя полагаться только на цвет?", "Как line-height влияет на чтение?"],
    taskScenario: "Страница конспекта выглядит красиво, но текст утомляет на телефоне.",
    taskPrompt: "Настрой стили .article так, чтобы длинные абзацы читались комфортно и имели достаточный контраст.",
    taskInput: "несколько абзацев по 5-7 строк",
    taskOutput: "читаемый текст без слипания строк",
    taskStarter: `.article {
  /* typography */
}`,
  },
  {
    id: "css-position-stacking",
    area: "css",
    title: "Position, z-index и контекст наложения",
    subtitle: "Почему z-index не работает и как модалки оказываются под шапкой.",
    level: "Interview",
    duration: "60 мин",
    core: "Позиционирование и stacking context определяют, где элемент находится в потоке и как перекрывает соседей.",
    mechanism: "position меняет участие элемента в потоке, а z-index работает внутри контекста наложения, который могут создавать transform, opacity, position и другие свойства.",
    workplace: "В приложении tooltip может оказаться под sticky header не потому, что z-index маленький, а потому что он внутри другого stacking context.",
    code: `.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 1000;
}`,
    concepts: ["relative сохраняет место в потоке", "absolute позиционируется относительно ближайшего positioned ancestor", "fixed привязан к viewport", "transform может создать stacking context"],
    mistakes: ["Повышать z-index до огромных чисел, не проверив stacking context.", "Делать tooltip внутри контейнера с overflow: hidden.", "Использовать absolute для основной раскладки страницы."],
    interview: ["Когда z-index не работает?", "Чем absolute отличается от fixed?", "Что создаёт stacking context?"],
    taskScenario: "Dropdown в таблице обрезается контейнером и скрывается под соседней карточкой.",
    taskPrompt: "Опиши причину и предложи CSS/DOM-решение для слоя выпадающего меню.",
    taskInput: "dropdown внутри overflow: hidden контейнера",
    taskOutput: "меню видно поверх нужного слоя",
    taskStarter: `.dropdown {
  position: absolute;
  z-index: 10;
}`,
  },
  {
    id: "css-transitions-animations",
    area: "css",
    title: "Transitions, animations и prefers-reduced-motion",
    subtitle: "Как добавлять движение, не ухудшая доступность и производительность.",
    level: "Production",
    duration: "60 мин",
    core: "Анимация должна помогать понять изменение состояния, а не отвлекать или ломать доступность.",
    mechanism: "transition описывает переход между состояниями, keyframes задаёт временную шкалу, а prefers-reduced-motion учитывает настройки пользователя.",
    workplace: "В тренажёре можно мягко подсветить правильный ответ, но нельзя делать длинную тряску, если пользователь просит уменьшить движение.",
    code: `@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms;
    transition-duration: 0.01ms;
  }
}`,
    concepts: ["transform и opacity обычно дешевле для анимации", "transition требует начального и конечного состояния", "animation может быть бесконечной", "reduced motion нужно уважать"],
    mistakes: ["Анимировать width/height без необходимости.", "Игнорировать prefers-reduced-motion.", "Использовать движение как единственный способ сообщить о результате."],
    interview: ["Чем transition отличается от animation?", "Почему transform часто лучше top/left?", "Что делает prefers-reduced-motion?"],
    taskScenario: "Кнопка ответа должна показывать correct/wrong состояние мягко и доступно.",
    taskPrompt: "Напиши CSS для состояния ответа с transition и отдельным правилом prefers-reduced-motion.",
    taskInput: ".answer.right и .answer.wrong",
    taskOutput: "состояние заметно без агрессивного движения",
    taskStarter: `.answer {
  transition: background-color 160ms ease;
}`,
  },
  {
    id: "css-custom-properties",
    area: "css",
    title: "Кастомные свойства и дизайн-токены",
    subtitle: "Как управлять цветами, отступами и темами без копирования значений.",
    level: "Production",
    duration: "55 мин",
    core: "CSS-переменные позволяют хранить дизайн-решения в одном месте и менять их через каскад.",
    mechanism: "Custom properties наследуются, вычисляются во время применения стилей и могут менять значение в зависимости от темы, контейнера или состояния.",
    workplace: "В платформе обучения можно менять акцент раздела JS/CSS/React через переменные, не переписывая стили каждой карточки.",
    code: `:root {
  --accent: #0b8f76;
}

.topic-card {
  border-color: var(--accent);
}`,
    concepts: ["var() подставляет значение свойства", "fallback помогает при отсутствии переменной", "переменные наследуются", "токены отделяют смысл от конкретного цвета"],
    mistakes: ["Называть переменные по цвету вместо роли.", "Разбрасывать одинаковые значения без токенов.", "Забывать fallback для переиспользуемых компонентов."],
    interview: ["Чем CSS-переменная отличается от Sass-переменной?", "Как работает fallback в var?", "Почему токены называют по роли?"],
    taskScenario: "Карточки разделов должны менять акцентный цвет по data-area без дублирования компонента.",
    taskPrompt: "Напиши CSS с --accent для [data-area='js'], [data-area='css'] и общей .topic-card.",
    taskInput: "<article class='topic-card' data-area='js'>",
    taskOutput: "один компонент, разные акценты",
    taskStarter: `.topic-card {
  border-color: var(--accent);
}`,
  },
  {
    id: "css-media-container-queries",
    area: "css",
    title: "Media queries, container queries и responsive strategy",
    subtitle: "Как проектировать адаптивность на уровне страницы и компонента.",
    level: "Production",
    duration: "65 мин",
    core: "Адаптивность должна быть стратегией интерфейса, а не набором случайных breakpoint.",
    mechanism: "Media query реагирует на viewport и окружение, container query реагирует на размер контейнера, а mobile first строит интерфейс от узкого экрана.",
    workplace: "Одна карточка курса может жить в широкой сетке, сайдбаре и модалке, поэтому ей лучше адаптироваться к контейнеру.",
    code: `.course-card {
  container-type: inline-size;
}

@container (min-width: 420px) {
  .course-card__body {
    display: grid;
  }
}`,
    concepts: ["mobile first снижает количество переопределений", "breakpoint должен быть связан с контентом", "container queries усиливают компоненты", "touch targets важны на телефоне"],
    mistakes: ["Выбирать breakpoint только по модели устройства.", "Делать desktop layout базовым и потом чинить телефон.", "Забывать проверить длинный русский текст."],
    interview: ["Как выбрать breakpoint?", "Когда нужна container query?", "Что такое mobile first?"],
    taskScenario: "Карточка урока должна быть компактной в сайдбаре и подробной в основной сетке.",
    taskPrompt: "Сделай .lesson-card адаптивной через container query.",
    taskInput: "один HTML-компонент в двух контейнерах",
    taskOutput: "компонент меняет внутреннюю раскладку по ширине контейнера",
    taskStarter: `.lesson-card {
  container-type: inline-size;
}`,
  },
  {
    id: "css-logical-properties",
    area: "css",
    title: "Логические свойства и международные интерфейсы",
    subtitle: "Как писать CSS, который не ломается при другом направлении письма.",
    level: "Production",
    duration: "45 мин",
    core: "Логические свойства описывают направление относительно потока текста, а не только left/right/top/bottom.",
    mechanism: "margin-inline, padding-block, inset-inline-start и border-block зависят от writing mode и direction.",
    workplace: "Если продукт выходит на рынки с RTL-языками, left/right в компонентах превращаются в источник багов.",
    code: `.card {
  padding-block: 16px;
  padding-inline: 20px;
}`,
    concepts: ["inline соответствует направлению строки", "block соответствует направлению блоков", "dir='rtl' меняет inline-start", "логические свойства повышают переиспользуемость"],
    mistakes: ["Жёстко использовать left/right в компоненте, который должен поддержать RTL.", "Смешивать физические и логические свойства без причины.", "Проверять только русскую и английскую локаль."],
    interview: ["Что такое inline-start?", "Зачем нужны logical properties?", "Как dir влияет на раскладку?"],
    taskScenario: "Компонент уведомления должен одинаково работать в LTR и RTL интерфейсе.",
    taskPrompt: "Перепиши CSS с margin-left/padding-right на логические свойства.",
    taskInput: ".notice { margin-left: 16px; padding-right: 20px; }",
    taskOutput: "стили работают при dir='rtl'",
    taskStarter: `.notice {
  /* logical properties */
}`,
  },
  {
    id: "css-forms-ui-states",
    area: "css",
    title: "Стилизация форм и состояний интерфейса",
    subtitle: "Focus, disabled, invalid, loading и визуальная обратная связь.",
    level: "Production",
    duration: "60 мин",
    core: "Форма должна визуально сообщать состояние, не ломая нативное поведение и доступность.",
    mechanism: "Псевдоклассы :focus-visible, :disabled, :invalid, :required и data-state позволяют связать состояние с CSS без лишнего JavaScript.",
    workplace: "В форме регистрации пользователь должен видеть, где фокус, какие поля ошибочны и почему кнопка недоступна.",
    code: `input:focus-visible {
  outline: 3px solid #9adfcb;
}

input:invalid {
  border-color: #b3261e;
}`,
    concepts: ["focus outline нельзя просто удалять", "disabled состояние должно отличаться визуально", "ошибка требует текста, не только цвета", "touch target должен быть удобным"],
    mistakes: ["Убирать outline без замены.", "Делать disabled-кнопку похожей на активную.", "Показывать ошибку только цветом."],
    interview: ["Как стилизовать фокус доступно?", "Чем disabled отличается от aria-disabled?", "Почему placeholder не заменяет label?"],
    taskScenario: "Форма профиля должна показать ошибку email и сохранить видимый фокус клавиатуры.",
    taskPrompt: "Напиши CSS для input, input:focus-visible, input:invalid и .error-text.",
    taskInput: "<input type='email' required>",
    taskOutput: "понятный фокус и ошибка с текстом",
    taskStarter: `input {
  /* base */
}`,
  },
  {
    id: "css-scroll-snap-overflow",
    area: "css",
    title: "Scroll, overflow, sticky и scroll snap",
    subtitle: "Как управлять прокруткой без сломанного мобильного UX.",
    level: "Production",
    duration: "55 мин",
    core: "Прокрутка является частью интерфейса, поэтому overflow, sticky и snap требуют проверки на реальных размерах.",
    mechanism: "overflow создаёт область прокрутки, position: sticky работает внутри scroll container, scroll-snap помогает фиксировать элементы при прокрутке.",
    workplace: "Горизонтальная лента тем должна прокручиваться внутри себя, но не расширять всю страницу на телефоне.",
    code: `.topic-list {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.topic-card {
  scroll-snap-align: start;
}`,
    concepts: ["sticky зависит от ближайшего scroll container", "overflow hidden может обрезать dropdown", "scroll snap требует осторожности", "overscroll-behavior управляет цепочкой прокрутки"],
    mistakes: ["Создать горизонтальную ленту, которая увеличивает scrollWidth всей страницы.", "Ждать sticky внутри контейнера с неожиданным overflow.", "Обрезать focus ring через overflow hidden."],
    interview: ["Почему position: sticky не работает?", "Чем overflow auto отличается от hidden?", "Для чего scroll snap?"],
    taskScenario: "Лента карточек на телефоне должна прокручиваться внутри блока и не создавать горизонтальный скролл страницы.",
    taskPrompt: "Сверстай .rail с overflow-x и карточками фиксированной безопасной ширины.",
    taskInput: "8 карточек тем",
    taskOutput: "documentElement.scrollWidth равен clientWidth",
    taskStarter: `.rail {
  /* horizontal scroll */
}`,
  },
  {
    id: "css-transforms-filters-effects",
    area: "css",
    title: "Transform, filter и визуальные эффекты",
    subtitle: "Как использовать эффекты точечно и не ухудшать производительность.",
    level: "Production",
    duration: "50 мин",
    core: "Визуальные эффекты должны подчёркивать состояние интерфейса и не превращать страницу в тяжёлую анимационную витрину.",
    mechanism: "transform меняет визуальное положение без влияния на поток, filter и backdrop-filter могут быть дорогими, will-change нужно применять редко.",
    workplace: "Hover-карточка урока может слегка подняться через transform, но blur-фон на каждом блоке способен замедлить слабый телефон.",
    code: `.lesson-card:hover {
  transform: translateY(-2px);
}`,
    concepts: ["transform не меняет layout соседей", "filter может быть дорогим", "will-change не нужно держать постоянно", "эффект должен иметь fallback"],
    mistakes: ["Ставить will-change на десятки элементов.", "Использовать blur как основной фон интерфейса.", "Анимировать тяжёлые filter без проверки FPS."],
    interview: ["Почему transform часто дешевле top?", "Когда will-change вреден?", "Чем filter отличается от opacity?"],
    taskScenario: "Карточки курса должны иметь лёгкий hover-эффект без смещения соседей.",
    taskPrompt: "Напиши hover/focus-visible эффект через transform и box-shadow с reduced-motion fallback.",
    taskInput: ".lesson-card",
    taskOutput: "эффект заметен, layout не прыгает",
    taskStarter: `.lesson-card {
  transition: transform 160ms ease;
}`,
  },
  {
    id: "css-methodology-design-system",
    area: "css",
    title: "CSS-методологии, компоненты и дизайн-система",
    subtitle: "Как договориться о стиле CSS в команде и не утонуть в исключениях.",
    level: "Production",
    duration: "70 мин",
    core: "Методология CSS нужна, чтобы компоненты были предсказуемыми, переиспользуемыми и не конфликтовали на больших страницах.",
    mechanism: "BEM, utility-подход, CSS Modules, слои и токены решают разные части проблемы: область действия, переопределение и единый язык дизайна.",
    workplace: "В платформе с десятками карточек и режимов нужно иметь один стандарт button/card/input, иначе каждый экран начинает жить сам по себе.",
    code: `.button {}
.button--primary {}
.button[aria-busy="true"] {}`,
    concepts: ["компонент должен иметь понятный публичный API классов", "модификаторы описывают варианты", "токены задают общие решения", "utilities применяются точечно"],
    mistakes: ["Создавать новый стиль кнопки на каждой странице.", "Смешивать layout страницы и внутренности компонента.", "Делать модификаторы, которые зависят от случайной вложенности."],
    interview: ["Что решает BEM?", "Когда полезны CSS Modules?", "Как дизайн-токены помогают команде?"],
    taskScenario: "В проекте появились пять разных primary-кнопок с разными отступами.",
    taskPrompt: "Опиши API .button и .button--primary/.button--secondary, затем перепиши два примера на единый компонент.",
    taskInput: "разные классы .save-btn, .submitButton",
    taskOutput: "единый button API",
    taskStarter: `.button {
  /* base component */
}`,
  },
  {
    id: "css-modern-functions",
    area: "css",
    title: "Современные CSS-функции: min, max, clamp, color-mix",
    subtitle: "Как писать гибкие значения без россыпи медиазапросов.",
    level: "Production",
    duration: "50 мин",
    core: "Современные функции позволяют выразить адаптивное значение прямо в CSS и сделать дизайн устойчивее.",
    mechanism: "clamp задаёт минимум, желаемое значение и максимум; min/max выбирают ограничение; color-mix смешивает цвета в заданном пространстве.",
    workplace: "Ширина контейнера, размер отступов и оттенки состояний могут адаптироваться плавно, а не прыгать на каждом breakpoint.",
    code: `.content {
  width: min(100% - 24px, 1120px);
  padding-block: clamp(24px, 5vw, 72px);
}`,
    concepts: ["clamp ограничивает гибкое значение", "min полезен для безопасной ширины", "max задаёт нижний предел", "color-mix помогает строить состояния от токенов"],
    mistakes: ["Использовать viewport-based font-size для всего текста.", "Писать 10 breakpoint там, где достаточно clamp.", "Забывать fallback для новых возможностей при необходимости."],
    interview: ["Как работает clamp?", "Где полезен min?", "Зачем color-mix?"],
    taskScenario: "Контейнер страницы должен быть гибким: не прилипать к краям телефона и не растягиваться бесконечно на десктопе.",
    taskPrompt: "Напиши CSS для .container через min() и clamp().",
    taskInput: "viewport 360px и 1440px",
    taskOutput: "контейнер имеет безопасные поля и максимум ширины",
    taskStarter: `.container {
  /* min + clamp */
}`,
  },
  {
    id: "html-document-head-seo",
    area: "html",
    title: "Структура документа, head, meta и базовое SEO",
    subtitle: "Как браузер, поиск и соцсети понимают страницу ещё до отрисовки интерфейса.",
    level: "Production",
    duration: "55 мин",
    core: "head описывает документ для браузера, поисковиков, устройств и внешних сервисов.",
    mechanism: "doctype включает standards mode, html lang задаёт язык, title и description описывают страницу, viewport управляет мобильным масштабом.",
    workplace: "Если у учебной страницы нет нормального title и description, её хуже находят, хуже сохраняют и хуже открывают с телефона.",
    code: `<head>
  <title>Front Gym Pro</title>
  <meta name="description" content="Платформа подготовки фронтендера" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>`,
    concepts: ["doctype должен быть в начале документа", "lang помогает скринридерам", "viewport критичен для мобильной версии", "description влияет на сниппеты"],
    mistakes: ["Забыть viewport и получить десктопную страницу на телефоне.", "Оставить одинаковый title на всех страницах.", "Не указать язык документа."],
    interview: ["Зачем нужен doctype?", "Что делает meta viewport?", "Почему lang важен?"],
    taskScenario: "Нужно подготовить HTML-страницу учебного модуля к публикации и нормальному отображению на телефоне.",
    taskPrompt: "Напиши минимальный head с title, description, viewport, charset и favicon.",
    taskInput: "название модуля и описание",
    taskOutput: "валидный head для страницы",
    taskStarter: `<!doctype html>
<html lang="ru">
  <head>
    <!-- meta -->
  </head>
</html>`,
  },
  {
    id: "html-text-semantics",
    area: "html",
    title: "Текстовая семантика: заголовки, абзацы, цитаты и inline-теги",
    subtitle: "Как разметить содержание так, чтобы структура была понятна без CSS.",
    level: "Core",
    duration: "50 мин",
    core: "Текстовая семантика создаёт структуру документа и помогает чтению, поиску и навигации вспомогательных технологий.",
    mechanism: "Заголовки задают иерархию, p группирует абзацы, blockquote/cite/q описывают цитирование, strong/em передают смысловое выделение.",
    workplace: "В учебнике важна предсказуемая структура: пользователь должен быстро сканировать тему по заголовкам и понимать, где пример, где предупреждение.",
    code: `<article>
  <h1>Замыкания</h1>
  <p>Замыкание связывает функцию с окружением.</p>
  <blockquote cite="https://example.com">...</blockquote>
</article>`,
    concepts: ["h1-h6 задают структуру, а не размер", "strong и b имеют разный смысл", "em передаёт акцент", "blockquote нужен для длинной цитаты"],
    mistakes: ["Выбирать h3 только потому, что он визуально меньше.", "Использовать br для создания абзацев.", "Делать весь текст div-ами без структуры."],
    interview: ["Почему нельзя прыгать по заголовкам без причины?", "Чем strong отличается от b?", "Когда нужен blockquote?"],
    taskScenario: "Статья конспекта импортирована как набор div, и её нужно сделать семантической.",
    taskPrompt: "Переразметь текст статьи с h1, h2, p, ul и blockquote там, где это уместно.",
    taskInput: "div.title, div.subtitle, div.text",
    taskOutput: "семантическая статья",
    taskStarter: `<article>
  <!-- структура статьи -->
</article>`,
  },
  {
    id: "html-links-navigation",
    area: "html",
    title: "Ссылки, навигация и download/target/rel",
    subtitle: "Как отличать переход от действия и делать навигацию безопасной.",
    level: "Core",
    duration: "45 мин",
    core: "Ссылка означает переход к ресурсу, а кнопка означает действие в текущем интерфейсе.",
    mechanism: "a с href участвует в навигации, открывается в новой вкладке, копируется как ссылка и может иметь rel для безопасности.",
    workplace: "В карточке источника внешняя ссылка должна открываться безопасно через target='_blank' и rel='noreferrer', а запуск тренировки должен быть button.",
    code: `<a href="https://react.dev/learn" target="_blank" rel="noreferrer">
  React Docs
</a>`,
    concepts: ["href делает элемент настоящей ссылкой", "button лучше для действия", "rel='noreferrer' защищает внешние переходы", "download предлагает сохранить файл"],
    mistakes: ["Использовать div onClick для навигации.", "Открывать внешнюю ссылку в новой вкладке без rel.", "Ставить button там, где нужна настоящая ссылка."],
    interview: ["Чем ссылка отличается от кнопки?", "Зачем rel='noopener' или noreferrer?", "Когда нужен download?"],
    taskScenario: "В списке источников часть элементов ведёт наружу, часть запускает тренировку.",
    taskPrompt: "Разметь источники через a, а запуск тренировки через button.",
    taskInput: "React Docs URL и действие startTraining",
    taskOutput: "семантически корректная навигация",
    taskStarter: `<nav>
  <!-- links and actions -->
</nav>`,
  },
  {
    id: "html-images-media-picture",
    area: "html",
    title: "Изображения, picture, audio/video и lazy loading",
    subtitle: "Как показывать медиа быстро, адаптивно и доступно.",
    level: "Production",
    duration: "60 мин",
    core: "Медиа влияет на скорость, доступность и понимание контента, поэтому img, picture и video требуют правильных атрибутов.",
    mechanism: "img загружает ресурс с alt, picture выбирает источник по условиям, loading='lazy' откладывает загрузку, width/height предотвращают скачок layout.",
    workplace: "В статье с примерами интерфейсов скриншоты должны иметь размеры, понятный alt и адаптивные версии для разных экранов.",
    code: `<picture>
  <source srcset="/hero.avif" type="image/avif" />
  <img src="/hero.jpg" alt="Интерфейс тренажёра" width="1200" height="800" loading="lazy" />
</picture>`,
    concepts: ["alt передаёт смысл изображения", "width и height уменьшают layout shift", "picture помогает выбрать формат", "captions важны для видео"],
    mistakes: ["Оставлять важную картинку без alt.", "Не задавать размеры изображения.", "Автозапускать видео со звуком."],
    interview: ["Когда alt должен быть пустым?", "Зачем width и height у img?", "Чем picture отличается от img srcset?"],
    taskScenario: "Страница урока содержит обложку и несколько скриншотов, которые не должны замедлять первый экран.",
    taskPrompt: "Разметь адаптивное изображение с picture, alt, width/height и lazy loading для нижних скриншотов.",
    taskInput: "hero.avif, hero.webp, hero.jpg",
    taskOutput: "быстрая и доступная загрузка изображений",
    taskStarter: `<picture>
  <!-- sources -->
</picture>`,
  },
  {
    id: "html-tables-data",
    area: "html",
    title: "Таблицы и табличные данные",
    subtitle: "Когда table нужен, а когда таблицей нельзя верстать страницу.",
    level: "Core",
    duration: "50 мин",
    core: "Таблица нужна для данных с отношениями строк и столбцов, а не для декоративной раскладки.",
    mechanism: "caption описывает таблицу, th задаёт заголовки, scope связывает заголовок с row/col, thead/tbody структурируют группы.",
    workplace: "В админке список платежей с датой, суммой и статусом должен быть table, чтобы его можно было читать и анализировать как данные.",
    code: `<table>
  <caption>Платежи за август</caption>
  <thead><tr><th scope="col">Дата</th><th scope="col">Сумма</th></tr></thead>
</table>`,
    concepts: ["caption даёт имя таблице", "th и scope связывают заголовки", "thead/tbody помогают структуре", "таблица не заменяет CSS Grid для layout"],
    mistakes: ["Верстать карточки через table.", "Не указывать заголовки столбцов.", "Скрывать caption так, что смысл таблицы теряется."],
    interview: ["Когда использовать table?", "Зачем нужен scope у th?", "Чем caption полезен?"],
    taskScenario: "Отчёт по результатам тренировки нужно показать как таблицу: тема, лучший счёт, дата.",
    taskPrompt: "Разметь таблицу результатов с caption, thead, tbody и scope.",
    taskInput: "3 строки результатов",
    taskOutput: "семантическая таблица",
    taskStarter: `<table>
  <!-- results -->
</table>`,
  },
  {
    id: "html-interactive-dialog-details-popover",
    area: "html",
    title: "Интерактивные элементы: dialog, details, summary и Popover API",
    subtitle: "Как использовать нативные элементы вместо самописных виджетов там, где браузер уже помогает.",
    level: "Production",
    duration: "60 мин",
    core: "Нативные интерактивные элементы дают семантику, фокус и часть поведения без лишнего JavaScript.",
    mechanism: "details/summary раскрывают контент, dialog создаёт модальное окно с методами showModal/close, popover подходит для всплывающих слоёв.",
    workplace: "В учебной платформе решение задачи можно показывать в dialog, а подсказки и FAQ - через details.",
    code: `<details>
  <summary>Подсказка</summary>
  <p>Проверь область видимости переменной.</p>
</details>`,
    concepts: ["summary должен быть понятным", "dialog требует управления фокусом и закрытием", "popover подходит для лёгких всплывающих блоков", "нативность не отменяет тестирование доступности"],
    mistakes: ["Делать accordion из div без клавиатурной поддержки.", "Открывать dialog без понятной кнопки закрытия.", "Использовать popover для сложного маршрута страницы."],
    interview: ["Чем dialog полезен?", "Когда подходит details?", "Что даёт Popover API?"],
    taskScenario: "В карточке задачи нужна раскрываемая подсказка и модальное окно с чеклистом.",
    taskPrompt: "Разметь hint через details, а checklist через dialog с кнопкой открытия и закрытия.",
    taskInput: "подсказка и чеклист",
    taskOutput: "нативный интерактивный UI",
    taskStarter: `<details>
  <summary>Подсказка</summary>
</details>`,
  },
  {
    id: "html-scripts-resources",
    area: "html",
    title: "script, defer, async, preload и загрузка ресурсов",
    subtitle: "Как подключать код и ресурсы без блокировки страницы.",
    level: "Production",
    duration: "55 мин",
    core: "Порядок загрузки ресурсов влияет на скорость первого экрана и корректность запуска JavaScript.",
    mechanism: "Обычный script блокирует парсинг, defer ждёт HTML и сохраняет порядок, async выполняется сразу после загрузки без гарантии порядка.",
    workplace: "Аналитика может быть async, основной UI-скрипт часто defer, а критичный шрифт или hero-изображение можно preload при ясной пользе.",
    code: `<script src="/app.js" defer></script>
<script src="/analytics.js" async></script>`,
    concepts: ["defer сохраняет порядок скриптов", "async не гарантирует порядок", "preload нужен для критичных ресурсов", "лишний preload может вредить"],
    mistakes: ["Подключать основной скрипт без defer в head.", "Делать все скрипты async и ломать зависимости.", "preload-ить некритичные ресурсы."],
    interview: ["Чем async отличается от defer?", "Что блокирует парсинг HTML?", "Когда нужен preload?"],
    taskScenario: "Страница лениво грузит аналитику и основной интерактивный код.",
    taskPrompt: "Выбери async/defer для двух скриптов и объясни порядок выполнения.",
    taskInput: "main.js зависит от DOM, analytics.js независим",
    taskOutput: "main.js defer, analytics.js async",
    taskStarter: `<head>
  <!-- scripts -->
</head>`,
  },
  {
    id: "html-template-data-attributes",
    area: "html",
    title: "template, data-* и декларативные связи с JavaScript",
    subtitle: "Как хранить шаблоны и служебные данные в разметке без смешивания слоёв.",
    level: "Core",
    duration: "50 мин",
    core: "template и data-* помогают связать HTML и JavaScript, не превращая классы CSS в источник бизнес-логики.",
    mechanism: "template хранит неактивную разметку, которую можно клонировать, а dataset даёт доступ к data-атрибутам элемента.",
    workplace: "В списке задач data-action помогает делегировать клики, а template позволяет создавать новые карточки с одинаковой структурой.",
    code: `<button data-action="remove" data-id="42">Удалить</button>`,
    concepts: ["template content не отображается сразу", "data-* хранит небольшие служебные значения", "dataset переводит kebab-case в camelCase", "data-action удобен для делегирования"],
    mistakes: ["Хранить большие JSON-объекты в data-атрибуте.", "Использовать CSS-классы как единственный источник действий.", "Забывать, что data-* значения строки."],
    interview: ["Для чего нужен template?", "Как читать data-user-id через dataset?", "Почему data-* не стоит использовать для больших данных?"],
    taskScenario: "Todo-приложение должно добавлять новые элементы из template и удалять по data-action.",
    taskPrompt: "Разметь template для todo-item и кнопку удаления с data-action.",
    taskInput: "title задачи",
    taskOutput: "новый li из template",
    taskStarter: `<template id="todo-template">
  <!-- todo item -->
</template>`,
  },
  {
    id: "html-validation-constraints",
    area: "html",
    title: "Constraint Validation API и нативная валидация",
    subtitle: "Как использовать required, pattern, min/max и custom validity без лишней самописной логики.",
    level: "Production",
    duration: "60 мин",
    core: "Нативная валидация помогает быстро получить базовые проверки, но требует понятных сообщений и правильной семантики.",
    mechanism: "Атрибуты required, type, min, max, pattern и методы setCustomValidity/reportValidity участвуют в Constraint Validation API.",
    workplace: "В форме регистрации можно использовать type='email' и required, а бизнес-правило пароля добавить через setCustomValidity.",
    code: `password.setCustomValidity(
  password.value.length < 8 ? "Минимум 8 символов" : "",
);`,
    concepts: ["required проверяет наличие значения", "type email включает базовую проверку формата", "setCustomValidity задаёт свою ошибку", "novalidate отключает нативную проверку формы"],
    mistakes: ["Полагаться только на placeholder вместо label и сообщения.", "Дублировать простые HTML-проверки в JS без причины.", "Не очищать custom validity после исправления поля."],
    interview: ["Что такое Constraint Validation API?", "Как задать свою ошибку поля?", "Зачем нужен reportValidity?"],
    taskScenario: "Форма смены пароля должна проверить длину и совпадение двух полей.",
    taskPrompt: "Реализуй проверку через setCustomValidity для confirmPassword.",
    taskInput: "password='12345678', confirm='123'",
    taskOutput: "форма показывает ошибку совпадения",
    taskStarter: `function validatePasswords(password, confirmPassword) {
  // setCustomValidity
}`,
  },
  {
    id: "html-i18n-lang-dir",
    area: "html",
    title: "Язык, направление текста и интернационализация HTML",
    subtitle: "Как lang, dir, time и локали помогают международному продукту.",
    level: "Production",
    duration: "45 мин",
    core: "Язык и направление текста являются частью смысла документа и влияют на произношение, поиск и раскладку.",
    mechanism: "lang задаёт язык элемента, dir управляет направлением, time хранит машинно-читаемую дату, а CSS logical properties помогают раскладке.",
    workplace: "Если внутри русской статьи есть английский термин или арабская цитата, lang/dir помогают скринридеру прочитать фрагмент правильно.",
    code: `<p>Термин <span lang="en">closure</span> переводят как замыкание.</p>
<time datetime="2026-08-18">18 августа 2026</time>`,
    concepts: ["lang можно ставить не только на html", "dir='auto' полезен для пользовательского текста", "time datetime хранит машинный формат", "локаль влияет на формат даты"],
    mistakes: ["Оставлять lang='en' на русской странице.", "Не учитывать RTL-текст в пользовательском контенте.", "Писать дату только как декоративную строку."],
    interview: ["Зачем lang на фрагменте текста?", "Когда использовать dir='auto'?", "Для чего нужен datetime у time?"],
    taskScenario: "Карточка комментария должна корректно показать текст пользователя на любом языке и дату публикации.",
    taskPrompt: "Разметь комментарий с dir='auto', time datetime и lang там, где язык известен.",
    taskInput: "comment.text, comment.createdAt",
    taskOutput: "доступная и интернациональная разметка",
    taskStarter: `<article class="comment">
  <!-- text and time -->
</article>`,
  },
  {
    id: "html-svg-canvas-basics",
    area: "html",
    title: "SVG, canvas и графика в HTML",
    subtitle: "Когда выбрать векторную разметку, а когда рисовать пиксели скриптом.",
    level: "Interview",
    duration: "55 мин",
    core: "SVG и canvas решают разные задачи: SVG остаётся частью DOM, canvas рисует пиксельную сцену.",
    mechanism: "SVG элементы доступны как DOM-узлы и масштабируются без потерь, canvas управляется через JavaScript API и не хранит отдельные фигуры в DOM.",
    workplace: "Иконки и диаграммы с доступными подписями удобны в SVG, а редактор изображения или игра могут требовать canvas.",
    code: `<svg role="img" aria-labelledby="chart-title" viewBox="0 0 100 40">
  <title id="chart-title">Рост прогресса</title>
  <path d="M0 30 L40 20 L80 8" />
</svg>`,
    concepts: ["SVG масштабируется как вектор", "canvas требует отдельной доступной альтернативы", "viewBox управляет системой координат", "title/aria помогают описать SVG"],
    mistakes: ["Использовать canvas для простой иконки.", "Оставлять важный canvas без текстовой альтернативы.", "Встраивать огромный SVG без оптимизации."],
    interview: ["Чем SVG отличается от canvas?", "Как сделать SVG доступным?", "Что делает viewBox?"],
    taskScenario: "На dashboard нужно показать маленький график прогресса темы.",
    taskPrompt: "Сделай SVG sparkline с title и viewBox.",
    taskInput: "points = [10, 18, 14, 28]",
    taskOutput: "доступный SVG-график",
    taskStarter: `<svg viewBox="0 0 100 40">
  <!-- path -->
</svg>`,
  },
  {
    id: "react-components-props-composition",
    area: "react",
    title: "Компоненты, props, children и композиция",
    subtitle: "Как строить интерфейс из маленьких частей без жёсткого наследования.",
    level: "Core",
    duration: "60 мин",
    core: "React-компонент должен описывать часть UI через props и композицию, а не скрывать слишком много сценариев внутри себя.",
    mechanism: "Props передают данные сверху вниз, children позволяют вкладывать UI, композиция заменяет наследование для большинства интерфейсных задач.",
    workplace: "В учебной платформе Card может принимать title, meta и children, чтобы одинаково использоваться для темы, задачи и результата.",
    code: `function Card({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}`,
    concepts: ["props read-only внутри компонента", "children передаёт вложенный UI", "композиция гибче наследования", "компонент должен иметь понятный контракт"],
    mistakes: ["Мутировать props внутри компонента.", "Делать один mega-component на все сценарии.", "Передавать слишком много несвязанных флагов."],
    interview: ["Почему props нельзя мутировать?", "Когда использовать children?", "Что такое композиция компонентов?"],
    taskScenario: "Нужно сделать общий компонент Panel для конспекта, задачи и результата тренировки.",
    taskPrompt: "Напиши Panel({ title, meta, children }) и используй его для двух разных блоков.",
    taskInput: "title='Шпаргалка', children=<ul>...</ul>",
    taskOutput: "один компонент, разные содержимые",
    taskStarter: `function Panel({ title, children }) {
  // render
}`,
  },
  {
    id: "react-events-forms",
    area: "react",
    title: "События, формы и controlled/uncontrolled поля",
    subtitle: "Как управлять вводом пользователя без рассинхронизации UI.",
    level: "Production",
    duration: "70 мин",
    core: "Формы в React требуют ясного решения: какие данные управляются state, а какие читаются через ref или браузерную форму.",
    mechanism: "Controlled input получает value из state и обновляет его через onChange; uncontrolled поле хранит значение в DOM и читается при необходимости.",
    workplace: "Поиск по темам удобно делать controlled, потому что UI сразу зависит от query. Большая форма загрузки файла может быть проще через FormData.",
    code: `const [query, setQuery] = useState("");

<input value={query} onChange={(event) => setQuery(event.target.value)} />`,
    concepts: ["controlled поле синхронизировано со state", "uncontrolled полезен для простых форм и файлов", "onSubmit должен preventDefault", "ошибки формы лучше хранить явно"],
    mistakes: ["Смешивать value и defaultValue без понимания.", "Хранить каждую производную ошибку в отдельном state.", "Забывать name у полей, если используется FormData."],
    interview: ["Что такое controlled component?", "Когда uncontrolled проще?", "Как обработать submit в React?"],
    taskScenario: "Форма фильтра тем должна обновлять список при вводе и сбрасываться одной кнопкой.",
    taskPrompt: "Сделай controlled input query и кнопку reset.",
    taskInput: "query='react'",
    taskOutput: "список фильтруется, reset очищает input",
    taskStarter: `function TopicSearch({ topics }) {
  // controlled input
}`,
  },
  {
    id: "react-lists-keys",
    area: "react",
    title: "Списки, key и сохранение состояния",
    subtitle: "Почему index key ломает интерфейс и как React сопоставляет элементы.",
    level: "Interview",
    duration: "60 мин",
    core: "key помогает React понять, какой элемент списка остался тем же между рендерами.",
    mechanism: "При изменении массива React использует key для сопоставления старых и новых элементов; нестабильный key приводит к неправильному сохранению состояния.",
    workplace: "Если в списке задач использовать index как key, после сортировки фокус, checkbox или локальное состояние могут переехать к другой строке.",
    code: `{tasks.map((task) => (
  <TaskRow key={task.id} task={task} />
))}`,
    concepts: ["key должен быть стабильным", "key нужен среди соседей списка", "index key опасен при сортировке", "key влияет на сохранение state"],
    mistakes: ["Использовать Math.random() как key.", "Использовать index в динамическом списке.", "Думать, что key доступен внутри props компонента."],
    interview: ["Зачем нужен key?", "Почему index key опасен?", "Когда key может сбросить состояние?"],
    taskScenario: "Список вопросов можно перемешивать, но выбранные ответы не должны переезжать к другим вопросам.",
    taskPrompt: "Исправь рендер списка вопросов, используя стабильный question.id как key.",
    taskInput: "questions.sort(...)",
    taskOutput: "состояние строк сохраняется корректно",
    taskStarter: `{questions.map((question, index) => (
  <Question key={index} question={question} />
))}`,
  },
  {
    id: "react-context",
    area: "react",
    title: "Context и передача данных через дерево",
    subtitle: "Когда context упрощает код, а когда превращается в глобальное хранилище.",
    level: "Production",
    duration: "65 мин",
    core: "Context нужен для данных, которые логически доступны многим компонентам на уровне дерева.",
    mechanism: "Provider задаёт значение, useContext читает ближайшее значение сверху, а изменение value может перерендерить потребителей.",
    workplace: "Тема интерфейса, текущий пользователь или настройки локали подходят для context; состояние каждого input формы обычно нет.",
    code: `const ThemeContext = createContext("light");

function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div data-theme={theme} />;
}`,
    concepts: ["context передаёт данные без prop drilling", "value должен быть стабильным при необходимости", "context не заменяет всё состояние", "разделение context снижает лишние рендеры"],
    mistakes: ["Класть в один context все данные приложения.", "Передавать новый объект value на каждый рендер без нужды.", "Использовать context там, где достаточно props."],
    interview: ["Что решает Context?", "Почему context может вызвать лишние рендеры?", "Когда props лучше context?"],
    taskScenario: "В приложении есть тема оформления, которую читают кнопки, панели и карточки.",
    taskPrompt: "Создай ThemeContext и компонент ThemeProvider с переключением light/dark.",
    taskInput: "initialTheme='dark'",
    taskOutput: "дочерние компоненты читают тему через useContext",
    taskStarter: `const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  // value
}`,
  },
  {
    id: "react-reducers-state-machines",
    area: "react",
    title: "useReducer и сложные состояния",
    subtitle: "Как описывать переходы состояния явно, когда useState становится шумным.",
    level: "Production",
    duration: "70 мин",
    core: "useReducer полезен, когда состояние имеет несколько связанных полей и понятные события перехода.",
    mechanism: "Reducer получает state и action, возвращает новое состояние и должен оставаться чистой функцией.",
    workplace: "Тренажёр вопроса имеет состояния answering, feedback, finished; reducer делает переходы явными и тестируемыми.",
    code: `function reducer(state, action) {
  switch (action.type) {
    case "answer":
      return { ...state, selected: action.index };
    default:
      return state;
  }
}`,
    concepts: ["reducer должен быть чистым", "action описывает событие", "сложные переходы лучше централизовать", "dispatch не принимает новый state напрямую"],
    mistakes: ["Делать сетевой запрос внутри reducer.", "Мутировать state в reducer.", "Использовать useReducer для одного boolean без причины."],
    interview: ["Когда выбрать useReducer?", "Почему reducer должен быть чистым?", "Чем action отличается от state?"],
    taskScenario: "Квиз должен переходить между вопросом, обратной связью и финальным экраном.",
    taskPrompt: "Опиши reducer для quizState с actions answer, next, reset.",
    taskInput: "answer correct, next",
    taskOutput: "score и questionIndex обновляются предсказуемо",
    taskStarter: `function quizReducer(state, action) {
  switch (action.type) {
    // cases
  }
}`,
  },
  {
    id: "react-memo-performance",
    area: "react",
    title: "memo, useMemo, useCallback и производительность",
    subtitle: "Как оптимизировать осознанно, а не оборачивать всё подряд.",
    level: "Production",
    duration: "70 мин",
    core: "Оптимизация React начинается с понимания причины рендера, а не с автоматического добавления memo.",
    mechanism: "React.memo пропускает рендер при равных props, useMemo кеширует вычисление, useCallback кеширует ссылку на функцию.",
    workplace: "В большом списке тем поиск может пересчитывать фильтр, но memo нужен только если вычисление или рендер реально дорогие.",
    code: `const visibleTopics = useMemo(() => {
  return topics.filter((topic) => topic.title.includes(query));
}, [topics, query]);`,
    concepts: ["memo помогает только при стабильных props", "useMemo не должен исправлять баги", "useCallback полезен для стабильной ссылки", "Profiler показывает реальные причины"],
    mistakes: ["Оборачивать все компоненты в memo без измерений.", "Передавать inline object и удивляться, что memo не помогает.", "Использовать useMemo для побочных эффектов."],
    interview: ["Чем useMemo отличается от useCallback?", "Когда React.memo бесполезен?", "Как измерить проблему производительности?"],
    taskScenario: "Список из 1000 тем тормозит при вводе в поиск.",
    taskPrompt: "Оптимизируй фильтрацию через useMemo и объясни, когда это действительно нужно.",
    taskInput: "topics.length = 1000, query changes",
    taskOutput: "фильтр пересчитывается только при изменении topics/query",
    taskStarter: `function TopicList({ topics, query }) {
  // visibleTopics
}`,
  },
  {
    id: "react-custom-hooks",
    area: "react",
    title: "Кастомные хуки и переиспользование логики",
    subtitle: "Как вынести поведение без создания лишних компонентов.",
    level: "Production",
    duration: "65 мин",
    core: "Кастомный хук переиспользует stateful-логику и эффекты, сохраняя компоненты тонкими.",
    mechanism: "Хук является функцией, которая вызывает другие хуки по правилам React и возвращает данные/действия для компонента.",
    workplace: "Прогресс темы, media query, debounce поиска и localStorage удобно вынести в отдельные хуки.",
    code: `function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  return [value, setValue];
}`,
    concepts: ["имя хука начинается с use", "правила хуков сохраняются внутри кастомного хука", "хук возвращает API логики", "не каждый helper является хуком"],
    mistakes: ["Вызывать хук внутри условия.", "Делать кастомный хук ради одной строки без смысла.", "Скрывать слишком много побочных эффектов без понятного имени."],
    interview: ["Что такое кастомный хук?", "Почему имя должно начинаться с use?", "Что нельзя делать с хуками?"],
    taskScenario: "Несколько компонентов должны хранить настройки в localStorage.",
    taskPrompt: "Напиши useLocalStorageState(key, initialValue) с безопасным чтением и сохранением.",
    taskInput: "key='theme', initialValue='light'",
    taskOutput: "[theme, setTheme], значение сохраняется между перезагрузками",
    taskStarter: `function useLocalStorageState(key, initialValue) {
  // useState + localStorage
}`,
  },
  {
    id: "react-refs-dom",
    area: "react",
    title: "Refs, DOM API и императивные действия",
    subtitle: "Когда нужно выйти за декларативную модель и как сделать это аккуратно.",
    level: "Interview",
    duration: "55 мин",
    core: "ref нужен для доступа к DOM-узлу или изменяемому значению, которое не должно запускать рендер.",
    mechanism: "useRef возвращает стабильный объект .current, изменение current не вызывает рендер, а DOM ref заполняется после рендера.",
    workplace: "Фокус поля после открытия поиска, измерение размера элемента и управление video требуют ref.",
    code: `const inputRef = useRef(null);

function focusSearch() {
  inputRef.current?.focus();
}`,
    concepts: ["ref сохраняет значение между рендерами", "изменение ref не ререндерит компонент", "DOM ref доступен после commit", "ref не должен заменять state для UI"],
    mistakes: ["Хранить отображаемое состояние только в ref.", "Читать DOM ref до монтирования.", "Использовать ref вместо нормального потока данных."],
    interview: ["Чем ref отличается от state?", "Когда нужен useRef?", "Почему изменение ref не вызывает рендер?"],
    taskScenario: "После открытия поиска на мобильном нужно автоматически сфокусировать input.",
    taskPrompt: "Сделай компонент SearchPanel с ref и фокусом при открытии.",
    taskInput: "open становится true",
    taskOutput: "input получает focus",
    taskStarter: `function SearchPanel({ open }) {
  const inputRef = useRef(null);
  // focus
}`,
  },
  {
    id: "react-data-fetching",
    area: "react",
    title: "Загрузка данных, статусы и гонки запросов",
    subtitle: "Как показывать loading/error/success и не перезаписывать UI устаревшим ответом.",
    level: "Production",
    duration: "75 мин",
    core: "Загрузка данных в UI должна описывать все состояния: ожидание, успех, пустой ответ, ошибка и отмена.",
    mechanism: "Эффект может запускать запрос при изменении параметров, cleanup отменяет устаревший запрос, состояние хранит статус и результат.",
    workplace: "При быстром поиске по темам старый медленный ответ не должен перезаписать свежий быстрый результат.",
    code: `useEffect(() => {
  const controller = new AbortController();
  loadData({ signal: controller.signal });
  return () => controller.abort();
}, [query]);`,
    concepts: ["loading и error должны быть явными", "cleanup отменяет устаревшую работу", "AbortController защищает от гонок", "пустой список не равен ошибке"],
    mistakes: ["Хранить только data без статуса.", "Не отменять запрос при смене query.", "Показывать бесконечный loading после ошибки."],
    interview: ["Как защититься от race condition?", "Что хранить в state загрузки?", "Зачем cleanup в эффекте загрузки?"],
    taskScenario: "Поиск пользователей отправляет запрос на каждый query, но ответы приходят не по порядку.",
    taskPrompt: "Реализуй useUsersSearch(query) со статусом loading/error/success и AbortController.",
    taskInput: "query быстро меняется: 'a', 'ad', 'ada'",
    taskOutput: "UI показывает результат только для актуального query",
    taskStarter: `function useUsersSearch(query) {
  // status + abort
}`,
  },
  {
    id: "react-error-boundaries",
    area: "react",
    title: "Error boundaries и восстановление интерфейса",
    subtitle: "Как не дать ошибке одного виджета сломать всю страницу.",
    level: "Production",
    duration: "55 мин",
    core: "Error boundary ловит ошибки рендера ниже по дереву и позволяет показать fallback UI.",
    mechanism: "Классический error boundary реализует getDerivedStateFromError/componentDidCatch, а ошибки событий и async-кода нужно обрабатывать отдельно.",
    workplace: "Если интерактивный виджет задачи упал, остальная платформа должна продолжить работать и предложить перезагрузить блок.",
    code: `class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
}`,
    concepts: ["boundary ловит ошибки рендера потомков", "ошибки event handler ловятся отдельно", "fallback должен быть полезным", "логирование помогает диагностике"],
    mistakes: ["Считать, что boundary поймает любую async-ошибку.", "Показывать пустой fallback без действия.", "Оборачивать всё одним boundary без локального восстановления."],
    interview: ["Что ловит error boundary?", "Почему он не ловит event handler error?", "Где ставить boundaries?"],
    taskScenario: "Блок интерактивной демки может упасть, но статья должна остаться доступной.",
    taskPrompt: "Создай ErrorBoundary и оберни только DemoPanel.",
    taskInput: "DemoPanel throws during render",
    taskOutput: "показывается fallback для демки, статья видна",
    taskStarter: `class ErrorBoundary extends React.Component {
  // fallback state
}`,
  },
  {
    id: "react-routing-layouts",
    area: "react",
    title: "Routing, layouts и навигационная архитектура",
    subtitle: "Как строить страницы, вложенные layout и состояние URL.",
    level: "Production",
    duration: "65 мин",
    core: "Маршрутизация связывает состояние приложения с URL и определяет, что можно открыть, обновить и отправить ссылкой.",
    mechanism: "Route выбирает экран по URL, layout сохраняет общие области интерфейса, query params хранят фильтры, а navigation state не должен заменять важный URL.",
    workplace: "Если пользователь выбрал раздел React и тему useEffect, ссылка должна открывать именно это место, а не только главную страницу.",
    code: `const params = new URLSearchParams(location.search);
const area = params.get("area") ?? "all";`,
    concepts: ["URL должен отражать важное состояние", "layout уменьшает дублирование", "query params подходят для фильтров", "route params подходят для сущностей"],
    mistakes: ["Хранить выбранную тему только в локальном state без URL.", "Дублировать shell на каждой странице.", "Пихать секретные данные в query string."],
    interview: ["Что хранить в URL?", "Чем route param отличается от query param?", "Зачем нужны layouts?"],
    taskScenario: "Платформа должна открывать ссылку /topics/js-closures-scope и выбирать нужную тему.",
    taskPrompt: "Опиши структуру routes для главной, темы и режима тренировки.",
    taskInput: "/topics/react-render-state-effects?mode=train",
    taskOutput: "открыта React-тема в режиме тренажёра",
    taskStarter: `// routes
// /topics/:topicId`,
  },
  {
    id: "react-testing-components",
    area: "react",
    title: "Тестирование компонентов и пользовательских сценариев",
    subtitle: "Как проверять UI по поведению, а не по внутренней реализации.",
    level: "Production",
    duration: "70 мин",
    core: "Хороший тест проверяет то, что важно пользователю: текст, роль, действие и результат.",
    mechanism: "Компонентные тесты рендерят UI, находят элементы по роли/лейблу, выполняют событие и проверяют видимое изменение.",
    workplace: "Тренажёр должен гарантировать, что после клика по ответу появляется объяснение и кнопка следующего вопроса.",
    code: `expect(screen.getByRole("button", { name: "Следующий вопрос" })).toBeVisible();`,
    concepts: ["искать элементы лучше по роли", "тест должен имитировать пользователя", "моки нужны для внешних зависимостей", "snapshot не заменяет поведенческий тест"],
    mistakes: ["Тестировать className вместо поведения.", "Делать хрупкие селекторы по DOM-структуре.", "Мокать всё так, что тест перестаёт проверять интеграцию."],
    interview: ["Что проверять в UI-тесте?", "Почему role queries полезны?", "Когда нужен mock?"],
    taskScenario: "Нужно проверить, что квиз показывает объяснение после выбора ответа.",
    taskPrompt: "Напиши тест сценария: открыть вопрос, выбрать ответ, увидеть feedback.",
    taskInput: "question with 6 options",
    taskOutput: "feedback visible",
    taskStarter: `test("shows feedback after answer", async () => {
  // render and click
});`,
  },
  {
    id: "react-typescript-props",
    area: "react",
    title: "React и TypeScript: типизация props, state и событий",
    subtitle: "Как сделать компонент понятным ещё до запуска приложения.",
    level: "Production",
    duration: "70 мин",
    core: "Типы фиксируют контракт компонента и помогают ловить ошибки данных до runtime.",
    mechanism: "Props описываются type/interface, union ограничивает варианты, события имеют типы React.ChangeEvent/MouseEvent, generic помогает переиспользуемым компонентам.",
    workplace: "Если TaskCard требует task.level из ограниченного набора, TypeScript не даст случайно передать 'hard' вместо 'Junior+'.",
    code: `type TaskCardProps = {
  title: string;
  level: "Junior" | "Junior+";
  onCopy: () => void;
};`,
    concepts: ["union типы ограничивают варианты", "optional props требуют обработки", "event types улучшают обработчики", "discriminated union полезен для статусов"],
    mistakes: ["Ставить any на все props.", "Не типизировать статус загрузки как union.", "Делать optional prop и забывать fallback."],
    interview: ["Как типизировать props?", "Когда использовать union?", "Почему any опасен?"],
    taskScenario: "Компонент ResultBadge должен принимать только status: 'success' | 'warning' | 'error'.",
    taskPrompt: "Опиши тип props и компонент, который выбирает текст по status.",
    taskInput: "status='success'",
    taskOutput: "тип не принимает неизвестный status",
    taskStarter: `type ResultBadgeProps = {
  // status union
};`,
  },
  {
    id: "react-accessibility",
    area: "react",
    title: "Доступность React-интерфейсов",
    subtitle: "Как сохранить семантику, фокус и имена элементов в компонентной модели.",
    level: "Production",
    duration: "70 мин",
    core: "React не делает интерфейс доступным автоматически: компонент должен рендерить правильный HTML и управлять фокусом в сложных сценариях.",
    mechanism: "JSX передаёт атрибуты в DOM, aria-* помогает описать сложные виджеты, а фокус нужно перемещать только там, где это ожидает пользователь.",
    workplace: "В модальном окне задачи нужно вернуть фокус на кнопку открытия после закрытия и не прятать смысл за div-ами.",
    code: `<button aria-expanded={open} aria-controls="task-panel">
  Подсказка
</button>`,
    concepts: ["семантический HTML важнее ARIA", "aria-expanded сообщает состояние", "focus management нужен для modal", "кнопка должна быть button"],
    mistakes: ["Делать кликабельный div вместо button.", "Добавлять ARIA без понимания роли.", "Терять фокус после закрытия модалки."],
    interview: ["Как сделать React-кнопку доступной?", "Когда нужен aria-expanded?", "Как управлять фокусом в модалке?"],
    taskScenario: "Панель подсказки раскрывается кнопкой и должна быть понятна скринридеру.",
    taskPrompt: "Сделай HintToggle с aria-expanded, aria-controls и button.",
    taskInput: "open true/false",
    taskOutput: "состояние раскрытия доступно",
    taskStarter: `function HintToggle() {
  // button + controlled panel
}`,
  },
  {
    id: "react-architecture-feature-slices",
    area: "react",
    title: "Архитектура React-приложения и feature slices",
    subtitle: "Как раскладывать компоненты, данные и логику по папкам, чтобы проект рос спокойно.",
    level: "Production",
    duration: "80 мин",
    core: "Архитектура нужна, чтобы изменения в одной фиче не ломали весь проект и зависимости читались по структуре папок.",
    mechanism: "Feature slice группирует UI, hooks, model и helpers вокруг пользовательской возможности, а shared-слой содержит переиспользуемые примитивы.",
    workplace: "Фича тренировки может иметь свой quizReducer, компоненты Question/Feedback и тесты рядом, не смешиваясь с задачами и roadmap.",
    code: `features/quiz/
  ui/Question.tsx
  model/quizReducer.ts
  lib/calculateScore.ts`,
    concepts: ["фича группируется вокруг сценария", "shared не должен знать о feature", "public API папки ограничивает импорты", "архитектура должна помогать, а не мешать"],
    mistakes: ["Складывать все компоненты в одну папку components.", "Разрешать shared импортировать feature.", "Создавать сложную архитектуру для трёх файлов."],
    interview: ["Как структурировать React-проект?", "Что такое feature slice?", "Почему важны направления зависимостей?"],
    taskScenario: "Платформа выросла, и quiz, tasks, progress нужно разнести по feature-папкам.",
    taskPrompt: "Предложи структуру папок для features/quiz, features/tasks, shared/ui.",
    taskInput: "текущий single page",
    taskOutput: "понятная схема модулей",
    taskStarter: `src/
  features/
  shared/`,
  },
  {
    id: "js-regexp-parsing-validation",
    area: "js",
    title: "RegExp, парсинг строк и валидация формата",
    subtitle: "Как использовать регулярные выражения точечно и не превращать их в нечитаемую магию.",
    level: "Interview",
    duration: "55 мин",
    core: "RegExp полезен для поиска и проверки текстовых паттернов, но не должен заменять полноценный парсер там, где есть сложная грамматика.",
    mechanism: "Регулярное выражение сопоставляет строку с шаблоном, флаги меняют режим поиска, группы извлекают части совпадения, а методы test/match/replace решают разные задачи.",
    workplace: "В форме профиля можно проверить простой формат промокода или извлечь id из строки, но email и URL лучше проверять через нативные типы и специальные API.",
    code: `const promoPattern = /^[A-Z]{3}-\\d{4}$/;
console.log(promoPattern.test("PRO-2026"));`,
    concepts: ["test возвращает boolean", "группы помогают извлекать части строки", "флаг g влияет на состояние lastIndex", "сложный RegExp требует комментария или разбиения"],
    mistakes: ["Писать огромный RegExp для HTML или сложного языка.", "Забывать про lastIndex у выражения с флагом g.", "Использовать RegExp там, где есть URL или input type."],
    interview: ["Чем test отличается от match?", "Что делает флаг g?", "Почему RegExp не подходит для парсинга HTML?"],
    taskScenario: "Форма купона принимает код вида ABC-1234 и должна показать понятную ошибку при неверном формате.",
    taskPrompt: "Напиши validatePromoCode(value), которая возвращает { valid, error } и использует читаемый RegExp.",
    taskInput: "'PRO-2026', 'bad-code'",
    taskOutput: "{ valid: true } и { valid: false, error: 'Формат ABC-1234' }",
    taskStarter: `function validatePromoCode(value) {
  // RegExp + понятная ошибка
}`,
  },
  {
    id: "js-browser-rendering-performance",
    area: "js",
    title: "Браузерный рендеринг, layout, paint и производительность",
    subtitle: "Как JavaScript, DOM и CSS вместе влияют на отзывчивость интерфейса.",
    level: "Production",
    duration: "80 мин",
    core: "Производительность фронтенда зависит не только от скорости JS, но и от того, как изменения запускают style, layout, paint и composite.",
    mechanism: "Браузер строит DOM и CSSOM, вычисляет стили, раскладывает элементы, рисует слои и композитит результат; частое чтение/запись layout-свойств может вызвать forced reflow.",
    workplace: "Если при скролле список измеряет offsetHeight и тут же меняет style для сотен элементов, слабый телефон начнёт терять кадры.",
    code: `const height = element.offsetHeight;
requestAnimationFrame(() => {
  element.style.transform = "translateY(4px)";
});`,
    concepts: ["layout отвечает за размеры и позиции", "paint рисует пиксели", "transform часто композитится дешевле", "Performance panel помогает увидеть длинные задачи"],
    mistakes: ["Чередовать чтение layout и запись style в большом цикле.", "Оптимизировать без измерений.", "Игнорировать слабые мобильные устройства."],
    interview: ["Что такое reflow/layout?", "Почему transform дешевле top?", "Как найти long task?"],
    taskScenario: "При наведении на карточки список начинает дёргаться на мобильном устройстве.",
    taskPrompt: "Найди причину layout thrashing и перепиши код так, чтобы чтения и записи DOM были разделены.",
    taskInput: "100 карточек, чтение offsetWidth и запись style.width в одном цикле",
    taskOutput: "меньше forced reflow, плавное взаимодействие",
    taskStarter: `function updateCards(cards) {
  // раздели чтение и запись
}`,
  },
  {
    id: "css-grid-deep-layout",
    area: "css",
    title: "CSS Grid глубже: области, auto-placement и subgrid",
    subtitle: "Как строить сложные сетки без абсолютного позиционирования и лишней разметки.",
    level: "Production",
    duration: "75 мин",
    core: "Grid позволяет описывать двумерную раскладку через линии, треки, области и автоматическое размещение элементов.",
    mechanism: "grid-template-areas задаёт именованные зоны, auto-placement заполняет свободные ячейки, minmax управляет треками, а subgrid позволяет вложенному элементу наследовать сетку родителя.",
    workplace: "Dashboard учебной платформы может держать сайдбар, контент, статистику и задачи в одной управляемой сетке без хаотичных wrappers.",
    code: `.dashboard {
  display: grid;
  grid-template-areas:
    "nav content stats"
    "nav content tasks";
}`,
    concepts: ["grid areas улучшают читаемость layout", "auto-fit и auto-fill ведут себя по-разному", "minmax защищает треки от переполнения", "subgrid полезен для выравнивания вложенных карточек"],
    mistakes: ["Использовать Grid как таблицу для любых данных.", "Задавать фиксированные треки, которые ломают 360px.", "Не проверять auto-placement при разном количестве карточек."],
    interview: ["Чем auto-fit отличается от auto-fill?", "Когда нужны grid-template-areas?", "Что решает subgrid?"],
    taskScenario: "Экран курса должен менять layout: на десктопе nav/content/stats, на телефоне один поток.",
    taskPrompt: "Сверстай dashboard через grid-template-areas с мобильным переопределением.",
    taskInput: "nav, content, stats, tasks",
    taskOutput: "понятная сетка без горизонтального скролла",
    taskStarter: `.dashboard {
  display: grid;
  /* areas */
}`,
  },
  {
    id: "css-accessibility-forced-colors",
    area: "css",
    title: "CSS и доступность: forced-colors, contrast и reduced preferences",
    subtitle: "Как интерфейс должен выживать в пользовательских настройках доступности.",
    level: "Production",
    duration: "65 мин",
    core: "CSS должен уважать системные предпочтения пользователя: контраст, уменьшение движения, принудительные цвета и прозрачность.",
    mechanism: "Media features prefers-reduced-motion, prefers-contrast и forced-colors позволяют адаптировать стили к настройкам ОС и вспомогательных режимов.",
    workplace: "Если кнопка ответа различается только цветом фона, в high contrast режиме пользователь может потерять смысл состояния.",
    code: `@media (forced-colors: active) {
  .answer.right {
    outline: 2px solid CanvasText;
  }
}`,
    concepts: ["цвет не должен быть единственным индикатором", "forced-colors может заменить палитру", "outline важен для фокуса", "prefers-reduced-motion снижает движение"],
    mistakes: ["Скрывать focus outline.", "Передавать ошибку только красным цветом.", "Не проверять интерфейс в forced-colors."],
    interview: ["Что такое forced-colors?", "Почему цвет не должен быть единственным сигналом?", "Как учитывать reduced motion?"],
    taskScenario: "Кнопки квиза должны оставаться понятными в high contrast режиме.",
    taskPrompt: "Добавь CSS для .answer.right/.answer.wrong в forced-colors и сохрани текстовые метки.",
    taskInput: "right/wrong состояния",
    taskOutput: "состояния различимы без обычной палитры",
    taskStarter: `@media (forced-colors: active) {
  /* states */
}`,
  },
  {
    id: "html-landmarks-navigation-a11y",
    area: "html",
    title: "Landmarks, структура страницы и навигация скринридера",
    subtitle: "Как main, nav, header, footer и aside помогают быстро ориентироваться.",
    level: "Production",
    duration: "55 мин",
    core: "Landmark-элементы создают карту страницы для клавиатурной навигации и вспомогательных технологий.",
    mechanism: "header, nav, main, aside, footer, section и article дают области смысла; aria-label помогает различать несколько одинаковых landmarks.",
    workplace: "В учебной платформе отдельные nav для разделов и режимов должны иметь понятные aria-label, иначе навигация становится шумной.",
    code: `<nav aria-label="Разделы курса">
  <a href="/js">JavaScript</a>
</nav>
<main id="content">...</main>`,
    concepts: ["main должен быть один для основного содержания", "nav нужен для навигационных групп", "aria-label различает похожие области", "skip link помогает перейти к контенту"],
    mistakes: ["Делать несколько main на одной странице.", "Оставлять несколько nav без доступного имени.", "Использовать section без заголовка там, где нужна структура."],
    interview: ["Что такое landmark?", "Зачем nav aria-label?", "Для чего skip link?"],
    taskScenario: "На странице есть верхнее меню, список тем и переключатель режимов, и все они объявлены как nav без имён.",
    taskPrompt: "Разметь landmarks так, чтобы скринридер различал навигацию по разделам, темам и режимам.",
    taskInput: "header, topic rail, mode tabs, content",
    taskOutput: "понятная карта страницы",
    taskStarter: `<header>
  <nav aria-label="">
  </nav>
</header>`,
  },
  {
    id: "react-suspense-code-splitting",
    area: "react",
    title: "Suspense, lazy и code splitting",
    subtitle: "Как грузить тяжёлые части интерфейса тогда, когда они действительно нужны.",
    level: "Production",
    duration: "70 мин",
    core: "Code splitting уменьшает начальную загрузку, а Suspense описывает fallback для части UI, которая ещё не готова.",
    mechanism: "React.lazy динамически импортирует компонент, Suspense показывает fallback до готовности, а граница должна быть поставлена там, где loading не ломает весь экран.",
    workplace: "Редактор задач или большая интерактивная демка не обязаны попадать в первый JS-бандл главной страницы.",
    code: `const TaskEditor = lazy(() => import("./TaskEditor"));

<Suspense fallback={<p>Загрузка редактора...</p>}>
  <TaskEditor />
</Suspense>`,
    concepts: ["lazy работает с default export", "fallback должен быть локальным и полезным", "splitting помогает первому экрану", "не дробить код до микромодулей без причины"],
    mistakes: ["Ставить один огромный Suspense на всю страницу.", "Делать fallback пустым.", "Лениво грузить критичный первый экран."],
    interview: ["Что делает React.lazy?", "Зачем Suspense fallback?", "Когда code splitting вреден?"],
    taskScenario: "Большой редактор решения нужен только после нажатия 'Открыть IDE-подсказку'.",
    taskPrompt: "Вынеси TaskEditor в lazy-компонент и покажи локальный fallback через Suspense.",
    taskInput: "showEditor = true",
    taskOutput: "главная страница грузится легче, редактор загружается по требованию",
    taskStarter: `const TaskEditor = lazy(() => import("./TaskEditor"));
// Suspense boundary`,
  },
];

const generatedTopics = proTopicSeeds.map(makeProTopic);
const dokaReferenceTopics = dokaReferenceSeeds.map(makeDokaReferenceTopic);

export const topics: Topic[] = [...featuredTopics, ...generatedTopics, ...dokaReferenceTopics];

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
