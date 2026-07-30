import { describe, expect, it } from "vitest";
import seed from "../data/guild-seed.v0.1.json";
import type { GuildProject, Outcome } from "../domain/project";
import {
  createPreviewContext,
  evaluateOutcome
} from "../features/preview/evaluateOutcome";

const project = seed as GuildProject;

describe("outcome evaluation", () => {
  it("matches lullaby soothe success for option B and social 3+", () => {
    const context = createPreviewContext(project, ["hero_d"], {
      event_silent_lullaby_dream: "soothe"
    });
    expect(
      evaluateOutcome(project, "quest_silent_lullaby", context).matched?.id
    ).toBe("lullaby_soothe_success");
  });

  it("matches lullaby fight win for option A and combat 5+", () => {
    const context = createPreviewContext(project, ["hero_a"], {
      event_silent_lullaby_dream: "attack"
    });
    expect(
      evaluateOutcome(project, "quest_silent_lullaby", context).matched?.id
    ).toBe("lullaby_fight_win");
  });

  it("stops when two simultaneously matching outcomes share top priority", () => {
    const copy = structuredClone(project);
    const duplicate = structuredClone(
      copy.outcomes.find(
        (outcome) => outcome.id === "lullaby_soothe_success"
      )
    ) as Outcome;
    duplicate.id = "lullaby_soothe_conflict";
    copy.outcomes.push(duplicate);
    const context = createPreviewContext(copy, ["hero_d"], {
      event_silent_lullaby_dream: "soothe"
    });
    const result = evaluateOutcome(copy, "quest_silent_lullaby", context);
    expect(result.status).toBe("conflict");
    expect(result.conflictIds).toEqual([
      "lullaby_soothe_success",
      "lullaby_soothe_conflict"
    ]);
  });
});
