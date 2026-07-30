export type Effect =
  | {
      type: "setFlag";
      flagId: string;
      value: boolean | number | string;
    }
  | { type: "addGuildGold"; amount: number }
  | { type: "addReputation"; amount: number }
  | { type: "setHeroStatus"; heroId: string; status: string }
  | {
      type: "changeRelationship";
      fromHeroId: string;
      toHeroId: string;
      amount: number;
      note?: string;
    }
  | { type: "unlockContent"; contentId: string }
  | { type: "note"; text: string };
