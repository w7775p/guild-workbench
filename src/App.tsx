import { HeroEditor } from "./features/heroes/HeroEditor";
import { HeroList } from "./features/heroes/HeroList";
import { HeroReferences } from "./features/heroes/HeroReferences";
import { PreviewSetup } from "./features/preview/PreviewSetup";
import { ProjectStoreProvider, useProjectStore } from "./features/project/projectStore";
import { QuestEditor } from "./features/quests/QuestEditor";
import { QuestList } from "./features/quests/QuestList";
import { IssuePanel } from "./features/validation/IssuePanel";
import { AppLayout } from "./layout/AppLayout";
import "./styles.css";

function WorkspaceView() {
  const { activeView } = useProjectStore();
  if (activeView === "heroes") {
    return (
      <div className="three-column-view">
        <HeroList />
        <HeroEditor />
        <HeroReferences />
      </div>
    );
  }
  if (activeView === "quests") {
    return (
      <div className="two-column-view">
        <QuestList />
        <QuestEditor />
      </div>
    );
  }
  if (activeView === "preview") return <PreviewSetup />;
  return <IssuePanel />;
}

export default function App() {
  return (
    <ProjectStoreProvider>
      <AppLayout>
        <WorkspaceView />
      </AppLayout>
    </ProjectStoreProvider>
  );
}
