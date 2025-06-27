import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Alias {
  name: string;
  value: string;
}

export interface IntegrationAliases {
  [integrationName: string]: Alias[];
}

interface AliasState {
  aliases: IntegrationAliases;
  addAlias: (integration: string, alias: Alias) => void;
  removeAlias: (integration: string, aliasName: string) => void;
  editAlias: (
    integration: string,
    oldAliasName: string,
    newAlias: Alias,
  ) => void;
}

export const useAliasStore = create<AliasState>()(
  persist(
    (set) => ({
      aliases: {},
      addAlias: (integration, alias) =>
        set((state) => ({
          aliases: {
            ...state.aliases,
            [integration]: [...(state.aliases[integration] || []), alias],
          },
        })),
      removeAlias: (integration, aliasName) =>
        set((state) => ({
          aliases: {
            ...state.aliases,
            [integration]: state.aliases[integration].filter(
              (a) => a.name !== aliasName,
            ),
          },
        })),
      editAlias: (integration, oldAliasName, newAlias) =>
        set((state) => ({
          aliases: {
            ...state.aliases,
            [integration]: state.aliases[integration].map((a) =>
              a.name === oldAliasName ? newAlias : a,
            ),
          },
        })),
    }),
    {
      name: "voice-agent-aliases-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
