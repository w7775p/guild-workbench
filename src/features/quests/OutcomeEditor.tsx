import { useState } from "react";
import { ArrayField } from "../../components/ArrayField";
import {
  EditorSection,
  NumberField,
  TextField
} from "../../components/Fields";
import type { Outcome } from "../../domain/project";
import { useProjectStore } from "../project/projectStore";
import { ConditionBuilder } from "./ConditionBuilder";
import { EffectBuilder } from "./EffectBuilder";

export function OutcomeEditor({ outcome }: { outcome: Outcome }) {
  const {
    updateOutcome,
    deleteOutcome,
    selectOutcome
  } = useProjectStore();
  const [feedback, setFeedback] = useState<string>();
  const patch = <K extends keyof Outcome>(key: K, value: Outcome[K]) =>
    updateOutcome({ ...outcome, [key]: value });

  return (
    <div className="nested-editor" data-field="outcome">
      <div className="nested-editor__top">
        <div>
          <span className="eyebrow">任务结果</span>
          <h2>{outcome.id}</h2>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="button button--quiet"
            onClick={() => selectOutcome(undefined)}
          >
            收起
          </button>
          <button
            type="button"
            className="button button--danger"
            onClick={() => {
              const result = deleteOutcome(outcome.id);
              setFeedback(result.message);
            }}
          >
            删除结果
          </button>
        </div>
      </div>
      {feedback ? <p className="inline-feedback">{feedback}</p> : null}

      <EditorSection title="判定">
        <TextField
          label="稳定 ID"
          value={outcome.id}
          disabled
          onChange={() => undefined}
          field="id"
        />
        <NumberField
          label="优先级"
          value={outcome.priority}
          onChange={(value) => patch("priority", value)}
          field="priority"
        />
        <TextField
          label="结果等级"
          value={outcome.grade}
          onChange={(value) => patch("grade", value)}
          field="grade"
        />
        <div className="field-shell--wide" data-field="condition">
          <span className="field-shell__label">结构化条件</span>
          <ConditionBuilder
            condition={outcome.condition}
            onChange={(value) => patch("condition", value)}
          />
        </div>
        <TextField
          label="原始条件文字"
          value={outcome.rawCondition}
          onChange={(value) => patch("rawCondition", value)}
          field="rawCondition"
          hint="用于保留原案语义；程序只执行上方结构化条件。"
          multiline
          wide
        />
      </EditorSection>

      <EditorSection title="归来报告">
        <TextField
          label="玩家报告"
          value={outcome.report}
          onChange={(value) => patch("report", value)}
          field="report"
          multiline
          rows={7}
          wide
        />
        <TextField
          label="因果说明"
          value={outcome.causalExplanation}
          onChange={(value) => patch("causalExplanation", value)}
          field="causalExplanation"
          multiline
          wide
        />
      </EditorSection>

      <EditorSection title="原案变化记录">
        <TextField
          label="公会变化"
          value={outcome.guildChanges}
          onChange={(value) => patch("guildChanges", value)}
          field="guildChanges"
          multiline
          wide
        />
        <TextField
          label="英雄变化"
          value={outcome.heroChanges}
          onChange={(value) => patch("heroChanges", value)}
          field="heroChanges"
          multiline
          wide
        />
        <TextField
          label="关系变化"
          value={outcome.relationshipChanges}
          onChange={(value) => patch("relationshipChanges", value)}
          field="relationshipChanges"
          multiline
          wide
        />
        <ArrayField
          label="写入 Flag"
          values={outcome.writtenFlags}
          onChange={(value) => patch("writtenFlags", value)}
          field="writtenFlags"
        />
        <ArrayField
          label="解锁内容"
          values={outcome.unlockedContent}
          onChange={(value) => patch("unlockedContent", value)}
          field="unlockedContent"
        />
        <ArrayField
          label="后续事件"
          values={outcome.followUpEvents}
          onChange={(value) => patch("followUpEvents", value)}
          field="followUpEvents"
        />
      </EditorSection>

      <section className="editor-section" data-field="effects">
        <header className="editor-section__header">
          <div>
            <h2>可执行变化</h2>
            <p>预览只显示这些变化，不会写回项目数据。</p>
          </div>
        </header>
        <EffectBuilder
          effects={outcome.effects}
          onChange={(value) => patch("effects", value)}
        />
      </section>

      <EditorSection title="测试备注">
        <TextField
          label="测试观察点"
          value={outcome.testObservation}
          onChange={(value) => patch("testObservation", value)}
          field="testObservation"
          multiline
          wide
        />
      </EditorSection>
    </div>
  );
}
