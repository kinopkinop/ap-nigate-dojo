"use client";

import { useMemo, useState } from "react";
import { understandingQuestions } from "./understandingQuestions";

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

function readProgress(): UnderstandingProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(understandingProgressKey) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as UnderstandingProgress : {};
  } catch {
    return {};
  }
}

export default function UnderstandingDojo({ onBack }: { onBack: () => void }) {
  const [position, setPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [followUpSelectedIndex, setFollowUpSelectedIndex] = useState<number | null>(null);
  const [rating, setRating] = useState<UnderstandingRating | null>(null);
  const [progress, setProgress] = useState<UnderstandingProgress>(() => typeof window === "undefined" ? {} : readProgress());
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, SessionAnswer>>({});
  const [completed, setCompleted] = useState(false);
  const question = understandingQuestions[position];

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
    if (position >= understandingQuestions.length - 1) {
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

  if (completed) {
    return <main className="understandingPage">
      <UnderstandingHeader onBack={onBack} />
      <section className="understandingResult" aria-labelledby="understanding-result-title">
        <p className="understandingEyebrow">PROTOTYPE COMPLETE</p>
        <h1 id="understanding-result-title">3問、おつかれさまでした。</h1>
        <p>正解数だけでなく、自己評価を次の復習優先度に使える形で保存しました。</p>
        <div className="understandingScore"><strong>{completedThemes}<small>/3</small></strong><span>メイン・確認ともに正解</span></div>
        <div className="understandingResultList">
          {understandingQuestions.map((item, index) => {
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
          <button className="secondary" onClick={onBack}>苦手だけ道場へ戻る</button>
          <button onClick={restart}>3問をもう一度 →</button>
        </div>
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
          <p>短い状況から判断し、理由と似た概念の違いまで確認する3問のプロトタイプです。</p>
        </div>
        <div className="understandingSteps" aria-label={`3問中${position + 1}問目`}>
          {understandingQuestions.map((item, index) => <span key={item.id} className={index === position ? "current" : index < position ? "done" : ""}>{index + 1}</span>)}
        </div>
      </div>

      <article className="understandingCard">
        <div className="understandingMeta">
          <span>{question.category}</span>
          <b>Q{position + 1} / {understandingQuestions.length}</b>
        </div>
        <p className="understandingTheme">{question.theme}</p>

        <section className="situationBox" aria-labelledby="situation-title">
          <span id="situation-title">状況</span>
          <p>{question.situation}</p>
          {question.metrics && <div className="understandingMetrics">
            {question.metrics.map((metric) => <div key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></div>)}
          </div>}
        </section>

        <section className="understandingQuestion" aria-labelledby="understanding-question-title">
          <span>質問</span>
          <h2 id="understanding-question-title">{question.question}</h2>
          <div className="understandingChoices" role="group" aria-label="選択肢">
            {question.choices.map((choice, index) => {
              const state = selectedIndex === null ? "" : index === question.correctIndex ? "correct" : index === selectedIndex ? "wrong" : "muted";
              return <button key={choice} className={state} onClick={() => chooseAnswer(index)} disabled={selectedIndex !== null}>
                <span>{String.fromCharCode(65 + index)}</span>{choice}
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
            {question.followUp.situation && <p className="followUpSituation">{question.followUp.situation}</p>}
            {question.followUp.metrics && <div className="understandingMetrics followUpMetrics">
              {question.followUp.metrics.map((metric) => <div key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></div>)}
            </div>}
            <h3 id="follow-up-title">{question.followUp.question}</h3>
            <div className="understandingChoices followUpChoices" role="group" aria-label="確認問題の選択肢">
              {question.followUp.choices.map((choice, index) => {
                const state = followUpSelectedIndex === null ? "" : index === question.followUp!.correctIndex ? "correct" : index === followUpSelectedIndex ? "wrong" : "muted";
                return <button key={choice} className={state} onClick={() => chooseFollowUp(index)} disabled={followUpSelectedIndex !== null}>
                  <span>{String.fromCharCode(65 + index)}</span>{choice}
                </button>;
              })}
            </div>
            {followUpSelectedIndex !== null && <div className={`followUpExplanation ${followUpCorrect ? "correct" : "wrong"}`} aria-live="polite">
              <strong>{followUpCorrect ? "正解！" : `正解は「${question.followUp.choices[question.followUp.correctIndex]}」`}</strong>
              <p>{question.followUp.explanation}</p>
              <p><b>判断ポイント</b>{question.followUp.keyPoint}</p>
            </div>}
          </section>}

          {(!question.followUp || followUpSelectedIndex !== null) && <>
            <div className="understandingRating">
              <h3>ここまで理解できた？</h3>
              <div role="group" aria-label="理解度の自己評価">
                {ratingOrder.map((value) => <button key={value} className={rating === value ? `selected ${value}` : ""} onClick={() => rateUnderstanding(value)} aria-pressed={rating === value}>{ratingLabels[value]}</button>)}
              </div>
            </div>
            {rating ? <button className="understandingNext" onClick={nextQuestion}>{position === understandingQuestions.length - 1 ? "3問の結果を見る" : "次のテーマへ"} <span>→</span></button> : <p className="ratingPrompt">自己評価を選ぶと次へ進めます。</p>}
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
    <span className="prototypeBadge">3問プロトタイプ</span>
  </header>;
}
