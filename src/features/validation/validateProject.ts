import type { Condition } from "../../domain/condition";
import type { Effect } from "../../domain/effect";
import type {
  GuildProject,
  SourceIssue
} from "../../domain/project";
import { validateSchema } from "./validateSchema";

export type IssueSeverity = "error" | "warning" | "source";
export type EntityKind = "project" | "hero" | "quest" | "event" | "outcome";

export interface ProjectIssue {
  id: string;
  severity: IssueSeverity;
  code: string;
  message: string;
  entityType: EntityKind;
  entityId?: string;
  field?: string;
}

function duplicateIssues(
  values: { id: string }[],
  entityType: EntityKind
): ProjectIssue[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of values) {
    if (seen.has(item.id)) duplicates.add(item.id);
    seen.add(item.id);
  }
  return [...duplicates].map((id) => ({
    id: `duplicate-${entityType}-${id}`,
    severity: "error",
    code: "duplicate-id",
    message: `ID “${id}” 重复。`,
    entityType,
    entityId: id,
    field: "id"
  }));
}

function hasExplicitUnresolved(
  sourceIssues: SourceIssue[],
  unresolvedId: string,
  entityId?: string
) {
  return sourceIssues.some(
    (issue) =>
      issue.code === "unresolved-reference" &&
      (!entityId || issue.entityId === entityId) &&
      issue.unresolvedIds?.includes(unresolvedId)
  );
}

interface RefContext {
  heroIds: Set<string>;
  eventIds: Set<string>;
  flagIds: Set<string>;
  sourceIssues: SourceIssue[];
}

function collectConditionIssues(
  condition: Condition,
  ownerType: "event" | "outcome",
  ownerId: string,
  field: string,
  refs: RefContext
): ProjectIssue[] {
  if (condition.type === "all" || condition.type === "any") {
    return condition.conditions.flatMap((child, index) =>
      collectConditionIssues(
        child,
        ownerType,
        ownerId,
        `${field}.conditions.${index}`,
        refs
      )
    );
  }

  const issues: ProjectIssue[] = [];
  if (
    (condition.type === "partyHasHero" ||
      condition.type === "heroStatusEquals") &&
    !refs.heroIds.has(condition.heroId) &&
    !hasExplicitUnresolved(refs.sourceIssues, condition.heroId, ownerId)
  ) {
    issues.push({
      id: `invalid-hero-${ownerId}-${field}-${condition.heroId}`,
      severity: "error",
      code: "invalid-reference",
      message: `人物引用 “${condition.heroId}” 不存在，且未标记为原案未解析引用。`,
      entityType: ownerType,
      entityId: ownerId,
      field
    });
  }
  if (
    condition.type === "optionSelected" &&
    !refs.eventIds.has(condition.eventId)
  ) {
    issues.push({
      id: `invalid-event-${ownerId}-${field}-${condition.eventId}`,
      severity: "error",
      code: "invalid-reference",
      message: `事件引用 “${condition.eventId}” 不存在。`,
      entityType: ownerType,
      entityId: ownerId,
      field
    });
  }
  if (
    condition.type === "flagEquals" &&
    !refs.flagIds.has(condition.flagId)
  ) {
    issues.push({
      id: `invalid-flag-${ownerId}-${field}-${condition.flagId}`,
      severity: "error",
      code: "undefined-flag",
      message: `Flag “${condition.flagId}” 未声明。`,
      entityType: ownerType,
      entityId: ownerId,
      field
    });
  }
  return issues;
}

function collectEffectIssues(
  effect: Effect,
  ownerType: "event" | "outcome",
  ownerId: string,
  field: string,
  refs: RefContext
): ProjectIssue[] {
  const issues: ProjectIssue[] = [];
  if (effect.type === "setFlag" && !refs.flagIds.has(effect.flagId)) {
    issues.push({
      id: `invalid-effect-flag-${ownerId}-${field}-${effect.flagId}`,
      severity: "error",
      code: "undefined-flag",
      message: `变化写入了未声明的 Flag “${effect.flagId}”。`,
      entityType: ownerType,
      entityId: ownerId,
      field
    });
  }
  if (
    effect.type === "setHeroStatus" &&
    !refs.heroIds.has(effect.heroId) &&
    !hasExplicitUnresolved(refs.sourceIssues, effect.heroId, ownerId)
  ) {
    issues.push({
      id: `invalid-effect-hero-${ownerId}-${field}-${effect.heroId}`,
      severity: "error",
      code: "invalid-reference",
      message: `变化引用了不存在的人物 “${effect.heroId}”。`,
      entityType: ownerType,
      entityId: ownerId,
      field
    });
  }
  if (effect.type === "changeRelationship") {
    for (const heroId of [effect.fromHeroId, effect.toHeroId]) {
      if (
        !refs.heroIds.has(heroId) &&
        !hasExplicitUnresolved(refs.sourceIssues, heroId, ownerId)
      ) {
        issues.push({
          id: `invalid-relationship-hero-${ownerId}-${field}-${heroId}`,
          severity: "error",
          code: "invalid-reference",
          message: `关系变化引用了不存在的人物 “${heroId}”。`,
          entityType: ownerType,
          entityId: ownerId,
          field
        });
      }
    }
  }
  return issues;
}

export function validateProject(project: GuildProject): ProjectIssue[] {
  const schemaResult = validateSchema(project);
  const issues: ProjectIssue[] = schemaResult.errors.map((error, index) => ({
    id: `schema-${index}-${error.instancePath}`,
    severity: "error",
    code: "schema",
    message: `${error.instancePath || "项目"} ${error.message ?? "结构错误"}`,
    entityType: "project",
    field: error.instancePath
  }));

  issues.push(
    ...duplicateIssues(project.heroes, "hero"),
    ...duplicateIssues(project.quests, "quest"),
    ...duplicateIssues(project.events, "event"),
    ...duplicateIssues(project.outcomes, "outcome"),
    ...duplicateIssues(project.flags, "project")
  );

  const heroIds = new Set(project.heroes.map((item) => item.id));
  const questIds = new Set(project.quests.map((item) => item.id));
  const eventIds = new Set(project.events.map((item) => item.id));
  const outcomeIds = new Set(project.outcomes.map((item) => item.id));
  const flagIds = new Set(project.flags.map((item) => item.id));
  const refs = { heroIds, eventIds, flagIds, sourceIssues: project.sourceIssues };

  for (const hero of project.heroes) {
    if (hero.publicTraits.some((trait) => !trait.trim())) {
      issues.push({
        id: `empty-trait-${hero.id}`,
        severity: "error",
        code: "empty-item",
        message: "公开特质中存在空条目。",
        entityType: "hero",
        entityId: hero.id,
        field: "publicTraits"
      });
    }
    if (
      !hero.hiddenTendency.trim() ||
      hero.triggerConditions.length === 0 ||
      hero.behaviorPriorities.length === 0
    ) {
      issues.push({
        id: `hidden-behavior-gap-${hero.id}`,
        severity: "warning",
        code: "content-warning",
        message: "隐藏行为资料未完整填写。",
        entityType: "hero",
        entityId: hero.id,
        field: "hiddenTendency"
      });
    }
  }

  for (const quest of project.quests) {
    if (quest.minPartySize > quest.maxPartySize) {
      issues.push({
        id: `party-range-${quest.id}`,
        severity: "error",
        code: "invalid-range",
        message: "最少派遣人数不能大于最多派遣人数。",
        entityType: "quest",
        entityId: quest.id,
        field: "minPartySize"
      });
    }
    for (const eventId of quest.eventIds) {
      if (!eventIds.has(eventId)) {
        issues.push({
          id: `quest-event-${quest.id}-${eventId}`,
          severity: "error",
          code: "invalid-reference",
          message: `任务引用的事件 “${eventId}” 不存在。`,
          entityType: "quest",
          entityId: quest.id,
          field: "eventIds"
        });
      }
    }
    for (const outcomeId of quest.outcomeIds) {
      if (!outcomeIds.has(outcomeId)) {
        issues.push({
          id: `quest-outcome-${quest.id}-${outcomeId}`,
          severity: "error",
          code: "invalid-reference",
          message: `任务引用的结果 “${outcomeId}” 不存在。`,
          entityType: "quest",
          entityId: quest.id,
          field: "outcomeIds"
        });
      }
    }
    for (const flagId of quest.followUpFlags) {
      if (!flagIds.has(flagId)) {
        issues.push({
          id: `quest-flag-${quest.id}-${flagId}`,
          severity: "error",
          code: "undefined-flag",
          message: `任务声明的后续 Flag “${flagId}” 不存在。`,
          entityType: "quest",
          entityId: quest.id,
          field: "followUpFlags"
        });
      }
    }
    const questOutcomes = project.outcomes.filter(
      (outcome) => outcome.questId === quest.id
    );
    if (
      quest.sourceStatus === "complete" &&
      !questOutcomes.some(
        (outcome) =>
          outcome.condition.type === "all" &&
          outcome.condition.conditions.length === 0
      )
    ) {
      issues.push({
        id: `default-outcome-${quest.id}`,
        severity: "warning",
        code: "missing-default",
        message: "完整故事没有默认结果。",
        entityType: "quest",
        entityId: quest.id,
        field: "outcomeIds"
      });
    }

    const priorities = new Map<number, string[]>();
    for (const outcome of questOutcomes) {
      const ids = priorities.get(outcome.priority) ?? [];
      ids.push(outcome.id);
      priorities.set(outcome.priority, ids);
    }
    for (const [priority, ids] of priorities) {
      if (ids.length > 1) {
        issues.push({
          id: `priority-${quest.id}-${priority}`,
          severity: "warning",
          code: "same-priority",
          message: `优先级 ${priority} 有 ${ids.length} 个结果；若同时命中，预览会阻断。`,
          entityType: "quest",
          entityId: quest.id,
          field: "outcomeIds"
        });
      }
    }
  }

  for (const event of project.events) {
    if (!questIds.has(event.questId)) {
      issues.push({
        id: `event-quest-${event.id}`,
        severity: "error",
        code: "invalid-reference",
        message: `事件所属任务 “${event.questId}” 不存在。`,
        entityType: "event",
        entityId: event.id,
        field: "questId"
      });
    }
    issues.push(...duplicateIssues(event.options, "event").map((issue) => ({
      ...issue,
      id: `${issue.id}-${event.id}`,
      entityId: event.id,
      field: "options"
    })));
    event.options.forEach((option, optionIndex) => {
      if (option.visibleCondition) {
        issues.push(
          ...collectConditionIssues(
            option.visibleCondition,
            "event",
            event.id,
            `options.${optionIndex}.visibleCondition`,
            refs
          )
        );
      }
      option.effects.forEach((effect, effectIndex) => {
        issues.push(
          ...collectEffectIssues(
            effect,
            "event",
            event.id,
            `options.${optionIndex}.effects.${effectIndex}`,
            refs
          )
        );
      });
    });
  }

  for (const outcome of project.outcomes) {
    if (!questIds.has(outcome.questId)) {
      issues.push({
        id: `outcome-quest-${outcome.id}`,
        severity: "error",
        code: "invalid-reference",
        message: `结果所属任务 “${outcome.questId}” 不存在。`,
        entityType: "outcome",
        entityId: outcome.id,
        field: "questId"
      });
    }
    issues.push(
      ...collectConditionIssues(
        outcome.condition,
        "outcome",
        outcome.id,
        "condition",
        refs
      )
    );
    for (const [index, effect] of outcome.effects.entries()) {
      issues.push(
        ...collectEffectIssues(
          effect,
          "outcome",
          outcome.id,
          `effects.${index}`,
          refs
        )
      );
    }
    for (const flagId of outcome.writtenFlags) {
      if (!flagIds.has(flagId)) {
        issues.push({
          id: `outcome-flag-${outcome.id}-${flagId}`,
          severity: "error",
          code: "undefined-flag",
          message: `结果写入的 Flag “${flagId}” 未声明。`,
          entityType: "outcome",
          entityId: outcome.id,
          field: "writtenFlags"
        });
      }
    }
    for (const eventId of outcome.followUpEvents) {
      if (
        !eventIds.has(eventId) &&
        !hasExplicitUnresolved(project.sourceIssues, eventId, outcome.id)
      ) {
        issues.push({
          id: `outcome-event-${outcome.id}-${eventId}`,
          severity: "error",
          code: "invalid-reference",
          message: `后续事件 “${eventId}” 不存在，且未标为未解析引用。`,
          entityType: "outcome",
          entityId: outcome.id,
          field: "followUpEvents"
        });
      }
    }
  }

  for (const sourceIssue of project.sourceIssues) {
    issues.push({
      id: `source-${sourceIssue.id}`,
      severity: "source",
      code: sourceIssue.code,
      message: sourceIssue.message,
      entityType: sourceIssue.entityType,
      entityId: sourceIssue.entityId,
      field: sourceIssue.field
    });
  }

  return issues;
}

export function hasBlockingIssues(issues: ProjectIssue[]) {
  return issues.some((issue) => issue.severity === "error");
}
