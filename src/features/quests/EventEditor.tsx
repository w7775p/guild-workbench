import { useState } from "react";
import { EditorSection, TextField } from "../../components/Fields";
import type { Condition } from "../../domain/condition";
import type { EventOption, QuestEvent } from "../../domain/project";
import { useProjectStore } from "../project/projectStore";
import { ConditionBuilder } from "./ConditionBuilder";
import { EffectBuilder } from "./EffectBuilder";

export function EventEditor({ event }: { event: QuestEvent }) {
  const {
    updateEvent,
    deleteEvent,
    selectEvent
  } = useProjectStore();
  const [feedback, setFeedback] = useState<string>();
  const patch = <K extends keyof QuestEvent>(
    key: K,
    value: QuestEvent[K]
  ) => updateEvent({ ...event, [key]: value });

  const updateOption = (index: number, option: EventOption) => {
    const options = [...event.options];
    options[index] = option;
    patch("options", options);
  };

  const addOption = () => {
    let index = event.options.length + 1;
    let id = `option_${index}`;
    while (event.options.some((option) => option.id === id)) {
      index += 1;
      id = `option_${index}`;
    }
    patch("options", [
      ...event.options,
      { id, label: "", effects: [] }
    ]);
  };

  return (
    <div className="nested-editor" data-field="event">
      <div className="nested-editor__top">
        <div>
          <span className="eyebrow">中途事件</span>
          <h2>{event.id}</h2>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="button button--quiet"
            onClick={() => selectEvent(undefined)}
          >
            收起
          </button>
          <button
            type="button"
            className="button button--danger"
            onClick={() => {
              const result = deleteEvent(event.id);
              setFeedback(result.message);
            }}
          >
            删除事件
          </button>
        </div>
      </div>
      {feedback ? <p className="inline-feedback">{feedback}</p> : null}

      <EditorSection title="事件正文">
        <TextField
          label="稳定 ID"
          value={event.id}
          disabled
          onChange={() => undefined}
          field="id"
        />
        <TextField
          label="触发说明"
          value={event.triggerDescription}
          onChange={(value) => patch("triggerDescription", value)}
          field="triggerDescription"
          wide
        />
        <TextField
          label="玩家可见文本"
          value={event.visibleText}
          onChange={(value) => patch("visibleText", value)}
          field="visibleText"
          multiline
          rows={5}
          wide
        />
      </EditorSection>

      <section className="editor-section" data-field="options">
        <header className="editor-section__header">
          <div>
            <h2>事件选项</h2>
            <p>每个选项直接写入结构化变化；人物限定使用可见条件。</p>
          </div>
          <button type="button" className="button button--quiet" onClick={addOption}>
            ＋ 添加选项
          </button>
        </header>
        <div className="option-stack">
          {event.options.map((option, index) => (
            <div className="option-card" key={`${index}-${option.id}`}>
              <div className="option-card__heading">
                <input
                  aria-label="选项 ID"
                  value={option.id}
                  onChange={(changeEvent) =>
                    updateOption(index, {
                      ...option,
                      id: changeEvent.target.value
                    })
                  }
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label="删除选项"
                  onClick={() =>
                    patch(
                      "options",
                      event.options.filter(
                        (_, optionIndex) => optionIndex !== index
                      )
                    )
                  }
                >
                  ×
                </button>
              </div>
              <textarea
                aria-label="选项文案"
                rows={2}
                value={option.label}
                onChange={(changeEvent) =>
                  updateOption(index, {
                    ...option,
                    label: changeEvent.target.value
                  })
                }
              />
              <div className="subsection-label">
                <span>出现条件</span>
                <button
                  type="button"
                  className="button button--quiet"
                  onClick={() =>
                    updateOption(index, {
                      ...option,
                      visibleCondition: option.visibleCondition
                        ? undefined
                        : ({
                            type: "partyHasHero",
                            heroId: "hero_a"
                          } satisfies Condition)
                    })
                  }
                >
                  {option.visibleCondition ? "移除条件" : "＋ 添加条件"}
                </button>
              </div>
              {option.visibleCondition ? (
                <ConditionBuilder
                  condition={option.visibleCondition}
                  onChange={(condition) =>
                    updateOption(index, {
                      ...option,
                      visibleCondition: condition
                    })
                  }
                />
              ) : (
                <p className="empty-copy">任何队伍都可见</p>
              )}
              <span className="subsection-label">选择后变化</span>
              <EffectBuilder
                effects={option.effects}
                onChange={(effects) =>
                  updateOption(index, { ...option, effects })
                }
              />
            </div>
          ))}
          {event.options.length === 0 ? (
            <p className="empty-copy">此事件还没有选项。</p>
          ) : null}
        </div>
      </section>

      <EditorSection title="结果影响与设计备注">
        <TextField
          label="角色反应"
          value={event.characterReactions}
          onChange={(value) => patch("characterReactions", value)}
          field="characterReactions"
          multiline
          wide
        />
        <TextField
          label="影响结果"
          value={event.outcomeImpact}
          onChange={(value) => patch("outcomeImpact", value)}
          field="outcomeImpact"
          multiline
          wide
        />
        <TextField
          label="测试观察点"
          value={event.testObservation}
          onChange={(value) => patch("testObservation", value)}
          field="testObservation"
          multiline
          wide
        />
      </EditorSection>
    </div>
  );
}
