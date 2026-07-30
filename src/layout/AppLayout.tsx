import { useMemo, useRef, type ReactNode } from "react";
import { useProjectStore, type ViewKey } from "../features/project/projectStore";
import { validateProject } from "../features/validation/validateProject";

const navigation: { key: ViewKey; label: string; shortcut: string }[] = [
  { key: "heroes", label: "人物", shortcut: "H" },
  { key: "quests", label: "故事", shortcut: "Q" },
  { key: "preview", label: "预览", shortcut: "P" },
  { key: "issues", label: "问题", shortcut: "!" }
];

export function AppLayout({ children }: { children: ReactNode }) {
  const {
    project,
    activeView,
    setActiveView,
    createEmptyProject,
    loadSeed,
    importFile,
    exportCurrent,
    startupState,
    restoreDraft,
    notice,
    dismissNotice
  } = useProjectStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const issues = useMemo(() => validateProject(project), [project]);
  const errors = issues.filter((issue) => issue.severity === "error").length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">G</span>
          <span>
            <strong>公会工作台</strong>
            <small>v0.1 · 本地草稿</small>
          </span>
        </div>
        <div className="project-identity">
          <strong>{project.title}</strong>
          <code>{project.projectId}</code>
        </div>
        <div className="project-actions">
          <button
            type="button"
            className="button button--quiet"
            onClick={() => {
              if (window.confirm("新建空项目会替换当前浏览器草稿。是否继续？")) {
                void createEmptyProject();
              }
            }}
          >
            新建
          </button>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => {
              if (window.confirm("载入内置原案会替换当前浏览器草稿。是否继续？")) {
                void loadSeed();
              }
            }}
          >
            载入原案
          </button>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => fileInput.current?.click()}
          >
            导入 JSON
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importFile(file);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className="button button--primary"
            onClick={exportCurrent}
          >
            导出 JSON
          </button>
        </div>
      </header>

      <div className="workspace">
        <nav className="sidebar">
          <div className="sidebar__nav">
            {navigation.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`nav-button${
                  activeView === item.key ? " nav-button--active" : ""
                }`}
                onClick={() => setActiveView(item.key)}
              >
                <span className="nav-button__icon">{item.shortcut}</span>
                <span>{item.label}</span>
                {item.key === "issues" && issues.length > 0 ? (
                  <em className={errors > 0 ? "nav-error" : ""}>
                    {issues.length}
                  </em>
                ) : null}
              </button>
            ))}
          </div>
          <div className="sidebar__status">
            <span
              className={`health-light${errors > 0 ? " health-light--error" : ""}`}
            />
            <span>
              <strong>{errors > 0 ? `${errors} 个阻断错误` : "可以导出"}</strong>
              <small>{issues.length} 项检查记录</small>
            </span>
          </div>
        </nav>
        <main className="main-stage">{children}</main>
      </div>

      {notice ? (
        <button
          type="button"
          className={`toast toast--${notice.kind}`}
          onClick={dismissNotice}
        >
          {notice.message}
        </button>
      ) : null}

      {startupState === "checking" ? (
        <div className="startup-overlay">
          <div className="startup-dialog">
            <span className="loading-mark">G</span>
            <h2>正在检查本地草稿</h2>
          </div>
        </div>
      ) : null}

      {startupState === "choose" ? (
        <div className="startup-overlay">
          <div className="startup-dialog">
            <span className="eyebrow">检测到上次工作</span>
            <h2>从哪里继续？</h2>
            <p>恢复草稿会保留上次编辑；载入原案会清除该草稿。</p>
            <div className="startup-dialog__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => void restoreDraft()}
              >
                恢复上次草稿
              </button>
              <button
                type="button"
                className="button button--quiet"
                onClick={() => void loadSeed()}
              >
                载入内置原案
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
