import {
  evaluateCondition,
  type ConditionTrace,
  type PreviewContext,
  type StatKey
} from "../../domain/condition";
import type {
  GuildProject,
  Outcome
} from "../../domain/project";

export interface OutcomeTrace {
  outcome: Outcome;
  trace: ConditionTrace;
}

export interface OutcomeEvaluation {
  status: "matched" | "none" | "conflict";
  matched?: Outcome;
  conflictIds?: string[];
  traces: OutcomeTrace[];
}

export function createPreviewContext(
  project: GuildProject,
  partyHeroIds: string[],
  selectedOptions: Record<string, string>
): PreviewContext {
  const heroes = partyHeroIds
    .map((id) => project.heroes.find((hero) => hero.id === id))
    .filter((hero): hero is NonNullable<typeof hero> => Boolean(hero));
  const stat = (key: StatKey) =>
    heroes.reduce((highest, hero) => Math.max(highest, hero.stats[key]), 0);

  const flags = Object.fromEntries(
    project.flags.map((flag) => [flag.id, flag.initialValue])
  );
  for (const [eventId, optionId] of Object.entries(selectedOptions)) {
    const event = project.events.find((item) => item.id === eventId);
    const option = event?.options.find((item) => item.id === optionId);
    for (const effect of option?.effects ?? []) {
      if (effect.type === "setFlag") {
        flags[effect.flagId] = effect.value;
      }
    }
  }

  return {
    partyHeroIds,
    partyStats: {
      combat: stat("combat"),
      investigation: stat("investigation"),
      social: stat("social")
    },
    selectedOptions,
    flags,
    heroStatuses: Object.fromEntries(
      project.heroes.map((hero) => [hero.id, hero.currentStatus])
    )
  };
}

export function evaluateOutcome(
  project: GuildProject,
  questId: string,
  context: PreviewContext
): OutcomeEvaluation {
  const outcomes = project.outcomes
    .filter((outcome) => outcome.questId === questId)
    .sort((left, right) => right.priority - left.priority);
  const traces = outcomes.map((outcome) => ({
    outcome,
    trace: evaluateCondition(outcome.condition, context)
  }));
  const passed = traces.filter((item) => item.trace.passed);
  if (passed.length === 0) return { status: "none", traces };

  const highestPriority = passed[0].outcome.priority;
  const highest = passed.filter(
    (item) => item.outcome.priority === highestPriority
  );
  if (highest.length > 1) {
    return {
      status: "conflict",
      conflictIds: highest.map((item) => item.outcome.id),
      traces
    };
  }
  return {
    status: "matched",
    matched: highest[0].outcome,
    traces
  };
}
