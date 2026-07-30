import type { GuildProject } from "../../domain/project";
import {
  hasBlockingIssues,
  validateProject
} from "../validation/validateProject";

export interface ExportResult {
  ok: boolean;
  message: string;
  json?: string;
}

export function serializeProject(project: GuildProject): ExportResult {
  const issues = validateProject(project);
  if (hasBlockingIssues(issues)) {
    return {
      ok: false,
      message: `存在 ${
        issues.filter((issue) => issue.severity === "error").length
      } 个阻断错误，请先在“问题”页修复。`
    };
  }
  return {
    ok: true,
    message: "项目已导出。",
    json: `${JSON.stringify(project, null, 2)}\n`
  };
}

export function downloadProject(project: GuildProject) {
  const result = serializeProject(project);
  if (!result.ok || !result.json) return result;

  const blob = new Blob([result.json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${project.projectId}.v${project.schemaVersion}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  return result;
}
