import { ArrayField } from "../../components/ArrayField";
import {
  EditorSection,
  NumberField,
  TextField
} from "../../components/Fields";
import type { Quest } from "../../domain/project";
import { useProjectStore } from "../project/projectStore";
import { EventEditor } from "./EventEditor";
import { OutcomeEditor } from "./OutcomeEditor";

export function QuestEditor() {
  const {
    project,
    selectedQuestId,
    selectedEventId,
    selectedOutcomeId,
    updateQuest,
    addEvent,
    addOutcome,
    selectEvent,
    selectOutcome
  } = useProjectStore();
  const quest = project.quests.find((item) => item.id === selectedQuestId);
  if (!quest) return <div className="empty-panel">请选择故事。</div>;
  const event = project.events.find((item) => item.id === selectedEventId);
  const outcome = project.outcomes.find(
    (item) => item.id === selectedOutcomeId
  );
  const patch = <K extends keyof Quest>(key: K, value: Quest[K]) =>
    updateQuest({ ...quest, [key]: value });

  return (
    <article className="editor-scroll">
      <div className="editor-title">
        <div>
          <span className="eyebrow">故事 · {quest.id}</span>
          <h1>{quest.title}</h1>
        </div>
        <span
          className={`source-status source-status--${quest.sourceStatus}`}
        >
          {quest.sourceStatus === "complete" ? "原案完整 · 可预览" : "原案有缺口"}
        </span>
      </div>

      <EditorSection title="玩家可见">
        <TextField
          label="稳定 ID"
          value={quest.id}
          disabled
          onChange={() => undefined}
          field="id"
        />
        <TextField
          label="故事名称"
          value={quest.title}
          onChange={(value) => patch("title", value)}
          field="title"
        />
        <TextField
          label="委托人"
          value={quest.client}
          onChange={(value) => patch("client", value)}
          field="client"
          wide
        />
        <TextField
          label="委托描述"
          value={quest.description}
          onChange={(value) => patch("description", value)}
          field="description"
          multiline
          rows={7}
          wide
        />
        <TextField
          label="地点"
          value={quest.location}
          onChange={(value) => patch("location", value)}
          field="location"
        />
        <TextField
          label="持续时间"
          value={quest.duration}
          onChange={(value) => patch("duration", value)}
          field="duration"
        />
        <TextField
          label="报酬原文"
          value={quest.reward.rawText}
          onChange={(value) =>
            patch("reward", { ...quest.reward, rawText: value })
          }
          field="reward.rawText"
          wide
        />
        <NumberField
          label="公会金币"
          value={quest.reward.guildGold ?? 0}
          onChange={(value) =>
            patch("reward", { ...quest.reward, guildGold: value })
          }
          field="reward.guildGold"
          min={0}
        />
        <NumberField
          label="英雄共享金币"
          value={quest.reward.sharedHeroGold ?? 0}
          onChange={(value) =>
            patch("reward", { ...quest.reward, sharedHeroGold: value })
          }
          field="reward.sharedHeroGold"
          min={0}
        />
        <ArrayField
          label="报酬物品"
          values={quest.reward.items}
          onChange={(value) =>
            patch("reward", { ...quest.reward, items: value })
          }
          field="reward.items"
        />
        <ArrayField
          label="推荐能力"
          values={quest.recommendedAbilities}
          onChange={(value) => patch("recommendedAbilities", value)}
          field="recommendedAbilities"
        />
        <TextField
          label="表面风险"
          value={quest.apparentRisks}
          onChange={(value) => patch("apparentRisks", value)}
          field="apparentRisks"
          wide
        />
        <NumberField
          label="最少派遣"
          value={quest.minPartySize}
          onChange={(value) => patch("minPartySize", value)}
          field="minPartySize"
          min={1}
        />
        <NumberField
          label="最多派遣"
          value={quest.maxPartySize}
          onChange={(value) => patch("maxPartySize", value)}
          field="maxPartySize"
          min={1}
        />
        <ArrayField
          label="可见弱线索"
          values={quest.visibleClues}
          onChange={(value) => patch("visibleClues", value)}
          field="visibleClues"
          multiline
        />
      </EditorSection>

      <EditorSection title="后台信息">
        <TextField
          label="出现条件"
          value={quest.appearanceCondition}
          onChange={(value) => patch("appearanceCondition", value)}
          field="appearanceCondition"
        />
        <TextField
          label="失效条件"
          value={quest.expiryCondition}
          onChange={(value) => patch("expiryCondition", value)}
          field="expiryCondition"
        />
        <TextField
          label="任务真相"
          value={quest.truth}
          onChange={(value) => patch("truth", value)}
          field="truth"
          multiline
          rows={6}
          wide
        />
        <TextField
          label="核心矛盾"
          value={quest.centralConflict}
          onChange={(value) => patch("centralConflict", value)}
          field="centralConflict"
          multiline
          wide
        />
        <TextField
          label="关键能力"
          value={quest.keyAbilities}
          onChange={(value) => patch("keyAbilities", value)}
          field="keyAbilities"
          multiline
          wide
        />
        <TextField
          label="关键特质与组合"
          value={quest.keyTraitsAndCombinations}
          onChange={(value) => patch("keyTraitsAndCombinations", value)}
          field="keyTraitsAndCombinations"
          multiline
          rows={6}
          wide
        />
        <ArrayField
          label="后续 Flag"
          values={quest.followUpFlags}
          onChange={(value) => patch("followUpFlags", value)}
          field="followUpFlags"
        />
        <TextField
          label="设计目的"
          value={quest.designPurpose}
          onChange={(value) => patch("designPurpose", value)}
          field="designPurpose"
          multiline
          wide
        />
      </EditorSection>

      <section className="editor-section" data-field="eventIds">
        <header className="editor-section__header">
          <div>
            <h2>中途事件</h2>
            <p>任务共有 {quest.eventIds.length} 个结构化事件。</p>
          </div>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => addEvent(quest.id)}
          >
            ＋ 新建事件
          </button>
        </header>
        <div className="subentity-list">
          {quest.eventIds.map((eventId) => {
            const item = project.events.find((entry) => entry.id === eventId);
            return (
              <button
                type="button"
                key={eventId}
                className={`subentity-card${
                  selectedEventId === eventId ? " subentity-card--active" : ""
                }`}
                onClick={() => {
                  selectOutcome(undefined);
                  selectEvent(eventId);
                }}
              >
                <strong>{eventId}</strong>
                <span>{item?.visibleText || "引用不存在"}</span>
                <small>{item?.options.length ?? 0} 个选项</small>
              </button>
            );
          })}
          {quest.eventIds.length === 0 ? (
            <p className="empty-copy">
              没有结构化事件；若原案只写了概述，请从“问题”页查看原文。
            </p>
          ) : null}
        </div>
        {event?.questId === quest.id ? <EventEditor event={event} /> : null}
      </section>

      <section className="editor-section" data-field="outcomeIds">
        <header className="editor-section__header">
          <div>
            <h2>结果组</h2>
            <p>按优先级从高到低命中，命中后停止。</p>
          </div>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => addOutcome(quest.id)}
          >
            ＋ 新建结果
          </button>
        </header>
        <div className="outcome-list">
          {quest.outcomeIds
            .map((id) => project.outcomes.find((item) => item.id === id))
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
            .sort((left, right) => right.priority - left.priority)
            .map((item) => (
              <button
                type="button"
                className={`outcome-card${
                  selectedOutcomeId === item.id ? " outcome-card--active" : ""
                }`}
                key={item.id}
                onClick={() => {
                  selectEvent(undefined);
                  selectOutcome(item.id);
                }}
              >
                <span className="priority-chip">{item.priority}</span>
                <span>
                  <strong>{item.id}</strong>
                  <small>{item.grade || "未填写等级"}</small>
                </span>
                <em>{item.rawCondition || "无条件说明"}</em>
              </button>
            ))}
          {quest.outcomeIds.length === 0 ? (
            <p className="empty-copy">
              原案没有结果条目；工作台不会自动生成空结果。
            </p>
          ) : null}
        </div>
        {outcome?.questId === quest.id ? (
          <OutcomeEditor outcome={outcome} />
        ) : null}
      </section>
    </article>
  );
}
