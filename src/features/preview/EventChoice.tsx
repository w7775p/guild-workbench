import { evaluateCondition } from "../../domain/condition";
import type {
  GuildProject,
  QuestEvent
} from "../../domain/project";
import { createPreviewContext } from "./evaluateOutcome";

interface EventChoiceProps {
  project: GuildProject;
  event: QuestEvent;
  partyHeroIds: string[];
  selectedOption?: string;
  onSelect: (optionId: string) => void;
}

export function EventChoice({
  project,
  event,
  partyHeroIds,
  selectedOption,
  onSelect
}: EventChoiceProps) {
  const context = createPreviewContext(project, partyHeroIds, {});
  const options = event.options.filter(
    (option) =>
      !option.visibleCondition ||
      evaluateCondition(option.visibleCondition, context).passed
  );

  return (
    <section className="preview-card">
      <span className="eyebrow">中途事件</span>
      <h2>{event.id}</h2>
      <p className="preview-copy">{event.visibleText}</p>
      <div className="choice-list">
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            className={`choice-card${
              selectedOption === option.id ? " choice-card--selected" : ""
            }`}
            onClick={() => onSelect(option.id)}
          >
            <span>{option.label}</span>
            <small>{option.id}</small>
          </button>
        ))}
      </div>
      {options.length !== event.options.length ? (
        <p className="preview-note">
          {event.options.length - options.length} 个选项因队伍条件未满足而隐藏。
        </p>
      ) : null}
    </section>
  );
}
