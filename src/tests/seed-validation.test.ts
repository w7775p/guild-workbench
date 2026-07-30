import Ajv from "ajv";
import { describe, expect, it } from "vitest";
import seed from "../data/guild-seed.v0.1.json";
import schema from "../data/project.schema.json";
import type { GuildProject } from "../domain/project";

const project = seed as GuildProject;

describe("guild seed v0.1", () => {
  it("matches the portable project schema", () => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    const validate = ajv.compile(schema);
    const valid = validate(project);
    expect(validate.errors, JSON.stringify(validate.errors, null, 2)).toBeNull();
    expect(valid).toBe(true);
  });

  it("contains exactly APRD and the four approved source stories", () => {
    expect(project.heroes.map((hero) => hero.id)).toEqual([
      "hero_a",
      "hero_p",
      "hero_r",
      "hero_d"
    ]);
    expect(project.quests.map((quest) => quest.id)).toEqual([
      "quest_blood_feast",
      "quest_left_or_right",
      "quest_silent_lullaby",
      "quest_shepherd_legacy"
    ]);
  });

  it("keeps incomplete source material explicit", () => {
    const incomplete = project.quests
      .filter((quest) => quest.sourceStatus === "partial")
      .map((quest) => quest.id);
    expect(incomplete).toEqual([
      "quest_blood_feast",
      "quest_left_or_right"
    ]);

    const issueEntities = new Set(
      project.sourceIssues.map((issue) => issue.entityId)
    );
    expect(issueEntities.has("quest_blood_feast")).toBe(true);
    expect(issueEntities.has("quest_left_or_right")).toBe(true);
  });

  it("provides runnable event and outcome groups for the two complete stories", () => {
    for (const questId of [
      "quest_silent_lullaby",
      "quest_shepherd_legacy"
    ]) {
      const quest = project.quests.find((item) => item.id === questId);
      expect(quest?.eventIds.length).toBeGreaterThan(0);
      expect(quest?.outcomeIds.length).toBe(5);
      expect(
        project.outcomes.some(
          (outcome) =>
            outcome.questId === questId &&
            outcome.condition.type === "all" &&
            outcome.condition.conditions.length === 0
        )
      ).toBe(true);
    }
  });
});
