"use client";

import { useMemo, useState } from "react";
import { understandingQuestions, type UnderstandingCategory } from "./understandingQuestions";

type UnderstandingRating = "understood" | "unsure" | "unclear";
type AttemptRecord = {
  attempts: number;
  correct: number;
  wrong: number;
  lastChoice: number;
  lastResult: "correct" | "wrong";
  followUpAttempts?: number;
  followUpCorrect?: number;
  followUpWrong?: number;
  lastFollowUpResult?: "correct" | "wrong";
  selfRating?: UnderstandingRating;
  updatedAt: string;
};
type UnderstandingProgress = Record<string, AttemptRecord>;
type SessionAnswer = {
  selectedIndex: number;
  correct: boolean;
  followUpCorrect?: boolean;
  rating?: UnderstandingRating;
};

export const understandingProgressKey = "ap-understanding-progress-v1";

const ratingLabels: Record<UnderstandingRating, string> = {
  understood: "理解した",
  unsure: "ちょっと曖昧",
  unclear: "まだ分からない",
};
const ratingOrder: UnderstandingRating[] = ["unclear", "unsure", "understood"];
const categoryOrder: UnderstandingCategory[] = ["セキュリティ", "データベース", "ネットワーク", "マネジメント", "ストラテジ", "テクノロジ"];
type CategoryChoice = "すべて" | UnderstandingCategory;

function shuffleChoices(choices: string[]) {
  const shuffled = choices.map((text, originalIndex) => ({ text, originalIndex }));
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function readProgress(): UnderstandingProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(understandingProgressKey) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as UnderstandingProgress : {};
  } catch {
    return {};
  }
}

export default function UnderstandingDojo({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryChoice | null>(null);
  const [position, setPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [followUpSelectedIndex, setFollowUpSelectedIndex] = useState<number | null>(null);
  const [rating, setRating] = useState<UnderstandingRating | null>(null);
  const [progress, setProgress] = useState<UnderstandingProgress>(() => typeof window === "undefined" ? {} : readProgress());
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, SessionAnswer>>({});
  const [completed, setCompleted] = useState(false);
  const availableCategories = useMemo(() => categoryOrder
    .map((category) => ({ category, count: understandingQuestions.filter((item) => item.category === category).length }))
    .filter((item) => item.count > 0), []);
  const activeQuestions = useMemo(() => selectedCategory === "すべて"
    ? understandingQuestions
    : understandingQuestions.filter((item) => item.category === selectedCategory), [selectedCategory]);
  const question = activeQuestions[position] ?? understandingQuestions[0];
  const mainChoices = useMemo(() => shuffleChoices(question.choices), [question]);
  const followUpChoices = useMemo(() => question.followUp ? shuffleChoices(question.followUp.choices) : [], [question]);

  const completedThemes = useMemo(
    () => Object.values(sessionAnswers).filter((answer) => answer.correct && answer.followUpCorrect !== false).length,
    [sessionAnswers],
  );

  function saveProgress(next: UnderstandingProgress) {
    setProgress(next);
    localStorage.setItem(understandingProgressKey, JSON.stringify(next));
  }

  function chooseAnswer(choiceIndex: number) {
    if (selectedIndex !== null) return;
    const isCorrect = choiceIndex === question.correctIndex;
    setSelectedIndex(choiceIndex);
    setSessionAnswers((old) => ({
      ...old,
      [question.id]: { selectedIndex: choiceIndex, correct: isCorrect },
    }));
    const oldRecord = progress[question.id];
    saveProgress({
      ...progress,
      [question.id]: {
        attempts: (oldRecord?.attempts ?? 0) + 1,
        correct: (oldRecord?.correct ?? 0) + (isCorrect ? 1 : 0),
        wrong: (oldRecord?.wrong ?? 0) + (isCorrect ? 0 : 1),
        lastChoice: choiceIndex,
        lastResult: isCorrect ? "correct" : "wrong",
        selfRating: oldRecord?.selfRating,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  function rateUnderstanding(nextRating: UnderstandingRating) {
    if (selectedIndex === null || (question.followUp && followUpSelectedIndex === null)) return;
    setRating(nextRating);
    setSessionAnswers((old) => ({
      ...old,
      [question.id]: { ...old[question.id], rating: nextRating },
    }));
    const oldRecord = progress[question.id];
    if (!oldRecord) return;
    saveProgress({
      ...progress,
      [question.id]: { ...oldRecord, selfRating: nextRating, updatedAt: new Date().toISOString() },
    });
  }

  function chooseFollowUp(choiceIndex: number) {
    if (!question.followUp || followUpSelectedIndex !== null) return;
    const isCorrect = choiceIndex === question.followUp.correctIndex;
    setFollowUpSelectedIndex(choiceIndex);
    setSessionAnswers((old) => ({
      ...old,
      [question.id]: { ...old[question.id], followUpCorrect: isCorrect },
    }));
    const oldRecord = progress[question.id];
    if (!oldRecord) return;
    saveProgress({
      ...progress,
      [question.id]: {
        ...oldRecord,
        followUpAttempts: (oldRecord.followUpAttempts ?? 0) + 1,
        followUpCorrect: (oldRecord.followUpCorrect ?? 0) + (isCorrect ? 1 : 0),
        followUpWrong: (oldRecord.followUpWrong ?? 0) + (isCorrect ? 0 : 1),
        lastFollowUpResult: isCorrect ? "correct" : "wrong",
        updatedAt: new Date().toISOString(),
      },
    });
  }

  function nextQuestion() {
    if (!rating) return;
    if (position >= activeQuestions.length - 1) {
      setCompleted(true);
      window.scrollTo({ top: 0 });
      return;
    }
    setPosition((old) => old + 1);
    setSelectedIndex(null);
    setFollowUpSelectedIndex(null);
    setRating(null);
    window.scrollTo({ top: 0 });
  }

  function restart() {
    setPosition(0);
    setSelectedIndex(null);
    setFollowUpSelectedIndex(null);
    setRating(null);
    setSessionAnswers({});
    setCompleted(false);
    window.scrollTo({ top: 0 });
  }

  function chooseCategory(nextCategory: CategoryChoice) {
    setSelectedCategory(nextCategory);
    restart();
  }

  function returnToCategorySelection() {
    setSelectedCategory(null);
    restart();
  }

  if (selectedCategory === null) {
    return <main className="understandingPage">
      <UnderstandingHeader onBack={onBack} />
      <section className="understandingCategorySelect" aria-labelledby="understanding-category-title">
        <p className="understandingEyebrow">CHOOSE A FIELD</p>
        <h1 id="understanding-category-title">解く分野を選ぶ</h1>
        <p>苦手だけ道場と同じ分野で絞り込めます。各テーマはメイン問題と確認問題の2段階です。</p>
        <div className="understandingCategoryGrid">
          <button className="allCategories" onClick={() => chooseCategory("すべて")}>
            <span>すべて</span><strong>{understandingQuestions.length}<small>テーマ</small></strong><em>全分野を通して解く</em>
          </button>
          {availableCategories.map(({ category, count }) => <button key={category} onClick={() => chooseCategory(category)}>
            <span>{category}</span><strong>{count}<small>テーマ</small></strong><em>この分野だけ解く</em>
          </button>)}
        </div>
      </section>
    </main>;
  }

  if (completed) {
    return <main className="understandingPage">
      <UnderstandingHeader onBack={onBack} />
      <section className="understandingResult" aria-labelledby="understanding-result-title">
        <p className="understandingEyebrow">SESSION COMPLETE</p>
        <h1 id="understanding-result-title">{activeQuestions.length}問、おつかれさまでした。</h1>
        <p className="understandingResultCategory">選択した分野：<strong>{selectedCategory}</strong></p>
        <p>正解数だけでなく、自己評価を次の復習優先度に使える形で保存しました。</p>
        <div className="understandingScore"><strong>{completedThemes}<small>/{activeQuestions.length}</small></strong><span>メイン・確認ともに正解</span></div>
        <div className="understandingResultList">
          {activeQuestions.map((item, index) => {
            const answer = sessionAnswers[item.id];
            return <div key={item.id}>
              <span className={answer?.correct && answer?.followUpCorrect ? "resultOk" : "resultNg"}>{answer?.correct && answer?.followUpCorrect ? "○" : "△"}</span>
              <p><small>{item.category}</small><strong>{item.theme}</strong></p>
              <b className="resultChecks">メイン {answer?.correct ? "○" : "×"}・確認 {answer?.followUpCorrect ? "○" : "×"}</b>
              <b>{answer?.rating ? ratingLabels[answer.rating] : "未評価"}</b>
              <em>Q{index + 1}</em>
            </div>;
          })}
        </div>
        <div className="understandingResultActions">
          <button className="secondary" onClick={returnToCategorySelection}>分野を選び直す</button>
          <button onClick={restart}>{activeQuestions.length}問をもう一度 →</button>
        </div>
        <button className="understandingBackToVocabulary" onClick={onBack}>苦手だけ道場へ戻る</button>
      </section>
    </main>;
  }

  const correct = selectedIndex === question.correctIndex;
  const followUpCorrect = followUpSelectedIndex === question.followUp?.correctIndex;
  return <main className="understandingPage">
    <UnderstandingHeader onBack={onBack} />
    <section className="understandingWorkspace">
      <div className="understandingIntro">
        <div>
          <p className="understandingEyebrow">AP UNDERSTANDING DOJO</p>
          <h1>「知ってる」を、<em>「使える」に。</em></h1>
          <p><strong>{selectedCategory}</strong>のミニ応用問題。短い状況から判断し、理由と似た概念の違いまで確認します。</p>
          <button className="understandingChangeCategory" onClick={returnToCategorySelection}>分野を変更</button>
        </div>
        <div className="understandingSteps" aria-label={`${activeQuestions.length}問中${position + 1}問目`}>
          <strong>{position + 1}</strong><span>/ {activeQuestions.length}</span>
        </div>
      </div>

      <article className="understandingCard">
        <section className="situationBox" aria-labelledby="situation-title">
          <span id="situation-title">状況</span>
          <p>{question.situation}</p>
          <div className="conditionList">
            <strong>条件</strong>
            <ul>{question.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
          </div>
          {question.metrics && <div className="understandingMetrics">
            {question.metrics.map((metric) => <div key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></div>)}
          </div>}
        </section>

        <section className="understandingQuestion" aria-labelledby="understanding-question-title">
          <span>質問</span>
          <h2 id="understanding-question-title">{question.question}</h2>
          <div className="understandingChoices" role="group" aria-label="選択肢">
            {mainChoices.map((choice, displayIndex) => {
              const state = selectedIndex === null ? "" : choice.originalIndex === question.correctIndex ? "correct" : choice.originalIndex === selectedIndex ? "wrong" : "muted";
              return <button key={choice.originalIndex} className={state} onClick={() => chooseAnswer(choice.originalIndex)} disabled={selectedIndex !== null}>
                <span>{String.fromCharCode(65 + displayIndex)}</span>{choice.text}
              </button>;
            })}
          </div>
        </section>

        {selectedIndex !== null && <section className={`understandingFeedback ${correct ? "isCorrect" : "isWrong"}`} aria-live="polite">
          <div className="understandingAnswer">
            <small>{correct ? "正解" : "不正解・正解は"}</small>
            <strong>{question.choices[question.correctIndex]}</strong>
          </div>
          <div className="explanationGrid">
            <section><h3>なぜ？</h3><p>{question.explanation}</p></section>
            <section><h3>混同注意</h3><div className="comparisonList">{question.comparison.map((item) => <p key={item.label}><b>{item.label}</b><span>{item.detail}</span></p>)}</div></section>
            <section className="keyPoint"><h3>判断ポイント</h3><p>{question.keyPoint}</p></section>
          </div>

          {question.followUp && <section className="followUpCard" aria-labelledby="follow-up-title">
            <div className="followUpHeading"><span>確認問題</span><small>5〜30秒で判断</small></div>
            <p className="followUpSituation">{question.followUp.situation}</p>
            <div className="conditionList followUpConditions">
              <strong>条件</strong>
              <ul>{question.followUp.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
            </div>
            {question.followUp.metrics && <div className="understandingMetrics followUpMetrics">
              {question.followUp.metrics.map((metric) => <div key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></div>)}
            </div>}
            <h3 id="follow-up-title">{question.followUp.question}</h3>
            <div className="understandingChoices followUpChoices" role="group" aria-label="確認問題の選択肢">
              {followUpChoices.map((choice, displayIndex) => {
                const state = followUpSelectedIndex === null ? "" : choice.originalIndex === question.followUp!.correctIndex ? "correct" : choice.originalIndex === followUpSelectedIndex ? "wrong" : "muted";
                return <button key={choice.originalIndex} className={state} onClick={() => chooseFollowUp(choice.originalIndex)} disabled={followUpSelectedIndex !== null}>
                  <span>{String.fromCharCode(65 + displayIndex)}</span>{choice.text}
                </button>;
              })}
            </div>
            {followUpSelectedIndex !== null && <div className={`followUpExplanation ${followUpCorrect ? "correct" : "wrong"}`} aria-live="polite">
              <strong>{followUpCorrect ? "正解！" : `正解は「${question.followUp.choices[question.followUp.correctIndex]}」`}</strong>
              <div className="followUpDetails">
                <section><h4>なぜ？</h4><p>{question.followUp.explanation}</p></section>
                <section><h4>混同注意</h4><div className="comparisonList">{question.followUp.comparison.map((item) => <p key={item.label}><b>{item.label}</b><span>{item.detail}</span></p>)}</div></section>
                <section className="followUpKey"><h4>判断ポイント</h4><p>{question.followUp.keyPoint}</p></section>
              </div>
            </div>}
          </section>}

          {(!question.followUp || followUpSelectedIndex !== null) && <>
            <div className="understandingRating">
              <h3>ここまで理解できた？</h3>
              <div role="group" aria-label="理解度の自己評価">
                {ratingOrder.map((value) => <button key={value} className={rating === value ? `selected ${value}` : ""} onClick={() => rateUnderstanding(value)} aria-pressed={rating === value}>{ratingLabels[value]}</button>)}
              </div>
            </div>
            {rating ? <button className="understandingNext" onClick={nextQuestion}>{position === activeQuestions.length - 1 ? `${activeQuestions.length}問の結果を見る` : "次のテーマへ"} <span>→</span></button> : <p className="ratingPrompt">自己評価を選ぶと次へ進めます。</p>}
          </>}
        </section>}
      </article>
    </section>
  </main>;
}

function UnderstandingHeader({ onBack }: { onBack: () => void }) {
  return <header className="understandingTopbar">
    <div className="dojoSwitcher" role="group" aria-label="道場を切り替える">
      <button onClick={onBack}>苦手だけ</button>
      <button className="active" aria-current="page">理解</button>
    </div>
    <div className="understandingBrand"><span className="brandMark">AP</span><span><strong>応用情報</strong><small>理解道場</small></span></div>
    <span className="prototypeBadge">{understandingQuestions.length}テーマ</span>
  </header>;
}
