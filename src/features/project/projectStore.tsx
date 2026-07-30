import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import seed from "../../data/guild-seed.v0.1.json";
import {
  cloneProject,
  type GuildProject,
  type Hero,
  type Quest,
  type QuestEvent,
  type Outcome
} from "../../domain/project";
import {
  clearDraft,
  loadDraft,
  saveDraft
} from "./persistence";
import { importProjectText } from "./importProject";
import { downloadProject } from "./exportProject";

export type ViewKey = "heroes" | "quests" | "preview" | "issues";

interface Notice {
  kind: "success" | "error" | "info";
  message: string;
}

interface ProjectStoreValue {
  project: GuildProject;
  activeView: ViewKey;
  selectedHeroId: string;
  selectedQuestId: string;
  selectedEventId?: string;
  selectedOutcomeId?: string;
  startupState: "checking" | "choose" | "ready";
  notice?: Notice;
  setActiveView: (view: ViewKey) => void;
  selectHero: (heroId: string) => void;
  selectQuest: (questId: string) => void;
  selectEvent: (eventId?: string) => void;
  selectOutcome: (outcomeId?: string) => void;
  updateHero: (hero: Hero) => void;
  updateQuest: (quest: Quest) => void;
  updateEvent: (event: QuestEvent) => void;
  updateOutcome: (outcome: Outcome) => void;
  addEvent: (questId: string) => void;
  addOutcome: (questId: string) => void;
  deleteEvent: (eventId: string) => { ok: boolean; message: string };
  deleteOutcome: (outcomeId: string) => { ok: boolean; message: string };
  createEmptyProject: () => Promise<void>;
  loadSeed: () => Promise<void>;
  restoreDraft: () => Promise<void>;
  importFile: (file: File) => Promise<void>;
  exportCurrent: () => void;
  navigateTo: (
    entityType: "project" | "hero" | "quest" | "event" | "outcome",
    entityId?: string,
    field?: string
  ) => void;
  dismissNotice: () => void;
}

const initialProject = seed as GuildProject;
const ProjectStoreContext = createContext<ProjectStoreValue | null>(null);

function uniqueId(prefix: string, used: Set<string>) {
  let index = 1;
  let id = `${prefix}_${index}`;
  while (used.has(id)) {
    index += 1;
    id = `${prefix}_${index}`;
  }
  return id;
}

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<GuildProject>(() =>
    cloneProject(initialProject)
  );
  const [activeView, setActiveView] = useState<ViewKey>("heroes");
  const [selectedHeroId, setSelectedHeroId] = useState("hero_a");
  const [selectedQuestId, setSelectedQuestId] = useState(
    "quest_silent_lullaby"
  );
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>();
  const [startupState, setStartupState] = useState<
    "checking" | "choose" | "ready"
  >("checking");
  const [notice, setNotice] = useState<Notice>();
  const canPersist = useRef(false);

  useEffect(() => {
    void loadDraft().then((draft) => {
      if (draft) {
        setStartupState("choose");
      } else {
        canPersist.current = true;
        setStartupState("ready");
      }
    });
  }, []);

  useEffect(() => {
    if (!canPersist.current || startupState !== "ready") return;
    const handle = window.setTimeout(() => {
      void saveDraft(project);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [project, startupState]);

  const replaceProject = useCallback((next: GuildProject) => {
    setProject(cloneProject(next));
    setSelectedHeroId(next.heroes[0]?.id ?? "");
    setSelectedQuestId(next.quests[0]?.id ?? "");
    setSelectedEventId(undefined);
    setSelectedOutcomeId(undefined);
  }, []);

  const loadSeed = useCallback(async () => {
    await clearDraft();
    replaceProject(initialProject);
    canPersist.current = true;
    setStartupState("ready");
    setNotice({ kind: "info", message: "已载入内置原案。" });
  }, [replaceProject]);

  const createEmptyProject = useCallback(async () => {
    await clearDraft();
    const empty: GuildProject = {
      schemaVersion: "0.1",
      projectId: "untitled_guild_project",
      title: "未命名公会项目",
      heroes: [],
      quests: [],
      events: [],
      outcomes: [],
      flags: [],
      sourceIssues: []
    };
    replaceProject(empty);
    canPersist.current = true;
    setStartupState("ready");
    setNotice({ kind: "info", message: "已新建空项目。" });
  }, [replaceProject]);

  const restoreDraft = useCallback(async () => {
    const draft = await loadDraft();
    if (draft) replaceProject(draft);
    canPersist.current = true;
    setStartupState("ready");
    setNotice({ kind: "success", message: "已恢复上次草稿。" });
  }, [replaceProject]);

  const importFile = useCallback(
    async (file: File) => {
      const result = importProjectText(await file.text());
      if (!result.ok || !result.project) {
        setNotice({ kind: "error", message: result.message });
        return;
      }
      replaceProject(result.project);
      setNotice({ kind: "success", message: result.message });
    },
    [replaceProject]
  );

  const exportCurrent = useCallback(() => {
    const result = downloadProject(project);
    setNotice({
      kind: result.ok ? "success" : "error",
      message: result.message
    });
    if (!result.ok) setActiveView("issues");
  }, [project]);

  const updateHero = useCallback((hero: Hero) => {
    setProject((current) => ({
      ...current,
      heroes: current.heroes.map((item) => (item.id === hero.id ? hero : item))
    }));
  }, []);

  const updateQuest = useCallback((quest: Quest) => {
    setProject((current) => ({
      ...current,
      quests: current.quests.map((item) =>
        item.id === quest.id ? quest : item
      )
    }));
  }, []);

  const updateEvent = useCallback((event: QuestEvent) => {
    setProject((current) => ({
      ...current,
      events: current.events.map((item) =>
        item.id === event.id ? event : item
      )
    }));
  }, []);

  const updateOutcome = useCallback((outcome: Outcome) => {
    setProject((current) => ({
      ...current,
      outcomes: current.outcomes.map((item) =>
        item.id === outcome.id ? outcome : item
      )
    }));
  }, []);

  const addEvent = useCallback((questId: string) => {
    setProject((current) => {
      const id = uniqueId(
        `event_${questId.replace(/^quest_/, "")}`,
        new Set(current.events.map((event) => event.id))
      );
      const event: QuestEvent = {
        id,
        questId,
        triggerDescription: "",
        visibleText: "",
        options: [],
        immediateEffects: [],
        characterReactions: "",
        outcomeImpact: "",
        testObservation: ""
      };
      return {
        ...current,
        events: [...current.events, event],
        quests: current.quests.map((quest) =>
          quest.id === questId
            ? { ...quest, eventIds: [...quest.eventIds, id] }
            : quest
        )
      };
    });
  }, []);

  const addOutcome = useCallback((questId: string) => {
    setProject((current) => {
      const id = uniqueId(
        `outcome_${questId.replace(/^quest_/, "")}`,
        new Set(current.outcomes.map((outcome) => outcome.id))
      );
      const outcome: Outcome = {
        id,
        questId,
        priority: 10,
        condition: { type: "all", conditions: [] },
        rawCondition: "",
        grade: "",
        report: "",
        causalExplanation: "",
        guildChanges: "",
        heroChanges: "",
        relationshipChanges: "",
        writtenFlags: [],
        unlockedContent: [],
        followUpEvents: [],
        effects: [],
        testObservation: ""
      };
      return {
        ...current,
        outcomes: [...current.outcomes, outcome],
        quests: current.quests.map((quest) =>
          quest.id === questId
            ? { ...quest, outcomeIds: [...quest.outcomeIds, id] }
            : quest
        )
      };
    });
  }, []);

  const deleteEvent = useCallback(
    (eventId: string) => {
      const event = project.events.find((item) => item.id === eventId);
      if (!event) return { ok: false, message: "事件不存在。" };
      const outcomeRefs = project.outcomes.filter((outcome) =>
        JSON.stringify(outcome.condition).includes(eventId)
      );
      if (outcomeRefs.length > 0) {
        return {
          ok: false,
          message: `事件仍被结果 ${outcomeRefs
            .map((item) => item.id)
            .join("、")} 引用，不能删除。`
        };
      }
      setProject((current) => ({
        ...current,
        events: current.events.filter((item) => item.id !== eventId),
        quests: current.quests.map((quest) => ({
          ...quest,
          eventIds: quest.eventIds.filter((id) => id !== eventId)
        }))
      }));
      setSelectedEventId(undefined);
      return { ok: true, message: "事件已删除。" };
    },
    [project.events, project.outcomes]
  );

  const deleteOutcome = useCallback(
    (outcomeId: string) => {
      if (!project.outcomes.some((item) => item.id === outcomeId)) {
        return { ok: false, message: "结果不存在。" };
      }
      setProject((current) => ({
        ...current,
        outcomes: current.outcomes.filter((item) => item.id !== outcomeId),
        quests: current.quests.map((quest) => ({
          ...quest,
          outcomeIds: quest.outcomeIds.filter((id) => id !== outcomeId)
        }))
      }));
      setSelectedOutcomeId(undefined);
      return { ok: true, message: "结果已删除。" };
    },
    [project.outcomes]
  );

  const navigateTo = useCallback(
    (
      entityType: "project" | "hero" | "quest" | "event" | "outcome",
      entityId?: string,
      field?: string
    ) => {
      if (entityType === "hero" && entityId) {
        setSelectedHeroId(entityId);
        setActiveView("heroes");
      } else if (entityType === "quest" && entityId) {
        setSelectedQuestId(entityId);
        setActiveView("quests");
      } else if (entityType === "event" && entityId) {
        const event = project.events.find((item) => item.id === entityId);
        if (event) setSelectedQuestId(event.questId);
        setSelectedEventId(entityId);
        setActiveView("quests");
      } else if (entityType === "outcome" && entityId) {
        const outcome = project.outcomes.find((item) => item.id === entityId);
        if (outcome) setSelectedQuestId(outcome.questId);
        setSelectedOutcomeId(entityId);
        setActiveView("quests");
      }
      window.setTimeout(() => {
        const target = field
          ? document.querySelector<HTMLElement>(`[data-field="${field}"]`)
          : undefined;
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        target?.focus();
      }, 80);
    },
    [project.events, project.outcomes]
  );

  const selectHero = useCallback((heroId: string) => {
    setSelectedHeroId(heroId);
    setActiveView("heroes");
  }, []);
  const selectQuest = useCallback((questId: string) => {
    setSelectedQuestId(questId);
    setSelectedEventId(undefined);
    setSelectedOutcomeId(undefined);
    setActiveView("quests");
  }, []);

  const value = useMemo<ProjectStoreValue>(
    () => ({
      project,
      activeView,
      selectedHeroId,
      selectedQuestId,
      selectedEventId,
      selectedOutcomeId,
      startupState,
      notice,
      setActiveView,
      selectHero,
      selectQuest,
      selectEvent: setSelectedEventId,
      selectOutcome: setSelectedOutcomeId,
      updateHero,
      updateQuest,
      updateEvent,
      updateOutcome,
      addEvent,
      addOutcome,
      deleteEvent,
      deleteOutcome,
      createEmptyProject,
      loadSeed,
      restoreDraft,
      importFile,
      exportCurrent,
      navigateTo,
      dismissNotice: () => setNotice(undefined)
    }),
    [
      project,
      activeView,
      selectedHeroId,
      selectedQuestId,
      selectedEventId,
      selectedOutcomeId,
      startupState,
      notice,
      selectHero,
      selectQuest,
      updateHero,
      updateQuest,
      updateEvent,
      updateOutcome,
      addEvent,
      addOutcome,
      deleteEvent,
      deleteOutcome,
      createEmptyProject,
      loadSeed,
      restoreDraft,
      importFile,
      exportCurrent,
      navigateTo
    ]
  );

  return (
    <ProjectStoreContext.Provider value={value}>
      {children}
    </ProjectStoreContext.Provider>
  );
}

export function useProjectStore() {
  const value = useContext(ProjectStoreContext);
  if (!value) {
    throw new Error("useProjectStore must be used inside ProjectStoreProvider");
  }
  return value;
}
