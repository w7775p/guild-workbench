import { useMemo } from "react";
import { useProjectStore } from "../project/projectStore";

interface ReferenceItem {
  type: "quest" | "event" | "outcome";
  id: string;
  title: string;
  detail: string;
}

export function HeroReferences() {
  const {
    project,
    selectedHeroId,
    navigateTo
  } = useProjectStore();
  const hero = project.heroes.find((item) => item.id === selectedHeroId);

  const references = useMemo<ReferenceItem[]>(() => {
    if (!hero) return [];
    const matches = (value: unknown) => {
      const serialized = JSON.stringify(value);
      return serialized.includes(hero.id) || serialized.includes(hero.name);
    };
    return [
      ...project.quests
        .filter(matches)
        .map((quest) => ({
          type: "quest" as const,
          id: quest.id,
          title: quest.title,
          detail: "任务卡或关键组合"
        })),
      ...project.events
        .filter(matches)
        .map((event) => ({
          type: "event" as const,
          id: event.id,
          title:
            project.quests.find((quest) => quest.id === event.questId)?.title ??
            event.id,
          detail: "中途事件条件或变化"
        })),
      ...project.outcomes
        .filter(matches)
        .map((outcome) => ({
          type: "outcome" as const,
          id: outcome.id,
          title:
            project.quests.find((quest) => quest.id === outcome.questId)
              ?.title ?? outcome.id,
          detail: `结果 · ${outcome.id}`
        }))
    ];
  }, [hero, project.events, project.outcomes, project.quests]);

  return (
    <aside className="reference-panel">
      <div className="reference-panel__header">
        <span>引用位置</span>
        <small>{references.length}</small>
      </div>
      {!hero ? null : references.length === 0 ? (
        <p className="empty-copy">当前没有结构化引用。</p>
      ) : (
        references.map((reference) => (
          <button
            type="button"
            className="reference-card"
            key={`${reference.type}-${reference.id}`}
            onClick={() => navigateTo(reference.type, reference.id)}
          >
            <span>{reference.title}</span>
            <small>{reference.detail}</small>
          </button>
        ))
      )}
      <p className="reference-panel__note">
        同时检查稳定 ID 与原案中的人物姓名；点击可跳到对应故事。
      </p>
    </aside>
  );
}
