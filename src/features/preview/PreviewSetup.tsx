import { useMemo, useState } from "react";
import { useProjectStore } from "../project/projectStore";
import { EventChoice } from "./EventChoice";
import {
  createPreviewContext,
  evaluateOutcome,
  type OutcomeEvaluation
} from "./evaluateOutcome";
import { OutcomeResult } from "./OutcomeResult";

export function PreviewSetup() {
  const { project } = useProjectStore();
  const runnable = project.quests.filter(
    (quest) =>
      quest.sourceStatus === "complete" &&
      quest.eventIds.length > 0 &&
      quest.outcomeIds.length > 0
  );
  const [questId, setQuestId] = useState(
    runnable.find((quest) => quest.id === "quest_silent_lullaby")?.id ??
      runnable[0]?.id ??
      ""
  );
  const [partyHeroIds, setPartyHeroIds] = useState<string[]>(["hero_d"]);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [evaluation, setEvaluation] = useState<OutcomeEvaluation>();

  const quest = project.quests.find((item) => item.id === questId);
  const events = project.events.filter((event) =>
    quest?.eventIds.includes(event.id)
  );
  const context = useMemo(
    () => createPreviewContext(project, partyHeroIds, selectedOptions),
    [partyHeroIds, project, selectedOptions]
  );
  const partyValid =
    Boolean(quest) &&
    partyHeroIds.length >= (quest?.minPartySize ?? 0) &&
    partyHeroIds.length <= (quest?.maxPartySize ?? 0);

  const toggleHero = (heroId: string) => {
    setEvaluation(undefined);
    setSelectedOptions({});
    setPartyHeroIds((current) =>
      current.includes(heroId)
        ? current.filter((id) => id !== heroId)
        : [...current, heroId]
    );
  };

  return (
    <article className="preview-page">
      <div className="editor-title">
        <div>
          <span className="eyebrow">无副作用模拟</span>
          <h1>派遣预览</h1>
        </div>
        <span className="save-indicator">只读取当前项目</span>
      </div>

      <section className="preview-setup">
        <div className="preview-setup__field">
          <span>故事</span>
          <select
            value={questId}
            onChange={(event) => {
              const next = project.quests.find(
                (item) => item.id === event.target.value
              );
              setQuestId(event.target.value);
              setPartyHeroIds(
                next?.minPartySize === 1 ? ["hero_d"] : ["hero_r", "hero_d"]
              );
              setSelectedOptions({});
              setEvaluation(undefined);
            }}
          >
            {runnable.map((item) => (
              <option value={item.id} key={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <div className="party-picker">
          <span>
            派遣人物 · {quest?.minPartySize}—{quest?.maxPartySize} 人
          </span>
          <div className="party-picker__cards">
            {project.heroes.map((hero) => (
              <button
                type="button"
                key={hero.id}
                className={`party-card${
                  partyHeroIds.includes(hero.id) ? " party-card--selected" : ""
                }`}
                onClick={() => toggleHero(hero.id)}
              >
                <strong>{hero.name}</strong>
                <span>
                  战{hero.stats.combat} · 调{hero.stats.investigation} · 交
                  {hero.stats.social}
                </span>
                <small>{hero.currentStatus}</small>
              </button>
            ))}
          </div>
          {!partyValid ? (
            <p className="field-error">当前派遣人数不符合任务要求。</p>
          ) : (
            <p className="preview-note">
              队伍能力按成员中的最高值计算：战斗 {context.partyStats.combat} ·
              调查 {context.partyStats.investigation} · 交涉{" "}
              {context.partyStats.social}
            </p>
          )}
        </div>
      </section>

      {partyValid
        ? events.map((event) => (
            <EventChoice
              key={event.id}
              project={project}
              event={event}
              partyHeroIds={partyHeroIds}
              selectedOption={selectedOptions[event.id]}
              onSelect={(optionId) => {
                setSelectedOptions((current) => ({
                  ...current,
                  [event.id]: optionId
                }));
                setEvaluation(undefined);
              }}
            />
          ))
        : null}

      <div className="preview-actions">
        <button
          type="button"
          className="button button--primary"
          disabled={!partyValid}
          onClick={() =>
            setEvaluation(
              evaluateOutcome(
                project,
                questId,
                createPreviewContext(project, partyHeroIds, selectedOptions)
              )
            )
          }
        >
          运行结果判定
        </button>
        <button
          type="button"
          className="button button--quiet"
          onClick={() => {
            setSelectedOptions({});
            setEvaluation(undefined);
          }}
        >
          清空本次选择
        </button>
      </div>

      {evaluation ? <OutcomeResult evaluation={evaluation} /> : null}
    </article>
  );
}
