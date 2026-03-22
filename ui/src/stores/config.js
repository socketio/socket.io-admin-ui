import { defineStore } from "pinia";
import { isLocalStorageAvailable } from "../util";

export const useConfigStore = defineStore("config", {
  state: () => ({
    darkTheme: false,
    readonly: false,
    lang: "en",
    supportedFeatures: [],
    showNavigationDrawer: false,
  }),
  getters: {
    developmentMode(state) {
      return (
        state.supportedFeatures.includes("ALL_EVENTS") ||
        !state.supportedFeatures.includes("AGGREGATED_EVENTS")
      );
    },
    hasAggregatedValues: (state) => {
      return state.supportedFeatures.includes("AGGREGATED_EVENTS");
    },
  },
  actions: {
    init() {
      if (!isLocalStorageAvailable) {
        return;
      }
      this.darkTheme = localStorage.getItem("dark_theme") === "true";
      this.readonly = localStorage.getItem("readonly") === "true";
      this.lang = localStorage.getItem("lang") || "en";
    },
    selectTheme(darkTheme) {
      this.darkTheme = darkTheme;
      if (isLocalStorageAvailable) {
        localStorage.setItem("dark_theme", String(darkTheme));
      }
    },
    selectLang(lang) {
      this.lang = lang;
      if (isLocalStorageAvailable) {
        localStorage.setItem("lang", lang);
      }
    },
    toggleReadonly() {
      this.readonly = !this.readonly;
      if (isLocalStorageAvailable) {
        localStorage.setItem("readonly", String(this.readonly));
      }
    },
    updateConfig(config) {
      this.supportedFeatures = config.supportedFeatures || [];
    },
    toggleNavigationDrawer() {
      this.showNavigationDrawer = !this.showNavigationDrawer;
    },
  },
});
