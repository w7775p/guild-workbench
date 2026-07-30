import { describe, expect, it } from "vitest";
import seed from "../data/guild-seed.v0.1.json";
import type { GuildProject } from "../domain/project";
import { serializeProject } from "../features/project/exportProject";
import { importProjectText } from "../features/project/importProject";
import { validateProject } from "../features/validation/validateProject";

describe("project import and export", () => {
  it("has no blocking business errors in the built-in source project", () => {
    const errors = validateProject(seed as GuildProject).filter(
      (issue) => issue.severity === "error"
    );
    expect(errors).toEqual([]);
  });

  it("round-trips without changing project data", () => {
    const project = structuredClone(seed) as GuildProject;
    project.heroes[2].impression = "修改后的一句话印象";
    const exported = serializeProject(project);
    expect(exported.ok).toBe(true);
    const imported = importProjectText(exported.json ?? "");
    expect(imported.ok).toBe(true);
    expect(imported.project).toEqual(project);
  });

  it("rejects broken input without yielding replacement data", () => {
    const result = importProjectText('{"schemaVersion":"0.1"}');
    expect(result.ok).toBe(false);
    expect(result.project).toBeUndefined();
    expect(result.message).toContain("当前项目未被替换");
  });

  it("blocks export when an unresolved reference is not explicit", () => {
    const project = structuredClone(seed) as GuildProject;
    project.events[0].options[0].effects.push({
      type: "setFlag",
      flagId: "missing_flag",
      value: true
    });
    const result = serializeProject(project);
    expect(result.ok).toBe(false);
  });
});
