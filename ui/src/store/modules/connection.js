import { isLocalStorageAvailable } from "../../util";

export default {
  namespaced: true,
  state: {
    serverUrl: "",
    wsOnly: false,
    sessionId: "",
    connected: false,
  },
  mutations: {
    init(state) {
      if (isLocalStorageAvailable) {
        state.serverUrl = localStorage.getItem("server_url");
        state.wsOnly = localStorage.getItem("ws_only") === "true";
        state.sessionId = localStorage.getItem("session_id");
      }
    },
    saveConfig(state, { serverUrl, wsOnly }) {
      state.serverUrl = serverUrl;
      state.wsOnly = wsOnly;
      if (isLocalStorageAvailable) {
        localStorage.setItem("server_url", serverUrl);
        localStorage.setItem("ws_only", wsOnly);
      }
    },
    saveSessionId(state, sessionId) {
      state.sessionId = sessionId;
      if (isLocalStorageAvailable) {
        localStorage.setItem("session_id", sessionId);
      }
    },
    connect(state) {
      state.connected = true;
    },
    disconnect(state) {
      state.connected = false;
    },
  },
};
