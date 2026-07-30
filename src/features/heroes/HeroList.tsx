import { useMemo } from "react";
import { useProjectStore } from "../project/projectStore";
import { validateProject } from "../validation/validateProject";

export function HeroList() {
  const {
    project,
    selectedHeroId,
    selectHero
  } = useProjectStore();
  const issues = useMemo(() => validateProject(project), [project]);

  return (
    <aside className="entity-list">
      <div className="entity-list__header">
        <span>人物</span>
        <small>{project.heroes.length}</small>
      </div>
      {project.heroes.map((hero) => {
        const issueCount = issues.filter(
          (issue) => issue.entityType === "hero" && issue.entityId === hero.id
        ).length;
        return (
          <button
            type="button"
            className={`entity-card${
              selectedHeroId === hero.id ? " entity-card--active" : ""
            }`}
            key={hero.id}
            onClick={() => selectHero(hero.id)}
          >
            <span className="entity-card__monogram">
              {hero.id.replace("hero_", "").toUpperCase()}
            </span>
            <span className="entity-card__copy">
              <strong>{hero.name}</strong>
              <small>{hero.role}</small>
              <em>{hero.currentStatus}</em>
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
