import { useMemo } from "react";
import { useProjectStore } from "../project/projectStore";
import { validateProject } from "../validation/validateProject";

export function QuestList() {
  const {
    project,
    selectedQuestId,
    selectQuest
  } = useProjectStore();
  const issues = useMemo(() => validateProject(project), [project]);

  return (
    <aside className="entity-list">
      <div className="entity-list__header">
        <span>故事</span>
        <small>{project.quests.length}</small>
      </div>
      {project.quests.map((quest) => {
        const issueCount = issues.filter(
          (issue) => issue.entityType !== "hero" && issue.entityId === quest.id
        ).length;
        return (
          <button
            type="button"
            className={`quest-card${
              selectedQuestId === quest.id ? " quest-card--active" : ""
            }`}
            key={quest.id}
            onClick={() => selectQuest(quest.id)}
          >
            <span
              className={`status-dot status-dot--${quest.sourceStatus}`}
              aria-label={quest.sourceStatus === "complete" ? "完整" : "有缺口"}
            />
            <span className="quest-card__copy">
              <strong>{quest.title}</strong>
              <small>{quest.client}</small>
              <em>
                {quest.sourceStatus === "complete" ? "可运行" : "有原案缺口"}
              </em>
            </span>
            {issueCount > 0 ? (
              <span className="entity-card__badge">{issueCount}</span>
            ) : null}
          </button>
        );
      })}
    </aside>
  );
}
