import type { Effect } from "../../domain/effect";
import { useProjectStore } from "../project/projectStore";

const effectLabels: Record<Effect["type"], string> = {
  setFlag: "设置 Flag",
  addGuildGold: "公会金币变化",
  addReputation: "声望变化",
  setHeroStatus: "设置人物状态",
  changeRelationship: "关系变化",
  unlockContent: "解锁内容",
  note: "文本备注"
};

function makeEffect(
  type: Effect["type"],
  project: ReturnType<typeof useProjectStore>["project"]
): Effect {
  switch (type) {
    case "setFlag":
      return {
        type,
        flagId: project.flags[0]?.id ?? "flag_missing",
        value: true
      };
    case "addGuildGold":
    case "addReputation":
      return { type, amount: 0 };
    case "setHeroStatus":
      return {
        type,
        heroId: project.heroes[0]?.id ?? "hero_missing",
        status: ""
      };
    case "changeRelationship":
      return {
        type,
        fromHeroId: project.heroes[0]?.id ?? "hero_missing",
        toHeroId: project.heroes[1]?.id ?? "hero_missing",
        amount: 1
      };
    case "unlockContent":
      return { type, contentId: "new_content" };
    case "note":
      return { type, text: "" };
  }
}

interface EffectBuilderProps {
  effects: Effect[];
  onChange: (effects: Effect[]) => void;
}

export function EffectBuilder({ effects, onChange }: EffectBuilderProps) {
  const { project } = useProjectStore();
  const update = (index: number, effect: Effect) => {
    const next = [...effects];
    next[index] = effect;
    onChange(next);
  };

  const heroOptions = (current: string) => (
    <>
      {!project.heroes.some((hero) => hero.id === current) ? (
        <option value={current}>{current}（未解析）</option>
      ) : null}
      {project.heroes.map((hero) => (
        <option value={hero.id} key={hero.id}>
          {hero.name}
        </option>
      ))}
    </>
  );

  return (
    <div className="effect-builder">
      {effects.map((effect, index) => (
        <div className="builder-row" key={`${index}-${effect.type}`}>
          <select
            aria-label="变化类型"
            value={effect.type}
            onChange={(event) =>
              update(
                index,
                makeEffect(event.target.value as Effect["type"], project)
              )
            }
          >
            {Object.entries(effectLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>

          {effect.type === "setFlag" ? (
            <>
              <select
                value={effect.flagId}
                onChange={(event) =>
                  update(index, { ...effect, flagId: event.target.value })
                }
              >
                {!project.flags.some((flag) => flag.id === effect.flagId) ? (
                  <option value={effect.flagId}>
                    {effect.flagId}（未声明）
                  </option>
                ) : null}
                {project.flags.map((flag) => (
                  <option value={flag.id} key={flag.id}>
                    {flag.id}
                  </option>
                ))}
              </select>
              <select
                value={String(effect.value)}
                onChange={(event) =>
                  update(index, {
                    ...effect,
                    value: event.target.value === "true"
                      ? true
                      : event.target.value === "false"
                        ? false
                        : event.target.value
                  })
                }
              >
                <option value="true">true</option>
                <option value="false">false</option>
                {typeof effect.value === "string" &&
                effect.value !== "true" &&
                effect.value !== "false" ? (
                  <option value={effect.value}>{effect.value}</option>
                ) : null}
              </select>
            </>
          ) : null}

          {effect.type === "addGuildGold" ||
          effect.type === "addReputation" ? (
            <input
              aria-label="变化数值"
              type="number"
              value={effect.amount}
              onChange={(event) =>
                update(index, {
                  ...effect,
                  amount: Number(event.target.value)
                })
              }
            />
          ) : null}

          {effect.type === "setHeroStatus" ? (
            <>
              <select
                value={effect.heroId}
                onChange={(event) =>
                  update(index, { ...effect, heroId: event.target.value })
                }
              >
                {heroOptions(effect.heroId)}
              </select>
              <input
                aria-label="新状态"
                value={effect.status}
                onChange={(event) =>
                  update(index, { ...effect, status: event.target.value })
                }
              />
            </>
          ) : null}

          {effect.type === "changeRelationship" ? (
            <>
              <select
                value={effect.fromHeroId}
                onChange={(event) =>
                  update(index, { ...effect, fromHeroId: event.target.value })
                }
              >
                {heroOptions(effect.fromHeroId)}
              </select>
              <span>→</span>
              <select
                value={effect.toHeroId}
                onChange={(event) =>
                  update(index, { ...effect, toHeroId: event.target.value })
                }
              >
                {heroOptions(effect.toHeroId)}
              </select>
              <input
                aria-label="关系变化值"
                type="number"
                value={effect.amount}
                onChange={(event) =>
                  update(index, {
                    ...effect,
                    amount: Number(event.target.value)
                  })
                }
              />
            </>
          ) : null}

          {effect.type === "unlockContent" ? (
            <input
              aria-label="内容 ID"
              value={effect.contentId}
              onChange={(event) =>
                update(index, { ...effect, contentId: event.target.value })
              }
            />
          ) : null}

          {effect.type === "note" ? (
            <input
              aria-label="备注"
              value={effect.text}
              onChange={(event) =>
                update(index, { ...effect, text: event.target.value })
              }
            />
          ) : null}

          <button
            type="button"
            className="icon-button"
            aria-label="删除变化"
            onClick={() =>
              onChange(effects.filter((_, itemIndex) => itemIndex !== index))
            }
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button button--quiet"
        onClick={() => onChange([...effects, makeEffect("setFlag", project)])}
      >
        ＋ 添加变化
      </button>
    </div>
  );
}
