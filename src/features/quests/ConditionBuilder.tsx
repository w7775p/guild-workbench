import type { Condition } from "../../domain/condition";
import { useProjectStore } from "../project/projectStore";

const conditionLabels: Record<Condition["type"], string> = {
  all: "全部满足",
  any: "任一满足",
  partyHasHero: "队伍包含人物",
  partyStatAtLeast: "队伍能力至少",
  optionSelected: "选择了事件选项",
  flagEquals: "Flag 等于",
  heroStatusEquals: "人物状态等于"
};

function makeCondition(
  type: Condition["type"],
  project: ReturnType<typeof useProjectStore>["project"]
): Condition {
  switch (type) {
    case "all":
    case "any":
      return { type, conditions: [] };
    case "partyHasHero":
      return { type, heroId: project.heroes[0]?.id ?? "hero_missing" };
    case "partyStatAtLeast":
      return { type, stat: "combat", value: 1 };
    case "optionSelected": {
      const event = project.events[0];
      return {
        type,
        eventId: event?.id ?? "event_missing",
        optionId: event?.options[0]?.id ?? "option_missing"
      };
    }
    case "flagEquals":
      return {
        type,
        flagId: project.flags[0]?.id ?? "flag_missing",
        value: true
      };
    case "heroStatusEquals":
      return {
        type,
        heroId: project.heroes[0]?.id ?? "hero_missing",
        status: "良好"
      };
  }
}

interface ConditionBuilderProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onRemove?: () => void;
  depth?: number;
}

export function ConditionBuilder({
  condition,
  onChange,
  onRemove,
  depth = 0
}: ConditionBuilderProps) {
  const { project } = useProjectStore();
  const event =
    condition.type === "optionSelected"
      ? project.events.find((item) => item.id === condition.eventId)
      : undefined;

  return (
    <div className={`condition-builder condition-builder--depth-${Math.min(depth, 3)}`}>
      <div className="builder-row">
        <select
          aria-label="条件类型"
          value={condition.type}
          onChange={(event) =>
            onChange(
              makeCondition(event.target.value as Condition["type"], project)
            )
          }
        >
          {Object.entries(conditionLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {condition.type === "partyHasHero" ? (
          <select
            value={condition.heroId}
            onChange={(event) =>
              onChange({ ...condition, heroId: event.target.value })
            }
          >
            {!project.heroes.some((hero) => hero.id === condition.heroId) ? (
              <option value={condition.heroId}>
                {condition.heroId}（未解析）
              </option>
            ) : null}
            {project.heroes.map((hero) => (
              <option value={hero.id} key={hero.id}>
                {hero.name}
              </option>
            ))}
          </select>
        ) : null}

        {condition.type === "partyStatAtLeast" ? (
          <>
            <select
              value={condition.stat}
              onChange={(event) =>
                onChange({
                  ...condition,
                  stat: event.target.value as typeof condition.stat
                })
              }
            >
              <option value="combat">战斗</option>
              <option value="investigation">调查</option>
              <option value="social">交涉</option>
            </select>
            <input
              aria-label="最低数值"
              type="number"
              min={0}
              value={condition.value}
              onChange={(event) =>
                onChange({ ...condition, value: Number(event.target.value) })
              }
            />
          </>
        ) : null}

        {condition.type === "optionSelected" ? (
          <>
            <select
              value={condition.eventId}
              onChange={(changeEvent) => {
                const nextEvent = project.events.find(
                  (item) => item.id === changeEvent.target.value
                );
                onChange({
                  ...condition,
                  eventId: changeEvent.target.value,
                  optionId: nextEvent?.options[0]?.id ?? "option_missing"
                });
              }}
            >
              {!project.events.some((item) => item.id === condition.eventId) ? (
                <option value={condition.eventId}>
                  {condition.eventId}（未解析）
                </option>
              ) : null}
              {project.events.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.id}
                </option>
              ))}
            </select>
            <select
              value={condition.optionId}
              onChange={(changeEvent) =>
                onChange({
                  ...condition,
                  optionId: changeEvent.target.value
                })
              }
            >
              {!event?.options.some(
                (option) => option.id === condition.optionId
              ) ? (
                <option value={condition.optionId}>
                  {condition.optionId}（未解析）
                </option>
              ) : null}
              {event?.options.map((option) => (
                <option value={option.id} key={option.id}>
                  {option.id}
                </option>
              ))}
            </select>
          </>
        ) : null}

        {condition.type === "flagEquals" ? (
          <>
            <select
              value={condition.flagId}
              onChange={(event) =>
                onChange({ ...condition, flagId: event.target.value })
              }
            >
              {!project.flags.some((flag) => flag.id === condition.flagId) ? (
                <option value={condition.flagId}>
                  {condition.flagId}（未声明）
                </option>
              ) : null}
              {project.flags.map((flag) => (
                <option value={flag.id} key={flag.id}>
                  {flag.id}
                </option>
              ))}
            </select>
            <select
              value={String(condition.value)}
              onChange={(event) =>
                onChange({
                  ...condition,
                  value:
                    event.target.value === "true"
                      ? true
                      : event.target.value === "false"
                        ? false
                        : event.target.value
                })
              }
            >
              <option value="true">true</option>
              <option value="false">false</option>
              {typeof condition.value === "string" &&
              condition.value !== "true" &&
              condition.value !== "false" ? (
                <option value={condition.value}>{condition.value}</option>
              ) : null}
            </select>
          </>
        ) : null}

        {condition.type === "heroStatusEquals" ? (
          <>
            <select
              value={condition.heroId}
              onChange={(event) =>
                onChange({ ...condition, heroId: event.target.value })
              }
            >
              {!project.heroes.some((hero) => hero.id === condition.heroId) ? (
                <option value={condition.heroId}>
                  {condition.heroId}（未解析）
                </option>
              ) : null}
              {project.heroes.map((hero) => (
                <option value={hero.id} key={hero.id}>
                  {hero.name}
                </option>
              ))}
            </select>
            <input
              aria-label="人物状态"
              value={condition.status}
              onChange={(event) =>
                onChange({ ...condition, status: event.target.value })
              }
            />
          </>
        ) : null}

        {onRemove ? (
          <button
            type="button"
            className="icon-button"
            aria-label="删除条件"
            onClick={onRemove}
          >
            ×
          </button>
        ) : null}
      </div>

      {condition.type === "all" || condition.type === "any" ? (
        <div className="condition-builder__children">
          {condition.conditions.map((child, index) => (
            <ConditionBuilder
              key={`${index}-${child.type}`}
              condition={child}
              depth={depth + 1}
              onChange={(next) => {
                const conditions = [...condition.conditions];
                conditions[index] = next;
                onChange({ ...condition, conditions });
              }}
              onRemove={() =>
                onChange({
                  ...condition,
                  conditions: condition.conditions.filter(
                    (_, childIndex) => childIndex !== index
                  )
                })
              }
            />
          ))}
          <button
            type="button"
            className="button button--quiet"
            onClick={() =>
              onChange({
                ...condition,
                conditions: [
                  ...condition.conditions,
                  makeCondition("flagEquals", project)
                ]
              })
            }
          >
            ＋ 添加子条件
          </button>
        </div>
      ) : null}
    </div>
  );
}
