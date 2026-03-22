import { defineStore } from "pinia";
import { isLocalStorageAvailable } from "../util";

export const useConnectionStore = defineStore("connection", {
  state: () => ({
    serverUrl: "",
    wsOnly: false,
    path: "/socket.io",
    namespace: "/admin",
    parser: "default",
    sessionId: "",
    connected: false,
  }),
  actions: {
    init() {
      if (!isLocalStorageAvailable) {
        return;
      }
      this.serverUrl = localStorage.getItem("server_url") || "";
      if (this.serverUrl.endsWith("/admin")) {
        this.serverUrl = this.serverUrl.slice(0, -6);
      } else {
        this.namespace = localStorage.getItem("namespace") || "/admin";
      }
      this.wsOnly = localStorage.getItem("ws_only") === "true";
      this.sessionId = localStorage.getItem("session_id") || "";
      this.path = localStorage.getItem("path") || "/socket.io";
      this.parser = localStorage.getItem("parser") || "default";
    },
    saveConfig({ serverUrl, wsOnly, path, namespace, parser }) {
      this.serverUrl = serverUrl;
      this.wsOnly = wsOnly;
      this.path = path;
      this.namespace = namespace;
      this.parser = parser;
      if (isLocalStorageAvailable) {
        localStorage.setItem("server_url", serverUrl);
        localStorage.setItem("ws_only", String(wsOnly));
        localStorage.setItem("path", path);
        localStorage.setItem("namespace", namespace);
        localStorage.setItem("parser", parser);
      }
    },
    saveSessionId(sessionId) {
      this.sessionId = sessionId;
      if (isLocalStorageAvailable) {
        localStorage.setItem("session_id", sessionId);
      }
    },
    connect() {
      this.connected = true;
    },
    disconnect() {
      this.connected = false;
    },
  },
});
