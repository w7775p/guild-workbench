export type StatKey = "combat" | "investigation" | "social";

export type Condition =
  | { type: "all"; conditions: Condition[] }
  | { type: "any"; conditions: Condition[] }
  | { type: "partyHasHero"; heroId: string }
  | { type: "partyStatAtLeast"; stat: StatKey; value: number }
  | { type: "optionSelected"; eventId: string; optionId: string }
  | { type: "flagEquals"; flagId: string; value: boolean | number | string }
  | { type: "heroStatusEquals"; heroId: string; status: string };

export interface PreviewContext {
  partyHeroIds: string[];
  partyStats: Record<StatKey, number>;
  selectedOptions: Record<string, string>;
  flags: Record<string, boolean | number | string>;
  heroStatuses: Record<string, string>;
}

export interface ConditionTrace {
  condition: Condition;
  passed: boolean;
  children?: ConditionTrace[];
}

export function evaluateCondition(
  condition: Condition,
  context: PreviewContext
): ConditionTrace {
  switch (condition.type) {
    case "all": {
      const children = condition.conditions.map((item) =>
        evaluateCondition(item, context)
      );
      return {
        condition,
        passed: children.every((child) => child.passed),
        children
      };
    }
    case "any": {
      const children = condition.conditions.map((item) =>
        evaluateCondition(item, context)
      );
      return {
        condition,
        passed: children.some((child) => child.passed),
        children
      };
    }
    case "partyHasHero":
      return {
        condition,
        passed: context.partyHeroIds.includes(condition.heroId)
      };
    case "partyStatAtLeast":
      return {
        condition,
        passed: context.partyStats[condition.stat] >= condition.value
      };
    case "optionSelected":
      return {
        condition,
        passed:
          context.selectedOptions[condition.eventId] === condition.optionId
      };
    case "flagEquals":
      return {
        condition,
        passed: context.flags[condition.flagId] === condition.value
      };
    case "heroStatusEquals":
      return {
        condition,
        passed: context.heroStatuses[condition.heroId] === condition.status
      };
  }
}
