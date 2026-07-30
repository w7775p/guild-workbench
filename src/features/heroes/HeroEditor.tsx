import { ArrayField } from "../../components/ArrayField";
import {
  EditorSection,
  NumberField,
  TextField
} from "../../components/Fields";
import type { Hero } from "../../domain/project";
import { useProjectStore } from "../project/projectStore";

export function HeroEditor() {
  const {
    project,
    selectedHeroId,
    updateHero
  } = useProjectStore();
  const hero = project.heroes.find((item) => item.id === selectedHeroId);
  if (!hero) return <div className="empty-panel">请选择人物。</div>;

  const patch = <K extends keyof Hero>(key: K, value: Hero[K]) => {
    updateHero({ ...hero, [key]: value });
  };

  return (
    <article className="editor-scroll">
      <div className="editor-title">
        <div>
          <span className="eyebrow">人物档案 · {hero.id}</span>
          <h1>{hero.name}</h1>
        </div>
        <span className="save-indicator">自动保存草稿</span>
      </div>

      <EditorSection title="基本信息">
        <TextField
          label="稳定 ID"
          value={hero.id}
          disabled
          onChange={() => undefined}
          field="id"
        />
        <TextField
          label="姓名"
          value={hero.name}
          onChange={(value) => patch("name", value)}
          field="name"
        />
        <TextField
          label="职业／身份"
          value={hero.role}
          onChange={(value) => patch("role", value)}
          field="role"
        />
        <TextField
          label="一句话印象"
          value={hero.impression}
          onChange={(value) => patch("impression", value)}
          field="impression"
          wide
        />
        <NumberField
          label="战斗"
          value={hero.stats.combat}
          min={0}
          onChange={(value) =>
            patch("stats", { ...hero.stats, combat: value })
          }
          field="stats.combat"
        />
        <NumberField
          label="调查"
          value={hero.stats.investigation}
          min={0}
          onChange={(value) =>
            patch("stats", { ...hero.stats, investigation: value })
          }
          field="stats.investigation"
        />
        <NumberField
          label="交涉"
          value={hero.stats.social}
          min={0}
          onChange={(value) =>
            patch("stats", { ...hero.stats, social: value })
          }
          field="stats.social"
        />
        <TextField
          label="等级"
          value={hero.level}
          onChange={(value) => patch("level", value)}
          field="level"
        />
        <NumberField
          label="金币"
          value={hero.gold}
          min={0}
          onChange={(value) => patch("gold", value)}
          field="gold"
        />
        <TextField
          label="声望"
          value={hero.reputation}
          onChange={(value) => patch("reputation", value)}
          field="reputation"
        />
        <TextField
          label="当前状态"
          value={hero.currentStatus}
          onChange={(value) => patch("currentStatus", value)}
          field="currentStatus"
        />
      </EditorSection>

      <EditorSection title="公开信息">
        <ArrayField
          label="公开特质"
          values={hero.publicTraits}
          onChange={(value) => patch("publicTraits", value)}
          field="publicTraits"
          multiline
        />
        <TextField
          label="公开关系与弱线索"
          value={hero.publicRelationshipsAndClues}
          onChange={(value) => patch("publicRelationshipsAndClues", value)}
          field="publicRelationshipsAndClues"
          multiline
          rows={5}
          wide
        />
      </EditorSection>

      <EditorSection
        title="隐藏行为"
        description="这些资料供结果与角色行为设计使用，不等于玩家立刻可见。"
      >
        <TextField
          label="隐藏倾向"
          value={hero.hiddenTendency}
          onChange={(value) => patch("hiddenTendency", value)}
          field="hiddenTendency"
          multiline
          rows={6}
          wide
        />
        <ArrayField
          label="触发条件"
          values={hero.triggerConditions}
          onChange={(value) => patch("triggerConditions", value)}
          field="triggerConditions"
        />
        <ArrayField
          label="抑制条件"
          values={hero.suppressConditions}
          onChange={(value) => patch("suppressConditions", value)}
          field="suppressConditions"
        />
        <ArrayField
          label="强化条件"
          values={hero.reinforceConditions}
          onChange={(value) => patch("reinforceConditions", value)}
          field="reinforceConditions"
        />
        <ArrayField
          label="行为优先级"
          values={hero.behaviorPriorities}
          onChange={(value) => patch("behaviorPriorities", value)}
          field="behaviorPriorities"
        />
      </EditorSection>

      <EditorSection title="状态与关系">
        <TextField
          label="揭露等级"
          value={hero.revealLevel}
          onChange={(value) => patch("revealLevel", value)}
          field="revealLevel"
        />
        <TextField
          label="伤势规则"
          value={hero.injuryRules}
          onChange={(value) => patch("injuryRules", value)}
          field="injuryRules"
          multiline
          wide
        />
        <TextField
          label="关系变化与个人事件"
          value={hero.relationshipChangesAndPersonalEvents}
          onChange={(value) =>
            patch("relationshipChangesAndPersonalEvents", value)
          }
          field="relationshipChangesAndPersonalEvents"
          multiline
          rows={5}
          wide
        />
      </EditorSection>

      <EditorSection title="设计备注">
        <TextField
          label="角色弧线"
          value={hero.characterArc}
          onChange={(value) => patch("characterArc", value)}
          field="characterArc"
          multiline
          wide
        />
        <TextField
          label="测试目的"
          value={hero.testPurpose}
          onChange={(value) => patch("testPurpose", value)}
          field="testPurpose"
          multiline
          rows={5}
          wide
        />
      </EditorSection>
    </article>
  );
}
