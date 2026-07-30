import type { Condition, ConditionTrace } from "../../domain/condition";
import type { Effect } from "../../domain/effect";
import type { OutcomeEvaluation } from "./evaluateOutcome";

function conditionLabel(condition: Condition) {
  switch (condition.type) {
    case "all":
      return "全部子条件";
    case "any":
      return "任一子条件";
    case "partyHasHero":
      return `队伍包含 ${condition.heroId}`;
    case "partyStatAtLeast":
      return `${condition.stat} ≥ ${condition.value}`;
    case "optionSelected":
      return `${condition.eventId} 选择 ${condition.optionId}`;
    case "flagEquals":
      return `${condition.flagId} = ${String(condition.value)}`;
    case "heroStatusEquals":
      return `${condition.heroId} 状态 = ${condition.status}`;
  }
}

function Trace({ trace }: { trace: ConditionTrace }) {
  return (
    <li className={trace.passed ? "trace--pass" : "trace--fail"}>
      <span>{trace.passed ? "✓" : "×"}</span>
      <span>{conditionLabel(trace.condition)}</span>
      {trace.children?.length ? (
        <ul>
          {trace.children.map((child, index) => (
            <Trace key={index} trace={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function effectLabel(effect: Effect) {
  switch (effect.type) {
    case "setFlag":
      return `设置 ${effect.flagId} = ${String(effect.value)}`;
    case "addGuildGold":
      return `公会金币 ${effect.amount >= 0 ? "+" : ""}${effect.amount}`;
    case "addReputation":
      return `声望 ${effect.amount >= 0 ? "+" : ""}${effect.amount}`;
    case "setHeroStatus":
      return `${effect.heroId} 状态 → ${effect.status}`;
    case "changeRelationship":
      return `${effect.fromHeroId} → ${effect.toHeroId} 关系 ${
        effect.amount >= 0 ? "+" : ""
      }${effect.amount}`;
    case "unlockContent":
      return `解锁 ${effect.contentId}`;
    case "note":
      return effect.text;
  }
}

export function OutcomeResult({
  evaluation
}: {
  evaluation: OutcomeEvaluation;
}) {
  if (evaluation.status === "conflict") {
    return (
      <section className="preview-result preview-result--error">
        <span className="eyebrow">判定已停止</span>
        <h2>同一最高优先级发生冲突</h2>
        <p>{evaluation.conflictIds?.join("、")} 同时命中，请调整条件或优先级。</p>
      </section>
    );
  }
  if (evaluation.status === "none" || !evaluation.matched) {
    return (
      <section className="preview-result preview-result--empty">
        <span className="eyebrow">没有结果</span>
        <h2>当前输入未命中任何结果</h2>
        <p>完整故事应提供默认结果；请到“问题”页检查。</p>
      </section>
    );
  }

  const matchedTrace = evaluation.traces.find(
    (item) => item.outcome.id === evaluation.matched?.id
  );
  return (
    <section className="preview-result">
      <div className="preview-result__heading">
        <div>
          <span className="eyebrow">命中结果 · 优先级 {evaluation.matched.priority}</span>
          <h2>{evaluation.matched.grade}</h2>
          <code>{evaluation.matched.id}</code>
        </div>
      </div>
      <p className="report-copy">{evaluation.matched.report}</p>
      <div className="result-grid">
        <div>
          <h3>条件判定</h3>
          {matchedTrace ? (
            <ul className="trace-list">
              <Trace trace={matchedTrace.trace} />
            </ul>
          ) : null}
        </div>
        <div>
          <h3>将产生的变化</h3>
          <ul className="effect-summary">
            {evaluation.matched.effects.map((effect, index) => (
              <li key={index}>{effectLabel(effect)}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="preview-note">
        本次预览不会把变化写回人物、故事或项目 Flag。
      </p>
    </section>
  );
}
