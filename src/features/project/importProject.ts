import type { GuildProject } from "../../domain/project";
import { validateProject, hasBlockingIssues } from "../validation/validateProject";
import { validateSchema } from "../validation/validateSchema";

export interface ImportResult {
  ok: boolean;
  project?: GuildProject;
  message: string;
}

export function importProjectText(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      ok: false,
      message: "文件不是有效的 JSON；当前项目未被替换。"
    };
  }

  const schema = validateSchema(parsed);
  if (!schema.valid) {
    const summary = schema.errors
      .slice(0, 3)
      .map((error) => `${error.instancePath || "项目"} ${error.message}`)
      .join("；");
    return {
      ok: false,
      message: `项目结构校验失败：${summary}。当前项目未被替换。`
    };
  }

  const project = parsed as GuildProject;
  const issues = validateProject(project);
  if (hasBlockingIssues(issues)) {
    const summary = issues
      .filter((issue) => issue.severity === "error")
      .slice(0, 3)
      .map((issue) => issue.message)
      .join("；");
    return {
      ok: false,
      message: `项目业务校验失败：${summary}。当前项目未被替换。`
    };
  }

  return {
    ok: true,
    project,
    message: "项目已导入。"
  };
}
