"use client";

import { useMemo, useState } from "react";
import {
  areas,
  qualityPrinciples,
  roadmap,
  topics,
  type AreaId,
  type Task,
} from "./content";

type Mode = "learn" | "train" | "tasks" | "interview" | "roadmap";

type Progress = {
  bestScores: Record<string, number>;
  completed: string[];
  bookmarks: string[];
  answered: number;
};

const initialProgress: Progress = {
  bestScores: {},
  completed: [],
  bookmarks: [],
  answered: 0,
};

function readProgress(): Progress {
  if (typeof window === "undefined") return initialProgress;

  try {
    const saved = window.localStorage.getItem("frontGymProProgress");
    return saved ? { ...initialProgress, ...JSON.parse(saved) } : initialProgress;
  } catch {
    return initialProgress;
  }
}

function taskToClipboard(task: Task) {
  return `${task.title}

Контекст:
${task.scenario}

Задача:
${task.prompt}

Пример ввода:
${task.input}

Пример вывода:
${task.output}

Стартовый код:
${task.starter}

Чеклист:
${task.checklist.map((item) => `- ${item}`).join("\n")}`;
}

export default function Home() {
  const [area, setArea] = useState<AreaId | "all">("all");
  const [query, setQuery] = useState("");
  const [topicId, setTopicId] = useState(topics[0].id);
  const [mode, setMode] = useState<Mode>("learn");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState<Progress>(() => readProgress());
  const [copiedTask, setCopiedTask] = useState<string | null>(null);

  const visibleTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return topics.filter((topic) => {
      const matchesArea = area === "all" || topic.area === area;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [topic.title, topic.subtitle, topic.outcome, areas[topic.area].title]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesArea && matchesQuery;
    });
  }, [area, query]);

  const currentTopic = topics.find((topic) => topic.id === topicId) ?? topics[0];
  const currentQuestion = currentTopic.quiz[questionIndex];
  const finished = questionIndex >= currentTopic.quiz.length;
  const visibleScore = score + (selectedAnswer === currentQuestion?.correct ? 1 : 0);
  const totalQuestions = topics.reduce((sum, topic) => sum + topic.quiz.length, 0);
  const totalTasks = topics.reduce((sum, topic) => sum + topic.tasks.length, 0);
  const earned = topics.reduce((sum, topic) => sum + (progress.bestScores[topic.id] ?? 0), 0);
  const mastery = Math.round((earned / totalQuestions) * 100);
  const bookmarked = progress.bookmarks.includes(currentTopic.id);

  function saveProgress(nextProgress: Progress) {
    setProgress(nextProgress);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("frontGymProProgress", JSON.stringify(nextProgress));
    }
  }

  function chooseArea(nextArea: AreaId | "all") {
    setArea(nextArea);
    const firstTopic = topics.find((topic) => nextArea === "all" || topic.area === nextArea);
    if (firstTopic) chooseTopic(firstTopic.id, "learn");
  }

  function chooseTopic(nextTopicId: string, nextMode: Mode = "learn") {
    setTopicId(nextTopicId);
    setMode(nextMode);
    resetQuiz();
  }

  function resetQuiz() {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
  }

  function startTraining() {
    resetQuiz();
    setMode("train");
  }

  function nextQuestion() {
    if (!currentQuestion || selectedAnswer === null) return;

    const nextScore = score + (selectedAnswer === currentQuestion.correct ? 1 : 0);
    const nextIndex = questionIndex + 1;

    setScore(nextScore);
    setSelectedAnswer(null);

    if (nextIndex >= currentTopic.quiz.length) {
      const bestScores = {
        ...progress.bestScores,
        [currentTopic.id]: Math.max(progress.bestScores[currentTopic.id] ?? 0, nextScore),
      };
      const completed = progress.completed.includes(currentTopic.id)
        ? progress.completed
        : [...progress.completed, currentTopic.id];

      saveProgress({
        ...progress,
        bestScores,
        completed,
        answered: progress.answered + currentTopic.quiz.length,
      });
    }

    setQuestionIndex(nextIndex);
  }

  function toggleBookmark() {
    const bookmarks = bookmarked
      ? progress.bookmarks.filter((id) => id !== currentTopic.id)
      : [...progress.bookmarks, currentTopic.id];

    saveProgress({ ...progress, bookmarks });
  }

  async function copyTask(task: Task) {
    await navigator.clipboard.writeText(taskToClipboard(task));
    setCopiedTask(task.id);
    window.setTimeout(() => setCopiedTask(null), 1800);
  }

  return (
    <main className="appShell">
      <header className="topBar">
        <div className="brandBlock">
          <span className="brandMark">FG</span>
          <div>
            <p>Front Gym Pro</p>
            <strong>платформа подготовки фронтендера</strong>
          </div>
        </div>
        <div className="topStats" aria-label="Статистика базы">
          <span>{topics.length} модулей</span>
          <span>{totalQuestions} вопросов</span>
          <span>{totalTasks} задач</span>
        </div>
      </header>

      <section className="commandCenter">
        <div className="productIntro">
          <p className="eyebrow">Pro standard</p>
          <h1>Учебник, тренажёр, интервью-база и рабочая шпаргалка в одном интерфейсе.</h1>
          <p>
            Первый релиз Pro собран вокруг глубины: каждая тема объясняет механизм, показывает
            рабочий сценарий, проверяет интервью-вопросами и даёт задачи строго по теме.
          </p>
        </div>

        <div className="scoreBoard" aria-label="Личный прогресс">
          <span>Мастерство</span>
          <strong>{Number.isFinite(mastery) ? mastery : 0}%</strong>
          <div className="meter">
            <span style={{ width: `${Number.isFinite(mastery) ? mastery : 0}%` }} />
          </div>
          <small>
            {progress.completed.length}/{topics.length} тем закрыто · {progress.bookmarks.length} в закладках
          </small>
        </div>
      </section>

      <section className="controlDock" aria-label="Навигация по платформе">
        <label className="searchField">
          <span>Поиск</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="замыкания, grid, формы, useEffect"
          />
        </label>

        <div className="areaTabs" role="tablist" aria-label="Разделы">
          <button className={area === "all" ? "active" : ""} onClick={() => chooseArea("all")}>
            Все
          </button>
          {(Object.keys(areas) as AreaId[]).map((areaId) => (
            <button
              key={areaId}
              className={area === areaId ? "active" : ""}
              onClick={() => chooseArea(areaId)}
            >
              {areas[areaId].title}
            </button>
          ))}
        </div>
      </section>

      <section className="workspace">
        <aside className="topicRail" aria-label="Темы">
          <div className="railHeader">
            <span>Темы</span>
            <small>{visibleTopics.length}</small>
          </div>

          <div className="topicButtons">
            {visibleTopics.map((topic) => {
              const best = progress.bestScores[topic.id] ?? 0;
              const isActive = topic.id === currentTopic.id;

              return (
                <button
                  key={topic.id}
                  className={isActive ? "topicButton active" : "topicButton"}
                  onClick={() => chooseTopic(topic.id)}
                >
                  <span>{topic.title}</span>
                  <small>
                    {areas[topic.area].title} · {topic.level} · {best}/{topic.quiz.length}
                  </small>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="studyPane">
          <div className="topicHeader">
            <div>
              <div className="metaLine">
                <span>{areas[currentTopic.area].title}</span>
                <span>{currentTopic.level}</span>
                <span>{currentTopic.duration}</span>
              </div>
              <h2>{currentTopic.title}</h2>
              <p>{currentTopic.subtitle}</p>
            </div>
            <button className={bookmarked ? "iconButton active" : "iconButton"} onClick={toggleBookmark}>
              {bookmarked ? "В закладках" : "В закладки"}
            </button>
          </div>

          <nav className="modeTabs" aria-label="Режим темы">
            <button className={mode === "learn" ? "active" : ""} onClick={() => setMode("learn")}>
              Конспект
            </button>
            <button className={mode === "train" ? "active" : ""} onClick={startTraining}>
              Тренажёр
            </button>
            <button className={mode === "tasks" ? "active" : ""} onClick={() => setMode("tasks")}>
              Задачи
            </button>
            <button className={mode === "interview" ? "active" : ""} onClick={() => setMode("interview")}>
              Интервью
            </button>
            <button className={mode === "roadmap" ? "active" : ""} onClick={() => setMode("roadmap")}>
              План
            </button>
          </nav>

          {mode === "learn" && (
            <article className="lesson">
              <section className="outcomeBand">
                <span>Результат темы</span>
                <p>{currentTopic.outcome}</p>
              </section>

              {currentTopic.sections.map((section) => (
                <section className="lessonSection" key={section.title}>
                  <h3>{section.title}</h3>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  {section.code && (
                    <pre>
                      <code>{section.code}</code>
                    </pre>
                  )}
                  {section.workExample && <p className="workNote">{section.workExample}</p>}
                </section>
              ))}

              <section className="splitBlocks">
                <div>
                  <h3>Шпаргалка</h3>
                  <ul>
                    {currentTopic.cheatsheet.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Частые ошибки</h3>
                  <ul>
                    {currentTopic.pitfalls.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="sourceStrip">
                {currentTopic.sources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                ))}
              </section>

              <button className="primaryAction" onClick={startTraining}>
                Начать тренировку
              </button>
            </article>
          )}

          {mode === "train" && (
            <section className="trainer" aria-live="polite">
              {!finished && currentQuestion ? (
                <>
                  <div className="quizTop">
                    <span>
                      Вопрос {questionIndex + 1}/{currentTopic.quiz.length}
                    </span>
                    <span>
                      Счёт {visibleScore}/{currentTopic.quiz.length}
                    </span>
                  </div>
                  <div className="meter quizMeter">
                    <span style={{ width: `${(questionIndex / currentTopic.quiz.length) * 100}%` }} />
                  </div>
                  <h3>{currentQuestion.prompt}</h3>
                  <div className="answers">
                    {currentQuestion.options.map((option, index) => {
                      const state =
                        selectedAnswer === null
                          ? ""
                          : index === currentQuestion.correct
                            ? "right"
                            : index === selectedAnswer
                              ? "wrong"
                              : "muted";

                      return (
                        <button key={option} className={state} onClick={() => setSelectedAnswer(index)}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {selectedAnswer !== null && (
                    <div className="feedback">
                      <strong>{selectedAnswer === currentQuestion.correct ? "Верно" : "Почти"}</strong>
                      <p>{currentQuestion.explain}</p>
                      <button className="primaryAction" onClick={nextQuestion}>
                        {questionIndex + 1 === currentTopic.quiz.length ? "Завершить тему" : "Следующий вопрос"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <section className="resultPanel">
                  <span>Тема завершена</span>
                  <strong>
                    {progress.bestScores[currentTopic.id] ?? score}/{currentTopic.quiz.length}
                  </strong>
                  <p>Лучший результат сохранён на этом устройстве. Следующий шаг - закрепить тему задачей.</p>
                  <div className="inlineActions">
                    <button className="primaryAction" onClick={resetQuiz}>
                      Повторить
                    </button>
                    <button onClick={() => setMode("tasks")}>К задачам</button>
                  </div>
                </section>
              )}
            </section>
          )}

          {mode === "tasks" && (
            <section className="tasksView">
              <div className="sectionLead">
                <span>Практика в IDE</span>
                <h3>Задачи по теме: {currentTopic.title}</h3>
                <p>Каждая задача копируется целиком: контекст, условие, ввод, вывод, стартовый код и чеклист.</p>
              </div>

              <div className="taskList">
                {currentTopic.tasks.map((task) => (
                  <article className="taskItem" key={task.id}>
                    <div className="metaLine">
                      <span>{task.level}</span>
                      <span>{areas[currentTopic.area].title}</span>
                    </div>
                    <h4>{task.title}</h4>
                    <p>{task.scenario}</p>
                    <p>{task.prompt}</p>
                    <dl>
                      <div>
                        <dt>Ввод</dt>
                        <dd>{task.input}</dd>
                      </div>
                      <div>
                        <dt>Вывод</dt>
                        <dd>{task.output}</dd>
                      </div>
                    </dl>
                    <pre>
                      <code>{task.starter}</code>
                    </pre>
                    <ul>
                      {task.checklist.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <button onClick={() => copyTask(task)}>
                      {copiedTask === task.id ? "Скопировано" : "Копировать задачу"}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {mode === "interview" && (
            <section className="interviewView">
              <div className="sectionLead">
                <span>Junior и Junior+</span>
                <h3>Вопросы, которые проверяют понимание</h3>
                <p>Ответ должен включать механизм, рабочий пример и типичную ошибку.</p>
              </div>
              <ol className="interviewList">
                {currentTopic.interview.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ol>
              <section className="qualityBox">
                <h3>Редакционный стандарт Pro</h3>
                <ul>
                  {qualityPrinciples.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </section>
          )}

          {mode === "roadmap" && (
            <section className="roadmapView">
              <div className="sectionLead">
                <span>Учебная траектория</span>
                <h3>Путь от повторения к уверенной практике</h3>
                <p>Платформа строится как курс: база, браузер, React, интервью и постоянное повторение.</p>
              </div>
              <div className="roadmapGrid">
                {roadmap.map((phase) => (
                  <article key={phase.title}>
                    <span>{phase.duration}</span>
                    <h4>{phase.title}</h4>
                    <ul>
                      {phase.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}
