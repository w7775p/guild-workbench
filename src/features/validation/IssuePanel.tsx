import { useMemo } from "react";
import { useProjectStore } from "../project/projectStore";
import {
  validateProject,
  type IssueSeverity
} from "./validateProject";

const groups: {
  severity: IssueSeverity;
  title: string;
  description: string;
}[] = [
  {
    severity: "error",
    title: "阻断错误",
    description: "这些问题会阻止正式导出。"
  },
  {
    severity: "warning",
    title: "内容警告",
    description: "允许导出，但可能导致预览歧义或内容不完整。"
  },
  {
    severity: "source",
    title: "原案缺口",
    description: "原案本身缺失或存在未解析引用，工作台没有擅自补写。"
  }
];

export function IssuePanel() {
  const { project, navigateTo } = useProjectStore();
  const issues = useMemo(() => validateProject(project), [project]);

  return (
    <article className="issues-page">
      <div className="editor-title">
        <div>
          <span className="eyebrow">结构与内容检查</span>
          <h1>问题</h1>
        </div>
        <span className="issue-total">{issues.length} 项</span>
      </div>
      {groups.map((group) => {
        const items = issues.filter(
          (issue) => issue.severity === group.severity
        );
        return (
          <section
            className={`issue-group issue-group--${group.severity}`}
            key={group.severity}
          >
            <header>
              <div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <span>{items.length}</span>
            </header>
            {items.length === 0 ? (
              <p className="empty-copy">当前没有此类问题。</p>
            ) : (
              <div className="issue-list">
                {items.map((issue) => (
                  <button
                    type="button"
                    className="issue-card"
                    key={issue.id}
                    onClick={() =>
                      navigateTo(issue.entityType, issue.entityId, issue.field)
                    }
                  >
                    <span className="issue-card__code">{issue.code}</span>
                    <span className="issue-card__copy">
                      <strong>{issue.message}</strong>
                      <small>
                        {issue.entityId ?? "project"}
                        {issue.field ? ` · ${issue.field}` : ""}
                      </small>
                    </span>
                    <span aria-hidden>→</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </article>
  );
}
