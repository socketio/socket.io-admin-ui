import { isLocalStorageAvailable } from "../../util";

export default {
  namespaced: true,
  state: {
    darkTheme: false,
    readonly: false,
    lang: "en",
    supportedFeatures: [],
  },
  mutations: {
    init(state) {
      if (isLocalStorageAvailable) {
        state.darkTheme = localStorage.getItem("dark_theme") === "true";
        state.readonly = localStorage.getItem("readonly") === "true";
        state.lang = localStorage.getItem("lang") || "en";
      }
    },
    selectTheme(state, darkTheme) {
      state.darkTheme = darkTheme;
      if (isLocalStorageAvailable) {
        localStorage.setItem("dark_theme", darkTheme);
      }
    },
    selectLang(state, lang) {
      state.lang = lang;
      if (isLocalStorageAvailable) {
        localStorage.setItem("lang", lang);
      }
    },
    toggleReadonly(state) {
      state.readonly = !state.readonly;
      if (isLocalStorageAvailable) {
        localStorage.setItem("readonly", state.readonly);
      }
    },
    updateConfig(state, config) {
      state.supportedFeatures = config.supportedFeatures;
    },
  },
};
