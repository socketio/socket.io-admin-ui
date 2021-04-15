import { isLocalStorageAvailable } from "../../util";

export default {
  namespaced: true,
  state: {
    serverUrl: "",
    sessionId: "",
    connected: false,
  },
  mutations: {
    init(state) {
      if (isLocalStorageAvailable) {
        state.serverUrl = localStorage.getItem("server_url");
        state.sessionId = localStorage.getItem("session_id");
      }
    },
    saveServerUrl(state, serverUrl) {
      state.serverUrl = serverUrl;
      if (isLocalStorageAvailable) {
        localStorage.setItem("server_url", serverUrl);
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
