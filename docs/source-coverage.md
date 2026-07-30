# 原案字段覆盖报告

来源：Notion《角色&任务原案》，2026-07-30 回读。此报告只证明原案字段在种子项目中的落点，不表示旧剧情已重新定案。

## APRD 角色卡

| 原案字段 | JSON 路径 |
|---|---|
| 角色ID／名称／职业 | `heroes[].id` / `name` / `role` |
| 一句话印象 | `heroes[].impression` |
| 战斗／调查／交涉 | `heroes[].stats.combat` / `investigation` / `social` |
| 等级／金币／声望／状态 | `heroes[].level` / `gold` / `reputation` / `currentStatus` |
| 公开特质 | `heroes[].publicTraits[]` |
| 公开关系／弱线索 | `heroes[].publicRelationshipsAndClues` |
| 隐藏倾向 | `heroes[].hiddenTendency` |
| 触发／抑制／强化条件 | `heroes[].triggerConditions[]` / `suppressConditions[]` / `reinforceConditions[]` |
| 行为优先级 | `heroes[].behaviorPriorities[]`，按原顺序保存 |
| 揭露等级／伤势规则 | `heroes[].revealLevel` / `injuryRules` |
| 关系变化／个人事件 | `heroes[].relationshipChangesAndPersonalEvents` |
| 角色弧线 | `heroes[].characterArc` |
| 测试目的 | `heroes[].testPurpose` |

## 四张任务卡

| 原案字段 | JSON 路径 |
|---|---|
| 任务ID | `quests[].id` |
| 任务名称／委托人 | `quests[].title` / `client` |
| 委托描述 | `quests[].description` |
| 地点／报酬／持续时间 | `quests[].location` / `reward` / `duration` |
| 推荐能力／表面风险 | `quests[].recommendedAbilities[]` / `apparentRisks` |
| 派遣人数 | `quests[].minPartySize` / `maxPartySize` |
| 可见备注／弱线索 | `quests[].visibleClues[]` |
| 出现条件／失效条件 | `quests[].appearanceCondition` / `expiryCondition` |
| 任务真相／核心矛盾 | `quests[].truth` / `centralConflict` |
| 关键能力 | `quests[].keyAbilities` |
| 关键特质／关键组合 | `quests[].keyTraitsAndCombinations` |
| 中途事件ID | `quests[].eventIds[]` |
| 结果组ID | 原结果组拆为 `quests[].outcomeIds[]`；缺失组进入 `sourceIssues[]` |
| 后续Flag | `quests[].followUpFlags[]` 和 `flags[]` |
| 设计目的 | `quests[].designPurpose` |
| 原案完整度 | `quests[].sourceStatus` |

报酬中能够确定归属的数值进入 `guildGold`、`sharedHeroGold` 和 `items`；原始写法始终保存在 `reward.rawText`。《左半边还是右半边》的“5000G”未说明归属，因此没有擅自拆分。

## 中途事件

| 原案字段 | JSON 路径 |
|---|---|
| 事件ID／所属任务 | `events[].id` / `questId` |
| 触发时机 | `events[].triggerDescription` |
| 玩家看到的内容 | `events[].visibleText` |
| 选项A／B／C | `events[].options[].id` / `label` |
| 选项出现条件 | `events[].options[].visibleCondition` |
| 每项写入Flag／即时变化 | `events[].options[].effects[]` |
| 即时资源变化 | `events[].immediateEffects[]`；原案“无”保存为空数组 |
| 角色反应 | `events[].characterReactions` |
| 影响结果 | `events[].outcomeImpact` |
| 测试观察点 | `events[].testObservation` |

《血液盛宴》的“分头调查”示例已结构化。《无声的摇篮曲》《牧羊人的遗产》的完整事件已结构化。《你掉的是这个左半边还是右半边》只有一句事件概述，原文完整保存在 `sourceIssues[source_left_event_missing].sourceText`，没有生成虚假选项。

## 结果

| 原案字段 | JSON 路径 |
|---|---|
| 结果ID／任务ID | `outcomes[].id` / `questId` |
| 优先级 | `outcomes[].priority` |
| 触发条件 | `outcomes[].condition`；原文同时保存在 `rawCondition` |
| 结果等级 | `outcomes[].grade` |
| 玩家报告 | `outcomes[].report` |
| 因果说明 | `outcomes[].causalExplanation` |
| 公会变化 | `outcomes[].guildChanges`，可执行部分进入 `effects[]` |
| 英雄变化 | `outcomes[].heroChanges`，可执行部分进入 `effects[]` |
| 关系变化 | `outcomes[].relationshipChanges`，可执行部分进入 `effects[]` |
| 写入Flag | `outcomes[].writtenFlags[]` 和 `effects[]` |
| 解锁内容 | `outcomes[].unlockedContent[]` 和 `effects[]` |
| 后续事件 | `outcomes[].followUpEvents[]` |
| 测试观察点 | `outcomes[].testObservation` |

结果按优先级从高到低匹配。原案中的“战斗小于阈值”不额外引入 `not` 条件：先由高优先级的 `partyStatAtLeast` 结果接收达标队伍，再由较低优先级、仅检查同一选项的结果接收未达标队伍。

## 未静默处理的缺口

所有无法可靠结构化的内容均进入 `sourceIssues[]`，包括：

- 《血液盛宴》缺少完整结果组；
- 《你掉的是这个左半边还是右半边》缺少结构化事件和结果；
- 露娜、盖尔、泽克、葛林姆、莉亚等非 APRD 人物引用；
- 《血液盛宴》结果中的“未下达控制伤亡命令”缺少对应状态；
- `event_lord_compensation` 只有 ID；
- 《牧羊人的遗产》没有定义“成功说服”的数值门槛。

这些条目可以在工作台“问题”页定位。只有内容缺口或显式未解析引用不会被伪装为正常完整数据。
