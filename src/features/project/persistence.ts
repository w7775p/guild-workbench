import { openDB } from "idb";
import type { GuildProject } from "../../domain/project";

const DATABASE_NAME = "guild-workbench";
const STORE_NAME = "drafts";
const DRAFT_KEY = "current-project";

async function database() {
  return openDB(DATABASE_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    }
  });
}

export async function saveDraft(project: GuildProject) {
  const db = await database();
  await db.put(STORE_NAME, project, DRAFT_KEY);
}

export async function loadDraft(): Promise<GuildProject | undefined> {
  const db = await database();
  return db.get(STORE_NAME, DRAFT_KEY);
}

export async function clearDraft() {
  const db = await database();
  await db.delete(STORE_NAME, DRAFT_KEY);
}
