import type { Condition } from "./condition";
import type { Effect } from "./effect";

export type EntityId = string;

export interface HeroStats {
  combat: number;
  investigation: number;
  social: number;
}

export interface Hero {
  id: EntityId;
  name: string;
  role: string;
  impression: string;
  stats: HeroStats;
  level: string;
  gold: number;
  reputation: string;
  currentStatus: string;
  publicTraits: string[];
  publicRelationshipsAndClues: string;
  hiddenTendency: string;
  triggerConditions: string[];
  suppressConditions: string[];
  reinforceConditions: string[];
  behaviorPriorities: string[];
  revealLevel: string;
  injuryRules: string;
  relationshipChangesAndPersonalEvents: string;
  characterArc: string;
  testPurpose: string;
}

export interface Reward {
  guildGold: number | null;
  sharedHeroGold: number | null;
  items: string[];
  rawText: string;
}

export type SourceStatus = "complete" | "partial";

export interface Quest {
  id: EntityId;
  title: string;
  client: string;
  description: string;
  location: string;
  reward: Reward;
  duration: string;
  recommendedAbilities: string[];
  apparentRisks: string;
  minPartySize: number;
  maxPartySize: number;
  visibleClues: string[];
  appearanceCondition: string;
  expiryCondition: string;
  truth: string;
  centralConflict: string;
  keyAbilities: string;
  keyTraitsAndCombinations: string;
  eventIds: EntityId[];
  outcomeIds: EntityId[];
  followUpFlags: EntityId[];
  designPurpose: string;
  sourceStatus: SourceStatus;
}

export interface EventOption {
  id: EntityId;
  label: string;
  visibleCondition?: Condition;
  effects: Effect[];
}

export interface QuestEvent {
  id: EntityId;
  questId: EntityId;
  triggerDescription: string;
  visibleText: string;
  options: EventOption[];
  immediateEffects: Effect[];
  characterReactions: string;
  outcomeImpact: string;
  testObservation: string;
}

export interface Outcome {
  id: EntityId;
  questId: EntityId;
  priority: number;
  condition: Condition;
  rawCondition: string;
  grade: string;
  report: string;
  causalExplanation: string;
  guildChanges: string;
  heroChanges: string;
  relationshipChanges: string;
  writtenFlags: EntityId[];
  unlockedContent: EntityId[];
  followUpEvents: EntityId[];
  effects: Effect[];
  testObservation: string;
}

export interface FlagDefinition {
  id: EntityId;
  valueType: "boolean" | "number" | "string";
  initialValue: boolean | number | string;
  description: string;
}

export interface SourceIssue {
  id: EntityId;
  severity: "warning" | "gap";
  entityType: "hero" | "quest" | "event" | "outcome";
  entityId: EntityId;
  field: string;
  code:
    | "missing-structure"
    | "unresolved-reference"
    | "unmapped-condition"
    | "source-ambiguity";
  message: string;
  sourceText: string;
  unresolvedIds?: EntityId[];
}

export interface GuildProject {
  schemaVersion: "0.1";
  projectId: EntityId;
  title: string;
  heroes: Hero[];
  quests: Quest[];
  events: QuestEvent[];
  outcomes: Outcome[];
  flags: FlagDefinition[];
  sourceIssues: SourceIssue[];
}

export function cloneProject(project: GuildProject): GuildProject {
  return structuredClone(project);
}
